import chapter01 from '../../../data/chapters/chapter_01.json';
import chapter02 from '../../../data/chapters/chapter_02.json';
import chapter03 from '../../../data/chapters/chapter_03.json';
import chapter04 from '../../../data/chapters/chapter_04.json';
import chapter05 from '../../../data/chapters/chapter_05.json';
import chapter06 from '../../../data/chapters/chapter_06.json';
import chapter07 from '../../../data/chapters/chapter_07.json';
import chapter08 from '../../../data/chapters/chapter_08.json';
import chapter09 from '../../../data/chapters/chapter_09.json';
import chapter10 from '../../../data/chapters/chapter_10.json';
import { ChapterData } from '../../types/vn';

export const CHAPTERS: ChapterData[] = [
  chapter01 as ChapterData,
  chapter02 as ChapterData,
  chapter03 as ChapterData,
  chapter04 as ChapterData,
  chapter05 as ChapterData,
  chapter06 as ChapterData,
  chapter07 as ChapterData,
  chapter08 as ChapterData,
  chapter09 as ChapterData,
  chapter10 as ChapterData,
];

export const CHAPTER_MAP: Record<string, ChapterData> = Object.fromEntries(
  CHAPTERS.map((ch) => [ch.id, ch])
);
