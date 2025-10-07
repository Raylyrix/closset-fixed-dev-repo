/**
 * GeometryManager - Prevents Three.js geometry memory leaks by reusing geometry instances
 * Optimized for both low-end and high-end devices
 */

import * as THREE from 'three';

interface GeometryConfig {
  type: 'box' | 'sphere' | 'plane' | 'cylinder';
  width?: number;
  height?: number;
  depth?: number;
  radius?: number;
  segments?: number;
}

class GeometryManager {
  private geometries: Map<string, THREE.BufferGeometry> = new Map();
  private materialCache: Map<string, THREE.Material> = new Map();
  private meshCache: Map<string, THREE.Mesh> = new Map();
  private maxCacheSize: number = 50; // Maximum geometries to cache

  constructor() {
    console.log('🔷 GeometryManager initialized');
  }

  private getGeometryKey(config: GeometryConfig): string {
    return `${config.type}_${config.width || 0}_${config.height || 0}_${config.depth || 0}_${config.radius || 0}_${config.segments || 0}`;
  }

  getGeometry(config: GeometryConfig): THREE.BufferGeometry {
    const key = this.getGeometryKey(config);
    
    // Return cached geometry if exists
    if (this.geometries.has(key)) {
      console.log('🔷 GeometryManager: Reusing cached geometry', key);
      return this.geometries.get(key)!;
    }

    // Create new geometry
    let geometry: THREE.BufferGeometry;
    
    switch (config.type) {
      case 'box':
        geometry = new THREE.BoxGeometry(
          config.width || 1,
          config.height || 1,
          config.depth || 1
        );
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(
          config.radius || 0.5,
          config.segments || 32,
          config.segments || 32
        );
        break;
      case 'plane':
        geometry = new THREE.PlaneGeometry(
          config.width || 1,
          config.height || 1
        );
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          config.radius || 0.5,
          config.radius || 0.5,
          config.height || 1,
          config.segments || 32
        );
        break;
      default:
        throw new Error(`Unsupported geometry type: ${config.type}`);
    }

    // Cache the geometry
    this.geometries.set(key, geometry);
    console.log('🔷 GeometryManager: Created and cached geometry', key);

    // Cleanup if cache is too large
    if (this.geometries.size > this.maxCacheSize) {
      this.cleanupOldGeometries();
    }

    return geometry;
  }

  // Get a material with caching
  getMaterial(type: 'standard' | 'basic' | 'lambert' | 'phong', color: number = 0xffffff): THREE.Material {
    const key = `${type}_${color}`;
    
    if (this.materialCache.has(key)) {
      console.log('🔷 GeometryManager: Reusing cached material', key);
      return this.materialCache.get(key)!;
    }

    let material: THREE.Material;
    
    switch (type) {
      case 'standard':
        material = new THREE.MeshStandardMaterial({ color });
        break;
      case 'basic':
        material = new THREE.MeshBasicMaterial({ color });
        break;
      case 'lambert':
        material = new THREE.MeshLambertMaterial({ color });
        break;
      case 'phong':
        material = new THREE.MeshPhongMaterial({ color });
        break;
      default:
        throw new Error(`Unsupported material type: ${type}`);
    }

    this.materialCache.set(key, material);
    console.log('🔷 GeometryManager: Created and cached material', key);

    return material;
  }

  // Get a complete mesh with caching
  getMesh(geometryConfig: GeometryConfig, materialType: 'standard' | 'basic' | 'lambert' | 'phong' = 'standard', color: number = 0xffffff): THREE.Mesh {
    const geometryKey = this.getGeometryKey(geometryConfig);
    const materialKey = `${materialType}_${color}`;
    const meshKey = `${geometryKey}_${materialKey}`;
    
    if (this.meshCache.has(meshKey)) {
      console.log('🔷 GeometryManager: Reusing cached mesh', meshKey);
      return this.meshCache.get(meshKey)!.clone();
    }

    const geometry = this.getGeometry(geometryConfig);
    const material = this.getMaterial(materialType, color);
    const mesh = new THREE.Mesh(geometry, material);
    
    this.meshCache.set(meshKey, mesh);
    console.log('🔷 GeometryManager: Created and cached mesh', meshKey);

    return mesh.clone();
  }

  private cleanupOldGeometries(): void {
    const geometriesToRemove: string[] = [];
    let removedCount = 0;
    const targetRemoval = Math.floor(this.geometries.size * 0.3); // Remove 30%

    // Remove oldest geometries (simple FIFO for now)
    for (const [key, geometry] of this.geometries) {
      if (removedCount >= targetRemoval) break;
      
      geometry.dispose();
      geometriesToRemove.push(key);
      removedCount++;
    }

    geometriesToRemove.forEach(key => this.geometries.delete(key));
    console.log('🔷 GeometryManager: Cleaned up', removedCount, 'geometries');
  }

  // Dispose a specific geometry
  disposeGeometry(config: GeometryConfig): void {
    const key = this.getGeometryKey(config);
    const geometry = this.geometries.get(key);
    
    if (geometry) {
      geometry.dispose();
      this.geometries.delete(key);
      console.log('🔷 GeometryManager: Disposed geometry', key);
    }
  }

  // Dispose all geometries
  disposeAll(): void {
    console.log('🔷 GeometryManager: Disposing all geometries and materials');
    
    // Dispose geometries
    for (const geometry of this.geometries.values()) {
      geometry.dispose();
    }
    
    // Dispose materials
    for (const material of this.materialCache.values()) {
      material.dispose();
    }
    
    // Dispose meshes
    for (const mesh of this.meshCache.values()) {
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(mat => mat.dispose());
      } else {
        mesh.material.dispose();
      }
    }
    
    this.geometries.clear();
    this.materialCache.clear();
    this.meshCache.clear();
    
    console.log('🔷 GeometryManager: All resources disposed');
  }

  // Get cache statistics
  getStats(): {
    geometries: number;
    materials: number;
    meshes: number;
    totalMemory: string;
  } {
    // Rough memory estimation (not exact but gives an idea)
    const geometryMemory = this.geometries.size * 0.1; // ~0.1MB per geometry
    const materialMemory = this.materialCache.size * 0.01; // ~0.01MB per material
    const meshMemory = this.meshCache.size * 0.05; // ~0.05MB per mesh
    const totalMemoryMB = geometryMemory + materialMemory + meshMemory;

    return {
      geometries: this.geometries.size,
      materials: this.materialCache.size,
      meshes: this.meshCache.size,
      totalMemory: `${totalMemoryMB.toFixed(2)}MB`
    };
  }

  // Force cleanup for low memory situations
  emergencyCleanup(): void {
    console.log('🔷 GeometryManager: Emergency cleanup triggered');
    this.disposeAll();
  }
}

// Export singleton instance
export const geometryManager = new GeometryManager();

// Export types
export type { GeometryConfig };
export default geometryManager;


