import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useApp } from '../App';
const defaultScenes = [
    {
        id: 'studio',
        name: 'Professional Studio',
        type: 'default',
        url: 'studio',
        description: 'Industry-standard studio lighting with HDR environment maps for perfect clothing visualization'
    },
    {
        id: 'outdoor',
        name: 'Natural Outdoor',
        type: 'default',
        url: 'outdoor',
        description: 'Realistic outdoor lighting with dynamic sky and natural shadows for lifestyle photography'
    },
    {
        id: 'indoor',
        name: 'Warm Indoor',
        type: 'default',
        url: 'indoor',
        description: 'Cozy indoor environment with HDR lighting for lifestyle and fashion photography'
    },
    {
        id: 'night',
        name: 'Urban Night',
        type: 'default',
        url: 'night',
        description: 'Atmospheric night city lighting with neon accents for urban fashion'
    },
    {
        id: 'beach',
        name: 'Tropical Beach',
        type: 'default',
        url: 'beach',
        description: 'Golden hour beach lighting with realistic sky for summer fashion photography'
    }
];
export const BackgroundManager = () => {
    const { backgroundManagerOpen, closeBackgroundManager, setBackgroundScene, setBackgroundIntensity, setBackgroundRotation } = useApp();
    const [scenes, setScenes] = useState(defaultScenes);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchCustomScenes();
    }, []);
    const fetchCustomScenes = async () => {
        try {
            const response = await fetch('/api/backgrounds');
            if (response.ok) {
                const customScenes = await response.json();
                setScenes([...defaultScenes, ...customScenes]);
            }
        }
        catch (err) {
            // Console log removed
        }
    };
    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file (JPG, PNG, HDR)');
            return;
        }
        setUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('background', file);
            const response = await fetch('/api/backgrounds/upload', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                const newScene = await response.json();
                setScenes(prev => [...prev, newScene]);
                setError(null);
            }
            else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to upload background');
            }
        }
        catch (err) {
            setError('Failed to upload background');
        }
        finally {
            setUploading(false);
        }
    };
    const handleSceneSelect = (scene) => {
        setBackgroundScene(scene.url);
        closeBackgroundManager();
    };
    const handleDeleteCustom = async (sceneId) => {
        try {
            const response = await fetch(`/api/backgrounds/${sceneId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setScenes(prev => prev.filter(s => s.id !== sceneId));
            }
        }
        catch (err) {
            setError('Failed to delete background');
        }
    };
    if (!backgroundManagerOpen)
        return null;
    return (_jsx("div", { className: "background-manager-overlay", children: _jsxs("div", { className: "background-manager-modal", children: [_jsxs("div", { className: "background-manager-header", children: [_jsx("h2", { children: "Background Scenes" }), _jsx("button", { onClick: closeBackgroundManager, className: "close-btn", children: "\u00D7" })] }), _jsxs("div", { className: "background-manager-content", children: [_jsxs("div", { className: "upload-section", children: [_jsx("h3", { children: "Upload Custom Background" }), _jsxs("div", { style: { marginBottom: '16px', fontSize: '13px', color: 'var(--muted)' }, children: [_jsx("strong", { children: "Supported Formats:" }), _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "HDR (.hdr)" }), " - Industry standard for realistic lighting (recommended)", _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "EXR (.exr)" }), " - High-quality HDR format used in film/VFX", _jsx("br", {}), "\u2022 ", _jsx("strong", { children: "JPEG/PNG" }), " - Standard images (limited lighting quality)", _jsx("br", {}), _jsx("br", {}), _jsx("strong", { children: "For best results:" }), " Use HDR files (2K-8K resolution) for professional lighting"] }), _jsx("input", { type: "file", accept: "image/*,.hdr,.exr", onChange: handleFileUpload, disabled: uploading }), uploading && _jsx("div", { className: "uploading", children: "Uploading..." }), error && _jsx("div", { className: "error", children: error })] }), _jsx("div", { className: "scenes-grid", children: scenes.map((scene) => (_jsxs("div", { className: "scene-card", children: [_jsx("div", { className: "scene-thumbnail", children: scene.thumbnail ? (_jsx("img", { src: scene.thumbnail, alt: scene.name })) : (_jsx("div", { className: "scene-placeholder", children: scene.name[0] })) }), _jsxs("div", { className: "scene-info", children: [_jsx("h4", { children: scene.name }), _jsx("p", { children: scene.description }), _jsxs("div", { className: "scene-actions", children: [_jsx("button", { onClick: () => handleSceneSelect(scene), className: "select-btn", children: "Select" }), scene.type === 'custom' && (_jsx("button", { onClick: () => handleDeleteCustom(scene.id), className: "delete-btn", children: "Delete" }))] })] })] }, scene.id))) })] })] }) }));
};
