// server/botPlayer.js - Smart AI Bot Player for HORIYA (No Emojis)
import { canPlayCard, CARD_TYPES, COLORS } from './gameEngine.js';

export const BOT_AVATARS = [
  { name: 'Ignis', avatar: 'flame', color: 'ruby', title: 'Infernal Mage' },
  { name: 'Frostina', avatar: 'frost', color: 'sapphire', title: 'Glacial Sorceress' },
  { name: 'Sylva', avatar: 'leaf', color: 'emerald', title: 'Forest Warden' },
  { name: 'Voltos', avatar: 'storm', color: 'amber', title: 'Stormcaller' },
  { name: 'Astralis', avatar: 'void', color: 'celestial', title: 'Void Prophet' }
];

export function decideBotMove(gameState, botId) {
  const botHand = gameState.hands[botId];
  if (!botHand || botHand.length === 0) return null;

  const validCards = [];
  botHand.forEach((card, index) => {
    if (canPlayCard(card, gameState.topCard, gameState.activeColor, gameState.stackedDrawCount, gameState.rules)) {
      validCards.push({ card, index });
    }
  });

  if (validCards.length === 0) {
    return { action: 'DRAW' };
  }

  const colorCounts = { ruby: 0, sapphire: 0, emerald: 0, amber: 0 };
  botHand.forEach(c => {
    if (colorCounts[c.color] !== undefined) colorCounts[c.color]++;
  });
  let bestColor = 'ruby';
  let maxCount = -1;
  for (const c of COLORS) {
    if (colorCounts[c] > maxCount) {
      maxCount = colorCounts[c];
      bestColor = c;
    }
  }

  validCards.sort((a, b) => {
    const scoreCard = (item) => {
      const c = item.card;
      if (gameState.stackedDrawCount > 0) {
        if (c.type === CARD_TYPES.WILD_DRAW4) return 100;
        if (c.type === CARD_TYPES.DRAW2) return 90;
      }
      if (c.type === CARD_TYPES.DRAW2) return 50;
      if (c.type === CARD_TYPES.SKIP) return 40;
      if (c.type === CARD_TYPES.REVERSE) return 35;
      if (c.type === CARD_TYPES.NUMBER) return 20 + (colorCounts[c.color] || 0);
      if (c.type === CARD_TYPES.WILD) return 10;
      if (c.type === CARD_TYPES.WILD_DRAW4) return 5;
      return 0;
    };
    return scoreCard(b) - scoreCard(a);
  });

  const chosen = validCards[0];
  let chosenColor = null;

  if (chosen.card.type === CARD_TYPES.WILD || chosen.card.type === CARD_TYPES.WILD_DRAW4) {
    chosenColor = bestColor;
  }

  return {
    action: 'PLAY',
    cardIndex: chosen.index,
    cardId: chosen.card.id,
    chosenColor
  };
}

export function pickBotEmote(actionType) {
  const reactions = {
    draw4_give: ['fire', 'shock'],
    draw4_take: ['skull', 'shield'],
    skip: ['freeze', 'target'],
    reverse: ['shock', 'target'],
    uno: ['crown', 'fire'],
    win: ['trophy', 'crown']
  };

  const pool = reactions[actionType] || ['fire', 'shield'];
  return pool[Math.floor(Math.random() * pool.length)];
}
