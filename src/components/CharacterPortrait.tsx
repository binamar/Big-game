import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CHARACTERS, EXPRESSION_PRESETS } from '../data/characters';
import { CharacterId, ExpressionId, ExpressionParams } from '../types/vn';

interface CharacterPortraitProps {
  characterId: CharacterId;
  expression?: ExpressionId;
  customParams?: Partial<ExpressionParams>;
  isSpeaking?: boolean;
  isActive?: boolean;
  shakeTrigger?: number;
  overrideUrl?: string | null;
  flipHorizontal?: boolean;
  className?: string;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  characterId,
  expression = 'neutral',
  customParams,
  isSpeaking = false,
  isActive = true,
  shakeTrigger = 0,
  overrideUrl = null,
  flipHorizontal = false,
  className = '',
}) => {
  const char = CHARACTERS[characterId];
  const targetParams: ExpressionParams = useMemo(() => {
    const base = EXPRESSION_PRESETS[expression] ?? EXPRESSION_PRESETS.neutral;
    return { ...base, ...customParams };
  }, [expression, customParams]);

  const [currentParams, setCurrentParams] = useState<ExpressionParams>(targetParams);
  const currentRef = useRef<ExpressionParams>(targetParams);

  const [blinkOpen, setBlinkOpen] = useState<number>(1);
  const [speakMouthDelta, setSpeakMouthDelta] = useState<number>(0);
  const [swayOffset, setSwayOffset] = useState<{ y: number; rot: number }>({ y: 0, rot: 0 });
  const [shakeX, setShakeX] = useState<number>(0);
  const [autoOverrideSrc, setAutoOverrideSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setAutoOverrideSrc(null);
    const candidate = `/assets/portraits/${characterId}_${expression}.png`;
    fetch(candidate, { method: 'HEAD' })
      .then((res) => {
        if (cancelled) return;
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.startsWith('image/')) {
          setAutoOverrideSrc(candidate);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [characterId, expression]);

  useEffect(() => {
    const from = { ...currentRef.current };
    const to = targetParams;
    const duration = 200;
    const start = performance.now();
    let rafId = 0;

    const step = (now: number) => {
      const rawT = Math.min(1, (now - start) / duration);
      const t = easeOutCubic(rawT);
      const next: ExpressionParams = {
        eyebrowAngle: lerp(from.eyebrowAngle, to.eyebrowAngle, t),
        eyebrowHeight: lerp(from.eyebrowHeight, to.eyebrowHeight, t),
        eyelidOpenness: lerp(from.eyelidOpenness, to.eyelidOpenness, t),
        pupilOffsetX: lerp(from.pupilOffsetX, to.pupilOffsetX, t),
        pupilOffsetY: lerp(from.pupilOffsetY, to.pupilOffsetY, t),
        mouthCurve: lerp(from.mouthCurve, to.mouthCurve, t),
        mouthOpenness: lerp(from.mouthOpenness, to.mouthOpenness, t),
        tear: rawT > 0.5 ? to.tear : from.tear,
        sweatDrop: rawT > 0.5 ? to.sweatDrop : from.sweatDrop,
      };
      currentRef.current = next;
      setCurrentParams(next);
      if (rawT < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [targetParams]);

  useEffect(() => {
    let timeoutId: number;
    let blinkRaf: number;
    let cancelled = false;

    const scheduleBlink = () => {
      const delay = 2600 + Math.random() * 2800;
      timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        const blinkStart = performance.now();
        const blinkDur = 150;
        const runBlink = (now: number) => {
          if (cancelled) return;
          const p = (now - blinkStart) / blinkDur;
          if (p >= 1) {
            setBlinkOpen(1);
            scheduleBlink();
            return;
          }
          const open = p < 0.5 ? 1 - p * 2 : (p - 0.5) * 2;
          setBlinkOpen(Math.max(0.05, open));
          blinkRaf = requestAnimationFrame(runBlink);
        };
        blinkRaf = requestAnimationFrame(runBlink);
      }, delay);
    };

    scheduleBlink();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      cancelAnimationFrame(blinkRaf);
    };
  }, []);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let rafId = 0;
    const phase = (characterId.charCodeAt(0) % 7) * 0.9;
    const tick = (now: number) => {
      const t = now * 0.0014 + phase;
      setSwayOffset({
        y: Math.sin(t) * 2.2,
        rot: Math.sin(t * 0.65) * 0.55,
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [characterId]);

  useEffect(() => {
    if (!isSpeaking) {
      setSpeakMouthDelta(0);
      return;
    }
    let rafId = 0;
    const tick = (now: number) => {
      const v = Math.abs(Math.sin(now * 0.018)) * 0.48 + Math.abs(Math.sin(now * 0.031)) * 0.18;
      setSpeakMouthDelta(v);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isSpeaking]);

  useEffect(() => {
    if (!shakeTrigger) return;
    const start = performance.now();
    const duration = 360;
    let rafId = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed >= duration) {
        setShakeX(0);
        return;
      }
      const decay = 1 - elapsed / duration;
      setShakeX(Math.sin(elapsed * 0.09) * 10 * decay);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [shakeTrigger]);

  const activeOverride = overrideUrl || autoOverrideSrc;

  if (activeOverride) {
    return (
      <div
        className={`relative select-none flex items-end justify-center transition-all duration-200 ${
          isActive ? 'opacity-100 brightness-100 scale-100' : 'opacity-80 brightness-75 scale-[0.97]'
        } ${className}`}
        style={{
          transform: `translate3d(${shakeX}px, ${swayOffset.y}px, 0) rotate(${swayOffset.rot}deg) ${
            flipHorizontal ? 'scaleX(-1)' : ''
          }`,
        }}
      >
        <img
          src={activeOverride}
          alt={`${char.name} (${expression})`}
          className="max-h-full max-w-full object-contain drop-shadow-2xl"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  const effectiveOpenness = Math.max(0.04, currentParams.eyelidOpenness * blinkOpen);
  const eyeHeight = 14 * effectiveOpenness;
  const mouthOpen = Math.min(1, currentParams.mouthOpenness + speakMouthDelta);
  const curveOffset = currentParams.mouthCurve * 7;
  const stroke = char.outlineColor;
  const gradId = `iris-${char.id}-${flipHorizontal ? 'f' : 'n'}`;
  const skinShadowId = `skin-${char.id}`;

  return (
    <div
      className={`relative select-none flex items-end justify-center transition-all duration-200 ${
        isActive ? 'opacity-100 brightness-100 scale-100' : 'opacity-80 brightness-75 scale-[0.97]'
      } ${className}`}
      style={{
        transform: `translate3d(${shakeX}px, ${swayOffset.y}px, 0) rotate(${swayOffset.rot}deg)`,
      }}
    >
      <svg
        viewBox="0 0 320 420"
        className="w-full h-full max-h-full overflow-visible drop-shadow-[0_14px_24px_rgba(0,0,0,0.45)]"
        role="img"
        aria-label={`${char.name} portrait, ${expression} expression`}
        style={flipHorizontal ? { transform: 'scaleX(-1)' } : undefined}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={char.eyeColor} />
            <stop offset="100%" stopColor={char.eyeSecondary} />
          </linearGradient>
          <linearGradient id={skinShadowId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={char.skinShadow} />
            <stop offset="100%" stopColor={char.skinTone} />
          </linearGradient>
          <clipPath id={`eye-left-${char.id}`}>
            <ellipse cx="136" cy="146" rx="13" ry={Math.max(1.5, eyeHeight / 2)} />
          </clipPath>
          <clipPath id={`eye-right-${char.id}`}>
            <ellipse cx="184" cy="146" rx="13" ry={Math.max(1.5, eyeHeight / 2)} />
          </clipPath>
        </defs>

        {char.hairStyle === 'long_straight' && (
          <path d="M100 105 Q92 200 84 310 L236 310 Q228 200 220 105 Z" fill={char.hairColor} stroke={stroke} strokeWidth="2.8" strokeLinejoin="round" />
        )}
        {char.hairStyle === 'braided_hood' && (
          <>
            <path d="M92 140 Q88 78 160 72 Q232 78 228 140 L238 225 L82 225 Z" fill={char.outfitSecondary} stroke={stroke} strokeWidth="2.8" strokeLinejoin="round" />
            <path d="M110 185 Q102 220 108 255 Q114 275 110 290" fill="none" stroke={char.hairColor} strokeWidth="12" strokeLinecap="round" />
            <path d="M110 185 Q102 220 108 255 Q114 275 110 290" fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="6 6" />
          </>
        )}
        {char.accessory === 'beard_cape' && (
          <path d="M72 245 Q60 320 55 415 L265 415 Q260 320 248 245 Z" fill={char.outfitAccent} stroke={stroke} strokeWidth="2.8" strokeLinejoin="round" />
        )}
        {char.accessory === 'flashy_cloak' && (
          <path d="M66 235 Q45 310 42 415 L278 415 Q275 310 254 235 Z" fill={char.outfitPrimary} stroke={stroke} strokeWidth="2.8" strokeLinejoin="round" />
        )}
        {char.accessory === 'oversized_cloak' && (
          <path d="M74 220 Q46 300 44 415 L276 415 Q274 300 246 220 Z" fill={char.outfitSecondary} stroke={stroke} strokeWidth="2.8" />
        )}

        <path d="M84 252 Q115 232 160 232 Q205 232 236 252 L256 415 L64 415 Z" fill={char.outfitPrimary} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
        <path d="M132 232 L160 278 L188 232 L182 222 L138 222 Z" fill={char.outfitSecondary} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M142 186 L142 235 Q160 243 178 235 L178 186 Z" fill={char.skinTone} stroke={stroke} strokeWidth="2.6" />
        <path d="M144 188 Q160 206 176 188 L176 202 Q160 214 144 202 Z" fill={char.skinShadow} />

        <path
          d={
            char.gaunt
              ? 'M112 118 Q112 78 160 78 Q208 78 208 118 L204 162 Q196 196 160 204 Q124 196 116 162 Z'
              : 'M110 120 Q110 78 160 78 Q210 78 210 120 L206 160 Q196 196 160 202 Q124 196 114 160 Z'
          }
          fill={char.skinTone}
          stroke={stroke}
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        <path d="M111 140 Q103 142 104 154 Q106 162 114 162" fill={char.skinTone} stroke={stroke} strokeWidth="2.4" />
        <path d="M209 140 Q217 142 216 154 Q214 162 206 162" fill={char.skinTone} stroke={stroke} strokeWidth="2.4" />

        {char.gaunt && (
          <g opacity="0.55">
            <path d="M122 158 Q128 172 135 178" fill="none" stroke={char.skinShadow} strokeWidth="2.4" strokeLinecap="round" />
            <path d="M198 158 Q192 172 185 178" fill="none" stroke={char.skinShadow} strokeWidth="2.4" strokeLinecap="round" />
            <path d="M124 157 Q136 161 146 157" fill="none" stroke={char.skinShadow} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M174 157 Q184 161 196 157" fill="none" stroke={char.skinShadow} strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )}

        <g>
          <ellipse cx="136" cy="146" rx="13" ry={Math.max(1.5, eyeHeight / 2)} fill="#F8F9FA" />
          <g clipPath={`url(#eye-left-${char.id})`}>
            <circle cx={136 + currentParams.pupilOffsetX} cy={146 + currentParams.pupilOffsetY} r="7.4" fill={`url(#${gradId})`} stroke={stroke} strokeWidth="1.4" />
            <circle cx={136 + currentParams.pupilOffsetX} cy={146 + currentParams.pupilOffsetY} r="3.2" fill="#17191E" />
            <circle cx={133.5 + currentParams.pupilOffsetX * 0.6} cy={143 + currentParams.pupilOffsetY * 0.6} r="2.1" fill="#FFFFFF" />
            <circle cx={139 + currentParams.pupilOffsetX * 0.6} cy={149 + currentParams.pupilOffsetY * 0.6} r="1.1" fill="#FFFFFF" opacity="0.85" />
          </g>
          <path d={`M122 ${146 - eyeHeight * 0.15} Q136 ${146 - eyeHeight * 0.68} 150 ${146 - eyeHeight * 0.1}`} fill="none" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" />
          <path d={`M125 ${146 + eyeHeight * 0.36} Q136 ${146 + eyeHeight * 0.56} 147 ${146 + eyeHeight * 0.36}`} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
        </g>

        <g>
          <ellipse cx="184" cy="146" rx="13" ry={Math.max(1.5, eyeHeight / 2)} fill="#F8F9FA" />
          <g clipPath={`url(#eye-right-${char.id})`}>
            <circle cx={184 + currentParams.pupilOffsetX} cy={146 + currentParams.pupilOffsetY} r="7.4" fill={`url(#${gradId})`} stroke={stroke} strokeWidth="1.4" />
            <circle cx={184 + currentParams.pupilOffsetX} cy={146 + currentParams.pupilOffsetY} r="3.2" fill="#17191E" />
            <circle cx={181.5 + currentParams.pupilOffsetX * 0.6} cy={143 + currentParams.pupilOffsetY * 0.6} r="2.1" fill="#FFFFFF" />
            <circle cx={187 + currentParams.pupilOffsetX * 0.6} cy={149 + currentParams.pupilOffsetY * 0.6} r="1.1" fill="#FFFFFF" opacity="0.85" />
          </g>
          <path d={`M170 ${146 - eyeHeight * 0.1} Q184 ${146 - eyeHeight * 0.68} 198 ${146 - eyeHeight * 0.15}`} fill="none" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" />
          <path d={`M173 ${146 + eyeHeight * 0.36} Q184 ${146 + eyeHeight * 0.56} 195 ${146 + eyeHeight * 0.36}`} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
        </g>

        <g transform={`translate(136, ${130 + currentParams.eyebrowHeight}) rotate(${-currentParams.eyebrowAngle})`}>
          <path d="M-13 0 Q0 -3 13 0" fill="none" stroke={stroke} strokeWidth="3.1" strokeLinecap="round" />
        </g>
        <g transform={`translate(184, ${130 + currentParams.eyebrowHeight}) rotate(${currentParams.eyebrowAngle})`}>
          <path d="M-13 0 Q0 -3 13 0" fill="none" stroke={stroke} strokeWidth="3.1" strokeLinecap="round" />
        </g>

        <path d="M160 151 L157 164 L163 165" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />

        {mouthOpen > 0.12 ? (
          <path d={`M147 177 Q160 ${177 + curveOffset * 0.6} 173 177 Q160 ${179 + mouthOpen * 14} 147 177 Z`} fill="#6D3439" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
        ) : (
          <path d={`M147 178 Q160 ${178 + curveOffset} 173 178`} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
        )}

        {char.hasBeard && (
          <g>
            <path d="M118 164 Q122 198 140 214 Q160 225 180 214 Q198 198 202 164 Q192 176 178 172 Q160 166 142 172 Q128 176 118 164 Z" fill={char.hairColor} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
            {mouthOpen > 0.12 ? (
              <path d={`M149 178 Q160 ${178 + curveOffset * 0.5} 171 178 Q160 ${180 + mouthOpen * 11} 149 178 Z`} fill="#6D3439" stroke={stroke} strokeWidth="2" />
            ) : (
              <path d={`M149 179 Q160 ${179 + curveOffset * 0.7} 171 179`} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
            )}
          </g>
        )}

        {currentParams.tear && <path d="M126 155 Q122 163 126 167 Q130 163 126 155 Z" fill="#BFE3F7" stroke={stroke} strokeWidth="1.5" />}
        {currentParams.sweatDrop && <path d="M201 124 Q196 135 201 140 Q206 135 201 124 Z" fill="#CFEAF9" stroke={stroke} strokeWidth="1.6" />}

        {char.hairStyle === 'cropped_parted' && <path d="M107 132 Q105 74 160 68 Q215 74 213 132 Q204 106 186 102 Q165 112 142 104 Q120 112 107 132 Z" fill={char.hairColor} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />}
        {char.hairStyle === 'short_buzz' && <path d="M109 124 Q112 76 160 72 Q208 76 211 124 Q198 100 160 98 Q122 100 109 124 Z" fill={char.hairColor} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />}
        {char.hairStyle === 'braided_hood' && (
          <>
            <path d="M110 128 Q114 82 160 80 Q206 82 210 128 Q186 106 160 110 Q134 106 110 128 Z" fill={char.hairColor} stroke={stroke} strokeWidth="2.5" />
            <path d="M102 150 Q98 76 160 66 Q222 76 218 150 Q210 92 160 88 Q110 92 102 150 Z" fill={char.outfitPrimary} stroke={stroke} strokeWidth="2.8" />
          </>
        )}
        {char.hairStyle === 'swept_veteran' && <path d="M106 130 Q104 72 160 66 Q216 72 214 130 Q200 102 174 96 Q152 106 126 98 Q114 110 106 130 Z" fill={char.hairColor} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />}
        {char.hairStyle === 'long_straight' && <path d="M104 148 Q106 72 160 68 Q214 72 216 148 Q206 102 176 102 Q160 114 144 102 Q114 102 104 148 Z" fill={char.hairColor} stroke={stroke} strokeWidth="2.6" />}
        {char.hairStyle === 'styled_wave' && <path d="M106 132 Q102 68 164 64 Q218 70 214 130 Q200 100 176 96 Q152 114 128 100 Q114 112 106 132 Z" fill={char.hairColor} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />}
        {char.hairStyle === 'slicked_streaked' && (
          <g>
            <path d="M107 132 Q106 72 160 66 Q214 72 213 132 Q204 98 160 94 Q116 98 107 132 Z" fill={char.hairColor} stroke={stroke} strokeWidth="2.6" />
            <path d="M122 86 Q130 94 126 108" fill="none" stroke={char.hairHighlight} strokeWidth="4" strokeLinecap="round" />
            <path d="M198 86 Q190 94 194 108" fill="none" stroke={char.hairHighlight} strokeWidth="4" strokeLinecap="round" />
          </g>
        )}
        {char.hairStyle === 'tucked_scarf' && (
          <g>
            <path d="M112 132 Q122 100 160 102 Q198 100 208 132 Q188 112 160 114 Q132 112 112 132 Z" fill={char.hairColor} stroke={stroke} strokeWidth="2.4" />
            <path d="M100 165 Q96 72 160 66 Q224 72 220 165 Q214 104 160 96 Q106 104 100 165 Z" fill={char.outfitAccent} stroke={stroke} strokeWidth="2.8" strokeLinejoin="round" />
            <path d="M100 156 Q96 225 112 275 L208 275 Q224 225 220 156 Q214 195 160 222 Q106 195 100 156 Z" fill="#35485E" stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M106 120 Q160 90 214 120" fill="none" stroke="#E6C994" strokeWidth="2.4" strokeDasharray="6 4" />
          </g>
        )}
        {char.hairStyle === 'tousled_gaunt' && <path d="M104 136 Q100 84 128 72 Q158 58 190 74 Q218 82 214 136 Q198 106 180 114 Q162 96 144 114 Q124 104 104 136 Z" fill={char.hairColor} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />}

        {char.accessory === 'notebook' && (
          <g>
            <path d="M126 238 L160 282 L194 238" fill="none" stroke={char.outfitAccent} strokeWidth="3.2" />
            <rect x="176" y="292" width="66" height="86" rx="4" transform="rotate(-8 209 335)" fill="#6E4730" stroke={stroke} strokeWidth="2.8" />
            <rect x="184" y="298" width="52" height="74" rx="2" transform="rotate(-8 209 335)" fill="#E8DFC8" stroke={stroke} strokeWidth="1.8" />
            <rect x="176" y="292" width="66" height="86" rx="4" transform="rotate(-8 209 335)" fill="#6E4730" stroke={stroke} strokeWidth="2.8" />
            <rect x="228" y="328" width="14" height="10" rx="2" transform="rotate(-8 209 335)" fill={char.outfitAccent} stroke={stroke} strokeWidth="1.8" />
            <path d="M162 346 Q184 336 196 346 Q196 364 176 366 Z" fill={char.skinTone} stroke={stroke} strokeWidth="2.4" />
          </g>
        )}
        {char.accessory === 'apron' && (
          <g>
            <path d="M114 238 L110 295" stroke={char.outfitAccent} strokeWidth="12" strokeLinecap="round" />
            <path d="M206 238 L210 295" stroke={char.outfitAccent} strokeWidth="12" strokeLinecap="round" />
            <path d="M114 238 L110 295" stroke={stroke} strokeWidth="2.4" />
            <path d="M206 238 L210 295" stroke={stroke} strokeWidth="2.4" />
            <path d="M98 286 L222 286 L236 415 L84 415 Z" fill={char.outfitAccent} stroke={stroke} strokeWidth="2.8" strokeLinejoin="round" />
            <circle cx="110" cy="296" r="3.5" fill="#C7A463" stroke={stroke} strokeWidth="1.5" />
            <circle cx="210" cy="296" r="3.5" fill="#C7A463" stroke={stroke} strokeWidth="1.5" />
            <rect x="132" y="318" width="56" height="36" rx="3" fill="#5D3724" stroke={stroke} strokeWidth="2.2" />
          </g>
        )}
        {char.accessory === 'satchel_hood' && (
          <g>
            <path d="M80 250 Q160 282 240 250 L248 278 Q160 310 72 278 Z" fill={char.outfitSecondary} stroke={stroke} strokeWidth="2.6" />
            <path d="M104 244 L228 386" stroke={char.outfitAccent} strokeWidth="15" strokeLinecap="round" />
            <path d="M104 244 L228 386" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
            <rect x="148" y="302" width="18" height="14" rx="2" transform="rotate(42 157 309)" fill="#C9A24D" stroke={stroke} strokeWidth="2" />
            <rect x="196" y="352" width="52" height="54" rx="6" fill="#6F4B2B" stroke={stroke} strokeWidth="2.8" />
            <path d="M196 368 Q222 384 248 368" fill="none" stroke={stroke} strokeWidth="2.2" />
          </g>
        )}
        {char.accessory === 'beard_cape' && (
          <g>
            <path d="M78 248 Q160 284 242 248 L252 288 Q160 322 68 288 Z" fill={char.outfitSecondary} stroke={stroke} strokeWidth="2.8" />
            <circle cx="122" cy="264" r="8" fill="#B59B62" stroke={stroke} strokeWidth="2.2" />
            <circle cx="198" cy="264" r="8" fill="#B59B62" stroke={stroke} strokeWidth="2.2" />
            <path d="M130 264 Q160 278 190 264" fill="none" stroke="#B59B62" strokeWidth="3.5" />
          </g>
        )}
        {char.accessory === 'oversized_cloak' && (
          <g>
            <path d="M74 234 Q160 260 246 234 L274 415 L46 415 Z" fill={char.outfitPrimary} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
            <path d="M110 218 Q160 248 210 218 L222 256 Q160 286 98 256 Z" fill={char.outfitSecondary} stroke={stroke} strokeWidth="2.6" />
            <path d="M160 268 L160 415" stroke={stroke} strokeWidth="2.4" opacity="0.6" />
          </g>
        )}
        {char.accessory === 'flashy_cloak' && (
          <g>
            <path d="M132 232 L160 306 L188 232 Z" fill="#E9E0CE" stroke={stroke} strokeWidth="2.4" />
            <path d="M72 242 Q120 232 146 286 L128 415 L52 415 Z" fill={char.outfitPrimary} stroke={stroke} strokeWidth="2.8" />
            <path d="M248 242 Q200 232 174 286 L192 415 L268 415 Z" fill={char.outfitPrimary} stroke={stroke} strokeWidth="2.8" />
            <path d="M144 286 L128 415" stroke={char.outfitAccent} strokeWidth="4.5" />
            <path d="M176 286 L192 415" stroke={char.outfitAccent} strokeWidth="4.5" />
            <polygon points="160,248 170,258 160,268 150,258" fill={char.outfitAccent} stroke={stroke} strokeWidth="2.2" />
          </g>
        )}
        {char.accessory === 'long_coat' && (
          <g>
            <path d="M124 214 L132 256 L188 256 L196 214 L178 228 L142 228 Z" fill={char.outfitSecondary} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M132 256 L160 310 L188 256" fill="none" stroke={stroke} strokeWidth="2.6" />
            <line x1="160" y1="310" x2="160" y2="415" stroke={stroke} strokeWidth="2.4" />
            <circle cx="144" cy="316" r="4" fill={char.outfitAccent} stroke={stroke} strokeWidth="1.6" />
            <circle cx="176" cy="316" r="4" fill={char.outfitAccent} stroke={stroke} strokeWidth="1.6" />
            <circle cx="144" cy="354" r="4" fill={char.outfitAccent} stroke={stroke} strokeWidth="1.6" />
            <circle cx="176" cy="354" r="4" fill={char.outfitAccent} stroke={stroke} strokeWidth="1.6" />
          </g>
        )}
        {char.accessory === 'pierced_shield' && (
          <g>
            <path d="M116 244 L218 358" stroke="#594333" strokeWidth="10" strokeLinecap="round" />
            <path d="M116 244 L218 358" stroke={stroke} strokeWidth="2.2" />
            <g transform="translate(182, 266)">
              <path d="M12 10 L108 10 L104 92 Q92 138 60 152 Q28 138 16 92 Z" fill="#5A4534" stroke={char.outfitAccent} strokeWidth="7" strokeLinejoin="round" />
              <path d="M12 10 L108 10 L104 92 Q92 138 60 152 Q28 138 16 92 Z" fill="none" stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
              <line x1="40" y1="14" x2="40" y2="136" stroke={stroke} strokeWidth="1.5" opacity="0.45" />
              <line x1="80" y1="14" x2="80" y2="136" stroke={stroke} strokeWidth="1.5" opacity="0.45" />
              <circle cx="60" cy="74" r="15" fill={char.outfitAccent} stroke={stroke} strokeWidth="2.5" />
              <polygon points="84,36 105,32 95,52 80,45" fill="#181A1F" stroke={stroke} strokeWidth="2" />
              <path d="M90 42 L114 26" stroke="#899299" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M90 42 L114 26" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
