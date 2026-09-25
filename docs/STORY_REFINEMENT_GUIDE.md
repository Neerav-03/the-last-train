# STORY_REFINEMENT_GUIDE.md

*THE LAST TRAIN — agency + randomization pass. Synthesized from a two-round debate between two independent design leads: THE ARCHITECT OF CHAOS (replayability/player-agency advocate) and THE KEEPER OF THE THREAD (pacing/coherence advocate). Where they converged independently, that's settled design. Where they clashed, the resolution below is final — implement this document, not either individual proposal verbatim.*

This is the implementation spec for the visual/engineering team. Every mechanism is scoped against the actual current codebase (`src/engine/types.ts`, `src/engine/store.ts`, `src/data/*.ts`, `src/scenes/*.tsx`) as it exists today.

## 0. Design rule (apply to every future addition, not just this pass)

Before randomizing or branching anything, ask in order:

1. **Structural or cosmetic?** Does it change *when/whether* a flag, clue, or scene transition fires — or only *what renders* once an already-authored condition is met? Structural → seed on `runSeed`, review against the invariants in §5. Cosmetic → unseeded, no review needed, may vary per-render freely (e.g. ambient light flicker, dust drift — nothing narrative reads these values).
2. **Is it referenced downstream?** Grep flags/clue ids/dialogue gates for dependents. Nothing depends on it → it's a leaf, safe to randomize within its band. Something does → load-bearing, needs explicit review.
3. **Test the floor, not the average.** Mentally play the worst-case random draw. If the floor is still a coherent escalation and the guaranteed clue count still clears the `breakLoop` threshold, ship it.

## 1. New data model — `src/engine/types.ts`

```ts
// --- Persisted run-level randomness ---
export interface PersistedState {
  // ...existing fields...
  runSeed: number;                // NEW — set once per playthrough in startNewGame()
  vanishingPassengerId: string;   // NEW — 'businessman' | 'student', resolved once in startNewGame()
  requiredClueIds: string[];      // NEW — this run's breakLoop-required subset, resolved once in startNewGame()
}

// --- Dialogue branching ---
export interface DialogueChoice {
  text: string;
  setFlags?: string[];
  /** Bonus/optional clues only — see Invariant 6. A clue eligible for requiredClueIds must NEVER be conditional on a choice. */
  awardsClues?: string[];
}

export interface DialogueStage {
  // ...existing fields...
  /** If present, DialogueBox pauses on the final line and renders these as buttons instead of auto-advancing. */
  choices?: DialogueChoice[];
}

// --- Station anomaly variant pool ---
export type SeverityBand = 'mild' | 'moderate' | 'severe'; // mild: order 1-2, moderate: order 3-4, severe: order 5-7

export interface StationDef {
  // ...existing fields...
  severityBand: SeverityBand;
  /** Pool of mutually-exclusive cosmetic/atmosphere variants; at most one chosen per run.
   *  Must never carry clueIds (Invariant 4) and must match this station's severityBand (Invariant 2). */
  anomalyPool?: StationObjectDef[];
}

// StationObjectDef.inspectText may now optionally be string[][]:
// outer index = variant chosen once per run via rngFor(runSeed, 'flavor:'+id), locked in flags on first inspect;
// inner index = progressive reveal (existing behavior, unchanged).
export type InspectTextEntry = string | string[];
```

`PassengerDef`: remove the static `disappearsAtTrip`/`leavesTraceWhenGone` fields from the Businessman entry specifically — vanish state now lives on the store (`vanishingPassengerId`) and is applied dynamically to whichever candidate is selected, not read off static passenger data. `ClueDef` needs no new field; eligibility for `requiredClueIds` is determined structurally (see Invariant 5), not by a flag on the clue itself.

## 2. Store additions — `src/engine/store.ts`

Add `runSeed: number`, `vanishingPassengerId: string`, `requiredClueIds: string[]` to `GameStore`, and to the `persist` middleware's `partialize` list (a mid-run reload must not re-roll the vanisher or clue set). Resolve all three once, inside `startNewGame()`:

```ts
startNewGame: () => {
  const runSeed = Math.floor(Math.random() * 2 ** 31);
  const vanishingPassengerId = pickVanishCandidate(runSeed);   // from src/engine/runSetup.ts
  const requiredClueIds = pickRequiredClueSubset(runSeed);      // from src/engine/runSetup.ts
  set({
    scene: 'platform',
    tripNumber: 0,
    currentStationIndex: -1,
    interactionCounts: {},
    flags: {},
    discoveredClues: [],
    ending: null,
    hasSaveData: true,
    runSeed,
    vanishingPassengerId,
    requiredClueIds,
  });
},
```

`pickVanishCandidate` / `pickRequiredClueSubset` are pure functions of `runSeed` only, in a new `src/engine/runSetup.ts`.

`TrainInterior.tsx`'s disappearance check changes from reading a static `passenger.disappearsAtTrip` to:
```ts
const isVanished = passenger.id === store.vanishingPassengerId && store.tripNumber >= 2;
```

## 3. `src/engine/rng.ts` (new module)

```ts
// Deterministic per-run RNG. Never use Math.random() for anything that affects
// narrative content, clue availability, or anything the player should experience
// consistently within a single playthrough. Math.random() stays fine for pure
// per-render cosmetic animation (see §0 rule 1).

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
```

`TrainInterior.tsx`'s existing local `hashString`/`seededRandom` pair should be deleted and replaced with imports from this module. Its per-trip micro-drift system (dead lights, route-map glitch, seat jitter — currently seeded only on `tripNumber`, hence identical every playthrough) becomes `rngFor(runSeed, 'lights:' + tripNumber)()` etc. — still trip-progressive within a run, now also varies across playthroughs. This is the single smallest fix with the biggest replay-value payoff; do it first (see §8).

## 4. Randomized systems

| # | System | Mechanism | Resolved when | Scope constraint |
|---|--------|-----------|----------------|-------------------|
| 1 | Vanishing passenger | `vanishingPassengerId` via `rngFor(runSeed,'vanish')` over `['businessman','student']` | `startNewGame()` | Never Old Man, Woman, or Silent Passenger — Invariant 1 |
| 2 | Station anomaly | One entry spliced from `StationDef.anomalyPool` via `rngFor(runSeed,'anomaly:'+key)` | First arrival at that station | Must match station's `severityBand` — Invariant 2; never carries `clueIds` — Invariant 4 |
| 3 | Leaf flavor text | Variant index via `rngFor(runSeed,'flavor:'+id)`, locked in `flags` on first interaction | First interaction with that id | Only for text nothing downstream reads — Invariant 3 |
| 4 | Ambient beat timing | Existing unseeded `Math.random()` calls (e.g. `Station.tsx` announcement delay, Sector 0 footstep delay) replaced with `rngFor(runSeed,'timing:'+id)` | Per-beat, at mount | Cosmetic/timing only, never gates progression; reproducible from a logged seed for QA |
| 5 | Required clue subset | 5 ids drawn via `pickN(rngFor(runSeed,'breakLoopSet'), STATION_CLUE_IDS, 5)` — **from the 10 station-level clue ids only, never passenger- or choice-awarded clues** | `startNewGame()` | See Invariant 5 — this restriction is the corrected version of the original proposal; do not draw from the full clue pool |
| 6 | Carriage micro-drift (existing, re-seeded) | Dead lights / route-map glitch / seat jitter, via §3's `rngFor` instead of the old `tripNumber`-only seed | Per `tripNumber` | Purely cosmetic, unchanged in scope, just now run-varied |

Cosmetic-only randomization (light flicker jitter, dust motion, exact seat-jitter magnitude) is explicitly exempt from all of the above — it may stay unseeded and re-roll per render/mount freely; reseeding it to `runSeed` would make ambient animation feel robotic (identical flicker pattern every time you look at the same light).

## 5. Invariants — never violate these

1. **Vanish pool is exactly `{businessman, student}`.** Old Man (long, no-`minTrip` slow-burn arc — undercutting it early loses an authored relationship payoff even though nothing technically breaks), Silent Passenger (`minTrip: 6` is their only line — an early vanish permanently orphans it), and the Woman (her child's disappearance is a separate `childGone`/`minTrip: 3` flag chain, not a passenger vanish, and is never touched by this system) are permanently excluded. This pool was reached independently by both design leads and is considered settled — do not expand it without a full compressed-arc content pass for a third candidate.
2. **Station order (1-7) and stations 5-7's structural beats are fixed, never randomized or reordered.** The Empty Platform train-vanish reveal, Home's void/`RedEmergencyOverlay` betrayal beat, and the Last Stop finale keep their current hard timing and full authorial control — the escalation curve depends on their fixed position. `anomalyPool` entries stay within their station's `severityBand` (order 1-2 mild, 3-4 moderate, 5-7 severe); never mix bands.
3. **Only leaf content is randomized or branched.** Before adding variance anywhere, run the §0 downstream-dependency check. If something later depends on this beat's specific outcome, it needs explicit design review, not ad-hoc RNG.
4. **`anomalyPool` entries never carry `clueIds`.** Atmosphere variance must never change clue availability between two players who rolled different anomalies in the same band.
5. **`requiredClueIds` draws only from the 10 station-level clue ids** (the ones auto-awarded via `awardStationClues` to any player who inspects one object at that station — `incompleteStationMap`, `newspaperClipping`, `tornRailwayMap`, `billboard`, `timetable`, `platformFigureSketch`, `oldPhotograph`, `passengerList`, `conductorsLedger`, and (once re-gated per §6.4) `vendingMachineReceipt` stays **excluded**, see below) — **never** from passenger-awarded clues (`oldTicketStub`, `businessmanWatch`, `staticRecording`) or any new choice-gated clue (`sharedGrief`, the Sector 0 bonus clue). **This is the corrected version of the original design** — an earlier draft allowed drawing from the full clue pool, which could combine with a clue-forfeiting dialogue choice to produce a silent, permanent, unwinnable lockout of the `breakLoop` ending with no warning to the player. Restricting the pool to unconditionally-reachable station clues preserves the intended effect (a different required combination every run) while making that lockout structurally impossible.
6. **No dialogue choice may ever make a clue that's eligible for `requiredClueIds` conditional.** Choices may freely gate *bonus* (non-eligible) clues, flavor text, or optional content — never anything in the station-clue pool from Invariant 5. If a future choice is added that touches a station-level clue (see `vendingMachineReceipt` in §6.4), that clue must be pulled out of its station's auto-award and into the excluded/bonus pool, not left eligible.
7. **All narrative-facing randomness is seeded on `runSeed` (optionally combined with `tripNumber` for progressive systems), never re-rolled per render.** A playthrough must be internally consistent; only cross-playthrough variance is intended. Pure cosmetic animation is exempt (§4).
8. **New choices never block scene progression.** They ride alongside the existing fallback timers (`REBOARD_FALLBACK_MS`, `PROGRESSION_FALLBACK_MS`, `HOME_REVEAL_FALLBACK_MS`, `EMPTY_PLATFORM_REVEAL_FALLBACK_MS`) — a choice changes flavor/clues/flags, never removes or delays the eventual reboard/advance path if the player ignores it.
9. **Any randomized system that can increase flash/shake frequency or intensity above current baseline** (severe-band anomalies, the emergency-flash beat) **must check `settings.reduceFlashing` and `settings.screenShake`** before rolling anything more intense than the current fixed behavior — clamp or substitute a quieter authored fallback, never a blank frame.

## 6. Choice mechanics

Two tiers, to keep "real agency" and "the floor is never at risk" simultaneously true:

- **Tier 1 — memory/flavor only.** Never touches clues, flags nothing but which of several already-written lines plays later. Zero risk, use freely.
- **Tier 2 — gates bonus content only.** Can award or withhold *optional*, non-`requiredClueIds`-eligible clues and optional dialogue/text. Real stakes (a player can permanently miss something), but floor-safe by construction because Tier 2 content is defined to never intersect Invariant 5's pool.

### 6.1 Old Man branch (Tier 1)
At his `minInteractions: 3` stage ("You already did."), offer:
- **"What did I do?"** → sets `oldManPressed`, unlocks an elaboration line before the next stage.
- **Silence** → sets `oldManIgnored`, shorter final line.

Both paths still award `oldTicketStub` at his final stage — the clue is never cut, only the accompanying text differs (this clue is passenger-tier and excluded from `requiredClueIds` per Invariant 5 regardless, but the rule here is general: Tier 1 never removes a reward, only reflavors it).

### 6.2 Woman comfort branch (Tier 2 — strongest single addition in this pass)
On the interaction immediately after her `childGone` reveal (`minInteractions: 4, minTrip: 3, requiresFlag: 'childGone'`), offer:
- **"Say something"** → sets `comfortedWoman`, awards new bonus clue `sharedGrief` (excluded from `requiredClueIds`), swaps one flag-conditional line in each of the three `ENDINGS` entries.
- **"Step back"** → sets `avoidedWoman`, no clue, unlocks a unique Old Man callback line acknowledging what he saw.

Purely additive: one flag, one optional bonus clue, one line-swap per ending. Nothing about which ending fires, its threshold, or the `childGone` flag chain itself changes.

### 6.3 Sector 0 risk/reward (Tier 2)
Replace the current fixed, automatic 13-second footstep timer with an optional `followFootsteps` hotspot that appears after that same idle window. Inspecting it forces the player to find a third station object to unlock reboarding (instead of the default two) in exchange for a bonus, run-exclusive clue and bespoke text. Ignoring it costs nothing — the default two-object path still works exactly as today.

### 6.4 Vending machine withholding (Tier 2)
"Take it" / "Leave it" at Kalyanpur's vending machine, third inspect.

**Required engineering change:** `awardStationClues()` in `Station.tsx` currently awards every id in `station.clueIds` on first inspect of *any* object at that station (station-level, not per-object). `vendingMachineReceipt` must be pulled out of Kalyanpur's blanket `clueIds` array and awarded individually inside this choice's handler (`store.awardClue('vendingMachineReceipt')` only on "Take it") — otherwise the choice is cosmetic theater and the clue is already banked before the player decides. Once moved, `vendingMachineReceipt` is permanently excluded from `requiredClueIds` (per Invariant 5/6). "Take it" also sets `tookReceipt`, referenced by one conductor line at the Last Stop if set; "Leave it" simply means that line never fires.

### 6.5 Seat loyalty closing line (Tier 1)
Track the max of `interactionCounts` across the five passenger ids (derived, no new state needed). `Endings.tsx` reads it and appends one bespoke closing line, keyed to whichever passenger received the most player attention, to whichever ending fires. Pure agency-by-attention, zero new mechanics.

### 6.6 Vanish acknowledgment (Tier 1)
The first time the player revisits the vanished passenger's now-empty seat, offer "Look away" / "Hold their gaze" (sets `acknowledgedVanishing`). Consumed later as a choice between two authored reactive lines (from the Old Man, or the Silent Passenger) — never gates progression.

## 7. Atmosphere/visual notes (for the visual implementation team)

- Station-to-station transition stings should scale with `order`/`severityBand`, not with which specific anomaly rolled, so the escalation reads even when the exact content varies run to run.
- Keep each `severityBand`'s `FlickerLight` color family consistent across all variants in that band (mild = warm amber like Kalyanpur's existing palette, moderate = cooler neutral, severe = desaturated cold gray like the Empty Platform) so randomized content still signals the correct dread level at a glance.
- Whichever passenger vanishes (Businessman or Student), the `empty-seat--disturbed` visual treatment must work for and look uniform across either — "someone was here" shouldn't read differently by identity.
- When a Tier 1/2 choice fires, a brief, restrained visual tell (e.g. a half-second desaturation pulse on the chosen line, or a subtle `setAmbience` shift — warmer on `comfortedWoman`, colder on `avoidedWoman`) helps the player feel the fork before any later payoff confirms it.
- Tier 2 bonus hotspots (Sector 0 footstep-follow, any future deep-interaction prompts) should get a subtle, distinct marker — not a loot-glow — so attentive players sense "there's more here" without cheapening discovery. A faint reused `DustParticles` trail works well for Sector 0 specifically.
- Home's void/`RedEmergencyOverlay` reveal keeps its current fixed timing and full visual authority — do not attach any randomization to it.
- Any effect gated by Invariant 9 (`reduceFlashing`/`screenShake`) needs an explicitly authored quieter fallback, not a silently skipped frame.

## 8. Suggested implementation order

1. `rng.ts` + `runSeed` store plumbing (foundation, no visible behavior change yet).
2. Re-seed `TrainInterior.tsx`'s existing micro-drift system onto `runSeed` (System 6) — smallest diff, immediately fixes the single biggest known replay weakness in the current build.
3. Vanish pool (System 1) — small, self-contained, high narrative payoff.
4. `requiredClueIds` (System 5, station-clue-only per Invariant 5) — depends only on `runSeed`; pair with the `vendingMachineReceipt` re-gating engineering fix (§6.4) at the same time since they touch the same invariant.
5. Tier 1 choices (§6.1, 6.5, 6.6) — low risk, ship early.
6. Tier 2 choices (§6.2, 6.3, 6.4) — touch `Endings.tsx` and clue-awarding logic, do after the clue-subset plumbing exists.
7. Station anomaly pools (System 2) and leaf flavor-text variants (System 3) — most content-authoring-heavy, lowest mechanical risk, good candidates to parallelize across multiple writers/subagents once `rngFor` exists.
8. Ambient timing jitter (System 4) — small, can land anytime after step 1.
