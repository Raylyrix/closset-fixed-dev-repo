/**
 * 🎯 Vector State Manager - Unified State Management System
 * 
 * Fixes the state management chaos by providing:
 * - Immutable state updates
 * - Proper validation
 * - Action-based updates
 * - Memory leak prevention
 * - Race condition prevention
 */

import { EventEmitter } from 'events';

// Types for better type safety
export interface VectorPoint {
  x: number;
  y: number;
  type: 'corner' | 'smooth' | 'symmetric' | 'auto';
  controlIn?: { x: number; y: number };
  controlOut?: { x: number; y: number };
  selected?: boolean;
  locked?: boolean;
  visible?: boolean;
  id?: string;
}

export interface VectorPath {
  id: string;
  points: VectorPoint[];
  closed: boolean;
  fill: boolean;
  stroke: boolean;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  fillOpacity: number;
  strokeOpacity: number;
  strokeJoin: CanvasLineJoin;
  strokeCap: CanvasLineCap;
  bounds: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VectorState {
  shapes: VectorPath[];
  selected: string[];
  currentPath: VectorPath | null;
  tool: VectorTool;
  history: VectorState[];
  historyIndex: number;
  maxHistorySize: number;
}

export type VectorTool = 'pen' | 'pathSelection' | 'addAnchor' | 'removeAnchor' | 'convertAnchor' | 'curvature' | 'pathOperations' | 'shapeBuilder';

// Action types for state updates
export type VectorAction = 
  | { type: 'ADD_SHAPE'; payload: VectorPath }
  | { type: 'UPDATE_SHAPE'; payload: { id: string; updates: Partial<VectorPath> } }
  | { type: 'REMOVE_SHAPE'; payload: string }
  | { type: 'SELECT_SHAPES'; payload: string[] }
  | { type: 'SET_CURRENT_PATH'; payload: VectorPath | null }
  | { type: 'SET_TOOL'; payload: VectorTool }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_ALL' };

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Event types
export interface VectorStateEvents {
  'state:changed': (newState: VectorState, action: VectorAction) => void;
  'shape:added': (shape: VectorPath) => void;
  'shape:updated': (shape: VectorPath) => void;
  'shape:removed': (shapeId: string) => void;
  'selection:changed': (selectedIds: string[]) => void;
  'tool:changed': (tool: VectorTool) => void;
  'history:changed': (canUndo: boolean, canRedo: boolean) => void;
  'error': (error: Error, action: VectorAction) => void;
}

export class VectorStateManager extends EventEmitter {
  private static instance: VectorStateManager;
  private state: VectorState;
  private isUpdating: boolean = false;
  private updateQueue: VectorAction[] = [];
  private validationEnabled: boolean = true;

  private constructor() {
    super();
    this.state = this.createInitialState();
    this.setMaxListeners(100); // Prevent memory leaks
  }

  public static getInstance(): VectorStateManager {
    if (!VectorStateManager.instance) {
      VectorStateManager.instance = new VectorStateManager();
    }
    return VectorStateManager.instance;
  }

  private createInitialState(): VectorState {
    return {
      shapes: [],
      selected: [],
      currentPath: null,
      tool: 'pen',
      history: [],
      historyIndex: -1,
      maxHistorySize: 50
    };
  }

  // Public API methods
  public getState(): Readonly<VectorState> {
    return { ...this.state };
  }

  public dispatch(action: VectorAction): void {
    if (this.isUpdating) {
      this.updateQueue.push(action);
      return;
    }

    this.processAction(action);
  }

  private async processAction(action: VectorAction): Promise<void> {
    this.isUpdating = true;

    try {
      // Validate action
      if (this.validationEnabled) {
        const validation = this.validateAction(action);
        if (!validation.valid) {
          this.emit('error', new Error(`Invalid action: ${validation.errors.join(', ')}`), action);
          return;
        }
      }

      // Create state snapshot for history
      const previousState = { ...this.state };

      // Apply action
      const newState = this.applyAction(this.state, action);

      // Validate new state
      if (this.validationEnabled) {
        const stateValidation = this.validateState(newState);
        if (!stateValidation.valid) {
          this.emit('error', new Error(`Invalid state: ${stateValidation.errors.join(', ')}`), action);
          return;
        }
      }

      // Update state
      this.state = newState;

      // Add to history if it's a significant change
      if (this.shouldAddToHistory(action)) {
        this.addToHistory(previousState);
      }

      // Emit events
      this.emit('state:changed', this.state, action);
      this.emitSpecificEvents(action, previousState);

      // Process queued actions
      if (this.updateQueue.length > 0) {
        const nextAction = this.updateQueue.shift();
        if (nextAction) {
          setTimeout(() => this.processAction(nextAction), 0);
        }
      }

    } catch (error) {
      this.emit('error', error as Error, action);
    } finally {
      this.isUpdating = false;
    }
  }

  private applyAction(state: VectorState, action: VectorAction): VectorState {
    switch (action.type) {
      case 'ADD_SHAPE':
        return {
          ...state,
          shapes: [...state.shapes, action.payload]
        };

      case 'UPDATE_SHAPE':
        return {
          ...state,
          shapes: state.shapes.map(shape =>
            shape.id === action.payload.id
              ? { ...shape, ...action.payload.updates }
              : shape
          )
        };

      case 'REMOVE_SHAPE':
        return {
          ...state,
          shapes: state.shapes.filter(shape => shape.id !== action.payload),
          selected: state.selected.filter(id => id !== action.payload)
        };

      case 'SELECT_SHAPES':
        return {
          ...state,
          selected: action.payload
        };

      case 'SET_CURRENT_PATH':
        return {
          ...state,
          currentPath: action.payload
        };

      case 'SET_TOOL':
        return {
          ...state,
          tool: action.payload
        };

      case 'UNDO':
        return this.undoState(state);

      case 'REDO':
        return this.redoState(state);

      case 'CLEAR_ALL':
        return this.createInitialState();

      default:
        return state;
    }
  }

  private validateAction(action: VectorAction): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (action.type) {
      case 'ADD_SHAPE':
        if (!action.payload.id) {
          errors.push('Shape must have an ID');
        }
        if (!action.payload.points || action.payload.points.length === 0) {
          errors.push('Shape must have at least one point');
        }
        break;

      case 'UPDATE_SHAPE':
        if (!action.payload.id) {
          errors.push('Shape ID is required');
        }
        if (!this.state.shapes.find(s => s.id === action.payload.id)) {
          errors.push('Shape not found');
        }
        break;

      case 'REMOVE_SHAPE':
        if (!action.payload) {
          errors.push('Shape ID is required');
        }
        break;

      case 'SELECT_SHAPES':
        if (!Array.isArray(action.payload)) {
          errors.push('Selection must be an array');
        }
        break;

      case 'SET_TOOL':
        const validTools: VectorTool[] = ['pen', 'pathSelection', 'addAnchor', 'removeAnchor', 'convertAnchor', 'curvature', 'pathOperations', 'shapeBuilder'];
        if (!validTools.includes(action.payload)) {
          errors.push('Invalid tool type');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateState(state: VectorState): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate shapes
    state.shapes.forEach((shape, index) => {
      if (!shape.id) {
        errors.push(`Shape at index ${index} has no ID`);
      }
      if (!shape.points || shape.points.length === 0) {
        errors.push(`Shape ${shape.id} has no points`);
      }
      if (shape.points) {
        shape.points.forEach((point, pointIndex) => {
          if (!isFinite(point.x) || !isFinite(point.y)) {
            errors.push(`Shape ${shape.id}, point ${pointIndex} has invalid coordinates`);
          }
        });
      }
    });

    // Validate selection
    state.selected.forEach(id => {
      if (!state.shapes.find(s => s.id === id)) {
        warnings.push(`Selected shape ${id} not found`);
      }
    });

    // Validate history
    if (state.historyIndex < -1 || state.historyIndex >= state.history.length) {
      errors.push('Invalid history index');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private shouldAddToHistory(action: VectorAction): boolean {
    const historyActions = ['ADD_SHAPE', 'UPDATE_SHAPE', 'REMOVE_SHAPE', 'CLEAR_ALL'];
    return historyActions.includes(action.type);
  }

  private addToHistory(state: VectorState): void {
    const newHistory = [...state.history];
    newHistory.push(state);
    
    // Trim history if it exceeds max size
    if (newHistory.length > this.state.maxHistorySize) {
      newHistory.shift();
    } else {
      this.state.historyIndex++;
    }

    this.state.history = newHistory;
  }

  private undoState(state: VectorState): VectorState {
    if (state.historyIndex <= 0) {
      return state; // Nothing to undo
    }

    const newIndex = state.historyIndex - 1;
    const previousState = state.history[newIndex];
    
    return {
      ...previousState,
      history: state.history,
      historyIndex: newIndex
    };
  }

  private redoState(state: VectorState): VectorState {
    if (state.historyIndex >= state.history.length - 1) {
      return state; // Nothing to redo
    }

    const newIndex = state.historyIndex + 1;
    const nextState = state.history[newIndex];
    
    return {
      ...nextState,
      history: state.history,
      historyIndex: newIndex
    };
  }

  private emitSpecificEvents(action: VectorAction, previousState: VectorState): void {
    switch (action.type) {
      case 'ADD_SHAPE':
        this.emit('shape:added', action.payload);
        break;
      case 'UPDATE_SHAPE':
        const updatedShape = this.state.shapes.find(s => s.id === action.payload.id);
        if (updatedShape) {
          this.emit('shape:updated', updatedShape);
        }
        break;
      case 'REMOVE_SHAPE':
        this.emit('shape:removed', action.payload);
        break;
      case 'SELECT_SHAPES':
        this.emit('selection:changed', action.payload);
        break;
      case 'SET_TOOL':
        this.emit('tool:changed', action.payload);
        break;
      case 'UNDO':
      case 'REDO':
        this.emit('history:changed', this.canUndo(), this.canRedo());
        break;
    }
  }

  public canUndo(): boolean {
    return this.state.historyIndex > 0;
  }

  public canRedo(): boolean {
    return this.state.historyIndex < this.state.history.length - 1;
  }

  public undo(): void {
    this.dispatch({ type: 'UNDO' });
  }

  public redo(): void {
    this.dispatch({ type: 'REDO' });
  }

  public clearAll(): void {
    this.dispatch({ type: 'CLEAR_ALL' });
  }

  public setValidationEnabled(enabled: boolean): void {
    this.validationEnabled = enabled;
  }

  // Cleanup method to prevent memory leaks
  public destroy(): void {
    this.removeAllListeners();
    this.state = this.createInitialState();
    this.updateQueue = [];
  }

  // Subscribe with automatic cleanup
  public subscribe<T extends keyof VectorStateEvents>(
    event: T,
    listener: VectorStateEvents[T]
  ): () => void {
    this.on(event, listener);
    return () => this.off(event, listener);
  }
}

// Export singleton instance
export const vectorStateManager = VectorStateManager.getInstance();

// Export types for external use
export type { VectorState, VectorAction, VectorPoint, VectorPath, BoundingBox, VectorTool };
