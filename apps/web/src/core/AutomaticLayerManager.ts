import { useAdvancedLayerStoreV2, LayerType } from './AdvancedLayerSystemV2';

// Event types for automatic layer creation
export type DrawingEventType = 
  | 'brush-start' 
  | 'brush-end' 
  | 'text-created' 
  | 'shape-created' 
  | 'image-imported' 
  | 'puff-applied' 
  | 'embroidery-applied'
  | 'vector-created';

export interface DrawingEvent {
  type: DrawingEventType;
  toolType: LayerType;
  timestamp: number;
  data?: any;
}

// Layer creation rules
interface LayerCreationRule {
  eventType: DrawingEventType;
  layerType: LayerType;
  shouldCreateNewLayer: (event: DrawingEvent, currentLayer?: any) => boolean;
  getLayerName: (event: DrawingEvent) => string;
}

// Default layer creation rules
const defaultLayerCreationRules: LayerCreationRule[] = [
  {
    eventType: 'brush-start',
    layerType: 'paint',
    shouldCreateNewLayer: (event, currentLayer) => {
      // Create new layer if no active layer or if current layer is locked
      return !currentLayer || currentLayer.locked || currentLayer.type !== 'paint';
    },
    getLayerName: (event) => `Brush Stroke ${Date.now()}`
  },
  {
    eventType: 'text-created',
    layerType: 'text',
    shouldCreateNewLayer: () => true, // Always create new layer for text
    getLayerName: (event) => `Text Layer ${Date.now()}`
  },
  {
    eventType: 'shape-created',
    layerType: 'vector',
    shouldCreateNewLayer: () => true, // Always create new layer for shapes
    getLayerName: (event) => `Shape Layer ${Date.now()}`
  },
  {
    eventType: 'image-imported',
    layerType: 'image',
    shouldCreateNewLayer: () => true, // Always create new layer for images
    getLayerName: (event) => `Image Layer ${Date.now()}`
  },
  {
    eventType: 'puff-applied',
    layerType: 'puff',
    shouldCreateNewLayer: () => true, // Always create new layer for puff effects
    getLayerName: (event) => `Puff Effect ${Date.now()}`
  },
  {
    eventType: 'embroidery-applied',
    layerType: 'embroidery',
    shouldCreateNewLayer: () => true, // Always create new layer for embroidery
    getLayerName: (event) => `Embroidery ${Date.now()}`
  },
  {
    eventType: 'vector-created',
    layerType: 'vector',
    shouldCreateNewLayer: () => true, // Always create new layer for vectors
    getLayerName: (event) => `Vector Layer ${Date.now()}`
  }
];

class AutomaticLayerManager {
  private rules: LayerCreationRule[] = defaultLayerCreationRules;
  private eventHistory: DrawingEvent[] = [];
  private isEnabled: boolean = true;
  private lastDrawingTime: number = 0;
  private drawingThreshold: number = 1000; // 1 second threshold for new layer creation

  constructor() {
    console.log('🎨 AutomaticLayerManager initialized');
  }

  // Enable/disable automatic layer creation
  public enable(): void {
    this.isEnabled = true;
    console.log('🎨 Automatic layer creation enabled');
  }

  public disable(): void {
    this.isEnabled = false;
    console.log('🎨 Automatic layer creation disabled');
  }

  // Add custom layer creation rule
  public addRule(rule: LayerCreationRule): void {
    this.rules.push(rule);
    console.log(`🎨 Added custom layer creation rule: ${rule.eventType}`);
  }

  // Process drawing event and potentially create new layer
  public processDrawingEvent(event: DrawingEvent): string | null {
    if (!this.isEnabled) {
      console.log('🎨 Automatic layer creation disabled, skipping event:', event.type);
      return null;
    }

    // Add to event history
    this.eventHistory.push(event);
    
    // Keep only last 100 events to prevent memory leaks
    if (this.eventHistory.length > 100) {
      this.eventHistory = this.eventHistory.slice(-100);
    }

    // Find matching rule
    const rule = this.rules.find(r => r.eventType === event.type);
    if (!rule) {
      console.log(`🎨 No rule found for event type: ${event.type}`);
      return null;
    }

    // Get current active layer
    const store = useAdvancedLayerStoreV2.getState();
    const currentLayer = store.activeLayerId 
      ? store.layers.find(layer => layer.id === store.activeLayerId)
      : null;

    // Check if we should create a new layer
    const shouldCreate = rule.shouldCreateNewLayer(event, currentLayer);
    
    // Additional check: don't create new layer if we just created one recently
    const timeSinceLastDrawing = Date.now() - this.lastDrawingTime;
    const tooRecent = timeSinceLastDrawing < this.drawingThreshold;

    if (!shouldCreate || tooRecent) {
      console.log(`🎨 Not creating new layer for ${event.type}:`, {
        shouldCreate,
        tooRecent,
        timeSinceLastDrawing
      });
      return currentLayer?.id || null;
    }

    // Create new layer
    const layerName = rule.getLayerName(event);
    const newLayerId = store.createLayer(rule.layerType, layerName);
    
    // Update last drawing time
    this.lastDrawingTime = Date.now();

    console.log(`🎨 Created new ${rule.layerType} layer: ${layerName}`, {
      eventType: event.type,
      layerId: newLayerId,
      timestamp: event.timestamp
    });

    return newLayerId;
  }

  // Get event history for debugging
  public getEventHistory(): DrawingEvent[] {
    return [...this.eventHistory];
  }

  // Clear event history
  public clearHistory(): void {
    this.eventHistory = [];
    console.log('🎨 Cleared event history');
  }

  // Check if we should create a new layer based on current state
  public shouldCreateNewLayer(eventType: DrawingEventType): boolean {
    const rule = this.rules.find(r => r.eventType === eventType);
    if (!rule) return false;

    const store = useAdvancedLayerStoreV2.getState();
    const currentLayer = store.activeLayerId 
      ? store.layers.find(layer => layer.id === store.activeLayerId)
      : null;

    const event: DrawingEvent = {
      type: eventType,
      toolType: rule.layerType,
      timestamp: Date.now()
    };

    return rule.shouldCreateNewLayer(event, currentLayer);
  }

  // Get layer name for a specific event type
  public getLayerNameForEvent(eventType: DrawingEventType): string {
    const rule = this.rules.find(r => r.eventType === eventType);
    if (!rule) return 'Unknown Layer';

    const event: DrawingEvent = {
      type: eventType,
      toolType: rule.layerType,
      timestamp: Date.now()
    };

    return rule.getLayerName(event);
  }
}

// Create singleton instance
export const automaticLayerManager = new AutomaticLayerManager();

// Helper functions for common drawing events
export const triggerDrawingEvent = (eventType: DrawingEventType, data?: any): string | null => {
  const event: DrawingEvent = {
    type: eventType,
    toolType: getLayerTypeFromEventType(eventType),
    timestamp: Date.now(),
    data
  };

  return automaticLayerManager.processDrawingEvent(event);
};

// Map event types to layer types
const getLayerTypeFromEventType = (eventType: DrawingEventType): LayerType => {
  const mapping: Record<DrawingEventType, LayerType> = {
    'brush-start': 'paint',
    'brush-end': 'paint',
    'text-created': 'text',
    'shape-created': 'vector',
    'image-imported': 'image',
    'puff-applied': 'puff',
    'embroidery-applied': 'embroidery',
    'vector-created': 'vector'
  };

  return mapping[eventType] || 'paint';
};

// React hook for automatic layer management
export const useAutomaticLayerManager = () => {
  const store = useAdvancedLayerStoreV2();

  return {
    // Manager controls
    enableAutoCreation: () => automaticLayerManager.enable(),
    disableAutoCreation: () => automaticLayerManager.disable(),
    
    // Event triggers
    triggerBrushStart: (data?: any) => triggerDrawingEvent('brush-start', data),
    triggerBrushEnd: (data?: any) => triggerDrawingEvent('brush-end', data),
    triggerTextCreated: (data?: any) => triggerDrawingEvent('text-created', data),
    triggerShapeCreated: (data?: any) => triggerDrawingEvent('shape-created', data),
    triggerImageImported: (data?: any) => triggerDrawingEvent('image-imported', data),
    triggerPuffApplied: (data?: any) => triggerDrawingEvent('puff-applied', data),
    triggerEmbroideryApplied: (data?: any) => triggerDrawingEvent('embroidery-applied', data),
    triggerVectorCreated: (data?: any) => triggerDrawingEvent('vector-created', data),
    
    // State
    isEnabled: automaticLayerManager['isEnabled'],
    eventHistory: automaticLayerManager.getEventHistory(),
    
    // Store state
    layers: store.layers,
    activeLayerId: store.activeLayerId,
    selectedLayerIds: store.selectedLayerIds
  };
};

export default automaticLayerManager;
