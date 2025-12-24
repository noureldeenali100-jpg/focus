import React from 'react';
import { Theme, AccentColor } from '../types';

interface SettingsProps {
  theme: Theme;
  accentColor: AccentColor;
  isSoundEnabled: boolean;
  onThemeChange: (t: Theme) => void;
  onAccentChange: (c: AccentColor) => void;
  onToggleSound: () => void;
}

const getAccentHex = (color: AccentColor): string => {
  switch (color) {
    case 'blue': return '#2563eb';
    case 'emerald': return '#10b981';
    case 'purple': return '#9333ea';
    case 'amber': return '#d97706';
    case 'rose': return '#e11d48';
    case 'slate': return '#475569';
    default: return '#2563eb';
  }
};

const Settings: React.FC<SettingsProps> = ({ 
  theme, accentColor, isSoundEnabled, onThemeChange, onAccentChange, onToggleSound
}) => {
  const accentColors: AccentColor[] = ['blue', 'emerald', 'purple', 'amber', 'rose', 'slate'];

  return (
    <div className="px-6 pt-6 pb-24 bg-slate-50 dark:bg-slate-950 min-h-full">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">Configuration</h2>
        <p className="text-slate-500 dark:text-slate-300 text-sm font-medium leading-tight">Tailor your focus environment</p>
      </header>

      <div className="space-y-8">
        {/* Appearance Section */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-4 px-1">Interface</h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-3">Color Mode</p>
              <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl">
                {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => onThemeChange(t)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tight rounded-lg transition-all active:scale-98 ${theme === t ? 'bg-white dark:bg-slate-800 text-[var(--accent-color)] shadow-sm' : 'text-slate-400 dark:text-slate-400'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-3">Brand Accent</p>
              <div className="grid grid-cols-6 gap-3">
                {accentColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onAccentChange(color)}
                    className={`aspect-square rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${accentColor === color ? 'border-[var(--accent-color)] ring-2 ring-[var(--accent-color)]/10' : 'border-transparent'}`}
                    style={{ backgroundColor: getAccentHex(color) }}
                  >
                    {accentColor === color && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Behavior Section */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-4 px-1">System Security</h3>
          <div className="space-y-3">
            <button
              onClick={onToggleSound}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm active:scale-98 transition-transform"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSoundEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {isSoundEnabled ? <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/> : <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>}
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">Auditory Feedback</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase tracking-tighter">System sound effects</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${isSoundEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isSoundEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </button>

            <button
              disabled={true}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm opacity-50 cursor-not-allowed"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">Master Unlock</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase tracking-tighter">Secure PIN Required</p>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-200 dark:text-slate-700"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </section>

        <footer className="pt-8 text-center">
          <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">Guardian Pro Core v3.1</p>
        </footer>
      </div>
    </div>
  );
};

export default Settings;