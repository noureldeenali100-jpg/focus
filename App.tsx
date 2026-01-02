import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Screen, State, FocusSession, Screen as ScreenType, FocusSound } from './types';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import Focus from './components/Focus';
import Tasks from './components/Tasks';
import Settings from './components/Settings';
import BlockedOverlay from './components/BlockedOverlay';
import SessionHistory from './components/SessionHistory';
import PostSessionPrompt from './components/PostSessionPrompt';
import { sanitize, hardenState, clamp } from './utils/security';

const STORAGE_KEY = 'focus_guardian_v20_vault';

const App: React.FC = () => {
  // --- 1. Hardened State Hydration ---
  const [state, setState] = useState<State>(() => {
    const initialState: State = {
      currentScreen: Screen.ONBOARDING,
      isFirstTime: true,
      isActivated: true,
      userName: '',
      profileImage: null,
      signatureImage: null,
      blockLogs: [],
      sessionLogs: [],
      activeSession: null,
      lastSessionEventTimestamp: Date.now(),
      balance: 100,
      tasks: [],
      activeTaskId: null,
      theme: 'system',
      accentColor: 'blue',
      font: 'Inter',
      isSoundEnabled: true,
      isAnimationsEnabled: true,
      isTimerGlowEnabled: true,
      focusSound: 'none',
      timerEndTimestamp: null,
      timerPausedRemainingSeconds: null,
      timerTotalDurationSeconds: 25 * 60,
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return hardenState(parsed, initialState);
      }
    } catch (e) {
      console.warn('Stability Monitor: Data corruption detected. Reverting to safe defaults.', e);
    }
    return initialState;
  });

  const [timerDisplaySeconds, setTimerDisplaySeconds] = useState(0);
  const [activeOverlay, setActiveOverlay] = useState<{ name: string; waitRemainingMs: number | null } | null>(null);
  const [isAppFullscreen, setIsAppFullscreen] = useState(false);
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);

  // SECURITY: Concurrency lock for session completion
  const isFinalizingRef = useRef(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const soundNodesRef = useRef<{ source: AudioNode | null; gain: GainNode | null }>({ source: null, gain: null });

  const stopAmbientSound = useCallback(() => {
    if (soundNodesRef.current.source) {
      soundNodesRef.current.source.disconnect();
      soundNodesRef.current.source = null;
    }
  }, []);

  const startAmbientSound = useCallback((type: FocusSound) => {
    stopAmbientSound();
    if (type === 'none') return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.15;
      gainNode.connect(ctx.destination);
      soundNodesRef.current.gain = gainNode;

      if (type === 'rain') {
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5) * 0.11;
        }
        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;
        source.connect(gainNode);
        source.start();
        soundNodesRef.current.source = source;
      } else if (type === 'clock') {
        const osc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        clickGain.gain.setValueAtTime(0, ctx.currentTime);
        const interval = setInterval(() => {
          if (!ctx || ctx.state === 'closed') return;
          const now = ctx.currentTime;
          clickGain.gain.cancelScheduledValues(now);
          clickGain.gain.setValueAtTime(0.3, now);
          clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        }, 1000);
        osc.connect(clickGain);
        clickGain.connect(gainNode);
        osc.start();
        soundNodesRef.current.source = {
          disconnect: () => { clearInterval(interval); osc.stop(); osc.disconnect(); clickGain.disconnect(); }
        } as any;
      }
    } catch (e) {
      console.warn('Audio Security: Graceful bypass of audio engine error.', e);
    }
  }, [stopAmbientSound]);

  const finalizeSessionAndReset = useCallback((status: 'completed' | 'canceled') => {
    if (isFinalizingRef.current) return;
    isFinalizingRef.current = true;

    setState(prev => {
      if (!prev.activeSession && prev.timerEndTimestamp === null) {
        isFinalizingRef.current = false;
        return prev;
      }
      
      const now = Date.now();
      const actualDuration = prev.timerTotalDurationSeconds - timerDisplaySeconds;
      const newSession: FocusSession = {
        id: `session_${now}`, 
        startTime: prev.activeSession?.startTime || now, 
        endTime: now, 
        targetDurationSeconds: prev.timerTotalDurationSeconds,
        actualFocusSeconds: clamp(actualDuration, 0, 86400, 0), 
        totalBreakSeconds: 0, 
        breakCount: 0,
        status, 
        timestamp: now, 
        isCounted: true
      };

      if (status === 'completed') {
        setTimeout(() => setShowCompletionPrompt(true), 400);
      }

      // Unlock after state update propagation
      setTimeout(() => { isFinalizingRef.current = false; }, 1000);

      return { 
        ...prev, 
        sessionLogs: [...prev.sessionLogs, newSession], 
        activeSession: null, 
        timerEndTimestamp: null,
        timerPausedRemainingSeconds: null,
        balance: status === 'completed' ? clamp(prev.balance + 100, 0, 1000000, 0) : prev.balance
      };
    });
  }, [timerDisplaySeconds]);

  const toggleTimerAction = useCallback(() => {
    const now = Date.now();
    setState(prev => {
      const isStartingOrResuming = prev.timerPausedRemainingSeconds !== null || (!prev.timerEndTimestamp);
      if (isStartingOrResuming) {
        const remaining = prev.timerPausedRemainingSeconds !== null ? prev.timerPausedRemainingSeconds : prev.timerTotalDurationSeconds;
        return { 
          ...prev, 
          activeSession: prev.activeSession || { startTime: now, breakCount: 0, totalBreakMs: 0, lastPauseTimestamp: null },
          timerEndTimestamp: prev.timerTotalDurationSeconds === 0 ? now + 999999999 : now + (remaining * 1000), 
          timerPausedRemainingSeconds: null 
        };
      } else {
        const remaining = prev.timerTotalDurationSeconds === 0 ? 
          Math.ceil((now - (prev.activeSession?.startTime || now)) / 1000) : 
          Math.max(0, Math.ceil(((prev.timerEndTimestamp || 0) - now) / 1000));
        return { ...prev, timerPausedRemainingSeconds: remaining, timerEndTimestamp: null };
      }
    });
  }, []);

  const handleStartBreak = useCallback(() => {
    setShowCompletionPrompt(false);
    const now = Date.now();
    setState(prev => ({
      ...prev,
      timerTotalDurationSeconds: 300,
      timerEndTimestamp: now + (300 * 1000),
      timerPausedRemainingSeconds: null,
      activeSession: null
    }));
  }, []);

  const handleContinueFocus = useCallback(() => {
    setShowCompletionPrompt(false);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const navigate = useCallback((screen: ScreenType) => {
    setState(prev => ({ ...prev, currentScreen: screen }));
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = state.theme === 'dark' || (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
  }, [state.theme]);

  useEffect(() => {
    let animationFrame: number;
    const updateTimer = () => {
      const now = Date.now();
      if (state.timerEndTimestamp && state.timerPausedRemainingSeconds === null) {
        if (state.timerTotalDurationSeconds === 0) {
          const start = state.activeSession?.startTime || now;
          setTimerDisplaySeconds(Math.floor((now - start) / 1000));
        } else {
          const diff = Math.ceil((state.timerEndTimestamp - now) / 1000);
          if (diff <= 0) { finalizeSessionAndReset('completed'); } else { setTimerDisplaySeconds(diff); }
        }
      } else if (state.timerPausedRemainingSeconds !== null) { 
        setTimerDisplaySeconds(state.timerPausedRemainingSeconds); 
      } else { 
        setTimerDisplaySeconds(state.timerTotalDurationSeconds); 
      }
      animationFrame = requestAnimationFrame(updateTimer);
    };
    animationFrame = requestAnimationFrame(updateTimer); 
    return () => cancelAnimationFrame(animationFrame);
  }, [state.timerEndTimestamp, state.timerPausedRemainingSeconds, state.timerTotalDurationSeconds, state.activeSession, finalizeSessionAndReset]);

  const isTimerActive = state.timerEndTimestamp !== null || state.timerPausedRemainingSeconds !== null;
  const isPaused = state.timerPausedRemainingSeconds !== null;

  const currentTheme = useMemo(() => {
    const palette: Record<string, string> = { blue: '#2563eb', emerald: '#10b981', purple: '#9333ea', amber: '#d97706', rose: '#e11d48', slate: '#475569' };
    const main = palette[state.accentColor] || palette.blue;
    return { main, subtle: `${main}1a` };
  }, [state.accentColor]);

  useEffect(() => {
    if (isTimerActive && !isPaused && state.isSoundEnabled) {
      startAmbientSound(state.focusSound);
    } else {
      stopAmbientSound();
    }
  }, [isTimerActive, isPaused, state.focusSound, state.isSoundEnabled, startAmbientSound, stopAmbientSound]);

  const transition = state.isAnimationsEnabled ? { duration: 0.25 } : { duration: 0 };

  return (
    <motion.div 
      initial={state.isAnimationsEnabled ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: state.isAnimationsEnabled ? 0.4 : 0 }}
      style={{ '--accent-color': currentTheme.main, '--accent-subtle': currentTheme.subtle } as any} 
      className="h-screen w-screen flex flex-col bg-white dark:bg-slate-900 font-sans overflow-hidden"
    >
      <Layout currentScreen={state.currentScreen} onNavigate={navigate} showNav={!state.isFirstTime && state.currentScreen !== Screen.ONBOARDING && !isAppFullscreen}>
        <AnimatePresence mode="wait">
          {state.currentScreen === Screen.ONBOARDING && (
            <motion.div key="onboarding" initial={state.isAnimationsEnabled ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={state.isAnimationsEnabled ? { opacity: 0 } : {}} transition={transition} className="h-full w-full">
              <Onboarding onComplete={(name, signature) => setState(p => ({
                ...p, userName: sanitize(name, 25), signatureImage: signature, isFirstTime: false, currentScreen: Screen.HOME
              }))} />
            </motion.div>
          )}
          
          {state.currentScreen === Screen.HOME && (
            <motion.div key="home" initial={state.isAnimationsEnabled ? { opacity: 0, y: 8 } : {}} animate={{ opacity: 1, y: 0 }} exit={state.isAnimationsEnabled ? { opacity: 0, y: -8 } : {}} transition={transition} className="h-full w-full">
              <Focus 
                userName={state.userName} profileImage={state.profileImage} tasks={state.tasks} activeTaskId={state.activeTaskId} 
                timerSeconds={timerDisplaySeconds} totalSeconds={state.timerTotalDurationSeconds} 
                isTimerActive={isTimerActive} isPaused={isPaused} isAnimationsEnabled={state.isAnimationsEnabled} 
                isTimerGlowEnabled={state.isTimerGlowEnabled} focusSound={state.focusSound}
                onToggleTimer={toggleTimerAction} 
                onToggleMode={() => setState(prev => ({ 
                  ...prev, 
                  timerTotalDurationSeconds: prev.timerTotalDurationSeconds === 0 ? 25 * 60 : 0,
                  timerEndTimestamp: null,
                  timerPausedRemainingSeconds: null,
                  activeSession: null
                }))}
                onSetTimerSeconds={(s) => setState(prev => ({ ...prev, timerTotalDurationSeconds: clamp(s, 0, 86400, 25 * 60), timerEndTimestamp: null, timerPausedRemainingSeconds: null, activeSession: null }))}
                onSetFocusSound={(s) => setState(p => ({ ...p, focusSound: s }))}
                onEndSession={() => finalizeSessionAndReset('canceled')}
                isAppFullscreen={isAppFullscreen} setIsAppFullscreen={setIsAppFullscreen}
              />
            </motion.div>
          )}
          
          {state.currentScreen === Screen.TASKS && (
            <motion.div key="tasks" initial={state.isAnimationsEnabled ? { opacity: 0, y: 8 } : {}} animate={{ opacity: 1, y: 0 }} exit={state.isAnimationsEnabled ? { opacity: 0, y: -8 } : {}} transition={transition} className="h-full w-full">
              <Tasks 
                tasks={state.tasks} activeTaskId={state.activeTaskId} isTimerActive={isTimerActive && !isPaused}
                isAnimationsEnabled={state.isAnimationsEnabled}
                onAddTask={(text, description) => setState(p => ({ ...p, tasks: [...p.tasks, { id: Date.now().toString(), text: sanitize(text, 100), description: sanitize(description || '', 500), completed: false, createdAt: Date.now(), completedAt: null }] }))}
                onToggleTask={(id) => setState(p => ({ ...p, tasks: p.tasks.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : null } : t) }))}
                onDeleteTask={(id) => setState(p => ({ ...p, tasks: p.tasks.filter(t => t.id !== id) }))}
                onSetActiveTask={(id) => setState(p => ({ ...p, activeTaskId: id }))}
                onUpdateTask={(id, text, description) => setState(p => ({ ...p, tasks: p.tasks.map(t => t.id === id ? { ...t, text: sanitize(text, 100), description: sanitize(description || '', 500) } : t) }))}
              />
            </motion.div>
          )}
          
          {state.currentScreen === Screen.SETTINGS && (
            <motion.div key="settings" initial={state.isAnimationsEnabled ? { opacity: 0, y: 8 } : {}} animate={{ opacity: 1, y: 0 }} exit={state.isAnimationsEnabled ? { opacity: 0, y: -8 } : {}} transition={transition} className="h-full w-full">
              <Settings 
                theme={state.theme} accentColor={state.accentColor} font={state.font} isSoundEnabled={state.isSoundEnabled} 
                isAnimationsEnabled={state.isAnimationsEnabled} isTimerGlowEnabled={state.isTimerGlowEnabled} focusSound={state.focusSound} userName={state.userName} 
                profileImage={state.profileImage} signatureImage={state.signatureImage} sessionLogs={state.sessionLogs}
                onThemeChange={(t) => setState(p => ({ ...p, theme: t }))}
                onAccentChange={(c) => setState(p => ({ ...p, accentColor: c }))}
                onFontChange={(f) => setState(p => ({ ...p, font: f }))}
                onToggleSound={() => setState(p => ({ ...p, isSoundEnabled: !p.isSoundEnabled }))}
                onToggleAnimations={() => setState(p => ({ ...p, isAnimationsEnabled: !p.isAnimationsEnabled }))}
                onToggleTimerGlow={() => setState(p => ({ ...p, isTimerGlowEnabled: !p.isTimerGlowEnabled }))}
                onSetFocusSound={(s) => setState(p => ({ ...p, focusSound: s }))}
                onNameChange={(name) => setState(p => ({ ...p, userName: sanitize(name, 25) }))}
                onProfileImageChange={(img) => setState(p => ({ ...p, profileImage: img }))}
                onSignatureChange={(img) => setState(p => ({ ...p, signatureImage: img }))}
                onNavigate={navigate}
              />
            </motion.div>
          )}
          
          {state.currentScreen === Screen.SESSION_HISTORY && (
             <motion.div key="history" initial={state.isAnimationsEnabled ? { opacity: 0, y: 8 } : {}} animate={{ opacity: 1, y: 0 }} exit={state.isAnimationsEnabled ? { opacity: 0, y: -8 } : {}} transition={transition} className="h-full w-full">
              <SessionHistory sessions={state.sessionLogs} isAnimationsEnabled={state.isAnimationsEnabled} onDeleteSession={(id) => setState(p => ({ ...p, sessionLogs: p.sessionLogs.filter(s => s.id !== id) }))} onClearAll={() => setState(p => ({ ...p, sessionLogs: [] }))} />
             </motion.div>
          )}
        </AnimatePresence>
      </Layout>

      <AnimatePresence>
        {activeOverlay && (
          <motion.div initial={state.isAnimationsEnabled ? { opacity: 0 } : {}} animate={{ opacity: 1 }} exit={state.isAnimationsEnabled ? { opacity: 0 } : {}} className="fixed inset-0 z-[200]">
            <BlockedOverlay appName={activeOverlay.name} onClose={() => setActiveOverlay(null)} />
          </motion.div>
        )}
        {showCompletionPrompt && (
          <PostSessionPrompt userName={state.userName} onTakeBreak={handleStartBreak} onContinue={handleContinueFocus} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default App;