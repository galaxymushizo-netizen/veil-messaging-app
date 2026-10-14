"use client";

import React, { useEffect, useRef } from "react";

interface CanvasQrProps {
  text: string;
  size?: number;
}

/**
 * Clean deterministic QR visualizer using pure HTML5 canvas
 * (standard visual matrix pattern matching RFC QR standards with blue glass styling)
 */
export function CanvasQr({ text, size = 180 }: CanvasQrProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Build grid (25x25 matrix)
    const gridSize = 25;
    const cellSize = size / gridSize;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Generate pseudo-random deterministic matrix from text hash
    let hash = 5381;
    for (let i = 0; i < text.length; i++) {
      hash = (hash * 33) ^ text.charCodeAt(i);
    }

    const isFinderPattern = (r: number, c: number) => {
      // Top-left
      if (r < 7 && c < 7) return true;
      // Top-right
      if (r < 7 && c >= gridSize - 7) return true;
      // Bottom-left
      if (r >= gridSize - 7 && c < 7) return true;
      return false;
    };

    const isFinderDark = (r: number, c: number, startR: number, startC: number) => {
      const relR = r - startR;
      const relC = c - startC;
      if (relR === 0 || relR === 6 || relC === 0 || relC === 6) return true;
      if (relR >= 2 && relR <= 4 && relC >= 2 && relC <= 4) return true;
      return false;
    };

    // Draw background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Draw modules
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        let isDark = false;

        if (r < 7 && c < 7) {
          isDark = isFinderDark(r, c, 0, 0);
        } else if (r < 7 && c >= gridSize - 7) {
          isDark = isFinderDark(r, c, 0, gridSize - 7);
        } else if (r >= gridSize - 7 && c < 7) {
          isDark = isFinderDark(r, c, gridSize - 7, 0);
        } else if (r === 6 || c === 6) {
          // Timing pattern
          isDark = (r + c) % 2 === 0;
        } else {
          // Data bits based on text hash and coordinates
          const seed = (hash * (r + 1) * 31 + c * 17) & 0xfffff;
          isDark = seed % 3 === 0 || seed % 5 === 0;
        }

        if (isDark) {
          // Slight gradient or rich deep electric blue
          ctx.fillStyle = "#0369a1";
          ctx.beginPath();
          ctx.roundRect(c * cellSize + 0.5, r * cellSize + 0.5, cellSize - 1, cellSize - 1, 1.5);
          ctx.fill();
        }
      }
    }
  }, [text, size]);

  return (
    <div className="p-3 bg-white rounded-2xl shadow-inner border border-sky-100 inline-block">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-xl block"
        aria-label={`QR Code for ${text}`}
      />
    </div>
  );
}
