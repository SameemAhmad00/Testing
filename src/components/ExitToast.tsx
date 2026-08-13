import React from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';

export const ExitToast: React.FC = () => {
  const { showExitToast } = useNavigation();

  return (
    <AnimatePresence>
      {showExitToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-max max-w-[90vw]"
        >
          <div className="flex items-center gap-3 bg-gray-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl border border-white/10">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-medium tracking-wide">
              Press back again to exit app
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
