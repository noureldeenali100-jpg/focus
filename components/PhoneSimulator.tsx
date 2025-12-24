
import React, { useState, useEffect } from 'react';
import { UNALLOWED_APPS, CYCLE_APPS_BASE } from '../constants';
import { AppTimer } from '../types';

interface PhoneSimulatorProps {
  isUnlocked: boolean;
  appTimers: Record<string, AppTimer>;
  cycleAppIds: string[];
  onAppClick: (appId: string, appName: string, isAllowed: boolean) => void;
  onExit: () => void;
}

const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({ isUnlocked, appTimers, cycleAppIds, onAppClick, onExit }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusLabel = (appId: string, baseAllowed: boolean) => {
    if (isUnlocked) return null;
    if (!baseAllowed) return <span className="text-[8px] bg-red-500 text-white px-1 rounded absolute -top-1 -right-1">X</span>;
    
    if (cycleAppIds.includes(appId)) {
      const timer = appTimers[appId];
      if (timer?.lockedUntil && timer.lockedUntil > Date.now()) {
        return <span className="text-[8px] bg-amber-500 text-white px-1 rounded absolute -top-1 -right-1">LOCKED</span>;
      }
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white relative">
      <div className="h-8 flex justify-between items-center px-6 pt-2 text-[10px] font-bold">
        <span>{time}</span>
        <div className="flex items-center space-x-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-4 content-start gap-x-4 gap-y-10">
        {CYCLE_APPS_BASE.concat(UNALLOWED_APPS).map(app => (
          <button 
            key={app.id} 
            onClick={() => onAppClick(app.id, app.name, app.isAllowed)}
            className="flex flex-col items-center space-y-2 active:scale-90 transition-transform relative"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${app.color} shadow-lg relative`}>
              {app.icon}
              {getStatusLabel(app.id, app.isAllowed)}
            </div>
            <span className="text-[10px] font-medium opacity-90 truncate w-full text-center">{app.name}</span>
          </button>
        ))}
      </div>

      <div className="h-10 flex justify-center items-center pb-2">
         <button 
          onClick={onExit}
          className="w-32 h-1 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
        />
      </div>

      <div className="absolute top-12 left-0 right-0 text-center pointer-events-none opacity-40">
        <p className="text-4xl font-extralight tracking-widest">{time}</p>
        <p className="text-xs uppercase tracking-[0.3em] mt-1">Focus Shield v3.0</p>
      </div>
    </div>
  );
};

export default PhoneSimulator;
