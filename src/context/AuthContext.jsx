// src/context/AuthContext.jsx - Google OAuth & Fantasy Profile Manager (No Emojis)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AVATAR_PRESETS } from '../models/cardTypes';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('horiya_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const randomPreset = AVATAR_PRESETS[0];
    return {
      id: `duelist_${Math.random().toString(36).substr(2, 9)}`,
      name: randomPreset.name,
      avatar: randomPreset.iconId,
      title: randomPreset.title,
      color: randomPreset.color,
      isGoogle: false,
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        unoShouts: 0,
        highestStreak: 0,
        currentStreak: 0
      }
    };
  });

  const [googleClientId, setGoogleClientId] = useState(() => {
    return localStorage.getItem('horiya_google_cid') || '';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('horiya_user', JSON.stringify(user));
    }
  }, [user]);

  const handleGoogleCredentialResponse = (response) => {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const profile = JSON.parse(jsonPayload);

      setUser(prev => ({
        ...prev,
        id: `google_${profile.sub}`,
        name: profile.name || profile.given_name || 'Archmage',
        avatar: profile.picture || 'flame',
        email: profile.email,
        isGoogle: true,
        title: 'Google Grand Master'
      }));
    } catch (err) {
      console.error('Failed to parse Google credentials', err);
    }
  };

  const loginAsGuest = (guestData) => {
    setUser(prev => ({
      ...prev,
      ...guestData,
      isGoogle: false
    }));
  };

  const recordGameResult = (isWin, unoShoutsCount = 0) => {
    setUser(prev => {
      const currentStreak = isWin ? (prev.stats.currentStreak || 0) + 1 : 0;
      const highestStreak = Math.max(prev.stats.highestStreak || 0, currentStreak);
      return {
        ...prev,
        stats: {
          gamesPlayed: (prev.stats.gamesPlayed || 0) + 1,
          gamesWon: (prev.stats.gamesWon || 0) + (isWin ? 1 : 0),
          unoShouts: (prev.stats.unoShouts || 0) + unoShoutsCount,
          currentStreak,
          highestStreak
        }
      };
    });
  };

  const logout = () => {
    const randomPreset = AVATAR_PRESETS[0];
    setUser({
      id: `duelist_${Math.random().toString(36).substr(2, 9)}`,
      name: randomPreset.name,
      avatar: randomPreset.iconId,
      title: randomPreset.title,
      color: randomPreset.color,
      isGoogle: false,
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        unoShouts: 0,
        highestStreak: 0,
        currentStreak: 0
      }
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loginAsGuest,
      recordGameResult,
      logout,
      googleClientId,
      setGoogleClientId,
      handleGoogleCredentialResponse
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
