# Architecture Specification (Godot 4.7 GDScript)

## 1. Overview

*The Ledger of Ash & Iron* is a **Godot 4.7** 2D Visual Novel + Point-and-Click Mystery built in **GDScript** with **100% procedural `_draw()` visuals**, modular self-contained character scenes/scripts, custom `StyleBoxFlat` UI theming, Android export presets (`export_presets.cfg`), and CI headless validation (`.github/workflows/android.yml`).

An accompanying Vite/React preview runner (`package.json`, `index.html`, `src/`) reads directly from the exact same `res://data/chapters/chapter_01.json`–`chapter_03.json` files so the game is also immediately playable inside the AI Studio port-3000 viewport.

---

## 2. Folder Structure

```text
/
├── project.godot                              # Godot 4.7 config (1280x720 landscape, stretch keep, autoloads)
├── export_presets.cfg                         # Android APK export configuration
├── AGENTS.md                                  # AI session & documentation rules
├── .github/workflows/android.yml              # CI: chapter validation, headless parse check, APK export
├── docs/
│   ├── STORY_BIBLE.md                         # Single source of truth: 3 characters & 3 chapters
│   ├── ARCHITECTURE.md                        # Modular character paths, scene schema, flags, UI theme
│   └── PROGRESS.md                            # Rebuild stage & chapter checklist
├── assets/                                    # Optional PNG overrides (empty by default)
│   ├── portraits/                             # Optional <name>_<expression>.png
│   └── backdrops/                             # Optional <scene>.png
├── data/
│   └── chapters/
│       ├── chapter_01.json                    # Chapter 1: Cold Coal & Sealed Ink
│       ├── chapter_02.json                    # Chapter 2: Mud Tracks & Missing Barges
│       └── chapter_03.json                    # Chapter 3: The Ledger of Dawn
├── scenes/
│   ├── main.tscn                              # Title screen & 3-chapter navigation hub
│   ├── dialogue_stage.tscn                    # Playable VN stage, point-and-click hotspots, choice cards
│   ├── studio_inspector.tscn                  # Modular character & scene inspector
│   ├── backdrop_renderer.tscn                 # Procedural layered backdrop & weather particles
│   └── characters/
│       ├── torrik_character.tscn              # Self-contained Torrik character scene
│       ├── myra_character.tscn                # Self-contained Myra character scene
│       └── orsen_character.tscn               # Self-contained Orsen character scene
└── scripts/
    ├── validate_chapters.gd                   # Headless SceneTree validator (CI + CLI)
    ├── main.gd                                # Title & chapter hub controller
    ├── dialogue_stage.gd                      # Typewriter, hotspots, branching choices, transitions, log
    ├── studio_inspector.gd                    # Live character/expression/head-motion/backdrop inspector
    ├── autoload/
    │   ├── game_state.gd                      # Autoload: GameState (flags, clues, scores, save/load)
    │   ├── chapter_loader.gd                  # Autoload: ChapterLoader (3 chapters JSON loader)
    │   └── audio_manager.gd                   # Autoload: AudioManager (procedural AudioStreamGenerator FX)
    ├── ui/
    │   └── theme_factory.gd                   # Custom StyleBoxFlat theme builder (slate & burnished brass)
    ├── resources/
    │   ├── character_data.gd                  # Resource class: CharacterData
    │   └── expression_data.gd                 # Resource class: ExpressionData + 8 expression presets
    ├── data/
    │   └── backdrop_registry.gd               # Registry of procedural backdrops & 6 mood palettes
    ├── visuals/
    │   └── backdrop_renderer.gd               # Procedural layered scene + parallax + particles (_draw)
    └── characters/
        ├── character_base.gd                  # Base class: tweened expressions, blink, speaking, head tilt/look L-R
        ├── character_catalog.gd               # Maps character IDs to dedicated scenes & metadata
        ├── torrik_character.gd                # Torrik visual model, notebook accessory & chronicler idle cadence
        ├── myra_character.gd                  # Myra visual model, hood/satchel & scout look-around cadence
        └── orsen_character.gd                 # Orsen visual model, leather apron/tongs & blacksmith idle cadence
```

---

## 3. Modular Per-Character Design

Each of the 3 main characters (`torrik`, `myra`, `orsen`) has its own independent `.tscn` + `.gd` pair extending `CharacterBase`:
- **Self-Contained Visuals & Model**: Each subclass defines its own `CharacterData` palette and implements `_draw_character_back()`, `_draw_character_body()`, `_draw_character_front_hair()`, and `_draw_character_accessory()` inside `_draw()`.
- **Lifelike Idle Head Animation**: `CharacterBase` drives:
  - `_bob_y`: subtle vertical breathing cadence
  - `_head_tilt_deg`: natural head tilt pivoting around the neck joint `(160, 200)`
  - `_head_turn_x` & `_look_x / _look_y`: periodic left-to-right eye glances coupled with subtle head follow-through, customized by each character's `tilt_speed`, `tilt_amplitude`, and `look_interval`
  - `_blink_open`: randomized eye blinks
  - `is_speaking`: typewriter-synchronized mouth movement
  - `trigger_shock()`: crisp horizontal decay shake
- **Conflict-Free Stage Mounting**: `DialogueStage` spawns one named persistent node per character (`torrik`, `myra`, `orsen`) and moves/positions them into `LeftSlot`, `CenterSlot`, or `RightSlot` without destroying/duplicating state across consecutive lines.

---

## 4. Chapter JSON Schema (`res://data/chapters/chapter_01..03.json`)

Nodes support standard dialogue, branching choices, `conditionFlag` checks, and interactive point-and-click `investigation` scenes:

```json
{
  "id": "c1_hall_inspect",
  "backdrop": "small_guild_hall",
  "mood": "warm",
  "particles": "dust",
  "speaker": "torrik",
  "speakerName": "Torrik",
  "expression": "determined",
  "characters": [
    { "id": "torrik", "expression": "determined", "position": "left", "active": true },
    { "id": "myra", "expression": "worried", "position": "right", "active": false }
  ],
  "text": "Before we face Orsen, inspect the ledger chest, quota board, and Myra's courier satchel.",
  "investigation": {
    "prompt": "Click scene objects to inspect evidence",
    "requiredCount": 2,
    "continueLabel": "Walk to the Blacksmith Workshop",
    "continueNext": "c1_forge_arrive",
    "hotspots": [
      {
        "id": "hs_chest",
        "label": "Dispatch Chest Seal",
        "x": 0.24,
        "y": 0.44,
        "speaker": "torrik",
        "speakerName": "Torrik",
        "expression": "surprised",
        "text": "The wax seal sits over freshly scraped ink.",
        "setFlags": { "found_scraped_seal": true },
        "addScore": { "guild_standing": 1 }
      }
    ]
  }
}
```

### Validation Rules (`res://scripts/validate_chapters.gd`)
- Strictly 3 chapters (`chapter_01.json`..`chapter_03.json`), all with valid `startNode`.
- `speaker` must be `"narrator"`, `"torrik"`, `"myra"`, or `"orsen"`.
- `expression` must be one of `neutral`, `sad`, `angry`, `surprised`, `worried`, `determined`, `smug`, `tired`.
- `backdrop`, `mood`, and `particles` must match `BackdropRegistry`.
- Every `next`, `choices[].next`, `conditionFlag.fallbackNext`, and `investigation.continueNext` must resolve to a node in `nodes`, and every node must be reachable from `startNode`.

---

## 5. State Variables & Flags

| Variable / Flag | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `found_scraped_seal` | bool | `false` | Chapter 1 hotspot clue: scraped wax seal on dispatch chest |
| `found_mud_clue` | bool | `false` | Chapter 1 hotspot clue: river clay on Myra's satchel |
| `found_axle_clue` | bool | `false` | Chapter 1 hotspot clue: river-barge mark on cracked wagon axle |
| `trust_orsen` | bool | `false` | Chapter 1 choice: shared open ledger honestly with Orsen |
| `cautious_audit` | bool | `false` | Chapter 1 choice: kept guild protocol pending verification |
| `found_windmill_ribbon` | bool | `false` | Chapter 2 hotspot clue: Quartermaster manifest ribbon |
| `found_lime_sacks` | bool | `false` | Chapter 2 hotspot clue: iron-weighted sacks disguised with chaff |
| `valley_road_alley` | bool | `false` | Chapter 2 road split: ambushed barge loaders in night alley |
| `spared_witness` | bool | `false` | Chapter 2 choice: protected coerced lockhouse clerk for testimony |
| `seized_manifest` | bool | `false` | Chapter 2 choice: confiscated lockhouse manifest book outright |
| `found_prefilled_box` | bool | `false` | Chapter 3 hotspot clue: pre-signed council vote box |
| `found_burnt_invoice` | bool | `false` | Chapter 3 hotspot clue: charred false coal invoice in brazier |
| `ending_id` | string | `""` | Final Chapter 3 epilogue path (`open_charter`, `winter_road`, `silent_reckoning`) |
| `guild_standing` | int | `0` | Credibility & evidence score across Chapters 1–3 |
