extends Control

@onready var backdrop: BackdropRenderer = $Backdrop
@onready var portrait_main: CharacterPortrait = $StageArea/PortraitMain
@onready var portrait_sibling: CharacterPortrait = $StageArea/PortraitSibling

@onready var char_select: OptionButton = $ControlsPanel/Margin/VBox/CharSelect
@onready var expr_select: OptionButton = $ControlsPanel/Margin/VBox/ExprSelect
@onready var backdrop_select: OptionButton = $ControlsPanel/Margin/VBox/BackdropSelect
@onready var mood_select: OptionButton = $ControlsPanel/Margin/VBox/MoodSelect
@onready var particle_select: OptionButton = $ControlsPanel/Margin/VBox/ParticleSelect
@onready var info_label: Label = $ControlsPanel/Margin/VBox/InfoLabel

@onready var siblings_btn: Button = $ControlsPanel/Margin/VBox/BtnRow/SiblingsBtn
@onready var speak_btn: Button = $ControlsPanel/Margin/VBox/BtnRow/SpeakBtn
@onready var shock_btn: Button = $ControlsPanel/Margin/VBox/BtnRow/ShockBtn
@onready var back_btn: Button = $ControlsPanel/Margin/VBox/BackBtn

var _compare_siblings: bool = false

func _ready() -> void:
	for cid in CharacterRegistry.CHARACTER_IDS:
		char_select.add_item(CharacterRegistry.get_character(cid).display_name)
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

	siblings_btn.pressed.connect(_on_siblings_pressed)
	speak_btn.pressed.connect(_on_speak_pressed)
	shock_btn.pressed.connect(_on_shock_pressed)
	back_btn.pressed.connect(func() -> void: get_tree().change_scene_to_file("res://scenes/main.tscn"))

	portrait_sibling.flip_horizontal = true
	portrait_sibling.visible = false
	_refresh()
	_refresh_scene()

func _refresh() -> void:
	var cid := CharacterRegistry.CHARACTER_IDS[char_select.selected]
	var eid := ExpressionData.PRESET_IDS[expr_select.selected]
	if _compare_siblings:
		portrait_main.apply_character("selva", eid, false)
		portrait_sibling.visible = true
		portrait_sibling.apply_character("rowan", eid, false)
		info_label.text = "Family Check: Selva & Rowan share skin tone (#C98E6B) and eye color (#8E5228)."
	else:
		portrait_sibling.visible = false
		portrait_main.apply_character(cid, eid, false)
		var c := CharacterRegistry.get_character(cid)
		info_label.text = "%s (%s)\nAccessory: %s\n%s" % [c.display_name, c.title, c.accessory_label, c.bio]

func _refresh_scene() -> void:
	var bid := BackdropRegistry.BACKDROP_IDS[backdrop_select.selected]
	var mid := BackdropRegistry.MOOD_IDS[mood_select.selected]
	var pid := BackdropRegistry.PARTICLE_IDS[particle_select.selected]
	backdrop.set_scene(bid, mid, pid)

func _on_siblings_pressed() -> void:
	_compare_siblings = not _compare_siblings
	siblings_btn.text = "Single View" if _compare_siblings else "Compare Selva & Rowan"
	_refresh()

func _on_speak_pressed() -> void:
	portrait_main.is_speaking = not portrait_main.is_speaking
	portrait_sibling.is_speaking = portrait_main.is_speaking
	speak_btn.text = "Stop Mouth" if portrait_main.is_speaking else "Simulate Speaking"

func _on_shock_pressed() -> void:
	AudioManager.play_shock()
	portrait_main.trigger_shock()
	if portrait_sibling.visible:
		portrait_sibling.trigger_shock()
