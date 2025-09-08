import React, { useState } from 'react';
import { useApp } from '../App';

interface FeatureShowcaseProps {
  active: boolean;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  status: 'completed' | 'in-progress' | 'planned';
  tools: string[];
}

export function FeatureShowcase({ active }: FeatureShowcaseProps) {
  // Component initialized

  const setTool = useApp(s => s.setTool);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const features: Feature[] = [
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

  const handleToolSelect = (toolId: string) => {
    // Console log removed
    setTool(toolId as any);
  };

  if (!active) {
    // Not active - returning null
    return null;
  }

  // Rendering component

  return (
    <div className="feature-showcase" style={{
      border: '2px solid #8B5CF6',
      borderRadius: '8px',
      padding: '16px',
      background: 'rgba(139, 92, 246, 0.1)',
      boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
      marginTop: '12px'
    }}>
      <div className="showcase-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h4 style={{ margin: 0, color: '#8B5CF6', fontSize: '18px' }}>
          🎯 Feature Showcase
        </h4>
        <div style={{ fontSize: '12px', color: '#A78BFA' }}>
          {filteredFeatures.length} features
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter" style={{
        marginBottom: '16px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6', marginBottom: '8px' }}>
          Categories
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
              style={{
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
              }}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="features-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '12px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {filteredFeatures.map(feature => (
          <div
            key={feature.id}
            className="feature-card"
            style={{
              padding: '12px',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>{feature.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#8B5CF6',
                  marginBottom: '2px'
                }}>
                  {feature.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#A78BFA',
                  textTransform: 'capitalize'
                }}>
                  {feature.category}
                </div>
              </div>
              <div style={{
                padding: '2px 6px',
                background: feature.status === 'completed' ? '#10B981' : 
                           feature.status === 'in-progress' ? '#F59E0B' : '#6B7280',
                color: 'white',
                borderRadius: '4px',
                fontSize: '9px',
                fontWeight: 'bold'
              }}>
                {feature.status === 'completed' ? '✓' : 
                 feature.status === 'in-progress' ? '⏳' : '📋'}
              </div>
            </div>

            <div style={{
              fontSize: '12px',
              color: '#D1D5DB',
              marginBottom: '8px',
              lineHeight: '1.4'
            }}>
              {feature.description}
            </div>

            <div className="feature-tools" style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px'
            }}>
              {feature.tools.map(toolId => (
                <button
                  key={toolId}
                  className="tool-btn"
                  onClick={() => handleToolSelect(toolId)}
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(139, 92, 246, 0.2)',
                    color: '#A78BFA',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '4px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#8B5CF6';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                    e.currentTarget.style.color = '#A78BFA';
                  }}
                >
                  {toolId}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="summary-stats" style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(139, 92, 246, 0.1)',
        borderRadius: '6px',
        border: '1px solid rgba(139, 92, 246, 0.3)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10B981' }}>
              {features.filter(f => f.status === 'completed').length}
            </div>
            <div style={{ fontSize: '11px', color: '#A78BFA' }}>Completed</div>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#F59E0B' }}>
              {features.filter(f => f.status === 'in-progress').length}
            </div>
            <div style={{ fontSize: '11px', color: '#A78BFA' }}>In Progress</div>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8B5CF6' }}>
              {features.length}
            </div>
            <div style={{ fontSize: '11px', color: '#A78BFA' }}>Total Features</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ 
        fontSize: '12px', 
        color: '#6B7280', 
        textAlign: 'center', 
        marginTop: '12px',
        fontStyle: 'italic'
      }}>
        Click on any tool to activate it and start designing!
      </div>
    </div>
  );
}

