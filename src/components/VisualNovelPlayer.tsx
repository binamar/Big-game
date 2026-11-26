import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  History,
  RotateCcw,
  FastForward,
  ChevronRight,
  X,
  Search,
  Check,
  Compass,
} from 'lucide-react';
import { BACKDROPS } from '../data/backdrops';
import { CHARACTERS } from '../data/characters';
import { CHAPTER_MAP, CHAPTERS } from '../data/chapters';
import { soundEngine } from '../engine/audio';
import { saveStoryState } from '../engine/state';
import {
  ChapterNode,
  DialogueChoice,
  ExpressionId,
  InvestigationHotspot,
  SpeakerId,
  StoryState,
} from '../types/vn';
import { BackdropRenderer } from './BackdropRenderer';
import { CharacterPortrait } from './CharacterPortrait';

interface VisualNovelPlayerProps {
  storyState: StoryState;
  onUpdateState: (next: StoryState) => void;
  onExitToMenu: () => void;
}

interface ActiveLineOverride {
  speaker: SpeakerId;
  speakerName: string;
  expression: ExpressionId;
  text: string;
}

export const VisualNovelPlayer: React.FC<VisualNovelPlayerProps> = ({
  storyState,
  onUpdateState,
  onExitToMenu,
}) => {
  const chapter = CHAPTER_MAP[storyState.currentChapterId] ?? CHAPTERS[0];
  const node: ChapterNode =
    chapter.nodes[storyState.currentNodeId] ?? chapter.nodes[chapter.startNode];

  const [revealedCount, setRevealedCount] = useState(0);
  const [isMuted, setIsMuted] = useState(soundEngine.muted);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const [lineOverride, setLineOverride] = useState<ActiveLineOverride | null>(null);

  const typingTimerRef = useRef<number | null>(null);

  const activeSpeaker = lineOverride?.speaker ?? node.speaker;
  const activeSpeakerName = lineOverride?.speakerName ?? node.speakerName;
  const activeExpression = lineOverride?.expression ?? node.expression;
  const fullText = lineOverride?.text ?? node.text;
  const isTyping = revealedCount < fullText.length;

  useEffect(() => {
    setLineOverride(null);
    setRevealedCount(0);
    if (node.shake || node.expression === 'surprised') {
      setShakeCount((c) => c + 1);
      soundEngine.playShock();
    }
  }, [chapter.id, node.id, node.shake, node.expression]);

  useEffect(() => {
    if (revealedCount >= fullText.length) return;
    typingTimerRef.current = window.setTimeout(() => {
      setRevealedCount((prev) => prev + 1);
      if (revealedCount % 3 === 0 && activeSpeaker !== 'narrator') {
        soundEngine.playTick();
      }
    }, 16);

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [revealedCount, fullText, activeSpeaker]);

  const advanceToNode = useCallback(
    (
      targetChapterId: string,
      targetNodeId: string,
      extraFlags?: Record<string, boolean>,
      extraScores?: Record<string, number>,
      endingId?: string
    ) => {
      const nextFlags = { ...storyState.flags, ...(extraFlags ?? {}) };
      const nextScores = { ...storyState.scores };
      if (extraScores) {
        for (const [k, delta] of Object.entries(extraScores)) {
          nextScores[k] = (nextScores[k] ?? 0) + delta;
        }
      }

      const nextHistory = [
        ...storyState.history.slice(-69),
        {
          chapterId: chapter.id,
          nodeId: node.id,
          speakerName: node.speakerName,
          text: node.text,
        },
      ];

      const nextState: StoryState = {
        currentChapterId: targetChapterId,
        currentNodeId: targetNodeId,
        flags: nextFlags,
        scores: nextScores,
        inspectedHotspots: storyState.inspectedHotspots,
        endingId: endingId ?? storyState.endingId,
        history: nextHistory,
      };

      saveStoryState(nextState);
      onUpdateState(nextState);
    },
    [storyState, chapter.id, node.id, node.speakerName, node.text, onUpdateState]
  );

  const handleAdvance = useCallback(() => {
    if (showHistory) return;
    if (isTyping) {
      setRevealedCount(fullText.length);
      return;
    }
    if (node.investigation) return;
    if (node.choices && node.choices.length > 0) return;

    if (node.conditionFlag && node.next) {
      const actual = Boolean(storyState.flags[node.conditionFlag.flag]);
      const target =
        actual === node.conditionFlag.equals ? node.next : node.conditionFlag.fallbackNext;
      soundEngine.playChoice();
      advanceToNode(chapter.id, target, node.setFlags, node.addScore);
      return;
    }

    if (node.next) {
      advanceToNode(chapter.id, node.next, node.setFlags, node.addScore);
      return;
    }

    if (node.endChapter && chapter.nextChapterId) {
      const nextChap = CHAPTER_MAP[chapter.nextChapterId];
      if (nextChap) {
        soundEngine.playChoice();
        advanceToNode(nextChap.id, nextChap.startNode, node.setFlags, node.addScore);
      }
    }
  }, [
    showHistory,
    isTyping,
    fullText.length,
    node,
    storyState.flags,
    chapter.id,
    chapter.nextChapterId,
    advanceToNode,
  ]);

  const handleSelectChoice = useCallback(
    (choice: DialogueChoice) => {
      soundEngine.playChoice();
      advanceToNode(chapter.id, choice.next, choice.setFlags, choice.addScore, choice.endingId);
    },
    [advanceToNode, chapter.id]
  );

  const handleHotspotClick = (hs: InvestigationHotspot) => {
    soundEngine.playChoice();
    const existing = storyState.inspectedHotspots[node.id] ?? [];
    const isNew = !existing.includes(hs.id);

    const nextInspected = isNew
      ? { ...storyState.inspectedHotspots, [node.id]: [...existing, hs.id] }
      : storyState.inspectedHotspots;

    const nextFlags = isNew ? { ...storyState.flags, ...(hs.setFlags ?? {}) } : storyState.flags;
    const nextScores = { ...storyState.scores };
    if (isNew && hs.addScore) {
      for (const [k, delta] of Object.entries(hs.addScore)) {
        nextScores[k] = (nextScores[k] ?? 0) + delta;
      }
    }

    const nextHistory = isNew
      ? [
          ...storyState.history.slice(-69),
          {
            chapterId: chapter.id,
            nodeId: `${node.id}_${hs.id}`,
            speakerName: hs.speakerName,
            text: hs.text,
          },
        ]
      : storyState.history;

    const nextState: StoryState = {
      ...storyState,
      flags: nextFlags,
      scores: nextScores,
      inspectedHotspots: nextInspected,
      history: nextHistory,
    };

    saveStoryState(nextState);
    onUpdateState(nextState);

    setLineOverride({
      speaker: hs.speaker,
      speakerName: hs.speakerName,
      expression: hs.expression,
      text: hs.text,
    });
    setRevealedCount(0);
    if (hs.expression === 'surprised') {
      setShakeCount((c) => c + 1);
      soundEngine.playShock();
    }
  };

  const handleProceedInvestigation = () => {
    if (!node.investigation) return;
    soundEngine.playChoice();
    advanceToNode(chapter.id, node.investigation.continueNext);
  };

  useEffect(() => {
    if (!autoPlay || isTyping || node.investigation || (node.choices && node.choices.length > 0)) {
      return;
    }
    if (node.endChapter && !chapter.nextChapterId) return;
    const t = window.setTimeout(() => handleAdvance(), 1850);
    return () => clearTimeout(t);
  }, [autoPlay, isTyping, node.investigation, node.choices, node.endChapter, chapter.nextChapterId, handleAdvance]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if ((e.target as HTMLElement)?.tagName === 'BUTTON') return;
        e.preventDefault();
        handleAdvance();
      } else if (e.key === 'Escape' && showHistory) {
        setShowHistory(false);
      } else if (!isTyping && node.choices && node.choices.length > 0) {
        const idx = Number(e.key) - 1;
        if (idx >= 0 && idx < node.choices.length) {
          handleSelectChoice(node.choices[idx]);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleAdvance, handleSelectChoice, showHistory, isTyping, node.choices]);

  const toggleMute = () => {
    soundEngine.muted = !isMuted;
    setIsMuted(soundEngine.muted);
  };

  const isStoryComplete = !isTyping && Boolean(node.endChapter) && !chapter.nextChapterId;
  const backdropInfo = BACKDROPS[node.backdrop];
  const speakerInfo = activeSpeaker !== 'narrator' ? CHARACTERS[activeSpeaker] : null;
  const displayedText = useMemo(() => fullText.slice(0, revealedCount), [fullText, revealedCount]);

  const leftChar = node.characters.find((c) => c.position === 'left');
  const centerChar = node.characters.find((c) => c.position === 'center');
  const rightChar = node.characters.find((c) => c.position === 'right');

  const inspectedIds = storyState.inspectedHotspots[node.id] ?? [];
  const investigation = node.investigation;
  const canProceedInv = investigation ? inspectedIds.length >= investigation.requiredCount : false;

  const endingLabel =
    storyState.endingId === 'winter_road'
      ? 'Iron for the Winter Road'
      : storyState.endingId === 'silent_reckoning'
      ? 'The Silent Reckoning'
      : 'The Open Charter';

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#070a0f] flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* Locked 16:9 Theatrical Visual Novel Frame */}
      <div className="relative w-full max-w-[1260px] aspect-[16/9] max-h-[calc(100vh-92px)] rounded-2xl overflow-hidden border border-white/15 bg-[#0e1318] shadow-[0_24px_70px_rgba(0,0,0,0.65)]">
        <BackdropRenderer
          backdropId={node.backdrop}
          mood={node.mood}
          particles={node.particles}
        />

        {/* Top Stage HUD */}
        <div className="absolute top-3.5 left-4 right-4 z-30 flex items-center justify-between gap-4 pointer-events-none">
          <div className="pointer-events-auto bg-[#0c1118]/88 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-200 flex items-center gap-2.5">
            <span className="font-semibold text-amber-200 whitespace-nowrap">
              Chapter {chapter.number}: {chapter.title}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300 whitespace-nowrap">{backdropInfo.name}</span>
            {investigation && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-emerald-300 font-mono tabular-nums whitespace-nowrap">
                  Clues {inspectedIds.length}/{investigation.hotspots.length}
                </span>
              </>
            )}
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5 bg-[#0c1118]/88 backdrop-blur-md border border-white/10 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setAutoPlay((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                autoPlay
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{autoPlay ? 'Auto On' : 'Auto'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Log</span>
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onExitToMenu}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Chapters
            </button>
          </div>
        </div>

        {/* Click-to-Advance Background Stage */}
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={handleAdvance}
          aria-hidden="true"
        />

        {/* Modular 3-Slot Character Layer */}
        <div className="absolute inset-x-0 bottom-[22%] top-14 z-15 max-w-6xl mx-auto px-6 pointer-events-none flex items-end justify-between gap-2">
          <div className="w-1/3 h-full flex items-end justify-start">
            {leftChar && (
              <CharacterPortrait
                characterId={leftChar.id}
                expression={
                  lineOverride && lineOverride.speaker === leftChar.id
                    ? lineOverride.expression
                    : leftChar.expression
                }
                isActive={
                  lineOverride ? lineOverride.speaker === leftChar.id : leftChar.active ?? activeSpeaker === leftChar.id
                }
                isSpeaking={isTyping && activeSpeaker === leftChar.id}
                gazeBiasX={0.65}
                shakeTrigger={
                  leftChar.shake ||
                  (activeSpeaker === leftChar.id && (node.shake || activeExpression === 'surprised'))
                    ? shakeCount
                    : 0
                }
                className="h-[94%] w-full max-w-[290px]"
              />
            )}
          </div>

          <div className="w-1/3 h-full flex items-end justify-center">
            {centerChar && (
              <CharacterPortrait
                characterId={centerChar.id}
                expression={
                  lineOverride && lineOverride.speaker === centerChar.id
                    ? lineOverride.expression
                    : centerChar.expression
                }
                isActive={
                  lineOverride ? lineOverride.speaker === centerChar.id : centerChar.active ?? activeSpeaker === centerChar.id
                }
                isSpeaking={isTyping && activeSpeaker === centerChar.id}
                gazeBiasX={0}
                shakeTrigger={
                  centerChar.shake ||
                  (activeSpeaker === centerChar.id && (node.shake || activeExpression === 'surprised'))
                    ? shakeCount
                    : 0
                }
                className="h-[96%] w-full max-w-[295px]"
              />
            )}
          </div>

          <div className="w-1/3 h-full flex items-end justify-end">
            {rightChar && (
              <CharacterPortrait
                characterId={rightChar.id}
                expression={
                  lineOverride && lineOverride.speaker === rightChar.id
                    ? lineOverride.expression
                    : rightChar.expression
                }
                isActive={
                  lineOverride ? lineOverride.speaker === rightChar.id : rightChar.active ?? activeSpeaker === rightChar.id
                }
                isSpeaking={isTyping && activeSpeaker === rightChar.id}
                gazeBiasX={-0.65}
                flipHorizontal
                shakeTrigger={
                  rightChar.shake ||
                  (activeSpeaker === rightChar.id && (node.shake || activeExpression === 'surprised'))
                    ? shakeCount
                    : 0
                }
                className="h-[94%] w-full max-w-[290px]"
              />
            )}
          </div>
        </div>

        {/* Interactive Point-and-Click Scene Hotspots */}
        {investigation && (
          <div className="absolute inset-x-0 top-16 bottom-[28%] z-25 pointer-events-none">
            {investigation.hotspots.map((hs) => {
              const inspected = inspectedIds.includes(hs.id);
              return (
                <button
                  key={hs.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHotspotClick(hs);
                  }}
                  style={{ left: `${hs.x * 100}%`, top: `${hs.y * 100}%` }}
                  className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium inline-flex items-center gap-2 border shadow-xl transition-all duration-150 hover:scale-105 cursor-pointer whitespace-nowrap ${
                    inspected
                      ? 'bg-[#10251e]/92 border-emerald-400/75 text-emerald-100'
                      : 'bg-[#131822]/94 border-amber-400 text-amber-100 hover:bg-[#1f2430]'
                  }`}
                >
                  {inspected ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  ) : (
                    <Search className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  )}
                  <span>{hs.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Branching Choice Stack */}
        {!isTyping && node.choices && node.choices.length > 0 && (
          <div className="absolute inset-x-0 bottom-[29%] z-30 flex flex-col items-center gap-2.5 px-6">
            {node.choices.map((choice, idx) => (
              <button
                key={choice.next}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectChoice(choice);
                }}
                className="w-full max-w-2xl text-left px-5 py-3 rounded-xl bg-[#0e141d]/95 hover:bg-[#192332] border border-amber-400/45 hover:border-amber-300 text-slate-100 text-sm sm:text-base font-medium shadow-2xl transition-all duration-150 flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400"
              >
                <span className="flex items-baseline gap-3">
                  <span className="text-amber-300 font-mono text-xs tabular-nums">0{idx + 1}.</span>
                  <span>{choice.label}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-amber-300 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* Dialogue Card */}
        <div
          onClick={handleAdvance}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleAdvance();
            }
          }}
          className="absolute inset-x-0 bottom-0 z-25 p-3 sm:p-5 cursor-pointer focus-visible:outline-none"
        >
          <div className="max-w-5xl mx-auto bg-[#0b1017]/94 backdrop-blur-md border border-amber-400/25 rounded-2xl px-5 py-4 sm:px-6 sm:py-5 shadow-2xl">
            <div className="flex items-baseline justify-between gap-4 mb-1.5">
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-xl sm:text-2xl font-semibold text-amber-200">
                  {activeSpeakerName}
                </span>
                {speakerInfo && (
                  <>
                    <span aria-hidden="true" className="text-slate-600 text-xs">·</span>
                    <span className="text-xs text-slate-400">{speakerInfo.title}</span>
                  </>
                )}
              </div>
              <span className="text-xs text-slate-400 capitalize">{activeExpression}</span>
            </div>

            <p className="text-[#f4efe6] text-sm sm:text-base md:text-[17px] leading-relaxed min-h-[3rem]">
              {displayedText}
            </p>

            <div className="mt-2.5 flex items-center justify-between gap-4 text-xs text-slate-400">
              <span>
                {investigation
                  ? canProceedInv
                    ? 'Evidence gathered — click Proceed when ready or inspect remaining clues'
                    : investigation.prompt
                  : node.choices && node.choices.length > 0 && !isTyping
                  ? 'Select a decision above (keys 1–3)'
                  : isStoryComplete
                  ? 'Chronicle complete'
                  : node.endChapter && !isTyping
                  ? 'Click to continue to next chapter'
                  : 'Click anywhere or press Space to continue'}
              </span>

              {investigation ? (
                <button
                  type="button"
                  disabled={!canProceedInv}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProceedInvestigation();
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                    canProceedInv
                      ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
                      : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>
                    {canProceedInv
                      ? investigation.continueLabel
                      : `Inspect ${Math.max(1, investigation.requiredCount - inspectedIds.length)} more`}
                  </span>
                </button>
              ) : (
                !isTyping &&
                !node.choices?.length &&
                !isStoryComplete && (
                  <span className="inline-flex items-center gap-1 text-amber-300 font-medium whitespace-nowrap">
                    <span>{node.endChapter ? 'Next Chapter' : 'Continue'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Ending Epilogue Overlay */}
        {isStoryComplete && (
          <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-[#0e141d] border border-amber-400/50 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div>
                <div className="text-xs text-amber-300 font-medium">Chronicle Epilogue</div>
                <h3 className="font-display text-3xl font-semibold text-[#f4efe6] mt-1">
                  {endingLabel}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm bg-[#131a25] border border-white/10 rounded-xl p-4">
                <div>
                  <div className="text-xs text-slate-400">Guild Standing</div>
                  <div className="font-mono tabular-nums text-lg text-amber-200">
                    {storyState.scores.guild_standing ?? 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Forge Alliance</div>
                  <div className="text-slate-100">
                    {storyState.flags.trust_orsen ? 'Open Ledger Pact' : 'Cautious Protocol'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Lockhouse Road</div>
                  <div className="text-slate-100">
                    {storyState.flags.valley_road_alley ? 'Alley Ambush' : 'Toll Shed Audit'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Key Witness</div>
                  <div className="text-slate-100">
                    {storyState.flags.spared_witness ? 'Sanctuary Granted' : 'Manifest Seized'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onExitToMenu}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-sm font-medium transition-colors cursor-pointer"
                >
                  Return to Chapters
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const first = CHAPTERS[0];
                    advanceToNode(first.id, first.startNode);
                    onExitToMenu();
                  }}
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialogue Log Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[80vh] bg-[#0e141d] border border-white/15 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold text-amber-200">Dialogue Log</h3>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                aria-label="Close dialogue log"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              {storyState.history.length === 0 ? (
                <p className="text-sm text-slate-400">No lines recorded yet in this session.</p>
              ) : (
                storyState.history.map((entry, i) => (
                  <div
                    key={`${entry.nodeId}-${i}`}
                    className="border-b border-white/5 pb-3 last:border-0"
                  >
                    <div className="text-xs font-semibold text-amber-200 mb-1">
                      {entry.speakerName}
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">{entry.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
