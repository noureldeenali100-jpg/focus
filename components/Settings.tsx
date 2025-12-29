import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const handlePointerDown = (e: React.PointerEvent) => {
    isDrawing.current = true;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) lastPoint.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
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
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    lastPoint.current = null;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden w-full font-sans transition-colors duration-500">
      <section className="flex-1 px-8 pt-12 overflow-y-auto no-scrollbar w-full animate-in fade-in duration-700">
        <div className="max-w-5xl mx-auto w-full space-y-12 pb-32">
          
          {/* Integrated Header - Scrolls with content */}
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{t.config}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium">{t.tailor}</p>
          </div>

          {/* Personal Profile Section */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] px-4">{t.profile}</h3>
            <div className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-[32px] p-8 md:p-10 space-y-10 shadow-sm">
              <div className="flex flex-col items-center gap-8">
                <div className="relative shrink-0 group">
                  {profileImage && !profileImage.startsWith('data:image/png') ? (
                    <img src={profileImage} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border-4 border-white dark:border-slate-800 shadow-inner">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  )}
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()} 
                    className="absolute bottom-0 right-0 w-11 h-11 rounded-full bg-[var(--accent-color)] text-white flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  </motion.button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
                <div className="w-full max-w-sm">
                  <p className="text-[10px] font-black uppercase text-center text-slate-400 dark:text-slate-500 tracking-[0.3em] mb-3">{t.displayName}</p>
                  <input 
                    type="text" 
                    value={userName} 
                    onChange={(e) => onNameChange(e.target.value)} 
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-center text-lg font-black text-slate-800 dark:text-slate-100 outline-none focus:border-[var(--accent-color)] transition-all shadow-sm"
                  />
                </div>
              </div>
              
              <div className="pt-8 border-t border-slate-200/50 dark:border-slate-700/50">
                <p className="text-[10px] font-black uppercase text-center text-slate-400 dark:text-slate-500 tracking-[0.3em] mb-6">{t.pledge}</p>
                {isUpdatingSignature ? (
                  <div className="space-y-6">
                    <div className="w-full h-48 bg-white dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 rounded-[32px] overflow-hidden relative group touch-none shadow-inner">
                      <canvas 
                        ref={canvasRef} 
                        onPointerDown={handlePointerDown} 
                        onPointerMove={handlePointerMove} 
                        onPointerUp={stopDrawing} 
                        onPointerLeave={stopDrawing}
                        className="w-full h-full cursor-crosshair touch-none" 
                      />
                    </div>
                    <div className="flex gap-4">
                      <button onClick={clearCanvas} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Clear</button>
                      <button disabled={!hasNewSignature} onClick={saveSignature} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${hasNewSignature ? 'bg-[var(--accent-color)] text-white shadow-xl active:scale-95' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}>{t.save}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-6">
                    <div className="w-full h-40 bg-white dark:bg-slate-950 rounded-[32px] border border-slate-100 dark:border-slate-800/60 flex items-center justify-center p-8 shadow-inner relative overflow-hidden">
                      {signatureImage ? (
                        <img 
                          src={signatureImage} 
                          alt="Signature" 
                          className="w-full h-full object-contain dark:invert opacity-100" 
                        />
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">{t.noSignature}</span>
                      )}
                    </div>
                    <button onClick={() => setIsUpdatingSignature(true)} className="text-[11px] font-black text-[var(--accent-color)] uppercase tracking-widest bg-[var(--accent-subtle)] py-4 rounded-2xl hover:brightness-105 active:scale-95 transition-all">{t.resign}</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interface Style Section */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] px-4">{t.interface}</h3>
            <div className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-[32px] p-8 md:p-10 space-y-10 shadow-sm">
              
              <div>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-5 px-2">{t.colorMode}</p>
                <div className="flex bg-white dark:bg-slate-950 p-1.5 rounded-2xl gap-2 border border-slate-100 dark:border-slate-800/40 shadow-sm">
                  {(['light', 'dark', 'system'] as Theme[]).map((tMode) => (
                    <button key={tMode} onClick={() => onThemeChange(tMode)} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${theme === tMode ? 'bg-[var(--accent-color)] text-white shadow-md' : 'text-slate-400 dark:text-slate-500'}`}>{tMode}</button>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-5 px-2">{t.brandAccent}</p>
                <div className="grid grid-cols-6 gap-3 px-2">
                  {accentColors.map((color) => (
                    <button 
                      key={color} 
                      onClick={() => onAccentChange(color)} 
                      className={`aspect-square rounded-2xl border-2 flex items-center justify-center transition-all ${accentColor === color ? 'border-[var(--accent-color)] scale-110 shadow-lg' : 'border-transparent active:scale-90'}`} 
                      style={{ backgroundColor: getAccentHex(color) }}
                    >
                      {accentColor === color && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-5 px-2">{t.fontStyle}</p>
                <div className="flex bg-white dark:bg-slate-950 p-1.5 rounded-2xl gap-2 overflow-x-auto no-scrollbar border border-slate-100 dark:border-slate-800/40 shadow-sm">
                  {fonts.map((f) => (
                    <button key={f} onClick={() => onFontChange(f as AppFont)} className={`flex-1 min-w-[80px] py-3 text-[10px] font-black uppercase rounded-xl transition-all ${font === f ? 'bg-[var(--accent-color)] text-white shadow-md' : 'text-slate-400 dark:text-slate-500'}`}>{f}</button>
                  ))}
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center justify-between px-2">
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">{t.disableAnimations}</p>
                  <button 
                    onClick={onToggleAnimations}
                    className={`w-12 h-7 rounded-full transition-all relative ${!isAnimationsEnabled ? 'bg-[var(--accent-color)]' : 'bg-slate-200 dark:bg-slate-800'}`}
                  >
                    <motion.div 
                      layout
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm ${!isAnimationsEnabled ? 'right-1' : 'left-1'}`} 
                    />
                  </button>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;