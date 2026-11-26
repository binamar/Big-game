class_name CharacterRegistry
extends RefCounted

const CHARACTER_IDS: PackedStringArray = [
	"torrik",
	"orsen",
	"myra",
	"haldor",
	"nova",
	"fennick",
	"ilvar",
	"selva",
	"rowan",
]

# Selva and Rowan explicitly share skin tone and eye color so they read as family.
const SIBLING_SKIN_TONE := Color("#C98E6B")
const SIBLING_SKIN_SHADOW := Color("#A86E4E")
const SIBLING_EYE_COLOR := Color("#8E5228")
const SIBLING_EYE_SECONDARY := Color("#C78A52")

static var _cache: Dictionary = {}

static func get_character(char_id: String) -> CharacterData:
	if _cache.is_empty():
		_build_cache()
	if _cache.has(char_id):
		return _cache[char_id]
	return _cache["torrik"]

static func get_all() -> Array[CharacterData]:
	if _cache.is_empty():
		_build_cache()
	var list: Array[CharacterData] = []
	for cid in CHARACTER_IDS:
		list.append(_cache[cid])
	return list

static func _build_cache() -> void:
	_cache["torrik"] = _make(
		"torrik", "Torrik", "Junior Guild Chronicler", "",
		Color("#D9AE8E"), Color("#BA8C6B"),
		Color("#3A2B26"), Color("#5A443C"), "cropped_parted",
		Color("#5B432E"), Color("#8C6C4B"),
		Color("#364556"), Color("#242E3A"), Color("#B78C4A"),
		"notebook", "Bound field notebook", false, false,
		"An apprentice clerk assigned to audit iron and grain tallies across the outer wards."
	)
	_cache["orsen"] = _make(
		"orsen", "Orsen", "Master Blacksmith", "",
		Color("#C18661"), Color("#9B6342"),
		Color("#2B2B30"), Color("#47474F"), "short_buzz",
		Color("#4E5D6C"), Color("#7E90A1"),
		Color("#4B443E"), Color("#302B27"), Color("#7C4B32"),
		"apron", "Soot-stained leather apron", false, false,
		"Veteran forge-master of the Outer Ward whose coal shipments vanished mid-winter."
	)
	_cache["myra"] = _make(
		"myra", "Myra", "Road Courier & Scout", "",
		Color("#E5BF9F"), Color("#C79B79"),
		Color("#7C3927"), Color("#A35139"), "braided_hood",
		Color("#426B49"), Color("#6F9C74"),
		Color("#3C5242"), Color("#29382E"), Color("#8C6239"),
		"satchel_hood", "Courier satchel and travel hood", false, false,
		"Fast-footed dispatch rider who knows every mud track between the city and the pass."
	)
	_cache["haldor"] = _make(
		"haldor", "Haldor", "Small Guild Commander", "",
		Color("#D6B6A1"), Color("#B5917A"),
		Color("#8B9096"), Color("#B4B9BF"), "swept_veteran",
		Color("#4A6278"), Color("#7C96AD"),
		Color("#393E46"), Color("#22262C"), Color("#733034"),
		"beard_cape", "Grey beard and weathered cape", false, true,
		"Aging garrison officer trying to uphold honest guild charters amidst rising shortages."
	)
	_cache["nova"] = _make(
		"nova", "Nova", "Mountain Wayfarer", "",
		Color("#E6D0C5"), Color("#C6ABA0"),
		Color("#25293E"), Color("#3E4566"), "long_straight",
		Color("#69648A"), Color("#9B96BF"),
		Color("#433C52"), Color("#2C2738"), Color("#7D758F"),
		"oversized_cloak", "Oversized draped cloak", false, false,
		"Quiet traveler who tracks displaced families along the ridge roads."
	)
	_cache["fennick"] = _make(
		"fennick", "Fennick", "Great Guild Quartermaster", "",
		Color("#DDB288"), Color("#BD9067"),
		Color("#B58F52"), Color("#D4B274"), "styled_wave",
		Color("#826A31"), Color("#BA9B4D"),
		Color("#782834"), Color("#471B24"), Color("#C9A24D"),
		"flashy_cloak", "Flashy gold-trimmed cloak", false, false,
		"Polished Great Guild envoy who insists every missing wagon is merely a clerical delay."
	)
	_cache["ilvar"] = _make(
		"ilvar", "Ilvar", "Senior Guild Archivist", "",
		Color("#D4C2B2"), Color("#B39F8F"),
		Color("#45484F"), Color("#747882"), "slicked_streaked",
		Color("#2F5E61"), Color("#588B8E"),
		Color("#2B313B"), Color("#1B1F26"), Color("#8F8267"),
		"long_coat", "High-collared long coat", false, false,
		"Keeper of the Great Guild vaults who trusts stamped ink far more than spoken promises."
	)
	_cache["selva"] = _make(
		"selva", "Selva", "Displaced Villager", "Siblings (Selva & Rowan)",
		SIBLING_SKIN_TONE, SIBLING_SKIN_SHADOW,
		Color("#36231C"), Color("#54392F"), "tucked_scarf",
		SIBLING_EYE_COLOR, SIBLING_EYE_SECONDARY,
		Color("#5E4D42"), Color("#3E332C"), Color("#B57B3E"),
		"headscarf", "Woven ochre-and-indigo headscarf", false, false,
		"Sister to Rowan. Organizes shelter for families forced out of the dry borderlands."
	)
	_cache["rowan"] = _make(
		"rowan", "Rowan", "Militia Shield-Bearer", "Siblings (Selva & Rowan)",
		SIBLING_SKIN_TONE, SIBLING_SKIN_SHADOW,
		Color("#36231C"), Color("#54392F"), "tousled_gaunt",
		SIBLING_EYE_COLOR, SIBLING_EYE_SECONDARY,
		Color("#474A44"), Color("#2E302C"), Color("#6C7378"),
		"pierced_shield", "Pierced shield and gaunt face", true, false,
		"Brother to Selva. Holds the mountain pass on half-rations with a splintered iron-rimmed shield."
	)

static func _make(
	p_id: String,
	p_name: String,
	p_title: String,
	p_family: String,
	p_skin: Color,
	p_skin_shadow: Color,
	p_hair: Color,
	p_hair_hi: Color,
	p_hair_style: String,
	p_eye: Color,
	p_eye_sec: Color,
	p_out1: Color,
	p_out2: Color,
	p_accent: Color,
	p_acc: String,
	p_acc_label: String,
	p_gaunt: bool,
	p_beard: bool,
	p_bio: String
) -> CharacterData:
	var c := CharacterData.new()
	c.id = p_id
	c.display_name = p_name
	c.title = p_title
	c.family_group = p_family
	c.skin_tone = p_skin
	c.skin_shadow = p_skin_shadow
	c.hair_color = p_hair
	c.hair_highlight = p_hair_hi
	c.hair_style = p_hair_style
	c.eye_color = p_eye
	c.eye_secondary = p_eye_sec
	c.outfit_primary = p_out1
	c.outfit_secondary = p_out2
	c.outfit_accent = p_accent
	c.outline_color = Color("#1B1D22")
	c.accessory = p_acc
	c.accessory_label = p_acc_label
	c.gaunt = p_gaunt
	c.has_beard = p_beard
	c.bio = p_bio
	return c
