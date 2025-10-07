// Centralized feature flags. Keep these pure constants so tree-shaking can remove code paths.
export const FeatureFlags = {
    embroidery3D: true, // master toggle for the new 3D embroidery pipeline (safe no-ops until renderer plugged in)
    vectorGlobalOps: true, // enables global vector tool projection hooks (no-op until integrated)
    threadAdvancedShaders: false // guarded WIP for anisotropy/parallax thread shading
} as const;

export type FeatureFlagKey = keyof typeof FeatureFlags;

export const isFeatureEnabled = (key: FeatureFlagKey): boolean => FeatureFlags[key];