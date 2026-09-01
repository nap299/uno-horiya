// src/components/common/Header.jsx - HORIYA Navigation Bar (Clean SVG, No Emojis, No Sparkles)
import React, { useState, useEffect } from 'react';
import { BookOpen, Wifi, WifiOff, Crown, Maximize, Minimize } from 'lucide-react';
import SoundControl from './SoundControl';
import { useAuth } from '../../context/AuthContext';
import { useGameSocket } from '../../context/GameSocketContext';
import { AvatarIcon } from '../../utils/IconRenderer';

export default function Header({ onOpenProfile, onOpenRules }) {
  const { user } = useAuth();
  const { isConnected } = useGameSocket();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  return (
    <header className="global-app-header">
      <div className="header-brand">
        <div className="brand-icon-wrapper" title="HORIYA">
          <svg viewBox="0 0 32 32" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="6" width="11" height="17" rx="2.5" transform="rotate(-15 8.5 14.5)" fill="#FFD600" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="10.5" y="5" width="11" height="17" rx="2.5" fill="#168CFF" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="18" y="6" width="11" height="17" rx="2.5" transform="rotate(15 23.5 14.5)" fill="#FF1744" stroke="#FFFFFF" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="brand-text">
          <h1 className="brand-title">HORIYA</h1>
        </div>
      </div>

      <div className="header-center-status hide-mobile">
        <div className={`connection-pill ${isConnected ? 'conn-online' : 'conn-offline'}`}>
          {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{isConnected ? 'ออนไลน์' : 'กำลังเชื่อมต่อ...'}</span>
        </div>
      </div>

      <div className="header-actions">
        <SoundControl />

        <button
          className={`btn-header-action btn-fullscreen ${isFullscreen ? 'active' : ''}`}
          onClick={toggleFullscreen}
          title={isFullscreen ? 'ออกจากเต็มจอ' : 'เล่นแบบเต็มจอ'}
        >
          {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          <span className="hide-mobile">{isFullscreen ? 'ออก' : 'เต็มจอ'}</span>
        </button>

        <button
          className="btn-header-action btn-rules"
          onClick={onOpenRules}
          title="ดูกติกาการเล่น"
        >
          <BookOpen size={15} />
          <span className="hide-mobile">กติกา</span>
        </button>

        <button
          className="btn-header-profile"
          onClick={onOpenProfile}
          title="โปรไฟล์ผู้เล่น"
        >
          {user?.avatar && user.avatar.startsWith('http') ? (
            <img src={user.avatar} alt={user.name} className="profile-img" />
          ) : (
            <AvatarIcon iconId={user?.avatar || 'cat'} size={28} />
          )}
        </button>
      </div>
    </header>
  );
}
