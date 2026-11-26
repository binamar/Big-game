export type CharacterId =
  | 'torrik'
  | 'orsen'
  | 'myra'
  | 'haldor'
  | 'nova'
  | 'fennick'
  | 'ilvar'
  | 'selva'
  | 'rowan';

export type SpeakerId = CharacterId | 'narrator';

export type ExpressionId =
  | 'neutral'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'worried'
  | 'determined'
  | 'smug'
  | 'tired';

export type BackdropId =
  | 'small_guild_hall'
  | 'blacksmith_workshop'
  | 'city_square'
  | 'great_guild_headquarters'
  | 'ruined_village'
  | 'army_camp_dusk'
  | 'mountain_road'
  | 'night_alley'
  | 'archive_room'
  | 'rainy_street'
  | 'dry_farmland'
  | 'council_chamber';

export type MoodId = 'calm' | 'tense' | 'somber' | 'urgent' | 'warm' | 'bleak';

export type ParticleType = 'none' | 'rain' | 'dust' | 'embers';

export interface ExpressionParams {
  eyebrowAngle: number;
  eyebrowHeight: number;
  eyelidOpenness: number;
  pupilOffsetX: number;
  pupilOffsetY: number;
  mouthCurve: number;
  mouthOpenness: number;
  tear: boolean;
  sweatDrop: boolean;
}

export type HairStyleId =
  | 'cropped_parted'
  | 'short_buzz'
  | 'braided_hood'
  | 'swept_veteran'
  | 'long_straight'
  | 'styled_wave'
  | 'slicked_streaked'
  | 'tucked_scarf'
  | 'tousled_gaunt';

export type AccessoryId =
  | 'notebook'
  | 'apron'
  | 'satchel_hood'
  | 'beard_cape'
  | 'oversized_cloak'
  | 'flashy_cloak'
  | 'long_coat'
  | 'headscarf'
  | 'pierced_shield';

export interface CharacterData {
  id: CharacterId;
  name: string;
  title: string;
  familyGroup?: string;
  skinTone: string;
  skinShadow: string;
  hairColor: string;
  hairHighlight: string;
  hairStyle: HairStyleId;
  eyeColor: string;
  eyeSecondary: string;
  outfitPrimary: string;
  outfitSecondary: string;
  outfitAccent: string;
  outlineColor: string;
  accessory: AccessoryId;
  accessoryLabel: string;
  gaunt?: boolean;
  hasBeard?: boolean;
  bio: string;
}

export interface BackdropData {
  id: BackdropId;
  name: string;
  region: string;
  defaultMood: MoodId;
  defaultParticles: ParticleType;
  description: string;
}

export interface MoodPalette {
  id: MoodId;
  label: string;
  skyTop: string;
  skyBottom: string;
  farLayer: string;
  midLayer: string;
  nearLayer: string;
  lightColor: string;
  tintOverlay: string;
}

export interface StageCharacter {
  id: CharacterId;
  expression: ExpressionId;
  position: 'left' | 'center' | 'right';
  active?: boolean;
  shake?: boolean;
}

export interface DialogueChoice {
  label: string;
  next: string;
  setFlags?: Record<string, boolean>;
  addScore?: Record<string, number>;
}

export interface ConditionBranch {
  flag: string;
  equals: boolean;
  fallbackNext: string;
}

export interface ChapterNode {
  id: string;
  backdrop: BackdropId;
  mood?: MoodId;
  particles?: ParticleType;
  speaker: SpeakerId;
  speakerName: string;
  expression: ExpressionId;
  characters: StageCharacter[];
  text: string;
  shake?: boolean;
  next?: string | null;
  choices?: DialogueChoice[];
  setFlags?: Record<string, boolean>;
  addScore?: Record<string, number>;
  conditionFlag?: ConditionBranch;
  endChapter?: boolean;
}

export interface ChapterData {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  summary: string;
  startNode: string;
  nextChapterId?: string | null;
  nodes: Record<string, ChapterNode>;
}

export interface StoryState {
  currentChapterId: string;
  currentNodeId: string;
  flags: Record<string, boolean>;
  scores: Record<string, number>;
  history: Array<{
    chapterId: string;
    nodeId: string;
    speakerName: string;
    text: string;
  }>;
}
