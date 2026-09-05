// src/components/card/CardComponent.jsx - HORIYA Custom Template Card Component
import React, { useState, useRef } from 'react';
import { ELEMENT_THEMES, ACTION_SPELL_INFO } from '../../models/cardThemes';

// Map each card type/color to its custom template image
export function getCardTemplate(card, isBack = false) {
  if (isBack) {
    return {
      image: './cardtemplate/cardback.webp',
      fallback: '/cardtemplate/cardback.webp',
      showCorners: false,
      symbol: ''
    };
  }

  if (!card) {
    return {
      image: './cardtemplate/cardback.webp',
      fallback: '/cardtemplate/cardback.webp',
      showCorners: false,
      symbol: ''
    };
  }

  // 1. Wild Draw 4 (+4)
  if (card.type === 'wild_draw4') {
    return {
      image: './cardtemplate/four.webp',
      fallback: '/cardtemplate/four.webp',
      showCorners: true,
      symbol: '+4'
    };
  }

  // 2. Wild Color Change (No number)
  if (card.type === 'wild') {
    return {
      image: './cardtemplate/color.webp',
      fallback: '/cardtemplate/color.webp',
      showCorners: false,
      symbol: ''
    };
  }

  // 3. Reverse (Swift - No number)
  if (card.type === 'reverse') {
    return {
      image: './cardtemplate/swift.webp',
      fallback: '/cardtemplate/swift.webp',
      showCorners: false,
      symbol: ''
    };
  }

  // 4. Colored Cards: red, green, blue, yellow
  let imageFile = 'red.webp';
  const colorStr = (card.color || '').toLowerCase();
  if (colorStr === 'emerald' || colorStr === 'green') {
    imageFile = 'green.webp';
  } else if (colorStr === 'sapphire' || colorStr === 'blue') {
    imageFile = 'blue.webp';
  } else if (colorStr === 'amber' || colorStr === 'yellow' || colorStr === 'gold') {
    imageFile = 'yellow.webp';
  } else {
    imageFile = 'red.webp';
  }

  // Check if card is a skip / freeze card (ตัดข้ามเทิร์น / แช่แข็ง)
  const cardTypeStr = (card.type || '').toLowerCase();
  const cardValStr = String(card.value ?? '').toLowerCase();
  const isSkip = cardTypeStr === 'skip' || cardTypeStr === 'freeze' || cardValStr === 'skip' || cardValStr === 'freeze';

  // Corner symbol calculation
  let symbol = '';
  if (card.type === 'number') {
    symbol = card.value !== undefined && card.value !== null ? String(card.value) : '';
  } else if (card.type === 'draw2') {
    symbol = '+2';
  } else if (isSkip) {
    symbol = '⊘';
  }

  const hasCorners = symbol !== '' || isSkip;

  return {
    image: `./cardtemplate/${imageFile}`,
    fallback: `/cardtemplate/${imageFile}`,
    showCorners: hasCorners,
    symbol: symbol,
    isSkip: isSkip
  };
}

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

  const template = getCardTemplate(card, isBack);
  const theme = card ? (ELEMENT_THEMES[card.color] || ELEMENT_THEMES.celestial) : null;
  const spellInfo = card ? ACTION_SPELL_INFO[card.type] : null;

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

  return (
    <div
      ref={cardRef}
      className={`fantasy-card card-size-${size} ${isBack ? 'card-is-back' : ''} ${isPlayable ? 'is-playable' : ''} ${disabled ? 'is-disabled' : ''}`}
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${customStyle.transform || ''}`,
        ...customStyle
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={!disabled && isPlayable && onClick ? onClick : undefined}
      title={spellInfo ? `${spellInfo.name}` : card ? `${theme?.name || ''} ${card.value ?? ''}` : 'HORIYA'}
    >
      {/* Template Image Background */}
      <img
        src={template.image}
        alt={card ? `${card.color} ${card.value || card.type}` : 'Card Back'}
        className="card-template-img"
        onError={(e) => {
          if (template.fallback && e.target.src !== template.fallback) {
            e.target.src = template.fallback;
          }
        }}
        draggable={false}
      />

      {/* Top-Left & Bottom-Right Corner Symbols */}
      {template.showCorners && (
        <>
          <div className="card-corner corner-top-left">
            {template.isSkip ? (
              <svg
                viewBox="0 0 24 24"
                className="corner-skip-svg"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-label="Skip"
              >
                <circle cx="12" cy="12" r="9" />
                <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
              </svg>
            ) : (
              <span className="corner-symbol-text">{template.symbol}</span>
            )}
          </div>
          <div className="card-corner corner-bottom-right">
            {template.isSkip ? (
              <svg
                viewBox="0 0 24 24"
                className="corner-skip-svg"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-label="Skip"
              >
                <circle cx="12" cy="12" r="9" />
                <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
              </svg>
            ) : (
              <span className="corner-symbol-text">{template.symbol}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
