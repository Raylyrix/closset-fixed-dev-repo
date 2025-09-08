import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Toolbar } from './Toolbar';
import { RightPanel } from './RightPanel';
import { LeftPanel } from './LeftPanel';
import { EmbroiderySidebar } from './EmbroiderySidebar';
import { useApp } from '../App';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // Console log removed

  const [showNavigation, setShowNavigation] = useState(true);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [leftWidth, setLeftWidth] = useState(300);
  const [rightWidth, setRightWidth] = useState(320);
  const [activeToolSidebar, setActiveToolSidebar] = useState<string | null>(null);

  const activeTool = useApp(s => s.activeTool);

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

  console.log('🏗️ MainLayout: Rendering layout', {
    showNavigation,
    showLeftPanel,
    showRightPanel,
    activeTool
  });

  return (
    <div className="main-layout" style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: '#0F172A'
    }}>
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
        minWidth: 0
      }}>
        {/* Top Toolbar */}
        <div className="toolbar-container" style={{
          height: '60px',
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '16px',
          zIndex: 100
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
            overflow: 'hidden'
          }}>
            {children}
          </div>

          {/* Right Panel */}
          {showRightPanel && (
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

      {/* Embroidery Sidebar - Fixed position overlay */}
      <EmbroiderySidebar active={activeTool === 'embroidery'} />
    </div>
  );
}

