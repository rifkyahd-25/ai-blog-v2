# Cleanup notes

- Removed `new.json` — an unrelated Sri Lanka university admissions dataset,
  nothing to do with this project.
- Removed ~50 lines of commented-out dead code (an old duplicate version of
  `api/index.js` kept as a leading comment block).
- Removed `client/dist` static-file serving + catch-all route from
  `api/index.js` — that's production-hosting code, and since client/backend
  are two separate local projects here (not a nested monorepo), `client/dist`
  never exists relative to this backend anyway.
- Removed the `build` script from `package.json` — it assumed
  `npm install --prefix client` from *inside* the backend repo, which doesn't
  match your actual two-repo layout and would just fail.
- Removed `flowbite-react` from `dependencies` — that's a frontend UI
  library; it has no business in an Express backend.
- Server now respects `PORT` from `.env` (`process.env.PORT || 3000`) instead
  of ignoring it — previously the port was hardcoded to 3000 while `.env`
  said `PORT=10000` (looked like a leftover Render.com value). `.env` now
  says `PORT=3000` to match local dev.
- Cleaned `.env` down to the three active keys (was full of commented-out
  history and duplicate `MONGO=` lines).
- **Added `.env` to `.gitignore` — it was missing entirely.** If this repo
  was ever pushed to git before now, your MongoDB connection string and JWT
  secret may be sitting in the commit history — worth checking, and rotating
  both if so.

Not changed, but worth knowing:
- There's no `job.model.js` / `job.controller.js` / `job.route.js` here, but
  the client has a full `/job` feature (create/list/update/delete) wired up
  and pointed at `/api/job/...`. It'll 404 locally until those are added —
  `post.model.js` / `post.controller.js` / `post.route.js` are the closest
  template to copy from.

## Push notifications (added)

Every device that's opened the Android app gets a notification the moment a
post is created. New/changed files:

- `api/models/pushToken.model.js` — one doc per device (`token`, `platform`)
- `api/controllers/notification.controller.js` — `registerPushToken` (the
  endpoint) + `sendNewPostPush(post)` (the fan-out helper)
- `api/routes/notification.route.js` — `POST /api/notifications/register`,
  mounted in `api/index.js`
- `api/controllers/post.controller.js`'s `create` now calls
  `sendNewPostPush(savedPost)` right after saving — fire-and-forget, so a
  push failure never affects the post-creation response

Install the one new dependency:

```bash
npm install
```

(`expo-server-sdk` is already added to `package.json`.)

**The one real setup step** (free, one-time, done from the *Expo app* repo,
not this one): Expo's push service delivers to Android through Firebase
Cloud Messaging, so you need a Firebase project (free Spark plan) linked via
`eas credentials`. Nothing here in the backend needs Firebase credentials
directly — Expo handles that server-side on their end once your app's EAS
project is linked. No cost either way.

Testing: your Android build needs to actually reach this backend to
register a token — either run this backend somewhere your phone can hit it,
or use `adb reverse tcp:3000 tcp:3000` (or similar) for a device plugged
into the same machine running `npm run dev`.

