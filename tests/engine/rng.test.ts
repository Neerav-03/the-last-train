import { describe, expect, it } from 'vitest';
import { hashString, mulberry32, pick, pickN, rngFor } from '../../src/engine/rng';
import { seedCorpus } from '../helpers/seeds';

function take(rng: () => number, n: number): number[] {
  return Array.from({ length: n }, () => rng());
}

/** A fake rng that replays a fixed script, for exact pick/pickN index checks. */
function scripted(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('hashString', () => {
  it('is deterministic and returns a 32-bit integer', () => {
    for (const s of ['', 'vanish', 'breakLoopSet', 'anomaly:kalyanpur', 'flavor:vendingMachine']) {
      const h = hashString(s);
      expect(h).toBe(hashString(s));
      expect(Number.isInteger(h)).toBe(true);
      expect(h).toBe(h | 0);
    }
  });

  it('distinguishes the namespaces the game actually uses', () => {
    const namespaces = [
      'vanish',
      'breakLoopSet',
      'anomaly:kalyanpur',
      'anomaly:madhavNagar',
      'anomaly:sector0',
      'flavor:vendingMachine',
      'timing:announcement',
      'lights:1:light-a',
      'routeMap:1',
      'emergency:5',
    ];
    expect(new Set(namespaces.map(hashString)).size).toBe(namespaces.length);
  });
});

describe('mulberry32 / rngFor determinism', () => {
  it('same seed gives an identical sequence', () => {
    for (const seed of seedCorpus(200)) {
      expect(take(mulberry32(seed), 32)).toEqual(take(mulberry32(seed), 32));
    }
  });

  it('same (runSeed, namespace) gives an identical sequence', () => {
    for (const seed of seedCorpus(200)) {
      expect(take(rngFor(seed, 'vanish'), 32)).toEqual(take(rngFor(seed, 'vanish'), 32));
      expect(take(rngFor(seed, 'anomaly:sector0'), 32)).toEqual(take(rngFor(seed, 'anomaly:sector0'), 32));
    }
  });

  it('different namespaces under the same runSeed diverge', () => {
    const pairs: [string, string][] = [
      ['vanish', 'breakLoopSet'],
      ['anomaly:kalyanpur', 'anomaly:madhavNagar'],
      ['flavor:a', 'flavor:b'],
      ['lights:1:light-a', 'lights:2:light-a'],
    ];
    for (const seed of seedCorpus(500)) {
      for (const [a, b] of pairs) {
        expect(take(rngFor(seed, a), 8), `seed=${seed} ${a} vs ${b}`).not.toEqual(take(rngFor(seed, b), 8));
      }
    }
  });

  it('namespace streams are not trivially correlated (first draws agree ~chance only)', () => {
    // Bucketed first draws for 'vanish' vs 'breakLoopSet' should agree on
    // roughly 1/10 of seeds, not systematically.
    const seeds = seedCorpus(5000);
    let agree = 0;
    for (const seed of seeds) {
      const a = Math.floor(rngFor(seed, 'vanish')() * 10);
      const b = Math.floor(rngFor(seed, 'breakLoopSet')() * 10);
      if (a === b) agree++;
    }
    expect(agree / seeds.length).toBeGreaterThan(0.05);
    expect(agree / seeds.length).toBeLessThan(0.15);
  });

  it('different runSeeds under the same namespace diverge', () => {
    const firsts = new Set(seedCorpus(2000).map((s) => rngFor(s, 'vanish')()));
    expect(firsts.size).toBeGreaterThan(1990);
  });

  it('every output is in [0, 1)', () => {
    for (const seed of seedCorpus(500)) {
      const rng = rngFor(seed, 'range');
      for (let i = 0; i < 200; i++) {
        const v = rng();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    }
  });

  it('is roughly uniform', () => {
    const rng = mulberry32(12345);
    const buckets = new Array(10).fill(0);
    const n = 100_000;
    for (let i = 0; i < n; i++) buckets[Math.floor(rng() * 10)]++;
    for (const b of buckets) {
      expect(b / n).toBeGreaterThan(0.09);
      expect(b / n).toBeLessThan(0.11);
    }
  });
});

describe('pick', () => {
  it('maps rng output onto the full index range', () => {
    const items = ['a', 'b', 'c', 'd'] as const;
    expect(pick(scripted([0]), items)).toBe('a');
    expect(pick(scripted([0.2499]), items)).toBe('a');
    expect(pick(scripted([0.25]), items)).toBe('b');
    expect(pick(scripted([0.9999999]), items)).toBe('d');
  });

  it('always returns a member of the pool', () => {
    const items = ['x', 'y', 'z'];
    for (const seed of seedCorpus(500)) {
      expect(items).toContain(pick(rngFor(seed, 'pick'), items));
    }
  });

  it('reaches every item', () => {
    const items = ['x', 'y', 'z', 'w', 'v'];
    const seen = new Set(seedCorpus(500).map((s) => pick(rngFor(s, 'pick'), items)));
    expect(seen).toEqual(new Set(items));
  });
});

describe('pickN', () => {
  const pool = Array.from({ length: 12 }, (_, i) => `item${i}`);

  it('returns exactly n unique items from the pool when n <= pool size', () => {
    for (const seed of seedCorpus(500)) {
      for (const n of [0, 1, 5, 11, 12]) {
        const out = pickN(rngFor(seed, 'pickN'), pool, n);
        expect(out).toHaveLength(n);
        expect(new Set(out).size).toBe(n);
        for (const item of out) expect(pool).toContain(item);
      }
    }
  });

  it('never exceeds the pool size', () => {
    for (const seed of seedCorpus(100)) {
      const out = pickN(rngFor(seed, 'pickN'), pool, pool.length + 5);
      expect(out).toHaveLength(pool.length);
      expect(new Set(out)).toEqual(new Set(pool));
    }
    expect(pickN(mulberry32(1), [], 3)).toEqual([]);
  });

  it('returns [] for non-positive n', () => {
    expect(pickN(mulberry32(1), pool, 0)).toEqual([]);
    expect(pickN(mulberry32(1), pool, -2)).toEqual([]);
  });

  it('does not mutate the input pool', () => {
    const copy = [...pool];
    pickN(mulberry32(7), pool, 6);
    expect(pool).toEqual(copy);
  });

  it('is deterministic for the same rng stream', () => {
    for (const seed of seedCorpus(200)) {
      expect(pickN(rngFor(seed, 'pickN'), pool, 5)).toEqual(pickN(rngFor(seed, 'pickN'), pool, 5));
    }
  });

  it('draws without replacement in splice order', () => {
    // idx0 = floor(0.5*4)=2 -> 'c'; pool [a,b,d]; idx1 = floor(0*3)=0 -> 'a'; pool [b,d]; idx2 = floor(0.99*2)=1 -> 'd'
    expect(pickN(scripted([0.5, 0, 0.99]), ['a', 'b', 'c', 'd'], 3)).toEqual(['c', 'a', 'd']);
  });
});
