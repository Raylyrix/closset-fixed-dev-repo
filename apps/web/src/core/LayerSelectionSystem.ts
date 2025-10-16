/**
 * 🎯 Layer Selection System
 * 
 * Handles click-to-select functionality for layers and their content
 * Provides visual feedback and selection state management
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface SelectedElement {
  id: string;
  type: 'brush-stroke' | 'text' | 'shape' | 'image' | 'puff' | 'embroidery';
  layerId: string;
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
  };
  data: any; // Element-specific data
}

export interface SelectionState {
  selectedElements: SelectedElement[];
  activeElement: SelectedElement | null;
  selectionMode: 'single' | 'multi' | 'add' | 'subtract';
  isSelecting: boolean;
  selectionBox: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    isActive: boolean;
  };
}

export interface SelectionActions {
  // Selection management
  selectElement: (element: SelectedElement) => void;
  selectMultiple: (elements: SelectedElement[]) => void;
  addToSelection: (element: SelectedElement) => void;
  removeFromSelection: (elementId: string) => void;
  clearSelection: () => void;
  
  // Selection mode
  setSelectionMode: (mode: SelectionState['selectionMode']) => void;
  
  // Selection box (marquee selection)
  startSelectionBox: (x: number, y: number) => void;
  updateSelectionBox: (x: number, y: number) => void;
  endSelectionBox: () => void;
  
  // Element interaction
  moveElement: (elementId: string, newPosition: { x: number; y: number }) => void;
  resizeElement: (elementId: string, newBounds: SelectedElement['bounds']) => void;
  
  // Visual feedback
  setActiveElement: (element: SelectedElement | null) => void;
  highlightElement: (elementId: string) => void;
  clearHighlight: () => void;
}

export const useLayerSelectionSystem = create<SelectionState & SelectionActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    selectedElements: [],
    activeElement: null,
    selectionMode: 'single',
    isSelecting: false,
    selectionBox: {
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isActive: false,
    },

    // Selection management
    selectElement: (element) => {
      const { selectionMode } = get();
      
      if (selectionMode === 'single') {
        set({ selectedElements: [element], activeElement: element });
      } else if (selectionMode === 'multi') {
        const { selectedElements } = get();
        const isAlreadySelected = selectedElements.some(el => el.id === element.id);
        
        if (isAlreadySelected) {
          set({ selectedElements: selectedElements.filter(el => el.id !== element.id) });
        } else {
          set({ selectedElements: [...selectedElements, element] });
        }
      }
    },

    selectMultiple: (elements) => {
      set({ selectedElements: elements, activeElement: elements[0] || null });
    },

    addToSelection: (element) => {
      const { selectedElements } = get();
      const isAlreadySelected = selectedElements.some(el => el.id === element.id);
      
      if (!isAlreadySelected) {
        set({ 
          selectedElements: [...selectedElements, element],
          activeElement: element
        });
      }
    },

    removeFromSelection: (elementId) => {
      const { selectedElements, activeElement } = get();
      const newSelection = selectedElements.filter(el => el.id !== elementId);
      
      set({ 
        selectedElements: newSelection,
        activeElement: activeElement?.id === elementId ? null : activeElement
      });
    },

    clearSelection: () => {
      set({ selectedElements: [], activeElement: null });
    },

    // Selection mode
    setSelectionMode: (mode) => {
      set({ selectionMode: mode });
    },

    // Selection box (marquee selection)
    startSelectionBox: (x, y) => {
      set({
        selectionBox: {
          startX: x,
          startY: y,
          endX: x,
          endY: y,
          isActive: true,
        },
        isSelecting: true,
      });
    },

    updateSelectionBox: (x, y) => {
      const { selectionBox } = get();
      if (selectionBox.isActive) {
        set({
          selectionBox: {
            ...selectionBox,
            endX: x,
            endY: y,
          },
        });
      }
    },

    endSelectionBox: () => {
      set({
        selectionBox: {
          startX: 0,
          startY: 0,
          endX: 0,
          endY: 0,
          isActive: false,
        },
        isSelecting: false,
      });
    },

    // Element interaction
    moveElement: (elementId, newPosition) => {
      const { selectedElements } = get();
      const updatedElements = selectedElements.map(el => 
        el.id === elementId 
          ? { ...el, position: newPosition }
          : el
      );
      
      set({ selectedElements: updatedElements });
    },

    resizeElement: (elementId, newBounds) => {
      const { selectedElements } = get();
      const updatedElements = selectedElements.map(el => 
        el.id === elementId 
          ? { ...el, bounds: newBounds }
          : el
      );
      
      set({ selectedElements: updatedElements });
    },

    // Visual feedback
    setActiveElement: (element) => {
      set({ activeElement: element });
    },

    highlightElement: (elementId) => {
      // This will be used to highlight elements on hover
      console.log('🎯 Highlighting element:', elementId);
    },

    clearHighlight: () => {
      console.log('🎯 Clearing highlight');
    },
  }))
);

// Helper functions for element detection
export const elementDetection = {
  /**
   * Detect if a click point intersects with any element
   */
  detectElementAtPoint: (
    clickX: number, 
    clickY: number, 
    elements: SelectedElement[]
  ): SelectedElement | null => {
    for (const element of elements) {
      const { bounds } = element;
      
      if (
        clickX >= bounds.minX &&
        clickX <= bounds.maxX &&
        clickY >= bounds.minY &&
        clickY <= bounds.maxY
      ) {
        return element;
      }
    }
    
    return null;
  },

  /**
   * Get elements within a selection box
   */
  getElementsInBox: (
    boxX1: number,
    boxY1: number,
    boxX2: number,
    boxY2: number,
    elements: SelectedElement[]
  ): SelectedElement[] => {
    const minX = Math.min(boxX1, boxX2);
    const maxX = Math.max(boxX1, boxX2);
    const minY = Math.min(boxY1, boxY2);
    const maxY = Math.max(boxY1, boxY2);
    
    return elements.filter(element => {
      const { bounds } = element;
      
      return (
        bounds.minX < maxX &&
        bounds.maxX > minX &&
        bounds.minY < maxY &&
        bounds.maxY > minY
      );
    });
  },

  /**
   * Calculate element bounds from brush stroke data
   */
  calculateBrushStrokeBounds: (strokeData: any): SelectedElement['bounds'] => {
    if (!strokeData.points || strokeData.points.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    }

    const points = strokeData.points;
    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }

    // Add brush size padding
    const padding = strokeData.size || 50;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
  },
};

export default useLayerSelectionSystem;
