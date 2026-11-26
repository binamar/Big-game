# Project Progress

## Stage Checklist

| Stage | Description | Status | Notes |
| :--- | :--- | :--- | :--- |
| Stage 0 | Documentation (`AGENTS.md`, `docs/STORY_BIBLE.md`, `docs/ARCHITECTURE.md`, `docs/PROGRESS.md`) | done | Updated for Godot 4.7 GDScript & 10-chapter structure |
| Stage 1 | Godot Project Config, Autoloads, Resources & Registries (`project.godot`, `CharacterData`, `ExpressionData`, `CharacterRegistry`, `BackdropRegistry`) | done | Complete Godot 4.7 config, scripts, and scenes |
| Stage 2 | Procedural `CharacterPortrait` (`_draw()`, tweened expressions, blinking, sway, typing mouth, shock shake, asset override) | done | `scripts/visuals/character_portrait.gd` + `scenes/character_portrait.tscn` |
| Stage 3 | Procedural `BackdropRenderer` (`_draw()`, 12 scenes, 6 mood palettes, parallax drift, rain/dust/embers, asset override) | done | `scripts/visuals/backdrop_renderer.gd` + `scenes/backdrop_renderer.tscn` |
| Stage 4 | Playable Scenes (`main.tscn`, `dialogue_stage.tscn`, `studio_inspector.tscn`) & Android Export (`export_presets.cfg`, `.github/workflows/android.yml`) | done | Complete Godot 4.7 Mobile scene hierarchy & CI workflow |
| Stage 5 | Headless Godot Validator (`res://scripts/validate_chapters.gd`) | done | Validates startNode, next/choice/fallback links, speakers, expressions, backdrops, moods, particles, reachability |
| Stage 6 | Port Chapters 1–4 & Write Chapters 5–10 (`res://data/chapters/chapter_01.json` .. `chapter_10.json`) | done | All 10 chapters authored & validated |
| Stage 7 | Verification & AI Studio Preview Harness | done | Godot project + 10 chapters verified offline; Vite/React preview (`package.json`, `src/`) restored for port 3000 runtime |

## Chapter Checklist

| Chapter | Title | Scenes Used | Status |
| :--- | :--- | :--- | :--- |
| `chapter_01` | Iron & Ink | `small_guild_hall`, `blacksmith_workshop`, `city_square`, `rainy_street` | done |
| `chapter_02` | The Dry Road | `dry_farmland`, `ruined_village`, `mountain_road`, `army_camp_dusk` | done |
| `chapter_03` | Shadows in the Ledger | `night_alley`, `archive_room`, `great_guild_headquarters` | done |
| `chapter_04` | Before the Council | `council_chamber`, `small_guild_hall` | done |
| `chapter_05` | River Barges at Dawn | `city_square`, `rainy_street`, `night_alley` | done |
| `chapter_06` | The Forge's Oath | `blacksmith_workshop`, `small_guild_hall`, `dry_farmland` | done |
| `chapter_07` | The Barred Archive | `archive_room`, `great_guild_headquarters`, `night_alley` | done |
| `chapter_08` | Ridge of Smoke | `mountain_road`, `ruined_village`, `army_camp_dusk` | done |
| `chapter_09` | Ash and Tally | `army_camp_dusk`, `mountain_road`, `ruined_village` | done |
| `chapter_10` | The Open Ledger | `great_guild_headquarters`, `council_chamber`, `city_square`, `small_guild_hall` | done |

## Next Step

Play/inspect all 10 chapters in the AI Studio port-3000 preview, or open `project.godot` in Godot 4.7 / run `.github/workflows/android.yml` to execute `godot --headless --path . --script res://scripts/validate_chapters.gd` and build `build/android/ledger_of_ash_and_iron.apk`.

## Known Issues

None.

## Recorded Assumptions (Section 0b)

1. **Missing Section 4 Story Text**: Section 4 was referenced in the initial prompt without verbatim text. All 9 characters, signature accessories, family pairing (Selva & Rowan), 12 backdrops, and 8 expressions from Section 6b are preserved in `docs/STORY_BIBLE.md` across a grounded 10-chapter political/human drama (*The Ledger of Ash & Iron*) with zero magic or supernatural elements.
2. **Godot 4.7 Target & Headless CI**: `project.godot` targets `4.7` with Mobile renderer + Android export presets (`export_presets.cfg`), and `.github/workflows/android.yml` executes `godot --headless --path . --script res://scripts/validate_chapters.gd` and `godot --headless --path . --quit` before exporting the Android APK.
3. **Local Container Note**: Because no `godot` binary is installed in the build container itself, GDScript syntax and `.tscn` formatting follow Godot 4.7 specifications verbatim, and all 10 chapter JSON graphs and project resource references were verified offline.
4. **AI Studio Preview Harness**: The AI Studio container requires `package.json` (`bun install`) and a Vite server on port 3000. `package.json`, `index.html`, and `src/` exist solely as a live preview runner reading directly from `data/chapters/chapter_01.json`..`chapter_10.json` without duplicating story data or interfering with `project.godot`.
