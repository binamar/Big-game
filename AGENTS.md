# AGENTS.md

Before making any changes in this repository:

1. Read `docs/STORY_BIBLE.md`, `docs/ARCHITECTURE.md`, and `docs/PROGRESS.md` first.
2. Treat `docs/STORY_BIBLE.md` as the single source of truth for characters, locations, tone, rules, and narrative continuity.
3. Keep all visuals 100% procedural in GDScript (`_draw()`). Any optional overrides placed under `res://assets/portraits/<name>_<expression>.png` or `res://assets/backdrops/<scene>.png` must fall back seamlessly to the procedural renderer without errors.
4. Follow the chapter JSON schema documented in `docs/ARCHITECTURE.md` and run `godot --headless --path . --script res://scripts/validate_chapters.gd` after editing any chapter data.
5. Update `docs/PROGRESS.md` and `docs/ARCHITECTURE.md` whenever stages, schemas, or state variables change.
