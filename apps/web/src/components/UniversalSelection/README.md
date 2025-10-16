# 🎯 Universal Selection System

A comprehensive selection system that provides unified selection functionality across all element types in the 3D design application.

## 🌟 Features

### Core Selection
- **Multi-element selection** - Select text, images, shapes, and other elements
- **Selection modes** - Replace, add, subtract, intersect, toggle
- **Visual feedback** - Selection handles, outlines, and indicators
- **Hit testing** - Precise element detection and selection

### Transform Operations
- **Move** - Drag selected elements around the canvas
- **Scale** - Resize elements with corner and edge handles
- **Rotate** - Rotate elements with rotation handle
- **Skew** - Distort elements (future enhancement)

### Selection Tools
- **Marquee selection** - Drag to select multiple elements
- **Individual selection** - Click to select single elements
- **Multi-select** - Ctrl/Cmd + click to toggle selection
- **Add to selection** - Shift + click to add elements

### Context Menu
- **Edit actions** - Copy, paste, duplicate
- **Transform actions** - Rotate, flip, scale
- **Arrange actions** - Bring to front, send to back
- **Group actions** - Group, ungroup elements
- **Delete actions** - Remove selected elements

### Keyboard Shortcuts
- `Ctrl/Cmd + A` - Select all elements
- `Ctrl/Cmd + Click` - Toggle element selection
- `Shift + Click` - Add element to selection
- `Delete/Backspace` - Delete selected elements
- `Escape` - Clear selection
- `Arrow keys` - Nudge selected elements
- `Ctrl/Cmd + G` - Group selected elements
- `Ctrl/Cmd + Shift + G` - Ungroup selected elements

## 🏗️ Architecture

### Core Components

#### 1. UniversalSelectionStore
- Zustand store managing selection state
- Element registration and management
- Transform operations
- Group management

#### 2. SelectionHandles
- Visual handles for transform operations
- Corner, edge, and rotation handles
- Cursor management
- Transform feedback

#### 3. ContextMenu
- Right-click context menu
- Categorized actions
- Keyboard shortcut display
- Dynamic action availability

#### 4. SelectionBox
- Marquee selection visualization
- Drag-to-select functionality
- Visual feedback during selection

#### 5. SelectionIntegration
- Integration with existing tools
- Element synchronization
- Transform application

### Element Types Supported

#### Text Elements
- Text content and formatting
- Font properties
- Position and rotation
- Stroke and fill

#### Image Elements
- Imported images
- Position, size, rotation
- Opacity and blend modes
- Transform operations

#### Shape Elements
- Vector shapes (lines, rectangles, ellipses)
- Stroke and fill properties
- Point-based geometry
- Transform operations

#### Future Element Types
- Brush strokes
- Embroidery elements
- Puff print elements
- 3D objects

## 🚀 Integration Guide

### 1. Add to Toolbar

```tsx
import UniversalSelectTool from '../components/UniversalSelectTool';

// In your toolbar component
{ id: 'universalSelect', label: 'Universal Select' }
```

### 2. Use in Main Component

```tsx
import { SelectionIntegration } from './components/UniversalSelection/SelectionIntegration';

function App() {
  return (
    <SelectionIntegration>
      {/* Your existing components */}
      <YourCanvas />
      <YourToolbar />
    </SelectionIntegration>
  );
}
```

### 3. Access Selection State

```tsx
import { useUniversalSelection } from './stores/UniversalSelectionStore';

function MyComponent() {
  const { selectedElements, selectedIds } = useUniversalSelection();
  
  // Use selection state
  return (
    <div>
      {selectedIds.size} elements selected
    </div>
  );
}
```

### 4. Handle Selection Events

```tsx
function MyCanvas() {
  const handleSelectionChange = (elements: UniversalElement[]) => {
    console.log('Selection changed:', elements);
    // Update UI, sync with other tools, etc.
  };

  return (
    <UniversalSelection
      canvasRef={canvasRef}
      onSelectionChange={handleSelectionChange}
    />
  );
}
```

## 🎨 Customization

### Selection Visual Style

Modify the selection handles and outlines in `SelectionHandles.tsx`:

```tsx
// Selection outline color
border: '2px solid #007acc'

// Handle colors
backgroundColor: '#007acc'
border: '2px solid #ffffff'

// Selection box style
border: '2px dashed #007acc'
backgroundColor: 'rgba(0, 122, 204, 0.1)'
```

### Context Menu Actions

Add custom actions in `UniversalSelectionStore.ts`:

```tsx
{
  id: 'custom_action',
  label: 'Custom Action',
  icon: '⭐',
  category: 'custom',
  enabled: elements.length > 0,
  action: () => {
    // Your custom logic
  }
}
```

### Keyboard Shortcuts

Extend keyboard handling in `UniversalSelection.tsx`:

```tsx
if (e.key === 'YourKey') {
  e.preventDefault();
  // Your custom shortcut logic
}
```

## 🔧 Advanced Usage

### Custom Element Types

1. Define your element type in `UniversalSelection.ts`:

```tsx
export type SelectableElementType = 
  | 'text'
  | 'image' 
  | 'shape'
  | 'your_custom_type'; // Add here
```

2. Add element data interface:

```tsx
export interface YourCustomElementData {
  // Your custom properties
  customProperty: string;
}
```

3. Register elements in `SelectionIntegration.tsx`:

```tsx
const universalCustomElements = useMemo(() => {
  return yourCustomElements.map((element): UniversalElement => ({
    id: element.id,
    type: 'your_custom_type',
    bounds: {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height
    },
    data: {
      customProperty: element.customProperty
    }
  }));
}, [yourCustomElements]);
```

### Transform Operations

Implement custom transforms:

```tsx
const customTransform = (elements: UniversalElement[], transform: SelectionTransform) => {
  for (const element of elements) {
    // Apply your custom transform logic
    updateElement(element.id, {
      bounds: {
        ...element.bounds,
        // Your transform calculations
      }
    });
  }
};
```

## 🐛 Troubleshooting

### Common Issues

#### Selection not working
- Ensure `SelectionIntegration` wraps your components
- Check that canvas ref is properly set
- Verify element registration in the store

#### Handles not visible
- Check z-index values
- Ensure canvas positioning is correct
- Verify handle calculations

#### Context menu not appearing
- Check right-click event handling
- Verify menu positioning calculations
- Ensure no conflicting event handlers

#### Keyboard shortcuts not working
- Check event listener registration
- Verify focus management
- Ensure no conflicting shortcuts

### Debug Mode

Enable debug logging:

```tsx
// In UniversalSelectionStore.ts
const DEBUG = true;

if (DEBUG) {
  console.log('Selection operation:', operation, data);
}
```

## 📚 API Reference

### UniversalSelectionStore

#### Selection Operations
- `selectElement(id, mode)` - Select a single element
- `selectElements(ids, mode)` - Select multiple elements
- `deselectElement(id)` - Deselect an element
- `deselectAll()` - Clear all selections
- `toggleElement(id)` - Toggle element selection

#### Element Management
- `addElement(element)` - Add element to store
- `updateElement(id, updates)` - Update element properties
- `removeElement(id)` - Remove element from store
- `getElement(id)` - Get element by ID
- `getAllElements()` - Get all elements

#### Transform Operations
- `startTransform(type, x, y)` - Begin transform operation
- `updateTransform(x, y)` - Update transform
- `endTransform()` - Complete transform
- `applyTransform(transform)` - Apply transform to elements

#### Utility Functions
- `getSelectedElements()` - Get currently selected elements
- `getSelectionBounds()` - Get bounding box of selection
- `hitTest(x, y)` - Test for element at coordinates
- `hitTestMultiple(x, y)` - Get all elements at coordinates

### UniversalSelection Component

#### Props
- `canvasRef` - Reference to canvas element
- `onElementSelect` - Callback when element is selected
- `onElementDeselect` - Callback when element is deselected
- `onSelectionChange` - Callback when selection changes

#### Events
- Mouse events for selection and transformation
- Keyboard events for shortcuts
- Context menu events

## 🎯 Best Practices

1. **Always wrap with SelectionIntegration** - Ensures proper element synchronization
2. **Use the store hooks** - Access selection state through the provided hooks
3. **Handle selection changes** - React to selection changes in your components
4. **Provide visual feedback** - Show selection state in your UI
5. **Test with multiple elements** - Ensure multi-selection works correctly
6. **Handle edge cases** - Empty selections, locked elements, etc.

## 🚀 Future Enhancements

- [ ] Layer-based selection
- [ ] Selection history/undo
- [ ] Advanced transform operations
- [ ] Selection presets
- [ ] Batch operations
- [ ] Selection animations
- [ ] Touch/mobile support
- [ ] Accessibility improvements
