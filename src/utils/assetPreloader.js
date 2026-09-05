// src/utils/assetPreloader.js - High-Performance Silent Background Asset Preloader
import fireEffect from '../assets/effects/fire.webp';
import flashEffect from '../assets/effects/flash.webp';
import plantEffect from '../assets/effects/plant.webp';
import waterEffect from '../assets/effects/water.webp';
import swiftEffect from '../assets/effects/swift.webp';
import draw2Effect from '../assets/effects/+2.webp';
import draw4Effect from '../assets/effects/+4.webp';
import draw6Effect from '../assets/effects/+6.webp';
import draw8Effect from '../assets/effects/+8.webp';
import draw10Effect from '../assets/effects/+10.webp';
import redSkipEffect from '../assets/effects/red_skip.webp';
import greenSkipEffect from '../assets/effects/green_skip.webp';
import blueSkipEffect from '../assets/effects/blue_skip.webp';
import yellowSkipEffect from '../assets/effects/yellow_skip.webp';

import catAvatar from '../assets/profile/cat.webp';
import dogAvatar from '../assets/profile/dog.webp';
import dragonAvatar from '../assets/profile/dragon.webp';
import sharkAvatar from '../assets/profile/shark.webp';
import chickenAvatar from '../assets/profile/chicken.webp';
import snakeAvatar from '../assets/profile/snake.webp';
import foxAvatar from '../assets/profile/fox.webp';
import tigerAvatar from '../assets/profile/tiger.webp';

// Essential list of all game visual assets to preload
const ESSENTIAL_ASSETS = [
  // 1. Spell Effect Banners
  fireEffect,
  flashEffect,
  plantEffect,
  waterEffect,
  swiftEffect,
  draw2Effect,
  draw4Effect,
  draw6Effect,
  draw8Effect,
  draw10Effect,
  redSkipEffect,
  greenSkipEffect,
  blueSkipEffect,
  yellowSkipEffect,

  // 2. Animal Avatars
  catAvatar,
  dogAvatar,
  dragonAvatar,
  sharkAvatar,
  chickenAvatar,
  snakeAvatar,
  foxAvatar,
  tigerAvatar,

  // 3. Card Template Graphics
  './cardtemplate/cardback.webp',
  './cardtemplate/red.webp',
  './cardtemplate/green.webp',
  './cardtemplate/blue.webp',
  './cardtemplate/yellow.webp',
  './cardtemplate/four.webp',
  './cardtemplate/color.webp',
  './cardtemplate/swift.webp',

  // 4. Core UI Assets
  './logo1.webp',
  './quick_play.webp',
  './create_room.webp',
  './custom.webp',
  './join.webp',
  './browse_rooms.webp',
  './search.webp',
  './bg.webp',
  './change_color.webp',

  // 5. Winner Victory Effects
  './win_effect/cat.mp4',
  './win_effect/chicken.mp4',
  './win_effect/dog.mp4',
  './win_effect/dragon.mp4',
  './win_effect/fox.mp4',
  './win_effect/shark.mp4',
  './win_effect/snake.webp',
  './win_effect/tiger.webp'
];

let hasPreloaded = false;

/**
 * Preloads an image or video into browser memory cache.
 * Returns a Promise that resolves when the asset finishes loading (or fails gracefully).
 */
function preloadSingleAsset(url) {
  return new Promise((resolve) => {
    if (typeof url === 'string' && url.endsWith('.mp4')) {
      const v = document.createElement('video');
      v.preload = 'auto';
      v.onloadeddata = () => resolve({ url, success: true });
      v.onerror = () => resolve({ url, success: false });
      v.src = url;
      v.load();
    } else {
      const img = new Image();
      img.onload = () => resolve({ url, success: true });
      img.onerror = () => resolve({ url, success: false });
      img.src = url;
    }
  });
}

/**
 * Silently preloads all game assets in batches during browser idle time,
 * guaranteeing zero lag when cards or effects appear during live matches.
 */
export function preloadGameAssets() {
  if (hasPreloaded || typeof window === 'undefined') return;
  hasPreloaded = true;

  const runPreload = () => {
    // Process in gentle batches of 4 images at a time so network connection remains buttery smooth
    const queue = [...ESSENTIAL_ASSETS];
    const BATCH_SIZE = 4;

    const processNextBatch = () => {
      if (queue.length === 0) return;
      const batch = queue.splice(0, BATCH_SIZE);
      Promise.all(batch.map(preloadSingleAsset)).finally(() => {
        setTimeout(processNextBatch, 80);
      });
    };

    processNextBatch();
  };

  // Schedule during browser idle time or after page settles
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(runPreload, { timeout: 2000 });
  } else {
    setTimeout(runPreload, 500);
  }
}
