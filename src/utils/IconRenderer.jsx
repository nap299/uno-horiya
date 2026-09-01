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

// Vibrant Multi-Color Animal Avatar Vector Components
export function AvatarIcon({ iconId, size = 28, className = "" }) {
  switch (iconId?.toLowerCase()) {
    case 'cat':
    case 'mage_fire':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} className={`avatar-svg avatar-cat ${className}`}>
          {/* Cat Head */}
          <path d="M7 10L4 4L11 6C13 5 19 5 21 6L28 4L25 10C28 14 28 20 25 24C21 28 11 28 7 24C4 20 4 14 7 10Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          {/* Inner Ears */}
          <polygon points="6,6 9,7 7,10" fill="#FDE68A" />
          <polygon points="26,6 23,7 25,10" fill="#FDE68A" />
          {/* Muzzle */}
          <ellipse cx="16" cy="20" rx="6" ry="4" fill="#FEF3C7" />
          {/* Eyes */}
          <ellipse cx="11" cy="14" rx="2.5" ry="3" fill="#1E293B" />
          <circle cx="11.8" cy="13" r="1" fill="#FFFFFF" />
          <ellipse cx="21" cy="14" rx="2.5" ry="3" fill="#1E293B" />
          <circle cx="21.8" cy="13" r="1" fill="#FFFFFF" />
          {/* Nose & Mouth */}
          <polygon points="16,18 14.5,16.5 17.5,16.5" fill="#EF4444" />
          <path d="M14 20C15 21.5 16 21.5 16 19.5C16 21.5 17 21.5 18 20" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          {/* Whiskers */}
          <line x1="4" y1="18" x2="10" y2="19" stroke="#78350F" strokeWidth="1" />
          <line x1="4" y1="21" x2="10" y2="21" stroke="#78350F" strokeWidth="1" />
          <line x1="28" y1="18" x2="22" y2="19" stroke="#78350F" strokeWidth="1" />
          <line x1="28" y1="21" x2="22" y2="21" stroke="#78350F" strokeWidth="1" />
        </svg>
      );

    case 'dog':
    case 'mage_ice':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} className={`avatar-svg avatar-dog ${className}`}>
          {/* Dog Head */}
          <rect x="7" y="9" width="18" height="17" rx="8" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          {/* Floppy Ears */}
          <path d="M7 10C5 10 3 14 3 18C3 21 6 22 7 19Z" fill="#0284C7" />
          <path d="M25 10C27 10 29 14 29 18C29 21 26 22 25 19Z" fill="#0284C7" />
          {/* Snout */}
          <ellipse cx="16" cy="20" rx="5.5" ry="4" fill="#E0F2FE" />
          {/* Eyes */}
          <circle cx="11.5" cy="14" r="2.5" fill="#0F172A" />
          <circle cx="12.2" cy="13.2" r="0.8" fill="#FFFFFF" />
          <circle cx="20.5" cy="14" r="2.5" fill="#0F172A" />
          <circle cx="21.2" cy="13.2" r="0.8" fill="#FFFFFF" />
          {/* Big Black Nose */}
          <ellipse cx="16" cy="18.5" rx="2.5" ry="1.8" fill="#0F172A" />
          {/* Happy Mouth / Tongue */}
          <path d="M14 21C15 22.5 17 22.5 18 21" stroke="#0F172A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M15 22C15 24 17 24 17 22" fill="#F43F5E" />
        </svg>
      );

    case 'dragon':
    case 'knight':
    case 'knight_dragon':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} className={`avatar-svg avatar-dragon ${className}`}>
          {/* Dragon Horns */}
          <path d="M9 11L4 4C7 6 8 9 9 11Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          <path d="M23 11L28 4C25 6 24 9 23 11Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          {/* Dragon Head */}
          <path d="M8 12C8 7 24 7 24 12C26 16 25 24 16 27C7 24 6 16 8 12Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
          {/* Snout Plates */}
          <path d="M11 20L16 24L21 20L16 18Z" fill="#F87171" />
          {/* Fierce Eyes */}
          <polygon points="9,13 14,15 10,16" fill="#FEF08A" stroke="#713F12" strokeWidth="0.8" />
          <circle cx="11.5" cy="14.8" r="1" fill="#713F12" />
          <polygon points="23,13 18,15 22,16" fill="#FEF08A" stroke="#713F12" strokeWidth="0.8" />
          <circle cx="20.5" cy="14.8" r="1" fill="#713F12" />
          {/* Nostril Steam Holes */}
          <circle cx="14" cy="21" r="0.9" fill="#450A0A" />
          <circle cx="18" cy="21" r="0.9" fill="#450A0A" />
          {/* Sharp Teeth */}
          <polygon points="12,24 13,26 14,24" fill="#FFFFFF" />
          <polygon points="18,24 19,26 20,24" fill="#FFFFFF" />
        </svg>
      );

    case 'shark':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} className={`avatar-svg avatar-shark ${className}`}>
          {/* Shark Body & Head */}
          <path d="M16 3C10 8 6 16 6 24C10 27 22 27 26 24C26 16 22 8 16 3Z" fill="#0EA5E9" stroke="#0369A1" strokeWidth="1.5" />
          {/* Dorsal Fin Behind */}
          <path d="M16 4L16 12L21 9Z" fill="#0284C7" />
          {/* Shark Belly */}
          <path d="M10 18C12 24 20 24 22 18C20 22 12 22 10 18Z" fill="#F0F9FF" />
          {/* Fierce Shark Eyes */}
          <circle cx="11" cy="14" r="2.2" fill="#0F172A" />
          <circle cx="11.7" cy="13.3" r="0.7" fill="#38BDF8" />
          <circle cx="21" cy="14" r="2.2" fill="#0F172A" />
          <circle cx="21.7" cy="13.3" r="0.7" fill="#38BDF8" />
          {/* Shark Smile & Sharp Teeth */}
          <path d="M9 20C13 25 19 25 23 20" stroke="#082F49" strokeWidth="1.5" fill="#1E293B" />
          <polygon points="11,20 12,22 13,20" fill="#FFFFFF" />
          <polygon points="14,20 15,22 16,20" fill="#FFFFFF" />
          <polygon points="17,20 18,22 19,20" fill="#FFFFFF" />
          <polygon points="20,20 21,22 22,20" fill="#FFFFFF" />
          {/* Gills */}
          <line x1="7" y1="18" x2="8.5" y2="20" stroke="#0369A1" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="25" y1="18" x2="23.5" y2="20" stroke="#0369A1" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case 'chicken':
    case 'mage_storm':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} className={`avatar-svg avatar-chicken ${className}`}>
          {/* Comb on Top */}
          <path d="M12 7C12 4 15 3 16 5C17 3 20 4 20 7Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
          {/* Head */}
          <circle cx="16" cy="16" r="10" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          {/* Cheeks */}
          <circle cx="9" cy="18" r="2.5" fill="#FCA5A5" />
          <circle cx="23" cy="18" r="2.5" fill="#FCA5A5" />
          {/* Eyes */}
          <circle cx="12" cy="13" r="2.2" fill="#1E293B" />
          <circle cx="12.6" cy="12.4" r="0.8" fill="#FFFFFF" />
          <circle cx="20" cy="13" r="2.2" fill="#1E293B" />
          <circle cx="20.6" cy="12.4" r="0.8" fill="#FFFFFF" />
          {/* Sharp Orange Beak */}
          <polygon points="16,14 13,18 19,18" fill="#EA580C" />
          <polygon points="16,21 13,18 19,18" fill="#C2410C" />
          {/* Wattle (under beak) */}
          <path d="M15 20C14 23 18 23 17 20Z" fill="#EF4444" />
        </svg>
      );

    case 'snake':
    case 'mage_earth':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} className={`avatar-svg avatar-snake ${className}`}>
          {/* Cobra Hood */}
          <path d="M6 14C6 8 26 8 26 14C28 20 24 26 16 26C8 26 4 20 6 14Z" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
          {/* Snake Face */}
          <ellipse cx="16" cy="15" rx="7" ry="8" fill="#34D399" />
          {/* Scale Markings on Forehead */}
          <polygon points="16,8 14,11 18,11" fill="#047857" />
          {/* Glowing Slit Eyes */}
          <ellipse cx="12" cy="14" rx="2.5" ry="3.5" fill="#FDE047" stroke="#713F12" strokeWidth="0.8" />
          <line x1="12" y1="11" x2="12" y2="17" stroke="#000000" strokeWidth="1.4" />
          <ellipse cx="20" cy="14" rx="2.5" ry="3.5" fill="#FDE047" stroke="#713F12" strokeWidth="0.8" />
          <line x1="20" y1="11" x2="20" y2="17" stroke="#000000" strokeWidth="1.4" />
          {/* Nostrils */}
          <circle cx="14.5" cy="18" r="0.8" fill="#064E3B" />
          <circle cx="17.5" cy="18" r="0.8" fill="#064E3B" />
          {/* Forked Tongue */}
          <path d="M16 22L16 26M16 26L14 28M16 26L18 28" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    case 'fox':
    case 'blade':
    case 'assassin_shadow':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} className={`avatar-svg avatar-fox ${className}`}>
          {/* Fox Ears */}
          <polygon points="7,14 4,3 12,8" fill="#EA580C" stroke="#9A3412" strokeWidth="1" />
          <polygon points="6,6 9,8 7,12" fill="#1E293B" />
          <polygon points="25,14 28,3 20,8" fill="#EA580C" stroke="#9A3412" strokeWidth="1" />
          <polygon points="26,6 23,8 25,12" fill="#1E293B" />
          {/* Fox Head */}
          <polygon points="16,28 4,12 28,12" fill="#F97316" stroke="#C2410C" strokeWidth="1.5" />
          {/* White Cheeks Mask */}
          <polygon points="16,28 7,14 16,19" fill="#FFF7ED" />
          <polygon points="16,28 25,14 16,19" fill="#FFF7ED" />
          {/* Mystical Eyes */}
          <polygon points="9,14 14,16 11,17" fill="#0284C7" stroke="#0C4A6E" strokeWidth="0.8" />
          <polygon points="23,14 18,16 21,17" fill="#0284C7" stroke="#0C4A6E" strokeWidth="0.8" />
          {/* Black Nose */}
          <polygon points="16,27 14.5,25 17.5,25" fill="#0F172A" />
        </svg>
      );

    case 'tiger':
    case 'empress':
    case 'queen_celestial':
    case 'mage_void':
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} className={`avatar-svg avatar-tiger ${className}`}>
          {/* Tiger Ears */}
          <circle cx="7" cy="8" r="4.5" fill="#7C3AED" stroke="#4C1D95" strokeWidth="1" />
          <circle cx="7" cy="8" r="2.5" fill="#FDE68A" />
          <circle cx="25" cy="8" r="4.5" fill="#7C3AED" stroke="#4C1D95" strokeWidth="1" />
          <circle cx="25" cy="8" r="2.5" fill="#FDE68A" />
          {/* Tiger Head */}
          <circle cx="16" cy="17" r="10" fill="#8B5CF6" stroke="#5B21B6" strokeWidth="1.5" />
          {/* Forehead Tiger Stripes */}
          <path d="M16 8L16 12M13 9L15 11M19 9L17 11" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 16L9 16M26 16L23 16" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" />
          {/* Muzzle */}
          <ellipse cx="16" cy="20" rx="5" ry="3.5" fill="#EDE9FE" />
          {/* Golden Predator Eyes */}
          <circle cx="11.5" cy="14" r="2.5" fill="#F59E0B" stroke="#78350F" strokeWidth="0.8" />
          <circle cx="11.8" cy="13.8" r="1" fill="#000000" />
          <circle cx="20.5" cy="14" r="2.5" fill="#F59E0B" stroke="#78350F" strokeWidth="0.8" />
          <circle cx="20.8" cy="13.8" r="1" fill="#000000" />
          {/* Nose & Fangs */}
          <polygon points="16,19 14.5,17.5 17.5,17.5" fill="#EC4899" />
          <polygon points="13.5,22 14.5,24 15,22" fill="#FFFFFF" />
          <polygon points="18.5,22 17.5,24 17,22" fill="#FFFFFF" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 32 32" width={size} height={size} className={`avatar-svg avatar-cat ${className}`}>
          <path d="M7 10L4 4L11 6C13 5 19 5 21 6L28 4L25 10C28 14 28 20 25 24C21 28 11 28 7 24C4 20 4 14 7 10Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="11" cy="14" rx="2.5" ry="3" fill="#1E293B" />
          <circle cx="21" cy="14" rx="2.5" ry="3" fill="#1E293B" />
          <polygon points="16,18 14.5,16.5 17.5,16.5" fill="#EF4444" />
        </svg>
      );
  }
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
