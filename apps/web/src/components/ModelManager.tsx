import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';

interface Model {
  id: string;
  name: string;
  filename: string;
  fileExtension: string;
  uploadedAt: string;
  type: string;
}

interface ModelManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModelManager({ isOpen, onClose }: ModelManagerProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      setModels(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchModels();
    }
  }, [isOpen]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleModelSelect = (modelUrl: string, modelType: string) => {
    // Console log removed
    setModelUrl(modelUrl);
    setModelType(modelType);
    setModelChoice('custom');
    onClose();
  };

  const handleModelDelete = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="model-manager-overlay" onClick={onClose}>
      <div className="model-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="model-manager-header">
          <h2>Model Manager</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="model-manager-content">
          {/* Upload Section */}
          <div className="upload-section">
            <h3>Upload New Model</h3>
            <div className="upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept=".glb,.gltf,.obj,.fbx,.dae,.3ds,.ply"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              <button
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </button>
              <p className="upload-hint">
                Supported formats: GLB, GLTF, OBJ, FBX, DAE, 3DS, PLY (max 50MB)
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Models List */}
          <div className="models-section">
            <h3>Available Models</h3>
            {loading ? (
              <div className="loading">Loading models...</div>
            ) : models.length === 0 ? (
              <div className="no-models">No models uploaded yet.</div>
            ) : (
              <div className="models-grid">
                {models.map((model) => (
                  <div key={model.id} className="model-card">
                    <div className="model-info">
                      <h4>{model.name}</h4>
                      <p className="model-details">
                        Type: {model.fileExtension.toUpperCase()}<br />
                        Uploaded: {formatDate(model.uploadedAt)}
                      </p>
                    </div>
                    <div className="model-actions">
                      <button
                        className="select-btn"
                        onClick={() => handleModelSelect(`/api/models/${model.id}/file`, model.fileExtension)}
                      >
                        Select
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleModelDelete(model.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Default Models */}
          <div className="default-models-section">
            <h3>Default Models</h3>
            <div className="default-models">
              <button
                className="default-model-btn"
                onClick={() => {
                  setModelChoice('tshirt');
                  setModelUrl(null);
                  setModelType(null);
                  onClose();
                }}
              >
                T-Shirt
              </button>
              <button
                className="default-model-btn"
                onClick={() => {
                  setModelChoice('sphere');
                  setModelUrl(null);
                  setModelType(null);
                  onClose();
                }}
              >
                Sphere
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
