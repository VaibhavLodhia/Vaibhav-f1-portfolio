import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import * as THREE from 'three';
import { gsap } from 'gsap';

export default function DriverPlaceholder() {
  const groupRef = useRef<THREE.Group>(null);
  const { phase, setPhase } = useStore();

  useEffect(() => {
    if (!groupRef.current || phase !== 'intro') return;

    const tl = gsap.timeline({
      onComplete: () => {
        setPhase('driving');
      },
    });

    tl.to(groupRef.current.position, {
      x: 0,
      z: 1,
      duration: 3,
      ease: 'power1.inOut',
    })
      .to(
        groupRef.current.position,
        {
          y: 1.2,
          duration: 1.5,
          ease: 'power2.inOut',
        },
        '-=0.5',
      )
      .to(
        { value: 0 },
        {
          value: 1,
          duration: 0.5,
          ease: 'power2.inOut',
          onUpdate: function () {
            if (groupRef.current) {
              groupRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.material.opacity = 1 - this.targets()[0].value;
                  child.material.transparent = true;
                }
              });
            }
          },
        },
      );
  }, [phase, setPhase]);

  useFrame(() => {
    if (phase === 'driving' || phase === 'checkpoint' || phase === 'finish') {
      if (groupRef.current) {
        groupRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef} position={[-5, 0, 3]} rotation={[0, 0, 0]}>
      {/* Body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
        <meshStandardMaterial color="#4a90e2" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.4, 0.6, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
        <meshStandardMaterial color="#4a90e2" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.4, 0.6, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
        <meshStandardMaterial color="#4a90e2" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.15, -0.3, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
        <meshStandardMaterial color="#2a5080" />
      </mesh>
      <mesh position={[0.15, -0.3, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
        <meshStandardMaterial color="#2a5080" />
      </mesh>
    </group>
  );
}

