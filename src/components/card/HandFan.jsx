// src/components/card/HandFan.jsx - Professional UNO Mobile Overlapping Card Fan
import React, { useState, useEffect, useRef, useCallback } from 'react';
import CardComponent from './CardComponent';
import { canPlayCard } from '../../../server/gameEngine';
import { sound } from '../../audio/soundEngine';

export default function HandFan({
  hand = [],
  topCard,
  activeColor,
  stackedDrawCount = 0,
  rules = {},
  isMyTurn = false,
  onPlayCard
}) {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  const cardCount = hand.length;

  // Measure container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth || window.innerWidth);
      } else {
        setContainerWidth(window.innerWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Auto-deselect if the selected card was played or removed
  useEffect(() => {
    if (selectedCardId && !hand.some(c => c.id === selectedCardId)) {
      setSelectedCardId(null);
    }
  }, [hand, selectedCardId]);

  // Global tap-outside deselect: clicking anywhere outside the hand wrapper deselects
  useEffect(() => {
    if (!selectedCardId) return;

    const handleGlobalTap = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSelectedCardId(null);
      }
    };

    document.addEventListener('pointerdown', handleGlobalTap);
    return () => document.removeEventListener('pointerdown', handleGlobalTap);
  }, [selectedCardId]);

  // Calculate dynamic overlap so ALL cards fit within 100% of the screen width
  const baseCardWidth = containerWidth < 480 ? 58 : 72;
  const availableWidth = Math.max(260, containerWidth - 24);

  let marginOverlap = 0;
  if (cardCount > 1) {
    const totalWidthUnshifted = cardCount * baseCardWidth;
    if (totalWidthUnshifted > availableWidth) {
      marginOverlap = (availableWidth - totalWidthUnshifted) / (cardCount - 1);
      const maxNegative = -(baseCardWidth - 14);
      if (marginOverlap < maxNegative) {
        marginOverlap = maxNegative;
      }
    }
  }

  const handleCardClick = (card, playable, e) => {
    e.stopPropagation();

    if (selectedCardId === card.id) {
      // Second tap on already selected card -> Play it immediately if playable!
      if (playable) {
        onPlayCard(card);
        setSelectedCardId(null);
      }
    } else {
      // First tap -> Select & pop up this card to display full details!
      setSelectedCardId(card.id);
      sound.playCard(card.color);
    }
  };

  const handleBackgroundTap = () => {
    // Tapping empty space within the hand area deselects
    setSelectedCardId(null);
  };

  return (
    <div className="pro-hand-fan-wrapper" ref={wrapperRef} onClick={handleBackgroundTap}>
      {/* Hand Header info */}
      <div className="pro-hand-header">
        <span className="pro-hand-title">ไพ่ในมือ ({cardCount} ใบ)</span>
        {isMyTurn && (
          <span className="pro-hand-hint">
            {selectedCardId ? 'แตะอีกครั้งเพื่อลงไพ่' : 'แตะเพื่อเลือกไพ่'}
          </span>
        )}
      </div>

      {/* Overlapping Fan Container - Zero Scroll, 100% Visible */}
      <div
        ref={containerRef}
        className="pro-fan-container"
      >
        <div className="pro-fan-row">
          {hand.map((card, idx) => {
            const playable = isMyTurn && canPlayCard(card, topCard, activeColor, stackedDrawCount, rules);
            const isSelected = selectedCardId === card.id;

            // Clean, Professional Alignment:
            // - การ์ดตั้งตรงเป็นระเบียบ (rotate: 0deg) สบายตา ไม่อ่านยาก
            // - การ์ดที่ลงได้ (Playable): ยกตัวลอยขึ้นชัดเจน (-16px)
            // - การ์ดที่ลงไม่ได้ (Locked): อยู่ระนาบฐานเรียบตรง (0px)
            // - การ์ดที่เลือก (Selected): ลอยขึ้นสูงสุด (-32px)
            let finalY = 0;
            if (isSelected) {
              finalY = -32;
            } else if (isMyTurn && playable) {
              finalY = -16;
            } else {
              finalY = 0;
            }

            return (
              <div
                key={card.id || `hand_card_${idx}`}
                className={`pro-card-slot ${isMyTurn && playable ? 'is-playable-slot' : ''} ${isMyTurn && !playable ? 'is-locked-slot' : ''} ${isSelected ? 'is-selected-slot' : ''}`}
                style={{
                  marginLeft: idx === 0 ? '0px' : `${marginOverlap}px`,
                  zIndex: isSelected ? 500 : (playable ? idx + 20 : idx + 1),
                  transform: `translateY(${finalY}px)`
                }}
                onClick={(e) => handleCardClick(card, playable, e)}
              >
                <CardComponent
                  card={card}
                  isPlayable={playable}
                  disabled={isMyTurn && !playable}
                  size={containerWidth < 480 ? 'sm' : 'md'}
                  showGlow={playable}
                  customStyle={{
                    width: `${baseCardWidth}px`,
                    height: `${baseCardWidth * 1.5}px`
                  }}
                />

                {/* Single PLAY action button on selected playable card */}
                {isSelected && playable && (
                  <button
                    className="pro-cast-confirm-btn animate-scale-up"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayCard(card);
                      setSelectedCardId(null);
                    }}
                  >
                    ลงไพ่
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
