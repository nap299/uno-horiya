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
import { AvatarIcon } from '../utils/IconRenderer';
import { sound } from '../audio/soundEngine';

export default function RoomPage() {
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
  const canStart = isHost && players.length >= 2 && players.every(p => p.isReady || p.isHost);

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
          return (
            <div
              key={p.id}
              className={`duelist-pedestal ${p.isReady || p.isHost ? 'pedestal-ready' : 'pedestal-waiting'} ${isMe ? 'pedestal-self' : ''}`}
            >
              <div className="pedestal-top-tags">
                {p.isHost && <span className="tag-host">หัวหน้าห้อง</span>}
                {p.isBot  && <span className="tag-bot">บอท AI</span>}
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
                {p.avatar && p.avatar.startsWith('http') ? (
                  <img src={p.avatar} alt={p.name} className="pedestal-avatar-img" />
                ) : (
                  <AvatarIcon iconId={p.avatar || 'flame'} size={24} />
                )}
              </div>

              <h3 className="pedestal-name">{p.name}</h3>
              <span className="pedestal-title">{p.title || 'นักเวทฝึกหัด'}</span>

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

      {/* Bottom Actions Bar (1 Button Per Line) */}
      <div className="room-bottom-actions">
        {isHost ? (
          <button
            className="btn-primary-action btn-start-game"
            onClick={handleStartGame}
            disabled={!canStart || isStarting}
          >
            <Play size={16} />
            <span>
              {players.length < 2
                ? 'ต้องการผู้เล่นอย่างน้อย 2 คน'
                : isStarting
                ? 'กำลังเริ่มเกม...'
                : 'เริ่มเกมทันที'}
            </span>
          </button>
        ) : (
          <button
            className={`btn-primary-action btn-toggle-ready ${isReady ? 'ready-active' : ''}`}
            onClick={toggleReady}
          >
            <Check size={16} />
            <span>{isReady ? 'พร้อมแล้ว (แตะเพื่อยกเลิก)' : 'กดพร้อมเล่น'}</span>
          </button>
        )}

        <button className="btn-secondary-action btn-leave-chamber" onClick={leaveRoom}>
          <LogOut size={16} />
          <span>ออกจากห้อง</span>
        </button>
      </div>
    </div>
  );
}
