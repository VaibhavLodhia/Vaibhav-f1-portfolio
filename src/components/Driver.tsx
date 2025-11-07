import { useRef, useEffect, Suspense } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useStore } from '../store/useStore';
import * as THREE from 'three';
import { gsap } from 'gsap';
import DriverPlaceholder from './DriverPlaceholder';
import { ErrorBoundary } from './ErrorBoundary';

function DriverModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(`${import.meta.env.BASE_URL}assets/models/driver.glb`);
  const { actions } = useAnimations(animations, groupRef);
  const { phase, setPhase } = useStore();

  // Driver walking animation
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

  // Play walk animation
  useEffect(() => {
    if (actions && phase === 'intro') {
      const walkAction = actions[Object.keys(actions)[0]];
      if (walkAction) {
        walkAction.reset().fadeIn(0.5).play();
        return () => {
          walkAction.fadeOut(0.5);
        };
      }
    }
  }, [actions, phase]);

  useEffect(() => {
    if (phase === 'driving' || phase === 'checkpoint' || phase === 'finish') {
      if (groupRef.current) {
        groupRef.current.visible = false;
      }
    }
  }, [phase]);

  const driverClone = scene.clone();

  return (
    <group ref={groupRef} position={[-5, 0, 3]} rotation={[0, 0, 0]}>
      <primitive object={driverClone} scale={1} />
    </group>
  );
}

export default function Driver() {
  const groupRef = useRef<THREE.Group>(null);
  const { phase, setPhase } = useStore();

  // Driver walking animation (works with placeholder too)
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

  useEffect(() => {
    if (phase === 'driving' || phase === 'checkpoint' || phase === 'finish') {
      if (groupRef.current) {
        groupRef.current.visible = false;
      }
    }
  }, [phase]);

  return (
    <group ref={groupRef}>
      <ErrorBoundary fallback={<DriverPlaceholder />}>
        <Suspense fallback={<DriverPlaceholder />}>
          <DriverModel />
        </Suspense>
      </ErrorBoundary>
    </group>
  );
}
