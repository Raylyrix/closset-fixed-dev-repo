import React, { useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { useModelStore } from '../../stores/domainStores';
import { UVPoint, UVCoordinate, Vector2D } from '../../types/app';

interface UVMapperProps {
  onUVPointFound?: (uvPoint: UVPoint) => void;
  onUVError?: (error: string) => void;
}

/**
 * UVMapper - Handles UV coordinate mapping and world-to-UV conversions
 * This component focuses solely on coordinate transformations and does NOT handle:
 * - Rendering/interaction logic
 * - Tool state
 * - UI controls
 */
export function UVMapper({ onUVPointFound, onUVError }: UVMapperProps) {
  const { uvIndexCache, modelScene } = useModelStore();

  /**
   * Convert a UV coordinate to world position using barycentric interpolation
   */
  const uvToWorld = useCallback((uv: UVCoordinate): THREE.Vector3 | null => {
    if (!modelScene) return null;

    // Find the mesh with UV data
    let targetMesh: THREE.Mesh | null = null;
    modelScene.traverse((child) => {
      if (!targetMesh && child instanceof THREE.Mesh && child.geometry.attributes.uv) {
        targetMesh = child as THREE.Mesh;
      }
    });

    if (!targetMesh) return null;

    // At this point, targetMesh is guaranteed to be THREE.Mesh
    const mesh = targetMesh as THREE.Mesh;
    const geometry = mesh.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const uvs = geometry.attributes.uv.array as Float32Array;
    const indices = geometry.index ? geometry.index.array as Uint16Array | Uint32Array : null;

    const triCount = indices ? indices.length / 3 : uvs.length / 6; // 2 UVs per vertex, 3 vertices per triangle

    // Search through triangles
    for (let t = 0; t < triCount; t++) {
      const ia = indices ? indices[t * 3] : t * 3;
      const ib = indices ? indices[t * 3 + 1] : t * 3 + 1;
      const ic = indices ? indices[t * 3 + 2] : t * 3 + 2;

      const au = uvs[ia * 2], av = uvs[ia * 2 + 1];
      const bu = uvs[ib * 2], bv = uvs[ib * 2 + 1];
      const cu = uvs[ic * 2], cv = uvs[ic * 2 + 1];

      // Check if UV point is inside this triangle
      const bc = pointInTriangleBarycentric(uv.x, uv.y, au, av, bu, bv, cu, cv);
      if (bc) {
        // Interpolate world position
        const ax = positions[ia * 3], ay = positions[ia * 3 + 1], az = positions[ia * 3 + 2];
        const bx = positions[ib * 3], by = positions[ib * 3 + 1], bz = positions[ib * 3 + 2];
        const cx = positions[ic * 3], cy = positions[ic * 3 + 1], cz = positions[ic * 3 + 2];

        const worldPos = new THREE.Vector3(
          ax * bc.w + bx * bc.u + cx * bc.v,
          ay * bc.w + by * bc.u + cy * bc.v,
          az * bc.w + bz * bc.u + cz * bc.v
        );

        // Transform to world space
        mesh.localToWorld(worldPos);

        return worldPos;
      }
    }

    // If not found in exact triangles, try nearby points with jitter
    return findNearbyUVPoint(uv);
  }, [modelScene]);

  /**
   * Convert a world position to UV coordinate using raycasting
   */
  const worldToUV = useCallback((worldPos: THREE.Vector3): UVCoordinate | null => {
    if (!modelScene) return null;

    // Find the mesh with UV data
    let targetMesh: THREE.Mesh | null = null;
    modelScene.traverse((child) => {
      if (!targetMesh && child instanceof THREE.Mesh && child.geometry.attributes.uv) {
        targetMesh = child;
      }
    });

    if (!targetMesh) return null;

    // At this point, targetMesh is guaranteed to be THREE.Mesh
    const mesh = targetMesh as THREE.Mesh;

    // Create a ray from the world position towards the mesh
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3(0, 0, -1); // Assuming Z-up, ray towards surface

    // Transform direction to world space
    mesh.worldToLocal(direction);
    direction.normalize();

    const localPos = mesh.worldToLocal(worldPos.clone());
    raycaster.set(localPos, direction);

    const intersects = raycaster.intersectObject(mesh, false);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      if (intersect.uv) {
        return { x: intersect.uv.x, y: intersect.uv.y };
      }
    }

    return null;
  }, [modelScene]);

  /**
   * Get UV point with surface normal using barycentric interpolation
   */
  const uvToWorldWithNormal = useCallback((uv: UVCoordinate): { pos: THREE.Vector3; normal: THREE.Vector3 } | null => {
    if (!modelScene) return null;

    // Find the mesh with UV data
    let targetMesh: THREE.Mesh | null = null;
    modelScene.traverse((child) => {
      if (!targetMesh && child instanceof THREE.Mesh && child.geometry.attributes.uv && child.geometry.attributes.normal) {
        targetMesh = child;
      }
    });

    if (!targetMesh) return null;

    // At this point, targetMesh is guaranteed to be THREE.Mesh
    const mesh = targetMesh as THREE.Mesh;
    const geometry = mesh.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const normals = geometry.attributes.normal.array as Float32Array;
    const uvs = geometry.attributes.uv.array as Float32Array;
    const indices = geometry.index ? geometry.index.array as Uint16Array | Uint32Array : null;

    const triCount = indices ? indices.length / 3 : uvs.length / 6;

    // Search through triangles
    for (let t = 0; t < triCount; t++) {
      const ia = indices ? indices[t * 3] : t * 3;
      const ib = indices ? indices[t * 3 + 1] : t * 3 + 1;
      const ic = indices ? indices[t * 3 + 2] : t * 3 + 2;

      const au = uvs[ia * 2], av = uvs[ia * 2 + 1];
      const bu = uvs[ib * 2], bv = uvs[ib * 2 + 1];
      const cu = uvs[ic * 2], cv = uvs[ic * 2 + 1];

      const bc = pointInTriangleBarycentric(uv.x, uv.y, au, av, bu, bv, cu, cv);
      if (bc) {
        // Interpolate world position
        const ax = positions[ia * 3], ay = positions[ia * 3 + 1], az = positions[ia * 3 + 2];
        const bx = positions[ib * 3], by = positions[ib * 3 + 1], bz = positions[ib * 3 + 2];
        const cx = positions[ic * 3], cy = positions[ic * 3 + 1], cz = positions[ic * 3 + 2];

        const worldPos = new THREE.Vector3(
          ax * bc.w + bx * bc.u + cx * bc.v,
          ay * bc.w + by * bc.u + cy * bc.v,
          az * bc.w + bz * bc.u + cz * bc.v
        );

        // Interpolate normal
        const na = new THREE.Vector3(normals[ia * 3], normals[ia * 3 + 1], normals[ia * 3 + 2]);
        const nb = new THREE.Vector3(normals[ib * 3], normals[ib * 3 + 1], normals[ib * 3 + 2]);
        const nc = new THREE.Vector3(normals[ic * 3], normals[ic * 3 + 1], normals[ic * 3 + 2]);

        const worldNormal = new THREE.Vector3().addScaledVector(na, bc.w).addScaledVector(nb, bc.u).addScaledVector(nc, bc.v).normalize();

        // Transform to world space
        mesh.localToWorld(worldPos);
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
        worldNormal.applyMatrix3(normalMatrix).normalize();

        return { pos: worldPos, normal: worldNormal };
      }
    }

    return null;
  }, [modelScene]);

  /**
   * Find nearby UV point using small jitter search
   */
  const findNearbyUVPoint = useCallback((uv: UVCoordinate): THREE.Vector3 | null => {
    const eps = 1 / 1024; // Small UV nudge
    const maxAttempts = 4;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const radius = eps * attempt;
      const candidates = [
        { x: uv.x + radius, y: uv.y },
        { x: uv.x - radius, y: uv.y },
        { x: uv.x, y: uv.y + radius },
        { x: uv.x, y: uv.y - radius },
        { x: uv.x + radius, y: uv.y + radius },
        { x: uv.x - radius, y: uv.y - radius },
        { x: uv.x + radius, y: uv.y - radius },
        { x: uv.x - radius, y: uv.y + radius }
      ];

      for (const candidate of candidates) {
        // Clamp to valid UV range
        const clampedUV = {
          x: Math.min(1, Math.max(0, candidate.x)),
          y: Math.min(1, Math.max(0, candidate.y))
        };

        const result = uvToWorld(clampedUV);
        if (result) return result;
      }
    }

    return null;
  }, [uvToWorld]);

  /**
   * Check if a point is inside a triangle using barycentric coordinates
   */
  const pointInTriangleBarycentric = (
    px: number, py: number,
    ax: number, ay: number,
    bx: number, by: number,
    cx: number, cy: number
  ): { u: number; v: number; w: number } | null => {
    const v0x = bx - ax, v0y = by - ay;
    const v1x = cx - ax, v1y = cy - ay;
    const v2x = px - ax, v2y = py - ay;

    const den = v0x * v1y - v1x * v0y;
    if (Math.abs(den) < 1e-8) return null;

    const inv = 1 / den;
    const u = (v2x * v1y - v1x * v2y) * inv;
    const v = (v0x * v2y - v2x * v0y) * inv;
    const w = 1 - u - v;

    if (u >= -1e-4 && v >= -1e-4 && w >= -1e-4) {
      return { u, v, w };
    }

    return null;
  };

  /**
   * Get complete UV point data including surface properties
   */
  const getUVPointData = useCallback((uv: UVCoordinate): UVPoint | null => {
    const worldWithNormal = uvToWorldWithNormal(uv);
    if (!worldWithNormal) {
      onUVError?.('Could not find UV point on model surface');
      return null;
    }

    const uvPoint: UVPoint = {
      worldPosition: worldWithNormal.pos,
      uv: new THREE.Vector2(uv.x, uv.y),
      normal: worldWithNormal.normal
    };

    onUVPointFound?.(uvPoint);
    return uvPoint;
  }, [uvToWorldWithNormal, onUVPointFound, onUVError]);

  // Expose methods via useMemo for external use
  const uvMapperAPI = useMemo(() => ({
    uvToWorld,
    worldToUV,
    uvToWorldWithNormal,
    getUVPointData,
    isUVValid: (uv: UVCoordinate) => uv.x >= 0 && uv.x <= 1 && uv.y >= 0 && uv.y <= 1
  }), [uvToWorld, worldToUV, uvToWorldWithNormal, getUVPointData]);

  // This component doesn't render anything - it only provides UV mapping utilities
  return null;
}

// Export the API for use in other components
export type UVMapperAPI = ReturnType<typeof useMemo>;
export default UVMapper;
