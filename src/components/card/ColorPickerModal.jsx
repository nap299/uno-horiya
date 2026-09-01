// src/components/card/ColorPickerModal.jsx - Elemental Color Choice Modal (Thai Localization & Senior UI)
import React from 'react';
import { ELEMENT_THEMES } from '../../models/cardThemes';
import { ElementIcon } from '../../utils/IconRenderer';
import { X } from 'lucide-react';
import { sound } from '../../audio/soundEngine';

export default function ColorPickerModal({ onSelectColor, onClose }) {
  const elements = ['ruby', 'sapphire', 'emerald', 'amber'];

  const handleSelect = (color) => {
    sound.playCard(color);
    onSelectColor(color);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="color-picker-dialog animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-x" onClick={onClose} title="ยกเลิก">
          <X size={18} />
        </button>
        <div className="modal-glow-header">
          <h2 className="modal-title">เลือกสีที่ต้องการเปลี่ยน</h2>
          <p className="modal-subtitle">กำหนดสีของการ์ดกลางโต๊ะประลองสำหรับตาถัดไป</p>
        </div>

        <div className="color-orbs-grid">
          {elements.map((color) => {
            const theme = ELEMENT_THEMES[color];
            return (
              <button
                key={color}
                className={`color-orb-btn orb-btn-${color}`}
                onClick={() => handleSelect(color)}
                onMouseEnter={() => sound.playCard(color)}
              >
                <div className={`orb-icon-badge badge-${color}`}>
                  <ElementIcon element={color} size={24} className="icon-white" />
                </div>
                <div className="orb-info">
                  <span className="orb-name">{theme.name}</span>
                  <span className="orb-element">{theme.element}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
