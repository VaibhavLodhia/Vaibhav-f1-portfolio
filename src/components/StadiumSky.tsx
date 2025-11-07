import { useEffect } from 'react';
import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

export default function StadiumSky() {
  const texture = useTexture('/assets/r_stadium.jpg');
  const { scene } = useThree();

  useEffect(() => {
    if (texture && scene) {
      // Simply set as background - this replaces the blue sky
      scene.background = texture;
    }
  }, [texture, scene]);

  return null;
}


