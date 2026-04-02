'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const lastSpawnTime = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if it is a touch device
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
      return;
    }

    document.body.style.cursor = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);

      const now = Date.now();
      if (now - lastSpawnTime.current > 60) {
        spawnSparkle(e.clientX, e.clientY);
        lastSpawnTime.current = now;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 300);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.body.style.cursor = 'auto';
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible]);

  const spawnSparkle = (x: number, y: number) => {
    const colors = ['#38bdf8', '#7dd3fc', '#0ea5e9', '#bae6fd', '#818cf8'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 10 + 10;
    const dx = Math.random() * 70 - 35;
    const dy = Math.random() * 70 - 35;

    const sparkle = document.createElement('div');
    sparkle.innerText = '✦';
    sparkle.style.position = 'fixed';
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.color = color;
    sparkle.style.fontSize = `${size}px`;
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '99998';
    sparkle.style.transform = 'translate(-50%, -50%)';
    sparkle.style.setProperty('--dx', `${dx}px`);
    sparkle.style.setProperty('--dy', `${dy}px`);
    sparkle.style.animation = 'sparkle-burst 0.6s ease-out forwards';

    document.body.appendChild(sparkle);

    setTimeout(() => {
      if (document.body.contains(sparkle)) {
        document.body.removeChild(sparkle);
      }
    }, 600);
  };

  // We explicitly removed the static dot return per requirements.
  return null;
}
