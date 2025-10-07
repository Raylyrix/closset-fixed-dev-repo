import { vectorStore } from './vectorState';
import { performanceOrchestrator } from '../utils/perf/PerformanceOrchestrator';

/**
 * Vector Line Subtool - Two-anchor creation with immediate commit
 */
export class VectorLineSubtool {
  constructor() {
    this.isActive = false;
    this.firstAnchor = null;
    this.previewLine = null;
    this.shiftPressed = false;
    this.altPressed = false;
  }

  activate() {
    this.isActive = true;
    this.firstAnchor = null;
    this.previewLine = null;
    console.log('VectorLineSubtool: Activated');
  }

  deactivate() {
    this.isActive = false;
    this.firstAnchor = null;
    this.previewLine = null;
    console.log('VectorLineSubtool: Deactivated');
  }

  onPointerDown(point, modifiers = {}) {
    if (!this.isActive) return false;

    this.shiftPressed = modifiers.shift || false;
    this.altPressed = modifiers.alt || false;

    // Apply constraints based on modifiers
    let constrainedPoint = this.applyConstraints(point);

    if (!this.firstAnchor) {
      // First anchor - start line creation
      this.firstAnchor = constrainedPoint;
      console.log('VectorLineSubtool: First anchor set at', constrainedPoint);
      return true;
    } else {
      // Second anchor - complete line and commit immediately
      const secondAnchor = constrainedPoint;
      this.commitLine(this.firstAnchor, secondAnchor);
      
      // Reset for next line
      this.firstAnchor = null;
      this.previewLine = null;
      
      console.log('VectorLineSubtool: Line completed and committed');
      return true;
    }
  }

  onPointerMove(point) {
    if (!this.isActive || !this.firstAnchor) return false;

    // Apply constraints for preview
    let constrainedPoint = this.applyConstraints(point);
    
    // Update preview line
    this.previewLine = {
      start: this.firstAnchor,
      end: constrainedPoint
    };

    // Trigger preview render with debouncing
    this.requestPreviewRender();
    return true;
  }

  applyConstraints(point) {
    let constrainedPoint = { ...point };

    if (this.shiftPressed && this.firstAnchor) {
      // Shift: Constrain to 45-degree angles
      const dx = point.x - this.firstAnchor.x;
      const dy = point.y - this.firstAnchor.y;
      const angle = Math.atan2(dy, dx);
      const constrainedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      constrainedPoint.x = this.firstAnchor.x + Math.cos(constrainedAngle) * distance;
      constrainedPoint.y = this.firstAnchor.y + Math.sin(constrainedAngle) * distance;
    }

    if (this.altPressed && this.firstAnchor) {
      // Alt: Draw from center (first anchor becomes center point)
      const dx = point.x - this.firstAnchor.x;
      const dy = point.y - this.firstAnchor.y;
      
      constrainedPoint = {
        start: {
          x: this.firstAnchor.x - dx,
          y: this.firstAnchor.y - dy
        },
        end: {
          x: this.firstAnchor.x + dx,
          y: this.firstAnchor.y + dy
        }
      };
    }

    return constrainedPoint;
  }

  commitLine(start, end) {
    const appState = window.useApp?.getState?.() || {};
    
    // Create line path with two points
    const linePath = {
      id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      points: [
        { x: start.x, y: start.y, type: 'corner' },
        { x: end.x, y: end.y, type: 'corner' }
      ],
      closed: false,
      fill: false,
      stroke: true,
      fillColor: appState.brushColor || '#000000',
      strokeColor: appState.brushColor || '#000000',
      strokeWidth: Math.max(1, Math.round(appState.brushSize || 2)),
      strokeOpacity: 1.0,
      strokeJoin: 'round',
      strokeCap: 'round'
    };

    // Calculate bounds
    const bounds = {
      minX: Math.min(start.x, end.x),
      minY: Math.min(start.y, end.y),
      maxX: Math.max(start.x, end.x),
      maxY: Math.max(start.y, end.y)
    };

    // Create shape object
    const shape = {
      id: `shape_${Date.now()}`,
      type: 'line',
      path: linePath,
      tool: 'vectorLine',
      bounds
    };

    // Add to vector store
    const currentState = vectorStore.getState();
    vectorStore.setState({
      shapes: [...currentState.shapes, shape],
      selected: [shape.id],
      currentPath: null
    });

    // Immediate commit to active layer
    this.renderToActiveLayer(shape);
    
    console.log('VectorLineSubtool: Line committed with shape ID', shape.id);
  }

  renderToActiveLayer(shape) {
    const appState = window.useApp?.getState?.() || {};
    const activeLayer = appState.getActiveLayer?.() || null;
    
    if (!activeLayer || !activeLayer.canvas) {
      console.warn('VectorLineSubtool: No active layer for rendering');
      return;
    }

    const ctx = activeLayer.canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.strokeStyle = shape.path.strokeColor;
    ctx.lineWidth = shape.path.strokeWidth;
    ctx.lineCap = shape.path.strokeCap;
    ctx.lineJoin = shape.path.strokeJoin;
    ctx.globalAlpha = shape.path.strokeOpacity;

    // Draw line
    ctx.beginPath();
    const points = shape.path.points;
    if (points.length >= 2) {
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();
    }

    ctx.restore();

    // Request composition update
    if (appState.requestCompose) {
      appState.requestCompose();
    }
  }

  requestPreviewRender() {
    const debounceSettings = performanceOrchestrator.getDebounceSettings();
    
    if (this.previewRenderTimer) {
      clearTimeout(this.previewRenderTimer);
    }
    
    this.previewRenderTimer = setTimeout(() => {
      this.renderPreview();
    }, debounceSettings.vectorRenderDelay);
  }

  renderPreview() {
    if (!this.previewLine) return;

    // Emit custom event for preview rendering
    window.dispatchEvent(new CustomEvent('vectorLinePreview', {
      detail: {
        line: this.previewLine,
        modifiers: {
          shift: this.shiftPressed,
          alt: this.altPressed
        }
      }
    }));
  }

  onKeyDown(event) {
    if (event.key === 'Shift') {
      this.shiftPressed = true;
    }
    if (event.key === 'Alt') {
      this.altPressed = true;
    }
  }

  onKeyUp(event) {
    if (event.key === 'Shift') {
      this.shiftPressed = false;
    }
    if (event.key === 'Alt') {
      this.altPressed = false;
    }
    if (event.key === 'Escape') {
      // Cancel current line creation
      this.firstAnchor = null;
      this.previewLine = null;
      console.log('VectorLineSubtool: Line creation cancelled');
    }
  }
}

// Global instance
export const vectorLineSubtool = new VectorLineSubtool();
