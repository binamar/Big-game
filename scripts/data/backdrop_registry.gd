class_name BackdropRegistry
extends RefCounted

const BACKDROP_IDS: PackedStringArray = [
	"small_guild_hall",
	"blacksmith_workshop",
	"city_square",
	"great_guild_headquarters",
	"ruined_village",
	"army_camp_dusk",
	"mountain_road",
	"night_alley",
	"archive_room",
	"rainy_street",
	"dry_farmland",
	"council_chamber",
]

const MOOD_IDS: PackedStringArray = [
	"calm",
	"tense",
	"somber",
	"urgent",
	"warm",
	"bleak",
]

const PARTICLE_IDS: PackedStringArray = [
	"none",
	"rain",
	"dust",
	"embers",
]

static func get_mood_palette(mood_id: String) -> Dictionary:
	match mood_id:
		"tense":
			return {
				"label": "Tense",
				"sky_top": Color("#1F232C"),
				"sky_bottom": Color("#4A434B"),
				"far_layer": Color("#36323B"),
				"mid_layer": Color("#24222A"),
				"near_layer": Color("#16161C"),
				"light_color": Color("#D97B48"),
				"tint": Color(0.15, 0.08, 0.08, 0.18),
			}
		"somber":
			return {
				"label": "Somber",
				"sky_top": Color("#1E2730"),
				"sky_bottom": Color("#43515E"),
				"far_layer": Color("#34404A"),
				"mid_layer": Color("#232C34"),
				"near_layer": Color("#141A20"),
				"light_color": Color("#B8C4CC"),
				"tint": Color(0.07, 0.10, 0.14, 0.24),
			}
		"urgent":
			return {
				"label": "Urgent",
				"sky_top": Color("#2D2126"),
				"sky_bottom": Color("#734237"),
				"far_layer": Color("#4B2F2D"),
				"mid_layer": Color("#312022"),
				"near_layer": Color("#1D1416"),
				"light_color": Color("#F09D4B"),
				"tint": Color(0.22, 0.08, 0.06, 0.16),
			}
		"warm":
			return {
				"label": "Warm",
				"sky_top": Color("#2D2824"),
				"sky_bottom": Color("#6D543D"),
				"far_layer": Color("#4E3D2F"),
				"mid_layer": Color("#342920"),
				"near_layer": Color("#201914"),
				"light_color": Color("#F2B863"),
				"tint": Color(0.19, 0.12, 0.06, 0.10),
			}
		"bleak":
			return {
				"label": "Bleak",
				"sky_top": Color("#2F3336"),
				"sky_bottom": Color("#6F6D66"),
				"far_layer": Color("#524F49"),
				"mid_layer": Color("#383632"),
				"near_layer": Color("#21201E"),
				"light_color": Color("#D6BA82"),
				"tint": Color(0.16, 0.15, 0.11, 0.20),
			}
		_:
			return {
				"label": "Calm",
				"sky_top": Color("#263547"),
				"sky_bottom": Color("#596F82"),
				"far_layer": Color("#3A4A5B"),
				"mid_layer": Color("#273340"),
				"near_layer": Color("#19212A"),
				"light_color": Color("#EBC27A"),
				"tint": Color(0.08, 0.12, 0.17, 0.12),
			}

static func get_backdrop_meta(scene_id: String) -> Dictionary:
	match scene_id:
		"blacksmith_workshop":
			return {"name": "Blacksmith Workshop", "region": "Outer Ward", "default_mood": "tense", "default_particles": "embers"}
		"city_square":
			return {"name": "City Square", "region": "Lower Market", "default_mood": "calm", "default_particles": "dust"}
		"great_guild_headquarters":
			return {"name": "Great Guild Headquarters", "region": "High Quarter", "default_mood": "tense", "default_particles": "none"}
		"ruined_village":
			return {"name": "Ruined Village", "region": "Borderlands", "default_mood": "somber", "default_particles": "dust"}
		"army_camp_dusk":
			return {"name": "Army Camp at Dusk", "region": "East Ridge", "default_mood": "urgent", "default_particles": "embers"}
		"mountain_road":
			return {"name": "Mountain Road", "region": "High Pass", "default_mood": "calm", "default_particles": "dust"}
		"night_alley":
			return {"name": "Night Alley", "region": "Lower Market", "default_mood": "tense", "default_particles": "none"}
		"archive_room":
			return {"name": "Archive Room", "region": "Great Guild Vaults", "default_mood": "warm", "default_particles": "dust"}
		"rainy_street":
			return {"name": "Rainy Street", "region": "Outer Ward", "default_mood": "somber", "default_particles": "rain"}
		"dry_farmland":
			return {"name": "Dry Farmland", "region": "South Valley", "default_mood": "bleak", "default_particles": "dust"}
		"council_chamber":
			return {"name": "Council Chamber", "region": "Great Guild Seat", "default_mood": "tense", "default_particles": "none"}
		_:
			return {"name": "Small Guild Hall", "region": "Outer Ward", "default_mood": "warm", "default_particles": "dust"}
