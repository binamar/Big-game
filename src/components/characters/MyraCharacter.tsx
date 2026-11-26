import React from 'react';
import { CHARACTERS } from '../../data/characters';
import { CharacterHeadUnit } from './CharacterHeadUnit';
import { ModularCharacterProps } from './TorrikCharacter';
import { useCharacterIdle } from './useCharacterIdle';

export const MyraCharacter: React.FC<ModularCharacterProps> = ({
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
  const char = CHARACTERS.myra;
  const idle = useCharacterIdle('myra', expression, customParams, isSpeaking, shakeTrigger, overrideUrl, gazeBiasX);
  const stroke = char.outlineColor;
  const gradId = `iris-myra-${flipHorizontal ? 'f' : 'n'}`;
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
          <clipPath id="eye-left-myra">
            <ellipse cx="136" cy="146" rx="13" ry={Math.max(1.5, eyeHeight / 2)} />
          </clipPath>
          <clipPath id="eye-right-myra">
            <ellipse cx="184" cy="146" rx="13" ry={Math.max(1.5, eyeHeight / 2)} />
          </clipPath>
        </defs>

        {/* Back hood & auburn braid */}
        <path d="M92 140 Q88 78 160 72 Q232 78 228 140 L238 225 L82 225 Z" fill={char.outfitSecondary} stroke={stroke} strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M110 185 Q102 220 108 255 Q114 275 110 294" fill="none" stroke={char.hairColor} strokeWidth="12" strokeLinecap="round" />
        <path d="M110 185 Q102 220 108 255 Q114 275 110 294" fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="6 6" />
        <circle cx="109" cy="295" r="4.5" fill={char.outfitAccent} stroke={stroke} strokeWidth="1.5" />

        <path d="M84 252 Q115 232 160 232 Q205 232 236 252 L256 418 L64 418 Z" fill={char.outfitPrimary} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
        <path d="M132 232 L160 278 L188 232 L182 222 L138 222 Z" fill={char.outfitSecondary} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M142 188 L142 236 Q160 244 178 236 L178 188 Z" fill={char.skinTone} stroke={stroke} strokeWidth="2.6" />
        <path d="M144 190 Q160 208 176 190 L176 204 Q160 216 144 204 Z" fill={char.skinShadow} />

        <CharacterHeadUnit
          char={char}
          idle={idle}
          gradId={gradId}
          renderFaceDetails={() => (
            <g opacity="0.72">
              <circle cx="125" cy="158" r="1.3" fill={char.skinShadow} />
              <circle cx="131" cy="158" r="1.3" fill={char.skinShadow} />
              <circle cx="189" cy="158" r="1.3" fill={char.skinShadow} />
              <circle cx="195" cy="158" r="1.3" fill={char.skinShadow} />
            </g>
          )}
          renderFrontHair={() => (
            <g>
              <path d="M110 128 Q114 82 160 80 Q206 82 210 128 Q186 106 160 110 Q134 106 110 128 Z" fill={char.hairColor} stroke={stroke} strokeWidth="2.5" />
              <path d="M102 150 Q98 76 160 66 Q222 76 218 150 Q210 92 160 88 Q110 92 102 150 Z" fill={char.outfitPrimary} stroke={stroke} strokeWidth="2.8" />
            </g>
          )}
        />

        {/* Hood cowl & courier satchel */}
        <path d="M80 250 Q160 282 240 250 L248 278 Q160 310 72 278 Z" fill={char.outfitSecondary} stroke={stroke} strokeWidth="2.6" />
        <path d="M104 244 L228 386" stroke={char.outfitAccent} strokeWidth="15" strokeLinecap="round" />
        <path d="M104 244 L228 386" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        <rect x="148" y="302" width="18" height="14" rx="2" transform="rotate(42 157 309)" fill="#C9A24D" stroke={stroke} strokeWidth="2" />
        <rect x="196" y="352" width="52" height="54" rx="6" fill="#6F4B2B" stroke={stroke} strokeWidth="2.8" />
        <path d="M196 368 Q222 384 248 368" fill="none" stroke={stroke} strokeWidth="2.2" />
      </svg>
    </div>
  );
};
