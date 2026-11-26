import chapter01 from '../../../data/chapters/chapter_01.json';
import chapter02 from '../../../data/chapters/chapter_02.json';
import chapter03 from '../../../data/chapters/chapter_03.json';
import { ChapterData } from '../../types/vn';

export const CHAPTERS: ChapterData[] = [
  chapter01 as ChapterData,
  chapter02 as ChapterData,
  chapter03 as ChapterData,
];

export const CHAPTER_MAP: Record<string, ChapterData> = Object.fromEntries(
  CHAPTERS.map((ch) => [ch.id, ch])
);
