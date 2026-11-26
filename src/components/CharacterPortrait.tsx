import React from 'react';
import { CharacterId, ExpressionId, ExpressionParams } from '../types/vn';
import { MyraCharacter } from './characters/MyraCharacter';
import { OrsenCharacter } from './characters/OrsenCharacter';
import { TorrikCharacter } from './characters/TorrikCharacter';

interface CharacterPortraitProps {
  characterId: CharacterId;
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

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  characterId,
  ...props
}) => {
  switch (characterId) {
    case 'myra':
      return <MyraCharacter {...props} />;
    case 'orsen':
      return <OrsenCharacter {...props} />;
    case 'torrik':
    default:
      return <TorrikCharacter {...props} />;
  }
};
