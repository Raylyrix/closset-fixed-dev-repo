/**
 * 🎯 Professional Vector System Integration
 *
 * Master integration system that combines all professional vector tools:
 * - ProfessionalVectorTools
 * - PrecisionEngine
 * - UndoRedoSystem
 * - SelectionSystem
 * - Professional UI components
 *
 * Provides a unified API for professional-grade vector editing
 */
import { ProfessionalVectorTools } from './ProfessionalVectorTools';
import { PrecisionEngine } from './PrecisionEngine';
import { UndoRedoSystem } from './UndoRedoSystem';
import { SelectionSystem } from './SelectionSystem';
export class ProfessionalVectorSystem {
    constructor() {
        this.eventListeners = new Map();
        // Performance monitoring
        this.performanceMetrics = {
            renderTime: 0,
            frameRate: 60,
            memoryUsage: 0,
            lastUpdate: 0
        };
        this.initializeConfig();
        this.initializeSystems();
        this.setupEventHandlers();
        this.startPerformanceMonitoring();
    }
    static getInstance() {
        if (!ProfessionalVectorSystem.instance) {
            ProfessionalVectorSystem.instance = new ProfessionalVectorSystem();
        }
        return ProfessionalVectorSystem.instance;
    }
    initializeConfig() {
        this.config = {
            precision: {
                snapTolerance: 5,
                gridSize: 20,
                showGrid: true,
                showGuides: true,
                showRulers: true
            },
            performance: {
                renderThrottle: 16, // 60fps
                maxHistorySize: 100,
                maxMemoryUsage: 50 * 1024 * 1024, // 50MB
                enableCaching: true
            },
            ui: {
                showTooltips: true,
                showKeyboardShortcuts: true,
                theme: 'light',
                compactMode: false
            }
        };
    }
    initializeSystems() {
        this.vectorTools = ProfessionalVectorTools.getInstance();
        this.precisionEngine = PrecisionEngine.getInstance();
        this.undoRedoSystem = UndoRedoSystem.getInstance();
        this.selectionSystem = SelectionSystem.getInstance();
        // Initialize with default state
        this.currentState = {
            paths: [],
            currentPath: null,
            selected: [],
            tool: 'select',
            showAnchorPoints: true,
            showGuides: true,
            showGrid: true,
            snapToGrid: true,
            snapToGuides: true,
            snapToObjects: true
        };
    }
    setupEventHandlers() {
        // Tool changes
        this.vectorTools.on('tool:changed', (data) => {
            this.currentState.tool = data.tool;
            this.emit('tool:changed', data);
        });
        // Selection changes
        this.selectionSystem.on('selection:changed', (data) => {
            this.currentState.selected = data.selectedIds;
            this.emit('selection:changed', data);
        });
        // Undo/Redo changes
        this.undoRedoSystem.on('state:updated', (data) => {
            this.emit('undoRedo:changed', data);
        });
        // Precision changes
        this.precisionEngine.on('precision:changed', (data) => {
            this.emit('precision:changed', data);
        });
    }
    startPerformanceMonitoring() {
        const monitor = () => {
            const now = performance.now();
            const deltaTime = now - this.performanceMetrics.lastUpdate;
            if (deltaTime >= 1000) { // Update every second
                this.performanceMetrics.frameRate = Math.round(1000 / deltaTime);
                this.performanceMetrics.memoryUsage = this.undoRedoSystem.getMemoryUsage();
                this.performanceMetrics.lastUpdate = now;
                this.emit('performance:updated', this.performanceMetrics);
            }
            requestAnimationFrame(monitor);
        };
        requestAnimationFrame(monitor);
    }
    // ============================================================================
    // PUBLIC API - TOOL OPERATIONS
    // ============================================================================
    setTool(tool) {
        const result = this.vectorTools.setTool(tool);
        if (result.success) {
            this.currentState.tool = tool;
            this.emit('state:changed', { tool });
            return true;
        }
        return false;
    }
    getCurrentTool() {
        return this.vectorTools.getState().activeTool;
    }
    // ============================================================================
    // PUBLIC API - SELECTION OPERATIONS
    // ============================================================================
    selectPath(pathId, mode = 'replace') {
        const result = this.selectionSystem.selectElement(pathId, mode);
        if (result) {
            this.currentState.selected = this.selectionSystem.getSelectedIds();
            this.emit('state:changed', { selection: this.currentState.selected });
            return true;
        }
        return false;
    }
    selectAll() {
        const result = this.selectionSystem.selectAll();
        if (result) {
            this.currentState.selected = this.selectionSystem.getSelectedIds();
            this.emit('state:changed', { selection: this.currentState.selected });
            return true;
        }
        return false;
    }
    clearSelection() {
        this.selectionSystem.clearSelection();
        this.currentState.selected = [];
        this.emit('state:changed', { selection: [] });
        return true;
    }
    getSelectedPaths() {
        return this.selectionSystem.getSelectedIds();
    }
    // ============================================================================
    // PUBLIC API - PATH OPERATIONS
    // ============================================================================
    createPath(path) {
        // Add to current state
        this.currentState.paths.push(path);
        // Add to selection system
        this.selectionSystem.addElement({
            id: path.id,
            type: 'path',
            bounds: this.calculatePathBounds(path),
            data: path,
            selected: false,
            locked: false,
            visible: true
        });
        // Save state for undo/redo
        this.saveState();
        this.emit('path:created', { path });
        return true;
    }
    updatePath(pathId, updates) {
        const pathIndex = this.currentState.paths.findIndex(p => p.id === pathId);
        if (pathIndex === -1)
            return false;
        // Update in current state
        this.currentState.paths[pathIndex] = { ...this.currentState.paths[pathIndex], ...updates };
        // Update in selection system
        this.selectionSystem.updateElement(pathId, {
            bounds: this.calculatePathBounds(this.currentState.paths[pathIndex]),
            data: this.currentState.paths[pathIndex]
        });
        // Save state for undo/redo
        this.saveState();
        this.emit('path:updated', { pathId, path: this.currentState.paths[pathIndex] });
        return true;
    }
    deletePath(pathId) {
        const pathIndex = this.currentState.paths.findIndex(p => p.id === pathId);
        if (pathIndex === -1)
            return false;
        const path = this.currentState.paths[pathIndex];
        // Remove from current state
        this.currentState.paths.splice(pathIndex, 1);
        // Remove from selection system
        this.selectionSystem.removeElement(pathId);
        // Save state for undo/redo
        this.saveState();
        this.emit('path:deleted', { pathId, path });
        return true;
    }
    getPath(pathId) {
        return this.currentState.paths.find(p => p.id === pathId);
    }
    getAllPaths() {
        return [...this.currentState.paths];
    }
    // ============================================================================
    // PUBLIC API - UNDO/REDO OPERATIONS
    // ============================================================================
    undo() {
        const result = this.undoRedoSystem.undo();
        if (result) {
            // Restore state from history
            this.restoreState();
            this.emit('undo:executed', {});
            return true;
        }
        return false;
    }
    redo() {
        const result = this.undoRedoSystem.redo();
        if (result) {
            // Restore state from history
            this.restoreState();
            this.emit('redo:executed', {});
            return true;
        }
        return false;
    }
    canUndo() {
        return this.undoRedoSystem.canUndo();
    }
    canRedo() {
        return this.undoRedoSystem.canRedo();
    }
    // ============================================================================
    // PUBLIC API - PRECISION OPERATIONS
    // ============================================================================
    snapPoint(point) {
        return this.precisionEngine.snapPoint(point);
    }
    setSnapSettings(settings) {
        this.precisionEngine.updateSnapSettings(settings);
    }
    toggleGrid() {
        const showGrid = !this.currentState.showGrid;
        this.currentState.showGrid = showGrid;
        this.precisionEngine.updateGrid({ enabled: showGrid });
        this.emit('grid:toggled', { showGrid });
    }
    toggleGuides() {
        const showGuides = !this.currentState.showGuides;
        this.currentState.showGuides = showGuides;
        this.emit('guides:toggled', { showGuides });
    }
    // ============================================================================
    // PUBLIC API - CONFIGURATION
    // ============================================================================
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        // Apply configuration changes
        if (config.precision) {
            this.precisionEngine.updateSnapSettings(config.precision);
        }
        if (config.performance) {
            this.undoRedoSystem.setMaxHistorySize(config.performance.maxHistorySize);
            this.undoRedoSystem.setMaxMemoryUsage(config.performance.maxMemoryUsage);
        }
        this.emit('config:updated', { config: this.config });
    }
    getConfig() {
        return { ...this.config };
    }
    // ============================================================================
    // PUBLIC API - STATE MANAGEMENT
    // ============================================================================
    getState() {
        const toolState = this.vectorTools.getState();
        const selectionState = this.selectionSystem.getState();
        const undoRedoState = this.undoRedoSystem.getState();
        const precisionState = this.precisionEngine.getSnapSettings();
        return {
            tool: toolState.activeTool,
            selection: {
                count: selectionState.selectedIds.size,
                ids: Array.from(selectionState.selectedIds),
                bounds: selectionState.selectionBox
            },
            undoRedo: {
                canUndo: undoRedoState.canUndo,
                canRedo: undoRedoState.canRedo,
                historySize: undoRedoState.history.length
            },
            precision: {
                snapEnabled: precisionState.enabled,
                gridEnabled: precisionState.gridSnap,
                guidesEnabled: precisionState.guideSnap
            },
            performance: {
                memoryUsage: this.performanceMetrics.memoryUsage,
                renderTime: this.performanceMetrics.renderTime,
                frameRate: this.performanceMetrics.frameRate
            }
        };
    }
    // ============================================================================
    // INTERNAL METHODS
    // ============================================================================
    calculatePathBounds(path) {
        if (path.points.length === 0) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const point of path.points) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    saveState() {
        this.undoRedoSystem.saveState(this.currentState);
    }
    restoreState() {
        // This would restore the state from the undo/redo system
        // Implementation depends on how the state is stored
    }
    // ============================================================================
    // EVENT SYSTEM
    // ============================================================================
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }
    off(event, callback) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                }
                catch (error) {
                    console.error(`Error in ProfessionalVectorSystem event listener for ${event}:`, error);
                }
            });
        }
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    exportState() {
        return JSON.stringify({
            paths: this.currentState.paths,
            config: this.config,
            timestamp: Date.now()
        });
    }
    importState(stateJson) {
        try {
            const state = JSON.parse(stateJson);
            // Validate state structure
            if (!state.paths || !Array.isArray(state.paths)) {
                throw new Error('Invalid state format');
            }
            // Clear current state
            this.currentState.paths = [];
            this.selectionSystem.clearSelection();
            // Import paths
            for (const path of state.paths) {
                this.createPath(path);
            }
            // Import configuration
            if (state.config) {
                this.updateConfig(state.config);
            }
            this.emit('state:imported', { pathCount: state.paths.length });
            return true;
        }
        catch (error) {
            console.error('Error importing state:', error);
            this.emit('state:importError', { error });
            return false;
        }
    }
    clearAll() {
        this.currentState.paths = [];
        this.currentState.selected = [];
        this.selectionSystem.clearSelection();
        this.undoRedoSystem.clearHistory();
        this.emit('state:cleared', {});
    }
    getVersion() {
        return '1.0.0';
    }
}
export default ProfessionalVectorSystem;
