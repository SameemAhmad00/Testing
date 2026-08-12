import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';

interface NavigationContextType {
  canGoBack: boolean;
  goBack: () => void;
  showExitToast: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [historyCount, setHistoryCount] = useState(0);
  const [showExitToast, setShowExitToast] = useState(false);
  const lastBackPressRef = React.useRef(0);

  const goBack = useCallback(() => {
    if (location.pathname === '/') {
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        // Second press within 2s - let the browser handle it (exit)
        // We go back twice: once for the dummy state we pushed, once to actually exit
        window.history.go(-2);
      } else {
        lastBackPressRef.current = now;
        setShowExitToast(true);
        setTimeout(() => setShowExitToast(false), 2000);
        
        // Push trap state again to stay on home and catch next back press
        window.history.pushState({ isTrap: true }, '', window.location.href);
      }
    } else {
      // Normal back navigation
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (location.pathname === '/') {
        // If the state doesn't have our trap flag, it means the user pressed back 
        // while on the Home page (moving from the trap state to the real state)
        if (!event.state?.isTrap) {
          goBack();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // When on Home, ensure we have a trap state in history
    if (location.pathname === '/') {
      // Replace current state with a non-trap state if it's not already marked
      if (!window.history.state?.isHome) {
        window.history.replaceState({ isHome: true }, '', window.location.href);
      }
      // Push the trap state
      window.history.pushState({ isTrap: true }, '', window.location.href);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname, goBack]);

  const canGoBack = location.pathname !== '/';

  return (
    <NavigationContext.Provider value={{ canGoBack, goBack, showExitToast }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
