import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { gsap } from 'gsap';

export default function FinishLine() {
  const finishRef = useRef<THREE.Group>(null);
  const bannerRef = useRef<THREE.Mesh>(null);
  const { phase, setPhase } = useStore();

  useEffect(() => {
    if (phase === 'finish' && bannerRef.current) {
      // Animate finish line banner
      gsap.to(bannerRef.current.rotation, {
        y: Math.PI * 2,
        duration: 2,
        repeat: -1,
        ease: 'none',
      });
    }
  }, [phase]);

  return (
    <group ref={finishRef} position={[0, 0, -775]}>
      {/* Finish line checkered pattern */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Finish banner */}
      <mesh
        ref={bannerRef}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[25, 8, 0.5]} />
        <meshStandardMaterial
          color="#ff0000"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Finish line poles/flags */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={i}
          position={[-8 + i * 1.8, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.1, 0.1, 6, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

