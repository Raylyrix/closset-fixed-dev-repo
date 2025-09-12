# 🧵 Stitch Protocol - Adding New Stitch Types

## 📋 **Protocol for Adding New Stitch Types**

This document outlines the protocol for adding new stitch types that will automatically connect with vector tools.

## 🎯 **Step 1: Create Your Stitch Renderer**

Create a new class that implements the `RendererInterface`:

```typescript
class YourStitchRenderer implements RendererInterface {
  id = 'your-stitch-id';           // Unique identifier
  name = 'Your Stitch Name';       // Human-readable name
  category = 'stitch' as const;    // Category (stitch, print, brush, texture, image)
  
  canHandle(tool: string, config?: any): boolean {
    // Return true if this renderer can handle the given tool/type
    return tool === 'your-stitch-id' || config?.type === 'your-stitch-id';
  }
  
  render(
    ctx: CanvasRenderingContext2D, 
    points: StitchPoint[], 
    config: RenderConfig,
    options: RenderOptions = {}
  ): void {
    // Your stitch rendering logic here
    // Use ctx to draw on the canvas
    // Use points array for stitch positions
    // Use config for color, thickness, etc.
  }
  
  getDefaultConfig(): Partial<RenderConfig> {
    return {
      type: 'your-stitch-id',
      color: '#ff69b4',
      thickness: 3,
      opacity: 1.0
      // Add any custom properties
    };
  }
  
  validateConfig(config: RenderConfig): boolean {
    // Validate that the config has required properties
    return !!(config.type && config.color && typeof config.thickness === 'number');
  }
}
```

## 🎯 **Step 2: Register Your Renderer**

Add your renderer to the `UniversalVectorRenderer`:

```typescript
// In UniversalVectorRenderer.ts, add to initializeDefaultRenderers():
this.registerRenderer(new YourStitchRenderer());
```

## 🎯 **Step 3: Update Tool Detection**

Add your stitch type to the tool detection functions:

```typescript
// In Shirt.tsx, update isEmbroideryTool function:
function isEmbroideryTool(tool: string): boolean {
  return [
    'embroidery', 
    'cross-stitch', 
    'satin', 
    'chain', 
    'fill',
    'your-stitch-id',  // Add your stitch here
    // ... other stitches
  ].includes(tool);
}
```

## 🎯 **Step 4: Add to UI (Optional)**

If you want your stitch to appear in the UI:

```typescript
// In your embroidery tool component, add to stitch options:
const stitchTypes = [
  { id: 'cross-stitch', name: 'Cross Stitch' },
  { id: 'satin', name: 'Satin Stitch' },
  { id: 'chain', name: 'Chain Stitch' },
  { id: 'fill', name: 'Fill Stitch' },
  { id: 'your-stitch-id', name: 'Your Stitch Name' }, // Add here
  // ... other stitches
];
```

## 🎯 **Step 5: Test Your Stitch**

Your stitch will automatically work with vector tools! Test by:

1. Select your stitch type in the embroidery tools
2. Turn on vector tools
3. Use the pen tool to draw
4. Your stitch should render between anchor points

## 🎨 **Advanced Stitch Patterns**

### **Complex Stitch Patterns**

For complex stitches, you can use these helper functions:

```typescript
// Calculate path length
private calculatePathLength(points: StitchPoint[]): number {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += this.calculateDistance(points[i], points[i + 1]);
  }
  return total;
}

// Calculate distance between two points
private calculateDistance(p1: StitchPoint, p2: StitchPoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Adjust color brightness
private adjustBrightness(color: string, amount: number): string {
  const cleanColor = color.startsWith('#') ? color : `#${color}`;
  const hex = cleanColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const newR = Math.max(0, Math.min(255, r + amount));
  const newG = Math.max(0, Math.min(255, g + amount));
  const newB = Math.max(0, Math.min(255, b + amount));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}
```

### **Performance Optimization**

For real-time rendering, optimize your stitch:

```typescript
render(ctx: CanvasRenderingContext2D, points: StitchPoint[], config: RenderConfig, options: RenderOptions = {}): void {
  // Use options.quality to adjust detail level
  const quality = options.quality || 'medium';
  const maxPoints = quality === 'low' ? 50 : quality === 'high' ? 200 : 100;
  
  // Limit points for performance
  const optimizedPoints = points.length > maxPoints 
    ? points.filter((_, index) => index % Math.ceil(points.length / maxPoints) === 0)
    : points;
  
  // Your rendering logic with optimizedPoints
}
```

## 🎯 **Example: Adding a Zigzag Stitch**

Here's a complete example of adding a zigzag stitch:

```typescript
class ZigzagStitchRenderer implements RendererInterface {
  id = 'zigzag-stitch';
  name = 'Zigzag Stitch';
  category = 'stitch' as const;
  
  canHandle(tool: string, config?: any): boolean {
    return tool === 'zigzag-stitch' || config?.type === 'zigzag-stitch';
  }
  
  render(ctx: CanvasRenderingContext2D, points: StitchPoint[], config: RenderConfig): void {
    if (points.length < 2) return;
    
    ctx.save();
    ctx.strokeStyle = config.color;
    ctx.lineWidth = config.thickness;
    ctx.lineCap = 'round';
    ctx.globalAlpha = config.opacity || 1.0;
    
    // Draw zigzag pattern
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Calculate zigzag points
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      const offset = config.thickness * 0.5;
      
      ctx.beginPath();
      ctx.moveTo(current.x, current.y);
      ctx.lineTo(midX, midY + offset);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  getDefaultConfig(): Partial<RenderConfig> {
    return {
      type: 'zigzag-stitch',
      color: '#ff69b4',
      thickness: 3,
      opacity: 1.0
    };
  }
  
  validateConfig(config: RenderConfig): boolean {
    return !!(config.type && config.color && typeof config.thickness === 'number');
  }
}
```

## 🎯 **Protocol for Other Types**

### **Print Types**
```typescript
category = 'print' as const;
// Use for screen printing, heat transfer, etc.
```

### **Brush Types**
```typescript
category = 'brush' as const;
// Use for paint brushes, markers, etc.
```

### **Texture Types**
```typescript
category = 'texture' as const;
// Use for fabric textures, patterns, etc.
```

### **Image Types**
```typescript
category = 'image' as const;
// Use for photo printing, image transfer, etc.
```

## 🎉 **Benefits of This Protocol**

1. **Automatic Integration**: Your stitch automatically works with vector tools
2. **Consistent API**: Same interface for all renderers
3. **Easy Testing**: Built-in validation and error handling
4. **Performance**: Optimized for real-time rendering
5. **Extensible**: Easy to add new categories and types
6. **Maintainable**: Clean separation of concerns

## 🚀 **Ready to Add Your Stitch!**

Follow this protocol and your new stitch type will automatically connect with vector tools. The system will handle all the integration for you! 🎯✨

