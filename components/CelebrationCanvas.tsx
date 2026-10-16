"use client";

import React, { useEffect, useRef } from "react";
import { useCelebration } from "@/context/CelebrationContext";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  size: number;
  color: string;
  alpha: number;
  shape: "rect" | "circle" | "star";
}

const DEFAULT_PALETTE = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#8B5CF6", // purple
  "#F59E0B", // amber
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#E11D48", // rose
];

export function CelebrationCanvas() {
  const { isCelebrating } = useCelebration();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isCelebrating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set dimensions
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Generate particles
    const particleCount = 140;
    const particles: Particle[] = [];
    const shapes: ("rect" | "circle" | "star")[] = ["rect", "circle", "star"];

    for (let i = 0; i < particleCount; i++) {
      // Spawn from two points (left-bottom and right-bottom)
      const isLeft = i % 2 === 0;
      particles.push({
        x: isLeft ? width * 0.15 + (Math.random() * 80 - 40) : width * 0.85 + (Math.random() * 80 - 40),
        y: height * 0.85,
        vx: (isLeft ? 1 : -1) * (Math.random() * 9 + 4) + (Math.random() * 4 - 2),
        vy: -(Math.random() * 15 + 10),
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        size: Math.random() * 8 + 6,
        color: DEFAULT_PALETTE[Math.floor(Math.random() * DEFAULT_PALETTE.length)],
        alpha: 1,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let activeParticles = 0;

      for (const p of particles) {
        if (p.alpha <= 0.01) continue;
        activeParticles++;

        // Apply physics
        p.vy += 0.38; // gravity
        p.vx *= 0.99; // air drag
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.alpha -= 0.007; // fade

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          // 4-point star / diamond
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 1.5);
          ctx.lineTo(p.size / 3, 0);
          ctx.lineTo(0, p.size / 1.5);
          ctx.lineTo(-p.size / 3, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      if (activeParticles > 0) {
        animationId = requestAnimationFrame(render);
      }
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }
    };
  }, [isCelebrating]);

  if (!isCelebrating) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100] w-full h-full"
    />
  );
}
