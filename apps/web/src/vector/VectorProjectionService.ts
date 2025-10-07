// VectorProjectionService: centralizes projection of 2D vector anchors/paths to the 3D garment
// Scaffold: APIs are typed and safe no-ops until wired to the Three.js scene

export interface SurfacePoint3D {
  position: { x: number; y: number; z: number };
  normal: { x: number; y: number; z: number };
  uv?: { u: number; v: number };
}

export interface ScreenPoint2D {
  x: number;
  y: number;
}

export interface ProjectionResult {
  hit: boolean;
  surface?: SurfacePoint3D;
}

export interface CurveRebuildOptions {
  preserveLength?: boolean;
  tension?: number; // 0..1
}

export class VectorProjectionService {
  private static instance: VectorProjectionService;
  // Three.js context (kept as any to avoid hard dependency/types here)
  private camera: any | null = null;
  private mesh: any | null = null;
  private raycaster: any | null = null;
  private viewport: { width: number; height: number } | null = null;
  private canvasSize: { width: number; height: number } | null = null;

  static getInstance(): VectorProjectionService {
    if (!VectorProjectionService.instance) {
      VectorProjectionService.instance = new VectorProjectionService();
    }
    return VectorProjectionService.instance;
  }

  /**
   * Inject Three.js context. Pass in camera, target mesh (shirt), and viewport size.
   * If a raycaster is not provided, we will attempt to create one lazily.
   */
  setContext(ctx: { camera: any; mesh: any; viewport: { width: number; height: number }; canvas?: { width: number; height: number }; raycaster?: any }): void {
    this.camera = ctx.camera;
    this.mesh = ctx.mesh;
    this.viewport = ctx.viewport;
    this.canvasSize = ctx.canvas || this.canvasSize || null;
    this.raycaster = ctx.raycaster || this.raycaster || null;
  }

  // Raycast from screen point into scene to find garment hit
  projectScreenPointToSurface(_pt: ScreenPoint2D): ProjectionResult {
    try {
      if (!this.camera || !this.mesh || !_pt || !this.viewport) return { hit: false };

      // Lazy create raycaster if not set
      if (!this.raycaster) {
        // Dynamically create a raycaster using global THREE if present
        const THREE: any = (globalThis as any).THREE;
        if (THREE && THREE.Raycaster) {
          this.raycaster = new THREE.Raycaster();
        } else {
          return { hit: false };
        }
      }

      // Convert screen coords to NDC
      const ndcX = (_pt.x / this.viewport.width) * 2 - 1;
      const ndcY = -(_pt.y / this.viewport.height) * 2 + 1;

      if (this.raycaster.setFromCamera) {
        this.raycaster.setFromCamera({ x: ndcX, y: ndcY }, this.camera);
      } else if (this.raycaster.set) {
        this.raycaster.set({ x: ndcX, y: ndcY }, this.camera);
      }

      const intersects = this.raycaster.intersectObject ? this.raycaster.intersectObject(this.mesh, true) : [];
      if (intersects && intersects.length > 0) {
        const hit = intersects[0];
        const p = hit.point || { x: 0, y: 0, z: 0 };
        const n = hit.face?.normal || { x: 0, y: 1, z: 0 };
        const uv = hit.uv ? { u: hit.uv.x, v: hit.uv.y } : undefined;
        return {
          hit: true,
          surface: {
            position: { x: p.x, y: p.y, z: p.z },
            normal: { x: n.x, y: n.y, z: n.z },
            uv
          }
        };
      }
    } catch {
      // swallow errors in scaffold mode
    }
    return { hit: false };
  }

  // Convert UV back to approximate screen (for overlays/handles)
  uvToScreen(_uv: { u: number; v: number }): ScreenPoint2D | null {
    // Placeholder: without a direct UV->screen mapping, return null.
    // Future: use a UV debug mesh or barycentric projection if needed.
    return null;
  }

  // Map UV (0..1) to canvas pixel coordinates if canvas size is known
  uvToCanvas(uv: { u: number; v: number }): { x: number; y: number } | null {
    if (!this.canvasSize) return null;
    const x = uv.u * this.canvasSize.width;
    const y = uv.v * this.canvasSize.height;
    return { x, y };
  }

  // Rebuild a polyline/curve control points to conform to the surface after anchor moved
  rebuildCurveOnSurface<TPoint extends { x: number; y: number }>(
    points: TPoint[],
    _options?: CurveRebuildOptions
  ): TPoint[] {
    // TODO: apply smoothing and surface sliding; no-op passthrough for now
    return points;
  }
}

export default VectorProjectionService;
