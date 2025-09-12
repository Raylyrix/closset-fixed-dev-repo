import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 🎯 Vector Tools Panel - Complete Tool Interface
 *
 * Comprehensive vector tools panel with all tools functional:
 * - Tool selection
 * - Tool options
 * - Visual feedback
 * - Keyboard shortcuts
 * - Tool-specific controls
 */
import { useState, useEffect, useCallback } from 'react';
import { enhancedVectorTools } from '../vector/EnhancedVectorTools';
export const VectorToolsPanel = ({ activeTool, onToolChange, onOptionsChange, className = '', style = {} }) => {
    const [toolState, setToolState] = useState(enhancedVectorTools.getToolState());
    const [options, setOptions] = useState(enhancedVectorTools.getOptions());
    const [showOptions, setShowOptions] = useState(false);
    // Update tool state when active tool changes
    useEffect(() => {
        const result = enhancedVectorTools.setTool(activeTool);
        if (result.success) {
            setToolState(enhancedVectorTools.getToolState());
        }
    }, [activeTool]);
    // Handle tool selection
    const handleToolSelect = useCallback((tool) => {
        const result = enhancedVectorTools.setTool(tool);
        if (result.success) {
            onToolChange(tool);
            setToolState(enhancedVectorTools.getToolState());
        }
        else {
            console.error('Failed to set tool:', result.error);
        }
    }, [onToolChange]);
    // Handle options change
    const handleOptionsChange = useCallback((newOptions) => {
        const updatedOptions = { ...options, ...newOptions };
        enhancedVectorTools.setOptions(updatedOptions);
        setOptions(updatedOptions);
        onOptionsChange?.(updatedOptions);
    }, [options, onOptionsChange]);
    // Tool definitions
    const tools = [
        // Drawing tools
        {
            id: 'pen',
            name: 'Pen',
            icon: '✏️',
            description: 'Draw freeform paths with anchor points',
            shortcut: 'P',
            category: 'drawing'
        },
        {
            id: 'shapeBuilder',
            name: 'Shape Builder',
            icon: '🔧',
            description: 'Build complex shapes from simple primitives',
            shortcut: 'S',
            category: 'drawing'
        },
        // Editing tools
        {
            id: 'addAnchor',
            name: 'Add Anchor',
            icon: '➕',
            description: 'Add anchor points to existing paths',
            shortcut: 'A',
            category: 'editing'
        },
        {
            id: 'removeAnchor',
            name: 'Remove Anchor',
            icon: '➖',
            description: 'Remove anchor points from paths',
            shortcut: 'R',
            category: 'editing'
        },
        {
            id: 'convertAnchor',
            name: 'Convert Anchor',
            icon: '🔄',
            description: 'Convert between corner and smooth anchor points',
            shortcut: 'C',
            category: 'editing'
        },
        {
            id: 'curvature',
            name: 'Curvature',
            icon: '🌊',
            description: 'Adjust path curvature by dragging segments',
            shortcut: 'U',
            category: 'editing'
        },
        // Selection tools
        {
            id: 'pathSelection',
            name: 'Path Selection',
            icon: '👆',
            description: 'Select and manipulate entire paths',
            shortcut: 'V',
            category: 'selection'
        },
        {
            id: 'marqueeRect',
            name: 'Rectangular Marquee',
            icon: '⬜',
            description: 'Select paths within a rectangular area',
            shortcut: 'M',
            category: 'selection'
        },
        {
            id: 'marqueeEllipse',
            name: 'Elliptical Marquee',
            icon: '⭕',
            description: 'Select paths within an elliptical area',
            shortcut: 'E',
            category: 'selection'
        },
        {
            id: 'lasso',
            name: 'Lasso',
            icon: '🪃',
            description: 'Select paths by drawing a freeform selection',
            shortcut: 'L',
            category: 'selection'
        },
        {
            id: 'polygonLasso',
            name: 'Polygon Lasso',
            icon: '🔷',
            description: 'Select paths with straight-line segments',
            shortcut: 'O',
            category: 'selection'
        },
        {
            id: 'magneticLasso',
            name: 'Magnetic Lasso',
            icon: '🧲',
            description: 'Select paths that snap to path edges',
            shortcut: 'I',
            category: 'selection'
        },
        {
            id: 'magicWand',
            name: 'Magic Wand',
            icon: '🪄',
            description: 'Select paths with similar properties',
            shortcut: 'W',
            category: 'selection'
        },
        // Transformation tools
        {
            id: 'transform',
            name: 'Transform',
            icon: '↔️',
            description: 'Move, rotate, and scale selected paths',
            shortcut: 'T',
            category: 'transformation'
        },
        {
            id: 'scale',
            name: 'Scale',
            icon: '📏',
            description: 'Resize selected paths',
            shortcut: 'S',
            category: 'transformation'
        },
        {
            id: 'rotate',
            name: 'Rotate',
            icon: '🔄',
            description: 'Rotate selected paths',
            shortcut: 'R',
            category: 'transformation'
        },
        {
            id: 'skew',
            name: 'Skew',
            icon: '📐',
            description: 'Skew selected paths',
            shortcut: 'K',
            category: 'transformation'
        },
        {
            id: 'perspective',
            name: 'Perspective',
            icon: '🏗️',
            description: 'Apply perspective transformation',
            shortcut: 'P',
            category: 'transformation'
        },
        // Advanced tools
        {
            id: 'pathOperations',
            name: 'Path Operations',
            icon: '⚙️',
            description: 'Combine, subtract, and modify paths',
            shortcut: 'G',
            category: 'advanced'
        }
    ];
    // Group tools by category
    const toolsByCategory = tools.reduce((acc, tool) => {
        if (!acc[tool.category]) {
            acc[tool.category] = [];
        }
        acc[tool.category].push(tool);
        return acc;
    }, {});
    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey || event.metaKey || event.altKey)
                return;
            const tool = tools.find(t => t.shortcut === event.key.toUpperCase());
            if (tool) {
                event.preventDefault();
                handleToolSelect(tool.id);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleToolSelect]);
    return (_jsxs("div", { className: `vector-tools-panel ${className}`, style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            minWidth: '300px',
            ...style
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                }, children: [_jsx("h3", { style: {
                            margin: 0,
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#212529'
                        }, children: "Vector Tools" }), _jsxs("button", { onClick: () => setShowOptions(!showOptions), style: {
                            background: 'none',
                            border: '1px solid #6c757d',
                            borderRadius: '4px',
                            padding: '0.25rem 0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            color: '#6c757d'
                        }, children: [showOptions ? 'Hide' : 'Show', " Options"] })] }), Object.entries(toolsByCategory).map(([category, categoryTools]) => (_jsxs("div", { style: { marginBottom: '1rem' }, children: [_jsx("h4", { style: {
                            margin: '0 0 0.5rem 0',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            color: '#6c757d',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }, children: category }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                            gap: '0.5rem'
                        }, children: categoryTools.map(tool => (_jsxs("button", { onClick: () => handleToolSelect(tool.id), style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '0.75rem 0.5rem',
                                border: activeTool === tool.id ? '2px solid #007bff' : '1px solid #dee2e6',
                                borderRadius: '6px',
                                backgroundColor: activeTool === tool.id ? '#e7f3ff' : 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                minHeight: '80px'
                            }, onMouseEnter: (e) => {
                                if (activeTool !== tool.id) {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                }
                            }, onMouseLeave: (e) => {
                                if (activeTool !== tool.id) {
                                    e.currentTarget.style.backgroundColor = 'white';
                                }
                            }, title: `${tool.description}${tool.shortcut ? ` (${tool.shortcut})` : ''}`, children: [_jsx("div", { style: { fontSize: '1.5rem', marginBottom: '0.25rem' }, children: tool.icon }), _jsx("div", { style: {
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        textAlign: 'center',
                                        color: activeTool === tool.id ? '#007bff' : '#495057'
                                    }, children: tool.name }), tool.shortcut && (_jsx("div", { style: {
                                        fontSize: '0.625rem',
                                        color: '#6c757d',
                                        marginTop: '0.25rem'
                                    }, children: tool.shortcut }))] }, tool.id))) })] }, category))), showOptions && (_jsxs("div", { style: {
                    borderTop: '1px solid #dee2e6',
                    paddingTop: '1rem',
                    marginTop: '1rem'
                }, children: [_jsx("h4", { style: {
                            margin: '0 0 0.75rem 0',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            color: '#495057'
                        }, children: "Tool Options" }), _jsxs("div", { style: { marginBottom: '0.75rem' }, children: [_jsxs("label", { style: {
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    marginBottom: '0.25rem',
                                    color: '#495057'
                                }, children: ["Precision: ", options.precision, "px"] }), _jsx("input", { type: "range", min: "1", max: "20", value: options.precision, onChange: (e) => handleOptionsChange({ precision: parseInt(e.target.value) }), style: {
                                    width: '100%',
                                    height: '4px',
                                    borderRadius: '2px',
                                    background: '#dee2e6',
                                    outline: 'none',
                                    cursor: 'pointer'
                                } })] }), _jsx("div", { style: { marginBottom: '0.75rem' }, children: _jsxs("label", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '0.875rem',
                                color: '#495057',
                                cursor: 'pointer'
                            }, children: [_jsx("input", { type: "checkbox", checked: options.snapToGrid, onChange: (e) => handleOptionsChange({ snapToGrid: e.target.checked }), style: { marginRight: '0.5rem' } }), "Snap to Grid"] }) }), options.snapToGrid && (_jsxs("div", { style: { marginBottom: '0.75rem' }, children: [_jsxs("label", { style: {
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    marginBottom: '0.25rem',
                                    color: '#495057'
                                }, children: ["Grid Size: ", options.gridSize, "px"] }), _jsx("input", { type: "range", min: "5", max: "50", value: options.gridSize, onChange: (e) => handleOptionsChange({ gridSize: parseInt(e.target.value) }), style: {
                                    width: '100%',
                                    height: '4px',
                                    borderRadius: '2px',
                                    background: '#dee2e6',
                                    outline: 'none',
                                    cursor: 'pointer'
                                } })] })), _jsx("div", { style: { marginBottom: '0.75rem' }, children: _jsxs("label", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '0.875rem',
                                color: '#495057',
                                cursor: 'pointer'
                            }, children: [_jsx("input", { type: "checkbox", checked: options.showGuides, onChange: (e) => handleOptionsChange({ showGuides: e.target.checked }), style: { marginRight: '0.5rem' } }), "Show Guides"] }) }), _jsx("div", { style: { marginBottom: '0.75rem' }, children: _jsxs("label", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '0.875rem',
                                color: '#495057',
                                cursor: 'pointer'
                            }, children: [_jsx("input", { type: "checkbox", checked: options.autoSmooth, onChange: (e) => handleOptionsChange({ autoSmooth: e.target.checked }), style: { marginRight: '0.5rem' } }), "Auto Smooth"] }) }), _jsxs("div", { style: { marginBottom: '0.75rem' }, children: [_jsxs("label", { style: {
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    marginBottom: '0.25rem',
                                    color: '#495057'
                                }, children: ["Tension: ", options.tension.toFixed(1)] }), _jsx("input", { type: "range", min: "0", max: "1", step: "0.1", value: options.tension, onChange: (e) => handleOptionsChange({ tension: parseFloat(e.target.value) }), style: {
                                    width: '100%',
                                    height: '4px',
                                    borderRadius: '2px',
                                    background: '#dee2e6',
                                    outline: 'none',
                                    cursor: 'pointer'
                                } })] })] })), _jsxs("div", { style: {
                    borderTop: '1px solid #dee2e6',
                    paddingTop: '0.75rem',
                    marginTop: '0.75rem',
                    fontSize: '0.75rem',
                    color: '#6c757d'
                }, children: [_jsxs("div", { children: ["Active Tool: ", _jsx("strong", { children: toolState.activeTool })] }), _jsxs("div", { children: ["Status: ", toolState.isActive ? 'Active' : 'Inactive'] }), _jsxs("div", { children: ["Cursor: ", toolState.cursor] })] })] }));
};
export default VectorToolsPanel;
