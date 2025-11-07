import { useRef, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useStore } from '../store/useStore';
import * as THREE from 'three';

export default function Checkpoints() {
  const { checkpoints, triggerCheckpoint, carPosition } = useStore();
  const checkpointRefs = useRef<{ [key: number]: THREE.Group }>({});

  // Check collision based on car position - LANE-AWARE
  useFrame(() => {
    const [carX, carY, carZ] = carPosition;
    
    // Helper function to determine which lane a position is in
    const getLane = (x: number): string => {
      if (x < -3) return 'left'; // Left lane: between -6 and -3
      if (x > 3) return 'right'; // Right lane: between 3 and 6
      return 'center'; // Center lane: between -3 and 3
    };
    
    checkpoints.forEach((checkpoint) => {
      if (checkpoint.triggered || checkpoint.skipped) return;

      const [cpX, cpY, cpZ] = checkpoint.position;
      
      // First check if car and box are in the same lane
      const carLane = getLane(carX);
      const boxLane = getLane(cpX);
      
      if (carLane !== boxLane) {
        return; // Different lanes - no collision
      }
      
      // Same lane - check distance in Z, X, and Y
      const distanceZ = Math.abs(carZ - cpZ);
      const distanceX = Math.abs(carX - cpX);
      const distanceY = Math.abs(carY - cpY);
      
      // Collision if close enough in all dimensions (within same lane)
      // Boxes are now at Y=1.75, car is at Y=0.1, so allow up to 2.5 units Y difference
      // X distance should be within 2 units (car width), Z distance within 10 units (more lenient)
      if (distanceZ < 10 && distanceX < 2 && distanceY < 2.5) {
        triggerCheckpoint(checkpoint.id);
      }
    });
  });

  return (
    <>
      {checkpoints.map((checkpoint) => (
        <CheckpointBox
          key={checkpoint.id}
          checkpoint={checkpoint}
          ref={(el) => {
            if (el) checkpointRefs.current[checkpoint.id] = el;
          }}
        />
      ))}
    </>
  );
}

interface CheckpointProps {
  checkpoint: {
    id: number;
    label: string;
    triggered: boolean;
    skipped: boolean;
    position: [number, number, number];
  };
}

const CheckpointBox = forwardRef<THREE.Group, CheckpointProps>(
  ({ checkpoint }, ref) => {
    const { triggered, skipped, position, label } = checkpoint;
    const boxRef = useRef<THREE.Mesh>(null);
    const pulseRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    // Animated pulsing effect
    useFrame((state) => {
      const time = state.clock.getElapsedTime();
      if (pulseRef.current) {
        const scale = 1 + Math.sin(time * 2) * 0.15; // Pulse between 0.85 and 1.15
        pulseRef.current.scale.set(scale, scale, scale);
      }
      if (glowRef.current) {
        const intensity = 0.8 + Math.sin(time * 3) * 0.2; // Pulse intensity
        if (glowRef.current.material instanceof THREE.MeshStandardMaterial) {
          glowRef.current.material.emissiveIntensity = intensity;
        }
      }
      if (groupRef.current) {
        // Rotate slowly for visibility
        groupRef.current.rotation.y = time * 0.5;
      }
    });

    if (triggered || skipped) return null;

    return (
      <group ref={ref} position={position}>
        <group ref={groupRef}>
          {/* Main bright solid box - VERY VISIBLE */}
          <mesh ref={boxRef}>
          <boxGeometry args={[3.5, 3.5, 3.5]} />
          <meshStandardMaterial
            color="#ffff00"
            transparent
            opacity={0.85}
            emissive="#ffff00"
            emissiveIntensity={2}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>

        {/* Pulsing outer glow box */}
        <mesh ref={pulseRef}>
          <boxGeometry args={[4, 4, 4]} />
          <meshStandardMaterial
            color="#ffff00"
            transparent
            opacity={0.4}
            emissive="#ffff00"
            emissiveIntensity={3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Bright glow effect layers */}
        <mesh ref={glowRef} position={[0, 0, 0]}>
          <boxGeometry args={[4.5, 4.5, 4.5]} />
          <meshStandardMaterial
            color="#ffff00"
            transparent
            opacity={0.2}
            emissive="#ffff00"
            emissiveIntensity={2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Outer halo glow */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[5, 5, 5]} />
          <meshStandardMaterial
            color="#ffff00"
            transparent
            opacity={0.1}
            emissive="#ffff00"
            emissiveIntensity={4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Bright border/outline */}
        <mesh>
          <boxGeometry args={[3.6, 3.6, 3.6]} />
          <meshStandardMaterial
            color="#000000"
            transparent
            opacity={0.8}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Large, bold checkpoint label - ABOVE THE BOX, FULLY VISIBLE */}
        <Text
          position={[0, 3.5, 0]}
          fontSize={1.2}
          color="#000000"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.15}
          outlineColor="#ffff00"
          fontWeight="900"
        >
          {label.toUpperCase()}
        </Text>

        {/* Additional bright text glow layer */}
        <Text
          position={[0, 3.5, 0]}
          fontSize={1.2}
          color="#ffff00"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.08}
          outlineColor="#000000"
          fontWeight="900"
        >
          {label.toUpperCase()}
        </Text>

        {/* Bright corner markers */}
        {[
          [-1.75, -1.75, -1.75],
          [1.75, -1.75, -1.75],
          [-1.75, 1.75, -1.75],
          [1.75, 1.75, -1.75],
          [-1.75, -1.75, 1.75],
          [1.75, -1.75, 1.75],
          [-1.75, 1.75, 1.75],
          [1.75, 1.75, 1.75],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={5}
            />
          </mesh>
        ))}
        </group>
      </group>
    );
  }
);

CheckpointBox.displayName = 'CheckpointBox';

