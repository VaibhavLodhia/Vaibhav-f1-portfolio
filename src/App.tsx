import { Suspense } from 'react';
import F1Scene from './components/F1Scene';
import PopUpModal from './components/PopUpModal';
import HUD from './components/HUD';
import FinishOverlay from './components/FinishOverlay';
import CollisionModal from './components/CollisionModal';
import Instructions from './components/Instructions';
import { useControls } from './hooks/useControls';

function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
      <div className="text-center">
        <div className="text-cyan-400 text-2xl font-bold mb-4">Loading F1 Experience...</div>
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-400 animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}

function App() {
  useControls();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <Suspense fallback={<LoadingScreen />}>
        <F1Scene />
        <HUD />
        <PopUpModal />
        <FinishOverlay />
        <CollisionModal />
        <Instructions />
      </Suspense>
    </div>
  );
}

export default App;

