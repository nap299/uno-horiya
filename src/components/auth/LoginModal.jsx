// src/components/auth/LoginModal.jsx - Player Profile Modal (Animal Avatars & Thai UI)
import React, { useState, useEffect } from 'react';
import { X, Check, Shield, Trophy, Flame, Zap, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AVATAR_PRESETS } from '../../models/cardTypes';
import { ELEMENT_THEMES } from '../../models/cardThemes';
import { AvatarIcon } from '../../utils/IconRenderer';
import { sound } from '../../audio/soundEngine';

export default function LoginModal({ onClose }) {
  const { user, loginAsGuest } = useAuth();
  const [selectedPreset, setSelectedPreset] = useState(AVATAR_PRESETS[0]);
  const [customName, setCustomName] = useState(user?.name || '');
  const [customTitle, setCustomTitle] = useState(user?.title || '');

  useEffect(() => {
    if (user) {
      setCustomName(user.name);
      setCustomTitle(user.title);
      const match = AVATAR_PRESETS.find(p => p.iconId === user.avatar);
      if (match) setSelectedPreset(match);
    }
  }, [user]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    sound.playCard(selectedPreset.color);
    loginAsGuest({
      name: customName.trim() || selectedPreset.name,
      avatar: selectedPreset.iconId,
      title: customTitle.trim() || selectedPreset.title,
      color: selectedPreset.color
    });
    onClose();
  };

  const winRate = user?.stats?.gamesPlayed > 0
    ? Math.round((user.stats.gamesWon / user.stats.gamesPlayed) * 100)
    : 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="login-modal-dialog animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="login-modal-header">
          <div className="header-title-box">
            <div className="profile-header-icon-box">
              <User size={18} className="text-white" />
            </div>
            <h2>โปรไฟล์ผู้เล่น</h2>
          </div>
          <button className="btn-icon-close" onClick={onClose} title="ปิด">
            <X size={18} />
          </button>
        </div>

        <div className="login-tab-content">
          {/* Stats Bar */}
          <div className="player-stats-card">
            <div className="stat-pill">
              <Trophy size={15} className="stat-gold" />
              <div className="stat-info">
                <span className="stat-val">{user?.stats?.gamesWon || 0}</span>
                <span className="stat-lbl">ชนะ</span>
              </div>
            </div>
            <div className="stat-pill">
              <Shield size={15} className="stat-blue" />
              <div className="stat-info">
                <span className="stat-val">{winRate}%</span>
                <span className="stat-lbl">วินเรต</span>
              </div>
            </div>
            <div className="stat-pill">
              <Flame size={15} className="stat-red" />
              <div className="stat-info">
                <span className="stat-val">{user?.stats?.currentStreak || 0}</span>
                <span className="stat-lbl">สตรีค</span>
              </div>
            </div>
            <div className="stat-pill">
              <Zap size={15} className="stat-gold" />
              <div className="stat-info">
                <span className="stat-val">{user?.stats?.unoShouts || 0}</span>
                <span className="stat-lbl">เรียก UNO</span>
              </div>
            </div>
          </div>

          {/* Profile Customization Form */}
          <form onSubmit={handleSaveProfile} className="character-form">
            <div className="form-group">
              <label className="form-label">เลือกอวาตาร์สัตว์ประจำตัว</label>
              <div className="avatar-presets-grid">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  const theme = ELEMENT_THEMES[preset.color] || ELEMENT_THEMES.amber;
                  return (
                    <button
                      type="button"
                      key={preset.id}
                      className={`avatar-preset-btn ${isSelected ? 'preset-selected' : ''}`}
                      style={{
                        '--preset-glow': theme.glow,
                        '--preset-border': theme.border
                      }}
                      onClick={() => {
                        setSelectedPreset(preset);
                        setCustomName(preset.name);
                        setCustomTitle(preset.title);
                        sound.playCard(preset.color);
                      }}
                    >
                      <div className="preset-icon-box">
                        <AvatarIcon iconId={preset.iconId} size={22} />
                      </div>
                      <span className="preset-name">{preset.name}</span>
                      {isSelected && <Check size={12} className="preset-check" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">ชื่อผู้เล่น</label>
                <input
                  type="text"
                  className="fantasy-input"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  maxLength={18}
                  placeholder="ระบุชื่อผู้เล่น..."
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">ฉายา</label>
                <input
                  type="text"
                  className="fantasy-input"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  maxLength={24}
                  placeholder="ระบุฉายา..."
                />
              </div>
            </div>

            <button type="submit" className="btn-primary-action btn-full">
              <span>บันทึกโปรไฟล์</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
