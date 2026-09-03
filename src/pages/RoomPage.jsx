// src/pages/RoomPage.jsx - HORIYA Waiting Room (Thai UI)
import React, { useState } from 'react';
import {
  Copy,
  Check,
  UserPlus,
  Play,
  LogOut,
  Shield,
  Clock,
  Zap,
  X
} from 'lucide-react';
import { useGameSocket } from '../context/GameSocketContext';
import { useAuth } from '../context/AuthContext';
import { AvatarIcon } from '../utils/IconRenderer';
import { sound } from '../audio/soundEngine';

export default function RoomPage({ onOpenProfile }) {
  const { user } = useAuth();
  const {
    socket,
    room,
    addBot,
    removeBot,
    toggleReady,
    startGame,
    leaveRoom,
    errorMsg,
    clearError
  } = useGameSocket();

  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  if (!room) return null;

  const myId = socket?.id;
  const isHost = room.hostId === myId;
  const players = room.players || [];
  const myPlayer = players.find(p => p.id === myId);
  const isReady = myPlayer?.isReady || isHost;

  const maxPlayers = 5;
  const canStart = isHost && players.length >= 2;

  const handleCopyLink = () => {
    sound.playCard('sapphire');
    const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${room.code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCode = () => {
    sound.playCard('sapphire');
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddBot = () => {
    sound.playCard('amber');
    addBot();
  };

  const handleStartGame = async () => {
    if (!canStart) return;
    try {
      setIsStarting(true);
      sound.playCard('celestial');
      await startGame();
    } catch (err) {
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="room-view-container animate-fade-in">
      {errorMsg && (
        <div className="lobby-error-toast animate-slide-down">
          <span>{errorMsg}</span>
          <button onClick={clearError}>✕</button>
        </div>
      )}

      {/* Room Header & Invite Code */}
      <div className="room-chamber-header">
        <div className="room-title-area">
          <span className="chamber-badge">ห้องรอเล่นเกม</span>
          <h1 className="room-code-display">{room.code}</h1>
        </div>

        <div className="room-invite-actions">
          <button className="btn-copy-code" onClick={handleCopyCode}>
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกรหัส'}</span>
          </button>

          <button className="btn-copy-link" onClick={handleCopyLink}>
            <Copy size={14} />
            <span>คัดลอกลิงก์</span>
          </button>
        </div>
      </div>

      {/* Rules Summary Bar */}
      <div className="room-rules-summary">
        <div className="rule-summary-pill">
          <Zap size={12} />
          <span>ซ้อนไพ่: {room.rules?.stacking ? 'เปิด' : 'ปิด'}</span>
        </div>
        <div className="rule-summary-pill">
          <Clock size={12} />
          <span>เวลาต่อตา: {room.rules?.turnTimer ? `${room.rules.turnTimer}วิ` : 'ไม่จำกัด'}</span>
        </div>
        <div className="rule-summary-pill">
          <Shield size={12} />
          <span>ผู้เล่น: {players.length}/{maxPlayers} คน</span>
        </div>
      </div>

      {/* 8 Duelist Pedestals Grid */}
      <div className="duelist-pedestals-grid">
        {players.map((p) => {
          const isMe = p.id === myId;
          const currentName = isMe && user?.name ? user.name : p.name;
          const currentAvatar = isMe && user?.avatar ? user.avatar : p.avatar;
          const currentTitle = isMe && user?.title ? user.title : (p.title || 'นักเวทฝึกหัด');

          return (
            <div
              key={p.id}
              className={`duelist-pedestal ${p.isReady || p.isHost ? 'pedestal-ready' : 'pedestal-waiting'} ${isMe ? 'pedestal-self pedestal-clickable' : ''}`}
              onClick={isMe && onOpenProfile ? onOpenProfile : undefined}
              title={isMe ? 'คลิกเพื่อแก้ไขรูปโปรไฟล์, ชื่อ หรือ ฉายา' : undefined}
            >
              <div className="pedestal-top-tags">
                {p.isHost && <span className="tag-host">หัวหน้าห้อง</span>}
                {p.isBot  && <span className="tag-bot">บอท AI</span>}
                {isMe && <span className="tag-self-edit">คุณ (คลิกเปลี่ยน)</span>}
              </div>

              {isHost && p.isBot && (
                <button
                  className="btn-remove-bot-x"
                  onClick={() => removeBot(p.id)}
                  title="ลบบอท"
                >
                  <X size={13} />
                </button>
              )}

              <div className="pedestal-avatar-wrapper">
                {currentAvatar && currentAvatar.startsWith('http') ? (
                  <img src={currentAvatar} alt={currentName} className="pedestal-avatar-img" />
                ) : (
                  <AvatarIcon iconId={currentAvatar || 'flame'} size={24} />
                )}
              </div>

              <h3 className="pedestal-name">{currentName}</h3>
              <span className="pedestal-title">{currentTitle}</span>

              <div className={`pedestal-status-badge ${p.isReady || p.isHost ? 'status-ready' : 'status-waiting'}`}>
                <span>{p.isHost ? 'หัวหน้าห้อง' : p.isReady ? 'พร้อมแล้ว' : 'รอพร้อม'}</span>
              </div>
            </div>
          );
        })}

        {Array.from({ length: maxPlayers - players.length }).map((_, i) => {
          const slotNumber = players.length + i + 1;
          const isNextSlot = i === 0;

          return (
            <div
              key={`empty_${i}`}
              className={`duelist-pedestal pedestal-empty ${isHost && isNextSlot ? 'pedestal-clickable' : ''}`}
              onClick={isHost && isNextSlot ? handleAddBot : undefined}
            >
              <span className="empty-slot-label">ช่องที่ {slotNumber}</span>
              {isHost && isNextSlot ? (
                <button
                  className="btn-add-bot-slot"
                  onClick={(e) => { e.stopPropagation(); handleAddBot(); }}
                >
                  <UserPlus size={12} />
                  <span>+ เพิ่มบอท</span>
                </button>
              ) : (
                <span className="empty-slot-hint">ว่าง</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Actions Bar (Side by Side in 1 Row) */}
      <div className="room-bottom-actions">
        <button className="btn-secondary-action btn-leave-chamber" onClick={leaveRoom}>
          <LogOut size={16} />
          <span>ออก</span>
        </button>

        {isHost ? (
          <button
            className={`btn-primary-action btn-start-game ${canStart ? 'start-ready animate-pulse-glow' : 'start-disabled'}`}
            onClick={handleStartGame}
            disabled={!canStart || isStarting}
          >
            <Play size={16} />
            <span>{isStarting ? 'กำลังเริ่ม...' : 'เริ่มเกม'}</span>
          </button>
        ) : (
          <button
            className={`btn-primary-action btn-toggle-ready ${isReady ? 'ready-active' : ''}`}
            onClick={toggleReady}
          >
            <Check size={16} />
            <span>{isReady ? 'พร้อมแล้ว' : 'พร้อม'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
