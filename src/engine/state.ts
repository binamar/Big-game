import { StoryState } from '../types/vn';

const STORAGE_KEY = 'ledger_ash_iron_save_v3';

export const DEFAULT_FLAGS: Record<string, boolean> = {
  found_scraped_seal: false,
  found_mud_clue: false,
  found_axle_clue: false,
  trust_orsen: false,
  cautious_audit: false,
  found_windmill_ribbon: false,
  found_lime_sacks: false,
  valley_road_alley: false,
  spared_witness: false,
  seized_manifest: false,
  found_prefilled_box: false,
  found_burnt_invoice: false,
};

export const DEFAULT_SCORES: Record<string, number> = {
  guild_standing: 0,
};

export function createInitialStoryState(
  startChapterId = 'chapter_01',
  startNodeId = 'c1_start'
): StoryState {
  return {
    currentChapterId: startChapterId,
    currentNodeId: startNodeId,
    flags: { ...DEFAULT_FLAGS },
    scores: { ...DEFAULT_SCORES },
    inspectedHotspots: {},
    endingId: '',
    history: [],
  };
}

export function saveStoryState(state: StoryState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadStoryState(): StoryState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoryState;
    if (!parsed.currentChapterId || !parsed.currentNodeId) return null;
    return {
      ...createInitialStoryState(parsed.currentChapterId, parsed.currentNodeId),
      ...parsed,
      inspectedHotspots: parsed.inspectedHotspots ?? {},
      endingId: parsed.endingId ?? '',
    };
  } catch {
    return null;
  }
}

export function clearStoryState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
