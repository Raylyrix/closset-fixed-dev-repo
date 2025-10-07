/**
 * Unified Coordinate System API for Closset
 * Handles accurate conversion between UV coordinates and Canvas coordinates
 * Automatically detects and handles coordinate system differences
 */

interface UVCoordinates {
    x: number;
    y: number;
}

interface CanvasCoordinates {
    x: number;
    y: number;
}

interface CanvasSize {
    width: number;
    height: number;
}

interface TestData {
    uv: UVCoordinates;
    expectedCanvas: CanvasCoordinates;
    canvasSize: CanvasSize;
}

interface TestResults {
    threejsError: number;
    canvasError: number;
    correctSystem: 'threejs' | 'canvas';
    threejsResult: CanvasCoordinates;
    canvasResult: CanvasCoordinates;
}

class CoordinateSystem {
    private isInitialized: boolean = false;
    private coordinateSystem: 'threejs' | 'canvas' | null = null;
    private testResults: TestResults | null = null;
    private debugMode: boolean = false;

    /**
     * Initialize the coordinate system by testing both conversion methods
     * @param testData - Test data with known UV and expected canvas coordinates
     */
    async initialize(testData: TestData | null = null): Promise<void> {
        if (this.isInitialized) return;

        console.log('🎯 Initializing Coordinate System...');
        
        if (testData) {
            this.testResults = await this.testCoordinateConversion(testData);
            this.coordinateSystem = this.testResults.correctSystem;
        } else {
            // Default to Three.js coordinate system (Y=0 at bottom)
            this.coordinateSystem = 'threejs';
        }

        this.isInitialized = true;
        console.log(`🎯 Coordinate System initialized: ${this.coordinateSystem}`);
    }

    /**
     * Test both coordinate conversion methods to determine the correct one
     * @param testData - Test data with UV coordinates and expected canvas coordinates
     * @returns Test results
     */
    async testCoordinateConversion(testData: TestData): Promise<TestResults> {
        const { uv, expectedCanvas, canvasSize } = testData;
        
        // Test Three.js coordinate system (Y=0 at bottom)
        const threejsResult = this.convertUVToCanvas(uv, canvasSize, 'threejs');
        const threejsError = Math.abs(threejsResult.y - expectedCanvas.y);
        
        // Test Canvas coordinate system (Y=0 at top)
        const canvasResult = this.convertUVToCanvas(uv, canvasSize, 'canvas');
        const canvasError = Math.abs(canvasResult.y - expectedCanvas.y);
        
        const correctSystem = threejsError < canvasError ? 'threejs' : 'canvas';
        
        return {
            threejsError,
            canvasError,
            correctSystem,
            threejsResult,
            canvasResult
        };
    }

    /**
     * Convert UV coordinates to Canvas coordinates
     * @param uv - UV coordinates {x, y}
     * @param canvasSize - Canvas dimensions {width, height}
     * @param system - Coordinate system to use ('threejs' or 'canvas')
     * @returns Canvas coordinates {x, y}
     */
    convertUVToCanvas(uv: UVCoordinates, canvasSize: CanvasSize, system: 'threejs' | 'canvas' | null = null): CanvasCoordinates {
        if (!this.isInitialized && !system) {
            console.warn('🎯 Coordinate System not initialized, using default Three.js system');
            system = 'threejs';
        }

        const coordSystem = system || this.coordinateSystem;
        
        if (!uv || !canvasSize) {
            console.error('🎯 Invalid UV coordinates or canvas size');
            return { x: 0, y: 0 };
        }

        const x = Math.floor(uv.x * canvasSize.width);
        let y: number;

        if (coordSystem === 'threejs') {
            // Three.js UV coordinates: Y=0 at bottom, Y=1 at top
            // Canvas coordinates: Y=0 at top, Y=height at bottom
            y = Math.floor((1 - uv.y) * canvasSize.height);
        } else {
            // Canvas UV coordinates: Y=0 at top, Y=1 at bottom
            y = Math.floor(uv.y * canvasSize.height);
        }

        if (this.debugMode) {
            console.log(`🎯 Coordinate conversion:`, {
                uv: { x: uv.x, y: uv.y },
                canvas: { x, y },
                system: coordSystem,
                canvasSize
            });
        }

        return { x, y };
    }

    /**
     * Convert Canvas coordinates to UV coordinates
     * @param canvas - Canvas coordinates {x, y}
     * @param canvasSize - Canvas dimensions {width, height}
     * @param system - Coordinate system to use ('threejs' or 'canvas')
     * @returns UV coordinates {x, y}
     */
    convertCanvasToUV(canvas: CanvasCoordinates, canvasSize: CanvasSize, system: 'threejs' | 'canvas' | null = null): UVCoordinates {
        if (!this.isInitialized && !system) {
            console.warn('🎯 Coordinate System not initialized, using default Three.js system');
            system = 'threejs';
        }

        const coordSystem = system || this.coordinateSystem;
        
        if (!canvas || !canvasSize) {
            console.error('🎯 Invalid canvas coordinates or canvas size');
            return { x: 0, y: 0 };
        }

        const x = canvas.x / canvasSize.width;
        let y: number;

        if (coordSystem === 'threejs') {
            // Convert from Canvas (Y=0 at top) to Three.js UV (Y=0 at bottom)
            y = 1 - (canvas.y / canvasSize.height);
        } else {
            // Convert from Canvas (Y=0 at top) to Canvas UV (Y=0 at top)
            y = canvas.y / canvasSize.height;
        }

        return { x, y };
    }

    /**
     * Get the current coordinate system
     * @returns Current coordinate system
     */
    getCoordinateSystem(): 'threejs' | 'canvas' | null {
        return this.coordinateSystem;
    }

    /**
     * Set debug mode
     * @param enabled - Enable debug logging
     */
    setDebugMode(enabled: boolean): void {
        this.debugMode = enabled;
    }

    /**
     * Get test results
     * @returns Test results
     */
    getTestResults(): TestResults | null {
        return this.testResults;
    }

    /**
     * Force a specific coordinate system
     * @param system - Coordinate system ('threejs' or 'canvas')
     */
    setCoordinateSystem(system: 'threejs' | 'canvas'): void {
        if (system !== 'threejs' && system !== 'canvas') {
            console.error('🎯 Invalid coordinate system. Must be "threejs" or "canvas"');
            return;
        }
        
        this.coordinateSystem = system;
        console.log(`🎯 Coordinate system forced to: ${system}`);
    }

    /**
     * Reset the coordinate system
     */
    reset(): void {
        this.isInitialized = false;
        this.coordinateSystem = null;
        this.testResults = null;
        console.log('🎯 Coordinate system reset');
    }
}

// Create singleton instance
const coordinateSystem = new CoordinateSystem();

export default coordinateSystem;















