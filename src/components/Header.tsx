import React from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { ArrowLeft, Menu, Search, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Header: React.FC = () => {
  const { canGoBack, goBack } = useNavigation();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {canGoBack ? (
              <motion.button
                key="back"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={goBack}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </motion.button>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="p-2 -ml-2"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </motion.div>
            )}
          </AnimatePresence>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            App Name
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Search className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <User className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </header>
  );
};
