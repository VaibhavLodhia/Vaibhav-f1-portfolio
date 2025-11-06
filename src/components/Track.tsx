import { useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { useGLTF, useTexture } from '@react-three/drei';
import { ErrorBoundary } from './ErrorBoundary';

function TrackModel() {
  const trackRef = useRef<THREE.Group>(null);
  
  // Load 3D track model - useGLTF might not support .g3d format
  const { scene } = useGLTF('/assets/models/model.g3d');
  const trackModel = scene.clone();

  // Configure track model materials
  useEffect(() => {
    trackModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.roughness = 0.7;
          child.material.metalness = 0.2;
        }
      }
    });
  }, [trackModel]);

  return (
    <group ref={trackRef}>
      <primitive object={trackModel} position={[0, -0.5, -375]} />
    </group>
  );
}

function TrackFallback() {
  const trackTexture = useTexture('/assets/track.jpg');
  
  useEffect(() => {
    trackTexture.wrapS = THREE.RepeatWrapping;
    trackTexture.wrapT = THREE.RepeatWrapping;
    trackTexture.repeat.set(1, 800 / 12);
    trackTexture.flipY = false;
  }, [trackTexture]);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, -375]}
      receiveShadow
    >
      <planeGeometry args={[12, 800]} />
      <meshStandardMaterial map={trackTexture} roughness={0.7} metalness={0.2} />
    </mesh>
  );
}

export default function Track() {
  return (
    <>
      <ErrorBoundary fallback={<TrackFallback />}>
        <Suspense fallback={<TrackFallback />}>
          <TrackModel />
        </Suspense>
      </ErrorBoundary>

      {/* Lane markings - always render on top */}
      {/* Left edge white line - at X = -6 - EXTENDED FOR LONGER TRACK */}
      {Array.from({ length: 800 }).map((_, i) => (
        <mesh
          key={`left-edge-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-6, -0.475, -775 + i * 1]}
          receiveShadow
        >
          <planeGeometry args={[0.2, 1.2]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
      ))}
      
      {/* Left lane divider - YELLOW line at X = -3 - EXTENDED FOR LONGER TRACK */}
      {Array.from({ length: 800 }).map((_, i) => (
        <mesh
          key={`left-divider-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-3, -0.475, -775 + i * 1]}
          receiveShadow
        >
          <planeGeometry args={[0.2, 1.2]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.8} />
        </mesh>
      ))}
      
      {/* Right lane divider - YELLOW line at X = 3 - EXTENDED FOR LONGER TRACK */}
      {Array.from({ length: 800 }).map((_, i) => (
        <mesh
          key={`right-divider-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[3, -0.475, -775 + i * 1]}
          receiveShadow
        >
          <planeGeometry args={[0.2, 1.2]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.8} />
        </mesh>
      ))}
      
      {/* Right edge white line - at X = 6 - EXTENDED FOR LONGER TRACK */}
      {Array.from({ length: 800 }).map((_, i) => (
        <mesh
          key={`right-edge-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[6, -0.475, -775 + i * 1]}
          receiveShadow
        >
          <planeGeometry args={[0.2, 1.2]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </>
  );
}

// Barriers removed - user requested removal

