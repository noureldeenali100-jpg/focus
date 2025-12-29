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
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-500 ${active ? 'scale-110' : 'scale-100 opacity-40'}`}>
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      )
    },
    { 
      label: 'Tasks', 
      screen: Screen.TASKS, 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-500 ${active ? 'scale-110' : 'scale-100 opacity-40'}`}>
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      )
    },
    { 
      label: 'Log', 
      screen: Screen.SESSION_HISTORY, 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-500 ${active ? 'scale-110' : 'scale-100 opacity-40'}`}>
          <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 15 15"/>
        </svg>
      )
    },
    { 
      label: 'Gear', 
      screen: Screen.SETTINGS, 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-500 ${active ? 'scale-110' : 'scale-100 opacity-40'}`}>
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      )
    },
  ];

  return (
    <div className={`h-full w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 overflow-hidden`}>
      {/* Structural Sidebar - Desktop */}
      <AnimatePresence>
        {showNav && (
          <motion.aside 
            initial={{ x: -110 }}
            animate={{ x: 0 }}
            exit={{ x: -110 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden lg:flex flex-col w-[110px] bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 items-center py-14 shrink-0 z-50"
          >
            <div className="w-14 h-14 bg-[var(--accent-color)] rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-[var(--accent-color)]/20 mb-20 rotate-3 transition-transform hover:rotate-0 cursor-default">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div className="flex flex-col space-y-12 items-center flex-1 w-full">
              {tabs.map((tab) => {
                const isActive = currentScreen === tab.screen;
                return (
                  <motion.button 
                    key={tab.screen}
                    onClick={() => onNavigate(tab.screen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`group relative flex flex-col items-center transition-all duration-300 ${isActive ? 'text-[var(--accent-color)]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  >
                    <div className="relative p-3 rounded-2xl">
                      {isActive && (
                        <motion.div 
                          layoutId="activeTabIndicatorDesktop"
                          className="absolute inset-0 bg-[var(--accent-subtle)] shadow-inner rounded-2xl"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <div className="relative z-10">
                        {tab.icon(isActive)}
                      </div>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-3 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                      {tab.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Interaction Stage */}
      <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
        <main className="flex-1 relative overflow-hidden flex flex-col">
          {children}
        </main>

        {/* Structural Bottom Nav - Mobile */}
        <AnimatePresence>
          {showNav && (
            <motion.nav 
              initial={{ y: 96 }}
              animate={{ y: 0 }}
              exit={{ y: 96 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden h-24 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-around px-4 shrink-0 z-50"
            >
              {tabs.map((tab) => {
                const isActive = currentScreen === tab.screen;
                return (
                  <motion.button 
                    key={tab.screen}
                    onClick={() => onNavigate(tab.screen)}
                    whileTap={{ scale: 0.9 }}
                    className={`relative flex flex-col items-center justify-center w-1/4 transition-all duration-500 ${isActive ? 'text-[var(--accent-color)] translate-y-[-4px]' : 'text-slate-400 opacity-60'}`}
                  >
                    <div className="relative p-4 rounded-[22px]">
                      {isActive && (
                        <motion.div 
                          layoutId="activeTabIndicatorMobile"
                          className="absolute inset-0 bg-[var(--accent-subtle)] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] rounded-[22px]"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <div className="relative z-10">
                        {tab.icon(isActive)}
                      </div>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest mt-1 transition-all ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                      {tab.label}
                    </span>
                  </motion.button>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Layout;