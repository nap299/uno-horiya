// src/models/cardThemes.js - HORIYA Card Visual Themes & Spell Definitions (Thai Localization)

// ธีมสีและภาพของแต่ละ Element
export const ELEMENT_THEMES = {
  ruby: {
    name: 'สีแดง (Ruby)',
    element: 'ธาตุไฟเพลิงผลาญ',
    elementEn: 'Fire',
    primary: '#D90429',
    secondary: '#EF233C',
    dark: '#54081E',
    glow: 'rgba(217, 4, 41, 0.65)',
    border: '#EF233C',
    iconKey: 'ruby',
    rune: 'ᚱ',
    description: 'เพลิงผลาญอัคคี'
  },
  sapphire: {
    name: 'สีน้ำเงิน (Sapphire)',
    element: 'ธาตุน้ำแข็งเยือกแข็ง',
    elementEn: 'Ice / Frost',
    primary: '#0077B6',
    secondary: '#0096C7',
    dark: '#032050',
    glow: 'rgba(0, 119, 182, 0.65)',
    border: '#0096C7',
    iconKey: 'sapphire',
    rune: 'ᛋ',
    description: 'ธาราน้ำแข็งเยือกแข็ง'
  },
  emerald: {
    name: 'สีเขียว (Emerald)',
    element: 'ธาตุธรรมชาติพงไพร',
    elementEn: 'Earth / Nature',
    primary: '#0F8A5F',
    secondary: '#13A874',
    dark: '#053E1E',
    glow: 'rgba(15, 138, 95, 0.65)',
    border: '#13A874',
    iconKey: 'emerald',
    rune: 'ᚦ',
    description: 'พฤกษาพงไพร'
  },
  amber: {
    name: 'สีเหลือง (Amber)',
    element: 'ธาตุสายฟ้าอสุนี',
    elementEn: 'Lightning / Sun',
    primary: '#D97706',
    secondary: '#F59E0B',
    dark: '#4A3302',
    glow: 'rgba(217, 119, 6, 0.7)',
    border: '#F59E0B',
    iconKey: 'amber',
    rune: 'ᛚ',
    description: 'สายฟ้าอสุนีบาต'
  },
  celestial: {
    name: 'การ์ดเปลี่ยนสี (Wild)',
    element: 'พลังแห่งความว่างเปล่า',
    elementEn: 'Arcane Chaos',
    primary: '#7B2CBF',
    secondary: '#9D4EDD',
    dark: '#240046',
    glow: 'rgba(123, 44, 191, 0.8)',
    border: '#9D4EDD',
    iconKey: 'celestial',
    rune: 'ᚨ',
    description: 'สมดุลแห่งจักรวาล'
  }
};

// ข้อมูล Spell ของการ์ด Action แต่ละประเภท (ภาษาไทย)
export const ACTION_SPELL_INFO = {
  skip: {
    name: 'ข้ามเทิร์น (Skip)',
    iconKey: 'skip',
    symbol: '⊘',
    lore: 'แช่แข็งศัตรู ข้ามตาเล่นของผู้เล่นคนถัดไปทันที'
  },
  freeze: {
    name: 'แช่แข็ง ข้ามเทิร์น (Skip)',
    iconKey: 'skip',
    symbol: '⊘',
    lore: 'แช่แข็งศัตรู ข้ามตาเล่นของผู้เล่นคนถัดไปทันที'
  },
  reverse: {
    name: 'ย้อนกลับทิศทาง (Reverse)',
    iconKey: 'reverse',
    symbol: '⇄',
    lore: 'บิดเบือนมิติเวลา สลับทิศทางการเล่นวนกลับ'
  },
  draw2: {
    name: 'จั่วไพ่ +2 (Draw 2)',
    iconKey: 'draw2',
    symbol: '+2',
    lore: 'ผ่าสายฟ้าคู่ บังคับให้คนถัดไปจั่วไพ่ 2 ใบและข้ามตา'
  },
  wild: {
    name: 'เปลี่ยนสีการ์ด (Wild)',
    iconKey: 'wild',
    symbol: '✦',
    lore: 'เปลี่ยนธาตุสีของโต๊ะประลองเป็นสีใดก็ได้ตามต้องการ'
  },
  wild_draw4: {
    name: 'เปลี่ยนสี + จั่วไพ่ +4 (Wild Draw 4)',
    iconKey: 'wild_draw4',
    symbol: '+4',
    lore: 'ระเบิดพลังจักรวาล บังคับจั่ว 4 ใบพร้อมเปลี่ยนสีการ์ด'
  }
};
