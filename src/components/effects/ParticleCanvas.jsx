// src/components/effects/ParticleCanvas.jsx - Dynamic Mana & Elemental Particle Background
import React, { useEffect, useRef } from 'react';
import { ELEMENT_THEMES } from '../../models/cardThemes';

export default function ParticleCanvas({ activeColor = 'ruby' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Color theme mapping
    const theme = ELEMENT_THEMES[activeColor] || ELEMENT_THEMES.ruby;

    // Particle setup
    const particleCount = Math.min(60, Math.floor((width * height) / 25000));
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1,
        speedX: (Math.random() - 0.5) * 0.6,
        speedY: (Math.random() - 0.5) * 0.6 - 0.2, // slight upward float
        alpha: Math.random() * 0.7 + 0.2,
        pulse: Math.random() * 0.05 + 0.01,
        maxAlpha: Math.random() * 0.6 + 0.3
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render subtle, crisp ambient floating motes on top of transparent background
      particles.forEach((p) => {
        p.x += p.speedX * 0.5;
        p.y += p.speedY * 0.5;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        p.alpha += Math.sin(Date.now() * 0.001 + p.x) * 0.003;
        const currentAlpha = Math.max(0.08, Math.min(0.25, p.alpha * 0.4));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = theme.primary || '#3B82F6';
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
}
