import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

export default function StadiumBackground() {
  const backgroundRef = useRef<THREE.Group>(null);
  
  // Load jungle texture
  const jungleTexture = useTexture(`${import.meta.env.BASE_URL}assets/jungle.png`);
  const [imageAspect, setImageAspect] = useState(1);
  
  // Get image dimensions to calculate proper aspect ratio
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const aspect = img.width / img.height;
      setImageAspect(aspect);
      
      // Configure texture - NO STRETCHING - maintain natural aspect ratio
      jungleTexture.wrapS = THREE.ClampToEdgeWrapping;
      jungleTexture.wrapT = THREE.ClampToEdgeWrapping;
      jungleTexture.repeat.set(1, 1); // Show full image without repetition
      jungleTexture.flipY = false;
    };
    img.src = `${import.meta.env.BASE_URL}assets/jungle.png`;
  }, [jungleTexture]);

  // Track is 800 units long, create left and right walls
  // Calculate wall dimensions based on image aspect ratio to avoid stretching
  const wallDistance = 20; // Distance from track center (X = 0)
  const desiredWallHeight = 100; // Desired height
  const wallWidth = desiredWallHeight * imageAspect; // Width based on image aspect ratio
  const trackLength = 800;
  const wallYPosition = 0.1; // Y position - fixed to track (touching ground)
  
  // Create segments along the track, each showing the full image without stretching
  const numSegments = Math.ceil(trackLength / wallWidth);

  return (
    <group ref={backgroundRef}>
      {/* Left wall - jungle background segments (NO STRETCHING) */}
      {Array.from({ length: numSegments }).map((_, i) => {
        const segmentZ = -375 - (i * wallWidth) + (wallWidth / 2);
        const actualSegmentWidth = i === numSegments - 1 ? (trackLength - (i * wallWidth)) : wallWidth;
        
        return (
          <mesh
            key={`left-wall-${i}`}
            rotation={[0, Math.PI / 2, 0]}
            position={[-wallDistance, wallYPosition, segmentZ]}
          >
            <planeGeometry args={[actualSegmentWidth, desiredWallHeight]} />
            <meshStandardMaterial
              map={jungleTexture}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* Right wall - jungle background segments (NO STRETCHING) */}
      {Array.from({ length: numSegments }).map((_, i) => {
        const segmentZ = -375 - (i * wallWidth) + (wallWidth / 2);
        const actualSegmentWidth = i === numSegments - 1 ? (trackLength - (i * wallWidth)) : wallWidth;
        
        return (
          <mesh
            key={`right-wall-${i}`}
            rotation={[0, -Math.PI / 2, 0]}
            position={[wallDistance, wallYPosition, segmentZ]}
          >
            <planeGeometry args={[actualSegmentWidth, desiredWallHeight]} />
            <meshStandardMaterial
              map={jungleTexture}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}
