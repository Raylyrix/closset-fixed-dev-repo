// Advanced selection tools similar to Photoshop
// Marquee, lasso, magic wand, etc.
import { calculateBoundingBox, pointInPolygon } from './vectorMath';
// Create rectangular marquee selection
export function createRectangularMarquee(start, end, mode = 'replace') {
    return {
        start,
        end,
        type: 'rectangular',
        mode
    };
}
// Create elliptical marquee selection
export function createEllipticalMarquee(start, end, mode = 'replace') {
    return {
        start,
        end,
        type: 'elliptical',
        mode
    };
}
// Create lasso selection
export function createLassoSelection(points, closed = false, mode = 'replace') {
    return {
        points,
        closed,
        mode
    };
}
// Check if point is inside rectangular selection
export function pointInRectangularSelection(point, selection) {
    const minX = Math.min(selection.start.x, selection.end.x);
    const maxX = Math.max(selection.start.x, selection.end.x);
    const minY = Math.min(selection.start.y, selection.end.y);
    const maxY = Math.max(selection.start.y, selection.end.y);
    return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
}
// Check if point is inside elliptical selection
export function pointInEllipticalSelection(point, selection) {
    const centerX = (selection.start.x + selection.end.x) / 2;
    const centerY = (selection.start.y + selection.end.y) / 2;
    const radiusX = Math.abs(selection.end.x - selection.start.x) / 2;
    const radiusY = Math.abs(selection.end.y - selection.start.y) / 2;
    if (radiusX === 0 || radiusY === 0)
        return false;
    const dx = point.x - centerX;
    const dy = point.y - centerY;
    return (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <= 1;
}
// Check if point is inside lasso selection
export function pointInLassoSelection(point, selection) {
    if (selection.points.length < 3)
        return false;
    return pointInPolygon(point, selection.points);
}
// Combine selections based on mode
export function combineSelections(existing, newSelection) {
    const newSel = {
        id: `selection_${Date.now()}`,
        type: 'type' in newSelection ? newSelection.type : 'lasso',
        points: 'points' in newSelection ? newSelection.points : [newSelection.start, newSelection.end],
        bounds: 'points' in newSelection
            ? calculateBoundingBox(newSelection.points)
            : calculateBoundingBox([newSelection.start, newSelection.end]),
        active: true
    };
    switch (newSelection.mode) {
        case 'replace':
            return [newSel];
        case 'add':
            return [...existing, newSel];
        case 'subtract':
            // Remove overlapping selections
            return existing.filter(sel => !selectionsOverlap(sel, newSel));
        case 'intersect':
            // Keep only overlapping selections
            return existing.filter(sel => selectionsOverlap(sel, newSel));
        default:
            return [...existing, newSel];
    }
}
// Check if two selections overlap
export function selectionsOverlap(sel1, sel2) {
    return !(sel1.bounds.x + sel1.bounds.width < sel2.bounds.x ||
        sel2.bounds.x + sel2.bounds.width < sel1.bounds.x ||
        sel1.bounds.y + sel1.bounds.height < sel2.bounds.y ||
        sel2.bounds.y + sel2.bounds.height < sel1.bounds.y);
}
// Get all points within selection
export function getPointsInSelection(points, selection) {
    return points.filter(point => {
        switch (selection.type) {
            case 'rectangular':
                return pointInRectangularSelection(point, {
                    start: selection.points[0],
                    end: selection.points[1],
                    type: 'rectangular',
                    mode: 'replace'
                });
            case 'elliptical':
                return pointInEllipticalSelection(point, {
                    start: selection.points[0],
                    end: selection.points[1],
                    type: 'elliptical',
                    mode: 'replace'
                });
            case 'lasso':
            case 'polygonal':
                return pointInLassoSelection(point, {
                    points: selection.points,
                    closed: true,
                    mode: 'replace'
                });
            default:
                return false;
        }
    });
}
// Expand selection by amount
export function expandSelection(selection, amount) {
    const expandedBounds = {
        x: selection.bounds.x - amount,
        y: selection.bounds.y - amount,
        width: selection.bounds.width + amount * 2,
        height: selection.bounds.height + amount * 2
    };
    return {
        ...selection,
        bounds: expandedBounds
    };
}
// Contract selection by amount
export function contractSelection(selection, amount) {
    const contractedBounds = {
        x: selection.bounds.x + amount,
        y: selection.bounds.y + amount,
        width: Math.max(0, selection.bounds.width - amount * 2),
        height: Math.max(0, selection.bounds.height - amount * 2)
    };
    return {
        ...selection,
        bounds: contractedBounds
    };
}
// Invert selection
export function invertSelection(selection, canvasBounds) {
    // Create a selection that covers the entire canvas except the original selection
    const invertedPoints = [
        { x: canvasBounds.x, y: canvasBounds.y },
        { x: canvasBounds.x + canvasBounds.width, y: canvasBounds.y },
        { x: canvasBounds.x + canvasBounds.width, y: canvasBounds.y + canvasBounds.height },
        { x: canvasBounds.x, y: canvasBounds.y + canvasBounds.height }
    ];
    return {
        ...selection,
        points: invertedPoints,
        bounds: canvasBounds
    };
}
// Clear all selections
export function clearSelections() {
    return [];
}
// Select all points
export function selectAll(canvasBounds) {
    return {
        id: `selection_${Date.now()}`,
        type: 'rectangular',
        points: [
            { x: canvasBounds.x, y: canvasBounds.y },
            { x: canvasBounds.x + canvasBounds.width, y: canvasBounds.y + canvasBounds.height }
        ],
        bounds: canvasBounds,
        active: true
    };
}
// Deselect all
export function deselectAll(selections) {
    return selections.map(sel => ({ ...sel, active: false }));
}
// Get active selections
export function getActiveSelections(selections) {
    return selections.filter(sel => sel.active);
}
// Toggle selection
export function toggleSelection(selections, selectionId) {
    return selections.map(sel => sel.id === selectionId ? { ...sel, active: !sel.active } : sel);
}
// Move selection
export function moveSelection(selection, deltaX, deltaY) {
    return {
        ...selection,
        points: selection.points.map(point => ({
            x: point.x + deltaX,
            y: point.y + deltaY
        })),
        bounds: {
            x: selection.bounds.x + deltaX,
            y: selection.bounds.y + deltaY,
            width: selection.bounds.width,
            height: selection.bounds.height
        }
    };
}
// Scale selection
export function scaleSelection(selection, scaleX, scaleY, center) {
    const centerPoint = center || {
        x: selection.bounds.x + selection.bounds.width / 2,
        y: selection.bounds.y + selection.bounds.height / 2
    };
    return {
        ...selection,
        points: selection.points.map(point => ({
            x: centerPoint.x + (point.x - centerPoint.x) * scaleX,
            y: centerPoint.y + (point.y - centerPoint.y) * scaleY
        })),
        bounds: {
            x: centerPoint.x + (selection.bounds.x - centerPoint.x) * scaleX,
            y: centerPoint.y + (selection.bounds.y - centerPoint.y) * scaleY,
            width: selection.bounds.width * scaleX,
            height: selection.bounds.height * scaleY
        }
    };
}
// Rotate selection
export function rotateSelection(selection, angle, center) {
    const centerPoint = center || {
        x: selection.bounds.x + selection.bounds.width / 2,
        y: selection.bounds.y + selection.bounds.height / 2
    };
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        ...selection,
        points: selection.points.map(point => {
            const dx = point.x - centerPoint.x;
            const dy = point.y - centerPoint.y;
            return {
                x: centerPoint.x + dx * cos - dy * sin,
                y: centerPoint.y + dx * sin + dy * cos
            };
        }),
        bounds: calculateBoundingBox(selection.points)
    };
}
