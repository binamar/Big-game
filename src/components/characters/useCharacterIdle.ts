import { useEffect, useMemo, useRef, useState } from 'react';
import { CHARACTERS, EXPRESSION_PRESETS } from '../../data/characters';
import { CharacterId, ExpressionId, ExpressionParams } from '../../types/vn';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export interface CharacterIdleState {
  params: ExpressionParams;
  blinkOpen: number;
  speakMouthDelta: number;
  bobY: number;
  headTurnX: number;
  headTiltDeg: number;
  lookX: number;
  lookY: number;
  shakeX: number;
  overrideSrc: string | null;
}

export function useCharacterIdle(
  characterId: CharacterId,
  expression: ExpressionId,
  customParams?: Partial<ExpressionParams>,
  isSpeaking = false,
  shakeTrigger = 0,
  overrideUrl: string | null = null,
  gazeBiasX = 0
): CharacterIdleState {
  const char = CHARACTERS[characterId];
  const profile = char.idleProfile;

  const targetParams: ExpressionParams = useMemo(() => {
    const base = EXPRESSION_PRESETS[expression] ?? EXPRESSION_PRESETS.neutral;
    return { ...base, ...customParams };
  }, [expression, customParams]);

  const [currentParams, setCurrentParams] = useState<ExpressionParams>(targetParams);
  const currentRef = useRef<ExpressionParams>(targetParams);

  const [blinkOpen, setBlinkOpen] = useState(1);
  const [speakMouthDelta, setSpeakMouthDelta] = useState(0);
  const [shakeX, setShakeX] = useState(0);
  const [autoOverrideSrc, setAutoOverrideSrc] = useState<string | null>(null);
  const [motion, setMotion] = useState({
    bobY: 0,
    headTurnX: 0,
    headTiltDeg: 0,
    lookX: 0,
    lookY: 0,
  });

  const lookTargetRef = useRef({ x: gazeBiasX * 1.4, y: 0 });
  const lookCurrentRef = useRef({ x: 0, y: 0, headTurnX: 0, headTiltDeg: 0 });

  useEffect(() => {
    let cancelled = false;
    setAutoOverrideSrc(null);
    const candidate = `/assets/portraits/${characterId}_${expression}.png`;
    fetch(candidate, { method: 'HEAD' })
      .then((res) => {
        if (cancelled) return;
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.startsWith('image/')) {
          setAutoOverrideSrc(candidate);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [characterId, expression]);

  useEffect(() => {
    const from = { ...currentRef.current };
    const to = targetParams;
    const duration = 200;
    const start = performance.now();
    let rafId = 0;

    const step = (now: number) => {
      const rawT = Math.min(1, (now - start) / duration);
      const t = easeOutCubic(rawT);
      const next: ExpressionParams = {
        eyebrowAngle: lerp(from.eyebrowAngle, to.eyebrowAngle, t),
        eyebrowHeight: lerp(from.eyebrowHeight, to.eyebrowHeight, t),
        eyelidOpenness: lerp(from.eyelidOpenness, to.eyelidOpenness, t),
        pupilOffsetX: lerp(from.pupilOffsetX, to.pupilOffsetX, t),
        pupilOffsetY: lerp(from.pupilOffsetY, to.pupilOffsetY, t),
        mouthCurve: lerp(from.mouthCurve, to.mouthCurve, t),
        mouthOpenness: lerp(from.mouthOpenness, to.mouthOpenness, t),
        tear: rawT > 0.5 ? to.tear : from.tear,
        sweatDrop: rawT > 0.5 ? to.sweatDrop : from.sweatDrop,
      };
      currentRef.current = next;
      setCurrentParams(next);
      if (rawT < 1) rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [targetParams]);

  useEffect(() => {
    let timeoutId = 0;
    let blinkRaf = 0;
    let cancelled = false;

    const scheduleBlink = () => {
      const delay = 2400 + Math.random() * 2800;
      timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        const blinkStart = performance.now();
        const blinkDur = 150;
        const runBlink = (now: number) => {
          if (cancelled) return;
          const p = (now - blinkStart) / blinkDur;
          if (p >= 1) {
            setBlinkOpen(1);
            scheduleBlink();
            return;
          }
          const open = p < 0.5 ? 1 - p * 2 : (p - 0.5) * 2;
          setBlinkOpen(Math.max(0.05, open));
          blinkRaf = requestAnimationFrame(runBlink);
        };
        blinkRaf = requestAnimationFrame(runBlink);
      }, delay);
    };

    scheduleBlink();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      cancelAnimationFrame(blinkRaf);
    };
  }, []);

  // Periodic natural left-to-right eye & head glance targets
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let timer = 0;
    let cancelled = false;

    const pickNextGlance = () => {
      const delay =
        profile.lookIntervalMin +
        Math.random() * (profile.lookIntervalMax - profile.lookIntervalMin);
      timer = window.setTimeout(() => {
        if (cancelled) return;
        const roll = Math.random();
        if (roll < 0.34) {
          lookTargetRef.current = { x: -profile.lookRangeX, y: (Math.random() - 0.5) * 0.9 };
        } else if (roll < 0.68) {
          lookTargetRef.current = { x: profile.lookRangeX, y: (Math.random() - 0.5) * 0.9 };
        } else {
          lookTargetRef.current = { x: gazeBiasX * profile.lookRangeX * 0.55, y: 0 };
        }
        pickNextGlance();
      }, delay);
    };

    pickNextGlance();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [profile.lookIntervalMin, profile.lookIntervalMax, profile.lookRangeX, gazeBiasX]);

  // Continuous lifelike breathing, head tilt, and smooth left-right look easing
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let rafId = 0;
    let last = performance.now();
    const phaseOffset = (characterId.charCodeAt(0) % 7) * 0.85;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const sec = now * 0.001;

      const swayPhase = sec * profile.bobSpeed + phaseOffset;
      const tiltPhase = sec * profile.tiltSpeed + phaseOffset * 1.3;

      const easeStep = Math.min(1, dt * 5.0);
      const lc = lookCurrentRef.current;
      const lt = lookTargetRef.current;

      lc.x = lerp(lc.x, lt.x, easeStep);
      lc.y = lerp(lc.y, lt.y, easeStep);

      const desiredHeadX = (lc.x / Math.max(0.1, profile.lookRangeX)) * profile.headFollowX;
      lc.headTurnX = lerp(lc.headTurnX, desiredHeadX, Math.min(1, dt * 3.4));

      const baseTilt = Math.sin(tiltPhase) * profile.tiltAmplitudeDeg;
      const glanceTilt =
        (lc.x / Math.max(0.1, profile.lookRangeX)) * (profile.tiltAmplitudeDeg * 0.45);
      const speakNod = isSpeaking ? Math.sin(swayPhase * 2.1) * 0.9 : 0;
      lc.headTiltDeg = lerp(
        lc.headTiltDeg,
        baseTilt + glanceTilt + speakNod,
        Math.min(1, dt * 4.5)
      );

      setMotion({
        bobY: Math.sin(swayPhase) * profile.bobAmplitude,
        headTurnX: lc.headTurnX,
        headTiltDeg: lc.headTiltDeg,
        lookX: lc.x,
        lookY: lc.y,
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [characterId, profile, isSpeaking]);

  useEffect(() => {
    if (!isSpeaking) {
      setSpeakMouthDelta(0);
      return;
    }
    let rafId = 0;
    const tick = (now: number) => {
      const v = Math.abs(Math.sin(now * 0.018)) * 0.48 + Math.abs(Math.sin(now * 0.031)) * 0.18;
      setSpeakMouthDelta(v);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isSpeaking]);

  useEffect(() => {
    if (!shakeTrigger) return;
    const start = performance.now();
    const duration = 360;
    let rafId = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed >= duration) {
        setShakeX(0);
        return;
      }
      const decay = 1 - elapsed / duration;
      setShakeX(Math.sin(elapsed * 0.09) * 10 * decay);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [shakeTrigger]);

  return {
    params: currentParams,
    blinkOpen,
    speakMouthDelta,
    bobY: motion.bobY,
    headTurnX: motion.headTurnX,
    headTiltDeg: motion.headTiltDeg,
    lookX: motion.lookX,
    lookY: motion.lookY,
    shakeX,
    overrideSrc: overrideUrl || autoOverrideSrc,
  };
}
