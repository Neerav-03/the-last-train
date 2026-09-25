# THE LAST TRAIN

A standalone browser horror game. No backend, no API keys, no AI dependency — everything runs client-side.

2:17 AM. A train arrives that isn't on any schedule. You get on.

## Run locally

```
npm install
npm run dev
```

## Build for deployment

```
npm run build
```

Outputs a static site to `dist/`. Deploy `dist/` to Vercel, Netlify, GitHub Pages, or any static host — no server-side configuration needed.

## Tech

- React + TypeScript + Vite
- Zustand for state (persisted to `localStorage` — progress autosaves)
- Procedural Web Audio API sound design (no audio files)
- All visuals are CSS/SVG/Canvas — no external image assets

## Controls

- **A/D** or **Arrow Left/Right** — move
- **E** or click — interact / talk
- **Space / Enter** or click — advance dialogue
- **Esc** — pause
