// src/models/cardTypes.js - HORIYA Animal Avatar Presets & Reaction Emotes (Thai)

// Avatar รูปสัตว์ที่เลือกได้
export const AVATAR_PRESETS = [
  { id: 'animal_cat',     name: 'เหมียวซ่า',       iconId: 'cat',     image: './profile/cat.webp',     color: 'amber',     title: 'แมวส้มจอมป่วน' },
  { id: 'animal_dog',     name: 'ตูบผู้ภักดี',      iconId: 'dog',     image: './profile/dog.webp',     color: 'sapphire',  title: 'หมาน้อยแสนรู้' },
  { id: 'animal_dragon',  name: 'มังกรเพลิง',      iconId: 'dragon',  image: './profile/dragon.webp',  color: 'ruby',      title: 'ราชามังกรโบราณ' },
  { id: 'animal_shark',   name: 'ฉลามคลั่ง',       iconId: 'shark',   image: './profile/shark.webp',   color: 'sapphire',  title: 'นักล่าใต้สมุทร' },
  { id: 'animal_chicken', name: 'กุ๊กไก่ไฟแรง',    iconId: 'chicken', image: './profile/chicken.webp', color: 'amber',    title: 'ไก่ชนไร้พ่าย' },
  { id: 'animal_snake',   name: 'อสรพิษมรกต',     iconId: 'snake',   image: './profile/snake.webp',   color: 'emerald',   title: 'พญางูเงาพราย' },
  { id: 'animal_fox',     name: 'จิ้งจอกมายา',     iconId: 'fox',     image: './profile/fox.webp',     color: 'ruby',      title: 'จิ้งจอกเก้าหาง' },
  { id: 'animal_tiger',   name: 'พยัคฆ์คำราม',     iconId: 'tiger',   image: './profile/tiger.webp',   color: 'celestial', title: 'เสือเจ้าป่า' }
];

// Emote Reaction ที่ส่งในเกมได้
export const REACTION_EMOTES = [
  { id: 'fire',   label: 'ไฟลุก'   },
  { id: 'freeze', label: 'หนาว'   },
  { id: 'shock',  label: 'ช็อค'    },
  { id: 'shield', label: 'ป้องกัน' },
  { id: 'skull',  label: 'ตายแน่'  },
  { id: 'trophy', label: 'สุดยอด'  },
  { id: 'target', label: 'เล็งเธอ' }
];
