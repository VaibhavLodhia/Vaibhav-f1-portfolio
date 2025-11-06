import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function Instructions() {
  const [showInstructions, setShowInstructions] = useState(true);
  const { phase } = useStore();

  useEffect(() => {
    // Hide instructions when driving starts
    if (phase === 'driving') {
      setShowInstructions(false);
    }
  }, [phase]);

  if (!showInstructions) return null;

  return (
    <AnimatePresence>
      {showInstructions && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={() => setShowInstructions(false)}
          />

          {/* Instructions Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: 'spring' }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full border border-white/10 p-8">
              {/* Close button */}
              <button
                onClick={() => setShowInstructions(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
                aria-label="Close instructions"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Content */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white mb-2">F1 Portfolio Controls</h2>
                <p className="text-gray-300 text-lg mb-6">
                  Navigate through Vaibhav's portfolio using Formula 1 racing controls!
                </p>

                <div className="space-y-4">
                  {/* Keyboard Controls */}
                  <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                    <h3 className="text-xl font-semibold text-cyan-400 mb-3">⌨️ Keyboard Controls</h3>
                    <div className="space-y-2 text-gray-200">
                      <div className="flex items-center gap-3">
                        <kbd className="px-3 py-1 bg-white/10 rounded text-sm font-mono">Space</kbd>
                        <span>Accelerate (Hold)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <kbd className="px-3 py-1 bg-white/10 rounded text-sm font-mono">B</kbd>
                        <span>Brake (Hold to stop)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <kbd className="px-3 py-1 bg-white/10 rounded text-sm font-mono">← →</kbd>
                        <span>or</span>
                        <kbd className="px-3 py-1 bg-white/10 rounded text-sm font-mono">A D</kbd>
                        <span>Change Lanes</span>
                      </div>
                    </div>
                  </div>

                  {/* Mouse/Touch Controls */}
                  <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                    <h3 className="text-xl font-semibold text-cyan-400 mb-3">🖱️ Mouse / Touch Controls</h3>
                    <div className="space-y-2 text-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">↑</span>
                        </div>
                        <span>Green Button (Right) - Accelerate</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✕</span>
                        </div>
                        <span>Red Button (Right) - Brake</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">←</span>
                        </div>
                        <span>Left/Right Arrows (Bottom) - Change Lanes</span>
                      </div>
                    </div>
                  </div>

                  {/* Gameplay Tips */}
                  <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">💡 Tips</h3>
                    <ul className="space-y-1 text-gray-300 text-sm list-disc list-inside">
                      <li>Hold Space or the green button to accelerate</li>
                      <li>Release to gradually slow down (idle speed)</li>
                      <li>Press B or red button to brake completely</li>
                      <li>Touch checkpoints to learn about Vaibhav's experiences</li>
                      <li>Use Skip button to continue without stopping</li>
                    </ul>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={() => setShowInstructions(false)}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
                >
                  Start Racing! 🏁
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}



