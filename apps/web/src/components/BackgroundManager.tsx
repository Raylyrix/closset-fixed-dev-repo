import React, { useState, useEffect } from 'react';
import { useApp } from '../App';

interface BackgroundScene {
  id: string;
  name: string;
  type: 'default' | 'custom';
  url: string;
  thumbnail?: string;
  description: string;
}

const defaultScenes: BackgroundScene[] = [
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

export const BackgroundManager: React.FC = () => {
  const { backgroundManagerOpen, closeBackgroundManager, setBackgroundScene, setBackgroundIntensity, setBackgroundRotation } = useApp();
  const [scenes, setScenes] = useState<BackgroundScene[]>(defaultScenes);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      // Console log removed
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload background');
      }
    } catch (err) {
      setError('Failed to upload background');
    } finally {
      setUploading(false);
    }
  };

  const handleSceneSelect = (scene: BackgroundScene) => {
    setBackgroundScene(scene.url);
    closeBackgroundManager();
  };

  const handleDeleteCustom = async (sceneId: string) => {
    try {
      const response = await fetch(`/api/backgrounds/${sceneId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setScenes(prev => prev.filter(s => s.id !== sceneId));
      }
    } catch (err) {
      setError('Failed to delete background');
    }
  };

  if (!backgroundManagerOpen) return null;

  return (
    <div className="background-manager-overlay">
      <div className="background-manager-modal">
        <div className="background-manager-header">
          <h2>Background Scenes</h2>
          <button onClick={closeBackgroundManager} className="close-btn">×</button>
        </div>

        <div className="background-manager-content">
          <div className="upload-section">
            <h3>Upload Custom Background</h3>
            <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--muted)' }}>
              <strong>Supported Formats:</strong>
              <br />• <strong>HDR (.hdr)</strong> - Industry standard for realistic lighting (recommended)
              <br />• <strong>EXR (.exr)</strong> - High-quality HDR format used in film/VFX
              <br />• <strong>JPEG/PNG</strong> - Standard images (limited lighting quality)
              <br /><br />
              <strong>For best results:</strong> Use HDR files (2K-8K resolution) for professional lighting
            </div>
            <input
              type="file"
              accept="image/*,.hdr,.exr"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading && <div className="uploading">Uploading...</div>}
            {error && <div className="error">{error}</div>}
          </div>

          <div className="scenes-grid">
            {scenes.map((scene) => (
              <div key={scene.id} className="scene-card">
                <div className="scene-thumbnail">
                  {scene.thumbnail ? (
                    <img src={scene.thumbnail} alt={scene.name} />
                  ) : (
                    <div className="scene-placeholder">{scene.name[0]}</div>
                  )}
                </div>
                <div className="scene-info">
                  <h4>{scene.name}</h4>
                  <p>{scene.description}</p>
                  <div className="scene-actions">
                    <button 
                      onClick={() => handleSceneSelect(scene)}
                      className="select-btn"
                    >
                      Select
                    </button>
                    {scene.type === 'custom' && (
                      <button 
                        onClick={() => handleDeleteCustom(scene.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
