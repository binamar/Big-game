extends Control

@onready var backdrop: BackdropRenderer = $Backdrop
@onready var stage_area: HBoxContainer = $StageArea
@onready var controls_panel: PanelContainer = $ControlsPanel

@onready var char_select: OptionButton = $ControlsPanel/Margin/VBox/CharSelect
@onready var expr_select: OptionButton = $ControlsPanel/Margin/VBox/ExprSelect
@onready var backdrop_select: OptionButton = $ControlsPanel/Margin/VBox/BackdropSelect
@onready var mood_select: OptionButton = $ControlsPanel/Margin/VBox/MoodSelect
@onready var particle_select: OptionButton = $ControlsPanel/Margin/VBox/ParticleSelect
@onready var info_label: Label = $ControlsPanel/Margin/VBox/InfoLabel

@onready var trio_btn: Button = $ControlsPanel/Margin/VBox/BtnRow/TrioBtn
@onready var speak_btn: Button = $ControlsPanel/Margin/VBox/BtnRow/SpeakBtn
@onready var shock_btn: Button = $ControlsPanel/Margin/VBox/BtnRow/ShockBtn
@onready var back_btn: Button = $ControlsPanel/Margin/VBox/BackBtn

var _characters: Dictionary = {}
var _show_trio: bool = false

func _ready() -> void:
	controls_panel.add_theme_stylebox_override("panel", ThemeFactory.make_panel(Color(0.055, 0.075, 0.11, 0.92), ThemeFactory.HAIRLINE, 16, 1))
	for btn in [trio_btn, speak_btn, shock_btn, back_btn]:
		ThemeFactory.style_button(btn, btn == back_btn, 8)

	for cid in CharacterCatalog.CHARACTER_IDS:
		var ch := CharacterCatalog.spawn_character(cid)
		ch.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		ch.size_flags_vertical = Control.SIZE_EXPAND_FILL
		ch.custom_minimum_size = Vector2(220, 380)
		ch.visible = false
		stage_area.add_child(ch)
		_characters[cid] = ch
		char_select.add_item(str(CharacterCatalog.get_meta(cid)["name"]))

	for eid in ExpressionData.PRESET_IDS:
		expr_select.add_item(eid.capitalize())
	for bid in BackdropRegistry.BACKDROP_IDS:
		backdrop_select.add_item(str(BackdropRegistry.get_backdrop_meta(bid)["name"]))
	for mid in BackdropRegistry.MOOD_IDS:
		mood_select.add_item(mid.capitalize())
	for pid in BackdropRegistry.PARTICLE_IDS:
		particle_select.add_item(pid.capitalize())

	char_select.item_selected.connect(func(_idx: int) -> void: _refresh())
	expr_select.item_selected.connect(func(_idx: int) -> void: _refresh())
	backdrop_select.item_selected.connect(func(_idx: int) -> void: _refresh_scene())
	mood_select.item_selected.connect(func(_idx: int) -> void: _refresh_scene())
	particle_select.item_selected.connect(func(_idx: int) -> void: _refresh_scene())

	trio_btn.pressed.connect(_on_trio_pressed)
	speak_btn.pressed.connect(_on_speak_pressed)
	shock_btn.pressed.connect(_on_shock_pressed)
	back_btn.pressed.connect(func() -> void: get_tree().change_scene_to_file("res://scenes/main.tscn"))

	_refresh()
	_refresh_scene()

func _refresh() -> void:
	var cid := CharacterCatalog.CHARACTER_IDS[char_select.selected]
	var eid := ExpressionData.PRESET_IDS[expr_select.selected]

	for k in _characters.keys():
		var ch: CharacterBase = _characters[k]
		if _show_trio:
			ch.visible = true
			ch.apply_state(eid, true, k == "orsen", false)
			ch.set_gaze_bias(0.5 if k == "torrik" else (-0.5 if k == "orsen" else 0.0))
		else:
			ch.visible = (k == cid)
			if ch.visible:
				ch.apply_state(eid, true, false, false)
				ch.set_gaze_bias(0.0)

	if _show_trio:
		info_label.text = "Full Cast Trio: Torrik, Myra, and Orsen — each running an independent character scene with subtle head tilt, breathing, blinking, and left-right glances."
	else:
		var meta := CharacterCatalog.get_meta(cid)
		info_label.text = "%s (%s)\nAccessory: %s\n%s" % [meta["name"], meta["title"], meta["accessory"], meta["bio"]]

func _refresh_scene() -> void:
	var bid := BackdropRegistry.BACKDROP_IDS[backdrop_select.selected]
	var mid := BackdropRegistry.MOOD_IDS[mood_select.selected]
	var pid := BackdropRegistry.PARTICLE_IDS[particle_select.selected]
	backdrop.set_scene(bid, mid, pid)

func _on_trio_pressed() -> void:
	_show_trio = not _show_trio
	trio_btn.text = "Single Character View" if _show_trio else "View All 3 Together"
	_refresh()

func _on_speak_pressed() -> void:
	var next_speaking := false
	for ch in _characters.values():
		if (ch as CharacterBase).visible:
			next_speaking = not (ch as CharacterBase).is_speaking
			break
	for ch in _characters.values():
		(ch as CharacterBase).is_speaking = next_speaking
	speak_btn.text = "Stop Speaking" if next_speaking else "Simulate Speaking"

func _on_shock_pressed() -> void:
	AudioManager.play_shock()
	for ch in _characters.values():
		var c := ch as CharacterBase
		if c.visible:
			c.trigger_shock()
