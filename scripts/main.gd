extends Control

@onready var backdrop: BackdropRenderer = $Backdrop
@onready var trio_row: HBoxContainer = $RightStage/TrioRow
@onready var continue_btn: Button = $LeftPanel/Margin/VBox/ActionRow/ContinueBtn
@onready var new_game_btn: Button = $LeftPanel/Margin/VBox/ActionRow/NewGameBtn
@onready var studio_btn: Button = $LeftPanel/Margin/VBox/ActionRow/StudioBtn
@onready var chapter_list: VBoxContainer = $LeftPanel/Margin/VBox/ChapterList
@onready var left_panel: PanelContainer = $LeftPanel

var _torrik: CharacterBase
var _myra: CharacterBase
var _orsen: CharacterBase

func _ready() -> void:
	backdrop.set_scene("small_guild_hall", "warm", "dust")
	left_panel.add_theme_stylebox_override("panel", ThemeFactory.make_panel(Color(0.055, 0.075, 0.11, 0.90), ThemeFactory.HAIRLINE, 18, 1))
	ThemeFactory.style_button(continue_btn, true, 10)
	ThemeFactory.style_button(new_game_btn, not GameState.has_save(), 10)
	ThemeFactory.style_button(studio_btn, false, 10)

	_mount_trio()

	continue_btn.visible = GameState.has_save()
	continue_btn.pressed.connect(_on_continue_pressed)
	new_game_btn.pressed.connect(_on_new_game_pressed)
	studio_btn.pressed.connect(_on_studio_pressed)

	_populate_chapters()

	# Smooth fade-in on startup
	modulate.a = 0.0
	var tw := create_tween().set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	tw.tween_property(self, "modulate:a", 1.0, 0.35)

func _mount_trio() -> void:
	for child in trio_row.get_children():
		child.queue_free()

	_torrik = CharacterCatalog.spawn_character("torrik")
	_myra = CharacterCatalog.spawn_character("myra")
	_orsen = CharacterCatalog.spawn_character("orsen")

	for ch in [_torrik, _myra, _orsen]:
		ch.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		ch.size_flags_vertical = Control.SIZE_EXPAND_FILL
		ch.custom_minimum_size = Vector2(180, 380)
		trio_row.add_child(ch)

	_torrik.apply_state("determined", true, false, true)
	_torrik.set_gaze_bias(0.5)
	_myra.apply_state("neutral", true, false, true)
	_myra.set_gaze_bias(-0.4)
	_orsen.apply_state("determined", true, true, true)
	_orsen.set_gaze_bias(-0.6)

func _populate_chapters() -> void:
	for child in chapter_list.get_children():
		child.queue_free()

	var chapters := ChapterLoader.get_ordered_chapters()
	for ch in chapters:
		var chap_id := str(ch.get("id", "chapter_01"))
		var chap_num := int(ch.get("number", 1))
		var chap_title := str(ch.get("title", "Chapter"))
		var chap_sub := str(ch.get("subtitle", ""))
		var chap_summary := str(ch.get("summary", ""))
		var start_node := str(ch.get("startNode", ""))

		var card := PanelContainer.new()
		card.add_theme_stylebox_override("panel", ThemeFactory.make_panel(ThemeFactory.CARD_SURFACE, ThemeFactory.HAIRLINE, 12, 1))

		var margin := MarginContainer.new()
		margin.add_theme_constant_override("margin_left", 16)
		margin.add_theme_constant_override("margin_top", 12)
		margin.add_theme_constant_override("margin_right", 16)
		margin.add_theme_constant_override("margin_bottom", 12)
		card.add_child(margin)

		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 14)
		margin.add_child(row)

		var info := VBoxContainer.new()
		info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		info.add_theme_constant_override("separation", 3)
		row.add_child(info)

		var meta_lbl := Label.new()
		meta_lbl.text = "Chapter %d · %s" % [chap_num, chap_sub]
		meta_lbl.add_theme_font_size_override("font_size", 12)
		meta_lbl.add_theme_color_override("font_color", Color("#E8B86B"))
		info.add_child(meta_lbl)

		var title_lbl := Label.new()
		title_lbl.text = chap_title
		title_lbl.add_theme_font_size_override("font_size", 18)
		title_lbl.add_theme_color_override("font_color", ThemeFactory.TEXT_BONE)
		info.add_child(title_lbl)

		var sum_lbl := Label.new()
		sum_lbl.text = chap_summary
		sum_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		sum_lbl.add_theme_font_size_override("font_size", 12)
		sum_lbl.add_theme_color_override("font_color", ThemeFactory.TEXT_MUTED)
		info.add_child(sum_lbl)

		var play_btn := Button.new()
		play_btn.text = "Play Ch. %d" % chap_num
		play_btn.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		ThemeFactory.style_button(play_btn, chap_num == 1 and not GameState.has_save(), 8)
		play_btn.pressed.connect(func() -> void:
			AudioManager.play_choice()
			GameState.start_chapter(chap_id, start_node, chap_num == 1)
			get_tree().change_scene_to_file("res://scenes/dialogue_stage.tscn")
		)
		row.add_child(play_btn)

		chapter_list.add_child(card)

func _on_continue_pressed() -> void:
	AudioManager.play_choice()
	if GameState.load_game():
		get_tree().change_scene_to_file("res://scenes/dialogue_stage.tscn")

func _on_new_game_pressed() -> void:
	AudioManager.play_choice()
	var ch1 := ChapterLoader.get_chapter("chapter_01")
	GameState.start_chapter("chapter_01", str(ch1.get("startNode", "c1_start")), true)
	get_tree().change_scene_to_file("res://scenes/dialogue_stage.tscn")

func _on_studio_pressed() -> void:
	AudioManager.play_choice()
	get_tree().change_scene_to_file("res://scenes/studio_inspector.tscn")
