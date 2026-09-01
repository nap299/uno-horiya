// src/components/effects/SpellEffect.jsx - Modern Non-Obstructive Power Banner (Thai UI)
import React from 'react';
import { ELEMENT_THEMES } from '../../models/cardThemes';
import { ElementIcon } from '../../utils/IconRenderer';
import { Ban, RefreshCw, Zap, Flame, ShieldAlert } from 'lucide-react';

export default function SpellEffect({ spell }) {
  if (!spell) return null;

  const { type, color, target, count } = spell;
  const theme = ELEMENT_THEMES[color] || ELEMENT_THEMES.celestial;

  return (
    <div className="spell-banner-anchor">
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

      {type === 'SUPERNOVA' && (
        <div className="spell-power-banner banner-supernova animate-slide-down">
          <div className="banner-icon-block block-supernova">
            <Flame size={22} className="icon-white" />
          </div>
          <div className="banner-text-block">
            <span className="banner-badge-tag">การ์ดเปลี่ยนสี & จั่ว</span>
            <h3 className="banner-title">ซูเปอร์โนวา (+4 ไพ่)</h3>
            <p className="banner-desc">เปลี่ยนธาตุเป็น {theme.name} พร้อมให้คนถัดไปจั่ว +4 ใบ!</p>
          </div>
        </div>
      )}

      {type === 'WILD_SHIFT' && (
        <div className="spell-power-banner banner-wild animate-slide-down">
          <div className="banner-icon-block block-wild">
            <ElementIcon element={color} size={22} className="icon-white" />
          </div>
          <div className="banner-text-block">
            <span className="banner-badge-tag">เปลี่ยนธาตุพลัง</span>
            <h3 className="banner-title">ธาตุ {theme.name}</h3>
            <p className="banner-desc">เปลี่ยนสีการ์ดกลางโต๊ะเป็น {theme.name}!</p>
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
