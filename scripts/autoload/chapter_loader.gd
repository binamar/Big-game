extends Node

const CHAPTER_COUNT := 10
var _chapters: Dictionary = {}
var _ordered_ids: PackedStringArray = []

func _ready() -> void:
	reload_all()

func reload_all() -> void:
	_chapters.clear()
	_ordered_ids.clear()
	for i in range(1, CHAPTER_COUNT + 1):
		var chap_id := "chapter_%02d" % i
		var path := "res://data/chapters/%s.json" % chap_id
		if FileAccess.file_exists(path):
			var file := FileAccess.open(path, FileAccess.READ)
			if file:
				var parsed = JSON.parse_string(file.get_as_text())
				file.close()
				if typeof(parsed) == TYPE_DICTIONARY:
					_chapters[chap_id] = parsed
					_ordered_ids.append(chap_id)

func get_chapter(chapter_id: String) -> Dictionary:
	if _chapters.is_empty():
		reload_all()
	return _chapters.get(chapter_id, {})

func get_ordered_chapters() -> Array:
	if _chapters.is_empty():
		reload_all()
	var list: Array = []
	for cid in _ordered_ids:
		list.append(_chapters[cid])
	return list
