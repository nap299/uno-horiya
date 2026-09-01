// src/context/GameSocketContext.jsx - Real-time Socket.IO Connection & Game Dispatcher
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { sound } from '../audio/soundEngine';

const GameSocketContext = createContext(null);

export function GameSocketProvider({ children }) {
  const { user, recordGameResult } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [activeSpell, setActiveSpell] = useState(null);
  const [floatingEmotes, setFloatingEmotes] = useState([]);
  const [unoAlert, setUnoAlert] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const prevTurnRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    let socketUrl = window.__HORIYA_SOCKET_URL__ || import.meta.env.VITE_SOCKET_URL || localStorage.getItem('horiya_socket_url');
    
    if (!socketUrl) {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
        socketUrl = `${window.location.protocol}//${hostname}:3001`;
      } else {
        socketUrl = window.location.origin;
      }
    }

    console.log('📡 Connecting to HORIYA Server at:', socketUrl);

    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    s.on('connect', () => {
      console.log('👑 Connected to HORIYA Gateway:', s.id);
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      console.log('🌀 Disconnected from Gateway');
      setIsConnected(false);
    });

    s.on('ROOM_UPDATE', (updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom.status === 'LOBBY') {
        setGameState(null);
      }
    });

    s.on('GAME_STATE_UPDATE', (newGameState) => {
      setGameState(newGameState);

      // Trigger SFX for played card / spell
      if (newGameState.playedCard) {
        sound.playCard(newGameState.playedCard.color);
      }

      if (newGameState.spellEffect) {
        setActiveSpell(newGameState.spellEffect);

        switch (newGameState.spellEffect.type) {
          case 'FREEZE':
            sound.playSkip();
            break;
          case 'REVERSE':
            sound.playReverse();
            break;
          case 'LIGHTNING':
            sound.playLightning();
            break;
          case 'SUPERNOVA':
            sound.playSupernova();
            break;
          case 'VICTORY':
            sound.playVictory();
            break;
          default:
            break;
        }

        setTimeout(() => setActiveSpell(null), 2500);
      }

      // Check if it's currently our turn
      const myId = s.id;
      const isMyTurn = newGameState.players[newGameState.currentTurnIndex]?.id === myId;
      if (isMyTurn && prevTurnRef.current !== newGameState.currentTurnIndex) {
        sound.playTurnTick(1);
      }
      prevTurnRef.current = newGameState.currentTurnIndex;

      // Handle Victory Record
      if (newGameState.winner) {
        const isWinner = newGameState.winner.id === myId;
        recordGameResult(isWinner);
      }
    });

    s.on('TIMER_TICK', ({ timeRemaining: t }) => {
      setTimeRemaining(t);
      if (t <= 5 && t > 0) {
        sound.playTurnTick(6 - t);
      }
    });

    s.on('UNO_SHOUTED', ({ playerId, playerName }) => {
      sound.playUnoShout();
      setUnoAlert({ type: 'SHOUT', playerName, playerId });
      setTimeout(() => setUnoAlert(null), 3000);
    });

    s.on('UNO_PENALTY', ({ callerName, targetName, targetId }) => {
      sound.playUnoPenalty();
      setUnoAlert({ type: 'PENALTY', callerName, targetName, targetId });
      setTimeout(() => setUnoAlert(null), 3500);
    });

    s.on('EMOTE_RECEIVED', ({ playerId, playerName, emoji }) => {
      sound.playEmote();
      const emoteId = `${playerId}_${Date.now()}_${Math.random()}`;
      setFloatingEmotes(prev => [...prev, { id: emoteId, playerId, playerName, emoji }]);
      setTimeout(() => {
        setFloatingEmotes(prev => prev.filter(e => e.id !== emoteId));
      }, 3000);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Room Actions
  const createRoom = (options = {}) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        const msg = 'กำลังเชื่อมต่อกับเซิร์ฟเวอร์... กรุณาลองใหม่อีกครั้ง';
        setErrorMsg(msg);
        return reject(new Error(msg));
      }

      const timer = setTimeout(() => {
        const msg = 'การสร้างห้องใช้เวลานานเกินไป กรุณาลองใหม่';
        setErrorMsg(msg);
        reject(new Error(msg));
      }, 7000);

      socket.emit('CREATE_ROOM', { player: user, options }, (res) => {
        clearTimeout(timer);
        if (res?.error) {
          setErrorMsg(res.error);
          reject(new Error(res.error));
        } else if (res?.room) {
          setRoom(res.room);
          resolve(res.room);
        } else {
          reject(new Error('Unknown room response'));
        }
      });
    });
  };

  const joinRoom = (roomCode) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        const msg = 'กำลังเชื่อมต่อกับเซิร์ฟเวอร์... กรุณาลองใหม่อีกครั้ง';
        setErrorMsg(msg);
        return reject(new Error(msg));
      }

      const timer = setTimeout(() => {
        const msg = 'การเข้าร่วมห้องใช้เวลานานเกินไป';
        setErrorMsg(msg);
        reject(new Error(msg));
      }, 7000);

      socket.emit('JOIN_ROOM', { roomCode: roomCode.trim().toUpperCase(), player: user }, (res) => {
        clearTimeout(timer);
        if (res?.error) {
          setErrorMsg(res.error);
          reject(new Error(res.error));
        } else if (res?.room) {
          setRoom(res.room);
          resolve(res.room);
        } else {
          reject(new Error('Unknown join response'));
        }
      });
    });
  };

  const addBot = () => {
    if (!socket || !room) return;
    socket.emit('ADD_BOT', { roomCode: room.code });
  };

  const removeBot = (botId) => {
    if (!socket || !room) return;
    socket.emit('REMOVE_BOT', { roomCode: room.code, botId });
  };

  const toggleReady = () => {
    if (!socket || !room) return;
    socket.emit('TOGGLE_READY', { roomCode: room.code });
  };

  const updateRules = (rules) => {
    if (!socket || !room) return;
    socket.emit('UPDATE_RULES', { roomCode: room.code, rules });
  };

  const startGame = () => {
    return new Promise((resolve, reject) => {
      if (!socket || !room) return reject('No room');
      socket.emit('START_GAME', { roomCode: room.code }, (res) => {
        if (res?.error) {
          setErrorMsg(res.error);
          reject(res.error);
        } else {
          resolve(res);
        }
      });
    });
  };

  const playCard = (cardId, chosenColor = null) => {
    return new Promise((resolve, reject) => {
      if (!socket || !room) return reject('No game');
      socket.emit('PLAY_CARD', { roomCode: room.code, cardId, chosenColor }, (res) => {
        if (res?.error) {
          setErrorMsg(res.error);
          reject(res.error);
        } else {
          resolve(res);
        }
      });
    });
  };

  const drawCard = () => {
    return new Promise((resolve, reject) => {
      if (!socket || !room) return reject('No game');
      sound.playDraw();
      socket.emit('DRAW_CARD', { roomCode: room.code }, (res) => {
        if (res?.error) {
          setErrorMsg(res.error);
          reject(res.error);
        } else {
          resolve(res);
        }
      });
    });
  };

  const shoutUno = () => {
    if (!socket || !room) return;
    socket.emit('SHOUT_UNO', { roomCode: room.code });
  };

  const calloutUno = (targetId) => {
    if (!socket || !room) return;
    socket.emit('CALLOUT_UNO', { roomCode: room.code, targetId });
  };

  const sendEmote = (emoji) => {
    if (!socket || !room) return;
    socket.emit('SEND_EMOTE', { roomCode: room.code, emoji });
  };

  const leaveRoom = () => {
    if (!socket || !room) return;
    socket.emit('LEAVE_ROOM', { roomCode: room.code });
    setRoom(null);
    setGameState(null);
  };

  const clearError = () => setErrorMsg(null);

  return (
    <GameSocketContext.Provider value={{
      socket,
      isConnected,
      room,
      gameState,
      timeRemaining,
      activeSpell,
      floatingEmotes,
      unoAlert,
      errorMsg,
      clearError,
      createRoom,
      joinRoom,
      addBot,
      removeBot,
      toggleReady,
      updateRules,
      startGame,
      playCard,
      drawCard,
      shoutUno,
      calloutUno,
      sendEmote,
      leaveRoom
    }}>
      {children}
    </GameSocketContext.Provider>
  );
}

export function useGameSocket() {
  return useContext(GameSocketContext);
}
