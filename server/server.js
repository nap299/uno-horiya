// server/server.js - HORIYA Real-Time Socket.IO & Express Server (Production Ready)
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { RoomManager } from './roomManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const roomManager = new RoomManager(io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'HORIYA Server', time: Date.now(), activeRooms: roomManager.rooms.size });
});

// Check room existence
app.get('/api/room/:code', (req, res) => {
  const room = roomManager.getRoom(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({
    code: room.code,
    status: room.status,
    playerCount: room.players.length,
    rules: room.rules
  });
});

// Serve frontend static assets if built in ../dist
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback all other routes to frontend index.html for SPA
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io/')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('HORIYA Game Server is active! (Build frontend to view UI)');
    }
  });
});

// Socket.io Connection & Event Handling
io.on('connection', (socket) => {
  let currentRoomCode = null;
  let currentPlayerId = null;

  // Create new room
  socket.on('CREATE_ROOM', ({ player, options }, callback) => {
    try {
      const room = roomManager.createRoom({ ...player, id: socket.id }, options);
      currentRoomCode = room.code;
      currentPlayerId = socket.id;

      socket.join(room.code);
      socket.join(socket.id);

      if (callback) callback({ success: true, room });
      roomManager.broadcastRoomUpdate(room.code);
    } catch (err) {
      if (callback) callback({ error: err.message });
    }
  });

  // Join existing room
  socket.on('JOIN_ROOM', ({ roomCode, player }, callback) => {
    try {
      const result = roomManager.joinRoom(roomCode, { ...player, id: socket.id });
      if (result.error) {
        if (callback) callback({ error: result.error });
        return;
      }

      currentRoomCode = roomCode.toUpperCase();
      currentPlayerId = socket.id;

      socket.join(currentRoomCode);
      socket.join(socket.id);

      if (callback) callback({ success: true, room: result.room });
      roomManager.broadcastRoomUpdate(currentRoomCode);
    } catch (err) {
      if (callback) callback({ error: err.message });
    }
  });

  // Update Player Profile in Room
  socket.on('UPDATE_PROFILE', ({ roomCode, player }) => {
    const targetRoom = roomCode || currentRoomCode;
    if (targetRoom && player) {
      roomManager.updatePlayer(targetRoom, socket.id, player);
    }
  });

  // Add AI Bot
  socket.on('ADD_BOT', ({ roomCode }) => {
    roomManager.addBot(roomCode);
  });

  // Remove AI Bot
  socket.on('REMOVE_BOT', ({ roomCode, botId }) => {
    roomManager.removeBot(roomCode, botId);
  });

  // Toggle Ready
  socket.on('TOGGLE_READY', ({ roomCode }) => {
    roomManager.toggleReady(roomCode, socket.id);
  });

  // Update House Rules
  socket.on('UPDATE_RULES', ({ roomCode, rules }) => {
    roomManager.updateRules(roomCode, socket.id, rules);
  });

  // Start Game
  socket.on('START_GAME', ({ roomCode }, callback) => {
    const result = roomManager.startGame(roomCode, socket.id);
    if (callback) callback(result);
  });

  // Play Card
  socket.on('PLAY_CARD', ({ roomCode, cardId, chosenColor }, callback) => {
    const result = roomManager.playCard(roomCode, socket.id, cardId, chosenColor);
    if (callback) callback(result);
  });

  // Draw Card
  socket.on('DRAW_CARD', ({ roomCode }, callback) => {
    const result = roomManager.drawCard(roomCode, socket.id);
    if (callback) callback(result);
  });



  // Shout UNO
  socket.on('SHOUT_UNO', ({ roomCode }) => {
    roomManager.shoutUno(roomCode, socket.id);
  });

  // Callout UNO penalty on opponent
  socket.on('CALLOUT_UNO', ({ roomCode, targetId }) => {
    roomManager.calloutUno(roomCode, socket.id, targetId);
  });

  // Send Emote
  socket.on('SEND_EMOTE', ({ roomCode, emoji }) => {
    roomManager.sendEmote(roomCode, socket.id, emoji);
  });

  // Leave Room
  socket.on('LEAVE_ROOM', ({ roomCode }) => {
    if (roomCode) {
      socket.leave(roomCode);
      roomManager.leaveRoom(roomCode, socket.id);
      currentRoomCode = null;
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (currentRoomCode) {
      roomManager.leaveRoom(currentRoomCode, socket.id);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✨ HORIYA Game Server listening on port ${PORT}`);
});
