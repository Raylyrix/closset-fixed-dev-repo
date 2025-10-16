/**
 * Centralized canvas size configuration
 * All canvas operations should use these standardized sizes
 */

// Standard canvas sizes for different quality levels
export const CANVAS_SIZES = {
  // Standard size for all layer operations
  STANDARD: 1536,
  
  // Performance levels
  PERFORMANCE: 512,
  BALANCED: 1024,
  QUALITY: 2048,
  ULTRA: 4096,
  
  // Specific use cases
  DISPLACEMENT_MAP: 2048, // Standard displacement map size
  NORMAL_MAP: 2048,       // Standard normal map size
  PREVIEW: 512,           // Preview thumbnails
  EXPORT: 2048,           // Export resolution
} as const;

// Default canvas size for all operations
export const DEFAULT_CANVAS_SIZE = CANVAS_SIZES.STANDARD;

// Canvas size configuration for different contexts
export const CANVAS_CONFIG = {
  // Layer canvases
  LAYER: {
    width: DEFAULT_CANVAS_SIZE,
    height: DEFAULT_CANVAS_SIZE,
  },
  
  // Composed canvas
  COMPOSED: {
    width: DEFAULT_CANVAS_SIZE,
    height: DEFAULT_CANVAS_SIZE,
  },
  
  // Displacement maps
  DISPLACEMENT: {
    width: CANVAS_SIZES.DISPLACEMENT_MAP,
    height: CANVAS_SIZES.DISPLACEMENT_MAP,
  },
  
  // Normal maps
  NORMAL: {
    width: CANVAS_SIZES.NORMAL_MAP,
    height: CANVAS_SIZES.NORMAL_MAP,
  },
  
  // Preview thumbnails
  PREVIEW: {
    width: CANVAS_SIZES.PREVIEW,
    height: CANVAS_SIZES.PREVIEW,
  },
  
  // Export resolution
  EXPORT: {
    width: CANVAS_SIZES.EXPORT,
    height: CANVAS_SIZES.EXPORT,
  },
} as const;

// Helper function to create a canvas with standard size
export function createStandardCanvas(width: number = DEFAULT_CANVAS_SIZE, height: number = DEFAULT_CANVAS_SIZE): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

// Helper function to create a layer canvas
export function createLayerCanvas(): HTMLCanvasElement {
  return createStandardCanvas(CANVAS_CONFIG.LAYER.width, CANVAS_CONFIG.LAYER.height);
}

// Helper function to create a composed canvas
export function createComposedCanvas(): HTMLCanvasElement {
  return createStandardCanvas(CANVAS_CONFIG.COMPOSED.width, CANVAS_CONFIG.COMPOSED.height);
}

// Helper function to create a displacement canvas
export function createDisplacementCanvas(): HTMLCanvasElement {
  return createStandardCanvas(CANVAS_CONFIG.DISPLACEMENT.width, CANVAS_CONFIG.DISPLACEMENT.height);
}

// Helper function to create a normal canvas
export function createNormalCanvas(): HTMLCanvasElement {
  return createStandardCanvas(CANVAS_CONFIG.NORMAL.width, CANVAS_CONFIG.NORMAL.height);
}

// Helper function to create a preview canvas
export function createPreviewCanvas(): HTMLCanvasElement {
  return createStandardCanvas(CANVAS_CONFIG.PREVIEW.width, CANVAS_CONFIG.PREVIEW.height);
}

// Helper function to create an export canvas
export function createExportCanvas(): HTMLCanvasElement {
  return createStandardCanvas(CANVAS_CONFIG.EXPORT.width, CANVAS_CONFIG.EXPORT.height);
}
