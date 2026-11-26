extends SceneTree

const CHAPTERS_DIR := "res://data/chapters/"
const EXPECTED_CHAPTERS := 3

func _init() -> void:
	var dir := DirAccess.open(CHAPTERS_DIR)
	if dir == null:
		push_error("Cannot open " + CHAPTERS_DIR)
		quit(1)
		return

	var files: PackedStringArray = []
	dir.list_dir_begin()
	var fname := dir.get_next()
	while fname != "":
		if not dir.current_is_dir() and fname.ends_with(".json"):
			files.append(fname)
		fname = dir.get_next()
	dir.list_dir_end()
	files.sort()

	if files.size() != EXPECTED_CHAPTERS:
		push_error("Expected exactly %d chapter JSON files in %s, found %d." % [EXPECTED_CHAPTERS, CHAPTERS_DIR, files.size()])
		quit(1)
		return

	var total_errors := 0
	for file_name in files:
		var path := CHAPTERS_DIR + file_name
		var f := FileAccess.open(path, FileAccess.READ)
		if f == null:
			push_error("Failed to open " + path)
			total_errors += 1
			continue
		var parsed = JSON.parse_string(f.get_as_text())
		f.close()
		if typeof(parsed) != TYPE_DICTIONARY:
			push_error("Invalid JSON object in " + path)
			total_errors += 1
			continue

		var issues := _validate_chapter(parsed)
		var status := "PASS" if issues.is_empty() else "FAIL"
		var nodes_dict: Dictionary = parsed.get("nodes", {})
		print("[%s] %s (%s: \"%s\") — %d nodes" % [
			status,
			file_name,
			str(parsed.get("id", "")),
			str(parsed.get("title", "")),
			nodes_dict.size()
		])
		for issue in issues:
			print("  - ERROR: " + issue)
			total_errors += 1

	if total_errors > 0:
		push_error("Chapter validation failed with %d error(s)." % total_errors)
		quit(1)
		return

	print("All %d chapter file(s) passed validation." % files.size())
	quit(0)

func _validate_chapter(chapter: Dictionary) -> PackedStringArray:
	var errors: PackedStringArray = []
	var nodes: Dictionary = chapter.get("nodes", {})
	var start_node := str(chapter.get("startNode", ""))

	if start_node == "" or not nodes.has(start_node):
		errors.append("Missing startNode '%s'." % start_node)

	for node_id in nodes.keys():
		var node = nodes[node_id]
		if typeof(node) != TYPE_DICTIONARY:
			errors.append("Node '%s' is not an object." % str(node_id))
			continue

		var speaker := str(node.get("speaker", ""))
		if speaker != "narrator" and not CharacterCatalog.CHARACTER_IDS.has(speaker):
			errors.append("Node '%s' has unknown speaker '%s'." % [node_id, speaker])

		var expr := str(node.get("expression", ""))
		if not ExpressionData.PRESET_IDS.has(expr):
			errors.append("Node '%s' has unknown expression '%s'." % [node_id, expr])

		var backdrop := str(node.get("backdrop", ""))
		if not BackdropRegistry.BACKDROP_IDS.has(backdrop):
			errors.append("Node '%s' has unknown backdrop '%s'." % [node_id, backdrop])

		if node.has("mood") and not BackdropRegistry.MOOD_IDS.has(str(node["mood"])):
			errors.append("Node '%s' has unknown mood '%s'." % [node_id, str(node["mood"])])

		if node.has("particles") and not BackdropRegistry.PARTICLE_IDS.has(str(node["particles"])):
			errors.append("Node '%s' has unknown particles '%s'." % [node_id, str(node["particles"])])

		var chars: Array = node.get("characters", [])
		for sc in chars:
			if typeof(sc) != TYPE_DICTIONARY:
				continue
			var sc_id := str(sc.get("id", ""))
			var sc_expr := str(sc.get("expression", ""))
			if not CharacterCatalog.CHARACTER_IDS.has(sc_id):
				errors.append("Node '%s' stage character '%s' is unknown." % [node_id, sc_id])
			if not ExpressionData.PRESET_IDS.has(sc_expr):
				errors.append("Node '%s' stage character '%s' has unknown expression '%s'." % [node_id, sc_id, sc_expr])

		if node.get("next", null) != null:
			var nxt := str(node["next"])
			if not nodes.has(nxt):
				errors.append("Node '%s' points to missing next node '%s'." % [node_id, nxt])

		if node.has("conditionFlag") and typeof(node["conditionFlag"]) == TYPE_DICTIONARY:
			var fb := str(node["conditionFlag"].get("fallbackNext", ""))
			if not nodes.has(fb):
				errors.append("Node '%s' conditionFlag fallbackNext '%s' is missing." % [node_id, fb])

		var inv = node.get("investigation", null)
		if typeof(inv) == TYPE_DICTIONARY:
			var cnext := str(inv.get("continueNext", ""))
			if not nodes.has(cnext):
				errors.append("Node '%s' investigation continueNext '%s' is missing." % [node_id, cnext])
			var hotspots: Array = inv.get("hotspots", [])
			if hotspots.is_empty():
				errors.append("Node '%s' investigation has no hotspots." % node_id)
			for hs in hotspots:
				if typeof(hs) != TYPE_DICTIONARY:
					continue
				var hs_sp := str(hs.get("speaker", ""))
				var hs_ex := str(hs.get("expression", ""))
				if hs_sp != "narrator" and not CharacterCatalog.CHARACTER_IDS.has(hs_sp):
					errors.append("Node '%s' hotspot '%s' has unknown speaker '%s'." % [node_id, str(hs.get("id", "")), hs_sp])
				if not ExpressionData.PRESET_IDS.has(hs_ex):
					errors.append("Node '%s' hotspot '%s' has unknown expression '%s'." % [node_id, str(hs.get("id", "")), hs_ex])

		var choices: Array = node.get("choices", [])
		for ch in choices:
			if typeof(ch) == TYPE_DICTIONARY:
				var ch_next := str(ch.get("next", ""))
				if not nodes.has(ch_next):
					errors.append("Node '%s' choice points to missing node '%s'." % [node_id, ch_next])

		if choices.is_empty() and typeof(inv) != TYPE_DICTIONARY and node.get("next", null) == null and not bool(node.get("endChapter", false)):
			errors.append("Node '%s' is a dead end without next, choices, investigation, or endChapter." % node_id)

	# BFS reachability
	var visited: Dictionary = {}
	if start_node != "" and nodes.has(start_node):
		var queue: Array = [start_node]
		visited[start_node] = true
		while not queue.is_empty():
			var curr_id := str(queue.pop_front())
			var curr: Dictionary = nodes.get(curr_id, {})
			var outgoing: Array = []
			if curr.get("next", null) != null:
				outgoing.append(str(curr["next"]))
			if curr.has("conditionFlag") and typeof(curr["conditionFlag"]) == TYPE_DICTIONARY:
				outgoing.append(str(curr["conditionFlag"].get("fallbackNext", "")))
			if curr.has("investigation") and typeof(curr["investigation"]) == TYPE_DICTIONARY:
				outgoing.append(str(curr["investigation"].get("continueNext", "")))
			for ch in curr.get("choices", []):
				if typeof(ch) == TYPE_DICTIONARY:
					outgoing.append(str(ch.get("next", "")))
			for target in outgoing:
				if nodes.has(target) and not visited.has(target):
					visited[target] = true
					queue.append(target)

	for node_id in nodes.keys():
		if not visited.has(node_id):
			errors.append("Node '%s' is unreachable from startNode '%s'." % [node_id, start_node])

	return errors
