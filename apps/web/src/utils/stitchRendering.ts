// Utility functions for rendering different types of embroidery stitches
// Extracted from EmbroideryTool.tsx to make them reusable

export interface StitchPoint {
  x: number;
  y: number;
  u?: number;
  v?: number;
}

export interface StitchConfig {
  type: string;
  color: string;
  thickness: number;
  opacity: number;
}

// Helper function to adjust color brightness
export function adjustBrightness(color: string, amount: number): string {
  // Validate input
  if (!color || typeof color !== 'string') {
    console.warn('Invalid color input:', color);
    return '#ff69b4'; // Default fallback
  }
  
  // Ensure color starts with #
  const cleanColor = color.startsWith('#') ? color : `#${color}`;
  
  // Validate hex format (must be 6 characters after #)
  if (cleanColor.length !== 7) {
    console.warn('Invalid hex color format:', cleanColor);
    return '#ff69b4'; // Default fallback
  }
  
  // Convert hex to RGB
  const hex = cleanColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Validate parsed values
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    console.warn('Failed to parse hex color:', cleanColor);
    return '#ff69b4'; // Default fallback
  }
  
  // CRITICAL FIX: Round all RGB values to integers before hex conversion
  const newR = Math.round(Math.max(0, Math.min(255, r + amount)));
  const newG = Math.round(Math.max(0, Math.min(255, g + amount)));
  const newB = Math.round(Math.max(0, Math.min(255, b + amount)));
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Render cross-stitch pattern
export function renderCrossStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  
  // Simple cross-stitch rendering - create X patterns
  const size = Math.max(4, config.thickness * 2);
  
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const halfSize = size / 2;
    
    // Draw X pattern
    ctx.beginPath();
    ctx.moveTo(point.x - halfSize, point.y - halfSize);
    ctx.lineTo(point.x + halfSize, point.y + halfSize);
    ctx.moveTo(point.x + halfSize, point.y - halfSize);
    ctx.lineTo(point.x - halfSize, point.y + halfSize);
    ctx.stroke();
  }
  
  ctx.restore();
}

// Render satin stitch pattern
export function renderSatinStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw smooth satin curve
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    const curr = points[i];
    const prev = points[i - 1];
    
    // Simple line for satin stitch
    ctx.lineTo(curr.x, curr.y);
  }
  
  ctx.stroke();
  ctx.restore();
}

// Render chain stitch pattern
export function renderChainStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw chain links as circles
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const radius = config.thickness * 0.5;
    
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

// Render fill stitch pattern
export function renderFillStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (points.length < 3) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  ctx.fillStyle = config.color;
  
  // Simple fill - draw filled polygon
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Render bullion stitch pattern
export function renderBullionStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  
  // Draw bullion as thick circles
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const radius = config.thickness * 1.5;
    
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

// Render feather stitch pattern
export function renderFeatherStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw feather pattern - simple lines with branches
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    // Main line
    ctx.beginPath();
    ctx.moveTo(curr.x, curr.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    
    // Feather branches
    const angle = Math.atan2(next.y - curr.y, next.x - curr.x);
    const branchLength = config.thickness * 2;
    
    ctx.beginPath();
    ctx.moveTo(curr.x, curr.y);
    ctx.lineTo(
      curr.x + Math.cos(angle + Math.PI/4) * branchLength,
      curr.y + Math.sin(angle + Math.PI/4) * branchLength
    );
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(curr.x, curr.y);
    ctx.lineTo(
      curr.x + Math.cos(angle - Math.PI/4) * branchLength,
      curr.y + Math.sin(angle - Math.PI/4) * branchLength
    );
    ctx.stroke();
  }
  
  ctx.restore();
}

// Render back stitch pattern
export function renderBackStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw backstitch as connected lines
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  ctx.stroke();
  ctx.restore();
}

// Render french knot pattern
export function renderFrenchKnot(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (points.length < 1) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  ctx.fillStyle = config.color;
  
  // Draw french knots as circles at each point
  for (const point of points) {
    const knotSize = config.thickness * 1.5;
    
    ctx.beginPath();
    ctx.arc(point.x, point.y, knotSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

// Render running stitch pattern
export function renderRunningStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw running stitch as dashed line
  ctx.setLineDash([config.thickness * 2, config.thickness]);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  ctx.stroke();
  ctx.restore();
}

// Render blanket stitch pattern
export function renderBlanketStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🛏️ RENDERING BLANKET STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -20);
  
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw blanket stitch pattern
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const stitchSpacing = Math.max(6, config.thickness * 2);
    const numStitches = Math.max(1, Math.ceil(distance / stitchSpacing));
    
    for (let j = 0; j <= numStitches; j++) {
      const t = j / numStitches;
      const stitchX = curr.x + dx * t;
      const stitchY = curr.y + dy * t;
      
      const stitchLength = config.thickness * 1.5;
      const angle = Math.atan2(dy, dx);
      
      // Draw blanket stitch (L-shaped)
      ctx.beginPath();
      ctx.moveTo(stitchX, stitchY);
      ctx.lineTo(
        stitchX + Math.cos(angle) * stitchLength,
        stitchY + Math.sin(angle) * stitchLength
      );
      ctx.lineTo(
        stitchX + Math.cos(angle) * stitchLength + Math.cos(angle + Math.PI/2) * stitchLength/2,
        stitchY + Math.sin(angle) * stitchLength + Math.sin(angle + Math.PI/2) * stitchLength/2
      );
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

// Render herringbone stitch pattern
export function renderHerringboneStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🐟 RENDERING HERRINGBONE STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -15);
  
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw herringbone pattern
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const stitchSpacing = Math.max(8, config.thickness * 2.5);
    const numStitches = Math.max(1, Math.ceil(distance / stitchSpacing));
    
    for (let j = 0; j <= numStitches; j++) {
      const t = j / numStitches;
      const stitchX = curr.x + dx * t;
      const stitchY = curr.y + dy * t;
      
      const stitchLength = config.thickness * 2;
      const angle = Math.atan2(dy, dx);
      
      // Draw herringbone pattern (zigzag)
      ctx.beginPath();
      ctx.moveTo(stitchX, stitchY);
      ctx.lineTo(
        stitchX + Math.cos(angle) * stitchLength,
        stitchY + Math.sin(angle) * stitchLength
      );
      ctx.lineTo(
        stitchX + Math.cos(angle) * stitchLength + Math.cos(angle + Math.PI/3) * stitchLength/2,
        stitchY + Math.sin(angle) * stitchLength + Math.sin(angle + Math.PI/3) * stitchLength/2
      );
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

// Render lazy daisy stitch pattern
export function renderLazyDaisyStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌸 RENDERING LAZY DAISY STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -20);
  const lighterColor = adjustBrightness(baseColor, 15);
  
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw lazy daisy petals along the path
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const petalSpacing = Math.max(8, config.thickness * 2);
    const numPetals = Math.max(1, Math.ceil(distance / petalSpacing));
    
    for (let j = 0; j <= numPetals; j++) {
      const t = j / numPetals;
      const petalX = curr.x + dx * t;
      const petalY = curr.y + dy * t;
      
      const petalSize = config.thickness * 1.5;
      const angle = Math.atan2(dy, dx);
      
      // Draw petal (arc)
      ctx.beginPath();
      ctx.arc(petalX, petalY, petalSize, angle - Math.PI/3, angle + Math.PI/3);
      ctx.stroke();
      
      // Draw petal center
      ctx.fillStyle = lighterColor;
      ctx.beginPath();
      ctx.arc(petalX, petalY, petalSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

// Render couching stitch pattern
export function renderCouchingStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🧵 RENDERING COUCHING STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -25);
  
  // Draw main thread
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  
  // Draw couching stitches (perpendicular to main thread)
  ctx.strokeStyle = darkerColor;
  ctx.lineWidth = config.thickness * 0.5;
  
  for (let i = 1; i < points.length - 1; i++) {
    const curr = points[i];
    const prev = points[i - 1];
    const next = points[i + 1];
    
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const angle = Math.atan2(dy, dx) + Math.PI/2;
    
    const couchingLength = config.thickness * 2;
    const startX = curr.x + Math.cos(angle) * couchingLength;
    const startY = curr.y + Math.sin(angle) * couchingLength;
    const endX = curr.x - Math.cos(angle) * couchingLength;
    const endY = curr.y - Math.sin(angle) * couchingLength;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  
  ctx.restore();
}

// Render appliqué stitch pattern
export function renderAppliqueStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎨 RENDERING APPLIQUÉ STITCH with ${points.length} points`);
  }
  
  if (points.length < 3) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -30);
  const lighterColor = adjustBrightness(baseColor, 20);
  
  // Fill the appliqué area
  ctx.fillStyle = lighterColor;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fill();
  
  // Draw satin stitch border
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.stroke();
  
  ctx.restore();
}

// Render seed stitch pattern
export function renderSeedStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌱 RENDERING SEED STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -15);
  
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  
  // Draw random seed stitches along the path
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const seedSpacing = Math.max(3, config.thickness * 0.8);
    const numSeeds = Math.max(1, Math.ceil(distance / seedSpacing));
    
    for (let j = 0; j <= numSeeds; j++) {
      const t = j / numSeeds;
      const seedX = curr.x + dx * t;
      const seedY = curr.y + dy * t;
      
      // Random seed direction
      const angle = Math.random() * Math.PI * 2;
      const seedLength = config.thickness * 0.8;
      
      ctx.beginPath();
      ctx.moveTo(seedX, seedY);
      ctx.lineTo(
        seedX + Math.cos(angle) * seedLength,
        seedY + Math.sin(angle) * seedLength
      );
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

// Render stem stitch pattern
export function renderStemStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌿 RENDERING STEM STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -20);
  
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw stem stitch (overlapping stitches)
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const stitchLength = Math.max(2, config.thickness * 0.8);
    const numStitches = Math.max(1, Math.ceil(distance / stitchLength));
    
    for (let j = 0; j < numStitches; j++) {
      const t1 = j / numStitches;
      const t2 = (j + 0.5) / numStitches;
      
      const startX = curr.x + dx * t1;
      const startY = curr.y + dy * t1;
      const endX = curr.x + dx * Math.min(t2, 1);
      const endY = curr.y + dy * Math.min(t2, 1);
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

// Render split stitch pattern
export function renderSplitStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`✂️ RENDERING SPLIT STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -15);
  
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw split stitch (overlapping with previous stitch)
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const stitchLength = Math.max(3, config.thickness * 1.2);
    const numStitches = Math.max(1, Math.ceil(distance / stitchLength));
    
    for (let j = 0; j < numStitches; j++) {
      const t1 = j / numStitches;
      const t2 = (j + 0.7) / numStitches;
      
      const startX = curr.x + dx * t1;
      const startY = curr.y + dy * t1;
      const endX = curr.x + dx * Math.min(t2, 1);
      const endY = curr.y + dy * Math.min(t2, 1);
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

// Render brick stitch pattern
export function renderBrickStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🧱 RENDERING BRICK STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -20);
  const lighterColor = adjustBrightness(baseColor, 15);
  
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw brick pattern
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const brickSpacing = Math.max(6, config.thickness * 1.5);
    const numBricks = Math.max(1, Math.ceil(distance / brickSpacing));
    
    for (let j = 0; j < numBricks; j++) {
      const t = j / numBricks;
      const brickX = curr.x + dx * t;
      const brickY = curr.y + dy * t;
      
      const brickWidth = config.thickness * 1.2;
      const brickHeight = config.thickness * 0.8;
      const angle = Math.atan2(dy, dx);
      
      // Draw brick
      ctx.fillStyle = j % 2 === 0 ? baseColor : lighterColor;
      ctx.beginPath();
      ctx.rect(brickX - brickWidth/2, brickY - brickHeight/2, brickWidth, brickHeight);
      ctx.fill();
      
      // Draw brick outline
      ctx.strokeStyle = darkerColor;
      ctx.lineWidth = config.thickness * 0.3;
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

// Render long-short stitch pattern
export function renderLongShortStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📏 RENDERING LONG-SHORT STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -15);
  
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw alternating long and short stitches
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const stitchSpacing = Math.max(4, config.thickness * 1.2);
    const numStitches = Math.max(1, Math.ceil(distance / stitchSpacing));
    
    for (let j = 0; j < numStitches; j++) {
      const t1 = j / numStitches;
      const t2 = (j + (j % 2 === 0 ? 0.8 : 0.4)) / numStitches;
      
      const startX = curr.x + dx * t1;
      const startY = curr.y + dy * t1;
      const endX = curr.x + dx * Math.min(t2, 1);
      const endY = curr.y + dy * Math.min(t2, 1);
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

// Render fishbone stitch pattern
export function renderFishboneStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🐟 RENDERING FISHBONE STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -20);
  
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw fishbone pattern
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const stitchSpacing = Math.max(6, config.thickness * 1.5);
    const numStitches = Math.max(1, Math.ceil(distance / stitchSpacing));
    
    for (let j = 0; j < numStitches; j++) {
      const t = j / numStitches;
      const stitchX = curr.x + dx * t;
      const stitchY = curr.y + dy * t;
      
      const stitchLength = config.thickness * 1.5;
      const angle = Math.atan2(dy, dx);
      
      // Draw fishbone branches
      ctx.beginPath();
      ctx.moveTo(stitchX, stitchY);
      ctx.lineTo(
        stitchX + Math.cos(angle + Math.PI/4) * stitchLength,
        stitchY + Math.sin(angle + Math.PI/4) * stitchLength
      );
      ctx.moveTo(stitchX, stitchY);
      ctx.lineTo(
        stitchX + Math.cos(angle - Math.PI/4) * stitchLength,
        stitchY + Math.sin(angle - Math.PI/4) * stitchLength
      );
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

// Render satin ribbon stitch pattern
export function renderSatinRibbonStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎀 RENDERING SATIN RIBBON STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -25);
  const lighterColor = adjustBrightness(baseColor, 20);
  
  // Create ribbon gradient
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const gradient = ctx.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
  gradient.addColorStop(0, lighterColor);
  gradient.addColorStop(0.5, baseColor);
  gradient.addColorStop(1, darkerColor);
  
  ctx.fillStyle = gradient;
  ctx.strokeStyle = darkerColor;
  ctx.lineWidth = config.thickness * 0.3;
  
  // Draw ribbon shape
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.lineWidth = config.thickness;
  ctx.stroke();
  
  // Add ribbon highlights
  ctx.strokeStyle = lighterColor;
  ctx.lineWidth = config.thickness * 0.2;
  ctx.globalAlpha = 0.7;
  ctx.stroke();
  
  ctx.restore();
}

// Render metallic stitch pattern
export function renderMetallicStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`✨ RENDERING METALLIC STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const metallicColor = adjustBrightness(baseColor, 30);
  const shadowColor = adjustBrightness(baseColor, -40);
  
  // Create metallic gradient
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const gradient = ctx.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
  gradient.addColorStop(0, metallicColor);
  gradient.addColorStop(0.5, baseColor);
  gradient.addColorStop(1, shadowColor);
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  
  // Add metallic highlights
  ctx.strokeStyle = metallicColor;
  ctx.lineWidth = config.thickness * 0.3;
  ctx.globalAlpha = 0.8;
  ctx.stroke();
  
  ctx.restore();
}

// Render glow thread stitch pattern
export function renderGlowThreadStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`💫 RENDERING GLOW THREAD STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const glowColor = adjustBrightness(baseColor, 40);
  
  // Add glow effect
  ctx.shadowColor = baseColor;
  ctx.shadowBlur = config.thickness * 2;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  
  // Reset shadow
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  ctx.restore();
}

// Render variegated stitch pattern
export function renderVariegatedStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌈 RENDERING VARIEGATED STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw variegated pattern with color variations
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const segmentLength = Math.max(2, config.thickness * 0.8);
    const numSegments = Math.max(1, Math.ceil(distance / segmentLength));
    
    for (let j = 0; j < numSegments; j++) {
      const t1 = j / numSegments;
      const t2 = (j + 1) / numSegments;
      
      const startX = curr.x + dx * t1;
      const startY = curr.y + dy * t1;
      const endX = curr.x + dx * Math.min(t2, 1);
      const endY = curr.y + dy * Math.min(t2, 1);
      
      // Create color variation
      const variation = Math.sin(j * 0.5) * 20;
      const segmentColor = adjustBrightness(baseColor, variation);
      
      ctx.strokeStyle = segmentColor;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

// Render gradient stitch pattern
export function renderGradientStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎨 RENDERING GRADIENT STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const startColor = adjustBrightness(baseColor, 30);
  const endColor = adjustBrightness(baseColor, -30);
  
  // Create gradient
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const gradient = ctx.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
  gradient.addColorStop(0, startColor);
  gradient.addColorStop(1, endColor);
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  
  ctx.restore();
}

// Main function to render any stitch type
export function renderStitchType(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  // Validate inputs
  if (!ctx || !points || !Array.isArray(points) || points.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Invalid parameters for stitch rendering:', { ctx: !!ctx, points: points?.length });
    }
    return;
  }
  
  if (!config || !config.type || !config.color) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Invalid config for stitch rendering:', config);
    }
    return;
  }
  
  ctx.save();
  
  try {
    switch (config.type) {
      case 'cross-stitch':
      case 'crossstitch':
        renderCrossStitch(ctx, points, config);
        break;
      case 'satin':
        renderSatinStitch(ctx, points, config);
        break;
      case 'chain':
        renderChainStitch(ctx, points, config);
        break;
      case 'fill':
        renderFillStitch(ctx, points, config);
        break;
      case 'bullion':
        renderBullionStitch(ctx, points, config);
        break;
      case 'feather':
      case 'feather-stitch':
        renderFeatherStitch(ctx, points, config);
        break;
      case 'back-stitch':
      case 'backstitch':
        renderBackStitch(ctx, points, config);
        break;
      case 'french-knot':
        renderFrenchKnot(ctx, points, config);
        break;
      case 'running-stitch':
      case 'runningstitch':
        renderRunningStitch(ctx, points, config);
        break;
      case 'blanket-stitch':
      case 'blanketstitch':
        renderBlanketStitch(ctx, points, config);
        break;
      case 'herringbone-stitch':
      case 'herringbonestitch':
        renderHerringboneStitch(ctx, points, config);
        break;
      case 'lazy-daisy':
        renderLazyDaisyStitch(ctx, points, config);
        break;
      case 'couching':
        renderCouchingStitch(ctx, points, config);
        break;
      case 'appliqué':
        renderAppliqueStitch(ctx, points, config);
        break;
      case 'seed':
        renderSeedStitch(ctx, points, config);
        break;
      case 'stem':
        renderStemStitch(ctx, points, config);
        break;
      case 'split':
        renderSplitStitch(ctx, points, config);
        break;
      case 'brick':
        renderBrickStitch(ctx, points, config);
        break;
      case 'long-short':
        renderLongShortStitch(ctx, points, config);
        break;
      case 'fishbone':
        renderFishboneStitch(ctx, points, config);
        break;
      case 'satin-ribbon':
        renderSatinRibbonStitch(ctx, points, config);
        break;
      case 'metallic':
        renderMetallicStitch(ctx, points, config);
        break;
      case 'glow-thread':
        renderGlowThreadStitch(ctx, points, config);
        break;
      case 'variegated':
        renderVariegatedStitch(ctx, points, config);
        break;
      case 'gradient':
        renderGradientStitch(ctx, points, config);
        break;
      default:
        // Default to satin for unknown types
        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️ Unknown stitch type: ${config.type}. Using satin stitch.`);
        }
        renderSatinStitch(ctx, points, config);
        break;
    }
  } catch (error) {
    console.error('Error rendering stitch:', error);
    // Fallback to basic line rendering
    try {
      ctx.lineWidth = config.thickness || 2;
      ctx.strokeStyle = config.color || '#000000';
      ctx.globalAlpha = config.opacity || 1.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    } catch (fallbackError) {
      console.error('Error in fallback rendering:', fallbackError);
    }
  } finally {
    ctx.restore();
  }
}
