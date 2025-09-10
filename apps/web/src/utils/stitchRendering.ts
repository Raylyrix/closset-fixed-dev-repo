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
  // Ensure color starts with #
  const cleanColor = color.startsWith('#') ? color : `#${color}`;
  
  // Convert hex to RGB
  const hex = cleanColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Adjust brightness
  const newR = Math.max(0, Math.min(255, r + amount));
  const newG = Math.max(0, Math.min(255, g + amount));
  const newB = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Render cross-stitch pattern
export function renderCrossStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`❌ RENDERING CROSS-STITCH with ${points.length} points`);
    console.log(`Canvas context state: globalCompositeOperation=${ctx.globalCompositeOperation}, globalAlpha=${ctx.globalAlpha}`);
  }
  
  // Save context state to avoid interference
  ctx.save();
  
  // Ensure proper rendering context
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  // If we have less than 2 points, don't render anything
  if (points.length < 2) {
    ctx.restore();
    return;
  }
  
  // Calculate total path length to determine stitch distribution
  let totalLength = 0;
  const segmentLengths: number[] = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const point = points[i];
    const nextPoint = points[i + 1];
    const dx = nextPoint.x - point.x;
    const dy = nextPoint.y - point.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    segmentLengths.push(distance);
    totalLength += distance;
  }
  
  // Calculate stitch spacing based on thickness
  const stitchSpacing = Math.max(4, config.thickness * 1.2); // Reduced minimum spacing
  const totalStitches = Math.max(1, Math.ceil(totalLength / stitchSpacing));
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`Cross-stitch total length: ${totalLength.toFixed(2)}, spacing: ${stitchSpacing}, total stitches: ${totalStitches}`);
    console.log(`Cross-stitch config: color=${config.color}, thickness=${config.thickness}`);
  }
  
  // Distribute stitches along the entire path
  let currentDistance = 0;
  let stitchIndex = 0;
  
  for (let i = 0; i < points.length - 1; i++) {
    const point = points[i];
    const nextPoint = points[i + 1];
    const segmentLength = segmentLengths[i];
    const segmentStitches = Math.ceil((segmentLength / totalLength) * totalStitches);
    
    // Ensure at least one stitch per segment
    const actualSegmentStitches = Math.max(1, segmentStitches);
    
    for (let j = 0; j < actualSegmentStitches; j++) {
      const t = j / actualSegmentStitches;
      const stitchX = point.x + (nextPoint.x - point.x) * t;
      const stitchY = point.y + (nextPoint.y - point.y) * t;
      
      const size = config.thickness * 1.8; // Slightly smaller for better visibility
      const threadThickness = Math.max(0.6, config.thickness * 0.3);
      
      // Create realistic thread color variations
      const threadVariation = (Math.sin(stitchIndex * 0.3) * 5) + (Math.random() * 3 - 1.5);
      const adjustedColor = adjustBrightness(config.color, threadVariation);
      const shadowColor = adjustBrightness(adjustedColor, -15);
      const highlightColor = adjustBrightness(adjustedColor, 8);
      
      // Debug color for first few stitches
      if (process.env.NODE_ENV === 'development' && stitchIndex < 3) {
        console.log(`Cross-stitch ${stitchIndex} color debug: original=${config.color}, adjusted=${adjustedColor}`);
      }
      
      // Draw cross-stitch shadow (offset slightly)
      ctx.strokeStyle = shadowColor;
      ctx.lineWidth = threadThickness * 1.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.5;
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.beginPath();
      ctx.moveTo(stitchX - size + 0.3, stitchY - size + 0.3);
      ctx.lineTo(stitchX + size + 0.3, stitchY + size + 0.3);
      ctx.moveTo(stitchX - size + 0.3, stitchY + size + 0.3);
      ctx.lineTo(stitchX + size + 0.3, stitchY - size + 0.3);
      ctx.stroke();
      
      // Draw main cross-stitch threads
      ctx.strokeStyle = adjustedColor;
      ctx.lineWidth = threadThickness;
      ctx.globalAlpha = 1;
      
      // First diagonal (bottom-left to top-right)
      ctx.beginPath();
      ctx.moveTo(stitchX - size, stitchY - size);
      ctx.lineTo(stitchX + size, stitchY + size);
      ctx.stroke();
      
      // Second diagonal (top-left to bottom-right)
      ctx.beginPath();
      ctx.moveTo(stitchX - size, stitchY + size);
      ctx.lineTo(stitchX + size, stitchY - size);
      ctx.stroke();
      
      // Add thread highlights for 3D effect
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = threadThickness * 0.25;
      ctx.globalAlpha = 0.7;
      
      // Highlight first diagonal
      ctx.beginPath();
      ctx.moveTo(stitchX - size * 0.6, stitchY - size * 0.6);
      ctx.lineTo(stitchX + size * 0.6, stitchY + size * 0.6);
      ctx.stroke();
      
      // Highlight second diagonal
      ctx.beginPath();
      ctx.moveTo(stitchX - size * 0.6, stitchY + size * 0.6);
      ctx.lineTo(stitchX + size * 0.6, stitchY - size * 0.6);
      ctx.stroke();
      
      stitchIndex++;
    }
  }
  
  // Restore context state
  ctx.restore();
}

// Render satin stitch pattern
export function renderSatinStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🧵 RENDERING SATIN STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  // Save context state to avoid interference
  ctx.save();
  
  // Ensure proper rendering context
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -15);
  const lighterColor = adjustBrightness(baseColor, 15);
  
  // Create gradient for satin effect
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const gradient = ctx.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
  gradient.addColorStop(0, lighterColor);
  gradient.addColorStop(0.5, baseColor);
  gradient.addColorStop(1, darkerColor);
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = config.opacity;
  
  // Draw smooth satin curve
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    const curr = points[i];
    const prev = points[i - 1];
    const next = points[i + 1];
    
    if (next) {
      // Smooth curve for satin effect
      const cp1x = prev.x + (curr.x - prev.x) * 0.5;
      const cp1y = prev.y + (curr.y - prev.y) * 0.5;
      const cp2x = curr.x - (next.x - curr.x) * 0.5;
      const cp2y = curr.y - (next.y - curr.y) * 0.5;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
    } else {
      ctx.lineTo(curr.x, curr.y);
    }
  }
  
  ctx.stroke();
  
  // Add satin-specific highlights for 3D effect
  ctx.strokeStyle = lighterColor;
  ctx.lineWidth = config.thickness * 0.3;
  ctx.globalAlpha = 0.6;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const curr = points[i];
    const prev = points[i - 1];
    const next = points[i + 1];
    
    if (next) {
      const cp1x = prev.x + (curr.x - prev.x) * 0.5;
      const cp1y = prev.y + (curr.y - prev.y) * 0.5;
      const cp2x = curr.x - (next.x - curr.x) * 0.5;
      const cp2y = curr.y - (next.y - curr.y) * 0.5;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
    } else {
      ctx.lineTo(curr.x, curr.y);
    }
  }
  ctx.stroke();
  
  // Restore context state
  ctx.restore();
}

// Render chain stitch pattern
export function renderChainStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`⛓️ RENDERING CHAIN STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  // Save context state to avoid interference
  ctx.save();
  
  // Ensure proper rendering context
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -25);
  
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = config.opacity;
  
  // Draw chain links along the path
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    // Calculate distance and number of chain links needed
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const linkSpacing = Math.max(4, config.thickness * 0.8);
    const numLinks = Math.max(1, Math.ceil(distance / linkSpacing));
    
    // Draw chain links along the path
    for (let j = 0; j <= numLinks; j++) {
      const t = j / numLinks;
      const linkX = curr.x + dx * t;
      const linkY = curr.y + dy * t;
      
      // Main chain link
      ctx.beginPath();
      ctx.arc(linkX, linkY, config.thickness * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Connection line between segments
    if (i < points.length - 1) {
      ctx.beginPath();
      ctx.moveTo(curr.x, curr.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
  }
  
  // Draw final link
  const lastPoint = points[points.length - 1];
  ctx.beginPath();
  ctx.arc(lastPoint.x, lastPoint.y, config.thickness * 0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Restore context state
  ctx.restore();
}

// Render fill stitch pattern
export function renderFillStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🩸 RENDERING FILL STITCH with ${points.length} points`);
  }
  
  if (points.length < 3) return; // Need at least 3 points for a fill area
  
  // Save context state to avoid interference
  ctx.save();
  
  // Ensure proper rendering context
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -20);
  const lighterColor = adjustBrightness(baseColor, 15);
  
  // Create fill pattern with parallel lines
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));
  
  const lineSpacing = Math.max(2, config.thickness * 0.8);
  const numLines = Math.ceil((maxY - minY) / lineSpacing);
  
  // Create clipping path for the fill area
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.clip();
  
  // Draw parallel fill lines
  for (let i = 0; i < numLines; i++) {
    const y = minY + (i * lineSpacing);
    
    // Alternate line colors for texture
    const lineColor = i % 2 === 0 ? baseColor : lighterColor;
    const lineThickness = config.thickness * 0.6;
    
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineThickness;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(minX, y);
    ctx.lineTo(maxX, y);
    ctx.stroke();
  }
  
  // Add border for definition
  ctx.strokeStyle = darkerColor;
  ctx.lineWidth = config.thickness * 0.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.stroke();
  
  // Restore context state
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
