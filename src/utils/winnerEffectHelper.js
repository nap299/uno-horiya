// src/utils/winnerEffectHelper.js - Winner Profile Effect Mapping (Videos & Images)

export const WINNER_EFFECTS = {
  cat: {
    type: 'video',
    src: './win_effect/cat.mp4',
    name: 'cat',
    title: 'แมวส้มจอมป่วน'
  },
  chicken: {
    type: 'video',
    src: './win_effect/chicken.mp4',
    name: 'chicken',
    title: 'ไก่ชนไร้พ่าย'
  },
  dog: {
    type: 'video',
    src: './win_effect/dog.mp4',
    name: 'dog',
    title: 'หมาน้อยแสนรู้'
  },
  dragon: {
    type: 'video',
    src: './win_effect/dragon.mp4',
    name: 'dragon',
    title: 'ราชามังกรโบราณ'
  },
  fox: {
    type: 'video',
    src: './win_effect/fox.mp4',
    name: 'fox',
    title: 'จิ้งจอกเก้าหาง'
  },
  shark: {
    type: 'video',
    src: './win_effect/shark.mp4',
    name: 'shark',
    title: 'นักล่าใต้สมุทร'
  },
  snake: {
    type: 'image',
    src: './win_effect/snake.png',
    name: 'snake',
    title: 'พญางูเงาพราย'
  },
  tiger: {
    type: 'image',
    src: './win_effect/tiger.png',
    name: 'tiger',
    title: 'เสือเจ้าป่า'
  }
};

/**
 * Returns corresponding victory effect video or image based on winner's avatar
 * Supports avatar IDs, file paths ('./profile/cat.webp'), and legacy bot IDs
 */
export function getWinnerEffect(winner) {
  const raw = String(winner?.avatar || '').toLowerCase();

  if (raw.includes('cat') || raw.includes('mage_fire')) {
    return WINNER_EFFECTS.cat;
  }
  if (raw.includes('chicken') || raw.includes('storm') || raw.includes('mage_storm')) {
    return WINNER_EFFECTS.chicken;
  }
  if (raw.includes('dog') || raw.includes('mage_ice')) {
    return WINNER_EFFECTS.dog;
  }
  if (raw.includes('dragon') || raw.includes('knight') || raw.includes('flame')) {
    return WINNER_EFFECTS.dragon;
  }
  if (raw.includes('fox') || raw.includes('blade') || raw.includes('assassin')) {
    return WINNER_EFFECTS.fox;
  }
  if (raw.includes('shark') || raw.includes('frost')) {
    return WINNER_EFFECTS.shark;
  }
  if (raw.includes('snake') || raw.includes('leaf') || raw.includes('mage_earth')) {
    return WINNER_EFFECTS.snake;
  }
  if (raw.includes('tiger') || raw.includes('void') || raw.includes('empress') || raw.includes('queen')) {
    return WINNER_EFFECTS.tiger;
  }

  // Default fallback
  return WINNER_EFFECTS.cat;
}
