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
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`❌ RENDERING CROSS-STITCH with ${points.length} points`);
    console.log(`Canvas context state: globalCompositeOperation=${ctx.globalCompositeOperation}, globalAlpha=${ctx.globalAlpha}`);
    console.log(`Cross-stitch config:`, config);
  }
  
  // Save context state to avoid interference
  ctx.save();
  
  // Ensure proper rendering context
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  // If we have less than 2 points, don't render anything
  if (points.length < 2) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Cross-stitch: Not enough points to render');
    }
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
      
      // Debug color input
      if (process.env.NODE_ENV === 'development' && stitchIndex < 3) {
        console.log(`🔍 Color debug - Original config.color:`, config.color, typeof config.color);
      }
      
      // Ensure we have a valid color
      const baseColor = config.color && typeof config.color === 'string' ? config.color : '#ff69b4';
      const adjustedColor = adjustBrightness(baseColor, threadVariation);
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

// Render bullion stitch pattern
export function renderBullionStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌹 RENDERING BULLION STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -20);
  const lighterColor = adjustBrightness(baseColor, 15);
  
  // Draw bullion knots along the path
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const knotSpacing = Math.max(8, config.thickness * 2);
    const numKnots = Math.max(1, Math.ceil(distance / knotSpacing));
    
    for (let j = 0; j <= numKnots; j++) {
      const t = j / numKnots;
      const knotX = curr.x + dx * t;
      const knotY = curr.y + dy * t;
      
      const knotSize = config.thickness * 1.5;
      
      // Draw bullion knot (spiral pattern)
      ctx.strokeStyle = darkerColor;
      ctx.lineWidth = config.thickness * 0.8;
      ctx.globalAlpha = 0.7;
      
      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
        const radius = knotSize * (1 - angle / (Math.PI * 4));
        const x = knotX + Math.cos(angle) * radius;
        const y = knotY + Math.sin(angle) * radius;
        if (angle === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
      // Add highlight
      ctx.strokeStyle = lighterColor;
      ctx.lineWidth = config.thickness * 0.3;
      ctx.globalAlpha = 0.8;
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

// Render feather stitch pattern
export function renderFeatherStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🪶 RENDERING FEATHER STITCH with ${points.length} points`);
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
  
  // Draw feather stitch pattern
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const featherSpacing = Math.max(6, config.thickness * 1.5);
    const numFeathers = Math.max(1, Math.ceil(distance / featherSpacing));
    
    for (let j = 0; j <= numFeathers; j++) {
      const t = j / numFeathers;
      const featherX = curr.x + dx * t;
      const featherY = curr.y + dy * t;
      
      const featherLength = config.thickness * 2;
      const angle = Math.atan2(dy, dx);
      
      // Draw feather branches
      ctx.beginPath();
      ctx.moveTo(featherX, featherY);
      ctx.lineTo(
        featherX + Math.cos(angle + Math.PI/4) * featherLength,
        featherY + Math.sin(angle + Math.PI/4) * featherLength
      );
      ctx.moveTo(featherX, featherY);
      ctx.lineTo(
        featherX + Math.cos(angle - Math.PI/4) * featherLength,
        featherY + Math.sin(angle - Math.PI/4) * featherLength
      );
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

// Render back stitch pattern
export function renderBackStitch(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`↩️ RENDERING BACK STITCH with ${points.length} points`);
  }
  
  if (points.length < 2) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -10);
  
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = config.thickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw back stitch pattern
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    // Main stitch
    ctx.beginPath();
    ctx.moveTo(curr.x, curr.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    
    // Back stitch (shorter, overlapping)
    if (i < points.length - 2) {
      const nextNext = points[i + 2];
      const midX = (next.x + nextNext.x) / 2;
      const midY = (next.y + nextNext.y) / 2;
      
      ctx.strokeStyle = darkerColor;
      ctx.lineWidth = config.thickness * 0.7;
      ctx.beginPath();
      ctx.moveTo(next.x, next.y);
      ctx.lineTo(midX, midY);
      ctx.stroke();
      
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = config.thickness;
    }
  }
  
  ctx.restore();
}

// Render french knot pattern
export function renderFrenchKnot(
  ctx: CanvasRenderingContext2D, 
  points: StitchPoint[], 
  config: StitchConfig
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎀 RENDERING FRENCH KNOT with ${points.length} points`);
  }
  
  if (points.length < 1) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  const baseColor = config.color;
  const darkerColor = adjustBrightness(baseColor, -25);
  const lighterColor = adjustBrightness(baseColor, 20);
  
  // Draw french knots at each point
  for (const point of points) {
    const knotSize = config.thickness * 1.2;
    
    // Shadow
    ctx.fillStyle = darkerColor;
    ctx.beginPath();
    ctx.arc(point.x + 1, point.y + 1, knotSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Main knot
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.arc(point.x, point.y, knotSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = lighterColor;
    ctx.beginPath();
    ctx.arc(point.x - knotSize/3, point.y - knotSize/3, knotSize/3, 0, Math.PI * 2);
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
  if (process.env.NODE_ENV === 'development') {
    console.log(`🏃 RENDERING RUNNING STITCH with ${points.length} points`);
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
  
  // Draw running stitch pattern (dashed line)
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const dashLength = Math.max(4, config.thickness * 1.5);
    const gapLength = dashLength * 0.5;
    const numDashes = Math.ceil(distance / (dashLength + gapLength));
    
    for (let j = 0; j < numDashes; j++) {
      const t1 = (j * (dashLength + gapLength)) / distance;
      const t2 = ((j * (dashLength + gapLength)) + dashLength) / distance;
      
      if (t1 < 1) {
        const startX = curr.x + dx * Math.min(t1, 1);
        const startY = curr.y + dy * Math.min(t1, 1);
        const endX = curr.x + dx * Math.min(t2, 1);
        const endY = curr.y + dy * Math.min(t2, 1);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    }
  }
  
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
