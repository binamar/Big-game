# Story Bible — *The Ledger of Ash & Iron*

> **Single Source of Truth** for cast, world rules, locations, tone, point-and-click clues, and the 3-chapter branching narrative.

---

## 1. World & Tone

- **Genre**: Grounded, low-fantasy political & human mystery (no magic, no glowing supernatural effects, no monsters). Conflict comes from scarcity, tampered shipping manifests, diverted barges, drought, and personal loyalties.
- **Premise**: After two dry harvests and a harsh winter freeze, the Outer Ward's coal, iron, and grain shipments stop arriving—even though Great Guild ledgers mark every wagon delivered. Junior clerk **Torrik**, road courier **Myra**, and veteran blacksmith **Orsen** team up across three escalating chapters to uncover tampered seals, trace diverted river barges, and confront the High Quarter council with physical proof.
- **Visual & Animation Rules**:
  - Clean, stylized flat-vector anime look with consistent outlines (`#1B1D22`).
  - All outfits are fully modest; no exposed skin beyond face and hands.
  - Each character sits in an independent modular scene/script with subtle lifelike idle motion: gentle breathing sway, natural head tilt, blinking, speaking mouth movement, and left-to-right eye and head glances.
  - Natural environmental particles only (`none`, `rain`, `dust`, `embers`).

---

## 2. Main Cast (3 Self-Contained Characters)

1. **Torrik** (`torrik`) — *Junior Guild Chronicler*
   - **Signature Accessory**: Bound field notebook and brass ledger pen
   - **Appearance**: Warm olive-tan skin (`#D9AE8E`), chestnut cropped parted hair (`#3A2B26`), warm amber-brown eyes (`#5B432E`), slate-indigo tunic with brass clasp (`#364556`).
   - **Personality**: Methodical, observant, quick with arithmetic; learns to trust lived evidence and allies over stamped paper.
   - **Idle Style**: Thoughtful chronicler cadence — measured head tilts (`±2.4°`) and frequent downward/sideways glances comparing notes with his companions.

2. **Myra** (`myra`) — *Road Courier & Scout*
   - **Signature Accessory**: Cross-body leather courier satchel and forest-drab travel hood
   - **Appearance**: Fair-warm skin (`#E5BF9F`), auburn braided hair tucked beneath her hood (`#7C3927`), sharp moss-green eyes (`#426B49`), layered forest-drab cloak and tunic (`#3C5242`).
   - **Personality**: Quick-witted, dry-humored, fiercely pragmatic; reads mud tracks, river schedules, and crooked smiles faster than any guild clerk.
   - **Idle Style**: Alert scout cadence — livelier left-right horizon glances, expressive head tilts (`±3.2°`), brisk blinking.

3. **Orsen** (`orsen`) — *Master Blacksmith of the Outer Ward*
   - **Signature Accessory**: Heavy soot-stained leather apron and iron forge tongs
   - **Appearance**: Sun-weathered bronze skin (`#C18661`), close-cropped charcoal hair (`#2B2B30`), steel-grey eyes (`#4E5D6C`), rolled-sleeve linen shirt beneath his thick leather apron (`#4B443E` / `#7C4B32`), broader forge-master shoulders.
   - **Personality**: Blunt, protective of his apprentices and ward, darkly funny under pressure; distrusts High Quarter envoys until proven honest by cold numbers and iron.
   - **Idle Style**: Grounded forge-master cadence — steady breathing weight, deliberate heavy head tilts (`±1.8°`), firm sidelong glances.

---

## 3. Core Locations & Moods

- **Locations**: `small_guild_hall`, `blacksmith_workshop`, `rainy_street`, `dry_farmland`, `night_alley`, `great_guild_headquarters`, `council_chamber`. (Additional procedural backdrops remain available in `BackdropRenderer` for the Stage Inspector: `city_square`, `ruined_village`, `army_camp_dusk`, `mountain_road`, `archive_room`.)
- **Moods (6 Palettes)**: `warm`, `tense`, `calm`, `somber`, `urgent`, `bleak`.
- **Particles**: `none`, `dust`, `embers`, `rain`.

---

## 4. Three-Chapter Playable Arc (Choices + Point-and-Click)

1. **Chapter 1: Cold Coal & Sealed Ink** (`small_guild_hall`, `blacksmith_workshop`, `rainy_street`)
   - **Plot**: Myra rides in through rain with an unsealed dispatch warning. In the Small Guild Hall, the player performs a **point-and-click inspection** of the dispatch chest seal, quota chalkboard, and mud-caked courier satchel. Torrik and Myra confront Orsen at his cold workshop, inspect his dead hearth and cracked wagon axle, and choose whether to lay the audit ledger open with Orsen (`trust_orsen`) or maintain cautious official protocol (`cautious_audit`). Outside on the rainy street, the trio spots fresh iron-wagon ruts veering toward the river valley.

2. **Chapter 2: Mud Tracks & Missing Barges** (`dry_farmland`, `night_alley`, `rainy_street`)
   - **Plot**: Tracking the diverted wagons past a parched windmill (`dry_farmland`), the trio inspects **point-and-click scene clues** (a dropped river-guild manifest ribbon, deep axle ruts, and lime-dusted grain sacks). The player chooses between two major narrative roads in `night_alley`:
     - **Road A — Ambush the Barge Loaders**: Slip along the brick alley behind the lockhouse, either bluffing with Orsen's iron pry-bar or quietly copying hull numbers from the shadows.
     - **Road B — Audit the Toll Shed**: Corner the frightened lockhouse toll-clerk, choosing either to offer witness protection (`spared_witness`) or seize the toll ledger outright (`seized_manifest`).

3. **Chapter 3: The Ledger of Dawn** (`great_guild_headquarters`, `council_chamber`, `small_guild_hall`)
   - **Plot**: At sunrise, Torrik, Myra, and Orsen enter the High Quarter before the council session locks its doors. In `council_chamber`, the player completes a final **point-and-click scene inspection** (pre-signed vote box, half-burned coal invoice in the hearth brazier, and a hidden dock signal cord). Combining their dynamic clues (`found_scraped_seal`, `found_axle_clue`, `found_burnt_invoice`) and past choices (`trust_orsen`, `spared_witness`), the trio confronts the closed-door requisition and chooses the Outer Ward's fate across **3 distinct epilogues** back at the Small Guild Hall.
