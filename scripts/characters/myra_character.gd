class_name MyraCharacter
extends CharacterBase

# Myra: Road Courier & Scout — lively left-right horizon glances, courier satchel & hood.

func _init() -> void:
	character_id = "myra"
	bob_speed = 1.65
	bob_amplitude = 2.6
	tilt_speed = 1.05
	tilt_amplitude_deg = 3.2
	look_interval_min = 1.6
	look_interval_max = 3.4
	look_range_x = 3.8
	head_follow_x = 3.4

func _build_character_data() -> CharacterData:
	var c := CharacterData.new()
	c.id = "myra"
	c.display_name = "Myra"
	c.title = "Road Courier & Scout"
	c.skin_tone = Color("#E5BF9F")
	c.skin_shadow = Color("#C79B79")
	c.hair_color = Color("#7C3927")
	c.hair_highlight = Color("#A35139")
	c.hair_style = "braided_hood"
	c.eye_color = Color("#426B49")
	c.eye_secondary = Color("#6F9C74")
	c.outfit_primary = Color("#3C5242")
	c.outfit_secondary = Color("#29382E")
	c.outfit_accent = Color("#8C6239")
	c.outline_color = Color("#1B1D22")
	c.accessory = "satchel_hood"
	c.accessory_label = "Cross-body courier satchel & travel hood"
	c.bio = "Fast-footed dispatch rider who reads mud ruts, river sluices, and crooked smiles faster than any council clerk."
	return c

func _draw_character_back(c: CharacterData, stroke: Color) -> void:
	# Hood cowl behind neck & thick auburn side braid
	fill_poly(PackedVector2Array([
		Vector2(92, 140), Vector2(120, 76), Vector2(200, 76),
		Vector2(228, 140), Vector2(238, 225), Vector2(82, 225),
	]), c.outfit_secondary, stroke, 2.8)
	draw_polyline(PackedVector2Array([
		Vector2(110, 185), Vector2(104, 225), Vector2(112, 260), Vector2(108, 294),
	]), c.hair_color, 11.0, true)
	draw_circle(Vector2(108, 295), 4.5, c.outfit_accent)

func _draw_face_details(c: CharacterData, _stroke: Color, off: Vector2) -> void:
	# Subtle wind-freckled scout cheeks
	var freckle := Color(c.skin_shadow.r, c.skin_shadow.g, c.skin_shadow.b, 0.72)
	for fx in [125.0, 131.0, 189.0, 195.0]:
		draw_circle(Vector2(fx, 158) + off, 1.3, freckle)

func _draw_character_front_hair(c: CharacterData, stroke: Color, off: Vector2) -> void:
	fill_poly(PackedVector2Array([
		Vector2(110, 128) + off, Vector2(120, 82) + off, Vector2(160, 80) + off,
		Vector2(200, 82) + off, Vector2(210, 128) + off, Vector2(160, 110) + off,
	]), c.hair_color, stroke, 2.5)
	fill_poly(PackedVector2Array([
		Vector2(102, 150) + off, Vector2(106, 82) + off, Vector2(160, 66) + off,
		Vector2(214, 82) + off, Vector2(218, 150) + off, Vector2(196, 94) + off,
		Vector2(160, 88) + off, Vector2(124, 94) + off,
	]), c.outfit_primary, stroke, 2.8)

func _draw_character_accessory(c: CharacterData, stroke: Color) -> void:
	# Hood drape & cross-body leather courier satchel
	fill_poly(PackedVector2Array([
		Vector2(80, 250), Vector2(160, 276), Vector2(240, 250),
		Vector2(248, 278), Vector2(160, 304), Vector2(72, 278),
	]), c.outfit_secondary, stroke, 2.6)
	draw_line(Vector2(104, 244), Vector2(228, 386), c.outfit_accent, 15.0, true)
	draw_line(Vector2(104, 244), Vector2(228, 386), stroke, 2.2, true)
	draw_rect(Rect2(150, 302, 16, 12), Color("#C9A24D"))
	draw_rect(Rect2(196, 352, 52, 54), Color("#6F4B2B"))
	draw_rect(Rect2(196, 352, 52, 54), stroke, false, 2.8)
