extends Node

const SAVE_PATH := "user://ledger_save_v2.json"

var current_chapter_id: String = "chapter_01"
var current_node_id: String = "c1_start"
var flags: Dictionary = {}
var scores: Dictionary = {}
var inspected_hotspots: Dictionary = {}
var ending_id: String = ""
var history: Array = []

func _ready() -> void:
	reset_defaults()

func reset_defaults() -> void:
	current_chapter_id = "chapter_01"
	current_node_id = "c1_start"
	flags = {
		"found_scraped_seal": false,
		"found_mud_clue": false,
		"found_axle_clue": false,
		"trust_orsen": false,
		"cautious_audit": false,
		"found_windmill_ribbon": false,
		"found_lime_sacks": false,
		"valley_road_alley": false,
		"spared_witness": false,
		"seized_manifest": false,
		"found_prefilled_box": false,
		"found_burnt_invoice": false,
	}
	scores = {
		"guild_standing": 0,
	}
	inspected_hotspots = {}
	ending_id = ""
	history = []

func start_chapter(chapter_id: String, start_node_id: String, reset_progress: bool = false) -> void:
	if reset_progress:
		reset_defaults()
	current_chapter_id = chapter_id
	current_node_id = start_node_id
	save_game()

func apply_flags(extra_flags: Dictionary) -> void:
	for key in extra_flags.keys():
		flags[key] = bool(extra_flags[key])

func add_scores(extra_scores: Dictionary) -> void:
	for key in extra_scores.keys():
		var current_val: int = int(scores.get(key, 0))
		scores[key] = current_val + int(extra_scores[key])

func mark_hotspot_inspected(node_id: String, hotspot_id: String) -> void:
	if not inspected_hotspots.has(node_id):
		inspected_hotspots[node_id] = []
	var arr: Array = inspected_hotspots[node_id]
	if not arr.has(hotspot_id):
		arr.append(hotspot_id)
		inspected_hotspots[node_id] = arr

func is_hotspot_inspected(node_id: String, hotspot_id: String) -> bool:
	if not inspected_hotspots.has(node_id):
		return false
	return (inspected_hotspots[node_id] as Array).has(hotspot_id)

func get_inspected_count(node_id: String) -> int:
	if not inspected_hotspots.has(node_id):
		return 0
	return (inspected_hotspots[node_id] as Array).size()

func record_history(chapter_id: String, node_id: String, speaker_name: String, text: String) -> void:
	history.append({
		"chapterId": chapter_id,
		"nodeId": node_id,
		"speakerName": speaker_name,
		"text": text,
	})
	if history.size() > 80:
		history.pop_front()

func get_flag(flag_name: String) -> bool:
	return bool(flags.get(flag_name, false))

func get_score(score_name: String) -> int:
	return int(scores.get(score_name, 0))

func has_save() -> bool:
	return FileAccess.file_exists(SAVE_PATH)

func save_game() -> void:
	var payload := {
		"currentChapterId": current_chapter_id,
		"currentNodeId": current_node_id,
		"flags": flags,
		"scores": scores,
		"inspectedHotspots": inspected_hotspots,
		"endingId": ending_id,
		"history": history,
	}
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(payload, "\t"))
		file.close()

func load_game() -> bool:
	if not FileAccess.file_exists(SAVE_PATH):
		return false
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if not file:
		return false
	var text := file.get_as_text()
	file.close()
	var parsed = JSON.parse_string(text)
	if typeof(parsed) != TYPE_DICTIONARY:
		return false
	current_chapter_id = str(parsed.get("currentChapterId", "chapter_01"))
	current_node_id = str(parsed.get("currentNodeId", "c1_start"))
	var loaded_flags = parsed.get("flags", {})
	if typeof(loaded_flags) == TYPE_DICTIONARY:
		for k in loaded_flags.keys():
			flags[k] = bool(loaded_flags[k])
	var loaded_scores = parsed.get("scores", {})
	if typeof(loaded_scores) == TYPE_DICTIONARY:
		for k in loaded_scores.keys():
			scores[k] = int(loaded_scores[k])
	var loaded_hs = parsed.get("inspectedHotspots", {})
	if typeof(loaded_hs) == TYPE_DICTIONARY:
		inspected_hotspots = loaded_hs
	ending_id = str(parsed.get("endingId", ""))
	var loaded_history = parsed.get("history", [])
	if typeof(loaded_history) == TYPE_ARRAY:
		history = loaded_history
	return true
