/**
 * 🎭 PUFF PATTERN LIBRARY
 * 
 * Comprehensive library of puff print patterns and shapes:
 * - Built-in geometric patterns
 * - Custom pattern support
 * - Pattern preview system
 * - Performance-optimized drawing functions
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PuffPattern {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'basic' | 'geometric' | 'organic' | 'textured' | 'custom';
  drawFunction: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void;
  previewFunction?: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void;
  parameters?: PatternParameter[];
}

export interface PatternParameter {
  name: string;
  type: 'range' | 'color' | 'select' | 'boolean';
  min?: number;
  max?: number;
  step?: number;
  defaultValue: any;
  options?: { value: any; label: string }[];
}

// ============================================================================
// PATTERN LIBRARY CLASS
// ============================================================================

export class PuffPatternLibrary {
  private patterns: Map<string, PuffPattern> = new Map();
  private categories: Map<string, PuffPattern[]> = new Map();
  
  constructor() {
    this.initializeBuiltInPatterns();
    this.organizePatternsByCategory();
  }
  
  // Initialize built-in patterns
  private initializeBuiltInPatterns(): void {
    // Basic Patterns
    this.addPattern({
      id: 'round',
      name: 'Round',
      icon: '●',
      description: 'Classic circular puff',
      category: 'basic',
      drawFunction: this.drawRoundPattern
    });
    
    this.addPattern({
      id: 'square',
      name: 'Square',
      icon: '■',
      description: 'Square puff with rounded corners',
      category: 'basic',
      drawFunction: this.drawSquarePattern
    });
    
    this.addPattern({
      id: 'oval',
      name: 'Oval',
      icon: '⬬',
      description: 'Elliptical puff shape',
      category: 'basic',
      drawFunction: this.drawOvalPattern
    });
    
    // Geometric Patterns
    this.addPattern({
      id: 'diamond',
      name: 'Diamond',
      icon: '◆',
      description: 'Diamond-shaped puff',
      category: 'geometric',
      drawFunction: this.drawDiamondPattern
    });
    
    this.addPattern({
      id: 'star',
      name: 'Star',
      icon: '★',
      description: '5-pointed star puff',
      category: 'geometric',
      drawFunction: this.drawStarPattern
    });
    
    this.addPattern({
      id: 'hexagon',
      name: 'Hexagon',
      icon: '⬡',
      description: 'Hexagonal puff',
      category: 'geometric',
      drawFunction: this.drawHexagonPattern
    });
    
    this.addPattern({
      id: 'triangle',
      name: 'Triangle',
      icon: '▲',
      description: 'Triangular puff',
      category: 'geometric',
      drawFunction: this.drawTrianglePattern
    });
    
    // Organic Patterns
    this.addPattern({
      id: 'blob',
      name: 'Blob',
      icon: '🫧',
      description: 'Organic blob shape',
      category: 'organic',
      drawFunction: this.drawBlobPattern
    });
    
    this.addPattern({
      id: 'cloud',
      name: 'Cloud',
      icon: '☁️',
      description: 'Cloud-like puff',
      category: 'organic',
      drawFunction: this.drawCloudPattern
    });
    
    this.addPattern({
      id: 'heart',
      name: 'Heart',
      icon: '❤️',
      description: 'Heart-shaped puff',
      category: 'organic',
      drawFunction: this.drawHeartPattern
    });
    
    // Textured Patterns
    this.addPattern({
      id: 'dots',
      name: 'Dots',
      icon: '⋯',
      description: 'Pattern of small dots',
      category: 'textured',
      drawFunction: this.drawDotsPattern
    });
    
    this.addPattern({
      id: 'lines',
      name: 'Lines',
      icon: '║',
      description: 'Parallel line pattern',
      category: 'textured',
      drawFunction: this.drawLinesPattern
    });
    
    this.addPattern({
      id: 'grid',
      name: 'Grid',
      icon: '⊞',
      description: 'Grid pattern',
      category: 'textured',
      drawFunction: this.drawGridPattern
    });
    
    this.addPattern({
      id: 'spiral',
      name: 'Spiral',
      icon: '🌀',
      description: 'Spiral pattern',
      category: 'textured',
      drawFunction: this.drawSpiralPattern
    });
    
    // Advanced Patterns
    this.addPattern({
      id: 'gradient',
      name: 'Gradient',
      icon: '◐',
      description: 'Radial gradient puff',
      category: 'textured',
      drawFunction: this.drawGradientPattern
    });
    
    this.addPattern({
      id: 'noise',
      name: 'Noise',
      icon: '◈',
      description: 'Noise texture puff',
      category: 'textured',
      drawFunction: this.drawNoisePattern
    });
  }
  
  // Add a pattern to the library
  public addPattern(pattern: PuffPattern): void {
    this.patterns.set(pattern.id, pattern);
  }
  
  // Get a pattern by ID
  public getPattern(id: string): PuffPattern | undefined {
    return this.patterns.get(id);
  }
  
  // Get all available patterns
  public getAvailablePatterns(): PuffPattern[] {
    return Array.from(this.patterns.values());
  }
  
  // Get patterns by category
  public getPatternsByCategory(category: string): PuffPattern[] {
    return this.categories.get(category) || [];
  }
  
  // Get all categories
  public getCategories(): string[] {
    return Array.from(this.categories.keys());
  }
  
  // Organize patterns by category
  private organizePatternsByCategory(): void {
    this.patterns.forEach(pattern => {
      if (!this.categories.has(pattern.category)) {
        this.categories.set(pattern.category, []);
      }
      this.categories.get(pattern.category)!.push(pattern);
    });
  }
  
  // ============================================================================
  // PATTERN DRAWING FUNCTIONS
  // ============================================================================
  
  // Round pattern
  private drawRoundPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  };
  
  // Square pattern
  private drawSquarePattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
    const cornerRadius = size * 0.1;
    ctx.beginPath();
    ctx.roundRect(x - size / 2, y - size / 2, size, size, cornerRadius);
    ctx.fill();
  };
  
  // Oval pattern
  private drawOvalPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
    const radiusX = size / 2;
    const radiusY = size / 3;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, radiusY / radiusX);
    ctx.beginPath();
    ctx.arc(0, 0, radiusX, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  
  // Diamond pattern
  private drawDiamondPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
    const halfSize = size / 2;
    
    ctx.beginPath();
    ctx.moveTo(x, y - halfSize);
    ctx.lineTo(x + halfSize, y);
    ctx.lineTo(x, y + halfSize);
    ctx.lineTo(x - halfSize, y);
    ctx.closePath();
    ctx.fill();
  };
  
  // Star pattern
  private drawStarPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.4;
    const spikes = 5;
    
    ctx.beginPath();
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    
    ctx.closePath();
    ctx.fill();
  };
  
  // Hexagon pattern
  private drawHexagonPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
    const radius = size / 2;
    
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
  };
  
  // Triangle pattern
  private drawTrianglePattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
    const height = size * 0.866; // Height of equilateral triangle
    
    ctx.beginPath();
    ctx.moveTo(x, y - height / 2);
    ctx.lineTo(x + size / 2, y + height / 2);
    ctx.lineTo(x - size / 2, y + height / 2);
    ctx.closePath();
    ctx.fill();
  };
  
  // Blob pattern
  private drawBlobPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
    const radius = size / 2;
    const variation = radius * 0.3;
    
    ctx.beginPath();
    
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const randomVariation = (Math.random() - 0.5) * variation;
      const currentRadius = radius + randomVariation;
      
      const px = x + Math.cos(angle) * currentRadius;
      const py = y + Math.sin(angle) * currentRadius;
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    
    ctx.closePath();
    ctx.fill();
  };
  
  // Cloud pattern
  private drawCloudPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
    const cloudSize = size * 0.8;
    const circles = [
      { x: x - cloudSize * 0.3, y: y, r: cloudSize * 0.3 },
      { x: x, y: y, r: cloudSize * 0.4 },
      { x: x + cloudSize * 0.3, y: y, r: cloudSize * 0.3 },
      { x: x - cloudSize * 0.1, y: y - cloudSize * 0.2, r: cloudSize * 0.25 },
      { x: x + cloudSize * 0.1, y: y - cloudSize * 0.2, r: cloudSize * 0.25 }
    ];
    
    ctx.beginPath();
    circles.forEach(circle => {
      ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
    });
    ctx.fill();
  };
  
  // Heart pattern
  private drawHeartPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
    const scale = size / 100;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-25, -25, -50, -10, -50, 20);
    ctx.bezierCurveTo(-50, 40, -25, 50, 0, 70);
    ctx.bezierCurveTo(25, 50, 50, 40, 50, 20);
    ctx.bezierCurveTo(50, -10, 25, -25, 0, 0);
    ctx.fill();
    
    ctx.restore();
  };
  
  // Dots pattern
  private drawDotsPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
    const dotSize = size * 0.1;
    const spacing = size * 0.2;
    
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const dotX = x + i * spacing;
        const dotY = y + j * spacing;
        
        if (Math.sqrt(i * i + j * j) <= 2.5) {
          ctx.beginPath();
          ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  };
  
  // Lines pattern
  private drawLinesPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
    const lineWidth = size * 0.05;
    const spacing = size * 0.15;
    
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    
    for (let i = -3; i <= 3; i++) {
      const lineY = y + i * spacing;
      ctx.beginPath();
      ctx.moveTo(x - size / 2, lineY);
      ctx.lineTo(x + size / 2, lineY);
      ctx.stroke();
    }
  };
  
  // Grid pattern
  private drawGridPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
    const lineWidth = size * 0.03;
    const spacing = size * 0.2;
    
    ctx.lineWidth = lineWidth;
    
    // Vertical lines
    for (let i = -2; i <= 2; i++) {
      const lineX = x + i * spacing;
      ctx.beginPath();
      ctx.moveTo(lineX, y - size / 2);
      ctx.lineTo(lineX, y + size / 2);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = -2; i <= 2; i++) {
      const lineY = y + i * spacing;
      ctx.beginPath();
      ctx.moveTo(x - size / 2, lineY);
      ctx.lineTo(x + size / 2, lineY);
      ctx.stroke();
    }
  };
  
  // Spiral pattern
  private drawSpiralPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
    const maxRadius = size / 2;
    const turns = 3;
    const lineWidth = size * 0.05;
    
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    for (let i = 0; i <= 360 * turns; i += 2) {
      const angle = (i * Math.PI) / 180;
      const radius = (i / (360 * turns)) * maxRadius;
      
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
  };
  
  // Gradient pattern
  private drawGradientPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size / 2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.8)');
    gradient.addColorStop(1, 'rgba(100, 100, 100, 0.4)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  };
  
  // Noise pattern
  private drawNoisePattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 255;
      data[i] = noise;     // R
      data[i + 1] = noise; // G
      data[i + 2] = noise; // B
      data[i + 3] = 255;   // A
    }
    
    ctx.putImageData(imageData, x - size / 2, y - size / 2);
  };
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  // Create a custom pattern
  public createCustomPattern(
    id: string,
    name: string,
    icon: string,
    description: string,
    drawFunction: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void,
    parameters?: PatternParameter[]
  ): PuffPattern {
    const pattern: PuffPattern = {
      id,
      name,
      icon,
      description,
      category: 'custom',
      drawFunction,
      parameters
    };
    
    this.addPattern(pattern);
    return pattern;
  }
  
  // Generate pattern preview
  public generatePreview(pattern: PuffPattern, size: number = 64): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, size, size);
    
    if (pattern.previewFunction) {
      pattern.previewFunction(ctx, size / 2, size / 2, size * 0.8);
    } else {
      pattern.drawFunction(ctx, size / 2, size / 2, size * 0.8);
    }
    
    return canvas;
  }
  
  // Export pattern as image
  public exportPattern(pattern: PuffPattern, size: number = 256): string {
    const canvas = this.generatePreview(pattern, size);
    return canvas.toDataURL('image/png');
  }
  
  // Get pattern statistics
  public getPatternStats(): { total: number; byCategory: Record<string, number> } {
    const stats = {
      total: this.patterns.size,
      byCategory: {} as Record<string, number>
    };
    
    this.categories.forEach((patterns, category) => {
      stats.byCategory[category] = patterns.length;
    });
    
    return stats;
  }
}

export default PuffPatternLibrary;


