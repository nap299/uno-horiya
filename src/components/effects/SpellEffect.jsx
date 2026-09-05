// src/components/effects/SpellEffect.jsx - Pure Graphical Effect Banners
import React from 'react';
import fireEffect from '../../assets/effects/fire.webp';
import flashEffect from '../../assets/effects/flash.webp';
import plantEffect from '../../assets/effects/plant.webp';
import waterEffect from '../../assets/effects/water.webp';
import swiftEffect from '../../assets/effects/swift.webp';
import draw2Effect from '../../assets/effects/+2.webp';
import draw4Effect from '../../assets/effects/+4.webp';
import draw6Effect from '../../assets/effects/+6.webp';
import draw8Effect from '../../assets/effects/+8.webp';
import draw10Effect from '../../assets/effects/+10.webp';
import redSkipEffect from '../../assets/effects/red_skip.webp';
import greenSkipEffect from '../../assets/effects/green_skip.webp';
import blueSkipEffect from '../../assets/effects/blue_skip.webp';
import yellowSkipEffect from '../../assets/effects/yellow_skip.webp';

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

const SKIP_EFFECT_MAP = {
  ruby: redSkipEffect,
  red: redSkipEffect,
  emerald: greenSkipEffect,
  green: greenSkipEffect,
  sapphire: blueSkipEffect,
  blue: blueSkipEffect,
  amber: yellowSkipEffect,
  yellow: yellowSkipEffect
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

      {/* 4. Freeze / Skip Banner by Color (red_skip, green_skip, blue_skip, yellow_skip) - Pure Image */}
      {type === 'FREEZE' && (
        <div className="elemental-banner-wrapper">
          <img
            src={SKIP_EFFECT_MAP[color?.toLowerCase()] || blueSkipEffect}
            alt="ข้ามเทิร์น"
            className="elemental-banner-img"
          />
        </div>
      )}
    </div>
  );
}
