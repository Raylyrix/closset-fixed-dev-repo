import React from 'react';
import { useApp } from '../App';

// Import all tool components
import { PatternMaker } from './PatternMaker';
import { AdvancedSelection } from './AdvancedSelection';
// Removed AI Assistant and Export features
import { CloudSync } from './CloudSync';
import { LayerEffects } from './LayerEffects';
import { ColorGrading } from './ColorGrading';
// Removed Animation tools
import { DesignTemplates } from './DesignTemplates';
import { BatchProcessing } from './BatchProcessing';
import { AdvancedBrushSystem } from './AdvancedBrushSystem';
import { ProceduralGenerator } from './ProceduralGenerator';
// Removed 3D Painting tool
import { SmartFillTool } from './SmartFillTool';
// Embroidery settings now in RightPanelNew.tsx - no separate component needed
import { ProfessionalVectorTool } from './ProfessionalVectorTool';

interface ToolRouterProps {
  active: boolean;
}

export function ToolRouter({ active }: ToolRouterProps) {
  // Console log removed

  const activeTool = useApp(s => s.activeTool);

  // Tool routing configuration
  const toolRoutes = {
    // Design Tools
    'brush': null, // Handled by main canvas
    'eraser': null, // Handled by main canvas
    'smudge': null, // Handled by main canvas
    'blur': null, // Handled by main canvas
    'fill': null, // Handled by main canvas
    'gradient': null, // Handled by main canvas
    'picker': null, // Handled by main canvas

    // Shapes & Text
    'line': null, // Handled by main canvas
    'rect': null, // Handled by main canvas
    'ellipse': null, // Handled by main canvas
    'text': null, // Handled by main canvas
    'moveText': null, // Handled by main canvas

    // Selection & Transform
    'advancedSelection': AdvancedSelection,
    'transform': null, // Handled by main canvas
    'move': null, // Handled by main canvas

    // Vector & Paths (UV-based 3D surface drawing)
    'vectorTools': ProfessionalVectorTool,
    'vector': ProfessionalVectorTool,

    // Effects & Filters
    'layerEffects': LayerEffects,
    'colorGrading': ColorGrading,

    // Textile Design
    'puffPrint': null, // Handled by existing PuffPrintTool
    'patternMaker': PatternMaker,
    'embroidery': null, // Settings in RightPanelNew.tsx, drawing on 3D model

    // AI & Automation
    'aiAssistant': null,
    'batch': BatchProcessing,

    // Media & Animation
    'animation': null,

    // Assets & Templates
    'templates': DesignTemplates,

    // Export & Sync
    'printExport': null,
    'cloudSync': CloudSync,

    // Advanced Tools
    'advancedBrush': AdvancedBrushSystem,
    'meshDeformation': null,
    'proceduralGenerator': ProceduralGenerator,
    '3dPainting': null,
    'smartFill': SmartFillTool,

    // History & Undo
    'undo': null, // Handled by main app
    'redo': null, // Handled by main app
  };

  if (!active) {
    // Console log removed
    return null;
  }

  const ToolComponent = toolRoutes[activeTool as keyof typeof toolRoutes];

  if (!ToolComponent) {
    // Console log removed
    return null;
  }

  console.log('🔀 ToolRouter: Rendering tool component', { 
    activeTool,
    componentName: ToolComponent.name
  });


  // Right sidebar tools (embroidery, advanced brush)
  if (activeTool === 'embroidery' || activeTool === 'advancedBrush') {
    const width = activeTool === 'advancedBrush' ? '360px' : '350px';
    const className = `${activeTool}-right-sidebar`;
    return (
      <div
        className={className}
        style={{
          position: 'fixed',
          top: '60px',
          right: 0,
          width,
          height: 'calc(100vh - 60px)',
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          borderLeft: '1px solid #334155',
          zIndex: 1001,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-12px 0 30px rgba(2, 6, 23, 0.35)'
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: activeTool === 'advancedBrush' ? '0' : '0',
            scrollbarWidth: 'thin',
            scrollbarColor: '#475569 #1E293B'
          }}
        >
          <ToolComponent active={true} />
        </div>
      </div>
    );
  }

  // Default overlay behavior for other tools
  return (
    <div className="tool-router" style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, pointerEvents: 'none'
    }}>
      <div style={{
        position: 'absolute', top: '20px', left: '20px', width: '420px', maxWidth: '90vw', pointerEvents: 'auto',
        background: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)',
        backdropFilter: 'blur(10px)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
      }}>
        <ToolComponent active={true} />
      </div>
    </div>
  );
}

