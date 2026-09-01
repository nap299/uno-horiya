// src/main.jsx - Application Entry Point
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { GameSocketProvider } from './context/GameSocketContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <GameSocketProvider>
        <App />
      </GameSocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
