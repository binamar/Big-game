import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, VolumeX, History, RotateCcw, FastForward, ChevronRight, X } from 'lucide-react';
import { BACKDROPS } from '../data/backdrops';
import { CHARACTERS } from '../data/characters';
import { CHAPTER_MAP, CHAPTERS } from '../data/chapters';
import { soundEngine } from '../engine/audio';
import { saveStoryState } from '../engine/state';
import { ChapterNode, DialogueChoice, StoryState } from '../types/vn';
import { BackdropRenderer } from './BackdropRenderer';
import { CharacterPortrait } from './CharacterPortrait';

interface VisualNovelPlayerProps {
  storyState: StoryState;
  onUpdateState: (next: StoryState) => void;
  onExitToMenu: () => void;
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

  const typingTimerRef = useRef<number | null>(null);
  const fullText = node.text;
  const isTyping = revealedCount < fullText.length;

  useEffect(() => {
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
      if (revealedCount % 3 === 0 && node.speaker !== 'narrator') {
        soundEngine.playTick();
      }
    }, 18);

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [revealedCount, fullText, node.speaker]);

  const advanceToNode = useCallback(
    (
      targetChapterId: string,
      targetNodeId: string,
      extraFlags?: Record<string, boolean>,
      extraScores?: Record<string, number>
    ) => {
      const nextFlags = { ...storyState.flags, ...(extraFlags ?? {}) };
      const nextScores = { ...storyState.scores };
      if (extraScores) {
        for (const [k, delta] of Object.entries(extraScores)) {
          nextScores[k] = (nextScores[k] ?? 0) + delta;
        }
      }

      const nextHistory = [
        ...storyState.history.slice(-49),
        { chapterId: chapter.id, nodeId: node.id, speakerName: node.speakerName, text: node.text },
      ];

      const nextState: StoryState = {
        currentChapterId: targetChapterId,
        currentNodeId: targetNodeId,
        flags: nextFlags,
        scores: nextScores,
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
    if (node.choices && node.choices.length > 0) return;

    if (node.conditionFlag && node.next) {
      const actual = Boolean(storyState.flags[node.conditionFlag.flag]);
      const target = actual === node.conditionFlag.equals ? node.next : node.conditionFlag.fallbackNext;
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
  }, [showHistory, isTyping, fullText.length, node, storyState.flags, chapter.id, chapter.nextChapterId, advanceToNode]);

  useEffect(() => {
    if (!autoPlay || isTyping || (node.choices && node.choices.length > 0)) return;
    if (node.endChapter && !chapter.nextChapterId) return;
    const t = window.setTimeout(() => handleAdvance(), 1800);
    return () => clearTimeout(t);
  }, [autoPlay, isTyping, node.choices, node.endChapter, chapter.nextChapterId, handleAdvance]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if ((e.target as HTMLElement)?.tagName === 'BUTTON') return;
        e.preventDefault();
        handleAdvance();
      } else if (e.key === 'Escape' && showHistory) {
        setShowHistory(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleAdvance, showHistory]);

  const handleSelectChoice = (choice: DialogueChoice) => {
    soundEngine.playChoice();
    advanceToNode(chapter.id, choice.next, choice.setFlags, choice.addScore);
  };

  const toggleMute = () => {
    soundEngine.muted = !isMuted;
    setIsMuted(soundEngine.muted);
  };

  const isStoryComplete = !isTyping && node.endChapter && !chapter.nextChapterId;
  const backdropInfo = BACKDROPS[node.backdrop];
  const speakerInfo = node.speaker !== 'narrator' ? CHARACTERS[node.speaker] : null;
  const displayedText = useMemo(() => fullText.slice(0, revealedCount), [fullText, revealedCount]);

  const leftChar = node.characters.find((c) => c.position === 'left');
  const centerChar = node.characters.find((c) => c.position === 'center');
  const rightChar = node.characters.find((c) => c.position === 'right');

  return (
    <div className="relative w-full min-h-[calc(100vh-65px)] flex flex-col bg-[#0e1318] select-none">
      <div className="relative flex-1 min-h-[540px] max-h-[820px] w-full overflow-hidden">
        <BackdropRenderer backdropId={node.backdrop} mood={node.mood} particles={node.particles} />

        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-4 pointer-events-none">
          <div className="pointer-events-auto bg-[#11161d]/85 backdrop-blur-sm border border-white/10 rounded-lg px-3.5 py-2 text-xs text-slate-200 flex items-center gap-2">
            <span className="font-semibold text-amber-200/95">
              Chapter {chapter.number}: {chapter.title}
            </span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-300">{backdropInfo.name}</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2 bg-[#11161d]/85 backdrop-blur-sm border border-white/10 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setAutoPlay((v) => !v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                autoPlay ? 'bg-amber-600/90 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{autoPlay ? 'Auto On' : 'Auto'}</span>
            </button>
            <button type="button" onClick={() => setShowHistory(true)} className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer">
              <History className="w-3.5 h-3.5" />
              <span>Log</span>
            </button>
            <button type="button" onClick={toggleMute} className="p-1.5 rounded-md text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer" aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button type="button" onClick={onExitToMenu} className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer">
              Chapters
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-[165px] top-14 z-10 max-w-6xl mx-auto px-6 pointer-events-none flex items-end justify-between" onClick={handleAdvance}>
          <div className="w-1/3 h-full flex items-end justify-start">
            {leftChar && (
              <CharacterPortrait
                characterId={leftChar.id}
                expression={leftChar.expression}
                isActive={leftChar.active ?? node.speaker === leftChar.id}
                isSpeaking={isTyping && node.speaker === leftChar.id}
                shakeTrigger={leftChar.shake || (node.speaker === leftChar.id && (node.shake || node.expression === 'surprised')) ? shakeCount : 0}
                className="h-[340px] sm:h-[400px] w-full max-w-[300px]"
              />
            )}
          </div>
          <div className="w-1/3 h-full flex items-end justify-center">
            {centerChar && (
              <CharacterPortrait
                characterId={centerChar.id}
                expression={centerChar.expression}
                isActive={centerChar.active ?? node.speaker === centerChar.id}
                isSpeaking={isTyping && node.speaker === centerChar.id}
                shakeTrigger={centerChar.shake || (node.speaker === centerChar.id && (node.shake || node.expression === 'surprised')) ? shakeCount : 0}
                className="h-[350px] sm:h-[410px] w-full max-w-[310px]"
              />
            )}
          </div>
          <div className="w-1/3 h-full flex items-end justify-end">
            {rightChar && (
              <CharacterPortrait
                characterId={rightChar.id}
                expression={rightChar.expression}
                isActive={rightChar.active ?? node.speaker === rightChar.id}
                isSpeaking={isTyping && node.speaker === rightChar.id}
                shakeTrigger={rightChar.shake || (node.speaker === rightChar.id && (node.shake || node.expression === 'surprised')) ? shakeCount : 0}
                flipHorizontal
                className="h-[340px] sm:h-[400px] w-full max-w-[300px]"
              />
            )}
          </div>
        </div>

        {!isTyping && node.choices && node.choices.length > 0 && (
          <div className="absolute inset-x-0 bottom-[210px] z-30 flex flex-col items-center gap-2.5 px-4">
            {node.choices.map((choice, idx) => (
              <button
                key={choice.next}
                type="button"
                onClick={() => handleSelectChoice(choice)}
                className="w-full max-w-xl text-left px-5 py-3.5 rounded-lg bg-[#141a22]/95 hover:bg-[#1e2835] border border-amber-400/35 hover:border-amber-300/80 text-slate-100 text-sm sm:text-base font-medium shadow-xl transition-all flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400"
              >
                <span>
                  <span className="text-amber-300/90 font-mono text-xs mr-2.5">0{idx + 1}.</span>
                  {choice.label}
                </span>
                <ChevronRight className="w-4 h-4 text-amber-300 shrink-0" />
              </button>
            ))}
          </div>
        )}

        <div
          onClick={handleAdvance}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAdvance(); } }}
          className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6 cursor-pointer focus-visible:outline-none"
        >
          <div className="max-w-4xl mx-auto bg-[#11161d]/92 backdrop-blur-md border border-white/15 rounded-xl p-5 sm:p-6 shadow-2xl">
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-xl sm:text-2xl font-semibold text-amber-200">{node.speakerName}</span>
                {speakerInfo && (
                  <>
                    <span aria-hidden="true" className="text-slate-500 text-xs">·</span>
                    <span className="text-xs text-slate-400">{speakerInfo.title}</span>
                  </>
                )}
              </div>
              <span className="text-xs text-slate-400 capitalize">{node.expression}</span>
            </div>
            <p className="text-slate-100 text-base sm:text-lg leading-relaxed min-h-[3.5rem]">{displayedText}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>
                {node.choices && node.choices.length > 0 && !isTyping
                  ? 'Select a response above'
                  : isStoryComplete
                  ? 'Story concluded'
                  : node.endChapter && !isTyping
                  ? 'Click to continue to next chapter'
                  : 'Click or press Space to continue'}
              </span>
              {!isTyping && !node.choices?.length && !isStoryComplete && (
                <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
                  <span>{node.endChapter ? 'Next Chapter' : 'Continue'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isStoryComplete && (
        <div className="border-t border-white/10 bg-[#141a22] px-6 py-5">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-semibold text-amber-200">
                Chronicle Complete — {storyState.flags.protected_vault && storyState.flags.spoke_for_selva ? 'Open Ledger Charter Ratified' : 'Outer Ward Audit Covenant'}
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                Standing: <span className="font-mono tabular-nums text-white">{storyState.scores.guild_standing ?? 0}</span>
                {' · '}
                Vault: {storyState.flags.protected_vault ? 'Protected' : 'Partial'}
                {' · '}
                Lockmaster: {storyState.flags.spared_lockmaster ? 'Witness Protected' : 'Detained'}
                {' · '}
                Relief: {storyState.flags.shared_relief ? 'Shared' : 'Prioritized Camp'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const first = CHAPTERS[0];
                advanceToNode(first.id, first.startNode);
                onExitToMenu();
              }}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[80vh] bg-[#141a22] border border-white/15 rounded-xl flex flex-col overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold text-slate-100">Dialogue Log</h3>
              <button type="button" onClick={() => setShowHistory(false)} className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer" aria-label="Close dialogue log">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              {storyState.history.length === 0 ? (
                <p className="text-sm text-slate-400">No lines recorded yet in this session.</p>
              ) : (
                storyState.history.map((entry, i) => (
                  <div key={`${entry.nodeId}-${i}`} className="border-b border-white/5 pb-3 last:border-0">
                    <div className="text-xs font-semibold text-amber-200/90 mb-1">{entry.speakerName}</div>
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
