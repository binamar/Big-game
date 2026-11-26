import { useState } from 'react';
import { BookOpen, Play, Sliders, ShieldCheck } from 'lucide-react';
import { CHAPTERS } from './data/chapters';
import { clearStoryState, createInitialStoryState, loadStoryState, saveStoryState } from './engine/state';
import { StoryState } from './types/vn';
import { BackdropRenderer } from './components/BackdropRenderer';
import { CharacterPortrait } from './components/CharacterPortrait';
import { VisualNovelPlayer } from './components/VisualNovelPlayer';
import { StudioInspector } from './components/StudioInspector';
import { ValidatorDocsView } from './components/ValidatorDocsView';

type AppView = 'menu' | 'play' | 'studio' | 'validator';

export default function App() {
  const [view, setView] = useState<AppView>('menu');
  const [savedExists, setSavedExists] = useState<boolean>(() => Boolean(loadStoryState()));
  const [storyState, setStoryState] = useState<StoryState>(() => {
    return loadStoryState() ?? createInitialStoryState();
  });

  const handleStartNewGame = (chapterId = 'chapter_01') => {
    const targetChapter = CHAPTERS.find((c) => c.id === chapterId) ?? CHAPTERS[0];
    clearStoryState();
    const fresh = createInitialStoryState(targetChapter.id, targetChapter.startNode);
    saveStoryState(fresh);
    setStoryState(fresh);
    setSavedExists(true);
    setView('play');
  };

  const handleResume = () => {
    const loaded = loadStoryState();
    if (loaded) setStoryState(loaded);
    setView('play');
  };

  return (
    <div className="min-h-screen bg-[#0e1318] text-slate-100 flex flex-col">
      <header className="border-b border-white/10 bg-[#11161d]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => setView('menu')}
            className="font-display text-xl font-semibold tracking-tight text-amber-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            The Ledger of Ash &amp; Iron
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button type="button" onClick={() => setView('menu')} className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${view === 'menu' ? 'text-white underline underline-offset-8 decoration-amber-400' : ''}`}>
              Chapters
            </button>
            <button type="button" onClick={handleResume} className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${view === 'play' ? 'text-white underline underline-offset-8 decoration-amber-400' : ''}`}>
              Play Story
            </button>
            <button type="button" onClick={() => setView('studio')} className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${view === 'studio' ? 'text-white underline underline-offset-8 decoration-amber-400' : ''}`}>
              Portrait &amp; Scene Stage
            </button>
            <button type="button" onClick={() => setView('validator')} className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${view === 'validator' ? 'text-white underline underline-offset-8 decoration-amber-400' : ''}`}>
              Validator &amp; Bible
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleStartNewGame('chapter_01')}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              New Audit
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {view === 'menu' && (
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
            <section className="relative rounded-2xl overflow-hidden border border-white/10 min-h-[420px] grid grid-cols-1 lg:grid-cols-12 items-stretch bg-[#141a22]">
              <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between z-10 bg-gradient-to-r from-[#11161d] via-[#11161d]/95 to-[#11161d]/80">
                <div className="space-y-4">
                  <div className="text-xs text-slate-400">
                    Ten-Chapter Chronicle · Godot 4.7 GDScript Source + Interactive Preview
                  </div>
                  <h1 className="font-display text-4xl sm:text-5xl font-semibold text-slate-100 leading-[1.1] max-w-xl">
                    Count every cart of iron before winter closes the pass.
                  </h1>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
                    Play all ten chapters directly from res://data/chapters/, inspect all nine code-drawn characters and twelve backdrops, or open project.godot in Godot 4.7.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-6">
                  {savedExists ? (
                    <button type="button" onClick={handleResume} className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer">
                      <Play className="w-4 h-4" />
                      <span>Continue Story</span>
                    </button>
                  ) : (
                    <button type="button" onClick={() => handleStartNewGame('chapter_01')} className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer">
                      <Play className="w-4 h-4" />
                      <span>Start Chapter 1</span>
                    </button>
                  )}

                  <button type="button" onClick={() => setView('studio')} className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer">
                    <Sliders className="w-4 h-4" />
                    <span>Inspect Cast &amp; Scenes</span>
                  </button>

                  <button type="button" onClick={() => setView('validator')} className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Chapter Validator</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 relative min-h-[300px] overflow-hidden">
                <BackdropRenderer backdropId="blacksmith_workshop" mood="tense" particles="embers" />
                <div className="absolute inset-0 flex items-end justify-center gap-2 px-4 pointer-events-none">
                  <CharacterPortrait characterId="torrik" expression="determined" className="h-[310px] w-1/2 max-w-[230px]" />
                  <CharacterPortrait characterId="orsen" expression="neutral" flipHorizontal className="h-[320px] w-1/2 max-w-[235px]" />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-100">All 10 Chapters</h2>
                <span className="text-xs text-slate-400">10 chapters · Branching flags &amp; final charter ending</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {CHAPTERS.map((ch) => {
                  const firstNode = ch.nodes[ch.startNode];
                  return (
                    <div key={ch.id} className="bg-[#141a22] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="h-32 relative overflow-hidden">
                          <BackdropRenderer backdropId={firstNode.backdrop} mood={firstNode.mood} particles="none" />
                        </div>
                        <div className="p-4">
                          <div className="text-xs text-amber-300/90 font-medium">Chapter {ch.number} · {ch.subtitle}</div>
                          <h3 className="font-display text-xl font-semibold text-slate-100 mt-1">{ch.title}</h3>
                          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{ch.summary}</p>
                        </div>
                      </div>
                      <div className="px-4 pb-4">
                        <button type="button" onClick={() => handleStartNewGame(ch.id)} className="w-full px-3.5 py-2 rounded-lg bg-[#1d2530] hover:bg-amber-600 text-slate-100 text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Play Chapter {ch.number}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {view === 'play' && (
          <VisualNovelPlayer storyState={storyState} onUpdateState={setStoryState} onExitToMenu={() => setView('menu')} />
        )}

        {view === 'studio' && <StudioInspector />}

        {view === 'validator' && <ValidatorDocsView />}
      </main>
    </div>
  );
}
