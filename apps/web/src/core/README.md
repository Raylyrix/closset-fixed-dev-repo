# Unified Layer System

A comprehensive, modern layer management system designed to replace the fragmented layer systems currently in use. This system provides a single source of truth for all layer operations while maintaining backward compatibility.

## 🎯 **Overview**

The Unified Layer System consists of several core components that work together to provide a robust, performant, and maintainable layer management solution:

- **UnifiedLayerManager**: Core layer operations and state management
- **CanvasManager**: Centralized canvas creation, pooling, and composition
- **ToolLayerIntegration**: Bridge between tools and layers
- **LayerMigration**: Utilities for migrating from existing systems
- **React Hooks**: Easy integration with React components

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                         │
├─────────────────────────────────────────────────────────────┤
│                useUnifiedLayers Hook                        │
├─────────────────────────────────────────────────────────────┤
│            UnifiedLayerIntegration Component                │
├─────────────────────────────────────────────────────────────┤
│  UnifiedLayerManager  │  CanvasManager  │  ToolIntegration │
├─────────────────────────────────────────────────────────────┤
│              Layer Types & Migration Utils                  │
└─────────────────────────────────────────────────────────────┘
```

## 📦 **Core Components**

### 1. UnifiedLayerManager

The central manager for all layer operations.

```typescript
import { UnifiedLayerManager } from '../core/UnifiedLayerManager';
import { CanvasManager } from '../core/CanvasManager';

const canvasManager = new CanvasManager(4096, 4096);
const layerManager = new UnifiedLayerManager(canvasManager);

// Create a layer
const brushLayer = layerManager.createLayer('raster', 'Brush Layer', 'brush');

// Manage layers
layerManager.setActiveLayer(brushLayer.id);
layerManager.setLayerOpacity(brushLayer.id, 0.8);
layerManager.setLayerVisible(brushLayer.id, true);

// Compose layers
const composedCanvas = layerManager.composeLayers();
```

### 2. CanvasManager

Handles all canvas operations including creation, pooling, and composition.

```typescript
import { CanvasManager } from '../core/CanvasManager';

const canvasManager = new CanvasManager(4096, 4096);

// Create a canvas
const canvas = canvasManager.createCanvas('layer-1', 4096, 4096);

// Get composed canvas
const composedCanvas = canvasManager.getComposedCanvas();

// Create displacement maps
const displacementCanvas = canvasManager.createDisplacementMap(layers);
const normalCanvas = canvasManager.createNormalMap(displacementCanvas);
```

### 3. ToolLayerIntegration

Provides a clean interface for tools to interact with layers.

```typescript
import { ToolLayerIntegration } from '../core/ToolLayerIntegration';

const toolIntegration = new ToolLayerIntegration(layerManager, canvasManager);

// Draw with different tools
toolIntegration.drawBrushStroke('brush', {
  points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
  color: '#ff0000',
  size: 10,
  opacity: 1.0
});

toolIntegration.drawPuffPrint('puffPrint', {
  x: 150, y: 150, size: 30,
  color: '#00ff00', height: 2.0
});
```

### 4. React Hook Integration

Easy integration with React components.

```typescript
import { useUnifiedLayers } from '../hooks/useUnifiedLayers';

function MyComponent() {
  const {
    layers,
    activeLayer,
    createLayer,
    deleteLayer,
    drawBrushStroke,
    composeLayers
  } = useUnifiedLayers({
    canvasWidth: 4096,
    canvasHeight: 4096,
    autoCompose: true
  });

  const handleCreateBrushLayer = () => {
    createLayer('raster', 'New Brush Layer', 'brush');
  };

  const handleDraw = () => {
    drawBrushStroke('brush', {
      points: [{ x: 100, y: 100 }],
      color: '#ff0000',
      size: 10
    });
  };

  return (
    <div>
      <button onClick={handleCreateBrushLayer}>Create Layer</button>
      <button onClick={handleDraw}>Draw</button>
      <p>Active Layer: {activeLayer?.name}</p>
      <p>Total Layers: {layers.length}</p>
    </div>
  );
}
```

## 🔄 **Migration from Existing Systems**

The system includes comprehensive migration utilities to transition from existing layer systems:

```typescript
import { LayerMigration } from '../core/LayerMigration';

const migration = new LayerMigration(layerManager, canvasManager);

// Migrate from App.tsx layers
const migrationData = {
  appLayers: existingAppState.layers,
  layerSystemLayers: existingLayerSystem.layers,
  domainLayers: existingDomainState.layers,
  activeLayerId: existingAppState.activeLayerId,
  layerOrder: existingAppState.layers.map(l => l.id)
};

// Perform migration
const migratedLayers = migration.mergeAllLayerSystems(migrationData);
migration.applyMigratedLayers(migratedLayers);
```

## 🎨 **Tool Integration**

Each tool is properly integrated with the layer system:

### Brush Tool
```typescript
const brushStroke = {
  points: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
  color: '#ff0000',
  size: 10,
  opacity: 1.0,
  hardness: 1.0,
  flow: 1.0,
  spacing: 1.0,
  shape: 'round',
  blendMode: 'source-over'
};

toolIntegration.drawBrushStroke('brush', brushStroke);
```

### Puff Print Tool
```typescript
const puffData = {
  x: 150, y: 150,
  size: 30,
  opacity: 1.0,
  color: '#00ff00',
  height: 2.0,
  curvature: 0.5
};

toolIntegration.drawPuffPrint('puffPrint', puffData);
```

### Embroidery Tool
```typescript
const embroideryStitch = {
  type: 'satin',
  color: '#0000ff',
  threadType: 'cotton',
  thickness: 2.0,
  opacity: 1.0,
  points: [{ x: 300, y: 300 }, { x: 350, y: 350 }]
};

toolIntegration.drawEmbroideryStitch('embroidery', embroideryStitch);
```

## 🎛️ **Layer Operations**

### Creating Layers
```typescript
// Create different types of layers
const brushLayer = layerManager.createLayer('raster', 'Brush Layer', 'brush');
const vectorLayer = layerManager.createLayer('vector', 'Vector Layer', 'vector');
const textLayer = layerManager.createLayer('text', 'Text Layer', 'general');
```

### Managing Layer Properties
```typescript
// Set layer properties
layerManager.setLayerVisible(layerId, true);
layerManager.setLayerOpacity(layerId, 0.8);
layerManager.setLayerBlendMode(layerId, 'multiply');

// Layer ordering
layerManager.moveLayerUp(layerId);
layerManager.moveLayerDown(layerId);
layerManager.bringToFront(layerId);
layerManager.sendToBack(layerId);
```

### Layer Composition
```typescript
// Compose all visible layers
const composedCanvas = layerManager.composeLayers();

// Update displacement maps for 3D effects
layerManager.updateDisplacementMaps();

// Invalidate composition when needed
layerManager.invalidateComposition();
```

## 🔧 **Advanced Features**

### Layer Groups
```typescript
// Create layer groups
const groupId = layerManager.createGroup('My Group', [layer1.id, layer2.id]);

// Add layers to groups
layerManager.addToGroup(groupId, layer3.id);

// Remove layers from groups
layerManager.removeFromGroup(layer3.id);
```

### Layer Effects
```typescript
// Add effects to layers
const effect = {
  id: 'blur-effect',
  type: 'blur',
  settings: { radius: 5 },
  enabled: true
};

layerManager.addEffect(layerId, effect);
layerManager.updateEffect(layerId, 'blur-effect', { radius: 10 });
layerManager.removeEffect(layerId, 'blur-effect');
```

### Canvas Pooling and Memory Management
```typescript
// Get canvas statistics
const stats = canvasManager.getStats();
console.log(`Active canvases: ${stats.activeCanvases}`);
console.log(`Pooled canvases: ${stats.pooledCanvases}`);
console.log(`Memory usage: ${(stats.totalMemory / 1024 / 1024).toFixed(1)} MB`);

// Cleanup when needed
canvasManager.cleanup();
canvasManager.clearPool();
```

## 🚀 **Performance Optimizations**

1. **Canvas Pooling**: Reuses canvas objects to reduce memory allocation
2. **Lazy Composition**: Only composes layers when needed
3. **Efficient Updates**: Batches multiple operations together
4. **Memory Management**: Automatic cleanup of unused resources
5. **Optimized Rendering**: Uses efficient canvas operations

## 🧪 **Testing**

The system includes comprehensive testing utilities:

```typescript
import { UnifiedLayerTest } from '../components/UnifiedLayerTest';

// Use the test component to verify functionality
<UnifiedLayerTest />
```

The test component verifies:
- Layer creation and management
- Tool drawing operations
- Layer composition
- Displacement map generation
- Memory usage and performance
- Error handling

## 📋 **Best Practices**

1. **Always use the React hook** for component integration
2. **Initialize the system once** and reuse instances
3. **Use tool-specific layers** for better organization
4. **Clean up resources** when components unmount
5. **Monitor memory usage** in production
6. **Test thoroughly** before deploying

## 🔍 **Debugging**

The system provides extensive debugging capabilities:

```typescript
// Access unified layers globally for debugging
const unifiedLayers = (window as any).__unifiedLayers;

// Check layer state
console.log('Layers:', unifiedLayers.layers);
console.log('Active Layer:', unifiedLayers.activeLayer);
console.log('Stats:', unifiedLayers.stats);

// Force composition
unifiedLayers.composeLayers();

// Update displacement maps
unifiedLayers.updateDisplacementMaps();
```

## 🎉 **Benefits**

- ✅ **Single Source of Truth**: All layer operations go through one system
- ✅ **Type Safety**: Full TypeScript support with proper interfaces
- ✅ **Performance**: Optimized canvas operations and memory management
- ✅ **Maintainability**: Clean separation of concerns and modular design
- ✅ **Backward Compatibility**: Seamless migration from existing systems
- ✅ **Tool Integration**: Proper tool-to-layer mapping and cleanup
- ✅ **React Integration**: Easy to use hooks and components
- ✅ **Testing**: Comprehensive test utilities and debugging tools

## 🔮 **Future Enhancements**

- Layer masking and clipping
- Advanced blending modes
- Layer animation and keyframes
- Real-time collaboration
- GPU-accelerated rendering
- Advanced filter effects
- Layer templates and presets

---

For more detailed information, see the individual component documentation and the test components for usage examples.

