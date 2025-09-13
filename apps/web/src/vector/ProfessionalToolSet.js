/**
 * 🎯 Professional Tool Set
 *
 * Comprehensive tool collection inspired by:
 * - Blender (3D modeling tools)
 * - Photoshop (image editing tools)
 * - Krita (digital painting tools)
 * - Maya (3D animation tools)
 * - CLO3D (fashion design tools)
 */
export class ProfessionalToolSet {
    constructor() {
        this.tools = new Map();
        this.activeTool = null;
        this.toolHistory = [];
        this.initializeTools();
    }
    static getInstance() {
        if (!ProfessionalToolSet.instance) {
            ProfessionalToolSet.instance = new ProfessionalToolSet();
        }
        return ProfessionalToolSet.instance;
    }
    initializeTools() {
        // ============================================================================
        // DRAWING TOOLS (Inspired by Krita, Photoshop)
        // ============================================================================
        this.registerTool({
            id: 'pen',
            name: 'Pen Tool',
            category: 'drawing',
            icon: '✏️',
            shortcut: 'P',
            description: 'Draw precise vector paths with anchor points',
            precision: 0.1,
            pressureSensitive: false,
            configurable: true,
            config: {
                size: 2,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#000000',
                blendMode: 'normal'
            }
        });
        this.registerTool({
            id: 'pencil',
            name: 'Pencil Tool',
            category: 'drawing',
            icon: '✏️',
            shortcut: 'N',
            description: 'Draw freehand paths with automatic smoothing',
            precision: 0.5,
            pressureSensitive: true,
            configurable: true,
            config: {
                size: 5,
                opacity: 1.0,
                hardness: 0.8,
                flow: 1.0,
                spacing: 0.5,
                angle: 0,
                roundness: 1.0,
                color: '#000000',
                blendMode: 'normal',
                smoothing: 0.5
            }
        });
        this.registerTool({
            id: 'brush',
            name: 'Brush Tool',
            category: 'drawing',
            icon: '🖌️',
            shortcut: 'B',
            description: 'Paint with pressure-sensitive brush strokes',
            precision: 1.0,
            pressureSensitive: true,
            configurable: true,
            config: {
                size: 10,
                opacity: 1.0,
                hardness: 0.5,
                flow: 0.8,
                spacing: 0.3,
                angle: 0,
                roundness: 1.0,
                color: '#000000',
                blendMode: 'normal',
                texture: 'smooth'
            }
        });
        this.registerTool({
            id: 'airbrush',
            name: 'Airbrush Tool',
            category: 'drawing',
            icon: '💨',
            shortcut: 'A',
            description: 'Spray paint with soft, diffused edges',
            precision: 2.0,
            pressureSensitive: true,
            configurable: true,
            config: {
                size: 15,
                opacity: 0.7,
                hardness: 0.1,
                flow: 0.5,
                spacing: 0.1,
                angle: 0,
                roundness: 1.0,
                color: '#000000',
                blendMode: 'normal',
                pressure: 0.8
            }
        });
        // ============================================================================
        // SELECTION TOOLS (Inspired by Photoshop, Blender)
        // ============================================================================
        this.registerTool({
            id: 'select',
            name: 'Select Tool',
            category: 'selection',
            icon: '↖️',
            shortcut: 'V',
            description: 'Select and move objects',
            precision: 0.1,
            pressureSensitive: false,
            configurable: true,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#007acc',
                blendMode: 'normal',
                tolerance: 5
            }
        });
        this.registerTool({
            id: 'lasso',
            name: 'Lasso Tool',
            category: 'selection',
            icon: '🪃',
            shortcut: 'L',
            description: 'Draw freehand selection areas',
            precision: 1.0,
            pressureSensitive: false,
            configurable: true,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#007acc',
                blendMode: 'normal',
                feather: 0
            }
        });
        this.registerTool({
            id: 'magic_wand',
            name: 'Magic Wand',
            category: 'selection',
            icon: '🪄',
            shortcut: 'W',
            description: 'Select areas of similar color',
            precision: 0.1,
            pressureSensitive: false,
            configurable: true,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#007acc',
                blendMode: 'normal',
                tolerance: 32,
                contiguous: true
            }
        });
        // ============================================================================
        // SHAPE TOOLS (Inspired by Illustrator, CLO3D)
        // ============================================================================
        this.registerTool({
            id: 'rectangle',
            name: 'Rectangle Tool',
            category: 'shapes',
            icon: '⬜',
            shortcut: 'R',
            description: 'Draw rectangles and squares',
            precision: 0.1,
            pressureSensitive: false,
            configurable: true,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 0,
                color: '#000000',
                blendMode: 'normal',
                cornerRadius: 0
            }
        });
        this.registerTool({
            id: 'ellipse',
            name: 'Ellipse Tool',
            category: 'shapes',
            icon: '⭕',
            shortcut: 'E',
            description: 'Draw ellipses and circles',
            precision: 0.1,
            pressureSensitive: false,
            configurable: true,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#000000',
                blendMode: 'normal'
            }
        });
        this.registerTool({
            id: 'polygon',
            name: 'Polygon Tool',
            category: 'shapes',
            icon: '⬟',
            shortcut: 'G',
            description: 'Draw polygons with configurable sides',
            precision: 0.1,
            pressureSensitive: false,
            configurable: true,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#000000',
                blendMode: 'normal',
                sides: 6
            }
        });
        this.registerTool({
            id: 'star',
            name: 'Star Tool',
            category: 'shapes',
            icon: '⭐',
            shortcut: 'S',
            description: 'Draw stars with configurable points',
            precision: 0.1,
            pressureSensitive: false,
            configurable: true,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#000000',
                blendMode: 'normal',
                points: 5,
                innerRadius: 0.5
            }
        });
        // ============================================================================
        // EDITING TOOLS (Inspired by Blender, Maya)
        // ============================================================================
        this.registerTool({
            id: 'add_anchor',
            name: 'Add Anchor Point',
            category: 'editing',
            icon: '➕',
            shortcut: '+',
            description: 'Add anchor points to existing paths',
            precision: 0.1,
            pressureSensitive: false,
            configurable: false,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#ff0000',
                blendMode: 'normal'
            }
        });
        this.registerTool({
            id: 'remove_anchor',
            name: 'Remove Anchor Point',
            category: 'editing',
            icon: '➖',
            shortcut: '-',
            description: 'Remove anchor points from paths',
            precision: 0.1,
            pressureSensitive: false,
            configurable: false,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#ff0000',
                blendMode: 'normal'
            }
        });
        this.registerTool({
            id: 'convert_anchor',
            name: 'Convert Anchor Point',
            category: 'editing',
            icon: '🔄',
            shortcut: 'C',
            description: 'Convert between corner and smooth points',
            precision: 0.1,
            pressureSensitive: false,
            configurable: false,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#ff0000',
                blendMode: 'normal'
            }
        });
        this.registerTool({
            id: 'curvature',
            name: 'Curvature Tool',
            category: 'editing',
            icon: '〰️',
            shortcut: 'U',
            description: 'Adjust path curvature by dragging segments',
            precision: 0.1,
            pressureSensitive: false,
            configurable: true,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#00ff00',
                blendMode: 'normal',
                tension: 0.5
            }
        });
        // ============================================================================
        // EFFECTS TOOLS (Inspired by Photoshop, Krita)
        // ============================================================================
        this.registerTool({
            id: 'blur',
            name: 'Blur Tool',
            category: 'effects',
            icon: '🌫️',
            shortcut: 'B',
            description: 'Blur areas of the image',
            precision: 2.0,
            pressureSensitive: true,
            configurable: true,
            config: {
                size: 20,
                opacity: 0.8,
                hardness: 0.3,
                flow: 0.6,
                spacing: 0.5,
                angle: 0,
                roundness: 1.0,
                color: '#000000',
                blendMode: 'normal',
                strength: 0.5
            }
        });
        this.registerTool({
            id: 'sharpen',
            name: 'Sharpen Tool',
            category: 'effects',
            icon: '⚡',
            shortcut: 'S',
            description: 'Sharpen areas of the image',
            precision: 2.0,
            pressureSensitive: true,
            configurable: true,
            config: {
                size: 20,
                opacity: 0.8,
                hardness: 0.7,
                flow: 0.6,
                spacing: 0.5,
                angle: 0,
                roundness: 1.0,
                color: '#000000',
                blendMode: 'normal',
                strength: 0.5
            }
        });
        this.registerTool({
            id: 'smudge',
            name: 'Smudge Tool',
            category: 'effects',
            icon: '👆',
            shortcut: 'M',
            description: 'Smudge and blend colors',
            precision: 2.0,
            pressureSensitive: true,
            configurable: true,
            config: {
                size: 15,
                opacity: 0.8,
                hardness: 0.5,
                flow: 0.7,
                spacing: 0.3,
                angle: 0,
                roundness: 1.0,
                color: '#000000',
                blendMode: 'normal',
                strength: 0.6
            }
        });
        this.registerTool({
            id: 'dodge',
            name: 'Dodge Tool',
            category: 'effects',
            icon: '☀️',
            shortcut: 'O',
            description: 'Lighten areas of the image',
            precision: 2.0,
            pressureSensitive: true,
            configurable: true,
            config: {
                size: 20,
                opacity: 0.8,
                hardness: 0.5,
                flow: 0.6,
                spacing: 0.5,
                angle: 0,
                roundness: 1.0,
                color: '#ffffff',
                blendMode: 'screen',
                strength: 0.5
            }
        });
        this.registerTool({
            id: 'burn',
            name: 'Burn Tool',
            category: 'effects',
            icon: '🔥',
            shortcut: 'B',
            description: 'Darken areas of the image',
            precision: 2.0,
            pressureSensitive: true,
            configurable: true,
            config: {
                size: 20,
                opacity: 0.8,
                hardness: 0.5,
                flow: 0.6,
                spacing: 0.5,
                angle: 0,
                roundness: 1.0,
                color: '#000000',
                blendMode: 'multiply',
                strength: 0.5
            }
        });
        // ============================================================================
        // 3D TOOLS (Inspired by Blender, Maya)
        // ============================================================================
        this.registerTool({
            id: 'extrude',
            name: 'Extrude Tool',
            category: '3d',
            icon: '📦',
            shortcut: 'E',
            description: 'Extrude 2D shapes into 3D objects',
            precision: 0.1,
            pressureSensitive: false,
            configurable: true,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#000000',
                blendMode: 'normal',
                depth: 10,
                segments: 8
            }
        });
        this.registerTool({
            id: 'revolve',
            name: 'Revolve Tool',
            category: '3d',
            icon: '🌀',
            shortcut: 'R',
            description: 'Revolve 2D shapes around an axis',
            precision: 0.1,
            pressureSensitive: false,
            configurable: true,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#000000',
                blendMode: 'normal',
                angle: 360,
                segments: 16
            }
        });
        // ============================================================================
        // FASHION TOOLS (Inspired by CLO3D)
        // ============================================================================
        this.registerTool({
            id: 'seam',
            name: 'Seam Tool',
            category: 'fashion',
            icon: '🧵',
            shortcut: 'S',
            description: 'Create garment seams and stitching lines',
            precision: 0.1,
            pressureSensitive: false,
            configurable: true,
            config: {
                size: 2,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#000000',
                blendMode: 'normal',
                stitchType: 'straight',
                stitchLength: 2.5
            }
        });
        this.registerTool({
            id: 'dart',
            name: 'Dart Tool',
            category: 'fashion',
            icon: '📐',
            shortcut: 'D',
            description: 'Create darts for garment fitting',
            precision: 0.1,
            pressureSensitive: false,
            configurable: true,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#ff0000',
                blendMode: 'normal',
                dartType: 'waist',
                dartLength: 10
            }
        });
        this.registerTool({
            id: 'pleat',
            name: 'Pleat Tool',
            category: 'fashion',
            icon: '📏',
            shortcut: 'P',
            description: 'Create pleats and folds in garments',
            precision: 0.1,
            pressureSensitive: false,
            configurable: true,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#0000ff',
                blendMode: 'normal',
                pleatType: 'box',
                pleatWidth: 5
            }
        });
        // ============================================================================
        // TEXT TOOLS (Inspired by Illustrator, Photoshop)
        // ============================================================================
        this.registerTool({
            id: 'text',
            name: 'Text Tool',
            category: 'text',
            icon: '📝',
            shortcut: 'T',
            description: 'Add text to your design',
            precision: 0.1,
            pressureSensitive: false,
            configurable: true,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#000000',
                blendMode: 'normal',
                fontSize: 16,
                fontFamily: 'Arial',
                fontWeight: 'normal',
                fontStyle: 'normal'
            }
        });
        this.registerTool({
            id: 'text_path',
            name: 'Text on Path',
            category: 'text',
            icon: '📝',
            shortcut: 'Shift+T',
            description: 'Add text along a path',
            precision: 0.1,
            pressureSensitive: false,
            configurable: true,
            config: {
                size: 1,
                opacity: 1.0,
                hardness: 1.0,
                flow: 1.0,
                spacing: 1.0,
                angle: 0,
                roundness: 1.0,
                color: '#000000',
                blendMode: 'normal',
                fontSize: 16,
                fontFamily: 'Arial',
                fontWeight: 'normal',
                fontStyle: 'normal',
                pathOffset: 0
            }
        });
    }
    registerTool(tool) {
        this.tools.set(tool.id, tool);
    }
    getTool(toolId) {
        return this.tools.get(toolId);
    }
    getAllTools() {
        return Array.from(this.tools.values());
    }
    getToolsByCategory(category) {
        return Array.from(this.tools.values()).filter(tool => tool.category === category);
    }
    setActiveTool(toolId) {
        if (!this.tools.has(toolId)) {
            return false;
        }
        if (this.activeTool) {
            this.toolHistory.push(this.activeTool);
        }
        this.activeTool = toolId;
        return true;
    }
    getActiveTool() {
        return this.activeTool ? this.tools.get(this.activeTool) : undefined;
    }
    getPreviousTool() {
        if (this.toolHistory.length === 0) {
            return undefined;
        }
        const previousToolId = this.toolHistory.pop();
        return previousToolId ? this.tools.get(previousToolId) : undefined;
    }
    updateToolConfig(toolId, config) {
        const tool = this.tools.get(toolId);
        if (!tool) {
            return false;
        }
        tool.config = { ...tool.config, ...config };
        return true;
    }
    getToolConfig(toolId) {
        const tool = this.tools.get(toolId);
        return tool ? tool.config : undefined;
    }
    resetToolConfig(toolId) {
        const tool = this.tools.get(toolId);
        if (!tool) {
            return false;
        }
        // Reset to default config
        this.initializeTools();
        const defaultTool = this.tools.get(toolId);
        if (defaultTool) {
            tool.config = { ...defaultTool.config };
            return true;
        }
        return false;
    }
}
export default ProfessionalToolSet;
