import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, useTexture } from '@react-three/drei';
import { useStore } from '../store/useStore';
import Car from './Car';
import Checkpoints from './Checkpoints';
import Track from './Track';
import FinishLine from './FinishLine';
import NPCF1Cars from './NPCF1Cars';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useThree } from '@react-three/fiber';

function PanoramaSkybox() {
  const panoramaTexture = useTexture('/assets/panorama-green.webp');
  const { scene } = useThree();
  
  useEffect(() => {
    if (panoramaTexture && scene) {
      // Set panorama as scene background - Three.js automatically maps equirectangular textures
      panoramaTexture.mapping = THREE.EquirectangularReflectionMapping;
      // Rotate panorama 90 degrees anti-clockwise by adjusting offset
      // 90° = 0.25 of full rotation (360° = 1.0)
      panoramaTexture.offset.x = 0.25; // Rotate 90° anti-clockwise
      scene.background = panoramaTexture;
      scene.environment = panoramaTexture; // Also use for reflections
    }
  }, [panoramaTexture, scene]);
  
  return null;
}

function SceneContent() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const helmetCameraRef = useRef<THREE.Object3D>(null);
  const { phase, setPhase, setCameraMode } = useStore();

  // Skip intro animation - go straight to driving with stable camera
  useEffect(() => {
    if (phase === 'intro') {
      setPhase('driving');
      setCameraMode('follow');
    }
  }, [phase, setPhase, setCameraMode]);

  // Stable follow camera - follows car INSTANTLY with no lag for seamless lane changes
  useFrame(() => {
    if (!cameraRef.current) return;
    
    const { carPosition } = useStore.getState();
    const [carX, carY, carZ] = carPosition;
    
    // Camera follows car from behind at fixed offset - closer to see wing
    const cameraOffsetX = 0; // Camera stays centered behind car
    const cameraOffsetY = 2.5; // Height above car - slightly lower
    const cameraOffsetZ = 4; // Distance behind car - closer to see wing
    
    // INSTANT camera follow - matches car's instant lane change (no interpolation lag)
    cameraRef.current.position.set(
      carX + cameraOffsetX,
      carY + cameraOffsetY,
      carZ + cameraOffsetZ
    );
    
    // Camera looks at the car (always centered on car) - seamless view
    cameraRef.current.lookAt(carX, carY + 1, carZ);
  });

  return (
    <>
      {/* Main camera - stable follow camera */}
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={75}
        position={[0, 5, 10]}
      />

      {/* Lighting */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 20, 5]} intensity={2} castShadow />
      <directionalLight position={[-10, 10, -10]} intensity={0.8} />
      <pointLight position={[0, 15, 0]} intensity={0.5} />
      <spotLight
        position={[0, 30, 0]}
        angle={0.5}
        penumbra={1}
        intensity={1.5}
        castShadow
      />

      {/* Panorama Skybox Background */}
      <Suspense fallback={null}>
        <PanoramaSkybox />
      </Suspense>

      {/* Track - full_track.png includes track + background */}
      <Suspense fallback={null}>
        <Track />
        <FinishLine />
      </Suspense>

      {/* Car */}
      <Suspense fallback={null}>
        <Car helmetCameraRef={helmetCameraRef} />
      </Suspense>

      {/* NPC Cars */}
      <Suspense fallback={null}>
        <NPCF1Cars />
      </Suspense>

      {/* Checkpoints */}
      <Checkpoints />

      {/* Grandstands removed - user requested removal */}
    </>
  );
}

function Grandstands() {
  // Procedural placeholder grandstands
  return (
    <>
      {/* Left grandstand - extended */}
      <group position={[-15, 0, -125]}>
        {Array.from({ length: 60 }).map((_, i) => (
          <mesh key={i} position={[0, 1 + i * 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[30, 0.5, 1]} />
            <meshStandardMaterial color="#2a2a3e" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        {/* Animated crowd figures */}
        {Array.from({ length: 300 }).map((_, i) => (
          <mesh 
            key={`crowd-left-${i}`} 
            position={[
              -10 + (i % 10) * 2,
              2 + Math.floor(i / 10) * 0.6,
              -125 + (i % 30) * 10
            ]} 
            castShadow
          >
            <capsuleGeometry args={[0.1, 0.3, 4, 4]} />
            <meshStandardMaterial color={`hsl(${Math.random() * 60 + 180}, 70%, 50%)`} />
          </mesh>
        ))}
      </group>

      {/* Right grandstand - extended */}
      <group position={[15, 0, -125]}>
        {Array.from({ length: 60 }).map((_, i) => (
          <mesh key={i} position={[0, 1 + i * 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[30, 0.5, 1]} />
            <meshStandardMaterial color="#2a2a3e" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        {/* Animated crowd figures */}
        {Array.from({ length: 300 }).map((_, i) => (
          <mesh 
            key={`crowd-right-${i}`} 
            position={[
              10 + (i % 10) * 2,
              2 + Math.floor(i / 10) * 0.6,
              -125 + (i % 30) * 10
            ]} 
            castShadow
          >
            <capsuleGeometry args={[0.1, 0.3, 4, 4]} />
            <meshStandardMaterial color={`hsl(${Math.random() * 60 + 180}, 70%, 50%)`} />
          </mesh>
        ))}
      </group>

      {/* Finish line grandstand */}
      <group position={[0, 0, -250]}>
        {Array.from({ length: 30 }).map((_, i) => (
          <mesh key={i} position={[0, 1 + i * 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[40, 0.5, 1]} />
            <meshStandardMaterial color="#3a2a4e" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function F1Scene() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}

