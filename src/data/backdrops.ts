import { BackdropData, BackdropId, MoodId, MoodPalette } from '../types/vn';

export const MOOD_PALETTES: Record<MoodId, MoodPalette> = {
  calm: { id: 'calm', label: 'Calm', skyTop: '#263547', skyBottom: '#596F82', farLayer: '#3A4A5B', midLayer: '#273340', nearLayer: '#19212A', lightColor: '#EBC27A', tintOverlay: 'rgba(20, 30, 44, 0.12)' },
  tense: { id: 'tense', label: 'Tense', skyTop: '#1F232C', skyBottom: '#4A434B', farLayer: '#36323B', midLayer: '#24222A', nearLayer: '#16161C', lightColor: '#D97B48', tintOverlay: 'rgba(38, 22, 22, 0.18)' },
  somber: { id: 'somber', label: 'Somber', skyTop: '#1E2730', skyBottom: '#43515E', farLayer: '#34404A', midLayer: '#232C34', nearLayer: '#141A20', lightColor: '#B8C4CC', tintOverlay: 'rgba(18, 26, 36, 0.24)' },
  urgent: { id: 'urgent', label: 'Urgent', skyTop: '#2D2126', skyBottom: '#734237', farLayer: '#4B2F2D', midLayer: '#312022', nearLayer: '#1D1416', lightColor: '#F09D4B', tintOverlay: 'rgba(56, 22, 16, 0.16)' },
  warm: { id: 'warm', label: 'Warm', skyTop: '#2D2824', skyBottom: '#6D543D', farLayer: '#4E3D2F', midLayer: '#342920', nearLayer: '#201914', lightColor: '#F2B863', tintOverlay: 'rgba(48, 32, 16, 0.10)' },
  bleak: { id: 'bleak', label: 'Bleak', skyTop: '#2F3336', skyBottom: '#6F6D66', farLayer: '#524F49', midLayer: '#383632', nearLayer: '#21201E', lightColor: '#D6BA82', tintOverlay: 'rgba(42, 38, 30, 0.20)' },
};

export const MOOD_IDS = Object.keys(MOOD_PALETTES) as MoodId[];

export const BACKDROPS: Record<BackdropId, BackdropData> = {
  small_guild_hall: { id: 'small_guild_hall', name: 'Small Guild Hall', region: 'Outer Ward', defaultMood: 'warm', defaultParticles: 'dust', description: 'Timber-framed hall with notice boards, hearth lanterns, and worn oak benches.' },
  blacksmith_workshop: { id: 'blacksmith_workshop', name: 'Blacksmith Workshop', region: 'Outer Ward', defaultMood: 'tense', defaultParticles: 'embers', description: 'Stone forge hearth, anvil silhouette, tool racks, and drifting coal embers.' },
  city_square: { id: 'city_square', name: 'City Square', region: 'Lower Market', defaultMood: 'calm', defaultParticles: 'dust', description: 'Cobblestone plaza beneath a bell tower, lined with awnings and a dry fountain.' },
  great_guild_headquarters: { id: 'great_guild_headquarters', name: 'Great Guild Headquarters', region: 'High Quarter', defaultMood: 'tense', defaultParticles: 'none', description: 'Tall stone colonnade, hanging guild banners, and broad arched windows.' },
  ruined_village: { id: 'ruined_village', name: 'Ruined Village', region: 'Borderlands', defaultMood: 'somber', defaultParticles: 'dust', description: 'Charred roof beams, broken stone walls, and barren hills in grey light.' },
  army_camp_dusk: { id: 'army_camp_dusk', name: 'Army Camp at Dusk', region: 'East Ridge', defaultMood: 'urgent', defaultParticles: 'embers', description: 'Row of canvas tents, supply wagons, and watchfires against a burnt-amber sky.' },
  mountain_road: { id: 'mountain_road', name: 'Mountain Road', region: 'High Pass', defaultMood: 'calm', defaultParticles: 'dust', description: 'Winding stone switchback overlooking jagged pine ridges and distant peaks.' },
  night_alley: { id: 'night_alley', name: 'Night Alley', region: 'Lower Market', defaultMood: 'tense', defaultParticles: 'none', description: 'Narrow brick corridor lit by a single iron wall lantern and shuttered eaves.' },
  archive_room: { id: 'archive_room', name: 'Archive Room', region: 'Great Guild Vaults', defaultMood: 'warm', defaultParticles: 'dust', description: 'Floor-to-ceiling ledger shelves, reading desk lamp, and tall iron-barred window.' },
  rainy_street: { id: 'rainy_street', name: 'Rainy Street', region: 'Outer Ward', defaultMood: 'somber', defaultParticles: 'rain', description: 'Wet slate rooftops, dim shop lanterns, and steady rain sheeting across cobblestones.' },
  dry_farmland: { id: 'dry_farmland', name: 'Dry Farmland', region: 'South Valley', defaultMood: 'bleak', defaultParticles: 'dust', description: 'Cracked earth furrows, a still wooden windmill, and dry wind haze.' },
  council_chamber: { id: 'council_chamber', name: 'Council Chamber', region: 'Great Guild Seat', defaultMood: 'tense', defaultParticles: 'none', description: 'Tiered stone gallery, tall arched ribs, and warm sconce light over the audit dais.' },
};

export const BACKDROP_IDS = Object.keys(BACKDROPS) as BackdropId[];
