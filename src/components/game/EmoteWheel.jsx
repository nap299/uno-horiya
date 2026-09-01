// src/components/game/EmoteWheel.jsx - Floating Reaction Tray (No Emojis)
import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { REACTION_EMOTES } from '../../models/cardTypes';
import { ReactionIcon } from '../../utils/IconRenderer';
import { sound } from '../../audio/soundEngine';

export default function EmoteWheel({ onSendEmote }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.emote-wheel-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [isOpen]);

  const handleSelect = (id) => {
    sound.playEmote();
    onSendEmote(id);
    setIsOpen(false);
  };

  return (
    <div className="emote-wheel-container">
      {isOpen && (
        <div className="emote-tray animate-scale-up" onClick={(e) => e.stopPropagation()}>
          <div className="emote-tray-header">
            <span className="tray-title">QUICK REACTIONS</span>
            <button className="btn-icon-close" onClick={() => setIsOpen(false)}>
              <X size={14} />
            </button>
          </div>
            <div className="emote-grid">
              {REACTION_EMOTES.map((item) => (
                <button
                  key={item.id}
                  className={`emote-btn emote-btn-${item.id} animate-pop`}
                  onClick={() => handleSelect(item.id)}
                  title={item.label}
                >
                  <ReactionIcon id={item.id} size={22} />
                  <span className="reaction-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      <button
        className={`btn-open-emote ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Send Reaction (ส่งรีแอคชั่น)"
      >
        <MessageSquare size={18} />
      </button>
    </div>
  );
}
