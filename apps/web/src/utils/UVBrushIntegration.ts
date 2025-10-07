import { BrushEngine } from './BrushEngine';
import { AdvancedUVSystem } from './AdvancedUVSystem';
import { AdvancedPuff3DSystem } from './AdvancedPuff3DSystem';
import * as THREE from 'three';

export interface UVBrushSettings {
  brushSettings: any; // From BrushEngine
  uvSystem: AdvancedUVSystem;
  puffSystem: AdvancedPuff3DSystem;
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
}

export class UVBrushIntegration {
  private brushEngine: BrushEngine;
  private uvSystem: AdvancedUVSystem;
  private puffSystem: AdvancedPuff3DSystem;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;

  constructor(settings: UVBrushSettings) {
    this.brushEngine = new BrushEngine(document.createElement('canvas'));
    this.uvSystem = settings.uvSystem;
    this.puffSystem = settings.puffSystem;
    this.scene = settings.scene;
    this.camera = settings.camera;
    this.renderer = settings.renderer;
  }

  /**
   * Convert screen coordinates to UV coordinates on intersected mesh
   */
  public screenToUV(x: number, y: number): { uv: THREE.Vector2; mesh: THREE.Mesh } | null {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(
      (x / window.innerWidth) * 2 - 1,
      -(y / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouse, this.camera);
    const intersects = raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const mesh = intersect.object as THREE.Mesh;
      const uv = intersect.uv;

      if (uv && mesh) {
        return { uv, mesh };
      }
    }

    return null;
  }

  /**
   * Apply brush stroke to UV coordinates
   */
  public applyUVBrush(points: any[], settings: any): void {
    // Convert 2D points to UV space
    const uvPoints = points.map(point => {
      const uvResult = this.screenToUV(point.x, point.y);
      return uvResult ? { ...point, uv: uvResult.uv, mesh: uvResult.mesh } : null;
    }).filter(Boolean);

    if (uvPoints.length === 0) return;

    // Group points by mesh
    const meshGroups = new Map<THREE.Mesh, any[]>();
    uvPoints.forEach(point => {
      if (!meshGroups.has(point.mesh)) {
        meshGroups.set(point.mesh, []);
      }
      meshGroups.get(point.mesh)!.push(point);
    });

    // Apply brush effects to each mesh
    meshGroups.forEach((points, mesh) => {
      this.applyBrushToMesh(mesh, points, settings);
    });
  }

  private applyBrushToMesh(mesh: THREE.Mesh, points: any[], settings: any): void {
    // Use puff system to displace geometry based on brush points
    const meshResolution = this.puffSystem.resolveMesh(mesh);

    points.forEach(point => {
      // Convert UV to vertex indices and apply displacement
      this.applyDisplacement(mesh, point.uv, point, settings);
    });

    // Update geometry
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  }

  private applyDisplacement(mesh: THREE.Mesh, uv: THREE.Vector2, point: any, settings: any): void {
    const geometry = mesh.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const uvAttribute = geometry.getAttribute('uv');

    if (!positionAttribute || !uvAttribute) return;

    // Find closest vertices to UV point
    const vertexCount = positionAttribute.count;
    const positions = positionAttribute.array as Float32Array;
    const uvs = uvAttribute.array as Float32Array;

    let closestIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < vertexCount; i++) {
      const vertexUV = new THREE.Vector2(uvs[i * 2], uvs[i * 2 + 1]);
      const distance = vertexUV.distanceTo(uv);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    if (closestIndex !== -1) {
      // Apply displacement based on brush pressure
      const displacement = point.pressure * settings.intensity;
      positions[closestIndex * 3 + 2] += displacement; // Z displacement
    }
  }

  public dispose(): void {
    this.brushEngine.dispose();
  }
}
