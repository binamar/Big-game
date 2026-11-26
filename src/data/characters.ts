import { CharacterData, CharacterId, ExpressionId, ExpressionParams } from '../types/vn';

export const EXPRESSION_PRESETS: Record<ExpressionId, ExpressionParams> = {
  neutral: { eyebrowAngle: 0, eyebrowHeight: 0, eyelidOpenness: 0.92, pupilOffsetX: 0, pupilOffsetY: 0, mouthCurve: 0.1, mouthOpenness: 0, tear: false, sweatDrop: false },
  sad: { eyebrowAngle: 14, eyebrowHeight: 1.5, eyelidOpenness: 0.72, pupilOffsetX: 0, pupilOffsetY: 1.5, mouthCurve: -0.7, mouthOpenness: 0.05, tear: true, sweatDrop: false },
  angry: { eyebrowAngle: -16, eyebrowHeight: 3, eyelidOpenness: 0.85, pupilOffsetX: 0, pupilOffsetY: -0.5, mouthCurve: -0.55, mouthOpenness: 0.2, tear: false, sweatDrop: false },
  surprised: { eyebrowAngle: 6, eyebrowHeight: -5, eyelidOpenness: 1, pupilOffsetX: 0, pupilOffsetY: 0, mouthCurve: -0.1, mouthOpenness: 0.85, tear: false, sweatDrop: true },
  worried: { eyebrowAngle: 12, eyebrowHeight: -1, eyelidOpenness: 0.84, pupilOffsetX: -1.5, pupilOffsetY: 0.5, mouthCurve: -0.4, mouthOpenness: 0.12, tear: false, sweatDrop: true },
  determined: { eyebrowAngle: -10, eyebrowHeight: 1, eyelidOpenness: 0.88, pupilOffsetX: 0, pupilOffsetY: 0, mouthCurve: 0.2, mouthOpenness: 0.05, tear: false, sweatDrop: false },
  smug: { eyebrowAngle: -7, eyebrowHeight: -1.5, eyelidOpenness: 0.74, pupilOffsetX: 1.5, pupilOffsetY: -0.5, mouthCurve: 0.8, mouthOpenness: 0.08, tear: false, sweatDrop: false },
  tired: { eyebrowAngle: 7, eyebrowHeight: 2, eyelidOpenness: 0.54, pupilOffsetX: 0, pupilOffsetY: 1.2, mouthCurve: -0.25, mouthOpenness: 0.05, tear: false, sweatDrop: false },
};

export const EXPRESSION_IDS = Object.keys(EXPRESSION_PRESETS) as ExpressionId[];

const SIBLING_SKIN_TONE = '#C98E6B';
const SIBLING_SKIN_SHADOW = '#A86E4E';
const SIBLING_EYE_COLOR = '#8E5228';
const SIBLING_EYE_SECONDARY = '#C78A52';

export const CHARACTERS: Record<CharacterId, CharacterData> = {
  torrik: {
    id: 'torrik', name: 'Torrik', title: 'Junior Guild Chronicler',
    skinTone: '#D9AE8E', skinShadow: '#BA8C6B', hairColor: '#3A2B26', hairHighlight: '#5A443C',
    hairStyle: 'cropped_parted', eyeColor: '#5B432E', eyeSecondary: '#8C6C4B',
    outfitPrimary: '#364556', outfitSecondary: '#242E3A', outfitAccent: '#B78C4A', outlineColor: '#1B1D22',
    accessory: 'notebook', accessoryLabel: 'Bound field notebook',
    bio: 'An apprentice clerk assigned to audit iron and grain tallies across the outer wards.',
  },
  orsen: {
    id: 'orsen', name: 'Orsen', title: 'Master Blacksmith',
    skinTone: '#C18661', skinShadow: '#9B6342', hairColor: '#2B2B30', hairHighlight: '#47474F',
    hairStyle: 'short_buzz', eyeColor: '#4E5D6C', eyeSecondary: '#7E90A1',
    outfitPrimary: '#4B443E', outfitSecondary: '#302B27', outfitAccent: '#7C4B32', outlineColor: '#1B1D22',
    accessory: 'apron', accessoryLabel: 'Soot-stained leather apron',
    bio: 'Veteran forge-master of the Outer Ward whose coal shipments vanished mid-winter.',
  },
  myra: {
    id: 'myra', name: 'Myra', title: 'Road Courier & Scout',
    skinTone: '#E5BF9F', skinShadow: '#C79B79', hairColor: '#7C3927', hairHighlight: '#A35139',
    hairStyle: 'braided_hood', eyeColor: '#426B49', eyeSecondary: '#6F9C74',
    outfitPrimary: '#3C5242', outfitSecondary: '#29382E', outfitAccent: '#8C6239', outlineColor: '#1B1D22',
    accessory: 'satchel_hood', accessoryLabel: 'Courier satchel and travel hood',
    bio: 'Fast-footed dispatch rider who knows every mud track between the city and the pass.',
  },
  haldor: {
    id: 'haldor', name: 'Haldor', title: 'Small Guild Commander',
    skinTone: '#D6B6A1', skinShadow: '#B5917A', hairColor: '#8B9096', hairHighlight: '#B4B9BF',
    hairStyle: 'swept_veteran', eyeColor: '#4A6278', eyeSecondary: '#7C96AD',
    outfitPrimary: '#393E46', outfitSecondary: '#22262C', outfitAccent: '#733034', outlineColor: '#1B1D22',
    accessory: 'beard_cape', accessoryLabel: 'Grey beard and weathered cape', hasBeard: true,
    bio: 'Aging garrison officer trying to uphold honest guild charters amidst rising shortages.',
  },
  nova: {
    id: 'nova', name: 'Nova', title: 'Mountain Wayfarer',
    skinTone: '#E6D0C5', skinShadow: '#C6ABA0', hairColor: '#25293E', hairHighlight: '#3E4566',
    hairStyle: 'long_straight', eyeColor: '#69648A', eyeSecondary: '#9B96BF',
    outfitPrimary: '#433C52', outfitSecondary: '#2C2738', outfitAccent: '#7D758F', outlineColor: '#1B1D22',
    accessory: 'oversized_cloak', accessoryLabel: 'Oversized draped cloak',
    bio: 'Quiet traveler who tracks displaced families along the ridge roads.',
  },
  fennick: {
    id: 'fennick', name: 'Fennick', title: 'Great Guild Quartermaster',
    skinTone: '#DDB288', skinShadow: '#BD9067', hairColor: '#B58F52', hairHighlight: '#D4B274',
    hairStyle: 'styled_wave', eyeColor: '#826A31', eyeSecondary: '#BA9B4D',
    outfitPrimary: '#782834', outfitSecondary: '#471B24', outfitAccent: '#C9A24D', outlineColor: '#1B1D22',
    accessory: 'flashy_cloak', accessoryLabel: 'Flashy gold-trimmed cloak',
    bio: 'Polished Great Guild envoy who insists every missing wagon is merely a clerical delay.',
  },
  ilvar: {
    id: 'ilvar', name: 'Ilvar', title: 'Senior Guild Archivist',
    skinTone: '#D4C2B2', skinShadow: '#B39F8F', hairColor: '#45484F', hairHighlight: '#747882',
    hairStyle: 'slicked_streaked', eyeColor: '#2F5E61', eyeSecondary: '#588B8E',
    outfitPrimary: '#2B313B', outfitSecondary: '#1B1F26', outfitAccent: '#8F8267', outlineColor: '#1B1D22',
    accessory: 'long_coat', accessoryLabel: 'High-collared long coat',
    bio: 'Keeper of the Great Guild vaults who trusts stamped ink far more than spoken promises.',
  },
  selva: {
    id: 'selva', name: 'Selva', title: 'Displaced Villager', familyGroup: 'Siblings (Selva & Rowan)',
    skinTone: SIBLING_SKIN_TONE, skinShadow: SIBLING_SKIN_SHADOW, hairColor: '#36231C', hairHighlight: '#54392F',
    hairStyle: 'tucked_scarf', eyeColor: SIBLING_EYE_COLOR, eyeSecondary: SIBLING_EYE_SECONDARY,
    outfitPrimary: '#5E4D42', outfitSecondary: '#3E332C', outfitAccent: '#B57B3E', outlineColor: '#1B1D22',
    accessory: 'headscarf', accessoryLabel: 'Woven ochre-and-indigo headscarf',
    bio: 'Sister to Rowan. Organizes shelter for families forced out of the dry borderlands.',
  },
  rowan: {
    id: 'rowan', name: 'Rowan', title: 'Militia Shield-Bearer', familyGroup: 'Siblings (Selva & Rowan)',
    skinTone: SIBLING_SKIN_TONE, skinShadow: SIBLING_SKIN_SHADOW, hairColor: '#36231C', hairHighlight: '#54392F',
    hairStyle: 'tousled_gaunt', eyeColor: SIBLING_EYE_COLOR, eyeSecondary: SIBLING_EYE_SECONDARY,
    outfitPrimary: '#474A44', outfitSecondary: '#2E302C', outfitAccent: '#6C7378', outlineColor: '#1B1D22',
    accessory: 'pierced_shield', accessoryLabel: 'Pierced shield and gaunt face', gaunt: true,
    bio: 'Brother to Selva. Holds the mountain pass on half-rations with a splintered iron-rimmed shield.',
  },
};

export const CHARACTER_IDS = Object.keys(CHARACTERS) as CharacterId[];
