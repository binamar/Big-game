extends Node

var muted: bool = false
var _player: AudioStreamPlayer
var _generator: AudioStreamGenerator
var _phase: float = 0.0

func _ready() -> void:
	_player = AudioStreamPlayer.new()
	_generator = AudioStreamGenerator.new()
	_generator.mix_rate = 22050.0
	_generator.buffer_length = 0.08
	_player.stream = _generator
	_player.volume_db = -14.0
	add_child(_player)

func play_tick() -> void:
	_play_tone(540.0 + randf() * 80.0, 0.025, 0.14)

func play_choice() -> void:
	_play_tone(420.0, 0.08, 0.22)

func play_shock() -> void:
	_play_tone(140.0, 0.14, 0.28)

func _play_tone(freq: float, duration_sec: float, amp: float) -> void:
	if muted or DisplayServer.get_name() == "headless":
		return
	if not _player.playing:
		_player.play()
	var playback := _player.get_stream_playback() as AudioStreamGeneratorPlayback
	if not playback:
		return
	var frames := int(_generator.mix_rate * duration_sec)
	var avail := playback.get_frames_available()
	frames = mini(frames, avail)
	for i in range(frames):
		var env := 1.0 - float(i) / float(maxi(1, frames))
		var sample := sin(_phase * TAU) * amp * env
		playback.push_frame(Vector2(sample, sample))
		_phase = fmod(_phase + freq / _generator.mix_rate, 1.0)
