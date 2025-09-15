import React from 'react';
import { useApp } from '../App';

// Import all tool components
import { PatternMaker } from './PatternMaker';
import { AdvancedSelection } from './AdvancedSelection';
import { AIDesignAssistant } from './AIDesignAssistant';
import { PrintReadyExport } from './PrintReadyExport';
import { CloudSync } from './CloudSync';
import { LayerEffects } from './LayerEffects';
import { ColorGrading } from './ColorGrading';
import { AnimationTools } from './AnimationTools';
import { DesignTemplates } from './DesignTemplates';
import { BatchProcessing } from './BatchProcessing';
import { AdvancedBrushSystem } from './AdvancedBrushSystem';
import { MeshDeformationTool } from './MeshDeformationTool';
import { ProceduralGenerator } from './ProceduralGenerator';
import { ThreeDPaintingTool } from './3DPaintingTool';
import { SmartFillTool } from './SmartFillTool';
import EmbroideryTool from './EmbroideryTool';

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

    // Vector & Paths (handled directly on 3D model; no panel)
    'vectorTools': null,

    // Effects & Filters
    'layerEffects': LayerEffects,
    'colorGrading': ColorGrading,

    // Textile Design
    'puffPrint': null, // Handled by existing PuffPrintTool
    'patternMaker': PatternMaker,
    'embroidery': EmbroideryTool, // Enhanced embroidery tool with advanced features

    // AI & Automation
    'aiAssistant': AIDesignAssistant,
    'batch': BatchProcessing,

    // Media & Animation
    'animation': AnimationTools,

    // Assets & Templates
    'templates': DesignTemplates,

    // Export & Sync
    'printExport': PrintReadyExport,
    'cloudSync': CloudSync,

    // Advanced Tools
    'advancedBrush': AdvancedBrushSystem,
    'meshDeformation': MeshDeformationTool,
    'proceduralGenerator': ProceduralGenerator,
    '3dPainting': ThreeDPaintingTool,
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


  // Special handling for embroidery tool - create a right sidebar
  if (activeTool === 'embroidery') {
    return (
      <div className="embroidery-right-sidebar" style={{
        position: 'fixed',
        top: '60px', // Below the toolbar
        right: '0',
        width: '350px',
        height: 'calc(100vh - 60px)',
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        borderLeft: '1px solid #334155',
        zIndex: 1001, // Higher than other panels
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0',
          scrollbarWidth: 'thin',
          scrollbarColor: '#475569 #1E293B'
        }}>
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

