// src/pages/GamePage.jsx - HORIYA Mobile-First Arena (Clean UX, Prominent Draw & Smart UNO)
import React, { useState } from 'react';
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
import { ShieldAlert, Layers, PlusCircle } from 'lucide-react';

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

  // สถานะการเรียก UNO
  const myUnoState = gameState.playerCardCounts?.[myId] || { hasCalledUno: false, count: myHand.length };
  const canCallUno = !myUnoState.hasCalledUno && (myHand.length <= 2 || myUnoState.mustCallUno);
  const isUrgentUno = myHand.length <= 2 && !myUnoState.hasCalledUno;

  // เรียงคู่ต่อสู้ให้ขึ้นอยู่กับตำแหน่งของตัวเอง
  const reorderedOpponents = [];
  if (myIndex !== -1) {
    for (let i = 1; i < players.length; i++) {
      const idx = (myIndex + i) % players.length;
      reorderedOpponents.push(players[idx]);
    }
  } else {
    reorderedOpponents.push(...players);
  }

  const handlePlayCard = (card) => {
    if (!isMyTurn) return;
    if (card.type === 'wild' || card.type === 'wild_draw4') {
      setPendingWildCard(card);
    } else {
      playCard(card.id);
    }
  };

  const handleSelectWildColor = (chosenColor) => {
    if (pendingWildCard) {
      playCard(pendingWildCard.id, chosenColor);
      setPendingWildCard(null);
    }
  };

  const handleDraw = () => {
    if (isMyTurn) drawCard();
  };

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
        <div className="hud-room-badge">
          <span className="hud-sanctum-dot" />
          <span className="hud-code">{room.code}</span>
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

      {/* 2. Opponents Top Bar */}
      <div className="mobile-opponents-bar">
        {reorderedOpponents.map((opp) => {
          const oppCardData = gameState.playerCardCounts?.[opp.id] || { count: 7, hasCalledUno: false, mustCallUno: false };
          const isOppTurn = currentPlayer?.id === opp.id;

          return (
            <PlayerAvatar
              key={opp.id}
              player={opp}
              cardCount={oppCardData.count}
              isCurrentTurn={isOppTurn}
              timeRemaining={timeRemaining}
              maxTime={room.rules.turnTimer || 20}
              hasCalledUno={oppCardData.hasCalledUno}
              mustCallUno={oppCardData.mustCallUno}
              onCalloutUno={(targetId) => calloutUno(targetId)}
            />
          );
        })}
      </div>

      {/* 3. Center Arena Table */}
      <div className="mobile-center-table">
        <div className="mobile-summoning-circle" style={{ borderColor: theme.primary }} />

        {/* Stacked Draw Penalty Alert */}
        {gameState.stackedDrawCount > 0 && (
          <div className="mobile-stacked-banner animate-bounce">
            <ShieldAlert size={14} />
            <span>โดนซ้อนไพ่ +{gameState.stackedDrawCount} ใบ!</span>
          </div>
        )}

        <div className="mobile-table-piles">
          {/* Draw Pile */}
          <div
            className={`mobile-draw-deck ${isMyTurn ? 'deck-active' : ''} ${mustDraw ? 'deck-must-draw' : ''}`}
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
            {isMyTurn && (
              <div className={`mobile-draw-badge ${mustDraw ? 'badge-urgent-draw animate-bounce' : 'animate-pulse-glow'}`}>
                <PlusCircle size={12} />
                <span>
                  {gameState.stackedDrawCount > 0
                    ? `จั่ว +${gameState.stackedDrawCount}`
                    : (mustDraw ? 'กดจั่วไพ่' : 'จั่วไพ่')}
                </span>
              </div>
            )}
            <div className="mobile-deck-count">
              <Layers size={10} />
              <span>{gameState.drawPileCount || 90}</span>
            </div>
          </div>

          {/* Discard Pile */}
          <div className="mobile-discard-pile">
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

      {/* 4. Floating Action Controls (UNO & Hint) */}
      <div className="mobile-floating-actions">
        <div className="hand-status-indicator">
          {isMyTurn && mustDraw && (
            <span className="must-draw-text-hint animate-fade-in">
              ไม่มีไพ่ที่ลงได้ — กดที่กองจั่วไพ่
            </span>
          )}
        </div>

        <UnoButton
          onShoutUno={shoutUno}
          hasCalledUno={myUnoState.hasCalledUno}
          canCall={canCallUno}
          isUrgent={isUrgentUno}
        />
      </div>

      {/* 5. Hand Fan */}
      <HandFan
        hand={myHand}
        topCard={topCard}
        activeColor={activeColor}
        stackedDrawCount={gameState.stackedDrawCount}
        rules={gameState.rules}
        isMyTurn={isMyTurn}
        onPlayCard={handlePlayCard}
      />

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
