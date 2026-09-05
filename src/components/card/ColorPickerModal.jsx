// src/components/card/ColorPickerModal.jsx - Elemental Color Choice Modal
import React from 'react';
import { sound } from '../../audio/soundEngine';
import changeColorImg from '../../assets/change_color.webp';

export default function ColorPickerModal({ onSelectColor, onClose }) {
  const handleSelect = (color) => {
    sound.playCard(color);
    onSelectColor(color);
  };

  return (
    <div className="modal-backdrop color-picker-backdrop" onClick={onClose}>
      <div
        className="color-picker-dialog-board animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={changeColorImg}
          alt="เลือกสีที่ต้องการเปลี่ยน"
          className="color-picker-board-img"
          draggable={false}
        />

        {/* ปุ่มปิด (X) มุมขวาบนตามภาพ */}
        <button
          type="button"
          className="color-picker-hitbox-close"
          onClick={onClose}
          title="ปิด / ยกเลิก"
          aria-label="ปิดหน้าต่างเลือกสี"
        />

        {/* 4 ช่องสีธาตุสำหรับกดเลือก */}
        {/* สีแดง (Ruby) - ธาตุไฟเพลิงผลาญ */}
        <button
          type="button"
          className="color-picker-hitbox hitbox-ruby"
          onClick={() => handleSelect('ruby')}
          onMouseEnter={() => sound.playCard('ruby')}
          title="สีแดง (Ruby) ธาตุไฟเพลิงผลาญ"
          aria-label="สีแดง Ruby ธาตุไฟเพลิงผลาญ"
        />

        {/* สีน้ำเงิน (Sapphire) - ธาตุน้ำแข็งเยือกแข็ง */}
        <button
          type="button"
          className="color-picker-hitbox hitbox-sapphire"
          onClick={() => handleSelect('sapphire')}
          onMouseEnter={() => sound.playCard('sapphire')}
          title="สีน้ำเงิน (Sapphire) ธาตุน้ำแข็งเยือกแข็ง"
          aria-label="สีน้ำเงิน Sapphire ธาตุน้ำแข็งเยือกแข็ง"
        />

        {/* สีเขียว (Emerald) - ธาตุธรรมชาติพงไพร */}
        <button
          type="button"
          className="color-picker-hitbox hitbox-emerald"
          onClick={() => handleSelect('emerald')}
          onMouseEnter={() => sound.playCard('emerald')}
          title="สีเขียว (Emerald) ธาตุธรรมชาติพงไพร"
          aria-label="สีเขียว Emerald ธาตุธรรมชาติพงไพร"
        />

        {/* สีเหลือง (Amber) - ธาตุสายฟ้าอสนี */}
        <button
          type="button"
          className="color-picker-hitbox hitbox-amber"
          onClick={() => handleSelect('amber')}
          onMouseEnter={() => sound.playCard('amber')}
          title="สีเหลือง (Amber) ธาตุสายฟ้าอสนี"
          aria-label="สีเหลือง Amber ธาตุสายฟ้าอสนี"
        />
      </div>
    </div>
  );
}
