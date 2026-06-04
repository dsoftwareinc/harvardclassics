# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm start          # Dev server (ng serve)
pnpm build          # Production build → www/
pnpm run build:prod # Ionic prod build with service worker (outputs to www/browser)
pnpm test           # Karma unit tests
pnpm lint           # ESLint
```

Run a single test file by passing `--include` to karma or by modifying the test entry temporarily. There is no shorthand script for this.

Deploy: `firebase deploy` (targets `www/browser/`)

## Architecture

**Stack**: Angular 21 + Ionic 8 + Firebase (PWA)

### Routing & Modules
All feature pages are lazy-loaded modules. Routes in `app-routing.module.ts`:
- `''` → redirects to `today`
- `today` / `day/:day` → `TodayPageModule` (main reading view)
- `month/:month` → `MonthPageModule` (calendar view)
- `notes` → `NotesPageModule`
- `login` / `signup` → auth modules

### Data Flow
- **Reading content** (the actual Harvard Classics text) is static JSON loaded from `assets/index.json` via `MaterialService`. It is **not** in Firestore.
- **User data** (completed days, favorites, notes) lives in Firestore at `/users/{userEmail}` and is subscribed to via `ReadingDbService` using RxJS `valueChanges()`.
- **Auth state** is persisted in `localStorage` by `AuthService` (Firebase email/password + Google OAuth).

### Inter-Component Communication
A custom event bus (`Events` service, `services/events.service.ts`) uses a `Map`-based pub/sub pattern (a hand-rolled copy of Ionic's deprecated `Events`). Constants for event names are in `constants.ts`:
- `EVENT_FINISHED_READING` — fired when scroll reaches 100% in TodayPage; consumed by `ReadingDbService` to mark the day read
- `EVENT_USER_LOGIN` — published by `AuthService` on `onAuthStateChanged`; consumed by `ReadingDbService` to (re)point `userDoc` at the logged-in user

Note: only those **two** constants currently exist. There is no `EVENT_USER_LOGOUT` (and no logout handler in `ReadingDbService` — see Known Issues).

### Key Services
| Service | Responsibility |
|---|---|
| `ReadingDbService` | All Firestore reads/writes (days read, notes, favorites) |
| `AuthService` | Firebase auth, localStorage session |
| `MaterialService` | Loads/caches `assets/index.json` reading content |
| `Events` | Pub/sub event bus between components |

### TodayPage
The main reading component. It:
1. Loads content via `MaterialService`
2. Tracks scroll progress — publishes `EVENT_FINISHED_READING` at 100%
3. Uses `TextSelectEventDirective` to capture highlighted text for note creation
4. Reads/writes notes and favorites to Firestore via `ReadingDbService`

### Environments & Firebase
Firebase config is in `src/environments/environment.ts` (dev) and `environment.prod.ts` (prod). Angular replaces the file at build time. The Firebase project is `harvardclassics365`.

### PWA / Service Worker
Service worker is only enabled in production builds (`build:prod`). Config is in `ngsw-config.json`. Versioned assets are cached long-term; `ngsw.json` itself is never cached (per `firebase.json` headers).

### Firestore security
Rules live in `firestore.rules`: a user may read/write `/users/{userId}` only when `request.auth.token.email == userId`. The document ID is the user's **email**, so all `ReadingDbService` paths are `/users/{userEmail}`.

## Conventions & Gotchas

- **Calendar date base year.** Reading days are stored as `MM-dd` strings (no year). To do date math/formatting, the code prefixes a fixed year: `TodayPage` and `NotesPage` use `"2015-"`, while `MonthPage` uses the **current** year for the calendar's read-marks. Keep stored keys and calendar keys aligned. ⚠️ 2015 is not a leap year, so any `DateTime.fromFormat("2015-02-29", …)` is invalid — use a leap year base (e.g. 2016) if touching this.
- **`html` vs raw content in TodayPage.** `this.html` holds the rendered content and is also where highlight `<span>`s get injected. Do not re-run `highlightedHtml` against an already-highlighted string — keep the raw content separate from the highlighted output (see Known Issues #2).
- **Firebase SDK is mixed.** Auth uses the modern modular API (`provideAuth`/`getAuth`, `@angular/fire/auth`); Firestore and Analytics use the **deprecated** `@angular/fire/compat` API (`AngularFirestore`, `AngularFireAnalytics`). New code should prefer the modular API.
- **`userDocValue()` re-emits.** It returns Firestore `valueChanges()`, which fires on every document change. Subscribers in `TodayPage`/`MonthPage`/`NotesPage` re-run their full callback each emission — make those callbacks idempotent.
- **No unit tests.** There are currently zero `*.spec.ts` files despite `pnpm test` (Karma) being wired up.
- **The Firebase web config in `environment*.ts` is public** by design (web API keys are not secrets); access is gated by Firestore rules, not the key.

## Known Issues (candidates for improvement)

1. **Read-modify-write races in `ReadingDbService`.** Every mutation does `.get()` → mutate whole `Item` → `.update(data)`, so concurrent writes (multiple tabs/devices) clobber each other and the whole doc is rewritten each time. Prefer atomic `arrayUnion`/`arrayRemove` for `days`/`favorites`, and a transaction for `notes`.
2. **Highlight double-wrapping.** `TodayPage.refreshView` reassigns `this.html = highlightedHtml(this.html, notes)` inside the `valueChanges` subscription, so repeated emissions re-highlight already-highlighted HTML and nest spans. Derive `html` from an untouched raw string instead.
3. **No logout cleanup.** `ReadingDbService` listens for `EVENT_USER_LOGIN` but nothing resets `userDoc` on sign-out, leaving it pointed at the previous user. Add an explicit logout event/handler.
4. **Pervasive `any`.** `MaterialService.data`, `AuthService.user`, and the `content` ViewChilds are untyped. Typing `index.json` (a `ReadingDay`/month map) and storing only the email (not the whole Firebase user object) in `localStorage` would harden things.
