/**
 * 🎯 Professional Vector Toolbar
 * 
 * Industry-grade toolbar component with:
 * - Professional tool icons
 * - Keyboard shortcuts display
 * - Tool states and feedback
 * - Responsive design
 * - Accessibility support
 * - Customizable layout
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ProfessionalVectorTools } from '../vector/ProfessionalVectorTools';
import { SelectionSystem } from '../vector/SelectionSystem';
import { UndoRedoSystem } from '../vector/UndoRedoSystem';

interface ToolbarProps {
  onToolChange?: (tool: string) => void;
  onAction?: (action: string, data?: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface ToolDefinition {
  id: string;
  name: string;
  icon: string;
  shortcut: string;
  description: string;
  category: 'drawing' | 'editing' | 'selection' | 'shapes' | 'text';
  enabled: boolean;
}

const PROFESSIONAL_TOOLS: ToolDefinition[] = [
  // Selection Tools
  {
    id: 'select',
    name: 'Select',
    icon: '↖️',
    shortcut: 'V',
    description: 'Select and move objects',
    category: 'selection',
    enabled: true
  },
  {
    id: 'pathSelection',
    name: 'Path Selection',
    icon: '🖱️',
    shortcut: 'A',
    description: 'Select path segments and anchor points',
    category: 'selection',
    enabled: true
  },
  
  // Drawing Tools
  {
    id: 'pen',
    name: 'Pen',
    icon: '✏️',
    shortcut: 'P',
    description: 'Draw freeform paths with anchor points',
    category: 'drawing',
    enabled: true
  },
  {
    id: 'pencil',
    name: 'Pencil',
    icon: '✏️',
    shortcut: 'N',
    description: 'Draw freehand paths',
    category: 'drawing',
    enabled: true
  },
  {
    id: 'brush',
    name: 'Brush',
    icon: '🖌️',
    shortcut: 'B',
    description: 'Paint with brush strokes',
    category: 'drawing',
    enabled: true
  },
  
  // Shape Tools
  {
    id: 'rectangle',
    name: 'Rectangle',
    icon: '⬜',
    shortcut: 'R',
    description: 'Draw rectangles and squares',
    category: 'shapes',
    enabled: true
  },
  {
    id: 'ellipse',
    name: 'Ellipse',
    icon: '⭕',
    shortcut: 'E',
    description: 'Draw ellipses and circles',
    category: 'shapes',
    enabled: true
  },
  {
    id: 'line',
    name: 'Line',
    icon: '📏',
    shortcut: 'L',
    description: 'Draw straight lines',
    category: 'shapes',
    enabled: true
  },
  {
    id: 'polygon',
    name: 'Polygon',
    icon: '⬟',
    shortcut: 'G',
    description: 'Draw polygons',
    category: 'shapes',
    enabled: true
  },
  {
    id: 'star',
    name: 'Star',
    icon: '⭐',
    shortcut: 'S',
    description: 'Draw stars',
    category: 'shapes',
    enabled: true
  },
  
  // Editing Tools
  {
    id: 'addAnchor',
    name: 'Add Anchor',
    icon: '➕',
    shortcut: '+',
    description: 'Add anchor points to paths',
    category: 'editing',
    enabled: true
  },
  {
    id: 'removeAnchor',
    name: 'Remove Anchor',
    icon: '➖',
    shortcut: '-',
    description: 'Remove anchor points from paths',
    category: 'editing',
    enabled: true
  },
  {
    id: 'convertAnchor',
    name: 'Convert Anchor',
    icon: '🔄',
    shortcut: 'C',
    description: 'Convert between corner and smooth points',
    category: 'editing',
    enabled: true
  },
  {
    id: 'curvature',
    name: 'Curvature',
    icon: '〰️',
    shortcut: 'U',
    description: 'Adjust path curvature',
    category: 'editing',
    enabled: true
  },
  
  // Text Tools
  {
    id: 'text',
    name: 'Text',
    icon: '📝',
    shortcut: 'T',
    description: 'Add text to your design',
    category: 'text',
    enabled: true
  },
  {
    id: 'textPath',
    name: 'Text on Path',
    icon: '📝',
    shortcut: 'Shift+T',
    description: 'Add text along a path',
    category: 'text',
    enabled: true
  }
];

const PROFESSIONAL_ACTIONS = [
  {
    id: 'undo',
    name: 'Undo',
    icon: '↶',
    shortcut: 'Ctrl+Z',
    description: 'Undo last action',
    enabled: true
  },
  {
    id: 'redo',
    name: 'Redo',
    icon: '↷',
    shortcut: 'Ctrl+Y',
    description: 'Redo last undone action',
    enabled: true
  },
  {
    id: 'copy',
    name: 'Copy',
    icon: '📋',
    shortcut: 'Ctrl+C',
    description: 'Copy selected objects',
    enabled: true
  },
  {
    id: 'paste',
    name: 'Paste',
    icon: '📋',
    shortcut: 'Ctrl+V',
    description: 'Paste copied objects',
    enabled: true
  },
  {
    id: 'delete',
    name: 'Delete',
    icon: '🗑️',
    shortcut: 'Delete',
    description: 'Delete selected objects',
    enabled: true
  },
  {
    id: 'group',
    name: 'Group',
    icon: '📦',
    shortcut: 'Ctrl+G',
    description: 'Group selected objects',
    enabled: true
  },
  {
    id: 'ungroup',
    name: 'Ungroup',
    icon: '📦',
    shortcut: 'Ctrl+Shift+G',
    description: 'Ungroup selected objects',
    enabled: true
  },
  {
    id: 'bringToFront',
    name: 'Bring to Front',
    icon: '⬆️',
    shortcut: 'Ctrl+]',
    description: 'Bring selected objects to front',
    enabled: true
  },
  {
    id: 'sendToBack',
    name: 'Send to Back',
    icon: '⬇️',
    shortcut: 'Ctrl+[',
    description: 'Send selected objects to back',
    enabled: true
  }
];

export const ProfessionalVectorToolbar: React.FC<ToolbarProps> = ({
  onToolChange,
  onAction,
  className = '',
  style = {}
}) => {
  const [activeTool, setActiveTool] = useState<string>('select');
  const [showTooltips, setShowTooltips] = useState<boolean>(false);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [toolState, setToolState] = useState<any>(null);
  const [selectionState, setSelectionState] = useState<any>(null);
  const [undoRedoState, setUndoRedoState] = useState<any>(null);
  
  const vectorTools = ProfessionalVectorTools.getInstance();
  const selectionSystem = SelectionSystem.getInstance();
  const undoRedoSystem = UndoRedoSystem.getInstance();
  
  // Update tool state
  useEffect(() => {
    const updateToolState = () => {
      setToolState(vectorTools.getState());
      setSelectionState(selectionSystem.getState());
      setUndoRedoState(undoRedoSystem.getState());
    };
    
    updateToolState();
    
    // Listen for state changes
    vectorTools.on('tool:changed', updateToolState);
    vectorTools.on('selection:changed', updateToolState);
    undoRedoSystem.on('state:updated', updateToolState);
    
    return () => {
      vectorTools.off('tool:changed', updateToolState);
      vectorTools.off('selection:changed', updateToolState);
      undoRedoSystem.off('state:updated', updateToolState);
    };
  }, [vectorTools, selectionSystem, undoRedoSystem]);
  
  const handleToolClick = useCallback((toolId: string) => {
    const result = vectorTools.setTool(toolId as any);
    if (result.success) {
      setActiveTool(toolId);
      onToolChange?.(toolId);
    }
  }, [vectorTools, onToolChange]);
  
  const handleActionClick = useCallback((actionId: string) => {
    switch (actionId) {
      case 'undo':
        undoRedoSystem.undo();
        break;
      case 'redo':
        undoRedoSystem.redo();
        break;
      case 'copy':
        onAction?.('copy');
        break;
      case 'paste':
        onAction?.('paste');
        break;
      case 'delete':
        onAction?.('delete');
        break;
      case 'group':
        onAction?.('group');
        break;
      case 'ungroup':
        onAction?.('ungroup');
        break;
      case 'bringToFront':
        onAction?.('bringToFront');
        break;
      case 'sendToBack':
        onAction?.('sendToBack');
        break;
    }
  }, [undoRedoSystem, onAction]);
  
  const getToolIcon = (tool: ToolDefinition) => {
    // In a real implementation, you'd use proper SVG icons
    return (
      <span className="tool-icon" style={{ fontSize: '18px' }}>
        {tool.icon}
      </span>
    );
  };
  
  const getActionIcon = (action: any) => {
    return (
      <span className="action-icon" style={{ fontSize: '16px' }}>
        {action.icon}
      </span>
    );
  };
  
  const renderToolButton = (tool: ToolDefinition) => {
    const isActive = activeTool === tool.id;
    const isDisabled = !tool.enabled;
    
    return (
      <button
        key={tool.id}
        className={`tool-button ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
        onClick={() => !isDisabled && handleToolClick(tool.id)}
        onMouseEnter={() => setHoveredTool(tool.id)}
        onMouseLeave={() => setHoveredTool(null)}
        disabled={isDisabled}
        title={`${tool.name} (${tool.shortcut})`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '8px',
          border: 'none',
          background: isActive ? '#007acc' : 'transparent',
          color: isActive ? 'white' : '#333',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          borderRadius: '4px',
          minWidth: '60px',
          minHeight: '60px',
          transition: 'all 0.2s ease'
        }}
      >
        {getToolIcon(tool)}
        <span className="tool-name" style={{ fontSize: '10px', marginTop: '4px' }}>
          {tool.name}
        </span>
        <span className="tool-shortcut" style={{ fontSize: '8px', opacity: 0.7 }}>
          {tool.shortcut}
        </span>
      </button>
    );
  };
  
  const renderActionButton = (action: any) => {
    const isDisabled = !action.enabled || 
      (action.id === 'undo' && !undoRedoState?.canUndo) ||
      (action.id === 'redo' && !undoRedoState?.canRedo);
    
    return (
      <button
        key={action.id}
        className={`action-button ${isDisabled ? 'disabled' : ''}`}
        onClick={() => !isDisabled && handleActionClick(action.id)}
        disabled={isDisabled}
        title={`${action.name} (${action.shortcut})`}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 12px',
          border: 'none',
          background: 'transparent',
          color: isDisabled ? '#ccc' : '#333',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          borderRadius: '4px',
          transition: 'all 0.2s ease'
        }}
      >
        {getActionIcon(action)}
        <span style={{ marginLeft: '6px', fontSize: '12px' }}>
          {action.name}
        </span>
      </button>
    );
  };
  
  const renderTooltip = () => {
    if (!showTooltips || !hoveredTool) return null;
    
    const tool = PROFESSIONAL_TOOLS.find(t => t.id === hoveredTool);
    if (!tool) return null;
    
    return (
      <div
        className="tooltip"
        style={{
          position: 'absolute',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 1000
        }}
      >
        <div style={{ fontWeight: 'bold' }}>{tool.name}</div>
        <div style={{ opacity: 0.8 }}>{tool.description}</div>
        <div style={{ opacity: 0.6 }}>Shortcut: {tool.shortcut}</div>
      </div>
    );
  };
  
  const groupedTools = PROFESSIONAL_TOOLS.reduce((groups, tool) => {
    if (!groups[tool.category]) {
      groups[tool.category] = [];
    }
    groups[tool.category].push(tool);
    return groups;
  }, {} as Record<string, ToolDefinition[]>);
  
  return (
    <div
      className={`professional-vector-toolbar ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '8px',
        minWidth: '200px',
        position: 'relative',
        ...style
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid #ddd'
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
          Vector Tools
        </h3>
        <button
          onClick={() => setShowTooltips(!showTooltips)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#666'
          }}
        >
          {showTooltips ? 'Hide' : 'Show'} Tips
        </button>
      </div>
      
      {/* Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid #ddd'
        }}
      >
        {PROFESSIONAL_ACTIONS.map(renderActionButton)}
      </div>
      
      {/* Tools by Category */}
      {Object.entries(groupedTools).map(([category, tools]) => (
        <div key={category} style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#666',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {category}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
              gap: '4px'
            }}
          >
            {tools.map(renderToolButton)}
          </div>
        </div>
      ))}
      
      {/* Status Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10px',
          color: '#666',
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #ddd'
        }}
      >
        <span>
          {selectionState?.selectedIds?.size || 0} selected
        </span>
        <span>
          {toolState?.activeTool || 'None'}
        </span>
      </div>
      
      {/* Tooltip */}
      {renderTooltip()}
    </div>
  );
};

export default ProfessionalVectorToolbar;
