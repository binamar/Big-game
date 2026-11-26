export type CharacterId = 'torrik' | 'myra' | 'orsen';

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

export type HairStyleId = 'cropped_parted' | 'braided_hood' | 'short_buzz';

export type AccessoryId = 'notebook' | 'satchel_hood' | 'apron';

export interface CharacterIdleProfile {
  bobSpeed: number;
  bobAmplitude: number;
  tiltSpeed: number;
  tiltAmplitudeDeg: number;
  lookIntervalMin: number;
  lookIntervalMax: number;
  lookRangeX: number;
  headFollowX: number;
}

export interface CharacterData {
  id: CharacterId;
  name: string;
  title: string;
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
  idleProfile: CharacterIdleProfile;
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
  endingId?: string;
  setFlags?: Record<string, boolean>;
  addScore?: Record<string, number>;
}

export interface ConditionBranch {
  flag: string;
  equals: boolean;
  fallbackNext: string;
}

export interface InvestigationHotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  speaker: SpeakerId;
  speakerName: string;
  expression: ExpressionId;
  text: string;
  setFlags?: Record<string, boolean>;
  addScore?: Record<string, number>;
}

export interface InvestigationData {
  prompt: string;
  requiredCount: number;
  continueLabel: string;
  continueNext: string;
  hotspots: InvestigationHotspot[];
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
  investigation?: InvestigationData;
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
  inspectedHotspots: Record<string, string[]>;
  endingId: string;
  history: Array<{
    chapterId: string;
    nodeId: string;
    speakerName: string;
    text: string;
  }>;
}
