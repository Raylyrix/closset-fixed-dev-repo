import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../App';

interface BatchProcessingProps {
  active: boolean;
}

interface BatchJob {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  operations: BatchOperation[];
  inputFiles: string[];
  outputFiles: string[];
  error?: string;
}

interface BatchOperation {
  id: string;
  type: 'resize' | 'format' | 'filter' | 'color' | 'crop' | 'watermark' | 'optimize';
  parameters: Record<string, any>;
  enabled: boolean;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: 'file_added' | 'file_modified' | 'scheduled' | 'manual';
  conditions: AutomationCondition[];
  actions: BatchOperation[];
  enabled: boolean;
  lastRun?: string;
  runCount: number;
}

interface AutomationCondition {
  field: 'filename' | 'size' | 'format' | 'dimensions' | 'created_date';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'matches';
  value: any;
}

interface ProcessingPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  operations: BatchOperation[];
  outputFormat: string;
  quality: number;
}

export function BatchProcessing({ active }: BatchProcessingProps) {
  // Console log removed

  const {
    composedCanvas,
    activeTool,
    brushColor,
    brushSize,
    layers,
    activeLayerId,
    commit
  } = useApp();

  // Batch processing state
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [currentJob, setCurrentJob] = useState<BatchJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Automation state
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [isAutomationEnabled, setIsAutomationEnabled] = useState(false);

  // Processing presets
  const [processingPresets, setProcessingPresets] = useState<ProcessingPreset[]>([
    {
      id: 'web_optimize',
      name: 'Web Optimization',
      description: 'Optimize images for web use',
      category: 'Web',
      operations: [
        { id: 'resize', type: 'resize', parameters: { width: 800, height: 600, maintainAspectRatio: true }, enabled: true },
        { id: 'optimize', type: 'optimize', parameters: { quality: 85, format: 'jpeg' }, enabled: true }
      ],
      outputFormat: 'jpeg',
      quality: 85
    },
    {
      id: 'print_ready',
      name: 'Print Ready',
      description: 'Prepare images for high-quality printing',
      category: 'Print',
      operations: [
        { id: 'resize', type: 'resize', parameters: { width: 3000, height: 3000, maintainAspectRatio: true }, enabled: true },
        { id: 'format', type: 'format', parameters: { format: 'png', colorSpace: 'cmyk' }, enabled: true }
      ],
      outputFormat: 'png',
      quality: 100
    },
    {
      id: 'social_media',
      name: 'Social Media',
      description: 'Optimize for social media platforms',
      category: 'Social',
      operations: [
        { id: 'resize', type: 'resize', parameters: { width: 1080, height: 1080, maintainAspectRatio: true }, enabled: true },
        { id: 'optimize', type: 'optimize', parameters: { quality: 90, format: 'jpeg' }, enabled: true }
      ],
      outputFormat: 'jpeg',
      quality: 90
    }
  ]);

  // UI state
  const [activeTab, setActiveTab] = useState<'batch' | 'automation' | 'presets'>('batch');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customOperations, setCustomOperations] = useState<BatchOperation[]>([]);

  // Refs
  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize batch processing
  useEffect(() => {
    if (!active) {
      // Console log removed
      return;
    }

    // Console log removed

    // Load mock automation rules
    loadAutomationRules();

    // Console log removed
  }, [active]);

  // Load automation rules
  const loadAutomationRules = useCallback(() => {
    // Console log removed

    const mockRules: AutomationRule[] = [
      {
        id: 'auto_web_optimize',
        name: 'Auto Web Optimization',
        description: 'Automatically optimize images for web when added',
        trigger: 'file_added',
        conditions: [
          { field: 'format', operator: 'equals', value: 'png' },
          { field: 'size', operator: 'greater_than', value: 1000000 }
        ],
        actions: [
          { id: 'resize', type: 'resize', parameters: { width: 800, height: 600, maintainAspectRatio: true }, enabled: true },
          { id: 'optimize', type: 'optimize', parameters: { quality: 85, format: 'jpeg' }, enabled: true }
        ],
        enabled: true,
        runCount: 0
      },
      {
        id: 'auto_thumbnail',
        name: 'Auto Thumbnail Generation',
        description: 'Generate thumbnails for large images',
        trigger: 'file_added',
        conditions: [
          { field: 'dimensions', operator: 'greater_than', value: { width: 1000, height: 1000 } }
        ],
        actions: [
          { id: 'resize', type: 'resize', parameters: { width: 200, height: 200, maintainAspectRatio: true }, enabled: true },
          { id: 'format', type: 'format', parameters: { format: 'jpeg', quality: 80 }, enabled: true }
        ],
        enabled: true,
        runCount: 0
      }
    ];

    setAutomationRules(mockRules);
    // Console log removed
  }, []);

  // Create batch job
  const createBatchJob = useCallback((name: string, operations: BatchOperation[], files: string[]) => {
    // Console log removed

    const job: BatchJob = {
      id: `job_${Date.now()}`,
      name,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      operations: operations.filter(op => op.enabled),
      inputFiles: files,
      outputFiles: []
    };

    setBatchJobs(prev => [job, ...prev]);
    setCurrentJob(job);

    // Console log removed
    return job;
  }, []);

  // Start batch processing
  const startBatchProcessing = useCallback(async (job: BatchJob) => {
    // Console log removed

    setIsProcessing(true);
    setCurrentJob(job);
    setProcessingProgress(0);

    // Update job status
    setBatchJobs(prev => prev.map(j => 
      j.id === job.id ? { ...j, status: 'running' } : j
    ));

    try {
      // Simulate processing with progress updates
      const totalOperations = job.operations.length * job.inputFiles.length;
      let completedOperations = 0;

      for (const file of job.inputFiles) {
        for (const operation of job.operations) {
          // Console log removed

          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Update progress
          completedOperations++;
          const progress = (completedOperations / totalOperations) * 100;
          setProcessingProgress(progress);

          // Update job progress
          setBatchJobs(prev => prev.map(j => 
            j.id === job.id ? { ...j, progress } : j
          ));
        }
      }

      // Mark job as completed
      setBatchJobs(prev => prev.map(j => 
        j.id === job.id ? { 
          ...j, 
          status: 'completed', 
          progress: 100, 
          completedAt: new Date().toISOString() 
        } : j
      ));

      // Console log removed

    } catch (error) {
      console.error('⚙️ BatchProcessing: Batch processing failed', error);
      
      // Mark job as failed
      setBatchJobs(prev => prev.map(j => 
        j.id === job.id ? { 
          ...j, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error'
        } : j
      ));
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, []);

  // Stop batch processing
  const stopBatchProcessing = useCallback(() => {
    // Console log removed

    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }

    setIsProcessing(false);
    setProcessingProgress(0);

    if (currentJob) {
      setBatchJobs(prev => prev.map(j => 
        j.id === currentJob.id ? { ...j, status: 'pending' } : j
      ));
    }

    // Console log removed
  }, [currentJob]);

  // Apply preset
  const applyPreset = useCallback((preset: ProcessingPreset) => {
    // Console log removed

    setSelectedPreset(preset.id);
    setCustomOperations(preset.operations);

    // Console log removed
  }, []);

  // Add custom operation
  const addCustomOperation = useCallback((type: BatchOperation['type']) => {
    // Console log removed

    const operation: BatchOperation = {
      id: `op_${Date.now()}`,
      type,
      parameters: getDefaultParameters(type),
      enabled: true
    };

    setCustomOperations(prev => [...prev, operation]);
    // Console log removed
  }, []);

  // Get default parameters for operation type
  const getDefaultParameters = useCallback((type: BatchOperation['type']): Record<string, any> => {
    switch (type) {
      case 'resize':
        return { width: 800, height: 600, maintainAspectRatio: true };
      case 'format':
        return { format: 'jpeg', quality: 85 };
      case 'filter':
        return { filter: 'blur', intensity: 1 };
      case 'color':
        return { brightness: 0, contrast: 0, saturation: 0 };
      case 'crop':
        return { x: 0, y: 0, width: 400, height: 400 };
      case 'watermark':
        return { text: 'Watermark', opacity: 0.5, position: 'bottom-right' };
      case 'optimize':
        return { quality: 85, format: 'jpeg' };
      default:
        return {};
    }
  }, []);

  // Remove custom operation
  const removeCustomOperation = useCallback((operationId: string) => {
    // Console log removed

    setCustomOperations(prev => prev.filter(op => op.id !== operationId));
    // Console log removed
  }, []);

  // Update operation parameters
  const updateOperationParameters = useCallback((operationId: string, parameters: Record<string, any>) => {
    // Console log removed

    setCustomOperations(prev => prev.map(op => 
      op.id === operationId ? { ...op, parameters: { ...op.parameters, ...parameters } } : op
    ));

    // Console log removed
  }, []);

  // Toggle operation enabled state
  const toggleOperation = useCallback((operationId: string) => {
    // Console log removed

    setCustomOperations(prev => prev.map(op => 
      op.id === operationId ? { ...op, enabled: !op.enabled } : op
    ));

    // Console log removed
  }, []);

  // Handle file selection
  const handleFileSelection = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Console log removed

    const fileNames = Array.from(files).map(file => file.name);
    setSelectedFiles(fileNames);

    // Console log removed
  }, []);

  // Start batch job
  const startBatchJob = useCallback(() => {
    if (selectedFiles.length === 0 || customOperations.length === 0) {
      // Console log removed
      return;
    }

    // Console log removed

    const jobName = selectedPreset ? 
      processingPresets.find(p => p.id === selectedPreset)?.name || 'Custom Batch Job' :
      'Custom Batch Job';

    const job = createBatchJob(jobName, customOperations, selectedFiles);
    startBatchProcessing(job);
  }, [selectedFiles, customOperations, selectedPreset, processingPresets, createBatchJob, startBatchProcessing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
    };
  }, []);

  if (!active) {
    // Console log removed
    return null;
  }

  console.log('⚙️ BatchProcessing: Rendering component', { 
    activeTab,
    batchJobsCount: batchJobs.length,
    isProcessing,
    selectedFilesCount: selectedFiles.length
  });

  return (
    <div className="batch-processing" style={{
      border: '2px solid #F59E0B',
      borderRadius: '8px',
      padding: '12px',
      background: 'rgba(245, 158, 11, 0.1)',
      boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)',
      marginTop: '12px'
    }}>
      <div className="processing-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h4 style={{ margin: 0, color: '#F59E0B', fontSize: '16px' }}>
          ⚙️ Batch Processing & Automation
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => setActiveTab('batch')}
            style={{
              background: activeTab === 'batch' ? '#F59E0B' : '#6B7280',
              color: 'white',
              fontSize: '12px',
              padding: '6px 12px'
            }}
          >
            Batch
          </button>
          <button
            className={`btn ${activeTab === 'automation' ? 'active' : ''}`}
            onClick={() => setActiveTab('automation')}
            style={{
              background: activeTab === 'automation' ? '#F59E0B' : '#6B7280',
              color: 'white',
              fontSize: '12px',
              padding: '6px 12px'
            }}
          >
            Automation
          </button>
          <button
            className={`btn ${activeTab === 'presets' ? 'active' : ''}`}
            onClick={() => setActiveTab('presets')}
            style={{
              background: activeTab === 'presets' ? '#F59E0B' : '#6B7280',
              color: 'white',
              fontSize: '12px',
              padding: '6px 12px'
            }}
          >
            Presets
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
            title="Close Batch Processing"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Batch Processing Tab */}
      {activeTab === 'batch' && (
        <div className="batch-content">
          {/* File Selection */}
          <div className="file-selection" style={{
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }}>
              Select Files
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelection}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #F59E0B',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
            {selectedFiles.length > 0 && (
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                {selectedFiles.length} files selected
              </div>
            )}
          </div>

          {/* Processing Operations */}
          <div className="processing-operations" style={{
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }}>
              Processing Operations
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              marginBottom: '8px'
            }}>
              {[
                { type: 'resize', label: 'Resize', icon: '📏' },
                { type: 'format', label: 'Format', icon: '🔄' },
                { type: 'filter', label: 'Filter', icon: '🎨' },
                { type: 'color', label: 'Color', icon: '🌈' },
                { type: 'crop', label: 'Crop', icon: '✂️' },
                { type: 'watermark', label: 'Watermark', icon: '🏷️' },
                { type: 'optimize', label: 'Optimize', icon: '⚡' }
              ].map(operation => (
                <button
                  key={operation.type}
                  className="btn"
                  onClick={() => addCustomOperation(operation.type as BatchOperation['type'])}
                  style={{
                    fontSize: '10px',
                    padding: '8px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{operation.icon}</span>
                  <span>{operation.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Operations List */}
          {customOperations.length > 0 && (
            <div className="custom-operations" style={{
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }}>
                Custom Operations ({customOperations.length})
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {customOperations.map(operation => (
                  <div
                    key={operation.id}
                    style={{
                      padding: '8px',
                      marginBottom: '4px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      borderRadius: '4px',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={operation.enabled}
                        onChange={() => toggleOperation(operation.id)}
                      />
                      <span style={{ fontSize: '11px', color: '#F59E0B', textTransform: 'capitalize' }}>
                        {operation.type}
                      </span>
                    </div>
                    <button
                      className="btn"
                      onClick={() => removeCustomOperation(operation.id)}
                      style={{
                        background: '#EF4444',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Controls */}
          <div className="processing-controls" style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <button
              className="btn"
              onClick={startBatchJob}
              disabled={selectedFiles.length === 0 || customOperations.length === 0 || isProcessing}
              style={{
                background: isProcessing ? '#6B7280' : '#10B981',
                color: 'white',
                fontSize: '12px',
                padding: '8px 16px',
                flex: 1
              }}
            >
              {isProcessing ? 'Processing...' : 'Start Batch Job'}
            </button>
            <button
              className="btn"
              onClick={stopBatchProcessing}
              disabled={!isProcessing}
              style={{
                background: '#EF4444',
                color: 'white',
                fontSize: '12px',
                padding: '8px 16px',
                flex: 1
              }}
            >
              Stop
            </button>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="processing-progress" style={{
              marginBottom: '12px',
              padding: '8px',
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '4px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '4px' }}>
                Processing... {Math.round(processingProgress)}%
              </div>
              <div style={{
                width: '100%',
                height: '4px',
                background: '#E5E7EB',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${processingProgress}%`,
                  height: '100%',
                  background: '#F59E0B',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}

          {/* Batch Jobs History */}
          {batchJobs.length > 0 && (
            <div className="batch-jobs" style={{
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }}>
                Batch Jobs ({batchJobs.length})
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {batchJobs.map(job => (
                  <div
                    key={job.id}
                    style={{
                      padding: '8px',
                      marginBottom: '4px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      borderRadius: '4px',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      fontSize: '11px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold', color: '#F59E0B' }}>
                        {job.name}
                      </span>
                      <span style={{
                        color: job.status === 'completed' ? '#10B981' : 
                               job.status === 'failed' ? '#EF4444' : 
                               job.status === 'running' ? '#F59E0B' : '#6B7280'
                      }}>
                        {job.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ color: '#6B7280', marginBottom: '4px' }}>
                      {job.inputFiles.length} files • {job.operations.length} operations
                    </div>
                    {job.status === 'running' && (
                      <div style={{
                        width: '100%',
                        height: '2px',
                        background: '#E5E7EB',
                        borderRadius: '1px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${job.progress}%`,
                          height: '100%',
                          background: '#F59E0B',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    )}
                    {job.error && (
                      <div style={{ color: '#EF4444', fontSize: '10px', marginTop: '4px' }}>
                        Error: {job.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Automation Tab */}
      {activeTab === 'automation' && (
        <div className="automation-content">
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }}>
            Automation Rules ({automationRules.length})
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {automationRules.map(rule => (
              <div
                key={rule.id}
                style={{
                  padding: '8px',
                  marginBottom: '4px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '4px',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#F59E0B' }}>
                    {rule.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#6B7280' }}>
                      {rule.runCount} runs
                    </span>
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => {
                        setAutomationRules(prev => prev.map(r => 
                          r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                        ));
                      }}
                    />
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '4px' }}>
                  {rule.description}
                </div>
                <div style={{ fontSize: '9px', color: '#6B7280' }}>
                  Trigger: {rule.trigger} • {rule.conditions.length} conditions • {rule.actions.length} actions
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Presets Tab */}
      {activeTab === 'presets' && (
        <div className="presets-content">
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }}>
            Processing Presets ({processingPresets.length})
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {processingPresets.map(preset => (
              <div
                key={preset.id}
                className="preset-item"
                style={{
                  padding: '8px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '4px',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  cursor: 'pointer'
                }}
                onClick={() => applyPreset(preset)}
              >
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '4px' }}>
                  {preset.name}
                </div>
                <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '4px' }}>
                  {preset.description}
                </div>
                <div style={{ fontSize: '9px', color: '#6B7280', marginBottom: '8px' }}>
                  {preset.category} • {preset.operations.length} operations
                </div>
                <button
                  className="btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    applyPreset(preset);
                  }}
                  style={{
                    background: '#10B981',
                    color: 'white',
                    fontSize: '10px',
                    padding: '4px 8px',
                    width: '100%'
                  }}
                >
                  Use Preset
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center', marginTop: '8px' }}>
        Automate repetitive tasks and process multiple files at once
      </div>
    </div>
  );
}

