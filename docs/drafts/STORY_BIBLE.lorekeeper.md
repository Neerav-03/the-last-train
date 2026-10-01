# STORY_BIBLE.lorekeeper.md — THE LAST TRAIN

*Draft story bible from THE LOREKEEPER, Round 2. It folds in THE DIRECTOR OF DREAD's Round 1 paper where that paper was stronger. Where we disagreed, the resolution is stated inline and marked **[resolved]**. `docs/STORY_REFINEMENT_GUIDE.md` §5 invariants bind everything here. A section that touches one names it.*

**How to use this document.**
- §1 is **sealed canon**. It is for the dev team only and is never shipped as text.
- §2 is the hard list of things the player must never be shown.
- Everything after §2 is about **how canon reaches the player**: through objects, behavior, timing and absence, never through explanation.

**The one test every lore fact must pass** (adopted from the Director): *name the moment it reaches the player and the feeling it produces.* If you can't name both, the fact stays in §1 and never reaches the screen.

---

## 1. Sealed canon (dev-only, never shipped as text)

### 1.1 What the train is
The train is the **2:17 AM Down Local of the Mandal Circular Railway (M.C.R.)**. It was the last scheduled service on a suburban loop line, which was withdrawn the same night. It left Platform 4 and never arrived. The line closed and its terminus, **HOME**, was demolished, which is why Home's tracks "simply stop." The train is still running the schedule it was never allowed to finish.

Two things on screen hint at the original line:
- the older poster under Kalyanpur's poster ("a train line you've never heard of")
- the M.C.R. stamp on fixtures

The line's name is **never spelled out in full on screen**. Only fragments appear.

### 1.2 The rules
- **R1. Train time.** It is always 2:17 aboard. Any watch or clock that boards takes on the train's time. Riders half-remember their own time ("This is the 6:40, isn't it?") and feel it slipping away.
- **R2. Who it stops for.** It stops only for someone standing **alone on a platform at 2:17 whose night is unfinished**: someone who, in that minute, cannot bear to arrive where they are going. Nobody remembers boarding. You don't choose to board; you fail to refuse.
- **R3. Seven calls.** The original Down Local called at seven stations, and the train keeps that count.
  - **Calls 1-4 are borrowed.** Each is a platform lifted from one rider's unfinished night, at that rider's moment.
  - **Calls 5-7 belong to the train.**
    - The Empty Platform is where confiscated memories are left.
    - Home is the terminus.
    - The Last Stop is ticket inspection, held in the carriage itself.
  - *This split is the in-fiction reason for Invariant 2: stations 5-7 are never randomized or reordered because they belong to no rider.*
- **R4. Tickets.** Every rider holds a ticket they will not hand in. The Conductor collects only at the Last Stop, and only from the **candidate** (the one unlisted person aboard). The open palm is a ticket inspection.
- **R5. Three exits.**
  - **Set down short (getOff).** The fare is the memory of the ride. It is left at the Empty Platform. Your unfinished thing is untouched, so some future night you are on Platform 4 again. The street "looks almost right" because each set-down lands a little further from right.
  - **Stay (stayOn).** You keep your ticket and your row goes on the manifest. You become a rider, and the next night's candidate is someone new.
  - **Brake (breakLoop).** The emergency brake is crew equipment and runs outside the train's clock. Pulling it opens **one minute of 2:18**, the only minute that has ever passed aboard. Memory aboard must always be carried by exactly one person, **the Rememberer**. The train takes that person's face so that nobody aboard can be reminded by it. Whoever pulls the brake keeps their memory, so they become the Rememberer, and the previous Rememberer goes out into 2:18. *Breaking the loop ends your cycle by making you the part of the train that remembers. It is a trade, never a victory.*
- **R6. Witnessing.** A rider's illusion thins when someone **not on the manifest** sees it clearly. Only the candidate is unlisted, so only the candidate can witness. That is why riders brush you off and still talk to you. It is also why the child fades: your attention does it. *Pacing consequence: reveals should land late in the run, as the candidate's witnessing builds up (§6.1).*
- **R7. True arrival.** True arrival means your ticket is collected **and** you walk through Home's door. It has happened exactly once, decades ago, to **Sarla Rao** (§3.1). This is the long-term spine for expansions ("clearing the manifest"). No current ending achieves it.
- **R8. The same night repeats.** Every night is the same night. Riders reset when they "step off" at the Last Stop and are back in their seats the next night. Only two things build up over time: **the manifest and the Rememberer.** That is exactly what the meta-save stores (§7).
- **R9. The line is open at 2:17.** The Platform 4 payphone connects to the carriage. The breathing on it is the Rememberer listening for whoever is alone on the platform. The **voice under the Student's static is different**: it comes from outside, from whoever is calling *you* and waiting for you. The two sounds must never be mixed in audio design. Breath means the train. Voice means the outside.

### 1.3 The player (the candidate)
- **They are not new.** Kalyanpur's ambience already says it looks like "every other night you've taken this train." Each getOff wiped that memory.
- **Why they aren't "on the list":** set-down candidates are struck from the manifest. Station 4 is "[UNLISTED]" (your hometown, named after your status). The bench initials are "not yours. Are they?"
- **What breaking the loop means in-fiction:** the Rememberer's "You weren't supposed to remember" is said to a candidate who has pieced the clues together. A player assembling clues across runs is, in-fiction, remembering.
- **Their name is never shown** (§2).

### 1.4 What happens to the vanished passenger
The Businessman or Student, whichever this run's seed picks, **steps off to try to arrive and fails**. No rider can arrive without a witness and a collected ticket. They are back the next night (R8). A vanish is a failed attempt to get off, never a taking. That is why their trace (watch, headphones) is left warm.

### 1.5 Sealed names (on screen: **never**)
| Who | Canon name | Wound (one line) |
|---|---|---|
| Old Man | Govind Rao | Missed the original 2:17 that his wife Sarla boarded. She is the only person who ever truly arrived. He has been riding the train she left. |
| Woman | Meera | Her infant son died at the hospital near Madhav Nagar. She walked to the station instead of going home. |
| Businessman | Vikram Sethi | Missed the 6:40 to his dying father. At 2:17 he is only *late*. At 2:18 he would be *too late*. |
| Student | Tanvi | A voicemail she never played, from the night her mother died. She plays static instead. |
| Silent Passenger | (none) | The current Rememberer: the last person who pulled the brake. |
| Conductor | Guard D. Pillai, M.C.R. | The guard of the original service. He is on duty, not riding, and can't finish a run whose terminus is gone. |
| Canonical STATUS word | **WAITING** | Sealed. It is never rendered (§2). |

---

## 2. Never shown on screen

The Director's never-explain list is adopted in full, plus the lore items below. **[resolved]** notes mark where my Round 1 proposals were dropped or reshaped.

**Names and words**
1. **The player's name.** Never displayed and never asked for. The billboard at [UNLISTED] shows letter *shapes* matching the skin's bench initials, so the player sees them but cannot read them. **[resolved: the billboard used to say "your name" without showing it; now it shows something without saying it.]**
2. **Passenger names.** Never shown: not on the Passenger List, not in the ledger, not in dialogue. The list has "names" the player's eye slides off. **[resolved: I dropped names from the list and ledger.]**
3. **The STATUS word.** Never rendered, on any run. On replays the loop "remembers" by **adding a row**, never by revealing the word (§7.3). **[resolved: I dropped "WAITING" on screen.]**
4. **The words** "Rememberer", "manifest", "candidate", "Mandal", "Mandal Circular Railway", "Sarla", "terminus", in any dialogue or clue card. Fragments on fixtures are allowed: a stamp reading "M.C.R.", a torn poster.

**The Silent Passenger**
5. **Their face**, ever, including in reflections and in 3D. No camera angle may resolve it.
6. **Them turning.** They are never seen turning or rising, except the single scripted stand at the Last Stop.
7. **More than two spoken lines in a whole run.** The two are "You weren't on the list" (trip 6) and "You weren't supposed to remember" (breakLoop). The §6.6 reactive lines move off them (§3.5).
8. **Any image of the player becoming faceless**, or of the Silent Passenger with the player's face or name. Replay echoes are limited to *one* shared silhouette or colour detail, with no text.

**Unanswered questions**
9. What happened at 2:17 originally. The newspaper clipping stays torn mid-sentence. Only its first clause is legible (§9).
10. Whether the passengers are dead.
11. Where the child went.
12. What's behind Home's door. Light and voice only, never a room.
13. Where getOff leads. Never anything past "a street that looks almost right."
14. Who the Conductor is. No name and no backstory. The badge fragment is the ceiling.
15. Who scratched out the station names.
16. Any statement of the rules in §1.2, by any speaker, ever.
17. What happens after breakLoop. The final card has **no text** (§10, item 2).

**Never displayed as a number**
18. **Loop counters**, run numbers, "Night N" cards, or any statistic of past play. The meta-save remembers behavior and shows it only as changed objects (§7.4).

---

## 3. Per-passenger bible

The format for each passenger is: **wound** (sealed), **behavior** (the main way they reach the player), **beats** (text, all leaf or bonus tier unless marked otherwise), **never say**.

### 3.1 The Old Man (seat 1): the first rider
- **Wound.** Govind and Sarla held two tickets for the original 2:17. He was late, and she boarded alone. The train vanished. For years he stood on Platform 4 at 2:17 until it came for him. Sarla is the ledger's one arrival. He has been riding the train she already left.
- **What his existing lines mean.**
  - "Don't miss your stop" is his own guilt.
  - "I've been waiting longer than you" is simply true.
  - He scratched every station off the maps except HOME.
  - "Ask the conductor" is because the Conductor punched Sarla's ticket.
  - "Keep this. It won't get you anywhere" is because tickets only work for their owner.
- **Behavior (from the Director).**
  - His head turns a few degrees further toward your seat each trip.
  - If you chose `oldManPressed`, he waits for you to speak. If you chose `oldManIgnored`, he talks to the window.
  - By trip 6 his hands have drifted from the cane into the folded pose. That pays off the stayOn line "hands folded the way the old man folds his," which the current cane sprite contradicts.
  - When exhausted, he alone repeats a line: his *first* one, "Don't miss your stop.", heard again on trip 7. The loop restarting politely.
- **Beats.**
  - `oldTicketStub` text gains: *"On the back, in faded pencil: ×2. It was never punched."*
  - Leaf line at `minTrip: 5`: *"She had the window seat. I had the tickets."*
  - **Takes over the §6.6 reactive lines** from the Silent Passenger. The guide allows this ("from the Old Man, or the Silent Passenger"):
    - `vanishLookedAway`: *"You looked away. Most do."*
    - `vanishHeldGaze`: *"You held it. That's rarer."*
    - Both stay on `minInteractions: 5`. This collides with his `avoidedWoman` stage at the same threshold. Resolve by array order: the `avoidedWoman` line wins if set, otherwise the vanish line plays.
  - Replay echo: *"Don't miss your stop. …Again."*
  - Deep replay: *"I've been waiting longer than you. …I used to be sure of that."* **[resolved: this replaces the Director's "Not longer than you. Not anymore." The Old Man has ridden for decades, so a candidate cannot literally outlast him. Doubt is canon-safe. A plain claim is not.]**
- **Never say:** Sarla, wife, "she", the original night, or that he missed a train.

### 3.2 The Woman (seat 2)
- **Wound.** Her infant son died at the hospital near Madhav Nagar. She sat on the station bench instead of going home. The train holds her in the minute before she was told. The child is a memory she is carrying, which is why his reflection doesn't move. Your witnessing thins it (R6), which is why the child fades from trip 3.
- **Behavior (from the Director).**
  - Her rocking is locked to the wheel rhythm and stops when the train stops.
  - After `childGone` she keeps rocking at stations, out of rhythm.
  - `comfortedWoman`: she slides over and leaves the seat beside her empty for you.
  - `avoidedWoman`: she turns her back.
  - In the Procession (§4F) she holds the empty air out to you (Tier 1 accept/decline, flavor only).
- **Beats.**
  - Madhav Nagar bench flavor variant: *"An infant-size hospital wristband, pushed between the slats."*
  - Her ticket, as a narration line in a leaf stage at `minTrip: 5`: *"Tucked into the seat beside her, a ticket. PLATFORM ADMISSION — NOT VALID FOR TRAVEL."*
  - Post-`comfortedWoman` line: *"They wrote the time down for me. I left it on a card somewhere."* This pays off Madhav Nagar's blank index card.
- **Never say:** "dead", "died", the hospital, the child's name, or any time of death.

### 3.3 The Businessman (seat 3; in the vanish pool)
- **Wound.** He stayed for a meeting and missed the 6:40 to his dying father. He got off at the hospital's station at 2:17 and couldn't walk the last block. While the watch reads 2:17 he is only late. "Seven. For you." means he has counted thousands of stops for himself.
- **Behavior (from the Director).**
  - **If he is not the vanisher:** from trip 5 he is standing at the door every time you enter. He never gets off. *"Is this mine?"*
  - **If he is the vanisher:** his briefcase stays on the seat through the Last Stop.
  - After "For you" he is non-verbal; interacting shows only the watch face.
- **Beats.**
  - `businessmanWatch` text gains: *"Engraved on the back: never late again. The rest is worn smooth."* **[resolved: I softened the Round 1 "— Papa", which handed over the wound.]**
  - Kalyanpur vending machine, first inspect only, flavor variant (the inspect-3 choice is untouched): *"An old receipt in the tray: 6:38 PM. ONE (1) COFFEE."*
  - Pre-reveal line: *"At 2:17 I'm late. That's all. Just late."*
- **Never say:** father, hospital, "too late", or 2:18.

### 3.4 The Student (seat 4; in the vanish pool)
- **Wound.** At 11:52 PM her mother left a voicemail. Tanvi had headphones in and didn't answer. Her mother died that night. She has never played the message and listens to static instead. Under the static are voices from outside calling for riders (R9). Her own name has never come. She hears *yours*.
- **Behavior (from the Director).**
  - Her foot taps with the wheels, drifts off-beat after trip 3, and by trip 6 taps in time with *your* clicks.
  - At stage 3 she holds a headphone out. If you don't take it, her arm stays extended on every later visit.
  - **If she is the vanisher:** her headphones lie on the seat, hissing louder as you approach.
  - When she hands them over, all carriage audio drops for 2 seconds.
- **Beats.**
  - Headphones flavor: *"The cable ends in a bare jack. It isn't plugged into anything."*
  - Her phone, face-up on the seat: *"1 VOICEMAIL. Unplayed."* (no name, no time)
  - Line: *"It's not my name. I've listened for mine. Mine's under yours."*
- **Never say:** mother, "maa", the time of the call, or what the voicemail says.

### 3.5 The Silent Passenger (seat 5): the current Rememberer
- **Canon.** They are the last person who pulled the brake. On a first run, that is a stranger. After a breakLoop run, it is the player's previous skin. They walk the stations with each candidate: the Sector 0 footsteps "half a beat behind" are them studying the person who might replace them. The payphone breathing is them listening (R9).
- **Keeping every reading open.** Canon holds exactly one truth. The *screen* supports at least four readings, and no single beat may close any of them:
  - it's you, from another time
  - it's death, or the train itself
  - it's the previous person who escaped
  - it's someone you lost

  The rule: **at most one replay echo per run that links them to the player's previous skin, always visual, never textual, always deniable** (one shared coat colour, never the face, never a line).
- **Behavior (from the Director).**
  - They always face the end of the carriage you last came in from, and are never seen turning.
  - The §6.6 lines move to the Old Man (§3.1), so **"You weren't on the list" is their true first speech.**
  - If the player never interacted with them, they are the one who doesn't rise in the Procession.
- **Beats.**
  - *"Their shoes are wet."* (It only rains at Kalyanpur. They "never" get off.)
  - On their seat, after they stand at the Last Stop, there is a ticket. On inspect: *"The same printing as yours. The serial number is one lower."* This is the single strongest canon tell. It is optional, bonus-tier, and gated behind an Invariant 2 review (§9 item 16).
- **Never say or show:** any word from §2 items 5-8. No line beyond their two.

### 3.6 The Conductor (Last Stop)
- **Canon.** He is on duty. He collects tickets. He is not malicious. His ledger records departures with no arrivals, **except one**.
- **Behavior (from the Director).** One glimpse on trip 4, through the connecting-door window, walking away. That makes the Last Stop line "You have never seen him before" something the player knows is false. Canon reason: you *have* seen him, on every night you got off and forgot. The narration is accurate to your memory, not to the facts.
- **Beats.**
  - `conductorsLedger` text gains one sentence: *"There are no arrivals. Except one, near the front, in ink gone brown."* (unnamed)
  - One narration line added to `INTRO_PART_2_OPEN` (text only, beat order unchanged): *"The badge on his coat is worn almost smooth. Three letters: M.C.R."* This matches the stamp on the Sector 0 sign screws ("bolted by the same hand").
  - If `oldManRevealed` is set, one leaf line at the Last Stop: his palm pauses at your pocket. *"That one isn't yours to give."*
- **Never say:** his name, the original night, what arriving means, or anything about the brake.

---

## 4. Set-pieces

The Director's set-pieces A-G all fit the canon. None contradicts it. The canon tightened two of them (E and F), noted below.

**Jumpscare budget.**
- **First run:** 2 (D and F).
- **Replays:** 1 more, held back until the third night or later (G2).
- Everything else is dread, not a jump.
- Every flash or shake effect checks `settings.reduceFlashing` / `settings.screenShake` and has an authored quiet fallback (Invariant 9).

| ID | Set-piece | Where | Canon rule it expresses | Notes, guardrails |
|---|---|---|---|---|
| **A** | **Tunnel Sweep.** Bulbs die from the far end toward you. Only the tunnel lamps sweep the windows, every ~4s. Between sweeps, positions shift; the Silent Passenger is one row closer each time. You reach the door in the dark, the bulbs snap on, and everyone is exactly where they started. | Trip 6 travel phase | R8 (the carriage resets politely). The Rememberer is studying the candidate. | The anti-scare: no stinger. Seed the sweep count and offsets with `rngFor(runSeed,'sweep')`. With `reduceFlashing`, sweeps become slow gradients. The Silent Passenger is never seen *moving*, only having moved (§2 item 6). |
| **B** | **Reflections.** Windows turn to mirrors in tunnels and run one state behind the room. | Every travel phase, 3D (DOM fallback: a CSS window overlay) | The glass shows **what the train still holds** (the manifest), not what is in the room. | Trip 2+: the vanished passenger is still seated in the glass (R8: they never left). After `childGone`: the Woman's reflection still holds the child. Trip 5+: your reflection is seated while you stand (a seat is being kept for you). Never show the Silent Passenger's reflected face. Their reflection is a back of a head, even when they face you. |
| **C** | **Half a Beat Behind.** Every click is echoed by a footstep ~400ms later, positional and behind the camera, stopping when the camera turns. When you're idle, it takes one step more than you did, and then `followFootsteps` appears. | Sector 0 | The Rememberer walks the stations with the candidate. | Also fixes the pacing hole where two quick inspects let players board before the 13s footstep beat: the footstep reveal also fires on the 2nd inspect if it hasn't fired yet. The `unseenCompanion` clue stays bonus tier (Invariant 5). |
| **D** | **The Silent Return.** The figure moves only when unobserved. The train comes back without a sound. The camera turns back and the lit doorway is right beside you, with someone standing in it. The stinger plays only then. **JUMPSCARE #1.** | Empty Platform (station 5) | The figure is your own set-down memory (§9 item 12). The train has come back for its unprocessed candidate. | Must keep the existing reveal ordering and fallbacks (`EMPTY_PLATFORM_REVEAL_*`, Invariant 2). The person in the doorway is **the Conductor's silhouette**, which is canon-safe and sets up "you have never seen him before." Not the Silent Passenger: that would break §2 item 6. |
| **E** | **Dinner's Almost Ready.** After the reveal, the Door Home opens a crack. A warm voice says "Dinner's almost ready." Then the same take again, the same breath. Then again. The door shuts by itself. | Home (station 6), after the existing void/`RedEmergencyOverlay` beat | R7: Home only *plays back* for anyone whose ticket isn't collected. The warmth is a recording because you cannot arrive. | The reveal timing (`HOME_REVEAL_*`) stays untouched; E is appended after it. **Canon constraint:** the door shows light only, never a room (§2 item 12). The voice uses the existing announcement text, "Dinner's almost ready.", so no new words are needed. |
| **F** | **The Procession.** Each passenger walks past your seat with one final gesture. The vanished passenger walks out with them. Blackout. In total darkness, one slow breath at your ear: the payphone breath from minute one. The lights return on the Conductor. **JUMPSCARE #2.** | Last Stop intro (replaces the `INTRO_PART_1` text box) | R8 (riders "step off" to reset). R9 (the breath is the Rememberer, who stood before you as the lights went out). | **Invariant 2 review needed.** The beat order is kept exactly: passengers leave, Silent Passenger stands, blackout, conductor, sign, choice. Only the *presentation* of `INTRO_PART_1` changes from text to staging. The exhausted Silent Passenger (never interacted with) is the one who doesn't rise. Gestures: Old Man taps his breast pocket where the stub was; Woman holds out the empty air (Tier 1); Businessman shows you the watch face; Student leaves one earbud on your seat. |
| **G1** | **The Call.** On a replay, the payphone is ringing on arrival. Answer it: breathing, then a flat voice reads back the last line of your previous ending. | Platform, replay only | R9: the Rememberer on the line remembers your night. | It's a memory beat, so it counts toward the per-run memory budget (§7.4). Answering sets the run flag `answeredCall`. |
| **G2** | **The Reserve.** **JUMPSCARE #3**, held back. Rolled from `rngFor(runSeed,'reserve')` among two or three authored scares in trip 1's carriage. | Night 3+ only | No canon load. Its job is to stop a returning player feeling safe in the first room. | Must not touch passengers' dialogue state or the vanish system. |

**Two additions from canon:**
- **H. Six windows.** During Train Arrival, the two lit windows must show something wrong (the Director's audit item 2). Show five seated silhouettes and **one lit, empty window**. On a replay after stayOn, the sixth window holds a figure. This pays off the stayOn line "There are six passengers aboard" without saying it.
- **I. The Last Light (fixes the trip 7 sag).** Trip 7 must be the scariest room, not trip 6 again.
  - Every bulb but the one over your seat is dead.
  - The riders sit facing forward toward the conductor's end, all in the same posture.
  - The window glass reflects **no one** (the train is about to reset them).
  - Interact with the Old Man and he says his first line, "Don't miss your stop.", as if he has never seen you.
  - Every other passenger is non-verbal.
  - The door works as on every trip: it unlocks when the train stops.

---

## 5. Pacing plan

**Target:** 20-30 minutes for a curious first run (the current build runs 8-15), with a door-rusher floor of about 12. The shape: a slow climb, a false calm, a peak at station 5, the Home curdle, then a **higher** finale. The canon reason for each change is in brackets.

### 5.1 Structural changes
1. **A travel phase every trip, 45-90s.** Tunnel, sweeping lights, wheel rhythm. Carriage passenger behavior (rocking, tapping) syncs to the wheels. [R3: the dark between borrowed stations is the train's own.]
   - Duration comes from `rngFor(runSeed,'travel:'+tripNumber)` within a per-trip band: trips 1-2 about 45s, trips 5-7 about 80s.
   - Set-pieces A and B live here.
   - The travel phase always ends by itself. It is never a choice and never a lock the player has to solve (Invariant 8).
2. **The door is locked while the train moves** and opens when it stops. [R4: doors open only at calls.] This turns the carriage from a menu into a room you are shut in. It needs a fallback timer like the station `*_FALLBACK_MS` timers, so a stuck travel state can never soft-lock the run.
3. **Exhausted passengers go non-verbal** instead of looping their last line. Each has an authored idle beat: a look, a gesture, the watch face. The one exception is the Old Man on trip 7 (§4 I).
4. **Platform fixes.**
   - The "...not for passengers" PA line moves to 10-15s, ahead of `PROGRESSION_FALLBACK_MS` (27s), so everyone hears it.
   - The payphone gets a faint ring-tick audible from spawn, drawing the player toward its x=87 position. No position change is needed.
5. **Madhav Nagar becomes a deliberate false calm with exactly one wrong detail.** It is the Woman's station (§8.2). As you walk back to the train, the Woman is standing in the carriage doorway looking at the bench. It is the only time she is ever out of her seat. When you board, she is seated and rocking as if she never moved. Cosmetic only; it touches no flags.
6. **Trip 4 sag:** the Conductor's glimpse (§3.6) and the first reflection anomaly land here.
7. **Endings.**
   - **breakLoop no longer repeats Last Stop lines** (§10, item 2).
   - **The seat-loyalty coda moves earlier in breakLoop**, so the ending closes on "You weren't supposed to remember" followed by the silent card, not on a warm line. getOff and stayOn keep the coda at the end: its warmth suits a "you lost something" ending and undercuts nothing there.

### 5.2 Escalation map (target dread, 1-10)
| Beat | Now | Target | Driver |
|---|---|---|---|
| Platform | 4 | 4 | PA fix, payphone pull |
| Train Arrival | 5 | 6 | H. Six windows |
| Trip 1 + travel | 4 | 4 | Door lock, first wheel rhythm (a deliberate low) |
| Kalyanpur | 3 | 3 | Unchanged, correctly mild |
| Trip 2 + travel | 5 | 5 | B (vanished passenger still in the glass) |
| Madhav Nagar | 2 | 4 | Woman in the doorway |
| Trip 3 | 5 | 6 | childGone, Woman rocking out of rhythm |
| Sector 0 | 5 | 6 | C. Half a Beat Behind |
| Trip 4 | 4 | 6 | Conductor glimpse, reflection anomaly |
| [Unlisted] | 6 | 6 | Billboard initials shapes (seen, unread) |
| Trip 5 | 6 | 7 | Your reflection is seated |
| Empty Platform | 8 | 9 | D. Silent Return (JUMP #1) |
| Trip 6 | 6 | 7 | A. Tunnel Sweep, "You weren't on the list" |
| Home | 7 | 8 | E. Dinner's Almost Ready |
| Trip 7 | 5 | 8 | I. The Last Light |
| Last Stop | 6 | 9 | F. Procession (JUMP #2) |
| Ending | 4-6 | 6 | Silent final card (breakLoop), coda placement |

---

## 6. Reveal gating and the 2:17 budget

### 6.1 minTrip-gate the reveals, but respect the vanish system
Right now a clicky player burns "Seven… For you" and the name-in-static in three minutes. Canon (R6) says reveals should land as witnessing builds up, which means later in the run. **But the vanish system is the binding constraint.** The Businessman's arc was deliberately written to resolve in trip 1 so his vanish never orphans content. A plain `minTrip` would break that in runs where he vanishes.

**Rule: vanisher-aware gating.** Add an optional `minTripIfStaying` field to `DialogueStage`:
- **When the passenger is this run's `vanishingPassengerId`:** the field is ignored, and the stage plays on trip 1 as today.
- **Otherwise:** the stage needs `tripNumber >= minTripIfStaying`.

| Stage | Gate |
|---|---|
| Businessman `minInteractions: 4` ("For you") | `minTripIfStaying: 3` |
| Student `minInteractions: 6` (headphones and name) | `minTripIfStaying: 4` |
| Old Man `minInteractions: 6` (reveal + `oldTicketStub`) | `minTrip: 4`. He is outside the vanish pool, so a static gate is safe. |
| Woman | Already gated (`minTrip: 3`) |
| Silent Passenger | Already gated (`minTrip: 6`) |

**Safety checks:**
- **Invariants 5 and 6 are untouched.** All three passenger clues are already excluded from `requiredClueIds`, so delaying them can never lock out breakLoop.
- **Floor test (§0 rule 3):** a staying passenger's reveal needs trip 3-4. Every run reaches trip 7, so the reveal is always reachable.
- **The vanisher's trace carries their clue.** If the vanisher's reveal never played on trip 1, inspecting their trace (the briefcase/watch, or the hissing headphones) awards `businessmanWatch` / `staticRecording` with the trace's own text. No content is orphaned. Review this with the Invariant 1 owners: it adds a second award path but doesn't change the pool.

### 6.2 2:17 budget: about 4 appearances during play, each in a new context
Canon picks which ones stay. They are the ones that belong to **the train** or to the **one rider whose wound is time**:
1. **Platform station clock:** the first sighting.
2. **Businessman's watch:** dialogue line and clue. The rider.
3. **[UNLISTED] timetable:** "ARRIVAL — 2:17 AM / DEPARTURE — NEVER", the schedule.
4. **Last Stop sign plate:** the train names its own time.

The rest are cut or masked. Each is a text change listed in §10:
- **`ticket` clue:** keeps "2:17 AM". It's an inventory object the player has from the start, not an on-screen sighting.
- **`oldTicketStub`:** "the time survives: 2:17" becomes *"the time survives only as far as 2:1—, the rest torn away."*
- **Home clock:** stops reading 2:17. *"It reads the time you expected it to. The second hand lifts, and settles back where it was."*
- **`conductorsLedger`:** "timed at 2:17" becomes *"timed tonight."*
- **Endings are exempt.** stayOn's "It reads 2:17" lands precisely because play has been rationed.

The breakLoop **2:18** never appears in that ending. It appears once, on the *next* run's platform clock, for one second, and only after a breakLoop night (§7.3). That is the loop remembering, and it's deniable.

"Your name" also drops from three uses to two felt ones:
- the static (heard)
- the ledger ("almost your own")

The billboard now shows initial-shapes and no longer *says* "your name" (§10).

---

## 7. Reincarnation and skins (merged design)

### 7.1 In-fiction model
| Previous night's ending | Who you are tonight | What the train remembers |
|---|---|---|
| none (first run) | The default skin | Nothing. **The canonical experience.** |
| getOff | **The same skin.** You came back and don't remember. | Your set-down memory is on the Empty Platform. Your initials are on the bench. |
| stayOn | **A new skin** | Your previous skin is a rider. It is the **sixth passenger** in this carriage. |
| breakLoop | **A new skin** | Your previous skin is the Rememberer: the Silent Passenger now shares one visual detail with it. |

The skin is a **person**, not a costume. Every skin has its own unfinished night. It reaches the screen only through leaf content: the [UNLISTED] corner-shop sign, the Home photograph, the bench initials, the billboard letter-shapes, and the coat silhouette.

### 7.2 Data

The meta-save lives in a separate localStorage key, **`lastTrain.meta.v1`**, and is **never cleared by `startNewGame()`**.

```ts
// src/engine/meta.ts (new)
export interface NightRecord {
  night: number;              // internal ordinal; NEVER rendered (§2 item 18)
  runSeed: number;
  skinId: string;
  ending: EndingKey;
  endedAtLocal: string;       // 'HH:MM', the real local clock when setEnding fired (for the watch beat)
  seatAffinity: string | null;          // §6.5 result (max interactionCounts)
  heldClues: string[];        // passenger/bonus clues held at the ending, e.g. 'businessmanWatch'
  behavior: {                 // behavior, never stats
    comfortedWoman?: boolean; avoidedWoman?: boolean; heldGaze?: boolean;
    threwCoin?: boolean; answeredCall?: boolean; tookReceipt?: boolean;
  };
  echoLines: string[];        // up to 3 inspect lines the player actually read, for the sixth passenger
}
export interface MetaSaveV1 {
  version: 1;
  nights: NightRecord[];      // append-only, keep the last 12
  currentSkinId: string | null;
  rememberer: NightRecord | null;       // most recent breakLoop night
  lastForgotNight: number | null;
}

// src/data/skins.ts (new)
export interface SkinDef {
  id: string;
  initials: string;           // bench carving and billboard letter-shapes (never a full name)
  coatColor: string;          // the ONE shared detail allowed for echoes
  silhouetteId: string;       // DOM sprite / 3D mesh variant
  carriedItem: 'umbrella' | 'satchel' | 'tiffin' | 'none';
  shopSignText: string;       // [UNLISTED] corner shop: "a name you've never once seen on it"
  photoNote: string;          // Home photograph leaf variant
}
```

**Resolving the night.** `startNewGame()` computes a pure **`resolveNight(meta, runSeed)`** and stores the result in the existing run state (the `persist` `partialize` list). That means a mid-run reload never re-rolls it (Invariant 7).

```ts
interface NightPlan {
  skinId: string;
  forgot: boolean;            // "the loop forgets"
  memoryBeats: MemoryBeatId[]; // 0-3, chosen by rngFor(runSeed,'memoryBeats')
  sixthPassenger: { skinId: string; seatBeside: string; echoLines: string[] } | null;
}
```
- **`skinId`:** if the last ending was getOff, it's `meta.currentSkinId`. Otherwise it's `pick(rngFor(runSeed,'skin'), SKINS minus skins that stayed or broke in the last 6 nights)`.
- **`forgot`:** see §7.5.
- **`sixthPassenger`:** non-null only when the last ending was stayOn and the night didn't forget.

**Writing.** `setEnding()` appends exactly one `NightRecord`, keyed by `runSeed` so it can't double-write.

**Settings** get a neutral "Forget everything" control that deletes the key. It is the player's own reset and is never mentioned in fiction.

### 7.3 Memory beats (the experience)

Every beat is deniable, behavioral and leaf or cosmetic. Each lists its trigger and where it lands.

| Beat | Trigger | What the player experiences | Canon |
|---|---|---|---|
| **Fresher initials** | any getOff in `nights` | Bench: *"Two sets of initials now. One is fresher."* (for 3+: *"Several sets. The newest is still pale."*) | R5 set-down |
| **Walking out** | last ending getOff | During Train Arrival, a figure in **your own coat** walks up the stairs, off the platform, as you board. | Yesterday's you, leaving into "a street that looks almost right" (R8) |
| **Again** | any prior night | Old Man's first line: *"Don't miss your stop. …Again."* | He has watched you ride |
| **The Call** (G1) | any prior night | Payphone ringing, and your last ending's final line read back flatly | R9 |
| **Sixth passenger** | last ending stayOn | A sixth seated figure in your previous skin's coat, head down, seated beside your last `seatAffinity` passenger. Never speaks. Interacting shows one of *your* `echoLines` from last night, verbatim. Never vanishes. Leaves in the Procession with the others. | stayOn: you became a rider. "There are six passengers aboard." |
| **Six windows lit** | last ending stayOn | The arrival's empty sixth window (§4 H) now holds a figure | Same |
| **The minute** | last ending breakLoop | The platform clock reads **2:18** for one second on arrival, then snaps to 2:17 | R5: the one minute that passed |
| **Facing you** | last ending breakLoop | The Silent Passenger faces *you* from trip 1, not the door you came in by | The Rememberer knows you |
| **One shared detail** | last ending breakLoop | The Silent Passenger's coat is your previous skin's `coatColor`. No text. | Same, deniable |
| **The watch** | last ending getOff **and** `heldClues` includes `businessmanWatch` | Businessman's watch shows `endedAtLocal`: the only time 2:17 breaks during play | An object that left with a set-down candidate keeps outside time. Behavior-based, never a counter. |
| **Coins** | any prior `threwCoin` | Empty Platform edge: one coin per prior night you threw one. They have all landed here. | Set-down memories collect here |
| **Doubt** | 3+ nights | Old Man: *"I've been waiting longer than you. …I used to be sure of that."* | §3.1 |
| **A new row** | any prior stayOn | `passengerList` clue variant: *"…and at the bottom, a line in fresher ink. Its STATUS column reads the same word as all the others."* | The manifest grew. The word stays unrendered. |
| **A different row** | `meta.rememberer` exists | `passengerList` variant: *"…Every entry reads the same word, except one, which has been struck through."* | The previous Rememberer went out into 2:18 |
| **Route grows** | any prior stayOn | The carriage route-map glitch occasionally shows one extra stop, your previous skin's `shopSignText`, between stations 4 and 5 | The manifest is the route |

### 7.4 Guardrails (anti-gimmick rules, the Director's, all adopted)
1. **Never announce it.** No loop counter, no "Night N", no achievement toasts.
2. **At most 2-3 memory beats per run.** Chosen by `rngFor(runSeed,'memoryBeats')` from the eligible pool, weighted toward the previous ending. G1 counts toward the budget. The sixth passenger, when eligible, is always chosen and counts as one.
3. **Remember behavior, never stats.** Every trigger is something the player *did* (an ending, a choice, a clue held, a coin thrown), never a number.
4. **Never pays out mechanically.** No beat awards a `requiredClueIds`-eligible clue. No beat changes a threshold, the vanish pool, `requiredClueIds`, or the structure or timing of stations 5-7. Clue *description* variants are allowed: the clue is still awarded unconditionally, only its text differs (Invariants 3, 5, 6).
5. **The sixth passenger is outside the vanish pool forever** (Invariant 1). They have no dialogue stages, so no flags and no clues. They are not counted in `seatLoyaltyLine`.
6. **The first run is pristine.** With an empty meta-save, the game is byte-for-byte the canonical experience.

### 7.5 The loop forgets
From the third night on, `rngFor(runSeed,'forget')() < 0.15` sets `forgot = true`. Two forgetting nights are never consecutive (`lastForgotNight`).
- On a forgetting night, **every memory beat is suppressed** and the run plays like run 1.
- The night is **still recorded** in `nights`.
- **Canon:** the Rememberer can't hold everything; some nights the train runs clean.
- **Effect:** the returning player can never be sure the game remembers them, so each beat that *does* fire lands harder.

---

## 8. Expansion framework

### 8.1 Station rules
- **Ownership.** Every station has exactly one **owner**: a rider id, `'candidate'`, or `'train'`.
- **Calls 5-7 are owned by `'train'` and never change** (Invariant 2). New stations are borrowed stations only, mild or moderate band.
- **Era.** A station newer than the original line is **missing from old maps**. That is why Kalyanpur is absent from its own map.
- **Required parts.** Each station has:
  1. one object belonging to its owner;
  2. one clock or map wrongness;
  3. zero words of its owner's story, only objects.
- **Shared stations.** Two riders may share a station if their nights shared a place.

**Rollout constraint.** Invariant 2 fixes station order 1-7 and the current count. Until Wave D content packs exist, a new station may ship only:
- **(a)** as an authored *alternate* for a borrowed slot whose owner is unchanged, after a full §0 review; or
- **(b)** inside a future longer-route content pack.

It never ships as a runtime-randomized swap.

Dev-only lore can live in an optional, never-rendered field:

```ts
lore?: { owner: string; ownerMoment: string; era: 'pre-line' | 'line' | 'post-line' }
```

### 8.2 Current stations mapped
| Station | Owner | Owner object |
|---|---|---|
| Kalyanpur | Businessman | Vending machine (6:38 receipt) |
| Madhav Nagar | Woman | Bench (warmth, wristband), blank index card |
| Sector 0 | Train crew / Rememberer (the unfinished depot) | Signs "bolted by the same hand" (M.C.R. screws), footsteps |
| [UNLISTED] | Candidate | Corner shop sign (skin), billboard letter-shapes |
| Empty Platform | Train (set-down memories) | The figure, coins |
| Home | Train (terminus) | Door, clock, photograph |
| Last Stop | Train (inspection) | Conductor, ledger, list |

The Student has no station yet. That is deliberate: her station is the first expansion example below.

### 8.3 Passenger template
Every new rider must have:
1. a platform they stood on alone at 2:17;
2. no memory of boarding;
3. a "real time" that 2:17 is erasing;
4. a ticket they won't hand in;
5. what witnessing would release;
6. an owned or shared station;
7. a trace left if they ever step off;
8. a behavior loop that syncs to the wheel rhythm;
9. a "never say" list.

**Hard constraints:**
- New riders **stay outside the vanish pool** (Invariant 1) and must not displace the fixed five.
- They enter through the next carriage (3D) or as a content-pack carriage.

### 8.4 Example stations
- **RADIO COLONY** (moderate; owner: Student)
  - Every PA speaker loops the same half-second of a voicemail greeting.
  - A row of phone booths, receivers hanging, each with breathing on the line. The breathing is the train's (R9).
  - The departures board lists only *INCOMING*.
  - Owner object: a lost-and-found crate of headphones, all hissing.
- **PLATFORM 4 (DOWN)** (mild; owner: Old Man)
  - The platform you boarded at, decades younger, with enamel M.C.R. signs.
  - A young man runs down the stairs holding two tickets as the doors close. He is seen only from behind.
  - Owner object: a bench with **one** set of initials, older than yours.
- **CANTONMENT HALT** (moderate; shared owner: the Nurse and the Woman)
  - A hospital-side halt. A fob watch hangs from the shelter roof.
  - The shift board reads *NIGHT: 1 ON DUTY. 0 RELIEVED.*

### 8.5 Example passenger: The Night Nurse
- **Wound.** She was on the ward the night the Woman's son died. She left a colleague to tell the mother and walked out at 2:17.
- **Real time:** the shift change she never signed out of.
- **Ticket:** her hospital ID, clipped to a lanyard.
- **Behavior.** Her fob watch is pinned upside down and reads 2:17 either way. She never looks toward the Woman's seat. The Woman never recognizes her.
- **Beats.**
  - If `comfortedWoman` is set: *"You did the thing I couldn't."*
  - Otherwise: non-verbal, watching you sit near the Woman.
- **Never say:** the ward, the boy, or "I'm sorry".
- **Placement:** the next carriage, outside the vanish pool. Bonus-tier clue only (`shiftSheet`).

---

## 9. Environmental storytelling

All entries are optional and leaf-tier: cosmetic, flavor-variant, or bonus. None carries a `requiredClueIds` clue (Invariants 4 and 5).

1. **Kalyanpur under-poster:** *"…LAST DOWN SERVICE 2:17… WITHDRAWN FROM…"* Fragment only, no line name.
2. **Newspaper clipping:** *"…FAILS TO REACH…"* is the only legible headline fragment. The paragraph stays torn mid-sentence. The 2:17 event is never stated (§2 item 9).
3. **Passenger List:** STATUS is never rendered. Replay variants add a fresher row, or one struck-through row (§7.3).
4. **Ledger:** "no arrivals. Except one, near the front, in ink gone brown."
5. **Old Man's stub:** ×2, never punched.
6. **Watch caseback:** "never late again", the rest worn smooth.
7. **Student's headphone jack:** plugged into nothing.
8. **Platform payphone:** breathing. On replay, G1. The breathing is never given a voice except to read back your own ending.
9. **Sector 0 sign screws:** stamped M.C.R., matching the Conductor's badge.
10. **Scratched map:** the scratches are of different ages; the freshest goes through KALYANPUR.
11. **Home photograph:** *"On the back: all of us. There is one more name written than there are faces."* Leaf variant. The missing face is the candidate.
12. **Empty Platform figure:** your own set-down memory. On deep replays (getOff history), it wears your previous skin's silhouette.
13. **Seat 6 number plate:** newer than the rest; replaced many times.
14. **Empty Platform coins:** one per prior night you threw one.
15. **Silent Passenger's shoes:** wet.
16. **The second ticket:** optional. It requires an Invariant 2 review, because the Last Stop currently has no inspect hotspots. Proposed form: a bonus hotspot on the vacated seat that appears with the choice buttons and never delays them. *"The same printing as yours. The serial number is one lower."* Bonus clue `secondTicket`, excluded from `requiredClueIds`.
17. **Madhav Nagar wristband** (§3.2), and the **6:38 coffee receipt** at Kalyanpur (§3.3).
18. **Woman's ticket:** "PLATFORM ADMISSION — NOT VALID FOR TRAVEL."

---

## 10. Existing-text changes (resolved list)

| # | File / id | Current | Change | Resolution |
|---|---|---|---|---|
| 1 | `clues.ts` `tornRailwayMap`; `stations.ts` `scratchedMap` | "Near the bottom" vs "Near the center of the line" | Both become *"At the very end of the line, untouched: HOME."* | Kept. It's a consistency fix, not an explanation. A map position states no rule. |
| 2 | `endings.ts` `breakLoop` | Lines 3-4 duplicate `INTRO_PART_1` word for word; the final line is `''` | Replace lines 3-4 with *"The silent passenger has not moved since the dark."* / *"They have been standing in front of you the whole time."* **Keep the final `''` card**, held in silence. Move the §6.5 coda before the quote line for breakLoop (`Endings.tsx`). | The Director wins the empty card. My "2:18" line moves to the next run's platform clock (§7.3), where it is deniable. The duplicate is a real bug and gets fixed. |
| 3 | `clues.ts` `passengerList` | "…reads the same word, over and over." | **Unchanged on run 1.** Replay-only description variants per §7.3. | The Director wins: the word is never rendered. The loop remembers by adding or striking a row. |
| 4 | `clues.ts` `platformFigureSketch` | "weather that shouldn't reach this far underground" | *"…weather that shouldn't reach this far from any sky."* | Kept. It's a consistency fix: the Empty Platform is never called underground. |
| 5 | `clues.ts` `billboard`; `stations.ts` `billboard` inspect | "…a name. Your name." | *"What's left of the copy is a handful of letters. You know their shapes before you can read them."* The DOM or 3D render shows the skin initials as glyph-shapes. | It's seen, not said. The player's name is never displayed (§2 item 1). |
| 6 | `clues.ts` `oldTicketStub` | "the time survives: 2:17" | *"…the time survives only as far as 2:1—. On the back, in faded pencil: ×2. It was never punched."* | 2:17 budget and Old Man canon |
| 7 | `stations.ts` `home` `clock` inspect | Reads 2:17 three times | Inspect 2: *"It reads the time you expected it to."* Inspect 3: *"You wait a full minute. The second hand lifts, and settles back where it was."* | 2:17 budget. "Time doesn't move" is kept without the overused numeral. |
| 8 | `clues.ts` `conductorsLedger` | "…timed at 2:17, and signed…" | *"A logbook of departures. There are no arrivals, except one, near the front, in ink gone brown. The final entry is dated tonight and signed with a name you almost recognize as your own."* | 2:17 budget plus the R7 thread, unnamed |
| 9 | `passengers.ts` Silent Passenger §6.6 stages | They speak "Most do" / "That's rarer" at `minInteractions: 5` | Move both lines to the Old Man (§3.1). The Silent Passenger stage becomes non-verbal: *"Their head tilts, almost imperceptibly, toward the empty seat across the aisle."* | The Director's point, adopted. The guide's §6.6 explicitly allows the Old Man as speaker. |
| 10 | `passengers.ts` reveal stages | Interaction-only gates | Vanisher-aware gating, §6.1 | Pacing, Invariant 1 safe |
| 11 | Old Man sprite (`TrainInterior` / art) | Holds a cane | Hands drift to the folded pose by trip 6 | Pays off the stayOn line |
| 12 | `Platform.tsx` PA timing | 45-70s, after the 27s fallback | First PA at 10-15s | Pacing |

Everything else stays word for word, especially: Kalyanpur's "every other night you've taken this train", "not for passengers", "not in service", "Seven… For you", "You weren't on the list", and the stayOn and getOff endings.

---

## 11. Prioritized implementation backlog

File ownership follows `docs/ROADMAP.md`. Items in another lane's files are listed for the orchestrator to assign.

| P | Item | Files | Notes |
|---|---|---|---|
| **P0** | Text fixes §10 #1, 4, 5, 6, 7, 8 | `src/data/clues.ts`, `src/data/stations.ts` (B2 lane) | Text only. Grep tests for any asserted strings. |
| **P0** | breakLoop duplicate fix and coda placement (§10 #2) | `src/data/endings.ts`, `src/scenes/Endings.tsx` | Keep the `''` card. Keep `WOMAN_LINE_SWAP.breakLoop.index` valid after the line edit. |
| **P0** | §6.6 lines move to the Old Man (§10 #9) | `src/data/passengers.ts` | Check `minInteractions: 5` ordering against `avoidedWoman`. |
| **P0** | PA timing fix (§10 #12) | `src/scenes/Platform.tsx` (B2 lane, timing) | |
| **P1** | Vanisher-aware `minTripIfStaying` and trace-award fallback (§6.1) | `src/engine/types.ts`, `src/data/passengers.ts`, `src/scenes/TrainInterior.tsx`; tests in `tests/` | Add a test: every passenger clue is reachable for both vanish outcomes. |
| **P1** | Door lock and travel phase with fallback (§5.1 items 1-2) | `src/scenes/TrainInterior.tsx`, `src/audio/AudioEngine.ts` (wheel rhythm), `src/engine/store.ts` (travel state if needed) | Fallback timer is mandatory (Invariant 8). |
| **P1** | Non-verbal exhaustion beats (§5.1 item 3), Old Man trip-7 line | `src/scenes/TrainInterior.tsx`, `src/data/passengers.ts` | |
| **P1** | Madhav Nagar Woman-in-doorway (§5.1 item 5); Six windows (§4 H) | `src/scenes/Station.tsx` (B2 lane), `src/scenes/TrainArrival.tsx` | Cosmetic only |
| **P2** | Set-pieces C, D, E | `src/scenes/Station.tsx` (or `src/scenes/stations/*`), `src/audio/AudioEngine.ts` | Keep the `*_REVEAL_*` fallbacks intact (Invariant 2). Invariant 9 checks. |
| **P2** | Set-piece F (Procession) and I (Last Light) | `src/scenes/Station.tsx` (LastStopStation), `src/scenes/TrainInterior.tsx` | **Needs an Invariant 2 review.** Beat order unchanged. |
| **P2** | Behavior loops (rocking, tapping, head turns, extended arm) | `src/scenes/TrainInterior.tsx`, `TrainInterior.css`, later `src/render3d/**` | Cosmetic. Unseeded where animation, seeded where narrative (Invariant 7). |
| **P3** | Meta-save core: `meta.ts`, `resolveNight`, `NightRecord` write in `setEnding`, settings reset | `src/engine/meta.ts` (new), `src/engine/store.ts`, `src/engine/types.ts`, `src/data/skins.ts` (new); `tests/meta.test.ts` | Must not touch `requiredClueIds` or `vanishingPassengerId` resolution. Test: an empty meta gives a run identical to today's. |
| **P3** | Memory beats §7.3 and forgetting §7.5 | `src/scenes/Platform.tsx`, `TrainArrival.tsx`, `TrainInterior.tsx`, `Station.tsx`; `src/data/clues.ts` (description variants) | Budget enforcement in `resolveNight`, not in scenes |
| **P3** | Sixth passenger | `src/scenes/TrainInterior.tsx`, `src/data/skins.ts` | No dialogue stages. Excluded from the vanish pool and seat loyalty. |
| **P4** | Set-pieces A and B (3D-first, with DOM fallbacks) | `src/render3d/**`, `src/scenes/TrainInterior.tsx` | Wave E |
| **P4** | G1 Call and G2 Reserve | `src/scenes/Platform.tsx`, `src/scenes/TrainInterior.tsx` | After P3 |
| **P5** | Expansion: optional `lore` field, content-pack hooks, Radio Colony / Nurse pilot | `src/engine/types.ts`, `src/data/*`, Wave D content packs | Each new station passes the §8.1 rules and a §0 review |
| **P5** | Second ticket hotspot (§9 #16) | `src/scenes/Station.tsx` (LastStopStation), `src/data/clues.ts` | Invariant 2 review. Bonus clue only. |

*End of draft. The sealed canon (§1) is the source of truth. If any later section conflicts with it, fix the later section, or bring the conflict to a design review. Never resolve it on screen.*
