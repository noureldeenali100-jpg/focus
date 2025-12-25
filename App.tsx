import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Screen, State, Theme, AccentColor, FocusSession, UnlockRequest, AppInfo, AppConfig, FocusSound, AppFont } from './types';
import { 
  CYCLE_USAGE_LIMIT_MS, 
  CYCLE_LOCK_DURATION_MS, 
  CYCLE_APPS_BASE,
  UNALLOWED_APPS,
  DEFAULT_APP_COLORS
} from './constants';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import Focus from './components/Focus';
import Tasks from './components/Tasks';
import AllowedApps from './components/AllowedApps';
import Settings from './components/Settings';
import PhoneSimulator from './components/PhoneSimulator';
import BlockedOverlay from './components/BlockedOverlay';
import Market from './components/Market';
import SessionHistory from './components/SessionHistory';

const App: React.FC = () => {
  const [state, setState] = useState<State>(() => {
    const saved = localStorage.getItem('focus_guardian_v14_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      const globalConfig = parsed.globalAppConfig || (parsed.appConfigs?.wa ? parsed.appConfigs.wa : { allowedMs: CYCLE_USAGE_LIMIT_MS, lockMs: CYCLE_LOCK_DURATION_MS });
      
      return {
        ...parsed,
        isActivated: true,
        unlockRequests: parsed.unlockRequests || {},
        customApps: parsed.customApps || [],
        minWaitMs: parsed.minWaitMs || 60 * 60 * 1000,
        usageMs: parsed.usageMs || 60 * 60 * 1000,
        theme: parsed.theme || 'system',
        accentColor: parsed.accentColor || 'blue',
        font: parsed.font || 'Inter',
        language: parsed.language || 'en',
        profileImage: parsed.profileImage || null,
        signatureImage: parsed.signatureImage || null,
        sessionLogs: parsed.sessionLogs || [],
        activeSession: parsed.activeSession || null,
        lastSessionEventTimestamp: parsed.lastSessionEventTimestamp || Date.now(),
        isSoundEnabled: parsed.isSoundEnabled ?? true,
        focusSound: parsed.focusSound || 'none',
        timerEndTimestamp: parsed.timerEndTimestamp || null,
        timerPausedRemainingSeconds: parsed.timerPausedRemainingSeconds || null,
        timerTotalDurationSeconds: parsed.timerTotalDurationSeconds ?? 25 * 60,
        globalAppConfig: globalConfig,
        pendingGlobalConfig: parsed.pendingGlobalConfig || null,
      };
    }
    return {
      currentScreen: Screen.ONBOARDING,
      isFirstTime: true,
      isActivated: true,
      userName: '',
      profileImage: null,
      signatureImage: null,
      blockLogs: [],
      sessionLogs: [],
      activeSession: null,
      unlockRequests: {},
      customApps: [],
      minWaitMs: 60 * 60 * 1000,
      usageMs: 60 * 60 * 1000,
      lastSessionEventTimestamp: Date.now(),
      balance: 100,
      tasks: [],
      activeTaskId: null,
      theme: 'system',
      accentColor: 'blue',
      font: 'Inter',
      language: 'en',
      appTimers: {},
      globalAppConfig: { allowedMs: CYCLE_USAGE_LIMIT_MS, lockMs: CYCLE_LOCK_DURATION_MS },
      pendingGlobalConfig: null,
      cycleAppIds: CYCLE_APPS_BASE.map(a => a.id),
      isSoundEnabled: true,
      focusSound: 'none',
      timerEndTimestamp: null,
      timerPausedRemainingSeconds: null,
      timerTotalDurationSeconds: 25 * 60,
    };
  });

  const [timerDisplaySeconds, setTimerDisplaySeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<{ name: string; waitRemainingMs: number | null } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<any[]>([]);
  const clockIntervalRef = useRef<number | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  // Sound Feedback Helper
  const playFeedbackSound = useCallback((type: 'task' | 'complete' | 'cancel' | 'break') => {
    if (!state.isSoundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const g = ctx.createGain();
      g.connect(ctx.destination);

      if (type === 'task') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        g.gain.setValueAtTime(0.1, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(g);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'complete') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.frequency.setValueAtTime(523.25, now);
        osc2.frequency.setValueAtTime(659.25, now + 0.1);
        g.gain.setValueAtTime(0.15, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        osc1.connect(g);
        osc2.connect(g);
        osc1.start(now);
        osc2.start(now + 0.1);
        osc1.stop(now + 1.0);
        osc2.stop(now + 1.0);
      } else if (type === 'cancel') {
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(329.63, now); // E4
        osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.2); // C4
        g.gain.setValueAtTime(0.1, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(g);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'break') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        g.gain.setValueAtTime(0.05, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(g);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (e) {
      console.warn('Feedback sound error', e);
    }
  }, [state.isSoundEnabled]);

  // Debounced persistence
  useEffect(() => {
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      localStorage.setItem('focus_guardian_v14_state', JSON.stringify(state));
    }, 1000);
    return () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    };
  }, [state]);

  const navigate = useCallback((screen: Screen) => {
    setState(prev => prev.currentScreen === screen ? prev : { ...prev, currentScreen: screen });
  }, []);

  const finalizeSession = useCallback((status: 'completed' | 'canceled') => {
    // Play ending sound
    if (status === 'completed') playFeedbackSound('complete');
    else playFeedbackSound('cancel');

    setState(prev => {
      if (!prev.activeSession) return prev;
      
      const now = Date.now();
      let totalBreakMs = prev.activeSession.totalBreakMs;
      if (prev.activeSession.lastPauseTimestamp) {
        totalBreakMs += (now - prev.activeSession.lastPauseTimestamp);
      }

      let focusDuration = 0;
      if (prev.timerTotalDurationSeconds === 0) {
        focusDuration = Math.floor((now - prev.activeSession.startTime - totalBreakMs) / 1000);
      } else {
        const currentRemaining = prev.timerPausedRemainingSeconds !== null ? prev.timerPausedRemainingSeconds : Math.ceil(((prev.timerEndTimestamp || 0) - now) / 1000);
        focusDuration = status === 'completed' ? prev.timerTotalDurationSeconds : Math.max(0, prev.timerTotalDurationSeconds - currentRemaining);
      }

      const shouldBeCounted = focusDuration >= 600;
      const finalStatus = shouldBeCounted ? status : 'canceled';

      const newSession: FocusSession = {
        id: `session_${now}`,
        startTime: prev.activeSession.startTime,
        endTime: now,
        targetDurationSeconds: prev.timerTotalDurationSeconds,
        actualFocusSeconds: focusDuration,
        totalBreakSeconds: Math.floor(totalBreakMs / 1000),
        breakCount: prev.activeSession.breakCount,
        status: finalStatus,
        timestamp: now,
        isCounted: shouldBeCounted
      };

      return {
        ...prev,
        sessionLogs: [...prev.sessionLogs, newSession],
        activeSession: null,
        lastSessionEventTimestamp: now
      };
    });
  }, [playFeedbackSound]);

  const toggleTimerAction = useCallback(() => {
    const now = Date.now();
    setState(prev => {
      const isCurrentlyStarting = prev.timerPausedRemainingSeconds !== null || (!prev.timerEndTimestamp && prev.timerPausedRemainingSeconds === null);
      
      // Feedback sound for pause/resume
      if (isCurrentlyStarting) playFeedbackSound('break'); // Resume
      else playFeedbackSound('break'); // Pause

      if (isCurrentlyStarting) {
        let activeSession = prev.activeSession || { startTime: now, breakCount: 0, totalBreakMs: 0, lastPauseTimestamp: null };
        if (activeSession.lastPauseTimestamp) {
          activeSession = { ...activeSession, totalBreakMs: activeSession.totalBreakMs + (now - activeSession.lastPauseTimestamp), lastPauseTimestamp: null };
        }
        const remaining = prev.timerPausedRemainingSeconds !== null ? prev.timerPausedRemainingSeconds : prev.timerTotalDurationSeconds;
        return { 
          ...prev, 
          activeSession, 
          timerEndTimestamp: prev.timerTotalDurationSeconds === 0 ? now - (prev.timerPausedRemainingSeconds || 0) * 1000 : now + remaining * 1000, 
          timerPausedRemainingSeconds: null 
        };
      } else {
        const remaining = prev.timerTotalDurationSeconds === 0 ? Math.floor((now - (prev.timerEndTimestamp || now)) / 1000) : Math.max(0, Math.ceil((prev.timerEndTimestamp - now) / 1000));
        return { 
          ...prev, 
          timerPausedRemainingSeconds: remaining, 
          activeSession: prev.activeSession ? { ...prev.activeSession, breakCount: prev.activeSession.breakCount + 1, lastPauseTimestamp: now } : null 
        };
      }
    });
  }, [playFeedbackSound]);

  // Ambient Audio Controller
  useEffect(() => {
    const stopAudio = () => {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
      audioNodesRef.current.forEach(node => {
        try { node.stop(); node.disconnect(); } catch (e) {}
      });
      audioNodesRef.current = [];
    };

    if (!isTimerRunning || state.focusSound === 'none') {
      stopAudio();
      return;
    }

    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    stopAudio();

    const createNoiseBuffer = (noiseType: 'white' | 'brown') => {
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let lastOut = 0;

      for (let i = 0; i < bufferSize; i++) {
        if (noiseType === 'white') {
          output[i] = Math.random() * 2 - 1;
        } else {
          // Brown noise
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + (0.02 * white)) / 1.02;
          output[i] = lastOut * 3.5;
        }
      }
      return buffer;
    };

    if (state.focusSound === 'rain') {
      const source = ctx.createBufferSource();
      source.buffer = createNoiseBuffer('white');
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      const gain = ctx.createGain();
      gain.gain.value = 0.12;
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
      audioNodesRef.current.push(source);
    } else if (state.focusSound === 'library') {
      const source = ctx.createBufferSource();
      source.buffer = createNoiseBuffer('brown');
      source.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0.08;
      source.connect(gain).connect(ctx.destination);
      source.start();
      audioNodesRef.current.push(source);
    } else if (state.focusSound === 'clock') {
      clockIntervalRef.current = window.setInterval(() => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        g.gain.setValueAtTime(0.02, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        osc.connect(g).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      }, 1000);
    }

    return stopAudio;
  }, [isTimerRunning, state.focusSound]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case ' ': 
          if (state.currentScreen === Screen.HOME) {
            e.preventDefault(); 
            toggleTimerAction();
          }
          break;
        case 'f': navigate(Screen.HOME); break;
        case 't': navigate(Screen.TASKS); break;
        case 'a': navigate(Screen.ALLOWED_APPS); break;
        case 's': navigate(Screen.SETTINGS); break;
        case 'escape':
          if (state.currentScreen !== Screen.HOME && state.currentScreen !== Screen.ONBOARDING) {
            navigate(Screen.HOME);
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.currentScreen, navigate, toggleTimerAction]);

  // General state update loops
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setState(prev => {
        let hasChanges = false;
        let updatedRequests = { ...prev.unlockRequests };
        let pendingGlobalConfig = prev.pendingGlobalConfig;

        if (pendingGlobalConfig && now - pendingGlobalConfig.requestedAt >= 60 * 60 * 1000) {
          return {
            ...prev,
            globalAppConfig: pendingGlobalConfig.config,
            pendingGlobalConfig: null
          };
        }

        Object.keys(updatedRequests).forEach((appId) => {
          const request = updatedRequests[appId];
          if (!request.expiresAt && (now - request.requestedAt >= prev.minWaitMs)) {
            updatedRequests[appId] = { ...request, expiresAt: now + prev.usageMs };
            hasChanges = true;
          }
          if (request.expiresAt && now > request.expiresAt) {
            delete updatedRequests[appId];
            hasChanges = true;
          }
        });

        if (hasChanges) return { ...prev, unlockRequests: updatedRequests };
        return prev;
      });
    }, 1000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let animationFrame: number;
    const updateTimer = () => {
      const now = Date.now();
      if (state.timerEndTimestamp && state.timerPausedRemainingSeconds === null) {
        if (state.timerTotalDurationSeconds === 0) {
          const diff = Math.floor((now - state.timerEndTimestamp) / 1000);
          setTimerDisplaySeconds(prev => prev === diff ? prev : diff);
          setIsTimerRunning(true);
        } else {
          const diff = Math.ceil((state.timerEndTimestamp - now) / 1000);
          if (diff <= 0) {
            finalizeSession('completed');
            setState(prev => ({ ...prev, timerEndTimestamp: null, timerPausedRemainingSeconds: null, balance: prev.balance + 100 }));
            setTimerDisplaySeconds(0);
            setIsTimerRunning(false);
          } else {
            setTimerDisplaySeconds(prev => prev === diff ? prev : diff);
            setIsTimerRunning(true);
          }
        }
      } else if (state.timerPausedRemainingSeconds !== null) {
        setTimerDisplaySeconds(state.timerPausedRemainingSeconds);
        setIsTimerRunning(false);
      } else {
        setTimerDisplaySeconds(state.timerTotalDurationSeconds);
        setIsTimerRunning(false);
      }
      animationFrame = requestAnimationFrame(updateTimer);
    };
    
    animationFrame = requestAnimationFrame(updateTimer);
    return () => cancelAnimationFrame(animationFrame);
  }, [state.timerEndTimestamp, state.timerPausedRemainingSeconds, state.timerTotalDurationSeconds, finalizeSession]);

  const requestUnlock = (appId: string) => {
    const allBlocked = UNALLOWED_APPS.concat(state.customApps);
    const app = allBlocked.find(a => a.id === appId);
    if (app?.isPermanentBlock) return;

    if (state.unlockRequests[appId]) return;
    setState(prev => ({
      ...prev,
      unlockRequests: { ...prev.unlockRequests, [appId]: { appId, requestedAt: Date.now(), expiresAt: null } }
    }));
  };

  const requestConfigUpdate = (allowedMins: number, lockMins: number) => {
    const config: AppConfig = { allowedMs: allowedMins * 60000, lockMs: lockMins * 60000 };
    setState(prev => ({
      ...prev,
      pendingGlobalConfig: { config, requestedAt: Date.now() }
    }));
  };

  const themeColors = useMemo(() => ({
    blue: { main: '#2563eb', light: '#eff6ff', dark: '#1e40af', subtle: 'rgba(37, 99, 235, 0.1)' },
    emerald: { main: '#10b981', light: '#ecfdf5', dark: '#065f46', subtle: 'rgba(16, 185, 129, 0.1)' },
    purple: { main: '#9333ea', light: '#f5f3ff', dark: '#6b21a8', subtle: 'rgba(147, 51, 234, 0.1)' },
    amber: { main: '#d97706', light: '#fffbeb', dark: '#92400e', subtle: 'rgba(217, 119, 6, 0.1)' },
    rose: { main: '#e11d48', light: '#fff1f2', dark: '#9f1239', subtle: 'rgba(225, 29, 72, 0.1)' },
    slate: { main: '#475569', light: '#f8fafc', dark: '#1e293b', subtle: 'rgba(71, 85, 105, 0.1)' }
  }), []);

  const currentTheme = themeColors[state.accentColor];

  return (
    <div 
      style={{ '--accent-color': currentTheme.main, '--accent-light': currentTheme.light, '--accent-dark': currentTheme.dark, '--accent-subtle': currentTheme.subtle } as any} 
      className="flex items-center justify-center min-h-screen w-full font-sans transition-all duration-300 dark:bg-slate-950 bg-slate-100"
    >
      <div className="w-full h-full md:max-w-[450px] md:h-[90vh] md:max-h-[920px] md:my-auto md:rounded-[40px] md:shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-500 bg-white dark:bg-slate-900 relative">
        <Layout currentScreen={state.currentScreen} onNavigate={navigate} showNav={!state.isFirstTime && state.currentScreen !== Screen.ONBOARDING && state.currentScreen !== Screen.PHONE_SIMULATOR}>
          {state.currentScreen === Screen.ONBOARDING && <Onboarding onComplete={(name, signature) => setState(p => ({...p, userName: name, signatureImage: signature, isFirstTime: false, currentScreen: Screen.HOME}))} />}
          {state.currentScreen === Screen.HOME && (
            <Focus 
              userName={state.userName} 
              profileImage={state.profileImage}
              tasks={state.tasks} 
              activeTaskId={state.activeTaskId}
              timerSeconds={timerDisplaySeconds}
              totalSeconds={state.timerTotalDurationSeconds}
              isTimerActive={isTimerRunning}
              language={state.language}
              focusSound={state.focusSound}
              onToggleTimer={toggleTimerAction}
              onToggleMode={() => {
                if (isTimerRunning || state.timerPausedRemainingSeconds !== null) finalizeSession('canceled');
                setState(prev => ({ ...prev, timerTotalDurationSeconds: prev.timerTotalDurationSeconds === 0 ? 25 * 60 : 0, timerEndTimestamp: null, timerPausedRemainingSeconds: null, activeSession: null }));
              }}
              onSetTimerSeconds={(s) => setState(prev => ({ ...prev, timerTotalDurationSeconds: s, timerEndTimestamp: null, timerPausedRemainingSeconds: null, activeSession: null }))}
              onSetFocusSound={(s) => setState(p => ({...p, focusSound: s}))}
            />
          )}
          {state.currentScreen === Screen.TASKS && (
            <Tasks 
              tasks={state.tasks} 
              activeTaskId={state.activeTaskId} 
              isTimerActive={isTimerRunning}
              onAddTask={(t) => setState(p => ({...p, tasks: [...p.tasks, {id: Date.now().toString(), text: t, completed: false, createdAt: Date.now(), completedAt: null}]}))}
              onToggleTask={(id) => {
                setState(p => {
                  const task = p.tasks.find(t => t.id === id);
                  if (!task) return p;
                  if (!task.completed) playFeedbackSound('task');
                  return { ...p, activeTaskId: (p.activeTaskId === id && !task.completed) ? null : p.activeTaskId, balance: task.completed ? p.balance : p.balance + 50, tasks: p.tasks.map(t => t.id === id ? {...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : null} : t) };
                })
              }}
              onDeleteTask={(id) => setState(p => ({...p, tasks: p.tasks.filter(t => t.id !== id), activeTaskId: p.activeTaskId === id ? null : p.activeTaskId}))}
              onSetActiveTask={(id) => setState(p => ({...p, activeTaskId: id}))}
            />
          )}
          {state.currentScreen === Screen.ALLOWED_APPS && (
            <AllowedApps 
              appTimers={state.appTimers} 
              cycleAppIds={state.cycleAppIds} 
              appConfigs={{wa: state.globalAppConfig, tg: state.globalAppConfig}} 
              unlockRequests={state.unlockRequests}
              customApps={state.customApps}
              minWaitMs={state.minWaitMs}
              onRequestUnlock={requestUnlock}
              onAddCustomApp={(app) => setState(p => ({...p, customApps: [...p.customApps, app]}))}
            />
          )}
          {state.currentScreen === Screen.SETTINGS && (
            <Settings 
              theme={state.theme} accentColor={state.accentColor} font={state.font}
              isSoundEnabled={state.isSoundEnabled}
              focusSound={state.focusSound}
              userName={state.userName}
              profileImage={state.profileImage}
              signatureImage={state.signatureImage}
              language={state.language}
              minWaitMs={state.minWaitMs}
              usageMs={state.usageMs}
              sessionLogs={state.sessionLogs}
              globalAppConfig={state.globalAppConfig}
              pendingGlobalConfig={state.pendingGlobalConfig}
              onThemeChange={(t) => setState(p => ({...p, theme: t}))} 
              onAccentChange={(c) => setState(p => ({...p, accentColor: c}))}
              onFontChange={(f) => setState(p => ({...p, font: f}))}
              onToggleSound={() => setState(p => ({...p, isSoundEnabled: !p.isSoundEnabled}))}
              onSetFocusSound={(s) => setState(p => ({...p, focusSound: s}))}
              onNameChange={(name) => setState(p => ({...p, userName: name}))}
              onProfileImageChange={(img) => setState(p => img.startsWith('data:image/png') ? {...p, signatureImage: img} : {...p, profileImage: img})}
              onLanguageChange={(lang) => setState(p => ({...p, language: lang}))}
              onWaitChange={(ms) => setState(p => ({...p, minWaitMs: ms}))}
              onUsageChange={(ms) => setState(p => ({...p, usageMs: ms}))}
              onRequestConfigUpdate={requestConfigUpdate}
              onNavigate={navigate}
            />
          )}
          {state.currentScreen === Screen.MARKET && <Market balance={state.balance} onPurchase={() => {}} />}
          {state.currentScreen === Screen.SESSION_HISTORY && (
            <SessionHistory 
              sessions={state.sessionLogs} 
              onBack={() => navigate(Screen.SETTINGS)} 
              language={state.language}
            />
          )}
          {state.currentScreen === Screen.PHONE_SIMULATOR && (
            <PhoneSimulator 
              isUnlocked={false} 
              appTimers={state.appTimers} 
              cycleAppIds={state.cycleAppIds} 
              unlockRequests={state.unlockRequests}
              customApps={state.customApps}
              isTimerRunning={isTimerRunning}
              onAppClick={(id, name, isAllowed) => {
                const request = state.unlockRequests[id];
                if (!isAllowed && !(request?.expiresAt && Date.now() < request.expiresAt)) {
                  setActiveOverlay({ name, waitRemainingMs: request ? Math.max(0, state.minWaitMs - (Date.now() - request.requestedAt)) : null });
                  setState(prev => ({ ...prev, blockLogs: [...prev.blockLogs, { appName: name, timestamp: Date.now() }] }));
                } else {
                  alert(`Opening ${name}...`);
                }
              }} 
              onExit={() => navigate(Screen.HOME)} 
            />
          )}
        </Layout>
      </div>
      {activeOverlay && <BlockedOverlay appName={activeOverlay.name} waitRemainingMs={activeOverlay.waitRemainingMs} onClose={() => setActiveOverlay(null)} />}
    </div>
  );
};

export default App;