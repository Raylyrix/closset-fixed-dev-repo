// ThreadShaderPipeline: scaffold for anisotropic/parallax thread shading
// This is a safe no-op placeholder guarded by feature flags.
export class ThreadShaderPipeline {
    static getInstance() {
        if (!ThreadShaderPipeline.instance) {
            ThreadShaderPipeline.instance = new ThreadShaderPipeline();
        }
        return ThreadShaderPipeline.instance;
    }
    // In a future pass, returns a Three.js material configured with custom shaders.
    // For now, returns a plain object to avoid importing three.
    getThreadMaterial(_params) {
        // TODO: Replace with THREE.MeshStandardMaterial or custom ShaderMaterial
        return {
            type: 'ThreadMaterialPlaceholder',
            params: _params
        };
    }
}
export default ThreadShaderPipeline;
