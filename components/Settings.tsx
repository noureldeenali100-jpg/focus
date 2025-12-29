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
    
    const initCanvas = () => {
      const canvas = canvasRef.current; if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr); canvas.height = Math.floor(rect.height * dpr);
      const ctx = canvas.getContext('2d', { desynchronized: true, alpha: true }); if (!ctx) return;
      ctx.scale(dpr, dpr); ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000';
      ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    };

    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [isUpdatingSignature]);

  const saveSignature = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    onProfileImageChange(canvas.toDataURL('image/png', 1.0));
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

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasNewSignature(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto scroll-container no-scrollbar w-full">
      <div className="px-8 pt-10 pb-32 w-full max-w-7xl mx-auto animate-in fade-in">
        <header className="mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{t.config}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium">{t.tailor}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          <section className="space-y-10">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 px-2">{t.profile}</h3>
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[40px] p-8 shadow-sm space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative shrink-0 group">
                    {profileImage && !profileImage.startsWith('data:image/png') ? (
                      <img src={profileImage} alt="Avatar" className="w-20 h-20 rounded-[28px] object-cover border-2 border-white dark:border-slate-800 shadow-md" />
                    ) : (
                      <div className="w-20 h-20 rounded-[28px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                    )}
                    <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-8 h-8 rounded-2xl bg-[var(--accent-color)] text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg></button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-2">{t.displayName}</p>
                    <input type="text" value={userName} onChange={(e) => onNameChange(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-extrabold text-slate-800 dark:text-slate-100 outline-none focus:border-[var(--accent-color)] placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-6">{t.pledge}</p>
                  {isUpdatingSignature ? (
                    <div className="space-y-6">
                      <div className="w-full h-48 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden relative group touch-none">
                        <canvas 
                          ref={canvasRef} 
                          onMouseDown={(e) => { 
                            isDrawing.current = true; 
                            const rect = canvasRef.current?.getBoundingClientRect();
                            if (rect) lastPoint.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }; 
                          }} 
                          onMouseMove={(e) => { 
                            if (!isDrawing.current || !lastPoint.current) return; 
                            const canvas = canvasRef.current;
                            const ctx = canvas?.getContext('2d'); 
                            const rect = canvas?.getBoundingClientRect();
                            if (!ctx || !rect) return; 
                            const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top }; 
                            ctx.beginPath(); 
                            ctx.moveTo(lastPoint.current.x, lastPoint.current.y); 
                            ctx.lineTo(pos.x, pos.y); 
                            ctx.stroke(); 
                            lastPoint.current = pos; 
                            setHasNewSignature(true); 
                          }} 
                          onMouseUp={() => isDrawing.current = false} 
                          onMouseLeave={() => isDrawing.current = false}
                          onTouchStart={(e) => {
                            isDrawing.current = true;
                            const rect = canvasRef.current?.getBoundingClientRect();
                            if (rect) lastPoint.current = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
                          }}
                          onTouchMove={(e) => {
                            if (!isDrawing.current || !lastPoint.current) return;
                            const canvas = canvasRef.current;
                            const ctx = canvas?.getContext('2d');
                            const rect = canvas?.getBoundingClientRect();
                            if (!ctx || !rect) return;
                            const pos = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
                            ctx.beginPath();
                            ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
                            ctx.lineTo(pos.x, pos.y);
                            ctx.stroke();
                            lastPoint.current = pos;
                            setHasNewSignature(true);
                          }}
                          onTouchEnd={() => isDrawing.current = false}
                          className="w-full h-full cursor-crosshair touch-none" 
                        />
                      </div>
                      <div className="flex gap-4">
                        <button onClick={clearCanvas} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">Clear</button>
                        <button disabled={!hasNewSignature} onClick={saveSignature} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${hasNewSignature ? 'bg-[var(--accent-color)] text-white shadow-xl active:scale-95' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}>{t.save}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-6">
                      <div className="w-full h-40 bg-slate-100 dark:bg-slate-950 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center p-10 shadow-inner relative overflow-hidden">
                        {signatureImage ? (
                          <img 
                            src={signatureImage} 
                            alt="Signature" 
                            className="w-full h-full object-contain dark:invert opacity-100 transition-opacity" 
                          />
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">{t.noSignature}</span>
                        )}
                      </div>
                      <button onClick={() => setIsUpdatingSignature(true)} className="text-[11px] font-black text-[var(--accent-color)] uppercase tracking-widest bg-[var(--accent-subtle)] py-4 rounded-2xl hover:brightness-105 active:scale-95 transition-all">{t.resign}</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-10">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 px-2">{t.interface}</h3>
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[40px] p-8 shadow-sm space-y-10">
                <div>
                  <p className="text-xs md:text-sm font-black text-slate-700 dark:text-slate-300 mb-5 px-1">{t.colorMode}</p>
                  <div className="flex bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl gap-2">
                    {(['light', 'dark', 'system'] as Theme[]).map((tMode) => (
                      <button key={tMode} onClick={() => onThemeChange(tMode)} className={`flex-1 py-4 text-[10px] md:text-xs font-black uppercase rounded-xl transition-all ${theme === tMode ? 'bg-white dark:bg-slate-800 text-[var(--accent-color)] shadow-md' : 'text-slate-400 dark:text-slate-500'}`}>{tMode}</button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-xs md:text-sm font-black text-slate-700 dark:text-slate-300 mb-5 px-1">{t.brandAccent}</p>
                  <div className="grid grid-cols-6 gap-4 px-1">
                    {accentColors.map((color) => (
                      <button key={color} onClick={() => onAccentChange(color)} className={`aspect-square rounded-2xl border-4 flex items-center justify-center transition-all ${accentColor === color ? 'border-[var(--accent-color)] ring-4 ring-[var(--accent-color)]/10 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: getAccentHex(color) }}>{accentColor === color && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}</button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-xs md:text-sm font-black text-slate-700 dark:text-slate-300 mb-5 px-1">{t.fontStyle}</p>
                  <div className="flex bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl gap-2 overflow-x-auto no-scrollbar">
                    {fonts.map((f) => (
                      <button key={f} onClick={() => onFontChange(f as AppFont)} className={`flex-1 min-w-[100px] py-4 text-[10px] md:text-xs font-black uppercase rounded-xl transition-all ${font === f ? 'bg-white dark:bg-slate-800 text-[var(--accent-color)] shadow-md' : 'text-slate-400 dark:text-slate-500'}`}>{f}</button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs md:text-sm font-black text-slate-700 dark:text-slate-300">{t.disableAnimations}</p>
                    <button 
                      onClick={onToggleAnimations}
                      className={`w-14 h-7 rounded-full transition-colors relative ${!isAnimationsEnabled ? 'bg-[var(--accent-color)]' : 'bg-slate-200 dark:bg-slate-800'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${!isAnimationsEnabled ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>
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