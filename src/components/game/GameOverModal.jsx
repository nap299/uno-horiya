// src/components/game/GameOverModal.jsx - Cinematic Victory Showcase & Results
import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, FastForward, Play } from 'lucide-react';
import { AvatarIcon } from '../../utils/IconRenderer';
import { sound } from '../../audio/soundEngine';
import { getWinnerEffect } from '../../utils/winnerEffectHelper';

export default function GameOverModal({ winner, isSelfWinner, onPlayAgain, onLeave }) {
  // Phase 'EFFECT': Playing winner video/image effect
  // Phase 'RESULT': Showing victory podium with 'เล่นใหม่' and 'ไปล็อบบี้'
  const [phase, setPhase] = useState('EFFECT');
  const [imageProgress, setImageProgress] = useState(0);
  const videoRef = useRef(null);
  const effect = getWinnerEffect(winner);

  // Trigger celebration sound and confetti when entering RESULT phase
  useEffect(() => {
    if (phase === 'RESULT') {
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
    }
  }, [phase, isSelfWinner]);

  // Handler to transition from Effect to Result screen
  const handleEffectFinish = () => {
    setPhase('RESULT');
  };

  // Manage Effect duration and fallback timers
  useEffect(() => {
    if (phase !== 'EFFECT') return;

    if (effect.type === 'image') {
      const duration = 5000; // 5 seconds for visual impact
      const interval = 50;
      const step = (interval / duration) * 100;

      const timer = setInterval(() => {
        setImageProgress(prev => {
          if (prev + step >= 100) {
            clearInterval(timer);
            handleEffectFinish();
            return 100;
          }
          return prev + step;
        });
      }, interval);

      return () => clearInterval(timer);
    } else if (effect.type === 'video') {
      // Ensure video plays smoothly
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(err => {
          console.warn('Video autoplay notice:', err);
        });
      }

      // Safety timeout: in case onEnded doesn't fire, transition after 7 seconds
      const safetyTimer = setTimeout(() => {
        handleEffectFinish();
      }, 7200);

      return () => clearTimeout(safetyTimer);
    }
  }, [phase, effect]);

  return (
    <div className="modal-backdrop winner-backdrop-overlay">
      {phase === 'EFFECT' ? (
        /* Phase 1: Winner Cinematic Effect (Video or Image) */
        <div className="winner-showcase-dialog animate-scale-up">
          {/* Top Banner Header */}
          <div className="winner-showcase-header">
            <div className="winner-showcase-badge">
              <Trophy className="text-gold animate-bounce" size={20} />
              <span className="winner-showcase-title">
                {isSelfWinner ? 'คุณคือผู้ชนะ!' : `ชัยชนะของ ${winner?.name || 'ผู้เล่น'}`}
              </span>
            </div>
            <button 
              className="winner-showcase-skip" 
              onClick={handleEffectFinish}
              title="ข้ามเอฟเฟค"
            >
              <span>ข้าม</span>
              <FastForward size={14} />
            </button>
          </div>

          {/* Media Presentation Viewport */}
          <div className="winner-media-container">
            {effect.type === 'video' ? (
              <video
                ref={videoRef}
                src={effect.src}
                autoPlay
                playsInline
                muted
                preload="auto"
                className="winner-video-element"
                onEnded={handleEffectFinish}
                onError={(e) => {
                  console.warn('Winner video playback error:', e);
                  handleEffectFinish();
                }}
              />
            ) : (
              <div className="winner-image-container">
                <img
                  src={effect.src}
                  alt={effect.title || 'Victory Effect'}
                  className="winner-image-element animate-image-glow"
                  onError={(e) => {
                    console.warn('Winner image load error:', e);
                    handleEffectFinish();
                  }}
                />
              </div>
            )}
          </div>

          {/* Bottom Profile Info & Progress */}
          <div className="winner-showcase-footer">
            <div className="winner-showcase-subinfo">
              <span className="winner-char-name">{winner?.name || 'ผู้ชนะ'}</span>
              <span className="winner-char-dot">•</span>
              <span className="winner-char-badge">{winner?.title || effect.title}</span>
            </div>

            {effect.type === 'image' && (
              <div className="winner-progress-track">
                <div 
                  className="winner-progress-thumb" 
                  style={{ width: `${imageProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Phase 2: Victory Summary with "เล่นใหม่" และ "ไปล็อบบี้" */
        <div className={`gameover-dialog animate-scale-up ${isSelfWinner ? 'winner-glow' : ''}`}>
          <div className="victory-crown-wrapper">
            <Trophy className="victory-crown animate-bounce" size={44} />
          </div>

          <h1 className="victory-title">
            {isSelfWinner ? 'คุณคือผู้ชนะ! 🏆' : 'จบการประลอง'}
          </h1>

          <div className="winner-podium">
            <div className="winner-avatar-display">
              {winner?.avatar && String(winner.avatar).startsWith('http') ? (
                <img src={winner.avatar} alt={winner.name} className="podium-avatar-img" />
              ) : (
                <AvatarIcon iconId={winner?.avatar || 'cat'} size={58} />
              )}
            </div>
            <h2 className="winner-name">{winner?.name}</h2>
            <span className="winner-title-badge">{winner?.title || 'จอมเวทผู้พิชิต'}</span>
            <p className="winner-quote">"พลังการ์ดทั้งหมดสยบต่อผู้ชนะแห่ง HORIYA!"</p>

            {/* Replay Effect Button */}
            <button 
              className="btn-replay-effect"
              onClick={() => {
                setImageProgress(0);
                setPhase('EFFECT');
              }}
              title="ดูเอฟเฟคผู้ชนะอีกครั้ง"
            >
              <Play size={13} />
              <span>ดูเอฟเฟคอีกครั้ง</span>
            </button>
          </div>

          {/* Player Actions: 'เล่นใหม่' และ 'ไปล็อบบี้' */}
          <div className="gameover-actions">
            <button className="btn-primary-action btn-rematch" onClick={onPlayAgain}>
              <RotateCcw size={16} />
              <span>เล่นใหม่</span>
            </button>
            <button className="btn-secondary-action btn-exit-lobby" onClick={onLeave}>
              <Home size={16} />
              <span>ไปล็อบบี้</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
