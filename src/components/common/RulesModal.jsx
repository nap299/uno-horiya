// src/components/common/RulesModal.jsx - HORIYA Rules Lore (No Emojis, No Sparkles)
import React from 'react';
import { X, BookOpen, Crown, Shield, Zap } from 'lucide-react';
import { ELEMENT_THEMES, ACTION_SPELL_INFO } from '../../models/cardThemes';
import { ElementIcon, SpellIcon } from '../../utils/IconRenderer';

export default function RulesModal({ onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="rules-dialog animate-scale-up">
        <div className="rules-header">
          <div className="rules-header-title">
            <BookOpen className="rules-icon" size={20} />
            <h2>HORIYA GRIMOIRE RULES</h2>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="rules-scrollable-body">
          <section className="rule-section">
            <h3 className="section-title">THE OBJECTIVE</h3>
            <p className="section-p">
              Match cards by <strong>Element (Color)</strong> or <strong>Number Value</strong>. Be the first player to empty all cards from your hand to achieve victory!
            </p>
          </section>

          <section className="rule-section">
            <h3 className="section-title">THE 4 ELEMENTAL REALMS</h3>
            <div className="rules-elements-grid">
              {Object.keys(ELEMENT_THEMES).map((key) => {
                const el = ELEMENT_THEMES[key];
                return (
                  <div key={key} className="rule-element-card" style={{ borderColor: el.border, background: el.dark }}>
                    <div className="el-card-header">
                      <ElementIcon element={key} size={14} />
                      <span className="el-name" style={{ color: el.primary }}>{el.name}</span>
                    </div>
                    <p className="el-lore">{el.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rule-section">
            <h3 className="section-title">ACTION RUNES</h3>
            <div className="rules-spells-list">
              {Object.keys(ACTION_SPELL_INFO).map((key) => {
                const sp = ACTION_SPELL_INFO[key];
                return (
                  <div key={key} className="rule-spell-item">
                    <div className="sp-icon-box">
                      <SpellIcon type={key} size={18} />
                    </div>
                    <div className="sp-info">
                      <h4 className="sp-name">{sp.name} ({sp.symbol})</h4>
                      <p className="sp-desc">{sp.lore}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rule-section">
            <h3 className="section-title">THE "UNO!" SHOUT</h3>
            <p className="section-p">
              When you hold only <strong>1 card</strong>, press the <strong>"UNO!"</strong> button immediately. If caught by an opponent before your next play, you receive <strong>+2 penalty cards</strong>!
            </p>
          </section>

          <section className="rule-section">
            <h3 className="section-title">CARD STACKING</h3>
            <p className="section-p">
              Defend against <strong>+2</strong> or <strong>+4</strong> attacks by playing an identical attack card to pass and multiply the penalty to the next duelist!
            </p>
          </section>
        </div>

        <div className="rules-footer">
          <button className="btn-primary-action" onClick={onClose}>
            <Crown size={14} />
            <span>UNDERSTOOD</span>
          </button>
        </div>
      </div>
    </div>
  );
}
