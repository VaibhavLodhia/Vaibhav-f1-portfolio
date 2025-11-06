import { useRef, Suspense, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { ErrorBoundary } from './ErrorBoundary';

function AcceleratorModel() {
  const { scene } = useGLTF('/assets/models/accelerate.glb');
  const modelRef = useRef<THREE.Group>(null);
  const { acceleratorPressed } = useStore();

  // Clone the scene once to avoid modifying the original
  const modelClone = useMemo(() => {
    if (!scene) {
      console.error('❌ Scene is null!');
      return null;
    }
    
    try {
      const cloned = scene.clone();
      console.log('✅ Accelerator model loaded! Scene:', scene, 'Cloned:', cloned);
      
      // Calculate bounding box to auto-scale
      const box = new THREE.Box3().setFromObject(cloned);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      
      if (maxDim > 0) {
        const scale = 1.5 / maxDim; // Scale to fit in ~1.5 unit space
        cloned.scale.setScalar(scale);
        console.log('📏 Model size:', size, 'Scale:', scale);
        
        // Center the model
        const center = box.getCenter(new THREE.Vector3());
        cloned.position.sub(center);
      } else {
        console.warn('⚠️ Model has zero size, using default scale');
        cloned.scale.setScalar(1);
      }
      
      return cloned;
    } catch (error) {
      console.error('❌ Error cloning model:', error);
      return null;
    }
  }, [scene]);

  // Apply materials to the model
  useEffect(() => {
    if (!modelClone) return;
    
    modelClone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.metalness = 0.9;
          child.material.roughness = 0.1;
          child.material.envMapIntensity = 1.5;
        }
      }
    });
    console.log('🎨 Materials applied to accelerator model');
  }, [modelClone]);

  // Animate pressing effect
  useFrame(() => {
    if (modelRef.current) {
      if (acceleratorPressed) {
        // Pressed: move down and scale slightly
        modelRef.current.position.y = THREE.MathUtils.lerp(
          modelRef.current.position.y,
          -0.2,
          0.25
        );
        modelRef.current.scale.setScalar(
          THREE.MathUtils.lerp(modelRef.current.scale.x, 0.9, 0.25)
        );
      } else {
        // Released: return to original position
        modelRef.current.position.y = THREE.MathUtils.lerp(
          modelRef.current.position.y,
          0,
          0.25
        );
        modelRef.current.scale.setScalar(
          THREE.MathUtils.lerp(modelRef.current.scale.x, 1, 0.25)
        );
      }
    }
  });

  if (!modelClone) {
    return null;
  }

  return (
    <group ref={modelRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <primitive object={modelClone} />
    </group>
  );
}

function AcceleratorPlaceholder() {
  const placeholderRef = useRef<THREE.Group>(null);
  const { acceleratorPressed } = useStore();

  useFrame(() => {
    if (placeholderRef.current) {
      if (acceleratorPressed) {
        placeholderRef.current.position.y = THREE.MathUtils.lerp(
          placeholderRef.current.position.y,
          -0.15,
          0.25
        );
        placeholderRef.current.scale.setScalar(
          THREE.MathUtils.lerp(placeholderRef.current.scale.x, 0.85, 0.25)
        );
      } else {
        placeholderRef.current.position.y = THREE.MathUtils.lerp(
          placeholderRef.current.position.y,
          0,
          0.25
        );
        placeholderRef.current.scale.setScalar(
          THREE.MathUtils.lerp(placeholderRef.current.scale.x, 1, 0.25)
        );
      }
    }
  });

  return (
    <group ref={placeholderRef}>
      {/* Simple placeholder box */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 0.5, 1]} />
        <meshStandardMaterial color="#00ff00" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function SceneContent() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 2.5]} fov={50} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <directionalLight position={[-5, 5, -5]} intensity={0.8} />
      <pointLight position={[0, 0, 5]} intensity={1} />
      <Suspense fallback={<AcceleratorPlaceholder />}>
        <ErrorBoundary fallback={<AcceleratorPlaceholder />}>
          <AcceleratorModel />
        </ErrorBoundary>
      </Suspense>
    </>
  );
}

export default function AcceleratorButton3D() {
  return (
    <div className="w-24 h-24 relative pointer-events-none">
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        dpr={[1, 2]}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}


