import { useState, useEffect } from 'react';

export default function LandscapeOrientation() {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      ) || window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };

    // Check orientation
    const checkOrientation = () => {
      const isPortraitMode = window.innerHeight > window.innerWidth;
      setIsPortrait(isPortraitMode);
    };

    // Initial checks
    checkMobile();
    checkOrientation();

    // Listen for orientation changes
    const handleResize = () => {
      checkMobile();
      checkOrientation();
    };

    // Listen for orientation change events (for mobile devices)
    const handleOrientationChange = () => {
      setTimeout(() => {
        checkOrientation();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Only show overlay on mobile devices in portrait mode
  if (!isMobile || !isPortrait) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center">
      <div className="text-center px-8 max-w-md">
        <div className="mb-8">
          <svg
            className="w-32 h-32 mx-auto text-cyan-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">
          Please Rotate Your Device
        </h2>
        <p className="text-lg text-gray-300 mb-6">
          This experience is best viewed in landscape mode. Please rotate your device to continue.
        </p>
        <div className="text-cyan-400 text-4xl animate-bounce">
          ↻
        </div>
      </div>
    </div>
  );
}

