# 🎨 Advanced Brush System Implementation

A comprehensive, Procreate-level brush system for 3D design applications built with TypeScript and modern web technologies.

## 🚀 Features

### Core Brush Engine
- **Advanced Rendering Pipeline**: Multi-pass brush stroke rendering with dynamic properties
- **Real-time Dynamics**: Velocity, tilt, bearing, and pressure sensitivity with customizable curves
- **Complex Brush Shapes**: Circle, square, diamond, triangle, star, and custom shapes with hardness control
- **Procedural Textures**: Canvas weave, watercolor, bristle patterns, paper texture, and noise generation

### Professional Brush Types
- **Hard Round**: Precision digital brush
- **Watercolor Flat**: Soft, flowing watercolor simulation
- **Pixel Brush**: 1:1 pixel art tool
- **Soft Charcoal**: Natural pencil simulation
- **Bristle Oil**: Oil painting with bristle texture

### Advanced Features
- **Stroke Stabilization**: Configurable delay and quality settings with adaptive behavior
- **Wet Media Simulation**: Flow, drying, blending, and absorption effects with pigment mapping
- **3D UV Integration**: Paint directly on 3D models with real-time UV coordinate mapping
- **Performance Optimization**: Adaptive quality, batching, and memory management

## 📁 File Structure

```
src/utils/
├── BrushEngine.ts              # Core brush rendering engine
├── StrokeSmoothing.ts          # Smoothing and wet media simulation
├── BrushPresets.ts            # Preset management system
├── UVBrushIntegration.ts      # 3D integration utilities
└── BrushPerformanceOptimizer.ts # Performance monitoring and optimization

src/components/
├── AdvancedBrushSystemV2.tsx  # Complete brush UI system
├── Brush3DIntegration.tsx     # 3D painting integration
└── BrushSystemDemo.tsx        # Demo and example usage
```

## 🛠️ Installation & Usage

### 1. Import the Brush System

```typescript
import { BrushEngine, BrushSettings } from './utils/BrushEngine';
import { brushPresetManager } from './utils/BrushPresets';
import { AdvancedBrushSystemV2 } from './components/AdvancedBrushSystemV2';
```

### 2. Basic Usage

```tsx
function MyApp() {
  return (
    <div>
      {/* Advanced Brush Panel */}
      <AdvancedBrushSystemV2 active={true} />

      {/* 3D Canvas with Brush Integration */}
      <Canvas>
        <Brush3DIntegration
          modelMesh={shirtMesh}
          modelId="shirt-model"
          activeBrush={currentBrushSettings}
          onBrushStroke={(points, settings) => {
            console.log('Brush stroke:', points.length, 'points');
          }}
        />
      </Canvas>
    </div>
  );
}
```

### 3. Using the Brush Engine Directly

```typescript
// Initialize brush engine
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const brushEngine = new BrushEngine(canvas);

// Load a preset
const brushSettings = brushPresetManager.getPreset('watercolor_flat')?.settings;

// Create a brush stroke
const points: BrushPoint[] = [
  { x: 100, y: 100, pressure: 1, tiltX: 0, tiltY: 0, velocity: 0, timestamp: Date.now(), distance: 0 },
  { x: 150, y: 120, pressure: 0.8, tiltX: 0, tiltY: 0, velocity: 50, timestamp: Date.now() + 16, distance: 50 }
];

// Render the stroke
brushEngine.renderBrushStroke(points, brushSettings);
```

## 🎛️ Brush Settings API

### BrushSettings Interface

```typescript
interface BrushSettings {
  dynamics: {
    size: {
      base: number;           // Base brush size
      variation: number;      // Random size variation (0-1)
      pressureCurve: number[]; // Pressure response curve
      velocityCurve: number[]; // Velocity response curve
      tiltCurve: number[];    // Tilt response curve
    };
    opacity: {
      base: number;           // Base opacity
      variation: number;      // Random opacity variation
      pressureCurve: number[];
      velocityCurve: number[];
      tiltCurve: number[];
    };
    flow: {
      base: number;           // Base flow
      variation: number;      // Random flow variation
      pressureCurve: number[];
      velocityCurve: number[];
    };
    angle: {
      base: number;           // Base angle
      variation: number;      // Random angle variation
      followVelocity: boolean; // Follow stroke direction
      followTilt: boolean;    // Follow pen tilt
      random: boolean;        // Add random rotation
    };
    spacing: {
      base: number;           // Base spacing between stamps
      variation: number;      // Random spacing variation
      pressureCurve: number[];
      velocityCurve: number[];
    };
    scattering: {
      amount: number;         // Scatter distance
      count: number;          // Number of scattered stamps
    };
  };
  shape: {
    type: 'circle' | 'square' | 'diamond' | 'triangle' | 'star' | 'custom';
    hardness: number;         // Edge softness (0-1)
    roundness: number;        // Shape roundness (0-1)
    angle: number;            // Shape rotation
    scale: number;            // Shape scale
    aspectRatio: number;      // Width/height ratio
  };
  texture: {
    pattern: 'solid' | 'noise' | 'bristles' | 'canvas' | 'paper' | 'custom';
    scale: number;            // Texture scale
    rotation: number;         // Texture rotation
    opacity: number;          // Texture opacity
    blendMode: GlobalCompositeOperation;
    noise: {
      type: 'perlin' | 'simplex' | 'value';
      frequency: number;
      octaves: number;
      persistence: number;
      lacunarity: number;
    };
    bristles?: {
      count: number;          // Number of bristles
      length: number;         // Bristle length
      thickness: number;      // Bristle thickness
      randomness: number;     // Bristle randomness
    };
  };
  color: {
    primary: string;
    secondary?: string;
    gradient?: {
      type: 'linear' | 'radial' | 'conic';
      colors: string[];
      stops: number[];
      angle: number;
    };
  };
  blendMode: GlobalCompositeOperation;
  stabilization: {
    enabled: boolean;
    delay: number;            // Prediction delay (points)
    quality: number;          // Smoothing quality (0-1)
  };
  wetMedia: {
    enabled: boolean;
    flow: number;             // Media flow rate
    drying: number;           // Drying speed
    blending: number;         // Color blending amount
    absorption: number;       // Surface absorption
  };
}
```

## 🖼️ Brush Presets

### Built-in Presets

1. **Basic Category**
   - `hard_round`: Precision round brush
   - `soft_round`: Soft-edged round brush

2. **Artistic Category**
   - `watercolor_flat`: Traditional watercolor
   - `charcoal_soft`: Natural charcoal pencil
   - `pastel_chalk`: Soft pastel simulation

3. **Digital Category**
   - `pixel_brush`: 1:1 pixel art brush
   - `digital_ink`: Crisp digital ink pen
   - `marker_bold`: Thick marker brush

4. **Natural Category**
   - `bristle_oil`: Oil painting bristles
   - `acrylic_dry`: Dry acrylic brush
   - `watercolor_detail`: Fine watercolor detail

5. **Specialty Category**
   - `texture_stamp`: Texture stamping brush
   - `splatter`: Paint splatter effect
   - `calligraphy`: Calligraphy brush

### Managing Presets

```typescript
// Get all presets
const presets = brushPresetManager.getAllPresets();

// Get preset by ID
const brush = brushPresetManager.getPreset('watercolor_flat');

// Create custom preset
const customPreset = {
  id: 'my_brush',
  name: 'My Custom Brush',
  category: 'custom',
  description: 'A brush I created',
  settings: myBrushSettings,
  tags: ['custom', 'experimental'],
  createdAt: Date.now(),
  modifiedAt: Date.now()
};
brushPresetManager.addPreset(customPreset);

// Export/Import presets
const jsonString = brushPresetManager.exportPreset('my_brush');
const imported = brushPresetManager.importPreset(jsonString);
```

## 🎨 3D Integration

### UV-Based Painting

```tsx
// In your 3D scene component
<Brush3DIntegration
  modelMesh={shirtMesh}
  modelId="shirt-model"
  activeBrush={currentBrush}
  onBrushStroke={(points, settings) => {
    // Handle brush stroke completion
    console.log('Stroke completed:', points.length, 'points');
  }}
/>
```

### Coordinate Systems

- **World Space**: 3D coordinates in the scene
- **UV Space**: 2D texture coordinates (0-1 range)
- **Screen Space**: 2D canvas/screen coordinates
- **Brush Space**: Local brush coordinate system

## ⚡ Performance Optimization

### Automatic Quality Adjustment

```typescript
import { brushPerformanceMonitor } from './utils/BrushPerformanceOptimizer';

// Monitor performance
const metrics = brushPerformanceMonitor.updateMetrics(canvas);

// Get adaptive quality settings
const quality = brushPerformanceMonitor.getAdaptiveQuality(metrics.fps);
console.log('Recommended quality:', quality);
```

### Memory Management

```typescript
// Check memory usage
const { shouldClearCache, recommendedCanvasSize } = brushPerformanceMonitor.optimizeMemoryUsage(
  brushEngine,
  100 // Max MB
);

if (shouldClearCache) {
  brushEngine.clearCache();
}
```

### Performance Metrics

- **FPS**: Frames per second
- **Frame Time**: Time per frame (ms)
- **Memory Usage**: JavaScript heap size (MB)
- **Brush Strokes/Second**: Rendering throughput
- **Canvas Size**: Current canvas dimensions

## 🔧 Advanced Customization

### Custom Brush Shapes

```typescript
// Create custom shape function
function createCustomShape(ctx: CanvasRenderingContext2D, size: number) {
  // Draw your custom shape here
  ctx.beginPath();
  ctx.moveTo(0, size/2);
  ctx.lineTo(size/4, 0);
  ctx.lineTo(size, size/4);
  ctx.lineTo(size*3/4, size);
  ctx.closePath();
  ctx.fill();
}

// Register custom shape
brushEngine.registerCustomShape('myShape', createCustomShape);
```

### Custom Textures

```typescript
// Create procedural texture
function generateCustomTexture(width: number, height: number): ImageData {
  const data = new ImageData(width, height);
  // Generate your texture pattern
  for (let i = 0; i < data.data.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);
    // Custom pattern logic
    data.data[i] = Math.sin(x * 0.1) * 127 + 128;     // R
    data.data[i + 1] = Math.cos(y * 0.1) * 127 + 128; // G
    data.data[i + 2] = Math.sin(x * y * 0.01) * 127 + 128; // B
    data.data[i + 3] = 255; // A
  }
  return data;
}
```

### Wet Media Simulation

```typescript
// Enable wet media for realistic painting
const wetBrushSettings: BrushSettings = {
  // ... other settings
  wetMedia: {
    enabled: true,
    flow: 0.8,        // How much media flows
    drying: 0.05,     // Drying speed
    blending: 0.6,    // Color mixing amount
    absorption: 0.4   // Surface absorption
  }
};
```

## 📊 API Reference

### BrushEngine

```typescript
class BrushEngine {
  constructor(canvas: HTMLCanvasElement);

  // Stroke management
  startStroke(settings: BrushSettings): string;
  addPoint(point: BrushPoint): void;
  endStroke(): BrushStroke | null;

  // Direct rendering
  renderBrushStroke(points: BrushPoint[], settings: BrushSettings): void;

  // Cache management
  clearCache(): void;
  dispose(): void;
}
```

### StrokeSmoothing

```typescript
class StrokeSmoothing {
  smoothStroke(points: BrushPoint[], options: SmoothingOptions): BrushPoint[];
  stabilizePoint(currentPoint: BrushPoint, recentPoints: BrushPoint[], options: StabilizationOptions): BrushPoint;
}
```

### BrushPresetManager

```typescript
class BrushPresetManager {
  addPreset(preset: BrushPreset): void;
  getPreset(id: string): BrushPreset | null;
  updatePreset(id: string, updates: Partial<BrushPreset>): BrushPreset | null;
  deletePreset(id: string): boolean;
  exportPreset(id: string): string | null;
  importPreset(jsonString: string): BrushPreset | null;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Low Performance**
   - Reduce brush size and complexity
   - Enable stabilization
   - Clear brush cache periodically

2. **Memory Issues**
   - Reduce canvas resolution
   - Limit undo history
   - Clear caches when switching tools

3. **Inconsistent Strokes**
   - Adjust stabilization settings
   - Check pressure sensitivity
   - Verify canvas context

### Debug Mode

```typescript
// Enable debug logging
console.log('Brush settings:', brushSettings);
console.log('Performance metrics:', brushPerformanceMonitor.updateMetrics(canvas));
```

## 🤝 Contributing

### Adding New Brush Types

1. Create brush settings in `BrushPresets.ts`
2. Test rendering performance
3. Add UI controls if needed
4. Update documentation

### Performance Improvements

1. Profile current bottlenecks
2. Implement WebGL acceleration
3. Add stroke batching
4. Optimize texture generation

## 📄 License

This brush system is part of the ClOSSET project and follows the same licensing terms.

---

**Note**: This implementation provides Procreate-level brush capabilities with advanced dynamics, textures, and 3D integration. The system is designed to be extensible and performant for professional digital design workflows.
