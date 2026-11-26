class_name CharacterCatalog
extends RefCounted

const CHARACTER_IDS: PackedStringArray = [
	"torrik",
	"myra",
	"orsen",
]

static func get_scene_path(char_id: String) -> String:
	match char_id:
		"myra":
			return "res://scenes/characters/myra_character.tscn"
		"orsen":
			return "res://scenes/characters/orsen_character.tscn"
		_:
			return "res://scenes/characters/torrik_character.tscn"

static func spawn_character(char_id: String) -> CharacterBase:
	var packed := load(get_scene_path(char_id)) as PackedScene
	if packed:
		var inst := packed.instantiate()
		if inst is CharacterBase:
			return inst
	return TorrikCharacter.new()

static func get_meta(char_id: String) -> Dictionary:
	match char_id:
		"myra":
			return {
				"id": "myra",
				"name": "Myra",
				"title": "Road Courier & Scout",
				"accessory": "Cross-body courier satchel & travel hood",
				"bio": "Fast-footed dispatch rider who reads mud ruts, river sluices, and crooked smiles faster than any council clerk.",
			}
		"orsen":
			return {
				"id": "orsen",
				"name": "Orsen",
				"title": "Master Blacksmith",
				"accessory": "Heavy soot-stained leather apron & tongs",
				"bio": "Blunt forge-master of the Outer Ward whose coal carts vanished mid-winter while Great Guild quotas doubled.",
			}
		_:
			return {
				"id": "torrik",
				"name": "Torrik",
				"title": "Junior Guild Chronicler",
				"accessory": "Bound field notebook & brass pen",
				"bio": "Methodical Outer Ward clerk who writes down every weight and seal other officials try to wave away.",
			}
