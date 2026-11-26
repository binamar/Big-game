class_name CharacterPortrait
extends Control

@export var character_id: String = "torrik"
@export var expression_id: String = "neutral"
@export var flip_horizontal: bool = false
@export var active_speaker: bool = true

var is_speaking: bool = false

# Live tweened expression numbers
var _eyebrow_angle: float = 0.0
var _eyebrow_height: float = 0.0
var _eyelid_openness: float = 0.92
var _pupil_x: float = 0.0
var _pupil_y: float = 0.0
var _mouth_curve: float = 0.1
var _mouth_openness: float = 0.0
var _show_tear: bool = false
var _show_sweat: bool = false

var _blink_open: float = 1.0
var _blink_timer: float = 2.8
var _sway_phase: float = 0.0
var _speak_phase: float = 0.0
var _shake_time: float = 0.0
var _active_tween: Tween
var _override_rect: TextureRect

func _ready() -> void:
	custom_minimum_size = Vector2(280, 380)
	_override_rect = TextureRect.new()
	_override_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	_override_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_override_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_override_rect.visible = false
	add_child(_override_rect)
	apply_character(character_id, expression_id, true)

func apply_character(p_char_id: String, p_expr_id: String, immediate: bool = false) -> void:
	character_id = p_char_id
	expression_id = p_expr_id
	_sway_phase = float(character_id.unicode_at(0) % 7) * 0.9 if character_id.length() > 0 else 0.0
	_check_override()
	set_expression(p_expr_id, immediate)
	if p_expr_id == "surprised" and not immediate:
		trigger_shock()

func set_expression(p_expr_id: String, immediate: bool = false) -> void:
	expression_id = p_expr_id
	_check_override()
	var target: ExpressionData = ExpressionData.get_preset(p_expr_id)
	apply_expression_params(target, immediate)

func apply_expression_params(target: ExpressionData, immediate: bool = false) -> void:
	_show_tear = target.tear
	_show_sweat = target.sweat_drop
	if _active_tween and _active_tween.is_valid():
		_active_tween.kill()

	if immediate:
		_eyebrow_angle = target.eyebrow_angle
		_eyebrow_height = target.eyebrow_height
		_eyelid_openness = target.eyelid_openness
		_pupil_x = target.pupil_offset_x
		_pupil_y = target.pupil_offset_y
		_mouth_curve = target.mouth_curve
		_mouth_openness = target.mouth_openness
		queue_redraw()
		return

	_active_tween = create_tween().set_parallel(true).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	_active_tween.tween_property(self, "_eyebrow_angle", target.eyebrow_angle, 0.2)
	_active_tween.tween_property(self, "_eyebrow_height", target.eyebrow_height, 0.2)
	_active_tween.tween_property(self, "_eyelid_openness", target.eyelid_openness, 0.2)
	_active_tween.tween_property(self, "_pupil_x", target.pupil_offset_x, 0.2)
	_active_tween.tween_property(self, "_pupil_y", target.pupil_offset_y, 0.2)
	_active_tween.tween_property(self, "_mouth_curve", target.mouth_curve, 0.2)
	_active_tween.tween_property(self, "_mouth_openness", target.mouth_openness, 0.2)

func set_active_speaker(is_active: bool) -> void:
	active_speaker = is_active
	modulate = Color(1.0, 1.0, 1.0, 1.0) if is_active else Color(0.72, 0.72, 0.76, 0.92)
	queue_redraw()

func trigger_shock() -> void:
	_shake_time = 0.36

func _check_override() -> void:
	var path := "res://assets/portraits/%s_%s.png" % [character_id, expression_id]
	if ResourceLoader.exists(path):
		var tex := load(path) as Texture2D
		if tex:
			_override_rect.texture = tex
			_override_rect.flip_h = flip_horizontal
			_override_rect.visible = true
			queue_redraw()
			return
	_override_rect.visible = false
	_override_rect.texture = null
	queue_redraw()

func _process(delta: float) -> void:
	_sway_phase += delta * 1.4
	if is_speaking:
		_speak_phase += delta * 18.0
	else:
		_speak_phase = 0.0

	_blink_timer -= delta
	if _blink_timer <= 0.0:
		_blink_timer = randf_range(2.6, 5.4)
		var bt := create_tween()
		bt.tween_property(self, "_blink_open", 0.06, 0.07)
		bt.tween_property(self, "_blink_open", 1.0, 0.08)

	if _shake_time > 0.0:
		_shake_time = maxf(0.0, _shake_time - delta)

	queue_redraw()

func _draw() -> void:
	if _override_rect and _override_rect.visible:
		return

	var c: CharacterData = CharacterRegistry.get_character(character_id)
	var base_scale := minf(size.x / 320.0, size.y / 420.0)
	if base_scale <= 0.05:
		base_scale = 1.0

	var sway_y := sin(_sway_phase) * 2.2
	var shake_x := 0.0
	if _shake_time > 0.0:
		var decay := _shake_time / 0.36
		shake_x = sin(_shake_time * 95.0) * 10.0 * decay

	var center_x := size.x * 0.5 + shake_x
	var bottom_y := size.y + sway_y
	var x_dir := -1.0 if flip_horizontal else 1.0

	# Coordinate transform mapping logical 320x420 portrait space into Control rect
	draw_set_transform(Vector2(center_x - 160.0 * base_scale * x_dir, bottom_y - 420.0 * base_scale), 0.0, Vector2(base_scale * x_dir, base_scale))

	var stroke := c.outline_color

	# --- BACK HAIR & BACK CLOAKS ---
	if c.hair_style == "long_straight":
		_fill_poly(PackedVector2Array([Vector2(100, 105), Vector2(84, 310), Vector2(236, 310), Vector2(220, 105)]), c.hair_color, stroke, 2.8)
	elif c.hair_style == "braided_hood":
		_fill_poly(PackedVector2Array([Vector2(92, 140), Vector2(120, 76), Vector2(200, 76), Vector2(228, 140), Vector2(238, 225), Vector2(82, 225)]), c.outfit_secondary, stroke, 2.8)
		draw_polyline(PackedVector2Array([Vector2(110, 185), Vector2(104, 225), Vector2(112, 260), Vector2(108, 292)]), c.hair_color, 11.0, true)

	if c.accessory == "beard_cape":
		_fill_poly(PackedVector2Array([Vector2(72, 245), Vector2(55, 415), Vector2(265, 415), Vector2(248, 245)]), c.outfit_accent, stroke, 2.8)
	elif c.accessory == "flashy_cloak":
		_fill_poly(PackedVector2Array([Vector2(66, 235), Vector2(42, 415), Vector2(278, 415), Vector2(254, 235)]), c.outfit_primary, stroke, 2.8)
	elif c.accessory == "oversized_cloak":
		_fill_poly(PackedVector2Array([Vector2(74, 220), Vector2(44, 415), Vector2(276, 415), Vector2(246, 220)]), c.outfit_secondary, stroke, 2.8)

	# --- MODEST TORSO & HIGH COLLAR ---
	_fill_poly(PackedVector2Array([Vector2(84, 252), Vector2(120, 232), Vector2(200, 232), Vector2(236, 252), Vector2(256, 415), Vector2(64, 415)]), c.outfit_primary, stroke, 3.0)
	_fill_poly(PackedVector2Array([Vector2(132, 232), Vector2(160, 278), Vector2(188, 232), Vector2(182, 222), Vector2(138, 222)]), c.outfit_secondary, stroke, 2.5)

	# --- NECK ---
	_fill_poly(PackedVector2Array([Vector2(142, 186), Vector2(142, 236), Vector2(160, 242), Vector2(178, 236), Vector2(178, 186)]), c.skin_tone, stroke, 2.6)
	draw_colored_polygon(PackedVector2Array([Vector2(144, 188), Vector2(160, 206), Vector2(176, 188), Vector2(176, 202), Vector2(160, 214), Vector2(144, 202)]), c.skin_shadow)

	# --- EARS & HEAD ---
	draw_circle(Vector2(111, 150), 9.5, c.skin_tone)
	draw_arc(Vector2(111, 150), 9.5, PI * 0.5, PI * 1.5, 12, stroke, 2.4)
	draw_circle(Vector2(209, 150), 9.5, c.skin_tone)
	draw_arc(Vector2(209, 150), 9.5, -PI * 0.5, PI * 0.5, 12, stroke, 2.4)

	var head_pts := PackedVector2Array([
		Vector2(112, 120),
		Vector2(124, 86),
		Vector2(160, 78),
		Vector2(196, 86),
		Vector2(208, 120),
		Vector2(204, 162),
		Vector2(190, 190),
		Vector2(160, 203),
		Vector2(130, 190),
		Vector2(116, 162),
	])
	_fill_poly(head_pts, c.skin_tone, stroke, 2.8)

	# Rowan's gaunt hollow cheek shading
	if c.gaunt:
		var gaunt_col := Color(c.skin_shadow.r, c.skin_shadow.g, c.skin_shadow.b, 0.55)
		draw_line(Vector2(122, 158), Vector2(135, 178), gaunt_col, 2.4, true)
		draw_line(Vector2(198, 158), Vector2(185, 178), gaunt_col, 2.4, true)
		draw_line(Vector2(124, 157), Vector2(144, 157), gaunt_col, 1.8, true)
		draw_line(Vector2(176, 157), Vector2(196, 157), gaunt_col, 1.8, true)

	# --- EYES (Iris gradient + highlights + dynamic eyelid openness) ---
	var open_ratio := clampf(_eyelid_openness * _blink_open, 0.05, 1.0)
	_draw_eye(Vector2(136, 146), open_ratio, c, stroke)
	_draw_eye(Vector2(184, 146), open_ratio, c, stroke)

	# --- EYEBROWS ---
	_draw_eyebrow(Vector2(136, 130 + _eyebrow_height), -_eyebrow_angle, stroke)
	_draw_eyebrow(Vector2(184, 130 + _eyebrow_height), _eyebrow_angle, stroke)

	# --- NOSE ---
	draw_polyline(PackedVector2Array([Vector2(160, 151), Vector2(157, 164), Vector2(163, 165)]), Color(stroke.r, stroke.g, stroke.b, 0.8), 2.0, true)

	# --- MOUTH (curve + openness + typing animation) ---
	var speak_delta := absf(sin(_speak_phase)) * 0.48 if is_speaking else 0.0
	var m_open := minf(1.0, _mouth_openness + speak_delta)
	var curve_y := _mouth_curve * 7.0
	if m_open > 0.12:
		var mouth_poly := PackedVector2Array([
			Vector2(147, 177),
			Vector2(160, 177 + curve_y * 0.5),
			Vector2(173, 177),
			Vector2(160, 179 + m_open * 13.0),
		])
		_fill_poly(mouth_poly, Color("#6D3439"), stroke, 2.2)
	else:
		draw_polyline(PackedVector2Array([Vector2(147, 178), Vector2(160, 178 + curve_y), Vector2(173, 178)]), stroke, 2.4, true)

	# --- HALDOR'S GREY BEARD ---
	if c.has_beard:
		var beard_pts := PackedVector2Array([
			Vector2(118, 164), Vector2(124, 198), Vector2(142, 214),
			Vector2(160, 224), Vector2(178, 214), Vector2(196, 198),
			Vector2(202, 164), Vector2(182, 172), Vector2(160, 167), Vector2(138, 172),
		])
		_fill_poly(beard_pts, c.hair_color, stroke, 2.5)
		if m_open > 0.12:
			_fill_poly(PackedVector2Array([Vector2(149, 178), Vector2(160, 178 + curve_y * 0.4), Vector2(171, 178), Vector2(160, 180 + m_open * 10.0)]), Color("#6D3439"), stroke, 2.0)
		else:
			draw_polyline(PackedVector2Array([Vector2(149, 179), Vector2(160, 179 + curve_y * 0.7), Vector2(171, 179)]), stroke, 2.2, true)

	# --- OPTIONAL BLUSH-FREE TEAR & SWEAT DROP ---
	if _show_tear:
		_fill_poly(PackedVector2Array([Vector2(126, 155), Vector2(122, 164), Vector2(126, 168), Vector2(130, 164)]), Color("#BFE3F7"), stroke, 1.5)
	if _show_sweat:
		_fill_poly(PackedVector2Array([Vector2(201, 124), Vector2(196, 135), Vector2(201, 140), Vector2(206, 135)]), Color("#CFEAF9"), stroke, 1.6)

	# --- FRONT HAIR & HEADSCARF ---
	_draw_front_hair(c, stroke)

	# --- SIGNATURE ACCESSORIES ---
	_draw_accessory(c, stroke)

	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

func _draw_eye(pos: Vector2, open_ratio: float, c: CharacterData, stroke: Color) -> void:
	var ry := maxf(1.6, 7.2 * open_ratio)
	var pts := PackedVector2Array()
	for i in range(16):
		var a := float(i) / 16.0 * TAU
		pts.append(pos + Vector2(cos(a) * 13.0, sin(a) * ry))
	draw_colored_polygon(pts, Color("#F8F9FA"))

	if open_ratio > 0.25:
		var iris_pos := pos + Vector2(_pupil_x, _pupil_y)
		var iris_r := minf(7.2, ry * 0.95)
		draw_circle(iris_pos, iris_r, c.eye_color)
		draw_arc(iris_pos, iris_r * 0.75, 0.2, PI - 0.2, 12, c.eye_secondary, 2.6)
		draw_circle(iris_pos, iris_r * 0.42, Color("#17191E"))
		draw_circle(iris_pos + Vector2(-2.4, -2.5), 2.1, Color.WHITE)
		draw_circle(iris_pos + Vector2(2.4, 2.2), 1.1, Color(1, 1, 1, 0.85))

	# Upper and lower lash outlines
	draw_polyline(PackedVector2Array([
		pos + Vector2(-14, -ry * 0.15),
		pos + Vector2(0, -ry * 1.1),
		pos + Vector2(14, -ry * 0.15),
	]), stroke, 2.8, true)
	draw_polyline(PackedVector2Array([
		pos + Vector2(-11, ry * 0.7),
		pos + Vector2(0, ry * 1.05),
		pos + Vector2(11, ry * 0.7),
	]), Color(stroke.r, stroke.g, stroke.b, 0.7), 1.4, true)

func _draw_eyebrow(pos: Vector2, angle_deg: float, stroke: Color) -> void:
	var rad := deg_to_rad(angle_deg)
	var p1 := pos + Vector2(-13.0, 0.0).rotated(rad)
	var p2 := pos + Vector2(0.0, -3.0).rotated(rad)
	var p3 := pos + Vector2(13.0, 0.0).rotated(rad)
	draw_polyline(PackedVector2Array([p1, p2, p3]), stroke, 3.1, true)

func _draw_front_hair(c: CharacterData, stroke: Color) -> void:
	match c.hair_style:
		"tucked_scarf":
			_fill_poly(PackedVector2Array([Vector2(112, 132), Vector2(128, 102), Vector2(160, 104), Vector2(192, 102), Vector2(208, 132), Vector2(160, 114)]), c.hair_color, stroke, 2.4)
			# Selva's woven ochre-and-indigo headscarf
			_fill_poly(PackedVector2Array([Vector2(100, 165), Vector2(106, 86), Vector2(160, 66), Vector2(214, 86), Vector2(220, 165), Vector2(198, 106), Vector2(160, 96), Vector2(122, 106)]), c.outfit_accent, stroke, 2.8)
			_fill_poly(PackedVector2Array([Vector2(100, 156), Vector2(112, 275), Vector2(208, 275), Vector2(220, 156), Vector2(198, 198), Vector2(160, 222), Vector2(122, 198)]), Color("#35485E"), stroke, 2.6)
			draw_line(Vector2(112, 114), Vector2(160, 94), Color("#E6C994"), 2.4, true)
			draw_line(Vector2(160, 94), Vector2(208, 114), Color("#E6C994"), 2.4, true)
		"braided_hood":
			_fill_poly(PackedVector2Array([Vector2(110, 128), Vector2(120, 82), Vector2(160, 80), Vector2(200, 82), Vector2(210, 128), Vector2(160, 110)]), c.hair_color, stroke, 2.5)
			_fill_poly(PackedVector2Array([Vector2(102, 150), Vector2(106, 82), Vector2(160, 66), Vector2(214, 82), Vector2(218, 150), Vector2(196, 94), Vector2(160, 88), Vector2(124, 94)]), c.outfit_primary, stroke, 2.8)
		"slicked_streaked":
			_fill_poly(PackedVector2Array([Vector2(107, 132), Vector2(116, 76), Vector2(160, 66), Vector2(204, 76), Vector2(213, 132), Vector2(196, 98), Vector2(160, 94), Vector2(124, 98)]), c.hair_color, stroke, 2.6)
			draw_line(Vector2(122, 86), Vector2(126, 108), c.hair_highlight, 4.0, true)
			draw_line(Vector2(198, 86), Vector2(194, 108), c.hair_highlight, 4.0, true)
		"tousled_gaunt":
			_fill_poly(PackedVector2Array([Vector2(104, 136), Vector2(112, 80), Vector2(158, 60), Vector2(206, 78), Vector2(214, 136), Vector2(180, 114), Vector2(162, 96), Vector2(144, 114)]), c.hair_color, stroke, 2.6)
		"long_straight":
			_fill_poly(PackedVector2Array([Vector2(104, 148), Vector2(114, 76), Vector2(160, 68), Vector2(206, 76), Vector2(216, 148), Vector2(176, 102), Vector2(160, 114), Vector2(144, 102)]), c.hair_color, stroke, 2.6)
		_:
			_fill_poly(PackedVector2Array([Vector2(107, 132), Vector2(114, 74), Vector2(160, 68), Vector2(206, 74), Vector2(213, 132), Vector2(186, 102), Vector2(160, 110), Vector2(134, 102)]), c.hair_color, stroke, 2.6)

func _draw_accessory(c: CharacterData, stroke: Color) -> void:
	match c.accessory:
		"notebook":
			draw_polyline(PackedVector2Array([Vector2(126, 238), Vector2(160, 282), Vector2(194, 238)]), c.outfit_accent, 3.2, true)
			var nb := PackedVector2Array([Vector2(176, 294), Vector2(240, 286), Vector2(248, 370), Vector2(184, 378)])
			_fill_poly(nb, Color("#6E4730"), stroke, 2.8)
			draw_colored_polygon(PackedVector2Array([Vector2(184, 300), Vector2(232, 294), Vector2(238, 364), Vector2(190, 370)]), Color("#E8DFC8"))
			_fill_poly(nb, Color(0, 0, 0, 0), stroke, 2.8)
			draw_rect(Rect2(232, 326, 14, 10), c.outfit_accent)
			draw_circle(Vector2(182, 352), 14.0, c.skin_tone)
			draw_arc(Vector2(182, 352), 14.0, 0.0, TAU, 16, stroke, 2.4)
		"apron":
			draw_line(Vector2(114, 238), Vector2(110, 295), c.outfit_accent, 12.0, true)
			draw_line(Vector2(206, 238), Vector2(210, 295), c.outfit_accent, 12.0, true)
			_fill_poly(PackedVector2Array([Vector2(98, 286), Vector2(222, 286), Vector2(236, 415), Vector2(84, 415)]), c.outfit_accent, stroke, 2.8)
			draw_circle(Vector2(110, 296), 3.5, Color("#C7A463"))
			draw_circle(Vector2(210, 296), 3.5, Color("#C7A463"))
			draw_rect(Rect2(132, 318, 56, 36), Color("#5D3724"))
			draw_rect(Rect2(132, 318, 56, 36), stroke, false, 2.2)
		"satchel_hood":
			_fill_poly(PackedVector2Array([Vector2(80, 250), Vector2(160, 276), Vector2(240, 250), Vector2(248, 278), Vector2(160, 304), Vector2(72, 278)]), c.outfit_secondary, stroke, 2.6)
			draw_line(Vector2(104, 244), Vector2(228, 386), c.outfit_accent, 15.0, true)
			draw_rect(Rect2(196, 352, 52, 54), Color("#6F4B2B"))
			draw_rect(Rect2(196, 352, 52, 54), stroke, false, 2.8)
		"beard_cape":
			_fill_poly(PackedVector2Array([Vector2(78, 248), Vector2(160, 278), Vector2(242, 248), Vector2(252, 288), Vector2(160, 316), Vector2(68, 288)]), c.outfit_secondary, stroke, 2.8)
			draw_circle(Vector2(122, 264), 8.0, Color("#B59B62"))
			draw_circle(Vector2(198, 264), 8.0, Color("#B59B62"))
			draw_line(Vector2(130, 264), Vector2(190, 264), Color("#B59B62"), 3.5, true)
		"oversized_cloak":
			_fill_poly(PackedVector2Array([Vector2(74, 234), Vector2(160, 256), Vector2(246, 234), Vector2(274, 415), Vector2(46, 415)]), c.outfit_primary, stroke, 3.0)
			_fill_poly(PackedVector2Array([Vector2(110, 218), Vector2(160, 244), Vector2(210, 218), Vector2(222, 256), Vector2(160, 280), Vector2(98, 256)]), c.outfit_secondary, stroke, 2.6)
		"flashy_cloak":
			_fill_poly(PackedVector2Array([Vector2(132, 232), Vector2(160, 306), Vector2(188, 232)]), Color("#E9E0CE"), stroke, 2.4)
			_fill_poly(PackedVector2Array([Vector2(72, 242), Vector2(120, 236), Vector2(146, 286), Vector2(128, 415), Vector2(52, 415)]), c.outfit_primary, stroke, 2.8)
			_fill_poly(PackedVector2Array([Vector2(248, 242), Vector2(200, 236), Vector2(174, 286), Vector2(192, 415), Vector2(268, 415)]), c.outfit_primary, stroke, 2.8)
			draw_line(Vector2(144, 286), Vector2(128, 415), c.outfit_accent, 4.5, true)
			draw_line(Vector2(176, 286), Vector2(192, 415), c.outfit_accent, 4.5, true)
			_fill_poly(PackedVector2Array([Vector2(160, 248), Vector2(170, 258), Vector2(160, 268), Vector2(150, 258)]), c.outfit_accent, stroke, 2.2)
		"long_coat":
			_fill_poly(PackedVector2Array([Vector2(124, 214), Vector2(132, 256), Vector2(188, 256), Vector2(196, 214), Vector2(178, 228), Vector2(142, 228)]), c.outfit_secondary, stroke, 2.6)
			draw_line(Vector2(160, 310), Vector2(160, 415), stroke, 2.4, true)
			for by in [316.0, 354.0]:
				draw_circle(Vector2(144, by), 4.0, c.outfit_accent)
				draw_circle(Vector2(176, by), 4.0, c.outfit_accent)
		"pierced_shield":
			draw_line(Vector2(116, 244), Vector2(218, 358), Color("#594333"), 10.0, true)
			var shield_pts := PackedVector2Array([
				Vector2(194, 276), Vector2(290, 276), Vector2(286, 358),
				Vector2(242, 416), Vector2(198, 358),
			])
			_fill_poly(shield_pts, Color("#5A4534"), c.outfit_accent, 7.0)
			draw_polyline(PackedVector2Array([Vector2(194, 276), Vector2(290, 276), Vector2(286, 358), Vector2(242, 416), Vector2(198, 358), Vector2(194, 276)]), stroke, 2.6, true)
			draw_circle(Vector2(242, 340), 15.0, c.outfit_accent)
			draw_arc(Vector2(242, 340), 15.0, 0.0, TAU, 18, stroke, 2.5)
			# Pierced notch and embedded bolt
			_fill_poly(PackedVector2Array([Vector2(266, 302), Vector2(287, 298), Vector2(277, 318), Vector2(262, 311)]), Color("#181A1F"), stroke, 2.0)
			draw_line(Vector2(272, 308), Vector2(296, 292), Color("#899299"), 4.5, true)

func _fill_poly(pts: PackedVector2Array, fill_col: Color, stroke_col: Color, width: float) -> void:
	if fill_col.a > 0.0:
		draw_colored_polygon(pts, fill_col)
	var closed := PackedVector2Array(pts)
	closed.append(pts[0])
	draw_polyline(closed, stroke_col, width, true)
