// src/features/room/CreateRoomModal.jsx - Custom House Rules Modal
// แยกออกมาจาก LobbyPage เพื่อให้จัดการ logic ห้องได้ง่ายขึ้น
import React from 'react';
import { Sliders, Crown } from 'lucide-react';

/**
 * Modal สำหรับตั้งค่า House Rules ก่อนสร้างห้อง
 *
 * Props:
 *   rules        - object ค่า rules ปัจจุบัน
 *   onRulesChange- callback เมื่อ rules เปลี่ยน (updatedRules) => void
 *   onConfirm    - callback เมื่อกด CREATE ROOM (e) => void (รับ event form)
 *   onClose      - callback เมื่อกด CANCEL หรือปิด modal
 */
export default function CreateRoomModal({ rules, onRulesChange, onConfirm, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="custom-room-dialog animate-scale-up">
        {/* Header */}
        <div className="custom-room-header">
          <div className="header-title-box">
            <Sliders size={18} className="header-icon" />
            <h2>CUSTOM HOUSE RULES</h2>
          </div>
          <button className="btn-icon-close" onClick={onClose}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={onConfirm} className="rules-form">

          {/* Rule: Card Stacking */}
          <div className="rule-toggle-row">
            <div className="rule-toggle-info">
              <span className="toggle-name">Card Stacking (+2 on +2, +4 on +4)</span>
              <span className="toggle-desc">
                Allows defending against penalties by stacking identical attack cards.
              </span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={rules.stacking}
                onChange={(e) => onRulesChange({ ...rules, stacking: e.target.checked })}
              />
              <span className="slider round" />
            </label>
          </div>

          {/* Rule: Turn Timer */}
          <div className="rule-toggle-row">
            <div className="rule-toggle-info">
              <span className="toggle-name">Turn Timer</span>
              <span className="toggle-desc">
                Time allocated per player turn before auto-drawing a card.
              </span>
            </div>
            <select
              className="fantasy-select"
              value={rules.turnTimer}
              onChange={(e) => onRulesChange({ ...rules, turnTimer: parseInt(e.target.value) })}
            >
              <option value={10}>10 Seconds (Speed Blitz)</option>
              <option value={15}>15 Seconds (Standard Fast)</option>
              <option value={20}>20 Seconds (Casual)</option>
              <option value={30}>30 Seconds (Relaxed)</option>
              <option value={0}>Infinite (No Timer)</option>
            </select>
          </div>

          {/* Rule: Jump-In */}
          <div className="rule-toggle-row">
            <div className="rule-toggle-info">
              <span className="toggle-name">Jump-In Rule</span>
              <span className="toggle-desc">
                Instantly play an exact matching card even out of turn order.
              </span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={rules.jumpIn}
                onChange={(e) => onRulesChange({ ...rules, jumpIn: e.target.checked })}
              />
              <span className="slider round" />
            </label>
          </div>

          {/* Actions */}
          <div className="modal-actions-bar">
            <button type="button" className="btn-secondary-action" onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="btn-primary-action">
              <Crown size={16} />
              <span>CREATE ROOM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
