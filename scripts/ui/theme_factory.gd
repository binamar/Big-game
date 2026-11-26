class_name ThemeFactory
extends RefCounted

const BG_OBSIDIAN := Color("#0E131B")
const PANEL_SURFACE := Color(0.067, 0.088, 0.125, 0.92)
const CARD_SURFACE := Color(0.09, 0.118, 0.165, 0.94)
const CARD_HOVER := Color(0.145, 0.185, 0.25, 0.98)
const BRASS := Color("#D99B43")
const BRASS_SOFT := Color(0.85, 0.61, 0.26, 0.42)
const HAIRLINE := Color(1.0, 1.0, 1.0, 0.12)
const TEXT_BONE := Color("#F4EFE6")
const TEXT_MUTED := Color("#A3AEBC")

static func make_panel(
	bg: Color = PANEL_SURFACE,
	border_col: Color = HAIRLINE,
	radius: int = 14,
	border_w: int = 1
) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.border_color = border_col
	sb.set_border_width_all(border_w)
	sb.set_corner_radius_all(radius)
	sb.shadow_color = Color(0.0, 0.0, 0.0, 0.42)
	sb.shadow_size = 16
	sb.shadow_offset = Vector2(0, 6)
	return sb

static func style_button(btn: Button, primary: bool = false, radius: int = 10) -> void:
	var normal := StyleBoxFlat.new()
	var hover := StyleBoxFlat.new()
	var pressed := StyleBoxFlat.new()
	var disabled := StyleBoxFlat.new()

	if primary:
		normal.bg_color = Color("#B87A28")
		normal.border_color = Color("#E8B86B")
		hover.bg_color = Color("#CF8B32")
		hover.border_color = Color("#F5CE87")
		pressed.bg_color = Color("#96611C")
		pressed.border_color = Color("#D99B43")
		disabled.bg_color = Color(0.25, 0.24, 0.22, 0.6)
		disabled.border_color = Color(1, 1, 1, 0.08)
	else:
		normal.bg_color = CARD_SURFACE
		normal.border_color = HAIRLINE
		hover.bg_color = CARD_HOVER
		hover.border_color = BRASS_SOFT
		pressed.bg_color = Color("#0C1017")
		pressed.border_color = BRASS
		disabled.bg_color = Color(0.07, 0.09, 0.12, 0.5)
		disabled.border_color = Color(1, 1, 1, 0.06)

	for sb in [normal, hover, pressed, disabled]:
		sb.set_border_width_all(1)
		sb.set_corner_radius_all(radius)
		sb.content_margin_left = 16
		sb.content_margin_right = 16
		sb.content_margin_top = 10
		sb.content_margin_bottom = 10

	btn.add_theme_stylebox_override("normal", normal)
	btn.add_theme_stylebox_override("hover", hover)
	btn.add_theme_stylebox_override("pressed", pressed)
	btn.add_theme_stylebox_override("disabled", disabled)
	btn.add_theme_stylebox_override("focus", hover)
	btn.add_theme_color_override("font_color", TEXT_BONE)
	btn.add_theme_color_override("font_hover_color", Color.WHITE)
	btn.add_theme_color_override("font_pressed_color", Color("#F9E4BC"))
	btn.add_theme_color_override("font_disabled_color", Color(0.55, 0.58, 0.63, 0.7))

static func style_choice_button(btn: Button) -> void:
	var normal := make_panel(Color(0.075, 0.10, 0.145, 0.95), BRASS_SOFT, 12, 1)
	var hover := make_panel(Color(0.13, 0.175, 0.245, 0.98), BRASS, 12, 2)
	var pressed := make_panel(Color(0.18, 0.14, 0.09, 0.98), Color("#F5CE87"), 12, 2)
	for sb in [normal, hover, pressed]:
		sb.content_margin_left = 20
		sb.content_margin_right = 20
		sb.content_margin_top = 12
		sb.content_margin_bottom = 12
	btn.add_theme_stylebox_override("normal", normal)
	btn.add_theme_stylebox_override("hover", hover)
	btn.add_theme_stylebox_override("pressed", pressed)
	btn.add_theme_stylebox_override("focus", hover)
	btn.add_theme_color_override("font_color", TEXT_BONE)
	btn.add_theme_color_override("font_hover_color", Color("#FFF3D6"))
	btn.add_theme_font_size_override("font_size", 16)

static func style_hotspot_button(btn: Button, inspected: bool) -> void:
	var normal := StyleBoxFlat.new()
	var hover := StyleBoxFlat.new()
	if inspected:
		normal.bg_color = Color(0.09, 0.16, 0.14, 0.88)
		normal.border_color = Color("#58B98D")
		hover.bg_color = Color(0.12, 0.22, 0.19, 0.96)
		hover.border_color = Color("#82DFB4")
	else:
		normal.bg_color = Color(0.11, 0.13, 0.18, 0.92)
		normal.border_color = BRASS
		hover.bg_color = Color(0.19, 0.15, 0.10, 0.98)
		hover.border_color = Color("#F5CE87")

	for sb in [normal, hover]:
		sb.set_border_width_all(2)
		sb.set_corner_radius_all(18)
		sb.content_margin_left = 14
		sb.content_margin_right = 14
		sb.content_margin_top = 8
		sb.content_margin_bottom = 8
		sb.shadow_color = Color(0, 0, 0, 0.45)
		sb.shadow_size = 10

	btn.add_theme_stylebox_override("normal", normal)
	btn.add_theme_stylebox_override("hover", hover)
	btn.add_theme_stylebox_override("pressed", hover)
	btn.add_theme_stylebox_override("focus", hover)
	btn.add_theme_color_override("font_color", Color("#B9F2D4") if inspected else Color("#FFE6B3"))
	btn.add_theme_color_override("font_hover_color", Color.WHITE)
	btn.add_theme_font_size_override("font_size", 14)
