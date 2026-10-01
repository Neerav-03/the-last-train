# THE LAST TRAIN — Story Bible

*Authoritative. Merged by the story editor from `docs/drafts/STORY_BIBLE.lorekeeper.md` (THE LOREKEEPER) and `docs/drafts/STORY_BIBLE.director.md` (THE DIRECTOR OF DREAD), under the orchestrator's binding rulings. The drafts stay on disk as history. Where they disagree, this document wins. Calls the editor made are listed in §11.*

---

## 0. How to use this document

- **Audience.** Dev-only: writers, artists, engineers and implementation agents. Nothing in this file ships as text unless §3, §8 or §9 gives the exact on-screen wording.
- **Sealed vs on-screen.** §1 is **sealed canon**: the hidden truth that keeps every beat consistent. It never reaches the player as exposition. §2 is the hard list of things that must never appear on screen. Everything from §3 on describes **how canon reaches the player**: through objects, behavior, timing and absence.
- **The governing test** (both drafts). For any line, object, skin or station, *name the moment it reaches the player and the feeling it produces.* If you can't name both, the fact stays in §1.
- **Relationship to `docs/STORY_REFINEMENT_GUIDE.md`.** The guide's §0 design rule and §5 invariants still bind, and so do its §6 choice tiers. This bible **extends** the guide and never overrides it. Wherever an item here touches an invariant, it says which one. If you find a conflict, the guide wins and you raise it with the orchestrator. Never resolve it on screen.
- **Conventions.** Exact on-screen text is in *italics* or "quotes". In the data files, apostrophes and dashes are typographic (`’`, `—`); keep them that way when you transcribe. "Night N" means the player's Nth completed or started run, counted by the meta-save. It is never displayed.

---

## 1. Sealed canon (dev-only)

### 1.1 What the train is
The train is the **2:17 AM Down Local of the Mandal Circular Railway (M.C.R.)**. It was the last scheduled service on a suburban loop line, which was withdrawn that same night. It left Platform 4 and never arrived. The line closed and its terminus, **HOME**, was demolished, which is why Home's tracks simply stop. The train is still running a schedule it was never allowed to finish. On screen the line appears only as the three letters "M.C.R.", on a torn poster and on screw heads.

### 1.2 The rules
- **R1. Train time.** Aboard, it is always 2:17. Any watch or clock that boards takes on the train's time. Riders half-remember their own time and can feel it slipping away. No minute has ever passed aboard except the one minute of 2:18 that the brake buys (R5). The Businessman's watch is the one object still fighting R1.
- **R2. Who it stops for.** It stops only for someone standing **alone on a platform at 2:17 whose night is unfinished**: someone who, in that minute, cannot bear to arrive where they're going. Nobody remembers boarding. You don't choose to board; you fail to refuse.
- **R3. Seven calls.**
  - **Calls 1-4 are borrowed.** Each one is a platform lifted from one person's unfinished night: Kalyanpur (the Businessman), Madhav Nagar (the Woman), Sector 0 (the Rememberer and the crew: the unfinished depot), [UNLISTED] (the candidate's hometown, unlisted because the candidate isn't on the manifest).
  - **Calls 5-7 belong to the train.** The Empty Platform is where confiscated memories are left. Home is the terminus. The Last Stop is ticket inspection, held in the carriage itself.
  - *This split is the in-fiction reason for Invariant 2. Stations 5-7 belong to no rider, so they never vary.*
- **R4. Tickets.** Every rider holds a ticket they will not hand in. The Conductor, Guard D. Pillai of the original service, collects only at the Last Stop, and only from the **candidate** (the one unlisted person aboard). The open palm is a ticket inspection. He is on duty, not riding, and not malicious. He can't finish a run whose terminus is gone.
- **R5. Three exits.**
  - **getOff (set down short).** The fare is the memory of the ride, which is left at the Empty Platform. Your unfinished thing is untouched, so some future night you'll be on Platform 4 again, as yourself. Each set-down lands a little further from right: "a street that looks almost right."
  - **stayOn.** You keep your ticket and your row goes on the manifest. You become a rider. The next night's candidate is someone new.
  - **breakLoop.** The emergency brake is crew equipment that runs outside the train's clock. Pulling it opens **one minute of 2:18**. Memory aboard must always be carried by exactly one person, **the Rememberer**. The train takes the Rememberer's face so nobody aboard can be reminded by it. Whoever pulls the brake keeps their memory and becomes the Rememberer, and the previous Rememberer goes out into 2:18. *It is a trade, never a victory.*
- **R6. Witnessing.** A rider's illusion thins when someone **not on the manifest** sees it clearly. Only the candidate is unlisted, so only the candidate can witness. That's why riders brush you off and still talk to you, and why the child fades from trip 3: your attention does it. **The window glass shows the riders' unwitnessed version**: what the train still holds, and what it expects. The room is the truth and the glass is the illusion. The Rememberer has no place in that version, so they have no reflection.
- **R7. True arrival** means your ticket is collected **and** you walk through Home's door. It has happened exactly once, decades ago, to the Old Man's wife Sarla. No current ending achieves it. "Clearing the manifest" is the long-term expansion spine, and it is never stated as a goal.
- **R8. The same night repeats.** Every night is the same night. Riders "step off" at the Last Stop (the Procession) to reset, and they're back in their seats the next night. Only two things build up: **the manifest and the Rememberer.** That is exactly what the meta-save stores (§6).
- **R9. The line is open at 2:17.** The Platform 4 payphone connects to the carriage. The breathing on it is the Rememberer listening for whoever is alone on the platform. **The voice under the Student's static is different**: it comes from outside, from someone calling *you* and waiting for you. Audio rule: **breath means the train and voice means the outside**, and the two are never mixed.

### 1.3 The candidate (the player)
- **They aren't new.** Every getOff wiped their memory of the ride. Kalyanpur's "every other night you've taken this train" is literally true. That's why the Silent Passenger says "You weren't on the list", why the bench initials exist, and why "You weren't supposed to remember" is the last line.
- **Struck from the manifest.** Set-down candidates are struck from the list. [UNLISTED] is named after their status.
- **The Empty Platform figure is a confiscated memory**: the fare left by a set-down candidate. In canon, even on a first run, it belongs to the player, from a night they've forgotten. On screen, whose it is stays unresolved. "You shouldn't have gotten off" is a memory warning its owner.
- **Assembling clues across runs is, in-fiction, remembering.**
- **Skins.** Each skin is a *person* with an unfinished night, never a costume. It reaches the screen only as initials, a coat, a silhouette and a carried object (§6).

### 1.4 The vanished passenger
The run's vanisher (the Businessman or the Student, picked by `vanishingPassengerId`) **steps off to try to arrive, and fails**: no witness and no collected ticket. They are back the next night (R8). A vanish is a failed attempt to get off, never a taking. That's why the trace is left warm.

### 1.5 Sealed facts (on screen: never)
| Who | Canon name | Wound (one line) |
|---|---|---|
| Old Man | Govind Rao | He missed the original 2:17 that his wife Sarla boarded. She is the only person who ever truly arrived. He rides the train she has already left. |
| Woman | Meera | Her infant son died at the hospital near Madhav Nagar. She sat on that station's bench instead of going home. |
| Businessman | Vikram Sethi | He missed the 6:40 to his dying father. At 2:17 he is only *late*. At 2:18 he'd be *too late*. |
| Student | Tanvi | Her mother left a voicemail at 11:52 PM, the night she died. Tanvi has never played it. She plays static instead. |
| Silent Passenger | none | The current Rememberer: the last person who pulled the brake. |
| Conductor | Guard D. Pillai, M.C.R. | The guard of the original service. |
| STATUS word | **WAITING** | Never rendered, on any run (§2). |

---

## 2. Never shown on screen

These are absolute. No replay, skin, renderer or expansion relaxes them.

**Names and words**
1. **No full name, ever**, on screen or spoken, for any passenger or for the player. Replays may show **initials only**, deniably, in exactly three places: the Platform 4 bench, rows on the Passenger List, and the [UNLISTED] billboard's letter *shapes*. The billboard shapes match the bench initials, and the player sees them without being able to read them.
2. **The STATUS word.** It is never rendered, on any run. The loop remembers by adding a row in fresher ink "reading the same word as all the others", or by striking a row through.
3. **These words in any dialogue, narration or clue card:** Rememberer, manifest, candidate, Mandal, Mandal Circular Railway, Sarla, terminus, WAITING. The only allowed fixture fragment is "M.C.R.", on the Kalyanpur poster and the Sector 0 screws.
4. **The Conductor's name, badge text or past.** His badge is worn smooth: a shape, never letters.

**The Silent Passenger**
5. **Their face**, ever, at any distance, under any light, in reflections and in 3D.
6. **Them turning or rising on screen.** The single exception is the scripted stand at the Last Stop. A turn may be *narrated* behind a dialogue box ("For the first time, they turn to look at you directly."), but it is never animated. When the box closes, they're simply already facing you.
7. **More than two spoken lines in a run**: "You weren't on the list" (trip 6) and "You weren't supposed to remember" (breakLoop). No "I", no "we", no "again".
8. **A reflection.** Their place in the glass is an empty seat.
9. **Them in the same frame as the player's own reflection, or any image of the player becoming faceless.** A link to the player's previous skin is limited to *one* deniable visual detail (`coatColor`), with no text.

**Unanswered, forever**
10. What happened on the original night. The clipping stays torn mid-headline.
11. Whether anyone aboard is dead. No grave, no body, no obituary, no "you died".
12. Where the child went.
13. What's beyond Home's door. Light and a voice only, never a room.
14. Where getOff leads. Nothing past "a street that looks almost right."
15. What happens after breakLoop. The final card has no text.
16. Who scratched out the station names.
17. Any statement of the §1.2 rules, by anyone, in any form: codex, tutorial voice or monologue.
18. Flashbacks, cutaways, diaries or backstory dumps. No passenger names their wound in more than one oblique line.

**Never displayed as a number or announced**
19. Loop counters, run numbers, "Night N" cards, achievement toasts, changed title-screen text, or any statistic of past play. The meta-save shows itself only as changed objects (§6).

---

## 3. Passenger bibles

Every passenger gets:
- a **wound** (sealed, §1.5);
- **behavior** (the main way they reach the player);
- a **stage plan** (the final `dialogueStages` order, where array order still decides: last match wins);
- an **exhausted state** (what an interaction shows once a stage has already been heard, so no reveal ever loops);
- a **never-say** list.

In the stage plans, **NEW** marks an added stage and **CHG** a changed one. Every new stage is leaf-tier: no stage awards a `requiredClueIds`-eligible clue (Invariants 5 and 6). `minTripIfStaying` and the exhausted mechanism are defined in §5.4.

### 3.1 The Old Man (seat 1): the first rider
- **Wound.** He held two tickets for the original 2:17 and was late. Sarla boarded alone. For years he stood on Platform 4 at 2:17 until it came for him. His lines are literal:
  - "Don't miss your stop" is his own guilt.
  - "I've been waiting longer than you" is simply true.
  - "Ask the conductor": the Conductor punched Sarla's ticket.
  - "It won't get you anywhere": tickets only work for their owner.
  - Over decades he scratched every station off the maps except HOME, and he scratched the tally on Home's clock.
- **Behavior.**
  - His head turns a few degrees further toward you every trip, so his reveal ("He finally turns his head") lands as the end of a motion you watched.
  - `oldManPressed`: he waits for you to speak first. `oldManIgnored`: he talks to the window.
  - His hands drift from the cane (trips 1-4) into the Silent Passenger's exact folded pose (trip 6 on). That makes stayOn's "hands folded the way the old man folds his" quietly true.
  - He never looks at the window seat beside him. In 3D, that is the one seat in the car with zero wear.
- **Stage plan.**

| # | Gate | Content |
|---|---|---|
| 0 | min 0 | "Don't miss your stop." [`metOldMan`]. Memory variant `again`: *"Don't miss your stop. …Again."* |
| 1-6 | unchanged | The existing min 1-4 stages, including the §6.1 choice and its `oldManPressed` / `oldManIgnored` variants |
| 7 NEW | min 5, `requiresFlag: vanishLookedAway` | narration *"His eyes go to the empty seat across the aisle, then back to the window."* / OLD MAN *"You looked away. Most do."* |
| 8 NEW | min 5, `requiresFlag: vanishHeldGaze` | same narration / OLD MAN *"You held it. That's rarer."* |
| 9 | min 5, `requiresFlag: avoidedWoman` | Existing. It sits after 7-8, so it wins if both are set (§6.2 payoff is never displaced). |
| 10 CHG | min 6, **`minTrip: 4`** | Existing reveal, `oldManRevealed`, `oldTicketStub`. Memory variant `doubt` on its first line: *"I've been waiting longer than you. …I used to be sure of that."* |
| 11 NEW | min 7, `minTrip: 5` | OLD MAN *"She had the window seat. I had the tickets."* |
| 12 NEW | min 0, `minTrip: 7`, `requiresFlag: oldManRevealed` | OLD MAN *"Don't miss your stop."*, said as if he has never seen you (set-piece I). Must stay last. |

- **Exhausted.** *"[He's looking at the empty seat beside him. Then he isn't.]"*
- **Never say:** Sarla, wife, "she" before stage 11, the original night, that he missed a train, how long he has ridden, that he scratched the maps.

### 3.2 The Woman (seat 2)
- **Wound.** Her son died at the hospital near Madhav Nagar. The train holds her in the minute before she was told. The child is a memory she carries. Your witnessing thins it (R6).
- **Behavior.**
  - She rocks in time with the wheel rhythm and stops when the train stops.
  - After `childGone` she keeps rocking at stations, out of rhythm with nothing.
  - `comfortedWoman`: she slides over and leaves the seat beside her empty for you on every later trip.
  - `avoidedWoman`: she turns her back to the aisle.
  - Before `childGone`, the child's head sometimes turns toward you, in the glass only (set-piece B).
  - **Madhav Nagar** (§5.6): the one time she's out of her seat.
  - **Procession** (set-piece F): she holds the empty air out to you.
- **Stage plan.**

| # | Gate | Content |
|---|---|---|
| 0-5 | unchanged | Existing, including `childGone` (min 2, trip 3) and the §6.2 choice (min 4, trip 3) |
| 6 NEW | min 5, `minTrip: 3`, `requiresFlag: comfortedWoman` | WOMAN *"They wrote the time down for me. I left it on a card somewhere."* This pays off Madhav Nagar's blank index card. Nobody points that out. |
| 7 NEW | min 6, `minTrip: 5`, `requiresFlag: childGone` | narration *"Tucked into the seat beside her, a ticket. PLATFORM ADMISSION — NOT VALID FOR TRAVEL."* |

- **Exhausted.** *"[She doesn't look up.]"* Her first line returns, so the end rhymes with the start.
- **Never say:** the child's name or age, "dead", "died", "hospital" (in her speech), any time of death.

### 3.3 The Businessman (seat 3; vanish pool)
- **Wound.** He stayed for a meeting and missed the 6:40 to his dying father. He got off at the hospital's station at 2:17 and couldn't walk the last block. "Seven. For you." means he has counted thousands of stops for himself.
- **Behavior.**
  - **Not the vanisher:** from trip 5 he is standing at the door whenever you look at it. The first time you open the door on trip 5, a one-line box shows *"BUSINESSMAN: Is this mine?"*, then the door works as normal. He never gets off.
  - **The vanisher:** his briefcase stays on the disturbed seat through the Last Stop. It's the only object the Procession leaves behind.
  - Optional: he checks his watch whenever the player opens the clue journal (Pause menu).
- **Stage plan.**

| # | Gate | Content |
|---|---|---|
| 0-3 | unchanged | Existing ("Running late", "the 6:40", "Still 2:17", "I don't remember getting on") |
| 4 CHG | min 4, **`minTripIfStaying: 3`** | Existing "…Seven. / For you.", `businessmanRevealed`, `businessmanWatch` |
| 5 NEW | min 5, `minTrip: 4` | BUSINESSMAN *"At 2:17 I'm late."* / BUSINESSMAN *"At 2:18 I'm… something else."* Only a staying Businessman can reach this. It plants the breakLoop clock. |

- **Exhausted.** *"[He holds the watch out so you can see it.]"*
- **Trace** (if he's the vanisher; see §5.4): *"On the cushion, his briefcase. On top of it, his watch, face up. Still warm. Its hands haven't moved."*
- **Never say:** father, "died", hospital, the meeting, "too late".

### 3.4 The Student (seat 4; vanish pool)
- **Wound.** At 11:52 PM her mother called. Her headphones were in and she didn't answer. She has never played the message. Under the static are voices from outside calling for riders (R9). Her own name has never come. She hears *yours*.
- **Behavior.**
  - Her foot taps with the wheels, drifts off-beat after trip 3, and by trip 6 taps in time with the player's own inputs.
  - At stage 3 she holds one headphone out. If you don't take it, **her arm stays extended on every later visit** until her final stage.
  - When she hands the headphones over, all carriage audio drops out for 2s.
  - **The vanisher:** her headphones lie on the seat, hissing louder as you approach, with her phone beside them.
- **Stage plan.**

| # | Gate | Content |
|---|---|---|
| 0-4 | unchanged | Existing |
| 5 CHG | min 6, **`minTripIfStaying: 4`** | The first line becomes *"She finally takes both headphones off and sets them in your hand. The cable ends in a bare jack, plugged into nothing."* The rest is unchanged. `studentHeadphoneOff`, `staticRecording` |
| 6 NEW | min 7, `minTrip: 5` | STUDENT *"It's not my name. I've listened for mine. Mine's under yours."* |

- **Exhausted.** *"[Eyes closed. Her foot taps in time with yours.]"*
- **Trace** (if she's the vanisher): *"On the cushion, her headphones, hissing louder as you lean in. Beside them, her phone, face up: 1 VOICEMAIL. 11:52 PM. Unplayed."* The player can never play it.
- **Never say:** mother, "maa", what the voicemail says, "died".

### 3.5 The Silent Passenger (seat 5): the current Rememberer
- **Canon.** They are the last person who pulled the brake. On a first run, that's a stranger. After a breakLoop night, it's the player's previous skin. They walk the stations with each candidate: the Sector 0 footsteps are theirs, and so is the payphone breathing.
- **Four readings must stay live:** it's you from another time; it's death or the train itself; it's the last person who escaped; it's someone you lost. No beat may close any of them.
- **Behavior.**
  - They always face the end of the carriage you last came in from, and are never seen turning (§2.6).
  - At the Last Stop they cross the aisle with **the same footstep sample and cadence as Sector 0**. That audio rhyme is the only link the game ever makes.
  - If the player never once interacted with them, they're the one who doesn't rise in the Procession.
  - After a breakLoop night they face *you* from trip 1 (memory beat).
- **Stage plan.**

| # | Gate | Content |
|---|---|---|
| 0-1 | unchanged | *"[They do not move.]"*, then the blink |
| 2 NEW | min 3, `minTrip: 2` | *"[They do not move. Their shoes are wet.]"* It only rains at Kalyanpur and Madhav Nagar, and they "never" get off. |
| 3 | min 4 | Existing *"[Still. Silent. Facing forward…]"* |
| 4 CHG | min 5, `requiresFlag: acknowledgedVanishing` | Narration only: *"[Their head tilts, almost imperceptibly, toward the empty seat across the aisle.]"* This replaces both current min-5 stages. Their spoken lines move to the Old Man (ruling 8). |
| 5 CHG | **min 2**, `minTrip: 6` | Existing *"For the first time, they turn to look at you directly."* / ? *"You weren't on the list."* [`silentPassengerSpoke`]. These are their true first words, now reachable. Must stay last. |

- **Exhausted.** *"[They do not move.]"* Permanently.
- **Never say or show:** anything in §2 items 5-9. No line beyond their two.

### 3.6 The Conductor (Last Stop)
- **Canon.** On duty. He collects tickets. His ledger records departures with no arrivals, **except one**.
- **Behavior.** He has exactly one pre-finale appearance: on **trip 4**, through the window of the connecting door at the far end of the carriage, walking away, for about 3s. That turns the Last Stop's "You have never seen him before" into a line the attentive player *knows is false*. Canon: you've seen him every night you got off and forgot. Keep the line.
- **Beats.**
  - The ledger's single brown-ink arrival (§9).
  - If `oldManRevealed`: the palm pauses at your pocket. *"That one isn't yours to give."* (§9, `INTRO_PART_2_STUB`)
  - The existing `tookReceipt` line stays word for word ("One more stop. You paid for it already."). It's why the receipt's "ONE (1) MORE STOP" text is load-bearing.
- **Never say:** his name, the original night, what arriving means, what happens to tickets, "fare", anything about the brake.

### 3.7 The sixth passenger (replay only, after a stayOn night)
- **Canon.** Your previous skin, now a rider (R5). It pays off "There are six passengers aboard" without saying it.
- **Behavior.**
  - Seated beside last night's `seatAffinity` passenger (even if that seat is now the vanisher's empty one), head bowed, in the previous skin's coat. It never speaks and never vanishes.
  - Interacting shows one of *your own* `echoLines` from last night, verbatim, one per interaction in order, with an empty speaker. When they run out it shows *"[Head down. Hands folded.]"*
  - It walks out in the Procession with the others.
- **Hard rules.** Outside the vanish pool forever (Invariant 1). No dialogue stages, flags or clues. Excluded from `PASSENGER_ORDER` / `seatLoyaltyLine` (guide §6.5).
- **Never say:** anything. It has no voice.

---

## 4. Set-pieces

**Rules for every set-piece**
- It never blocks progression and always ends by itself (Invariant 8).
- It touches no station-pool clue (Invariants 5 and 6).
- It checks `settings.reduceFlashing` / `settings.screenShake` and has an authored quieter fallback, never a blank frame (Invariant 9).
- Narrative timing is seeded with `rngFor(runSeed, …)` (Invariant 7). Pure animation can stay unseeded.
- Stations 5-7 keep their fixed position, their reveal thresholds and their `*_FALLBACK_MS` timers (Invariant 2). Set-pieces there change *presentation*, never beat order.

**Jumpscare budget** (a stinger paired with a sudden reveal):
- **First run: 2**, which are D (Empty Platform) and F (the Procession's breath).
- **Replays: 1 more**, G2, held back until night 3 or later and spent at most once per meta-save.
- No other beat may pair a stinger with a sudden reveal. The existing trip 5+ emergency flash, the arrival lightning and the Sector 0 flash stay as they are: light only, no stinger.

| ID | Set-piece | Placement | Systems | Renderer |
|---|---|---|---|---|
| A | Tunnel Sweep | Trip 7 travel phase | travel phase, `deadLightIds`, `rngFor('sweep:'+i)` | DOM version now; real moving light in 3D |
| B | Reflections | Every tunnel dip from trip 2 | travel dips, vanish state, `childGone` | DOM-lite now (silhouettes in the window strip); full mirror in 3D |
| C | Half a Beat Behind | Sector 0 | `playFootstep`, `followFootsteps` reveal | DOM now; positional audio in 3D |
| D | The Silent Return (**JUMP #1**) | Empty Platform reveal | existing reveal + fallback, `playStinger` | DOM now |
| E | Dinner's Almost Ready | Home, after the void reveal | `frontDoor`, procedural murmur | DOM now |
| F | The Procession (**JUMP #2**) | Last Stop intro | `INTRO_PART_1` staging, new `playBreath` | DOM now (needs passenger sprites in `LastStopStation`) |
| G1 | The Call | Platform, replay only | meta `NightPlan`, payphone | DOM now |
| G2 | The Reserve (**JUMP #3**) | Trip 1 carriage, night 3+ | meta `reserveScareSpent` | DOM now |
| H | Six Windows | Train Arrival | `ARRIVAL_WINDOWS` | DOM now |
| I | The Last Light | Trip 7, after A | `deadLightIds`, Old Man stage 12 | DOM now |
| J | The Glimpse | Trip 4 | `carriage-door-window` | DOM now; 3D needs the gangway window |

**A. Tunnel Sweep** (trip 7, the post-Home ride; it fixes the worst sag)
- **What the player sees.** As the travel phase starts, the bulbs die one by one, from the far end toward the player, until all five are out. The only light is tunnel lamps sweeping across faces every ~4s.
- **The changes.** Between sweeps, one passenger's pose or seat shifts (`rngFor(runSeed,'sweep:'+i)`). The Silent Passenger is one row closer each sweep. They are only ever seen *having* moved, never moving.
- **The release.** The door unlocks after the last sweep. The player crosses to it in the dark. As they reach it, the light comes back, and everyone is exactly where they started. No stinger: the tension carries into the Last Stop. Then I takes over.
- **Fallback.** With `reduceFlashing`, sweeps become 1.5s soft gradients.

**B. Reflections** (R6: the glass shows the riders' version)
- **When.** Only while the window is tunnel-black, and only if the player happens to be looking. No sound cue and no prompt.
- **What the glass shows:**
  - Trip 2+: the vanisher, still seated.
  - Before `childGone`: the child's head turns toward you, in the glass only.
  - After `childGone`: the Woman's reflection still holds the child.
  - Trip 5+: your own reflection sits in seat 6 while you stand.
  - The Silent Passenger has **no reflection**. Their seat in the glass is empty.
- **DOM-lite version.** During dips, faint silhouettes appear in `.carriage-window-glass` for the vanisher and for seat 6. The full mirror waits for 3D.

**C. Half a Beat Behind** (Sector 0)
- **Echo.** From the first inspect, each inspect is echoed by `playFootstep()` about 400ms later. In 3D it is positional, directly behind the camera, and stops when the camera turns.
- **Idle.** When the player goes idle, it takes **one more step** than they did.
- **Reveal timing.** The `followFootsteps` hotspot is revealed after **the 2nd echoed inspect or 13s, whichever comes first**, so no one can board before it exists.
- **Unchanged.** The §6.3 threshold and `unseenCompanion` stay as they are.
- **Rhyme.** The same sample and cadence are reused for the Silent Passenger at the Last Stop and in the breakLoop text.

**D. The Silent Return** (Empty Platform, JUMP #1)
- **The figure** moves only while unobserved. In the DOM, it advances one step whenever a dialogue box covers it. In 3D, it moves while it's off-camera. Its existing line "It is closer now. You didn't see it move." becomes true.
- **The reveal.** The train comes back **without a sound**: cut even the rail hum.
  - DOM: the silhouette fades in silently, and `playStinger()` fires on the player's next input after it has appeared, as they "look".
  - 3D: the stinger fires when the camera turns back toward the tracks.
  - The lit doorway is **empty, with no one in it**. Then "You shouldn't have gotten off." comes from the figure's direction, and the figure is gone.
- **Unchanged.** The threshold of 2 inspects, `EMPTY_PLATFORM_REVEAL_FALLBACK_MS` and the beat order stay. If the fallback fires with no input, the stinger fires with the line.
- **`reduceFlashing`.** No light change, the stinger at -6 dB, and a 600ms doorway fade.

**E. Dinner's Almost Ready** (Home)
- **Timing.** Home's void and `RedEmergencyOverlay` reveal runs untouched. E is appended *after* it.
- **The door.** The Door Home becomes openable once. It opens a crack: warm light, a procedural radio murmur, pans.
- **The voice.** From inside, in a close, human dialogue style (not PA SYSTEM): *"Dinner's almost ready."* Then the identical line again, with the same box, timing and murmur. Then a third time. The door closes on its own.
- **No new words.** It's the existing Home announcement text. The player works out for themselves that the warmth is a recording (R7). Light only, never a room (§2.13).

**F. The Procession** (Last Stop, JUMP #2)
- **What changes.** The text box `INTRO_PART_1` becomes staging. The beat order is kept exactly: passengers leave, the Silent Passenger stands, blackout, the Conductor, the sign, the choice.
- **1. The walk-out.** Each passenger stands, walks the aisle past your seat toward the door, and makes one gesture:

  | Passenger | Gesture |
  |---|---|
  | Old Man | Taps his breast pocket, where the stub was. |
  | Woman | Holds the empty air out to you. A Tier 1 choice: *Take it* gives *"Your arms take the shape of hers. There is nothing in them. It is heavier than you expected."*, *Don't* gives *"She nods, as if she expected that, and walks on."* It auto-resolves to *Don't* after 8s. No flags. |
  | Businessman | Shows you the watch face. If he vanished, his briefcase stays on the seat. |
  | Student | If her headphones never reached you, she sets one on your seat as she passes. |
  | The vanisher | Walks out with the others, back for this one moment only. |
  | Sixth passenger | Walks out with the others, if present. |

- **2. The approach.** The Silent Passenger stands and crosses with the Sector 0 cadence. Keep the caption *"[They stand before you. Their face stays in shadow.]"* If they were never interacted with, they don't rise, and the scene goes straight to the blackout.
- **3. The blackout.** *"Then, all at once, the lights go out."* In total darkness, one slow breath at the player's ear: the payphone breathing from minute one. The blackout grows from 1.5s to 2.5s; this needs orchestrator sign-off under Invariant 2 (§11).
- **4. The lights return** on the Conductor (`INTRO_PART_2`, unchanged order).
- **Accessibility.** The scare is audio in darkness, so it is safe under `reduceFlashing` as written.

**G1. The Call** (Platform, replay only)
- **Setup.** The payphone is ringing when the scene loads.
- **Answering** sets the run flag `answeredCall`. Breathing, then a flat voice reads back the **last authored line of the previous night's ending**: getOff "You just don't remember leaving."; stayOn "There are six passengers aboard."; breakLoop is breathing only, longer, because its last line is the empty card.
- **Budget.** It counts as a memory beat (§6.4).

**G2. The Reserve** (night 3+, JUMP #3)
- **Eligibility.** Seeded at 1 in 3 per eligible night (`rngFor(runSeed,'reserve')`), only once per meta-save (`reserveScareSpent`), never on a forgetting night.
- **The scare.** The first time a dialogue box closes on trip 1, someone is standing in the aisle at arm's length: the most recent stayOn skin, or, failing that, this run's vanisher. Stinger. On the next input they are seated, head down, as if nothing happened.
- **Guardrails.** It touches no dialogue state or vanish logic. It isn't counted against the memory-beat budget.

**H. Six Windows** (Train Arrival)
- **First run.** Of the 9 arrival windows, 6 are lit: five hold a seated silhouette, and **one is lit and empty**.
- **After a stayOn night,** the empty window holds a figure.
- **After a getOff night,** a figure in your own coat walks up the platform stairs as you board. That's the `walkingOut` beat, which rhymes with the getOff ending's own stairs.

**I. The Last Light** (trip 7, after A)
- **The room.** When the light returns at the end of A, only **the bulb over your seat** comes back. This matches the Last Stop's existing "lit only by the last working bulb".
- **The riders.** They sit facing forward toward the Conductor's end, all in the same posture. The glass reflects **no one**: the train is about to reset them.
- **Dialogue.** If revealed, the Old Man says *"Don't miss your stop."* as if he has never seen you (stage 12). Everyone else is non-verbal (their exhausted state). The one exception: a passenger whose final reveal is still unheard plays it, so the trip 7 floor never costs a passenger clue.
- **Door.** It unlocks when the train stops, as on every trip.

**J. The Glimpse** (trip 4)
- **What the player sees.** During the trip 4 travel phase, for about 3s and only if the player is facing that end (DOM: always, as a silhouette in `.carriage-door-window`), the Conductor walks away beyond the connecting door. Never his face.
- **Exclusivity.** It is his only pre-finale appearance. The Empty Platform doorway stays empty.

---

## 5. Pacing plan

**Target.** A curious first run takes 20-30 minutes (the current build is 8-15), and a door-rusher still needs about 12. The shape: a slow climb, a false calm, a peak at station 5, Home curdling, then a **higher** finale.

### 5.1 Target dread curve (1-10)
| Beat | Now | Target | Driver |
|---|---|---|---|
| Platform | 4 | 4 | PA always heard; breathing on the payphone |
| Train Arrival | 5 | 6 | H. Six Windows |
| Trip 1 | 4 | 4 | First travel phase, door locked (a deliberate low) |
| Kalyanpur | 3 | 3 | Unchanged (mild) |
| Trip 2 | 5 | 6 | The vanish, nearly witnessed; B (vanisher in the glass) |
| Madhav Nagar | 2 | 2→5 | The false calm (§5.6) |
| Trip 3 | 5 | 6 | `childGone` lands one trip after the wristband |
| Sector 0 | 5 | 6 | C. Half a Beat Behind |
| Trip 4 | 4 | 6 | J. The Glimpse; first gated reveals |
| [UNLISTED] | 6 | 6 | Billboard letter shapes, seen but not read |
| Trip 5 | 6 | 7 | Your reflection seated; Businessman at the door |
| Empty Platform | 8 | 9 | D (JUMP #1) |
| Trip 6 | 6 | 7 | "You weren't on the list"; Old Man's folded hands |
| Home | 7 | 8 | E |
| Trip 7 | 5 | 9 | A, then I |
| Last Stop | 6 | 9 | F (JUMP #2) |
| Ending | 4-6 | 6 | Silent final card; coda placement |

### 5.2 Travel phase (every carriage visit)
- **Problem.** The carriage currently plays `trainStopped` throughout, so the train never moves while you're aboard.
- **Opening.** Every visit now opens **in motion**: `setAmbience('trainMoving')`, the wheel rhythm, tunnel darkness at the windows. Passenger loops (rocking, tapping) sync to the wheel beat.
- **Duration.** `rngFor(runSeed,'travel:'+tripNumber)`, within these bands: trip 1 is 50-60s, trips 2-5 are 40-55s, trips 6-7 are 70-90s.
- **Ending.** Brakes, `trainStopped`, then the door unlocks.
- **Tunnel dips.** These are 1-2s light drops at seeded offsets during the ride. Micro-drift (dead lights, seat drift, the route map) and set-pieces B and J happen *during* dips, so the player can catch the carriage changing. They never happen between scene loads.
- **The vanish, nearly witnessed.** On trip 2 the vanisher is present when the ride starts. At the first dip (seeded at 6-12s, delayed while any dialogue box is open) their seat empties, and the run flag `vanisherGone` is set. A disturbed, empty seat is all the player finds. The rule becomes `isVanished = id === vanishingPassengerId && (tripNumber >= 3 || (tripNumber === 2 && flags.vanisherGone))`. That changes guide §2's snippet, so it needs review (§11). It can't orphan content, because the vanisher's arc is ungated on trip 1 (§5.4).
- **Never a lock.** The travel phase is never a choice and never a puzzle. It always ends by itself (Invariant 8).

### 5.3 Door lock
- **While moving,** the door wears the existing `carriage-door--sealed` class. A click gives a dull thunk and no text.
- **Hard ceiling.** The door always unlocks at the band maximum plus 5s, through a fallback timer in the style of `REBOARD_FALLBACK_MS`, even if the travel state sticks.
- **A reload mid-ride** restarts that trip's ride (local state). That's acceptable, because nothing narrative depends on elapsed ride time except `vanisherGone`, which is persisted.

### 5.4 Reveal gating (ruling 7, checked against guide §5)
**The problem.** A clicky player burns "Seven… For you" and the name in the static within three minutes. Canon (R6) says reveals should land as witnessing builds up.

**The mechanism.** Add `minTripIfStaying?: number` to `DialogueStage`:
- **If the passenger is this run's `vanishingPassengerId`,** it's ignored, and the stage plays on trip 1 as it does today.
- **Otherwise** the stage requires `tripNumber >= minTripIfStaying`.

| Stage | Gate |
|---|---|
| Businessman "For you" (min 4) | `minTripIfStaying: 3` |
| Student headphones + name (min 6) | `minTripIfStaying: 4` |
| Old Man reveal (min 6) | `minTrip: 4`, a static gate (he's never in the vanish pool) |
| Woman | Already gated (`minTrip: 3`) |
| Silent Passenger | `minTrip: 6`, now with `minInteractions: 2` |

**The vanisher's trace carries their clue.** The disturbed-seat prompt (guide §6.6) gains the vanisher's trace line (§3.3 / §3.4) before its choices. The stage's own `awardsClues` gives `businessmanWatch` or `staticRecording`. `handleChoice` applies stage rewards on either branch, so the award is never conditional on Look away / Hold their gaze, and `awardClue` is idempotent.

**Exhausted states.**
- When a stage completes, set `heard.<passengerId>.<stageIndex>`.
- If `resolveStage` returns a stage that has already been heard, play `PassengerDef.exhausted` instead. Neither the stage's flags nor its clues are re-applied, and a choice is never re-offered.
- Register `^heard\.` in the tests' `DYNAMIC_FLAG_PATTERNS`.

**Verification against the guide's §5**
| Invariant | Status |
|---|---|
| **1** | Pool unchanged. The Old Man, the Woman and the Silent Passenger are never vanishers. The vanisher's arc is still completable on trip 1, which is the reason Invariant 1 exists. |
| **5 and 6** | `oldTicketStub`, `businessmanWatch` and `staticRecording` are passenger-tier and already absent from `STATION_CLUE_IDS`. Delaying them, or adding the trace award path, can never touch `requiredClueIds`. |
| **7** | Gates depend only on `tripNumber` and `vanishingPassengerId`, both persisted. |
| **8** | Gating never blocks the door. |
| **§0 floor test** | Every run reaches trip 7. A staying passenger's reveal opens on trip 3 or 4, leaving 3-4 visits. Trip 7 still plays any reveal that hasn't been heard (§4 I). |

### 5.5 The 2:17 budget
**Rule.** Four in-scene sightings, each in a new context, plus exempt payoffs. Every remaining appearance after §9 is applied:

| # | Where | File | Counts as |
|---|---|---|---|
| 1 | Platform 4 station clock (the visual "2:17" and its inspect, "2:17 AM") | `Platform.tsx` | Sighting 1: the opening |
| 2 | Businessman arc: "Still 2:17. It's been 2:17 for a while now.", the 2:17/2:18 line, `businessmanWatch` "frozen at 2:17" | `passengers.ts`, `clues.ts` | Sighting 2: the rider whose wound is time |
| 3 | [UNLISTED] timetable inspect, plus the `timetable` clue | `stations.ts`, `clues.ts` | Sighting 3: the schedule |
| 4 | Last Stop sign plate "2:17 AM" | `Station.tsx` | Sighting 4: the train names its own time |
| — | `ticket` clue "2:17 AM" | `clues.ts` | Exempt: an inventory object you hold from the start |
| — | stayOn ending (three mentions) | `endings.ts` | Exempt payoff. It lands because play rationed the number. |
| — | breakLoop final-card clock 2:17→2:18 (silent) | `Endings.tsx` | Exempt payoff |
| — | Title subtitle "2:17 AM", `index.html` meta | `TitleScreen.tsx`, `index.html` | Outside the fiction |

**Removed:** the Home clock (×3), `oldTicketStub`, `conductorsLedger`. The Kalyanpur poster and the clipping never show the time.

**2:18 appears exactly here and nowhere else:**
- the staying Businessman's line;
- the breakLoop final card (the clock ticks 2:17 → 2:18, and the text stays empty);
- the platform clock **for one second** on the night after a breakLoop. That counts as one of that night's memory beats (§6.4).

**"Your name" guaranteed appearances:** the static (Student reveal, `staticRecording`, the Student seat-loyalty coda) and the ledger ("almost recognize as your own"). The billboard now shows letter *shapes* and stops saying it. Leaf variants and anomalies that mention it (Home door variant 2, the coat hooks, the speaker grille) are exempt: each run shows at most one of them per station.

### 5.6 Madhav Nagar: the false calm
- **No flicker.** The station keeps its ambience, and its light is the one in the game that doesn't flicker. `FlickerLight` has no steady mode yet; `active={false}` turns the light *off*, so it needs a `steady` prop.
- **The PA** plays "The next train will arrive shortly." twice, as it does now.
- **The owner object.** Every `emptyBench` variant gains a third inspect: the infant wristband (§9). It is inspect text only, never a clue. The station keeps `newspaperClipping` as its only clue (Invariants 4 and 5).
- **The one wrongness.** Once reboarding is allowed, the Woman is standing in the open train doorway, looking at the bench. It's the only time she is ever out of her seat. When you board she is seated and rocking, as if she never moved. Cosmetic only, with no flags.
- **The payoff** lands one trip later, at `childGone`.

### 5.7 Platform and arrival
- **PA timing.** Today the PA ("…not for passengers.") is scheduled at 45-70s, but the scene auto-advances at 27s, so it almost never plays. Schedule the first PA at **9-13s** with `rngFor(runSeed,'timing:platform.announcement:0')`, and raise `PROGRESSION_FALLBACK_MS` to **40000**, which leaves room for G1 on replays.
- **Payphone audio.** Its breathing becomes audible (new procedural `playBreath`, a slow loop) within about 20% of screen width, so walking past is enough to hear it. On the first run it never rings. Ringing is the replay change (G1).
- **Arrival:** H.

### 5.8 Endings
- **breakLoop de-duplication.** The breakLoop lines no longer repeat `INTRO_PART_1` word for word (§9).
- **breakLoop coda.** For breakLoop, the §6.5 seat-loyalty coda moves **before** the line "You weren't supposed to remember.", so the ending closes on that quote, the '...' beat (where the Woman swap can land), and the empty card. For getOff and stayOn the coda stays last.
- **The final card.** It holds for 6s. A small station clock in the corner, visible at 2:17 from the ending's first card, silently ticks to **2:18** during that hold. No caption.

---

## 6. Reincarnation and the meta-save

**The goal, as experience.** A returning player should feel the loop noticed them. They should suspect themselves first ("did it always say that?") and the game second, and they should never be told.

### 6.1 Data shapes
The meta-save lives in a separate localStorage key, **`lastTrain.meta.v1`**. `startNewGame()` never clears it. It is read once in `startNewGame()` and written once in `setEnding()`, and every access is wrapped in try/catch: a missing or corrupt meta-save behaves as an empty one.

```ts
// src/engine/meta.ts (new). Pure logic plus a thin storage adapter. No React, no DOM.
export const META_KEY = 'lastTrain.meta.v1';

export type MemoryBeatId =
  | 'walkingOut' | 'freshInitials' | 'coins' | 'watch' | 'figureSilhouette'   // getOff family
  | 'sixthPassenger' | 'sixWindows' | 'routeGrows' | 'newRow' | 'nextCarriage' // stayOn family
  | 'minute' | 'facingYou' | 'sharedCoat' | 'struckRow'                        // breakLoop family
  | 'again' | 'call' | 'doubt';                                                // universal

export interface NightRecord {
  night: number;                 // 0-based ordinal. NEVER rendered (§2.19)
  runSeed: number;               // write key: one record per runSeed, never double-written
  skinId: string;
  ending: EndingKey;
  endedAtLocal: string;          // 'H:MM', 12-hour wall clock when setEnding fired (the 'watch' beat)
  seatAffinity: string | null;   // same max-interactionCounts logic as Endings.tsx seatLoyaltyLine
  heldClues: string[];           // passenger/bonus clue ids held at the end. Read only by beat triggers.
  behavior: {                    // things the player DID, never stats
    comfortedWoman?: boolean; avoidedWoman?: boolean;
    vanishLookedAway?: boolean; vanishHeldGaze?: boolean;
    threwCoin?: boolean;         // saw platformEdge variant 0, step 2
    answeredCall?: boolean; tookReceipt?: boolean;
  };
  echoLines: string[];           // up to 3 inspect lines the player read, picked by rngFor(runSeed,'echo')
  forgot: boolean;
}

export interface MetaSaveV1 {
  version: 1;
  totalNights: number;           // monotonic; nights[] is capped, so gating uses this. NEVER rendered
  nights: NightRecord[];         // append-only, last 12 kept
  currentSkinId: string | null;
  rememberer: { skinId: string; night: number } | null;  // set by the most recent breakLoop
  lastForgotNight: number | null;
  reserveScareSpent: boolean;    // set-piece G2
}

export interface NightPlan {     // resolved once in startNewGame(), persisted with the run (Invariant 7)
  night: number;                 // = meta.totalNights (0 on a first run)
  skinId: string;
  previousEnding: EndingKey | null;
  forgot: boolean;
  beats: MemoryBeatId[];         // 0-3 (§6.4)
  sixthPassenger: { skinId: string; seatBeside: string; echoLines: string[] } | null;
  remembererCoat: string | null; // only when beats includes 'sharedCoat'
  reserveScare: boolean;         // G2 fires tonight
}

export function loadMeta(): MetaSaveV1 | null;
export function resolveNight(meta: MetaSaveV1 | null, runSeed: number): NightPlan;  // pure
export function recordNight(meta: MetaSaveV1 | null, rec: Omit<NightRecord, 'night'>): MetaSaveV1; // pure
export function saveMeta(meta: MetaSaveV1): void;
export function clearMeta(): void;
```

```ts
// src/data/skins.ts (new). Author 6 to start.
export interface SkinDef {
  id: string;                    // dev label only; never rendered
  initials: string;              // two letters: bench carving, Passenger List row, billboard glyph shapes
  coatColor: string;             // the ONE detail the Silent Passenger may inherit
  silhouetteId: string;          // DOM sprite and 3D rig variant
  carriedItem: 'umbrella' | 'satchel' | 'tiffin' | 'none';  // flavor only
}
export const DEFAULT_SKIN_ID = 'commuter';
```

```ts
// Text variants: optional fields resolved by one pure helper in src/engine/textVariants.ts
ClueDef.memoryVariants?:        Partial<Record<MemoryBeatId, string>>;   // replaces description
DialogueLine.memoryVariants?:   Partial<Record<MemoryBeatId, string>>;   // replaces text
StationObjectDef.memoryVariants?: Partial<Record<MemoryBeatId, { step: number; text: string }>>;
// resolveText(base, variants, plan): the first beat in plan.beats that has a variant wins.
// '{initials}' and '{endedAtLocal}' are the only substitutions.
```

**The store.**
- Add `nightPlan: NightPlan | null` and `readLines: string[]` (the inspect lines read this run, capped at 24) to `GameStore` and to `partialize`.
- `startNewGame()` computes `pickVanishCandidate(runSeed)` and `pickRequiredClueSubset(runSeed)` exactly as now, **without** reading meta. It then sets `nightPlan = resolveNight(loadMeta(), runSeed)`.
- `setEnding()` builds a `NightRecord` and calls `saveMeta(recordNight(loadMeta(), rec))`. `recordNight` updates `currentSkinId`, sets `rememberer` on breakLoop, records `forgot` / `lastForgotNight`, and sets `reserveScareSpent` if G2 fired.

**Resolving the night** (`resolveNight`, pure):
1. **No meta, or `totalNights === 0`:** `{ night: 0, skinId: DEFAULT_SKIN_ID, beats: [], sixthPassenger: null, … }`. This is the canonical game.
2. **Skin.** If the previous ending was getOff, keep `currentSkinId`. Otherwise `pick(rngFor(runSeed,'skin'), eligible)`, where `eligible` is SKINS minus: the previous skin, skins used in the last 6 nights, the rememberer's skin, and the last stayOn skin. If that's empty, use the least recently used skin.
3. **Forgetting** (ruling 6). `forgot = night >= 2 && lastForgotNight !== night - 1 && rngFor(runSeed,'forget')() < 0.15`. On a forgetting night: no beats, no sixth passenger, no G2. The night is still recorded.
4. **Beats** (§6.4).
5. **`sixthPassenger`.** Non-null only when `beats` includes `sixthPassenger`.
6. **`reserveScare`.** `night >= 2 && !reserveScareSpent && !forgot && rngFor(runSeed,'reserve')() < 1/3`.

**Settings.** Add a plain **"Clear saved data"** control with a confirmation step. It calls `clearMeta()` and clears the run save. The label stays neutral and says nothing about memory (§11). It doubles as the QA reset.

### 6.2 Per-ending carryover
| Previous night's ending | Tonight's skin | Anchor beat (always, unless forgetting) | Canon |
|---|---|---|---|
| none | `DEFAULT_SKIN_ID` | none | First run, the canonical experience |
| **getOff** | **The same skin**: you came back and don't remember | `walkingOut`: a figure in your coat walks up the platform stairs as you board | Yesterday's you, leaving into "a street that looks almost right". Your fare (the memory) is on the Empty Platform. |
| **stayOn** | **A new skin** | `sixthPassenger` (§3.7) | You became a rider. "There are six passengers aboard." |
| **breakLoop** | **A new skin** | `minute`: the platform clock reads **2:18** for one second on arrival, then snaps to 2:17 | The one minute that passed. Your previous skin is now the Rememberer. |

### 6.3 Memory-beat catalog
Tiers:
- **anchor:** see §6.2.
- **deniable:** small, in a place the player remembers clearly, so they doubt their own memory.
- **bold:** unmistakable to anyone who's paying attention. Never on night 2.

| Beat | Tier | Eligible when | What the player experiences |
|---|---|---|---|
| `walkingOut` | anchor | previous ending getOff | H: a figure in your own coat goes up the stairs as you board |
| `sixthPassenger` | anchor | previous ending stayOn | §3.7 |
| `minute` | anchor | previous ending breakLoop | The platform clock shows 2:18 for 1s |
| `again` | deniable | any prior night | Old Man stage 0: *"Don't miss your stop. …Again."* |
| `call` | deniable | any prior night | G1 |
| `freshInitials` | deniable | any prior getOff | Bench: *"Two sets of initials carved into the wood now. One is fresher. They're not yours. Are they?"* (3+ getOffs: *"Several sets of initials. The newest is still pale. They're not yours. Are they?"*). The fresher set is drawn legibly with the skin's initials. On night 1 the carving is worn glyph shapes matching the billboard. |
| `coins` | deniable | any prior `threwCoin` | `platformEdge` step 1 gains *"One coin lies right at the edge. Exactly where you'd throw it."* (2+ nights: *"A small pile of coins lies at the edge."*). Never a number. |
| `sixWindows` | deniable | any prior stayOn | H: the empty lit window holds a figure |
| `routeGrows` | deniable | any prior stayOn | The route map has one permanent extra unlabeled dot from trip 1 (separate from the seeded trip 3+ dot) |
| `facingYou` | deniable | previous ending breakLoop | The Silent Passenger faces *you* from trip 1, not the door |
| `doubt` | bold | night ≥ 2 | Old Man reveal: *"I've been waiting longer than you. …I used to be sure of that."* (ruling 5) |
| `watch` | bold | previous ending getOff and that night held `businessmanWatch` | `businessmanWatch` card: *"A wristwatch, still warm. Its hands have stopped at {endedAtLocal}. You wind it. The hands do not move. You wind it again anyway. Engraved on the back: So you're never late. The rest is worn smooth."* It's the only place 2:17 breaks, and it breaks toward the player's real life. |
| `figureSilhouette` | bold | 2+ prior getOffs | The Empty Platform figure wears your skin's silhouette and `coatColor` |
| `newRow` | bold | any prior stayOn | `passengerList` card: *"…over and over. At the bottom, a line in fresher ink, initials only: {initials}. Its STATUS reads the same word as all the others."* (the last stayOn skin's initials) |
| `nextCarriage` | bold | 2+ prior stayOns | On trips 5-6, dim seated silhouettes in the next carriage, seen through the connecting-door window. They're uncountable and never interactable. |
| `sharedCoat` | bold | `rememberer` exists | The Silent Passenger's coat is the rememberer skin's `coatColor`. No text. |
| `struckRow` | bold | any prior breakLoop | `passengerList` card: *"…Every entry in that column reads the same word, except one, which has been struck through."* |

### 6.4 Memory beats by night
| Night | Budget | Pool | Notes |
|---|---|---|---|
| 1 | **0** | none | The canonical first run, untouched |
| 2 | **anchor + up to 2** (max 3) | deniable only | Draws come from `rngFor(runSeed,'memoryBeats')`, weighted 2:1 toward the previous ending's family |
| 3+ | **anchor + up to 2** (max 3), **at most 1 bold** | deniable + bold | 15% forgetting chance, never twice in a row: then 0 beats, the night is still recorded. G2 is eligible but doesn't count toward the budget. |

The Call counts toward the budget. The sixth passenger counts as one. If both `newRow` and `struckRow` are drawn, keep only the one tied to the previous ending.

### 6.5 Guardrails (binding; they extend the guide's §5)
- **M1. Meta never pays out mechanically.** It never touches `requiredClueIds`, `vanishingPassengerId` or the vanish pool, any clue's *availability*, the structure or timing of stations 5-7, any fallback timer, or any ending's firing conditions. A clue's *description* may vary; the clue is still awarded on exactly the same terms (Invariants 3, 5 and 6). `pickVanishCandidate` and `pickRequiredClueSubset` keep their `(runSeed)` signatures and never receive meta.
- **M2. The first run is sacred.** With an empty meta-save, the run is identical to a build without meta. Every replay element is additive and gated on `nightPlan.night >= 1`.
- **M3. Never announce.** No counter, toast, achievement, "Night N", changed title text, or rendered `night` / `totalNights`.
- **M4. Remember behavior, never stats.** Every trigger is something the player did: an ending, a choice, a clue held, a coin thrown.
- **M5. The sixth passenger** is outside the vanish pool forever (Invariant 1). It has no stages, flags or clues, and is excluded from seat loyalty.
- **M6. Budget is enforced in `resolveNight`, never in scenes.** A scene only asks `plan.beats.includes(id)`.
- **M7. Deniability.** Night-2 beats are deniable only, at most one bold beat a night, and §2's limits on names and initials apply to every beat.
