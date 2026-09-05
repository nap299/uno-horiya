// src/components/game/GameOverModal.jsx - Cinematic Victory Showcase & Results
import React, { useState, useEffect, useRef } from 'react';
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

  // Trigger celebration sound when entering RESULT phase
  useEffect(() => {
    if (phase === 'RESULT' && isSelfWinner) {
      sound.playVictory();
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
    <>
      {phase === 'EFFECT' ? (
        /* Phase 1: 100% Fullscreen Seamless Winner Effect */
        <div className="winner-fullscreen-backdrop animate-fade-in">
          {/* Ambient Blurred Background Layer (fills any screen ratio seamlessly) */}
          <div className="winner-ambient-layer">
            {effect.type === 'video' ? (
              <video
                src={effect.src}
                autoPlay
                loop
                playsInline
                muted
                className="winner-ambient-media"
              />
            ) : (
              <img
                src={effect.src}
                alt=""
                className="winner-ambient-media"
              />
            )}
          </div>

          {/* Main Focused Media Layer (Full Screen Edge-to-Edge) */}
          <div className="winner-fullscreen-media-container">
            {effect.type === 'video' ? (
              <video
                ref={videoRef}
                src={effect.src}
                autoPlay
                playsInline
                muted
                preload="auto"
                className="winner-fullscreen-media-video"
                onEnded={handleEffectFinish}
                onError={(e) => {
                  console.warn('Winner video playback error:', e);
                  handleEffectFinish();
                }}
              />
            ) : (
              <img
                src={effect.src}
                alt={effect.title || 'Victory Effect'}
                className="winner-fullscreen-media-img animate-image-glow"
                onError={(e) => {
                  console.warn('Winner image load error:', e);
                  handleEffectFinish();
                }}
              />
            )}
          </div>

          {/* Floating Subtle Top Overlay (No borders, gradient fade) */}
          <div className="winner-floating-header">
            <div className="winner-floating-badge">
              <Trophy className="text-gold animate-bounce" size={22} />
              <span className="winner-floating-title">
                {isSelfWinner ? 'คุณคือผู้ชนะ!' : `ชัยชนะของ ${winner?.name || 'ผู้เล่น'}`}
              </span>
            </div>
            <button 
              className="winner-floating-skip-btn" 
              onClick={handleEffectFinish}
              title="ข้ามเอฟเฟค"
            >
              <span>ข้าม</span>
              <FastForward size={14} />
            </button>
          </div>

          {/* Floating Subtle Bottom Overlay (No borders, gradient fade) */}
          <div className="winner-floating-footer">
            <div className="winner-floating-info">
              <span className="winner-floating-name">{winner?.name || 'ผู้ชนะ'}</span>
              <span className="winner-floating-dot">•</span>
              <span className="winner-floating-badge-text">{winner?.title || effect.title}</span>
            </div>

            {effect.type === 'image' && (
              <div className="winner-floating-progress-track">
                <div 
                  className="winner-floating-progress-thumb" 
                  style={{ width: `${imageProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Phase 2: Victory Summary with "เล่นใหม่" และ "ไปล็อบบี้" */
        <div className="modal-backdrop winner-backdrop-overlay">
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
      </div>
      )}
    </>
  );
}
