import React from 'react';
import { Flame, Check } from 'lucide-react';

export default function UnoButton({ onShoutUno, hasCalledUno = false, canCall = false, isUrgent = false }) {
  const isClickable = canCall && !hasCalledUno;

  const buttonStateClass = hasCalledUno
    ? 'uno-called animate-pulse-glow'
    : isClickable
    ? 'uno-can-call animate-pulse-glow'
    : 'uno-disabled';

  return (
    <button
      className={`uno-shout-button ${buttonStateClass} ${isUrgent && !hasCalledUno ? 'uno-urgent' : ''}`}
      onClick={isClickable ? onShoutUno : undefined}
      disabled={!isClickable}
      title={hasCalledUno ? "คุณได้กดเรียก UNO แล้ว!" : isClickable ? "กดเรียก UNO เมื่อเหลือไพ่ใบเดียว!" : "ยังเรียก UNO ไม่ได้ (ต้องเหลือไพ่บนมือใบเดียว)"}
    >
      <div className="uno-btn-content">
        {hasCalledUno ? (
          <Check className="uno-check-icon" size={18} />
        ) : (
          <Flame className="uno-fire-icon" size={18} />
        )}
        <span className="uno-text">{hasCalledUno ? 'เรียก UNO แล้ว!' : 'UNO!'}</span>
      </div>
    </button>
  );
}
