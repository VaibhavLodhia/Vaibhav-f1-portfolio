import React, { useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useStore } from '../store/useStore';
import * as THREE from 'three';
import { ErrorBoundary } from './ErrorBoundary';

interface CarProps {
  helmetCameraRef: React.RefObject<THREE.Object3D>;
}

function CarModel({ helmetCameraRef }: CarProps) {
  const carRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}assets/models/f1_car.glb`);
  const { phase, carSpeed, carLane, setPhase, setCarPosition, updateSpeed } = useStore();

  const carPosition = useRef(new THREE.Vector3(0, 0.1, 0));
  const currentRotation = useRef(0);
  const targetLaneX = useRef(0); // Current target lane X position
  const lastLane = useRef(carLane); // Track lane changes

  useEffect(() => {
    if (carRef.current) {
      carPosition.current.copy(new THREE.Vector3(0, 0.1, 0));
      carRef.current.position.copy(carPosition.current);
      carRef.current.rotation.y = -Math.PI / 2; // Rotate 90 degrees clockwise
      
      // Initialize lane system
      // Lanes: Left (-4.5), Center (0), Right (4.5) - between yellow lines at -3 and 3
      const lanePositions = [-4.5, 0, 4.5]; // left, center, right
      const initialTargetX = lanePositions[carLane + 1]; // carLane: -1, 0, 1 -> index: 0, 1, 2
      targetLaneX.current = initialTargetX;
      carPosition.current.x = initialTargetX;
      lastLane.current = carLane;
    }
  }, []);
  
  // Sync lane when carLane changes externally - INSTANT CHANGE
  useEffect(() => {
    if (carLane !== lastLane.current) {
      lastLane.current = carLane;
      // Lanes: Left (-4.5), Center (0), Right (4.5) - between yellow lines at -3 and 3
      const lanePositions = [-4.5, 0, 4.5]; // left, center, right
      const targetX = lanePositions[carLane + 1]; // carLane: -1, 0, 1 -> index: 0, 1, 2
      targetLaneX.current = targetX;
      // Instantly update car position
      carPosition.current.x = targetX;
      if (carRef.current) {
        carRef.current.position.x = targetX;
      }
    }
  }, [carLane]);

  useEffect(() => {
    const interval = setInterval(() => {
      const { checkpoints, skipCheckpoint } = useStore.getState();
      
      // Auto-skip checkpoints that car has passed (car Z < checkpoint Z by 10 units)
      checkpoints.forEach((checkpoint) => {
        if (!checkpoint.triggered && !checkpoint.skipped && carPosition.current.z < checkpoint.position[2] - 10) {
          skipCheckpoint(checkpoint.id);
        }
      });
      
      // Race ends immediately when car touches finish line (track ends at -775)
      if (phase === 'driving' && carPosition.current.z <= -775) {
        setPhase('finish');
      }
    }, 100);
    return () => clearInterval(interval);
  }, [phase, setPhase]);

  useFrame(() => {
    if (!carRef.current || phase === 'intro' || phase === 'checkpoint') {
      return;
    }

    // Update speed based on accelerator/brake input
    updateSpeed();

    // Car always moves forward - but stop when crossing finish line
    if (phase === 'driving') {
      if (carPosition.current.z > -775) {
        carPosition.current.z -= carSpeed;
      }
      
      // Race ends immediately when car touches finish line (instant detection in useFrame)
      if (carPosition.current.z <= -775) {
        setPhase('finish');
        carPosition.current.z = -775; // Stop car at finish line
      }
    }
    
    // Don't move car in finish phase
    if (phase === 'finish') {
      carPosition.current.z = -775; // Keep car at finish line
    }

    // INSTANT LANE CHANGE - No gradual animation
    carPosition.current.x = targetLaneX.current;
    currentRotation.current = 0; // No lean

    // Hide car when it crosses finish line
    if (carRef.current) {
      if (phase === 'finish' || carPosition.current.z <= -775) {
        carRef.current.visible = false;
      } else {
        carRef.current.visible = true;
      }
    }

    // Update car transform
    carRef.current.position.copy(carPosition.current);
    carRef.current.rotation.y = -Math.PI / 2; // Face forward
    carRef.current.rotation.z = currentRotation.current; // Lean during lane change

    // Update store with car position EVERY FRAME for collision detection
    setCarPosition([
      carPosition.current.x,
      carPosition.current.y,
      carPosition.current.z,
    ]);

    if (helmetCameraRef.current) {
      helmetCameraRef.current.position.set(
        carPosition.current.x,
        carPosition.current.y + 1.6,
        carPosition.current.z + 0.3,
      );
      helmetCameraRef.current.rotation.set(
        currentRotation.current * 0.3,
        0,
        currentRotation.current,
      );
    }
  });

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


  // Hide car when it crosses finish line
  useEffect(() => {
    if (carRef.current) {
      if (phase === 'finish' || carPosition.current.z <= -775) {
        carRef.current.visible = false;
      } else {
        carRef.current.visible = true;
      }
    }
  }, [phase]);

  return (
    <group ref={carRef} position={[0, 0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <primitive object={carClone} scale={1} />
    </group>
  );
}

function CarPlaceholder({ helmetCameraRef }: CarProps) {
  const carRef = useRef<THREE.Group>(null);
  const { phase, carSpeed, carLane, setPhase, setCarPosition, updateSpeed } = useStore();

  const carPosition = useRef(new THREE.Vector3(0, 0.1, 0));
  const currentRotation = useRef(0);
  const targetLaneX = useRef(0);
  const lastLane = useRef(carLane);

  useEffect(() => {
    if (carRef.current) {
      carPosition.current.copy(new THREE.Vector3(0, 0.1, 0));
      carRef.current.position.copy(carPosition.current);
      carRef.current.rotation.y = -Math.PI / 2;
      
      // Initialize lane system
      // Lanes: Left (-4.5), Center (0), Right (4.5) - between yellow lines at -3 and 3
      const lanePositions = [-4.5, 0, 4.5]; // left, center, right
      const initialTargetX = lanePositions[carLane + 1]; // carLane: -1, 0, 1 -> index: 0, 1, 2
      targetLaneX.current = initialTargetX;
      carPosition.current.x = initialTargetX;
      lastLane.current = carLane;
    }
  }, []);
  
  // Sync lane when carLane changes externally - INSTANT CHANGE
  useEffect(() => {
    if (carLane !== lastLane.current) {
      lastLane.current = carLane;
      // Lanes: Left (-4.5), Center (0), Right (4.5) - between yellow lines at -3 and 3
      const lanePositions = [-4.5, 0, 4.5]; // left, center, right
      const targetX = lanePositions[carLane + 1]; // carLane: -1, 0, 1 -> index: 0, 1, 2
      targetLaneX.current = targetX;
      // Instantly update car position
      carPosition.current.x = targetX;
      if (carRef.current) {
        carRef.current.position.x = targetX;
      }
    }
  }, [carLane]);

  useEffect(() => {
    const interval = setInterval(() => {
      const { checkpoints, skipCheckpoint } = useStore.getState();
      
      // Auto-skip checkpoints that car has passed (car Z < checkpoint Z by 10 units)
      checkpoints.forEach((checkpoint) => {
        if (!checkpoint.triggered && !checkpoint.skipped && carPosition.current.z < checkpoint.position[2] - 10) {
          skipCheckpoint(checkpoint.id);
        }
      });
      
      // Race ends immediately when car touches finish line (track ends at -775)
      if (phase === 'driving' && carPosition.current.z <= -775) {
        setPhase('finish');
      }
    }, 100);
    return () => clearInterval(interval);
  }, [phase, setPhase]);

  useFrame(() => {
    if (!carRef.current || phase === 'intro' || phase === 'checkpoint') {
      return;
    }

    // Update speed based on accelerator/brake input
    updateSpeed();

    // Car always moves forward - but stop when crossing finish line
    if (phase === 'driving') {
      if (carPosition.current.z > -775) {
        carPosition.current.z -= carSpeed;
      }
      
      // Race ends immediately when car touches finish line (instant detection in useFrame)
      if (carPosition.current.z <= -775) {
        setPhase('finish');
        carPosition.current.z = -775; // Stop car at finish line
      }
    }
    
    // Don't move car in finish phase
    if (phase === 'finish') {
      carPosition.current.z = -775; // Keep car at finish line
    }

    // INSTANT LANE CHANGE - No gradual animation
    carPosition.current.x = targetLaneX.current;
    currentRotation.current = 0; // No lean

    carRef.current.position.copy(carPosition.current);
    carRef.current.rotation.y = -Math.PI / 2;
    carRef.current.rotation.z = currentRotation.current;

    setCarPosition([
      carPosition.current.x,
      carPosition.current.y,
      carPosition.current.z,
    ]);

    if (helmetCameraRef.current) {
      helmetCameraRef.current.position.set(
        carPosition.current.x,
        carPosition.current.y + 1.6,
        carPosition.current.z + 0.3,
      );
      helmetCameraRef.current.rotation.set(
        currentRotation.current * 0.3,
        0,
        currentRotation.current,
      );
    }
  });

  // Hide car when it crosses finish line
  useEffect(() => {
    if (carRef.current) {
      if (phase === 'finish' || carPosition.current.z <= -775) {
        carRef.current.visible = false;
      } else {
        carRef.current.visible = true;
      }
    }
  }, [phase]);

  return (
    <group ref={carRef} position={[0, 0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
      {/* F1 Car Placeholder - FACING FORWARD */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.4, 2.5]} />
        <meshStandardMaterial color="#ff0000" metalness={0.9} roughness={0.1} />
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
        <meshStandardMaterial color="#ff0000" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Spoiler */}
      <mesh position={[0, 0.7, -1.3]} rotation={[-Math.PI / 6, 0, 0]} castShadow>
        <boxGeometry args={[1.4, 0.05, 0.2]} />
        <meshStandardMaterial color="#333333" metalness={0.9} />
      </mesh>
    </group>
  );
}

export default function Car({ helmetCameraRef }: CarProps) {
  return (
    <ErrorBoundary fallback={<CarPlaceholder helmetCameraRef={helmetCameraRef} />}>
      <Suspense fallback={<CarPlaceholder helmetCameraRef={helmetCameraRef} />}>
        <CarModel helmetCameraRef={helmetCameraRef} />
      </Suspense>
    </ErrorBoundary>
  );
}
