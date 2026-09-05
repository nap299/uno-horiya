// src/features/room/RoomBrowserModal.jsx - Professional Room Browser Modal (Refined Minimal Senior UI)
import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  Search,
  RefreshCw,
  Users,
  Clock,
  Zap,
  LogIn,
  Plus,
  X,
  Layers
} from 'lucide-react';
import { AVATAR_PRESETS } from '../../models/cardTypes';
import { sound } from '../../audio/soundEngine';

export default function RoomBrowserModal({
  onJoinRoom,
  onCreateRoomClick,
  onClose,
  fetchRooms
}) {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningCode, setJoiningCode] = useState(null);

  const loadRooms = useCallback(async (showRefreshingSpinner = false) => {
    try {
      if (showRefreshingSpinner) setIsRefreshing(true);
      const data = await fetchRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchRooms]);

  // Load once on mount & auto-poll every 3.5 seconds
  useEffect(() => {
    loadRooms();
    const interval = setInterval(() => {
      loadRooms(false);
    }, 3500);
    return () => clearInterval(interval);
  }, [loadRooms]);

  const handleManualRefresh = () => {
    sound.playCard('sapphire');
    loadRooms(true);
  };

  const handleSelectRoom = async (roomCode) => {
    try {
      sound.playCard('ruby');
      setJoiningCode(roomCode);
      await onJoinRoom(roomCode);
    } catch (err) {
      console.error('Failed to join room:', err);
    } finally {
      setJoiningCode(null);
    }
  };

  const getHostAvatarImg = (avatarId) => {
    const preset = AVATAR_PRESETS.find(p => p.iconId === avatarId || p.id === avatarId) || AVATAR_PRESETS[0];
    return preset.image;
  };

  // Filter rooms by search query only (no tabs)
  const filteredRooms = rooms.filter(room => {
    const query = searchQuery.trim().toUpperCase();
    if (!query) return true;
    return room.code?.toUpperCase().includes(query) ||
      room.hostName?.toUpperCase().includes(query);
  });

  return (
    <div className="modal-backdrop room-browser-backdrop" onClick={onClose}>
      <div className="room-browser-dialog animate-scale-up" onClick={(e) => e.stopPropagation()}>

        {/* 1. Modal Header (Single Clean Row, No Subtext) */}
        <div className="room-browser-header">
          <div className="browser-header-title">
            <div className="browser-title-icon-box">
              <Compass size={20} className="browser-title-icon" />
            </div>
            <div className="browser-header-headline-row">
              <h2>ค้นหาห้องประลอง</h2>
              <span className="live-pulse-badge">
                <span className="live-dot animate-pulse" />
                <span>{rooms.length} ห้อง</span>
              </span>
            </div>
          </div>

          <div className="browser-header-actions">
            <button
              type="button"
              className={`btn-browser-refresh ${isRefreshing ? 'is-spinning' : ''}`}
              onClick={handleManualRefresh}
              title="รีเฟรชรายชื่อห้อง"
              disabled={isRefreshing}
            >
              <RefreshCw size={16} />
            </button>
            <button
              type="button"
              className="modal-close-x-btn"
              onClick={onClose}
              title="ปิดหน้าต่าง"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* 2. Search Bar Only (Tabs Removed) */}
        <div className="room-browser-filter-bar">
          <div className="browser-search-box">
            <Search size={15} className="search-icon-svg" />
            <input
              type="text"
              placeholder="ค้นหาด้วยรหัสห้อง หรือชื่อหัวหน้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="browser-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 3. Room List Content Area */}
        <div className="room-browser-list-container custom-scrollbar">
          {isLoading ? (
            <div className="browser-loading-state">
              <RefreshCw size={28} className="is-spinning state-spinner" />
              <p>กำลังค้นหาห้องประลอง...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="browser-empty-state">
              <div className="empty-icon-shield">
                <Compass size={36} className="empty-compass-icon" />
              </div>
              <h3>{searchQuery ? 'ไม่พบห้องที่ตรงกับการค้นหา' : 'ยังไม่มีห้องประลองที่เปิดอยู่'}</h3>
            </div>
          ) : (
            <div className="room-cards-grid">
              {filteredRooms.map((room) => {
                const isLobby = room.status === 'LOBBY';
                const isFull = room.playerCount >= (room.maxPlayers || 4);
                const canJoin = isLobby && !isFull;
                const isThisJoining = joiningCode === room.code;

                return (
                  <div
                    key={room.code}
                    className={`room-tactical-card ${isLobby ? 'card-open' : 'card-playing'} ${canJoin ? 'card-joinable' : ''}`}
                    onClick={() => canJoin && handleSelectRoom(room.code)}
                  >
                    {/* Card Top: Host Info & Status */}
                    <div className="room-card-top-row">
                      <div className="room-host-profile">
                        <div className="room-host-avatar-ring">
                          <img
                            src={getHostAvatarImg(room.hostAvatar)}
                            alt={room.hostName}
                            className="room-host-avatar-img"
                            onError={(e) => { e.target.src = './profile/cat.webp'; }}
                          />
                        </div>
                        <div className="room-host-info">
                          <span className="room-host-name">{room.hostName}</span>
                          <span className="room-host-role">{room.hostTitle || 'หัวหน้าห้อง'}</span>
                        </div>
                      </div>

                      <div className="room-status-badge-box">
                        {isLobby ? (
                          <span className="room-status-badge badge-lobby">
                            <span className="dot-pulse" />
                            <span>รอผู้เล่น</span>
                          </span>
                        ) : (
                          <span className="room-status-badge badge-playing">
                            <span>กำลังประลอง</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Middle: Code & Player Count */}
                    <div className="room-card-mid-row">
                      <div className="room-code-badge">
                        <span className="room-code-label">รหัสห้อง</span>
                        <span className="room-code-value">{room.code}</span>
                      </div>

                      <div className="room-player-count-box">
                        <div className="player-count-header">
                          <Users size={13} className="player-count-icon" />
                          <span className="player-count-number">
                            <strong className={isFull ? 'text-danger' : 'text-success'}>
                              {room.playerCount}
                            </strong>
                            {' '}/ {room.maxPlayers || 4} คน
                          </span>
                        </div>
                        <div className="player-mini-bar">
                          <div
                            className={`player-mini-bar-fill ${isFull ? 'bar-full' : 'bar-available'}`}
                            style={{
                              width: `${Math.min(100, ((room.playerCount || 1) / (room.maxPlayers || 4)) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Rules Pills */}
                    <div className="room-card-rules-row">
                      {room.rules?.stacking && (
                        <span className="room-rule-tag" title="เปิดกฎซ้อนไพ่ (+2, +4)">
                          <Layers size={11} /> ซ้อนไพ่
                        </span>
                      )}
                      <span className="room-rule-tag" title="เวลาต่อเทิร์น">
                        <Clock size={11} /> {room.rules?.turnTimer || 20}s
                      </span>
                      {room.rules?.jumpIn && (
                        <span className="room-rule-tag tag-jumpin" title="เปิดกฎ Jump-In">
                          <Zap size={11} /> Jump-In
                        </span>
                      )}
                    </div>

                    {/* Card Action Button */}
                    <div className="room-card-action-row">
                      {canJoin ? (
                        <button
                          type="button"
                          className="btn-room-card-join"
                          disabled={isThisJoining}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRoom(room.code);
                          }}
                        >
                          {isThisJoining ? (
                            <>
                              <RefreshCw size={14} className="is-spinning" />
                              <span>กำลังเข้าห้อง...</span>
                            </>
                          ) : (
                            <>
                              <LogIn size={14} />
                              <span>เข้าร่วมห้องนี้</span>
                            </>
                          )}
                        </button>
                      ) : isFull ? (
                        <button type="button" className="btn-room-card-disabled" disabled>
                          <span>ห้องเต็มแล้ว (4/4)</span>
                        </button>
                      ) : (
                        <button type="button" className="btn-room-card-disabled" disabled>
                          <span>กำลังแข่งขันอยู่</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Modal Footer: Single Create Room Button (No duplicate, no small text, no star icon) */}
        <div className="room-browser-footer">
          <button
            type="button"
            className="btn-footer-create-room-primary"
            onClick={() => {
              onClose();
              onCreateRoomClick();
            }}
          >
            <Plus size={16} />
            <span>สร้างห้องประลองใหม่</span>
          </button>
        </div>

      </div>
    </div>
  );
}
