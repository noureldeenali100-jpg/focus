import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Screen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  showNav: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, currentScreen, onNavigate, showNav }) => {
  const tabs = [
    { 
      label: 'Focus', 
      screen: Screen.HOME, 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      )
    },
    { 
      label: 'Tasks', 
      screen: Screen.TASKS, 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      )
    },
    { 
      label: 'Log', 
      screen: Screen.SESSION_HISTORY, 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 15 15"/>
        </svg>
      )
    },
    { 
      label: 'Gear', 
      screen: Screen.SETTINGS, 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1-1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      )
    },
  ];

  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Elevated Sidebar Dock - Desktop */}
      <AnimatePresence>
        {showNav && (
          <motion.aside 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="hidden lg:flex flex-col w-[100px] items-center justify-center shrink-0 z-50 p-6"
          >
            <div className="flex flex-col items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-full py-10 px-2 space-y-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]">
              <div className="w-12 h-12 bg-[var(--accent-color)] rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-[var(--accent-color)]/30">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="flex flex-col space-y-10 items-center">
                {tabs.map((tab) => {
                  const isActive = currentScreen === tab.screen;
                  return (
                    <motion.button 
                      key={tab.screen}
                      onClick={() => onNavigate(tab.screen)}
                      whileTap={{ scale: 0.9 }}
                      className={`group relative p-4 transition-all ${isActive ? 'text-[var(--accent-color)]' : 'text-slate-300 hover:text-slate-500'}`}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeTabIndicatorDesktop"
                          className="absolute inset-0 bg-[var(--accent-subtle)] rounded-full"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <div className="relative z-10">
                        {tab.icon(isActive)}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
        <main className="flex-1 relative overflow-hidden flex flex-col">
          {children}
        </main>

        {/* Elevated Floating Command Dock - Mobile */}
        <AnimatePresence>
          {showNav && (
            <div className="lg:hidden absolute bottom-8 left-0 right-0 flex justify-center px-6 pointer-events-none z-[100]">
              <motion.nav 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="pointer-events-auto h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-around px-4 rounded-full shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)] w-full max-w-sm"
              >
                {tabs.map((tab) => {
                  const isActive = currentScreen === tab.screen;
                  return (
                    <motion.button 
                      key={tab.screen}
                      onClick={() => onNavigate(tab.screen)}
                      whileTap={{ scale: 0.85 }}
                      className={`relative flex items-center justify-center transition-all ${isActive ? 'text-[var(--accent-color)]' : 'text-slate-300 opacity-60'}`}
                    >
                      <div className="relative p-4">
                        {isActive && (
                          <motion.div 
                            layoutId="activeTabIndicatorMobile"
                            className="absolute inset-0 bg-[var(--accent-subtle)] rounded-full"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                        <div className="relative z-10">
                          {tab.icon(isActive)}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.nav>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Layout;