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
A custom event bus (`Events` service, `services/events.service.ts`) uses a `Map`-based pub/sub pattern. Constants for event names are in `constants.ts`:
- `EVENT_FINISHED_READING` — fired when scroll reaches 100% in TodayPage; consumed by `ReadingDbService` to mark the day read
- `EVENT_USER_LOGIN` / `EVENT_USER_LOGOUT` — fired by AuthService

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
