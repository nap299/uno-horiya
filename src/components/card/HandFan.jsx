// src/components/card/HandFan.jsx - Natural Curved Fan with Swipe-Up Play (Duel Links Style)
import React, { useState, useEffect, useRef } from 'react';
import CardComponent from './CardComponent';
import { canPlayCard } from '../../../server/gameEngine';
import { sound } from '../../audio/soundEngine';
import { ChevronUp, Flame } from 'lucide-react';

const COLOR_NAMES_TH = {
  ruby: 'สีแดง',
  sapphire: 'สีน้ำเงิน',
  emerald: 'สีเขียว',
  amber: 'สีเหลือง',
  celestial: 'เปลี่ยนสี'
};

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
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [draggingCardId, setDraggingCardId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  const dragStartRef = useRef({ x: 0, y: 0, time: 0 });
  const isDraggingRef = useRef(false);
  const draggedComboRef = useRef([]);

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

  // Auto-clean selected cards if any were played or removed
  useEffect(() => {
    if (selectedCardIds.length > 0) {
      const validIds = selectedCardIds.filter(id => hand.some(c => c.id === id));
      if (validIds.length !== selectedCardIds.length) {
        setSelectedCardIds(validIds);
      }
    }
  }, [hand, selectedCardIds]);

  // Global tap-outside deselect
  useEffect(() => {
    if (selectedCardIds.length === 0) return;

    const handleGlobalTap = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSelectedCardIds([]);
        draggedComboRef.current = [];
      }
    };

    window.addEventListener('pointerdown', handleGlobalTap);
    return () => window.removeEventListener('pointerdown', handleGlobalTap);
  }, [selectedCardIds]);

  // Card geometry calculations
  const baseCardWidth = containerWidth < 480 ? 74 : 86;
  const naturalOverlap = -baseCardWidth * 0.46; // ~46% overlap keeps left corner symbols 100% visible

  let marginOverlap = naturalOverlap;
  if (cardCount > 1) {
    const availableWidth = Math.min(containerWidth * 0.94, 760);
    const totalWidthNatural = baseCardWidth + (cardCount - 1) * (baseCardWidth + naturalOverlap);

    if (totalWidthNatural > availableWidth) {
      // Smoothly compress if player has many cards (8+ cards)
      marginOverlap = (availableWidth - (cardCount * baseCardWidth)) / (cardCount - 1);
      const maxNegative = -(baseCardWidth - 24); // Keep at least 24px of left edge visible
      if (marginOverlap < maxNegative) {
        marginOverlap = maxNegative;
      }
    }
  }

  // Only number cards (0 - 9) are allowed to be played in multiples
  const isPlayableAsMultiple = (c) => c && c.type === 'number' && typeof c.value === 'number' && c.value >= 0 && c.value <= 9;

  // Auto-group same value cards together: all matching numbers (0-9) go together!
  const handleCardTap = (card, playable) => {
    const isMultiAllowed = isPlayableAsMultiple(card);

    if (!isMultiAllowed) {
      if (selectedCardIds.length === 1 && selectedCardIds[0] === card.id) {
        // Tapped again -> play it if directly playable
        if (canPlayCard(card, topCard, activeColor, stackedDrawCount, rules)) {
          sound.playCard(card.color);
          onPlayCard(card);
          setSelectedCardIds([]);
          draggedComboRef.current = [];
        }
      } else {
        setSelectedCardIds([card.id]);
        draggedComboRef.current = [card];
        sound.playCard(card.color);
      }
      return;
    }

    const currentSelectedCards = selectedCardIds.map(id => hand.find(c => c.id === id)).filter(Boolean);
    const firstSelected = currentSelectedCards[0];

    const isSameGroup = (firstSelected && isPlayableAsMultiple(firstSelected) && card.value === firstSelected.value);

    if (!isSameGroup) {
      // Auto-select ALL matching cards in hand sharing this number 0-9!
      const matchingCards = hand.filter(c => isPlayableAsMultiple(c) && c.value === card.value);

      if (matchingCards.length > 1) {
        // Put the tapped card at the end of the array so it is on TOP (determining color)
        const reordered = [...matchingCards.filter(c => c.id !== card.id), card];
        setSelectedCardIds(reordered.map(c => c.id));
        draggedComboRef.current = reordered;
      } else {
        setSelectedCardIds([card.id]);
        draggedComboRef.current = [card];
      }
      sound.playCard(card.color);
      return;
    }

    // Tapping within an already selected combo of the same value:
    const isTopCard = selectedCardIds[selectedCardIds.length - 1] === card.id;

    if (!isTopCard) {
      // Tapped a different card in the group: cycle it to the top!
      const reordered = [...selectedCardIds.filter(id => id !== card.id), card.id];
      setSelectedCardIds(reordered);
      draggedComboRef.current = reordered.map(id => hand.find(c => c.id === id)).filter(Boolean);
      sound.playCard(card.color);
    } else {
      // Double-tapped the top card: play the combo!
      const canPlayCombo = currentSelectedCards.some(c =>
        canPlayCard(c, topCard, activeColor, stackedDrawCount, rules)
      );
      if (canPlayCombo) {
        const topPlayed = currentSelectedCards[currentSelectedCards.length - 1];
        sound.playCard(topPlayed.color);
        onPlayCard(currentSelectedCards);
        setSelectedCardIds([]);
        draggedComboRef.current = [];
      }
    }
  };

  // Pointer Drag-to-Play Event Handlers (Yu-Gi-Oh! Duel Links Style - Window Level)
  const handlePointerDown = (card, playable, e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startTime = Date.now();

    dragStartRef.current = { x: startX, y: startY, time: startTime };
    isDraggingRef.current = true;
    setDraggingCardId(card.id);
    setDragOffset({ x: 0, y: 0 });

    const isMultiAllowed = isPlayableAsMultiple(card);
    let combo = [card];

    if (isMultiAllowed) {
      if (selectedCardIds.includes(card.id) && selectedCardIds.length > 1) {
        const existing = selectedCardIds.map(id => hand.find(c => c.id === id)).filter(Boolean);
        combo = [...existing.filter(c => c.id !== card.id), card];
      } else {
        const sameVal = hand.filter(c => isPlayableAsMultiple(c) && c.value === card.value);
        if (sameVal.length > 1) {
          combo = [...sameVal.filter(c => c.id !== card.id), card];
        }
      }
    }

    draggedComboRef.current = combo;
    setSelectedCardIds(combo.map(c => c.id));

    let lastClampedY = 0;

    const onGlobalMove = (moveEvt) => {
      if (!isDraggingRef.current) return;
      const rawDy = moveEvt.clientY - startY;
      const rawDx = moveEvt.clientX - startX;

      const clampedY = rawDy < 0 ? rawDy : rawDy * 0.15;
      const clampedX = rawDx * 0.4;
      lastClampedY = clampedY;

      setDragOffset({ x: clampedX, y: clampedY });
    };

    const onGlobalUp = (upEvt) => {
      window.removeEventListener('pointermove', onGlobalMove);
      window.removeEventListener('pointerup', onGlobalUp);
      window.removeEventListener('pointercancel', onGlobalCancel);

      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      const rawDy = upEvt.clientY - startY;
      const rawDx = upEvt.clientX - startX;
      const dt = Date.now() - startTime;

      // Generous, smooth upward release threshold:
      // Dragged up > 35px OR flicked up > 20px
      const isSwipeUp = rawDy < -35 || lastClampedY < -35 || (rawDy < -20 && dt < 350);

      const cardsToPlay = (isMultiAllowed && draggedComboRef.current && draggedComboRef.current.length > 0)
        ? draggedComboRef.current
        : [card];

      // Check if the combo can be played: at least one card must match topCard / activeColor
      const canPlayCombo = cardsToPlay.some(c =>
        canPlayCard(c, topCard, activeColor, stackedDrawCount, rules)
      );

      if (canPlayCombo && isSwipeUp) {
        const topPlayed = cardsToPlay[cardsToPlay.length - 1];
        sound.playCard(topPlayed.color);
        onPlayCard(cardsToPlay);
        setSelectedCardIds([]);
        draggedComboRef.current = [];
        setDraggingCardId(null);
        setDragOffset({ x: 0, y: 0 });
        return;
      }

      // Small displacement (< 12px) = tap/click
      const isTap = Math.abs(rawDy) < 12 && Math.abs(rawDx) < 12;
      if (isTap) {
        handleCardTap(card, playable);
      }

      // Snap back
      draggedComboRef.current = [];
      setDraggingCardId(null);
      setDragOffset({ x: 0, y: 0 });
    };

    const onGlobalCancel = () => {
      window.removeEventListener('pointermove', onGlobalMove);
      window.removeEventListener('pointerup', onGlobalUp);
      window.removeEventListener('pointercancel', onGlobalCancel);
      isDraggingRef.current = false;
      draggedComboRef.current = [];
      setDraggingCardId(null);
      setDragOffset({ x: 0, y: 0 });
    };

    window.addEventListener('pointermove', onGlobalMove, { passive: true });
    window.addEventListener('pointerup', onGlobalUp);
    window.addEventListener('pointercancel', onGlobalCancel);
  };

  const handlePointerCancel = () => {
    isDraggingRef.current = false;
    draggedComboRef.current = [];
    setDraggingCardId(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleBackgroundTap = () => {
    setSelectedCardIds([]);
    draggedComboRef.current = [];
  };

  const lastSelectedId = selectedCardIds[selectedCardIds.length - 1];
  const lastSelectedCard = hand.find(c => c.id === lastSelectedId);

  return (
    <div className="pro-hand-fan-wrapper" ref={wrapperRef} onClick={handleBackgroundTap}>
      {/* Curved Fan Container (Yu-Gi-Oh! Duel Links Hand Arc) */}
      <div
        ref={containerRef}
        className={`pro-fan-container ${!isMyTurn ? 'not-my-turn' : ''}`}
      >
        <div className="pro-fan-row">
          {hand.map((card, idx) => {
            const isCardDirectlyPlayable = canPlayCard(card, topCard, activeColor, stackedDrawCount, rules);
            const isMultiAllowed = isPlayableAsMultiple(card);
            const hasPlayableSibling = isMultiAllowed && hand.some(other =>
              other.id !== card.id &&
              isPlayableAsMultiple(other) &&
              other.value === card.value &&
              canPlayCard(other, topCard, activeColor, stackedDrawCount, rules)
            );
            const playable = isMyTurn && (isCardDirectlyPlayable || hasPlayableSibling);
            const selectIndex = selectedCardIds.indexOf(card.id);
            const isSelected = selectIndex !== -1;
            const isTopSelected = isSelected && selectIndex === selectedCardIds.length - 1;

            const isThisCardDragged = draggingCardId === card.id;
            const isGroupDragged = isDraggingRef.current && selectedCardIds.includes(draggingCardId) && isSelected;
            const isDragging = isThisCardDragged || isGroupDragged;

            // Natural Hand Curve Math (Arc Fan):
            const mid = (cardCount - 1) / 2;
            const t = cardCount > 1 ? (idx - mid) / mid : 0;

            const maxRot = Math.min(15, 4 + cardCount * 1.6);
            const baseRot = t * maxRot;

            const maxDroop = Math.min(18, 4 + cardCount * 1.8);
            const baseDroop = (t * t) * maxDroop;

            // Dynamic offsets
            let finalY = baseDroop;
            let finalX = 0;
            let finalRot = baseRot;
            let finalScale = 1;

            if (isDragging) {
              finalY = (isSelected ? baseDroop - 32 : baseDroop) + dragOffset.y;
              finalX = dragOffset.x;
              finalRot = baseRot * 0.25;
              finalScale = 1.1;
            } else if (isSelected) {
              finalY = baseDroop - 32;
              finalRot = baseRot * 0.35;
              finalScale = 1.08;
            }

            const isReleaseReady = isThisCardDragged && dragOffset.y < -35;

            // Z-Index:
            // Non-selected cards: idx + 1 (strictly preserved left-to-right stacking)
            // Selected cards: 900 + selectIndex (so the LAST card selected is on TOP!)
            let cardZIndex = idx + 1;
            if (isDragging) {
              cardZIndex = 990 + (selectIndex !== -1 ? selectIndex : 5);
            } else if (isSelected) {
              cardZIndex = 900 + selectIndex;
            }

            return (
              <div
                key={card.id || `hand_card_${idx}`}
                className={`pro-card-slot ${!isMyTurn ? 'is-not-my-turn is-locked-slot' : (playable ? 'is-playable-slot' : 'is-locked-slot')} ${isSelected ? 'is-selected-slot' : ''} ${isTopSelected ? 'is-top-selected-slot' : ''} ${isDragging ? 'is-dragging-slot' : ''}`}
                style={{
                  marginLeft: idx === 0 ? '0px' : `${marginOverlap}px`,
                  zIndex: cardZIndex,
                  transform: `translate3d(${finalX}px, ${finalY}px, 0) rotate(${finalRot}deg) scale(${finalScale})`,
                  touchAction: 'none'
                }}
                onPointerDown={(e) => isMyTurn && handlePointerDown(card, playable, e)}
              >
                {/* Natural Stack Order Badge for Multi-Selection */}
                {selectedCardIds.length > 1 && isSelected && (
                  <div className={`combo-order-badge ${isTopSelected ? 'is-top-badge animate-bounce' : ''}`}>
                    <span className="combo-num">#{selectIndex + 1}</span>
                    {isTopSelected && (
                      <span className="combo-tag">
                        สี: {COLOR_NAMES_TH[card.color] || ''}
                      </span>
                    )}
                  </div>
                )}

                <CardComponent
                  card={card}
                  isPlayable={playable}
                  disabled={!isMyTurn || !playable}
                  size={containerWidth < 480 ? 'sm' : 'md'}
                  showGlow={isSelected}
                  customStyle={{
                    width: `${baseCardWidth}px`,
                    height: `${Math.round(baseCardWidth * 1.5)}px`
                  }}
                />

                {/* Release to Play Glowing Indicator (Duel Links Slide-Up) */}
                {isReleaseReady && (
                  <div className="drag-release-indicator animate-pulse-glow">
                    <Flame size={12} />
                    <span>
                      {selectedCardIds.length > 1
                        ? `ปล่อยเพื่อลง ${selectedCardIds.length} ใบ (สี: ${COLOR_NAMES_TH[lastSelectedCard?.color] || ''})`
                        : 'ปล่อยเพื่อลงการ์ด'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
