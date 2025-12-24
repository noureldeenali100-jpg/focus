
import React from 'react';
import { Theme, AccentColor } from '../types';

interface SettingsProps {
  theme: Theme;
  accentColor: AccentColor;
  onThemeChange: (t: Theme) => void;
  onAccentChange: (c: AccentColor) => void;
  onUnlockRequest: () => void;
  isUnlocked: boolean;
}

const Settings: React.FC<SettingsProps> = ({ 
  theme, accentColor, onThemeChange, onAccentChange, onUnlockRequest, isUnlocked
}) => {
  const accentColors: AccentColor[] = ['blue', 'emerald', 'purple', 'amber', 'rose', 'slate'];

  return (
    <div className="p-8 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700 bg-slate-50 dark:bg-slate-950 min-h-full">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Configure</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Fine-tune your focus environment</p>
      </header>

      <section className="space-y-10">
        {/* Appearance Section */}
        <div>
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Visual Identity</h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] p-8 shadow-sm space-y-8">
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tight">Theme Palette</p>
              <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-[24px]">
                {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => onThemeChange(t)}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[18px] transition-all duration-300 ${theme === t ? 'bg-white dark:bg-slate-800 text-[var(--accent-color)] shadow-xl shadow-slate-200/50 dark:shadow-none' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tight">Accent Signature</p>
              <div className="grid grid-cols-6 gap-4">
                {accentColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onAccentChange(color)}
                    className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 ${accentColor === color ? 'border-slate-200 dark:border-slate-700 ring-4 ring-[var(--accent-color)]/20' : 'border-transparent'}`}
                    style={{ backgroundColor: { blue:'#2563eb', emerald:'#10b981', purple:'#9333ea', amber:'#d97706', rose:'#e11d48', slate:'#475569' }[color] }}
                  >
                    {accentColor === color && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System & Security */}
        <div>
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Privacy & Guard</h3>
          <div className="space-y-4">
            <button
              onClick={onUnlockRequest}
              disabled={isUnlocked}
              className={`w-full flex items-center justify-between p-6 rounded-[36px] border transition-all duration-300 ${isUnlocked ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:border-[var(--accent-color)]/20 active:scale-98'}`}
            >
              <div className="flex items-center space-x-5">
                <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-colors ${isUnlocked ? 'bg-emerald-500 text-white' : 'bg-[var(--accent-color)]/10 text-[var(--accent-color)]'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {isUnlocked ? <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/> : <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800 dark:text-slate-100 tracking-tight">{isUnlocked ? 'Shield Paused' : 'Master Unlock'}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isUnlocked ? '5m Remaining' : 'Requires PIN'}</p>
                </div>
              </div>
              {!isUnlocked && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><polyline points="9 18 15 12 9 6"/></svg>}
            </button>
          </div>
        </div>

        <div className="p-8 text-center flex flex-col items-center">
           <div className="w-10 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mb-4" />
          <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">Guardian Enterprise v9.0</p>
        </div>
      </section>
    </div>
  );
};

export default Settings;
