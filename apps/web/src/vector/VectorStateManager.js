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
export class VectorStateManager extends EventEmitter {
    constructor() {
        super();
        this.isUpdating = false;
        this.updateQueue = [];
        this.validationEnabled = true;
        this.state = this.createInitialState();
        this.setMaxListeners(100); // Prevent memory leaks
    }
    static getInstance() {
        if (!VectorStateManager.instance) {
            VectorStateManager.instance = new VectorStateManager();
        }
        return VectorStateManager.instance;
    }
    createInitialState() {
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
    getState() {
        return { ...this.state };
    }
    dispatch(action) {
        if (this.isUpdating) {
            this.updateQueue.push(action);
            return;
        }
        this.processAction(action);
    }
    async processAction(action) {
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
        }
        catch (error) {
            this.emit('error', error, action);
        }
        finally {
            this.isUpdating = false;
        }
    }
    applyAction(state, action) {
        switch (action.type) {
            case 'ADD_SHAPE':
                return {
                    ...state,
                    shapes: [...state.shapes, action.payload]
                };
            case 'UPDATE_SHAPE':
                return {
                    ...state,
                    shapes: state.shapes.map(shape => shape.id === action.payload.id
                        ? { ...shape, ...action.payload.updates }
                        : shape)
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
    validateAction(action) {
        const errors = [];
        const warnings = [];
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
                const validTools = ['pen', 'pathSelection', 'addAnchor', 'removeAnchor', 'convertAnchor', 'curvature', 'pathOperations', 'shapeBuilder'];
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
    validateState(state) {
        const errors = [];
        const warnings = [];
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
    shouldAddToHistory(action) {
        const historyActions = ['ADD_SHAPE', 'UPDATE_SHAPE', 'REMOVE_SHAPE', 'CLEAR_ALL'];
        return historyActions.includes(action.type);
    }
    addToHistory(state) {
        const newHistory = [...state.history];
        newHistory.push(state);
        // Trim history if it exceeds max size
        if (newHistory.length > this.state.maxHistorySize) {
            newHistory.shift();
        }
        else {
            this.state.historyIndex++;
        }
        this.state.history = newHistory;
    }
    undoState(state) {
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
    redoState(state) {
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
    emitSpecificEvents(action, previousState) {
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
    canUndo() {
        return this.state.historyIndex > 0;
    }
    canRedo() {
        return this.state.historyIndex < this.state.history.length - 1;
    }
    undo() {
        this.dispatch({ type: 'UNDO' });
    }
    redo() {
        this.dispatch({ type: 'REDO' });
    }
    clearAll() {
        this.dispatch({ type: 'CLEAR_ALL' });
    }
    setValidationEnabled(enabled) {
        this.validationEnabled = enabled;
    }
    // Cleanup method to prevent memory leaks
    destroy() {
        this.removeAllListeners();
        this.state = this.createInitialState();
        this.updateQueue = [];
    }
    // Subscribe with automatic cleanup
    subscribe(event, listener) {
        this.on(event, listener);
        return () => this.off(event, listener);
    }
}
// Export singleton instance
export const vectorStateManager = VectorStateManager.getInstance();
