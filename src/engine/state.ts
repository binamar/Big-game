import { StoryState } from '../types/vn';

const STORAGE_KEY = 'ledger_ash_iron_save_v2';

export const DEFAULT_FLAGS: Record<string, boolean> = {
  trust_orsen: false,
  confronted_fennick: false,
  spoke_for_selva: false,
  saved_receipts: false,
  allied_ilvar: false,
  spared_lockmaster: false,
  protected_vault: false,
  shared_relief: false,
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
    return parsed;
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
