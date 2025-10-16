/**
 * 🎯 Universal Selection Context Menu
 * 
 * Right-click context menu for selected elements with categorized actions
 */

import React, { useEffect, useRef, useState } from 'react';
import { useUniversalSelection } from '../../stores/UniversalSelectionStore';
import { UniversalElement, ContextMenuAction } from '../../types/UniversalSelection';

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  elements: UniversalElement[];
  onClose: () => void;
}

interface ContextMenuSection {
  category: string;
  actions: ContextMenuAction[];
}

export function ContextMenu({ visible, x, y, elements, onClose }: ContextMenuProps) {
  const { getContextMenuActions } = useUniversalSelection();
  const menuRef = useRef<HTMLDivElement>(null);
  const [sections, setSections] = useState<ContextMenuSection[]>([]);

  // Update sections when elements change
  useEffect(() => {
    if (elements.length === 0) {
      setSections([]);
      return;
    }

    const actions = getContextMenuActions(elements);
    const groupedActions = actions.reduce((acc, action) => {
      const category = action.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(action);
      return acc;
    }, {} as Record<string, ContextMenuAction[]>);

    const newSections: ContextMenuSection[] = Object.entries(groupedActions).map(
      ([category, categoryActions]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        actions: categoryActions
      })
    );

    setSections(newSections);
  }, [elements, getContextMenuActions]);

  // Handle click outside to close
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  if (!visible || sections.length === 0) return null;

  const handleActionClick = (action: ContextMenuAction) => {
    if (action.enabled) {
      action.action();
      onClose();
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'edit': return '✏️';
      case 'transform': return '🔄';
      case 'arrange': return '📐';
      case 'group': return '📦';
      case 'delete': return '🗑️';
      default: return '⚙️';
    }
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        backgroundColor: '#1e1e1e',
        border: '1px solid #3c3c3c',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        zIndex: 10000,
        minWidth: '180px',
        maxWidth: '250px',
        padding: '4px 0',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #3c3c3c',
          fontSize: '12px',
          color: '#cccccc',
          fontWeight: 'bold'
        }}
      >
        {elements.length === 1 
          ? `${elements[0].type.charAt(0).toUpperCase() + elements[0].type.slice(1)} Element`
          : `${elements.length} Elements Selected`
        }
      </div>

      {/* Action sections */}
      {sections.map((section, sectionIndex) => (
        <div key={section.category}>
          {/* Section header */}
          <div
            style={{
              padding: '6px 12px 4px',
              fontSize: '10px',
              color: '#888888',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginTop: sectionIndex > 0 ? '8px' : '0'
            }}
          >
            {getCategoryIcon(section.category)} {section.category}
          </div>

          {/* Section actions */}
          {section.actions.map((action, actionIndex) => (
            <div key={action.id}>
              {action.separator && actionIndex > 0 && (
                <div
                  style={{
                    height: '1px',
                    backgroundColor: '#3c3c3c',
                    margin: '4px 8px'
                  }}
                />
              )}
              
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  cursor: action.enabled ? 'pointer' : 'not-allowed',
                  opacity: action.enabled ? 1 : 0.5,
                  fontSize: '13px',
                  color: action.enabled ? '#ffffff' : '#666666',
                  transition: 'background-color 0.1s ease'
                }}
                onMouseEnter={(e) => {
                  if (action.enabled) {
                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => handleActionClick(action)}
              >
                {/* Action icon */}
                <span style={{ marginRight: '8px', fontSize: '14px' }}>
                  {action.icon}
                </span>

                {/* Action label */}
                <span style={{ flex: 1 }}>
                  {action.label}
                </span>

                {/* Keyboard shortcut */}
                {action.shortcut && (
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#888888',
                      backgroundColor: '#3c3c3c',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      marginLeft: '8px'
                    }}
                  >
                    {action.shortcut}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Footer */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid #3c3c3c',
          fontSize: '10px',
          color: '#888888',
          textAlign: 'center'
        }}
      >
        Right-click to close
      </div>
    </div>
  );
}
