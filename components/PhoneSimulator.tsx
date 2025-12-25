import React, { useState, useEffect } from 'react';
import { UNALLOWED_APPS, CYCLE_APPS_BASE } from '../constants';
import { AppTimer, UnlockRequest, AppInfo } from '../types';
import AppIcon from './AppIcon';

interface PhoneSimulatorProps {
  isUnlocked: boolean;
  appTimers: Record<string, AppTimer>;
  cycleAppIds: string[];
  unlockRequests: Record<string, UnlockRequest>;
  customApps: AppInfo[];
  isTimerRunning: boolean; 
  onAppClick: (appId: string, appName: string, isAllowed: boolean) => void;
  onExit: () => void;
}

const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({ 
  isUnlocked, 
  appTimers, 
  cycleAppIds, 
  unlockRequests,
  customApps,
  isTimerRunning,
  onAppClick, 
  onExit 
}) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusLabel = (appId: string, app: AppInfo) => {
    if (isUnlocked) return null;
    
    if (app.isPermanentBlock) {
        return <span className="text-[7px] bg-red-900 text-white px-1 rounded absolute -top-1 -right-1 font-black shadow-sm z-10 animate-in zoom-in duration-300">CORE</span>;
    }

    const request = unlockRequests[appId];
    if (request) {
      if (request.expiresAt && Date.now() < request.expiresAt) {
        return <span className="text-[8px] bg-emerald-500 text-white px-1 rounded absolute -top-1 -right-1 font-black shadow-sm z-10 animate-in zoom-in duration-300">AVAIL</span>;
      }
      if (!request.expiresAt) {
        return <span className="text-[8px] bg-amber-500 text-white px-1 rounded absolute -top-1 -right-1 font-black shadow-sm z-10 animate-in zoom-in duration-300">WAITING</span>;
      }
    }

    if (isTimerRunning && !app.isAllowed) {
        return <span className="text-[8px] bg-red-600 text-white px-1 rounded absolute -top-1 -right-1 font-black shadow-sm z-10 animate-in zoom-in duration-300">FOCUS</span>;
    }

    if (!app.isAllowed) return <span className="text-[8px] bg-red-500 text-white px-1 rounded absolute -top-1 -right-1 font-black z-10 animate-in zoom-in duration-300">LOCKED</span>;
    
    if (cycleAppIds.includes(appId)) {
      const timer = appTimers[appId];
      if (timer?.lockedUntil && timer.lockedUntil > Date.now()) {
        return <span className="text-[8px] bg-amber-500 text-white px-1 rounded absolute -top-1 -right-1 font-black z-10 animate-in zoom-in duration-300">LOCKED</span>;
      }
    }
    return null;
  };

  const allApps = CYCLE_APPS_BASE.concat(UNALLOWED_APPS).concat(customApps);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white relative w-full animate-in fade-in duration-500">
      <div className="h-8 flex justify-between items-center px-6 pt-2 text-[10px] font-bold shrink-0">
        <span>{time}</span>
        <div className="flex items-center space-x-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-4 content-start gap-x-4 gap-y-10 overflow-y-auto no-scrollbar">
        {allApps.map((app, index) => {
          const request = unlockRequests[app.id];
          const isActuallyUnlocked = request?.expiresAt && Date.now() < request.expiresAt;
          
          return (
            <button 
              key={app.id} 
              onClick={() => onAppClick(app.id, app.name, app.isAllowed)}
              className="flex flex-col items-center space-y-2 active:scale-90 transition-all relative select-none animate-in zoom-in-95 duration-300"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div 
                className={`w-14 h-14 bg-transparent relative transition-all duration-300 
                ${(!app.isAllowed && !isActuallyUnlocked) ? 'opacity-40 grayscale' : 'opacity-100 grayscale-0'} hover:scale-105 active:scale-90`}
              >
                <AppIcon appId={app.id} className="w-full h-full" />
                {getStatusLabel(app.id, app)}
              </div>
              <span className="text-[10px] font-medium opacity-90 truncate w-full text-center">{app.name}</span>
            </button>
          );
        })}
      </div>

      <div className="h-12 flex justify-center items-center pb-4 shrink-0">
         <button 
          onClick={onExit}
          className="w-32 h-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-all active:scale-95 duration-200"
          aria-label="Exit Simulator"
        />
      </div>

      <div className="absolute top-1/2 left-0 right-0 text-center pointer-events-none opacity-10 -translate-y-1/2 select-none">
        <p className="text-6xl font-black tracking-widest">{time}</p>
        <p className="text-xs uppercase tracking-[0.5em] mt-2">Guardian Security Layer</p>
      </div>
    </div>
  );
};

export default PhoneSimulator;