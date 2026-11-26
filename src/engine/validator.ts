import { BACKDROP_IDS, MOOD_IDS } from '../data/backdrops';
import { CHARACTER_IDS, EXPRESSION_IDS } from '../data/characters';
import { ChapterData, ParticleType } from '../types/vn';

const VALID_PARTICLES: ParticleType[] = ['none', 'rain', 'dust', 'embers'];

export interface ValidationIssue {
  severity: 'error' | 'warning';
  chapterId: string;
  nodeId?: string;
  code: string;
  message: string;
}

export interface ChapterValidationReport {
  chapterId: string;
  title: string;
  nodeCount: number;
  reachableCount: number;
  issues: ValidationIssue[];
  passed: boolean;
}

export function validateChapter(chapter: ChapterData): ChapterValidationReport {
  const issues: ValidationIssue[] = [];
  const nodeIds = new Set(Object.keys(chapter.nodes));

  if (!chapter.startNode || !nodeIds.has(chapter.startNode)) {
    issues.push({ severity: 'error', chapterId: chapter.id, code: 'MISSING_START_NODE', message: `Start node "${chapter.startNode}" missing.` });
  }

  for (const [nodeId, node] of Object.entries(chapter.nodes)) {
    if (node.speaker !== 'narrator' && !CHARACTER_IDS.includes(node.speaker)) {
      issues.push({ severity: 'error', chapterId: chapter.id, nodeId, code: 'UNKNOWN_SPEAKER', message: `Unknown speaker "${node.speaker}".` });
    }
    if (!EXPRESSION_IDS.includes(node.expression)) {
      issues.push({ severity: 'error', chapterId: chapter.id, nodeId, code: 'UNKNOWN_EXPRESSION', message: `Unknown expression "${node.expression}".` });
    }
    if (!BACKDROP_IDS.includes(node.backdrop)) {
      issues.push({ severity: 'error', chapterId: chapter.id, nodeId, code: 'UNKNOWN_BACKDROP', message: `Unknown backdrop "${node.backdrop}".` });
    }
    if (node.mood && !MOOD_IDS.includes(node.mood)) {
      issues.push({ severity: 'error', chapterId: chapter.id, nodeId, code: 'UNKNOWN_MOOD', message: `Unknown mood "${node.mood}".` });
    }
    if (node.particles && !VALID_PARTICLES.includes(node.particles)) {
      issues.push({ severity: 'error', chapterId: chapter.id, nodeId, code: 'UNKNOWN_PARTICLES', message: `Unknown particles "${node.particles}".` });
    }
    for (const sc of node.characters) {
      if (!CHARACTER_IDS.includes(sc.id)) {
        issues.push({ severity: 'error', chapterId: chapter.id, nodeId, code: 'UNKNOWN_STAGE_CHARACTER', message: `Unknown stage character "${sc.id}".` });
      }
      if (!EXPRESSION_IDS.includes(sc.expression)) {
        issues.push({ severity: 'error', chapterId: chapter.id, nodeId, code: 'UNKNOWN_EXPRESSION', message: `Unknown expression "${sc.expression}".` });
      }
    }
    if (node.next && !nodeIds.has(node.next)) {
      issues.push({ severity: 'error', chapterId: chapter.id, nodeId, code: 'MISSING_NEXT_NODE', message: `Missing next node "${node.next}".` });
    }
    if (node.conditionFlag && !nodeIds.has(node.conditionFlag.fallbackNext)) {
      issues.push({ severity: 'error', chapterId: chapter.id, nodeId, code: 'MISSING_NEXT_NODE', message: `Missing fallbackNext "${node.conditionFlag.fallbackNext}".` });
    }
    if (node.investigation) {
      if (!nodeIds.has(node.investigation.continueNext)) {
        issues.push({ severity: 'error', chapterId: chapter.id, nodeId, code: 'MISSING_NEXT_NODE', message: `Missing investigation continueNext "${node.investigation.continueNext}".` });
      }
      for (const hs of node.investigation.hotspots) {
        if (hs.speaker !== 'narrator' && !CHARACTER_IDS.includes(hs.speaker)) {
          issues.push({ severity: 'error', chapterId: chapter.id, nodeId, code: 'UNKNOWN_SPEAKER', message: `Hotspot "${hs.id}" unknown speaker "${hs.speaker}".` });
        }
        if (!EXPRESSION_IDS.includes(hs.expression)) {
          issues.push({ severity: 'error', chapterId: chapter.id, nodeId, code: 'UNKNOWN_EXPRESSION', message: `Hotspot "${hs.id}" unknown expression "${hs.expression}".` });
        }
      }
    }
    if (node.choices && node.choices.length > 0) {
      for (const choice of node.choices) {
        if (!nodeIds.has(choice.next)) {
          issues.push({ severity: 'error', chapterId: chapter.id, nodeId, code: 'MISSING_NEXT_NODE', message: `Missing choice target "${choice.next}".` });
        }
      }
    } else if (!node.next && !node.endChapter && !node.investigation) {
      issues.push({ severity: 'error', chapterId: chapter.id, nodeId, code: 'DEAD_END_NODE', message: `Dead-end node "${nodeId}".` });
    }
  }

  const visited = new Set<string>();
  if (chapter.startNode && nodeIds.has(chapter.startNode)) {
    const queue: string[] = [chapter.startNode];
    visited.add(chapter.startNode);
    while (queue.length > 0) {
      const curr = chapter.nodes[queue.shift()!];
      if (!curr) continue;
      const outs: string[] = [];
      if (curr.next) outs.push(curr.next);
      if (curr.conditionFlag?.fallbackNext) outs.push(curr.conditionFlag.fallbackNext);
      if (curr.investigation?.continueNext) outs.push(curr.investigation.continueNext);
      if (curr.choices) for (const c of curr.choices) outs.push(c.next);
      for (const t of outs) {
        if (nodeIds.has(t) && !visited.has(t)) {
          visited.add(t);
          queue.push(t);
        }
      }
    }
  }

  for (const nodeId of nodeIds) {
    if (!visited.has(nodeId)) {
      issues.push({ severity: 'error', chapterId: chapter.id, nodeId, code: 'UNREACHABLE_NODE', message: `Unreachable node "${nodeId}".` });
    }
  }

  return { chapterId: chapter.id, title: chapter.title, nodeCount: nodeIds.size, reachableCount: visited.size, issues, passed: issues.every((i) => i.severity !== 'error') };
}
