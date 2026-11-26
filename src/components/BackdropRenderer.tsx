import React, { useEffect, useRef, useState } from 'react';
import { BACKDROPS, MOOD_PALETTES } from '../data/backdrops';
import { BackdropId, MoodId, MoodPalette, ParticleType } from '../types/vn';

interface BackdropRendererProps {
  backdropId: BackdropId;
  mood?: MoodId;
  particles?: ParticleType;
  overrideUrl?: string | null;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

function createParticles(type: ParticleType, w: number, h: number): Particle[] {
  if (type === 'none') return [];
  const count = type === 'rain' ? 130 : type === 'embers' ? 45 : 55;
  const list: Particle[] = [];
  for (let i = 0; i < count; i++) {
    if (type === 'rain') {
      list.push({ x: Math.random() * w, y: Math.random() * h, vx: -2.2 - Math.random() * 1.2, vy: 14 + Math.random() * 8, size: 14 + Math.random() * 14, alpha: 0.25 + Math.random() * 0.35 });
    } else if (type === 'embers') {
      list.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.8, vy: -0.9 - Math.random() * 1.6, size: 1.5 + Math.random() * 2.8, alpha: 0.4 + Math.random() * 0.55 });
    } else {
      list.push({ x: Math.random() * w, y: Math.random() * h, vx: 0.25 + Math.random() * 0.45, vy: (Math.random() - 0.5) * 0.25, size: 1.2 + Math.random() * 2.2, alpha: 0.16 + Math.random() * 0.32 });
    }
  }
  return list;
}

function drawSceneGeometry(ctx: CanvasRenderingContext2D, sceneId: BackdropId, palette: MoodPalette, w: number, h: number, px: number, py: number) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, palette.skyTop);
  skyGrad.addColorStop(1, palette.skyBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  const farX = px * 8, farY = py * 4;
  const midX = px * 18, midY = py * 8;
  const nearX = px * 30, nearY = py * 12;

  switch (sceneId) {
    case 'small_guild_hall':
      ctx.fillStyle = palette.farLayer;
      ctx.fillRect(0, h * 0.15 + farY, w, h * 0.85);
      ctx.fillStyle = palette.nearLayer;
      for (let i = 0; i < 6; i++) ctx.fillRect(i * (w / 5) - 18 + midX, 0, 26, h);
      ctx.fillRect(-30, h * 0.14 + midY, w + 60, 24);
      ctx.fillStyle = palette.midLayer;
      ctx.fillRect(w * 0.14 + midX, h * 0.28 + midY, 210, 145);
      ctx.fillStyle = '#D8CEB8';
      ctx.fillRect(w * 0.16 + midX, h * 0.31 + midY, 44, 54);
      ctx.fillRect(w * 0.21 + midX, h * 0.33 + midY, 52, 46);
      ctx.fillStyle = palette.midLayer;
      ctx.fillRect(w * 0.66 + midX, h * 0.35 + midY, 220, h * 0.55);
      ctx.fillStyle = palette.nearLayer;
      ctx.fillRect(w * 0.70 + nearX, h * 0.52 + nearY, 130, h * 0.35);
      ctx.fillStyle = palette.lightColor;
      ctx.globalAlpha = 0.75;
      ctx.beginPath(); ctx.ellipse(w * 0.75 + nearX, h * 0.78 + nearY, 44, 24, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.2;
      ctx.beginPath(); ctx.arc(w * 0.75 + nearX, h * 0.73 + nearY, 125, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = palette.nearLayer;
      ctx.fillRect(0, h * 0.8 + nearY, w, h * 0.25);
      break;
    case 'blacksmith_workshop':
      ctx.fillStyle = palette.farLayer; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = palette.midLayer;
      ctx.beginPath(); ctx.moveTo(w * 0.15 + midX, 0); ctx.lineTo(w * 0.37 + midX, 0); ctx.lineTo(w * 0.42 + midX, h * 0.46 + midY); ctx.lineTo(w * 0.10 + midX, h * 0.46 + midY); ctx.closePath(); ctx.fill();
      ctx.fillRect(w * 0.08 + midX, h * 0.56 + midY, w * 0.36, h * 0.36);
      ctx.fillStyle = palette.lightColor; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.ellipse(w * 0.26 + midX, h * 0.57 + midY, 95, 22, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.22;
      ctx.beginPath(); ctx.arc(w * 0.26 + midX, h * 0.53 + midY, 165, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = palette.midLayer; ctx.fillRect(w * 0.62 + midX, h * 0.24 + midY, 260, 14);
      for (let i = 0; i < 5; i++) ctx.fillRect(w * 0.64 + i * 48 + midX, h * 0.26 + midY, 10, 72);
      ctx.fillStyle = palette.nearLayer; ctx.fillRect(0, h * 0.82 + nearY, w, h * 0.22);
      ctx.fillRect(w * 0.68 + nearX, h * 0.68 + nearY, 94, 110);
      ctx.beginPath(); ctx.moveTo(w * 0.62 + nearX, h * 0.60 + nearY); ctx.lineTo(w * 0.80 + nearX, h * 0.60 + nearY); ctx.lineTo(w * 0.77 + nearX, h * 0.68 + nearY); ctx.lineTo(w * 0.66 + nearX, h * 0.68 + nearY); ctx.closePath(); ctx.fill();
      break;
    case 'city_square':
      ctx.fillStyle = palette.farLayer; ctx.fillRect(w * 0.44 + farX, h * 0.12 + farY, 92, h * 0.65);
      ctx.beginPath(); ctx.moveTo(w * 0.43 + farX, h * 0.12 + farY); ctx.lineTo(w * 0.476 + farX, h * 0.02 + farY); ctx.lineTo(w * 0.522 + farX, h * 0.12 + farY); ctx.fill();
      ctx.fillStyle = palette.midLayer;
      [[0, 0.34, 0.2, 0.44], [0.19, 0.28, 0.18, 0.5], [0.62, 0.30, 0.18, 0.48], [0.79, 0.36, 0.22, 0.42]].forEach(([rx, ry, rw, rh]) => {
        ctx.fillRect(w * rx + midX, h * ry + midY, w * rw, h * rh);
      });
      ctx.fillStyle = palette.lightColor; ctx.globalAlpha = 0.65;
      ctx.fillRect(w * 0.24 + midX, h * 0.41 + midY, 18, 26); ctx.fillRect(w * 0.67 + midX, h * 0.44 + midY, 18, 26);
      ctx.globalAlpha = 1;
      ctx.fillStyle = palette.nearLayer; ctx.fillRect(0, h * 0.76 + nearY, w, h * 0.3); ctx.fillRect(w * 0.42 + nearX, h * 0.67 + nearY, 160, 74);
      break;
    case 'great_guild_headquarters':
      ctx.fillStyle = palette.farLayer; ctx.fillRect(0, 0, w, h);
      [0.16, 0.43, 0.70].forEach((wx) => {
        ctx.fillStyle = palette.skyBottom; ctx.fillRect(w * wx + farX, h * 0.14 + farY, 120, h * 0.48);
        ctx.beginPath(); ctx.arc(w * wx + 60 + farX, h * 0.14 + farY, 60, Math.PI, 0); ctx.fill();
      });
      ctx.fillStyle = palette.midLayer;
      for (let i = 0; i < 4; i++) ctx.fillRect(w * (0.08 + i * 0.27) + midX, 0, 56, h * 0.85);
      ctx.fillStyle = palette.nearLayer; ctx.fillRect(0, h * 0.78 + nearY, w, h * 0.25); ctx.fillRect(w * 0.1 + nearX, h * 0.73 + nearY, w * 0.8, 36);
      break;
    case 'ruined_village':
      ctx.fillStyle = palette.farLayer; ctx.beginPath(); ctx.moveTo(-40, h); ctx.lineTo(-40, h * 0.56 + farY); ctx.quadraticCurveTo(w * 0.32, h * 0.44 + farY, w * 0.65, h * 0.55 + farY); ctx.lineTo(w + 40, h * 0.5 + farY); ctx.lineTo(w + 40, h); ctx.fill();
      ctx.fillStyle = palette.midLayer; ctx.fillRect(w * 0.12 + midX, h * 0.46 + midY, 210, h * 0.35); ctx.fillRect(w * 0.62 + midX, h * 0.50 + midY, 240, h * 0.32);
      ctx.strokeStyle = palette.nearLayer; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(w * 0.11 + midX, h * 0.46 + midY); ctx.lineTo(w * 0.22 + midX, h * 0.32 + midY); ctx.lineTo(w * 0.30 + midX, h * 0.46 + midY); ctx.stroke();
      ctx.fillStyle = palette.nearLayer; ctx.fillRect(0, h * 0.78 + nearY, w, h * 0.25);
      break;
    case 'army_camp_dusk':
      ctx.fillStyle = palette.lightColor; ctx.globalAlpha = 0.32; ctx.beginPath(); ctx.arc(w * 0.5 + farX, h * 0.58 + farY, 120, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = palette.farLayer; ctx.beginPath(); ctx.moveTo(-40, h); ctx.lineTo(-40, h * 0.60 + farY); ctx.lineTo(w * 0.35, h * 0.52 + farY); ctx.lineTo(w + 40, h * 0.54 + farY); ctx.lineTo(w + 40, h); ctx.fill();
      ctx.fillStyle = palette.midLayer;
      [0.08, 0.28, 0.62, 0.80].forEach((tx) => { ctx.beginPath(); ctx.moveTo(w * tx + midX, h * 0.75 + midY); ctx.lineTo(w * (tx + 0.08) + midX, h * 0.54 + midY); ctx.lineTo(w * (tx + 0.16) + midX, h * 0.75 + midY); ctx.closePath(); ctx.fill(); });
      ctx.fillStyle = palette.lightColor; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(w * 0.48 + nearX, h * 0.75 + nearY, 16, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.24; ctx.beginPath(); ctx.arc(w * 0.48 + nearX, h * 0.73 + nearY, 84, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = palette.nearLayer; ctx.fillRect(0, h * 0.76 + nearY, w, h * 0.3);
      break;
    case 'mountain_road':
      ctx.fillStyle = palette.farLayer; ctx.beginPath(); ctx.moveTo(-40, h); ctx.lineTo(w * 0.18 + farX, h * 0.28 + farY); ctx.lineTo(w * 0.42 + farX, h * 0.48 + farY); ctx.lineTo(w * 0.68 + farX, h * 0.22 + farY); ctx.lineTo(w + 40, h * 0.52 + farY); ctx.lineTo(w + 40, h); ctx.fill();
      ctx.fillStyle = palette.midLayer; ctx.beginPath(); ctx.moveTo(-40, h); ctx.lineTo(-40, h * 0.62 + midY); ctx.lineTo(w * 0.52 + midX, h * 0.50 + midY); ctx.lineTo(w + 40, h * 0.68 + midY); ctx.lineTo(w + 40, h); ctx.fill();
      ctx.fillStyle = palette.nearLayer; ctx.fillRect(0, h * 0.72 + nearY, w, h * 0.3);
      for (let i = 0; i < 6; i++) ctx.fillRect(w * (0.1 + i * 0.16) + nearX, h * 0.67 + nearY, 16, 46);
      break;
    case 'night_alley':
      ctx.fillStyle = palette.midLayer;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w * 0.38 + midX, h * 0.2 + midY); ctx.lineTo(w * 0.38 + midX, h * 0.75 + midY); ctx.lineTo(0, h); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w, 0); ctx.lineTo(w * 0.64 + midX, h * 0.2 + midY); ctx.lineTo(w * 0.64 + midX, h * 0.75 + midY); ctx.lineTo(w, h); ctx.fill();
      ctx.fillStyle = palette.nearLayer; ctx.fillRect(w * 0.34 + nearX, h * 0.3 + nearY, 54, 10);
      ctx.fillStyle = palette.lightColor; ctx.globalAlpha = 0.9; ctx.fillRect(w * 0.375 + nearX, h * 0.32 + nearY, 18, 26);
      ctx.globalAlpha = 0.22; ctx.beginPath(); ctx.arc(w * 0.385 + nearX, h * 0.34 + nearY, 110, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = palette.nearLayer; ctx.fillRect(0, h * 0.75 + nearY, w, h * 0.3);
      break;
    case 'archive_room':
      ctx.fillStyle = palette.farLayer; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = palette.skyBottom; ctx.fillRect(w * 0.44 + farX, h * 0.1 + farY, 130, h * 0.45);
      ctx.fillStyle = palette.midLayer; for (let b = 0; b < 4; b++) ctx.fillRect(w * (0.455 + b * 0.028) + farX, h * 0.1 + farY, 6, h * 0.45);
      ctx.fillRect(0, 0, w * 0.36 + midX, h * 0.82); ctx.fillRect(w * 0.64 + midX, 0, w * 0.38, h * 0.82);
      ctx.fillStyle = palette.nearLayer; ctx.fillRect(0, h * 0.78 + nearY, w, h * 0.25); ctx.fillRect(w * 0.32 + nearX, h * 0.68 + nearY, 420, 90);
      ctx.fillStyle = palette.lightColor; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(w * 0.56 + nearX, h * 0.62 + nearY, 14, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.2; ctx.beginPath(); ctx.arc(w * 0.56 + nearX, h * 0.62 + nearY, 105, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      break;
    case 'rainy_street':
      ctx.fillStyle = palette.farLayer; ctx.fillRect(w * 0.05 + farX, h * 0.32 + farY, 280, h * 0.5); ctx.fillRect(w * 0.58 + farX, h * 0.28 + farY, 340, h * 0.54);
      ctx.fillStyle = palette.midLayer; ctx.fillRect(w * 0.18 + midX, h * 0.38 + midY, 320, h * 0.44);
      ctx.fillStyle = palette.lightColor; ctx.globalAlpha = 0.65; ctx.fillRect(w * 0.23 + midX, h * 0.56 + midY, 44, 52); ctx.globalAlpha = 1;
      ctx.fillStyle = palette.nearLayer; ctx.fillRect(0, h * 0.77 + nearY, w, h * 0.28);
      ctx.fillStyle = palette.lightColor; ctx.globalAlpha = 0.22; ctx.fillRect(w * 0.23 + nearX, h * 0.81 + nearY, 44, 64); ctx.globalAlpha = 1;
      break;
    case 'dry_farmland':
      ctx.fillStyle = palette.farLayer; ctx.beginPath(); ctx.moveTo(-40, h); ctx.lineTo(-40, h * 0.58 + farY); ctx.quadraticCurveTo(w * 0.5, h * 0.52 + farY, w + 40, h * 0.60 + farY); ctx.lineTo(w + 40, h); ctx.fill();
      ctx.fillStyle = palette.midLayer; ctx.beginPath(); ctx.moveTo(w * 0.70 + midX, h * 0.62 + midY); ctx.lineTo(w * 0.725 + midX, h * 0.30 + midY); ctx.lineTo(w * 0.765 + midX, h * 0.30 + midY); ctx.lineTo(w * 0.79 + midX, h * 0.62 + midY); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = palette.midLayer; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(w * 0.67 + midX, h * 0.18 + midY); ctx.lineTo(w * 0.82 + midX, h * 0.44 + midY); ctx.moveTo(w * 0.82 + midX, h * 0.18 + midY); ctx.lineTo(w * 0.67 + midX, h * 0.44 + midY); ctx.stroke();
      ctx.fillStyle = palette.nearLayer; ctx.fillRect(0, h * 0.68 + nearY, w, h * 0.36);
      for (let p = 0; p < 5; p++) ctx.fillRect(w * (0.08 + p * 0.13) + nearX, h * 0.63 + nearY, 10, 54);
      break;
    case 'council_chamber':
      ctx.fillStyle = palette.farLayer; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = palette.midLayer; ctx.lineWidth = 22;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(w * (0.2 + i * 0.3) + farX, h * 0.45 + farY, 170, Math.PI, 0); ctx.stroke(); }
      ctx.fillStyle = palette.midLayer; ctx.fillRect(0, h * 0.56 + midY, w, h * 0.25);
      ctx.fillStyle = palette.lightColor;
      [0.2, 0.5, 0.8].forEach((sx) => { ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(w * sx + midX, h * 0.35 + midY, 12, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.arc(w * sx + midX, h * 0.35 + midY, 90, 0, Math.PI * 2); ctx.fill(); });
      ctx.globalAlpha = 1; ctx.fillStyle = palette.nearLayer; ctx.fillRect(0, h * 0.74 + nearY, w, h * 0.3); ctx.fillRect(w * 0.36 + nearX, h * 0.67 + nearY, w * 0.28, 70);
      break;
  }

  ctx.fillStyle = palette.tintOverlay;
  ctx.fillRect(0, 0, w, h);
}

export const BackdropRenderer: React.FC<BackdropRendererProps> = ({
  backdropId,
  mood,
  particles,
  overrideUrl = null,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [autoOverrideSrc, setAutoOverrideSrc] = useState<string | null>(null);

  const backdrop = BACKDROPS[backdropId];
  const resolvedMood = mood ?? backdrop.defaultMood;
  const resolvedParticles = particles ?? backdrop.defaultParticles;
  const palette = MOOD_PALETTES[resolvedMood];

  useEffect(() => {
    let cancelled = false;
    setAutoOverrideSrc(null);
    const candidate = `/assets/backdrops/${backdropId}.png`;
    fetch(candidate, { method: 'HEAD' })
      .then((res) => {
        if (cancelled) return;
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.startsWith('image/')) setAutoOverrideSrc(candidate);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [backdropId]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pointerRef.current = {
        x: (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2,
        y: (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    if (overrideUrl || autoOverrideSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1280, H = 720;
    canvas.width = W; canvas.height = H;
    const particleList = createParticles(resolvedParticles, W, H);
    let smoothPx = 0, smoothPy = 0, rafId = 0;

    const render = (now: number) => {
      const driftX = Math.sin(now * 0.00035) * 0.35;
      const driftY = Math.cos(now * 0.00028) * 0.25;
      smoothPx += (pointerRef.current.x * 0.7 + driftX - smoothPx) * 0.05;
      smoothPy += (pointerRef.current.y * 0.5 + driftY - smoothPy) * 0.05;

      drawSceneGeometry(ctx, backdropId, palette, W, H, smoothPx, smoothPy);

      if (resolvedParticles !== 'none') {
        for (const p of particleList) {
          p.x += p.vx; p.y += p.vy;
          if (resolvedParticles === 'rain') {
            if (p.y > H) { p.y = -20; p.x = Math.random() * (W + 140); }
            ctx.strokeStyle = `rgba(212, 228, 240, ${p.alpha})`; ctx.lineWidth = 1.3;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx * 1.4, p.y + p.size); ctx.stroke();
          } else if (resolvedParticles === 'embers') {
            if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
            ctx.fillStyle = `rgba(242, 148, 62, ${p.alpha})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
          } else {
            if (p.x > W + 10) p.x = -10;
            if (p.y > H + 10) p.y = -10;
            if (p.y < -10) p.y = H + 10;
            ctx.fillStyle = `rgba(232, 224, 206, ${p.alpha})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
          }
        }
      }

      const vig = ctx.createRadialGradient(W / 2, H * 0.45, W * 0.25, W / 2, H / 2, W * 0.72);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(8,10,14,0.52)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [backdropId, palette, resolvedParticles, overrideUrl, autoOverrideSrc]);

  const activeOverride = overrideUrl || autoOverrideSrc;

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#12161c] ${className}`}>
      {activeOverride ? (
        <img src={activeOverride} alt={backdrop.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <canvas ref={canvasRef} className="w-full h-full object-cover block" />
      )}
    </div>
  );
};
