import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../App';

interface CloudSyncProps {
  active: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  createdAt: string;
  modifiedAt: string;
  size: number;
  tags: string[];
  isPublic: boolean;
  isShared: boolean;
  collaborators: string[];
  version: number;
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: string | null;
  pendingChanges: number;
  isSyncing: boolean;
  error: string | null;
}

interface CloudSettings {
  autoSync: boolean;
  syncInterval: number; // minutes
  compressionLevel: number;
  backupEnabled: boolean;
  maxBackups: number;
}

export function CloudSync({ active }: CloudSyncProps) {
  // Console log removed

  const {
    composedCanvas,
    activeTool,
    brushColor,
    brushSize,
    layers,
    activeLayerId,
    textElements,
    decals,
    commit
  } = useApp();

  // Cloud state
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingChanges: 0,
    isSyncing: false,
    error: null
  });
  const [cloudSettings, setCloudSettings] = useState<CloudSettings>({
    autoSync: true,
    syncInterval: 5,
    compressionLevel: 6,
    backupEnabled: true,
    maxBackups: 10
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Refs
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSaveRef = useRef<number>(0);

  // Initialize cloud sync
  useEffect(() => {
    if (!active) {
      // Console log removed
      return;
    }

    // Console log removed

    // Load projects from localStorage (mock cloud storage)
    loadProjects();

    // Set up online/offline listeners
    const handleOnline = () => {
      // Console log removed
      setSyncStatus(prev => ({ ...prev, isOnline: true, error: null }));
      if (cloudSettings.autoSync) {
        syncToCloud();
      }
    };

    const handleOffline = () => {
      // Console log removed
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up auto-sync interval
    if (cloudSettings.autoSync) {
      startAutoSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [active, cloudSettings.autoSync]);

  // Load projects from mock storage
  const loadProjects = useCallback(() => {
    // Console log removed

    try {
      const storedProjects = localStorage.getItem('closset_projects');
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        setProjects(parsedProjects);
        // Console log removed
      } else {
        // Create sample projects
        const sampleProjects: Project[] = [
          {
            id: 'project_1',
            name: 'Sample T-Shirt Design',
            description: 'A modern minimalist t-shirt design',
            thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            size: 1024000,
            tags: ['t-shirt', 'minimalist', 'modern'],
            isPublic: false,
            isShared: false,
            collaborators: [],
            version: 1
          }
        ];
        setProjects(sampleProjects);
        localStorage.setItem('closset_projects', JSON.stringify(sampleProjects));
        // Console log removed
      }
    } catch (error) {
      console.error('☁️ CloudSync: Failed to load projects', error);
      setSyncStatus(prev => ({ ...prev, error: 'Failed to load projects' }));
    }
  }, []);

  // Save projects to storage
  const saveProjects = useCallback((updatedProjects: Project[]) => {
    // Console log removed

    try {
      localStorage.setItem('closset_projects', JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
      // Console log removed
    } catch (error) {
      console.error('☁️ CloudSync: Failed to save projects', error);
      setSyncStatus(prev => ({ ...prev, error: 'Failed to save projects' }));
    }
  }, []);

  // Create new project
  const createProject = useCallback((name: string, description: string = '') => {
    // Console log removed

    const newProject: Project = {
      id: `project_${Date.now()}`,
      name,
      description,
      thumbnail: composedCanvas ? composedCanvas.toDataURL('image/png', 0.1) : '',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      size: composedCanvas ? composedCanvas.width * composedCanvas.height * 4 : 0,
      tags: [],
      isPublic: false,
      isShared: false,
      collaborators: [],
      version: 1
    };

    const updatedProjects = [newProject, ...projects];
    saveProjects(updatedProjects);
    setCurrentProject(newProject);

    // Console log removed
    return newProject;
  }, [composedCanvas, projects, saveProjects]);

  // Save current project
  const saveCurrentProject = useCallback(() => {
    if (!currentProject || !composedCanvas) {
      // Console log removed
      return;
    }

    // Console log removed

    const updatedProject: Project = {
      ...currentProject,
      thumbnail: composedCanvas.toDataURL('image/png', 0.1),
      modifiedAt: new Date().toISOString(),
      size: composedCanvas.width * composedCanvas.height * 4,
      version: currentProject.version + 1
    };

    const updatedProjects = projects.map(p => 
      p.id === currentProject.id ? updatedProject : p
    );

    saveProjects(updatedProjects);
    setCurrentProject(updatedProject);

    // Console log removed
  }, [currentProject, composedCanvas, projects, saveProjects]);

  // Load project
  const loadProject = useCallback((projectId: string) => {
    // Console log removed

    const project = projects.find(p => p.id === projectId);
    if (!project) {
      // Console log removed
      return;
    }

    setCurrentProject(project);

    // In a real implementation, this would load the project data into the canvas
    // Console log removed
  }, [projects]);

  // Delete project
  const deleteProject = useCallback((projectId: string) => {
    // Console log removed

    const updatedProjects = projects.filter(p => p.id !== projectId);
    saveProjects(updatedProjects);

    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }

    // Console log removed
  }, [projects, currentProject, saveProjects]);

  // Sync to cloud
  const syncToCloud = useCallback(async () => {
    if (!syncStatus.isOnline || syncStatus.isSyncing) {
      // Console log removed
      return;
    }

    // Console log removed

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      // Mock cloud sync - in real implementation, this would upload to cloud storage
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date().toISOString(),
        pendingChanges: 0
      }));

      // Console log removed

    } catch (error) {
      console.error('☁️ CloudSync: Cloud sync failed', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Sync failed. Please try again.'
      }));
    }
  }, [syncStatus.isOnline, syncStatus.isSyncing]);

  // Start auto-sync
  const startAutoSync = useCallback(() => {
    // Console log removed

    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(() => {
      if (syncStatus.isOnline && !syncStatus.isSyncing) {
        // Console log removed
        syncToCloud();
      }
    }, cloudSettings.syncInterval * 60 * 1000);
  }, [cloudSettings.syncInterval, syncStatus.isOnline, syncStatus.isSyncing, syncToCloud]);

  // Upload project
  const uploadProject = useCallback(async (project: Project) => {
    // Console log removed

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Mock upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Update project as uploaded
      const updatedProject = { ...project, isPublic: true };
      const updatedProjects = projects.map(p => 
        p.id === project.id ? updatedProject : p
      );
      saveProjects(updatedProjects);

      // Console log removed

    } catch (error) {
      console.error('☁️ CloudSync: Upload failed', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [projects, saveProjects]);

  // Download project
  const downloadProject = useCallback(async (project: Project) => {
    // Console log removed

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Mock download progress
      for (let i = 0; i <= 100; i += 10) {
        setDownloadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // In real implementation, this would download and load the project
      loadProject(project.id);

      // Console log removed

    } catch (error) {
      console.error('☁️ CloudSync: Download failed', error);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  }, [loadProject]);

  // Share project
  const shareProject = useCallback((project: Project) => {
    // Console log removed

    const shareUrl = `${window.location.origin}/share/${project.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: project.name,
        text: project.description,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      // Console log removed
    }
  }, []);

  // Update cloud settings
  const updateCloudSettings = useCallback((newSettings: Partial<CloudSettings>) => {
    // Console log removed
    
    setCloudSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Restart auto-sync if settings changed
      if (updated.autoSync && !prev.autoSync) {
        startAutoSync();
      } else if (!updated.autoSync && prev.autoSync) {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      }
      
      return updated;
    });
  }, [startAutoSync]);

  // Auto-save when design changes
  useEffect(() => {
    if (!currentProject || !composedCanvas) return;

    const now = Date.now();
    if (now - lastSaveRef.current > 30000) { // Save every 30 seconds
      // Console log removed
      saveCurrentProject();
      lastSaveRef.current = now;
    }
  }, [composedCanvas, currentProject, saveCurrentProject]);

  if (!active) {
    // Console log removed
    return null;
  }

  console.log('☁️ CloudSync: Rendering component', { 
    projectsCount: projects.length,
    currentProject: currentProject?.name,
    syncStatus
  });

  return (
    <div className="cloud-sync" style={{
      border: '2px solid #06B6D4',
      borderRadius: '8px',
      padding: '12px',
      background: 'rgba(6, 182, 212, 0.1)',
      boxShadow: '0 0 10px rgba(6, 182, 212, 0.3)',
      marginTop: '12px'
    }}>
      <div className="cloud-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h4 style={{ margin: 0, color: '#06B6D4', fontSize: '16px' }}>
          ☁️ Cloud Sync & Projects
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn"
            onClick={syncToCloud}
            disabled={!syncStatus.isOnline || syncStatus.isSyncing}
            style={{
              background: syncStatus.isOnline && !syncStatus.isSyncing ? '#06B6D4' : '#6B7280',
              color: 'white',
              fontSize: '12px',
              padding: '6px 12px'
            }}
          >
            {syncStatus.isSyncing ? 'Syncing...' : 'Sync'}
          </button>
          <button
            className="btn"
            onClick={() => useApp.getState().setTool('brush')}
            style={{
              background: '#6B7280',
              color: 'white',
              fontSize: '12px',
              padding: '6px 12px'
            }}
            title="Close Cloud Sync"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Sync Status */}
      <div className="sync-status" style={{
        marginBottom: '12px',
        padding: '8px',
        background: 'rgba(6, 182, 212, 0.1)',
        borderRadius: '4px',
        fontSize: '11px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: syncStatus.isOnline ? '#10B981' : '#EF4444' }}>
            {syncStatus.isOnline ? '🟢 Online' : '🔴 Offline'}
          </span>
          <span style={{ color: '#6B7280' }}>
            {syncStatus.lastSync ? `Last sync: ${new Date(syncStatus.lastSync).toLocaleTimeString()}` : 'Never synced'}
          </span>
        </div>
        {syncStatus.pendingChanges > 0 && (
          <div style={{ color: '#F59E0B', marginTop: '4px' }}>
            {syncStatus.pendingChanges} pending changes
          </div>
        )}
        {syncStatus.error && (
          <div style={{ color: '#EF4444', marginTop: '4px' }}>
            {syncStatus.error}
          </div>
        )}
      </div>

      {/* Current Project */}
      {currentProject && (
        <div className="current-project" style={{
          marginBottom: '12px',
          padding: '8px',
          background: 'rgba(6, 182, 212, 0.1)',
          borderRadius: '4px',
          border: '1px solid rgba(6, 182, 212, 0.3)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '4px' }}>
            Current Project: {currentProject.name}
          </div>
          <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '8px' }}>
            Modified: {new Date(currentProject.modifiedAt).toLocaleString()}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className="btn"
              onClick={() => saveCurrentProject()}
              style={{
                background: '#10B981',
                color: 'white',
                fontSize: '10px',
                padding: '4px 8px'
              }}
            >
              Save
            </button>
            <button
              className="btn"
              onClick={() => shareProject(currentProject)}
              style={{
                background: '#8B5CF6',
                color: 'white',
                fontSize: '10px',
                padding: '4px 8px'
              }}
            >
              Share
            </button>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="projects-list" style={{
        marginBottom: '12px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }}>
          Projects ({projects.length})
        </div>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {projects.map(project => (
            <div
              key={project.id}
              className="project-item"
              style={{
                padding: '8px',
                marginBottom: '4px',
                background: 'rgba(6, 182, 212, 0.1)',
                borderRadius: '4px',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                cursor: 'pointer'
              }}
              onClick={() => loadProject(project.id)}
            >
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#06B6D4' }}>
                {project.name}
              </div>
              <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>
                {project.description}
              </div>
              <div style={{ fontSize: '9px', color: '#6B7280', marginTop: '4px' }}>
                {new Date(project.modifiedAt).toLocaleDateString()} • {Math.round(project.size / 1024)}KB
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Actions */}
      <div className="project-actions" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <button
          className="btn"
          onClick={() => {
            const name = prompt('Project name:');
            if (name) {
              createProject(name);
            }
          }}
          style={{
            background: '#10B981',
            color: 'white',
            fontSize: '12px',
            padding: '8px 16px'
          }}
        >
          New Project
        </button>
        <button
          className="btn"
          onClick={() => {
            if (currentProject) {
              uploadProject(currentProject);
            }
          }}
          disabled={!currentProject || isUploading}
          style={{
            background: isUploading ? '#6B7280' : '#8B5CF6',
            color: 'white',
            fontSize: '12px',
            padding: '8px 16px'
          }}
        >
          {isUploading ? `Uploading ${uploadProgress}%` : 'Upload'}
        </button>
      </div>

      {/* Cloud Settings */}
      <div className="cloud-settings" style={{
        marginBottom: '12px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#06B6D4', marginBottom: '8px' }}>
          Cloud Settings
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="autoSync"
              checked={cloudSettings.autoSync}
              onChange={(e) => updateCloudSettings({ autoSync: e.target.checked })}
            />
            <label htmlFor="autoSync" style={{ fontSize: '11px', color: '#06B6D4' }}>
              Auto-sync
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="backupEnabled"
              checked={cloudSettings.backupEnabled}
              onChange={(e) => updateCloudSettings({ backupEnabled: e.target.checked })}
            />
            <label htmlFor="backupEnabled" style={{ fontSize: '11px', color: '#06B6D4' }}>
              Auto-backup
            </label>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#06B6D4' }}>
              Sync Interval: {cloudSettings.syncInterval}min
            </label>
            <input
              type="range"
              min="1"
              max="60"
              value={cloudSettings.syncInterval}
              onChange={(e) => updateCloudSettings({ syncInterval: parseInt(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#06B6D4' }}>
              Compression: {cloudSettings.compressionLevel}
            </label>
            <input
              type="range"
              min="1"
              max="9"
              value={cloudSettings.compressionLevel}
              onChange={(e) => updateCloudSettings({ compressionLevel: parseInt(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center' }}>
        Create, save, and sync your designs across devices
      </div>
    </div>
  );
}

