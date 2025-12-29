import React from 'react';
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
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      )
    },
    { 
      label: 'Checklist', 
      screen: Screen.TASKS, 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      )
    },
    { 
      label: 'History', 
      screen: Screen.SESSION_HISTORY, 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
          <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 15 15"/>
        </svg>
      )
    },
    { 
      label: 'Settings', 
      screen: Screen.SETTINGS, 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1-1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
        </svg>
      )
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* Desktop Sidebar (Sidebar driven) */}
      {showNav && (
        <aside className="hidden lg:flex flex-col w-[100px] bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 items-center py-12 shrink-0 z-50">
          <div className="w-14 h-14 bg-[var(--accent-color)] rounded-3xl flex items-center justify-center text-white shadow-xl shadow-[var(--accent-color)]/20 mb-14">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div className="flex flex-col space-y-10 items-center flex-1 w-full">
            {tabs.map((tab) => {
              const isActive = currentScreen === tab.screen;
              return (
                <button 
                  key={tab.screen}
                  onClick={() => onNavigate(tab.screen)}
                  className={`group flex flex-col items-center p-3 rounded-3xl transition-all duration-300 ${isActive ? 'bg-[var(--accent-subtle)] text-[var(--accent-color)]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                  {tab.icon(isActive)}
                  <span className={`text-[10px] font-black uppercase tracking-widest mt-2 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {/* Primary Content Stage */}
      <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
        <main className="flex-1 relative overflow-hidden flex flex-col">
          <div key={currentScreen} className="page-transition flex-1 w-full h-full">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation (Strict Structural Sibling) */}
        {showNav && (
          <nav className="lg:hidden h-24 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-around px-4 shrink-0 z-50">
            {tabs.map((tab) => {
              const isActive = currentScreen === tab.screen;
              return (
                <button 
                  key={tab.screen}
                  onClick={() => onNavigate(tab.screen)}
                  className={`flex flex-col items-center justify-center w-1/4 transition-all duration-300 ${isActive ? 'text-[var(--accent-color)] translate-y-[-4px]' : 'text-slate-400 opacity-60'}`}
                >
                  <div className={`p-3 rounded-2xl transition-all ${isActive ? 'bg-[var(--accent-subtle)]' : ''}`}>
                    {tab.icon(isActive)}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tighter mt-1 transition-all ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
};

export default Layout;