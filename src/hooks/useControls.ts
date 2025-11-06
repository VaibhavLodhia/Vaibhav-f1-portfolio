import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export const useControls = () => {
  const { phase, changeLane, setAccelerator, setBrake } = useStore();

  useEffect(() => {
    if (phase !== 'driving' && phase !== 'finish') {
      // Reset controls when not driving
      setAccelerator(false);
      setBrake(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Space = Accelerate (can work with lane changes)
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        setAccelerator(true);
      }
      // B = Brake (can work with lane changes)
      else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setBrake(true);
      }
      // Left arrow = move to left lane (can work with acceleration)
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        changeLane('left');
      }
      // Right arrow = move to right lane (can work with acceleration)
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        changeLane('right');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Space = Release Accelerate
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        setAccelerator(false);
      }
      // B = Release Brake
      else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setBrake(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      setAccelerator(false);
      setBrake(false);
    };
  }, [phase, changeLane, setAccelerator, setBrake]);
};

