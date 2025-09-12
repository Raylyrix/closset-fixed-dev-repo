/**
 * 🎯 Professional Precision Engine
 * 
 * High-precision coordinate system and snapping for professional vector tools
 * Features:
 * - Sub-pixel precision
 * - Advanced snapping algorithms
 * - Grid and guide systems
 * - Object-to-object snapping
 * - Angle and distance constraints
 * - Magnetic snapping
 */

export interface PrecisionPoint {
  x: number;
  y: number;
  precision: number;
  snapped: boolean;
  snapType?: 'grid' | 'guide' | 'object' | 'angle' | 'distance';
}

export interface SnapSettings {
  enabled: boolean;
  tolerance: number;
  snapToGrid: boolean;
  snapToGuides: boolean;
  snapToObjects: boolean;
  snapToAngles: boolean;
  snapToDistances: boolean;
  gridSize: number;
  angleIncrement: number;
  distanceIncrement: number;
  magneticSnap: boolean;
  visualFeedback: boolean;
}

export interface GridSettings {
  enabled: boolean;
  size: number;
  subdivisions: number;
  color: string;
  opacity: number;
  showSubdivisions: boolean;
  snapToSubdivisions: boolean;
}

export interface GuideSettings {
  enabled: boolean;
  horizontal: number[];
  vertical: number[];
  color: string;
  opacity: number;
  snapTolerance: number;
}

export class PrecisionEngine {
  private static instance: PrecisionEngine;
  
  private snapSettings: SnapSettings;
  private gridSettings: GridSettings;
  private guideSettings: GuideSettings;
  private objects: Array<{ id: string; points: PrecisionPoint[]; type: string }> = [];
  private guides: { horizontal: number[]; vertical: number[] } = { horizontal: [], vertical: [] };
  
  // Performance optimization
  private snapCache: Map<string, PrecisionPoint> = new Map();
  private lastSnapTime: number = 0;
  private snapThrottle: number = 16; // 60fps
  
  constructor() {
    this.initializeSettings();
  }
  
  static getInstance(): PrecisionEngine {
    if (!PrecisionEngine.instance) {
      PrecisionEngine.instance = new PrecisionEngine();
    }
    return PrecisionEngine.instance;
  }
  
  private initializeSettings(): void {
    this.snapSettings = {
      enabled: true,
      tolerance: 5,
      snapToGrid: true,
      snapToGuides: true,
      snapToObjects: true,
      snapToAngles: true,
      snapToDistances: true,
      gridSize: 20,
      angleIncrement: 15,
      distanceIncrement: 10,
      magneticSnap: true,
      visualFeedback: true
    };
    
    this.gridSettings = {
      enabled: true,
      size: 20,
      subdivisions: 4,
      color: '#cccccc',
      opacity: 0.5,
      showSubdivisions: true,
      snapToSubdivisions: true
    };
    
    this.guideSettings = {
      enabled: true,
      horizontal: [],
      vertical: [],
      color: '#ff0000',
      opacity: 0.8,
      snapTolerance: 3
    };
  }
  
  // ============================================================================
  // MAIN PRECISION METHODS
  // ============================================================================
  
  snapPoint(point: { x: number; y: number }, options: Partial<SnapSettings> = {}): PrecisionPoint {
    const settings = { ...this.snapSettings, ...options };
    
    if (!settings.enabled) {
      return {
        x: point.x,
        y: point.y,
        precision: 0,
        snapped: false
      };
    }
    
    // Check cache first
    const cacheKey = `${point.x.toFixed(2)}_${point.y.toFixed(2)}_${JSON.stringify(settings)}`;
    const now = Date.now();
    
    if (now - this.lastSnapTime < this.snapThrottle && this.snapCache.has(cacheKey)) {
      return this.snapCache.get(cacheKey)!;
    }
    
    let snappedPoint = { ...point };
    let bestSnap: { point: { x: number; y: number }; distance: number; type: string } | null = null;
    
    // Apply snapping in order of priority
    if (settings.snapToGrid) {
      const gridSnap = this.snapToGrid(snappedPoint, settings);
      if (gridSnap && (!bestSnap || gridSnap.distance < bestSnap.distance)) {
        bestSnap = gridSnap;
      }
    }
    
    if (settings.snapToGuides) {
      const guideSnap = this.snapToGuides(snappedPoint, settings);
      if (guideSnap && (!bestSnap || guideSnap.distance < bestSnap.distance)) {
        bestSnap = guideSnap;
      }
    }
    
    if (settings.snapToObjects) {
      const objectSnap = this.snapToObjects(snappedPoint, settings);
      if (objectSnap && (!bestSnap || objectSnap.distance < bestSnap.distance)) {
        bestSnap = objectSnap;
      }
    }
    
    if (settings.snapToAngles) {
      const angleSnap = this.snapToAngles(snappedPoint, settings);
      if (angleSnap && (!bestSnap || angleSnap.distance < bestSnap.distance)) {
        bestSnap = angleSnap;
      }
    }
    
    if (settings.snapToDistances) {
      const distanceSnap = this.snapToDistances(snappedPoint, settings);
      if (distanceSnap && (!bestSnap || distanceSnap.distance < bestSnap.distance)) {
        bestSnap = distanceSnap;
      }
    }
    
    // Apply best snap if within tolerance
    if (bestSnap && bestSnap.distance <= settings.tolerance) {
      snappedPoint = bestSnap.point;
    }
    
    const result: PrecisionPoint = {
      x: snappedPoint.x,
      y: snappedPoint.y,
      precision: bestSnap ? bestSnap.distance : 0,
      snapped: !!bestSnap,
      snapType: bestSnap?.type as any
    };
    
    // Cache result
    this.snapCache.set(cacheKey, result);
    this.lastSnapTime = now;
    
    return result;
  }
  
  // ============================================================================
  // SNAPPING ALGORITHMS
  // ============================================================================
  
  private snapToGrid(point: { x: number; y: number }, settings: SnapSettings): { point: { x: number; y: number }; distance: number; type: string } | null {
    const gridSize = settings.gridSize;
    const subdivisions = this.gridSettings.subdivisions;
    const subdivisionSize = gridSize / subdivisions;
    
    let snapSize = gridSize;
    if (this.gridSettings.snapToSubdivisions) {
      snapSize = subdivisionSize;
    }
    
    const snappedX = Math.round(point.x / snapSize) * snapSize;
    const snappedY = Math.round(point.y / snapSize) * snapSize;
    
    const distance = Math.sqrt(
      Math.pow(point.x - snappedX, 2) + Math.pow(point.y - snappedY, 2)
    );
    
    if (distance <= settings.tolerance) {
      return {
        point: { x: snappedX, y: snappedY },
        distance,
        type: 'grid'
      };
    }
    
    return null;
  }
  
  private snapToGuides(point: { x: number; y: number }, settings: SnapSettings): { point: { x: number; y: number }; distance: number; type: string } | null {
    let bestSnap: { point: { x: number; y: number }; distance: number; type: string } | null = null;
    
    // Check horizontal guides
    for (const y of this.guides.horizontal) {
      const distance = Math.abs(point.y - y);
      if (distance <= settings.tolerance && (!bestSnap || distance < bestSnap.distance)) {
        bestSnap = {
          point: { x: point.x, y },
          distance,
          type: 'guide'
        };
      }
    }
    
    // Check vertical guides
    for (const x of this.guides.vertical) {
      const distance = Math.abs(point.x - x);
      if (distance <= settings.tolerance && (!bestSnap || distance < bestSnap.distance)) {
        bestSnap = {
          point: { x, y: point.y },
          distance,
          type: 'guide'
        };
      }
    }
    
    return bestSnap;
  }
  
  private snapToObjects(point: { x: number; y: number }, settings: SnapSettings): { point: { x: number; y: number }; distance: number; type: string } | null {
    let bestSnap: { point: { x: number; y: number }; distance: number; type: string } | null = null;
    
    for (const obj of this.objects) {
      for (const objPoint of obj.points) {
        const distance = Math.sqrt(
          Math.pow(point.x - objPoint.x, 2) + Math.pow(point.y - objPoint.y, 2)
        );
        
        if (distance <= settings.tolerance && (!bestSnap || distance < bestSnap.distance)) {
          bestSnap = {
            point: { x: objPoint.x, y: objPoint.y },
            distance,
            type: 'object'
          };
        }
      }
      
      // Also check for edge snapping
      if (obj.points.length >= 2) {
        for (let i = 0; i < obj.points.length - 1; i++) {
          const edgeSnap = this.snapToEdge(point, obj.points[i], obj.points[i + 1], settings);
          if (edgeSnap && (!bestSnap || edgeSnap.distance < bestSnap.distance)) {
            bestSnap = edgeSnap;
          }
        }
      }
    }
    
    return bestSnap;
  }
  
  private snapToEdge(point: { x: number; y: number }, start: PrecisionPoint, end: PrecisionPoint, settings: SnapSettings): { point: { x: number; y: number }; distance: number; type: string } | null {
    // Project point onto line segment
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return null;
    
    const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (length * length)));
    const projectedX = start.x + t * dx;
    const projectedY = start.y + t * dy;
    
    const distance = Math.sqrt(
      Math.pow(point.x - projectedX, 2) + Math.pow(point.y - projectedY, 2)
    );
    
    if (distance <= settings.tolerance) {
      return {
        point: { x: projectedX, y: projectedY },
        distance,
        type: 'object'
      };
    }
    
    return null;
  }
  
  private snapToAngles(point: { x: number; y: number }, settings: SnapSettings): { point: { x: number; y: number }; distance: number; type: string } | null {
    // This would implement angle snapping based on the last point or current direction
    // For now, return null as it requires more complex state management
    return null;
  }
  
  private snapToDistances(point: { x: number; y: number }, settings: SnapSettings): { point: { x: number; y: number }; distance: number; type: string } | null {
    // This would implement distance snapping based on the last point
    // For now, return null as it requires more complex state management
    return null;
  }
  
  // ============================================================================
  // GRID SYSTEM
  // ============================================================================
  
  updateGrid(settings: Partial<GridSettings>): void {
    this.gridSettings = { ...this.gridSettings, ...settings };
    this.snapSettings.gridSize = this.gridSettings.size;
  }
  
  getGridLines(viewport: { x: number; y: number; width: number; height: number }): { vertical: number[]; horizontal: number[] } {
    if (!this.gridSettings.enabled) {
      return { vertical: [], horizontal: [] };
    }
    
    const gridSize = this.gridSettings.size;
    const startX = Math.floor(viewport.x / gridSize) * gridSize;
    const startY = Math.floor(viewport.y / gridSize) * gridSize;
    const endX = Math.ceil((viewport.x + viewport.width) / gridSize) * gridSize;
    const endY = Math.ceil((viewport.y + viewport.height) / gridSize) * gridSize;
    
    const vertical: number[] = [];
    const horizontal: number[] = [];
    
    for (let x = startX; x <= endX; x += gridSize) {
      vertical.push(x);
    }
    
    for (let y = startY; y <= endY; y += gridSize) {
      horizontal.push(y);
    }
    
    return { vertical, horizontal };
  }
  
  // ============================================================================
  // GUIDE SYSTEM
  // ============================================================================
  
  addGuide(type: 'horizontal' | 'vertical', position: number): void {
    if (type === 'horizontal') {
      if (!this.guides.horizontal.includes(position)) {
        this.guides.horizontal.push(position);
        this.guides.horizontal.sort((a, b) => a - b);
      }
    } else {
      if (!this.guides.vertical.includes(position)) {
        this.guides.vertical.push(position);
        this.guides.vertical.sort((a, b) => a - b);
      }
    }
  }
  
  removeGuide(type: 'horizontal' | 'vertical', position: number): void {
    if (type === 'horizontal') {
      const index = this.guides.horizontal.indexOf(position);
      if (index > -1) {
        this.guides.horizontal.splice(index, 1);
      }
    } else {
      const index = this.guides.vertical.indexOf(position);
      if (index > -1) {
        this.guides.vertical.splice(index, 1);
      }
    }
  }
  
  clearGuides(): void {
    this.guides.horizontal = [];
    this.guides.vertical = [];
  }
  
  getGuides(): { horizontal: number[]; vertical: number[] } {
    return { ...this.guides };
  }
  
  // ============================================================================
  // OBJECT MANAGEMENT
  // ============================================================================
  
  addObject(id: string, points: PrecisionPoint[], type: string): void {
    this.objects.push({ id, points, type });
  }
  
  updateObject(id: string, points: PrecisionPoint[]): void {
    const obj = this.objects.find(o => o.id === id);
    if (obj) {
      obj.points = points;
    }
  }
  
  removeObject(id: string): void {
    this.objects = this.objects.filter(o => o.id !== id);
  }
  
  clearObjects(): void {
    this.objects = [];
  }
  
  // ============================================================================
  // SETTINGS MANAGEMENT
  // ============================================================================
  
  updateSnapSettings(settings: Partial<SnapSettings>): void {
    this.snapSettings = { ...this.snapSettings, ...settings };
    this.snapCache.clear(); // Clear cache when settings change
  }
  
  getSnapSettings(): SnapSettings {
    return { ...this.snapSettings };
  }
  
  getGridSettings(): GridSettings {
    return { ...this.gridSettings };
  }
  
  getGuideSettings(): GuideSettings {
    return { ...this.guideSettings };
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  clearCache(): void {
    this.snapCache.clear();
  }
  
  getPrecisionLevel(point: PrecisionPoint): 'low' | 'medium' | 'high' | 'perfect' {
    if (point.precision === 0) return 'perfect';
    if (point.precision <= 1) return 'high';
    if (point.precision <= 3) return 'medium';
    return 'low';
  }
  
  isSnapped(point: PrecisionPoint): boolean {
    return point.snapped;
  }
  
  getSnapType(point: PrecisionPoint): string | undefined {
    return point.snapType;
  }
}

export default PrecisionEngine;
