// src/components/effects/SpellEffect.jsx - Modern Non-Obstructive Power Banner (Thai UI)
import React from 'react';
import { Ban, RefreshCw, Zap, ShieldAlert } from 'lucide-react';

const ELEMENT_EFFECT_MAP = {
  ruby: '/effect/fire.png',
  red: '/effect/fire.png',
  amber: '/effect/flash.png',
  yellow: '/effect/flash.png',
  emerald: '/effect/plant.png',
  green: '/effect/plant.png',
  sapphire: '/effect/water.png',
  blue: '/effect/water.png'
};

export default function SpellEffect({ spell }) {
  if (!spell) return null;

  const { type, color, target, count } = spell;
  const isColorShift = type === 'SUPERNOVA' || type === 'WILD_SHIFT';
  const effectImg = isColorShift ? (ELEMENT_EFFECT_MAP[color?.toLowerCase()] || ELEMENT_EFFECT_MAP.ruby) : null;

  return (
    <div className="spell-banner-anchor">
      {/* 1. Custom Graphical Elemental Banners for Wild (color.png) & Wild Draw 4 (four.png) */}
      {isColorShift && effectImg && (
        <div className="elemental-banner-wrapper">
          <img
            src={effectImg}
            alt={color || 'element'}
            className="elemental-banner-img"
          />
          {type === 'SUPERNOVA' && (
            <div className="supernova-badge animate-bounce">
              +{count || 4} ใบ
            </div>
          )}
        </div>
      )}

      {/* 2. Action Card Banners */}
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

      {type === 'REVERSE' && (
        <div className="spell-power-banner banner-chrono animate-slide-down">
          <div className="banner-icon-block block-chrono">
            <RefreshCw size={22} className="icon-white animate-spin-slow" />
          </div>
          <div className="banner-text-block">
            <span className="banner-badge-tag">การ์ดคำสั่ง</span>
            <h3 className="banner-title">ย้อนเวลา (กลับทิศทาง)</h3>
            <p className="banner-desc">ทิศทางการเล่นวนกลับด้าน!</p>
          </div>
        </div>
      )}

      {type === 'LIGHTNING' && (
        <div className="spell-power-banner banner-lightning animate-slide-down">
          <div className="banner-icon-block block-lightning">
            <Zap size={22} className="icon-white" />
          </div>
          <div className="banner-text-block">
            <span className="banner-badge-tag">การ์ดโจมตี</span>
            <h3 className="banner-title">สายฟ้าคู่ (+{count || 2} ใบ)</h3>
            <p className="banner-desc">ซ้อนโทษจั่ว +{count || 2} ใบลงในกอง!</p>
          </div>
        </div>
      )}

      {type === 'ABSORB_PENALTY' && (
        <div className="spell-power-banner banner-absorb animate-slide-down">
          <div className="banner-icon-block block-absorb">
            <ShieldAlert size={22} className="icon-white" />
          </div>
          <div className="banner-text-block">
            <span className="banner-badge-tag">รับผลโทษ</span>
            <h3 className="banner-title">โดนลงโทษจั่วไพ่</h3>
            <p className="banner-desc">ถูกบังคับจั่วไพ่สะสม {count} ใบ!</p>
          </div>
        </div>
      )}
    </div>
  );
}
