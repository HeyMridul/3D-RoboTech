/**
 * Shared palette + material presets for the TRAIC 3D system.
 *
 * Kept in one place so scenes read as one machined environment instead of
 * each component inventing its own metal. Values mirror the CSS tokens in
 * globals.css.
 */

export const SCENE_COLORS = {
  background: "#05070a",
  chassis: "#11161e",
  chassisDark: "#0a0e14",
  panel: "#1b2431",
  metallic: "#3a4553",
  cyan: "#22d3ee",
  blue: "#3b82f6",
  green: "#34d399",
  orange: "#f59e0b",
} as const;

/** Machined body panels — dark, reflective, low roughness variance. */
export const chassisMaterial = {
  color: SCENE_COLORS.chassis,
  metalness: 0.92,
  roughness: 0.34,
} as const;

/** Recessed structure, brackets, arms. */
export const structureMaterial = {
  color: SCENE_COLORS.chassisDark,
  metalness: 0.85,
  roughness: 0.45,
} as const;

/** Bare machined aluminium — motor cans, struts. */
export const metalMaterial = {
  color: SCENE_COLORS.metallic,
  metalness: 1,
  roughness: 0.28,
} as const;

/**
 * Emissive accents. Intensity stays low: on the TRAIC palette glow is a
 * signal (status, sensors, power), never ambient decoration.
 */
export function emissive(color: string, intensity = 1.6) {
  return {
    color: "#05070a",
    emissive: color,
    emissiveIntensity: intensity,
    metalness: 0.1,
    roughness: 0.5,
  } as const;
}
