import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
export async function exportMeshAsGLB(textureCanvas) {
    const geometry = new THREE.SphereGeometry(0.8, 64, 64); // placeholder geo
    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.flipY = false;
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    const scene = new THREE.Scene();
    scene.add(mesh);
    const exporter = new GLTFExporter();
    return new Promise((resolve, reject) => {
        exporter.parse(scene, (gltf) => {
            const blob = new Blob([gltf], { type: 'model/gltf-binary' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'closset-shirt.glb';
            a.click();
            URL.revokeObjectURL(url);
            resolve();
        }, (err) => reject(err), { binary: true, embedImages: true });
    });
}
