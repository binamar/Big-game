# Project Progress

## Stage Checklist

| Stage | Description | Status | Notes |
| :--- | :--- | :--- | :--- |
| Stage 0 | Documentation Reset (`STORY_BIBLE.md`, `ARCHITECTURE.md`, `PROGRESS.md`) | done | Re-scoped to 3 complete chapters, 3 modular characters, VN + Choice + Point-and-Click |
| Stage 1 | Modular Per-Character Scenes & Scripts (`CharacterBase`, `TorrikCharacter`, `MyraCharacter`, `OrsenCharacter`) | done | Independent head tilt, head movement, and left-right looking idle animations |
| Stage 2 | Viewport/Orientation Fix, Click-Input Fix & Custom `ThemeFactory` UI | done | Fixed `mouse_filter` input swallowing, landscape orientation lock (`keep` aspect), modern slate/brass theme |
| Stage 3 | Point-and-Click Investigation Engine + Choice Flow (`dialogue_stage.gd`, `validate_chapters.gd`) | done | Interactive normalized scene hotspots + clue tracking + branching roads |
| Stage 4 | Author 3 Complete Playable Chapters (`chapter_01.json`–`chapter_03.json`) | done | Removed 4–10 stubs; wrote full multi-character dialogues, events, hotspots, choices |
| Stage 5 | Sync AI Studio Web Preview (`src/` modular characters, 16:9 stage, hotspots, modern UI) | done | Matches Godot features 1:1 on port 3000 |
| Stage 6 | Final Validation (Schema/Reachability/Links + TypeScript build/lint) | done | Passed chapter schema/BFS/resource checks, `vite build`, and `tsc --noEmit` (Godot binary absent in container) |

## Chapter Checklist

| Chapter | Title | Gameplay Mix | Status |
| :--- | :--- | :--- | :--- |
| `chapter_01` | Cold Coal & Sealed Ink | 2 point-and-click scenes + Orsen forge alliance choice + 3-way banter | done |
| `chapter_02` | Mud Tracks & Missing Barges | Dry farmland investigation + 2-road split (Alley Ambush vs. Toll Audit) | done |
| `chapter_03` | The Ledger of Dawn | Council chamber investigation + clue-aware confrontation + 3 epilogues | done |

## Next Step

Run `godot --headless --path . --script res://scripts/validate_chapters.gd` and open `project.godot` locally in Godot 4.7 to playtest all 3 chapters and point-and-click hotspots on desktop or Android.

## Known Issues Fixed in This Rebuild

- Fixed Godot stage click swallowing caused by default `mouse_filter = 0` (`STOP`) on `BackdropRenderer` and `PortraitLayer`.
- Replaced 10 thin chapters and 9 monolithic characters with 3 richly written chapters and 3 self-contained modular character scenes/scripts.
- Replaced bare default Godot UI widgets with custom `ThemeFactory` (`StyleBoxFlat`) styling and responsive 16:9 landscape framing (`stretch/aspect="keep"`, `handheld/orientation=4`).
