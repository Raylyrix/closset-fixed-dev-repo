import React, { useState, useRef, useEffect } from 'react';
import { LeftPanelCompact } from './LeftPanelCompact';
import { TabletRightPanel } from './TabletRightPanel';
import { useApp } from '../App';

interface TabletLayoutProps {
  children?: React.ReactNode;
}

export function TabletLayout({ children }: TabletLayoutProps) {
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(320);
  const [activeToolSidebar, setActiveToolSidebar] = useState<string | null>(null);
  const [showTopNav, setShowTopNav] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Resizing state
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const activeTool = useApp(s => s.activeTool);
  const setActiveTool = useApp(s => s.setActiveTool);
  const vectorMode = useApp(s => s.vectorMode);
  const setVectorMode = useApp(s => s.setVectorMode);
  const showAnchorPoints = useApp(s => s.showAnchorPoints);
  const setShowAnchorPoints = useApp(s => s.setShowAnchorPoints);
  const showGrid = useApp(s => s.showGrid);
  const setShowGrid = useApp(s => s.setShowGrid);
  const showRulers = useApp(s => s.showRulers);
  const setShowRulers = useApp(s => s.setShowRulers);

  // Touch-friendly interactions
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    
    if (deltaX > 10 || deltaY > 10) {
      setIsDragging(true);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    setIsDragging(false);
  };

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
        const newWidth = Math.max(200, Math.min(500, e.clientX));
        setLeftWidth(newWidth);
      }
      if (isResizingRight) {
        const newWidth = Math.max(200, Math.min(500, window.innerWidth - e.clientX));
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

  return (
    <div 
      className="tablet-layout"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'transparent !important',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tablet Top Navigation Bar - Single Line */}
      {showTopNav && (
        <div 
          className="tablet-top-nav"
          style={{
            height: '50px',
            background: 'transparent !important',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            zIndex: 10002,
            position: 'relative'
          }}
        >
          {/* Left Section - Hamburger Menu Icon */}
          <button
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            style={{
              padding: '8px',
              background: 'transparent',
              border: 'none',
              color: showLeftPanel ? '#FFFFFF' : '#a0aec0',
              fontSize: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderRadius: '8px',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Toggle Tools Panel"
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.9)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span>☰</span>
          </button>

          {/* Center Section - All Tools in One Line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

            {/* Grid Toggle */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowGrid(!showGrid);
              }}
              style={{
                padding: '8px',
                background: 'transparent',
                border: 'none',
                color: showGrid ? '#FFFFFF' : '#a0aec0',
                fontSize: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Toggle Grid"
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.9)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span>⊞</span>
            </button>

            {/* Rulers Toggle */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowRulers(!showRulers);
              }}
              style={{
                padding: '8px',
                background: 'transparent',
                border: 'none',
                color: showRulers ? '#FFFFFF' : '#a0aec0',
                fontSize: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Toggle Rulers"
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.9)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span>📏</span>
            </button>

            {/* Show Anchors Toggle */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAnchorPoints(!showAnchorPoints);
              }}
              style={{
                padding: '8px',
                background: 'transparent',
                border: 'none',
                color: showAnchorPoints ? '#ec4899' : '#a0aec0',
                fontSize: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Show Anchor Points"
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.9)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span>🎯</span>
            </button>
          </div>

          {/* Right Section - Settings Panel Toggle */}
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            style={{
              padding: '8px',
              background: 'transparent',
              border: 'none',
              color: showRightPanel ? '#FFFFFF' : '#a0aec0',
              fontSize: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderRadius: '8px',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Toggle Settings Panel"
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.9)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span>⚙️</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div 
        className="tablet-main-content"
        style={{
          flex: 1,
          display: 'flex',
          position: 'relative',
          marginTop: showTopNav ? '0' : '0',
          overflow: 'hidden'
        }}
      >
        {/* Left Panel - Full Panel */}
        {showLeftPanel && (
          <>
            <div 
              ref={leftPanelRef}
              className="tablet-left-panel-container"
              style={{
                width: `${leftWidth}px`,
                background: 'transparent !important',
                borderRight: '2px solid rgba(99, 102, 241, 0.3)',
                overflowY: 'auto',
                boxShadow: '2px 0 20px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(20px)',
                zIndex: 10001,
                scrollbarWidth: 'none', /* Firefox */
                msOverflowStyle: 'none', /* IE and Edge */
                position: 'relative'
              }}
            >
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

        {/* Vertical Tool Strip - When Left Panel is Hidden */}
        {!showLeftPanel && (
          <div 
            className="vertical-tool-strip"
            style={{
              position: 'absolute',
              left: '0',
              top: '0',
              width: '60px',
              height: '100%',
              background: 'transparent !important',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 0',
              gap: '16px'
            }}
          >
            <VerticalToolStrip />
          </div>
        )}

        {/* Canvas Area */}
        <div 
          className="tablet-canvas-area"
          style={{
            flex: 1,
            background: 'transparent !important',
            position: 'relative',
            overflow: 'hidden',
            transition: 'margin-left 0.3s ease'
          }}
        >
          {children}
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
            
            <div 
              ref={rightPanelRef}
              className="tablet-right-panel-container"
              style={{
                width: `${rightWidth}px`,
              background: 'transparent !important',
              borderLeft: '2px solid rgba(99, 102, 241, 0.3)',
              overflowY: 'auto',
              boxShadow: '-2px 0 20px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(20px)',
              zIndex: 10001,
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none', /* IE and Edge */
              position: 'relative'
            }}
          >
            <TabletRightPanel activeToolSidebar={activeToolSidebar} />
          </div>
          </>
        )}
      </div>
    </div>
  );
}

// Vertical Tool Strip Component - Monochromatic Tools
function VerticalToolStrip() {
  const activeTool = useApp(s => s.activeTool);
  const setActiveTool = useApp(s => s.setActiveTool);

  const tools = [
    { id: 'brush', icon: '✏️', name: 'Brush', symbol: '✏' },
    { id: 'eraser', icon: '🧽', name: 'Eraser', symbol: '⎚' },
    { id: 'fill', icon: '🪣', name: 'Fill', symbol: '▨' },
    { id: 'picker', icon: '🎨', name: 'Picker', symbol: '⏷' },
    { id: 'puffPrint', icon: '☁️', name: 'Puff', symbol: '◯' },
    { id: 'embroidery', icon: '🧵', name: 'Embroidery', symbol: '✦' },
    { id: 'text', icon: '📝', name: 'Text', symbol: 'A' }
  ];

  return (
    <>
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (activeTool === tool.id) {
              setActiveTool('brush');
            } else {
              setActiveTool(tool.id as any);
            }
          }}
          style={{
            width: '44px',
            height: '44px',
            background: activeTool === tool.id 
              ? '#FFFFFF' 
              : '#000000',
            borderRadius: '8px',
            color: activeTool === tool.id 
              ? '#000000' 
              : '#FFFFFF',
            fontSize: '20px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: activeTool === tool.id 
              ? '0 4px 12px rgba(255, 255, 255, 0.3)' 
              : '0 2px 8px rgba(0, 0, 0, 0.3)',
            transform: 'scale(1)'
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.9)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title={tool.name}
        >
          <span style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: 'inherit'
          }}>
            {tool.symbol}
          </span>
        </button>
      ))}
    </>
  );
}

