import React, { useMemo } from 'react';
import { useApp } from '../App';
import { Environment, Sky, Stars, Cloud, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface BackgroundSceneProps {
  backgroundType: string;
  intensity?: number;
  rotation?: number;
}

export const BackgroundScene: React.FC<BackgroundSceneProps> = ({ 
  backgroundType, 
  intensity = 1, 
  rotation = 0 
}) => {
  const scene = useMemo(() => {
    switch (backgroundType) {
      case 'studio':
        return (
          <>
            {/* Professional studio environment with HDR lighting */}
            <Environment 
              preset="studio" 
              background={false}
              resolution={1024}
              blur={0.1}
            />
            {/* Additional studio lighting for clothing visualization */}
            <ambientLight intensity={0.8 * intensity} />
            <hemisphereLight 
              args={[0xffffff, 0x444444, 0.8 * intensity]} 
              position={[0, 10, 0]}
            />
            {/* Key light - main directional light for clothing details */}
            <directionalLight 
              position={[5, 8, 5]} 
              intensity={2.5 * intensity} 
              castShadow 
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            {/* Fill light - soft light from opposite side */}
            <directionalLight 
              position={[-3, 6, -3]} 
              intensity={1.5 * intensity} 
              color="#fff7e6"
            />
            {/* Rim light - back lighting for separation */}
            <directionalLight 
              position={[0, 4, -8]} 
              intensity={1.2 * intensity} 
              color="#e6f3ff"
            />
            {/* Hair light - top lighting for fine details */}
            <directionalLight 
              position={[0, 12, 0]} 
              intensity={1.0 * intensity} 
              color="#ffffff"
            />
          </>
        );

      case 'outdoor':
        return (
          <>
            {/* Natural outdoor environment with realistic sky */}
            <Sky 
              sunPosition={[1, 0.8, 1]} 
              rayleigh={0.3} 
              turbidity={0.1} 
              mieCoefficient={0.003} 
              mieDirectionalG={0.9}
              distance={450000}
            />
            {/* Natural lighting setup for outdoor clothing photography */}
            <ambientLight intensity={0.8 * intensity} />
            {/* Sun light - main directional light */}
            <directionalLight 
              position={[5, 8, 5]} 
              intensity={3.0 * intensity} 
              castShadow 
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={100}
              shadow-camera-left={-20}
              shadow-camera-right={20}
              shadow-camera-top={20}
              shadow-camera-bottom={-20}
              color="#fff7e6"
            />
            {/* Sky light - soft fill from sky */}
            <hemisphereLight 
              args={[0x87ceeb, 0x444444, 1.0 * intensity]} 
              position={[0, 20, 0]}
            />
            {/* Ground reflection light */}
            <directionalLight 
              position={[0, -5, 0]} 
              intensity={0.8 * intensity} 
              color="#90EE90"
            />
          </>
        );

      case 'indoor':
        return (
          <>
            {/* Warm indoor environment with HDR lighting */}
            <Environment 
              preset="apartment" 
              background={false}
              resolution={1024}
              blur={0.1}
            />
            {/* Indoor lighting setup for lifestyle photography */}
            <ambientLight intensity={0.6 * intensity} />
            {/* Main ceiling light */}
            <pointLight 
              position={[0, 8, 0]} 
              intensity={2.5 * intensity} 
              castShadow 
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              color="#fff7e6"
              distance={20}
              decay={1.5}
            />
            {/* Warm accent lights */}
            <pointLight 
              position={[-4, 6, 0]} 
              intensity={1.5 * intensity} 
              color="#ffaa00" 
              distance={15}
              decay={1.5}
            />
            <pointLight 
              position={[4, 6, 0]} 
              intensity={1.5 * intensity} 
              color="#ffaa00" 
              distance={15}
              decay={1.5}
            />
            {/* Window light simulation */}
            <directionalLight 
              position={[0, 4, 8]} 
              intensity={1.2 * intensity} 
              color="#e6f3ff"
            />
          </>
        );

      case 'night':
        return (
          <>
            {/* Night city environment with atmospheric lighting */}
            <Stars 
              radius={100} 
              depth={50} 
              count={8000} 
              factor={4} 
              saturation={0.1} 
              fade 
              speed={0.5} 
            />
            {/* Night lighting setup for urban fashion */}
            <ambientLight intensity={0.3 * intensity} />
            {/* Moonlight */}
            <directionalLight 
              position={[0, 15, 0]} 
              intensity={1.5 * intensity} 
              color="#4169e1"
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            {/* Street light illumination */}
            <pointLight 
              position={[0, 8, 0]} 
              intensity={1.2 * intensity} 
              color="#ffff00"
              distance={25}
              decay={1.5}
            />
            {/* Neon accent lights */}
            <pointLight 
              position={[-8, 4, 0]} 
              intensity={0.8 * intensity} 
              color="#ff69b4"
              distance={20}
              decay={1.5}
            />
            <pointLight 
              position={[8, 4, 0]} 
              intensity={0.8 * intensity} 
              color="#00ffff"
              distance={20}
              decay={1.5}
            />
          </>
        );

      case 'beach':
        return (
          <>
            {/* Tropical beach environment with golden hour lighting */}
            <Sky 
              sunPosition={[1, 0.6, 1]} 
              rayleigh={0.2} 
              turbidity={0.05} 
              mieCoefficient={0.002} 
              mieDirectionalG={0.95}
              distance={450000}
            />
            {/* Beach lighting setup for summer fashion */}
            <ambientLight intensity={1.0 * intensity} />
            {/* Golden hour sun */}
            <directionalLight 
              position={[8, 10, 8]} 
              intensity={3.5 * intensity} 
              castShadow 
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              color="#fff7e6"
            />
            {/* Sky fill light */}
            <hemisphereLight 
              args={[0x87ceeb, 0x444444, 1.2 * intensity]} 
              position={[0, 20, 0]}
            />
            {/* Sand reflection */}
            <directionalLight 
              position={[0, -3, 0]} 
              intensity={1.0 * intensity} 
              color="#f4a460"
            />
            {/* Ocean reflection */}
            <directionalLight 
              position={[0, 2, -15]} 
              intensity={0.8 * intensity} 
              color="#4169e1"
            />
          </>
        );

      default:
        return (
          <>
            {/* Default professional studio environment */}
            <Environment 
              preset="studio" 
              background={false}
              resolution={1024}
              blur={0.1}
            />
            <ambientLight intensity={0.8 * intensity} />
            <hemisphereLight 
              args={[0xffffff, 0x444444, 0.8 * intensity]} 
              position={[0, 10, 0]}
            />
            <directionalLight 
              position={[5, 8, 5]} 
              intensity={2.5 * intensity} 
              castShadow 
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <directionalLight 
              position={[-3, 6, -3]} 
              intensity={1.5 * intensity} 
              color="#fff7e6"
            />
          </>
        );
    }
  }, [backgroundType, intensity, rotation]);

  return <>{scene}</>;
};
