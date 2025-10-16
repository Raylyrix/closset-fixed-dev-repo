/**
 * 🎯 Selection Integration Component
 * 
 * Integrates the universal selection system with existing tools:
 * - Text elements from useApp store
 * - Image elements from useApp store  
 * - Shape elements from useApp store
 * - Brush strokes and other drawing elements
 */

import React, { useEffect, useMemo } from 'react';
import { useApp } from '../../App';
import { useUniversalSelection } from '../../stores/UniversalSelectionStore';
import { UniversalElement } from '../../types/UniversalSelection';

interface SelectionIntegrationProps {
  children: React.ReactNode;
}

export function SelectionIntegration({ children }: SelectionIntegrationProps) {
  const { 
    addElement, 
    updateElement, 
    removeElement, 
    getAllElements,
    syncWithExistingStores 
  } = useUniversalSelection();

  // Get all existing elements from useApp store
  const {
    textElements,
    importedImages,
    shapeElements,
    activeTextId,
    selectedImageId,
    activeShapeId
  } = useApp();

  // Convert text elements to universal elements
  const universalTextElements = useMemo(() => {
    return textElements.map((text): UniversalElement => ({
      id: text.id,
      type: 'text',
      bounds: {
        x: text.u * 1024, // Convert UV to pixels (assuming 1024x1024 canvas)
        y: (1 - text.v) * 1024, // Flip V coordinate
        width: text.fontSize * (text.text.length * 0.6), // Approximate text width
        height: text.fontSize,
        rotation: text.rotation || 0
      },
      visible: true,
      locked: false,
      zIndex: text.zIndex || 0,
      data: {
        text: text.text,
        fontSize: text.fontSize,
        fontFamily: text.fontFamily,
        color: text.color,
        bold: text.bold,
        italic: text.italic,
        align: text.align,
        baseline: text.textBaseline,
        stroke: text.stroke,
        strokeWidth: text.strokeWidth
      }
    }));
  }, [textElements]);

  // Convert imported images to universal elements
  const universalImageElements = useMemo(() => {
    return importedImages.map((image): UniversalElement => ({
      id: image.id,
      type: 'image',
      bounds: {
        x: image.u * 1024,
        y: (1 - image.v) * 1024,
        width: image.uWidth * 1024,
        height: image.uHeight * 1024,
        rotation: image.rotation || 0
      },
      visible: true,
      locked: false,
      zIndex: 0,
      data: {
        src: image.src,
        width: image.uWidth * 1024,
        height: image.uHeight * 1024,
        opacity: image.opacity || 1,
        blendMode: 'source-over' as GlobalCompositeOperation
      }
    }));
  }, [importedImages]);

  // Convert shape elements to universal elements
  const universalShapeElements = useMemo(() => {
    return shapeElements.map((shape): UniversalElement => ({
      id: shape.id,
      type: 'shape',
      bounds: {
        x: shape.u * 1024,
        y: (1 - shape.v) * 1024,
        width: shape.uWidth * 1024,
        height: shape.uHeight * 1024,
        rotation: shape.rotation || 0
      },
      visible: true,
      locked: false,
      zIndex: 0,
      data: {
        shapeType: shape.type,
        points: shape.points || [],
        stroke: shape.stroke,
        fill: shape.fill,
        strokeWidth: shape.strokeWidth
      }
    }));
  }, [shapeElements]);

  // Sync elements with universal selection store
  useEffect(() => {
    // Clear existing elements
    const existingElements = getAllElements();
    for (const element of existingElements) {
      removeElement(element.id);
    }

    // Add all elements
    const allElements = [
      ...universalTextElements,
      ...universalImageElements,
      ...universalShapeElements
    ];

    for (const element of allElements) {
      addElement(element);
    }
  }, [
    universalTextElements,
    universalImageElements,
    universalShapeElements,
    addElement,
    removeElement,
    getAllElements
  ]);

  // Sync selection state with existing tool selections
  useEffect(() => {
    // Sync active text selection
    if (activeTextId) {
      const textElement = universalTextElements.find(el => el.id === activeTextId);
      if (textElement) {
        // This would be handled by the selection system
        console.log('Sync active text:', activeTextId);
      }
    }

    // Sync active image selection
    if (selectedImageId) {
      const imageElement = universalImageElements.find(el => el.id === selectedImageId);
      if (imageElement) {
        console.log('Sync active image:', selectedImageId);
      }
    }

    // Sync active shape selection
    if (activeShapeId) {
      const shapeElement = universalShapeElements.find(el => el.id === activeShapeId);
      if (shapeElement) {
        console.log('Sync active shape:', activeShapeId);
      }
    }
  }, [
    activeTextId,
    selectedImageId,
    activeShapeId,
    universalTextElements,
    universalImageElements,
    universalShapeElements
  ]);

  // Initialize sync with existing stores
  useEffect(() => {
    syncWithExistingStores();
  }, [syncWithExistingStores]);

  return <>{children}</>;
}

/**
 * Hook to get selection state for use in other components
 */
export function useSelectionIntegration() {
  const { getSelectedElements, selectedIds } = useUniversalSelection();
  const { 
    updateTextElement, 
    updateImportedImage, 
    updateShapeElement,
    selectTextElement,
    setSelectedImageId,
    setActiveShapeId
  } = useApp();

  const selectedElements = getSelectedElements();

  const syncSelectionWithTools = () => {
    const selectedTexts = selectedElements.filter(el => el.type === 'text');
    const selectedImages = selectedElements.filter(el => el.type === 'image');
    const selectedShapes = selectedElements.filter(el => el.type === 'shape');

    // Sync with text tool
    if (selectedTexts.length === 1) {
      selectTextElement(selectedTexts[0].id);
    } else {
      selectTextElement(null);
    }

    // Sync with image tool
    if (selectedImages.length === 1) {
      setSelectedImageId(selectedImages[0].id);
    } else {
      setSelectedImageId(null);
    }

    // Sync with shape tool
    if (selectedShapes.length === 1) {
      setActiveShapeId(selectedShapes[0].id);
    } else {
      setActiveShapeId(null);
    }
  };

  const applyTransformToElements = (transform: any) => {
    for (const element of selectedElements) {
      switch (element.type) {
        case 'text':
          updateTextElement(element.id, {
            u: transform.x / 1024,
            v: 1 - (transform.y / 1024),
            rotation: transform.rotation
          });
          break;
        case 'image':
          updateImportedImage(element.id, {
            u: transform.x / 1024,
            v: 1 - (transform.y / 1024),
            uWidth: transform.width / 1024,
            uHeight: transform.height / 1024,
            rotation: transform.rotation
          });
          break;
        case 'shape':
          updateShapeElement(element.id, {
            u: transform.x / 1024,
            v: 1 - (transform.y / 1024),
            uWidth: transform.width / 1024,
            uHeight: transform.height / 1024,
            rotation: transform.rotation
          });
          break;
      }
    }
  };

  return {
    selectedElements,
    selectedIds,
    syncSelectionWithTools,
    applyTransformToElements
  };
}
