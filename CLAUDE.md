# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm start          # Dev server (ng serve)
pnpm build          # Production build → www/
pnpm run build:prod # Ionic prod build with service worker (outputs to www/browser)
pnpm test           # Karma unit tests
pnpm lint           # ESLint (flat config: eslint.config.mjs)
```

Lint uses ESLint 10 flat config (`eslint.config.mjs`) via the `@angular-eslint/builder:lint` builder. `src/assets/**` (static reading content) is excluded. Project-specific rule choices: `prefer-standalone` and `prefer-inject` are **off** (the app intentionally uses NgModules + constructor DI), and `no-explicit-any` is a **warning** (tracked Known Issue), so `pnpm lint` exits 0 with warnings.

Run a single test file by passing `--include` to karma or by modifying the test entry temporarily. There is no shorthand script for this.

### Deploy

Firebase Hosting serves `www/browser/` (Firebase project `harvardclassics365`). Always build the service-worker bundle first, then deploy:

```bash
pnpm run build:prod                                      # → www/browser/ (incl. ngsw.json)
firebase deploy --only hosting --project harvardclassics365
```

Non-interactive deploys: the deploy box is headless, so `firebase login` won't work. Authenticate with a service-account key instead:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/home/admin/.secrets/harvardclassics-deploy.json
```

(The key — a `Firebase Hosting Admin` service account for `harvardclassics365` — lives outside the repo at `~/.secrets/`, mode 600. Never commit it.)

**Quirk:** the release step often ends with `HTTP Error: 400 … supplied version <hash> is the current active version`. This is **spurious — the release already went live.** Don't blindly retry; verify by curling the site and confirming it serves the new content-hashed `main-*.js` from `www/browser/index.html`.

Because the app is a PWA, returning users are served the cached build until the service worker updates — hard-refresh (or reopen the installed app) to see a deploy immediately. Drop `--only hosting` to also push `firestore.rules`.

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
- **`html` vs raw content in TodayPage.** `this.rawHtml` holds the pristine reading content; `this.html` is the rendered copy with highlight `<span>`s injected. Always derive `html` from `rawHtml` (never re-highlight `html` in place) so spans don't nest on `valueChanges` re-emission.
- **Firestore writes use atomic field ops.** `ReadingDbService` writes with `set({field: arrayUnion/arrayRemove(...)}, {merge: true})` — never a read-then-write of the whole document. This means a user doc may legitimately contain only *some* of `days`/`favorites`/`notes`, so guard array reads with `?? []`. (The compat `set` typings require the full `Item`, hence the `as unknown as Item` casts around `FieldValue`.)
- **Firebase SDK is mixed.** Auth uses the modern modular API (`provideAuth`/`getAuth`, `@angular/fire/auth`); Firestore and Analytics use the **deprecated** `@angular/fire/compat` API (`AngularFirestore`, `AngularFireAnalytics`). New code should prefer the modular API.
- **`userDocValue()` re-emits.** It returns Firestore `valueChanges()`, which fires on every document change. Subscribers in `TodayPage`/`MonthPage`/`NotesPage` re-run their full callback each emission — make those callbacks idempotent.
- **No unit tests.** There are currently zero `*.spec.ts` files despite `pnpm test` (Karma) being wired up.
- **The Firebase web config in `environment*.ts` is public** by design (web API keys are not secrets); access is gated by Firestore rules, not the key.

## Known Issues (candidates for improvement)

Remaining:
1. **Leap-year date base.** TodayPage/NotesPage build dates with a `"2015-"` prefix; 2015 isn't a leap year, so Feb 29 (`02-29`) navigation/formatting is invalid. Switch the base to a leap year (e.g. 2016).
2. **Pervasive `any`.** `MaterialService.data`, `AuthService.user`, and the `content` ViewChilds are untyped. Typing `index.json` (a `ReadingDay`/month map) and storing only the email (not the whole Firebase user object) in `localStorage` would harden things.
3. **Mixed Firebase SDK.** Firestore/Analytics still use the deprecated `@angular/fire/compat` API; migrating to the modular API (as auth already uses) would let the `as unknown as Item` casts in `ReadingDbService` go away.

Fixed (2026-06-04):
- ~~Read-modify-write races in `ReadingDbService`~~ — now uses atomic `arrayUnion`/`arrayRemove` with `set(..., {merge: true})`.
- ~~Highlight double-wrapping in TodayPage~~ — `html` is now always derived from `rawHtml`.
- ~~No logout cleanup~~ — `EVENT_USER_LOGOUT` is now published by `AuthService` and resets `userDoc`.
