import React, { useRef, useState, useEffect } from 'react';
import { Theme, AccentColor, FocusSession, FocusSound, AppFont, Screen } from '../types';

interface SettingsProps {
  theme: Theme; accentColor: AccentColor; font: AppFont; isSoundEnabled: boolean; isAnimationsEnabled: boolean; focusSound: FocusSound;
  userName: string; profileImage: string | null; signatureImage: string | null;
  sessionLogs: FocusSession[];
  onThemeChange: (t: Theme) => void; onAccentChange: (c: AccentColor) => void; onFontChange: (f: AppFont) => void;
  onToggleSound: () => void; onToggleAnimations: () => void; onSetFocusSound: (s: FocusSound) => void; onNameChange: (name: string) => void;
  onProfileImageChange: (base64: string) => void;
  onNavigate: (s: Screen) => void;
}

const getAccentHex = (color: AccentColor): string => {
  switch (color) {
    case 'blue': return '#2563eb'; case 'emerald': return '#10b981'; case 'purple': return '#9333ea';
    case 'amber': return '#d97706'; case 'rose': return '#e11d48'; case 'slate': return '#475569';
    default: return '#2563eb';
  }
};

const Settings: React.FC<SettingsProps> = ({ 
  theme, accentColor, font, isSoundEnabled, isAnimationsEnabled, focusSound, userName, profileImage, signatureImage,
  sessionLogs,
  onThemeChange, onAccentChange, onFontChange, onToggleSound, onToggleAnimations, onSetFocusSound, onNameChange, onProfileImageChange,
  onNavigate
}) => {
  const accentColors: AccentColor[] = ['blue', 'emerald', 'purple', 'amber', 'rose', 'slate'];
  const fonts = ['Inter', 'System', 'Serif', 'Mono'];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [isUpdatingSignature, setIsUpdatingSignature] = useState(false);
  const [hasNewSignature, setHasNewSignature] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isUpdatingSignature) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr); canvas.height = Math.floor(rect.height * dpr);
    const ctx = canvas.getContext('2d', { desynchronized: true, alpha: true }); if (!ctx) return;
    ctx.scale(dpr, dpr); ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000';
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  }, [isUpdatingSignature]);

  const saveSignature = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    onProfileImageChange(canvas.toDataURL('image/png', 0.8));
    setIsUpdatingSignature(false); setHasNewSignature(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onProfileImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const t = { 
    config: "Settings", tailor: "Personalize your workspace.", interface: "Interface Style", colorMode: "Lighting Mode", brandAccent: "Focus Color", fontStyle: "Font Setting", disableAnimations: "Disable Animations", profile: "Personal Profile", displayName: "Your Name", pledge: "Personal Pledge", resign: "Change Signature", save: "Sign Pledge", clear: "Clear", cancel: "Cancel", noSignature: "No signature on file." 
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto scroll-container no-scrollbar">
      <div className="px-8 pt-10 pb-24 w-full max-w-lg mx-auto">
        <header className="mb-12 animate-in fade-in duration-700">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{t.config}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t.tailor}</p>
        </header>

        <div className="space-y-10">
          <section>
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 px-2">{t.profile}</h3>
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[36px] p-6 shadow-sm space-y-8">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0 group">
                  {profileImage && !profileImage.startsWith('data:image/png') ? (
                    <img src={profileImage} alt="Avatar" className="w-16 h-16 rounded-[22px] object-cover border-2 border-white dark:border-slate-800" />
                  ) : (
                    <div className="w-16 h-16 rounded-[22px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  )}
                  <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-[var(--accent-color)] text-white flex items-center justify-center shadow-lg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg></button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-2">{t.displayName}</p>
                  <input type="text" value={userName} onChange={(e) => onNameChange(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-extrabold text-slate-800 dark:text-slate-100 outline-none focus:border-[var(--accent-color)] placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-4">{t.pledge}</p>
                {isUpdatingSignature ? (
                  <div className="space-y-5">
                    <div className="w-full h-44 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden relative group touch-none">
                      <canvas ref={canvasRef} onMouseDown={(e) => { isDrawing.current = true; lastPoint.current = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }; }} onMouseMove={(e) => { if (!isDrawing.current || !lastPoint.current) return; const ctx = canvasRef.current?.getContext('2d'); if (!ctx) return; const pos = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }; ctx.beginPath(); ctx.moveTo(lastPoint.current.x, lastPoint.current.y); ctx.lineTo(pos.x, pos.y); ctx.stroke(); lastPoint.current = pos; setHasNewSignature(true); }} onMouseUp={() => isDrawing.current = false} onMouseLeave={() => isDrawing.current = false} className="w-full h-full cursor-crosshair touch-none" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setIsUpdatingSignature(false)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase">{t.cancel}</button>
                      <button disabled={!hasNewSignature} onClick={saveSignature} className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase ${hasNewSignature ? 'bg-[var(--accent-color)] text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}>{t.save}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    <div className="w-full h-28 bg-slate-50 dark:bg-slate-950 rounded-3xl border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center p-6 shadow-inner">
                      {signatureImage ? <img src={signatureImage} alt="Signature" className="max-w-full max-h-full object-contain dark:invert opacity-90" /> : <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">{t.noSignature}</span>}
                    </div>
                    <button onClick={() => setIsUpdatingSignature(true)} className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest bg-[var(--accent-subtle)] py-3 rounded-2xl hover:brightness-105">{t.resign}</button>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 px-2">{t.interface}</h3>
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[36px] p-6 shadow-sm space-y-8">
              <div>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-4 px-1">{t.colorMode}</p>
                <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl gap-1.5">
                  {(['light', 'dark', 'system'] as Theme[]).map((tMode) => (
                    <button key={tMode} onClick={() => onThemeChange(tMode)} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${theme === tMode ? 'bg-white dark:bg-slate-800 text-[var(--accent-color)] shadow-md' : 'text-slate-400 dark:text-slate-500'}`}>{tMode}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-4 px-1">{t.brandAccent}</p>
                <div className="grid grid-cols-6 gap-4 px-1">
                  {accentColors.map((color) => (
                    <button key={color} onClick={() => onAccentChange(color)} className={`aspect-square rounded-2xl border-4 flex items-center justify-center transition-all ${accentColor === color ? 'border-[var(--accent-color)] ring-4 ring-[var(--accent-color)]/10 scale-110 shadow-lg' : 'border-transparent'}`} style={{ backgroundColor: getAccentHex(color) }}>{accentColor === color && <div className="w-2 h-2 rounded-full bg-white" />}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-4 px-1">{t.fontStyle}</p>
                <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl gap-1.5 overflow-x-auto no-scrollbar">
                  {fonts.map((f) => (
                    <button key={f} onClick={() => onFontChange(f as AppFont)} className={`flex-1 min-w-[80px] py-3 text-[10px] font-black uppercase rounded-xl transition-all ${font === f ? 'bg-white dark:bg-slate-800 text-[var(--accent-color)] shadow-md' : 'text-slate-400 dark:text-slate-500'}`}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">{t.disableAnimations}</p>
                  <button 
                    onClick={onToggleAnimations}
                    className={`w-12 h-6 rounded-full transition-colors relative ${!isAnimationsEnabled ? 'bg-[var(--accent-color)]' : 'bg-slate-200 dark:bg-slate-800'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${!isAnimationsEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;