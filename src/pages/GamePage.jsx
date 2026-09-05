// src/pages/GamePage.jsx - HORIYA 5-Player Mobile Arena with Circular Vortex Table & 3D Flow Arrows
import React, { useState, useEffect, useRef } from 'react';
import { useGameSocket } from '../context/GameSocketContext';
import { useAuth } from '../context/AuthContext';
import CardComponent from '../components/card/CardComponent';
import HandFan from '../components/card/HandFan';
import ColorPickerModal from '../components/card/ColorPickerModal';
import PlayerAvatar from '../components/game/PlayerAvatar';
import UnoButton from '../components/game/UnoButton';
import GameOverModal from '../components/game/GameOverModal';
import SpellEffect from '../components/effects/SpellEffect';
import { ELEMENT_THEMES } from '../models/cardThemes';
import { canPlayCard } from '../../server/gameEngine';
import { ShieldAlert, Layers, PlusCircle, Crown } from 'lucide-react';
import { AvatarIcon } from '../utils/IconRenderer';
import SoundControl from '../components/common/SoundControl';

// Sub-component for Smooth 3D Sweeping Game Flow Arrows
function TurnFlowArrows({ direction = 1 }) {
  const isClockwise = direction === 1;

  return (
    <div className={`arena-direction-arrows ${isClockwise ? 'dir-clockwise' : 'dir-counter'}`}>
      {/* Top Sweeping Arrow */}
      <div className="curved-arrow-box arrow-box-top">
        <svg viewBox="0 0 100 36" className="curved-svg-arrow">
          <defs>
            <linearGradient id={`arrowGradTop_${direction}`} x1={isClockwise ? "0%" : "100%"} y1="0%" x2={isClockwise ? "100%" : "0%"} y2="0%">
              <stop offset="0%" stopColor="#FFAA00" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#FF8800" />
              <stop offset="100%" stopColor="#FF3300" />
            </linearGradient>
            <filter id={`arrowShadowTop_${direction}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.8" />
            </filter>
          </defs>
          {isClockwise ? (
            /* Clockwise: sweeps Left -> Right over top */
            <path
              d="M 6 26 Q 50 3 80 12 L 74 4 L 96 13 L 81 28 L 77 20 Q 50 11 11 32 Z"
              fill={`url(#arrowGradTop_${direction})`}
              filter={`url(#arrowShadowTop_${direction})`}
            />
          ) : (
            /* Counter-Clockwise: sweeps Right -> Left over top */
            <path
              d="M 94 26 Q 50 3 20 12 L 26 4 L 4 13 L 19 28 L 23 20 Q 50 11 89 32 Z"
              fill={`url(#arrowGradTop_${direction})`}
              filter={`url(#arrowShadowTop_${direction})`}
            />
          )}
        </svg>
      </div>

      {/* Bottom Sweeping Arrow */}
      <div className="curved-arrow-box arrow-box-bottom">
        <svg viewBox="0 0 100 36" className="curved-svg-arrow">
          <defs>
            <linearGradient id={`arrowGradBottom_${direction}`} x1={isClockwise ? "100%" : "0%"} y1="0%" x2={isClockwise ? "0%" : "100%"} y2="0%">
              <stop offset="0%" stopColor="#FFAA00" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#FF8800" />
              <stop offset="100%" stopColor="#FF3300" />
            </linearGradient>
            <filter id={`arrowShadowBottom_${direction}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.8" />
            </filter>
          </defs>
          {isClockwise ? (
            /* Clockwise: sweeps Right -> Left under bottom */
            <path
              d="M 94 10 Q 50 33 20 24 L 26 32 L 4 23 L 19 8 L 23 16 Q 50 25 89 4 Z"
              fill={`url(#arrowGradBottom_${direction})`}
              filter={`url(#arrowShadowBottom_${direction})`}
            />
          ) : (
            /* Counter-Clockwise: sweeps Left -> Right under bottom */
            <path
              d="M 6 10 Q 50 33 80 24 L 74 32 L 96 23 L 81 8 L 77 16 Q 50 25 11 4 Z"
              fill={`url(#arrowGradBottom_${direction})`}
              filter={`url(#arrowShadowBottom_${direction})`}
            />
          )}
        </svg>
      </div>
    </div>
  );
}

export default function GamePage() {
  const { user } = useAuth();
  const {
    socket,
    room,
    gameState,
    timeRemaining,
    activeSpell,
    playCard,
    drawCard,
    shoutUno,
    calloutUno,
    startGame,
    leaveRoom
  } = useGameSocket();

  const [pendingWildCard, setPendingWildCard] = useState(null);

  if (!gameState || !room) return null;

  const myId = socket?.id;
  const players = gameState.players || [];
  const myPlayer = players.find(p => p.id === myId) || room?.players?.find(p => p.id === myId);
  const currentAvatar = myPlayer?.avatar || user?.avatar || 'flame';
  const currentName = myPlayer?.name || user?.name || 'ผู้เล่น';
  const currentTitle = myPlayer?.title || user?.title || 'นักเวทฝึกหัด';

  const myIndex = players.findIndex(p => p.id === myId);
  const currentPlayer = players[gameState.currentTurnIndex];
  const isMyTurn = currentPlayer?.id === myId;
  const myHand = gameState.myHand || [];
  const topCard = gameState.topCard;
  const activeColor = gameState.activeColor || topCard?.color || 'ruby';
  const theme = ELEMENT_THEMES[activeColor] || ELEMENT_THEMES.ruby;

  // ตรวจสอบว่าในมือมีไพ่ที่สามารถลงได้หรือไม่
  const hasPlayableCard = myHand.some(card =>
    canPlayCard(card, topCard, activeColor, gameState.stackedDrawCount, gameState.rules)
  );
  const mustDraw = isMyTurn && !hasPlayableCard;

  // สถานะการเรียก UNO: แสดงผลทันทีเมื่อกด และจะกดได้เมื่อเหลือไพ่ใบเดียวเท่านั้น
  const [localCalledUno, setLocalCalledUno] = useState(false);

  useEffect(() => {
    if (myHand.length !== 1) {
      setLocalCalledUno(false);
    }
  }, [myHand.length]);

  const myUnoState = gameState.playerCardCounts?.[myId] || { hasCalledUno: false, count: myHand.length };
  const hasCalledUno = myUnoState.hasCalledUno || localCalledUno;
  const canCallUno = myHand.length === 1 && !hasCalledUno;
  const isUrgentUno = myHand.length === 1 && !hasCalledUno;

  const handleShoutUno = () => {
    setLocalCalledUno(true);
    sound.playUnoShout();
    shoutUno();
  };

  // เรียงคู่ต่อสู้ให้ขึ้นอยู่กับตำแหน่งของตัวเอง (สูงสุด 4 คนรอบโต๊ะ)
  const reorderedOpponents = [];
  if (myIndex !== -1) {
    for (let i = 1; i < players.length; i++) {
      const idx = (myIndex + i) % players.length;
      reorderedOpponents.push(players[idx]);
    }
  } else {
    reorderedOpponents.push(...players);
  }

  const handlePlayCard = (cardOrCards) => {
    if (!isMyTurn) return;
    const cards = Array.isArray(cardOrCards) ? cardOrCards : [cardOrCards];
    const topPlayedCard = cards[cards.length - 1];

    if (topPlayedCard.type === 'wild' || topPlayedCard.type === 'wild_draw4') {
      setPendingWildCard(cards);
    } else {
      const cardIds = cards.map(c => c.id);
      playCard(cardIds.length === 1 ? cardIds[0] : cardIds);
    }
  };

  const handleSelectWildColor = (chosenColor) => {
    if (pendingWildCard) {
      const cards = Array.isArray(pendingWildCard) ? pendingWildCard : [pendingWildCard];
      const cardIds = cards.map(c => c.id);
      playCard(cardIds.length === 1 ? cardIds[0] : cardIds, chosenColor);
      setPendingWildCard(null);
    }
  };

  const handleDraw = () => {
    if (isMyTurn) drawCard();
  };

  // Auto-draw when time runs out on the player's turn
  const hasAutoDrawnRef = useRef(false);
  useEffect(() => {
    if (isMyTurn && timeRemaining != null && timeRemaining <= 0) {
      if (!hasAutoDrawnRef.current) {
        hasAutoDrawnRef.current = true;
        handleDraw();
      }
    } else {
      hasAutoDrawnRef.current = false;
    }
  }, [timeRemaining, isMyTurn]);

  return (
    <div
      className="mobile-arena-container"
      style={{
        '--active-element-glow': theme.glow,
        '--active-element-primary': theme.primary
      }}
    >
      <SpellEffect spell={activeSpell} />

      {/* 1. Top HUD Bar */}
      <div className="mobile-top-hud">
        <div className="hud-left-group">
          <SoundControl />
        </div>

        <div className={`hud-turn-notice ${isMyTurn ? 'notice-self animate-pulse-glow' : ''}`}>
          <span>{isMyTurn ? 'ตาของคุณ' : `ตาของ ${currentPlayer?.name?.split(' ')[0]}`}</span>
          {timeRemaining != null && (
            <span className={`hud-timer-count ${timeRemaining <= 5 ? 'timer-urgent-text' : ''}`}>
              {timeRemaining}s
            </span>
          )}
        </div>
      </div>

      {/* 2. Opponents 5-Player Circular Arc Layout */}
      <div className={`mobile-opponents-arc opponents-count-${reorderedOpponents.length}`}>
        {reorderedOpponents.map((opp, index) => {
          const oppCardData = gameState.playerCardCounts?.[opp.id] || { count: 7, hasCalledUno: false, mustCallUno: false };
          const isOppTurn = currentPlayer?.id === opp.id;

          return (
            <div key={opp.id} className={`opponent-slot slot-pos-${index + 1}`}>
              <PlayerAvatar
                player={opp}
                cardCount={oppCardData.count}
                isCurrentTurn={isOppTurn}
                timeRemaining={timeRemaining}
                maxTime={room.rules.turnTimer || 20}
                hasCalledUno={oppCardData.hasCalledUno}
                mustCallUno={oppCardData.mustCallUno}
                onCalloutUno={(targetId) => calloutUno(targetId)}
              />
            </div>
          );
        })}
      </div>

      {/* 3. Center Circular Table Arena */}
      <div className="mobile-center-table">
        {/* Golden Ring with 3D Sweeping Direction Arrows */}
        <div className="mobile-summoning-circle">
          <TurnFlowArrows direction={gameState.direction || 1} />
        </div>

        <div className="mobile-table-piles">
          {/* Draw Pile (Left - Face-Down Deck) */}
          <div
            className={`mobile-draw-deck ${isMyTurn ? 'deck-active' : ''} ${mustDraw ? 'deck-must-draw' : ''} ${gameState.stackedDrawCount > 0 ? 'deck-has-penalty' : ''}`}
            onClick={handleDraw}
          >
            <div className="deck-shadow-3" />
            <div className="deck-shadow-2" />
            <div className="deck-shadow-1" />
            <CardComponent
              isBack={true}
              size="md"
              customStyle={{ cursor: isMyTurn ? 'pointer' : 'default' }}
            />
            <div className="mobile-deck-count">
              <Layers size={10} />
              <span>{gameState.drawPileCount || 90}</span>
            </div>

            {/* Stacked Draw Penalty Alert: Rendered directly on the face-down deck */}
            {gameState.stackedDrawCount > 0 && (
              <div className="deck-stacked-draw-badge animate-bounce">
                <ShieldAlert size={13} />
                <span>+{gameState.stackedDrawCount} ใบ</span>
              </div>
            )}
          </div>

          {/* Discard Pile (Center) */}
          <div className="mobile-discard-pile">
            {/* Any Color Free Play Indicator after Reverse */}
            {activeColor === 'any' && (
              <div className="discard-any-color-badge animate-bounce">
                <span>ลงสีไหนก็ได้</span>
              </div>
            )}
            {topCard ? (
              <div className="mobile-top-card animate-card-drop">
                <CardComponent card={topCard} size="md" showGlow={false} />
              </div>
            ) : (
              <div className="empty-pile-placeholder">ลงไพ่ใบแรก</div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Action & Alert Controls (UNO Shout Button) */}
      <div className="mobile-floating-actions">
        <div className="floating-actions-spacer" />

        <UnoButton
          onShoutUno={handleShoutUno}
          hasCalledUno={hasCalledUno}
          canCall={canCallUno}
          isUrgent={isUrgentUno}
        />
      </div>

      {/* 5. Pure Hand Fan (Centered, Natural Hand Arc without Profile Clutter) */}
      <div className="duel-bottom-deck-zone">
        <HandFan
          hand={myHand}
          topCard={topCard}
          activeColor={activeColor}
          stackedDrawCount={gameState.stackedDrawCount}
          rules={gameState.rules}
          isMyTurn={isMyTurn}
          onPlayCard={handlePlayCard}
        />
      </div>

      {pendingWildCard && (
        <ColorPickerModal
          onSelectColor={handleSelectWildColor}
          onClose={() => setPendingWildCard(null)}
        />
      )}

      {gameState.winner && (
        <GameOverModal
          winner={gameState.winner}
          isSelfWinner={gameState.winner.id === myId}
          onPlayAgain={() => {
            if (room.hostId === myId) {
              startGame();
            } else {
              leaveRoom();
            }
          }}
          onLeave={leaveRoom}
        />
      )}
    </div>
  );
}
