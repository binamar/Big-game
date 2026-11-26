extends Control

@onready var backdrop: BackdropRenderer = $Backdrop
@onready var stage_click_layer: Control = $StageClickLayer
@onready var left_slot: Control = $PortraitLayer/LeftSlot
@onready var center_slot: Control = $PortraitLayer/CenterSlot
@onready var right_slot: Control = $PortraitLayer/RightSlot
@onready var hotspot_layer: Control = $HotspotLayer

@onready var top_hud: PanelContainer = $TopHUD
@onready var chapter_label: Label = $TopHUD/HUDMargin/HUDRow/ChapterLabel
@onready var clue_status_label: Label = $TopHUD/HUDMargin/HUDRow/ClueStatusLabel
@onready var auto_btn: Button = $TopHUD/HUDMargin/HUDRow/Buttons/AutoBtn
@onready var log_btn: Button = $TopHUD/HUDMargin/HUDRow/Buttons/LogBtn
@onready var mute_btn: Button = $TopHUD/HUDMargin/HUDRow/Buttons/MuteBtn
@onready var menu_btn: Button = $TopHUD/HUDMargin/HUDRow/Buttons/MenuBtn

@onready var choice_box: VBoxContainer = $ChoiceBox
@onready var dialogue_panel: PanelContainer = $DialoguePanel
@onready var speaker_label: Label = $DialoguePanel/PanelMargin/PanelVBox/HeaderRow/SpeakerLabel
@onready var role_label: Label = $DialoguePanel/PanelMargin/PanelVBox/HeaderRow/RoleLabel
@onready var expr_label: Label = $DialoguePanel/PanelMargin/PanelVBox/HeaderRow/ExpressionLabel
@onready var dialogue_text: RichTextLabel = $DialoguePanel/PanelMargin/PanelVBox/DialogueText
@onready var footer_row: HBoxContainer = $DialoguePanel/PanelMargin/PanelVBox/FooterRow
@onready var prompt_label: Label = $DialoguePanel/PanelMargin/PanelVBox/FooterRow/PromptLabel
@onready var proceed_btn: Button = $DialoguePanel/PanelMargin/PanelVBox/FooterRow/ProceedBtn

@onready var log_overlay: PanelContainer = $LogOverlay
@onready var log_list: RichTextLabel = $LogOverlay/LogMargin/LogVBox/LogList
@onready var close_log_btn: Button = $LogOverlay/LogMargin/LogVBox/LogHeader/CloseLogBtn

@onready var ending_overlay: PanelContainer = $EndingOverlay
@onready var ending_title: Label = $EndingOverlay/EndingMargin/EndingVBox/EndingTitle
@onready var ending_summary: Label = $EndingOverlay/EndingMargin/EndingVBox/EndingSummary
@onready var replay_btn: Button = $EndingOverlay/EndingMargin/EndingVBox/EndingActions/ReplayBtn
@onready var ending_menu_btn: Button = $EndingOverlay/EndingMargin/EndingVBox/EndingActions/EndingMenuBtn

var _characters: Dictionary = {}
var _chapter: Dictionary = {}
var _node: Dictionary = {}
var _full_text: String = ""
var _revealed: int = 0
var _char_timer: float = 0.0
var _auto_play: bool = false
var _auto_wait: float = 0.0
var _active_speaker_id: String = "narrator"
var _last_backdrop: String = ""
var _dialogue_tween: Tween

func _ready() -> void:
	_apply_ui_theme()
	_spawn_modular_characters()

	stage_click_layer.gui_input.connect(_on_stage_gui_input)
	dialogue_panel.gui_input.connect(_on_stage_gui_input)

	auto_btn.pressed.connect(_on_auto_pressed)
	log_btn.pressed.connect(_on_log_pressed)
	mute_btn.pressed.connect(_on_mute_pressed)
	menu_btn.pressed.connect(_on_menu_pressed)
	proceed_btn.pressed.connect(_on_investigation_proceed)
	close_log_btn.pressed.connect(func() -> void: log_overlay.visible = false)
	replay_btn.pressed.connect(_on_replay_pressed)
	ending_menu_btn.pressed.connect(_on_menu_pressed)

	log_overlay.visible = false
	ending_overlay.visible = false
	proceed_btn.visible = false
	_load_current_node()

func _apply_ui_theme() -> void:
	top_hud.add_theme_stylebox_override("panel", ThemeFactory.make_panel(Color(0.055, 0.075, 0.11, 0.88), ThemeFactory.HAIRLINE, 12, 1))
	dialogue_panel.add_theme_stylebox_override("panel", ThemeFactory.make_panel(Color(0.055, 0.075, 0.11, 0.94), ThemeFactory.BRASS_SOFT, 16, 1))
	log_overlay.add_theme_stylebox_override("panel", ThemeFactory.make_panel(Color(0.06, 0.08, 0.12, 0.97), ThemeFactory.BRASS_SOFT, 16, 1))
	ending_overlay.add_theme_stylebox_override("panel", ThemeFactory.make_panel(Color(0.06, 0.08, 0.12, 0.97), ThemeFactory.BRASS, 18, 2))

	for btn in [auto_btn, log_btn, mute_btn, menu_btn, close_log_btn, ending_menu_btn]:
		ThemeFactory.style_button(btn, false, 8)
	ThemeFactory.style_button(proceed_btn, true, 8)
	ThemeFactory.style_button(replay_btn, true, 8)

func _spawn_modular_characters() -> void:
	for cid in CharacterCatalog.CHARACTER_IDS:
		var ch := CharacterCatalog.spawn_character(cid)
		ch.visible = false
		ch.set_anchors_preset(Control.PRESET_FULL_RECT)
		_characters[cid] = ch
		left_slot.add_child(ch)

func _mount_character_in_slot(cid: String, slot_name: String) -> CharacterBase:
	if not _characters.has(cid):
		return null
	var ch: CharacterBase = _characters[cid]
	var target_slot: Control = left_slot
	if slot_name == "center":
		target_slot = center_slot
	elif slot_name == "right":
		target_slot = right_slot
	if ch.get_parent() != target_slot:
		ch.get_parent().remove_child(ch)
		target_slot.add_child(ch)
	ch.set_anchors_preset(Control.PRESET_FULL_RECT)
	ch.visible = true
	return ch

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
	chapter_label.text = "Ch. %d: %s  ·  %s" % [chap_num, chap_title, str(scene_meta["name"])]

	var backdrop_changed := scene_id != _last_backdrop
	_last_backdrop = scene_id
	backdrop.set_scene(
		scene_id,
		str(_node.get("mood", "")),
		str(_node.get("particles", ""))
	)
	if backdrop_changed:
		backdrop.modulate = Color(0.84, 0.86, 0.90, 1.0)
		create_tween().tween_property(backdrop, "modulate", Color.WHITE, 0.32)

	_apply_stage_characters()
	_active_speaker_id = str(_node.get("speaker", "narrator"))
	_set_dialogue_content(
		_active_speaker_id,
		str(_node.get("speakerName", "Narrator")),
		str(_node.get("expression", "neutral")),
		str(_node.get("text", "")),
		bool(_node.get("shake", false))
	)
	_animate_dialogue_panel()
	_refresh_investigation_ui()

func _set_dialogue_content(speaker_id: String, speaker_name: String, expr_id: String, text_str: String, do_shake: bool) -> void:
	_active_speaker_id = speaker_id
	speaker_label.text = speaker_name
	expr_label.text = expr_id.capitalize()
	if speaker_id == "narrator":
		role_label.text = ""
	else:
		var meta := CharacterCatalog.get_meta(speaker_id)
		role_label.text = "·  %s" % str(meta.get("title", ""))

	_full_text = text_str
	_revealed = 0
	_char_timer = 0.0
	_auto_wait = 0.0
	dialogue_text.text = ""
	_clear_choices()

	if do_shake or expr_id == "surprised":
		AudioManager.play_shock()

	_update_prompt()

func _animate_dialogue_panel() -> void:
	if _dialogue_tween and _dialogue_tween.is_valid():
		_dialogue_tween.kill()
	dialogue_panel.modulate.a = 0.86
	_dialogue_tween = create_tween().set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	_dialogue_tween.tween_property(dialogue_panel, "modulate:a", 1.0, 0.18)

func _apply_stage_characters() -> void:
	for ch in _characters.values():
		(ch as CharacterBase).visible = false

	var chars: Array = _node.get("characters", [])
	var active_speaker_id := str(_node.get("speaker", "narrator"))
	for entry in chars:
		if typeof(entry) != TYPE_DICTIONARY:
			continue
		var cid := str(entry.get("id", "torrik"))
		var expr := str(entry.get("expression", "neutral"))
		var pos := str(entry.get("position", "left"))
		var is_active := bool(entry.get("active", cid == active_speaker_id))
		var ch := _mount_character_in_slot(cid, pos)
		if ch == null:
			continue
		var should_flip := (pos == "right")
		ch.apply_state(expr, is_active, should_flip, false)
		if pos == "left":
			ch.set_gaze_bias(0.6)
		elif pos == "right":
			ch.set_gaze_bias(-0.6)
		else:
			ch.set_gaze_bias(0.0)
		if bool(entry.get("shake", false)):
			ch.trigger_shock()

func _refresh_investigation_ui() -> void:
	for child in hotspot_layer.get_children():
		child.queue_free()

	var inv = _node.get("investigation", null)
	if typeof(inv) != TYPE_DICTIONARY:
		clue_status_label.text = ""
		proceed_btn.visible = false
		return

	var hotspots: Array = inv.get("hotspots", [])
	var required := int(inv.get("requiredCount", hotspots.size()))
	var node_id := str(_node.get("id", ""))
	var found_count := GameState.get_inspected_count(node_id)
	clue_status_label.text = "Clues: %d / %d" % [found_count, hotspots.size()]

	var can_proceed := found_count >= required
	proceed_btn.visible = true
	proceed_btn.disabled = not can_proceed
	proceed_btn.text = str(inv.get("continueLabel", "Continue")) if can_proceed else "Inspect %d more clue(s)" % maxi(1, required - found_count)

	var layer_size := hotspot_layer.size
	if layer_size.x < 100.0:
		layer_size = Vector2(1280.0, 440.0)

	for hs in hotspots:
		if typeof(hs) != TYPE_DICTIONARY:
			continue
		var hs_id := str(hs.get("id", ""))
		var hs_label := str(hs.get("label", "Inspect"))
		var inspected := GameState.is_hotspot_inspected(node_id, hs_id)

		var btn := Button.new()
		btn.text = ("✓ " + hs_label) if inspected else ("◈ " + hs_label)
		ThemeFactory.style_hotspot_button(btn, inspected)
		var nx := clampf(float(hs.get("x", 0.5)), 0.08, 0.92)
		var ny := clampf(float(hs.get("y", 0.45)), 0.12, 0.86)
		btn.anchor_left = nx
		btn.anchor_right = nx
		btn.anchor_top = ny
		btn.anchor_bottom = ny
		btn.offset_left = -95.0
		btn.offset_right = 95.0
		btn.offset_top = -18.0
		btn.offset_bottom = 18.0

		btn.pressed.connect(func() -> void:
			_on_hotspot_clicked(node_id, hs)
		)
		hotspot_layer.add_child(btn)

func _on_hotspot_clicked(node_id: String, hs: Dictionary) -> void:
	var hs_id := str(hs.get("id", ""))
	var first_time := not GameState.is_hotspot_inspected(node_id, hs_id)
	GameState.mark_hotspot_inspected(node_id, hs_id)
	if first_time:
		GameState.apply_flags(hs.get("setFlags", {}))
		GameState.add_scores(hs.get("addScore", {}))
	GameState.save_game()
	AudioManager.play_choice()

	var sp_id := str(hs.get("speaker", "torrik"))
	var sp_name := str(hs.get("speakerName", "Torrik"))
	var expr := str(hs.get("expression", "determined"))
	var txt := str(hs.get("text", ""))

	# Update stage characters so the discoverer reacts live
	for cid in _characters.keys():
		var ch: CharacterBase = _characters[cid]
		if ch.visible:
			ch.set_active_speaker(cid == sp_id)
			if cid == sp_id:
				ch.set_expression(expr, false)
				if expr == "surprised":
					ch.trigger_shock()

	_set_dialogue_content(sp_id, sp_name, expr, txt, expr == "surprised")
	GameState.record_history(GameState.current_chapter_id, node_id + "_" + hs_id, sp_name, txt)
	_refresh_investigation_ui()

func _on_investigation_proceed() -> void:
	var inv = _node.get("investigation", null)
	if typeof(inv) != TYPE_DICTIONARY:
		return
	var next_id := str(inv.get("continueNext", ""))
	if next_id != "":
		AudioManager.play_choice()
		_commit_node(GameState.current_chapter_id, next_id, {}, {})

func _process(delta: float) -> void:
	var is_typing := _revealed < _full_text.length()
	for cid in _characters.keys():
		var ch: CharacterBase = _characters[cid]
		ch.is_speaking = is_typing and ch.visible and cid == _active_speaker_id

	if is_typing:
		_char_timer += delta
		while _char_timer >= 0.018 and _revealed < _full_text.length():
			_char_timer -= 0.018
			_revealed += 1
			if _revealed % 3 == 0 and _active_speaker_id != "narrator":
				AudioManager.play_tick()
		dialogue_text.text = _full_text.substr(0, _revealed)
		if _revealed >= _full_text.length():
			_on_text_finished()
	elif _auto_play and choice_box.get_child_count() == 0 and typeof(_node.get("investigation", null)) != TYPE_DICTIONARY:
		var has_next := _node.get("next", null) != null or str(_chapter.get("nextChapterId", "")) != ""
		if has_next and not ending_overlay.visible:
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
		btn.text = "0%d.  %s" % [i + 1, str(ch.get("label", "Continue"))]
		btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		btn.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		btn.custom_minimum_size = Vector2(560, 48)
		ThemeFactory.style_choice_button(btn)
		btn.pressed.connect(func() -> void:
			AudioManager.play_choice()
			var end_tag := str(ch.get("endingId", ""))
			if end_tag != "":
				GameState.ending_id = end_tag
			_commit_node(
				GameState.current_chapter_id,
				str(ch.get("next", "")),
				ch.get("setFlags", {}),
				ch.get("addScore", {})
			)
		)
		choice_box.add_child(btn)

	choice_box.modulate.a = 0.0
	create_tween().tween_property(choice_box, "modulate:a", 1.0, 0.2)

func _clear_choices() -> void:
	for child in choice_box.get_children():
		child.queue_free()

func _update_prompt() -> void:
	var is_inv := typeof(_node.get("investigation", null)) == TYPE_DICTIONARY
	if _revealed < _full_text.length():
		prompt_label.text = "Click anywhere or press Space to reveal"
	elif is_inv:
		prompt_label.text = "Click glowing scene markers above to gather clues"
	elif choice_box.get_child_count() > 0:
		prompt_label.text = "Select a decision above (Keys 1-3)"
	elif bool(_node.get("endChapter", false)):
		var next_chap := _chapter.get("nextChapterId", null)
		if next_chap != null and str(next_chap) != "":
			prompt_label.text = "Click or press Space for Next Chapter"
		else:
			prompt_label.text = "Click or press Space to view Chronicle Epilogue"
	else:
		prompt_label.text = "Click or press Space to continue"

func _on_stage_gui_input(event: InputEvent) -> void:
	if log_overlay.visible or ending_overlay.visible:
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		_advance_story()

func _unhandled_input(event: InputEvent) -> void:
	if log_overlay.visible:
		if event.is_action_pressed("ui_cancel"):
			log_overlay.visible = false
		return
	if ending_overlay.visible:
		return
	if event.is_action_pressed("ui_accept"):
		_advance_story()
		return
	if choice_box.get_child_count() > 0 and event is InputEventKey and event.pressed:
		var idx := -1
		if event.keycode == KEY_1:
			idx = 0
		elif event.keycode == KEY_2:
			idx = 1
		elif event.keycode == KEY_3:
			idx = 2
		if idx >= 0 and idx < choice_box.get_child_count():
			var btn := choice_box.get_child(idx) as Button
			if btn:
				btn.emit_signal("pressed")

func _advance_story() -> void:
	if _revealed < _full_text.length():
		_revealed = _full_text.length()
		dialogue_text.text = _full_text
		_on_text_finished()
		return

	if typeof(_node.get("investigation", null)) == TYPE_DICTIONARY:
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
		_show_ending_summary()

func _show_ending_summary() -> void:
	GameState.apply_flags(_node.get("setFlags", {}))
	GameState.add_scores(_node.get("addScore", {}))
	GameState.save_game()

	var end_name := "The Open Charter"
	if GameState.ending_id == "winter_road":
		end_name = "Iron for the Winter Road"
	elif GameState.ending_id == "silent_reckoning":
		end_name = "The Silent Reckoning"

	ending_title.text = "Chronicle Complete — %s" % end_name
	var trust_str := "Open Ledger" if GameState.get_flag("trust_orsen") else "Cautious Protocol"
	var road_str := "Alley Ambush" if GameState.get_flag("valley_road_alley") else ("Witness Spared" if GameState.get_flag("spared_witness") else "Manifest Seized")
	ending_summary.text = (
		"Guild Standing: %d\n" % GameState.get_score("guild_standing")
		+ "Forge Pact: %s\n" % trust_str
		+ "Lockhouse Road: %s\n" % road_str
		+ "Evidence Collected: Seal (%s), Axle (%s), Invoice (%s)" % [
			"Yes" if GameState.get_flag("found_scraped_seal") else "No",
			"Yes" if GameState.get_flag("found_axle_clue") else "No",
			"Yes" if GameState.get_flag("found_burnt_invoice") else "No",
		]
	)
	ending_overlay.visible = true

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

func _on_replay_pressed() -> void:
	ending_overlay.visible = false
	var ch1 := ChapterLoader.get_chapter("chapter_01")
	GameState.start_chapter("chapter_01", str(ch1.get("startNode", "c1_start")), true)
	_load_current_node()

func _on_menu_pressed() -> void:
	GameState.save_game()
	get_tree().change_scene_to_file("res://scenes/main.tscn")
