/**
 * Simple Stitch Renderer - Clean, working stitch rendering functions
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
}

// Simple stitch rendering functions
export function renderSimpleStitch(
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
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  ctx.stroke();
  ctx.restore();
}

export function renderSimpleFill(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (points.length < 3) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  ctx.fillStyle = config.color;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function renderSimpleCircle(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (points.length < 1) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  ctx.fillStyle = config.color;
  
  for (const point of points) {
    const radius = config.thickness * 0.8;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

export function renderSimpleDashed(
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
  
  ctx.setLineDash([config.thickness * 2, config.thickness]);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  ctx.stroke();
  ctx.restore();
}

export function renderSimpleCross(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (points.length < 1) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  
  const size = Math.max(4, config.thickness * 2);
  
  for (const point of points) {
    const halfSize = size / 2;
    
    ctx.beginPath();
    ctx.moveTo(point.x - halfSize, point.y - halfSize);
    ctx.lineTo(point.x + halfSize, point.y + halfSize);
    ctx.moveTo(point.x + halfSize, point.y - halfSize);
    ctx.lineTo(point.x - halfSize, point.y + halfSize);
    ctx.stroke();
  }
  
  ctx.restore();
}

export function renderSimpleBranches(
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
  
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    // Main line
    ctx.beginPath();
    ctx.moveTo(curr.x, curr.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    
    // Branches
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

// Main stitch type renderer
export function renderStitchType(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (!ctx || !points || points.length === 0 || !config) return;
  
  switch (config.type) {
    case 'cross-stitch':
    case 'crossstitch':
      renderSimpleCross(ctx, points, config);
      break;
    case 'satin':
      renderSimpleStitch(ctx, points, config);
      break;
    case 'chain':
      renderSimpleCircle(ctx, points, config);
      break;
    case 'fill':
      renderSimpleFill(ctx, points, config);
      break;
    case 'bullion':
      renderSimpleCircle(ctx, points, config);
      break;
    case 'feather':
    case 'feather-stitch':
      renderSimpleBranches(ctx, points, config);
      break;
    case 'back-stitch':
    case 'backstitch':
      renderSimpleStitch(ctx, points, config);
      break;
    case 'french-knot':
      renderSimpleCircle(ctx, points, config);
      break;
    case 'running-stitch':
    case 'runningstitch':
      renderSimpleDashed(ctx, points, config);
      break;
    case 'blanket-stitch':
    case 'blanketstitch':
      renderSimpleStitch(ctx, points, config);
      break;
    case 'herringbone-stitch':
    case 'herringbonestitch':
      renderSimpleBranches(ctx, points, config);
      break;
    case 'lazy-daisy':
      renderSimpleCircle(ctx, points, config);
      break;
    case 'couching':
      renderSimpleStitch(ctx, points, config);
      break;
    case 'appliqué':
      renderSimpleFill(ctx, points, config);
      break;
    case 'seed':
      renderSimpleCircle(ctx, points, config);
      break;
    case 'stem':
      renderSimpleStitch(ctx, points, config);
      break;
    case 'split':
      renderSimpleStitch(ctx, points, config);
      break;
    case 'brick':
      renderSimpleStitch(ctx, points, config);
      break;
    case 'long-short':
      renderSimpleStitch(ctx, points, config);
      break;
    case 'fishbone':
      renderSimpleBranches(ctx, points, config);
      break;
    case 'satin-ribbon':
      renderSimpleStitch(ctx, points, config);
      break;
    case 'metallic':
      renderSimpleStitch(ctx, points, config);
      break;
    case 'glow-thread':
      renderSimpleStitch(ctx, points, config);
      break;
    case 'variegated':
      renderSimpleStitch(ctx, points, config);
      break;
    case 'gradient':
      renderSimpleStitch(ctx, points, config);
      break;
    default:
      renderSimpleStitch(ctx, points, config);
      break;
  }
}

export default renderStitchType;

