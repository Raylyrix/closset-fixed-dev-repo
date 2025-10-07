// ThreadShaderPipeline: scaffold for anisotropic/parallax thread shading
// This is a safe no-op placeholder guarded by feature flags.

export interface ThreadMaterialParams {
  color: string;
  roughness: number;
  metallic: number;
  anisotropy: number; // 0..1
  normalMapIntensity: number; // 0..1
  parallax: boolean;
  heightScale: number; // for parallax mapping
}

export class ThreadShaderPipeline {
  private static instance: ThreadShaderPipeline;

  static getInstance(): ThreadShaderPipeline {
    if (!ThreadShaderPipeline.instance) {
      ThreadShaderPipeline.instance = new ThreadShaderPipeline();
    }
    return ThreadShaderPipeline.instance;
  }

  // In a future pass, returns a Three.js material configured with custom shaders.
  // For now, returns a plain object to avoid importing three.
  getThreadMaterial(_params: ThreadMaterialParams): any {
    // TODO: Replace with THREE.MeshStandardMaterial or custom ShaderMaterial
    return {
      type: 'ThreadMaterialPlaceholder',
      params: _params
    };
  }
}

export default ThreadShaderPipeline;
