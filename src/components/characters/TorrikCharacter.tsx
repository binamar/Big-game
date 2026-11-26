import React from 'react';
import { CHARACTERS } from '../../data/characters';
import { ExpressionId, ExpressionParams } from '../../types/vn';
import { CharacterHeadUnit } from './CharacterHeadUnit';
import { useCharacterIdle } from './useCharacterIdle';

export interface ModularCharacterProps {
  expression?: ExpressionId;
  customParams?: Partial<ExpressionParams>;
  isSpeaking?: boolean;
  isActive?: boolean;
  shakeTrigger?: number;
  overrideUrl?: string | null;
  flipHorizontal?: boolean;
  gazeBiasX?: number;
  className?: string;
}

export const TorrikCharacter: React.FC<ModularCharacterProps> = ({
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
  const char = CHARACTERS.torrik;
  const idle = useCharacterIdle('torrik', expression, customParams, isSpeaking, shakeTrigger, overrideUrl, gazeBiasX);
  const stroke = char.outlineColor;
  const gradId = `iris-torrik-${flipHorizontal ? 'f' : 'n'}`;
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
          <clipPath id="eye-left-torrik">
            <ellipse cx="136" cy="146" rx="13" ry={Math.max(1.5, eyeHeight / 2)} />
          </clipPath>
          <clipPath id="eye-right-torrik">
            <ellipse cx="184" cy="146" rx="13" ry={Math.max(1.5, eyeHeight / 2)} />
          </clipPath>
        </defs>

        <path d="M84 252 Q115 232 160 232 Q205 232 236 252 L256 418 L64 418 Z" fill={char.outfitPrimary} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
        <path d="M132 232 L160 278 L188 232 L182 222 L138 222 Z" fill={char.outfitSecondary} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M142 188 L142 236 Q160 244 178 236 L178 188 Z" fill={char.skinTone} stroke={stroke} strokeWidth="2.6" />
        <path d="M144 190 Q160 208 176 190 L176 204 Q160 216 144 204 Z" fill={char.skinShadow} />

        <CharacterHeadUnit
          char={char}
          idle={idle}
          gradId={gradId}
          renderFrontHair={() => (
            <g>
              <path d="M107 132 Q105 74 160 68 Q215 74 213 132 Q204 106 186 102 Q165 112 142 104 Q120 112 107 132 Z" fill={char.hairColor} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
              <path d="M126 88 Q144 82 162 86" fill="none" stroke={char.hairHighlight} strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}
        />

        {/* Bound field notebook, brass clasp & pen */}
        <path d="M126 238 L160 282 L194 238" fill="none" stroke={char.outfitAccent} strokeWidth="3.2" />
        <circle cx="160" cy="272" r="5.5" fill={char.outfitAccent} stroke={stroke} strokeWidth="2" />
        <rect x="176" y="292" width="66" height="86" rx="4" transform="rotate(-8 209 335)" fill="#6E4730" stroke={stroke} strokeWidth="2.8" />
        <rect x="184" y="298" width="52" height="74" rx="2" transform="rotate(-8 209 335)" fill="#E8DFC8" stroke={stroke} strokeWidth="1.8" />
        <rect x="176" y="292" width="66" height="86" rx="4" transform="rotate(-8 209 335)" fill="none" stroke={stroke} strokeWidth="2.8" />
        <rect x="228" y="328" width="14" height="10" rx="2" transform="rotate(-8 209 335)" fill={char.outfitAccent} stroke={stroke} strokeWidth="1.8" />
        <line x1="214" y1="296" x2="226" y2="336" stroke="#D4AF63" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M162 346 Q184 336 196 346 Q196 364 176 366 Z" fill={char.skinTone} stroke={stroke} strokeWidth="2.4" />
      </svg>
    </div>
  );
};
