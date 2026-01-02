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

const Settings: React.FC<SettingsProps> = ({ 
  theme, accentColor, font, isSoundEnabled, isAnimationsEnabled, isTimerGlowEnabled, focusSound, 
  userName, profileImage, signatureImage,
  onThemeChange, onAccentChange, onFontChange, onToggleSound, onToggleAnimations, onToggleTimerGlow, onSetFocusSound, onNameChange, onProfileImageChange, onSignatureChange,
}) => {
  const accentColors: AccentColor[] = ['blue', 'emerald', 'purple', 'amber', 'rose', 'slate'];
  const fonts: AppFont[] = ['Inter', 'System', 'Serif', 'Mono'];
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
    onSignatureChange(canvas.toDataURL('image/png', 0.8));
    setIsUpdatingSignature(false); setHasNewSignature(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size < 2 * 1024 * 1024) {
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

  const SectionHeader = ({ title, sub }: { title: string, sub: string }) => (
    <div className="mb-6">
      <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] mb-1">{title}</h3>
      <p className="text-xs font-medium text-slate-400 opacity-60">{sub}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden w-full font-sans transition-colors duration-500">
      <section className="flex-1 px-8 pt-12 overflow-y-auto no-scrollbar w-full">
        <div className="max-w-xl mx-auto w-full space-y-12 pb-48">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Settings</h2>
            <p className="text-slate-500 font-medium">Personalize your focus environment.</p>
          </div>

          {/* Identity Hub */}
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
          </div>

          {/* Appearance Config */}
          <div className="space-y-10">
            <div>
              <SectionHeader title="Appearance" sub="Select your preferred interface mode." />
              <div className="grid grid-cols-3 gap-3">
                {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                  <button 
                    key={t} onClick={() => onThemeChange(t)}
                    className={`py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest border transition-all ${theme === t ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/20' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <SectionHeader title="Accent Color" sub="Define the core visual DNA of the app." />
              <div className="grid grid-cols-6 gap-3">
                {accentColors.map((c) => {
                  const colors: Record<AccentColor, string> = { blue: 'bg-blue-600', emerald: 'bg-emerald-500', purple: 'bg-purple-600', amber: 'bg-amber-500', rose: 'bg-rose-500', slate: 'bg-slate-600' };
                  return (
                    <button 
                      key={c} onClick={() => onAccentChange(c)}
                      className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${accentColor === c ? 'ring-4 ring-[var(--accent-subtle)] scale-110' : 'opacity-60 scale-90'}`}
                    >
                      <div className={`w-full h-full rounded-2xl ${colors[c]}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <SectionHeader title="Typography" sub="Choose a font for optimal readability." />
              <div className="grid grid-cols-2 gap-3">
                {fonts.map((f) => (
                  <button 
                    key={f} onClick={() => onFontChange(f)}
                    className={`py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest border transition-all ${font === f ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audio Subsystem */}
          <div className="space-y-10">
            <div>
              <SectionHeader title="Audio & Feedback" sub="Manage sound effects and haptics." />
              <button 
                onClick={onToggleSound}
                className={`w-full p-6 rounded-[32px] border flex items-center justify-between transition-all ${isSoundEnabled ? 'bg-white dark:bg-slate-800 border-emerald-500/20 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSoundEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100">Master Audio</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isSoundEnabled ? 'System Enabled' : 'System Muted'}</p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${isSoundEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <motion.div animate={{ x: isSoundEnabled ? 24 : 0 }} className="absolute inset-y-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </button>
            </div>

            <div>
              <SectionHeader title="Ambient Flow" sub="Choose your background focus profile." />
              <div className="grid grid-cols-2 gap-3">
                {(['none', 'rain', 'clock', 'library'] as FocusSound[]).map((s) => (
                  <button 
                    key={s} onClick={() => onSetFocusSound(s)}
                    className={`py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest border transition-all ${focusSound === s ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Performance & Motion */}
          <div className="space-y-6">
            <SectionHeader title="Visual Performance" sub="Fine-tune animations and visual effects." />
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={onToggleAnimations}
                className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[32px] border border-slate-100 dark:border-slate-800/60"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg></div>
                  <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-200 tracking-widest">Interface Animations</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${isAnimationsEnabled ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <motion.div animate={{ x: isAnimationsEnabled ? 20 : 0 }} className={`absolute inset-y-1 left-1 w-3 h-3 rounded-full ${isAnimationsEnabled ? 'bg-white dark:bg-slate-900' : 'bg-slate-400'}`} />
                </div>
              </button>

              <button 
                onClick={onToggleTimerGlow}
                className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[32px] border border-slate-100 dark:border-slate-800/60"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/></svg></div>
                  <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-200 tracking-widest">Aura Glow Effect</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${isTimerGlowEnabled ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <motion.div animate={{ x: isTimerGlowEnabled ? 20 : 0 }} className={`absolute inset-y-1 left-1 w-3 h-3 rounded-full ${isTimerGlowEnabled ? 'bg-white dark:bg-slate-900' : 'bg-slate-400'}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Deep Work Pact (Signature) */}
          <div className="pt-12 border-t border-slate-200/50 dark:border-slate-700/50">
            <SectionHeader title="Deep Work Oath" sub="Your signed commitment to peak focus." />
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
      </section>

      <AnimatePresence>
        {croppingImage && <AvatarCropper imageSrc={croppingImage} onCrop={(base64) => { onProfileImageChange(base64); setCroppingImage(null); }} onCancel={() => setCroppingImage(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default Settings;