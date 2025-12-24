
import React, { useState, useEffect, useRef } from 'react';
import { Screen, State, BlockEvent, Task, Theme, AccentColor, AppTimer, AppConfig } from './types';
import { 
  DEFAULT_PIN, 
  UNLOCK_DURATION_MS, 
  MARKET_UNLOCK_COST, 
  MARKET_UNLOCK_DURATION_MS,
  CYCLE_USAGE_LIMIT_MS,
  CYCLE_LOCK_DURATION_MS,
  CYCLE_APPS_BASE,
  UNALLOWED_APPS
} from './constants';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import Home from './components/Home';
import AllowedApps from './components/AllowedApps';
import Settings from './components/Settings';
import Report from './components/Report';
import PhoneSimulator from './components/PhoneSimulator';
import PINPad from './components/PINPad';
import BlockedOverlay from './components/BlockedOverlay';
import Market from './components/Market';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const App: React.FC = () => {
  const [state, setState] = useState<State>(() => {
    const saved = localStorage.getItem('focus_guardian_v9_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        theme: parsed.theme || 'light',
        accentColor: parsed.accentColor || 'blue',
        timerEndTimestamp: parsed.timerEndTimestamp || null,
        timerPausedRemainingSeconds: parsed.timerPausedRemainingSeconds || null,
        timerTotalDurationSeconds: parsed.timerTotalDurationSeconds || 25 * 60,
      };
    }
    return {
      currentScreen: Screen.ONBOARDING,
      isFirstTime: true,
      isActivated: false,
      userName: '',
      pin: DEFAULT_PIN,
      isTemporarilyUnlocked: false,
      unlockUntil: null,
      blockLogs: [],
      balance: 100,
      tasks: [],
      activeTaskId: null,
      theme: 'light',
      accentColor: 'blue',
      language: 'en',
      uninstallRequestedAt: null,
      appTimers: {},
      appConfigs: {
        wa: { allowedMs: CYCLE_USAGE_LIMIT_MS, lockMs: CYCLE_LOCK_DURATION_MS },
        tg: { allowedMs: CYCLE_USAGE_LIMIT_MS, lockMs: CYCLE_LOCK_DURATION_MS }
      },
      cycleAppIds: CYCLE_APPS_BASE.map(a => a.id),
      timerEndTimestamp: null,
      timerPausedRemainingSeconds: null,
      timerTotalDurationSeconds: 25 * 60,
    };
  });

  // Derived state for the UI
  const [timerDisplaySeconds, setTimerDisplaySeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const activeOverlayRef = useRef<{ name: string; lockedUntil: number | null } | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<{ name: string; lockedUntil: number | null } | null>(null);
  const [isPinPromptActive, setIsPinPromptActive] = useState<{ active: boolean; purpose: 'unlock' | 'settings' | 'uninstall' | 'edit_config' }>({
    active: false,
    purpose: 'unlock'
  });

  const activeAppId = useRef<string | null>(null);
  const usageTickerRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('focus_guardian_v9_state', JSON.stringify(state));
  }, [state]);

  // Cleanup old completed tasks automatically after 7 days
  useEffect(() => {
    const cleanupOldTasks = () => {
      const now = Date.now();
      setState(prev => {
        const hasOldTasks = prev.tasks.some(task => 
          task.completed && task.completedAt && (now - task.completedAt > SEVEN_DAYS_MS)
        );
        if (!hasOldTasks) return prev;
        
        console.debug('Cleaning up tasks older than 7 days...');
        return {
          ...prev,
          tasks: prev.tasks.filter(task => 
            !(task.completed && task.completedAt && (now - task.completedAt > SEVEN_DAYS_MS))
          )
        };
      });
    };

    cleanupOldTasks(); // Initial check on mount
    const interval = setInterval(cleanupOldTasks, 1000 * 60 * 60); // Background cleanup every hour
    return () => clearInterval(interval);
  }, []);

  // Update theme classes
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => {
      const isDark = state.theme === 'dark' || (state.theme === 'system' && mediaQuery.matches);
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };
    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [state.theme]);

  // Focus Timer Engine
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      if (state.timerEndTimestamp && !state.timerPausedRemainingSeconds) {
        const diff = Math.ceil((state.timerEndTimestamp - now) / 1000);
        if (diff <= 0) {
          handleCompleteFocus();
          setState(prev => ({ ...prev, timerEndTimestamp: null, timerPausedRemainingSeconds: null }));
          setTimerDisplaySeconds(0);
          setIsTimerRunning(false);
          if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
        } else {
          setTimerDisplaySeconds(diff);
          setIsTimerRunning(true);
        }
      } else if (state.timerPausedRemainingSeconds) {
        setTimerDisplaySeconds(state.timerPausedRemainingSeconds);
        setIsTimerRunning(false);
      } else {
        setTimerDisplaySeconds(state.timerTotalDurationSeconds);
        setIsTimerRunning(false);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [state.timerEndTimestamp, state.timerPausedRemainingSeconds, state.timerTotalDurationSeconds]);

  const toggleTimer = () => {
    if (!state.isActivated) {
      alert("Activation Required: Enable the App Shield in Settings to start focus sessions.");
      return;
    }
    
    if (state.timerEndTimestamp && !state.timerPausedRemainingSeconds) {
      const remaining = Math.max(0, Math.ceil((state.timerEndTimestamp - Date.now()) / 1000));
      setState(prev => ({ ...prev, timerPausedRemainingSeconds: remaining }));
    } else if (state.timerPausedRemainingSeconds) {
      const newEnd = Date.now() + state.timerPausedRemainingSeconds * 1000;
      setState(prev => ({ ...prev, timerEndTimestamp: newEnd, timerPausedRemainingSeconds: null }));
    } else {
      const newEnd = Date.now() + state.timerTotalDurationSeconds * 1000;
      setState(prev => ({ ...prev, timerEndTimestamp: newEnd, timerPausedRemainingSeconds: null }));
    }
  };

  const resetTimer = () => {
    if (isTimerRunning || state.timerPausedRemainingSeconds) {
      handleFailFocus();
    }
    setState(prev => ({ ...prev, timerEndTimestamp: null, timerPausedRemainingSeconds: null }));
  };

  const changeTimerDuration = (seconds: number) => {
    setState(prev => ({ ...prev, timerTotalDurationSeconds: seconds, timerEndTimestamp: null, timerPausedRemainingSeconds: null }));
  };

  const handleCompleteFocus = () => {
    setState(p => ({...p, balance: p.balance + 100}));
  };

  const handleFailFocus = () => {
    setState(p => ({...p, balance: Math.max(0, p.balance - 50)}));
  };

  const navigate = (screen: Screen) => {
    activeAppId.current = null;
    setState(prev => ({ ...prev, currentScreen: screen }));
  };

  const renderContent = () => {
    if (isPinPromptActive.active) {
      return (
        <PINPad 
          title="Security Override" 
          correctPin={state.pin}
          onSuccess={() => { navigate(Screen.SETTINGS); setIsPinPromptActive({ active: false, purpose: 'unlock' }); }}
          onCancel={() => setIsPinPromptActive({ active: false, purpose: 'unlock' })}
        />
      );
    }

    switch (state.currentScreen) {
      case Screen.ONBOARDING: return <Onboarding onComplete={(name) => setState(p => ({...p, userName: name, isFirstTime: false, currentScreen: Screen.HOME}))} />;
      case Screen.HOME: return (
        <Home 
          userName={state.userName} tasks={state.tasks} activeTaskId={state.activeTaskId} isActivated={state.isActivated}
          timerSeconds={timerDisplaySeconds}
          totalSeconds={state.timerTotalDurationSeconds}
          isTimerActive={isTimerRunning}
          onToggleTimer={toggleTimer}
          onResetTimer={resetTimer}
          onSetTimerSeconds={changeTimerDuration}
          onAddTask={(t) => setState(p => ({...p, tasks: [...p.tasks, {id: Date.now().toString(), text: t, completed: false, createdAt: Date.now(), completedAt: null}]}))}
          onToggleTask={(id) => setState(p => {
            const task = p.tasks.find(t => t.id === id);
            if (!task) return p;
            const isNowCompleted = !task.completed;
            return {
              ...p,
              balance: task.completed ? p.balance : p.balance + 50,
              tasks: p.tasks.map(t => t.id === id ? {...t, completed: isNowCompleted, completedAt: isNowCompleted ? Date.now() : null} : t)
            };
          })}
          onDeleteTask={(id) => setState(p => ({...p, tasks: p.tasks.filter(t => t.id !== id), activeTaskId: p.activeTaskId === id ? null : p.activeTaskId}))}
          onSetActiveTask={(id) => setState(p => ({...p, activeTaskId: id}))}
          onNavigate={navigate} onNavigateSimulator={() => navigate(Screen.PHONE_SIMULATOR)}
        />
      );
      case Screen.ALLOWED_APPS: return (
        <AllowedApps 
          appTimers={state.appTimers} cycleAppIds={state.cycleAppIds} appConfigs={state.appConfigs} isActivated={state.isActivated}
          onUpdateConfig={(id, a, l) => setState(prev => ({ ...prev, appConfigs: { ...prev.appConfigs, [id]: { allowedMs: Math.min(a, 30) * 60000, lockMs: Math.max(l, 60) * 60000 } }}))} 
          onActivate={() => setState(p => ({...p, isActivated: true, currentScreen: Screen.HOME}))}
          onDeactivate={() => setState(p => ({...p, isActivated: false}))} onToggleCycle={() => {}}
        />
      );
      case Screen.SETTINGS: return (
        <Settings 
          theme={state.theme} accentColor={state.accentColor} 
          onThemeChange={(t) => setState(p => ({...p, theme: t}))} 
          onAccentChange={(c) => setState(p => ({...p, accentColor: c}))}
          onUnlockRequest={() => setIsPinPromptActive({ active: true, purpose: 'unlock' })}
          isUnlocked={state.isTemporarilyUnlocked}
        />
      );
      case Screen.REPORT: return <Report logs={state.blockLogs} />;
      case Screen.MARKET: return <Market balance={state.balance} onPurchase={() => {
        if(state.balance >= MARKET_UNLOCK_COST) setState(p => ({...p, balance: p.balance - MARKET_UNLOCK_COST, isTemporarilyUnlocked: true, unlockUntil: Date.now() + MARKET_UNLOCK_DURATION_MS, currentScreen: Screen.HOME}));
      }} />;
      case Screen.PHONE_SIMULATOR: return <PhoneSimulator 
        isUnlocked={state.isTemporarilyUnlocked} 
        appTimers={state.appTimers} 
        cycleAppIds={state.cycleAppIds} 
        onAppClick={(id, name, isAllowed) => {
          if (!state.isActivated) { alert(`${name} is functional (Shield is OFF)`); return; }
          const timer = state.appTimers[id];
          if (state.isTemporarilyUnlocked) { alert(`${name} override active.`); return; }
          if (!isAllowed) {
            setActiveOverlay({ name, lockedUntil: null });
            setState(prev => ({ ...prev, blockLogs: [...prev.blockLogs, { appName: name, timestamp: Date.now() }] }));
            return;
          }
          if (state.cycleAppIds.includes(id)) {
            if (timer?.lockedUntil && timer.lockedUntil > Date.now()) {
              setActiveOverlay({ name, lockedUntil: timer.lockedUntil });
              return;
            }
            activeAppId.current = id;
            alert(`Guardian allowed ${name}.`);
          } else alert(`Opening ${name}.`);
        }} 
        onExit={() => navigate(Screen.HOME)} 
      />;
      default: return null;
    }
  };

  const accentHex = {
    blue: '#2563eb', emerald: '#10b981', purple: '#9333ea', amber: '#d97706', rose: '#e11d48', slate: '#475569'
  }[state.accentColor];

  return (
    <div style={{'--accent-color': accentHex} as any} className={`flex items-center justify-center min-h-screen font-sans transition-all duration-300 ${state.theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
      <Layout currentScreen={state.currentScreen} onNavigate={navigate} showNav={!state.isFirstTime && state.currentScreen !== Screen.ONBOARDING && state.currentScreen !== Screen.PHONE_SIMULATOR}>
        {renderContent()}
      </Layout>
      {activeOverlay && <BlockedOverlay appName={activeOverlay.name} lockedUntil={activeOverlay.lockedUntil} onClose={() => setActiveOverlay(null)} />}
    </div>
  );
};

export default App;
