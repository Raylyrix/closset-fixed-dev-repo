import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../App';

interface DesignTemplatesProps {
  active: boolean;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string;
  preview: string;
  width: number;
  height: number;
  layers: TemplateLayer[];
  createdAt: string;
  downloads: number;
  rating: number;
}

interface TemplateLayer {
  id: string;
  name: string;
  type: 'image' | 'text' | 'shape' | 'pattern';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  properties: Record<string, any>;
}

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'icon' | 'pattern' | 'texture' | 'font' | 'vector';
  category: string;
  tags: string[];
  thumbnail: string;
  url: string;
  size: number;
  format: string;
  dimensions: { width: number; height: number };
  license: string;
  createdAt: string;
  downloads: number;
}

interface AssetLibrary {
  categories: string[];
  assets: Asset[];
  searchQuery: string;
  selectedCategory: string;
  sortBy: 'name' | 'date' | 'downloads' | 'rating';
  sortOrder: 'asc' | 'desc';
}

export function DesignTemplates({ active }: DesignTemplatesProps) {
  // Console log removed

  const {
    composedCanvas,
    activeTool,
    brushColor,
    brushSize,
    layers,
    activeLayerId,
    commit
  } = useApp();

  // Templates state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateCategories, setTemplateCategories] = useState<string[]>([]);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateSortBy, setTemplateSortBy] = useState<'name' | 'date' | 'downloads' | 'rating'>('downloads');
  const [templateSortOrder, setTemplateSortOrder] = useState<'asc' | 'desc'>('desc');

  // Asset library state
  const [assetLibrary, setAssetLibrary] = useState<AssetLibrary>({
    categories: [],
    assets: [],
    searchQuery: '',
    selectedCategory: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'templates' | 'assets'>('templates');
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Refs
  const templateCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

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

    const mockTemplates: Template[] = [
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

    const mockAssets: Asset[] = [
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
  const applyTemplate = useCallback((template: Template) => {
    if (!composedCanvas || !commit) {
      // Console log removed
      return;
    }

    // Console log removed

    // Clear current canvas
    const ctx = composedCanvas.getContext('2d')!;
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
            layer.properties.colors.forEach((color: string, index: number) => {
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
  const handlePreviewTemplate = useCallback((template: Template) => {
    // Console log removed

    setPreviewTemplate(template);
    setPreviewMode(true);

    // Create preview canvas
    if (!previewCanvasRef.current) {
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = template.width;
      previewCanvas.height = template.height;
      previewCanvasRef.current = previewCanvas;
    } else {
      previewCanvasRef.current.width = template.width;
      previewCanvasRef.current.height = template.height;
    }

    const ctx = previewCanvasRef.current.getContext('2d')!;
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
            layer.properties.colors.forEach((color: string, index: number) => {
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
  const addAssetToDesign = useCallback((asset: Asset) => {
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
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(templateSearchQuery.toLowerCase()))
      );
    }

    // Sort templates
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
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
      } else {
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
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(assetLibrary.searchQuery.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(assetLibrary.searchQuery.toLowerCase()))
      );
    }

    // Sort assets
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
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
      } else {
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

  return (
    <div className="design-templates" style={{
      border: '2px solid #10B981',
      borderRadius: '8px',
      padding: '12px',
      background: 'rgba(16, 185, 129, 0.1)',
      boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
      marginTop: '12px'
    }}>
      <div className="templates-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h4 style={{ margin: 0, color: '#10B981', fontSize: '16px' }}>
          📚 Design Templates & Assets
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
            style={{
              background: activeTab === 'templates' ? '#10B981' : '#6B7280',
              color: 'white',
              fontSize: '12px',
              padding: '6px 12px'
            }}
          >
            Templates
          </button>
          <button
            className={`btn ${activeTab === 'assets' ? 'active' : ''}`}
            onClick={() => setActiveTab('assets')}
            style={{
              background: activeTab === 'assets' ? '#10B981' : '#6B7280',
              color: 'white',
              fontSize: '12px',
              padding: '6px 12px'
            }}
          >
            Assets
          </button>
          <button
            className="btn"
            onClick={() => useApp.getState().setTool('brush')}
            style={{
              background: '#6B7280',
              color: 'white',
              fontSize: '12px',
              padding: '6px 12px'
            }}
            title="Close Design Templates"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters" style={{
        marginBottom: '12px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <input
            type="text"
            placeholder={activeTab === 'templates' ? 'Search templates...' : 'Search assets...'}
            value={activeTab === 'templates' ? templateSearchQuery : assetLibrary.searchQuery}
            onChange={(e) => {
              if (activeTab === 'templates') {
                setTemplateSearchQuery(e.target.value);
              } else {
                setAssetLibrary(prev => ({ ...prev, searchQuery: e.target.value }));
              }
            }}
            style={{
              padding: '8px',
              border: '1px solid #10B981',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          />
          <select
            value={activeTab === 'templates' ? templateSortBy : assetLibrary.sortBy}
            onChange={(e) => {
              if (activeTab === 'templates') {
                setTemplateSortBy(e.target.value as any);
              } else {
                setAssetLibrary(prev => ({ ...prev, sortBy: e.target.value as any }));
              }
            }}
            style={{
              padding: '8px',
              border: '1px solid #10B981',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            <option value="name">Name</option>
            <option value="date">Date</option>
            <option value="downloads">Downloads</option>
            {activeTab === 'templates' && <option value="rating">Rating</option>}
          </select>
        </div>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="templates-content">
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10B981', marginBottom: '8px' }}>
            Templates ({filteredTemplates().length})
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '12px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {filteredTemplates().map(template => (
              <div
                key={template.id}
                className="template-item"
                style={{
                  padding: '8px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '4px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
                onClick={() => handlePreviewTemplate(template)}
              >
                <div style={{
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
                }}>
                  {template.width}x{template.height}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#10B981', marginBottom: '4px' }}>
                  {template.name}
                </div>
                <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '4px' }}>
                  {template.category}
                </div>
                <div style={{ fontSize: '9px', color: '#6B7280' }}>
                  {template.downloads} downloads • ⭐ {template.rating}
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  <button
                    className="btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyTemplate(template);
                    }}
                    style={{
                      background: '#10B981',
                      color: 'white',
                      fontSize: '10px',
                      padding: '4px 8px',
                      flex: 1
                    }}
                  >
                    Use
                  </button>
                  <button
                    className="btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewTemplate(template);
                    }}
                    style={{
                      background: '#6B7280',
                      color: 'white',
                      fontSize: '10px',
                      padding: '4px 8px',
                      flex: 1
                    }}
                  >
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="assets-content">
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10B981', marginBottom: '8px' }}>
            Assets ({filteredAssets().length})
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '12px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {filteredAssets().map(asset => (
              <div
                key={asset.id}
                className="asset-item"
                style={{
                  padding: '8px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '4px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
                onClick={() => addAssetToDesign(asset)}
              >
                <div style={{
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
                }}>
                  {asset.type.toUpperCase()}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#10B981', marginBottom: '4px' }}>
                  {asset.name}
                </div>
                <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '4px' }}>
                  {asset.category}
                </div>
                <div style={{ fontSize: '9px', color: '#6B7280' }}>
                  {asset.format} • {Math.round(asset.size / 1024)}KB
                </div>
                <button
                  className="btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    addAssetToDesign(asset);
                  }}
                  style={{
                    background: '#10B981',
                    color: 'white',
                    fontSize: '10px',
                    padding: '4px 8px',
                    width: '100%',
                    marginTop: '8px'
                  }}
                >
                  Add to Design
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {previewMode && previewTemplate && (
        <div style={{
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
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '80%',
            maxHeight: '80%',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ margin: 0, color: '#10B981' }}>
                {previewTemplate.name}
              </h3>
              <button
                className="btn"
                onClick={() => setPreviewMode(false)}
                style={{
                  background: '#EF4444',
                  color: 'white',
                  fontSize: '12px',
                  padding: '6px 12px'
                }}
              >
                Close
              </button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <canvas
                ref={previewCanvasRef}
                width={previewTemplate.width}
                height={previewTemplate.height}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  border: '1px solid #E5E7EB',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                className="btn"
                onClick={() => {
                  applyTemplate(previewTemplate);
                  setPreviewMode(false);
                }}
                style={{
                  background: '#10B981',
                  color: 'white',
                  fontSize: '12px',
                  padding: '8px 16px'
                }}
              >
                Use Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center', marginTop: '8px' }}>
        Browse templates and assets to enhance your designs
      </div>
    </div>
  );
}
