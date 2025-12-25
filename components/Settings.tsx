import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Theme, AccentColor, FocusSession, AppConfig, PendingConfig, FocusSound, AppFont, Screen } from '../types';

interface SettingsProps {
  theme: Theme;
  accentColor: AccentColor;
  font: AppFont;
  isSoundEnabled: boolean;
  focusSound: FocusSound;
  userName: string;
  profileImage: string | null;
  signatureImage: string | null;
  language: 'en' | 'ar';
  minWaitMs: number;
  usageMs: number;
  sessionLogs: FocusSession[];
  globalAppConfig: AppConfig;
  pendingGlobalConfig: PendingConfig | null;
  onThemeChange: (t: Theme) => void;
  onAccentChange: (c: AccentColor) => void;
  onFontChange: (f: AppFont) => void;
  onToggleSound: () => void;
  onSetFocusSound: (s: FocusSound) => void;
  onNameChange: (name: string) => void;
  onProfileImageChange: (base64: string) => void;
  onLanguageChange: (lang: 'en' | 'ar') => void;
  onWaitChange: (ms: number) => void;
  onUsageChange: (ms: number) => void;
  onRequestConfigUpdate: (allowedMins: number, lockMins: number) => void;
  onNavigate: (s: Screen) => void;
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
  theme, accentColor, font, isSoundEnabled, focusSound, userName, profileImage, signatureImage, language,
  minWaitMs, usageMs, sessionLogs, globalAppConfig, pendingGlobalConfig,
  onThemeChange, onAccentChange, onFontChange, onToggleSound, onSetFocusSound, onNameChange, onProfileImageChange, onLanguageChange,
  onWaitChange, onUsageChange, onRequestConfigUpdate, onNavigate
}) => {
  const accentColors: AccentColor[] = ['blue', 'emerald', 'purple', 'amber', 'rose', 'slate'];
  const fonts: AppFont[] = ['Inter', 'System', 'Serif', 'Mono'];
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [isUpdatingSignature, setIsUpdatingSignature] = useState(false);
  const [hasNewSignature, setHasNewSignature] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isUpdatingSignature) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    
    const ctx = canvas.getContext('2d', { desynchronized: true, alpha: true });
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [isUpdatingSignature]);

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPointerPos(e);
    isDrawing.current = true;
    lastPoint.current = pos;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !lastPoint.current) return;
    if (e.cancelable) e.preventDefault();
    
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const pos = getPointerPos(e);
    const midX = (lastPoint.current.x + pos.x) / 2;
    const midY = (lastPoint.current.y + pos.y) / 2;
    
    ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midX, midY);
    ctx.stroke();
    
    lastPoint.current = pos;
    if (!hasNewSignature) setHasNewSignature(true);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    lastPoint.current = null;
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onProfileImageChange(canvas.toDataURL('image/png', 0.8));
    setIsUpdatingSignature(false);
    setHasNewSignature(false);
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

  const handleWaitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      onWaitChange(val * 60000);
    } else if (e.target.value === '') {
      onWaitChange(0);
    }
  };

  const finalizeWait = () => {
    onWaitChange(Math.max(30 * 60000, minWaitMs));
  };

  const handleUsageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      onUsageChange(val * 60000);
    } else if (e.target.value === '') {
      onUsageChange(0);
    }
  };

  const finalizeUsage = () => {
    const clamped = Math.min(120 * 60000, Math.max(15 * 60000, usageMs));
    onUsageChange(clamped);
  };

  const getPendingTimeRemaining = () => {
    if (!pendingGlobalConfig) return null;
    const elapsed = Date.now() - pendingGlobalConfig.requestedAt;
    const remaining = Math.max(0, 60 * 60 * 1000 - elapsed);
    return Math.ceil(remaining / 60000);
  };

  const translations = {
    en: {
      config: "Settings",
      tailor: "Personalize your workspace.",
      interface: "Interface Style",
      colorMode: "Lighting Mode",
      brandAccent: "Focus Color",
      fontStyle: "Font Setting",
      profile: "Personal Profile",
      displayName: "Your Name",
      languageLabel: "Region Language",
      unlockWait: "Unlock Delay (mins)",
      usageWindow: "Usage Limit (mins)",
      appDiscipline: "Focus Hardening",
      globalUsage: "Max App Time (mins)",
      globalLock: "Lock Extension (mins)",
      pendingChange: (val: number, time: number) => `Pending: ${val}m (Ready in ${time}m)`,
      timeDisciplineHeader: "Guard Timings",
      pledge: "Personal Pledge",
      resign: "Change Signature",
      save: "Sign Pledge",
      clear: "Clear",
      cancel: "Cancel",
      noSignature: "No signature on file.",
      historyData: "History & Data",
      sessionHistory: "Session History"
    },
    ar: {
      config: "الإعدادات",
      tailor: "تخصيص بيئة التركيز الخاصة بك",
      interface: "الواجهة",
      colorMode: "وضع اللون",
      brandAccent: "لون العلامة التجارية",
      fontStyle: "نمط الخط",
      profile: "الملف الشخصي",
      displayName: "اسم العرض",
      languageLabel: "لغة التطبيق",
      unlockWait: "وقت الانتظار (دقيقة)",
      usageWindow: "نافذة الاستخدام (دقيقة)",
      appDiscipline: "انضباط التطبيقات القياسي",
      globalUsage: "حد الاستخدام المتواصل (دقيقة)",
      globalLock: "مدة القفل الإلزامي (دقيقة)",
      pendingChange: (val: number, time: number) => `قيد الانتظار: ${val} دقيقة (يطبق خلال ${time} دقيقة)`,
      timeDisciplineHeader: "إعدادات الوقت والانضباط",
      pledge: "التعهد الشخصي",
      resign: "تحديث التوقيع",
      save: "حفظ التعهد",
      clear: "مسح",
      cancel: "إلغاء",
      noSignature: "لا يوجد توقيع مسجل.",
      historyData: "السجل والبيانات",
      sessionHistory: "سجل الجلسات"
    }
  };

  const t = translations[language];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto scroll-container no-scrollbar transition-all duration-700 ease-in-out" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="px-8 pt-10 pb-24 w-full max-w-lg mx-auto">
        <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{t.config}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-in fade-in stagger-1">{t.tailor}</p>
        </header>

        <div className="space-y-10">
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 stagger-2">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 px-2">{t.profile}</h3>
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[36px] p-6 shadow-sm space-y-8 transition-all duration-500 hover:shadow-md">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0 group">
                  {profileImage ? (
                    <img src={profileImage} alt="Avatar" className="w-16 h-16 rounded-[22px] object-cover border-2 border-white dark:border-slate-800 transition-all duration-500 group-hover:scale-105 shadow-md" />
                  ) : (
                    <div className="w-16 h-16 rounded-[22px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 transition-all duration-500 group-hover:scale-105 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  )}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-[var(--accent-color)] text-white flex items-center justify-center shadow-lg active:scale-75 transition-all duration-300 hover:brightness-110"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-2">{t.displayName}</p>
                  <input 
                    type="text" 
                    value={userName} 
                    onChange={(e) => onNameChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-extrabold text-slate-800 dark:text-slate-100 outline-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-4">{t.pledge}</p>
                {isUpdatingSignature ? (
                  <div className="space-y-5 animate-in fade-in zoom-in-95 duration-500 ease-out">
                    <div className="w-full h-44 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden relative group touch-none">
                      <canvas 
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-full cursor-crosshair touch-none transition-all"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsUpdatingSignature(false)}
                        className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                      >
                        {t.cancel}
                      </button>
                      <button 
                        disabled={!hasNewSignature}
                        onClick={saveSignature}
                        className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${hasNewSignature ? 'bg-[var(--accent-color)] text-white shadow-xl shadow-[var(--accent-color)]/20 active:scale-95' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}
                      >
                        {t.save}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    <div className="w-full h-28 bg-slate-50 dark:bg-slate-950 rounded-3xl border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center p-6 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/60 shadow-inner group">
                      {signatureImage ? (
                        <img src={signatureImage} alt="Signature" className="max-w-full max-h-full object-contain dark:invert animate-in zoom-in-95 duration-700 opacity-90 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">{t.noSignature}</span>
                      )}
                    </div>
                    <button 
                      onClick={() => setIsUpdatingSignature(true)}
                      className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest bg-[var(--accent-subtle)] py-3 rounded-2xl hover:brightness-105 active:scale-95 transition-all duration-300"
                    >
                      {t.resign}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 stagger-3">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 px-2">{t.interface}</h3>
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[36px] p-6 shadow-sm space-y-8">
              <div>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-4 px-1">{t.languageLabel}</p>
                <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl gap-1.5">
                  {(['en', 'ar'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => onLanguageChange(l)}
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-95 ${language === l ? 'bg-white dark:bg-slate-800 text-[var(--accent-color)] shadow-md' : 'text-slate-400 dark:text-slate-500 hover:opacity-100'}`}
                    >
                      {l === 'en' ? 'English' : 'العربية'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-4 px-1">{t.colorMode}</p>
                <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl gap-1.5">
                  {(['light', 'dark', 'system'] as Theme[]).map((tMode) => (
                    <button
                      key={tMode}
                      onClick={() => onThemeChange(tMode)}
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-95 ${theme === tMode ? 'bg-white dark:bg-slate-800 text-[var(--accent-color)] shadow-md' : 'text-slate-400 dark:text-slate-500 hover:opacity-100'}`}
                    >
                      {tMode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-4 px-1">{t.brandAccent}</p>
                <div className="grid grid-cols-6 gap-4 px-1">
                  {accentColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => onAccentChange(color)}
                      className={`aspect-square rounded-2xl border-4 flex items-center justify-center transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) active:scale-50 ${accentColor === color ? 'border-[var(--accent-color)] ring-4 ring-[var(--accent-color)]/10 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: getAccentHex(color) }}
                    >
                      {accentColor === color && <div className="w-2 h-2 rounded-full bg-white shadow-xl animate-in zoom-in duration-500" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-4 px-1">{t.fontStyle}</p>
                <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl gap-1.5">
                  {fonts.map((f) => (
                    <button
                      key={f}
                      onClick={() => onFontChange(f)}
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-95 ${font === f ? 'bg-white dark:bg-slate-800 text-[var(--accent-color)] shadow-md' : 'text-slate-400 dark:text-slate-500 hover:opacity-100'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 stagger-4">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 px-2">{t.timeDisciplineHeader}</h3>
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[36px] p-6 shadow-sm space-y-6">
              <div>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-2.5 px-1">{t.unlockWait}</p>
                <input 
                  type="number" 
                  min="30"
                  value={minWaitMs === 0 ? '' : Math.round(minWaitMs / 60000)}
                  onChange={handleWaitChange}
                  onBlur={finalizeWait}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-extrabold outline-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 text-slate-800 dark:text-slate-100 transition-all"
                />
              </div>
              <div>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-2.5 px-1">{t.usageWindow}</p>
                <input 
                  type="number" 
                  min="15"
                  max="120"
                  value={usageMs === 0 ? '' : Math.round(usageMs / 60000)}
                  onChange={handleUsageChange}
                  onBlur={finalizeUsage}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-extrabold outline-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 text-slate-800 dark:text-slate-100 transition-all"
                />
              </div>
            </div>
          </section>

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 stagger-5">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 px-2">{t.appDiscipline}</h3>
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[36px] p-6 shadow-sm space-y-8">
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-2.5 px-1">{t.globalUsage}</p>
                  <input 
                    type="number" 
                    value={Math.round(globalAppConfig.allowedMs / 60000)}
                    onChange={(e) => onRequestConfigUpdate(parseInt(e.target.value) || 0, Math.round(globalAppConfig.lockMs / 60000))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-extrabold outline-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 text-slate-800 dark:text-slate-100 transition-all"
                  />
                  {pendingGlobalConfig && (
                    <p className="text-[10px] text-amber-500 mt-2 uppercase font-black tracking-widest animate-pulse px-1">
                      {t.pendingChange(Math.round(pendingGlobalConfig.config.allowedMs / 60000), getPendingTimeRemaining() || 0)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-2.5 px-1">{t.globalLock}</p>
                  <input 
                    type="number" 
                    value={Math.round(globalAppConfig.lockMs / 60000)}
                    onChange={(e) => onRequestConfigUpdate(Math.round(globalAppConfig.allowedMs / 60000), parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-extrabold outline-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/5 text-slate-800 dark:text-slate-100 transition-all"
                  />
                  {pendingGlobalConfig && (
                    <p className="text-[10px] text-amber-500 mt-2 uppercase font-black tracking-widest animate-pulse px-1">
                      {t.pendingChange(Math.round(pendingGlobalConfig.config.lockMs / 60000), getPendingTimeRemaining() || 0)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 stagger-[6]">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 px-2">{t.historyData}</h3>
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[36px] p-6 shadow-sm space-y-4">
              <button 
                onClick={() => onNavigate(Screen.SESSION_HISTORY)}
                className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent-color)] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">{t.sessionHistory}</span>
                </div>
                <div className="text-slate-300 dark:text-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </button>
            </div>
          </section>

          <footer className="pt-12 text-center pb-12 animate-in fade-in duration-1000">
             <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-6 opacity-30" />
             <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">Focused Excellence</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Settings;