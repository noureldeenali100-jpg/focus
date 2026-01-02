import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme, AccentColor, FocusSession, FocusSound, AppFont, Screen } from '../types';
import AvatarCropper from './AvatarCropper';
import { sanitize } from '../utils/security';

interface SettingsProps {
  theme: Theme; accentColor: AccentColor; font: AppFont; isSoundEnabled: boolean; isAnimationsEnabled: boolean; isTimerGlowEnabled: boolean; focusSound: FocusSound;
  userName: string; profileImage: string | null; signatureImage: string | null;
  sessionLogs: FocusSession[];
  onThemeChange: (t: Theme) => void; onAccentChange: (c: AccentColor) => void; onFontChange: (f: AppFont) => void;
  onToggleSound: () => void; onToggleAnimations: () => void; onToggleTimerGlow: () => void; onSetFocusSound: (s: FocusSound) => void; onNameChange: (name: string) => void;
  onProfileImageChange: (base64: string) => void;
  onSignatureChange: (base64: string) => void;
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
  theme, accentColor, font, isAnimationsEnabled, isTimerGlowEnabled, userName, profileImage, signatureImage,
  onThemeChange, onAccentChange, onFontChange, onToggleAnimations, onToggleTimerGlow, onNameChange, onProfileImageChange, onSignatureChange,
}) => {
  const accentColors: AccentColor[] = ['blue', 'emerald', 'purple', 'amber', 'rose', 'slate'];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [isUpdatingSignature, setIsUpdatingSignature] = useState(false);
  const [hasNewSignature, setHasNewSignature] = useState(false);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isUpdatingSignature) return;
    const initCanvas = () => {
      const canvas = canvasRef.current; if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = '#000000'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    };
    const timer = setTimeout(initCanvas, 150);
    window.addEventListener('resize', initCanvas);
    return () => { clearTimeout(timer); window.removeEventListener('resize', initCanvas); };
  }, [isUpdatingSignature]);

  const saveSignature = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    onSignatureChange(canvas.toDataURL('image/png', 0.8)); // Hardened compression
    setIsUpdatingSignature(false); setHasNewSignature(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size < 2 * 1024 * 1024) { // Hard 2MB Limit
      const reader = new FileReader();
      reader.onloadend = () => setCroppingImage(reader.result as string);
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getPointerPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current; if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (canvas.offsetWidth / rect.width), y: (e.clientY - rect.top) * (canvas.offsetHeight / rect.height) };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDrawing.current = true;
    lastPoint.current = getPointerPos(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !lastPoint.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d'); if (!ctx) return;
    const pos = getPointerPos(e);
    ctx.beginPath(); ctx.moveTo(lastPoint.current.x, lastPoint.current.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    lastPoint.current = pos; setHasNewSignature(true);
  };

  const stopDrawing = (e: React.PointerEvent) => {
    isDrawing.current = false; lastPoint.current = null;
    if (canvasRef.current) canvasRef.current.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden w-full font-sans transition-colors duration-500">
      <section className="flex-1 px-8 pt-12 overflow-y-auto no-scrollbar w-full">
        <div className="max-w-xl mx-auto w-full space-y-12 pb-32">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Settings</h2>
            <p className="text-slate-500 font-medium">Personalize your focus environment.</p>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-[40px] p-8 md:p-10 space-y-10 shadow-sm">
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl">
                  {profileImage ? <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>}
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[var(--accent-color)] text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg></motion.button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
              <div className="w-full text-center">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2">Display Name</p>
                <input type="text" value={userName} onChange={(e) => onNameChange(sanitize(e.target.value, 25))} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-center text-lg font-black text-slate-800 dark:text-slate-100 outline-none focus:border-[var(--accent-color)]" />
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-200/50 dark:border-slate-700/50">
              <p className="text-[10px] font-black uppercase text-center text-slate-400 tracking-[0.3em] mb-6">Deep Work Oath</p>
              {isUpdatingSignature ? (
                <div className="space-y-4">
                  <div className="w-full h-48 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden relative touch-none shadow-inner">
                    <canvas ref={canvasRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={stopDrawing} onPointerLeave={stopDrawing} className="w-full h-full cursor-crosshair touch-none dark:invert" />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => { setIsUpdatingSignature(false); setHasNewSignature(false); }} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                    <button disabled={!hasNewSignature} onClick={saveSignature} className="flex-[2] py-4 bg-[var(--accent-color)] text-white disabled:opacity-20 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[var(--accent-color)]/20">Sign Pact</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-full h-32 bg-white dark:bg-slate-950 rounded-[28px] border border-slate-100 dark:border-slate-800 flex items-center justify-center p-6 shadow-inner overflow-hidden mb-6">
                    {signatureImage ? <img src={signatureImage} alt="Signature" className="h-full object-contain dark:invert" /> : <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">No Oath Signed</span>}
                  </div>
                  <button onClick={() => setIsUpdatingSignature(true)} className="text-[11px] font-black text-[var(--accent-color)] uppercase tracking-widest bg-[var(--accent-subtle)] px-8 py-3.5 rounded-2xl active:scale-95 transition-all">Update Signature</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {croppingImage && <AvatarCropper imageSrc={croppingImage} onCrop={(base64) => { onProfileImageChange(base64); setCroppingImage(null); }} onCancel={() => setCroppingImage(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default Settings;