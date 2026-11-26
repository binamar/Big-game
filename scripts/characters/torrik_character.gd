class_name TorrikCharacter
extends CharacterBase

# Torrik: Junior Guild Chronicler — thoughtful chronicler cadence, bound field notebook & brass pen.

func _init() -> void:
	character_id = "torrik"
	bob_speed = 1.4
	bob_amplitude = 2.2
	tilt_speed = 0.85
	tilt_amplitude_deg = 2.4
	look_interval_min = 2.1
	look_interval_max = 4.2
	look_range_x = 3.2
	head_follow_x = 2.6

func _build_character_data() -> CharacterData:
	var c := CharacterData.new()
	c.id = "torrik"
	c.display_name = "Torrik"
	c.title = "Junior Guild Chronicler"
	c.skin_tone = Color("#D9AE8E")
	c.skin_shadow = Color("#BA8C6B")
	c.hair_color = Color("#3A2B26")
	c.hair_highlight = Color("#5A443C")
	c.hair_style = "cropped_parted"
	c.eye_color = Color("#5B432E")
	c.eye_secondary = Color("#8C6C4B")
	c.outfit_primary = Color("#364556")
	c.outfit_secondary = Color("#242E3A")
	c.outfit_accent = Color("#B78C4A")
	c.outline_color = Color("#1B1D22")
	c.accessory = "notebook"
	c.accessory_label = "Bound field notebook & brass pen"
	c.bio = "Methodical Outer Ward clerk who writes down every weight and seal other officials try to wave away."
	return c

func _draw_character_front_hair(c: CharacterData, stroke: Color, off: Vector2) -> void:
	fill_poly(PackedVector2Array([
		Vector2(107, 132) + off, Vector2(114, 74) + off, Vector2(160, 68) + off,
		Vector2(206, 74) + off, Vector2(213, 132) + off, Vector2(186, 102) + off,
		Vector2(160, 110) + off, Vector2(134, 102) + off,
	]), c.hair_color, stroke, 2.6)
	draw_polyline(PackedVector2Array([
		Vector2(126, 88) + off, Vector2(146, 82) + off, Vector2(162, 86) + off,
	]), c.hair_highlight, 2.5, true)

func _draw_character_accessory(c: CharacterData, stroke: Color) -> void:
	# Brass collar clasp & satchel strap
	draw_polyline(PackedVector2Array([Vector2(126, 238), Vector2(160, 282), Vector2(194, 238)]), c.outfit_accent, 3.2, true)
	draw_circle(Vector2(160, 272), 5.5, c.outfit_accent)
	draw_arc(Vector2(160, 272), 5.5, 0.0, TAU, 12, stroke, 2.0)

	# Held bound field notebook
	var nb := PackedVector2Array([Vector2(176, 294), Vector2(240, 286), Vector2(248, 370), Vector2(184, 378)])
	fill_poly(nb, Color("#6E4730"), stroke, 2.8)
	draw_colored_polygon(PackedVector2Array([Vector2(184, 300), Vector2(232, 294), Vector2(238, 364), Vector2(190, 370)]), Color("#E8DFC8"))
	fill_poly(nb, Color(0, 0, 0, 0), stroke, 2.8)
	draw_rect(Rect2(232, 326, 14, 10), c.outfit_accent)

	# Brass pen tucked beside notebook
	draw_line(Vector2(214, 296), Vector2(226, 336), Color("#D4AF63"), 3.4, true)
	draw_circle(Vector2(182, 352), 14.0, c.skin_tone)
	draw_arc(Vector2(182, 352), 14.0, 0.0, TAU, 16, stroke, 2.4)
