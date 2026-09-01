// src/pages/LobbyPage.jsx - HORIYA Senior Game UX/UI Lobby
import React, { useState } from 'react';
import {
  Swords,
  Plus,
  LogIn,
  Trophy,
  Flame,
  Shield,
  ChevronRight,
  Zap,
  Sliders,
  Sparkles,
  Users,
  Bot,
  Play
} from 'lucide-react';
import { useGameSocket } from '../context/GameSocketContext';
import { useAuth } from '../context/AuthContext';
import { ELEMENT_THEMES } from '../models/cardThemes';
import { ElementIcon, AvatarIcon } from '../utils/IconRenderer';
import { sound } from '../audio/soundEngine';
import CreateRoomModal from '../features/room/CreateRoomModal';

export default function LobbyPage({ onOpenProfile, onOpenRules }) {
  const { user } = useAuth();
  const { createRoom, joinRoom, errorMsg, clearError } = useGameSocket();

  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [rules, setRules] = useState({
    stacking: true,
    turnTimer: 20,
    drawToMatch: false,
    jumpIn: false
  });

  const handleQuickPlay = async () => {
    try {
      setIsSubmitting(true);
      sound.playCard('amber');
      await createRoom(rules);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      sound.playCard('ruby');
      await createRoom(rules);
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;

    try {
      setIsSubmitting(true);
      sound.playCard('sapphire');
      await joinRoom(roomCodeInput.trim().toUpperCase());
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const winRate = user?.stats?.gamesPlayed > 0
    ? Math.round((user.stats.gamesWon / user.stats.gamesPlayed) * 100)
    : 0;

  return (
    <div className="lobby-page-root animate-fade-in">
      {errorMsg && (
        <div className="lobby-error-toast animate-slide-down">
          <span>{errorMsg}</span>
          <button onClick={clearError} className="btn-toast-close">✕</button>
        </div>
      )}

      {/* 1. Hero Brand Bar (Solid & Punchy) */}
      <section className="lobby-brand-hero">
        <div className="brand-mark-group">
          <div className="brand-card-stack">
            <span className="card-glyph card-glyph-yellow">7</span>
            <span className="card-glyph card-glyph-blue">U</span>
            <span className="card-glyph card-glyph-red">9</span>
          </div>
          <div className="brand-title-wrap">
            <h1 className="brand-title-text">HORIYA</h1>
            <span className="brand-badge-tag">ONLINE ARENA</span>
          </div>
        </div>

        {/* Solid Elemental Chips (Text Only, No Icons) */}
        <div className="element-chips-bar">
          {Object.keys(ELEMENT_THEMES).map((key) => {
            const el = ELEMENT_THEMES[key];
            return (
              <div
                key={key}
                className={`element-chip chip-${key}`}
                title={el.name}
              >
                <span className="chip-label">{el.name.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Duelist Profile Summary (Solid Slate Card) */}
      <section className="duelist-summary-card" onClick={onOpenProfile}>
        <div className="duelist-info-left">
          <div className="duelist-avatar-box">
            {user?.avatar && user.avatar.startsWith('http') ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <AvatarIcon iconId={user?.avatar || 'flame'} size={22} />
            )}
            <span className="duelist-online-dot" />
          </div>
          <div className="duelist-text">
            <div className="duelist-name-row">
              <h2 className="duelist-name">{user?.name || 'ผู้เล่น'}</h2>
              <span className="duelist-level-tag">LV.1</span>
            </div>
            <span className="duelist-title">{user?.title || 'นักเวทฝึกหัด'}</span>
          </div>
        </div>

        <div className="duelist-stats-grid">
          <div className="stat-box">
            <div className="stat-head">
              <Trophy size={13} className="stat-ico-gold" />
              <span className="stat-title">ชนะ</span>
            </div>
            <span className="stat-val">{user?.stats?.gamesWon || 0}</span>
          </div>

          <div className="stat-box">
            <div className="stat-head">
              <Shield size={13} className="stat-ico-blue" />
              <span className="stat-title">วินเรต</span>
            </div>
            <span className="stat-val">{winRate}%</span>
          </div>

          <div className="stat-box">
            <div className="stat-head">
              <Flame size={13} className="stat-ico-red" />
              <span className="stat-title">สตรีค</span>
            </div>
            <span className="stat-val">{user?.stats?.currentStreak || 0}</span>
          </div>
        </div>
      </section>

      {/* 3. Game Mode Action Hub (3 Solid Tactical Cards) */}
      <section className="mode-selection-hub">

        {/* Mode 1: Quick Match (Primary Hero Card) */}
        <div className="mode-card mode-quick-play">
          <div className="mode-card-header">
            <div className="mode-icon-square icon-square-red">
              <img
                src="./quick_play.png"
                alt="Quick Play"
                className="quick-play-icon-img"
                onError={(e) => { e.target.src = '/quick_play.png'; }}
              />
            </div>
            <div className="mode-header-text">
              <div className="mode-tag-pill tag-pill-hot">
                <Zap size={11} />
                <span>เล่นทันที</span>
              </div>
              <h3 className="mode-heading">เล่นด่วน (QUICK PLAY)</h3>
            </div>
          </div>

          <p className="mode-desc">
            สร้างห้องเล่นทันที รองรับ 2-8 คน ชวนเพื่อนด้วยลิงก์ หรือเพิ่ม AI บอทได้ทันที
          </p>

          <div className="mode-features-list">
            <span className="feature-pill"><Users size={12} /> 2-8 ผู้เล่น</span>
            <span className="feature-pill"><Bot size={12} /> มีบอท AI</span>
            <span className="feature-pill"><Zap size={12} /> ซ้อนไพ่ +2/+4</span>
          </div>

          <button
            className="btn-solid-primary"
            onClick={handleQuickPlay}
            disabled={isSubmitting}
          >
            <Play size={18} />
            <span>{isSubmitting ? 'กำลังสร้างห้อง...' : 'สร้างห้องเล่นทันที'}</span>
          </button>
        </div>

        {/* Mode 2: Custom Room */}
        <div className="mode-card mode-custom-room">
          <div className="mode-card-header">
            <div className="mode-icon-square icon-square-amber">
              <Sliders size={22} />
            </div>
            <div className="mode-header-text">
              <div className="mode-tag-pill tag-pill-neutral">
                <span>กำหนดกฎเอง</span>
              </div>
              <h3 className="mode-heading">สร้างห้องกำหนดเอง</h3>
            </div>
          </div>

          <p className="mode-desc">
            กำหนดกติกาห้องเอง: กฎซ้อนไพ่ (+2 ซ้อน +2), เวลาต่อเทิร์น, หรือเปิดกฎ Jump-In
          </p>

          <button
            className="btn-solid-secondary"
            onClick={() => setShowCreateModal(true)}
            disabled={isSubmitting}
          >
            <Sliders size={16} />
            <span>ตั้งค่ากติกา & สร้างห้อง</span>
          </button>
        </div>

        {/* Mode 3: Join with Room Code */}
        <div className="mode-card mode-join-room">
          <div className="mode-card-header">
            <div className="mode-icon-square icon-square-blue">
              <LogIn size={22} />
            </div>
            <div className="mode-header-text">
              <div className="mode-tag-pill tag-pill-neutral">
                <span>มีรหัสห้อง</span>
              </div>
              <h3 className="mode-heading">เข้าร่วมด้วยรหัส</h3>
            </div>
          </div>

          <p className="mode-desc">
            มีรหัสห้องจากเพื่อน? กรอกรหัสเพื่อเข้าเล่นในห้องได้ทันที
          </p>

          <form onSubmit={handleJoin} className="join-form-row">
            <input
              type="text"
              placeholder="กรอกรหัสห้อง เช่น HORI-409"
              className="solid-room-input"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              maxLength={10}
            />
            <button
              type="submit"
              className="btn-solid-join"
              disabled={!roomCodeInput.trim() || isSubmitting}
              title="เข้าร่วมห้อง"
            >
              <ChevronRight size={20} />
            </button>
          </form>
        </div>

      </section>

      {/* Custom Rules Creation Modal */}
      {showCreateModal && (
        <CreateRoomModal
          rules={rules}
          onRulesChange={setRules}
          onConfirm={handleCreateCustom}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
