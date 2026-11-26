extends Control

@onready var backdrop: BackdropRenderer = $Backdrop
@onready var left_portrait: CharacterPortrait = $PortraitLayer/LeftPortrait
@onready var center_portrait: CharacterPortrait = $PortraitLayer/CenterPortrait
@onready var right_portrait: CharacterPortrait = $PortraitLayer/RightPortrait

@onready var chapter_label: Label = $TopHUD/HUDMargin/HUDRow/ChapterLabel
@onready var auto_btn: Button = $TopHUD/HUDMargin/HUDRow/Buttons/AutoBtn
@onready var log_btn: Button = $TopHUD/HUDMargin/HUDRow/Buttons/LogBtn
@onready var mute_btn: Button = $TopHUD/HUDMargin/HUDRow/Buttons/MuteBtn
@onready var menu_btn: Button = $TopHUD/HUDMargin/HUDRow/Buttons/MenuBtn

@onready var choice_box: VBoxContainer = $ChoiceBox
@onready var dialogue_panel: PanelContainer = $DialoguePanel
@onready var speaker_label: Label = $DialoguePanel/PanelMargin/PanelVBox/HeaderRow/SpeakerLabel
@onready var expr_label: Label = $DialoguePanel/PanelMargin/PanelVBox/HeaderRow/ExpressionLabel
@onready var dialogue_text: RichTextLabel = $DialoguePanel/PanelMargin/PanelVBox/DialogueText
@onready var prompt_label: Label = $DialoguePanel/PanelMargin/PanelVBox/PromptLabel

@onready var log_overlay: PanelContainer = $LogOverlay
@onready var log_list: RichTextLabel = $LogOverlay/LogMargin/LogVBox/LogList
@onready var close_log_btn: Button = $LogOverlay/LogMargin/LogVBox/LogHeader/CloseLogBtn

var _chapter: Dictionary = {}
var _node: Dictionary = {}
var _full_text: String = ""
var _revealed: int = 0
var _char_timer: float = 0.0
var _auto_play: bool = false
var _auto_wait: float = 0.0

func _ready() -> void:
	right_portrait.flip_horizontal = true
	auto_btn.pressed.connect(_on_auto_pressed)
	log_btn.pressed.connect(_on_log_pressed)
	mute_btn.pressed.connect(_on_mute_pressed)
	menu_btn.pressed.connect(_on_menu_pressed)
	close_log_btn.pressed.connect(func() -> void: log_overlay.visible = false)
	log_overlay.visible = false
	_load_current_node()

func _load_current_node() -> void:
	_chapter = ChapterLoader.get_chapter(GameState.current_chapter_id)
	if _chapter.is_empty():
		get_tree().change_scene_to_file("res://scenes/main.tscn")
		return

	var nodes: Dictionary = _chapter.get("nodes", {})
	var node_id := GameState.current_node_id
	if not nodes.has(node_id):
		node_id = str(_chapter.get("startNode", ""))
		GameState.current_node_id = node_id
	_node = nodes.get(node_id, {})

	var chap_num := int(_chapter.get("number", 1))
	var chap_title := str(_chapter.get("title", ""))
	var scene_id := str(_node.get("backdrop", "small_guild_hall"))
	var scene_meta := BackdropRegistry.get_backdrop_meta(scene_id)
	chapter_label.text = "Chapter %d: %s  ·  %s" % [chap_num, chap_title, str(scene_meta["name"])]

	backdrop.set_scene(
		scene_id,
		str(_node.get("mood", "")),
		str(_node.get("particles", ""))
	)

	_apply_stage_characters()

	var speaker_id := str(_node.get("speaker", "narrator"))
	var expr_id := str(_node.get("expression", "neutral"))
	speaker_label.text = str(_node.get("speakerName", "Narrator"))
	expr_label.text = expr_id.capitalize()

	_full_text = str(_node.get("text", ""))
	_revealed = 0
	_char_timer = 0.0
	_auto_wait = 0.0
	dialogue_text.text = ""
	_clear_choices()

	if bool(_node.get("shake", false)) or expr_id == "surprised":
		AudioManager.play_shock()

	_update_prompt()

func _apply_stage_characters() -> void:
	left_portrait.visible = false
	center_portrait.visible = false
	right_portrait.visible = false

	var chars: Array = _node.get("characters", [])
	var active_speaker_id := str(_node.get("speaker", "narrator"))
	for entry in chars:
		if typeof(entry) != TYPE_DICTIONARY:
			continue
		var cid := str(entry.get("id", "torrik"))
		var expr := str(entry.get("expression", "neutral"))
		var pos := str(entry.get("position", "left"))
		var is_active := bool(entry.get("active", cid == active_speaker_id))
		var slot: CharacterPortrait = left_portrait
		if pos == "center":
			slot = center_portrait
		elif pos == "right":
			slot = right_portrait

		slot.visible = true
		slot.apply_character(cid, expr, false)
		slot.set_active_speaker(is_active)
		if bool(entry.get("shake", false)):
			slot.trigger_shock()

func _process(delta: float) -> void:
	var is_typing := _revealed < _full_text.length()
	var speaker_id := str(_node.get("speaker", "narrator"))
	left_portrait.is_speaking = is_typing and left_portrait.visible and left_portrait.character_id == speaker_id
	center_portrait.is_speaking = is_typing and center_portrait.visible and center_portrait.character_id == speaker_id
	right_portrait.is_speaking = is_typing and right_portrait.visible and right_portrait.character_id == speaker_id

	if is_typing:
		_char_timer += delta
		while _char_timer >= 0.02 and _revealed < _full_text.length():
			_char_timer -= 0.02
			_revealed += 1
			if _revealed % 3 == 0 and speaker_id != "narrator":
				AudioManager.play_tick()
		dialogue_text.text = _full_text.substr(0, _revealed)
		if _revealed >= _full_text.length():
			_on_text_finished()
	elif _auto_play and choice_box.get_child_count() == 0:
		var has_next := _node.get("next", null) != null or str(_chapter.get("nextChapterId", "")) != ""
		if has_next:
			_auto_wait += delta
			if _auto_wait >= 1.8:
				_advance_story()

func _on_text_finished() -> void:
	var choices: Array = _node.get("choices", [])
	if choices.size() > 0:
		_populate_choices(choices)
	_update_prompt()

func _populate_choices(choices: Array) -> void:
	_clear_choices()
	for i in range(choices.size()):
		var ch: Dictionary = choices[i]
		var btn := Button.new()
		btn.text = "0%d. %s" % [i + 1, str(ch.get("label", "Continue"))]
		btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		btn.custom_minimum_size = Vector2(560, 44)
		btn.pressed.connect(func() -> void:
			AudioManager.play_choice()
			_commit_node(
				GameState.current_chapter_id,
				str(ch.get("next", "")),
				ch.get("setFlags", {}),
				ch.get("addScore", {})
			)
		)
		choice_box.add_child(btn)

func _clear_choices() -> void:
	for child in choice_box.get_children():
		choice_box.remove_child(child)
		child.queue_free()

func _update_prompt() -> void:
	if _revealed < _full_text.length():
		prompt_label.text = "Click or press Space to reveal"
	elif choice_box.get_child_count() > 0:
		prompt_label.text = "Choose a response above"
	elif bool(_node.get("endChapter", false)):
		var next_chap := str(_chapter.get("nextChapterId", ""))
		if next_chap != "" and _chapter.get("nextChapterId", null) != null:
			prompt_label.text = "Click or press Space for next chapter"
		else:
			prompt_label.text = "Story Complete · Standing: %d · Click to return to Chapters" % GameState.get_score("guild_standing")
	else:
		prompt_label.text = "Click or press Space to continue"

func _input(event: InputEvent) -> void:
	if log_overlay.visible:
		if event.is_action_pressed("ui_cancel"):
			log_overlay.visible = false
		return
	if event.is_action_pressed("ui_accept"):
		_advance_story()
		get_viewport().set_input_as_handled()
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var hovered: Control = get_viewport().gui_get_hovered_control()
		if hovered is BaseButton:
			return
		if choice_box.get_child_count() == 0:
			_advance_story()

func _advance_story() -> void:
	if _revealed < _full_text.length():
		_revealed = _full_text.length()
		dialogue_text.text = _full_text
		_on_text_finished()
		return

	if choice_box.get_child_count() > 0:
		return

	var extra_flags: Dictionary = _node.get("setFlags", {})
	var extra_scores: Dictionary = _node.get("addScore", {})

	var cond = _node.get("conditionFlag", null)
	if typeof(cond) == TYPE_DICTIONARY and _node.get("next", null) != null:
		var flag_name := str(cond.get("flag", ""))
		var expected := bool(cond.get("equals", true))
		var target := str(_node.get("next", "")) if GameState.get_flag(flag_name) == expected else str(cond.get("fallbackNext", ""))
		_commit_node(GameState.current_chapter_id, target, extra_flags, extra_scores)
		return

	if _node.get("next", null) != null:
		_commit_node(GameState.current_chapter_id, str(_node.get("next", "")), extra_flags, extra_scores)
		return

	if bool(_node.get("endChapter", false)):
		var next_chap_id = _chapter.get("nextChapterId", null)
		if next_chap_id != null and str(next_chap_id) != "":
			var next_chap := ChapterLoader.get_chapter(str(next_chap_id))
			if not next_chap.is_empty():
				AudioManager.play_choice()
				_commit_node(str(next_chap_id), str(next_chap.get("startNode", "")), extra_flags, extra_scores)
				return
		get_tree().change_scene_to_file("res://scenes/main.tscn")

func _commit_node(target_chapter: String, target_node: String, extra_flags: Dictionary, extra_scores: Dictionary) -> void:
	GameState.record_history(
		GameState.current_chapter_id,
		GameState.current_node_id,
		str(_node.get("speakerName", "Narrator")),
		_full_text
	)
	GameState.apply_flags(extra_flags)
	GameState.add_scores(extra_scores)
	GameState.current_chapter_id = target_chapter
	GameState.current_node_id = target_node
	GameState.save_game()
	_load_current_node()

func _on_auto_pressed() -> void:
	_auto_play = not _auto_play
	auto_btn.text = "Auto: On" if _auto_play else "Auto"

func _on_log_pressed() -> void:
	var lines := PackedStringArray()
	for item in GameState.history:
		lines.append("[b]%s:[/b] %s" % [str(item.get("speakerName", "")), str(item.get("text", ""))])
	log_list.text = "\n\n".join(lines) if lines.size() > 0 else "No lines recorded yet."
	log_overlay.visible = true

func _on_mute_pressed() -> void:
	AudioManager.muted = not AudioManager.muted
	mute_btn.text = "Unmute" if AudioManager.muted else "Mute"

func _on_menu_pressed() -> void:
	GameState.save_game()
	get_tree().change_scene_to_file("res://scenes/main.tscn")
