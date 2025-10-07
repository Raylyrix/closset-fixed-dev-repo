// Typed stitch catalog for ultra-realistic embroidery (scaffold, non-breaking)
// This file defines a catalog of stitch types and their simulation parameters.
export const StitchCatalog = {
    running: {
        id: 'running',
        name: 'Running Stitch',
        appearance: { heightMm: 0.3, widthMm: 0.4, twist: 0.2, roughness: 0.8, metallic: 0, scattering: 0.1 },
        behavior: { spacingMm: 1.5, tension: 0.8, density: 1, randomness: 0.05 },
        shading: { anisotropic: true, parallax: false, normalMapIntensity: 0.25 }
    },
    backstitch: {
        id: 'backstitch',
        name: 'Backstitch',
        appearance: { heightMm: 0.35, widthMm: 0.45, twist: 0.25, roughness: 0.78, metallic: 0, scattering: 0.12 },
        behavior: { spacingMm: 1.2, tension: 0.85, density: 1.1, randomness: 0.06 },
        shading: { anisotropic: true, parallax: false, normalMapIntensity: 0.28 }
    },
    satin: {
        id: 'satin',
        name: 'Satin',
        appearance: { heightMm: 0.6, widthMm: 0.7, twist: 0.35, roughness: 0.55, metallic: 0, scattering: 0.18 },
        behavior: { spacingMm: 0.6, tension: 0.9, density: 3.5, randomness: 0.04 },
        shading: { anisotropic: true, parallax: true, normalMapIntensity: 0.55 }
    },
    zigzag: {
        id: 'zigzag',
        name: 'Zig-Zag',
        appearance: { heightMm: 0.45, widthMm: 0.6, twist: 0.3, roughness: 0.65, metallic: 0, scattering: 0.15 },
        behavior: { spacingMm: 0.9, tension: 0.88, density: 2.2, randomness: 0.05 },
        shading: { anisotropic: true, parallax: false, normalMapIntensity: 0.42 }
    },
    chain: {
        id: 'chain',
        name: 'Chain',
        appearance: { heightMm: 0.55, widthMm: 0.75, twist: 0.4, roughness: 0.6, metallic: 0, scattering: 0.2 },
        behavior: { spacingMm: 1.0, tension: 0.85, density: 2.0, randomness: 0.08 },
        shading: { anisotropic: true, parallax: true, normalMapIntensity: 0.5 }
    },
    split: {
        id: 'split',
        name: 'Split',
        appearance: { heightMm: 0.5, widthMm: 0.7, twist: 0.28, roughness: 0.68, metallic: 0, scattering: 0.16 },
        behavior: { spacingMm: 1.0, tension: 0.82, density: 2.3, randomness: 0.07 },
        shading: { anisotropic: true, parallax: false, normalMapIntensity: 0.4 }
    },
    fill_tatami: {
        id: 'fill_tatami',
        name: 'Tatami Fill',
        appearance: { heightMm: 0.4, widthMm: 0.55, twist: 0.2, roughness: 0.72, metallic: 0, scattering: 0.14 },
        behavior: { spacingMm: 0.7, tension: 0.9, density: 5.0, randomness: 0.06 },
        shading: { anisotropic: true, parallax: true, normalMapIntensity: 0.38 }
    },
    cross: {
        id: 'cross',
        name: 'Cross',
        appearance: { heightMm: 0.35, widthMm: 0.45, twist: 0.22, roughness: 0.75, metallic: 0, scattering: 0.12 },
        behavior: { spacingMm: 1.2, tension: 0.8, density: 1.5, randomness: 0.09 },
        shading: { anisotropic: true, parallax: false, normalMapIntensity: 0.35 }
    },
    seed: {
        id: 'seed',
        name: 'Seed',
        appearance: { heightMm: 0.25, widthMm: 0.35, twist: 0.15, roughness: 0.82, metallic: 0, scattering: 0.1 },
        behavior: { spacingMm: 1.6, tension: 0.78, density: 1.2, randomness: 0.1 },
        shading: { anisotropic: true, parallax: false, normalMapIntensity: 0.22 }
    },
    french_knot: {
        id: 'french_knot',
        name: 'French Knot',
        appearance: { heightMm: 0.9, widthMm: 0.9, twist: 0.6, roughness: 0.5, metallic: 0, scattering: 0.25 },
        behavior: { spacingMm: 2.5, tension: 0.7, density: 0.6, randomness: 0.12 },
        shading: { anisotropic: true, parallax: true, normalMapIntensity: 0.7 }
    },
    couching: {
        id: 'couching',
        name: 'Couching',
        appearance: { heightMm: 0.7, widthMm: 0.9, twist: 0.45, roughness: 0.58, metallic: 0, scattering: 0.22 },
        behavior: { spacingMm: 1.0, tension: 0.86, density: 2.4, randomness: 0.09 },
        shading: { anisotropic: true, parallax: true, normalMapIntensity: 0.6 }
    },
    blanket: {
        id: 'blanket',
        name: 'Blanket',
        appearance: { heightMm: 0.5, widthMm: 0.75, twist: 0.3, roughness: 0.65, metallic: 0, scattering: 0.18 },
        behavior: { spacingMm: 1.1, tension: 0.84, density: 2.0, randomness: 0.08 },
        shading: { anisotropic: true, parallax: false, normalMapIntensity: 0.48 }
    },
    herringbone: {
        id: 'herringbone',
        name: 'Herringbone',
        appearance: { heightMm: 0.45, widthMm: 0.7, twist: 0.3, roughness: 0.66, metallic: 0, scattering: 0.17 },
        behavior: { spacingMm: 0.8, tension: 0.88, density: 3.0, randomness: 0.08 },
        shading: { anisotropic: true, parallax: false, normalMapIntensity: 0.46 }
    },
    feather: {
        id: 'feather',
        name: 'Feather',
        appearance: { heightMm: 0.4, widthMm: 0.65, twist: 0.28, roughness: 0.7, metallic: 0, scattering: 0.16 },
        behavior: { spacingMm: 0.9, tension: 0.83, density: 2.2, randomness: 0.09 },
        shading: { anisotropic: true, parallax: false, normalMapIntensity: 0.44 }
    },
    long_short_satin: {
        id: 'long_short_satin',
        name: 'Long & Short Satin',
        appearance: { heightMm: 0.65, widthMm: 0.75, twist: 0.38, roughness: 0.52, metallic: 0, scattering: 0.2 },
        behavior: { spacingMm: 0.5, tension: 0.92, density: 4.2, randomness: 0.07 },
        shading: { anisotropic: true, parallax: true, normalMapIntensity: 0.6 }
    }
};
export const getStitchDefinition = (type) => StitchCatalog[type];
