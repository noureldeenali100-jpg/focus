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
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      )
    },
    { 
      label: 'Tasks', 
      screen: Screen.TASKS, 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      )
    },
    { 
      label: 'Apps', 
      screen: Screen.ALLOWED_APPS, 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
          <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      )
    },
    { 
      label: 'Settings', 
      screen: Screen.SETTINGS, 
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1-1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
        </svg>
      )
    },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative transition-colors duration-500">
      <div className="h-[env(safe-area-inset-top,20px)] bg-transparent w-full shrink-0" />
      
      <main className={`flex-1 overflow-y-auto no-scrollbar relative z-10 transition-opacity duration-300 ${showNav ? 'pb-[calc(72px+env(safe-area-inset-bottom,12px))]' : ''}`}>
        <div key={currentScreen} className="page-transition h-full w-full">
          {children}
        </div>
      </main>

      {showNav && (
        <nav className="absolute bottom-0 left-0 right-0 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-around px-2 z-50 animate-in slide-in-from-bottom duration-500">
          {tabs.map((tab) => {
            const isActive = currentScreen === tab.screen;
            return (
              <button 
                key={tab.screen}
                onClick={() => onNavigate(tab.screen)}
                className={`flex flex-col items-center justify-center space-y-1 w-1/4 transition-all duration-300 relative active:scale-90 touch-none py-1 group`}
              >
                <div className={`p-2 rounded-2xl transition-all duration-500 ${isActive ? 'text-[var(--accent-color)] scale-110' : 'text-slate-400 dark:text-slate-500 opacity-60 group-hover:opacity-100'}`}>
                  {tab.icon(isActive)}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter transition-all duration-300 ${isActive ? 'text-[var(--accent-color)] translate-y-0.5' : 'text-slate-400 dark:text-slate-500 opacity-60'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default Layout;