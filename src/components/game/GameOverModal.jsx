// src/components/game/GameOverModal.jsx - Victory Podium (No Emojis, No Sparkles)
import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Crown } from 'lucide-react';
import { AvatarIcon } from '../../utils/IconRenderer';
import { sound } from '../../audio/soundEngine';

export default function GameOverModal({ winner, isSelfWinner, onPlayAgain, onLeave }) {
  useEffect(() => {
    if (isSelfWinner) {
      sound.playVictory();
      const end = Date.now() + 2500;
      const colors = ['#FFD700', '#FF3366', '#00D2FC', '#00E676', '#B5179E'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isSelfWinner]);

  return (
    <div className="modal-backdrop">
      <div className={`gameover-dialog animate-scale-up ${isSelfWinner ? 'winner-glow' : ''}`}>
        <div className="victory-crown-wrapper">
          <Trophy className="victory-crown animate-bounce" size={42} />
        </div>

        <h1 className="victory-title">
          {isSelfWinner ? 'คุณคือผู้ชนะ! 🏆' : 'จบการประลอง'}
        </h1>

        <div className="winner-podium">
          <div className="winner-avatar-display">
            {winner?.avatar && winner.avatar.startsWith('http') ? (
              <img src={winner.avatar} alt={winner.name} className="podium-avatar-img" />
            ) : (
              <AvatarIcon iconId={winner?.avatar || 'flame'} size={54} />
            )}
          </div>
          <h2 className="winner-name">{winner?.name}</h2>
          <span className="winner-title-badge">{winner?.title || 'จอมเวทผู้พิชิต'}</span>
          <p className="winner-quote">"พลังการ์ดทั้งหมดสยบต่อผู้ชนะแห่ง HORIYA!"</p>
        </div>

        <div className="gameover-actions">
          <button className="btn-primary-action btn-rematch" onClick={onPlayAgain}>
            <RotateCcw size={16} />
            <span>เล่นอีกครั้ง</span>
          </button>
          <button className="btn-secondary-action btn-exit-lobby" onClick={onLeave}>
            <Home size={16} />
            <span>กลับสู่ล็อบบี้</span>
          </button>
        </div>
      </div>
    </div>
  );
}
