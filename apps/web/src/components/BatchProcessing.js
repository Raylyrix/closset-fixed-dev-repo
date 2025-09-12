import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../App';
export function BatchProcessing({ active }) {
    // Console log removed
    const { composedCanvas, activeTool, brushColor, brushSize, layers, activeLayerId, commit } = useApp();
    // Batch processing state
    const [batchJobs, setBatchJobs] = useState([]);
    const [currentJob, setCurrentJob] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);
    // Automation state
    const [automationRules, setAutomationRules] = useState([]);
    const [isAutomationEnabled, setIsAutomationEnabled] = useState(false);
    // Processing presets
    const [processingPresets, setProcessingPresets] = useState([
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
    const [activeTab, setActiveTab] = useState('batch');
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [customOperations, setCustomOperations] = useState([]);
    // Refs
    const processingIntervalRef = useRef(null);
    const fileInputRef = useRef(null);
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
        const mockRules = [
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
    const createBatchJob = useCallback((name, operations, files) => {
        // Console log removed
        const job = {
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
    const startBatchProcessing = useCallback(async (job) => {
        // Console log removed
        setIsProcessing(true);
        setCurrentJob(job);
        setProcessingProgress(0);
        // Update job status
        setBatchJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'running' } : j));
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
                    setBatchJobs(prev => prev.map(j => j.id === job.id ? { ...j, progress } : j));
                }
            }
            // Mark job as completed
            setBatchJobs(prev => prev.map(j => j.id === job.id ? {
                ...j,
                status: 'completed',
                progress: 100,
                completedAt: new Date().toISOString()
            } : j));
            // Console log removed
        }
        catch (error) {
            console.error('⚙️ BatchProcessing: Batch processing failed', error);
            // Mark job as failed
            setBatchJobs(prev => prev.map(j => j.id === job.id ? {
                ...j,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            } : j));
        }
        finally {
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
            setBatchJobs(prev => prev.map(j => j.id === currentJob.id ? { ...j, status: 'pending' } : j));
        }
        // Console log removed
    }, [currentJob]);
    // Apply preset
    const applyPreset = useCallback((preset) => {
        // Console log removed
        setSelectedPreset(preset.id);
        setCustomOperations(preset.operations);
        // Console log removed
    }, []);
    // Add custom operation
    const addCustomOperation = useCallback((type) => {
        // Console log removed
        const operation = {
            id: `op_${Date.now()}`,
            type,
            parameters: getDefaultParameters(type),
            enabled: true
        };
        setCustomOperations(prev => [...prev, operation]);
        // Console log removed
    }, []);
    // Get default parameters for operation type
    const getDefaultParameters = useCallback((type) => {
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
    const removeCustomOperation = useCallback((operationId) => {
        // Console log removed
        setCustomOperations(prev => prev.filter(op => op.id !== operationId));
        // Console log removed
    }, []);
    // Update operation parameters
    const updateOperationParameters = useCallback((operationId, parameters) => {
        // Console log removed
        setCustomOperations(prev => prev.map(op => op.id === operationId ? { ...op, parameters: { ...op.parameters, ...parameters } } : op));
        // Console log removed
    }, []);
    // Toggle operation enabled state
    const toggleOperation = useCallback((operationId) => {
        // Console log removed
        setCustomOperations(prev => prev.map(op => op.id === operationId ? { ...op, enabled: !op.enabled } : op));
        // Console log removed
    }, []);
    // Handle file selection
    const handleFileSelection = useCallback((event) => {
        const files = event.target.files;
        if (!files)
            return;
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
    return (_jsxs("div", { className: "batch-processing", style: {
            border: '2px solid #F59E0B',
            borderRadius: '8px',
            padding: '12px',
            background: 'rgba(245, 158, 11, 0.1)',
            boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)',
            marginTop: '12px'
        }, children: [_jsxs("div", { className: "processing-header", style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                }, children: [_jsx("h4", { style: { margin: 0, color: '#F59E0B', fontSize: '16px' }, children: "\u2699\uFE0F Batch Processing & Automation" }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { className: `btn ${activeTab === 'batch' ? 'active' : ''}`, onClick: () => setActiveTab('batch'), style: {
                                    background: activeTab === 'batch' ? '#F59E0B' : '#6B7280',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, children: "Batch" }), _jsx("button", { className: `btn ${activeTab === 'automation' ? 'active' : ''}`, onClick: () => setActiveTab('automation'), style: {
                                    background: activeTab === 'automation' ? '#F59E0B' : '#6B7280',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, children: "Automation" }), _jsx("button", { className: `btn ${activeTab === 'presets' ? 'active' : ''}`, onClick: () => setActiveTab('presets'), style: {
                                    background: activeTab === 'presets' ? '#F59E0B' : '#6B7280',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, children: "Presets" }), _jsx("button", { className: "btn", onClick: () => useApp.getState().setTool('brush'), style: {
                                    background: '#6B7280',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, title: "Close Batch Processing", children: "\u2715 Close" })] })] }), activeTab === 'batch' && (_jsxs("div", { className: "batch-content", children: [_jsxs("div", { className: "file-selection", style: {
                            marginBottom: '12px'
                        }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }, children: "Select Files" }), _jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: "image/*", onChange: handleFileSelection, style: {
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #F59E0B',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                } }), selectedFiles.length > 0 && (_jsxs("div", { style: { fontSize: '11px', color: '#6B7280', marginTop: '4px' }, children: [selectedFiles.length, " files selected"] }))] }), _jsxs("div", { className: "processing-operations", style: {
                            marginBottom: '12px'
                        }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }, children: "Processing Operations" }), _jsx("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '8px',
                                    marginBottom: '8px'
                                }, children: [
                                    { type: 'resize', label: 'Resize', icon: '📏' },
                                    { type: 'format', label: 'Format', icon: '🔄' },
                                    { type: 'filter', label: 'Filter', icon: '🎨' },
                                    { type: 'color', label: 'Color', icon: '🌈' },
                                    { type: 'crop', label: 'Crop', icon: '✂️' },
                                    { type: 'watermark', label: 'Watermark', icon: '🏷️' },
                                    { type: 'optimize', label: 'Optimize', icon: '⚡' }
                                ].map(operation => (_jsxs("button", { className: "btn", onClick: () => addCustomOperation(operation.type), style: {
                                        fontSize: '10px',
                                        padding: '8px 4px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }, children: [_jsx("span", { style: { fontSize: '16px' }, children: operation.icon }), _jsx("span", { children: operation.label })] }, operation.type))) })] }), customOperations.length > 0 && (_jsxs("div", { className: "custom-operations", style: {
                            marginBottom: '12px'
                        }, children: [_jsxs("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }, children: ["Custom Operations (", customOperations.length, ")"] }), _jsx("div", { style: { maxHeight: '200px', overflowY: 'auto' }, children: customOperations.map(operation => (_jsxs("div", { style: {
                                        padding: '8px',
                                        marginBottom: '4px',
                                        background: 'rgba(245, 158, 11, 0.1)',
                                        borderRadius: '4px',
                                        border: '1px solid rgba(245, 158, 11, 0.3)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "checkbox", checked: operation.enabled, onChange: () => toggleOperation(operation.id) }), _jsx("span", { style: { fontSize: '11px', color: '#F59E0B', textTransform: 'capitalize' }, children: operation.type })] }), _jsx("button", { className: "btn", onClick: () => removeCustomOperation(operation.id), style: {
                                                background: '#EF4444',
                                                color: 'white',
                                                fontSize: '10px',
                                                padding: '2px 6px'
                                            }, children: "\u00D7" })] }, operation.id))) })] })), _jsxs("div", { className: "processing-controls", style: {
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '12px'
                        }, children: [_jsx("button", { className: "btn", onClick: startBatchJob, disabled: selectedFiles.length === 0 || customOperations.length === 0 || isProcessing, style: {
                                    background: isProcessing ? '#6B7280' : '#10B981',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '8px 16px',
                                    flex: 1
                                }, children: isProcessing ? 'Processing...' : 'Start Batch Job' }), _jsx("button", { className: "btn", onClick: stopBatchProcessing, disabled: !isProcessing, style: {
                                    background: '#EF4444',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '8px 16px',
                                    flex: 1
                                }, children: "Stop" })] }), isProcessing && (_jsxs("div", { className: "processing-progress", style: {
                            marginBottom: '12px',
                            padding: '8px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: '4px'
                        }, children: [_jsxs("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '4px' }, children: ["Processing... ", Math.round(processingProgress), "%"] }), _jsx("div", { style: {
                                    width: '100%',
                                    height: '4px',
                                    background: '#E5E7EB',
                                    borderRadius: '2px',
                                    overflow: 'hidden'
                                }, children: _jsx("div", { style: {
                                        width: `${processingProgress}%`,
                                        height: '100%',
                                        background: '#F59E0B',
                                        transition: 'width 0.3s ease'
                                    } }) })] })), batchJobs.length > 0 && (_jsxs("div", { className: "batch-jobs", style: {
                            marginBottom: '12px'
                        }, children: [_jsxs("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }, children: ["Batch Jobs (", batchJobs.length, ")"] }), _jsx("div", { style: { maxHeight: '200px', overflowY: 'auto' }, children: batchJobs.map(job => (_jsxs("div", { style: {
                                        padding: '8px',
                                        marginBottom: '4px',
                                        background: 'rgba(245, 158, 11, 0.1)',
                                        borderRadius: '4px',
                                        border: '1px solid rgba(245, 158, 11, 0.3)',
                                        fontSize: '11px'
                                    }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }, children: [_jsx("span", { style: { fontWeight: 'bold', color: '#F59E0B' }, children: job.name }), _jsx("span", { style: {
                                                        color: job.status === 'completed' ? '#10B981' :
                                                            job.status === 'failed' ? '#EF4444' :
                                                                job.status === 'running' ? '#F59E0B' : '#6B7280'
                                                    }, children: job.status.toUpperCase() })] }), _jsxs("div", { style: { color: '#6B7280', marginBottom: '4px' }, children: [job.inputFiles.length, " files \u2022 ", job.operations.length, " operations"] }), job.status === 'running' && (_jsx("div", { style: {
                                                width: '100%',
                                                height: '2px',
                                                background: '#E5E7EB',
                                                borderRadius: '1px',
                                                overflow: 'hidden'
                                            }, children: _jsx("div", { style: {
                                                    width: `${job.progress}%`,
                                                    height: '100%',
                                                    background: '#F59E0B',
                                                    transition: 'width 0.3s ease'
                                                } }) })), job.error && (_jsxs("div", { style: { color: '#EF4444', fontSize: '10px', marginTop: '4px' }, children: ["Error: ", job.error] }))] }, job.id))) })] }))] })), activeTab === 'automation' && (_jsxs("div", { className: "automation-content", children: [_jsxs("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }, children: ["Automation Rules (", automationRules.length, ")"] }), _jsx("div", { style: { maxHeight: '300px', overflowY: 'auto' }, children: automationRules.map(rule => (_jsxs("div", { style: {
                                padding: '8px',
                                marginBottom: '4px',
                                background: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '4px',
                                border: '1px solid rgba(245, 158, 11, 0.3)'
                            }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }, children: [_jsx("span", { style: { fontSize: '11px', fontWeight: 'bold', color: '#F59E0B' }, children: rule.name }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsxs("span", { style: { fontSize: '10px', color: '#6B7280' }, children: [rule.runCount, " runs"] }), _jsx("input", { type: "checkbox", checked: rule.enabled, onChange: () => {
                                                        setAutomationRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r));
                                                    } })] })] }), _jsx("div", { style: { fontSize: '10px', color: '#6B7280', marginBottom: '4px' }, children: rule.description }), _jsxs("div", { style: { fontSize: '9px', color: '#6B7280' }, children: ["Trigger: ", rule.trigger, " \u2022 ", rule.conditions.length, " conditions \u2022 ", rule.actions.length, " actions"] })] }, rule.id))) })] })), activeTab === 'presets' && (_jsxs("div", { className: "presets-content", children: [_jsxs("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }, children: ["Processing Presets (", processingPresets.length, ")"] }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '12px',
                            maxHeight: '300px',
                            overflowY: 'auto'
                        }, children: processingPresets.map(preset => (_jsxs("div", { className: "preset-item", style: {
                                padding: '8px',
                                background: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '4px',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                cursor: 'pointer'
                            }, onClick: () => applyPreset(preset), children: [_jsx("div", { style: { fontSize: '11px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '4px' }, children: preset.name }), _jsx("div", { style: { fontSize: '10px', color: '#6B7280', marginBottom: '4px' }, children: preset.description }), _jsxs("div", { style: { fontSize: '9px', color: '#6B7280', marginBottom: '8px' }, children: [preset.category, " \u2022 ", preset.operations.length, " operations"] }), _jsx("button", { className: "btn", onClick: (e) => {
                                        e.stopPropagation();
                                        applyPreset(preset);
                                    }, style: {
                                        background: '#10B981',
                                        color: 'white',
                                        fontSize: '10px',
                                        padding: '4px 8px',
                                        width: '100%'
                                    }, children: "Use Preset" })] }, preset.id))) })] })), _jsx("div", { style: { fontSize: '12px', color: '#6B7280', textAlign: 'center', marginTop: '8px' }, children: "Automate repetitive tasks and process multiple files at once" })] }));
}
