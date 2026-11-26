# Architecture Specification (Godot 4.7 GDScript)

## 1. Overview

This project is a **Godot 4.7** visual novel engine written in **GDScript** with **100% procedural visuals** (`_draw()` + `Tween`), zero external art requirements, Android export presets, GitHub Actions CI validation + APK build, and JSON-driven chapters (`res://data/chapters/`).

---

## 2. Folder Structure

```text
/
├── project.godot                              # Godot 4.7 configuration & autoloads
├── export_presets.cfg                         # Android APK / AAB export configuration
├── AGENTS.md                                  # AI session & documentation rules
├── .github/
│   └── workflows/
│       └── android.yml                        # CI: chapter validation, headless parse check, Android export
├── docs/
│   ├── STORY_BIBLE.md                         # Single source of truth for lore, cast, and 10-chapter arc
│   ├── ARCHITECTURE.md                        # Godot paths, autoloads, schema, flags, naming
│   └── PROGRESS.md                            # Stage & chapter progress tracker + assumptions
├── assets/                                    # Optional PNG overrides (empty by default)
│   ├── portraits/                             # Optional <name>_<expression>.png
│   └── backdrops/                             # Optional <scene>.png
├── data/
│   └── chapters/
│       ├── chapter_01.json                    # Chapter 1: Iron & Ink
│       ├── chapter_02.json                    # Chapter 2: The Dry Road
│       ├── chapter_03.json                    # Chapter 3: Shadows in the Ledger
│       ├── chapter_04.json                    # Chapter 4: Before the Council
│       ├── chapter_05.json                    # Chapter 5: River Barges at Dawn
│       ├── chapter_06.json                    # Chapter 6: The Forge's Oath
│       ├── chapter_07.json                    # Chapter 7: The Barred Archive
│       ├── chapter_08.json                    # Chapter 8: Ridge of Smoke
│       ├── chapter_09.json                    # Chapter 9: Ash and Tally
│       └── chapter_10.json                    # Chapter 10: The Open Ledger
├── scenes/
│   ├── main.tscn                              # Title screen, chapter select, navigation hub
│   ├── dialogue_stage.tscn                    # Playable visual novel stage & HUD
│   ├── studio_inspector.tscn                  # Procedural character/expression/backdrop inspector
│   ├── character_portrait.tscn                # Reusable procedural CharacterPortrait scene
│   └── backdrop_renderer.tscn                 # Reusable procedural BackdropRenderer scene
└── scripts/
    ├── validate_chapters.gd                   # Headless SceneTree validator (CI + CLI)
    ├── main.gd                                # Main menu & chapter select controller
    ├── dialogue_stage.gd                      # Typewriter, choices, flags, log, chapter flow
    ├── studio_inspector.gd                    # Live character/expression/backdrop test studio
    ├── autoload/
    │   ├── game_state.gd                      # Autoload: GameState (flags, scores, save/load)
    │   ├── chapter_loader.gd                  # Autoload: ChapterLoader (JSON chapter loading)
    │   └── audio_manager.gd                   # Autoload: AudioManager (procedural AudioStreamGenerator FX)
    ├── resources/
    │   ├── character_data.gd                  # Resource class: CharacterData
    │   └── expression_data.gd                 # Resource class: ExpressionData + 8 presets
    ├── data/
    │   ├── character_registry.gd              # Registry of all 9 characters
    │   └── backdrop_registry.gd               # Registry of all 12 backdrops & 6 mood palettes
    └── visuals/
        ├── character_portrait.gd              # Procedural flat-vector anime portrait (_draw + Tween)
        └── backdrop_renderer.gd               # Procedural layered scene + parallax + particles (_draw)
```

---

## 3. Autoloads & Scene Paths

- **Autoloads** (configured in `project.godot`):
  - `GameState` -> `res://scripts/autoload/game_state.gd`
  - `ChapterLoader` -> `res://scripts/autoload/chapter_loader.gd`
  - `AudioManager` -> `res://scripts/autoload/audio_manager.gd`
- **Main Scene**: `res://scenes/main.tscn`
- **Core Scenes**:
  - `res://scenes/dialogue_stage.tscn`
  - `res://scenes/studio_inspector.tscn`
  - `res://scenes/character_portrait.tscn`
  - `res://scenes/backdrop_renderer.tscn`

---

## 4. Chapter JSON Schema

Every chapter file under `res://data/chapters/chapter_XX.json` conforms to this schema:

```json
{
  "id": "chapter_01",
  "number": 1,
  "title": "Iron & Ink",
  "subtitle": "Outer Ward Audit",
  "summary": "Haldor sends Torrik with a sealed ledger to inspect missing coal and iron shipments.",
  "startNode": "c1_start",
  "nextChapterId": "chapter_02",
  "nodes": {
    "c1_start": {
      "id": "c1_start",
      "backdrop": "small_guild_hall",
      "mood": "warm",
      "particles": "dust",
      "speaker": "haldor",
      "speakerName": "Haldor",
      "expression": "determined",
      "characters": [
        { "id": "haldor", "expression": "determined", "position": "left", "active": true },
        { "id": "torrik", "expression": "neutral", "position": "right", "active": false }
      ],
      "text": "Keep your notebook strapped tight, Torrik.",
      "next": "c1_haldor_2"
    }
  }
}
```

### Validation Rules (`res://scripts/validate_chapters.gd`)
- `startNode` must exist in `nodes`.
- `speaker` must be `"narrator"` or one of the 9 characters (`torrik`, `orsen`, `myra`, `haldor`, `nova`, `fennick`, `ilvar`, `selva`, `rowan`).
- `expression` must be one of `neutral`, `sad`, `angry`, `surprised`, `worried`, `determined`, `smug`, `tired`.
- `backdrop` must be one of the 12 scene IDs (`small_guild_hall`, `blacksmith_workshop`, `city_square`, `great_guild_headquarters`, `ruined_village`, `army_camp_dusk`, `mountain_road`, `night_alley`, `archive_room`, `rainy_street`, `dry_farmland`, `council_chamber`).
- `mood` (if present) must be one of `calm`, `tense`, `somber`, `urgent`, `warm`, `bleak`.
- `particles` (if present) must be one of `none`, `rain`, `dust`, `embers`.
- All `next`, `choices[].next`, and `conditionFlag.fallbackNext` IDs must exist in `nodes`.
- Every node in `nodes` must be reachable from `startNode` (BFS traversal).

---

## 5. State Variables & Flags

| Variable / Flag | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `trust_orsen` | bool | `false` | Earned Orsen's forge tallies openly in Chapter 1 |
| `confronted_fennick` | bool | `false` | Challenged Fennick publicly in the City Square (Chapter 1) |
| `spoke_for_selva` | bool | `false` | Recorded Selva's village petition in the official ledger (Chapter 2) |
| `saved_receipts` | bool | `false` | Secured Rowan's camp supply receipts (Chapter 2) |
| `allied_ilvar` | bool | `false` | Shared field notes openly with Archivist Ilvar (Chapter 3) |
| `spared_lockmaster` | bool | `false` | Protected the coerced lockmaster in exchange for barge logs (Chapter 5) |
| `protected_vault` | bool | `false` | Rescued the duplicate harbor registers in the Archive Room (Chapter 7) |
| `shared_relief` | bool | `false` | Left emergency grain rations at Selva's ruined village (Chapter 8) |
| `guild_standing` | int | `0` | Cumulative credibility score deciding the Chapter 10 charter outcome |

---

## 6. Naming Conventions

- Script & scene filenames: `snake_case.gd` / `snake_case.tscn`.
- GDScript classes: `PascalCase` (`CharacterPortrait`, `BackdropRenderer`, `CharacterData`, `ExpressionData`).
- Character IDs, Expression IDs, Backdrop IDs, Node IDs: `snake_case`.
- Chapter files: `res://data/chapters/chapter_01.json` .. `res://data/chapters/chapter_10.json`.
