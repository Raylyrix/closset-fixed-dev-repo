import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from './Navigation';
import { Toolbar } from './Toolbar';
import { RightPanel } from './RightPanel';
import { LeftPanel } from './LeftPanel';
import { GridOverlay } from './GridOverlay';
import { VectorOverlay } from './VectorOverlay';
import VectorToolbar from './VectorToolbar';
import { useApp } from '../App';
import { vectorStore } from '../vector/vectorStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

// Grid & Scale Controls for Main Toolbar
const GridToolbarControls = () => {
  const { 
    showGrid, setShowGrid,
    showRulers, setShowRulers,
    snapToGrid, setSnapToGrid,
    scale, setScale,
    gridSize, setGridSize,
    gridColor, setGridColor,
    gridOpacity, setGridOpacity,
    rulerUnits, setRulerUnits,
    snapDistance, setSnapDistance
  } = useApp();
  
  const [showScaleMenu, setShowScaleMenu] = useState(false);
  const [showGridMenu, setShowGridMenu] = useState(false);
  const scaleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (scaleRef.current && !scaleRef.current.contains(event.target as Node)) {
        setShowScaleMenu(false);
      }
      if (gridRef.current && !gridRef.current.contains(event.target as Node)) {
        setShowGridMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {/* Grid Toggle */}
      <button
        onClick={() => setShowGrid(!showGrid)}
        style={{
          padding: '8px 12px',
          background: showGrid ? '#10B981' : '#475569',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.2s ease'
        }}
        title="Toggle Grid"
      >
        <span>📐</span>
        <span>Grid</span>
      </button>

      {/* Rulers Toggle */}
      <button
        onClick={() => setShowRulers(!showRulers)}
        style={{
          padding: '8px 12px',
          background: showRulers ? '#10B981' : '#475569',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.2s ease'
        }}
        title="Toggle Rulers"
      >
        <span>📏</span>
        <span>Rulers</span>
      </button>

      {/* Snap Toggle */}
      <button
        onClick={() => setSnapToGrid(!snapToGrid)}
        style={{
          padding: '8px 12px',
          background: snapToGrid ? '#10B981' : '#475569',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.2s ease'
        }}
        title="Toggle Snap to Grid"
      >
        <span>🧲</span>
        <span>Snap</span>
      </button>

      {/* Scale Controls */}
      <div ref={scaleRef} style={{ position: 'relative', zIndex: 10003 }}>
        <button
          onClick={() => setShowScaleMenu(!showScaleMenu)}
          style={{
            padding: '8px 12px',
            background: '#475569',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease'
          }}
          title="Scale Controls"
        >
          <span>🔍</span>
          <span>{Math.round(scale * 100)}%</span>
        </button>
        
        {showScaleMenu && (
          <>
            {/* Modal Backdrop */}
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 99999999998,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} onClick={() => setShowScaleMenu(false)}>
              {/* Modal Content */}
              <div style={{
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '24px',
                minWidth: '350px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflowY: 'auto',
                zIndex: 99999999999,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                position: 'relative'
              }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#10B981'
              }}>
                Scale Settings
              </h4>
              <button
                onClick={() => setShowScaleMenu(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#E2E8F0',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                ✕ Close
              </button>
            </div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#E2E8F0',
              fontSize: '12px'
            }}>
              Scale: {Math.round(scale * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#10B981'
              }}
            />
            <div style={{
              display: 'flex',
              gap: '4px',
              marginTop: '8px'
            }}>
              <button
                onClick={() => setScale(0.5)}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  background: '#6B7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
              >
                50%
              </button>
              <button
                onClick={() => setScale(1.0)}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  background: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
              >
                100%
              </button>
              <button
                onClick={() => setScale(2.0)}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  background: '#6B7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
              >
                200%
              </button>
            </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Grid Settings */}
      <div ref={gridRef} style={{ position: 'relative', zIndex: 10003 }}>
        <button
          onClick={() => setShowGridMenu(!showGridMenu)}
          style={{
            padding: '8px 12px',
            background: '#475569',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease'
          }}
          title="Grid Settings"
        >
          <span>⚙️</span>
          <span>Settings</span>
        </button>
        
        {showGridMenu && (
          <>
            {/* Modal Backdrop */}
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 99999999998,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} onClick={() => setShowGridMenu(false)}>
              {/* Modal Content */}
              <div style={{
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '24px',
                minWidth: '400px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflowY: 'auto',
                zIndex: 99999999999,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                position: 'relative'
              }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#10B981'
              }}>
                Grid Settings
              </h4>
              <button
                onClick={() => setShowGridMenu(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#E2E8F0',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                ✕ Close
              </button>
            </div>
            
            {/* Grid Size */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
                color: '#E2E8F0',
                fontSize: '12px'
              }}>Grid Size: {gridSize}px</label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#10B981'
                }}
              />
            </div>
            
            {/* Grid Color */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
                color: '#E2E8F0',
                fontSize: '12px'
              }}>Grid Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={gridColor}
                  onChange={(e) => setGridColor(e.target.value)}
                  style={{
                    width: '30px',
                    height: '30px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={gridOpacity}
                  onChange={(e) => setGridOpacity(Number(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: '#10B981'
                  }}
                />
                <span style={{ fontSize: '10px', color: '#9CA3AF', minWidth: '30px' }}>
                  {Math.round(gridOpacity * 100)}%
                </span>
              </div>
            </div>
            
            {/* Units */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
                color: '#E2E8F0',
                fontSize: '12px'
              }}>Units</label>
              <select
                value={rulerUnits}
                onChange={(e) => setRulerUnits(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#E2E8F0',
                  fontSize: '12px'
                }}
              >
                <option value="px">Pixels (px)</option>
                <option value="mm">Millimeters (mm)</option>
                <option value="in">Inches (in)</option>
              </select>
            </div>
            
            {/* Snap Distance */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
                color: '#E2E8F0',
                fontSize: '12px'
              }}>Snap Distance: {snapDistance}px</label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={snapDistance}
                onChange={(e) => setSnapDistance(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#10B981'
                }}
              />
            </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export function MainLayout({ children }: MainLayoutProps) {
  // Console log removed

  const [showNavigation, setShowNavigation] = useState(true);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [leftWidth, setLeftWidth] = useState(300);
  const [rightWidth, setRightWidth] = useState(320);
  const [activeToolSidebar, setActiveToolSidebar] = useState<string | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const activeTool = useApp(s => s.activeTool);
  const setActiveTool = useApp(s => s.setActiveTool);
  const vectorMode = useApp(s => s.vectorMode);
  const setVectorMode = useApp(s => s.setVectorMode);
  const showAnchorPoints = useApp(s => s.showAnchorPoints);
  const setShowAnchorPoints = useApp(s => s.setShowAnchorPoints);
  
  // Vector toolbar state
  const [showVectorToolbar, setShowVectorToolbar] = useState(false);

  // Handle tool changes and sidebar switching
  useEffect(() => {
    // When a tool is selected, show its sidebar and hide others
    // Exclude basic tools and embroidery tool (handled separately)
    if (activeTool && 
        activeTool !== 'brush' && 
        activeTool !== 'eraser' && 
        activeTool !== 'fill' && 
        activeTool !== 'picker' &&
        activeTool !== 'embroidery') {
      setActiveToolSidebar(activeTool);
      setShowRightPanel(true);
    } else {
      setActiveToolSidebar(null);
    }
  }, [activeTool]);

  const toggleNavigation = () => {
    // Console log removed
    setShowNavigation(prev => !prev);
  };

  const toggleLeftPanel = () => {
    // Console log removed
    setShowLeftPanel(prev => !prev);
  };

  const toggleRightPanel = () => {
    // Console log removed
    setShowRightPanel(prev => !prev);
  };

  const toggleSidebars = () => {
    const next = !(showLeftPanel || showRightPanel);
    setShowLeftPanel(next);
    setShowRightPanel(next);
  };

  // Performance optimization: Reduce console logging
  // console.log('🏗️ MainLayout: Rendering layout', {
  //   showNavigation,
  //   showLeftPanel,
  //   showRightPanel,
  //   activeTool
  // });

  return (
    <div className="main-layout" style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: '#0F172A'
    }}>
      {/* Vector Toolbar - Shows when vector tools are active */}
      <VectorToolbar 
        isVisible={showVectorToolbar} 
        onClose={() => {
          setShowVectorToolbar(false);
          setVectorMode(false);
        }} 
      />
      
      {/* Navigation Sidebar */}
      {showNavigation && (
        <div className="navigation-container" style={{
          position: 'relative',
          zIndex: 1000
        }}>
          <Navigation active={true} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="main-content" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        marginTop: showVectorToolbar ? '60px' : '0px',
        transition: 'margin-top 0.3s ease'
      }}>
        {/* Top Toolbar - Hidden when vector mode is active */}
        {!vectorMode && (
          <div className="toolbar-container" style={{
            height: '60px',
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            borderBottom: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: '16px',
            zIndex: 10000,
            position: 'relative'
          }}>
          {/* Panel Toggle Buttons */}
          <div className="panel-toggles" style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <button
              className="panel-toggle"
              onClick={toggleSidebars}
              style={{
                padding: '8px 12px',
                background: showLeftPanel || showRightPanel ? '#0ea5e9' : '#475569',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🧰</span>
              <span>Toggle Sidebars</span>
            </button>
            <button
              className="panel-toggle"
              onClick={toggleNavigation}
              style={{
                padding: '8px 12px',
                background: showNavigation ? '#3B82F6' : '#475569',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🧭</span>
              <span>Nav</span>
            </button>
            <button
              className="panel-toggle"
              onClick={toggleLeftPanel}
              style={{
                padding: '8px 12px',
                background: showLeftPanel ? '#10B981' : '#475569',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>📁</span>
              <span>Files</span>
            </button>
            <button
              className="panel-toggle"
              onClick={toggleRightPanel}
              style={{
                padding: '8px 12px',
                background: showRightPanel ? '#F59E0B' : '#475569',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>⚙️</span>
              <span>Tools</span>
            </button>
          </div>

          {/* Active Tool Indicator */}
          <div className="active-tool-indicator" style={{
            padding: '8px 16px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '6px',
            color: '#3B82F6',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🎯</span>
            <span>Active: {activeTool}</span>
          </div>


          {/* Grid & Scale Controls */}
          <GridToolbarControls />

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Sidebar Width Controls */}
          <div className="sidebar-width-controls" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12 }}>Left</span>
              <input type="range" min={180} max={600} value={leftWidth} onChange={e => setLeftWidth(parseInt(e.target.value))} />
              <span style={{ fontSize: 12, width: 40, textAlign: 'right' }}>{leftWidth}px</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12 }}>Right</span>
              <input type="range" min={180} max={600} value={rightWidth} onChange={e => setRightWidth(parseInt(e.target.value))} />
              <span style={{ fontSize: 12, width: 40, textAlign: 'right' }}>{rightWidth}px</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions" style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button
              className="quick-action"
              style={{
                padding: '8px 12px',
                background: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>⏪</span>
              <span>Undo</span>
            </button>
            <button
              className="quick-action"
              style={{
                padding: '8px 12px',
                background: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>⏩</span>
              <span>Redo</span>
            </button>
            <button
              className="quick-action"
              style={{
                padding: '8px 12px',
                background: '#8B5CF6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>💾</span>
              <span>Save</span>
            </button>
          </div>
        </div>
        )}

        {/* Vector Tools and Anchor Points Toggle Buttons - Always visible */}
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 10001,
          display: 'flex',
          gap: '10px',
          flexDirection: 'column'
        }}>
          {/* Vector Tools Button */}
          <button
            onClick={() => {
              console.log('🎨 Vector Tools button clicked - toggling vectorMode');
              setShowVectorToolbar(!showVectorToolbar);
              setVectorMode(!vectorMode);
              // Set the active tool to vectorTools when entering vector mode
              if (!vectorMode) {
                setActiveTool('vectorTools');
                // Initialize vector store with pen tool
                vectorStore.set('tool', 'pen');
              } else {
                setActiveTool('brush'); // Return to brush when exiting vector mode
              }
              console.log('🎨 Vector mode set to:', !vectorMode);
            }}
            style={{
              background: vectorMode ? 'rgb(139, 92, 246)' : 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
            title={vectorMode ? "Exit Vector Mode" : "Enter Vector Mode"}
          >
            <span style={{ fontSize: '18px' }}>🎨</span>
            <span>{vectorMode ? 'Exit Vector' : 'Vector Tools'}</span>
          </button>

          {/* Anchor Points Toggle Button */}
          <button
            onClick={() => {
              console.log('🎯 Anchor Points toggle clicked - toggling showAnchorPoints');
              setShowAnchorPoints(!showAnchorPoints);
              console.log('🎯 Show anchor points set to:', !showAnchorPoints);
            }}
            style={{
              background: showAnchorPoints ? 'rgb(34, 197, 94)' : 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
            title={showAnchorPoints ? "Hide Anchor Points" : "Show Anchor Points"}
          >
            <span style={{ fontSize: '18px' }}>🎯</span>
            <span>{showAnchorPoints ? 'Hide Anchors' : 'Show Anchors'}</span>
          </button>
        </div>

        {/* Main Workspace */}
        <div className="workspace" style={{
          flex: 1,
          display: 'flex',
          minHeight: 0
        }}>
          {/* Left Panel */}
          {showLeftPanel && (
            <div className="left-panel-container" style={{
              width: `${leftWidth}px`,
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              borderRight: '1px solid #334155',
              overflowY: 'auto'
            }}>
              <LeftPanel />
            </div>
          )}

          {/* Canvas Area */}
          <div className="canvas-area" style={{
            flex: 1,
            position: 'relative',
            background: '#0F172A',
            overflow: 'hidden',
            zIndex: 0
          }}>
            {children}
            <GridOverlay canvasRef={canvasRef} />
          </div>

          {/* Right Panel - Hide when embroidery tool is active */}
          {showRightPanel && activeTool !== 'embroidery' && (
            <div className="right-panel-container" style={{
              width: `${rightWidth}px`,
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              borderLeft: '1px solid #334155',
              overflowY: 'auto'
            }}>
              <RightPanel activeToolSidebar={activeToolSidebar} />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

