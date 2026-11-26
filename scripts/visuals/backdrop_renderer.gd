class_name BackdropRenderer
extends Control

@export var backdrop_id: String = "small_guild_hall"
@export var mood_id: String = "warm"
@export var particles_type: String = "dust"

var _particles: Array[Dictionary] = []
var _drift_time: float = 0.0
var _pointer_offset: Vector2 = Vector2.ZERO
var _override_rect: TextureRect

func _ready() -> void:
	_override_rect = TextureRect.new()
	_override_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	_override_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_override_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_override_rect.visible = false
	add_child(_override_rect)
	set_scene(backdrop_id, mood_id, particles_type)

func set_scene(p_backdrop_id: String, p_mood_id: String = "", p_particles: String = "") -> void:
	backdrop_id = p_backdrop_id
	var meta := BackdropRegistry.get_backdrop_meta(p_backdrop_id)
	mood_id = p_mood_id if p_mood_id != "" else str(meta["default_mood"])
	particles_type = p_particles if p_particles != "" else str(meta["default_particles"])
	_check_override()
	_rebuild_particles()
	queue_redraw()

func _check_override() -> void:
	var path := "res://assets/backdrops/%s.png" % backdrop_id
	if ResourceLoader.exists(path):
		var tex := load(path) as Texture2D
		if tex:
			_override_rect.texture = tex
			_override_rect.visible = true
			return
	_override_rect.visible = false
	_override_rect.texture = null

func _rebuild_particles() -> void:
	_particles.clear()
	if particles_type == "none":
		return
	var count := 110 if particles_type == "rain" else (42 if particles_type == "embers" else 50)
	var w := maxf(1280.0, size.x)
	var h := maxf(720.0, size.y)
	for i in range(count):
		if particles_type == "rain":
			_particles.append({
				"x": randf() * w,
				"y": randf() * h,
				"vx": randf_range(-160.0, -90.0),
				"vy": randf_range(650.0, 980.0),
				"size": randf_range(14.0, 26.0),
				"alpha": randf_range(0.25, 0.55),
			})
		elif particles_type == "embers":
			_particles.append({
				"x": randf() * w,
				"y": randf() * h,
				"vx": randf_range(-25.0, 25.0),
				"vy": randf_range(-85.0, -40.0),
				"size": randf_range(1.6, 3.8),
				"alpha": randf_range(0.4, 0.9),
			})
		else:
			_particles.append({
				"x": randf() * w,
				"y": randf() * h,
				"vx": randf_range(14.0, 32.0),
				"vy": randf_range(-12.0, 12.0),
				"size": randf_range(1.4, 3.0),
				"alpha": randf_range(0.18, 0.45),
			})

func _input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and size.x > 0.0 and size.y > 0.0:
		var target := Vector2(
			(event.position.x / size.x - 0.5) * 2.0,
			(event.position.y / size.y - 0.5) * 2.0
		)
		_pointer_offset = _pointer_offset.lerp(target, 0.15)

func _process(delta: float) -> void:
	if _override_rect and _override_rect.visible:
		return
	_drift_time += delta
	var w := maxf(1280.0, size.x)
	var h := maxf(720.0, size.y)
	for p in _particles:
		p["x"] = float(p["x"]) + float(p["vx"]) * delta
		p["y"] = float(p["y"]) + float(p["vy"]) * delta
		if particles_type == "rain":
			if float(p["y"]) > h:
				p["y"] = -20.0
				p["x"] = randf() * (w + 140.0)
		elif particles_type == "embers":
			if float(p["y"]) < -10.0:
				p["y"] = h + 10.0
				p["x"] = randf() * w
		else:
			if float(p["x"]) > w + 10.0:
				p["x"] = -10.0
			if float(p["y"]) > h + 10.0:
				p["y"] = -10.0
			elif float(p["y"]) < -10.0:
				p["y"] = h + 10.0
	queue_redraw()

func _draw() -> void:
	if _override_rect and _override_rect.visible:
		return

	var w := size.x
	var h := size.y
	if w <= 1.0 or h <= 1.0:
		return

	var pal := BackdropRegistry.get_mood_palette(mood_id)
	var sky_top: Color = pal["sky_top"]
	var sky_bottom: Color = pal["sky_bottom"]
	var far_c: Color = pal["far_layer"]
	var mid_c: Color = pal["mid_layer"]
	var near_c: Color = pal["near_layer"]
	var light_c: Color = pal["light_color"]

	# Sky / wall gradient bands
	var bands := 18
	for i in range(bands):
		var t0 := float(i) / float(bands)
		var t1 := float(i + 1) / float(bands)
		draw_rect(Rect2(0.0, h * t0, w, h * (t1 - t0) + 1.5), sky_top.lerp(sky_bottom, t0))

	var px := _pointer_offset.x * 0.7 + sin(_drift_time * 0.35) * 0.35
	var py := _pointer_offset.y * 0.5 + cos(_drift_time * 0.28) * 0.25
	var far_off := Vector2(px * 8.0, py * 4.0)
	var mid_off := Vector2(px * 18.0, py * 8.0)
	var near_off := Vector2(px * 30.0, py * 12.0)

	match backdrop_id:
		"small_guild_hall":
			draw_rect(Rect2(0, h * 0.15 + far_off.y, w, h * 0.85), far_c)
			for i in range(6):
				draw_rect(Rect2(i * (w / 5.0) - 18.0 + mid_off.x, 0, 26, h), near_c)
			draw_rect(Rect2(w * 0.14 + mid_off.x, h * 0.28 + mid_off.y, 210, 145), mid_c)
			draw_rect(Rect2(w * 0.16 + mid_off.x, h * 0.31 + mid_off.y, 46, 54), Color("#D8CEB8"))
			draw_rect(Rect2(w * 0.22 + mid_off.x, h * 0.33 + mid_off.y, 52, 46), Color("#D8CEB8"))
			draw_rect(Rect2(w * 0.66 + mid_off.x, h * 0.35 + mid_off.y, 220, h * 0.55), mid_c)
			draw_rect(Rect2(w * 0.70 + near_off.x, h * 0.52 + near_off.y, 130, h * 0.35), near_c)
			draw_circle(Vector2(w * 0.75 + near_off.x, h * 0.76 + near_off.y), 38.0, Color(light_c.r, light_c.g, light_c.b, 0.75))
			draw_circle(Vector2(w * 0.75 + near_off.x, h * 0.73 + near_off.y), 115.0, Color(light_c.r, light_c.g, light_c.b, 0.18))
			draw_rect(Rect2(0, h * 0.8 + near_off.y, w, h * 0.25), near_c)
		"blacksmith_workshop":
			draw_rect(Rect2(0, 0, w, h), far_c)
			draw_colored_polygon(PackedVector2Array([
				Vector2(w * 0.15 + mid_off.x, 0),
				Vector2(w * 0.37 + mid_off.x, 0),
				Vector2(w * 0.42 + mid_off.x, h * 0.46 + mid_off.y),
				Vector2(w * 0.10 + mid_off.x, h * 0.46 + mid_off.y),
			]), mid_c)
			draw_rect(Rect2(w * 0.08 + mid_off.x, h * 0.56 + mid_off.y, w * 0.36, h * 0.36), mid_c)
			draw_circle(Vector2(w * 0.26 + mid_off.x, h * 0.56 + mid_off.y), 68.0, Color(light_c.r, light_c.g, light_c.b, 0.78))
			draw_circle(Vector2(w * 0.26 + mid_off.x, h * 0.54 + mid_off.y), 150.0, Color(light_c.r, light_c.g, light_c.b, 0.20))
			draw_rect(Rect2(w * 0.62 + mid_off.x, h * 0.24 + mid_off.y, 260, 14), mid_c)
			for i in range(5):
				draw_rect(Rect2(w * 0.64 + i * 48.0 + mid_off.x, h * 0.26 + mid_off.y, 10, 72), mid_c)
			draw_rect(Rect2(0, h * 0.82 + near_off.y, w, h * 0.22), near_c)
			draw_rect(Rect2(w * 0.68 + near_off.x, h * 0.68 + near_off.y, 94, 110), near_c)
			draw_colored_polygon(PackedVector2Array([
				Vector2(w * 0.62 + near_off.x, h * 0.60 + near_off.y),
				Vector2(w * 0.80 + near_off.x, h * 0.60 + near_off.y),
				Vector2(w * 0.77 + near_off.x, h * 0.68 + near_off.y),
				Vector2(w * 0.66 + near_off.x, h * 0.68 + near_off.y),
			]), near_c)
		"city_square":
			draw_rect(Rect2(w * 0.44 + far_off.x, h * 0.12 + far_off.y, 92, h * 0.65), far_c)
			draw_colored_polygon(PackedVector2Array([
				Vector2(w * 0.43 + far_off.x, h * 0.12 + far_off.y),
				Vector2(w * 0.476 + far_off.x, h * 0.02 + far_off.y),
				Vector2(w * 0.522 + far_off.x, h * 0.12 + far_off.y),
			]), far_c)
			for b in [[0.0, 0.34, 0.20, 0.44], [0.19, 0.28, 0.18, 0.50], [0.62, 0.30, 0.18, 0.48], [0.79, 0.36, 0.22, 0.42]]:
				draw_rect(Rect2(w * b[0] + mid_off.x, h * b[1] + mid_off.y, w * b[2], h * b[3]), mid_c)
			draw_rect(Rect2(w * 0.24 + mid_off.x, h * 0.41 + mid_off.y, 18, 26), Color(light_c.r, light_c.g, light_c.b, 0.65))
			draw_rect(Rect2(w * 0.67 + mid_off.x, h * 0.44 + mid_off.y, 18, 26), Color(light_c.r, light_c.g, light_c.b, 0.65))
			draw_rect(Rect2(0, h * 0.76 + near_off.y, w, h * 0.30), near_c)
			draw_rect(Rect2(w * 0.42 + near_off.x, h * 0.67 + near_off.y, 160, 74), near_c)
		"great_guild_headquarters":
			draw_rect(Rect2(0, 0, w, h), far_c)
			for wx in [0.16, 0.43, 0.70]:
				draw_rect(Rect2(w * wx + far_off.x, h * 0.14 + far_off.y, 120, h * 0.48), sky_bottom)
			for i in range(4):
				draw_rect(Rect2(w * (0.08 + i * 0.27) + mid_off.x, 0, 56, h * 0.85), mid_c)
			draw_rect(Rect2(0, h * 0.78 + near_off.y, w, h * 0.25), near_c)
			draw_rect(Rect2(w * 0.1 + near_off.x, h * 0.73 + near_off.y, w * 0.8, 36), near_c)
		"ruined_village":
			draw_colored_polygon(PackedVector2Array([
				Vector2(-40, h), Vector2(-40, h * 0.56 + far_off.y),
				Vector2(w * 0.35, h * 0.45 + far_off.y), Vector2(w * 0.72, h * 0.58 + far_off.y),
				Vector2(w + 40, h * 0.5 + far_off.y), Vector2(w + 40, h),
			]), far_c)
			draw_rect(Rect2(w * 0.12 + mid_off.x, h * 0.46 + mid_off.y, 210, h * 0.35), mid_c)
			draw_rect(Rect2(w * 0.62 + mid_off.x, h * 0.50 + mid_off.y, 240, h * 0.32), mid_c)
			draw_polyline(PackedVector2Array([Vector2(w * 0.11 + mid_off.x, h * 0.46 + mid_off.y), Vector2(w * 0.22 + mid_off.x, h * 0.32 + mid_off.y), Vector2(w * 0.30 + mid_off.x, h * 0.46 + mid_off.y)]), near_c, 10.0)
			draw_rect(Rect2(0, h * 0.78 + near_off.y, w, h * 0.25), near_c)
		"army_camp_dusk":
			draw_circle(Vector2(w * 0.5 + far_off.x, h * 0.58 + far_off.y), 115.0, Color(light_c.r, light_c.g, light_c.b, 0.30))
			draw_colored_polygon(PackedVector2Array([Vector2(-40, h), Vector2(-40, h * 0.60 + far_off.y), Vector2(w * 0.38, h * 0.52 + far_off.y), Vector2(w + 40, h * 0.58 + far_off.y), Vector2(w + 40, h)]), far_c)
			for tx in [0.08, 0.28, 0.62, 0.80]:
				draw_colored_polygon(PackedVector2Array([Vector2(w * tx + mid_off.x, h * 0.75 + mid_off.y), Vector2(w * (tx + 0.08) + mid_off.x, h * 0.54 + mid_off.y), Vector2(w * (tx + 0.16) + mid_off.x, h * 0.75 + mid_off.y)]), mid_c)
			draw_circle(Vector2(w * 0.48 + near_off.x, h * 0.75 + near_off.y), 18.0, Color(light_c.r, light_c.g, light_c.b, 0.85))
			draw_circle(Vector2(w * 0.48 + near_off.x, h * 0.73 + near_off.y), 80.0, Color(light_c.r, light_c.g, light_c.b, 0.22))
			draw_rect(Rect2(0, h * 0.76 + near_off.y, w, h * 0.3), near_c)
		"mountain_road":
			draw_colored_polygon(PackedVector2Array([Vector2(-40, h), Vector2(w * 0.18 + far_off.x, h * 0.28 + far_off.y), Vector2(w * 0.42 + far_off.x, h * 0.48 + far_off.y), Vector2(w * 0.68 + far_off.x, h * 0.22 + far_off.y), Vector2(w + 40, h * 0.52 + far_off.y), Vector2(w + 40, h)]), far_c)
			draw_colored_polygon(PackedVector2Array([Vector2(-40, h), Vector2(-40, h * 0.62 + mid_off.y), Vector2(w * 0.52 + mid_off.x, h * 0.50 + mid_off.y), Vector2(w + 40, h * 0.68 + mid_off.y), Vector2(w + 40, h)]), mid_c)
			draw_rect(Rect2(0, h * 0.72 + near_off.y, w, h * 0.30), near_c)
			for i in range(6):
				draw_rect(Rect2(w * (0.1 + i * 0.16) + near_off.x, h * 0.67 + near_off.y, 16, 46), near_c)
		"night_alley":
			draw_colored_polygon(PackedVector2Array([Vector2(0, 0), Vector2(w * 0.38 + mid_off.x, h * 0.2 + mid_off.y), Vector2(w * 0.38 + mid_off.x, h * 0.75 + mid_off.y), Vector2(0, h)]), mid_c)
			draw_colored_polygon(PackedVector2Array([Vector2(w, 0), Vector2(w * 0.64 + mid_off.x, h * 0.2 + mid_off.y), Vector2(w * 0.64 + mid_off.x, h * 0.75 + mid_off.y), Vector2(w, h)]), mid_c)
			draw_rect(Rect2(w * 0.34 + near_off.x, h * 0.30 + near_off.y, 54, 10), near_c)
			draw_rect(Rect2(w * 0.375 + near_off.x, h * 0.32 + near_off.y, 18, 26), Color(light_c.r, light_c.g, light_c.b, 0.90))
			draw_circle(Vector2(w * 0.385 + near_off.x, h * 0.34 + near_off.y), 105.0, Color(light_c.r, light_c.g, light_c.b, 0.20))
			draw_rect(Rect2(0, h * 0.75 + near_off.y, w, h * 0.30), near_c)
		"archive_room":
			draw_rect(Rect2(0, 0, w, h), far_c)
			draw_rect(Rect2(w * 0.44 + far_off.x, h * 0.1 + far_off.y, 130, h * 0.45), sky_bottom)
			for b in range(4):
				draw_rect(Rect2(w * (0.455 + b * 0.028) + far_off.x, h * 0.1 + far_off.y, 6, h * 0.45), mid_c)
			draw_rect(Rect2(0, 0, w * 0.36 + mid_off.x, h * 0.82), mid_c)
			draw_rect(Rect2(w * 0.64 + mid_off.x, 0, w * 0.38, h * 0.82), mid_c)
			draw_rect(Rect2(0, h * 0.78 + near_off.y, w, h * 0.25), near_c)
			draw_rect(Rect2(w * 0.32 + near_off.x, h * 0.68 + near_off.y, 420, 90), near_c)
			draw_circle(Vector2(w * 0.56 + near_off.x, h * 0.62 + near_off.y), 14.0, Color(light_c.r, light_c.g, light_c.b, 0.85))
			draw_circle(Vector2(w * 0.56 + near_off.x, h * 0.62 + near_off.y), 100.0, Color(light_c.r, light_c.g, light_c.b, 0.20))
		"rainy_street":
			draw_rect(Rect2(w * 0.05 + far_off.x, h * 0.32 + far_off.y, 280, h * 0.5), far_c)
			draw_rect(Rect2(w * 0.58 + far_off.x, h * 0.28 + far_off.y, 340, h * 0.54), far_c)
			draw_rect(Rect2(w * 0.18 + mid_off.x, h * 0.38 + mid_off.y, 320, h * 0.44), mid_c)
			draw_rect(Rect2(w * 0.23 + mid_off.x, h * 0.56 + mid_off.y, 44, 52), Color(light_c.r, light_c.g, light_c.b, 0.65))
			draw_rect(Rect2(0, h * 0.77 + near_off.y, w, h * 0.28), near_c)
			draw_rect(Rect2(w * 0.23 + near_off.x, h * 0.81 + near_off.y, 44, 64), Color(light_c.r, light_c.g, light_c.b, 0.20))
		"dry_farmland":
			draw_colored_polygon(PackedVector2Array([Vector2(-40, h), Vector2(-40, h * 0.58 + far_off.y), Vector2(w * 0.5, h * 0.52 + far_off.y), Vector2(w + 40, h * 0.60 + far_off.y), Vector2(w + 40, h)]), far_c)
			draw_colored_polygon(PackedVector2Array([Vector2(w * 0.70 + mid_off.x, h * 0.62 + mid_off.y), Vector2(w * 0.725 + mid_off.x, h * 0.30 + mid_off.y), Vector2(w * 0.765 + mid_off.x, h * 0.30 + mid_off.y), Vector2(w * 0.79 + mid_off.x, h * 0.62 + mid_off.y)]), mid_c)
			draw_line(Vector2(w * 0.67 + mid_off.x, h * 0.18 + mid_off.y), Vector2(w * 0.82 + mid_off.x, h * 0.44 + mid_off.y), mid_c, 7.0)
			draw_line(Vector2(w * 0.82 + mid_off.x, h * 0.18 + mid_off.y), Vector2(w * 0.67 + mid_off.x, h * 0.44 + mid_off.y), mid_c, 7.0)
			draw_rect(Rect2(0, h * 0.68 + near_off.y, w, h * 0.36), near_c)
			for p in range(5):
				draw_rect(Rect2(w * (0.08 + p * 0.13) + near_off.x, h * 0.63 + near_off.y, 10, 54), near_c)
		"council_chamber":
			draw_rect(Rect2(0, 0, w, h), far_c)
			for i in range(3):
				draw_arc(Vector2(w * (0.2 + i * 0.3) + far_off.x, h * 0.45 + far_off.y), 170.0, PI, TAU, 24, mid_c, 22.0)
			draw_rect(Rect2(0, h * 0.56 + mid_off.y, w, h * 0.25), mid_c)
			for sx in [0.2, 0.5, 0.8]:
				draw_circle(Vector2(w * sx + mid_off.x, h * 0.35 + mid_off.y), 12.0, Color(light_c.r, light_c.g, light_c.b, 0.85))
				draw_circle(Vector2(w * sx + mid_off.x, h * 0.35 + mid_off.y), 85.0, Color(light_c.r, light_c.g, light_c.b, 0.18))
			draw_rect(Rect2(0, h * 0.74 + near_off.y, w, h * 0.30), near_c)
			draw_rect(Rect2(w * 0.36 + near_off.x, h * 0.67 + near_off.y, w * 0.28, 70), near_c)

	# Mood tint
	draw_rect(Rect2(0, 0, w, h), pal["tint"])

	# Natural particles (rain, dust, embers)
	for p in _particles:
		var pos := Vector2(float(p["x"]), float(p["y"]))
		var alpha := float(p["alpha"])
		if particles_type == "rain":
			draw_line(pos, pos + Vector2(-4.0, float(p["size"])), Color(0.83, 0.90, 0.95, alpha), 1.4)
		elif particles_type == "embers":
			draw_circle(pos, float(p["size"]), Color(0.95, 0.58, 0.24, alpha))
		else:
			draw_circle(pos, float(p["size"]), Color(0.91, 0.88, 0.80, alpha))
