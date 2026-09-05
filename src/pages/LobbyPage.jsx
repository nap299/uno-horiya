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
  Play,
  Search,
  Compass,
  Radio,
  DoorOpen
} from 'lucide-react';
import { useGameSocket } from '../context/GameSocketContext';
import { useAuth } from '../context/AuthContext';
import { ELEMENT_THEMES } from '../models/cardThemes';
import { ElementIcon, AvatarIcon } from '../utils/IconRenderer';
import { sound } from '../audio/soundEngine';
import CreateRoomModal from '../features/room/CreateRoomModal';
import RoomBrowserModal from '../features/room/RoomBrowserModal';

export default function LobbyPage({ onOpenProfile, onOpenRules }) {
  const { user } = useAuth();
  const { createRoom, joinRoom, fetchRooms, errorMsg, clearError } = useGameSocket();

  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBrowseModal, setShowBrowseModal] = useState(false);
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

  return (
    <div className="lobby-page-root animate-fade-in">
      {errorMsg && (
        <div className="lobby-error-toast animate-slide-down">
          <span>{errorMsg}</span>
          <button onClick={clearError} className="btn-toast-close">✕</button>
        </div>
      )}

      {/* 1. Center Duelist Character Showcase (Prominent & Majestic, Senior Game UX/UI, No Stats) */}
      <section
        className="duelist-hero-showcase animate-scale-up"
        onClick={onOpenProfile}
        title="แตะเพื่อเปลี่ยนตัวละคร & ชื่อ"
      >
        <div className="duelist-hero-frame">
          <div className="duelist-hero-avatar-wrapper">
            <div className="duelist-hero-aura-glow" />
            <div className="duelist-hero-avatar-ring">
              {user?.avatar && user.avatar.startsWith('http') ? (
                <img src={user.avatar} alt={user.name} className="duelist-hero-avatar-img" />
              ) : (
                <AvatarIcon iconId={user?.avatar || 'cat'} size={76} className="duelist-hero-avatar-icon" />
              )}
              <span className="duelist-online-gem" title="ออนไลน์" />
            </div>
          </div>

          <div className="duelist-hero-meta">
            <div className="duelist-hero-name-row">
              <h2 className="duelist-hero-name">{user?.name || 'ผู้เล่น'}</h2>
            </div>
            <div className="duelist-hero-title-box">
              <span className="title-rune-glyph">✦</span>
              <span className="duelist-hero-title-text">{user?.title || 'เสือเจ้าป่า'}</span>
              <span className="title-rune-glyph">✦</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Game Mode Action Hub (Tactical Cards) */}
      <section className="mode-selection-hub">

        {/* Mode 1: Quick Match (Primary Hero Card) */}
        <div className="mode-card mode-quick-play">
          <div className="mode-card-header">
            <div className="mode-icon-square icon-quick-play-custom">
              <img
                src="./quick_play.webp"
                alt="Quick Play"
                className="quick-play-icon-img"
                onError={(e) => { e.target.src = '/quick_play.webp'; }}
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
            สร้างห้องเล่นทันที รองรับ 2-4 คน ชวนเพื่อนด้วยลิงก์ หรือเพิ่ม AI บอทได้ทันที
          </p>

          <div className="mode-features-list">
            <span className="feature-pill"><Users size={12} /> 2-4 ผู้เล่น</span>
            <span className="feature-pill"><Bot size={12} /> มีบอท AI</span>
            <span className="feature-pill"><Zap size={12} /> ซ้อนไพ่ +2/+4</span>
          </div>

          <button
            className="btn-image-action"
            onClick={handleQuickPlay}
            disabled={isSubmitting}
          >
            <img
              src="./create_room.webp"
              alt="สร้างห้องเล่นทันที"
              className="create-room-btn-img"
              onError={(e) => { e.target.src = '/create_room.webp'; }}
            />
          </button>
        </div>

        {/* Mode 2: Browse Rooms (ค้นหาห้อง - ตามคำขอของผู้ใช้) */}
        <div className="mode-card mode-browse-rooms">
          <div className="mode-card-header">
            <div className="mode-icon-square icon-mode-custom-logo">
              <img
                src="./browse_rooms.webp"
                alt="ค้นหาห้อง"
                className="mode-custom-icon-img"
                onError={(e) => { e.target.src = '/browse_rooms.webp'; }}
              />
            </div>
            <div className="mode-header-text">
              <div className="mode-tag-pill tag-pill-emerald">
                <Radio size={11} className="animate-pulse" />
                <span>ห้องออนไลน์</span>
              </div>
              <h3 className="mode-heading">ค้นหาห้อง</h3>
            </div>
          </div>

          <p className="mode-desc">
            ค้นหาและเลือกล็อบบี้ห้องที่มีคนสร้างไว้ ดูจำนวนผู้เล่นในห้อง และกดเข้าร่วมการประลองได้ทันที
          </p>

          <div className="mode-features-list">
            <span className="feature-pill"><Users size={12} /> แสดงจำนวนคน</span>
            <span className="feature-pill"><DoorOpen size={12} /> เข้าร่วมได้ทันที</span>
          </div>

          <button
            className="btn-image-action"
            onClick={() => {
              sound.playCard('sapphire');
              setShowBrowseModal(true);
            }}
            disabled={isSubmitting}
          >
            <img
              src="./search.webp"
              alt="ค้นหา & เลือกล็อบบี้ห้อง"
              className="browse-room-btn-img"
              onError={(e) => { e.target.src = '/search.webp'; }}
            />
          </button>
        </div>

        {/* Mode 3: Custom Room */}
        <div className="mode-card mode-custom-room">
          <div className="mode-card-header">
            <div className="mode-icon-square icon-mode-custom-logo">
              <img
                src="./custom.webp"
                alt="Custom Room"
                className="mode-custom-icon-img"
                onError={(e) => { e.target.src = '/custom.webp'; }}
              />
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
            <div className="mode-icon-square icon-mode-custom-logo">
              <img
                src="./join.webp"
                alt="Join Room"
                className="mode-custom-icon-img"
                onError={(e) => { e.target.src = '/join.webp'; }}
              />
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
              placeholder="กรอกรหัสห้อง..."
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

      {/* Room Browser Modal (ค้นหาห้องประลอง) */}
      {showBrowseModal && (
        <RoomBrowserModal
          fetchRooms={fetchRooms}
          onJoinRoom={async (code) => {
            try {
              setIsSubmitting(true);
              sound.playCard('sapphire');
              await joinRoom(code);
              setShowBrowseModal(false);
            } catch (err) {
              console.error('Join room failed:', err);
            } finally {
              setIsSubmitting(false);
            }
          }}
          onCreateRoomClick={() => {
            setShowBrowseModal(false);
            setShowCreateModal(true);
          }}
          onClose={() => setShowBrowseModal(false)}
        />
      )}
    </div>
  );
}
