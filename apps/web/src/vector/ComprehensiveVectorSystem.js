/**
 * 🎯 Comprehensive Vector System
 *
 * Master system that integrates all vector tools and fixes all issues:
 * - Click and drag functionality
 * - Precise anchor points
 * - Universal media compatibility
 * - Professional tool set
 * - Seamless embroidery integration
 */
import { AdvancedVectorTools } from './AdvancedVectorTools';
import { UniversalMediaIntegration } from './UniversalMediaIntegration';
import { VectorEmbroideryIntegration } from './VectorEmbroideryIntegration';
import { ProfessionalToolSet } from './ProfessionalToolSet';
export class ComprehensiveVectorSystem {
    constructor() {
        // Event system
        this.eventListeners = new Map();
        // Performance optimization
        this.lastUpdateTime = 0;
        this.updateThrottle = 16; // 60fps
        this.renderQueue = [];
        this.isRendering = false;
        this.initializeState();
        this.initializeConfig();
        this.initializeSystems();
        this.setupEventHandlers();
        this.startRenderLoop();
    }
    static getInstance() {
        if (!ComprehensiveVectorSystem.instance) {
            ComprehensiveVectorSystem.instance = new ComprehensiveVectorSystem();
        }
        return ComprehensiveVectorSystem.instance;
    }
    initializeState() {
        this.state = {
            isActive: false,
            currentMode: 'vector',
            currentTool: 'pen',
            currentMediaType: 'digital_print',
            precision: 0.1,
            snapEnabled: true,
            gridEnabled: true,
            guidesEnabled: true,
            selection: {
                selectedPaths: [],
                selectedPoints: []
            },
            dragState: {
                isDragging: false,
                startPoint: null,
                currentPoint: null,
                dragType: null,
                targetId: null
            }
        };
    }
    initializeConfig() {
        this.config = {
            enableClickAndDrag: true,
            enablePreciseAnchors: true,
            enableUniversalMedia: true,
            enableRealTimePreview: true,
            enableUndoRedo: true,
            enableProfessionalTools: true,
            precision: 0.1,
            snapTolerance: 5,
            gridSize: 20,
            showGrid: true,
            showGuides: true,
            showRulers: true,
            performanceMode: 'balanced'
        };
    }
    initializeSystems() {
        this.vectorTools = AdvancedVectorTools.getInstance();
        this.mediaIntegration = UniversalMediaIntegration.getInstance();
        this.embroideryIntegration = VectorEmbroideryIntegration.getInstance();
        this.toolSet = ProfessionalToolSet.getInstance();
    }
    setupEventHandlers() {
        // Vector tools events
        this.vectorTools.on('tool:changed', (data) => {
            this.state.currentTool = data.tool;
            this.emit('tool:changed', data);
        });
        // Media integration events
        this.mediaIntegration.on('mediaType:changed', (data) => {
            this.state.currentMediaType = data.mediaType.id;
            this.emit('mediaType:changed', data);
        });
        // Embroidery integration events
        this.embroideryIntegration.on('mode:changed', (data) => {
            this.state.currentMode = data.mode;
            this.emit('mode:changed', data);
        });
    }
    startRenderLoop() {
        const render = () => {
            if (this.isRendering) {
                requestAnimationFrame(render);
                return;
            }
            this.isRendering = true;
            try {
                this.processRenderQueue();
            }
            catch (error) {
                console.error('Error in render loop:', error);
            }
            finally {
                this.isRendering = false;
                requestAnimationFrame(render);
            }
        };
        requestAnimationFrame(render);
    }
    processRenderQueue() {
        if (this.renderQueue.length === 0) {
            return;
        }
        const now = performance.now();
        if (now - this.lastUpdateTime < this.updateThrottle) {
            return;
        }
        const renderTasks = this.renderQueue.splice(0, 10); // Process up to 10 tasks per frame
        for (const task of renderTasks) {
            try {
                this.executeRenderTask(task);
            }
            catch (error) {
                console.error('Error executing render task:', error);
            }
        }
        this.lastUpdateTime = now;
    }
    executeRenderTask(task) {
        // Execute render task based on type
        switch (task.type) {
            case 'render':
                this.renderToCanvas(task.context, task.data, task.mediaType);
                break;
            case 'update':
                this.updateDisplay(task.data);
                break;
            case 'clear':
                this.clearCanvas(task.context);
                break;
        }
    }
    // ============================================================================
    // MAIN SYSTEM METHODS
    // ============================================================================
    activate() {
        this.state.isActive = true;
        this.emit('system:activated', { state: this.state });
    }
    deactivate() {
        this.state.isActive = false;
        this.emit('system:deactivated', { state: this.state });
    }
    setMode(mode) {
        this.state.currentMode = mode;
        switch (mode) {
            case 'vector':
                this.embroideryIntegration.activateVectorMode();
                break;
            case 'embroidery':
                this.embroideryIntegration.activateEmbroideryMode();
                break;
            case 'mixed':
                this.embroideryIntegration.activateVectorMode();
                break;
        }
        this.emit('mode:changed', { mode, state: this.state });
    }
    setTool(toolId) {
        if (!this.toolSet.setActiveTool(toolId)) {
            return false;
        }
        this.state.currentTool = toolId;
        this.vectorTools.setTool(toolId);
        this.emit('tool:changed', { tool: toolId, state: this.state });
        return true;
    }
    setMediaType(mediaTypeId) {
        const success = this.mediaIntegration.setActiveMediaType(mediaTypeId);
        if (success) {
            this.state.currentMediaType = mediaTypeId;
            this.emit('mediaType:changed', { mediaTypeId, state: this.state });
        }
        return success;
    }
    // ============================================================================
    // MOUSE EVENT HANDLING (FIXES CLICK AND DRAG ISSUES)
    // ============================================================================
    handleMouseDown(event, point, shapes, currentPath) {
        if (!this.state.isActive) {
            return { success: false, error: 'System not active' };
        }
        try {
            // Apply precision to point
            const precisePoint = this.applyPrecision(point);
            // Update drag state
            this.state.dragState.isDragging = true;
            this.state.dragState.startPoint = precisePoint;
            this.state.dragState.currentPoint = precisePoint;
            let result;
            if (this.state.currentMode === 'vector') {
                // Handle vector tools
                result = this.vectorTools.handleMouseDown(event, precisePoint, shapes, currentPath);
                if (result.success) {
                    this.state.dragState.dragType = this.getDragTypeFromTool(this.state.currentTool);
                    this.state.dragState.targetId = result.data?.path?.id || null;
                }
            }
            else if (this.state.currentMode === 'embroidery') {
                // Handle embroidery tools
                result = this.embroideryIntegration.handleMouseDown(event, precisePoint, shapes, currentPath);
                if (result.success) {
                    this.state.dragState.dragType = 'draw';
                    this.state.dragState.targetId = result.data?.path?.id || null;
                }
            }
            else {
                // Handle mixed mode
                result = this.handleMixedModeMouseDown(event, precisePoint, shapes, currentPath);
            }
            this.emit('mouse:down', { event, point: precisePoint, result });
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: `Mouse down error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    handleMouseMove(event, point, shapes, currentPath) {
        if (!this.state.isActive || !this.state.dragState.isDragging) {
            return { success: true };
        }
        try {
            // Apply precision to point
            const precisePoint = this.applyPrecision(point);
            // Update drag state
            this.state.dragState.currentPoint = precisePoint;
            let result;
            if (this.state.currentMode === 'vector') {
                // Handle vector tools
                result = this.vectorTools.handleMouseMove(event, precisePoint, shapes, currentPath);
            }
            else if (this.state.currentMode === 'embroidery') {
                // Handle embroidery tools
                result = this.embroideryIntegration.handleMouseMove(event, precisePoint, shapes, currentPath);
            }
            else {
                // Handle mixed mode
                result = this.handleMixedModeMouseMove(event, precisePoint, shapes, currentPath);
            }
            // Queue render task for real-time preview
            if (this.config.enableRealTimePreview && result.requiresRedraw) {
                this.queueRenderTask({
                    type: 'render',
                    context: event.target,
                    data: result.data,
                    mediaType: this.state.currentMediaType
                });
            }
            this.emit('mouse:move', { event, point: precisePoint, result });
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: `Mouse move error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    handleMouseUp(event, point, shapes, currentPath) {
        if (!this.state.isActive || !this.state.dragState.isDragging) {
            return { success: true };
        }
        try {
            // Apply precision to point
            const precisePoint = this.applyPrecision(point);
            let result;
            if (this.state.currentMode === 'vector') {
                // Handle vector tools
                result = this.vectorTools.handleMouseUp(event, precisePoint, shapes, currentPath);
            }
            else if (this.state.currentMode === 'embroidery') {
                // Handle embroidery tools
                result = this.embroideryIntegration.handleMouseUp(event, precisePoint, shapes, currentPath);
            }
            else {
                // Handle mixed mode
                result = this.handleMixedModeMouseUp(event, precisePoint, shapes, currentPath);
            }
            // Reset drag state
            this.state.dragState.isDragging = false;
            this.state.dragState.startPoint = null;
            this.state.dragState.currentPoint = null;
            this.state.dragState.dragType = null;
            this.state.dragState.targetId = null;
            this.emit('mouse:up', { event, point: precisePoint, result });
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: `Mouse up error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    // ============================================================================
    // MIXED MODE HANDLING
    // ============================================================================
    handleMixedModeMouseDown(event, point, shapes, currentPath) {
        // In mixed mode, determine which system to use based on tool
        const tool = this.toolSet.getActiveTool();
        if (!tool) {
            return { success: false, error: 'No active tool' };
        }
        // Use vector tools for drawing tools, embroidery for stitch tools
        if (this.isDrawingTool(tool.id)) {
            return this.vectorTools.handleMouseDown(event, point, shapes, currentPath);
        }
        else if (this.isStitchTool(tool.id)) {
            return this.embroideryIntegration.handleMouseDown(event, point, shapes, currentPath);
        }
        else {
            return this.vectorTools.handleMouseDown(event, point, shapes, currentPath);
        }
    }
    handleMixedModeMouseMove(event, point, shapes, currentPath) {
        const tool = this.toolSet.getActiveTool();
        if (!tool) {
            return { success: true };
        }
        if (this.isDrawingTool(tool.id)) {
            return this.vectorTools.handleMouseMove(event, point, shapes, currentPath);
        }
        else if (this.isStitchTool(tool.id)) {
            return this.embroideryIntegration.handleMouseMove(event, point, shapes, currentPath);
        }
        else {
            return this.vectorTools.handleMouseMove(event, point, shapes, currentPath);
        }
    }
    handleMixedModeMouseUp(event, point, shapes, currentPath) {
        const tool = this.toolSet.getActiveTool();
        if (!tool) {
            return { success: true };
        }
        if (this.isDrawingTool(tool.id)) {
            return this.vectorTools.handleMouseUp(event, point, shapes, currentPath);
        }
        else if (this.isStitchTool(tool.id)) {
            return this.embroideryIntegration.handleMouseUp(event, point, shapes, currentPath);
        }
        else {
            return this.vectorTools.handleMouseUp(event, point, shapes, currentPath);
        }
    }
    isDrawingTool(toolId) {
        const drawingTools = ['pen', 'pencil', 'brush', 'airbrush', 'rectangle', 'ellipse', 'line', 'polygon', 'star'];
        return drawingTools.includes(toolId);
    }
    isStitchTool(toolId) {
        const stitchTools = ['cross_stitch', 'satin_stitch', 'chain_stitch', 'fill_stitch', 'back_stitch'];
        return stitchTools.includes(toolId);
    }
    // ============================================================================
    // PRECISION AND SNAPPING (FIXES ANCHOR POINT PRECISION)
    // ============================================================================
    applyPrecision(point) {
        if (!this.config.enablePreciseAnchors) {
            return point;
        }
        let precisePoint = { ...point };
        // Apply grid snapping
        if (this.state.snapEnabled && this.state.gridEnabled) {
            precisePoint = this.snapToGrid(precisePoint);
        }
        // Apply precision rounding
        const precision = this.config.precision;
        precisePoint.x = Math.round(precisePoint.x / precision) * precision;
        precisePoint.y = Math.round(precisePoint.y / precision) * precision;
        return precisePoint;
    }
    snapToGrid(point) {
        const gridSize = this.config.gridSize;
        return {
            x: Math.round(point.x / gridSize) * gridSize,
            y: Math.round(point.y / gridSize) * gridSize
        };
    }
    // ============================================================================
    // RENDERING SYSTEM
    // ============================================================================
    queueRenderTask(task) {
        this.renderQueue.push(task);
    }
    renderToCanvas(context, data, mediaType) {
        this.mediaIntegration.render(context, data, mediaType);
    }
    updateDisplay(data) {
        // Update display with new data
        this.emit('display:updated', { data });
    }
    clearCanvas(context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    getDragTypeFromTool(toolId) {
        const dragTypes = {
            'pen': 'draw',
            'pencil': 'draw',
            'brush': 'draw',
            'airbrush': 'draw',
            'select': 'move',
            'lasso': 'select',
            'magic_wand': 'select',
            'rectangle': 'draw',
            'ellipse': 'draw',
            'line': 'draw',
            'polygon': 'draw',
            'star': 'draw',
            'text': 'draw',
            'blur': 'draw',
            'sharpen': 'draw',
            'smudge': 'draw',
            'dodge': 'draw',
            'burn': 'draw'
        };
        return dragTypes[toolId] || null;
    }
    // ============================================================================
    // CONFIGURATION
    // ============================================================================
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.emit('config:updated', { config: this.config });
    }
    getConfig() {
        return { ...this.config };
    }
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    getState() {
        return { ...this.state };
    }
    // ============================================================================
    // TOOL MANAGEMENT
    // ============================================================================
    getAvailableTools() {
        return this.toolSet.getAllTools();
    }
    getToolsByCategory(category) {
        return this.toolSet.getToolsByCategory(category);
    }
    getActiveTool() {
        return this.toolSet.getActiveTool();
    }
    updateToolConfig(toolId, config) {
        return this.toolSet.updateToolConfig(toolId, config);
    }
    // ============================================================================
    // MEDIA MANAGEMENT
    // ============================================================================
    getAvailableMediaTypes() {
        return this.mediaIntegration.getAllMediaTypes();
    }
    getMediaTypesByCategory(category) {
        return this.mediaIntegration.getMediaTypesByCategory(category);
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
                    console.error(`Error in ComprehensiveVectorSystem event listener for ${event}:`, error);
                }
            });
        }
    }
}
export default ComprehensiveVectorSystem;
