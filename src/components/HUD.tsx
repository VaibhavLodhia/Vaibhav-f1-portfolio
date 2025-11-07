import React from 'react';
import { useStore } from '../store/useStore';
import AcceleratorButton3D from './AcceleratorButton';

export default function HUD() {
  // Subscribe to all checkpoint state to ensure reactivity
  const checkpoints = useStore((state) => state.checkpoints);
  const completedCheckpoints = useStore((state) => state.completedCheckpoints);
  const phase = useStore((state) => state.phase);
  const carPosition = useStore((state) => state.carPosition);
  const acceleratorPressed = useStore((state) => state.acceleratorPressed);
  const brakePressed = useStore((state) => state.brakePressed);
  const setAccelerator = useStore((state) => state.setAccelerator);
  const setBrake = useStore((state) => state.setBrake);
  const carSpeed = useStore((state) => state.carSpeed);
  const maxSpeed = useStore((state) => state.maxSpeed);
  const carLane = useStore((state) => state.carLane);

  // Find next checkpoint - MUST be reactive to checkpoint changes
  const nextCheckpoint = checkpoints.find((cp) => !cp.triggered && !cp.skipped);
  const progress = (completedCheckpoints / checkpoints.length) * 100;
  
  // Determine next checkpoint direction (left, center, right)
  const getCheckpointDirection = (checkpointX: number): string => {
    if (checkpointX < -3) return 'LEFT';
    if (checkpointX > 3) return 'RIGHT';
    return 'CENTER';
  };
  
  const nextCheckpointDirection = nextCheckpoint ? getCheckpointDirection(nextCheckpoint.position[0]) : null;
  
  // Determine arrow direction based on car lane and checkpoint lane
  const getArrowDirection = (): string => {
    if (!nextCheckpoint) return '';
    
    // Determine car lane position
    const carLanePos = carLane === -1 ? -4.5 : carLane === 1 ? 4.5 : 0;
    const checkpointX = nextCheckpoint.position[0];
    const checkpointLane = getCheckpointDirection(checkpointX);
    
    // If checkpoint is in LEFT lane and car is NOT in left lane, show left arrow
    if (checkpointLane === 'LEFT' && carLanePos !== -4.5) return '←';
    // If checkpoint is in RIGHT lane and car is NOT in right lane, show right arrow
    if (checkpointLane === 'RIGHT' && carLanePos !== 4.5) return '→';
    // If checkpoint is in CENTER lane and car is NOT in center lane
    if (checkpointLane === 'CENTER' && carLanePos !== 0) {
      // Car is in left lane, need to go right to reach center
      if (carLanePos === -4.5) return '→';
      // Car is in right lane, need to go left to reach center
      if (carLanePos === 4.5) return '←';
    }
    // Same lane, go forward
    return '↓';
  };
  
  const arrowDirection = nextCheckpoint ? getArrowDirection() : '';
  
  // Debug: Log checkpoint changes - FORCE RE-RENDER
  React.useEffect(() => {
    console.log('🎯 HUD UPDATE: Next checkpoint:', nextCheckpoint?.label, 'ID:', nextCheckpoint?.id, 'Direction:', nextCheckpointDirection, 'Arrow:', arrowDirection, 'Car lane:', carLane, 'All checkpoints:', checkpoints.map(cp => ({ id: cp.id, label: cp.label, triggered: cp.triggered, skipped: cp.skipped })));
  }, [checkpoints, nextCheckpoint?.id, nextCheckpointDirection, arrowDirection, carLane]);

  // Mini-map car position (normalized to 0-1)
  const carZ = carPosition[2];
  const trackStart = 0;
  const trackEnd = -775;
  const mapPosition = ((carZ - trackStart) / (trackEnd - trackStart)) * 100;
  const clampedMapPosition = Math.max(0, Math.min(100, mapPosition));

  if (phase === 'intro' || phase === 'finish') return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Keyboard Controls Box - Left Top */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md rounded-lg p-4 border border-white/20 pointer-events-auto">
        <div className="text-white/90 text-sm font-semibold mb-2">⌨️ Controls</div>
        <div className="space-y-1.5 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono">Space</kbd>
            <span>Accelerate</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono">B</kbd>
            <span>Brake</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono">← →</kbd>
            <span>Lane Change</span>
          </div>
        </div>
      </div>

      {/* Arrow buttons for lane switching */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-8 pointer-events-auto">
        <button
          onClick={() => {
            const { changeLane } = useStore.getState();
            changeLane('left');
          }}
          className="w-20 h-20 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50 transition-all hover:scale-110 active:scale-95"
          aria-label="Move to left lane"
        >
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        
        <button
          onClick={() => {
            const { changeLane } = useStore.getState();
            changeLane('right');
          }}
          className="w-20 h-20 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50 transition-all hover:scale-110 active:scale-95"
          aria-label="Move to right lane"
        >
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
      
      {/* Top HUD - Center - Next Checkpoint with Direction */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto z-40">
        {/* Next Checkpoint - Compact */}
        <div className="bg-black/80 backdrop-blur-md rounded-lg p-3 border-2 border-cyan-400/50 shadow-lg">
          <div className="text-white/70 text-xs mb-1 font-semibold">Next Checkpoint</div>
          <div className="flex items-center gap-2">
            <div className="text-cyan-400 text-xl font-bold">
              {nextCheckpoint ? nextCheckpoint.label : 'Finish Line'}
            </div>
            {nextCheckpointDirection && (
              <div className="text-yellow-400 text-lg font-bold px-2 py-0.5 bg-yellow-400/20 rounded">
                {arrowDirection} {nextCheckpointDirection}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top HUD - Right side for progress */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        {/* Progress Bar */}
        <div className="bg-black/60 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <div className="text-white/70 text-sm mb-2">Progress</div>
          <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-white/70 text-xs mt-1">
            {completedCheckpoints} / {checkpoints.length}
          </div>
        </div>
      </div>

      {/* Mini-map */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md rounded-lg p-4 border border-white/20">
        <div className="text-white/70 text-sm mb-2">Track Position</div>
        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-gray-600 to-gray-400" />
          <div
            className="absolute top-0 w-2 h-2 bg-cyan-400 rounded-full transform -translate-x-1/2"
            style={{ left: `${clampedMapPosition}%` }}
          />
        </div>
      </div>

      {/* Accelerator and Brake buttons (right side, bottom) */}
      <div className="absolute right-8 bottom-20 flex flex-col gap-4 pointer-events-auto">
        {/* Accelerator Button with 3D Model */}
        <button
          onMouseDown={() => setAccelerator(true)}
          onMouseUp={() => setAccelerator(false)}
          onMouseLeave={() => setAccelerator(false)}
          onTouchStart={() => setAccelerator(true)}
          onTouchEnd={() => setAccelerator(false)}
          className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all ${
            acceleratorPressed
              ? 'bg-green-500/50 border-green-400 shadow-lg shadow-green-500/50'
              : 'bg-green-600/30 border-green-500/50 hover:bg-green-500/40'
          } backdrop-blur-md overflow-hidden relative`}
          aria-label="Accelerate"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <AcceleratorButton3D />
          </div>
        </button>

        {/* Brake Button */}
        <button
          onMouseDown={() => setBrake(true)}
          onMouseUp={() => setBrake(false)}
          onMouseLeave={() => setBrake(false)}
          onTouchStart={() => setBrake(true)}
          onTouchEnd={() => setBrake(false)}
          className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all ${
            brakePressed
              ? 'bg-red-500 border-red-400 shadow-lg shadow-red-500/50 scale-110'
              : 'bg-red-600/80 border-red-500/80 hover:bg-red-500/90 hover:scale-105'
          } backdrop-blur-md`}
          aria-label="Brake"
        >
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Speed Indicator */}
      <div className="absolute right-8 bottom-4 bg-black/60 backdrop-blur-md rounded-lg p-3 border border-white/20 pointer-events-auto">
        <div className="text-white/70 text-xs mb-1">Speed</div>
        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-100"
            style={{ width: `${(carSpeed / maxSpeed) * 100}%` }}
          />
        </div>
        <div className="text-white/70 text-xs mt-1">
          {Math.round((carSpeed / maxSpeed) * 100)}%
        </div>
      </div>

      {/* Skip button removed - user requested removal */}
    </div>
  );
}

