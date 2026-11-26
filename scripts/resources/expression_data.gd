class_name ExpressionData
extends Resource

@export var eyebrow_angle: float = 0.0
@export var eyebrow_height: float = 0.0
@export var eyelid_openness: float = 0.92
@export var pupil_offset_x: float = 0.0
@export var pupil_offset_y: float = 0.0
@export var mouth_curve: float = 0.1
@export var mouth_openness: float = 0.0
@export var tear: bool = false
@export var sweat_drop: bool = false

const PRESET_IDS: PackedStringArray = [
	"neutral",
	"sad",
	"angry",
	"surprised",
	"worried",
	"determined",
	"smug",
	"tired",
]

static func create_params(
	eb_angle: float,
	eb_height: float,
	eyelid: float,
	px: float,
	py: float,
	m_curve: float,
	m_open: float,
	has_tear: bool,
	has_sweat: bool
) -> ExpressionData:
	var data := ExpressionData.new()
	data.eyebrow_angle = eb_angle
	data.eyebrow_height = eb_height
	data.eyelid_openness = eyelid
	data.pupil_offset_x = px
	data.pupil_offset_y = py
	data.mouth_curve = m_curve
	data.mouth_openness = m_open
	data.tear = has_tear
	data.sweat_drop = has_sweat
	return data

static func get_preset(expr_id: String) -> ExpressionData:
	match expr_id:
		"sad":
			return create_params(14.0, 1.5, 0.72, 0.0, 1.5, -0.7, 0.05, true, false)
		"angry":
			return create_params(-16.0, 3.0, 0.85, 0.0, -0.5, -0.55, 0.2, false, false)
		"surprised":
			return create_params(6.0, -5.0, 1.0, 0.0, 0.0, -0.1, 0.85, false, true)
		"worried":
			return create_params(12.0, -1.0, 0.84, -1.5, 0.5, -0.4, 0.12, false, true)
		"determined":
			return create_params(-10.0, 1.0, 0.88, 0.0, 0.0, 0.2, 0.05, false, false)
		"smug":
			return create_params(-7.0, -1.5, 0.74, 1.5, -0.5, 0.8, 0.08, false, false)
		"tired":
			return create_params(7.0, 2.0, 0.54, 0.0, 1.2, -0.25, 0.05, false, false)
		_:
			return create_params(0.0, 0.0, 0.92, 0.0, 0.0, 0.1, 0.0, false, false)
