import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import contentData from '../data/content.json';

export default function FinishOverlay() {
  const { phase, openModal } = useStore();

  if (phase !== 'finish') return null;

  const handleDownloadResume = () => {
    window.open(contentData.resume.downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handleRestartRace = () => {
    window.location.reload();
  };

  const buttons = [
    { label: 'About Me', action: () => openModal('about') },
    { label: 'Experiences', action: () => openModal('experiences') },
    { label: 'Projects', action: () => openModal('projects') },
    { label: 'Skills', action: () => openModal('tech') },
    { label: 'Download Resume', action: handleDownloadResume },
    { label: 'Restart Race', action: handleRestartRace },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
    >
      <div className="text-center space-y-8">
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 2.5 }}
          className="text-6xl font-bold text-white mb-4"
        >
          🏁 Race Complete! 🏁
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 3 }}
          className="text-2xl text-cyan-400 mb-12"
        >
          Welcome to {contentData.name}'s Portfolio
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {buttons.map((button, idx) => (
            <motion.button
              key={button.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 3.5 + idx * 0.1 }}
              onClick={button.action}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {button.label}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}



