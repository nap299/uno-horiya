// src/components/common/SoundControl.jsx - Audio & BGM Controller
import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Sliders } from 'lucide-react';
import { sound } from '../../audio/soundEngine';

export default function SoundControl() {
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [bgmActive, setBgmActive] = useState(sound.bgmPlaying);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(sound.volume);

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleBgm = () => {
    sound.init();
    const playing = sound.toggleBgm();
    setBgmActive(playing);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    sound.setVolume(val);
    if (isMuted && val > 0) {
      sound.toggleMute();
      setIsMuted(false);
    }
  };

  return (
    <div className="sound-control-wrapper">
      {showVolumeSlider && (
        <div className="volume-slider-popup animate-slide-down">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-range-input"
          />
        </div>
      )}

      <button
        className={`btn-sound-icon ${isMuted ? 'muted' : ''}`}
        onClick={handleToggleMute}
        title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <button
        className={`btn-sound-icon ${bgmActive ? 'bgm-on' : ''}`}
        onClick={handleToggleBgm}
        title={bgmActive ? 'Mute Ambient Music' : 'Play Mystical Ambient Music'}
      >
        <Music size={18} />
      </button>

      <button
        className="btn-sound-icon"
        onClick={() => setShowVolumeSlider(!showVolumeSlider)}
        title="Adjust Volume"
      >
        <Sliders size={18} />
      </button>
    </div>
  );
}
