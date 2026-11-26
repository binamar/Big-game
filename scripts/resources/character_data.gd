class_name CharacterData
extends Resource

@export var id: String = ""
@export var display_name: String = ""
@export var title: String = ""
@export var family_group: String = ""

@export var skin_tone: Color = Color("#D9AE8E")
@export var skin_shadow: Color = Color("#BA8C6B")
@export var hair_color: Color = Color("#3A2B26")
@export var hair_highlight: Color = Color("#5A443C")
@export var hair_style: String = "cropped_parted"

@export var eye_color: Color = Color("#5B432E")
@export var eye_secondary: Color = Color("#8C6C4B")

@export var outfit_primary: Color = Color("#364556")
@export var outfit_secondary: Color = Color("#242E3A")
@export var outfit_accent: Color = Color("#B78C4A")
@export var outline_color: Color = Color("#1B1D22")

@export var accessory: String = "notebook"
@export var accessory_label: String = "Bound field notebook"
@export var gaunt: bool = false
@export var has_beard: bool = false
@export_multiline var bio: String = ""
