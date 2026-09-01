// src/App.jsx - Main Application Router & Scene Manager
import React, { useState, useEffect } from 'react';
import { useGameSocket } from './context/GameSocketContext';
import { useAuth } from './context/AuthContext';
import ParticleCanvas from './components/effects/ParticleCanvas';
import Header from './components/common/Header';
import LobbyPage from './pages/LobbyPage';
import RoomPage from './pages/RoomPage';
import GamePage from './pages/GamePage';
import LoginModal from './components/auth/LoginModal';
import RulesModal from './components/common/RulesModal';

export default function App() {
  const { room, gameState, joinRoom } = useGameSocket();
  const { user } = useAuth();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Check URL parameters for direct invite room join (e.g. ?room=RUNE-409)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomCodeParam = params.get('room');
    if (roomCodeParam && !room) {
      joinRoom(roomCodeParam.toUpperCase()).catch((err) => {
        console.warn('Auto-join failed:', err);
      });
    }
  }, []);

  const activeColor = gameState?.activeColor || gameState?.topCard?.color || user?.color || 'ruby';

  return (
    <div className="app-root-wrapper">
      {/* Background Magic Particle Engine */}
      <ParticleCanvas activeColor={activeColor} />

      {/* Global Header Navigation */}
      <Header
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
      />

      {/* Main Dynamic View Area */}
      <main className="app-main-viewport">
        {gameState ? (
          <GamePage />
        ) : room ? (
          <RoomPage />
        ) : (
          <LobbyPage
            onOpenProfile={() => setShowProfileModal(true)}
            onOpenRules={() => setShowRulesModal(true)}
          />
        )}
      </main>

      {/* Modals */}
      {showProfileModal && (
        <LoginModal onClose={() => setShowProfileModal(false)} />
      )}

      {showRulesModal && (
        <RulesModal onClose={() => setShowRulesModal(false)} />
      )}
    </div>
  );
}
