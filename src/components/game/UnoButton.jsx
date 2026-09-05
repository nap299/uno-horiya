// src/components/game/UnoButton.jsx - UNO Shout Button (Active Color vs Muted Disabled)
import React from 'react';
import { Flame } from 'lucide-react';

export default function UnoButton({ onShoutUno, hasCalledUno = false, canCall = false, isUrgent = false }) {
  const isClickable = canCall && !hasCalledUno;

  return (
    <button
      className={`uno-shout-button ${isClickable ? 'uno-can-call animate-pulse-glow' : 'uno-disabled'} ${isUrgent ? 'uno-urgent' : ''} ${hasCalledUno ? 'uno-called' : ''}`}
      onClick={isClickable ? onShoutUno : undefined}
      disabled={!isClickable}
      title={isClickable ? "กดเรียก UNO เมื่อเหลือไพ่ใบเดียว!" : "ยังเรียก UNO ไม่ได้ (ต้องเหลือไพ่บนมือใบเดียว)"}
    >
      <div className="uno-btn-content">
        <Flame className="uno-fire-icon" size={18} />
        <span className="uno-text">{hasCalledUno ? 'เรียก UNO แล้ว!' : 'UNO!'}</span>
      </div>
    </button>
  );
}
