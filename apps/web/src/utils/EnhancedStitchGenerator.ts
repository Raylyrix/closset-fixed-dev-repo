/**
 * Enhanced Stitch Generator
 * Advanced stitch generation with AI-powered patterns and optimization
 */

import { StitchPoint, EmbroideryStitch } from './EnhancedEmbroideryManager';

export interface StitchGenerationConfig {
  type: string;
  color: string;
  thickness: number;
  opacity: number;
  threadType: string;
  density?: number;
  complexity?: number;
  pattern?: string;
  aiOptimized?: boolean;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
}

export interface PatternTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  complexity: number;
  points: StitchPoint[];
  config: Partial<StitchGenerationConfig>;
}

export class EnhancedStitchGenerator {
  private patterns: PatternTemplate[] = [];
  private aiEnabled: boolean = false;

  constructor(aiEnabled: boolean = false) {
    this.aiEnabled = aiEnabled;
    this.initializePatterns();
  }

  private initializePatterns() {
    this.patterns = [
      {
        id: 'satin_curve',
        name: 'Satin Curve',
        type: 'satin',
        description: 'Smooth curved satin stitch',
        complexity: 2,
        points: this.generateCurvePoints(50, 100, 200, 150, 20),
        config: { density: 0.8, quality: 'high' }
      },
      {
        id: 'cross_flower',
        name: 'Cross Flower',
        type: 'cross-stitch',
        description: 'Flower pattern with cross stitches',
        complexity: 3,
        points: this.generateFlowerPoints(150, 150, 30, 8),
        config: { density: 1.0, quality: 'medium' }
      },
      {
        id: 'chain_border',
        name: 'Chain Border',
        type: 'chain',
        description: 'Decorative chain border',
        complexity: 2,
        points: this.generateBorderPoints(100, 100, 200, 200, 10),
        config: { density: 0.6, quality: 'high' }
      },
      {
        id: 'fill_heart',
        name: 'Fill Heart',
        type: 'fill',
        description: 'Heart shape with fill stitch',
        complexity: 4,
        points: this.generateHeartPoints(150, 150, 40),
        config: { density: 1.2, quality: 'ultra' }
      },
      {
        id: 'feather_leaf',
        name: 'Feather Leaf',
        type: 'feather',
        description: 'Leaf pattern with feather stitch',
        complexity: 3,
        points: this.generateLeafPoints(150, 150, 60, 30),
        config: { density: 0.7, quality: 'high' }
      }
    ];
  }

  // Generate stitches from user input
  generateStitchFromInput(
    points: StitchPoint[],
    config: StitchGenerationConfig
  ): EmbroideryStitch {
    const stitch: EmbroideryStitch = {
      id: `stitch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: config.type,
      points: this.optimizePoints(points, config),
      color: config.color,
      threadType: config.threadType,
      thickness: config.thickness,
      opacity: config.opacity,
      layer: 0,
      visible: true,
      locked: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        stitchCount: points.length,
        length: this.calculateLength(points),
        area: this.calculateArea(points),
        complexity: config.complexity || this.calculateComplexity(points),
        quality: this.calculateQuality(config)
      }
    };

    return stitch;
  }

  // Generate pattern-based stitches
  generatePatternStitch(
    patternId: string,
    centerX: number,
    centerY: number,
    scale: number = 1.0,
    config: Partial<StitchGenerationConfig> = {}
  ): EmbroideryStitch | null {
    const pattern = this.patterns.find(p => p.id === patternId);
    if (!pattern) return null;

    const scaledPoints = pattern.points.map(point => ({
      x: centerX + (point.x - 150) * scale,
      y: centerY + (point.y - 150) * scale,
      pressure: point.pressure || 0.5,
      timestamp: Date.now()
    }));

    const stitchConfig: StitchGenerationConfig = {
      type: pattern.type,
      color: '#FF69B4',
      thickness: 2,
      opacity: 1.0,
      threadType: 'cotton',
      density: 1.0,
      complexity: pattern.complexity,
      quality: 'high',
      ...pattern.config,
      ...config
    };

    return this.generateStitchFromInput(scaledPoints, stitchConfig);
  }

  // AI-powered stitch generation
  generateAIStitch(
    description: string,
    bounds: { x: number; y: number; width: number; height: number },
    config: Partial<StitchGenerationConfig> = {}
  ): EmbroideryStitch[] {
    if (!this.aiEnabled) {
      return this.generateFallbackStitch(description, bounds, config);
    }

    // AI-powered generation would go here
    // For now, return intelligent fallback
    return this.generateIntelligentStitch(description, bounds, config);
  }

  private generateIntelligentStitch(
    description: string,
    bounds: { x: number; y: number; width: number; height: number },
    config: Partial<StitchGenerationConfig>
  ): EmbroideryStitch[] {
    const stitches: EmbroideryStitch[] = [];
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const maxRadius = Math.min(bounds.width, bounds.height) / 2;

    // Analyze description for stitch type
    const stitchType = this.analyzeDescription(description);
    
    switch (stitchType) {
      case 'satin':
        stitches.push(this.generateSatinPattern(centerX, centerY, maxRadius, config));
        break;
      case 'cross-stitch':
        stitches.push(...this.generateCrossStitchPattern(centerX, centerY, maxRadius, config));
        break;
      case 'fill':
        stitches.push(this.generateFillPattern(centerX, centerY, maxRadius, config));
        break;
      case 'chain':
        stitches.push(...this.generateChainPattern(centerX, centerY, maxRadius, config));
        break;
      default:
        stitches.push(this.generateBasicPattern(centerX, centerY, maxRadius, config));
    }

    return stitches;
  }

  private analyzeDescription(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('smooth') || lowerDesc.includes('curve') || lowerDesc.includes('satin')) {
      return 'satin';
    } else if (lowerDesc.includes('cross') || lowerDesc.includes('x') || lowerDesc.includes('grid')) {
      return 'cross-stitch';
    } else if (lowerDesc.includes('fill') || lowerDesc.includes('solid') || lowerDesc.includes('shape')) {
      return 'fill';
    } else if (lowerDesc.includes('chain') || lowerDesc.includes('link') || lowerDesc.includes('border')) {
      return 'chain';
    } else if (lowerDesc.includes('feather') || lowerDesc.includes('leaf') || lowerDesc.includes('branch')) {
      return 'feather';
    }
    
    return 'satin'; // Default
  }

  private generateSatinPattern(
    centerX: number,
    centerY: number,
    radius: number,
    config: Partial<StitchGenerationConfig>
  ): EmbroideryStitch {
    const points = this.generateCurvePoints(
      centerX - radius/2, centerY - radius/2,
      centerX + radius/2, centerY + radius/2,
      Math.max(10, radius / 5)
    );

    return this.generateStitchFromInput(points, {
      type: 'satin',
      color: config.color || '#FF69B4',
      thickness: config.thickness || 2,
      opacity: config.opacity || 1.0,
      threadType: config.threadType || 'cotton',
      density: config.density || 0.8,
      quality: config.quality || 'high'
    });
  }

  private generateCrossStitchPattern(
    centerX: number,
    centerY: number,
    radius: number,
    config: Partial<StitchGenerationConfig>
  ): EmbroideryStitch[] {
    const stitches: EmbroideryStitch[] = [];
    const gridSize = 10;
    const cols = Math.floor(radius * 2 / gridSize);
    const rows = Math.floor(radius * 2 / gridSize);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = centerX - radius + col * gridSize;
        const y = centerY - radius + row * gridSize;
        
        if (Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) <= radius) {
          stitches.push(this.generateStitchFromInput([{ x, y, pressure: 0.5 }], {
            type: 'cross-stitch',
            color: config.color || '#FF69B4',
            thickness: config.thickness || 2,
            opacity: config.opacity || 1.0,
            threadType: config.threadType || 'cotton',
            density: config.density || 1.0,
            quality: config.quality || 'medium'
          }));
        }
      }
    }

    return stitches;
  }

  private generateFillPattern(
    centerX: number,
    centerY: number,
    radius: number,
    config: Partial<StitchGenerationConfig>
  ): EmbroideryStitch {
    const points = this.generateCirclePoints(centerX, centerY, radius, 16);
    
    return this.generateStitchFromInput(points, {
      type: 'fill',
      color: config.color || '#FF69B4',
      thickness: config.thickness || 2,
      opacity: config.opacity || 1.0,
      threadType: config.threadType || 'cotton',
      density: config.density || 1.2,
      quality: config.quality || 'ultra'
    });
  }

  private generateChainPattern(
    centerX: number,
    centerY: number,
    radius: number,
    config: Partial<StitchGenerationConfig>
  ): EmbroideryStitch[] {
    const stitches: EmbroideryStitch[] = [];
    const chainCount = Math.floor(radius / 8);
    
    for (let i = 0; i < chainCount; i++) {
      const angle = (i / chainCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius * 0.7;
      const y = centerY + Math.sin(angle) * radius * 0.7;
      
      stitches.push(this.generateStitchFromInput([{ x, y, pressure: 0.5 }], {
        type: 'chain',
        color: config.color || '#FF69B4',
        thickness: config.thickness || 2,
        opacity: config.opacity || 1.0,
        threadType: config.threadType || 'cotton',
        density: config.density || 0.6,
        quality: config.quality || 'high'
      }));
    }

    return stitches;
  }

  private generateBasicPattern(
    centerX: number,
    centerY: number,
    radius: number,
    config: Partial<StitchGenerationConfig>
  ): EmbroideryStitch {
    const points = this.generateCirclePoints(centerX, centerY, radius, 8);
    
    return this.generateStitchFromInput(points, {
      type: 'satin',
      color: config.color || '#FF69B4',
      thickness: config.thickness || 2,
      opacity: config.opacity || 1.0,
      threadType: config.threadType || 'cotton',
      density: config.density || 1.0,
      quality: config.quality || 'medium'
    });
  }

  private generateFallbackStitch(
    description: string,
    bounds: { x: number; y: number; width: number; height: number },
    config: Partial<StitchGenerationConfig>
  ): EmbroideryStitch[] {
    // Simple fallback generation
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const radius = Math.min(bounds.width, bounds.height) / 4;

    return [this.generateBasicPattern(centerX, centerY, radius, config)];
  }

  // Utility methods for generating points
  private generateCurvePoints(x1: number, y1: number, x2: number, y2: number, segments: number): StitchPoint[] {
    const points: StitchPoint[] = [];
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * 20; // Add curve
      
      points.push({
        x,
        y,
        pressure: 0.5 + Math.sin(t * Math.PI) * 0.3,
        timestamp: Date.now()
      });
    }
    
    return points;
  }

  private generateFlowerPoints(centerX: number, centerY: number, radius: number, petals: number): StitchPoint[] {
    const points: StitchPoint[] = [];
    
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      points.push({
        x,
        y,
        pressure: 0.5,
        timestamp: Date.now()
      });
    }
    
    return points;
  }

  private generateBorderPoints(x1: number, y1: number, x2: number, y2: number, segments: number): StitchPoint[] {
    const points: StitchPoint[] = [];
    const width = x2 - x1;
    const height = y2 - y1;
    
    // Top edge
    for (let i = 0; i < segments; i++) {
      points.push({
        x: x1 + (width * i) / segments,
        y: y1,
        pressure: 0.5,
        timestamp: Date.now()
      });
    }
    
    // Right edge
    for (let i = 0; i < segments; i++) {
      points.push({
        x: x2,
        y: y1 + (height * i) / segments,
        pressure: 0.5,
        timestamp: Date.now()
      });
    }
    
    // Bottom edge
    for (let i = 0; i < segments; i++) {
      points.push({
        x: x2 - (width * i) / segments,
        y: y2,
        pressure: 0.5,
        timestamp: Date.now()
      });
    }
    
    // Left edge
    for (let i = 0; i < segments; i++) {
      points.push({
        x: x1,
        y: y2 - (height * i) / segments,
        pressure: 0.5,
        timestamp: Date.now()
      });
    }
    
    return points;
  }

  private generateHeartPoints(centerX: number, centerY: number, size: number): StitchPoint[] {
    const points: StitchPoint[] = [];
    const segments = 20;
    
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = centerX + 16 * Math.pow(Math.sin(t), 3);
      const y = centerY - (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
      
      points.push({
        x: x * size / 20,
        y: y * size / 20,
        pressure: 0.5,
        timestamp: Date.now()
      });
    }
    
    return points;
  }

  private generateLeafPoints(centerX: number, centerY: number, width: number, height: number): StitchPoint[] {
    const points: StitchPoint[] = [];
    const segments = 16;
    
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI;
      const x = centerX + Math.sin(t) * width / 2;
      const y = centerY - Math.cos(t) * height / 2;
      
      points.push({
        x,
        y,
        pressure: 0.5,
        timestamp: Date.now()
      });
    }
    
    return points;
  }

  private generateCirclePoints(centerX: number, centerY: number, radius: number, segments: number): StitchPoint[] {
    const points: StitchPoint[] = [];
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      points.push({
        x,
        y,
        pressure: 0.5,
        timestamp: Date.now()
      });
    }
    
    return points;
  }

  // Optimization methods
  private optimizePoints(points: StitchPoint[], config: StitchGenerationConfig): StitchPoint[] {
    if (config.quality === 'low') {
      return this.reducePoints(points, 0.5);
    } else if (config.quality === 'ultra') {
      return this.enhancePoints(points);
    }
    
    return points;
  }

  private reducePoints(points: StitchPoint[], factor: number): StitchPoint[] {
    const step = Math.max(1, Math.floor(1 / factor));
    return points.filter((_, index) => index % step === 0);
  }

  private enhancePoints(points: StitchPoint[]): StitchPoint[] {
    if (points.length < 2) return points;
    
    const enhanced: StitchPoint[] = [points[0]];
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      // Add intermediate points for smoother curves
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      const midPressure = (prev.pressure + curr.pressure) / 2;
      
      enhanced.push({
        x: midX,
        y: midY,
        pressure: midPressure,
        timestamp: Date.now()
      });
      
      enhanced.push(curr);
    }
    
    return enhanced;
  }

  private calculateLength(points: StitchPoint[]): number {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i-1].x;
      const dy = points[i].y - points[i-1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  }

  private calculateArea(points: StitchPoint[]): number {
    if (points.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
  }

  private calculateComplexity(points: StitchPoint[]): number {
    if (points.length < 2) return 0;
    
    let complexity = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i-1].x;
      const dy = points[i].y - points[i-1].y;
      const angle = Math.atan2(dy, dx);
      
      if (i > 1) {
        const prevDx = points[i-1].x - points[i-2].x;
        const prevDy = points[i-1].y - points[i-2].y;
        const prevAngle = Math.atan2(prevDy, prevDx);
        
        const angleDiff = Math.abs(angle - prevAngle);
        complexity += Math.min(angleDiff, Math.PI * 2 - angleDiff);
      }
    }
    
    return complexity;
  }

  private calculateQuality(config: StitchGenerationConfig): number {
    let quality = 1.0;
    
    // Adjust based on thread type
    const threadQuality = {
      'cotton': 1.0,
      'silk': 1.2,
      'polyester': 0.9,
      'metallic': 1.1,
      'glow': 1.0,
      'variegated': 1.1
    };
    
    quality *= threadQuality[config.threadType as keyof typeof threadQuality] || 1.0;
    
    // Adjust based on quality setting
    const qualityMultiplier = {
      'low': 0.7,
      'medium': 1.0,
      'high': 1.2,
      'ultra': 1.5
    };
    
    quality *= qualityMultiplier[config.quality || 'medium'];
    
    return Math.min(2.0, quality);
  }

  // Pattern management
  getAvailablePatterns(): PatternTemplate[] {
    return [...this.patterns];
  }

  addCustomPattern(pattern: PatternTemplate) {
    this.patterns.push(pattern);
  }

  removePattern(patternId: string) {
    this.patterns = this.patterns.filter(p => p.id !== patternId);
  }

  // AI management
  setAIEnabled(enabled: boolean) {
    this.aiEnabled = enabled;
  }

  isAIEnabled(): boolean {
    return this.aiEnabled;
  }
}

export default EnhancedStitchGenerator;

