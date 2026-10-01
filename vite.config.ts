import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

const root = dirname(fileURLToPath(import.meta.url))

// Multi-page build: the game (index.html) always, plus the Three.js prototype
// (prototype.html) only once that file exists, so the build never breaks
// while it is still in progress or if it is removed later.
const input: Record<string, string> = { main: resolve(root, 'index.html') }
const prototypeHtml = resolve(root, 'prototype.html')
if (existsSync(prototypeHtml)) input.prototype = prototypeHtml

/**
 * Stamps `public/sw.js` in the build output with a build id derived from the
 * emitted file names (which carry content hashes). Any change to the bundle
 * yields a byte-different service worker, so browsers install it and it purges
 * the previous version's cache on activate. Identical builds keep the same id,
 * so redeploying unchanged code does not churn clients' caches.
 */
function serviceWorkerBuildId(): Plugin {
  let outDir = resolve(root, 'dist')
  const hash = createHash('sha256')
  return {
    name: 'the-last-train:sw-build-id',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    generateBundle(_options, bundle) {
      for (const fileName of Object.keys(bundle).sort()) hash.update(fileName)
    },
    closeBundle() {
      const swPath = resolve(outDir, 'sw.js')
      if (!existsSync(swPath)) return
      const buildId = hash.copy().digest('hex').slice(0, 12)
      const source = readFileSync(swPath, 'utf8')
      writeFileSync(swPath, source.replaceAll('__BUILD_ID__', buildId))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /<repo>/, so its deploy workflow builds
  // with VITE_BASE=/the-last-train/. Vercel, Netlify and local dev use '/'.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), serviceWorkerBuildId()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
  build: {
    // three.js minifies to roughly 700 kB on its own. It is isolated in its own
    // chunk below, so a limit just above that keeps the warning meaningful for
    // the game's own code.
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      input,
      output: {
        codeSplitting: {
          groups: [
            // Keep three.js in its own long-cached chunk so the DOM game bundle
            // never pays for it and game-code changes don't invalidate it.
            { name: 'three', test: /[\\/]node_modules[\\/]three[\\/]/ },
          ],
        },
      },
    },
  },
})
