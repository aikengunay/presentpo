"use client";

import { StyledCheckInQr } from "@/components/StyledCheckInQr";
import { BorderBeam } from "border-beam";

const TILE_RADIUS = 20;

/** Shared lively border-beam pulse around the student check-in QR tile. */
export function PulsingQrTile({
  data,
  size = 240,
  className,
}: {
  data: string;
  size?: number;
  className?: string;
}) {
  return (
    <BorderBeam
      size="pulse-outside"
      colorVariant="ocean"
      theme="light"
      duration={1.85}
      strength={1}
      brightness={2.1}
      saturation={2.2}
      borderRadius={TILE_RADIUS}
      className={className}
    >
      <div
        className="bg-white p-5"
        style={{
          borderRadius: TILE_RADIUS,
          boxShadow:
            "0 4px 24px oklch(0.55 0.12 240 / 0.12), 0 1px 2px oklch(0 0 0 / 0.04)",
        }}
      >
        <StyledCheckInQr data={data} size={size} />
      </div>
    </BorderBeam>
  );
}
