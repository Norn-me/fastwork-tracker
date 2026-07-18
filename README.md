# Fastwork Launch Tracker

Offline-first PWA for tracking every step of the Fastwork launch plan — from Phase 0 portfolio pieces to the growth path. Works on PC and mobile, installable from the browser, and syncs progress across devices through a private GitHub Gist.

Architecture follows the Rapid Notes pattern: a single `index.html` (no build step, no framework), `manifest.json`, a cache-first `sw.js` service worker, and localStorage for state.

## Deploy (GitHub Pages)

1. Create a new GitHub repository (e.g. `fastwork-tracker`).
2. Push this folder:
   ```
   git remote add origin https://github.com/<you>/fastwork-tracker.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / root → Save.**
4. Your app is live at `https://<you>.github.io/fastwork-tracker/` after a minute or two.

## Install on your devices

- **Android / Chrome**: open the URL → browser menu → **Add to Home screen / Install app**
- **iOS / Safari**: Share → **Add to Home Screen**
- **Windows / Chrome or Edge**: install icon in the address bar

## Cross-device sync

Progress syncs through a **private Gist** on your GitHub account:

1. Create a token at [github.com/settings/tokens](https://github.com/settings/tokens/new?scopes=gist&description=Fastwork%20Tracker) — classic token, tick **only the `gist` scope**.
2. In the app: **Settings → paste the token → Save token** — on each device.
3. That's it. The app pulls on open, pushes a few seconds after every change, and re-syncs when you come back online. Conflicts resolve per-step to the most recent change.

The token is stored only in each device's localStorage and is sent only to `api.github.com`.

## Development notes

- All app code lives in `index.html`. **Whenever it (or any shell asset) changes, bump `CACHE` in `sw.js`** — that's what triggers installed clients to pick up the new version.
- Local dev server: `python -m http.server 8123` in this folder.
- State shape is versioned (`fw_state_v1`, `{v:1, tasks:{...}}`) so an order/review log can be added later without breaking sync.
