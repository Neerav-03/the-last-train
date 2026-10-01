# THE LAST TRAIN — Art Bible

Status: v1, Wave C. Owner: Art director (`docs/ART_BIBLE.md` only).
Binding for: the `src/render3d/**` rollout (Wave E), skins (Wave G) and full 3D (Wave H).
Read alongside: `docs/STORY_REFINEMENT_GUIDE.md` (§5 invariants and §7 visual notes are binding here too) and `docs/STORY_BIBLE.md` once it exists. Where this document guesses at lore, the guess is marked **[lore-pending]**, and the story bible wins.

Conventions: hex values are sRGB display values. Light "K" values are the intended color temperature, and the hex beside each one is what goes into `THREE.Color` (Three.js converts sRGB hex to linear internally when `ColorManagement.enabled`, which is the r186 default). "Band" always means the guide's `severityBand`: mild = stations 1-2, moderate = 3-4, severe = 5-7.

---

## 1. Visual pillars

Every pillar below is a test. If a new asset, effect or shot fails one, it gets cut or reworked. When pillars conflict, the one listed first wins.

### P1. Almost right
The horror is one wrong detail sitting inside a scene that is otherwise mundane and accurate. Every space should first read as a real, tired commuter line: a 1990s-to-now, era-ambiguous South Asian suburban railway with British-era station architecture. Then exactly one thing is off.

| Do | Don't |
|---|---|
| [UNLISTED] reproduces the hometown arch tiles in green `#4e6a52` and cream `#d9cfb4`. The only wrong thing is the chipped tile on the wrong side. | Gore, blood writing, skulls, monsters, "creepy" fonts, or rust on everything. |
| Kalyanpur's umbrella anomaly is modeled as an ordinary umbrella. The wrongness is that it's dry, so it needs crisp, dry fabric shading next to wet everything else. | Making anomalies glow or outlining them. The guide (§7) already rules out loot-glow. |
| Use real signage grammar: bilingual-style station boards, platform numbers, yellow safety line `#c9a227`. | Generic "abandoned asylum" grunge. This place is maintained, just barely. |

### P2. The light is leaving
Light is the game's clock. Within a run, the total light budget only goes down. Overhead fixtures die and stay dead, key-to-fill ratios widen, saturation drains. The player should be able to tell how late it is from a screenshot alone.

| Do | Don't |
|---|---|
| Carriage fixtures die progressively (`deadLightIds`, max 2 by trip 6). In 3D the dead tube keeps its ends faintly glowing `#3a2a20` for 2 s, then stays cold. | Turning a light back on mid-run, except Home's lie (§3.8) and the scripted Last Stop bulb. |
| Severe stations frame 55-75% of the image at or below `--color-void` `#060608`. | Flicker as decoration at mild stations. Mild gets one flicker event per scene, maximum. |
| Light failure gets authored curves (§3.3). | `Math.sin` flicker. It reads as a machine, not a failing tube. |

### P3. A beat late
The uncanny signature is latency. Things repeat a fraction of a second behind where they should be: reflections, knocks, footsteps, voices on the intercom. This is what we use instead of jump scares, and it's the one effect family that should feel like it belongs only to this game.

| Do | Don't |
|---|---|
| Window reflections render from a delayed pose buffer (6-10 frames) at moderate band and later. On the Woman's stage-2 line, the child's reflection doesn't move at all. | Lagging everything all the time. Latency is a tell, so ration it: one lagging element per shot. |
| Kalyanpur's puddle reflection is a delayed mirror of the player's sprite or camera. | Glitch, datamosh or VHS-tracking effects. They read as "a horror game" rather than "something is wrong". |

### P4. The face is withheld
The most important things are never fully resolved: the Silent Passenger's face, the Empty Platform figure, the faces in the family photo. Hide them through composition and light, never through blur or censor-style effects (§5.6).

| Do | Don't |
|---|---|
| Light the Silent Passenger with a top-down key only, at a cap/hood brim angle that keeps the eye line in shadow under every camera angle we allow. | Pixelating, blurring or black-boxing a face. Any obvious concealment tells the player there's a face worth seeing and that we're refusing to show it. |
| Keep the Empty Platform figure at ≥ 18 m from camera and below 4% of frame height, until it is suddenly closer. | Revealing a passenger's "true face" as a payoff. Even the breakLoop ending cuts to black first (§7.9). |

### P5. Worn, not ruined
Surfaces are public infrastructure that has been cleaned ten thousand times: polished-through vinyl, crazed plexiglass, scuffed paint at hip height, wet concrete. The wear sits where bodies touch. That makes every surface a record of past passengers, which is the reincarnation theme expressed in materials.

| Do | Don't |
|---|---|
| Seat vinyl is glossier in the sitting dip (roughness 0.35 there, 0.7 elsewhere). The grab pole is bright at hand height. | Uniform noise grunge across whole surfaces. |
| Empty seats keep a body-shaped compression (the `empty-seat-trace` today) as a normal-map decal. | Cobwebs, broken windows, graffiti tags. Nobody has been gone long enough. |

---

## 2. Palette and color script

### 2.1 Core tokens (from `src/styles/global.css`, unchanged)
These stay the UI palette and anchor the 3D world. The renderer should import them from one TS module (proposed `src/render3d/palette.ts`) so CSS and WebGL never drift apart.

| Token | Hex | 3D role |
|---|---|---|
| `--color-void` | `#060608` | Clear color. The floor of every scene's darkness. Fog color in severe band. |
| `--color-bg` | `#0a0a0e` | Hemisphere ground color, deep shadow. |
| `--color-bg-raised` | `#111116` | Unlit painted metal in shadow. |
| `--color-fog` | `#1c1e24` | Default fog color (mild/moderate), hemisphere sky. |
| `--color-steel` | `#2a2d35` | Carriage panels and steel albedo base. |
| `--color-line` | `#3a3d45` | Trim, seat frames, rails albedo. |
| `--color-text` | `#c9cdd6` | Signage text emissive (lit boards). |
| `--color-text-dim` | `#6f7480` | Dead signage, painted stencils. |
| `--color-text-bright` | `#eef0f4` | Max allowed albedo for any non-emissive surface (paper, tile glaze). |
| `--color-accent` | `#7fa8c9` | Night-sky / window cold, moonlit rain, lightning tint. "The outside." |
| `--color-accent-warm` | `#d8b874` | Home, the lie of safety, interaction prompts. "The inside you want." |
| `--color-danger` | `#b23a3a` | Wrong signage borders, emergency housings. |
| `--color-danger-glow` | `#ff4b4b` | Emergency emissive, iris bleed at breakLoop. |
| `--color-emergency` | `#7a1515` | Emergency light falloff color, the red in shadow. |

### 2.2 Extended world palette (new)

**Light colors.** Emissive and light `color` values. Intensities are set in §3.

| Name | K | Hex | Used for |
|---|---|---|---|
| `light.sodium` | ~1900 (LPS-like) | `#d8a24a` (existing Kalyanpur FlickerLight) | Kalyanpur, the opening Platform 4 lamps, passing trackside lamps. |
| `light.sodiumCore` | — | `#ffb35c` | Sodium lamp emissive core (bloom source only). |
| `light.fluoro` | 5000 | `#dce8f0` (existing Madhav Nagar / default) | Carriage tubes, Madhav Nagar. |
| `light.fluoroSick` | 4200 + green spike | `#cfe3cf` | Failing or end-of-life tubes, Sector 0 spill. |
| `light.caged` | 3200, filtered | `#c4b79c` | Sector 0 caged bulb (replaces `#9aa2ad`, see §2.4). |
| `light.flatGrey` | 6500, diffuse | `#a8acb0` | [UNLISTED] shadowless overcast (replaces `#8a5050`, see §2.4). |
| `light.deadCold` | 7500 | `#6b7078` (existing Empty Platform) | Empty Platform's last lamps. |
| `light.lastBulb` | 4000, dim | `#8a8f9a` (existing Last Stop) | The final carriage bulb. |
| `light.tungstenHome` | 2700 | `#ffc98a` | Home before the reveal (emissive), giving the scene `#d8b874` as its tone-mapped key. |
| `light.homeCurdled` | — | `#9c8a4a` → `#5e5a3a` | Home after the reveal: bilious, olive, sour. |
| `light.emergency` | — | `#ff4b4b` (emissive) / `#b23a3a` (light) | Emergency strobe. |
| `light.lightning` | 9000 | `#c8d8ea` | Lightning (existing CSS uses `rgba(150,180,210)`). |
| `light.screenBleed` | — | `#7fa8c9` | Window/outside fill at night. |

**Surface albedo bases.** Base color, before procedural variation.

| Name | Hex | Notes |
|---|---|---|
| `mat.vinylSeat` | `#3b4a5a` | Blue-grey vinyl. Faded to `#4f5d6b` where people sit. |
| `mat.vinylSeatHome` | `#6b4a32` | Seat recolor seen only at Home/Unlisted memory echoes. |
| `mat.carriagePanel` | `#2a2d35` | = `--color-steel`. |
| `mat.carriageFloor` | `#24221f` | Ribbed rubber, warm-dark. |
| `mat.grabPole` | `#8e949c` | Metallic 1.0, roughness 0.25 polished, 0.5 base. |
| `mat.concreteDry` | `#4a4844` | Platform concrete. |
| `mat.concreteWet` | `#2b2a28` | The same concrete darkened ~40%, roughness 0.15. |
| `mat.safetyLine` | `#c9a227` | Platform yellow line, worn to `#8a7330`. |
| `mat.tileGreen` | `#4e6a52` | Hometown / [UNLISTED] arch tile. |
| `mat.tileCream` | `#d9cfb4` | Hometown / [UNLISTED] arch tile. |
| `mat.tileWhite` | `#cfd2cc` | Generic station wall tile (Kalyanpur, Madhav Nagar). |
| `mat.rust` | `#5a3a26` | Rails, rebar, bolts (rails polished to `#9a9a98` on the running top). |
| `mat.woodHome` | `#5a3c22` | Home paneling. |
| `mat.brassHome` | `#b08a4a` | Home clock, door handle. |
| `mat.paper` | `#d6cdb8` | Tickets, notices, newspaper (aged `#b8a888`). |
| `mat.signEnamel` | `#1d3b5c` | Enamel station board ground; text `#eef0f4`. |

**Character palette anchors.** Each passenger owns one hue family, so they read at silhouette scale and survive reskinning (§6.10).

| Passenger | Anchor hue | Primary | Secondary | Never |
|---|---|---|---|---|
| Old Man | ash brown | `#5b5249` | `#8a8178` | saturated colors |
| Woman | faded maroon | `#6a2f36` | `#b9a48c` (shawl) | blue |
| Businessman | charcoal grey | `#3a3d42` | `#9aa3ad` (shirt) | warm browns |
| Student | mustard / ochre | `#9c7a2a` | `#2f3a45` | red |
| Silent Passenger | near-black | `#141519` | `#2a2d35` | any light value above `#3a3d45` on the costume |
| Conductor | navy serge | `#1c2433` | `#b08a4a` (brass) | red, except the ledger ribbon `#7a1515` |

### 2.3 Severity encoding
Escalation has to read at a glance even when the guide's anomaly pools roll different content. Every scene is graded on five fixed axes. Bands step those axes; individual stations only move within their band's range.

| Axis | Mild (1-2) | Moderate (3-4) | Severe (5-7) |
|---|---|---|---|
| Key light hue family | warm amber (sodium/fluoro) | cooler neutral (caged/flat grey) | desaturated cold grey, or a warm lie that curdles |
| Post saturation multiplier | 0.90 | 0.72 | 0.45 (Home pre-reveal: 0.85 → 0.55) |
| Key:fill ratio | 4:1 | 8:1 | 16:1 or more (Empty Platform ~40:1) |
| % of frame at ≤ `#060608` | 20-30% | 35-50% | 55-75% |
| Fog `FogExp2` density (visibility = exp(−(density·d)²)) | 0.03 | 0.045 | 0.06 (Empty Platform 0.07) |
| Station sign border | `#d8a24a` | `#9aa2ad` | `#b23a3a` (the existing `.station-sign--wrong` treatment) |
| Transition sting length | 600 ms | 900 ms | 1400 ms |

Per guide §7, every anomaly-pool variant inherits its station's row. No anomaly may bring its own light color.

### 2.4 Corrections to the current DOM palette
- **Sector 0** FlickerLight `#9aa2ad` → `light.caged` `#c4b79c`. The text says "single caged bulb", which is an incandescent read. Moderate band still desaturates it to neutral through the 0.72 saturation post.
- **[UNLISTED]** FlickerLight `#8a5050` → `light.flatGrey` `#a8acb0`, with no visible source and a hemisphere-heavy rig (§3.6). Its ambience is "flat, shadowless grey". The current red breaks the moderate "cooler neutral" rule (guide §7) and spends red early, which severe needs to own. Red survives only on the phone-box anomaly and on the sign border.

### 2.5 Color script

**Prologue and hub**

| Beat | Key light | Fill / ambient | Fog color · density | Signature accent | Sat | Mood line |
|---|---|---|---|---|---|---|
| Title | `light.sodium` lamp, far | `#1c1e24` | `#1c1e24` · 0.03 | `#7fa8c9` rain | 0.80 | A platform at night, held at a distance |
| Platform 4 (prologue) | 1× `light.sodium` overhead + 2× `light.fluoro` far (matches current FlickerLights) | `#14161c` | `#1c1e24` · 0.03 | `#c9a227` safety line, 2:17 on the clock | 0.85 | Ordinary, cold, alone |
| Train arrival | Headlight `#fff4d6` sweeping | `#0a0c12` | `#1c1e24` · 0.035 | `#fffae6` headlight bloom | 0.85 | Relief that arrives too fast |
| Carriage, trip 0-2 | 7× `light.fluoro` tubes, all working | `#1c1e24` hemi 0.15 | `#0a0b0e` haze · 0.02 | `#7fa8c9` windows | 0.85 | Fluorescent normal |
| Carriage, trip 3-4 | 1 fixture id dead (1-2 tubes), 1 sick tube `#cfe3cf` | `#16181d` | haze · 0.03 | route map gains a dot | 0.75 | Something is counting |
| Carriage, trip 5-6 | 1-2 fixture ids dead (2 by trip 6), extended carriage void | `#101115` | haze · 0.045 | `#ff4b4b` emergency beat | 0.60 | The car is longer than it was |

**Stations**

| # | Station | Band | Key | Fill / ambient | Fog · density | Accent | Sat | Darkness % | Read |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Kalyanpur | mild | `light.sodium` `#d8a24a`, 2 lamps | `#1a140c` | `#2a2216` · 0.03 | `#7fa8c9` rain sheen | 0.90 | 25% | Orange rain, almost every other night |
| 2 | Madhav Nagar | mild | `light.fluoro` `#dce8f0`, 4 tubes (1 stutters) | `#14161c` | `#1c1e24` · 0.03 | idle train's interior glow `#dce8f0` | 0.88 | 30% | Wide, empty, humming |
| 3 | Sector 0 | moderate | `light.caged` `#c4b79c`, 1 bulb, hard shadows | `#0e0f11` | `#17181a` · 0.045 | `#c9a227` EXIT stencils | 0.72 | 45% | Unfinished, one step behind |
| 4 | [UNLISTED] | moderate | `light.flatGrey` `#a8acb0`, hemisphere-dominant, no cast shadows | `#3a3d40` sky / `#17181a` ground | `#2a2c2f` · 0.04 | `#4e6a52` / `#d9cfb4` tiles, `#8f2a2a` phone box | 0.70 | 35% | Familiar as a trap |
| 5 | The Empty Platform | severe | `light.deadCold` `#6b7078`, 2 lamps, far apart | `#060608` | `#060608` · 0.07 | none (absence is the accent) | 0.40 | 75% | Vast, and the train never existed |
| 6a | Home (arrival) | severe (the lie) | `light.tungstenHome` → `#d8b874`, 3 sources | `#241a0c` | `#241a0c` · 0.025 | `#b08a4a` brass | 0.85 | 20% | Exactly as pictured |
| 6b | Home (revealed) | severe | `light.homeCurdled` `#9c8a4a`, 1 source dies | `#0a0a0e` | `#060608` · 0.06, swallowing right side | `#ff4b4b` emergency pulse | 0.55 | 60% | The tracks just stop |
| 7 | The Last Stop | severe | `light.lastBulb` `#8a8f9a`, single bulb | `#060608` | haze `#0a0a0e` · 0.04 | sign beam `#eef0f4` | 0.45 | 70% | Emptied carriage, one bulb |

**Endings**

| Ending | Key | Fog | Accent | Sat | Final frame |
|---|---|---|---|---|---|
| `getOff` — "You finally reached your destination" | steady `light.sodium` with zero flicker, the only rock-steady light in the game | `#201a10` · 0.025 | `#d8b874` text glow | 0.80 | Street that is almost right. Fade to `#201a10`, not black. |
| `stayOn` — "The sixth passenger" | `light.screenBleed` `#7fa8c9` through windows only. Interior tubes off. | `#10141a` · 0.04 | 2:17 watch face `#c9cdd6` | 0.35 | Slow push to the player's folded hands. Fade to `#10141a`. |
| `breakLoop` — "You weren't supposed to remember" | carriage tubes stutter-cascade front to back, then `light.emergency` | `#1c1012` · 0.05 | `#ff4b4b` | 0.50 → 0 | Silent Passenger stands. The iris closes on red, then `#000000`. This is the only pure-black frame in the game. |

**Rule:** pure `#000000` is reserved for three things: the iris blackout's closed state, the void beyond the tracks at Home, and the Empty Platform edge drop. Everything else bottoms out at `#060608`.

---

## 3. Lighting language

### 3.1 Renderer baseline (r186 WebGLRenderer)
- `outputColorSpace = SRGBColorSpace`. Tone mapping **`AgXToneMapping`**, exposure 1.0 by default. AgX keeps sodium orange from skewing pink in highlights and desaturates hot sources gracefully, which suits P2. Fallback is `ACESFilmicToneMapping` at exposure 0.9 if AgX banding shows on low tier.
- Physically correct light units (r155+ default). Values below are in candela (point/spot) and lux-ish (directional/hemi). Treat them as starting points to tune per scene, then lock into the scene's lighting preset file.
- Shadows: `PCFSoftShadowMap`. **One** shadow-casting light per scene (two only at Sector 0 for the double-bulb anomaly). Map 1024² high tier, 512² low tier.
- Most "light" should be **emissive geometry + fake light pools**, not lights. A fluorescent tube is an emissive box (`emissiveIntensity` 2-4, bloom picks it up) plus one shared real light for every 2 tubes, plus an additive floor decal for the pool. That's how the DOM `.light-pool` already works, and it keeps us inside the light budget (§9).

### 3.2 Light types

| Type | Three.js implementation | Color | Intensity (cd) | Falloff | Behavior |
|---|---|---|---|---|---|
| Fluorescent tube | Emissive `BoxGeometry` 1.2×0.04×0.08 m + `PointLight` per 2 tubes (or `RectAreaLight` on high tier only) | `#dce8f0` | 6-10 | `distance` 6 m, `decay` 2 | 100/120 Hz shimmer invisible; failure curves §3.3 |
| Sodium lamp | Emissive sphere-cap + `SpotLight` angle 0.9 rad, penumbra 0.6 | `#d8a24a` | 40-80 | 14 m | Steady; rain catches cone (volumetric cone card) |
| Caged bulb | Emissive sphere + `PointLight` castShadow | `#c4b79c` | 12 | 8 m | Swings ±3° on a 4 s pendulum when train passes; shadows of cage bars sweep |
| Flat overcast | `HemisphereLight` sky `#a8acb0` ground `#2a2c2f`, intensity 1.6; no direct light | — | — | — | Shadowless; AO carries all form |
| Emergency | Emissive housing + `PointLight` | `#ff4b4b` | 0 → 25 | 10 m | Square-ish pulse 0.6 s on / 0.9 s off, 3 pulses max per beat (`reduceFlashing`: single 1.8 s slow swell to 8 cd) |
| Home tungsten | 3× `PointLight` + emissive lamp shades | `#ffc98a` | 15 each | 7 m | Steady, slight 0.3 Hz "breathing" ±4% |
| Window bleed | `DirectionalLight` from window side, no shadow | `#7fa8c9` | 0.15 lux | — | Modulated by the passing-lamp sweeps (§7.4) |
| Lightning | Same directional, spiked | `#c8d8ea` | 0 → 3.5 lux | — | Curve §3.3; `reduceFlashing` → 0.8 lux max, 400 ms ramp |
| Headlight | `SpotLight` angle 0.35, castShadow | `#fff4d6` | 400 | 60 m | Arrival only |
| Ambient floor | `HemisphereLight` sky `#1c1e24` ground `#0a0a0e` | — | 0.10-0.25 | — | Never above 0.25 except [UNLISTED] |

### 3.3 Light failure curves (authored, not random)
Store these as keyframe arrays (`[t_ms, intensityMultiplier]`) in one `lightCurves.ts`; drive with a per-light cosmetic `Math.random()` offset (guide §4 explicitly exempts cosmetic flicker from seeding).

| Curve | Pattern | Use |
|---|---|---|
| `strike` | 0 → 1 (40 ms) → 0 (60 ms) → 1 (30 ms) → 0 (120 ms) → 1 hold | Tube turning on (carriage boot, Last Stop bulb return) |
| `dying` | hold 1; random dropouts 1-4 frames to 0.15, mean interval 2.8 s; occasional 300 ms brown-out to 0.55 | One sick tube from trip 3 |
| `death` | dying ×3 in 1.2 s → 0, ends glow `#3a2a20` emissive 0.3 decaying over 2 s | When a fixture joins `deadLightIds` (plays once, on scene enter) |
| `morse` | long 600 / short 180 / short 180, gap 900; stops dead when player looks for > 1.5 s | Madhav Nagar `anomaly_tube` |
| `breath` | ±4% at 0.3 Hz | Home pre-reveal |
| `lightning` | 0 → 1 (30 ms) → 0.2 (80 ms) → 0.85 (40 ms) → 0 (500 ms ease-out) | Kalyanpur, arrival |
| `cascade` | each fixture runs `death` offset 140 ms front-to-back | breakLoop ending |

### 3.4 Darkness and contrast rules
1. **Darkness is a place, not an absence.** Every dark region keeps a readable silhouette edge: a rim from `light.screenBleed` at 0.1 lux, or a fog gradient. Pure black only per §2.5's three exceptions.
2. **Interactive objects are never in the darkest 10% of the frame.** Minimum luminance for an inspectable object's lit face is sRGB ~`#2a2d35`. Readability is a gameplay requirement; dread comes from what surrounds it.
3. **Contrast ratios** (key-lit face : unlit side of same object): mild 4:1, moderate 8:1, severe 16:1+. Measure with the debug luminance overlay (§9.6).
4. **Bloom threshold** 0.85 luminance, strength 0.35 (mild) → 0.5 (severe, fewer but harsher sources). Only emissives and the headlight should bloom; wet speculars may catch it at ≤ 0.2.
5. **Light failure is monotonic per run** (P2). A fixture that died on trip 3 is dead on trip 4. Only Home (lie) and the Last Stop bulb break this, and they break it on purpose.

### 3.5 Setup: the carriage (hub)
- Geometry reference is the prototype's `src/render3d/scenes/carriage/layout.ts`: a 16 m car, 5 bays of facing benches either side of a 0.84 m aisle, 7 ceiling tubes (`TUBE_Z`), luggage racks, and the route map above the far door.
- **Game-to-tube mapping.** The game logic kills from 5 `OVERHEAD_LIGHTS` ids (`light-a`…`light-e`). Map them onto the 7 tubes as a→tubes 0-1, b→2, c→3, d→4, e→5-6, so a dead `light-a` or `light-e` darkens a pair. That makes the ends of the car fail first, which pulls the eye inward.
- Lights (6 real, the §9.2 high-tier maximum):
  - 7 emissive tubes;
  - 3 shadowless `PointLight`s (`#dce8f0`, 8 cd, distance 6, decay 2) at z ≈ −2.2 (tubes 0-1), −11.8 (tubes 4-5) and −15.0 (tube 6);
  - 1 shadow-casting `SpotLight` at tube 3 (z = −8.2, covering tubes 2-3);
  - the emergency red point (intensity 0 at rest);
  - the passing-lamp point (§7.4).
  - Low tier drops the z = −15.0 point and merges emergency and passing-lamp into one repositioned light (they never fire together), which leaves 4.
- Cheap fills: 1 `HemisphereLight` (sky `#1c1e24`, ground `#0a0a0e`, 0.15) and 1 window `DirectionalLight` (`#7fa8c9`, 0.15 lux, from the +x side, no shadow).
- Shadows: the point lights stay shadowless (cube shadow maps are 6 renders each). The single shadow caster is the tube-3 `SpotLight`, aimed straight down, angle 1.2, 1024². It puts passengers' shadows on the floor of the middle bays only, and the dark ends get none, which is correct.
- Dead fixtures: zero the intensity of the matching point light and tube emissive. Don't remove lights: changing the light count recompiles every shader (see §9.3).
- Trip 5+ extended carriage: the car continues past the far door position into fog `#060608` at density 0.06, with extra dead fixtures (geometry only, emissive 0) receding. The light should end before the car does.
- Interior haze: `FogExp2` `#0a0b0e`, 0.02 on trips 0-2, 0.03 on trips 3-4, 0.045 on trips 5-6. The prototype's 0.06 is right only for the extended carriage.
- Emergency beat: a red `PointLight` pre-placed above the door at intensity 0, pulsed per §3.2.

### 3.6 Setup: a generic station (template for stations 1-4)
- **Three-layer rig:** (a) one key source the station text names (sodium lamp / tubes / caged bulb / overcast), the shadow caster; (b) a cold far-fill — the train's own interior glow through its open doors, `#dce8f0` at 3 cd, low on the left of frame, so the way back is always lit; (c) hemisphere ambient per §2.5.
- Fog begins 8 m behind the platform-edge line so the platform reads and the beyond doesn't.
- The train is always present and lit at stations 1-4 (it is the safe thing; P2). Its doors are the brightest non-emissive area in frame.
- Wet stations (Kalyanpur, arrival, title) get the rain-cone cards under each sodium spot and screen-space-free puddle reflections (§4.3).
- [UNLISTED] variant: no direct key at all — the hemisphere does everything, SSAO/baked AO carries the arches. The missing shadow is the wrongness.

### 3.7 Setup: the Empty Platform (station 5)
- Two `light.deadCold` lamps (SpotLight, 20 cd, angle 0.6) 22 m apart along a platform at least 80 m long; nothing else lights the floor between them. Fog `FogExp2` `#060608` 0.07: the figure at 18 m keeps ~20% of its contrast, and the second lamp at 22 m keeps ~9%. The far end of the platform is gone.
- **The train is already gone on the first frame.** This matches the current code, where `trainVisible` starts false. The player never sees or hears it leave. The far-fill rig from §3.6(b) is simply absent, and this is the only station where the way back is unlit. Darkness sits at ~75%.
- **The reveal** (the existing `triggerReveal`, after 2 inspects or the 20 s fallback, with fixed timing per Invariant 2): the train returns silently over 1600 ms. The full sequence is §7.7. When the windows light, they add a cold `#dce8f0` fill at 3 cd, and the darkness drops to ~60%. The safe thing is back, and it is wrong: it sits over no tracks.
- The figure stands just outside the second lamp's cone edge, at ≥ 18 m. It has no light of its own, only a 0.05-equivalent rim term (`#6b7078`) in its material, not a light. Once the reveal line plays ("You shouldn't have gotten off."), it is no longer there.
- **Platform edge:** no tracks. A black (`#000000`) unlit plane sits 1.1 m below the edge and extends to the fog. It is one of the three permitted pure-black surfaces. [lore-pending] Coins from earlier getOff runs (§6.10) lie at the edge only.

### 3.8 Setup: Home (station 6) — the light that curdles
- **Arrival (6a):** 3 tungsten points `#ffc98a` 15 cd at wall sconces + emissive under-door glow on The Door Home (`#ffc98a`, emissiveIntensity 3, a 1 cm strip). Hemisphere `#3a2a18`/`#120d08` 0.25. Saturation 0.85. Breath curve. Wood and brass speculars carry the warmth. The right edge of frame already holds the void (`.station-void` today: 38% width) — but it reads as "just darkness past the lamp".
- **Reveal (6b), fixed timing per guide §5.2/§7 — no randomization:**
  1. t=0: the sconce nearest the void dies with `death` curve; the other two shift `#ffc98a` → `#9c8a4a` over 1800 ms (matches the existing 1800 ms CSS transition) while saturation post goes 0.85 → 0.55 and exposure −0.4 EV.
  2. Void grows from 38% → 55% of frame width (keep existing proportions) — implemented as the fog wall advancing, not a 2D gradient (§7.8).
  3. Emergency pulse (`RedEmergencyOverlay` beat): red point at the platform edge, 3 pulses, `reduceFlashing` fallback = one slow swell.
  4. The under-door glow stays on, unchanged, the entire time. It is the last warm thing and it is a lie.
- Never fully warm again after 6b. Curdled olive `#5e5a3a` is the tail value if the player lingers.

### 3.9 Setup: the Last Stop (station 7)
- The carriage set, every passenger seat empty (traces only), **one** working fixture (`light.lastBulb` `#8a8f9a` 6 cd, tube 3, directly above the Conductor's aisle mark). All others dead with cold ends.
- Phases (existing `LastStopPhase`): `intro1` → `blackout` (all lights 0, 480 ms; `strike`-style flicker on return; `reduceFlashing` → hard cut to black and a 700 ms fade back) → `intro2` → `signReveal` (sign beam: a narrow `SpotLight` `#eef0f4` angle 0.15 onto the sign plate, the only cool-white in the scene) → `choice`.
- The Conductor is lit from directly above only; cap brim at an angle so the eyes sit in shadow (§6.8). His extended palm catches the brightest skin value in the scene.
- Window bleed off. The outside no longer exists.

---

## 4. Materials

### 4.1 Rules
1. **No external textures, ever, this phase.** ROADMAP rule 7. Every map is generated at load time from code, or authored by hand in this repo (SVG/canvas/glTF made by us). If rule 7 is later relaxed to admit CC0 sources, each file gets a line in `public/assets/LICENSES.md` (source URL, license, author; see §10.2) before it merges. Photo-sourced textures and "free for personal use" packs are banned outright.
2. **One shared noise atlas.** Generate once per session: a 512² RGBA8 `DataTexture` (1 MB), `RepeatWrapping`, mipmapped. Seed it from a constant, not `runSeed`, so surfaces look the same every run. Materials sample it at different scales and with different channel masks.
   - R: fBm value noise, 5 octaves (grime, albedo variation)
   - G: Worley F1 cellular (puddles, rust blooms, crazing)
   - B: directional scratch field, i.e. 1-D noise stretched 1:24 and rotated per cell (plexi, metal)
   - A: vertical grime gradient with drips (walls, panels)
3. **Wear lives where bodies touch** (P5). Every material declares a wear mask source:
   - `uvWear`: authored UV-space gradient, e.g. the seat dip
   - `heightBand`: world-Y band, e.g. hip height 0.8-1.1 m on walls and doors
   - `decal`: projected
4. **Triplanar** for any world-aligned mass without good UVs (concrete, platform, rebar, rock). **UV** for manufactured parts (seats, panels, signs). Triplanar costs 3 samples per channel, so don't use it on characters or on anything that appears more than 50 times on screen.
5. Implementation: `MeshStandardMaterial` + `onBeforeCompile` chunk injection, in one module (`src/render3d/materials/`). One factory per material below, and each factory caches its program by key. **Never** `MeshPhysicalMaterial` with `transmission` (it triggers an extra opaque pass). Use `clearcoat` only on high tier.
6. Albedo stays inside `#141519` to `#eef0f4`. Nothing is darker than charcoal or brighter than paper. Darkness belongs to lighting, not to albedo.

### 4.2 Material table

| Material | Albedo | Rough | Metal | Normal source | Wear rule | Three.js recipe |
|---|---|---|---|---|---|---|
| **Worn vinyl** (seats) | `#3b4a5a`, sit-dip `#4f5d6b` | 0.70; dip 0.35; seams 0.85 | 0 | Atlas R at 8× for pebble grain (strength 0.15); quilted seam lines via UV-space `smoothstep` on a 0.18 m grid (strength 0.6) | `uvWear`: elliptical dip at the seat center and top of the backrest. Cracks: atlas G thresholded at > 0.92, in the dip only, darkened to `#2a333d`. | UV material. Roughness = mix(0.7, 0.35, dipMask). Cracks also lift roughness to 0.9. The empty-seat trace (§7.10) is an extra normal decal. |
| **Scratched plexiglass** (window guards, timetable cover, map frames) | `#c9d4dc` at opacity 0.14 | 0.08 base; scratches 0.45 | 0 | None. The scratches are roughness-only, which is cheaper and reads better under point lights. | `heightBand` 0.9-1.5 m: scratch density ×3 where hands and bags hit. Crazing: atlas G edges near the frame. | `transparent: true`, `depthWrite: false`, rendered after opaques. Roughness from atlas B at 4× (anisotropic look without anisotropy). `envMap` = the scene's procedural PMREM (§4.4) at `envMapIntensity` 0.6. Old plexi: tint `#d8cfa8` (yellowing). |
| **Wet concrete** (platforms) | dry `#4a4844`, wet `#2b2a28` | dry 0.85, wet 0.18, puddle 0.04 | 0 | Triplanar atlas R at 2× (aggregate, strength 0.3); puddles flatten to 0 | Puddle mask = atlas G at 0.25× world scale, `smoothstep(0.55, 0.62)`, plus a low-lying bias toward the platform-edge drainage line. Wetness ramps 0→1 when rain is on. | Triplanar. Ripples: an analytic ring normal in puddles, driven by `uTime` and 6 hashed drop centers per 1 m cell (Kalyanpur only). Reflections per §4.3. Safety line: a separate strip mesh, `#c9a227` worn to `#8a7330` by atlas R. |
| **Station tile** (walls, arches) | white `#cfd2cc` / green `#4e6a52` / cream `#d9cfb4` | glaze 0.22, grout 0.9 | 0 | UV grid: tile 0.15 m, grout 4 mm bevelled (strength 0.5), per-tile ±1.5° tilt | Per-tile hash: ±3% value jitter, ±0.06 roughness jitter. Hash < 0.015 → chipped (grout-colored, rough 0.95). Grime: atlas A from the floor up to 0.6 m. | UV material with `tileId = floor(uv / 0.15)` → hash. Pattern presets as small int arrays (`checker`, `band`, `hometownArch`). The [UNLISTED] wrong-side chipped tile is an authored `tileId` override, not a hash. |
| **Rusted rail** | top `#9a9a98`, sides `#5a3a26`, foot `#3d2a1e` | top 0.25, sides 0.8 | top 1.0, sides 0.3 | Atlas G at 6× (rust bloom, strength 0.4) | Running-top polish band 5 cm wide. Blooms at sleeper contacts. | Rail profile `ExtrudeGeometry` along a `CatmullRomCurve3`, one merged mesh per track. Sleepers are `InstancedMesh` (concrete, 0.6 m pitch). Ballast: noise-displaced plane, no instancing. |
| **Carriage panel** (painted steel) | `#2a2d35`, lower band `#1f2228` | 0.55 | 0.2 | Atlas R at 1× (strength 0.08, faint orange-peel) | `heightBand` 0.8-1.1 m: scuffs into `#3a3d45` + roughness 0.4. Rivet rows are tiny normal bumps every 0.12 m on panel seams. | UV material. Window frames: `#1c1e24`, rough 0.4. |
| **Grab pole / handrails** | `#8e949c` | 0.5; hand zones 0.18 | 1.0 | none | `heightBand` 1.0-1.7 m polished bright. | `CylinderGeometry`, roughness from a world-Y band. |
| **Ribbed floor** | `#24221f` | 0.75 | 0 | Analytic ribs (sin across the aisle, 8 mm) | Aisle path smoother and lighter `#2c2a26`. Dirt at the seat feet. | UV material. |
| **Flickering signage** (light boxes, enamel boards) | enamel `#1d3b5c`, text `#eef0f4`; light-box face `#e8e4d6` | enamel 0.3 | 0 | none | Enamel chips: atlas G edges → `#3a3d45` steel showing. | Text drawn into a `CanvasTexture` with Special Elite / Courier Prime (OFL, self-hosted per §8.3). Await `document.fonts.load()` before drawing. The light box's `emissiveMap` is split into 2-3 vertical "tube zones", each with its own §3.3 curve, so a failing sign dims by halves the way real backlit boxes do. |
| **Departure board** (dot-matrix LED) | housing `#111116` | 0.6 | 0.2 | none | — | 128×16 logical dots in a shader (`fract(uv*grid)` circle mask). Lit dots `#e8a33a`, unlit dots `#2a1c0e`. Text is from a 5×7 bitmap font we author (an array in code). Each row's text can glitch per-dot. |
| **Paper** (tickets, notices, clues) | `#d6cdb8`, aged `#b8a888` | 0.9 | 0 | Atlas R at 12× fibers (0.1) | Edge darkening, foxing spots (atlas G > 0.95). | Canvas-drawn content. Damp edges are a darker multiply. |
| **Home wood paneling** | `#5a3c22` | 0.5 | 0 | Procedural grain: R-channel noise stretched 1:30 along the board axis | Polish where shoulders lean. | UV planks 0.12 m. After the reveal, the albedo multiplier drifts toward `#3a3226` (the warmth drains from the wood too). |
| **Home brass** | `#b08a4a` | 0.3 | 1.0 | none | Fingerprint smudge zone on the door handle (rough 0.6). | — |
| **Raw concrete + rebar** (Sector 0) | `#3e3d3a`, rebar `#5a3a26` | 0.9 | 0 / 0.4 | Triplanar atlas R at 1× with formwork lines every 0.6 m | Water stains from rebar ends (atlas A drips, rust tint). | Triplanar. Rebar is an `InstancedMesh` of bent cylinders. |

### 4.3 Wet reflections (the single most important "visual upgrade" signal)
- **High tier:** one `Reflector` (three/addons, MIT) at 0.5× resolution for the hero platform puddle zone only, clipped to the puddle mask in the concrete shader. Do not mirror the whole floor.
- **All tiers:** "lamp streaks". Each sodium or fluoro source spawns a vertical additive quad on the wet floor, stretched toward the camera, using the source color at 0.25 opacity and modulated by the puddle mask. This is the cheap trick that sells wet night streets, and it is mandatory.
- **Low tier:** no `Reflector`. Streaks plus `envMap` only.

### 4.4 Environment maps
No HDRIs. Each scene builds a tiny procedural env scene at load: a black box with 2-4 emissive cards in the scene's key colors (e.g. Kalyanpur: two `#d8a24a` cards up high, one `#7fa8c9` strip low). Run it through `PMREMGenerator` once into a 128² cube. Use it for plexi, brass and wet concrete. Regenerate only on scene change, never per frame. Home gets two: pre-reveal and curdled. Swap them at the reveal and crossfade with `envMapIntensity`.

### 4.5 Decals
- `DecalGeometry` (three/addons) for static, authored marks: handprints (Empty Platform anomaly), seat traces, water stains, the scratched-out station names (Sector 0 map). Bake decals at scene build and merge them per material. Never spawn them per frame.
- Decal textures are canvas-drawn alpha masks (handprint = 5 capsule SDFs plus noise). Albedo multiply and roughness override, no new normal maps, except the seat trace.
- Cap: 24 decal meshes per scene before merging, 1 draw call per decal material after merging.

---

## 5. Camera language

### 5.1 Principles
- **The camera is a passenger, not a cinematographer.** It moves the way a tired person's attention moves: slowly, with settle. Nothing whips, orbits or flies. Every camera move uses a critically damped spring (ω = 3.5-4.5 rad/s), never linear tweens.
- **Long lens for the 2.5D phase.** A narrow FOV flattens depth into the stage-like look we already have in the DOM, while still giving real parallax and real light falloff.
- **Composition reserve.** The dialogue box covers the bottom ~22% of the screen and the interaction prompt floats above its target. Subjects' eye lines sit at 38-45% from the top. Nothing important goes in the bottom 25% while dialogue can open.

### 5.2 Rail camera (2.5D, now through Wave E)

| Scene type | Camera | Vertical FOV | Height | Pitch | Rail behavior |
|---|---|---|---|---|---|
| Platform (prologue) / stations | Side-on, parallel to the platform edge, 6.5 m from the player line | 32° | 1.55 m | −4° | x follows the player with a spring and 0.6 s lag, clamped to the set's authored `[minX, maxX]`. Yaw ±6° max toward the current hotspot. |
| Carriage hub | Aisle dolly (the prototype's `RailCameraRig`): rail along the aisle, offset 0.12 m off-centre, heading down −Z toward the far door | 46° (prototype 50°; narrow it, see §11.4) | 1.55 m standing | −3.5° | Dolly speed 1.4 m/s with eased stops. Look-around ±6° yaw, ±3.5° pitch. When dialogue opens, yaw-ease toward the passenger's head over 900 ms and narrow FOV by 6° (a "lean in"), then hold. **The rail ends ≥ 1.4 m short of the Silent Passenger's bay** (§5.6). |
| Train arrival | Low, platform-edge looking up-track | 28° | 0.9 m | +2° | Static, except shake (§5.4). |
| Last Stop | Carriage axis, looking down the aisle at the Conductor (a new angle, used only here) | 30° | 1.35 m | 0° | Locked-off. The push-in during `signReveal` is the only move. |
| Endings | Per ending (§2.5). One slow move per ending, ≤ 0.15 m/s. | 28-34° | — | — | — |

- **Foreground layer.** Every station has 1-3 foreground occluders (pillar, bench end, canopy post) between camera and player. This adds real parallax for free and is the main thing that makes 2.5D read as 3D.
- **Horizon rule.** The platform edge line sits on the lower third (y ≈ 66% from top) at stations. The carriage window line sits at 30-35% from the top.
- **No roll**, except in breakLoop (max 2.5°, over 3 s) and in shake.

### 5.3 First-person camera (Wave H)
- Vertical FOV 62° (user setting 55-75). Standing eye 1.62 m, seated 1.18 m. Head-bob 1.2 cm vertical at a 1.8 Hz step, off when `screenShake` is off.
- Movement is slow: walk 1.3 m/s, no sprint (the train does not let you hurry). Turning is acceleration-limited to 140°/s on gamepad.
- **Look-at assists**, not lock-ons: when an inspect starts, ease the view 30% toward the object over 500 ms. The player keeps control.
- The rail-camera framing rules still govern authored moments. When a beat fires (the Empty Platform return, the Home reveal, the Last Stop), the camera blends to an authored pose over 700 ms. That's the one place first person gets taken over, and it must feel like your head turning because you heard something.

### 5.4 Shake

| Event | Amplitude (pos / rot) | Freq | Duration | `screenShake: false` fallback (Invariant 9: authored, never a skipped frame) |
|---|---|---|---|---|
| Train arrival `approaching` | 4 mm / 0.15° | 9 Hz | ramps over 4 s | Low-frequency rumble audio plus a 2% vignette pulse |
| Train arrival `entering` | 12 mm / 0.4° | 11 Hz | 1.5 s | Same, with the vignette at 4% |
| Carriage start/stop jolt (each trip) | 20 mm forward, single damped impulse | — | 0.6 s | Passengers and hanging straps sway; the camera stays still |
| Emergency beat (carriage) | 6 mm / 0.2° | 14 Hz | 0.8 s | Light pulse only |
| breakLoop "the train shudders" | 25 mm / 0.8°, plus roll 2.5° | 6 Hz | 2.5 s | Lights cascade alone. Exposure dips −0.3 EV. |

**Never shake** during readable text, at Home before the reveal, at the Empty Platform (stillness is the threat there), or under the Silent Passenger's lines.

Implementation: shake is a separate additive transform on a camera parent, using noise rather than random per frame, so it never fights the rail spring.

### 5.5 Cuts and transitions

| Transition | Grammar | Duration |
|---|---|---|
| Board / alight (scene change) | Fade through `#060608` (the existing `SceneTransition`), length by band per §2.3 | 600 / 900 / 1400 ms |
| Within-scene reveal (the train's silent return, Home curdles) | **No camera cut.** The light changes, the camera holds. The player must feel they didn't look away. | — |
| Dialogue open/close | Push in/out (§5.2) | 900 ms in, 600 ms out |
| Last Stop `blackout` | Hard cut to black: every light to 0 in one frame | 480 ms |
| breakLoop finale | Iris blackout (§7.9) | 2.2 s |
| Ending → menu | Fade to the ending's fog color, never to black (except breakLoop) | 1200 ms |

### 5.6 Keeping the Silent Passenger's face unseen (all cameras, all tiers)
This rule is layered. Each layer alone should be enough, and together they're bulletproof.
1. **Don't build it.** The Silent Passenger's head mesh has no face geometry. Inside the hood is a concave volume shaded with an unlit `#060608` material plus a fog term, so even an unlit debug view shows nothing. Future artists: the model ships *without* a face. This is non-negotiable in the asset spec (§6.7).
2. **Costume occlusion.** The hood brim (or cap brim, per skin) extends 9 cm past the brow at a 25° downward angle. From any eye position above 1.0 m and outside a 0.6 m radius, the brim occludes the eye line. They sit in the bay-4 window seat (§6.2), with the player's own seat 6 beside them on the aisle, so the only approach is from the aisle side or from above. The 2.5D aisle rail ends ≥ 1.4 m short of bay 4. The first-person controller clamps eye height to ≥ 1.1 m within 2 m of them and blocks the knee gap of their bay, so the player can't get under the brim.
3. **Light.** Their key is top-down only, at cap-brim angle. No fill reaches inside the hood: `envMapIntensity` 0 on hood-interior faces, and no rim on the face plane.
4. **Gaze avoidance (first person).** If the camera's forward vector comes within 18° of their head at under 3.5 m for more than 0.4 s, the head turns away 12-20° and holds. The turn only advances while their head sits outside the central 10° of the view, and it freezes whenever you look straight at them. So it is never seen as motion, only as a result. This is the "you can't remember which direction that was last time" tell, made mechanical.
5. **The scripted turn** (`minTrip: 6`, "they turn to look at you directly"): play it as an over-the-shoulder from behind and above the Silent Passenger, toward the player's seat. We see their hood turn from behind, and the player's own face is never shown either. On breakLoop "they stop in front of you", the frame goes to iris before their head clears the brim shadow, and the line plays over black.
6. **QA check:** an automated capture from 64 sampled camera poses around their seat, at standing and seated heights, asserting that face-region pixel luminance is ≤ `#0a0a0e` (§9.6).

## 6. Character design

Lore sources: `src/data/passengers.ts` (canon) plus the two drafts in `docs/drafts/`. Names, backstory props and the loop rules below are **[lore-pending]** until `docs/STORY_BIBLE.md` lands. Where the drafts disagree, this section chooses the option that is safest visually and says so.

### 6.1 Rules for every character
- **Proportion and style:** grounded realism. 7.5 heads tall, no stylized exaggeration, mid-poly. Think of a stage play lit by fluorescent tubes: readable shapes, restrained detail, and the wrongness carried by behavior rather than anatomy.
- **Era:** clothing is era-ambiguous. It reads as the 1990s or now in a South Asian city, never period costume. No brands and no logos.
- **Faces:** low-detail. Every passenger's default key light comes from above, so eye sockets sit in shadow. **Nobody's mouth ever moves.** Dialogue is text only, there's no lip sync, and nobody has visible "talking" animation. That stillness is itself a tell.
- **Silhouette test:** each passenger must be identifiable at 64 px tall, flat black, desaturated. §6.10 automates this.
- **Train-motion coupling is a character trait.** Living-seeming passengers take `TrainMotion` sway at their posture's `swayCoupling` (§6.10). The Silent Passenger and the Conductor take **none**: they are of the train, not on it. Everyone else in the car moves and they don't, and that should register before the player can say why.
- **Reflections show the riders' version** ([both] drafts). Each passenger has a mirrored reflection proxy outside the window glass (§7.4). The proxy can hold a *different* state from the passenger: the child still held, the vanished passenger still seated. The Silent Passenger has **no reflection proxy** at all; their place in the glass is an empty seat. (This follows [D]. [L]'s "the back of a head even when facing you" is the fallback if the story bible picks it.)

### 6.2 Seating map (3D carriage, `layout.ts` bays)

| Plate | Passenger | Bay | Side | Facing | Seat | Notes |
|---|---|---|---|---|---|---|
| 1 | Old Man | 0 | +x | +z (toward the camera's start) | aisle | The window seat beside him is the only seat in the car with **zero wear** (P5). Nobody has sat there in decades. **[lore-pending]** It is kept for Sarla. |
| 2 | Woman | 1 | −x | +z | aisle | Moves to the window seat if `comfortedWoman`, leaving the aisle seat for you. |
| 3 | Businessman | 2 | +x | +z | aisle | Vanish candidate. |
| 4 | Student | 3 | −x | +z | window | Her head rests against the glass. Vanish candidate. |
| 5 | Silent Passenger | 4 | +x | **alternates per visit** (−z / +z) | window | Never seen turning. Their facing changes only across scene cuts, which is what "you can't remember which direction that was last time" means. |
| 6 | You / the sixth passenger | 4 | +x | −z (fixed) | aisle | Beside plate 5 when they face −z, and directly opposite when they face +z. **Seat 6's plate is newer than the others.** It is brighter brass, with 3 sets of old screw holes around it (§4 decal). |

### 6.3 The Old Man (plate 1) — **[lore-pending]** Govind Rao, "the first rider"
- **Silhouette:** a question mark. C-curve spine, head 12 cm forward of his shoulders, narrow sloping shoulders. Standing height 1.66 m; seated head-top 1.16 m.
- **Posture preset:** `hunched`. Spine curve 0.7, head pitch −14°, sway coupling 0.8 with a **0.3 s lag**, so he moves a beat late (P3).
- **Costume:**
  - Ash-brown knit sleeveless sweater `#5b5249` over a full-sleeve off-white shirt `#cfc6b4`, buttoned to the collar.
  - Loose grey trousers `#4a4540`, black leather sandals over grey socks.
  - **Bareheaded.** Thin white hair carries a pressed ring where a cap used to sit, to support [D]'s gesture of touching a cap he isn't wearing.
- **Props:**
  - A dark wood cane `#3a2a1e` with a rubber tip, held through trip 4.
  - A ticket-stub corner showing from his breast pocket (`mat.paper`).
  - A folded handkerchief.
- **Idle:**
  - Breathes 10 times a minute.
  - His thumb strokes the cane handle in a 6 s loop.
  - Every 40-70 s he glances at the window, never at the empty seat beside him.
- **Wrongness tells, by trip:**
  - His head yaw turns 6° further toward the player every trip and reaches full-on at his `oldManRevealed` stage.
  - From trip 5 the cane leans against the window, unheld, and his hands migrate to the **rider pose**: folded in the lap, right over left. It's the Silent Passenger's pose, and the one the stayOn ending gives the player.
  - At his reveal, the eyes are shaded with the window-glass material: pale `#8fa3b0` with a live env reflection ("the same color as the window glass"). Before that stage, his eyes stay in brow shadow.
- **Prompt:** *"Elderly South Asian man, about 75, slight and hunched with a deep forward curve of the spine, seated on a worn blue-grey vinyl train bench. Ash-brown knit sleeveless sweater over a buttoned-up off-white full-sleeve shirt, loose grey trousers, black leather sandals with grey socks. Bareheaded, thin white hair with a faint pressed ring where a cap once sat. Both hands rest on a plain dark-wood walking cane. A paper ticket stub peeks from the shirt pocket. Realistic proportions, mid-poly game asset, PBR materials, neutral expression, eyes downcast. No logos. Deliver a T-pose and a seated pose."*

### 6.4 The Woman (plate 2) — **[lore-pending]** Meera
- **Silhouette:** a closed oval. Shoulders rounded inward, arms forming a ring at chest height, head bowed toward the ring.
- **Posture preset:** `holding`. Head pitch −20°, arm ring locked. Sway coupling 1.0, phase-locked to the clatter.
- **Costume:**
  - Faded maroon cotton salwar kameez `#6a2f36`.
  - A worn cream-beige shawl `#b9a48c` wrapped around her shoulders and **folded into a sling for the child**.
  - Hair in a loose low bun with escaped strands. Thin glass bangles on the left wrist, one of them cracked.
- **The child:** a swaddled bundle that is part of the shawl's geometry, face hidden in the fold. It is never a separate rigged character.
  - **When `childGone` is set, the sling keeps its curved, holding shape and is empty.** Do not flatten it or hide the shawl; hide only the bundle mesh. "Her arms are still curved the same way."
- **Idle:**
  - She rocks 3 cm forward and back, phase-locked to `TrainMotion.clatterCount` (one rock per joint pair).
  - Her thumb strokes the fold.
- **Wrongness tells:**
  - At stage 2, the child's reflection proxy is frozen while the real bundle moves.
  - After `childGone`, the rocking drifts off the clatter beat by +7% a cycle, never re-syncing, while her reflection proxy keeps rocking **in sync, still holding the child**.
  - `comfortedWoman`: she slides to the window seat and her shoulders open 10°. Warm ambience shift (§7.12).
  - `avoidedWoman`: her torso turns 30° toward the window, her back to the aisle. Cold ambience shift.
- **Prompt:** *"South Asian woman, about 30, seated on a train bench, shoulders rounded and head bowed over her arms, which cradle a small swaddled infant held in the fold of a worn cream-beige cotton shawl. Faded maroon cotton salwar kameez, hair in a loose low bun with stray strands, thin glass bangles on the left wrist. The infant's face is hidden inside the shawl fold. Build the shawl sling as a rigid, curved shape that keeps its form with the infant mesh removed. Realistic proportions, mid-poly PBR, tired neutral expression. No logos."*

### 6.5 The Businessman (plate 3) — **[lore-pending]** Vikram Sethi
- **Silhouette:** a rectangle. Squared shoulders, vertical spine, **2 cm clear of the backrest**: he never settles, always about to stand. Briefcase upright on his knees.
- **Posture preset:** `rigid`. Spine 0.05, head pitch −5°, sway coupling 0.5, so he resists the train.
- **Costume:**
  - Charcoal wool suit `#3a3d42`, too heavy for the weather, jacket buttoned.
  - Pale grey-blue shirt `#9aa3ad`, dark tie `#2a2d35` loosened 4 cm with a thin dull stripe.
  - Polished black oxfords, with dried mud on one heel.
- **Props:**
  - A steel wristwatch on his left wrist, face stuck at **2:17** (canvas-texture dial).
  - A hard-shell leather briefcase `#2a1e16`, needed by both drafts.
- **Idle:** a watch check every 7-11 s, cosmetic and unseeded: wrist up over 0.5 s, a 1.2 s look, then down.
- **Wrongness tells:**
  - The interval between checks shrinks to 3 s by trip 4.
  - [D]: he checks his watch whenever the journal opens.
  - From trip 5, if he isn't the vanisher, he is **standing at the door** every time you enter.
  - Exhausted state: his arm is extended with the watch face turned to you.
- **Prompt:** *"South Asian man, about 40, seated bolt upright on the front edge of a train bench, not touching the backrest. Charcoal wool two-piece suit, jacket buttoned, pale grey-blue shirt, dark tie loosened at the collar, polished black oxford shoes with dried mud on one heel. A hard-shell dark leather briefcase rests upright on his knees under both hands. A steel wristwatch on the left wrist. Realistic proportions, mid-poly PBR, tense neutral expression. No logos or brand marks. Deliver a seated pose and a standing pose by a door."*

### 6.6 The Student (plate 4) — **[lore-pending]** Tanvi
- **Silhouette:** a collapsed triangle. Slumped low in the seat, knees high, head tilted against the window glass, one elbow up at the ear.
- **Posture preset:** `slouch`. Spine 0.4 reversed (pelvis forward), head roll +14° toward the glass, sway coupling 1.0 (fully passive, like someone asleep).
- **Costume:**
  - Mustard-ochre hoodie `#9c7a2a`, hood down, sleeves pushed up.
  - Dark slate jeans `#2f3a45`.
  - Off-white canvas sneakers, one with its laces untied.
- **Props:**
  - Large over-ear **wired** headphones with foam pads. **The cable ends in a bare jack plugged into nothing**, dangling at her hip ([both]).
  - A phone face-down on her thigh. Its screen text is **[lore-pending]**: "1 VOICEMAIL. MAA. 11:52 PM." [D] or "1 VOICEMAIL. Unplayed." [L].
  - A backpack between her feet.
- **Idle:**
  - Her breath fogs the glass by her face: a decal that pulses at 14 breaths a minute.
  - Her foot taps the clatter beat.
- **Wrongness tells:**
  - The tap drifts off-beat from trip 3. **By trip 6 she taps once on every player input** (key or click), which makes the player complicit.
  - From trip 5 her breath-fog decal stops appearing. Nobody will consciously notice; somebody will feel it.
  - From her stage 3, her arm holds a headphone out on every visit until you take it.
  - If she vanishes, the headphones lie on the seat with the cable coiled (audio: hiss).
- **Prompt:** *"South Asian woman, about 20, slumped low on a train bench with knees raised and her head resting against the window, eyes closed. Mustard-ochre hoodie with the hood down and sleeves pushed up, dark slate jeans, off-white canvas sneakers with one lace untied. Large over-ear wired headphones with foam pads; the cable ends in a loose, unplugged jack at her hip. A phone lies face-down on her thigh, and a backpack sits between her feet. Realistic proportions, mid-poly PBR. No logos."*

### 6.7 The Silent Passenger (plate 5)
- **Silhouette:** a still, narrow vertical column. Level shoulders, plumb spine, head bowed 8°, hood up. It is the only perfectly symmetrical silhouette in the cast.
- **Posture preset:** `still`. Sway coupling **0**, breathing **0**, no idle at all. Hands folded in the lap, right over left: the rider pose.
- **Costume (base skin):**
  - Long dark coat `#141519`, buttoned to the throat, with a **deep stiff hood**. The brim extends 9 cm past the brow at a 25° downward angle.
  - Trousers `#2a2d35`. Plain dark shoes.
  - The hands are the only light value on the figure, at `#8a8076`.
  - Skins may swap the hood for a brimmed cap with the same brim spec.
- **[L] "their shoes are wet":** wet-sheen shoes (roughness 0.1) and a small dark wet decal on the floor beneath them. It's the one clue that they once got off somewhere, and it costs nothing.
- **Face:** **not modeled.** The asset ships with a concave hood interior and an unlit `#060608` volume (§5.6, layers 1-3). Any vendor or AI-generated mesh that includes a face is rejected at import (§10.4 lint).
- **Wrongness tells:**
  - No sway while the window frame behind them sways.
  - No reflection.
  - Facing alternates between visits.
  - The gaze-avoidance head turn in first person (§5.6.4).
  - Their head tilt toward the vanished passenger's seat (the guide's §6.6 payoff) is the only motion they ever make on screen. It's 6° over 3 s, while dialogue is up.
- **Scripted moments:** `silentPassengerSpoke` ("turns to look at you directly") and breakLoop ("they cross the aisle", "they stop in front of you") follow §5.6.5. For the breakLoop walk, their gait is the Sector 0 footstep cadence ([both]), half a beat behind the audio.
- **Prompt:** *"A seated figure of indeterminate age and gender in a long, plain, near-black wool coat buttoned to the throat, with a deep, stiff hood pulled forward so its brim projects well past the brow. Perfectly upright and symmetrical posture, head slightly bowed, pale bare hands folded in the lap with the right over the left. Plain dark trousers and shoes. IMPORTANT: no face, head or facial geometry inside the hood. The hood interior is an empty, concave, dark cavity. Realistic proportions, mid-poly PBR. No logos."*

### 6.8 The Conductor — **[lore-pending]** Guard D. Pillai, M.C.R.
- **Silhouette:** a tall, narrow, peaked shape. 1.88 m standing, long greatcoat flaring slightly below the knee, peaked cap, and one arm extended forward with the palm up. It is the only silhouette in the game with an arm extended toward the player.
- **Posture preset:** `attendant`. Heels together, weight perfectly even, spine plumb, head pitch −6°, sway coupling **0**. He shares the no-sway tell with the Silent Passenger.
- **Costume:**
  - Navy serge greatcoat `#1c2433`, knee-length, with a **double row of 7 brass buttons** `#b08a4a` (one per station; count them at LOD0).
  - Peaked guard's cap with a black patent brim. Its cap badge is **worn smooth and unreadable**: shape only, no letters. This follows [D]'s ban on showing his name; [L]'s "M.C.R." lives on the Sector 0 screws instead.
  - Dark trousers, black boots.
- **Props:**
  - A ticket punch on a short chain at his belt.
  - A cloth-bound black ledger with a red ribbon `#7a1515` under his left arm. **[lore-pending]** The ink inside is brown.
  - A whistle on a lanyard, never used.
- **Face:** present but always cut by the brim shadow at the cheekbone. We show his jaw, never his eyes. His extended bare palm is the brightest skin value in the Last Stop (§3.9).
- **Idle:** none, except that every ~20 s the extended fingers relax 5° and re-straighten. He waits forever.
- **Trip 4 glimpse:** a back view only, walking away through the far gangway-door window, for 3 s ([both]). It uses the LOD1 mesh with no face.
- **Prompt:** *"A tall, thin railway guard, about 60, in a navy serge knee-length greatcoat with a double row of seven brass buttons, a peaked uniform cap with a black patent brim and a worn-smooth blank cap badge, dark trousers and black boots. A ticket punch hangs on a chain at the belt, a whistle on a lanyard, and a black cloth-bound ledger with a red ribbon is tucked under the left arm. He stands perfectly still with heels together, right arm extended forward, palm up, waiting. The brim shades his eyes completely. Realistic proportions, mid-poly PBR, patient neutral expression. No real railway insignia or logos."*

### 6.9 Secondary figures
| Figure | Design |
|---|---|
| **The Empty Platform figure** | Not a bespoke character but a *silhouette slot*. On a first run it uses the Commuter base body in a generic long coat, arms at its sides, head tilted 4°, with no face (same rule as plate 5). **[lore-pending]** After getOff runs it carries the player's previous skin silhouette and `coatColor`. It never animates on screen; it is only repositioned while unobserved (camera yaw away > 25°, or dialogue up). Always LOD2, fog-eaten, ≥ 18 m away until the authored "closer now" step (12 m). |
| **The sixth passenger** (after stayOn) **[lore-pending]** | The previous run's player skin, seated in the aisle seat beside the most-attended passenger (guide §6.5 seat loyalty). If that passenger is the Old Man, it sits *opposite* him: the empty seat beside him is never filled. Head bowed 8°, rider pose, sway coupling 0.2, palette aged one step (§6.10). |
| **The Night Nurse** **[lore-pending, Wave F]** | Faded pale-blue nursing uniform `#a9b4b8`, navy cardigan `#1c2433`, a fob watch pinned upside down reading 2:17, and an ID lanyard with a blank card. She enters from the next carriage and never looks at seat 2. Posture `rigid`, eyes always to the floor. |
| **Background riders** (next carriage, through the gangway window) **[lore-pending]** | Fully aged skins (§6.10, age 4). Flat-lit silhouettes at LOD2, all in the rider pose, uncountable. Instanced, max 12. |

### 6.10 Skins and reincarnation framework

**What a skin is.** It is data, not a mesh. Proposed `src/data/skins.ts` (Wave G):

```ts
interface SkinDef {
  id: string;                      // 'commuter.longcoat.ash'
  archetype: 'oldMan' | 'woman' | 'businessman' | 'student' | 'silent' | 'conductor' | 'commuter';
  baseBody: 'bodyTall' | 'bodyAverage' | 'bodySlight' | 'bodyHeavy'; // all on skeleton 'ltr_humanoid_v1'
  layers: { slot: 'base' | 'mid' | 'outer' | 'head' | 'feet'; mesh: string; colorRole: 'primary' | 'secondary' | 'accent' }[];
  palette: { primary: string; secondary: string; accent: string; skinTone: string };
  props: { id: string; socket: 'hand_l' | 'hand_r' | 'lap' | 'seat' | 'pocket' | 'ear' | 'wrist_l' | 'back'; mesh: string }[];
  posture: { preset: PosturePreset; spineCurve: number; headPitch: number; headYaw: number; shoulderDrop: number;
             hands: 'free' | 'cane' | 'cradle' | 'briefcase' | 'ear' | 'folded' | 'palmOut'; swayCoupling: number; swayLag: number };
  wear: 0 | 1 | 2 | 3 | 4;         // age level, §6.10 "aging"
}
```

- **One skeleton for everyone** (`ltr_humanoid_v1`, 52 bones, with sockets as named bones). Base bodies are blend-shape variants of one topology, so every costume layer fits every body. Costume layers are skinned meshes bound to the same skeleton. Three.js `SkinnedMesh` instances can share the skeleton (§9).
- **Posture presets** (`hunched`, `holding`, `rigid`, `slouch`, `still`, `attendant`, `rider`) are additive bone offsets on top of a single seated base pose. They are not separate animations, so any skin can wear any posture.
- **Player skins** come from a pool of base body × outer layer × `coatColor` × carried item ([L]: umbrella, satchel, tiffin carrier, none):
  - Outer layers: long overcoat, short jacket, shawl wrap, raincoat.
  - `coatColor` palette, desaturated only: `#3d3a36` `#4a4f55` `#5a4636` `#2f3b33` `#4b3a40` `#5e5a50` `#2a3140` `#6a5d48`.
  - The skin is resolved once per run in `startNewGame()` from `rngFor(runSeed, 'skin')`. **It is structural** (guide §0): the sixth passenger, the figure and the [UNLISTED] shop sign read it. So it's seeded and persisted, never re-rolled per render.

**How skins carry across loops.** Following both drafts, with the visual channel each one uses:

| Ending of run N | Player skin in run N+1 | Where run N's skin goes | Visual channel |
|---|---|---|---|
| `getOff` | **Same skin** | The Empty Platform figure (silhouette + `coatColor`). A figure in your coat walks up the Platform 4 stairs as you board. One more coin at the platform edge. | Silhouette slot, coin decal count |
| `stayOn` | **New skin** | The sixth passenger, seated beside your most-attended passenger | Full skin, aged +1 |
| `breakLoop` | **New skin** | The Silent Passenger. They inherit `coatColor` (both drafts agree); the coat silhouette is also inherited per [D], or withheld per [L], **[lore-pending]**. The face rule is absolute either way. The previous Silent Passenger skin is retired for good ("goes out into 2:18"). | Plate-5 skin swap, from trip 1 facing you |

**Aging (the mutation rule).** A carried skin ages one `wear` step per loop it survives:
- palette saturation −15%;
- value toward `#4a4844` by 8%;
- surface wear level +1 (fade, pilling, scuffs at the sockets);
- posture lerps 20% toward `rider`;
- `swayCoupling` lerps 20% toward 0.

At wear 4 the skin has become a background rider in the next carriage. It is no longer individually recognizable, which is the point. **People wear smooth, like the Conductor's badge.**

**Fixed channels: what never changes, so the five passengers stay recognizable.** Any cosmetic per-run variation of a passenger (Wave G may seed small variants) touches only the *free* channels.

| Fixed (identity contract) | Free (may vary per run or loop) |
|---|---|
| Silhouette class and posture preset | Secondary garment colors within ±12° hue / ±10% value of the anchor |
| Hue-anchor family (§2.2 table) | Small accessories (bangles, keychain, pen in pocket) |
| Signature prop: cane→stub, sling, watch + briefcase, headphones + jack, hood/brim, palm + ledger | Prop wear and minor model variant (e.g. a different headphone shape) |
| Seat plate / bay | Hair detail, garment cut (collar, sleeve length) |
| Idle signature: late sway, clatter-rocking, watch check, foot tap, total stillness | `wear` level |
| The face rule (plate 5) and the no-mouth-motion rule (everyone) | — |

**Recognizability gate** (CI, Wave G): render each passenger variant as a flat-black silhouette at 64 px tall from the rail camera's standard angle, and compare the IoU against the canonical silhouette. The variant must score ≥ 0.85, and must stay ≤ 0.6 IoU against every *other* passenger.

## 7. VFX list

Budgets are GPU time on the **reference integrated GPU** (Intel Iris Xe, 1920×1080, pixel ratio 1.0, high tier) and on the floor device (Intel UHD 620, 1280×720 render, low tier). See §9. "DC" means draw calls. Every effect must have a `reduceFlashing` or `screenShake` fallback where relevant (Invariant 9), and **no effect may produce more than 3 full-field flashes per second in any mode** (WCAG 2.3.1).

| # | Effect | Intent | Implementation | High tier | Low tier |
|---|---|---|---|---|---|
| 7.1 | **Rain** | The ordinary night (P1). It is heaviest at Kalyanpur and the opening, and absent from the severe band: the world gets quieter as it gets worse. | One `InstancedMesh` of camera-facing streak quads (4 cm × 0.5-0.9 m), animated fully in the vertex shader (`fract(y − t·v)`) inside a camera-relative 30×14×24 m wrapping box. No CPU work per frame. Streak alpha is ×3 inside the sodium spot cones (cone test against 2 uniform cones in the vertex shader), so rain is only really visible where lit. Splashes: 64 instanced ring sprites on the platform plane. Puddle ripples are in the concrete shader (§4.2). | 6000 streaks, 2 DC, ≤ 0.6 ms | 1500 streaks, no splashes, 1 DC, ≤ 0.2 ms |
| 7.2 | **Fog** | Hides the edges of the world and grades the band (§2.3). | Built-in `FogExp2`, which is free. Ground mist: 6 large horizontal planes 0.1-0.6 m high, atlas-R noise scrolling at 0.03 m/s, alpha 0.05-0.12, `depthWrite: false`. **Light cones:** open cone meshes under each spot, with a fresnel × height falloff and additive blending, `depthWrite: false`. They are placed so they never intersect geometry, which avoids needing a depth texture. | 6 mist planes plus ≤ 4 cones, ≤ 0.5 ms | 3 mist planes, cones kept (they carry the look), ≤ 0.25 ms |
| 7.3 | **Dust** | "The air is old." Visible only in light, never in darkness. | `Points` with a custom shader: size attenuation, soft disc, and alpha multiplied by a light-cone and fixture-proximity mask (uniform arrays), so motes appear only in beams. Brownian drift plus a slow sink. In the carriage the motes are pushed by `TrainMotion.swayX`. | 400 points, 1 DC, ≤ 0.15 ms | 150 points |
| 7.4 | **Window streaks, passing lights, reflections** | The outside is moving, unseen and wrong. Reflections are the "riders' version" (§6.1, P3). | **Glass:** one window material with atlas-B rivulets drifting diagonally at the train's speed, plus a condensation band at the bottom 15%. **Outside:** black (`#060608`), with passing lamps drawn *inside the window shader* on virtual parallax planes. The prototype's `WindowMaterial` already does this in one draw call, which is the right call and better than geometry cards. Each sodium sweep (`setSodium`) is matched by **one** reused moving `PointLight` inside the car (4 cd, `#d8a24a`), because the lamps should light faces as they pass. Interval is 2.5-6 s (cosmetic `Math.random`). **Reflections:** mirrored, low-LOD passenger proxies placed *outside* the window plane at mirror positions, with darkened unlit-ish material at 18-25% opacity. The car wall hides them naturally except through the glass, so no stencil or extra pass is needed. Proxies take poses from a 6-10 frame delayed pose buffer, and can hold divergent state (§6.4, §6.5). There is no proxy for plate 5. | 1 window material (1 DC), 5 proxies at LOD2, ≤ 0.4 ms | No rivulets (static condensation only), far parallax plane only, proxies kept at LOD2 with no pose delay, ≤ 0.2 ms |
| 7.5 | **Flicker / light failure** | The clock of the night (P2). | CPU: the curves in §3.3 drive `light.intensity` and `emissiveIntensity`. No GPU cost. **The light count never changes.** `reduceFlashing`: every curve is clamped to a minimum of 0.6, transitions are ≥ 250 ms, frequency ≤ 2 Hz, and `death` becomes a 1.5 s fade. | 0 ms | 0 ms |
| 7.6 | **Lightning** | A single, deniable flash of the full scene: at Kalyanpur, on arrival, and the title. Never in the severe band. | `lightning` curve on the window/sky `DirectionalLight` (`#c8d8ea`, up to 3.5 lux) plus a sky-card emissive spike. Thunder is 1.5-4 s later (audio). The flash doesn't need its own shadow map; the static shadow is fine. `reduceFlashing`: 0.8 lux max, a 400 ms ramp up and down, no double-strike. | 0.05 ms | Same |
| 7.7 | **Train vanish and return** (Empty Platform) | The train was never there, and then it is, silently, over no tracks. | **Arrival:** the scene opens with no train and no tracks (§3.7). **Return** (fixed timing, existing `triggerReveal`): the train material gets a `uManifest` 0→1 over 1600 ms, eased with `--ease-cinematic`. It drives a blue-noise **dithered** alpha, which avoids transparency sorting on a 20 m mesh, and a per-material fog override going from fully fogged to normal. At the same time the train slides 0.4 m laterally, matching the DOM's 40 px. Windows light **last**, at t = 1200 ms, with the `strike` curve. No headlight and no motion blur. The stinger is the only sound. `reduceFlashing`: windows fade in over 600 ms instead of striking. | 1 extra uniform, ≤ 0.1 ms | Same |
| 7.8 | **The void beyond the tracks** (Home) | The tracks simply stop. The edge of the world is absence, not a cliff. | A global `uVoidPlane` (`vec4`) is injected into **all** Home materials via `onBeforeCompile`. Fragments past the plane blend to `#000000` over 2 m, with atlas-R noise on the boundary so the edge breathes (0.1 Hz). Rails and sleepers continue into it and dissolve. Lights past the plane are zeroed. **Reveal:** the plane advances 3 m toward the platform over 1800 ms, the void's frame coverage grows 38% → 55% (keeping today's proportions), and §3.8's curdle runs in parallel. No randomization (guide §7). | ≤ 0.1 ms (ALU only) | Same |
| 7.9 | **Iris blackout** | The game's only true ending of sight. Reserved for breakLoop: the circle closes on the darkness under the Silent Passenger's hood, so the last thing you see is the absence of a face becoming everything. | Uniforms in the FinalFx pass (`uIrisCenter` = the hood's projected screen position, `uIrisRadius`, `uIrisSoftness` 0.02). It closes in 2.2 s on an ease-in curve that accelerates. A 2 px `#ff4b4b` bleed rides the edge for the first 70%. The closed state is pure `#000000` (one of three permitted). It is not a flash, so it needs no `reduceFlashing` change. | 0 ms (folded into FinalFx) | Same |
| 7.10 | **Empty-seat trace** (vanished passenger, Last Stop seats) | "Someone was here." It must look **identical** for the Businessman and the Student (guide §7). | A normal-plus-roughness decal of body compression on the cushion and backrest. Dust motes settle at 0.3× speed over that seat only. The fixture above dims 10% (a cosmetic multiplier, not a death). The left-behind prop (briefcase or headphones, **[lore-pending]**) is the only identity difference. | 1 decal, 0 ms | Same |
| 7.11 | **Film layer** (FinalFx) | The lens of a tired eye. It should be subtle enough that you only miss it when it's gone. | The existing `FinalFxShader` handles barrel, edge chromatic aberration, vignette, grain and lift. **Add** `uSaturation`, `uExposureOffset`, `uTint` and the iris uniforms, so the band grade (§2.3) and choice tells live in one pass. Do not add separate passes. | ≤ 0.4 ms | ≤ 0.25 ms (grain + vignette + grade only) |
| 7.12 | **Choice tell** | Makes the player feel the fork (guide §7). | A 500 ms saturation dip (×0.6 and back) on choice commit. `comfortedWoman` shifts the hemisphere sky +300 K warmer and `avoidedWoman` shifts it −300 K colder for the rest of the scene. | 0 ms | 0 ms |
| 7.13 | **Tier-2 hotspot marker** | "There's more here," without loot-glow (guide §7). | A 40-mote dust emitter whose drift field flows toward the hotspot. It is visible only in light. At Sector 0 it trails toward `followFootsteps`. | ≤ 0.05 ms | Same |
| 7.14 | **Emergency pulse** | Betrayal (Home) and alarm (carriage). | A pre-placed red `PointLight` plus housing emissive, with the 0.6/0.9 s pulse from §3.2 (3 pulses). `reduceFlashing`: one 1.8 s swell to 30%. Replaces `RedEmergencyOverlay` in 3D scenes. | 0 ms | 0 ms |

**Total VFX envelope:** ≤ 2.4 ms on high tier, ≤ 1.2 ms on low tier, at the worst scene (Kalyanpur: rain, fog, dust, lamps and streaks together).

---

## 8. UI and typography

### 8.1 Three UI layers

| Layer | Lives in | Rule | Examples |
|---|---|---|---|
| **World** | WebGL, as textures on meshes | If it exists in the fiction, it's in the world, never a DOM overlay | Station enamel signs, the dot-matrix departure board, clocks (2:17; both drafts drop the number from Home's clock, **[lore-pending]**), the carriage route map, seat plates, notices and posters, the watch dial |
| **Paper** | DOM, styled as print and paper | Anything held in the hand: menus, clues, ending text. It reads as railway paper. | Title menu, pause, journal/clues, ending cards, choices |
| **System** | DOM, plain | Settings, accessibility and debug. Neutral and always legible, never themed into illegibility. | Settings panel, quality toggle, FPS/dev HUD |

### 8.2 Tickets are the menu language
- **Title:** the menu is a single **ticket**: `#d6cdb8` paper, a Special Elite header reading "M.C.R." **[lore-pending]**, and "PLATFORM 4 · 2:17 AM · SINGLE". Menu options are printed fare lines: *BEGIN JOURNEY / CONTINUE / SETTINGS*. The selected line gets a punched-hole glyph instead of a highlight bar.
- **Pause:** the same ticket, now punched once. Each trip adds a punch hole along the edge, so the pause menu shows how far in you are.
- **Journal / clues:** a conductor's ledger spread. Each clue is a pasted slip (ticket stub, clipping, receipt) using the clue's own paper type. Tier-2 bonus clues are slips *without* a printed border, so a careful player sees they're different.
- **Choices** (Tier 1/2, Last Stop): printed fare options, matching the existing `.laststop-choice-button`. The brake choice keeps its danger border `#b23a3a`.
- **Dialogue box:** stays a dark strip (`rgba(8,8,11,0.88)`, the current style). It is the voice, not paper. Speaker label in caps, `--color-text-dim`, tracking 0.16em. The Silent Passenger's label is "?" in `--color-text-bright` with no trailing colon.

### 8.3 Typography

| Use | Face | Size | Notes |
|---|---|---|---|
| Display, signage, tickets, titles | **Special Elite** (OFL) | 20-48 px, tracking 0.08-0.16em, caps | Already loaded |
| Body, dialogue, clue text | **Courier Prime** (OFL) 400/700 | `clamp(16px, 0.6vw + 11px, 22px)`, line-height 1.5, max 62ch | Never below 16 px |
| Dot-matrix board | Custom 5×7 bitmap (authored in code) | 16 px rows | No font license involved |
| Enamel signs | Special Elite rasterized into a `CanvasTexture`, 1024×256 per sign | — | Text `#eef0f4` on `#1d3b5c` |

- **Self-host both fonts** in `public/fonts/` with `OFL.txt`, instead of the Google Fonts `@import` in `global.css`. That `@import` breaks offline PWA play, and WebGL canvas text needs the faces guaranteed loaded (`document.fonts.load('20px "Special Elite"')` before drawing any sign texture).
- Every in-world sign that carries a clue or required text (the timetable's "DEPARTURE — NEVER", the billboard) must **also** reach the DOM through the dialogue box on inspect, plus a visually-hidden `aria-live` mirror. Text never lives in WebGL alone.
- The Empty Platform has `signText: ''`. Render the **frame** of the enamel sign with a blank plate, not no sign at all.

### 8.4 DOM over WebGL
- **Stacking**, with one `position: absolute` root above the canvas: canvas `z 0` → world-anchored prompts `z 10` → dialogue `z 20` → choices `z 25` → `SceneTransition` veil `z 30` → pause/settings `z 40` → dev HUD `z 50`.
- **World-anchored prompts:** each hotspot has a world `Vector3` anchor. Every frame, project it (`vector.project(camera)`) and write `transform: translate3d()` to a pooled DOM node. Hide the prompt when it's behind the camera or occluded (one raycast per hotspot at 10 Hz, not every frame). Opacity falls off with distance from 3 m to 6 m. No 3D outlines and no emissive hover highlight. The prompt and the cursor are the only affordances (P1, guide §7).
- **Pointer:** the canvas owns pointer input for raycast hover. DOM overlays are `pointer-events: none` except their own buttons.
- **Grain:** in WebGL scenes, the FinalFx pass owns grain and vignette. Unmount the CSS `GrainOverlay` there, so DOM paper is never double-grained. Paper is "in your hand", so it stays clean.
- **Transitions during migration:** the DOM `SceneTransition` veil covers every DOM↔WebGL scene swap. Mount the next renderer behind the veil and reveal only after its first frame has rendered (await one `requestAnimationFrame` after `setScene`), so a shader-compile hitch never shows.
- **Fallback:** if WebGL2 is unavailable, or the low tier still misses 30 fps (§9.5), the DOM renderer remains a complete game. All UI is shared, so the paper and system layers never depend on WebGL.

## 9. Technical art budgets

### 9.1 Target hardware and tiers

| Tier | Reference devices | Render resolution | Target | Frame budget |
|---|---|---|---|---|
| **High** (default where detected) | Intel Iris Xe (96 EU), AMD Radeon 680M / Vega 8, Apple M1 | Canvas size × min(DPR, 1.5), **capped at 2.1 MP total** (≈ 1920×1080). A 1080p canvas at DPR 1.5 would otherwise render 4.7 MP. | 60 fps | GPU ≤ 10 ms, main-thread JS ≤ 5 ms |
| **Low** | Intel UHD 620/630, 2018-era Chromebooks, mid phones | DPR 1.0, dynamic resolution 0.75-1.0 | 60 fps target, 30 fps floor | GPU ≤ 14 ms, JS ≤ 5 ms |
| **Fallback** | No WebGL2, or low tier p90 > 33 ms | DOM renderer (the current game) | — | — |

### 9.2 Per-scene budgets

| Budget | High | Low | Notes |
|---|---|---|---|
| Draw calls | ≤ 120 | ≤ 80 | Counted across all composer passes (the prototype already sets `info.autoReset = false`, which is correct) |
| Triangles | ≤ 350k | ≤ 150k | Characters ≤ 40% of this |
| Real lights (point + spot) | ≤ 6, including event lights that idle at 0 (emergency, passing lamp) | ≤ 4 | Lights cost per fragment even at intensity 0, so the count is what matters. Plus 1 hemisphere and 1 directional, both cheap. Never `RectAreaLight` on low. |
| Shadow casters | 1 (Sector 0: 2) | 1 at 512² | Spot shadows only. Point-light (cube) shadows are banned. |
| Unique shader programs | ≤ 24 | ≤ 16 | Compile behind the veil with `renderer.compileAsync(scene, camera)` |
| Texture memory (assets) | ≤ 48 MB | ≤ 24 MB | Noise atlas (1 MB), sign and paper canvases, character sets. Excludes render targets. |
| Render targets | ≤ 45 MB | ≤ 16 MB | 1080p HalfFloat RGBA ≈ 16.6 MB each. Composer ping-pong ×2 plus bloom mips at 0.5 scale ≈ 41 MB. |
| Transparent overdraw | ≤ 3 layers average at screen centre | ≤ 2 | Rain, mist, cones and glass all stack. Watch Kalyanpur. |
| Particles | ≤ 7000 total | ≤ 2000 | §7 |
| JS per frame | ≤ 5 ms | ≤ 5 ms | No allocation in `update()` (the prototype rig already follows this) |

**Per-character budgets**

| LOD | Triangles | Use |
|---|---|---|
| LOD0 | ≤ 15k | < 3 m from the camera |
| LOD1 | ≤ 6k | 3-8 m |
| LOD2 | ≤ 1.5k | > 8 m, reflection proxies, the Empty Platform figure, background riders |

Each character has ≤ 3 materials and one 1024² texture set (`_bc`, `_orm`, `_n`). Low tier biases LOD selection +1 and loads 512² textures.

### 9.3 Lighting cost rules
- `MeshStandardMaterial` fragment cost scales with light count, and **changing light count recompiles every program**. Every scene creates its full light set at build time and animates intensity only. A "dead" light is intensity 0, never `remove()`.
- No per-frame `material.needsUpdate`. Drive state through uniforms.
- Animate `emissiveIntensity`, not emissive color, where possible (both are uniforms, but intensity keeps the authoring simple).

### 9.4 Post-processing costs (Iris Xe, 1080p)

| Pass | Estimated | High | Low |
|---|---|---|---|
| `RenderPass` to HalfFloat RT | — | on | on (UnsignedByte RT if HalfFloat is unsupported) |
| `UnrealBloomPass` at 0.5 scale | 1.2-1.8 ms | on: strength 0.35-0.5, radius 0.4, threshold 0.85 | **off** |
| `OutputPass` (tone map + sRGB) | 0.3 ms | on | on |
| `FinalFx` (barrel, CA, vignette, grain, grade, iris) | 0.3-0.4 ms | on | on (barrel and CA 0) |
| **Total post** | — | **≤ 3 ms** | **≤ 1 ms** |

Recommendations:
- Fold `OutputPass`'s tone mapping and sRGB conversion into `FinalFx` (one full-screen read/write saved).
- Replace `UnrealBloomPass` with a 4-mip dual-Kawase bloom once the look is locked. It should come in under 0.8 ms, and is the cheapest large win left.
- No SSAO or SSR at either tier. Bake AO into vertex colors for environment geometry (computed at build time from simple ray tests, or authored).

### 9.5 Tier selection
1. Start on **high** unless `WEBGL_debug_renderer_info` reports a known-weak GPU (UHD 6xx, HD 5xx, Mali-G5x, Adreno 5xx), or `navigator.hardwareConcurrency` ≤ 4 on a touch device.
2. After each scene's first 3 s, measure p90 frame time. If high-tier p90 > 18 ms, drop to low. If low-tier p90 > 33 ms, offer (don't force) the DOM renderer via a system-layer toast.
3. Persist the decision in settings. The user can always override it. Dynamic resolution on low: step 1.0 → 0.85 → 0.75 when p90 > 17 ms, and step back up after 5 s below 13 ms.

| Feature | High | Low |
|---|---|---|
| Bloom | on | off: emissives carry the glow through tone-mapped brightness and a halo sprite per fixture |
| Shadows | 1024² | 512² |
| Planar puddle `Reflector` | on (0.5×) | off: streaks and env only |
| Rain / dust | 6000 / 400 | 1500 / 150 |
| Window rivulets | animated | static |
| Reflection pose delay | on | off |
| Barrel / CA | on | off |
| Clearcoat (wet benches) | on | off |
| Character LOD bias | 0 | +1 |

### 9.6 Debug and verification tooling (owned by the renderer, used by art)
- **Stats HUD:** extend the existing `RenderStats` with lights, programs, texture MB and RT MB.
- **Luminance false-color view** (debug key): bins at ≤ `#060608`, `#0a0a0e`, `#2a2d35` and ≥ 0.85. Shows darkness % and checks the contrast ratios from §2.3 and §3.4.
- **Silhouette capture:** flat-black render of each passenger, for the §6.10 IoU gate.
- **Face-concealment capture:** 64 poses around plate 5, asserting face-region luminance ≤ `#0a0a0e` (§5.6).
- **Leak check:** after 10 scene swaps, `renderer.info.memory.geometries` and `.textures` must return to baseline.

## 10. Asset pipeline roadmap

### 10.1 Phases

| Phase | Waves | What's produced | How |
|---|---|---|---|
| **P0: Procedural** | C-E | All environments, props, materials and VFX. Characters as **procedural mannequins**. | Code-built geometry (`BoxGeometry`, `ExtrudeGeometry`, `LatheGeometry`, `TubeGeometry`), merged per material with `BufferGeometryUtils.mergeGeometries`. Mannequins are lathe and capsule bodies on a simple bone chain with the §6.10 posture presets, built to pass the silhouette gate before any detail exists. Textures come from the noise atlas and canvas. |
| **P1: Authored glTF props and set pieces** | F | Hero props (briefcase, headphones, cane, ledger, watch, ticket punch, vending machine, phone box, clock) | Blender → `.glb`. Self-authored only. |
| **P2: glTF characters** | F-G | The six principals plus the Commuter base bodies and costume layers on `ltr_humanoid_v1` | Blender + Rigify (Blender output carries no GPL obligation). Base topology from **MakeHuman exports (CC0)** or sculpted in-house. |
| **P3: Full 3D** | H | Walkable stations and carriage interiors at first-person fidelity | Same pipeline, plus LOD1/LOD2 for all environment and occlusion-friendly modular kits |

### 10.2 License-safe sources only
- **Allowed:** self-authored work; CC0 (MakeHuman exports, or CC0 libraries *if* ROADMAP rule 7 is amended); commissioned work with a written assignment of rights.
- **Banned:**
  - anything "free for personal use";
  - ripped game assets;
  - photo textures from the web;
  - Mixamo (its terms forbid redistributing raw files, and this repo is public);
  - store assets whose license forbids raw redistribution.
- **AI-assisted modeling:** allowed only with tools whose terms grant us full commercial ownership of the output. Prompts must never name an artist, film or game. Record the tool, version and prompt in the sidecar. Every AI mesh is retopologized and checked against §10.4 before it can land.
- **Sidecar:** every runtime asset carries `<asset>.meta.json` = `{ author, source, license, tool, date, prompt? }`. `public/assets/LICENSES.md` aggregates them.

### 10.3 Formats, conventions, locations
- **Mesh:** glTF 2.0 binary `.glb`, with `EXT_meshopt_compression` decoded by three's bundled `MeshoptDecoder`. **Texture:** KTX2 (Basis UASTC for normals, ETC1S for color), decoded by three's `KTX2Loader` with the transcoder from `three/examples/jsm/libs/basis/`. Both decoders ship inside the `three` package, so no new runtime dependency is needed. Authoring-side tools (e.g. `@gltf-transform/cli`) would be devDependencies: **requested from the orchestrator, not installed.**
- **Units and axes:** metres, +Y up, characters facing +Z (glTF convention). Origin on the floor between the feet. Seated assets also carry a `seat_anchor` empty at the hip-on-cushion point that the bench slots snap to.
- **Naming:** `<type>_<name>_<variant>_<lod>`, lowerCamel within segments.

| Type prefix | Meaning | Example |
|---|---|---|
| `chr_` | Character body or costume layer | `chr_oldMan_base_lod0.glb`, `chr_commuter_bodyTall_lod1.glb` |
| `cos_` | Costume layer | `cos_longcoat_a_lod0.glb` |
| `prp_` | Prop | `prp_briefcase_a_lod0.glb` |
| `env_` | Environment kit piece | `env_carriage_shell_lod0.glb`, `env_station_canopy_b_lod0.glb` |
| `tex_` | Texture | `tex_vinylSeat_bc.ktx2`, `_orm`, `_n` |
| `skn_` | Skin data id (code, not files) | `skn_commuter_longcoat_ash` |

- **Repo locations:**
  - Runtime assets: `public/assets/{characters,costumes,props,env,textures}/`.
  - Procedural code: `src/render3d/{materials,geometry,characters,vfx}/`.
  - Palette and light presets: `src/render3d/palette.ts` and `src/render3d/lighting/presets/<scene>.ts`.
  - Skin definitions: `src/data/skins.ts`.
  - Blender sources: `art-src/`, outside the Vite build. Git LFS is recommended, and the orchestrator decides.

### 10.4 Import lint (Wave F, a script under `tests/` or `scripts/`)
The script rejects an asset when any of these fail:
- **Size:** bbox height must be within 1.40-2.00 m for adult characters.
- **Triangles:** within the §9.2 budget per LOD.
- **Materials and textures:** ≤ 3 materials, textures ≤ 1024².
- **Rig:** skeleton name must be `ltr_humanoid_v1`, with all sockets present.
- **License:** the sidecar must exist and carry an allowed license.
- **Plate 5:** any mesh named `*face*`, or any vertices inside the hood's face-region bounding box, is a hard fail.

### 10.5 LOD strategy
- **Characters:** a three.js `LOD` object per character. LOD0 below 3 m, LOD1 at 3-8 m, LOD2 beyond 8 m; reflection proxies are always LOD2. Hysteresis is 0.5 m, so passengers don't pop while the rail camera drifts.
- **Environment:** repeating elements are one mesh or one `InstancedMesh` (seats, sleepers, tile walls, canopy posts, rebar). Far set-dressing past 25 m swaps to impostor cards at Wave H. Fog hides the swap.
- **Textures:** mipmapped everywhere. Low tier requests the `@512` variants.

---

## 11. Scene-by-scene migration plan

### 11.1 Architecture precondition (Wave D)
- **Split logic from presentation for every scene before porting it.** Each scene's rules become a headless hook, testable in Vitest:
  - `Station.tsx` → `useStationLogic`: inspect counts, thresholds, anomaly resolution, clue awards, the fallback timers, the reveal beats.
  - `TrainInterior.tsx` → `useCarriageLogic`: `deadLightIds`, the route-map drift, seat drift, vanish state, dialogue staging.
- Both the DOM view and the WebGL `SceneModule` then *render* the same view-model. **No timer, flag, clue or RNG call may live in a renderer.** This is how guide Invariants 2, 7 and 8 survive the port.
- **Scene registry:** `sceneId → { dom: Component, webgl?: SceneFactory, ready: boolean }`. A scene renders in WebGL only when `ready` and the tier allows it; otherwise it renders in DOM. Mixed sessions are expected through Wave E.

### 11.2 Order

| # | Scene | Why this position | Reuse | New work | Key risks |
|---|---|---|---|---|---|
| 1 | **Carriage hub** (`trainInterior`) | Already prototyped, and the most screen time (between every station) | `PASSENGERS`, dialogue staging, `DialogueBox`, `InteractionPrompt` (world-anchored), deadLightIds and route-map logic moved into `useCarriageLogic`, `TrainMotion`, `RailCameraRig` | Mannequins and posture presets, raycast hover → same `hoveredId` / E-key flow, the vanish-seat hotspot, the 5→7 tube mapping (§3.5), reflection proxies, passing lamps, the trip-5 extended car, the emergency beat | Hover/E parity with the DOM; the face rule under the aisle camera; shader-compile hitches on first entry |
| 2 | **Station template**: Kalyanpur, Madhav Nagar | One template covers 4 stations; the mild band is the lowest risk | `STATIONS` data, `useStationLogic`, the sign component's text | A `StationSetDef` (set kit, light preset, world anchors per object id; the existing `position` % maps to the authored x along the platform plus a y height), rain, wet concrete, lamp streaks, sodium/fluoro rigs, the `morse` tube | Mapping 2D % positions to readable 3D hotspots; Kalyanpur overdraw (rain + mist + cones) |
| 3 | **Sector 0**, **[UNLISTED]** | Same template, moderate band | Template, footstep marker logic | Caged-bulb swing with shadow, raw concrete and rebar kit, tiled arches with an authored tile override, the hemisphere-only rig, the phone-box anomaly | The shadowless [UNLISTED] rig reading as a bug rather than as wrongness. Sign it off early with the false-color view. |
| 4 | **Platform 4 prologue**, **Train arrival**, **Title** | First impression, and it introduces the player mannequin (the skin hook for Wave G) | Platform objects/dialogue, arrival stage machine, `RAIN_INTENSITY` | Walkable side rail (§5.2), the train exterior mesh (shared with step 5), headlight spot, the arrival shake fallback | The first frame is the hardest perf moment: rain, headlight and bloom together on the slowest device, with no warm cache |
| 5 | **The Empty Platform** | Needs the train exterior from step 4 | Reveal logic and timers (unchanged) | Vast-platform kit, the no-track void plane, the `uManifest` return effect, figure staging | The silent return reading as a glitch. Tune the dithered dissolve so it never shows a stipple pattern at 1080p. |
| 6 | **Home** | The most bespoke lighting; needs the `uVoidPlane` material injection | Reveal logic and timers, `HOME_PULSE_MS` | Wood and brass kit, the 3-sconce rig, the curdle sequence, the void plane, the door's under-glow | Material injection has to reach every material in the scene. A missed one shows lit past the void. |
| 7 | **The Last Stop** | Reuses the carriage set | Carriage scene from step 1, `LastStopPhase` machine | Single-bulb rig, the Conductor mannequin, the down-aisle camera, blackout and strike, the sign beam | Camera angle change versus the face rule (§5.6 test) |
| 8 | **Endings** | Mostly text; DOM is acceptable through Wave E | `ENDINGS`, the line-swap logic | One slow 3D shot per ending behind the DOM text (§2.5), plus the iris for breakLoop | Text legibility over a moving 3D backdrop: keep the backdrop ≤ 25% luminance behind the text column |

### 11.3 Gate to flip a scene's `ready` flag
1. **Parity:** every interaction, timer, flag and clue fires identically. Both views drive the same logic hook, and Vitest covers the hook.
2. **Performance:** budgets (§9.2) are met on the low tier, with p90 ≤ 16.6 ms on the reference high device.
3. **Color script:** darkness %, contrast ratios and band saturation match §2.3/§2.5 in the false-color view.
4. **Accessibility:** `reduceFlashing` and `screenShake` fallbacks are authored and exercised. All required text reaches the DOM.
5. **Teardown:** the leak check (§9.6) passes. The art director signs off a capture.

### 11.4 Changes for the rendering lead to make now (against the current `src/render3d/`)
1. **Tone mapping:** `POST_HIGH.toneMapping: 'aces'` → `'agx'` (§3.1). Keep ACES as a switchable fallback.
2. **Bloom:**
   - `bloomStrength` 0.7 → **0.4**, `bloomThreshold` 0.82 → **0.85**, `bloomRadius` 0.55 → **0.4**.
   - At 0.7, every tube haloes, and that fights P2: light should feel scarce.
3. **Lens:**
   - `barrel` 0.07 → **0.03** and `chromatic` 0.0035 → **0.002**. The current values read as "a horror filter" (P1 says "almost right").
   - Keep grain 0.055 and vignette 0.6.
4. **Clear color:** `0x050507` → `0x060608` (`--color-void`), in both `Renderer3D` and `CarriageScene.background`. One token, imported from a shared `palette.ts`.
5. **Grade uniforms in `FinalFx`:** add `uSaturation`, `uExposureOffset` and `uTint` now (§7.11). Every scene's band grade and the choice tells depend on them. Add the iris uniforms at the same time, since they're free.
6. **Carriage fog:** `FogExp2(0x07080b, 0.06)` → `(0x0a0b0e, 0.02)` for trips 0-2, scaling per §3.5. 0.06 belongs to the extended car only.
7. **Pixel cap:** clamp the *render pixel count* to 2.1 MP on high and 1.0 MP on low, in addition to the DPR cap (§9.1). `maxPixelRatio` 1.5 alone lets a 1080p laptop panel render 4.7 MP with ~75 MB of HalfFloat targets.
8. **Camera FOV:** the rail rig's FOV is 50 → **46** for the carriage. The `resize` portrait widening is good, so keep it. **End the rail ≥ 1.4 m short of bay 4** (plate 5/6, §5.6).
9. **Light count:** fix the carriage's full light set now and never add or remove lights at runtime (§9.3). That set is 3 points, 1 spot shadow caster, 1 red emergency point at 0, 1 moving passing-lamp point, 1 hemisphere and 1 directional (§3.5).
10. **Tubes:** keep the 7 `TUBE_Z` entries and map the game's 5 `OVERHEAD_LIGHTS` ids onto them per §3.5.
11. **Motion coupling:** expose `TrainMotion` to characters with a per-character coupling and lag (§6.10 `swayCoupling`/`swayLag`). Plate 5 and the Conductor get 0.
12. **Placements** (`passengers/index.ts` `DEFAULT_PLACEMENTS`), to match §6.2:
    - `oldMan` → `seatIndex: 1` (aisle), so the window seat beside him stays empty and unworn.
    - `womanWithChild` → `seatIndex: 1`, which lets `comfortedWoman` move her to the window.
    - `student` → `seatIndex: 0` (window), so her head can rest on the glass.
    - `silentPassenger` → `seatIndex: 0` (window), with facing alternating per visit, and the aisle seat beside them as plate 6.
13. **Material seed:** `createCarriageMaterials(seed, …)` should use a **constant** seed, not `runSeed`. It's the same car every night, and the wear has to be stable (P5, §4.1). Run variation belongs to the guide's drift systems (dead lights, route map, seat jitter), not to surface noise.
14. **Upholstery:** the `Moquette` (teal fabric) material → **worn vinyl** `#3b4a5a` per §4.2. Vinyl takes the sit-dip polish and the body-shaped empty-seat trace that the vanish beat needs (§7.10), and it fits the setting. Teal moquette reads as a UK commuter train.
15. **Window material:** keep the virtual-plane outside, the rain and the condensation. Its built-in fresnel interior reflection is fine as the base layer, and the riders'-version proxies (§7.4) layer on top in Wave E.
