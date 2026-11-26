import React from 'react';
import { CHARACTERS } from '../../data/characters';
import { CharacterHeadUnit } from './CharacterHeadUnit';
import { ModularCharacterProps } from './TorrikCharacter';
import { useCharacterIdle } from './useCharacterIdle';

export const OrsenCharacter: React.FC<ModularCharacterProps> = ({
  expression = 'neutral',
  customParams,
  isSpeaking = false,
  isActive = true,
  shakeTrigger = 0,
  overrideUrl = null,
  flipHorizontal = false,
  gazeBiasX = 0,
  className = '',
}) => {
  const char = CHARACTERS.orsen;
  const idle = useCharacterIdle('orsen', expression, customParams, isSpeaking, shakeTrigger, overrideUrl, gazeBiasX);
  const stroke = char.outlineColor;
  const gradId = `iris-orsen-${flipHorizontal ? 'f' : 'n'}`;
  const eyeHeight = 14 * Math.max(0.04, idle.params.eyelidOpenness * idle.blinkOpen);

  if (idle.overrideSrc) {
    return (
      <div
        className={`relative select-none flex items-end justify-center transition-all duration-200 ${
          isActive ? 'opacity-100 brightness-100 scale-100' : 'opacity-80 brightness-75 scale-[0.96]'
        } ${className}`}
        style={{
          transform: `translate3d(${idle.shakeX}px, ${idle.bobY}px, 0) ${flipHorizontal ? 'scaleX(-1)' : ''}`,
        }}
      >
        <img src={idle.overrideSrc} alt={`${char.name} (${expression})`} className="max-h-full max-w-full object-contain drop-shadow-2xl" referrerPolicy="no-referrer" />
      </div>
    );
  }

  return (
    <div
      className={`relative select-none flex items-end justify-center transition-all duration-200 ${
        isActive ? 'opacity-100 brightness-100 scale-100' : 'opacity-80 brightness-75 scale-[0.96]'
      } ${className}`}
      style={{ transform: `translate3d(${idle.shakeX}px, ${idle.bobY}px, 0)` }}
    >
      <svg
        viewBox="0 0 320 420"
        className="w-full h-full max-h-full overflow-visible drop-shadow-[0_14px_24px_rgba(0,0,0,0.48)]"
        role="img"
        aria-label={`${char.name} (${expression})`}
        style={flipHorizontal ? { transform: 'scaleX(-1)' } : undefined}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={char.eyeColor} />
            <stop offset="100%" stopColor={char.eyeSecondary} />
          </linearGradient>
          <clipPath id="eye-left-orsen">
            <ellipse cx="136" cy="146" rx="13" ry={Math.max(1.5, eyeHeight / 2)} />
          </clipPath>
          <clipPath id="eye-right-orsen">
            <ellipse cx="184" cy="146" rx="13" ry={Math.max(1.5, eyeHeight / 2)} />
          </clipPath>
        </defs>

        {/* Broader blacksmith shoulders */}
        <path d="M74 252 Q112 230 160 230 Q208 230 246 252 L264 418 L56 418 Z" fill={char.outfitPrimary} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
        <path d="M132 230 L160 274 L188 230 L182 220 L138 220 Z" fill={char.outfitSecondary} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M140 188 L140 236 Q160 244 180 236 L180 188 Z" fill={char.skinTone} stroke={stroke} strokeWidth="2.6" />
        <path d="M142 190 Q160 208 178 190 L178 204 Q160 216 142 204 Z" fill={char.skinShadow} />

        <CharacterHeadUnit
          char={char}
          idle={idle}
          gradId={gradId}
          renderFaceDetails={() => (
            <g>
              <line x1="126" y1="174" x2="142" y2="191" stroke={char.skinShadow} strokeWidth="2.2" strokeLinecap="round" opacity="0.4" />
              <line x1="194" y1="174" x2="178" y2="191" stroke={char.skinShadow} strokeWidth="2.2" strokeLinecap="round" opacity="0.4" />
              <circle cx="190" cy="162" r="3.4" fill="#2A2624" opacity="0.22" />
            </g>
          )}
          renderFrontHair={() => (
            <path d="M109 124 Q112 76 160 72 Q208 76 211 124 Q198 100 160 98 Q122 100 109 124 Z" fill={char.hairColor} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
          )}
        />

        {/* Soot-stained leather apron, brass rivets & forge tongs */}
        <path d="M114 238 L110 295" stroke={char.outfitAccent} strokeWidth="12" strokeLinecap="round" />
        <path d="M206 238 L210 295" stroke={char.outfitAccent} strokeWidth="12" strokeLinecap="round" />
        <path d="M114 238 L110 295" stroke={stroke} strokeWidth="2.4" />
        <path d="M206 238 L210 295" stroke={stroke} strokeWidth="2.4" />
        <path d="M98 286 L222 286 L236 418 L84 418 Z" fill={char.outfitAccent} stroke={stroke} strokeWidth="2.8" strokeLinejoin="round" />
        <circle cx="110" cy="296" r="3.5" fill="#C7A463" stroke={stroke} strokeWidth="1.5" />
        <circle cx="210" cy="296" r="3.5" fill="#C7A463" stroke={stroke} strokeWidth="1.5" />
        <rect x="132" y="318" width="56" height="36" rx="3" fill="#5D3724" stroke={stroke} strokeWidth="2.2" />
        <line x1="148" y1="294" x2="154" y2="336" stroke="#6E7780" strokeWidth="4.2" strokeLinecap="round" />
        <line x1="160" y1="294" x2="156" y2="336" stroke="#586068" strokeWidth="4.2" strokeLinecap="round" />
      </svg>
    </div>
  );
};
