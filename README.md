# THE LAST TRAIN

A psychological horror game that runs entirely in the browser. No backend, no accounts, no API keys: everything is client-side, and progress autosaves to `localStorage`.

> 2:17 AM. A train arrives that isn't on any schedule. You get on.

You wait on an empty platform, board the train, and ride it through seven stations, talking to passengers and collecting clues. Every run is seeded, so which passenger vanishes and which clues matter change between playthroughs. At the last stop there are three ways out, and one of them only opens if you noticed enough.

## How to play

| Action | Controls |
| --- | --- |
| Walk (platform) | **A / D** or **Left / Right arrow** |
| Interact / talk | **E** near (platform) or hovering (carriage) an object, or **click** it |
| Inspect at a station | **Click**, or focus it and press **Enter / Space** |
| Advance dialogue | **Space / Enter** or **click** |
| Pause / settings | **Esc** |

The pause menu has master, music and SFX volume, **Reduce Flashing** and **Screen Shake** toggles. Headphones recommended: all sound is synthesized live with the Web Audio API.

## Local development

Requires Node 22+.

```sh
npm install
npm run dev         # Vite dev server (port 5173, or $PORT)
npm run typecheck   # the real typecheck: tsc --noEmit -p tsconfig.app.json
npm test            # Vitest (logic, data and invariant tests in tests/)
npm run build       # tsc -b && vite build -> dist/
npm run preview     # serve dist/ locally
```

`tsc -p .` checks nothing, because the root `tsconfig.json` only holds project references. Use `npm run typecheck`.

## Deploying

`npm run build` produces a fully static site in `dist/`. Any static host works, and no SPA rewrite is needed (the game has no client-side routes).

- **GitHub Pages:** `.github/workflows/deploy-pages.yml` builds and deploys on every push to `main` (or run it manually). Pages serves project sites from `/<repo>/`, so it builds with `VITE_BASE=/the-last-train/`. One-time setup: *Settings -> Pages -> Source: GitHub Actions*. Pages on a private repo requires a paid GitHub plan.
- **Vercel:** import the repo. `vercel.json` sets the build command, `dist` output and long-lived cache headers for hashed assets.
- **Netlify:** import the repo. `netlify.toml` does the same.

`VITE_BASE` (default `/`) sets Vite's `base`. Set it only when the site is served from a sub-path, for example `VITE_BASE=/my-path/ npm run build`.

The game is an installable PWA (`public/manifest.webmanifest`). In production it registers a small offline cache, `public/sw.js`: hashed assets are cache-first, HTML is network-first, and each build purges older caches. It is never registered on `localhost`.

## Project structure

```
index.html            game entry (meta tags, manifest, service-worker registration)
prototype.html        Three.js 2.5D prototype entry (built only when present)
public/               static files: icons, manifest, service worker
src/
  main.tsx, App.tsx   bootstrap and the scene switch
  engine/             zustand store (persisted save), types, seeded RNG, run setup
  data/               stations, passengers, clues, endings (story content)
  scenes/             Title, Platform, TrainArrival, TrainInterior, Station, Endings
  components/         dialogue box, pause/settings menu, prompts, scene transitions
  effects/            fog, grain, rain, dust, flicker, lightning, emergency overlays
  audio/              procedural Web Audio engine
  render3d/           Three.js renderer (in progress, wave C)
tests/                Vitest suites (vitest.config.ts)
docs/                 roadmap, story and art guides
.github/workflows/    CI (typecheck, test, build) and the Pages deploy
```

## Contributing / agent workflow

This repo is built in waves by many parallel agents. **Read [`docs/ROADMAP.md`](docs/ROADMAP.md) first.** It holds the current wave, the rules every contributor follows and the file-ownership table. In short: stay inside the files you own, don't add dependencies, and verify with `npm run typecheck`, `npm test` and `npm run build`. Story changes must respect the invariants in [`docs/STORY_REFINEMENT_GUIDE.md`](docs/STORY_REFINEMENT_GUIDE.md) §5.

CI (`.github/workflows/ci.yml`) runs typecheck, tests and a production build on every push and pull request to `main`.

All art and audio are procedural or self-authored. No external copyrighted assets.
