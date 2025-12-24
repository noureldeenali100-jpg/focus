import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Screen, State, BlockEvent, Task, Theme, AccentColor, AppTimer, AppConfig } from './types';
import { 
  MARKET_UNLOCK_COST, 
  CYCLE_USAGE_LIMIT_MS,
  CYCLE_LOCK_DURATION_MS,
  CYCLE_APPS_BASE,
  UNALLOWED_APPS
} from './constants';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import Focus from './components/Focus';
import Tasks from './components/Tasks';
import AllowedApps from './components/AllowedApps';
import Settings from './components/Settings';
import Report from './components/Report';
import PhoneSimulator from './components/PhoneSimulator';
import BlockedOverlay from './components/BlockedOverlay';
import Market from './components/Market';

const App: React.FC = () => {
  const [state, setState] = useState<State>(() => {
    const saved = localStorage.getItem('focus_guardian_v10_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        theme: parsed.theme || 'light',
        accentColor: parsed.accentColor || 'blue',
        isSoundEnabled: parsed.isSoundEnabled ?? true,
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
      isSoundEnabled: true,
      timerEndTimestamp: null,
      timerPausedRemainingSeconds: null,
      timerTotalDurationSeconds: 25 * 60,
    };
  });

  const [timerDisplaySeconds, setTimerDisplaySeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<{ name: string; lockedUntil: number | null } | null>(null);

  const activeAppId = useRef<string | null>(null);

  const playFeedbackSound = useCallback((type: 'task' | 'timer') => {
    if (!state.isSoundEnabled) return;
    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      if (type === 'task') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, now);
        osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.1);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.2);
        osc.frequency.setValueAtTime(783.99, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.6);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
        osc.start(now);
        osc.stop(now + 1.2);
      }
    } catch (e) {
      console.error("Audio playback error", e);
    }
  }, [state.isSoundEnabled]);

  useEffect(() => {
    localStorage.setItem('focus_guardian_v10_state', JSON.stringify(state));
  }, [state]);

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

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (state.timerEndTimestamp && !state.timerPausedRemainingSeconds) {
        const diff = Math.ceil((state.timerEndTimestamp - now) / 1000);
        if (diff <= 0) {
          handleCompleteFocus();
          playFeedbackSound('timer');
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
  }, [state.timerEndTimestamp, state.timerPausedRemainingSeconds, state.timerTotalDurationSeconds, playFeedbackSound]);

  const toggleTimer = () => {
    if (!state.isActivated) {
      alert("Activation Required: Enable the App Shield in Settings to start focus sessions.");
      return;
    }
    
    if (!state.timerEndTimestamp && !state.timerPausedRemainingSeconds && !state.activeTaskId) {
      const firstPending = state.tasks.find(t => !t.completed);
      if (firstPending) {
        setState(prev => ({ ...prev, activeTaskId: firstPending.id }));
      }
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
    switch (state.currentScreen) {
      case Screen.ONBOARDING: return <Onboarding onComplete={(name) => setState(p => ({...p, userName: name, isFirstTime: false, currentScreen: Screen.HOME}))} />;
      case Screen.HOME: return (
        <Focus 
          userName={state.userName} 
          tasks={state.tasks} 
          activeTaskId={state.activeTaskId}
          timerSeconds={timerDisplaySeconds}
          totalSeconds={state.timerTotalDurationSeconds}
          isTimerActive={isTimerRunning}
          onToggleTimer={toggleTimer}
          onResetTimer={resetTimer}
          onSetTimerSeconds={changeTimerDuration}
        />
      );
      case Screen.TASKS: return (
        <Tasks 
          tasks={state.tasks} 
          activeTaskId={state.activeTaskId} 
          isTimerActive={isTimerRunning}
          onAddTask={(t) => setState(p => ({...p, tasks: [...p.tasks, {id: Date.now().toString(), text: t, completed: false, createdAt: Date.now(), completedAt: null}]}))}
          onToggleTask={(id) => setState(p => {
            const task = p.tasks.find(t => t.id === id);
            if (!task) return p;
            const isNowCompleted = !task.completed;
            if (isNowCompleted) playFeedbackSound('task');
            return {
              ...p,
              activeTaskId: (p.activeTaskId === id && isNowCompleted) ? null : p.activeTaskId,
              balance: task.completed ? p.balance : p.balance + 50,
              tasks: p.tasks.map(t => t.id === id ? {...t, completed: isNowCompleted, completedAt: isNowCompleted ? Date.now() : null} : t)
            };
          })}
          onDeleteTask={(id) => setState(p => ({...p, tasks: p.tasks.filter(t => t.id !== id), activeTaskId: p.activeTaskId === id ? null : p.activeTaskId}))}
          onSetActiveTask={(id) => setState(p => ({...p, activeTaskId: id}))}
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
          isSoundEnabled={state.isSoundEnabled}
          onThemeChange={(t) => setState(p => ({...p, theme: t}))} 
          onAccentChange={(c) => setState(p => ({...p, accentColor: c}))}
          onToggleSound={() => setState(p => ({...p, isSoundEnabled: !p.isSoundEnabled}))}
        />
      );
      case Screen.REPORT: return <Report logs={state.blockLogs} />;
      case Screen.MARKET: return <Market balance={state.balance} onPurchase={() => {
        alert("The Marketplace items are currently being updated. No changes made.");
      }} />;
      case Screen.PHONE_SIMULATOR: return <PhoneSimulator 
        isUnlocked={false} 
        appTimers={state.appTimers} 
        cycleAppIds={state.cycleAppIds} 
        isTimerRunning={isTimerRunning}
        onAppClick={(id, name, isAllowed) => {
          if (!state.isActivated) { alert(`${name} is functional (Shield is OFF)`); return; }
          const timer = state.appTimers[id];
          if ((isTimerRunning && !isAllowed) || !isAllowed) {
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
    <div style={{'--accent-color': accentHex} as any} className="flex items-center justify-center min-h-screen w-full font-sans transition-all duration-300 dark:bg-slate-950 bg-slate-100">
      <Layout currentScreen={state.currentScreen} onNavigate={navigate} showNav={!state.isFirstTime && state.currentScreen !== Screen.ONBOARDING && state.currentScreen !== Screen.PHONE_SIMULATOR}>
        {renderContent()}
      </Layout>
      {activeOverlay && <BlockedOverlay appName={activeOverlay.name} lockedUntil={activeOverlay.lockedUntil} onClose={() => setActiveOverlay(null)} />}
    </div>
  );
};

export default App;