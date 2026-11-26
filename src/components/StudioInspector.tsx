import React, { useState } from 'react';
import { Upload, X, Zap, MessageSquare, Users } from 'lucide-react';
import { BACKDROP_IDS, BACKDROPS, MOOD_IDS, MOOD_PALETTES } from '../data/backdrops';
import { CHARACTER_IDS, CHARACTERS, EXPRESSION_IDS, EXPRESSION_PRESETS } from '../data/characters';
import { BackdropId, CharacterId, ExpressionId, ExpressionParams, MoodId, ParticleType } from '../types/vn';
import { BackdropRenderer } from './BackdropRenderer';
import { CharacterPortrait } from './CharacterPortrait';

export const StudioInspector: React.FC = () => {
  const [tab, setTab] = useState<'characters' | 'backdrops'>('characters');
  const [selectedChar, setSelectedChar] = useState<CharacterId>('torrik');
  const [selectedExpression, setSelectedExpression] = useState<ExpressionId>('neutral');
  const [customOverrides, setCustomOverrides] = useState<Partial<ExpressionParams>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [compareSiblings, setCompareSiblings] = useState(false);
  const [portraitOverrideUrl, setPortraitOverrideUrl] = useState<string | null>(null);

  const [selectedBackdrop, setSelectedBackdrop] = useState<BackdropId>('small_guild_hall');
  const [selectedMood, setSelectedMood] = useState<MoodId>('warm');
  const [selectedParticles, setSelectedParticles] = useState<ParticleType>('dust');
  const [backdropOverrideUrl, setBackdropOverrideUrl] = useState<string | null>(null);

  const char = CHARACTERS[selectedChar];
  const mergedParams: ExpressionParams = { ...EXPRESSION_PRESETS[selectedExpression], ...customOverrides };

  const handleSelectExpression = (exp: ExpressionId) => {
    setSelectedExpression(exp);
    setCustomOverrides({});
    if (exp === 'surprised') setShakeTrigger((c) => c + 1);
  };

  const handleSelectBackdrop = (id: BackdropId) => {
    setSelectedBackdrop(id);
    setSelectedMood(BACKDROPS[id].defaultMood);
    setSelectedParticles(BACKDROPS[id].defaultParticles);
  };

  const handleUploadOverride = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string | null) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setter(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-3xl font-semibold text-slate-100">Procedural Portrait &amp; Backdrop Stage</h2>
          <p className="text-sm text-slate-400 mt-1">All 9 characters, 8 tweened expressions, and 12 layered scenes drawn entirely in code.</p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-[#161c24] border border-white/10 rounded-lg self-start">
          <button type="button" onClick={() => setTab('characters')} className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${tab === 'characters' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'}`}>
            Characters &amp; Expressions (9)
          </button>
          <button type="button" onClick={() => setTab('backdrops')} className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${tab === 'backdrops' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'}`}>
            Backdrops &amp; Moods (12)
          </button>
        </div>
      </div>

      {tab === 'characters' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-3 bg-[#141a22] border border-white/10 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-300">Cast Roster</span>
              <button type="button" onClick={() => setCompareSiblings((v) => !v)} className={`text-xs px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer ${compareSiblings ? 'bg-amber-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                <Users className="w-3.5 h-3.5" />
                <span>Siblings</span>
              </button>
            </div>
            {CHARACTER_IDS.map((id) => {
              const c = CHARACTERS[id];
              const active = !compareSiblings && selectedChar === id;
              return (
                <button key={id} type="button" onClick={() => { setCompareSiblings(false); setSelectedChar(id); }} className={`text-left px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${active ? 'bg-[#1e2632] border-amber-500/60 text-white' : 'bg-transparent border-white/5 hover:bg-white/5 text-slate-300'}`}>
                  <div className="text-sm font-semibold flex items-center justify-between">
                    <span>{c.name}</span>
                    <span className="text-[11px] text-slate-400 font-normal">{c.title}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">Accessory: {c.accessoryLabel}</div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-5 bg-[#141a22] border border-white/10 rounded-xl overflow-hidden flex flex-col">
            <div className="relative h-[430px] w-full overflow-hidden">
              <BackdropRenderer backdropId={selectedBackdrop} mood={selectedMood} particles="dust" />
              <div className="absolute inset-0 flex items-end justify-center px-6">
                {compareSiblings ? (
                  <div className="flex items-end justify-center gap-4 w-full h-full">
                    <div className="flex flex-col items-center h-[380px] w-1/2">
                      <CharacterPortrait characterId="selva" expression={selectedExpression} customParams={customOverrides} isSpeaking={isSpeaking} shakeTrigger={shakeTrigger} className="h-full w-full" />
                    </div>
                    <div className="flex flex-col items-center h-[380px] w-1/2">
                      <CharacterPortrait characterId="rowan" expression={selectedExpression} customParams={customOverrides} isSpeaking={isSpeaking} shakeTrigger={shakeTrigger} flipHorizontal className="h-full w-full" />
                    </div>
                  </div>
                ) : (
                  <CharacterPortrait characterId={selectedChar} expression={selectedExpression} customParams={customOverrides} isSpeaking={isSpeaking} shakeTrigger={shakeTrigger} overrideUrl={portraitOverrideUrl} className="h-[395px] w-full max-w-[320px]" />
                )}
              </div>
            </div>

            <div className="p-4 border-t border-white/10 space-y-3">
              {compareSiblings ? (
                <div>
                  <div className="text-base font-display font-semibold text-amber-200">Family Comparison: Selva &amp; Rowan</div>
                  <p className="text-xs text-slate-300 mt-1">Shared skin tone ({CHARACTERS.selva.skinTone}) and iris gradient ({CHARACTERS.selva.eyeColor}).</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-lg font-display font-semibold text-amber-200">{char.name}</span>
                    <span className="text-xs text-slate-400">{char.title} · {char.accessoryLabel}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{char.bio}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button type="button" onClick={() => setIsSpeaking((v) => !v)} className={`px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${isSpeaking ? 'bg-amber-600 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-200'}`}>
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isSpeaking ? 'Stop Typing Mouth' : 'Simulate Speaking'}</span>
                </button>
                <button type="button" onClick={() => setShakeTrigger((c) => c + 1)} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Shock Shake</span>
                </button>
                {!compareSiblings && (
                  <label className="px-3 py-1.5 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-200 inline-flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Test PNG Override</span>
                    <input type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={(e) => handleUploadOverride(e, setPortraitOverrideUrl)} />
                  </label>
                )}
                {portraitOverrideUrl && (
                  <button type="button" onClick={() => setPortraitOverrideUrl(null)} className="px-2.5 py-1.5 rounded-md text-xs bg-red-900/50 text-red-200 inline-flex items-center gap-1 cursor-pointer">
                    <X className="w-3 h-3" />
                    <span>Clear Override</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#141a22] border border-white/10 rounded-xl p-4 space-y-5">
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2">Preset Expressions</div>
              <div className="grid grid-cols-2 gap-2">
                {EXPRESSION_IDS.map((exp) => (
                  <button key={exp} type="button" onClick={() => handleSelectExpression(exp)} className={`px-3 py-2 rounded-lg text-xs font-medium capitalize border transition-colors cursor-pointer ${selectedExpression === exp ? 'bg-amber-600/90 border-amber-500 text-white' : 'bg-[#19202a] border-white/10 text-slate-300 hover:text-white'}`}>
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4">
              <div className="text-xs font-semibold text-slate-300">Numeric Expression Drivers</div>
              <label className="block text-xs text-slate-300">
                <div className="flex justify-between mb-1"><span>Eyebrow Angle</span><span className="font-mono tabular-nums">{mergedParams.eyebrowAngle.toFixed(0)}°</span></div>
                <input type="range" min={-22} max={22} step={1} value={mergedParams.eyebrowAngle} onChange={(e) => setCustomOverrides((p) => ({ ...p, eyebrowAngle: Number(e.target.value) }))} className="w-full accent-amber-500" />
              </label>
              <label className="block text-xs text-slate-300">
                <div className="flex justify-between mb-1"><span>Eyebrow Height</span><span className="font-mono tabular-nums">{mergedParams.eyebrowHeight.toFixed(1)}</span></div>
                <input type="range" min={-6} max={5} step={0.5} value={mergedParams.eyebrowHeight} onChange={(e) => setCustomOverrides((p) => ({ ...p, eyebrowHeight: Number(e.target.value) }))} className="w-full accent-amber-500" />
              </label>
              <label className="block text-xs text-slate-300">
                <div className="flex justify-between mb-1"><span>Eyelid Openness</span><span className="font-mono tabular-nums">{mergedParams.eyelidOpenness.toFixed(2)}</span></div>
                <input type="range" min={0.2} max={1} step={0.05} value={mergedParams.eyelidOpenness} onChange={(e) => setCustomOverrides((p) => ({ ...p, eyelidOpenness: Number(e.target.value) }))} className="w-full accent-amber-500" />
              </label>
              <label className="block text-xs text-slate-300">
                <div className="flex justify-between mb-1"><span>Mouth Curve</span><span className="font-mono tabular-nums">{mergedParams.mouthCurve.toFixed(2)}</span></div>
                <input type="range" min={-1} max={1} step={0.05} value={mergedParams.mouthCurve} onChange={(e) => setCustomOverrides((p) => ({ ...p, mouthCurve: Number(e.target.value) }))} className="w-full accent-amber-500" />
              </label>
              <label className="block text-xs text-slate-300">
                <div className="flex justify-between mb-1"><span>Mouth Openness</span><span className="font-mono tabular-nums">{mergedParams.mouthOpenness.toFixed(2)}</span></div>
                <input type="range" min={0} max={1} step={0.05} value={mergedParams.mouthOpenness} onChange={(e) => setCustomOverrides((p) => ({ ...p, mouthOpenness: Number(e.target.value) }))} className="w-full accent-amber-500" />
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-4 bg-[#141a22] border border-white/10 rounded-xl p-4 grid grid-cols-1 gap-2 max-h-[600px] overflow-y-auto">
            {BACKDROP_IDS.map((id) => {
              const b = BACKDROPS[id];
              const active = selectedBackdrop === id;
              return (
                <button key={id} type="button" onClick={() => handleSelectBackdrop(id)} className={`text-left px-3.5 py-2.5 rounded-lg border transition-colors cursor-pointer ${active ? 'bg-[#1e2632] border-amber-500/60 text-white' : 'bg-transparent border-white/5 hover:bg-white/5 text-slate-300'}`}>
                  <div className="text-sm font-semibold flex items-center justify-between gap-2">
                    <span>{b.name}</span>
                    <span className="text-[11px] text-slate-400 font-normal">{b.region}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{b.description}</div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 bg-[#141a22] border border-white/10 rounded-xl overflow-hidden flex flex-col">
            <div className="h-[420px] w-full">
              <BackdropRenderer backdropId={selectedBackdrop} mood={selectedMood} particles={selectedParticles} overrideUrl={backdropOverrideUrl} />
            </div>
            <div className="p-5 border-t border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-amber-200">{BACKDROPS[selectedBackdrop].name}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{BACKDROPS[selectedBackdrop].description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Test PNG Override</span>
                    <input type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={(e) => handleUploadOverride(e, setBackdropOverrideUrl)} />
                  </label>
                  {backdropOverrideUrl && (
                    <button type="button" onClick={() => setBackdropOverrideUrl(null)} className="px-2.5 py-1.5 rounded-md text-xs bg-red-900/50 text-red-200 inline-flex items-center gap-1 cursor-pointer">
                      <X className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2">Mood Palette</div>
                  <div className="flex flex-wrap gap-1.5">
                    {MOOD_IDS.map((m) => (
                      <button key={m} type="button" onClick={() => setSelectedMood(m)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${selectedMood === m ? 'bg-amber-600 text-white' : 'bg-[#19202a] text-slate-300 hover:text-white'}`}>
                        {MOOD_PALETTES[m].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2">Weather &amp; Natural Particles</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(['none', 'rain', 'dust', 'embers'] as ParticleType[]).map((pt) => (
                      <button key={pt} type="button" onClick={() => setSelectedParticles(pt)} className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${selectedParticles === pt ? 'bg-amber-600 text-white' : 'bg-[#19202a] text-slate-300 hover:text-white'}`}>
                        {pt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
