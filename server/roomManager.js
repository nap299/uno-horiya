// server/roomManager.js - Room Lifecycle & Game Action Handler (No Emojis)
import {
  initializeGame,
  ensureDrawPile,
  canPlayCard,
  CARD_TYPES,
  COLORS
} from './gameEngine.js';
import { decideBotMove, BOT_AVATARS, pickBotEmote } from './botPlayer.js';

export class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
  }

  generateRoomCode() {
    const prefixes = ['HORI', 'ARC', 'RUNE', 'MAGE', 'ORB', 'VOID', 'STAR'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${num}`;
  }

  createRoom(hostPlayer, options = {}) {
    const roomCode = this.generateRoomCode();
    const room = {
      code: roomCode,
      hostId: hostPlayer.id,
      status: 'LOBBY',
      players: [
        {
          id: hostPlayer.id,
          name: hostPlayer.name || 'Archmage Host',
          avatar: hostPlayer.avatar || 'flame',
          isBot: false,
          isHost: true,
          isReady: true,
          title: hostPlayer.title || 'Grand Archmage'
        }
      ],
      rules: {
        stacking: true,
        turnTimer: 20,
        drawToMatch: false,
        jumpIn: false,
        ...options
      },
      gameState: null,
      turnTimerInterval: null,
      timeRemaining: 20,
      createdAt: Date.now()
    };

    this.rooms.set(roomCode, room);
    return room;
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode?.toUpperCase());
  }

  joinRoom(roomCode, player) {
    const room = this.getRoom(roomCode);
    if (!room) return { error: 'Room not found in the realm.' };
    if (room.status !== 'LOBBY') return { error: 'Duel already in progress!' };
    if (room.players.length >= 5) return { error: 'ห้องเต็มแล้ว (รองรับสูงสุด 5 คน)' };

    const existingIndex = room.players.findIndex(p => p.id === player.id);
    if (existingIndex !== -1) {
      room.players[existingIndex].name = player.name;
      room.players[existingIndex].avatar = player.avatar;
    } else {
      room.players.push({
        id: player.id,
        name: player.name || `Duelist ${room.players.length + 1}`,
        avatar: player.avatar || 'shield',
        isBot: false,
        isHost: false,
        isReady: false,
        title: player.title || 'Apprentice Mage'
      });
    }

    return { room };
  }

  updatePlayer(roomCode, playerId, playerData = {}) {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return null;

    if (playerData.name) player.name = playerData.name.trim();
    if (playerData.avatar) player.avatar = playerData.avatar;
    if (playerData.title) player.title = playerData.title.trim();
    if (playerData.color) player.color = playerData.color;

    if (room.gameState && room.gameState.players) {
      const gp = room.gameState.players.find(p => p.id === playerId);
      if (gp) {
        if (playerData.name) gp.name = playerData.name.trim();
        if (playerData.avatar) gp.avatar = playerData.avatar;
        if (playerData.title) gp.title = playerData.title.trim();
      }
    }

    this.broadcastRoomUpdate(roomCode);
    if (room.gameState) {
      this.broadcastGameState(roomCode);
    }
    return room;
  }

  addBot(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'LOBBY') return null;
    if (room.players.length >= 5) return null;

    const botConfig = BOT_AVATARS[room.players.length % BOT_AVATARS.length];
    const botId = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const botPlayer = {
      id: botId,
      name: `${botConfig.name}`,
      avatar: botConfig.avatar,
      isBot: true,
      isHost: false,
      isReady: true,
      title: botConfig.title
    };

    room.players.push(botPlayer);
    this.broadcastRoomUpdate(roomCode);
    return botPlayer;
  }

  removeBot(roomCode, botId) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'LOBBY') return false;

    const index = room.players.findIndex(p => p.id === botId && p.isBot);
    if (index !== -1) {
      room.players.splice(index, 1);
      this.broadcastRoomUpdate(roomCode);
      return true;
    }
    return false;
  }

  toggleReady(roomCode, playerId) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'LOBBY') return;

    const player = room.players.find(p => p.id === playerId);
    if (player && !player.isHost) {
      player.isReady = !player.isReady;
      this.broadcastRoomUpdate(roomCode);
    }
  }

  updateRules(roomCode, hostId, newRules) {
    const room = this.getRoom(roomCode);
    if (!room || room.hostId !== hostId || room.status !== 'LOBBY') return;

    room.rules = { ...room.rules, ...newRules };
    this.broadcastRoomUpdate(roomCode);
  }

  leaveRoom(roomCode, playerId) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const wasHost = room.players[playerIndex].isHost;
    room.players.splice(playerIndex, 1);

    if (room.players.filter(p => !p.isBot).length === 0) {
      this.cleanupRoom(roomCode);
      return;
    }

    if (wasHost) {
      const nextHuman = room.players.find(p => !p.isBot);
      if (nextHuman) {
        nextHuman.isHost = true;
        nextHuman.isReady = true;
        room.hostId = nextHuman.id;
      }
    }

    if (room.status === 'PLAYING' && room.gameState) {
      if (room.players.length < 2) {
        room.status = 'LOBBY';
        room.gameState = null;
        this.stopTurnTimer(room);
      } else {
        delete room.gameState.hands[playerId];
        delete room.gameState.unoState[playerId];
        room.gameState.players = room.players;
        if (room.gameState.currentTurnIndex >= room.players.length) {
          room.gameState.currentTurnIndex = 0;
        }
        this.checkBotTurn(roomCode);
      }
    }

    this.broadcastRoomUpdate(roomCode);
  }

  startGame(roomCode, hostId) {
    const room = this.getRoom(roomCode);
    if (!room || room.hostId !== hostId || room.players.length < 2) {
      return { error: 'Need at least 2 players to begin the HORIYA duel.' };
    }

    room.status = 'PLAYING';
    room.gameState = initializeGame(room.players, room.rules);

    this.broadcastGameState(roomCode);
    this.startTurnTimer(roomCode);
    this.checkBotTurn(roomCode);

    return { success: true };
  }

  startTurnTimer(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState) return;

    this.stopTurnTimer(room);

    const timeLimit = room.rules.turnTimer || 20;
    if (timeLimit <= 0) return;

    room.timeRemaining = timeLimit;

    room.turnTimerInterval = setInterval(() => {
      room.timeRemaining--;
      this.io.to(roomCode).emit('TIMER_TICK', { timeRemaining: room.timeRemaining });

      if (room.timeRemaining <= 0) {
        this.stopTurnTimer(room);
        this.handleTimeout(roomCode);
      }
    }, 1000);
  }

  stopTurnTimer(room) {
    if (room && room.turnTimerInterval) {
      clearInterval(room.turnTimerInterval);
      room.turnTimerInterval = null;
    }
  }

  handleTimeout(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState) return;

    this.stopTurnTimer(room);

    const currentPlayer = room.gameState.players[room.gameState.currentTurnIndex];
    if (!currentPlayer) return;

    room.gameState.actionLog.unshift({
      text: `${currentPlayer.name} ran out of time and drew automatically!`,
      timestamp: Date.now()
    });

    const result = this.drawCard(roomCode, currentPlayer.id, true);
    if (result && result.error) {
      console.warn(`[Auto-draw timeout warning]:`, result.error);
      const numPlayers = room.gameState.players.length;
      room.gameState.currentTurnIndex = (room.gameState.currentTurnIndex + room.gameState.direction + numPlayers) % numPlayers;
      this.broadcastGameState(roomCode);
      this.startTurnTimer(roomCode);
      this.checkBotTurn(roomCode);
    }
  }

  playCard(roomCode, playerId, cardId, chosenColor) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'PLAYING' || !room.gameState) return { error: 'Game not active' };

    const gameState = room.gameState;
    const currentPlayer = gameState.players[gameState.currentTurnIndex];

    if (currentPlayer.id !== playerId) {
      return { error: "Not your turn!" };
    }

    const playerHand = gameState.hands[playerId];
    const cardIds = Array.isArray(cardId) ? cardId : [cardId];
    if (cardIds.length === 0) return { error: "No card specified" };

    // Find all cards in hand
    const cardsToPlay = [];
    for (const id of cardIds) {
      const found = playerHand.find(c => c.id === id);
      if (!found) return { error: "Card not in hand!" };
      cardsToPlay.push(found);
    }

    // If multiple cards, ensure they are strictly NUMBER cards (0 - 9) and share the same value!
    if (cardsToPlay.length > 1) {
      const isNumberCard = (c) => c.type === CARD_TYPES.NUMBER && typeof c.value === 'number' && c.value >= 0 && c.value <= 9;
      if (!cardsToPlay.every(isNumberCard)) {
        return { error: "การ์ดที่ไม่ใช่ตัวเลข 0-9 ไม่สามารถลงมากกว่า 1 ใบได้!" };
      }
      const firstVal = cardsToPlay[0].value;
      const allSameValue = cardsToPlay.every(c => c.value === firstVal);
      if (!allSameValue) {
        return { error: "All cards played together must share the same number/value!" };
      }
    }

    // Check if the combo is playable on current topCard
    // At least one card in the set must match topCard / activeColor according to canPlayCard
    const canPlayCombo = cardsToPlay.some(c =>
      canPlayCard(c, gameState.topCard, gameState.activeColor, gameState.stackedDrawCount, gameState.rules)
    );
    if (!canPlayCombo) {
      return { error: "That card combo cannot be played now!" };
    }

    // Remove cards from hand
    for (const played of cardsToPlay) {
      const idx = playerHand.findIndex(c => c.id === played.id);
      if (idx !== -1) playerHand.splice(idx, 1);
    }

    // Push cards into discard pile in order; the LAST card in cardIds lands on top!
    for (const played of cardsToPlay) {
      gameState.discardPile.push(played);
    }
    const lastCard = cardsToPlay[cardsToPlay.length - 1];
    gameState.topCard = lastCard;

    let spellEffect = null;

    if (lastCard.type === CARD_TYPES.WILD || lastCard.type === CARD_TYPES.WILD_DRAW4) {
      if (!chosenColor || !COLORS.includes(chosenColor)) {
        chosenColor = COLORS[0];
      }
      gameState.activeColor = chosenColor;
    } else if (lastCard.type === CARD_TYPES.REVERSE) {
      gameState.activeColor = 'any';
    } else {
      gameState.activeColor = lastCard.color;
    }

    if (playerHand.length === 1) {
      if (!gameState.unoState[playerId].hasCalledUno) {
        gameState.unoState[playerId].mustCallUno = true;
      }
    } else {
      gameState.unoState[playerId].hasCalledUno = false;
      gameState.unoState[playerId].mustCallUno = false;
    }

    if (playerHand.length === 0) {
      gameState.winner = currentPlayer;
      room.status = 'FINISHED';
      this.stopTurnTimer(room);

      gameState.actionLog.unshift({
        text: `${currentPlayer.name} has cast their final rune and won the match!`,
        timestamp: Date.now()
      });

      this.broadcastGameState(roomCode, {
        spellEffect: { type: 'VICTORY', caster: currentPlayer.name }
      });
      return { success: true };
    }

    let skipCount = 1;
    const numPlayers = gameState.players.length;

    if (lastCard.type === CARD_TYPES.SKIP) {
      skipCount = 2;
      spellEffect = { type: 'FREEZE', target: gameState.players[(gameState.currentTurnIndex + gameState.direction + numPlayers) % numPlayers]?.name || 'Skipped!' };
      gameState.actionLog.unshift({
        text: `${currentPlayer.name} cast Frost Stasis!`,
        timestamp: Date.now()
      });
    } else if (lastCard.type === CARD_TYPES.REVERSE) {
      gameState.direction *= -1;
      if (numPlayers === 2) {
        skipCount = 2;
      }
      gameState.activeColor = 'any';
      spellEffect = { type: 'REVERSE', direction: gameState.direction };
      gameState.actionLog.unshift({
        text: `${currentPlayer.name} opened Chrono Rift! Flow reversed!`,
        timestamp: Date.now()
      });
    } else if (lastCard.type === CARD_TYPES.DRAW2) {
      const addedCount = 2;
      if (gameState.rules.stacking) {
        gameState.stackedDrawCount = Math.min(10, gameState.stackedDrawCount + addedCount);
        skipCount = 1;
      } else {
        const nextIdx = (gameState.currentTurnIndex + gameState.direction + numPlayers) % numPlayers;
        const targetPlayer = gameState.players[nextIdx];
        this.giveCards(gameState, targetPlayer.id, addedCount);
        skipCount = 2;
      }
      spellEffect = {
        type: 'DRAW_EFFECT',
        count: gameState.stackedDrawCount || addedCount,
        cardType: 'draw2',
        color: lastCard.color
      };
      gameState.actionLog.unshift({
        text: `${currentPlayer.name} cast Twin Lightning (+2) [Stack: +${gameState.stackedDrawCount}]!`,
        timestamp: Date.now()
      });
    } else if (lastCard.type === CARD_TYPES.WILD_DRAW4) {
      const addedCount = 4;
      if (gameState.rules.stacking) {
        gameState.stackedDrawCount = Math.min(10, gameState.stackedDrawCount + addedCount);
        skipCount = 1;
      } else {
        const nextIdx = (gameState.currentTurnIndex + gameState.direction + numPlayers) % numPlayers;
        const targetPlayer = gameState.players[nextIdx];
        this.giveCards(gameState, targetPlayer.id, addedCount);
        skipCount = 2;
      }
      spellEffect = {
        type: 'DRAW_EFFECT',
        count: gameState.stackedDrawCount || addedCount,
        cardType: 'wild_draw4',
        color: chosenColor
      };
      gameState.actionLog.unshift({
        text: `${currentPlayer.name} summoned Supernova (+4) into ${chosenColor.toUpperCase()} [Stack: +${gameState.stackedDrawCount}]!`,
        timestamp: Date.now()
      });
    } else if (lastCard.type === CARD_TYPES.WILD) {
      spellEffect = { type: 'WILD_SHIFT', color: chosenColor };
      gameState.actionLog.unshift({
        text: `${currentPlayer.name} shifted element into ${chosenColor.toUpperCase()}!`,
        timestamp: Date.now()
      });
    } else {
      const comboLabel = cardsToPlay.length > 1
        ? `${cardsToPlay.length}x Rune [${lastCard.value}] (Color: ${gameState.activeColor.toUpperCase()})`
        : lastCard.name;
      gameState.actionLog.unshift({
        text: `${currentPlayer.name} played ${comboLabel}`,
        timestamp: Date.now()
      });
    }

    gameState.currentTurnIndex = (gameState.currentTurnIndex + (gameState.direction * skipCount) + (numPlayers * 10)) % numPlayers;

    this.broadcastGameState(roomCode, { spellEffect, playedCard: lastCard, playedCards: cardsToPlay });
    this.startTurnTimer(roomCode);
    this.checkBotTurn(roomCode);

    return { success: true };
  }

  giveCards(gameState, playerId, count) {
    ensureDrawPile(gameState);
    const hand = gameState.hands[playerId];
    if (!hand) return [];

    const drawn = [];
    for (let i = 0; i < count; i++) {
      ensureDrawPile(gameState);
      if (gameState.drawPile.length > 0) {
        const c = gameState.drawPile.pop();
        hand.push(c);
        drawn.push(c);
      }
    }
    return drawn;
  }

  drawCard(roomCode, playerId, forcePass = false) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'PLAYING' || !room.gameState) return { error: 'Game not active' };

    const gameState = room.gameState;
    const currentPlayer = gameState.players[gameState.currentTurnIndex];

    if (currentPlayer.id !== playerId) {
      return { error: "Not your turn to draw runes!" };
    }

    if (gameState.stackedDrawCount > 0) {
      const count = Math.min(10, gameState.stackedDrawCount);
      const drawnCards = this.giveCards(gameState, playerId, count);
      gameState.stackedDrawCount = 0;

      gameState.actionLog.unshift({
        text: `${currentPlayer.name} absorbed penalty (+${count} Cards)!`,
        timestamp: Date.now()
      });

      const numPlayers = gameState.players.length;
      gameState.currentTurnIndex = (gameState.currentTurnIndex + gameState.direction + numPlayers) % numPlayers;

      this.broadcastGameState(roomCode, {
        spellEffect: { type: 'ABSORB_PENALTY', count, target: currentPlayer.name }
      });
      this.startTurnTimer(roomCode);
      this.checkBotTurn(roomCode);
      return { success: true, drawnCount: count };
    }

    const drawn = this.giveCards(gameState, playerId, 1);
    const drawnCard = drawn[0];

    if (gameState.unoState[playerId]) {
      gameState.unoState[playerId].mustCallUno = false;
    }

    gameState.actionLog.unshift({
      text: `${currentPlayer.name} drew a card from the deck.`,
      timestamp: Date.now()
    });

    const numPlayers = gameState.players.length;
    gameState.currentTurnIndex = (gameState.currentTurnIndex + gameState.direction + numPlayers) % numPlayers;

    this.broadcastGameState(roomCode);
    this.startTurnTimer(roomCode);
    this.checkBotTurn(roomCode);

    return { success: true, drawnCard };
  }

  shoutUno(roomCode, playerId) {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState) return;

    const gameState = room.gameState;
    const player = gameState.players.find(p => p.id === playerId);
    const hand = gameState.hands[playerId];

    if (!player || !hand) return;

    if (hand.length <= 2) {
      gameState.unoState[playerId].hasCalledUno = true;
      gameState.unoState[playerId].mustCallUno = false;

      gameState.actionLog.unshift({
        text: `${player.name} SHOUTED "UNO!" - ONE CARD REMAINING!`,
        timestamp: Date.now()
      });

      this.io.to(roomCode).emit('UNO_SHOUTED', {
        playerId,
        playerName: player.name
      });
    }
  }

  calloutUno(roomCode, callerId, targetId) {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState) return;

    const gameState = room.gameState;
    const caller = gameState.players.find(p => p.id === callerId);
    const target = gameState.players.find(p => p.id === targetId);
    const targetHand = gameState.hands[targetId];

    if (!caller || !target || !targetHand) return;

    if (targetHand.length === 1 && gameState.unoState[targetId]?.mustCallUno && !gameState.unoState[targetId]?.hasCalledUno) {
      this.giveCards(gameState, targetId, 2);
      gameState.unoState[targetId].mustCallUno = false;

      gameState.actionLog.unshift({
        text: `${caller.name} CAUGHT ${target.name} forgetting UNO! (+2 Penalty)!`,
        timestamp: Date.now()
      });

      this.io.to(roomCode).emit('UNO_PENALTY', {
        callerName: caller.name,
        targetName: target.name,
        targetId
      });

      this.broadcastGameState(roomCode);
    }
  }

  sendEmote(roomCode, playerId, emoji) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return;

    this.io.to(roomCode).emit('EMOTE_RECEIVED', {
      playerId,
      playerName: player.name,
      emoji,
      timestamp: Date.now()
    });
  }

  checkBotTurn(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'PLAYING' || !room.gameState) return;

    const gameState = room.gameState;
    const currentPlayer = gameState.players[gameState.currentTurnIndex];

    if (!currentPlayer || !currentPlayer.isBot) return;

    const delay = 900 + Math.floor(Math.random() * 700);

    setTimeout(() => {
      const activeRoom = this.getRoom(roomCode);
      if (!activeRoom || activeRoom.status !== 'PLAYING' || !activeRoom.gameState) return;
      if (activeRoom.gameState.players[activeRoom.gameState.currentTurnIndex]?.id !== currentPlayer.id) return;

      const botDecision = decideBotMove(activeRoom.gameState, currentPlayer.id);
      if (!botDecision) return;

      if (botDecision.action === 'DRAW') {
        this.drawCard(roomCode, currentPlayer.id);
      } else if (botDecision.action === 'PLAY') {
        const botHand = activeRoom.gameState.hands[currentPlayer.id];
        if (botHand && botHand.length === 2) {
          setTimeout(() => {
            this.shoutUno(roomCode, currentPlayer.id);
          }, 300);
        }

        this.playCard(roomCode, currentPlayer.id, botDecision.cardId, botDecision.chosenColor);

        if (Math.random() < 0.35) {
          const emote = pickBotEmote(botDecision.chosenColor ? 'draw4_give' : 'uno');
          setTimeout(() => {
            this.sendEmote(roomCode, currentPlayer.id, emote);
          }, 600);
        }
      }
    }, delay);
  }

  broadcastRoomUpdate(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    this.io.to(roomCode).emit('ROOM_UPDATE', {
      code: room.code,
      hostId: room.hostId,
      status: room.status,
      players: room.players,
      rules: room.rules
    });
  }

  broadcastGameState(roomCode, extraData = {}) {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState) return;

    const gs = room.gameState;

    room.players.forEach(p => {
      const publicPlayerHands = {};
      Object.keys(gs.hands).forEach(pid => {
        publicPlayerHands[pid] = {
          count: gs.hands[pid].length,
          hasCalledUno: gs.unoState[pid]?.hasCalledUno || false,
          mustCallUno: gs.unoState[pid]?.mustCallUno || false
        };
      });

      this.io.to(p.id).emit('GAME_STATE_UPDATE', {
        roomCode: room.code,
        players: gs.players,
        myHand: gs.hands[p.id] || [],
        playerCardCounts: publicPlayerHands,
        topCard: gs.topCard,
        activeColor: gs.activeColor,
        direction: gs.direction,
        currentTurnIndex: gs.currentTurnIndex,
        stackedDrawCount: gs.stackedDrawCount,
        drawPileCount: gs.drawPile.length,
        discardPileCount: gs.discardPile.length,
        rules: gs.rules,
        winner: gs.winner,
        actionLog: gs.actionLog.slice(0, 20),
        ...extraData
      });
    });
  }

  cleanupRoom(roomCode) {
    const room = this.getRoom(roomCode);
    if (room) {
      this.stopTurnTimer(room);
      this.rooms.delete(roomCode);
    }
  }
}
