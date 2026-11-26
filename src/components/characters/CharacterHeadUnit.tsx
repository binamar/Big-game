import React from 'react';
import { CharacterData } from '../../types/vn';
import { CharacterIdleState } from './useCharacterIdle';

interface CharacterHeadUnitProps {
  char: CharacterData;
  idle: CharacterIdleState;
  gradId: string;
  renderFaceDetails?: () => React.ReactNode;
  renderFrontHair: () => React.ReactNode;
}

export const CharacterHeadUnit: React.FC<CharacterHeadUnitProps> = ({
  char,
  idle,
  gradId,
  renderFaceDetails,
  renderFrontHair,
}) => {
  const { params, blinkOpen, speakMouthDelta, headTurnX, headTiltDeg, lookX, lookY } = idle;
  const stroke = char.outlineColor;
  const effectiveOpenness = Math.max(0.04, params.eyelidOpenness * blinkOpen);
  const eyeHeight = 14 * effectiveOpenness;
  const mouthOpen = Math.min(1, params.mouthOpenness + speakMouthDelta);
  const curveOffset = params.mouthCurve * 7;

  const totalPupilX = Math.max(-4.2, Math.min(4.2, params.pupilOffsetX + lookX));
  const totalPupilY = Math.max(-2.2, Math.min(2.2, params.pupilOffsetY + lookY));

  return (
    <g transform={`translate(${headTurnX.toFixed(2)}, 0) rotate(${headTiltDeg.toFixed(2)} 160 200)`}>
      <path
        d="M110 120 Q110 78 160 78 Q210 78 210 120 L206 160 Q196 196 160 202 Q124 196 114 160 Z"
        fill={char.skinTone}
        stroke={stroke}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path d="M111 140 Q103 142 104 154 Q106 162 114 162" fill={char.skinTone} stroke={stroke} strokeWidth="2.4" />
      <path d="M209 140 Q217 142 216 154 Q214 162 206 162" fill={char.skinTone} stroke={stroke} strokeWidth="2.4" />

      {renderFaceDetails?.()}

      <g>
        <ellipse cx="136" cy="146" rx="13" ry={Math.max(1.5, eyeHeight / 2)} fill="#F8F9FA" />
        <g clipPath={`url(#eye-left-${char.id})`}>
          <circle cx={136 + totalPupilX} cy={146 + totalPupilY} r="7.4" fill={`url(#${gradId})`} stroke={stroke} strokeWidth="1.4" />
          <circle cx={136 + totalPupilX} cy={146 + totalPupilY} r="3.2" fill="#17191E" />
          <circle cx={133.5 + totalPupilX * 0.6} cy={143 + totalPupilY * 0.6} r="2.1" fill="#FFFFFF" />
          <circle cx={139 + totalPupilX * 0.6} cy={149 + totalPupilY * 0.6} r="1.1" fill="#FFFFFF" opacity="0.85" />
        </g>
        <path d={`M122 ${146 - eyeHeight * 0.15} Q136 ${146 - eyeHeight * 0.68} 150 ${146 - eyeHeight * 0.1}`} fill="none" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" />
        <path d={`M125 ${146 + eyeHeight * 0.36} Q136 ${146 + eyeHeight * 0.56} 147 ${146 + eyeHeight * 0.36}`} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      </g>

      <g>
        <ellipse cx="184" cy="146" rx="13" ry={Math.max(1.5, eyeHeight / 2)} fill="#F8F9FA" />
        <g clipPath={`url(#eye-right-${char.id})`}>
          <circle cx={184 + totalPupilX} cy={146 + totalPupilY} r="7.4" fill={`url(#${gradId})`} stroke={stroke} strokeWidth="1.4" />
          <circle cx={184 + totalPupilX} cy={146 + totalPupilY} r="3.2" fill="#17191E" />
          <circle cx={181.5 + totalPupilX * 0.6} cy={143 + totalPupilY * 0.6} r="2.1" fill="#FFFFFF" />
          <circle cx={187 + totalPupilX * 0.6} cy={149 + totalPupilY * 0.6} r="1.1" fill="#FFFFFF" opacity="0.85" />
        </g>
        <path d={`M170 ${146 - eyeHeight * 0.1} Q184 ${146 - eyeHeight * 0.68} 198 ${146 - eyeHeight * 0.15}`} fill="none" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" />
        <path d={`M173 ${146 + eyeHeight * 0.36} Q184 ${146 + eyeHeight * 0.56} 195 ${146 + eyeHeight * 0.36}`} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      </g>

      <g transform={`translate(136, ${130 + params.eyebrowHeight}) rotate(${-params.eyebrowAngle})`}>
        <path d="M-13 0 Q0 -3 13 0" fill="none" stroke={stroke} strokeWidth="3.1" strokeLinecap="round" />
      </g>
      <g transform={`translate(184, ${130 + params.eyebrowHeight}) rotate(${params.eyebrowAngle})`}>
        <path d="M-13 0 Q0 -3 13 0" fill="none" stroke={stroke} strokeWidth="3.1" strokeLinecap="round" />
      </g>

      <path d="M160 151 L157 164 L163 165" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />

      {mouthOpen > 0.12 ? (
        <path d={`M147 177 Q160 ${177 + curveOffset * 0.6} 173 177 Q160 ${179 + mouthOpen * 14} 147 177 Z`} fill="#6D3439" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
      ) : (
        <path d={`M147 178 Q160 ${178 + curveOffset} 173 178`} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
      )}

      {params.tear && <path d="M126 155 Q122 163 126 167 Q130 163 126 155 Z" fill="#BFE3F7" stroke={stroke} strokeWidth="1.5" />}
      {params.sweatDrop && <path d="M201 124 Q196 135 201 140 Q206 135 201 124 Z" fill="#CFEAF9" stroke={stroke} strokeWidth="1.6" />}

      {renderFrontHair()}
    </g>
  );
};
