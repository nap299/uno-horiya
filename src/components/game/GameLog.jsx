// src/components/game/GameLog.jsx - Real-time Arcane Combat & Action Feed
import React, { useState } from 'react';
import { Scroll, ChevronUp, ChevronDown } from 'lucide-react';

export default function GameLog({ logs = [] }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`game-log-panel ${isCollapsed ? 'log-collapsed' : ''}`}>
      <div className="log-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="log-title">
          <Scroll size={16} />
          <span>ARCANE LOG</span>
        </div>
        <button className="btn-collapse-log">
          {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="log-entries">
          {logs.length === 0 ? (
            <div className="log-empty">The mystic arena awaits...</div>
          ) : (
            logs.map((entry, idx) => (
              <div key={idx} className="log-entry animate-fade-in">
                <span className="log-text">{entry.text}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
