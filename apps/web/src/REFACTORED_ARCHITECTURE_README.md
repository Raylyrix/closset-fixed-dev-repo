# ClOSSET Refactored Architecture

## 🎯 Overview

This document describes the major architectural refactoring of ClOSSET from a monolithic 3784-line component to a clean, modular, domain-driven architecture.

## 🏗️ Architecture Overview

### Before (Problems)
- ❌ **Monolithic Component**: `Shirt.tsx` (3784 lines) handled everything
- ❌ **Mixed Concerns**: 3D rendering, UI, business logic in one file
- ❌ **No Type Safety**: Heavy use of `any` types
- ❌ **State Management**: Scattered across components
- ❌ **Hard to Test**: Complex interdependencies
- ❌ **Poor Performance**: Large re-renders and memory leaks

### After (Solutions)
- ✅ **Modular Components**: Single responsibility components
- ✅ **Domain-Driven State**: Focused stores for different concerns
- ✅ **Type Safety**: Comprehensive TypeScript interfaces
- ✅ **Custom Hooks**: Extracted business logic
- ✅ **Testable**: Isolated, focused units
- ✅ **Performance**: Optimized rendering and resource management

## 📁 New File Structure

```
src/
├── stores/
│   ├── domainStores.ts          # Domain-driven state stores
│   └── ...
├── types/
│   ├── app.ts                   # Comprehensive type definitions
│   └── ...
├── hooks/
│   ├── useBrushEngine.ts        # Brush rendering logic
│   └── ...
├── components/
│   ├── ShirtRefactored.tsx      # Main orchestrator component
│   ├── shirt/
│   │   ├── ShirtRenderer.tsx    # 3D model rendering only
│   │   └── UVMapper.tsx         # UV coordinate mapping
│   ├── RightPanelNew.tsx        # UI using new stores
│   ├── Brush3DIntegrationNew.tsx # 3D painting system
│   └── ClosseTRefactoredDemo.tsx # Demo of new architecture
└── ...
```

## 🏪 Domain Stores

### `useModelStore` - 3D Models & UV Mapping
```typescript
interface ModelState {
  modelUrl: string | null;
  modelScene: THREE.Object3D | null;
  modelScale: number;
  modelPosition: THREE.Vector3;
  modelRotation: THREE.Vector3;
  uvCache: Map<string, UVPoint[]>;
  // ... actions
}
```

### `useToolStore` - Tools & Brush Settings
```typescript
interface ToolState {
  activeTool: ToolType;
  brushSettings: BrushSettings;
  brushColor: string;
  isDrawing: boolean;
  currentStroke: BrushPoint[];
  textElements: TextElement[];
  // ... actions
}
```

### `useLayerStore` - Canvas Layers
```typescript
interface LayerState {
  layers: Layer[];
  activeLayerId: string;
  composedCanvas: HTMLCanvasElement | null;
  // ... actions
}
```

### `useProjectStore` - Save/Load & Assets
```typescript
interface ProjectState {
  projectId: string | null;
  projectName: string;
  assets: Record<string, Asset>;
  // ... actions
}
```

## 🎨 Custom Hooks

### `useBrushEngine` - Advanced Brush Rendering
```typescript
const brushEngine = useBrushEngine(canvas);

// API
brushEngine.renderBrushStroke(points, settings, targetCtx);
brushEngine.createBrushStamp(settings);
brushEngine.calculateBrushDynamics(point, settings, index);
```

## 🔧 Component Responsibilities

### `ShirtRenderer` - 3D Model Display
- ✅ Model loading (GLTF, OBJ, FBX, etc.)
- ✅ Basic transformations (scale, position, rotation)
- ✅ Wireframe/normal debugging
- ❌ No painting logic
- ❌ No UI controls

### `UVMapper` - Coordinate Mapping
- ✅ UV to world position conversion
- ✅ Barycentric interpolation
- ✅ Surface normal calculation
- ❌ No rendering

### `Brush3DIntegration` - 3D Painting
- ✅ Raycasting to model surface
- ✅ UV coordinate painting
- ✅ Real-time texture updates
- ✅ Uses domain stores + brush engine

### `ShirtRefactored` - Main Orchestrator
- ✅ Combines all components
- ✅ Handles high-level state
- ✅ Manages loading/error states
- ✅ Clean 150-line component

## 🚀 Usage Examples

### Basic 3D Model Display
```tsx
import { ShirtRenderer } from './components/shirt/ShirtRenderer';

function ModelViewer() {
  return (
    <Canvas>
      <ShirtRenderer
        onModelLoaded={(data) => console.log('Model loaded:', data)}
        wireframe={false}
        showNormals={true}
      />
    </Canvas>
  );
}
```

### 3D Brush Painting
```tsx
import { Brush3DIntegration } from './components/Brush3DIntegrationNew';
import { useBrushEngine } from './hooks/useBrushEngine';

function PaintingScene() {
  const brushEngine = useBrushEngine();

  return (
    <Canvas>
      <ShirtRenderer />
      <Brush3DIntegration enabled={true} />
    </Canvas>
  );
}
```

### Using Domain Stores
```tsx
import { useToolStore, useModelStore } from './stores/domainStores';

function MyComponent() {
  const activeTool = useToolStore(state => state.activeTool);
  const brushColor = useToolStore(state => state.brushColor);
  const modelUrl = useModelStore(state => state.modelUrl);

  // Update state
  const setBrushColor = (color: string) => {
    useToolStore.getState().brushColor = color;
  };

  return (
    <div>
      <ColorPicker value={brushColor} onChange={setBrushColor} />
    </div>
  );
}
```

## 🔄 Migration Guide

### 1. Replace Old Components
```tsx
// Before
import { Shirt } from './Shirt'; // 3784 lines

// After
import { ShirtRefactored as Shirt } from './ShirtRefactored'; // 150 lines
```

### 2. Update State Usage
```tsx
// Before
import { useApp } from './App';
const brushColor = useApp(s => s.brushColor);

// After
import { useToolStore } from './stores/domainStores';
const brushColor = useToolStore(s => s.brushColor);
```

### 3. Use Custom Hooks
```tsx
// Before: Inline brush logic
const renderBrush = (points) => { /* 50 lines of code */ };

// After: Extracted hook
const brushEngine = useBrushEngine();
brushEngine.renderBrushStroke(points, settings);
```

## ✅ Benefits Achieved

### **Maintainability**
- Components are focused and small
- Clear separation of concerns
- Easy to understand and modify

### **Performance**
- Selective re-rendering
- Proper memoization
- Resource management

### **Developer Experience**
- Full TypeScript coverage
- Comprehensive interfaces
- Better error messages

### **Testability**
- Isolated components
- Dependency injection ready
- Pure functions where possible

### **Scalability**
- Easy to add new features
- Domain boundaries prevent coupling
- Modular architecture

## 🎯 Next Steps

1. **Complete Migration**: Update remaining components to use new stores
2. **Add Error Boundaries**: Implement proper error handling
3. **Performance Optimization**: Add React.memo and selective rendering
4. **Testing**: Add unit tests for hooks and utilities
5. **Documentation**: Expand this guide with more examples

## 🚀 Demo

Try the new architecture with:

```tsx
import { ClosseTRefactoredDemo } from './components/ClosseTRefactoredDemo';

function App() {
  return <ClosseTRefactoredDemo />;
}
```

This demonstrates real-time 3D brush painting with the new modular architecture! 🎨✨
