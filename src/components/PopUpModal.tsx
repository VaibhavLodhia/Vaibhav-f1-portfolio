import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import contentData from '../data/content.json';

export default function PopUpModal() {
  const { modalOpen, modalContent, closeModal, currentCheckpoint, skipCheckpoint } = useStore();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modalOpen, closeModal]);

  // Focus trap
  useEffect(() => {
    if (modalOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [modalOpen]);

  if (!modalOpen || !modalContent) {
    return null;
  }

  const handleSkip = () => {
    if (currentCheckpoint !== null) {
      skipCheckpoint(currentCheckpoint);
    }
  };

  const handleDownloadResume = () => {
    window.open(contentData.resume.downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const renderContent = () => {
    switch (modalContent) {
      case 'about':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">{contentData.about.title}</h2>
              <p className="text-gray-200 leading-relaxed text-lg">{contentData.about.subtitle}</p>
            </div>
            
            {contentData.about.whatIDo && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-cyan-400">{contentData.about.whatIDo.title}</h3>
                <p className="text-gray-200 leading-relaxed">{contentData.about.whatIDo.description}</p>
                
                {contentData.about.whatIDo.skills && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {contentData.about.whatIDo.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded text-sm border border-cyan-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                
                {contentData.about.whatIDo.bulletPoints && (
                  <ul className="space-y-2 mt-4">
                    {contentData.about.whatIDo.bulletPoints.map((point, idx) => (
                      <li key={idx} className="text-gray-200 leading-relaxed flex items-start">
                        <span className="mr-2">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );

      case 'experiences':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">Experiences</h2>
            <div className="space-y-4">
              {contentData.experiences.map((exp, idx) => (
                <div key={idx} className="border-l-4 border-cyan-400 pl-4">
                  <h3 className="text-xl font-semibold text-white">{exp.title}</h3>
                  <p className="text-cyan-300 text-sm">{exp.company} • {exp.duration}</p>
                  <p className="text-gray-200 mt-2">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">Projects</h2>
            <div className="space-y-4">
              {contentData.projects.map((project, idx) => (
                <div key={idx} className="bg-black/30 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                  <p className="text-gray-200 mt-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.tech && project.tech.map((tech, techIdx) => (
                      <span
                        key={techIdx}
                        className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-4">
                    {project.liveLink && (
                      <a
                        href={project.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-cyan-500/30 text-cyan-300 rounded hover:bg-cyan-500/40 transition-colors text-sm font-medium"
                      >
                        See Live
                      </a>
                    )}
                    {project.sourceLink && (
                      <a
                        href={project.sourceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-cyan-500/30 text-cyan-300 rounded hover:bg-cyan-500/40 transition-colors text-sm font-medium"
                      >
                        Source Code
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'tech':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(contentData.techStack).map(([category, skills]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-2">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white/10 text-white rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'resume':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">Resume</h2>
            <p className="text-gray-200 mb-6">
              View my complete resume to learn more about my professional experience, skills, and achievements.
            </p>
            <button
              onClick={handleDownloadResume}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
            >
              View Resume
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {modalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            onClick={closeModal}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: 'spring' }}
            className="fixed inset-0 flex items-center justify-center z-[60] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10 p-8">
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:text-cyan-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
                aria-label="Close modal"
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

              {/* Skip button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-16 text-white/70 hover:text-cyan-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-3 py-1"
                aria-label="Skip checkpoint"
              >
                Skip
              </button>

              {/* Content */}
              <div className="mt-4">{renderContent()}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

