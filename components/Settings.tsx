import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Theme, AccentColor, FocusSession, AppConfig, PendingConfig, FocusSound } from '../types';

interface SettingsProps {
  theme: Theme;
  accentColor: AccentColor;
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
  onToggleSound: () => void;
  onSetFocusSound: (s: FocusSound) => void;
  onNameChange: (name: string) => void;
  onProfileImageChange: (base64: string) => void;
  onLanguageChange: (lang: 'en' | 'ar') => void;
  onWaitChange: (ms: number) => void;
  onUsageChange: (ms: number) => void;
  onRequestConfigUpdate: (allowedMins: number, lockMins: number) => void;
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
  theme, accentColor, isSoundEnabled, focusSound, userName, profileImage, signatureImage, language,
  minWaitMs, usageMs, sessionLogs, globalAppConfig, pendingGlobalConfig,
  onThemeChange, onAccentChange, onToggleSound, onSetFocusSound, onNameChange, onProfileImageChange, onLanguageChange,
  onWaitChange, onUsageChange, onRequestConfigUpdate
}) => {
  const accentColors: AccentColor[] = ['blue', 'emerald', 'purple', 'amber', 'rose', 'slate'];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [isUpdatingPledge, setIsUpdatingPledge] = useState(false);
  const [selectedSession, setSelectedSession] = useState<FocusSession | null>(null);

  // Canvas refs for signature update
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

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

  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateLabel = (ts: number) => {
    const date = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return language === 'ar' ? 'اليوم' : 'Today';
    if (date.toDateString() === yesterday.toDateString()) return language === 'ar' ? 'أمس' : 'Yesterday';
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const groupedLogs = useMemo(() => {
    const groups: Record<string, FocusSession[]> = {};
    const reversed = [...sessionLogs].reverse();
    const limit = showAllHistory ? reversed.length : 15;
    
    reversed.slice(0, limit).forEach(log => {
      const dateKey = new Date(log.timestamp).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return groups;
  }, [sessionLogs, showAllHistory]);

  const getPendingTimeRemaining = () => {
    if (!pendingGlobalConfig) return null;
    const elapsed = Date.now() - pendingGlobalConfig.requestedAt;
    const remaining = Math.max(0, 60 * 60 * 1000 - elapsed);
    return Math.ceil(remaining / 60000);
  };

  // Canvas Logic for Pledge Update
  useEffect(() => {
    if (!isUpdatingPledge) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { desynchronized: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Initial color selection
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [isUpdatingPledge]);

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startSigning = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPointerPos(e);
    setIsSigning(true);
    lastPoint.current = pos;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      // Sync color with current theme on start
      ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000';
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isSigning || !lastPoint.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    // Sync color with current theme in real-time
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000';

    const pos = getPointerPos(e);
    const midX = (lastPoint.current.x + pos.x) / 2;
    const midY = (lastPoint.current.y + pos.y) / 2;

    ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midX, midY);
    ctx.stroke();

    lastPoint.current = pos;
    setHasSigned(true);
  };

  const stopSigning = () => {
    setIsSigning(false);
    lastPoint.current = null;
  };

  const translations = {
    en: {
      config: "Configuration",
      tailor: "Tailor your focus environment",
      interface: "Interface",
      colorMode: "Color Mode",
      brandAccent: "Brand Accent",
      systemSecurity: "System Security",
      auditoryFeedback: "Auditory Feedback",
      systemSounds: "System sound effects",
      profile: "Profile",
      pledge: "Personal Pledge",
      updatePledge: "Update Pledge",
      resign: "Sign New Pledge",
      cancel: "Cancel",
      save: "Save Pledge",
      clear: "Clear",
      displayName: "Display Name",
      languageLabel: "Application Language",
      changePhoto: "Change Photo",
      unlockWait: "Unlock Wait Time (mins)",
      usageWindow: "Usage Window (mins)",
      sessions: "Sessions History",
      noSessions: "No sessions recorded yet.",
      focus: "Focus Session",
      completed: "Completed Session",
      canceled: "Canceled Session",
      showAll: "View All History",
      hide: "Show Less",
      sessionDetails: "Session Details",
      startTime: "Start Time",
      endTime: "End Time",
      planned: "Planned Duration",
      actual: "Actual Focus",
      breakTime: "Break Duration",
      breaks: "Breaks Taken",
      status: "Status",
      close: "Close",
      canceledRange: (start: string, end: string) => `Session canceled from ${start} to ${end}`,
      appDiscipline: "Standard App Discipline",
      globalUsage: "Continuous Usage Limit (mins)",
      globalLock: "Mandatory Lock Duration (mins)",
      pendingChange: (val: number, time: number) => `Pending: ${val}m (Applied in ${time}m)`,
      focusAmbient: "Focus Ambient Sound"
    },
    ar: {
      config: "الإعدادات",
      tailor: "تخصيص بيئة التركيز الخاصة بك",
      interface: "الواجهة",
      colorMode: "وضع اللون",
      brandAccent: "لون العلامة التجارية",
      systemSecurity: "أمان النظام",
      auditoryFeedback: "الملاحظات الصوتية",
      systemSounds: "مؤثرات صوت النظام",
      profile: "الملف الشخصي",
      pledge: "تعهد شخصي",
      updatePledge: "تحديث التعهد",
      resign: "توقيع تعهد جديد",
      cancel: "إلغاء",
      save: "حفظ التعهد",
      clear: "مسح",
      displayName: "اسم العرض",
      languageLabel: "لغة التطبيق",
      changePhoto: "تغيير الصورة",
      unlockWait: "وقت الانتظار (دقيقة)",
      usageWindow: "نافذة الاستخدام (دقيقة)",
      sessions: "سجل الجلسات",
      noSessions: "لم يتم تسجيل أي جلسات بعد.",
      focus: "جلسة تركيز",
      completed: "جلسة مكتملة",
      canceled: "جلسة ملغاة",
      showAll: "عرض السجل بالكامل",
      hide: "عرض أقل",
      sessionDetails: "تفاصيل الجلسة",
      startTime: "وقت البدء",
      endTime: "وقت الانتهاء",
      planned: "المدة المخططة",
      actual: "التركيز الفعلي",
      breakTime: "مدة الاستراحة",
      breaks: "عدد الاستراحات",
      status: "الحالة",
      close: "إغلاق",
      canceledRange: (start: string, end: string) => `تم إلغاء الجلسة من ${start} إلى ${end}`,
      appDiscipline: "انضباط التطبيقات القياسي",
      globalUsage: "حد الاستخدام المتواصل (دقيقة)",
      globalLock: "مدة القفل الإلزامي (دقيقة)",
      pendingChange: (val: number, time: number) => `قيد الانتظار: ${val} دقيقة (يطبق خلال ${time} دقيقة)`,
      focusAmbient: "صوت التركيز المحيط"
    }
  };

  const t = translations[language];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto no-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="px-6 pt-6 pb-24 w-full max-w-lg mx-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{t.config}</h2>
          <p className="text-slate-500 dark:text-slate-300 text-sm font-medium leading-tight">{t.tailor}</p>
        </header>

        <div className="space-y-8">
          {/* Unified App Discipline Configuration */}
          <section>
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-4 px-1">{t.appDiscipline}</h3>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">{t.globalUsage}</p>
                  <input 
                    type="number" 
                    value={Math.round(globalAppConfig.allowedMs / 60000)}
                    onChange={(e) => onRequestConfigUpdate(parseInt(e.target.value) || 0, Math.round(globalAppConfig.lockMs / 60000))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[var(--accent-color)] text-slate-800 dark:text-slate-100"
                  />
                  {pendingGlobalConfig && (
                    <p className="text-[9px] text-amber-500 mt-1 uppercase font-black tracking-tight">
                      {t.pendingChange(Math.round(pendingGlobalConfig.config.allowedMs / 60000), getPendingTimeRemaining() || 0)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">{t.globalLock}</p>
                  <input 
                    type="number" 
                    value={Math.round(globalAppConfig.lockMs / 60000)}
                    onChange={(e) => onRequestConfigUpdate(Math.round(globalAppConfig.allowedMs / 60000), parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[var(--accent-color)] text-slate-800 dark:text-slate-100"
                  />
                  {pendingGlobalConfig && (
                    <p className="text-[9px] text-amber-500 mt-1 uppercase font-black tracking-tight">
                      {t.pendingChange(Math.round(pendingGlobalConfig.config.lockMs / 60000), getPendingTimeRemaining() || 0)}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-[9px] text-slate-400 text-center uppercase tracking-widest font-black pt-2">Global limits apply to all timed apps</p>
            </div>
          </section>

          {/* Unlock Cycle Configuration */}
          <section>
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-4 px-1">Unlock Discipline</h3>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">{t.unlockWait}</p>
                <input 
                  type="number" 
                  min="30"
                  value={minWaitMs === 0 ? '' : Math.round(minWaitMs / 60000)}
                  onChange={handleWaitChange}
                  onBlur={finalizeWait}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[var(--accent-color)] text-slate-800 dark:text-slate-100"
                />
                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-tight">Minimum 30 minutes required</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">{t.usageWindow}</p>
                <input 
                  type="number" 
                  min="15"
                  max="120"
                  value={usageMs === 0 ? '' : Math.round(usageMs / 60000)}
                  onChange={handleUsageChange}
                  onBlur={finalizeUsage}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[var(--accent-color)] text-slate-800 dark:text-slate-100"
                />
                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-tight">Range: 15 to 120 minutes</p>
              </div>
            </div>
          </section>

          {/* Profile Section */}
          <section>
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-4 px-1">{t.profile}</h3>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {profileImage ? (
                    <img src={profileImage} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border border-slate-100 dark:border-slate-800" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  )}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-[var(--accent-color)] text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1.5">{t.displayName}</p>
                  <input 
                    type="text" 
                    value={userName} 
                    onChange={(e) => onNameChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-[var(--accent-color)] transition-colors"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section>
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-4 px-1">{t.interface}</h3>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-3">{t.languageLabel}</p>
                <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl gap-1">
                  {(['en', 'ar'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => onLanguageChange(l)}
                      className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-tight rounded-lg transition-all active:scale-98 ${language === l ? 'bg-white dark:bg-slate-800 text-[var(--accent-color)] shadow-sm' : 'text-slate-400 dark:text-slate-400'}`}
                    >
                      {l === 'en' ? 'English' : 'العربية'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-3">{t.colorMode}</p>
                <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl gap-1">
                  {(['light', 'dark', 'system'] as Theme[]).map((tMode) => (
                    <button
                      key={tMode}
                      onClick={() => onThemeChange(tMode)}
                      className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-tight rounded-lg transition-all active:scale-98 ${theme === tMode ? 'bg-white dark:bg-slate-800 text-[var(--accent-color)] shadow-sm' : 'text-slate-400 dark:text-slate-400'}`}
                    >
                      {tMode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <footer className="pt-12 text-center pb-8">
            <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">Guardian Pro Core v4.0</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Settings;