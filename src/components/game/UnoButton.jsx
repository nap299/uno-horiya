// src/components/game/UnoButton.jsx - Burning Arcane UNO Shout Button
import React from 'react';
import { Flame } from 'lucide-react';

export default function UnoButton({ onShoutUno, hasCalledUno = false, isUrgent = false }) {
  return (
    <button
      className={`uno-shout-button ${isUrgent ? 'uno-urgent animate-pulse-fast' : ''} ${hasCalledUno ? 'uno-active' : ''}`}
      onClick={onShoutUno}
      disabled={hasCalledUno}
      title="กดเรียก UNO เมื่อเหลือไพ่ใบเดียวในมือ!"
    >
      <div className="uno-btn-glow" />
      <div className="uno-btn-content">
        <Flame className="uno-fire-icon" size={22} />
        <span className="uno-text">{hasCalledUno ? 'เรียก UNO แล้ว!' : 'UNO!'}</span>
      </div>
      <div className="uno-sparkles" />
    </button>
  );
}
