/**
 * 🎯 Advanced Hit Detector - Robust Hit Detection System
 *
 * Fixes anchor point hit detection issues by providing:
 * - Multi-level hit detection
 * - Visual feedback for hit areas
 * - Tolerance-based selection
 * - Performance optimization
 */
export class AdvancedHitDetector {
    constructor() {
        // Hit area cache for performance
        this.hitAreaCache = new Map();
        this.lastZoom = 1;
        this.lastTolerance = 10;
        // Visual feedback settings
        this.visualFeedbackEnabled = true;
        this.hitAreaVisualizations = new Map();
        // Performance tracking
        this.hitDetectionStats = {
            totalHits: 0,
            averageDetectionTime: 0,
            cacheHits: 0,
            lastDetectionTime: 0
        };
    }
    static getInstance() {
        if (!AdvancedHitDetector.instance) {
            AdvancedHitDetector.instance = new AdvancedHitDetector();
        }
        return AdvancedHitDetector.instance;
    }
    /**
     * Main hit detection method
     */
    detectHit(point, shapes, options) {
        const startTime = performance.now();
        try {
            // Update tolerance based on zoom
            const effectiveTolerance = this.calculateEffectiveTolerance(options.tolerance, options.zoom);
            // Check cache first
            const cacheKey = this.generateCacheKey(shapes, effectiveTolerance);
            let hitAreas = this.hitAreaCache.get(cacheKey);
            if (!hitAreas) {
                hitAreas = this.generateHitAreas(shapes, effectiveTolerance);
                this.hitAreaCache.set(cacheKey, hitAreas);
            }
            else {
                this.hitDetectionStats.cacheHits++;
            }
            // Find closest hit
            const closestHit = this.findClosestHit(point, hitAreas, effectiveTolerance);
            // Generate visual feedback
            const visualFeedback = this.generateVisualFeedback(closestHit, options);
            // Update stats
            const detectionTime = performance.now() - startTime;
            this.updateHitDetectionStats(detectionTime);
            return {
                type: closestHit?.type || 'none',
                target: closestHit?.target || {},
                distance: closestHit?.distance || Infinity,
                confidence: closestHit?.confidence || 0,
                visualFeedback
            };
        }
        catch (error) {
            console.error('Hit detection error:', error);
            return {
                type: 'none',
                target: {},
                distance: Infinity,
                confidence: 0,
                visualFeedback: this.createEmptyVisualFeedback()
            };
        }
    }
    /**
     * Generate hit areas for all shapes
     */
    generateHitAreas(shapes, tolerance) {
        const hitAreas = [];
        shapes.forEach(shape => {
            // Generate anchor point hit areas
            shape.points.forEach((point, index) => {
                hitAreas.push({
                    type: 'anchor',
                    bounds: this.createAnchorHitBounds(point, tolerance),
                    priority: 100, // Highest priority
                    data: {
                        shapeId: shape.id,
                        pointIndex: index,
                        point
                    }
                });
                // Generate control handle hit areas
                if (point.controlIn) {
                    hitAreas.push({
                        type: 'control',
                        bounds: this.createControlHitBounds(point, 'in', tolerance),
                        priority: 90,
                        data: {
                            shapeId: shape.id,
                            pointIndex: index,
                            controlType: 'in',
                            point
                        }
                    });
                }
                if (point.controlOut) {
                    hitAreas.push({
                        type: 'control',
                        bounds: this.createControlHitBounds(point, 'out', tolerance),
                        priority: 90,
                        data: {
                            shapeId: shape.id,
                            pointIndex: index,
                            controlType: 'out',
                            point
                        }
                    });
                }
            });
            // Generate path segment hit areas
            for (let i = 0; i < shape.points.length - 1; i++) {
                hitAreas.push({
                    type: 'path',
                    bounds: this.createPathSegmentHitBounds(shape.points[i], shape.points[i + 1], tolerance),
                    priority: 50,
                    data: {
                        shapeId: shape.id,
                        pathSegment: i,
                        startPoint: shape.points[i],
                        endPoint: shape.points[i + 1]
                    }
                });
            }
        });
        return hitAreas;
    }
    /**
     * Find closest hit to the given point
     */
    findClosestHit(point, hitAreas, tolerance) {
        let closestHit = null;
        let minDistance = Infinity;
        for (const hitArea of hitAreas) {
            const distance = this.calculateDistanceToHitArea(point, hitArea);
            if (distance <= tolerance && distance < minDistance) {
                const confidence = this.calculateConfidence(distance, tolerance, hitArea);
                closestHit = {
                    type: hitArea.type,
                    target: {
                        shapeId: hitArea.data.shapeId,
                        pointIndex: hitArea.data.pointIndex,
                        controlType: hitArea.data.controlType,
                        pathSegment: hitArea.data.pathSegment
                    },
                    distance,
                    confidence,
                    visualFeedback: this.createEmptyVisualFeedback() // Will be filled later
                };
                minDistance = distance;
            }
        }
        return closestHit;
    }
    /**
     * Calculate distance from point to hit area
     */
    calculateDistanceToHitArea(point, hitArea) {
        const bounds = hitArea.bounds;
        switch (hitArea.type) {
            case 'anchor':
                return this.distanceToPoint(point, {
                    x: bounds.x + bounds.width / 2,
                    y: bounds.y + bounds.height / 2
                });
            case 'control':
                return this.distanceToPoint(point, {
                    x: bounds.x + bounds.width / 2,
                    y: bounds.y + bounds.height / 2
                });
            case 'path':
                return this.distanceToLineSegment(point, hitArea.data.startPoint, hitArea.data.endPoint);
            default:
                return Infinity;
        }
    }
    /**
     * Calculate confidence score for hit
     */
    calculateConfidence(distance, tolerance, hitArea) {
        const normalizedDistance = Math.min(distance / tolerance, 1);
        const baseConfidence = 1 - normalizedDistance;
        const priorityBonus = hitArea.priority / 100;
        return Math.min(baseConfidence + priorityBonus, 1);
    }
    /**
     * Generate visual feedback for hit result
     */
    generateVisualFeedback(hit, options) {
        if (!hit || hit.type === 'none') {
            return this.createEmptyVisualFeedback();
        }
        if (!options.showHitAreas) {
            return this.createEmptyVisualFeedback();
        }
        switch (hit.type) {
            case 'anchor':
                return this.createAnchorVisualFeedback(hit);
            case 'control':
                return this.createControlVisualFeedback(hit);
            case 'path':
                return this.createPathVisualFeedback(hit);
            default:
                return this.createEmptyVisualFeedback();
        }
    }
    /**
     * Create anchor point hit bounds
     */
    createAnchorHitBounds(point, tolerance) {
        const radius = Math.max(tolerance, 8); // Minimum 8px radius
        return {
            x: point.x - radius,
            y: point.y - radius,
            width: radius * 2,
            height: radius * 2
        };
    }
    /**
     * Create control handle hit bounds
     */
    createControlHitBounds(point, controlType, tolerance) {
        const control = controlType === 'in' ? point.controlIn : point.controlOut;
        if (!control) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        const radius = Math.max(tolerance, 6); // Slightly smaller than anchor points
        return {
            x: point.x + control.x - radius,
            y: point.y + control.y - radius,
            width: radius * 2,
            height: radius * 2
        };
    }
    /**
     * Create path segment hit bounds
     */
    createPathSegmentHitBounds(start, end, tolerance) {
        const minX = Math.min(start.x, end.x) - tolerance;
        const minY = Math.min(start.y, end.y) - tolerance;
        const maxX = Math.max(start.x, end.x) + tolerance;
        const maxY = Math.max(start.y, end.y) + tolerance;
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    /**
     * Create anchor point visual feedback
     */
    createAnchorVisualFeedback(hit) {
        return {
            type: 'circle',
            x: 0, // Will be set by caller
            y: 0, // Will be set by caller
            radius: 8,
            color: '#10B981',
            opacity: 0.8,
            stroke: {
                color: '#ffffff',
                width: 2
            }
        };
    }
    /**
     * Create control handle visual feedback
     */
    createControlVisualFeedback(hit) {
        return {
            type: 'circle',
            x: 0, // Will be set by caller
            y: 0, // Will be set by caller
            radius: 6,
            color: '#9CA3AF',
            opacity: 0.8,
            stroke: {
                color: '#ffffff',
                width: 1
            }
        };
    }
    /**
     * Create path segment visual feedback
     */
    createPathVisualFeedback(hit) {
        return {
            type: 'line',
            x: 0, // Will be set by caller
            y: 0, // Will be set by caller
            color: '#3B82F6',
            opacity: 0.6,
            stroke: {
                color: '#3B82F6',
                width: 2
            }
        };
    }
    /**
     * Create empty visual feedback
     */
    createEmptyVisualFeedback() {
        return {
            type: 'circle',
            x: 0,
            y: 0,
            radius: 0,
            color: 'transparent',
            opacity: 0
        };
    }
    /**
     * Calculate effective tolerance based on zoom
     */
    calculateEffectiveTolerance(tolerance, zoom) {
        return Math.max(tolerance / zoom, 4); // Minimum 4px tolerance
    }
    /**
     * Generate cache key for hit areas
     */
    generateCacheKey(shapes, tolerance) {
        return `${shapes.map(s => s.id).join(',')}-${tolerance}`;
    }
    /**
     * Calculate distance between two points
     */
    distanceToPoint(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    /**
     * Calculate distance from point to line segment
     */
    distanceToLineSegment(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        if (lenSq === 0) {
            return this.distanceToPoint(point, lineStart);
        }
        let param = dot / lenSq;
        let xx, yy;
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        }
        else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        }
        else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }
        return this.distanceToPoint(point, { x: xx, y: yy });
    }
    /**
     * Update hit detection statistics
     */
    updateHitDetectionStats(detectionTime) {
        this.hitDetectionStats.totalHits++;
        this.hitDetectionStats.lastDetectionTime = detectionTime;
        this.hitDetectionStats.averageDetectionTime =
            (this.hitDetectionStats.averageDetectionTime * (this.hitDetectionStats.totalHits - 1) + detectionTime) /
                this.hitDetectionStats.totalHits;
    }
    /**
     * Clear hit area cache
     */
    clearCache() {
        this.hitAreaCache.clear();
    }
    /**
     * Get hit detection statistics
     */
    getStats() {
        return { ...this.hitDetectionStats };
    }
    /**
     * Set visual feedback enabled
     */
    setVisualFeedbackEnabled(enabled) {
        this.visualFeedbackEnabled = enabled;
    }
    /**
     * Destroy hit detector and clean up resources
     */
    destroy() {
        this.clearCache();
        this.hitAreaVisualizations.clear();
    }
}
export default AdvancedHitDetector;
