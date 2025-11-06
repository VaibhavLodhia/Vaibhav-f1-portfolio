import { create } from 'zustand';

export interface CheckpointState {
  id: number;
  label: string;
  triggered: boolean;
  skipped: boolean;
  position: [number, number, number];
}

interface AppState {
  // Game state
  phase: 'intro' | 'driving' | 'checkpoint' | 'finish';
  currentCheckpoint: number | null;
  
  // Checkpoints
  checkpoints: CheckpointState[];
  completedCheckpoints: number;
  
  // Car control
  carSpeed: number;
  carLateral: number; // -1 to 1 for steering (deprecated)
  carLane: number; // -1 = left lane, 0 = center, 1 = right lane
  carRotation: number;
  carPosition: [number, number, number]; // x, y, z
  
  // Speed control
  acceleratorPressed: boolean;
  brakePressed: boolean;
  minSpeed: number;
  maxSpeed: number;
  accelerationRate: number;
  decelerationRate: number;
  
  // Camera
  cameraMode: 'cinematic' | 'helmet' | 'follow';
  cameraTransition: number; // 0-1 blend factor
  
  // Modal
  modalOpen: boolean;
  modalContent: 'experiences' | 'about' | 'projects' | 'tech' | 'resume' | null;
  
  // Collision
  collision: boolean;
  
  // Actions
  setPhase: (phase: AppState['phase']) => void;
  triggerCheckpoint: (id: number) => void;
  skipCheckpoint: (id: number) => void;
  closeModal: () => void;
  openModal: (content: AppState['modalContent']) => void;
  updateCarSteering: (lateral: number) => void;
  changeLane: (direction: 'left' | 'right') => void;
  setCarPosition: (position: [number, number, number]) => void;
  setAccelerator: (pressed: boolean) => void;
  setBrake: (pressed: boolean) => void;
  updateSpeed: () => void;
  setCameraMode: (mode: AppState['cameraMode']) => void;
  setCameraTransition: (value: number) => void;
  setCollision: (collision: boolean) => void;
  reset: () => void;
}

const initialCheckpoints: CheckpointState[] = [
  { id: 0, label: 'About Me', triggered: false, skipped: false, position: [0, 1.75, -100] }, // Center lane - FIRST
  { id: 1, label: 'Experiences', triggered: false, skipped: false, position: [-4.5, 1.75, -250] }, // Left lane
  { id: 2, label: 'Projects', triggered: false, skipped: false, position: [4.5, 1.75, -400] }, // Right lane
  { id: 3, label: 'Skills', triggered: false, skipped: false, position: [-4.5, 1.75, -550] }, // Left lane
  { id: 4, label: 'Resume', triggered: false, skipped: false, position: [0, 1.75, -700] }, // Center lane
];

export const useStore = create<AppState>((set) => ({
  phase: 'intro',
  currentCheckpoint: null,
  checkpoints: initialCheckpoints,
  completedCheckpoints: 0,
  carSpeed: 0.015, // Current speed (starts at minimum)
  carLateral: 0,
  carLane: 0, // Start in center lane (0 = center, -1 = left, 1 = right)
  carRotation: 0,
    carPosition: [0, 0.1, 0] as [number, number, number],
  
  // Speed control
  acceleratorPressed: false,
  brakePressed: false,
  minSpeed: 0, // No idle speed - car stops when not accelerating
  maxSpeed: 5.00, // Maximum speed (FASTER than NPC cars - NPCs max at 0.6)
  accelerationRate: 0.12, // Speed increase per frame when accelerating (FAST acceleration)
  decelerationRate: 0.07, // Speed decrease per frame when not accelerating
  cameraMode: 'cinematic',
  cameraTransition: 0,
  modalOpen: false,
  modalContent: null,
  collision: false,
  
  setPhase: (phase) => set({ phase }),
  triggerCheckpoint: (id) => {
    set((state) => {
      const updated = state.checkpoints.map((cp) =>
        cp.id === id ? { ...cp, triggered: true } : cp
      );
      const completed = updated.filter((cp) => cp.triggered || cp.skipped).length;
      const content = id === 0 ? 'about' : id === 1 ? 'experiences' : id === 2 ? 'projects' : id === 3 ? 'tech' : 'resume';
      return {
        checkpoints: updated,
        currentCheckpoint: id,
        completedCheckpoints: completed,
        phase: 'checkpoint',
        modalOpen: true,
        modalContent: content,
        carSpeed: 0,
      };
    });
  },
  skipCheckpoint: (id) => {
    set((state) => {
      const updated = state.checkpoints.map((cp) =>
        cp.id === id ? { ...cp, skipped: true } : cp
      );
      const completed = updated.filter((cp) => cp.triggered || cp.skipped).length;
      // Don't set phase to 'finish' here - let Car.tsx handle finish detection
      return {
        checkpoints: updated,
        modalOpen: false,
        modalContent: null,
        currentCheckpoint: null,
        phase: 'driving', // Always go back to driving, let Car.tsx handle finish detection
        completedCheckpoints: completed,
      };
    });
  },
  closeModal: () => {
    set((state) => {
      const completed = state.checkpoints.filter((cp) => cp.triggered || cp.skipped).length;
      const allCompleted = completed === state.checkpoints.length;
      // Only set phase to 'finish' if ALL checkpoints are completed - don't trigger finish screen early
      // The finish screen will be triggered by Car.tsx when car reaches end AND all checkpoints are done
      return {
        modalOpen: false,
        modalContent: null,
        currentCheckpoint: null,
        completedCheckpoints: completed,
        phase: 'driving', // Always go back to driving, let Car.tsx handle finish detection
      };
    });
  },
  openModal: (content) => set({ modalOpen: true, modalContent: content }),
  updateCarSteering: (lateral) => set({ carLateral: lateral }),
  changeLane: (direction) => {
    set((state) => {
      let newLane = state.carLane;
      if (direction === 'left' && state.carLane > -1) {
        newLane = state.carLane - 1;
        console.log('⬅️ Button/Key pressed: LEFT - Changing from lane', state.carLane, 'to', newLane);
      } else if (direction === 'right' && state.carLane < 1) {
        newLane = state.carLane + 1;
        console.log('➡️ Button/Key pressed: RIGHT - Changing from lane', state.carLane, 'to', newLane);
      } else {
        console.log('⚠️ Cannot change lane - already at', direction === 'left' ? 'leftmost' : 'rightmost', 'lane');
      }
      return { carLane: newLane };
    });
  },
  setCarPosition: (position) => set({ carPosition: position }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setCameraTransition: (value) => set({ cameraTransition: value }),
  setAccelerator: (pressed) => set({ acceleratorPressed: pressed }),
  setBrake: (pressed) => set({ brakePressed: pressed }),
  setCollision: (collision) => {
    if (collision) {
      set({ collision, phase: 'checkpoint', carSpeed: 0 });
    } else {
      set({ collision });
    }
  },
  updateSpeed: () => {
    set((state) => {
      if (state.phase !== 'driving' && state.phase !== 'finish') {
        return { carSpeed: 0 };
      }
      
      let newSpeed = state.carSpeed;
      
      if (state.brakePressed) {
        // Brake: rapidly decrease to 0
        newSpeed = Math.max(0, newSpeed - state.decelerationRate * 4);
      } else if (state.acceleratorPressed) {
        // Accelerate: rapidly increase to maxSpeed (SUPER FAST!)
        newSpeed = Math.min(state.maxSpeed, newSpeed + state.accelerationRate);
      } else {
        // No input: gradually decrease to 0 (car stops)
        newSpeed = Math.max(0, newSpeed - state.decelerationRate);
      }
      
      return { carSpeed: newSpeed };
    });
  },
  reset: () => set({
    phase: 'intro',
    currentCheckpoint: null,
    checkpoints: initialCheckpoints,
    completedCheckpoints: 0,
    carSpeed: 0,
    carLateral: 0,
    carLane: 0,
    carRotation: 0,
    carPosition: [0, 0.1, 0],
    acceleratorPressed: false,
    brakePressed: false,
    cameraMode: 'cinematic',
    cameraTransition: 0,
    modalOpen: false,
    modalContent: null,
    collision: false,
  }),
}));

