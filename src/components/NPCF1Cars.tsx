import { useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useStore } from '../store/useStore';
import * as THREE from 'three';
import { ErrorBoundary } from './ErrorBoundary';

interface NPCCarProps {
  id?: number; // Optional since it's not used in component functions
  initialPosition: [number, number, number];
  speed: number;
  lane: number; // -1 = left, 0 = center, 1 = right
}

// Lane positions: Left (-4.5), Center (0), Right (4.5)
const LANE_POSITIONS = [-4.5, 0, 4.5];

function NPCCarModel({ initialPosition, speed, lane }: NPCCarProps) {
  const carRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}assets/models/f1_cars.glb`);
  const { phase, carPosition, setCollision, collision } = useStore();

  const npcPosition = useRef(new THREE.Vector3(
    initialPosition[0],
    initialPosition[1],
    initialPosition[2]
  ));
  const wasBehindPlayer = useRef(false); // Track if NPC was behind player (for passing through)

  // Initialize car position
  useEffect(() => {
    if (carRef.current) {
      const laneX = LANE_POSITIONS[lane + 1]; // lane: -1, 0, 1 -> index: 0, 1, 2
      npcPosition.current.set(laneX, initialPosition[1], initialPosition[2]);
      carRef.current.position.copy(npcPosition.current);
      carRef.current.rotation.y = -Math.PI / 2; // Face forward (same as player car)
    }
  }, []);

  // Clone the scene for this NPC car
  const carClone = scene.clone();

  useEffect(() => {
    carClone.traverse((child) => {
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
  }, [carClone]);

  // Move NPC car and check collision
  useFrame(() => {
    if (!carRef.current || phase === 'intro' || phase === 'checkpoint' || phase === 'finish') {
      return;
    }

    // NPC car moves forward at constant speed
    if (phase === 'driving') {
      npcPosition.current.z -= speed;
    }

    // Update car position
    carRef.current.position.copy(npcPosition.current);
    carRef.current.rotation.y = -Math.PI / 2; // Face forward

    // Collision detection with player car - ONLY during driving phase
    // Skip if already collided or not in driving phase
    if (collision || phase !== 'driving') return;
    
    const [playerX, playerY, playerZ] = carPosition;
    const npcX = npcPosition.current.x;
    const npcY = npcPosition.current.y;
    const npcZ = npcPosition.current.z;

    // Check if cars are in the same lane
    const getLane = (x: number): string => {
      if (x < -3) return 'left';
      if (x > 3) return 'right';
      return 'center';
    };

    const playerLane = getLane(playerX);
    const npcLane = getLane(npcX);

    // Collision detection: Only trigger if player hits NPC from behind or side
    // IMPORTANT: NPC must be past Z=-50 to avoid false collisions when resetting to Z=50
    // Player must be past Z=-5 to avoid false collisions at start
    if (playerLane === npcLane && playerZ < -5 && npcZ < -50) {
      // Same lane - check distance
      const distanceZ = Math.abs(playerZ - npcZ);
      const distanceX = Math.abs(playerX - npcX);
      const distanceY = Math.abs(playerY - npcY);

      // Collision logic:
      // In this coordinate system: lower Z = further forward (more negative = ahead)
      // - NPC is ahead if npcZ < playerZ (NPC's Z is more negative)
      // - NPC is behind if npcZ > playerZ (NPC's Z is less negative)
      // - Track if NPC was behind player to allow passing through
      
      const npcIsAhead = npcZ < playerZ - 0.5; // NPC is ahead (with buffer - needs to be clearly ahead)
      const npcIsBehind = npcZ > playerZ; // NPC is behind player
      
      // Update tracking: if NPC is behind, mark it so it can pass through
      if (npcIsBehind) {
        wasBehindPlayer.current = true;
      }
      
      // Only trigger collision if:
      // 1. NPC is clearly ahead (npcZ < playerZ - 0.5) - player hits NPC from behind - ALLOW
      // DON'T trigger if:
      //   - NPC is behind (npcZ > playerZ) - NPC can pass through completely
      //   - NPC was recently behind and is now passing (wasBehindPlayer.current = true) - allow complete pass
      // This allows NPC cars to pass completely over/through player car from behind without collision
      if (distanceZ < 2.0 && distanceX < 1.2 && distanceY < 0.8) {
        // Only trigger collision if NPC is clearly ahead AND wasn't passing from behind
        // Reset wasBehindPlayer flag once NPC is clearly ahead by more than 3 units
        // If NPC was behind and is now clearly ahead (playerZ - npcZ > 3), reset the flag
        if (npcIsAhead && (playerZ - npcZ) > 3) {
          wasBehindPlayer.current = false; // Reset after NPC has fully passed
        }
        
        if (npcIsAhead && !wasBehindPlayer.current) {
          setCollision(true);
        }
      }
    }

    // Reset NPC car position when it goes past the end
    if (npcPosition.current.z < -775) {
      npcPosition.current.z = 50; // Reset to start position
    }
  });

  return (
    <group ref={carRef} position={initialPosition} rotation={[0, -Math.PI / 2, 0]}>
      <primitive object={carClone} scale={1.5} />
    </group>
  );
}

function NPCCarPlaceholder({ initialPosition, speed, lane }: NPCCarProps) {
  const carRef = useRef<THREE.Group>(null);
  const { phase, carPosition, setCollision, collision } = useStore();

  const npcPosition = useRef(new THREE.Vector3(
    initialPosition[0],
    initialPosition[1],
    initialPosition[2]
  ));
  const wasBehindPlayer = useRef(false); // Track if NPC was behind player (for passing through)

  useEffect(() => {
    if (carRef.current) {
      const laneX = LANE_POSITIONS[lane + 1];
      npcPosition.current.set(laneX, initialPosition[1], initialPosition[2]);
      carRef.current.position.copy(npcPosition.current);
    }
  }, []);

  useFrame(() => {
    if (!carRef.current || phase === 'intro' || phase === 'checkpoint' || phase === 'finish') {
      return;
    }

    if (phase === 'driving') {
      npcPosition.current.z -= speed;
    }

    carRef.current.position.copy(npcPosition.current);
    carRef.current.rotation.y = -Math.PI / 2;

    // Collision detection - ONLY during driving phase, skip if already collided
    if (collision || phase !== 'driving') return;
    
    const [playerX, playerY, playerZ] = carPosition;
    const npcX = npcPosition.current.x;
    const npcY = npcPosition.current.y;
    const npcZ = npcPosition.current.z;

    const getLane = (x: number): string => {
      if (x < -3) return 'left';
      if (x > 3) return 'right';
      return 'center';
    };

    const playerLane = getLane(playerX);
    const npcLane = getLane(npcX);

    // Collision detection: Only trigger if player hits NPC from behind or side
    // IMPORTANT: NPC must be past Z=-50 to avoid false collisions when resetting to Z=50
    // Player must be past Z=-5 to avoid false collisions at start
    if (playerLane === npcLane && playerZ < -5 && npcZ < -50) {
      const distanceZ = Math.abs(playerZ - npcZ);
      const distanceX = Math.abs(playerX - npcX);
      const distanceY = Math.abs(playerY - npcY);

      // Collision logic:
      // In this coordinate system: lower Z = further forward (more negative = ahead)
      // - NPC is ahead if npcZ < playerZ (NPC's Z is more negative)
      // - NPC is behind if npcZ > playerZ (NPC's Z is less negative)
      // - Track if NPC was behind player to allow passing through
      
      const npcIsAhead = npcZ < playerZ - 0.5; // NPC is ahead (with buffer - needs to be clearly ahead)
      const npcIsBehind = npcZ > playerZ; // NPC is behind player
      
      // Update tracking: if NPC is behind, mark it so it can pass through
      if (npcIsBehind) {
        wasBehindPlayer.current = true;
      }
      
      // Only trigger collision if:
      // 1. NPC is clearly ahead (npcZ < playerZ - 0.5) - player hits NPC from behind - ALLOW
      // DON'T trigger if:
      //   - NPC is behind (npcZ > playerZ) - NPC can pass through completely
      //   - NPC was recently behind and is now passing (wasBehindPlayer.current = true) - allow complete pass
      // This allows NPC cars to pass completely over/through player car from behind without collision
      if (distanceZ < 2.0 && distanceX < 1.2 && distanceY < 0.8) {
        // Only trigger collision if NPC is clearly ahead AND wasn't passing from behind
        // Reset wasBehindPlayer flag once NPC is clearly ahead by more than 3 units
        // If NPC was behind and is now clearly ahead (playerZ - npcZ > 3), reset the flag
        if (npcIsAhead && (playerZ - npcZ) > 3) {
          wasBehindPlayer.current = false; // Reset after NPC has fully passed
        }
        
        if (npcIsAhead && !wasBehindPlayer.current) {
          setCollision(true);
        }
      }
    }

    if (npcPosition.current.z < -775) {
      npcPosition.current.z = 50;
    }
  });

  return (
    <group ref={carRef} position={initialPosition} rotation={[0, -Math.PI / 2, 0]}>
      {/* Placeholder F1 Car */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.4, 2.5]} />
        <meshStandardMaterial color="#0066ff" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.6, 0.3]} castShadow>
        <boxGeometry args={[0.8, 0.3, 0.6]} />
        <meshStandardMaterial color="#000000" metalness={0.5} />
      </mesh>
      {/* Wheels */}
      <mesh position={[-0.7, 0.1, 0.8]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
      </mesh>
      <mesh position={[0.7, 0.1, 0.8]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
      </mesh>
      <mesh position={[-0.7, 0.1, -0.8]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
      </mesh>
      <mesh position={[0.7, 0.1, -0.8]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
      </mesh>
      {/* Wing */}
      <mesh position={[0, 0.5, -1.3]} castShadow>
        <boxGeometry args={[1.4, 0.05, 0.3]} />
        <meshStandardMaterial color="#0066ff" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function NPCCar({ id: _id, initialPosition, speed, lane }: NPCCarProps) {
  return (
    <ErrorBoundary fallback={<NPCCarPlaceholder initialPosition={initialPosition} speed={speed} lane={lane} />}>
      <Suspense fallback={<NPCCarPlaceholder initialPosition={initialPosition} speed={speed} lane={lane} />}>
        <NPCCarModel initialPosition={initialPosition} speed={speed} lane={lane} />
      </Suspense>
    </ErrorBoundary>
  );
}

export default function NPCF1Cars() {
  // Define multiple NPC cars at different positions and lanes
  // Format: [initialX, initialY, initialZ], speed, lane
  const npcCars = [
    { id: 0, position: [-4.5, 0.3, -50] as [number, number, number], speed: 0.5, lane: -1 }, // Left lane
    { id: 1, position: [0, 0.3, -150] as [number, number, number], speed: 0.4, lane: 0 }, // Center lane
    { id: 2, position: [4.5, 0.3, -100] as [number, number, number], speed: 0.6, lane: 1 }, // Right lane
    { id: 3, position: [-4.5, 0.3, -200] as [number, number, number], speed: 0.45, lane: -1 }, // Left lane
    { id: 4, position: [0, 0.3, -300] as [number, number, number], speed: 0.55, lane: 0 }, // Center lane
    { id: 5, position: [4.5, 0.3, -250] as [number, number, number], speed: 0.5, lane: 1 }, // Right lane
    { id: 6, position: [-4.5, 0.3, -350] as [number, number, number], speed: 0.4, lane: -1 }, // Left lane
    { id: 7, position: [0, 0.3, -450] as [number, number, number], speed: 0.6, lane: 0 }, // Center lane
    { id: 8, position: [4.5, 0.3, -400] as [number, number, number], speed: 0.5, lane: 1 }, // Right lane
    { id: 9, position: [-4.5, 0.3, -500] as [number, number, number], speed: 0.45, lane: -1 }, // Left lane
    { id: 10, position: [0, 0.3, -600] as [number, number, number], speed: 0.55, lane: 0 }, // Center lane
    { id: 11, position: [4.5, 0.3, -550] as [number, number, number], speed: 0.5, lane: 1 }, // Right lane
  ];

  return (
    <>
      {npcCars.map((car) => (
        <NPCCar
          key={car.id}
          id={car.id}
          initialPosition={car.position}
          speed={car.speed}
          lane={car.lane}
        />
      ))}
    </>
  );
}

