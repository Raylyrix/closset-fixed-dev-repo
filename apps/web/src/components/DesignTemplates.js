import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../App';
export function DesignTemplates({ active }) {
    // Console log removed
    const { composedCanvas, activeTool, brushColor, brushSize, layers, activeLayerId, commit } = useApp();
    // Templates state
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templateCategories, setTemplateCategories] = useState([]);
    const [templateSearchQuery, setTemplateSearchQuery] = useState('');
    const [templateSortBy, setTemplateSortBy] = useState('downloads');
    const [templateSortOrder, setTemplateSortOrder] = useState('desc');
    // Asset library state
    const [assetLibrary, setAssetLibrary] = useState({
        categories: [],
        assets: [],
        searchQuery: '',
        selectedCategory: 'all',
        sortBy: 'name',
        sortOrder: 'asc'
    });
    // UI state
    const [activeTab, setActiveTab] = useState('templates');
    const [isLoading, setIsLoading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState(null);
    // Refs
    const templateCanvasRef = useRef(null);
    const previewCanvasRef = useRef(null);
    // Initialize templates and assets
    useEffect(() => {
        if (!active) {
            // Console log removed
            return;
        }
        // Console log removed
        // Load mock templates
        loadTemplates();
        loadAssets();
        // Console log removed
    }, [active]);
    // Load templates
    const loadTemplates = useCallback(() => {
        // Console log removed
        const mockTemplates = [
            {
                id: 't_shirt_basic',
                name: 'Basic T-Shirt Design',
                description: 'Clean and simple t-shirt template',
                category: 'T-Shirts',
                tags: ['t-shirt', 'basic', 'minimalist'],
                thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                preview: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                width: 400,
                height: 400,
                layers: [
                    {
                        id: 'bg',
                        name: 'Background',
                        type: 'shape',
                        content: 'rectangle',
                        x: 0,
                        y: 0,
                        width: 400,
                        height: 400,
                        rotation: 0,
                        opacity: 1,
                        blendMode: 'normal',
                        properties: { fillColor: '#FFFFFF' }
                    },
                    {
                        id: 'text',
                        name: 'Title Text',
                        type: 'text',
                        content: 'Your Text Here',
                        x: 200,
                        y: 200,
                        width: 200,
                        height: 50,
                        rotation: 0,
                        opacity: 1,
                        blendMode: 'normal',
                        properties: {
                            fontFamily: 'Arial',
                            fontSize: 24,
                            fontWeight: 'bold',
                            color: '#000000',
                            textAlign: 'center'
                        }
                    }
                ],
                createdAt: new Date().toISOString(),
                downloads: 1250,
                rating: 4.5
            },
            {
                id: 'business_card',
                name: 'Professional Business Card',
                description: 'Modern business card template',
                category: 'Business',
                tags: ['business', 'card', 'professional'],
                thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                preview: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                width: 350,
                height: 200,
                layers: [
                    {
                        id: 'bg',
                        name: 'Background',
                        type: 'shape',
                        content: 'rectangle',
                        x: 0,
                        y: 0,
                        width: 350,
                        height: 200,
                        rotation: 0,
                        opacity: 1,
                        blendMode: 'normal',
                        properties: { fillColor: '#2C3E50' }
                    },
                    {
                        id: 'logo',
                        name: 'Logo',
                        type: 'text',
                        content: 'LOGO',
                        x: 20,
                        y: 20,
                        width: 100,
                        height: 30,
                        rotation: 0,
                        opacity: 1,
                        blendMode: 'normal',
                        properties: {
                            fontFamily: 'Arial',
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: '#FFFFFF'
                        }
                    },
                    {
                        id: 'name',
                        name: 'Name',
                        type: 'text',
                        content: 'John Doe',
                        x: 20,
                        y: 80,
                        width: 200,
                        height: 30,
                        rotation: 0,
                        opacity: 1,
                        blendMode: 'normal',
                        properties: {
                            fontFamily: 'Arial',
                            fontSize: 16,
                            fontWeight: 'normal',
                            color: '#FFFFFF'
                        }
                    },
                    {
                        id: 'title',
                        name: 'Title',
                        type: 'text',
                        content: 'Software Engineer',
                        x: 20,
                        y: 110,
                        width: 200,
                        height: 20,
                        rotation: 0,
                        opacity: 1,
                        blendMode: 'normal',
                        properties: {
                            fontFamily: 'Arial',
                            fontSize: 12,
                            fontWeight: 'normal',
                            color: '#BDC3C7'
                        }
                    }
                ],
                createdAt: new Date().toISOString(),
                downloads: 890,
                rating: 4.2
            },
            {
                id: 'poster_event',
                name: 'Event Poster',
                description: 'Dynamic event poster template',
                category: 'Posters',
                tags: ['poster', 'event', 'dynamic'],
                thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                preview: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                width: 600,
                height: 800,
                layers: [
                    {
                        id: 'bg',
                        name: 'Background',
                        type: 'pattern',
                        content: 'gradient',
                        x: 0,
                        y: 0,
                        width: 600,
                        height: 800,
                        rotation: 0,
                        opacity: 1,
                        blendMode: 'normal',
                        properties: {
                            gradientType: 'linear',
                            colors: ['#FF6B6B', '#4ECDC4'],
                            angle: 45
                        }
                    },
                    {
                        id: 'title',
                        name: 'Event Title',
                        type: 'text',
                        content: 'EVENT TITLE',
                        x: 50,
                        y: 100,
                        width: 500,
                        height: 80,
                        rotation: 0,
                        opacity: 1,
                        blendMode: 'normal',
                        properties: {
                            fontFamily: 'Arial',
                            fontSize: 48,
                            fontWeight: 'bold',
                            color: '#FFFFFF',
                            textAlign: 'center'
                        }
                    },
                    {
                        id: 'date',
                        name: 'Date',
                        type: 'text',
                        content: 'January 1, 2024',
                        x: 50,
                        y: 200,
                        width: 500,
                        height: 40,
                        rotation: 0,
                        opacity: 1,
                        blendMode: 'normal',
                        properties: {
                            fontFamily: 'Arial',
                            fontSize: 24,
                            fontWeight: 'normal',
                            color: '#FFFFFF',
                            textAlign: 'center'
                        }
                    }
                ],
                createdAt: new Date().toISOString(),
                downloads: 2100,
                rating: 4.8
            }
        ];
        setTemplates(mockTemplates);
        setTemplateCategories(['All', 'T-Shirts', 'Business', 'Posters', 'Logos', 'Social Media']);
        // Console log removed
    }, []);
    // Load assets
    const loadAssets = useCallback(() => {
        // Console log removed
        const mockAssets = [
            {
                id: 'icon_heart',
                name: 'Heart Icon',
                type: 'icon',
                category: 'Icons',
                tags: ['heart', 'love', 'symbol'],
                thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDIxLjM1bC0xLjQ1LTEuMzJDNS40IDE1LjM2IDIgMTIuMjggMiA4LjVDMiA1LjQyIDQuNDIgMyA3LjUgM2M1LjU5IDAgMTAuNSA2LjU5IDEwLjUgMTEuNWgtLjVjMCA1LjU5LTQuOTEgMTAuNS0xMC41IDEwLjV6IiBmaWxsPSIjRkY2QjZCIi8+Cjwvc3ZnPgo=',
                url: 'heart-icon.svg',
                size: 1024,
                format: 'SVG',
                dimensions: { width: 24, height: 24 },
                license: 'Free',
                createdAt: new Date().toISOString(),
                downloads: 5000
            },
            {
                id: 'pattern_geometric',
                name: 'Geometric Pattern',
                type: 'pattern',
                category: 'Patterns',
                tags: ['geometric', 'abstract', 'modern'],
                thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                url: 'geometric-pattern.png',
                size: 51200,
                format: 'PNG',
                dimensions: { width: 200, height: 200 },
                license: 'Free',
                createdAt: new Date().toISOString(),
                downloads: 3200
            },
            {
                id: 'texture_paper',
                name: 'Paper Texture',
                type: 'texture',
                category: 'Textures',
                tags: ['paper', 'texture', 'vintage'],
                thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                url: 'paper-texture.jpg',
                size: 256000,
                format: 'JPG',
                dimensions: { width: 1024, height: 1024 },
                license: 'Free',
                createdAt: new Date().toISOString(),
                downloads: 1800
            }
        ];
        setAssetLibrary(prev => ({
            ...prev,
            assets: mockAssets,
            categories: ['All', 'Icons', 'Patterns', 'Textures', 'Fonts', 'Vectors']
        }));
        // Console log removed
    }, []);
    // Apply template
    const applyTemplate = useCallback((template) => {
        if (!composedCanvas || !commit) {
            // Console log removed
            return;
        }
        // Console log removed
        // Clear current canvas
        const ctx = composedCanvas.getContext('2d');
        ctx.clearRect(0, 0, composedCanvas.width, composedCanvas.height);
        // Resize canvas to template dimensions
        composedCanvas.width = template.width;
        composedCanvas.height = template.height;
        // Apply template layers
        template.layers.forEach(layer => {
            ctx.save();
            ctx.globalAlpha = layer.opacity;
            ctx.globalCompositeOperation = layer.blendMode;
            ctx.translate(layer.x, layer.y);
            ctx.rotate(layer.rotation * Math.PI / 180);
            switch (layer.type) {
                case 'text':
                    ctx.fillStyle = layer.properties.color || '#000000';
                    ctx.font = `${layer.properties.fontWeight || 'normal'} ${layer.properties.fontSize || 16}px ${layer.properties.fontFamily || 'Arial'}`;
                    ctx.textAlign = layer.properties.textAlign || 'left';
                    ctx.fillText(layer.content, 0, layer.height);
                    break;
                case 'shape':
                    if (layer.content === 'rectangle') {
                        ctx.fillStyle = layer.properties.fillColor || '#000000';
                        ctx.fillRect(0, 0, layer.width, layer.height);
                    }
                    break;
                case 'pattern':
                    if (layer.content === 'gradient') {
                        const gradient = ctx.createLinearGradient(0, 0, layer.width, layer.height);
                        layer.properties.colors.forEach((color, index) => {
                            gradient.addColorStop(index / (layer.properties.colors.length - 1), color);
                        });
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, layer.width, layer.height);
                    }
                    break;
            }
            ctx.restore();
        });
        // Commit changes
        commit();
        // Console log removed
    }, [composedCanvas, commit]);
    // Preview template
    const handlePreviewTemplate = useCallback((template) => {
        // Console log removed
        setPreviewTemplate(template);
        setPreviewMode(true);
        // Create preview canvas
        if (!previewCanvasRef.current) {
            const previewCanvas = document.createElement('canvas');
            previewCanvas.width = template.width;
            previewCanvas.height = template.height;
            previewCanvasRef.current = previewCanvas;
        }
        else {
            previewCanvasRef.current.width = template.width;
            previewCanvasRef.current.height = template.height;
        }
        const ctx = previewCanvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, template.width, template.height);
        // Render template layers
        template.layers.forEach(layer => {
            ctx.save();
            ctx.globalAlpha = layer.opacity;
            ctx.globalCompositeOperation = layer.blendMode;
            ctx.translate(layer.x, layer.y);
            ctx.rotate(layer.rotation * Math.PI / 180);
            switch (layer.type) {
                case 'text':
                    ctx.fillStyle = layer.properties.color || '#000000';
                    ctx.font = `${layer.properties.fontWeight || 'normal'} ${layer.properties.fontSize || 16}px ${layer.properties.fontFamily || 'Arial'}`;
                    ctx.textAlign = layer.properties.textAlign || 'left';
                    ctx.fillText(layer.content, 0, layer.height);
                    break;
                case 'shape':
                    if (layer.content === 'rectangle') {
                        ctx.fillStyle = layer.properties.fillColor || '#000000';
                        ctx.fillRect(0, 0, layer.width, layer.height);
                    }
                    break;
                case 'pattern':
                    if (layer.content === 'gradient') {
                        const gradient = ctx.createLinearGradient(0, 0, layer.width, layer.height);
                        layer.properties.colors.forEach((color, index) => {
                            gradient.addColorStop(index / (layer.properties.colors.length - 1), color);
                        });
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, layer.width, layer.height);
                    }
                    break;
            }
            ctx.restore();
        });
        // Console log removed
    }, []);
    // Add asset to design
    const addAssetToDesign = useCallback((asset) => {
        if (!composedCanvas || !commit) {
            // Console log removed
            return;
        }
        // Console log removed
        // In a real implementation, this would load the asset and add it to the canvas
        // For now, we'll just log it
        // Console log removed
    }, [composedCanvas, commit]);
    // Filter templates
    const filteredTemplates = useCallback(() => {
        let filtered = templates;
        // Filter by category
        if (templateSearchQuery) {
            filtered = filtered.filter(template => template.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
                template.description.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
                template.tags.some(tag => tag.toLowerCase().includes(templateSearchQuery.toLowerCase())));
        }
        // Sort templates
        filtered.sort((a, b) => {
            let aValue, bValue;
            switch (templateSortBy) {
                case 'name':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'date':
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
                case 'downloads':
                    aValue = a.downloads;
                    bValue = b.downloads;
                    break;
                case 'rating':
                    aValue = a.rating;
                    bValue = b.rating;
                    break;
                default:
                    return 0;
            }
            if (templateSortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            }
            else {
                return aValue < bValue ? 1 : -1;
            }
        });
        return filtered;
    }, [templates, templateSearchQuery, templateSortBy, templateSortOrder]);
    // Filter assets
    const filteredAssets = useCallback(() => {
        let filtered = assetLibrary.assets;
        // Filter by category
        if (assetLibrary.selectedCategory !== 'all') {
            filtered = filtered.filter(asset => asset.category === assetLibrary.selectedCategory);
        }
        // Filter by search query
        if (assetLibrary.searchQuery) {
            filtered = filtered.filter(asset => asset.name.toLowerCase().includes(assetLibrary.searchQuery.toLowerCase()) ||
                asset.tags.some(tag => tag.toLowerCase().includes(assetLibrary.searchQuery.toLowerCase())));
        }
        // Sort assets
        filtered.sort((a, b) => {
            let aValue, bValue;
            switch (assetLibrary.sortBy) {
                case 'name':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'date':
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
                case 'downloads':
                    aValue = a.downloads;
                    bValue = b.downloads;
                    break;
                default:
                    return 0;
            }
            if (assetLibrary.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            }
            else {
                return aValue < bValue ? 1 : -1;
            }
        });
        return filtered;
    }, [assetLibrary]);
    if (!active) {
        // Console log removed
        return null;
    }
    console.log('📚 DesignTemplates: Rendering component', {
        activeTab,
        templatesCount: templates.length,
        assetsCount: assetLibrary.assets.length
    });
    return (_jsxs("div", { className: "design-templates", style: {
            border: '2px solid #10B981',
            borderRadius: '8px',
            padding: '12px',
            background: 'rgba(16, 185, 129, 0.1)',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
            marginTop: '12px'
        }, children: [_jsxs("div", { className: "templates-header", style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                }, children: [_jsx("h4", { style: { margin: 0, color: '#10B981', fontSize: '16px' }, children: "\uD83D\uDCDA Design Templates & Assets" }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { className: `btn ${activeTab === 'templates' ? 'active' : ''}`, onClick: () => setActiveTab('templates'), style: {
                                    background: activeTab === 'templates' ? '#10B981' : '#6B7280',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, children: "Templates" }), _jsx("button", { className: `btn ${activeTab === 'assets' ? 'active' : ''}`, onClick: () => setActiveTab('assets'), style: {
                                    background: activeTab === 'assets' ? '#10B981' : '#6B7280',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, children: "Assets" }), _jsx("button", { className: "btn", onClick: () => useApp.getState().setTool('brush'), style: {
                                    background: '#6B7280',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, title: "Close Design Templates", children: "\u2715 Close" })] })] }), _jsx("div", { className: "search-filters", style: {
                    marginBottom: '12px'
                }, children: _jsxs("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        marginBottom: '8px'
                    }, children: [_jsx("input", { type: "text", placeholder: activeTab === 'templates' ? 'Search templates...' : 'Search assets...', value: activeTab === 'templates' ? templateSearchQuery : assetLibrary.searchQuery, onChange: (e) => {
                                if (activeTab === 'templates') {
                                    setTemplateSearchQuery(e.target.value);
                                }
                                else {
                                    setAssetLibrary(prev => ({ ...prev, searchQuery: e.target.value }));
                                }
                            }, style: {
                                padding: '8px',
                                border: '1px solid #10B981',
                                borderRadius: '4px',
                                fontSize: '12px'
                            } }), _jsxs("select", { value: activeTab === 'templates' ? templateSortBy : assetLibrary.sortBy, onChange: (e) => {
                                if (activeTab === 'templates') {
                                    setTemplateSortBy(e.target.value);
                                }
                                else {
                                    setAssetLibrary(prev => ({ ...prev, sortBy: e.target.value }));
                                }
                            }, style: {
                                padding: '8px',
                                border: '1px solid #10B981',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }, children: [_jsx("option", { value: "name", children: "Name" }), _jsx("option", { value: "date", children: "Date" }), _jsx("option", { value: "downloads", children: "Downloads" }), activeTab === 'templates' && _jsx("option", { value: "rating", children: "Rating" })] })] }) }), activeTab === 'templates' && (_jsxs("div", { className: "templates-content", children: [_jsxs("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#10B981', marginBottom: '8px' }, children: ["Templates (", filteredTemplates().length, ")"] }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: '12px',
                            maxHeight: '400px',
                            overflowY: 'auto'
                        }, children: filteredTemplates().map(template => (_jsxs("div", { className: "template-item", style: {
                                padding: '8px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '4px',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                cursor: 'pointer',
                                textAlign: 'center'
                            }, onClick: () => handlePreviewTemplate(template), children: [_jsxs("div", { style: {
                                        width: '100%',
                                        height: '100px',
                                        background: '#F3F4F6',
                                        borderRadius: '4px',
                                        marginBottom: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        color: '#6B7280'
                                    }, children: [template.width, "x", template.height] }), _jsx("div", { style: { fontSize: '11px', fontWeight: 'bold', color: '#10B981', marginBottom: '4px' }, children: template.name }), _jsx("div", { style: { fontSize: '10px', color: '#6B7280', marginBottom: '4px' }, children: template.category }), _jsxs("div", { style: { fontSize: '9px', color: '#6B7280' }, children: [template.downloads, " downloads \u2022 \u2B50 ", template.rating] }), _jsxs("div", { style: { display: 'flex', gap: '4px', marginTop: '8px' }, children: [_jsx("button", { className: "btn", onClick: (e) => {
                                                e.stopPropagation();
                                                applyTemplate(template);
                                            }, style: {
                                                background: '#10B981',
                                                color: 'white',
                                                fontSize: '10px',
                                                padding: '4px 8px',
                                                flex: 1
                                            }, children: "Use" }), _jsx("button", { className: "btn", onClick: (e) => {
                                                e.stopPropagation();
                                                handlePreviewTemplate(template);
                                            }, style: {
                                                background: '#6B7280',
                                                color: 'white',
                                                fontSize: '10px',
                                                padding: '4px 8px',
                                                flex: 1
                                            }, children: "Preview" })] })] }, template.id))) })] })), activeTab === 'assets' && (_jsxs("div", { className: "assets-content", children: [_jsxs("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#10B981', marginBottom: '8px' }, children: ["Assets (", filteredAssets().length, ")"] }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                            gap: '12px',
                            maxHeight: '400px',
                            overflowY: 'auto'
                        }, children: filteredAssets().map(asset => (_jsxs("div", { className: "asset-item", style: {
                                padding: '8px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '4px',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                cursor: 'pointer',
                                textAlign: 'center'
                            }, onClick: () => addAssetToDesign(asset), children: [_jsx("div", { style: {
                                        width: '100%',
                                        height: '80px',
                                        background: '#F3F4F6',
                                        borderRadius: '4px',
                                        marginBottom: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        color: '#6B7280'
                                    }, children: asset.type.toUpperCase() }), _jsx("div", { style: { fontSize: '11px', fontWeight: 'bold', color: '#10B981', marginBottom: '4px' }, children: asset.name }), _jsx("div", { style: { fontSize: '10px', color: '#6B7280', marginBottom: '4px' }, children: asset.category }), _jsxs("div", { style: { fontSize: '9px', color: '#6B7280' }, children: [asset.format, " \u2022 ", Math.round(asset.size / 1024), "KB"] }), _jsx("button", { className: "btn", onClick: (e) => {
                                        e.stopPropagation();
                                        addAssetToDesign(asset);
                                    }, style: {
                                        background: '#10B981',
                                        color: 'white',
                                        fontSize: '10px',
                                        padding: '4px 8px',
                                        width: '100%',
                                        marginTop: '8px'
                                    }, children: "Add to Design" })] }, asset.id))) })] })), previewMode && previewTemplate && (_jsx("div", { style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }, children: _jsxs("div", { style: {
                        background: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        maxWidth: '80%',
                        maxHeight: '80%',
                        overflow: 'auto'
                    }, children: [_jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px'
                            }, children: [_jsx("h3", { style: { margin: 0, color: '#10B981' }, children: previewTemplate.name }), _jsx("button", { className: "btn", onClick: () => setPreviewMode(false), style: {
                                        background: '#EF4444',
                                        color: 'white',
                                        fontSize: '12px',
                                        padding: '6px 12px'
                                    }, children: "Close" })] }), _jsx("div", { style: { textAlign: 'center', marginBottom: '16px' }, children: _jsx("canvas", { ref: previewCanvasRef, width: previewTemplate.width, height: previewTemplate.height, style: {
                                    maxWidth: '100%',
                                    height: 'auto',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '4px'
                                } }) }), _jsx("div", { style: { display: 'flex', gap: '8px', justifyContent: 'center' }, children: _jsx("button", { className: "btn", onClick: () => {
                                    applyTemplate(previewTemplate);
                                    setPreviewMode(false);
                                }, style: {
                                    background: '#10B981',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '8px 16px'
                                }, children: "Use Template" }) })] }) })), _jsx("div", { style: { fontSize: '12px', color: '#6B7280', textAlign: 'center', marginTop: '8px' }, children: "Browse templates and assets to enhance your designs" })] }));
}
