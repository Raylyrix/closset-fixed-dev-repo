import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../App';
export function AnimationTools({ active }) {
    // Console log removed
    const { composedCanvas, activeTool, brushColor, brushSize, layers, activeLayerId, commit } = useApp();
    // Animation state
    const [animations, setAnimations] = useState([]);
    const [currentAnimation, setCurrentAnimation] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingFrames, setRecordingFrames] = useState([]);
    // Timeline state
    const [timelineZoom, setTimelineZoom] = useState(1);
    const [selectedKeyframes, setSelectedKeyframes] = useState([]);
    const [playheadPosition, setPlayheadPosition] = useState(0);
    // Animation presets
    const [animationPresets, setAnimationPresets] = useState([
        {
            id: 'fade_in',
            name: 'Fade In',
            description: 'Smooth fade in effect',
            category: 'Basic',
            keyframes: [
                { id: 'kf1', timestamp: 0, properties: { opacity: 0 }, easing: 'ease-out' },
                { id: 'kf2', timestamp: 1000, properties: { opacity: 1 }, easing: 'ease-out' }
            ],
            duration: 1000
        },
        {
            id: 'slide_in',
            name: 'Slide In',
            description: 'Slide in from left',
            category: 'Basic',
            keyframes: [
                { id: 'kf1', timestamp: 0, properties: { x: -100, opacity: 0 }, easing: 'ease-out' },
                { id: 'kf2', timestamp: 1000, properties: { x: 0, opacity: 1 }, easing: 'ease-out' }
            ],
            duration: 1000
        },
        {
            id: 'scale_bounce',
            name: 'Scale Bounce',
            description: 'Bouncy scale animation',
            category: 'Bounce',
            keyframes: [
                { id: 'kf1', timestamp: 0, properties: { scale: 0 }, easing: 'ease-out' },
                { id: 'kf2', timestamp: 500, properties: { scale: 1.2 }, easing: 'ease-out' },
                { id: 'kf3', timestamp: 1000, properties: { scale: 1 }, easing: 'ease-out' }
            ],
            duration: 1000
        },
        {
            id: 'rotation',
            name: 'Rotation',
            description: 'Continuous rotation',
            category: 'Advanced',
            keyframes: [
                { id: 'kf1', timestamp: 0, properties: { rotation: 0 }, easing: 'linear' },
                { id: 'kf2', timestamp: 2000, properties: { rotation: 360 }, easing: 'linear' }
            ],
            duration: 2000
        }
    ]);
    // Refs
    const animationCanvasRef = useRef(null);
    const timelineCanvasRef = useRef(null);
    const animationIntervalRef = useRef(null);
    const recordingIntervalRef = useRef(null);
    // Initialize animation canvas
    useEffect(() => {
        if (!active || !composedCanvas) {
            // Console log removed
            return;
        }
        console.log('🎬 AnimationTools: Initializing animation canvas', {
            composedCanvasSize: `${composedCanvas.width}x${composedCanvas.height}`
        });
        // Create animation canvas
        const animationCanvas = document.createElement('canvas');
        animationCanvas.width = composedCanvas.width;
        animationCanvas.height = composedCanvas.height;
        animationCanvasRef.current = animationCanvas;
        // Create timeline canvas
        const timelineCanvas = document.createElement('canvas');
        timelineCanvas.width = 800;
        timelineCanvas.height = 200;
        timelineCanvasRef.current = timelineCanvas;
        // Console log removed
    }, [active, composedCanvas]);
    // Create new animation
    const createAnimation = useCallback((name, fps = 30) => {
        // Console log removed
        const newAnimation = {
            id: `anim_${Date.now()}`,
            name,
            frames: [],
            duration: 0,
            fps,
            loop: true,
            width: composedCanvas?.width || 400,
            height: composedCanvas?.height || 400
        };
        setAnimations(prev => [...prev, newAnimation]);
        setCurrentAnimation(newAnimation);
        // Console log removed
        return newAnimation;
    }, [composedCanvas]);
    // Add frame to animation
    const addFrame = useCallback((animation, canvas, duration = 100) => {
        // Console log removed
        const frame = {
            id: `frame_${Date.now()}`,
            timestamp: animation.duration,
            canvas: canvas,
            duration
        };
        const updatedAnimation = {
            ...animation,
            frames: [...animation.frames, frame],
            duration: animation.duration + duration
        };
        setAnimations(prev => prev.map(a => a.id === animation.id ? updatedAnimation : a));
        if (currentAnimation?.id === animation.id) {
            setCurrentAnimation(updatedAnimation);
        }
        // Console log removed
    }, [currentAnimation]);
    // Play animation
    const playAnimation = useCallback(() => {
        if (!currentAnimation || currentAnimation.frames.length === 0) {
            // Console log removed
            return;
        }
        console.log('🎬 AnimationTools: Starting animation playback', {
            animationId: currentAnimation.id,
            frameCount: currentAnimation.frames.length
        });
        setIsPlaying(true);
        setCurrentFrame(0);
        const frameDuration = 1000 / currentAnimation.fps / playbackSpeed;
        let frameIndex = 0;
        animationIntervalRef.current = setInterval(() => {
            if (frameIndex >= currentAnimation.frames.length) {
                if (currentAnimation.loop) {
                    frameIndex = 0;
                }
                else {
                    stopAnimation();
                    return;
                }
            }
            setCurrentFrame(frameIndex);
            setPlayheadPosition((frameIndex / currentAnimation.frames.length) * 100);
            // Render current frame
            if (animationCanvasRef.current && currentAnimation.frames[frameIndex]) {
                const ctx = animationCanvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, animationCanvasRef.current.width, animationCanvasRef.current.height);
                ctx.drawImage(currentAnimation.frames[frameIndex].canvas, 0, 0);
            }
            frameIndex++;
        }, frameDuration);
        // Console log removed
    }, [currentAnimation, playbackSpeed]);
    // Stop animation
    const stopAnimation = useCallback(() => {
        // Console log removed
        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current);
            animationIntervalRef.current = null;
        }
        setIsPlaying(false);
        setCurrentFrame(0);
        setPlayheadPosition(0);
        // Console log removed
    }, []);
    // Pause animation
    const pauseAnimation = useCallback(() => {
        // Console log removed
        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current);
            animationIntervalRef.current = null;
        }
        setIsPlaying(false);
        // Console log removed
    }, []);
    // Start recording
    const startRecording = useCallback(() => {
        if (!composedCanvas || !currentAnimation) {
            // Console log removed
            return;
        }
        // Console log removed
        setIsRecording(true);
        setRecordingFrames([]);
        const frameDuration = 1000 / currentAnimation.fps;
        let frameCount = 0;
        recordingIntervalRef.current = setInterval(() => {
            // Capture current canvas state
            const frameCanvas = document.createElement('canvas');
            frameCanvas.width = composedCanvas.width;
            frameCanvas.height = composedCanvas.height;
            const frameCtx = frameCanvas.getContext('2d');
            frameCtx.drawImage(composedCanvas, 0, 0);
            const frame = {
                id: `rec_frame_${Date.now()}`,
                timestamp: frameCount * frameDuration,
                canvas: frameCanvas,
                duration: frameDuration
            };
            setRecordingFrames(prev => [...prev, frame]);
            frameCount++;
            // Console log removed
        }, frameDuration);
        // Console log removed
    }, [composedCanvas, currentAnimation]);
    // Stop recording
    const stopRecording = useCallback(() => {
        // Console log removed
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
        setIsRecording(false);
        // Add recorded frames to current animation
        if (currentAnimation && recordingFrames.length > 0) {
            const updatedAnimation = {
                ...currentAnimation,
                frames: [...currentAnimation.frames, ...recordingFrames],
                duration: currentAnimation.duration + recordingFrames.reduce((sum, frame) => sum + frame.duration, 0)
            };
            setAnimations(prev => prev.map(a => a.id === currentAnimation.id ? updatedAnimation : a));
            setCurrentAnimation(updatedAnimation);
        }
        setRecordingFrames([]);
        // Console log removed
    }, [currentAnimation, recordingFrames]);
    // Apply animation preset
    const applyAnimationPreset = useCallback((preset) => {
        if (!currentAnimation || !composedCanvas) {
            // Console log removed
            return;
        }
        // Console log removed
        // Create frames based on preset keyframes
        const frames = [];
        const frameCount = Math.ceil(preset.duration / (1000 / currentAnimation.fps));
        for (let i = 0; i < frameCount; i++) {
            const progress = i / (frameCount - 1);
            const timestamp = progress * preset.duration;
            // Find keyframes for interpolation
            const keyframe1 = preset.keyframes.find(kf => kf.timestamp <= timestamp);
            const keyframe2 = preset.keyframes.find(kf => kf.timestamp >= timestamp);
            if (keyframe1 && keyframe2) {
                // Interpolate between keyframes
                const t = (timestamp - keyframe1.timestamp) / (keyframe2.timestamp - keyframe1.timestamp);
                const properties = interpolateProperties(keyframe1.properties, keyframe2.properties, t);
                // Create frame with interpolated properties
                const frameCanvas = document.createElement('canvas');
                frameCanvas.width = composedCanvas.width;
                frameCanvas.height = composedCanvas.height;
                const frameCtx = frameCanvas.getContext('2d');
                // Apply transformations
                frameCtx.save();
                frameCtx.translate(properties.x, properties.y);
                frameCtx.scale(properties.scale, properties.scale);
                frameCtx.rotate(properties.rotation * Math.PI / 180);
                frameCtx.globalAlpha = properties.opacity;
                frameCtx.drawImage(composedCanvas, 0, 0);
                frameCtx.restore();
                frames.push({
                    id: `preset_frame_${i}`,
                    timestamp,
                    canvas: frameCanvas,
                    duration: 1000 / currentAnimation.fps
                });
            }
        }
        // Add frames to animation
        const updatedAnimation = {
            ...currentAnimation,
            frames: [...currentAnimation.frames, ...frames],
            duration: currentAnimation.duration + preset.duration
        };
        setAnimations(prev => prev.map(a => a.id === currentAnimation.id ? updatedAnimation : a));
        setCurrentAnimation(updatedAnimation);
        // Console log removed
    }, [currentAnimation, composedCanvas]);
    // Interpolate properties between keyframes
    const interpolateProperties = useCallback((props1, props2, t) => {
        const result = {};
        for (const key in props1) {
            if (typeof props1[key] === 'number') {
                result[key] = props1[key] + (props2[key] - props1[key]) * t;
            }
            else {
                result[key] = props1[key];
            }
        }
        return result;
    }, []);
    // Export animation
    const exportAnimation = useCallback((animation, format = 'gif') => {
        // Console log removed
        // In a real implementation, this would use a library like gif.js or ffmpeg
        // For now, we'll create a simple frame sequence
        const frames = animation.frames.map(frame => frame.canvas.toDataURL('image/png'));
        // Console log removed
        // In real implementation, this would trigger download
    }, []);
    // Render timeline
    const renderTimeline = useCallback(() => {
        if (!timelineCanvasRef.current || !currentAnimation)
            return;
        // Console log removed
        const canvas = timelineCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        // Draw timeline background
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(0, 0, width, height);
        // Draw frame markers
        const frameWidth = width / currentAnimation.frames.length;
        currentAnimation.frames.forEach((frame, index) => {
            const x = index * frameWidth;
            // Frame marker
            ctx.fillStyle = index === currentFrame ? '#3B82F6' : '#6B7280';
            ctx.fillRect(x, 0, frameWidth, height);
            // Frame number
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(index.toString(), x + frameWidth / 2, height - 5);
        });
        // Draw playhead
        const playheadX = (playheadPosition / 100) * width;
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, height);
        ctx.stroke();
        // Console log removed
    }, [currentAnimation, currentFrame, playheadPosition]);
    // Render timeline when it changes
    useEffect(() => {
        renderTimeline();
    }, [renderTimeline]);
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationIntervalRef.current) {
                clearInterval(animationIntervalRef.current);
            }
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        };
    }, []);
    if (!active) {
        // Console log removed
        return null;
    }
    console.log('🎬 AnimationTools: Rendering component', {
        animationsCount: animations.length,
        currentAnimation: currentAnimation?.name,
        isPlaying,
        isRecording
    });
    return (_jsxs("div", { className: "animation-tools", style: {
            border: '2px solid #8B5CF6',
            borderRadius: '8px',
            padding: '12px',
            background: 'rgba(139, 92, 246, 0.1)',
            boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
            marginTop: '12px'
        }, children: [_jsxs("div", { className: "animation-header", style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                }, children: [_jsx("h4", { style: { margin: 0, color: '#8B5CF6', fontSize: '16px' }, children: "\uD83C\uDFAC Animation Tools" }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { className: "btn", onClick: isPlaying ? pauseAnimation : playAnimation, disabled: !currentAnimation || currentAnimation.frames.length === 0, style: {
                                    background: isPlaying ? '#EF4444' : '#10B981',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, children: isPlaying ? 'Pause' : 'Play' }), _jsx("button", { className: "btn", onClick: stopAnimation, disabled: !isPlaying, style: {
                                    background: '#6B7280',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, children: "Stop" }), _jsx("button", { className: "btn", onClick: () => useApp.getState().setTool('brush'), style: {
                                    background: '#6B7280',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '6px 12px'
                                }, title: "Close Animation Tools", children: "\u2715 Close" })] })] }), _jsxs("div", { className: "animation-controls", style: {
                    marginBottom: '12px'
                }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6', marginBottom: '8px' }, children: "Animation Controls" }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px'
                        }, children: [_jsx("button", { className: "btn", onClick: () => {
                                    const name = prompt('Animation name:');
                                    if (name)
                                        createAnimation(name);
                                }, style: {
                                    background: '#10B981',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '8px 16px'
                                }, children: "New Animation" }), _jsx("button", { className: "btn", onClick: isRecording ? stopRecording : startRecording, disabled: !currentAnimation, style: {
                                    background: isRecording ? '#EF4444' : '#F59E0B',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '8px 16px'
                                }, children: isRecording ? 'Stop Recording' : 'Start Recording' })] })] }), _jsxs("div", { className: "animation-presets", style: {
                    marginBottom: '12px'
                }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6', marginBottom: '8px' }, children: "Animation Presets" }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '8px'
                        }, children: animationPresets.map(preset => (_jsxs("button", { className: "btn", onClick: () => applyAnimationPreset(preset), disabled: !currentAnimation, style: {
                                fontSize: '10px',
                                padding: '8px 4px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px'
                            }, children: [_jsx("span", { style: { fontSize: '16px' }, children: "\uD83C\uDFAC" }), _jsx("span", { children: preset.name })] }, preset.id))) })] }), _jsxs("div", { className: "playback-controls", style: {
                    marginBottom: '12px'
                }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6', marginBottom: '8px' }, children: "Playback Controls" }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px'
                        }, children: [_jsxs("div", { children: [_jsxs("label", { style: { fontSize: '10px', color: '#8B5CF6' }, children: ["Speed: ", playbackSpeed, "x"] }), _jsx("input", { type: "range", min: "0.25", max: "4", step: "0.25", value: playbackSpeed, onChange: (e) => setPlaybackSpeed(parseFloat(e.target.value)), style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { fontSize: '10px', color: '#8B5CF6' }, children: ["Frame: ", currentFrame, " / ", currentAnimation?.frames.length || 0] }), _jsx("input", { type: "range", min: "0", max: currentAnimation?.frames.length ? currentAnimation.frames.length - 1 : 0, value: currentFrame, onChange: (e) => setCurrentFrame(parseInt(e.target.value)), style: { width: '100%' } })] })] })] }), currentAnimation && (_jsxs("div", { className: "timeline", style: {
                    marginBottom: '12px'
                }, children: [_jsxs("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6', marginBottom: '8px' }, children: ["Timeline - ", currentAnimation.name] }), _jsx("canvas", { ref: timelineCanvasRef, width: 800, height: 200, style: {
                            width: '100%',
                            height: '100px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px'
                        } })] })), currentAnimation && currentAnimation.frames.length > 0 && (_jsxs("div", { className: "animation-preview", style: {
                    border: '1px solid #8B5CF6',
                    borderRadius: '4px',
                    padding: '8px',
                    background: 'white',
                    marginBottom: '12px'
                }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6', marginBottom: '8px' }, children: "Animation Preview" }), _jsx("canvas", { ref: animationCanvasRef, width: currentAnimation.width, height: currentAnimation.height, style: {
                            width: '100%',
                            height: 'auto',
                            maxWidth: '300px',
                            border: '1px solid #E5E7EB'
                        } })] })), _jsxs("div", { className: "export-options", style: {
                    marginBottom: '12px'
                }, children: [_jsx("div", { style: { fontSize: '12px', fontWeight: 'bold', color: '#8B5CF6', marginBottom: '8px' }, children: "Export Options" }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { className: "btn", onClick: () => currentAnimation && exportAnimation(currentAnimation, 'gif'), disabled: !currentAnimation || currentAnimation.frames.length === 0, style: {
                                    background: '#10B981',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '8px 16px',
                                    flex: 1
                                }, children: "Export GIF" }), _jsx("button", { className: "btn", onClick: () => currentAnimation && exportAnimation(currentAnimation, 'mp4'), disabled: !currentAnimation || currentAnimation.frames.length === 0, style: {
                                    background: '#8B5CF6',
                                    color: 'white',
                                    fontSize: '12px',
                                    padding: '8px 16px',
                                    flex: 1
                                }, children: "Export MP4" })] })] }), _jsx("div", { style: { fontSize: '12px', color: '#6B7280', textAlign: 'center' }, children: "Create and animate your designs with professional motion graphics tools" })] }));
}
