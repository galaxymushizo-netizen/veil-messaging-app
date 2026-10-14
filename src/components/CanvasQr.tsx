"use client";

import React from "react";
import { QRCodeCanvas } from "qrcode.react";

interface CanvasQrProps {
  text: string;
  size?: number;
}

/**
 * Real, machine-scannable QR code rendered to HTML5 canvas.
 *
 * Uses the qrcode.react library which implements the QR specification
 * (Reed-Solomon error correction, proper format/version info) so any
 * phone camera or QR reader can decode the payload.
 */
export function CanvasQr({ text, size = 180 }: CanvasQrProps) {
  return (
    <div className="p-3 bg-white rounded-2xl shadow-inner border border-sky-100 inline-block">
      <span
        role="img"
        aria-label="QR code containing this invitation link. Scan it with your peer's camera to connect."
        className="rounded-xl overflow-hidden block leading-none"
      >
        <QRCodeCanvas
          value={text}
          size={size}
          level="M"
          marginSize={1}
          bgColor="#ffffff"
          fgColor="#0369a1"
        />
      </span>
    </div>
  );
}
