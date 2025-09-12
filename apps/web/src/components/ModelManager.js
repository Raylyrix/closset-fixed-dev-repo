import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
export function ModelManager({ isOpen, onClose }) {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const setModelUrl = useApp(s => s.setModelUrl);
    const setModelChoice = useApp(s => s.setModelChoice);
    const setModelType = useApp(s => s.setModelType);
    const fetchModels = async () => {
        try {
            setLoading(true);
            setError(null);
            // Try proxy first, fallback to direct backend
            let response = await fetch('/api/models');
            if (!response.ok) {
                // Console log removed
                response = await fetch('http://localhost:4000/api/models');
            }
            if (!response.ok)
                throw new Error('Failed to fetch models');
            const data = await response.json();
            setModels(data || []);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load models');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (isOpen) {
            fetchModels();
        }
    }, [isOpen]);
    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        try {
            setUploading(true);
            setError(null);
            const formData = new FormData();
            formData.append('file', file);
            // Try proxy first, fallback to direct backend
            let response = await fetch('/api/models/upload', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                // Console log removed
                response = await fetch('http://localhost:4000/api/models/upload', {
                    method: 'POST',
                    body: formData,
                });
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }
            const result = await response.json();
            await fetchModels(); // Refresh the list
            // Auto-select the newly uploaded model
            handleModelSelect(`/api/models/${result.id}/file`, result.fileExtension);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        }
        finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    const handleModelSelect = (modelUrl, modelType) => {
        // Console log removed
        setModelUrl(modelUrl);
        setModelType(modelType);
        setModelChoice('custom');
        onClose();
    };
    const handleModelDelete = async (modelId) => {
        if (!confirm('Are you sure you want to delete this model?'))
            return;
        try {
            setError(null);
            // Try proxy first, fallback to direct backend
            let response = await fetch(`/api/models/${modelId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                // Console log removed
                response = await fetch(`http://localhost:4000/api/models/${modelId}`, {
                    method: 'DELETE',
                });
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Delete failed');
            }
            await fetchModels(); // Refresh the list
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Delete failed');
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "model-manager-overlay", onClick: onClose, children: _jsxs("div", { className: "model-manager-modal", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "model-manager-header", children: [_jsx("h2", { children: "Model Manager" }), _jsx("button", { className: "close-btn", onClick: onClose, children: "\u00D7" })] }), _jsxs("div", { className: "model-manager-content", children: [_jsxs("div", { className: "upload-section", children: [_jsx("h3", { children: "Upload New Model" }), _jsxs("div", { className: "upload-area", children: [_jsx("input", { ref: fileInputRef, type: "file", accept: ".glb,.gltf,.obj,.fbx,.dae,.3ds,.ply", onChange: handleFileUpload, disabled: uploading, style: { display: 'none' } }), _jsx("button", { className: "upload-btn", onClick: () => fileInputRef.current?.click(), disabled: uploading, children: uploading ? 'Uploading...' : 'Choose File' }), _jsx("p", { className: "upload-hint", children: "Supported formats: GLB, GLTF, OBJ, FBX, DAE, 3DS, PLY (max 50MB)" })] })] }), error && (_jsx("div", { className: "error-message", children: error })), _jsxs("div", { className: "models-section", children: [_jsx("h3", { children: "Available Models" }), loading ? (_jsx("div", { className: "loading", children: "Loading models..." })) : models.length === 0 ? (_jsx("div", { className: "no-models", children: "No models uploaded yet." })) : (_jsx("div", { className: "models-grid", children: models.map((model) => (_jsxs("div", { className: "model-card", children: [_jsxs("div", { className: "model-info", children: [_jsx("h4", { children: model.name }), _jsxs("p", { className: "model-details", children: ["Type: ", model.fileExtension.toUpperCase(), _jsx("br", {}), "Uploaded: ", formatDate(model.uploadedAt)] })] }), _jsxs("div", { className: "model-actions", children: [_jsx("button", { className: "select-btn", onClick: () => handleModelSelect(`/api/models/${model.id}/file`, model.fileExtension), children: "Select" }), _jsx("button", { className: "delete-btn", onClick: () => handleModelDelete(model.id), children: "Delete" })] })] }, model.id))) }))] }), _jsxs("div", { className: "default-models-section", children: [_jsx("h3", { children: "Default Models" }), _jsxs("div", { className: "default-models", children: [_jsx("button", { className: "default-model-btn", onClick: () => {
                                                setModelChoice('tshirt');
                                                setModelUrl(null);
                                                setModelType(null);
                                                onClose();
                                            }, children: "T-Shirt" }), _jsx("button", { className: "default-model-btn", onClick: () => {
                                                setModelChoice('sphere');
                                                setModelUrl(null);
                                                setModelType(null);
                                                onClose();
                                            }, children: "Sphere" })] })] })] })] }) }));
}
