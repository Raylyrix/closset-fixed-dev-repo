import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

// Import new refactored components
import ShirtRefactored from './ShirtRefactored';
import { RightPanel } from './RightPanelNew';
import { Brush3DIntegration } from './Brush3DIntegrationNew';

// Import domain stores
import { useToolStore } from '../stores/domainStores';

interface ClosseTRefactoredDemoProps {
  className?: string;
}

/**
 * ClosseTRefactoredDemo - Demonstrates the new modular architecture
 * This replaces the monolithic structure with focused, testable components
 */
export function ClosseTRefactoredDemo({ className = '' }: ClosseTRefactoredDemoProps) {
  const [activeToolSidebar, setActiveToolSidebar] = useState<string | null>(null);
  const activeTool = useToolStore(state => state.activeTool);

  return (
    <div className={`w-full h-screen flex ${className}`}>
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Canvas
          camera={{
            position: [0, 0, 5],
            fov: 50,
            near: 0.1,
            far: 1000
          }}
          style={{ background: '#1a1a1a' }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
          }}
        >
          {/* Lighting */}
          <Environment preset="studio" />

          {/* 3D Model with new architecture */}
          <ShirtRefactored
            showDebugInfo={process.env.NODE_ENV === 'development'}
            enableBrushPainting={true}
          />

          {/* 3D Brush Integration */}
          <Brush3DIntegration enabled={activeTool === 'brush'} />

        </Canvas>

        {/* Toolbar */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg">
          <div className="flex gap-2 mb-3">
            <button
              className={`px-3 py-1 rounded ${activeTool === 'select' ? 'bg-blue-600' : 'bg-gray-600'}`}
              onClick={() => useToolStore.getState().setActiveTool('select')}
            >
              👆 Select
            </button>
            <button
              className={`px-3 py-1 rounded ${activeTool === 'brush' ? 'bg-green-600' : 'bg-gray-600'}`}
              onClick={() => useToolStore.getState().setActiveTool('brush')}
            >
              🎨 Brush
            </button>
            <button
              className={`px-3 py-1 rounded ${activeTool === 'text' ? 'bg-purple-600' : 'bg-gray-600'}`}
              onClick={() => useToolStore.getState().setActiveTool('text')}
            >
              📝 Text
            </button>
          </div>

          <div className="text-sm">
            <div><strong>Active Tool:</strong> {activeTool}</div>
            <div><strong>Architecture:</strong> Refactored</div>
            <div><strong>Status:</strong> ✅ Working</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 bg-blue-600 text-white p-4 rounded-lg max-w-md">
          <h3 className="font-bold mb-2">🎉 New Architecture Demo</h3>
          <div className="text-sm space-y-1">
            <div>• <strong>Modular Components:</strong> Single responsibility</div>
            <div>• <strong>Domain Stores:</strong> Focused state management</div>
            <div>• <strong>Type Safety:</strong> Comprehensive TypeScript</div>
            <div>• <strong>Brush Painting:</strong> Real-time 3D painting</div>
            <div>• <strong>Performance:</strong> Optimized rendering</div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 border-l border-gray-300 bg-gray-50 overflow-y-auto">
        <RightPanel activeToolSidebar={activeToolSidebar} />
      </div>
    </div>
  );
}

export default ClosseTRefactoredDemo;
