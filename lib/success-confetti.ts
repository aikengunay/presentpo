"use client";

import type { AttendanceCode } from "@/lib/attendance-copy";
import confetti from "canvas-confetti";

type BurstProfile = {
  colors: string[];
  /** Side cannons run this many frames (~rAF). */
  frames: number;
  particleCount: number;
  startVelocity: number;
};

const PROFILES: Record<AttendanceCode, BurstProfile | null> = {
  1: {
    colors: [
      "#0ea5e9",
      "#38bdf8",
      "#10b981",
      "#f59e0b",
      "#f472b6",
      "#a78bfa",
      "#ffffff",
    ],
    frames: 18,
    particleCount: 4,
    startVelocity: 38,
  },
  2: {
    colors: ["#f59e0b", "#fbbf24", "#f472b6", "#fda4af", "#ffffff"],
    frames: 12,
    particleCount: 3,
    startVelocity: 30,
  },
  3: {
    colors: ["#94a3b8", "#cbd5e1", "#7dd3fc", "#e2e8f0"],
    frames: 8,
    particleCount: 2,
    startVelocity: 24,
  },
  // Still checked in, but don't throw a party.
  4: null,
};

/** Confetti intensity follows attendance code (1 = full, 4 = none). */
export function fireCheckInConfetti(code: AttendanceCode) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const profile = PROFILES[code];
  if (!profile) return;

  let left = profile.frames;
  const frame = () => {
    confetti({
      particleCount: profile.particleCount,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.72 },
      colors: profile.colors,
      startVelocity: profile.startVelocity,
      gravity: 1.05,
      ticks: 180,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: profile.particleCount,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.72 },
      colors: profile.colors,
      startVelocity: profile.startVelocity,
      gravity: 1.05,
      ticks: 180,
      disableForReducedMotion: true,
    });
    left -= 1;
    if (left > 0) requestAnimationFrame(frame);
  };
  frame();
}
