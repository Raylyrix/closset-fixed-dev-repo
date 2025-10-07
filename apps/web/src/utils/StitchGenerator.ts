/**
 * Stitch Generator - Creates proper stitches from user input
 */

export interface StitchPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface StitchConfig {
  type: string;
  color: string;
  thickness: number;
  opacity: number;
  threadType?: string;
}

export interface EmbroideryStitch {
  id: string;
  type: string;
  points: StitchPoint[];
  color: string;
  threadType: string;
  thickness: number;
  opacity: number;
  lastMoveTime?: number;
}

/**
 * Generate stitches based on user drawing
 */
export function generateStitch(
  stitchType: string,
  points: StitchPoint[],
  config: StitchConfig
): EmbroideryStitch {
  // Validate input
  if (!points || points.length < 2) {
    throw new Error('Not enough points to create a stitch');
  }

  // Create stitch based on type
  const stitch: EmbroideryStitch = {
    id: `stitch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: stitchType,
    points: points,
    color: config.color,
    threadType: config.threadType || 'cotton',
    thickness: config.thickness,
    opacity: config.opacity,
    lastMoveTime: Date.now()
  };

  return stitch;
}

/**
 * Generate multiple stitches for complex patterns
 */
export function generateStitchPattern(
  stitchType: string,
  basePoints: StitchPoint[],
  config: StitchConfig,
  patternOptions: any = {}
): EmbroideryStitch[] {
  const stitches: EmbroideryStitch[] = [];

  switch (stitchType) {
    case 'satin':
      stitches.push(...generateSatinPattern(basePoints, config, patternOptions));
      break;
    case 'fill':
      stitches.push(...generateFillPattern(basePoints, config, patternOptions));
      break;
    case 'cross-stitch':
      stitches.push(...generateCrossStitchPattern(basePoints, config, patternOptions));
      break;
    case 'chain':
      stitches.push(...generateChainPattern(basePoints, config, patternOptions));
      break;
    case 'backstitch':
      stitches.push(...generateBackstitchPattern(basePoints, config, patternOptions));
      break;
    case 'french-knot':
      stitches.push(...generateFrenchKnotPattern(basePoints, config, patternOptions));
      break;
    case 'bullion':
      stitches.push(...generateBullionPattern(basePoints, config, patternOptions));
      break;
    case 'lazy-daisy':
      stitches.push(...generateLazyDaisyPattern(basePoints, config, patternOptions));
      break;
    case 'feather':
      stitches.push(...generateFeatherPattern(basePoints, config, patternOptions));
      break;
    default:
      stitches.push(generateStitch(stitchType, basePoints, config));
  }

  return stitches;
}

// Pattern generation functions
function generateSatinPattern(points: StitchPoint[], config: StitchConfig, options: any): EmbroideryStitch[] {
  const stitches: EmbroideryStitch[] = [];
  const density = options.density || 0.5;
  const spacing = Math.max(2, config.thickness * density);

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
    const numStitches = Math.max(1, Math.ceil(distance / spacing));

    for (let j = 0; j < numStitches; j++) {
      const t = j / numStitches;
      const x = start.x + t * (end.x - start.x);
      const y = start.y + t * (end.y - start.y);
      
      stitches.push(generateStitch('satin', [{ x, y }], config));
    }
  }

  return stitches;
}

function generateFillPattern(points: StitchPoint[], config: StitchConfig, options: any): EmbroideryStitch[] {
  const stitches: EmbroideryStitch[] = [];
  const density = options.density || 0.3;
  const spacing = Math.max(3, config.thickness * density);

  // Create parallel lines for fill
  const bounds = getBounds(points);
  const lines = Math.ceil((bounds.maxY - bounds.minY) / spacing);

  for (let i = 0; i < lines; i++) {
    const y = bounds.minY + i * spacing;
    const linePoints = points.filter(p => Math.abs(p.y - y) < spacing / 2);
    
    if (linePoints.length >= 2) {
      stitches.push(generateStitch('fill', linePoints, config));
    }
  }

  return stitches;
}

function generateCrossStitchPattern(points: StitchPoint[], config: StitchConfig, options: any): EmbroideryStitch[] {
  const stitches: EmbroideryStitch[] = [];
  const size = options.size || config.thickness * 2;

  for (const point of points) {
    // Create X pattern
    const halfSize = size / 2;
    const x1 = point.x - halfSize;
    const y1 = point.y - halfSize;
    const x2 = point.x + halfSize;
    const y2 = point.y + halfSize;

    stitches.push(generateStitch('cross-stitch', [
      { x: x1, y: y1 },
      { x: x2, y: y2 }
    ], config));

    stitches.push(generateStitch('cross-stitch', [
      { x: x2, y: y1 },
      { x: x1, y: y2 }
    ], config));
  }

  return stitches;
}

function generateChainPattern(points: StitchPoint[], config: StitchConfig, options: any): EmbroideryStitch[] {
  const stitches: EmbroideryStitch[] = [];
  const linkSize = options.linkSize || config.thickness * 1.5;

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
    const numLinks = Math.max(1, Math.ceil(distance / linkSize));

    for (let j = 0; j < numLinks; j++) {
      const t = j / numLinks;
      const x = start.x + t * (end.x - start.x);
      const y = start.y + t * (end.y - start.y);
      
      stitches.push(generateStitch('chain', [{ x, y }], config));
    }
  }

  return stitches;
}

function generateBackstitchPattern(points: StitchPoint[], config: StitchConfig, options: any): EmbroideryStitch[] {
  const stitches: EmbroideryStitch[] = [];
  const segmentLength = options.segmentLength || config.thickness * 2;

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
    const numSegments = Math.max(1, Math.ceil(distance / segmentLength));

    for (let j = 0; j < numSegments; j++) {
      const t1 = j / numSegments;
      const t2 = (j + 1) / numSegments;
      const x1 = start.x + t1 * (end.x - start.x);
      const y1 = start.y + t1 * (end.y - start.y);
      const x2 = start.x + t2 * (end.x - start.x);
      const y2 = start.y + t2 * (end.y - start.y);
      
      stitches.push(generateStitch('backstitch', [
        { x: x1, y: y1 },
        { x: x2, y: y2 }
      ], config));
    }
  }

  return stitches;
}

function generateFrenchKnotPattern(points: StitchPoint[], config: StitchConfig, options: any): EmbroideryStitch[] {
  const stitches: EmbroideryStitch[] = [];
  const knotSize = options.knotSize || config.thickness * 1.5;

  for (const point of points) {
    stitches.push(generateStitch('french-knot', [{ x: point.x, y: point.y }], {
      ...config,
      thickness: knotSize
    }));
  }

  return stitches;
}

function generateBullionPattern(points: StitchPoint[], config: StitchConfig, options: any): EmbroideryStitch[] {
  const stitches: EmbroideryStitch[] = [];
  const bullionLength = options.bullionLength || config.thickness * 3;

  for (const point of points) {
    stitches.push(generateStitch('bullion', [{ x: point.x, y: point.y }], {
      ...config,
      thickness: bullionLength
    }));
  }

  return stitches;
}

function generateLazyDaisyPattern(points: StitchPoint[], config: StitchConfig, options: any): EmbroideryStitch[] {
  const stitches: EmbroideryStitch[] = [];
  const petalSize = options.petalSize || config.thickness * 2;
  const petalCount = options.petalCount || 5;

  for (const point of points) {
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalX = point.x + Math.cos(angle) * petalSize;
      const petalY = point.y + Math.sin(angle) * petalSize;
      
      stitches.push(generateStitch('lazy-daisy', [
        { x: point.x, y: point.y },
        { x: petalX, y: petalY }
      ], config));
    }
  }

  return stitches;
}

function generateFeatherPattern(points: StitchPoint[], config: StitchConfig, options: any): EmbroideryStitch[] {
  const stitches: EmbroideryStitch[] = [];
  const featherLength = options.featherLength || config.thickness * 2;

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    
    // Create feather branches
    const branch1X = start.x + Math.cos(angle + Math.PI/4) * featherLength;
    const branch1Y = start.y + Math.sin(angle + Math.PI/4) * featherLength;
    const branch2X = start.x + Math.cos(angle - Math.PI/4) * featherLength;
    const branch2Y = start.y + Math.sin(angle - Math.PI/4) * featherLength;
    
    stitches.push(generateStitch('feather', [
      { x: start.x, y: start.y },
      { x: branch1X, y: branch1Y }
    ], config));
    
    stitches.push(generateStitch('feather', [
      { x: start.x, y: start.y },
      { x: branch2X, y: branch2Y }
    ], config));
  }

  return stitches;
}

function getBounds(points: StitchPoint[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  
  return { minX, minY, maxX, maxY };
}

export default { generateStitch, generateStitchPattern };

























