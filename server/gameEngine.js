// server/gameEngine.js - Authoritative HORIYA Engine (No Emojis)

export const COLORS = ['ruby', 'sapphire', 'emerald', 'amber'];
export const SPECIAL_COLORS = ['celestial'];

export const CARD_TYPES = {
  NUMBER: 'number',
  SKIP: 'skip',
  REVERSE: 'reverse',
  DRAW2: 'draw2',
  WILD: 'wild',
  WILD_DRAW4: 'wild_draw4'
};

export function createDeck() {
  const deck = [];
  let idCounter = 1;

  for (const color of COLORS) {
    deck.push({
      id: `card_${idCounter++}`,
      color,
      type: CARD_TYPES.NUMBER,
      value: 0,
      name: `${color.toUpperCase()} 0`
    });

    for (let num = 1; num <= 9; num++) {
      for (let copy = 0; copy < 2; copy++) {
        deck.push({
          id: `card_${idCounter++}`,
          color,
          type: CARD_TYPES.NUMBER,
          value: num,
          name: `${color.toUpperCase()} ${num}`
        });
      }
    }

    for (let copy = 0; copy < 2; copy++) {
      deck.push({
        id: `card_${idCounter++}`,
        color,
        type: CARD_TYPES.SKIP,
        value: 'skip',
        name: `Frost Stasis (${color})`
      });
      deck.push({
        id: `card_${idCounter++}`,
        color,
        type: CARD_TYPES.REVERSE,
        value: 'reverse',
        name: `Chrono Rift (${color})`
      });
      deck.push({
        id: `card_${idCounter++}`,
        color,
        type: CARD_TYPES.DRAW2,
        value: 'draw2',
        name: `Twin Lightning (+2 ${color})`
      });
    }
  }

  for (let i = 0; i < 4; i++) {
    deck.push({
      id: `card_${idCounter++}`,
      color: 'celestial',
      type: CARD_TYPES.WILD,
      value: 'wild',
      name: 'Astral Core (Wild)'
    });
  }

  for (let i = 0; i < 4; i++) {
    deck.push({
      id: `card_${idCounter++}`,
      color: 'celestial',
      type: CARD_TYPES.WILD_DRAW4,
      value: 'wild_draw4',
      name: 'Cataclysmic Supernova (+4)'
    });
  }

  return shuffle(deck);
}

export function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function canPlayCard(card, topCard, activeColor, stackedDrawCount = 0, rules = {}) {
  if (!card || !topCard) return false;

  if (stackedDrawCount > 0 && rules.stacking) {
    if (topCard.type === CARD_TYPES.DRAW2) {
      return card.type === CARD_TYPES.DRAW2 || (rules.stackDraw4OnDraw2 !== false && card.type === CARD_TYPES.WILD_DRAW4);
    }
    if (topCard.type === CARD_TYPES.WILD_DRAW4) {
      return card.type === CARD_TYPES.WILD_DRAW4;
    }
    return false;
  }

  // Swift / Reverse (swift.png) can be played at any time on your turn regardless of previous color!
  if (card.type === CARD_TYPES.REVERSE) {
    return true;
  }

  // Turn following Reverse allows ANY color to be played!
  if (activeColor === 'any' || topCard.type === CARD_TYPES.REVERSE) {
    return true;
  }

  if (card.type === CARD_TYPES.WILD || card.type === CARD_TYPES.WILD_DRAW4) {
    return true;
  }

  const effectiveColor = activeColor || topCard.color;
  if (card.color === effectiveColor) {
    return true;
  }

  if (card.type === CARD_TYPES.NUMBER && topCard.type === CARD_TYPES.NUMBER && card.value === topCard.value) {
    return true;
  }

  if (card.type !== CARD_TYPES.NUMBER && card.type === topCard.type) {
    return true;
  }

  return false;
}

export function initializeGame(players, options = {}) {
  const rules = {
    stacking: options.stacking !== undefined ? options.stacking : true,
    stackDraw4OnDraw2: options.stackDraw4OnDraw2 !== undefined ? options.stackDraw4OnDraw2 : true,
    allowMultipleSameValue: options.allowMultipleSameValue !== undefined ? options.allowMultipleSameValue : true,
    turnTimer: options.turnTimer || 20,
    drawToMatch: options.drawToMatch || false,
    jumpIn: options.jumpIn || false,
    ...options
  };

  let drawPile = createDeck();
  const hands = {};
  const unoState = {};

  players.forEach((p) => {
    hands[p.id] = drawPile.splice(0, 7);
    unoState[p.id] = { hasCalledUno: false, mustCallUno: false };
  });

  let topCard = drawPile.pop();
  while (topCard.type === CARD_TYPES.WILD_DRAW4) {
    drawPile.unshift(topCard);
    drawPile = shuffle(drawPile);
    topCard = drawPile.pop();
  }

  const discardPile = [topCard];
  let activeColor = topCard.color === 'celestial' ? COLORS[Math.floor(Math.random() * COLORS.length)] : topCard.color;
  let direction = 1;
  let currentTurnIndex = 0;
  let stackedDrawCount = 0;

  if (topCard.type === CARD_TYPES.REVERSE) {
    direction = -1;
    if (players.length === 2) {
      currentTurnIndex = 1;
    }
    activeColor = 'any';
  } else if (topCard.type === CARD_TYPES.SKIP) {
    currentTurnIndex = 1 % players.length;
  } else if (topCard.type === CARD_TYPES.DRAW2) {
    stackedDrawCount = 2;
  }

  return {
    players,
    hands,
    drawPile,
    discardPile,
    topCard,
    activeColor,
    direction,
    currentTurnIndex,
    stackedDrawCount,
    unoState,
    rules,
    winner: null,
    lastAction: {
      type: 'GAME_START',
      message: `HORIYA duel initiated. Initial rune: ${topCard.name}`
    },
    actionLog: [
      { text: `Duel started. First rune: ${topCard.name}`, timestamp: Date.now() }
    ]
  };
}

export function ensureDrawPile(gameState) {
  if (gameState.drawPile.length < 5 && gameState.discardPile.length > 1) {
    const top = gameState.discardPile.pop();
    const reshuffled = shuffle(gameState.discardPile.map(c => {
      if (c.type === CARD_TYPES.WILD || c.type === CARD_TYPES.WILD_DRAW4) {
        return { ...c, color: 'celestial' };
      }
      return c;
    }));
    gameState.drawPile = [...gameState.drawPile, ...reshuffled];
    gameState.discardPile = [top];
    gameState.actionLog.unshift({
      text: 'The discard pile was reshuffled into the deck.',
      timestamp: Date.now()
    });
  }
}
