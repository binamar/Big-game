class_name OrsenCharacter
extends CharacterBase

# Orsen: Master Blacksmith — deliberate weighted breathing, level gaze, soot-stained apron & forge tongs.

func _init() -> void:
	character_id = "orsen"
	bob_speed = 1.18
	bob_amplitude = 1.9
	tilt_speed = 0.62
	tilt_amplitude_deg = 1.8
	look_interval_min = 2.6
	look_interval_max = 5.4
	look_range_x = 2.7
	head_follow_x = 2.1

func _build_character_data() -> CharacterData:
	var c := CharacterData.new()
	c.id = "orsen"
	c.display_name = "Orsen"
	c.title = "Master Blacksmith"
	c.skin_tone = Color("#C18661")
	c.skin_shadow = Color("#9B6342")
	c.hair_color = Color("#2B2B30")
	c.hair_highlight = Color("#47474F")
	c.hair_style = "short_buzz"
	c.eye_color = Color("#4E5D6C")
	c.eye_secondary = Color("#7E90A1")
	c.outfit_primary = Color("#4B443E")
	c.outfit_secondary = Color("#302B27")
	c.outfit_accent = Color("#7C4B32")
	c.outline_color = Color("#1B1D22")
	c.accessory = "apron"
	c.accessory_label = "Heavy soot-stained leather apron & tongs"
	c.bio = "Blunt forge-master of the Outer Ward whose coal carts vanished mid-winter while Great Guild quotas doubled."
	return c

func _draw_character_body(c: CharacterData, stroke: Color) -> void:
	# Slightly broader blacksmith shoulders
	fill_poly(PackedVector2Array([
		Vector2(74, 252), Vector2(116, 230), Vector2(204, 230),
		Vector2(246, 252), Vector2(264, 418), Vector2(56, 418),
	]), c.outfit_primary, stroke, 3.0)
	fill_poly(PackedVector2Array([
		Vector2(132, 230), Vector2(160, 274), Vector2(188, 230),
		Vector2(182, 220), Vector2(138, 220),
	]), c.outfit_secondary, stroke, 2.5)
	fill_poly(PackedVector2Array([
		Vector2(140, 188), Vector2(140, 236), Vector2(160, 243),
		Vector2(180, 236), Vector2(180, 188),
	]), c.skin_tone, stroke, 2.6)
	draw_colored_polygon(PackedVector2Array([
		Vector2(142, 190), Vector2(160, 208), Vector2(178, 190),
		Vector2(178, 204), Vector2(160, 216), Vector2(142, 204),
	]), c.skin_shadow)

func _draw_face_details(c: CharacterData, _stroke: Color, off: Vector2) -> void:
	# Slight jaw stubble shadow & soot smudge on cheekbone
	var shadow := Color(c.skin_shadow.r, c.skin_shadow.g, c.skin_shadow.b, 0.35)
	draw_line(Vector2(126, 174) + off, Vector2(142, 191) + off, shadow, 2.2, true)
	draw_line(Vector2(194, 174) + off, Vector2(178, 191) + off, shadow, 2.2, true)
	draw_circle(Vector2(190, 162) + off, 3.2, Color(0.18, 0.17, 0.18, 0.25))

func _draw_character_front_hair(c: CharacterData, stroke: Color, off: Vector2) -> void:
	fill_poly(PackedVector2Array([
		Vector2(109, 124) + off, Vector2(114, 76) + off, Vector2(160, 72) + off,
		Vector2(206, 76) + off, Vector2(211, 124) + off, Vector2(196, 100) + off,
		Vector2(160, 98) + off, Vector2(124, 100) + off,
	]), c.hair_color, stroke, 2.6)

func _draw_character_accessory(c: CharacterData, stroke: Color) -> void:
	# Heavy leather apron straps, brass rivets, pocket, and iron tongs
	draw_line(Vector2(114, 238), Vector2(110, 295), c.outfit_accent, 12.0, true)
	draw_line(Vector2(206, 238), Vector2(210, 295), c.outfit_accent, 12.0, true)
	fill_poly(PackedVector2Array([
		Vector2(98, 286), Vector2(222, 286), Vector2(236, 418), Vector2(84, 418),
	]), c.outfit_accent, stroke, 2.8)
	draw_circle(Vector2(110, 296), 3.6, Color("#C7A463"))
	draw_circle(Vector2(210, 296), 3.6, Color("#C7A463"))
	draw_rect(Rect2(132, 318, 56, 36), Color("#5D3724"))
	draw_rect(Rect2(132, 318, 56, 36), stroke, false, 2.2)

	# Iron forge tongs tucked into apron pocket
	draw_line(Vector2(148, 294), Vector2(154, 336), Color("#6E7780"), 4.2, true)
	draw_line(Vector2(160, 294), Vector2(156, 336), Color("#586068"), 4.2, true)
