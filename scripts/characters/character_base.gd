class_name CharacterBase
extends Control

signal character_clicked(character_id: String)

@export var character_id: String = "torrik"
@export var expression_id: String = "neutral"
@export var flip_horizontal: bool = false
@export var active_speaker: bool = true

# Per-character idle animation personality (customized in each character script)
@export var bob_speed: float = 1.45
@export var bob_amplitude: float = 2.4
@export var tilt_speed: float = 0.82
@export var tilt_amplitude_deg: float = 2.4
@export var look_interval_min: float = 2.2
@export var look_interval_max: float = 4.6
@export var look_range_x: float = 3.2
@export var head_follow_x: float = 2.8

var is_speaking: bool = false
var gaze_bias_x: float = 0.0

# Expression state
var _eyebrow_angle: float = 0.0
var _eyebrow_height: float = 0.0
var _eyelid_openness: float = 0.92
var _pupil_x: float = 0.0
var _pupil_y: float = 0.0
var _mouth_curve: float = 0.1
var _mouth_openness: float = 0.0
var _show_tear: bool = false
var _show_sweat: bool = false

# Lifelike idle motion state (head tilt, head movement, left-right glances, blink, speak, shock)
var _blink_open: float = 1.0
var _blink_timer: float = 2.6
var _sway_phase: float = 0.0
var _tilt_phase: float = 0.0
var _speak_phase: float = 0.0
var _shake_time: float = 0.0

var _look_timer: float = 1.6
var _look_target_x: float = 0.0
var _look_target_y: float = 0.0
var _look_current_x: float = 0.0
var _look_current_y: float = 0.0
var _head_turn_x: float = 0.0
var _head_tilt_deg: float = 0.0

var _active_tween: Tween
var _override_rect: TextureRect
var _char_data: CharacterData

func _ready() -> void:
	custom_minimum_size = Vector2(260, 360)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_override_rect = TextureRect.new()
	_override_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	_override_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_override_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_override_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_override_rect.visible = false
	add_child(_override_rect)

	_char_data = _build_character_data()
	character_id = _char_data.id
	_sway_phase = float(character_id.unicode_at(0) % 7) * 0.85 if character_id.length() > 0 else 0.0
	_tilt_phase = _sway_phase * 1.3
	_blink_timer = randf_range(1.4, 3.8)
	_look_timer = randf_range(0.8, 2.4)
	_check_override()
	set_expression(expression_id, true)

func get_character_data() -> CharacterData:
	if _char_data == null:
		_char_data = _build_character_data()
	return _char_data

func _build_character_data() -> CharacterData:
	var c := CharacterData.new()
	c.id = "base"
	c.display_name = "Character"
	c.title = "Cast"
	c.outline_color = Color("#1B1D22")
	return c

func apply_state(p_expr_id: String, p_active: bool, p_flip: bool, immediate: bool = false) -> void:
	flip_horizontal = p_flip
	set_active_speaker(p_active)
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
	var target_mod := Color(1.0, 1.0, 1.0, 1.0) if is_active else Color(0.76, 0.78, 0.83, 0.92)
	modulate = target_mod
	queue_redraw()

func set_gaze_bias(bias_x: float) -> void:
	gaze_bias_x = clampf(bias_x, -1.0, 1.0)

func trigger_shock() -> void:
	_shake_time = 0.36

func _check_override() -> void:
	if _override_rect == null:
		return
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
	_sway_phase += delta * bob_speed
	_tilt_phase += delta * tilt_speed

	if is_speaking:
		_speak_phase += delta * 18.0
	else:
		_speak_phase = 0.0

	# Natural periodic left-to-right eye glance + subtle head turn/tilt follow-through
	_look_timer -= delta
	if _look_timer <= 0.0:
		_look_timer = randf_range(look_interval_min, look_interval_max)
		var roll := randf()
		if roll < 0.34:
			_look_target_x = -look_range_x
			_look_target_y = randf_range(-0.6, 0.4)
		elif roll < 0.68:
			_look_target_x = look_range_x
			_look_target_y = randf_range(-0.6, 0.4)
		else:
			_look_target_x = gaze_bias_x * (look_range_x * 0.55)
			_look_target_y = 0.0

	var ease_step := clampf(delta * 5.2, 0.0, 1.0)
	_look_current_x = lerpf(_look_current_x, _look_target_x, ease_step)
	_look_current_y = lerpf(_look_current_y, _look_target_y, ease_step)

	var desired_head_x := (_look_current_x / maxf(look_range_x, 0.01)) * head_follow_x
	_head_turn_x = lerpf(_head_turn_x, desired_head_x, clampf(delta * 3.4, 0.0, 1.0))

	var base_tilt := sin(_tilt_phase) * tilt_amplitude_deg
	var glance_tilt := (_look_current_x / maxf(look_range_x, 0.01)) * (tilt_amplitude_deg * 0.48)
	var speak_nod := sin(_sway_phase * 2.1) * 0.9 if is_speaking else 0.0
	_head_tilt_deg = lerpf(_head_tilt_deg, base_tilt + glance_tilt + speak_nod, clampf(delta * 4.5, 0.0, 1.0))

	_blink_timer -= delta
	if _blink_timer <= 0.0:
		_blink_timer = randf_range(2.4, 5.2)
		var bt := create_tween()
		bt.tween_property(self, "_blink_open", 0.06, 0.065)
		bt.tween_property(self, "_blink_open", 1.0, 0.085)

	if _shake_time > 0.0:
		_shake_time = maxf(0.0, _shake_time - delta)

	_on_custom_idle_behavior(delta)
	queue_redraw()

func _on_custom_idle_behavior(_delta: float) -> void:
	pass

func _draw() -> void:
	if _override_rect and _override_rect.visible:
		return

	var c := get_character_data()
	var base_scale := minf(size.x / 320.0, size.y / 420.0)
	if base_scale <= 0.05:
		base_scale = 1.0

	var bob_y := sin(_sway_phase) * bob_amplitude
	var speak_lift := -absf(sin(_sway_phase * 2.4)) * 1.4 if is_speaking else 0.0
	var shake_x := 0.0
	if _shake_time > 0.0:
		var decay := _shake_time / 0.36
		shake_x = sin(_shake_time * 95.0) * 10.0 * decay

	var center_x := size.x * 0.5 + shake_x
	var bottom_y := size.y + bob_y + speak_lift
	var x_dir := -1.0 if flip_horizontal else 1.0
	var origin := Vector2(center_x - 160.0 * base_scale * x_dir, bottom_y - 420.0 * base_scale)
	var stroke := c.outline_color

	# 1. Body & Back Layer Transform
	draw_set_transform(origin, 0.0, Vector2(base_scale * x_dir, base_scale))
	_draw_character_back(c, stroke)
	_draw_character_body(c, stroke)

	# 2. Articulated Head Pivot Transform (subtle movement, head tilt, and left-right turn)
	var pivot_local := Vector2(160.0 + _head_turn_x, 200.0 + sin(_sway_phase + 0.5) * 1.1)
	var head_world := origin + Vector2(pivot_local.x * base_scale * x_dir, pivot_local.y * base_scale)
	var tilt_rad := deg_to_rad(_head_tilt_deg * x_dir)
	draw_set_transform(head_world, tilt_rad, Vector2(base_scale * x_dir, base_scale))

	# Draw head anchored relative to pivot (160, 200) -> subtract (160, 200)
	_draw_head_unit(c, stroke, Vector2(-160.0, -200.0))

	# 3. Foreground Accessories anchored on torso
	draw_set_transform(origin, 0.0, Vector2(base_scale * x_dir, base_scale))
	_draw_character_accessory(c, stroke)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

func _draw_character_back(_c: CharacterData, _stroke: Color) -> void:
	pass

func _draw_character_body(c: CharacterData, stroke: Color) -> void:
	fill_poly(PackedVector2Array([
		Vector2(84, 252), Vector2(120, 232), Vector2(200, 232),
		Vector2(236, 252), Vector2(256, 418), Vector2(64, 418),
	]), c.outfit_primary, stroke, 3.0)
	fill_poly(PackedVector2Array([
		Vector2(132, 232), Vector2(160, 278), Vector2(188, 232),
		Vector2(182, 222), Vector2(138, 222),
	]), c.outfit_secondary, stroke, 2.5)
	fill_poly(PackedVector2Array([
		Vector2(142, 188), Vector2(142, 236), Vector2(160, 243),
		Vector2(178, 236), Vector2(178, 188),
	]), c.skin_tone, stroke, 2.6)
	draw_colored_polygon(PackedVector2Array([
		Vector2(144, 190), Vector2(160, 208), Vector2(176, 190),
		Vector2(176, 204), Vector2(160, 216), Vector2(144, 204),
	]), c.skin_shadow)

func _draw_head_unit(c: CharacterData, stroke: Color, off: Vector2) -> void:
	# Ears
	draw_circle(Vector2(111, 150) + off, 9.5, c.skin_tone)
	draw_arc(Vector2(111, 150) + off, 9.5, PI * 0.5, PI * 1.5, 12, stroke, 2.4)
	draw_circle(Vector2(209, 150) + off, 9.5, c.skin_tone)
	draw_arc(Vector2(209, 150) + off, 9.5, -PI * 0.5, PI * 0.5, 12, stroke, 2.4)

	# Face silhouette
	var head_pts := PackedVector2Array([
		Vector2(112, 120) + off,
		Vector2(124, 86) + off,
		Vector2(160, 78) + off,
		Vector2(196, 86) + off,
		Vector2(208, 120) + off,
		Vector2(204, 162) + off,
		Vector2(190, 190) + off,
		Vector2(160, 203) + off,
		Vector2(130, 190) + off,
		Vector2(116, 162) + off,
	])
	fill_poly(head_pts, c.skin_tone, stroke, 2.8)

	_draw_face_details(c, stroke, off)

	# Eyes with combined expression + natural left-right glance
	var open_ratio := clampf(_eyelid_openness * _blink_open, 0.05, 1.0)
	_draw_eye(Vector2(136, 146) + off, open_ratio, c, stroke)
	_draw_eye(Vector2(184, 146) + off, open_ratio, c, stroke)

	# Eyebrows
	_draw_eyebrow(Vector2(136, 130 + _eyebrow_height) + off, -_eyebrow_angle, stroke)
	_draw_eyebrow(Vector2(184, 130 + _eyebrow_height) + off, _eyebrow_angle, stroke)

	# Nose
	draw_polyline(PackedVector2Array([
		Vector2(160, 151) + off,
		Vector2(157, 164) + off,
		Vector2(163, 165) + off,
	]), Color(stroke.r, stroke.g, stroke.b, 0.8), 2.0, true)

	# Mouth
	var speak_delta := absf(sin(_speak_phase)) * 0.48 if is_speaking else 0.0
	var m_open := minf(1.0, _mouth_openness + speak_delta)
	var curve_y := _mouth_curve * 7.0
	if m_open > 0.12:
		var mouth_poly := PackedVector2Array([
			Vector2(147, 177) + off,
			Vector2(160, 177 + curve_y * 0.5) + off,
			Vector2(173, 177) + off,
			Vector2(160, 179 + m_open * 13.0) + off,
		])
		fill_poly(mouth_poly, Color("#6D3439"), stroke, 2.2)
	else:
		draw_polyline(PackedVector2Array([
			Vector2(147, 178) + off,
			Vector2(160, 178 + curve_y) + off,
			Vector2(173, 178) + off,
		]), stroke, 2.4, true)

	if _show_tear:
		fill_poly(PackedVector2Array([
			Vector2(126, 155) + off, Vector2(122, 164) + off,
			Vector2(126, 168) + off, Vector2(130, 164) + off,
		]), Color("#BFE3F7"), stroke, 1.5)
	if _show_sweat:
		fill_poly(PackedVector2Array([
			Vector2(201, 124) + off, Vector2(196, 135) + off,
			Vector2(201, 140) + off, Vector2(206, 135) + off,
		]), Color("#CFEAF9"), stroke, 1.6)

	_draw_character_front_hair(c, stroke, off)

func _draw_face_details(_c: CharacterData, _stroke: Color, _off: Vector2) -> void:
	pass

func _draw_character_front_hair(_c: CharacterData, _stroke: Color, _off: Vector2) -> void:
	pass

func _draw_character_accessory(_c: CharacterData, _stroke: Color) -> void:
	pass

func _draw_eye(pos: Vector2, open_ratio: float, c: CharacterData, stroke: Color) -> void:
	var ry := maxf(1.6, 7.2 * open_ratio)
	var pts := PackedVector2Array()
	for i in range(16):
		var a := float(i) / 16.0 * TAU
		pts.append(pos + Vector2(cos(a) * 13.0, sin(a) * ry))
	draw_colored_polygon(pts, Color("#F8F9FA"))

	if open_ratio > 0.25:
		var look_off := Vector2(
			clampf(_pupil_x + _look_current_x, -4.2, 4.2),
			clampf(_pupil_y + _look_current_y, -2.2, 2.2)
		)
		var iris_pos := pos + look_off
		var iris_r := minf(7.2, ry * 0.95)
		draw_circle(iris_pos, iris_r, c.eye_color)
		draw_arc(iris_pos, iris_r * 0.75, 0.2, PI - 0.2, 12, c.eye_secondary, 2.6)
		draw_circle(iris_pos, iris_r * 0.42, Color("#17191E"))
		draw_circle(iris_pos + Vector2(-2.4, -2.5), 2.1, Color.WHITE)
		draw_circle(iris_pos + Vector2(2.4, 2.2), 1.1, Color(1, 1, 1, 0.85))

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

func fill_poly(pts: PackedVector2Array, fill_col: Color, stroke_col: Color, width: float) -> void:
	if fill_col.a > 0.0:
		draw_colored_polygon(pts, fill_col)
	var closed := PackedVector2Array(pts)
	closed.append(pts[0])
	draw_polyline(closed, stroke_col, width, true)
