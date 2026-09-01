// src/components/card/CardComponent.jsx - HORIYA Modern Solid Tactical Card
import React, { useState, useRef } from 'react';
import { ELEMENT_THEMES, ACTION_SPELL_INFO } from '../../models/cardThemes';

export default function CardComponent({
  card,
  isPlayable = false,
  onClick,
  isBack = false,
  size = 'md',
  showGlow = true,
  disabled = false,
  customStyle = {}
}) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  if (!card && !isBack) return null;

  // 1. Solid Card Back Design (3-Card Stack Logo + Clean Brand)
  if (isBack) {
    return (
      <div
        className={`fantasy-card card-back card-size-${size}`}
        style={customStyle}
      >
        <div className="card-back-pattern">
          <div className="card-back-brand-group">
            <div className="card-back-stack-mini">
              <span className="cb-mini cb-yellow" />
              <span className="cb-mini cb-blue" />
              <span className="cb-mini cb-red" />
            </div>
            <span className="card-back-title">HORIYA</span>
          </div>
        </div>
      </div>
    );
  }

  const isWild = card.type === 'wild' || card.type === 'wild_draw4';
  const isSpecial = card.type !== 'number';
  const theme = ELEMENT_THEMES[card.color] || ELEMENT_THEMES.celestial;
  const spellInfo = ACTION_SPELL_INFO[card.type];

  const handleMouseMove = (e) => {
    if (disabled || size === 'mini' || size === 'sm') return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -8;
    const tiltY = ((x - centerX) / centerX) * 8;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const cornerSymbol = card.type === 'number' ? card.value : spellInfo?.symbol;

  return (
    <div
      ref={cardRef}
      className={`fantasy-card card-size-${size} card-color-${card.color} ${isSpecial ? 'card-special-action' : ''} ${isWild ? 'card-special-wild' : ''} ${isPlayable ? 'is-playable' : ''} ${disabled ? 'is-disabled' : ''}`}
      style={{
        '--card-bg-color': isWild ? '#0E131E' : theme.primary,
        '--card-border-color': isWild ? '#F59E0B' : theme.border,
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${customStyle.transform || ''}`,
        ...customStyle
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={!disabled && isPlayable && onClick ? onClick : undefined}
      title={spellInfo ? `${spellInfo.name}` : `${theme.name} ${card.value}`}
    >
      <div className="card-inner-frame">
        {/* Top-Left Corner */}
        <div className="card-corner top-left">
          <span className="corner-value">{cornerSymbol}</span>
        </div>

        {/* Center Artwork (Single Clean High-Impact Icon/Symbol) */}
        <div className={`card-center-oval ${isSpecial ? 'oval-special' : ''} ${isWild ? 'oval-wild' : ''}`}>
          {card.type === 'number' && (
            <span className="center-number-text">{card.value}</span>
          )}

          {card.type === 'draw2' && (
            <span className="center-action-text text-draw2">+2</span>
          )}

          {card.type === 'skip' && (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="center-action-svg">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          )}

          {card.type === 'reverse' && (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="center-action-svg">
              <path d="M4 8l4-4 4 4" />
              <path d="M8 4v8c0 4.4 3.6 8 8 8h4" />
              <path d="M20 16l-4 4-4-4" />
              <path d="M16 20v-8c0-4.4-3.6-8-8-8H4" />
            </svg>
          )}

          {card.type === 'wild' && (
            <div className="center-wild-quadrant">
              <span className="quad quad-red" />
              <span className="quad quad-blue" />
              <span className="quad quad-yellow" />
              <span className="quad quad-green" />
            </div>
          )}

          {card.type === 'wild_draw4' && (
            <div className="center-wild4-container">
              <div className="wild4-mini-quads">
                <span className="w4-dot quad-red" />
                <span className="w4-dot quad-blue" />
                <span className="w4-dot quad-yellow" />
                <span className="w4-dot quad-green" />
              </div>
              <span className="center-action-text text-draw4">+4</span>
            </div>
          )}
        </div>

        {/* Bottom-Right Corner (Inverted) */}
        <div className="card-corner bottom-right">
          <span className="corner-value">{cornerSymbol}</span>
        </div>
      </div>
    </div>
  );
}
