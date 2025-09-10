import React, { useState } from 'react';
import { useApp } from '../App';
import { vectorStore } from '../vector/vectorState';
import VectorSettingsPanel from './VectorSettingsPanel';
import ErrorMonitoringDashboard from './ErrorMonitoringDashboard';

interface VectorToolbarProps {
  isVisible: boolean;
  onClose: () => void;
}

const VectorToolbar: React.FC<VectorToolbarProps> = ({ isVisible, onClose }) => {
  const { activeTool, setActiveTool, vectorMode, setVectorMode } = useApp();
  const [selectedVectorTool, setSelectedVectorTool] = useState<string>('pen');
  const [showSettings, setShowSettings] = useState(false);
  const [showErrorDashboard, setShowErrorDashboard] = useState(false);
  
  // Sync with vector store state
  React.useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = vectorStore.subscribe(() => {
      if (!isMounted) return;
      
      try {
        const state = vectorStore.getState();
        setSelectedVectorTool(state.tool);
      } catch (error) {
        console.error('Error syncing vector tool state:', error);
      }
    });
    
    // Set initial tool
    try {
      const state = vectorStore.getState();
      setSelectedVectorTool(state.tool);
    } catch (error) {
      console.error('Error setting initial vector tool:', error);
    }
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const vectorTools = [
    // Drawing Tools
    { id: 'pen', name: 'Pen Tool', icon: '✏️', description: 'Draw vector paths', category: 'drawing' },
    { id: 'curvature', name: 'Curvature Tool', icon: '🌊', description: 'Create smooth curves', category: 'drawing' },
    
    // Selection Tools
    { id: 'pathSelection', name: 'Select Tool', icon: '↖️', description: 'Select and move paths', category: 'selection' },
    { id: 'marqueeRect', name: 'Rectangular Marquee', icon: '⬜', description: 'Rectangular selection', category: 'selection' },
    { id: 'marqueeEllipse', name: 'Elliptical Marquee', icon: '⭕', description: 'Elliptical selection', category: 'selection' },
    { id: 'lasso', name: 'Lasso Tool', icon: '🪃', description: 'Freehand selection', category: 'selection' },
    { id: 'polygonLasso', name: 'Polygon Lasso', icon: '🔷', description: 'Polygonal selection', category: 'selection' },
    { id: 'magneticLasso', name: 'Magnetic Lasso', icon: '🧲', description: 'Magnetic selection', category: 'selection' },
    { id: 'magicWand', name: 'Magic Wand', icon: '🪄', description: 'Color-based selection', category: 'selection' },
    
    // Path Editing Tools
    { id: 'addAnchor', name: 'Add Anchor', icon: '➕', description: 'Add anchor points', category: 'editing' },
    { id: 'removeAnchor', name: 'Remove Anchor', icon: '➖', description: 'Remove anchor points', category: 'editing' },
    { id: 'convertAnchor', name: 'Convert Anchor', icon: '🔄', description: 'Convert anchor point types', category: 'editing' },
    
    // Transform Tools
    { id: 'transform', name: 'Transform', icon: '🔄', description: 'Transform objects', category: 'transform' },
    { id: 'scale', name: 'Scale', icon: '📏', description: 'Scale objects', category: 'transform' },
    { id: 'rotate', name: 'Rotate', icon: '🔄', description: 'Rotate objects', category: 'transform' },
    { id: 'skew', name: 'Skew', icon: '📐', description: 'Skew objects', category: 'transform' },
    { id: 'perspective', name: 'Perspective', icon: '🏗️', description: 'Perspective transform', category: 'transform' }
  ];

  const handleVectorToolSelect = (toolId: string) => {
    setSelectedVectorTool(toolId);
    // Update the vector store with the selected tool
    vectorStore.set('tool', toolId as any);
    console.log(`🎨 Vector tool selected: ${toolId}`);
  };

  const handleClearAll = () => {
    try {
      vectorStore.setAll({ shapes: [], selected: [], currentPath: null });
      // Dispatch event to clear the canvas
      window.dispatchEvent(new CustomEvent('clearActiveLayer'));
      console.log('🎨 Vector shapes cleared');
    } catch (error) {
      console.error('Error clearing vector shapes:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '12px 20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '60px'
    }}>
      {/* Left side - Vector Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🎨</span>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Vector Tools</h3>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          {['drawing', 'selection', 'editing', 'transform'].map((category) => (
            <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {category}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {vectorTools
                  .filter(tool => tool.category === category)
                  .map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleVectorToolSelect(tool.id)}
                      style={{
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '6px',
                        background: selectedVectorTool === tool.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                        border: selectedVectorTool === tool.id ? '2px solid rgba(255,255,255,0.5)' : '2px solid transparent',
                        minWidth: '80px',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedVectorTool !== tool.id) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedVectorTool !== tool.id) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        }
                      }}
                      title={tool.description}
                    >
                      <span style={{ fontSize: '14px' }}>{tool.icon}</span>
                      <span style={{ fontSize: '11px' }}>{tool.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center - Active Tool Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          padding: '6px 12px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Active: {activeTool} • Vector: {vectorMode ? 'ON' : 'OFF'}
        </div>
      </div>

      {/* Right side - Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Grid Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              const { showGrid, setShowGrid } = useApp.getState();
              setShowGrid(!showGrid);
            }}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '6px',
              background: useApp.getState().showGrid ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            title="Toggle Grid"
          >
            📐 Grid
          </button>
          
          <button
            onClick={() => {
              const { showRulers, setShowRulers } = useApp.getState();
              setShowRulers(!showRulers);
            }}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '6px',
              background: useApp.getState().showRulers ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            title="Toggle Rulers"
          >
            📏 Rulers
          </button>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              const { undo } = useApp.getState();
              undo();
            }}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.2)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            title="Undo"
          >
            ⏪ Undo
          </button>
          
          <button
            onClick={() => {
              const { redo } = useApp.getState();
              redo();
            }}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.2)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            title="Redo"
          >
            ⏩ Redo
          </button>
          
          <button
            onClick={() => {
              // Save functionality
              console.log('💾 Save clicked');
            }}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '6px',
              background: 'rgba(139, 92, 246, 0.2)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            title="Save"
          >
            💾 Save
          </button>
        </div>

        {/* Vector Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowErrorDashboard(!showErrorDashboard)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              background: showErrorDashboard ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!showErrorDashboard) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showErrorDashboard) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }
            }}
            title="Error Monitoring Dashboard"
          >
            🚨 Errors
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              background: showSettings ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!showSettings) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showSettings) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }
            }}
            title="Vector Settings"
          >
            ⚙️ Settings
          </button>
          
          <button
            onClick={handleClearAll}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
          >
            🗑️ Clear All
          </button>
          
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>
      
      {/* Settings Panel */}
      <VectorSettingsPanel 
        isVisible={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      
      {/* Error Monitoring Dashboard */}
      <ErrorMonitoringDashboard 
        isVisible={showErrorDashboard} 
        onClose={() => setShowErrorDashboard(false)} 
      />
    </div>
  );
};

export default VectorToolbar;
