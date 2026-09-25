# THE LAST TRAIN — Roadmap & Agent Playbook

Living document. The orchestrator (main session) updates it at the end of every wave. Every agent working on this repo should read it first.

## North star

A shippable, extensible browser horror game that grows toward full 3D, character "skins" that reincarnate across loops, and a much deeper story. Near-term we bridge from the current DOM/CSS/SVG rendering to a **Three.js 2.5D renderer** (real lighting, fog, post-processing), then roll that renderer out scene by scene.

## Rules for every agent

1. **Never run git.** The orchestrator commits and pushes at the end of each wave.
2. **Never run `npm install` / change dependencies.** Already installed: `three`, `@types/three`, `vitest`, `react`, `zustand`. If you need something else, say so in your report instead.
3. **Never start a dev server.** One is already running on port 5183.
4. **The real typecheck is `npm run typecheck`** (`tsc --noEmit -p tsconfig.app.json`). `tsc -p .` checks nothing because the root tsconfig only has project references. Tests: `npm test` (Vitest).
5. **Stay inside your file ownership** (table below). If you need a change in someone else's file, describe it in your report rather than editing it.
6. `docs/STORY_REFINEMENT_GUIDE.md` §5 invariants are binding. In particular, `requiredClueIds` draws only from the station-level clue pool, and no clue in that pool may ever be conditional on a player choice.
7. No external copyrighted assets. Procedural or self-authored only (code-generated geometry, textures, audio).
8. Report back with: files changed, what you did, how you verified it, and any open issues or follow-ups.

## Waves

| Wave | Status | Scope |
|------|--------|-------|
| 0 | done | Playable game: title → platform → arrival → carriage → 7 stations → 3 endings |
| A | done | Visual polish of the DOM renderer, scene transitions, UI chrome, effects |
| B1 | done | `runSeed` RNG, vanish pool, clue-subset gating, Tier 1/2 choices (guide §6) |
| B2 | in progress | Station anomaly pools, flavor-text variants, ambient timing jitter (guide Systems 2-4) |
| C | in progress | Three.js 2.5D prototype (carriage); art bible; shipping/infra; test harness; story bible debate |
| D | planned | Engine architecture pass: scene registry, content packs, save versioning/migrations, renderer abstraction |
| E | planned | Roll the 3D renderer out to all scenes; DOM renderer becomes a fallback |
| F | planned | Story depth from the story bible: backstories, lore, new content |
| G | planned | Reincarnation / skins meta-progression across playthroughs |
| H | planned | Full 3D exploration |

## File ownership — current wave (B2 + C)

| Owner | Files |
|-------|-------|
| Phase B2 (visual lead + its subagents) | `src/scenes/Station.tsx`, `src/data/stations.ts`, `src/scenes/Platform.tsx` (timing only) |
| 3D prototype | `prototype.html`, `src/prototype/**`, `src/render3d/**` (new) |
| Shipping/infra | `vite.config.ts`, `index.html`, `public/**`, `.github/**`, `vercel.json`, `netlify.toml`, `README.md` |
| Test harness | `vitest.config.ts`, `tests/**` (new) — read-only access to `src/` |
| Art director | `docs/ART_BIBLE.md` |
| Story writers' room | no files; reports only (orchestrator writes `docs/STORY_BIBLE.md`) |
| Orchestrator | `docs/ROADMAP.md`, git, `package.json` |
