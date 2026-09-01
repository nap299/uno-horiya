// src/components/game/PlayerAvatar.jsx - HORIYA Player Seat & Status (No Emojis)
import React from 'react';
import { AlertCircle, Bot, Crown, Layers } from 'lucide-react';
import { AvatarIcon, ReactionIcon } from '../../utils/IconRenderer';

export default function PlayerAvatar({
  player,
  cardCount = 7,
  isCurrentTurn = false,
  timeRemaining = 20,
  maxTime = 20,
  hasCalledUno = false,
  mustCallUno = false,
  onCalloutUno,
  isSelf = false,
  floatingEmote = null
}) {
  if (!player) return null;

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = maxTime > 0 ? (timeRemaining / maxTime) : 1;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <div className={`player-seat ${isCurrentTurn ? 'seat-active-turn' : ''} ${isSelf ? 'seat-self' : ''}`}>
      {/* Floating Reaction */}
      {floatingEmote && (
        <div className="avatar-floating-emote animate-bounce-pop">
          <ReactionIcon id={floatingEmote.emoji} size={20} />
        </div>
      )}

      {/* UNO Shout Tag */}
      {hasCalledUno && (
        <div className="avatar-uno-badge animate-pulse-glow">
          <span>UNO!</span>
        </div>
      )}

      {/* Caught / Vulnerable UNO alert */}
      {mustCallUno && !hasCalledUno && !isSelf && onCalloutUno && (
        <button
          className="avatar-catch-btn animate-wobble"
          onClick={() => onCalloutUno(player.id)}
          title="จับผิดผู้เล่นที่ลืมกดเรียก UNO!"
        >
          <AlertCircle size={12} />
          <span>จับผิด!</span>
        </button>
      )}

      <div className="avatar-circle-wrapper">
        {/* SVG Turn Timer Ring */}
        {isCurrentTurn && maxTime > 0 && (
          <svg className="avatar-timer-svg" width="60" height="60">
            <circle
              className="timer-bg-circle"
              cx="30"
              cy="30"
              r={radius}
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="3"
              fill="transparent"
            />
            <circle
              className={`timer-progress-circle ${timeRemaining <= 5 ? 'timer-urgent' : ''}`}
              cx="30"
              cy="30"
              r={radius}
              stroke="url(#turnGradient)"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="turnGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FF2E63" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* Profile Image or SVG Avatar */}
        <div className="avatar-portrait">
          {player.avatar && player.avatar.startsWith('http') ? (
            <img src={player.avatar} alt={player.name} className="avatar-img" />
          ) : (
            <AvatarIcon iconId={player.avatar || 'flame'} size={22} />
          )}

          {player.isHost && (
            <span className="badge-icon host-badge" title="หัวหน้าห้อง">
              <Crown size={9} />
            </span>
          )}
          {player.isBot && (
            <span className="badge-icon bot-badge" title="บอท AI">
              <Bot size={9} />
            </span>
          )}
        </div>

        {/* Card Count Badge */}
        <div className={`card-count-pill ${cardCount === 1 ? 'pill-uno-alert' : ''}`}>
          <Layers size={9} />
          <span className="card-count-number">{cardCount}</span>
        </div>
      </div>

      <div className="player-details">
        <span className="player-name">{player.name}</span>
      </div>
    </div>
  );
}
