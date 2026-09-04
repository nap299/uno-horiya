// src/components/effects/SpellEffect.jsx - Pure Graphical Effect Banners
import React from 'react';
import { Ban } from 'lucide-react';
import fireEffect from '../../assets/effects/fire.png';
import flashEffect from '../../assets/effects/flash.png';
import plantEffect from '../../assets/effects/plant.png';
import waterEffect from '../../assets/effects/water.png';
import swiftEffect from '../../assets/effects/swift.png';
import draw2Effect from '../../assets/effects/+2.png';
import draw4Effect from '../../assets/effects/+4.png';
import draw6Effect from '../../assets/effects/+6.png';
import draw8Effect from '../../assets/effects/+8.png';
import draw10Effect from '../../assets/effects/+10.png';

const ELEMENT_EFFECT_MAP = {
  ruby: fireEffect,
  red: fireEffect,
  amber: flashEffect,
  yellow: flashEffect,
  emerald: plantEffect,
  green: plantEffect,
  sapphire: waterEffect,
  blue: waterEffect
};

function getDrawImage(count) {
  const c = Math.min(10, Math.max(2, count || 2));
  if (c <= 2) return draw2Effect;
  if (c <= 4) return draw4Effect;
  if (c <= 6) return draw6Effect;
  if (c <= 8) return draw8Effect;
  return draw10Effect;
}

export default function SpellEffect({ spell }) {
  if (!spell) return null;

  const { type, color, target, count } = spell;

  const isDrawEffect = type === 'DRAW_EFFECT' || type === 'LIGHTNING' || type === 'SUPERNOVA' || type === 'ABSORB_PENALTY';
  const drawImage = isDrawEffect ? getDrawImage(count) : null;
  const drawCount = Math.min(10, Math.max(2, count || 2));

  const isWildShift = type === 'WILD_SHIFT';
  const wildEffectImg = isWildShift ? (ELEMENT_EFFECT_MAP[color?.toLowerCase()] || fireEffect) : null;

  return (
    <div className="spell-banner-anchor">
      {/* 1. Draw Stacking & Forced Draw Penalty Banners (+2, +4, +6, +8, +10) - Pure Image */}
      {isDrawEffect && drawImage && (
        <div className="elemental-banner-wrapper">
          <img
            src={drawImage}
            alt={`+${drawCount}`}
            className="elemental-banner-img"
          />
        </div>
      )}

      {/* 2. Reverse / Time Reverse Banner (swift.png) - Pure Image */}
      {type === 'REVERSE' && (
        <div className="elemental-banner-wrapper">
          <img
            src={swiftEffect}
            alt="ย้อนกลับทิศทาง"
            className="elemental-banner-img"
          />
        </div>
      )}

      {/* 3. Wild Color Shift Banner (fire, flash, plant, water) - Pure Image */}
      {isWildShift && wildEffectImg && (
        <div className="elemental-banner-wrapper">
          <img
            src={wildEffectImg}
            alt={color || 'element'}
            className="elemental-banner-img"
          />
        </div>
      )}

      {/* 4. Freeze / Skip Banner */}
      {type === 'FREEZE' && (
        <div className="spell-power-banner banner-frost animate-slide-down">
          <div className="banner-icon-block block-frost">
            <Ban size={22} className="icon-white" />
          </div>
          <div className="banner-text-block">
            <span className="banner-badge-tag">การ์ดคำสั่ง</span>
            <h3 className="banner-title">แช่แข็ง (ข้ามเทิร์น)</h3>
            <p className="banner-desc">{target ? `${target} โดนข้ามเทิร์น!` : 'ข้ามเทิร์นผู้เล่นถัดไป!'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
