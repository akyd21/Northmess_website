import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="page-container">
      <div className="content-container flex flex-col items-center justify-center text-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          {/* Animated 404 */}
          <div className="relative mb-8">
            <h1 className="text-[10rem] md:text-[14rem] font-display font-black text-dark-100 dark:text-dark-800 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="text-6xl"
              >
                🍽️
              </motion.div>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-display font-bold text-dark-900 dark:text-white mb-3">
            Oops! This page is off the menu
          </h2>
          <p className="text-dark-500 dark:text-dark-400 max-w-md mx-auto mb-10">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back to something delicious.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/"
              className="btn-primary inline-flex items-center gap-2"
            >
              <FiHome size={18} />
              Back to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <FiArrowLeft size={18} />
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
