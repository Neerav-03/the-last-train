// Deterministic seed corpora for property-style tests. Deterministic on
// purpose: a CI failure must be reproducible from the printed seed.

/** startNewGame() draws runSeed = floor(Math.random() * 2**31), so valid seeds are [0, 2**31). */
export const MAX_SEED = 2 ** 31 - 1;

/**
 * `count` seeds covering the whole runSeed range: the edges, a run of small
 * sequential seeds (the most correlated inputs for mulberry32), and a
 * multiplicative-hash spread across [0, 2**31).
 */
export function seedCorpus(count: number): number[] {
  const seeds = new Set<number>([0, 1, 2, MAX_SEED, MAX_SEED - 1, 2 ** 30, 0x7fff0000]);
  const sequential = Math.floor(count / 4);
  for (let i = 0; i < sequential; i++) seeds.add(i);
  let i = 0;
  while (seeds.size < count) {
    // Knuth multiplicative hash, reduced into the valid runSeed range.
    seeds.add(Number((BigInt(i) * 2654435761n + 12345n) % BigInt(MAX_SEED + 1)));
    i++;
  }
  return [...seeds];
}
