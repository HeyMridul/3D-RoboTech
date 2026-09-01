"use client";

import { Grid } from "@react-three/drei";

interface DigitalGridProps {
  size?: number;
  divisions?: number;
}

export function DigitalGrid({ size = 30, divisions = 30 }: DigitalGridProps) {
  return (
    <Grid
      args={[size, divisions]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#1a1f28"
      sectionSize={5}
      sectionThickness={1}
      sectionColor="#00d4ff"
      fadeDistance={25}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid
      position={[0, -2, 0]}
    />
  );
}
