// @ts-ignore - Vite environment variables
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
export async function uploadModel(file) {
    const form = new FormData();
    form.append('file', file);
    const r = await fetch(`${SERVER_URL}/api/models/upload`, { method: 'POST', body: form });
    if (!r.ok)
        throw new Error('Upload failed');
    return r.json();
}
export async function saveProject(project) {
    const r = await fetch(`${SERVER_URL}/api/save`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project })
    });
    if (!r.ok)
        throw new Error('Save failed');
    return r.json();
}
export async function upscalePng(pngBlob, scale = 2) {
    const form = new FormData();
    form.append('image', pngBlob, 'texture.png');
    const r = await fetch(`${SERVER_URL}/api/upscale?scale=${scale}`, { method: 'POST', body: form });
    if (!r.ok)
        throw new Error('Upscale failed');
    return await r.blob();
}
