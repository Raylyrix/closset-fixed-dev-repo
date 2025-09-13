/**
 * 🎯 Shirt Renderer Component
 *
 * Handles the core rendering logic for the 3D shirt model
 * Extracted from the massive Shirt.js file for better maintainability
 */
import { useRef, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useApp } from '../../App';
export const ShirtRenderer = ({ modelUrl, modelChoice, modelType, modelScale, modelPosition, modelRotation, onModelLoaded, onModelError }) => {
    const { scene } = useThree();
    const modelRef = useRef(null);
    const loaderRef = useRef(null);
    // Initialize loader
    useEffect(() => {
        if (!loaderRef.current) {
            loaderRef.current = new THREE.GLTFLoader();
        }
    }, []);
    // Load model
    const loadModel = useCallback(async () => {
        if (!loaderRef.current)
            return;
        try {
            console.log('🔄 Loading 3D model:', modelUrl);
            const gltf = await loaderRef.current.loadAsync(modelUrl);
            const model = gltf.scene;
            // Apply transformations
            model.scale.setScalar(modelScale);
            model.position.set(...modelPosition);
            model.rotation.set(...modelRotation);
            // Add to scene
            if (modelRef.current) {
                scene.remove(modelRef.current);
            }
            scene.add(model);
            modelRef.current = model;
            // Update app state
            useApp.getState().setModelScene(true);
            console.log('✅ Model loaded successfully');
            onModelLoaded?.(model);
        }
        catch (error) {
            console.error('❌ Error loading model:', error);
            onModelError?.(error);
        }
    }, [modelUrl, modelScale, modelPosition, modelRotation, scene, onModelLoaded, onModelError]);
    // Load model when dependencies change
    useEffect(() => {
        if (modelUrl) {
            loadModel();
        }
    }, [modelUrl, loadModel]);
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (modelRef.current) {
                scene.remove(modelRef.current);
            }
        };
    }, [scene]);
    return null; // This component only handles 3D model rendering
};
export default ShirtRenderer;
