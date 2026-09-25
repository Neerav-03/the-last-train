// Deterministic per-run RNG. Never use Math.random() for anything that affects
// narrative content, clue availability, or anything the player should experience
// consistently within a single playthrough. Math.random() stays fine for pure
// per-render cosmetic animation (see STORY_REFINEMENT_GUIDE.md §0 rule 1).

export function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return h;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One independent RNG stream per (runSeed, namespace), so unrelated systems
 *  (e.g. 'vanish' vs 'anomaly:kalyanpur') never correlate with each other. */
export function rngFor(runSeed: number, namespace: string): () => number {
  return mulberry32(runSeed ^ hashString(namespace));
}

export function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

/** Fisher-Yates-style take-N without replacement. */
export function pickN<T>(rng: () => number, items: readonly T[], n: number): T[] {
  const pool = [...items];
  const out: T[] = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}
