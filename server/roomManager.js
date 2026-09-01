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
        this.handleTimeout(roomCode);
      }
    }, 1000);
  }

  stopTurnTimer(room) {
    if (room.turnTimerInterval) {
      clearInterval(room.turnTimerInterval);
      room.turnTimerInterval = null;
    }
  }

  handleTimeout(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room || !room.gameState) return;

    const currentPlayer = room.gameState.players[room.gameState.currentTurnIndex];
    if (!currentPlayer) return;

    room.gameState.actionLog.unshift({
      text: `${currentPlayer.name} ran out of time and drew a rune!`,
      timestamp: Date.now()
    });

    this.drawCard(roomCode, currentPlayer.id, true);
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
    const cardIndex = playerHand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return { error: "Card not in hand!" };

    const card = playerHand[cardIndex];

    if (!canPlayCard(card, gameState.topCard, gameState.activeColor, gameState.stackedDrawCount, gameState.rules)) {
      return { error: "That card cannot be played now!" };
    }

    playerHand.splice(cardIndex, 1);

    let spellEffect = null;

    if (card.type === CARD_TYPES.WILD || card.type === CARD_TYPES.WILD_DRAW4) {
      if (!chosenColor || !COLORS.includes(chosenColor)) {
        chosenColor = COLORS[0];
      }
      gameState.activeColor = chosenColor;
    } else {
      gameState.activeColor = card.color;
    }

    gameState.topCard = card;
    gameState.discardPile.push(card);

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

    if (card.type === CARD_TYPES.SKIP) {
      skipCount = 2;
      spellEffect = { type: 'FREEZE', target: gameState.players[(gameState.currentTurnIndex + gameState.direction + numPlayers) % numPlayers].name };
      gameState.actionLog.unshift({
        text: `${currentPlayer.name} cast Frost Stasis! ${spellEffect.target} was frozen!`,
        timestamp: Date.now()
      });
    } else if (card.type === CARD_TYPES.REVERSE) {
      gameState.direction *= -1;
      if (numPlayers === 2) {
        skipCount = 2;
      }
      spellEffect = { type: 'REVERSE', direction: gameState.direction };
      gameState.actionLog.unshift({
        text: `${currentPlayer.name} opened Chrono Rift! Flow reversed!`,
        timestamp: Date.now()
      });
    } else if (card.type === CARD_TYPES.DRAW2) {
      if (gameState.rules.stacking) {
        gameState.stackedDrawCount += 2;
        skipCount = 1;
      } else {
        const nextIdx = (gameState.currentTurnIndex + gameState.direction + numPlayers) % numPlayers;
        const targetPlayer = gameState.players[nextIdx];
        this.giveCards(gameState, targetPlayer.id, 2);
        skipCount = 2;
      }
      spellEffect = { type: 'LIGHTNING', count: 2 };
      gameState.actionLog.unshift({
        text: `${currentPlayer.name} cast Twin Lightning (+2) [Stack: ${gameState.stackedDrawCount}]!`,
        timestamp: Date.now()
      });
    } else if (card.type === CARD_TYPES.WILD_DRAW4) {
      if (gameState.rules.stacking) {
        gameState.stackedDrawCount += 4;
        skipCount = 1;
      } else {
        const nextIdx = (gameState.currentTurnIndex + gameState.direction + numPlayers) % numPlayers;
        const targetPlayer = gameState.players[nextIdx];
        this.giveCards(gameState, targetPlayer.id, 4);
        skipCount = 2;
      }
      spellEffect = { type: 'SUPERNOVA', color: chosenColor, count: 4 };
      gameState.actionLog.unshift({
        text: `${currentPlayer.name} summoned Supernova (+4) into ${chosenColor.toUpperCase()}!`,
        timestamp: Date.now()
      });
    } else if (card.type === CARD_TYPES.WILD) {
      spellEffect = { type: 'WILD_SHIFT', color: chosenColor };
      gameState.actionLog.unshift({
        text: `${currentPlayer.name} shifted element into ${chosenColor.toUpperCase()}!`,
        timestamp: Date.now()
      });
    } else {
      gameState.actionLog.unshift({
        text: `${currentPlayer.name} played ${card.name}`,
        timestamp: Date.now()
      });
    }

    gameState.currentTurnIndex = (gameState.currentTurnIndex + (gameState.direction * skipCount) + (numPlayers * 10)) % numPlayers;

    this.broadcastGameState(roomCode, { spellEffect, playedCard: card });
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
      const count = gameState.stackedDrawCount;
      const drawnCards = this.giveCards(gameState, playerId, count);
      gameState.stackedDrawCount = 0;

      gameState.actionLog.unshift({
        text: `${currentPlayer.name} absorbed penalty (+${count} Cards)!`,
        timestamp: Date.now()
      });

      const numPlayers = gameState.players.length;
      gameState.currentTurnIndex = (gameState.currentTurnIndex + gameState.direction + numPlayers) % numPlayers;

      this.broadcastGameState(roomCode, {
        spellEffect: { type: 'ABSORB_PENALTY', count }
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
