import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useApp } from '../App';
export function FeatureShowcase({ active }) {
    // Component initialized
    const setTool = useApp(s => s.setTool);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const features = [
        // Design Tools
        {
            id: 'design_tools',
            name: 'Design Tools',
            description: 'Core painting and drawing tools',
            icon: '🎨',
            category: 'design',
            status: 'completed',
            tools: ['brush', 'eraser', 'smudge', 'blur', 'fill', 'gradient', 'picker']
        },
        {
            id: 'shapes_text',
            name: 'Shapes & Text',
            description: 'Geometric shapes and typography tools',
            icon: '📐',
            category: 'design',
            status: 'completed',
            tools: ['line', 'rect', 'ellipse', 'text', 'moveText']
        },
        {
            id: 'selection_transform',
            name: 'Selection & Transform',
            description: 'Advanced selection and transformation tools',
            icon: '🎯',
            category: 'design',
            status: 'completed',
            tools: ['advancedSelection', 'transform', 'move']
        },
        // Textile Design
        {
            id: 'pattern_maker',
            name: 'Pattern Maker',
            description: 'Create seamless repeating patterns',
            icon: '🔲',
            category: 'textile',
            status: 'completed',
            tools: ['patternMaker']
        },
        {
            id: 'embroidery',
            name: 'Embroidery Design',
            description: 'Professional embroidery pattern creation',
            icon: '🧵',
            category: 'textile',
            status: 'completed',
            tools: ['embroidery']
        },
        {
            id: 'puff_print',
            name: 'Puff Print',
            description: 'Create raised puff print effects',
            icon: '🎈',
            category: 'textile',
            status: 'completed',
            tools: ['puffPrint']
        },
        // Vector & Paths
        {
            id: 'vector_tools',
            name: 'Vector Tools',
            description: 'Pen tool and path editing',
            icon: '✏️',
            category: 'vector',
            status: 'completed',
            tools: ['vectorTools']
        },
        // Effects & Filters
        {
            id: 'layer_effects',
            name: 'Layer Effects',
            description: 'Professional layer effects and filters',
            icon: '✨',
            category: 'effects',
            status: 'completed',
            tools: ['layerEffects']
        },
        {
            id: 'color_grading',
            name: 'Color Grading',
            description: 'Professional color correction and grading',
            icon: '🎨',
            category: 'effects',
            status: 'completed',
            tools: ['colorGrading']
        },
        // AI & Automation
        {
            id: 'ai_assistant',
            name: 'AI Design Assistant',
            description: 'Smart design suggestions and automation',
            icon: '🤖',
            category: 'ai',
            status: 'completed',
            tools: ['aiAssistant']
        },
        {
            id: 'batch_processing',
            name: 'Batch Processing',
            description: 'Process multiple files automatically',
            icon: '⚙️',
            category: 'ai',
            status: 'completed',
            tools: ['batch']
        },
        // Media & Animation
        {
            id: 'animation',
            name: 'Animation Tools',
            description: 'Create animations and motion graphics',
            icon: '🎬',
            category: 'media',
            status: 'completed',
            tools: ['animation']
        },
        // Assets & Templates
        {
            id: 'templates',
            name: 'Templates & Assets',
            description: 'Design templates and asset library',
            icon: '📚',
            category: 'assets',
            status: 'completed',
            tools: ['templates']
        },
        // Export & Sync
        {
            id: 'export',
            name: 'Export & Sync',
            description: 'Export in multiple formats and cloud sync',
            icon: '📤',
            category: 'export',
            status: 'completed',
            tools: ['printExport', 'cloudSync']
        }
    ];
    const categories = [
        { id: 'all', name: 'All Features', icon: '🌟' },
        { id: 'design', name: 'Design Tools', icon: '🎨' },
        { id: 'textile', name: 'Textile Design', icon: '👕' },
        { id: 'vector', name: 'Vector & Paths', icon: '✏️' },
        { id: 'effects', name: 'Effects & Filters', icon: '✨' },
        { id: 'ai', name: 'AI & Automation', icon: '🤖' },
        { id: 'media', name: 'Media & Animation', icon: '🎬' },
        { id: 'assets', name: 'Assets & Templates', icon: '📚' },
        { id: 'export', name: 'Export & Sync', icon: '📤' }
    ];
    const filteredFeatures = selectedCategory === 'all'
        ? features
        : features.filter(feature => feature.category === selectedCategory);
    const handleToolSelect = (toolId) => {
        // Console log removed
        setTool(toolId);
    };
    if (!active) {
        // Not active - returning null
        return null;
    }
    // Rendering component
    return (_jsxs("div", { className: "feature-showcase", style: {
            border: '2px solid #8B5CF6',
            borderRadius: '8px',
            padding: '16px',
            background: 'rgba(139, 92, 246, 0.1)',
            boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
            marginTop: '12px'
        }, children: [_jsxs("div", { className: "showcase-header", style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }, children: [_jsx("h4", { style: { margin: 0, color: '#8B5CF6', fontSize: '18px' }, children: "\uD83C\uDFAF Feature Showcase" }), _jsxs("div", { style: { fontSize: '12px', color: '#A78BFA' }, children: [filteredFeatures.length, " features"] })] }), _jsxs("div", { className: "category-filter", style: {
                    marginBottom: '16px'
                }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6', marginBottom: '8px' }, children: "Categories" }), _jsx("div", { style: {
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px'
                        }, children: categories.map(category => (_jsxs("button", { className: `category-btn ${selectedCategory === category.id ? 'active' : ''}`, onClick: () => setSelectedCategory(category.id), style: {
                                padding: '6px 12px',
                                background: selectedCategory === category.id ? '#8B5CF6' : 'rgba(139, 92, 246, 0.2)',
                                color: selectedCategory === category.id ? '#FFFFFF' : '#A78BFA',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '6px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s ease'
                            }, children: [_jsx("span", { children: category.icon }), _jsx("span", { children: category.name })] }, category.id))) })] }), _jsx("div", { className: "features-grid", style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '12px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                }, children: filteredFeatures.map(feature => (_jsxs("div", { className: "feature-card", style: {
                        padding: '12px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        transition: 'all 0.2s ease'
                    }, children: [_jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px'
                            }, children: [_jsx("span", { style: { fontSize: '20px' }, children: feature.icon }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: {
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                color: '#8B5CF6',
                                                marginBottom: '2px'
                                            }, children: feature.name }), _jsx("div", { style: {
                                                fontSize: '11px',
                                                color: '#A78BFA',
                                                textTransform: 'capitalize'
                                            }, children: feature.category })] }), _jsx("div", { style: {
                                        padding: '2px 6px',
                                        background: feature.status === 'completed' ? '#10B981' :
                                            feature.status === 'in-progress' ? '#F59E0B' : '#6B7280',
                                        color: 'white',
                                        borderRadius: '4px',
                                        fontSize: '9px',
                                        fontWeight: 'bold'
                                    }, children: feature.status === 'completed' ? '✓' :
                                        feature.status === 'in-progress' ? '⏳' : '📋' })] }), _jsx("div", { style: {
                                fontSize: '12px',
                                color: '#D1D5DB',
                                marginBottom: '8px',
                                lineHeight: '1.4'
                            }, children: feature.description }), _jsx("div", { className: "feature-tools", style: {
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '4px'
                            }, children: feature.tools.map(toolId => (_jsx("button", { className: "tool-btn", onClick: () => handleToolSelect(toolId), style: {
                                    padding: '4px 8px',
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    color: '#A78BFA',
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.background = '#8B5CF6';
                                    e.currentTarget.style.color = '#FFFFFF';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                    e.currentTarget.style.color = '#A78BFA';
                                }, children: toolId }, toolId))) })] }, feature.id))) }), _jsx("div", { className: "summary-stats", style: {
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                }, children: _jsxs("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px',
                        textAlign: 'center'
                    }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: '18px', fontWeight: 'bold', color: '#10B981' }, children: features.filter(f => f.status === 'completed').length }), _jsx("div", { style: { fontSize: '11px', color: '#A78BFA' }, children: "Completed" })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '18px', fontWeight: 'bold', color: '#F59E0B' }, children: features.filter(f => f.status === 'in-progress').length }), _jsx("div", { style: { fontSize: '11px', color: '#A78BFA' }, children: "In Progress" })] }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '18px', fontWeight: 'bold', color: '#8B5CF6' }, children: features.length }), _jsx("div", { style: { fontSize: '11px', color: '#A78BFA' }, children: "Total Features" })] })] }) }), _jsx("div", { style: {
                    fontSize: '12px',
                    color: '#6B7280',
                    textAlign: 'center',
                    marginTop: '12px',
                    fontStyle: 'italic'
                }, children: "Click on any tool to activate it and start designing!" })] }));
}
