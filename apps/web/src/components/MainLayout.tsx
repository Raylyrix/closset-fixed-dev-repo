import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from './Navigation';
import { Toolbar } from './Toolbar';
import { RightPanelCompact } from './RightPanelCompact';
import { LeftPanelCompact } from './LeftPanelCompact';
import { GridOverlay } from './GridOverlay';
import { VectorOverlay } from './VectorOverlay';
import VectorToolbar from './VectorToolbar';
import { useApp } from '../App';
import { vectorStore } from '../vector/vectorState';

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
          background: showGrid ? '#FFFFFF' : '#000000',
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
          background: showRulers ? '#FFFFFF' : '#000000',
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
          background: snapToGrid ? '#FFFFFF' : '#000000',
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
            background: '#000000',
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
                background: '#000000',
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
                  background: '#000000',
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
                  background: '#FFFFFF',
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
                  background: '#000000',
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
            background: '#000000',
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
                background: '#000000',
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
                  border: '1px solid rgba(255, 255, 255, 0.2)',
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

  const [showNavigation, setShowNavigation] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [leftWidth, setLeftWidth] = useState(300);
  const [rightWidth, setRightWidth] = useState(400);
  const [activeToolSidebar, setActiveToolSidebar] = useState<string | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  // Resizing state
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const activeTool = useApp(s => s.activeTool);
  const setActiveTool = useApp(s => s.setActiveTool);
  const vectorMode = useApp(s => s.vectorMode);
  const setVectorMode = useApp(s => s.setVectorMode);
  const showAnchorPoints = useApp(s => s.showAnchorPoints);
  const setShowAnchorPoints = useApp(s => s.setShowAnchorPoints);
  
  // Vector toolbar state
  const [showVectorToolbar, setShowVectorToolbar] = useState(false);
  const showGrid = useApp(s => s.showGrid);
  const setShowGrid = useApp(s => s.setShowGrid);
  const showRulers = useApp(s => s.showRulers);
  const setShowRulers = useApp(s => s.setShowRulers);

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

  // Resize handlers
  const handleLeftResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingLeft(true);
  };

  const handleRightResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingRight(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft) {
        const newWidth = Math.max(200, Math.min(600, e.clientX));
        setLeftWidth(newWidth);
      }
      if (isResizingRight) {
        const newWidth = Math.max(200, Math.min(600, window.innerWidth - e.clientX));
        setRightWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
    };

    if (isResizingLeft || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingLeft, isResizingRight]);

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
      background: '#000000',
      boxShadow: '0 0 100px rgba(0, 0, 0, 0.5)',
      pointerEvents: 'auto'
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
        marginTop: showVectorToolbar ? '36px' : '0px',
        transition: 'margin-top 0.3s ease'
      }}>
        {/* Sexy Top Navigation Bar */}
        <div className="top-nav" style={{
          height: '40px',
          background: '#000000',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
          justifyContent: 'space-between',
            padding: '0 16px',
          position: 'relative',
          zIndex: 10001,
          fontSize: '11px',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          pointerEvents: 'auto'
        }}>
          {/* Left Section - Logo & Project */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              fontSize: '10px',
              color: '#a0aec0',
              fontWeight: '500',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}>
              Untitled Design
            </div>
          </div>

          {/* Center Section - Main Navigation Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <button
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              style={{
                padding: '8px 16px',
                background: showLeftPanel 
                  ? '#FFFFFF' 
                  : 'transparent',
                borderRadius: '6px',
                color: showLeftPanel ? '#000000' : '#FFFFFF',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🛠️ Tools
            </button>
            
            <button style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: '600',
                cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              Layers
            </button>
            
            <button style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              Export
            </button>
          </div>

          {/* Right Section - View Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
            {/* View Controls Group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowGrid(!showGrid);
                }}
              style={{
                  padding: '4px 8px',
                  background: showGrid ? '#FFFFFF' : 'transparent',
                border: 'none',
                  borderRadius: '4px',
                  color: showGrid ? '#000000' : '#FFFFFF',
                  fontSize: '9px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Grid
            </button>
              
            <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowRulers(!showRulers);
                }}
              style={{
                  padding: '4px 8px',
                  background: showRulers ? '#FFFFFF' : 'transparent',
                border: 'none',
                  borderRadius: '4px',
                  color: showRulers ? '#000000' : '#FFFFFF',
                  fontSize: '9px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Rulers
            </button>
          </div>

            {/* Vector Tools Group - Only show when vector mode is active */}
            {vectorMode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
                  onClick={() => {
                    const { undo } = useApp.getState();
                    if (undo) undo();
                  }}
              style={{
                    padding: '4px 8px',
                    background: 'transparent',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: '500',
                cursor: 'pointer',
                    border: 'none'
              }}
            >
                  ↶ Undo
            </button>
                
            <button
                  onClick={() => {
                    const { redo } = useApp.getState();
                    if (redo) redo();
                  }}
              style={{
                    padding: '4px 8px',
                    background: 'transparent',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: '500',
                cursor: 'pointer',
                    border: 'none'
              }}
            >
                  ↷ Redo
            </button>
                
            <button
                  onClick={() => setShowAnchorPoints(!showAnchorPoints)}
              style={{
                    padding: '4px 8px',
                    background: showAnchorPoints ? '#FFFFFF' : 'transparent',
                    borderRadius: '4px',
                    color: showAnchorPoints ? '#000000' : '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: '500',
                cursor: 'pointer',
                    border: 'none'
              }}
            >
                  ⚓ Anchor
            </button>

          <button
            onClick={() => {
                    console.log('🎨 Apply Tool button clicked - applying tools to vector paths');
                    try {
                      const appState = useApp.getState();
                      const vectorPaths = appState.vectorPaths || [];
                      
                      if (vectorPaths.length === 0) {
                        console.log('⚠️ No vector paths to apply tools to');
                        console.log('🎨 Available vector paths:', vectorPaths);
                        return;
                      }
                      
                      console.log('🎨 Vector paths found:', vectorPaths.length);
                      console.log('🎨 Vector paths:', vectorPaths);
                      
                      // Get current tool settings
                      const currentTool = appState.activeTool;
                      console.log(`🎨 Applying ${currentTool} to ${vectorPaths.length} vector paths`);
                      
                      // Apply tool to each vector path
                      vectorPaths.forEach((path: any) => {
                        console.log(`🎨 Applying ${currentTool} to path:`, path.id);
                        console.log('🎨 Path structure:', path);
                        
                        // Handle different vector path structures
                        let points = [];
                        if (path.points) {
                          points = path.points;
                        } else if (path.anchors) {
                          points = path.anchors;
                        } else if (path.vertices) {
                          points = path.vertices;
                        } else if (Array.isArray(path)) {
                          points = path;
                        }
                        
                        console.log('🎨 Points found:', points.length);
                        
                        if (points.length === 0) {
                          console.log('⚠️ No points found in path');
                          return;
                        }
                        
                        // Create sampled points for smooth tool application
                        const sampledPoints = [];
                        for (let i = 0; i < points.length - 1; i++) {
                          const p1 = points[i];
                          const p2 = points[i + 1];
                          
                          // Handle different point structures
                          const p1U = p1.u || p1.x || p1[0];
                          const p1V = p1.v || p1.y || p1[1];
                          const p2U = p2.u || p2.x || p2[0];
                          const p2V = p2.v || p2.y || p2[1];
                          
                          const steps = Math.max(5, Math.floor(Math.sqrt(
                            Math.pow(p2U - p1U, 2) + Math.pow(p2V - p1V, 2)
                          )));
                          
                          for (let j = 0; j <= steps; j++) {
                            const t = j / steps;
                            sampledPoints.push({
                              u: p1U + t * (p2U - p1U),
                              v: p1V + t * (p2V - p1V)
                            });
                          }
                        }
                        
                        console.log(`🎨 Sampled ${sampledPoints.length} points for smooth application`);
                        
                        // Apply tool based on current active tool
                        switch (currentTool) {
                          case 'brush':
                            console.log('🎨 Applying brush tool to', sampledPoints.length, 'points');
                            // Apply continuous brush stroke along the path
                            const layer = appState.getActiveLayer();
                            if (layer && layer.canvas) {
                              const ctx = layer.canvas.getContext('2d');
                              if (ctx) {
                                console.log('🎨 Drawing continuous brush stroke');
                                
                                ctx.save();
                                ctx.globalCompositeOperation = 'source-over';
                                ctx.globalAlpha = appState.brushOpacity || 1.0;
                                ctx.strokeStyle = appState.brushColor || '#000000';
                                ctx.lineWidth = appState.brushSize || 5;
                                ctx.lineCap = 'round';
                                ctx.lineJoin = 'round';
                                ctx.shadowColor = 'rgba(0,0,0,0.3)';
                                ctx.shadowBlur = 4;
                                ctx.shadowOffsetX = 2;
                                ctx.shadowOffsetY = 2;
                                
                                // Draw continuous stroke
                                ctx.beginPath();
                                sampledPoints.forEach((point: any, index: number) => {
                                  const x = Math.round(point.u * layer.canvas.width);
                                  const y = Math.round(point.v * layer.canvas.height);
                                  
                                  if (index === 0) {
                                    ctx.moveTo(x, y);
              } else {
                                    ctx.lineTo(x, y);
                                  }
                                  
                                  console.log(`🎨 Drawing brush point ${index}:`, { x, y, u: point.u, v: point.v });
                                });
                                ctx.stroke();
                                ctx.restore();
                                
                                console.log('🎨 Continuous brush stroke completed');
                              } else {
                                console.log('⚠️ No canvas context found for layer');
                              }
                            } else {
                              console.log('⚠️ No active layer or canvas found');
                            }
                            break;
                            
                          case 'puffPrint':
                            console.log('🎨 Applying puff print tool to', sampledPoints.length, 'points');
                            // Apply puff print to each sampled point
                            const puffCanvas = appState.puffCanvas;
                            const displacementCanvas = appState.displacementCanvas;
                            const puffBrushSize = appState.puffBrushSize || 20;
                            const puffBrushOpacity = appState.puffBrushOpacity || 1.0;
                            const puffColor = appState.puffColor || '#ff69b4';
                            const puffHeight = appState.puffHeight || 2.0;
                            
                            console.log('🎨 Puff settings:', { puffCanvas: !!puffCanvas, displacementCanvas: !!displacementCanvas, puffBrushSize, puffBrushOpacity, puffColor, puffHeight });
                            
                            if (puffCanvas && displacementCanvas) {
                              const puffCtx = puffCanvas.getContext('2d');
                              const dispCtx = displacementCanvas.getContext('2d');
                              
                              if (puffCtx && dispCtx) {
                                console.log('🎨 Drawing continuous puff stroke');
                                
                                // Create continuous puff stroke
                                puffCtx.save();
                                puffCtx.globalCompositeOperation = 'source-over';
                                puffCtx.globalAlpha = puffBrushOpacity;
                                puffCtx.strokeStyle = puffColor;
                                puffCtx.lineWidth = puffBrushSize;
                                puffCtx.lineCap = 'round';
                                puffCtx.lineJoin = 'round';
                                puffCtx.shadowColor = puffColor;
                                puffCtx.shadowBlur = puffBrushSize / 2;
                                
                                puffCtx.beginPath();
                                sampledPoints.forEach((point: any, index: number) => {
                                  const x = Math.round(point.u * puffCanvas.width);
                                  const y = Math.round(point.v * puffCanvas.height);
                                  
                                  if (index === 0) {
                                    puffCtx.moveTo(x, y);
                                  } else {
                                    puffCtx.lineTo(x, y);
                                  }
                                  
                                  console.log(`🎨 Drawing puff point ${index}:`, { x, y, u: point.u, v: point.v });
                                });
                                puffCtx.stroke();
                                puffCtx.restore();
                                
                                // Create continuous displacement stroke
                                dispCtx.save();
                                dispCtx.globalCompositeOperation = 'source-over';
                                const displacementValue = Math.floor(128 + (puffHeight / 10) * 127);
                                dispCtx.strokeStyle = `rgb(${displacementValue}, ${displacementValue}, ${displacementValue})`;
                                dispCtx.lineWidth = puffBrushSize;
                                dispCtx.lineCap = 'round';
                                dispCtx.lineJoin = 'round';
                                
                                dispCtx.beginPath();
                                sampledPoints.forEach((point: any, index: number) => {
                                  const x = Math.round(point.u * puffCanvas.width);
                                  const y = Math.round(point.v * puffCanvas.height);
                                  
                                  if (index === 0) {
                                    dispCtx.moveTo(x, y);
                                  } else {
                                    dispCtx.lineTo(x, y);
                                  }
                                });
                                dispCtx.stroke();
                                dispCtx.restore();
                                
                                console.log('🎨 Continuous puff stroke completed');
                              } else {
                                console.log('⚠️ No canvas contexts found for puff/displacement');
                              }
                            } else {
                              console.log('⚠️ Puff or displacement canvas not found');
                            }
                            break;
                            
                          case 'embroidery':
                            console.log('🎨 Applying embroidery tool to', sampledPoints.length, 'points');
                            // Apply embroidery to each sampled point
                            const embroideryCanvas = appState.embroideryCanvas;
                            console.log('🎨 Embroidery canvas found:', !!embroideryCanvas);
                            
                            if (embroideryCanvas) {
                              const embCtx = embroideryCanvas.getContext('2d');
                              if (embCtx) {
                                console.log('🎨 Drawing continuous embroidery stroke');
                                
                                embCtx.save();
                                embCtx.globalCompositeOperation = 'source-over';
                                embCtx.globalAlpha = appState.brushOpacity || 1.0;
                                embCtx.strokeStyle = appState.brushColor || '#000000';
                                embCtx.lineWidth = appState.brushSize || 5;
                                embCtx.lineCap = 'round';
                                embCtx.lineJoin = 'round';
                                embCtx.shadowColor = 'rgba(0,0,0,0.3)';
                                embCtx.shadowBlur = 4;
                                embCtx.shadowOffsetX = 2;
                                embCtx.shadowOffsetY = 2;
                                
                                // Draw continuous embroidery stroke
                                embCtx.beginPath();
                                sampledPoints.forEach((point: any, index: number) => {
                                  const x = Math.round(point.u * embroideryCanvas.width);
                                  const y = Math.round(point.v * embroideryCanvas.height);
                                  
                                  if (index === 0) {
                                    embCtx.moveTo(x, y);
                                  } else {
                                    embCtx.lineTo(x, y);
                                  }
                                  
                                  console.log(`🎨 Drawing embroidery point ${index}:`, { x, y, u: point.u, v: point.v });
                                });
                                embCtx.stroke();
                                embCtx.restore();
                                
                                console.log('🎨 Continuous embroidery stroke completed');
                              } else {
                                console.log('⚠️ No embroidery canvas context found');
                              }
                            } else {
                              console.log('⚠️ No embroidery canvas found');
                            }
                            break;
                        }
                      });
                      
                      // Commit changes and update model
                      if (appState.commit) {
                        appState.commit();
                        console.log('✅ Changes committed to layer history');
                      }
                      
                      if (appState.composeLayers) {
                        appState.composeLayers();
                        console.log('✅ All layers recomposed');
                      }
                      
                      // Force texture update
                      setTimeout(() => {
                        if ((window as any).updateModelTexture) {
                          console.log('🎨 Updating model texture');
                          (window as any).updateModelTexture();
                        }
                        
                        if ((window as any).updateModelWithPuffDisplacement) {
                          console.log('🎨 Updating model displacement maps');
                          (window as any).updateModelWithPuffDisplacement();
                        }
                      }, 100);
                      
                      console.log('✅ Apply Tool: All tools applied to vector paths successfully');
                      
                    } catch (error) {
                      console.error('❌ Error applying tools to vector paths:', error);
                    }
            }}
            style={{
                    padding: '4px 8px',
                    background: '#FFFFFF',
                    borderRadius: '4px',
                    color: '#000000',
                    fontSize: '9px',
                    fontWeight: '500',
              cursor: 'pointer',
                    border: 'none'
              }}
            >
                  ✅ Apply
            </button>

          <button
            onClick={() => {
                    console.log('🗑️ Clear Applied Effects button clicked');
                    const appState = useApp.getState();
                    
                    try {
                      // Clear active layer canvas (brush strokes)
                      const activeLayer = appState.getActiveLayer();
                      if (activeLayer && activeLayer.canvas) {
                        const ctx = activeLayer.canvas.getContext('2d');
                        if (ctx) {
                          ctx.clearRect(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
                          console.log('✅ Active layer canvas cleared');
                        }
                      }
                      
                      // Clear puff canvas
                      if (appState.puffCanvas) {
                        const puffCtx = appState.puffCanvas.getContext('2d');
                        if (puffCtx) {
                          puffCtx.clearRect(0, 0, appState.puffCanvas.width, appState.puffCanvas.height);
                          console.log('✅ Puff canvas cleared');
                        }
                      }
                      
                      // Clear displacement canvas
                      if (appState.displacementCanvas) {
                        const dispCtx = appState.displacementCanvas.getContext('2d');
                        if (dispCtx) {
                          dispCtx.clearRect(0, 0, appState.displacementCanvas.width, appState.displacementCanvas.height);
                          console.log('✅ Displacement canvas cleared');
                        }
                      }
                      
                      // Clear embroidery canvas
                      if (appState.embroideryCanvas) {
                        const embCtx = appState.embroideryCanvas.getContext('2d');
                        if (embCtx) {
                          embCtx.clearRect(0, 0, appState.embroideryCanvas.width, appState.embroideryCanvas.height);
                          console.log('✅ Embroidery canvas cleared');
                        }
                      }
                      
                      // Clear all layer canvases
                      if (appState.layers) {
                        appState.layers.forEach((layer: any) => {
                          if (layer.canvas) {
                            const ctx = layer.canvas.getContext('2d');
                            if (ctx) {
                              ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                            }
                          }
                        });
                        console.log('✅ All layer canvases cleared');
                      }
                      
                      // Commit changes and recompose
                      if (appState.commit) {
                        appState.commit();
                        console.log('✅ Changes committed');
                      }
                      
                      if (appState.composeLayers) {
                        appState.composeLayers();
                        console.log('✅ Layers recomposed');
                      }
                      
                      // Update 3D model to reflect cleared effects
                      setTimeout(() => {
                        if ((window as any).updateModelTexture) {
                          console.log('🎨 Updating model texture after clear');
                          (window as any).updateModelTexture();
                        }
                        
                        if ((window as any).updateModelWithPuffDisplacement) {
                          console.log('🎨 Updating model displacement maps after clear');
                          (window as any).updateModelWithPuffDisplacement();
                        }
                      }, 100);
                      
                      console.log('✅ All applied effects cleared successfully');
                      
                    } catch (error) {
                      console.error('❌ Error clearing applied effects:', error);
                    }
            }}
            style={{
                    padding: '4px 8px',
                    background: 'transparent',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: '500',
              cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  🗑️ Clear
          </button>
              </div>
            )}

            {/* Vector Tools Toggle Button */}
          <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎨 Vector Tools button clicked');
                
                // Toggle behavior: if vector mode is already active, deactivate it
                if (vectorMode) {
                  console.log('🔄 Deactivating vector mode');
                  setVectorMode(false);
                  setActiveTool('brush'); // Switch back to brush
                } else {
                  console.log('✅ Activating vector mode');
                  setActiveTool('vector');
                  setVectorMode(true);
                }
                console.log('🎨 Vector mode set to:', !vectorMode);
            }}
            style={{
                padding: '6px 12px',
                background: vectorMode 
                  ? '#FFFFFF' 
                  : 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                color: vectorMode ? '#000000' : '#FFFFFF',
                fontSize: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
                gap: '4px',
              transition: 'all 0.3s ease',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                pointerEvents: 'auto'
            }}
            onMouseEnter={(e) => {
                if (!vectorMode) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
            }}
            onMouseLeave={(e) => {
                if (!vectorMode) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
                }
            }}
          >
              <span style={{ fontSize: '12px' }}>🎨</span>
              <span>Vector Tools</span>
          </button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="workspace" style={{
          flex: 1,
          display: 'flex',
          minHeight: 0
        }}>
          {/* Left Panel */}
          {showLeftPanel && (
            <>
            <div className="left-panel-container" style={{
              width: `${leftWidth}px`,
                background: '#000000',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                overflowY: 'auto',
                boxShadow: '2px 0 20px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                zIndex: 10001,
                pointerEvents: 'auto'
              }}>
                <LeftPanelCompact />
            </div>
              
              {/* Left Resizer */}
              <div
                className="resizer resizer-left"
                onMouseDown={handleLeftResizeStart}
                style={{
                  width: '4px',
                  background: isResizingLeft ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                  cursor: 'col-resize',
                  zIndex: 10002,
                  transition: 'background 0.2s ease'
                }}
              />
            </>
          )}

          {/* Canvas Area */}
          <div className="canvas-area" style={{
            flex: 1,
            position: 'relative',
          background: '#000000',
            overflow: 'hidden',
          zIndex: 0,
          boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.3)'
          }}>
            {children}
            <GridOverlay canvasRef={canvasRef} />
            {/* Ensure VectorOverlay is mounted on top of the canvas area when vector mode is active */}
            {vectorMode && <VectorOverlay />}
          </div>

          {/* Right Panel */}
          {showRightPanel && (
            <>
              {/* Right Resizer */}
              <div
                className="resizer resizer-right"
                onMouseDown={handleRightResizeStart}
                style={{
                  width: '4px',
                  background: isResizingRight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                  cursor: 'col-resize',
                  zIndex: 10002,
                  transition: 'background 0.2s ease'
                }}
              />
              
            <div className="right-panel-container" style={{
              width: `${rightWidth}px`,
              background: '#000000',
              borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
              overflowY: 'auto',
              boxShadow: '-2px 0 20px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              zIndex: 10001,
              pointerEvents: 'auto'
            }}>
              <RightPanelCompact activeToolSidebar={activeToolSidebar} />
            </div>
          </>
          )}
        </div>
      </div>

    </div>
  );
}

