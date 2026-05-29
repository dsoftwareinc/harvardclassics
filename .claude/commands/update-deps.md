Update all npm dependencies to their latest versions, install them, verify the app runs and builds, commit, push, and deploy to Firebase.

## Steps

1. Run `ncu` to show what is outdated (informational only).
2. Run `ncu -u` to rewrite `package.json` with the latest versions.
3. Run `CI=true pnpm install --no-frozen-lockfile` to install the updated packages.
   - If install fails with a build-scripts error, add the offending packages to the `onlyBuiltDependencies` array inside the `"pnpm"` section of `package.json`, then re-run install.
4. Start the dev server in the background with `ionic serve --no-open` and wait for it to report "Local: http://localhost:8100". Then use WebFetch to load `http://localhost:8100` and confirm the page returns a non-error HTML response. Kill the dev server process before continuing.
   - If the page fails to load or returns an error, investigate and fix before continuing.
5. Run `ionic build --prod` to verify the production build compiles without errors.
   - If the build fails, investigate and fix the TypeScript/Angular errors before continuing.
6. Stage `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` (if changed), then commit with message `chore:update deps` and push.
7. Run `firebase deploy` to deploy the updated build to Firebase Hosting.
   - If deploy fails due to an auth error, ask the user to run `! firebase login` and retry.

## Notes

- Always use `CI=true` with pnpm to avoid interactive prompts in non-TTY environments.
- The `--no-frozen-lockfile` flag is required because `ncu -u` changes `package.json`, making the existing lockfile stale.
- Do not commit build output (`www/`).
- `firebase deploy` uses the build output already in `www/` from step 5 — no need to rebuild.
