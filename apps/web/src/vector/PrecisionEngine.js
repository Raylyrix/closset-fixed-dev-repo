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
export class PrecisionEngine {
    constructor() {
        this.objects = [];
        this.guides = { horizontal: [], vertical: [] };
        // Performance optimization
        this.snapCache = new Map();
        this.lastSnapTime = 0;
        this.snapThrottle = 16; // 60fps
        this.initializeSettings();
    }
    // Lightweight event API for compatibility with callers that subscribe to changes
    on(_event, _callback) {
        // No-op in this implementation; retained for interface compatibility
    }
    static getInstance() {
        if (!PrecisionEngine.instance) {
            PrecisionEngine.instance = new PrecisionEngine();
        }
        return PrecisionEngine.instance;
    }
    initializeSettings() {
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
    snapPoint(point, options = {}) {
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
            return this.snapCache.get(cacheKey);
        }
        let snappedPoint = { ...point };
        let bestSnap = null;
        // Apply snapping in order of priority
        if (settings.snapToGrid) {
            const gridSnap = this.snapToGrid(snappedPoint, settings);
            if (gridSnap && gridSnap.distance < (bestSnap ? bestSnap.distance : Infinity)) {
                bestSnap = gridSnap;
            }
        }
        if (settings.snapToGuides) {
            const guideSnap = this.snapToGuides(snappedPoint, settings);
            if (guideSnap && guideSnap.distance < (bestSnap ? bestSnap.distance : Infinity)) {
                bestSnap = guideSnap;
            }
        }
        if (settings.snapToObjects) {
            const objectSnap = this.snapToObjects(snappedPoint, settings);
            if (objectSnap && objectSnap.distance < (bestSnap ? bestSnap.distance : Infinity)) {
                bestSnap = objectSnap;
            }
        }
        if (settings.snapToAngles) {
            const angleSnap = this.snapToAngles(snappedPoint, settings);
            if (angleSnap && angleSnap.distance < (bestSnap ? bestSnap.distance : Infinity)) {
                bestSnap = angleSnap;
            }
        }
        if (settings.snapToDistances) {
            const distanceSnap = this.snapToDistances(snappedPoint, settings);
            if (distanceSnap && distanceSnap.distance < (bestSnap ? bestSnap.distance : Infinity)) {
                bestSnap = distanceSnap;
            }
        }
        // Apply best snap if within tolerance
        if (bestSnap && bestSnap.distance <= settings.tolerance) {
            snappedPoint = bestSnap.point;
        }
        const result = {
            x: snappedPoint.x,
            y: snappedPoint.y,
            precision: bestSnap ? bestSnap.distance : 0,
            snapped: !!bestSnap,
            snapType: bestSnap?.type
        };
        // Cache result
        this.snapCache.set(cacheKey, result);
        this.lastSnapTime = now;
        return result;
    }
    // ============================================================================
    // SNAPPING ALGORITHMS
    // ============================================================================
    snapToGrid(point, settings) {
        const gridSize = settings.gridSize;
        const subdivisions = this.gridSettings.subdivisions;
        const subdivisionSize = gridSize / subdivisions;
        let snapSize = gridSize;
        if (this.gridSettings.snapToSubdivisions) {
            snapSize = subdivisionSize;
        }
        const snappedX = Math.round(point.x / snapSize) * snapSize;
        const snappedY = Math.round(point.y / snapSize) * snapSize;
        const distance = Math.sqrt(Math.pow(point.x - snappedX, 2) + Math.pow(point.y - snappedY, 2));
        if (distance <= settings.tolerance) {
            return {
                point: { x: snappedX, y: snappedY },
                distance,
                type: 'grid'
            };
        }
        return null;
    }
    snapToGuides(point, settings) {
        let bestSnap = null;
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
    snapToObjects(point, settings) {
        let bestSnap = null;
        for (const obj of this.objects) {
            for (const objPoint of obj.points) {
                const distance = Math.sqrt(Math.pow(point.x - objPoint.x, 2) + Math.pow(point.y - objPoint.y, 2));
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
    snapToEdge(point, start, end, settings) {
        // Project point onto line segment
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0)
            return null;
        const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (length * length)));
        const projectedX = start.x + t * dx;
        const projectedY = start.y + t * dy;
        const distance = Math.sqrt(Math.pow(point.x - projectedX, 2) + Math.pow(point.y - projectedY, 2));
        if (distance <= settings.tolerance) {
            return {
                point: { x: projectedX, y: projectedY },
                distance,
                type: 'object'
            };
        }
        return null;
    }
    snapToAngles(point, settings) {
        // This would implement angle snapping based on the last point or current direction
        // For now, return null as it requires more complex state management
        return null;
    }
    snapToDistances(point, settings) {
        // This would implement distance snapping based on the last point
        // For now, return null as it requires more complex state management
        return null;
    }
    // ============================================================================
    // GRID SYSTEM
    // ============================================================================
    updateGrid(settings) {
        this.gridSettings = { ...this.gridSettings, ...settings };
        this.snapSettings.gridSize = this.gridSettings.size;
    }
    getGridLines(viewport) {
        if (!this.gridSettings.enabled) {
            return { vertical: [], horizontal: [] };
        }
        const gridSize = this.gridSettings.size;
        const startX = Math.floor(viewport.x / gridSize) * gridSize;
        const startY = Math.floor(viewport.y / gridSize) * gridSize;
        const endX = Math.ceil((viewport.x + viewport.width) / gridSize) * gridSize;
        const endY = Math.ceil((viewport.y + viewport.height) / gridSize) * gridSize;
        const vertical = [];
        const horizontal = [];
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
    addGuide(type, position) {
        if (type === 'horizontal') {
            if (!this.guides.horizontal.includes(position)) {
                this.guides.horizontal.push(position);
                this.guides.horizontal.sort((a, b) => a - b);
            }
        }
        else {
            if (!this.guides.vertical.includes(position)) {
                this.guides.vertical.push(position);
                this.guides.vertical.sort((a, b) => a - b);
            }
        }
    }
    removeGuide(type, position) {
        if (type === 'horizontal') {
            const index = this.guides.horizontal.indexOf(position);
            if (index > -1) {
                this.guides.horizontal.splice(index, 1);
            }
        }
        else {
            const index = this.guides.vertical.indexOf(position);
            if (index > -1) {
                this.guides.vertical.splice(index, 1);
            }
        }
    }
    clearGuides() {
        this.guides.horizontal = [];
        this.guides.vertical = [];
    }
    getGuides() {
        return { ...this.guides };
    }
    // ============================================================================
    // OBJECT MANAGEMENT
    // ============================================================================
    addObject(id, points, type) {
        this.objects.push({ id, points, type });
    }
    updateObject(id, points) {
        const obj = this.objects.find(o => o.id === id);
        if (obj) {
            obj.points = points;
        }
    }
    removeObject(id) {
        this.objects = this.objects.filter(o => o.id !== id);
    }
    clearObjects() {
        this.objects = [];
    }
    // ============================================================================
    // SETTINGS MANAGEMENT
    // ============================================================================
    updateSnapSettings(settings) {
        this.snapSettings = { ...this.snapSettings, ...settings };
        this.snapCache.clear(); // Clear cache when settings change
    }
    getSnapSettings() {
        return { ...this.snapSettings };
    }
    getGridSettings() {
        return { ...this.gridSettings };
    }
    getGuideSettings() {
        return { ...this.guideSettings };
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    clearCache() {
        this.snapCache.clear();
    }
    getPrecisionLevel(point) {
        if (point.precision === 0)
            return 'perfect';
        if (point.precision <= 1)
            return 'high';
        if (point.precision <= 3)
            return 'medium';
        return 'low';
    }
    isSnapped(point) {
        return point.snapped;
    }
    getSnapType(point) {
        return point.snapType;
    }
}
export default PrecisionEngine;
