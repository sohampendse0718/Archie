'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function GenerationLoadingScreen({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/80 backdrop-blur-md pointer-events-none"
        >
          {/* Animated Background Orbits */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute w-[300px] h-[300px] border border-indigo-500/20 rounded-full border-t-indigo-400"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute w-[400px] h-[400px] border border-purple-500/20 rounded-full border-b-purple-400"
            />
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-3xl"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Core Pulsating Shape */}
            <div className="relative flex items-center justify-center w-24 h-24">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 border-2 border-indigo-400/50 rounded-xl"
              />
              <motion.div
                animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 border-2 border-purple-400/50 rounded-xl rotate-45"
              />
              <div className="w-8 h-8 bg-indigo-500 rounded-lg shadow-[0_0_30px_rgba(99,102,241,0.8)] animate-pulse" />
            </div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-surface/90 border border-indigo-500/30 px-6 py-4 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.2)] backdrop-blur-xl"
            >
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                Architecting your vision...
              </h2>
              <p className="text-sm text-muted mt-2 text-center">
                AI is analyzing your prompt and generating nodes.
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
