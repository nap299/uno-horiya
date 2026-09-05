// src/utils/IconRenderer.jsx - Centralized SVG Icon Mapper (Vibrant Animal Avatars & Clean Badges)
import React from 'react';
import {
  Flame,
  Snowflake,
  Leaf,
  Zap,
  Disc,
  Ban,
  RefreshCw,
  Shield,
  Trophy,
  Skull,
  Wand2,
  Gem,
  Target
} from 'lucide-react';

export function ElementIcon({ element, size = 16, className = "" }) {
  switch (element?.toLowerCase()) {
    case 'ruby':
    case 'fire':
      return <Flame size={size} className={`icon-ruby ${className}`} />;
    case 'sapphire':
    case 'ice':
    case 'frost':
      return <Snowflake size={size} className={`icon-sapphire ${className}`} />;
    case 'emerald':
    case 'earth':
    case 'nature':
      return <Leaf size={size} className={`icon-emerald ${className}`} />;
    case 'amber':
    case 'lightning':
    case 'storm':
      return <Zap size={size} className={`icon-amber ${className}`} />;
    case 'celestial':
    case 'wild':
    case 'void':
      return <Disc size={size} className={`icon-celestial ${className}`} />;
    default:
      return <Gem size={size} className={className} />;
  }
}

export function SpellIcon({ type, size = 16, className = "" }) {
  switch (type?.toLowerCase()) {
    case 'skip':
      return <Ban size={size} className={className} />;
    case 'reverse':
      return <RefreshCw size={size} className={className} />;
    case 'draw2':
      return <Zap size={size} className={className} />;
    case 'wild':
      return <Disc size={size} className={className} />;
    case 'wild_draw4':
      return <Flame size={size} className={className} />;
    default:
      return <Wand2 size={size} className={className} />;
  }
}

import catAvatar from '../assets/profile/cat.png';
import dogAvatar from '../assets/profile/dog.png';
import dragonAvatar from '../assets/profile/dragon.png';
import sharkAvatar from '../assets/profile/shark.png';
import chickenAvatar from '../assets/profile/chicken.png';
import snakeAvatar from '../assets/profile/snake.png';
import foxAvatar from '../assets/profile/fox.png';
import tigerAvatar from '../assets/profile/tiger.png';

export const AVATAR_IMAGE_MAP = {
  cat: catAvatar,
  mage_fire: catAvatar,
  dog: dogAvatar,
  mage_ice: dogAvatar,
  dragon: dragonAvatar,
  knight: dragonAvatar,
  knight_dragon: dragonAvatar,
  flame: dragonAvatar,
  shark: sharkAvatar,
  frost: sharkAvatar,
  chicken: chickenAvatar,
  mage_storm: chickenAvatar,
  storm: chickenAvatar,
  snake: snakeAvatar,
  mage_earth: snakeAvatar,
  leaf: snakeAvatar,
  fox: foxAvatar,
  blade: foxAvatar,
  assassin_shadow: foxAvatar,
  tiger: tigerAvatar,
  empress: tigerAvatar,
  queen_celestial: tigerAvatar,
  mage_void: tigerAvatar,
  void: tigerAvatar
};

export function getAvatarImage(iconId) {
  if (!iconId) return catAvatar;
  const str = String(iconId);
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:') || str.startsWith('blob:')) {
    return str;
  }
  const lower = str.toLowerCase();
  return AVATAR_IMAGE_MAP[lower] || catAvatar;
}

// Animal Avatar Image Component
export function AvatarIcon({ iconId, size = 28, className = "" }) {
  const imgSrc = getAvatarImage(iconId);
  const altText = iconId || 'avatar';
  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <img
      src={imgSrc}
      alt={altText}
      width={size}
      height={size}
      className={`avatar-icon-img avatar-${iconId || 'cat'} ${className}`}
      style={{
        width: dimension,
        height: dimension,
        objectFit: 'contain'
      }}
      loading="lazy"
      onError={(e) => {
        if (e.target.src !== catAvatar) {
          e.target.src = catAvatar;
        }
      }}
    />
  );
}

export function ReactionIcon({ id, size = 20 }) {
  switch (id) {
    case 'fire':
      return <Flame size={size} className="icon-ruby" />;
    case 'freeze':
      return <Snowflake size={size} className="icon-sapphire" />;
    case 'shock':
      return <Zap size={size} className="icon-amber" />;
    case 'shield':
      return <Shield size={size} className="icon-emerald" />;
    case 'skull':
      return <Skull size={size} className="icon-ruby" />;
    case 'trophy':
      return <Trophy size={size} className="icon-amber" />;
    case 'target':
      return <Target size={size} className="icon-sapphire" />;
    default:
      return <Zap size={size} />;
  }
}
