extends Control

@onready var backdrop: BackdropRenderer = $Backdrop
@onready var hero_left: CharacterPortrait = $StagePreview/HeroLeft
@onready var hero_right: CharacterPortrait = $StagePreview/HeroRight
@onready var continue_btn: Button = $Margin/Layout/TopBar/Actions/ContinueBtn
@onready var new_game_btn: Button = $Margin/Layout/TopBar/Actions/NewGameBtn
@onready var studio_btn: Button = $Margin/Layout/TopBar/Actions/StudioBtn
@onready var chapter_grid: GridContainer = $Margin/Layout/ChapterScroll/ChapterGrid

func _ready() -> void:
	backdrop.set_scene("blacksmith_workshop", "tense", "embers")
	hero_left.apply_character("torrik", "determined", true)
	hero_right.flip_horizontal = true
	hero_right.apply_character("orsen", "neutral", true)

	continue_btn.visible = GameState.has_save()
	continue_btn.pressed.connect(_on_continue_pressed)
	new_game_btn.pressed.connect(_on_new_game_pressed)
	studio_btn.pressed.connect(_on_studio_pressed)

	_populate_chapters()

func _populate_chapters() -> void:
	for child in chapter_grid.get_children():
		child.queue_free()

	var chapters := ChapterLoader.get_ordered_chapters()
	for ch in chapters:
		var chap_id := str(ch.get("id", "chapter_01"))
		var chap_num := int(ch.get("number", 1))
		var chap_title := str(ch.get("title", "Chapter"))
		var chap_sub := str(ch.get("subtitle", ""))
		var start_node := str(ch.get("startNode", ""))

		var card := PanelContainer.new()
		card.custom_minimum_size = Vector2(280, 112)
		card.size_flags_horizontal = Control.SIZE_EXPAND_FILL

		var vb := VBoxContainer.new()
		vb.add_theme_constant_override("separation", 6)
		card.add_child(vb)

		var title_lbl := Label.new()
		title_lbl.text = "Ch. %02d: %s" % [chap_num, chap_title]
		title_lbl.add_theme_font_size_override("font_size", 16)
		vb.add_child(title_lbl)

		var sub_lbl := Label.new()
		sub_lbl.text = chap_sub
		sub_lbl.add_theme_font_size_override("font_size", 12)
		sub_lbl.modulate = Color(0.75, 0.78, 0.84)
		vb.add_child(sub_lbl)

		var play_btn := Button.new()
		play_btn.text = "Play Chapter %d" % chap_num
		play_btn.pressed.connect(func() -> void:
			AudioManager.play_choice()
			GameState.start_chapter(chap_id, start_node, chap_num == 1)
			get_tree().change_scene_to_file("res://scenes/dialogue_stage.tscn")
		)
		vb.add_child(play_btn)

		chapter_grid.add_child(card)

func _on_continue_pressed() -> void:
	AudioManager.play_choice()
	GameState.load_game()
	get_tree().change_scene_to_file("res://scenes/dialogue_stage.tscn")

func _on_new_game_pressed() -> void:
	AudioManager.play_choice()
	GameState.start_chapter("chapter_01", "c1_start", true)
	get_tree().change_scene_to_file("res://scenes/dialogue_stage.tscn")

func _on_studio_pressed() -> void:
	AudioManager.play_choice()
	get_tree().change_scene_to_file("res://scenes/studio_inspector.tscn")
