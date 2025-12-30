/**
 * Main Application Component.
 * Orchestrates global state, navigation, audio feedback, and persistence.
 * 
 * ARCHITECTURAL PRINCIPLE: "The Stage"
 * The app fills 100% of the viewport with zero overflow or ghost scrolling.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Screen, State, FocusSession, Screen as ScreenType } from './types';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import Focus from './components/Focus';
import Tasks from './components/Tasks';
import Settings from './components/Settings';
import BlockedOverlay from './components/BlockedOverlay';
import Market from './components/Market';
import SessionHistory from './components/SessionHistory';
import PostSessionPrompt from './components/PostSessionPrompt';

const STORAGE_KEY = 'focus_guardian_v19_state';

const App: React.FC = () => {
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
        return { ...initialState, ...parsed, isActivated: true };
      }
    } catch (e) { console.warn('Hydration Error:', e); }
    return initialState;
  });

  const [timerDisplaySeconds, setTimerDisplaySeconds] = useState(0);
  const [activeOverlay, setActiveOverlay] = useState<{ name: string; waitRemainingMs: number | null } | null>(null);
  const [isAppFullscreen, setIsAppFullscreen] = useState(false);
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);

  const isTimerActive = useMemo(() => 
    state.timerEndTimestamp !== null || state.timerPausedRemainingSeconds !== null
  , [state.timerEndTimestamp, state.timerPausedRemainingSeconds]);

  const isPaused = useMemo(() => state.timerPausedRemainingSeconds !== null, [state.timerPausedRemainingSeconds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const navigate = useCallback((screen: ScreenType) => {
    setState(prev => ({ ...prev, currentScreen: screen }));
  }, []);

  const finalizeSessionAndReset = useCallback((status: 'completed' | 'canceled') => {
    setState(prev => {
      if (!prev.activeSession && !isTimerActive) return prev;
      const now = Date.now();
      const actualDuration = prev.timerTotalDurationSeconds - timerDisplaySeconds;
      const newSession: FocusSession = {
        id: `session_${now}`, 
        startTime: prev.activeSession?.startTime || now, 
        endTime: now, 
        targetDurationSeconds: prev.timerTotalDurationSeconds,
        actualFocusSeconds: Math.max(0, actualDuration), 
        totalBreakSeconds: 0, 
        breakCount: 0,
        status, 
        timestamp: now, 
        isCounted: true
      };

      if (status === 'completed') {
        setTimeout(() => setShowCompletionPrompt(true), 400);
      }

      return { 
        ...prev, 
        sessionLogs: [...prev.sessionLogs, newSession], 
        activeSession: null, 
        timerEndTimestamp: null,
        timerPausedRemainingSeconds: null,
        balance: status === 'completed' ? prev.balance + 100 : prev.balance
      };
    });
  }, [timerDisplaySeconds, isTimerActive]);

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

  const handleStartBreak = () => {
    setShowCompletionPrompt(false);
    setState(prev => ({ 
      ...prev, 
      timerTotalDurationSeconds: 5 * 60,
      timerPausedRemainingSeconds: null,
      timerEndTimestamp: Date.now() + (5 * 60 * 1000),
      activeSession: { startTime: Date.now(), breakCount: 0, totalBreakMs: 0, lastPauseTimestamp: null }
    }));
  };

  const handleContinueFocus = () => {
    setShowCompletionPrompt(false);
    toggleTimerAction();
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = state.theme === 'dark' || (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) root.classList.add('dark'); else root.classList.remove('dark');
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

  const currentTheme = useMemo(() => {
    const themeMap = {
      blue: { main: '#2563eb', subtle: 'rgba(37, 99, 235, 0.1)' },
      emerald: { main: '#10b981', subtle: 'rgba(16, 185, 129, 0.1)' },
      purple: { main: '#9333ea', subtle: 'rgba(147, 51, 234, 0.1)' },
      amber: { main: '#d97706', subtle: 'rgba(217, 119, 6, 0.1)' },
      rose: { main: '#e11d48', subtle: 'rgba(225, 29, 72, 0.1)' },
      slate: { main: '#475569', subtle: 'rgba(71, 85, 105, 0.1)' }
    };
    return themeMap[state.accentColor] || themeMap.blue;
  }, [state.accentColor]);

  const showNav = !state.isFirstTime && state.currentScreen !== Screen.ONBOARDING;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ '--accent-color': currentTheme.main, '--accent-subtle': currentTheme.subtle } as any} 
      className="h-screen w-screen flex flex-col bg-white dark:bg-slate-900 font-sans overflow-hidden"
    >
      <Layout currentScreen={state.currentScreen} onNavigate={navigate} showNav={showNav && !isAppFullscreen}>
        <AnimatePresence mode="wait">
          {state.currentScreen === Screen.ONBOARDING && (
            <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full">
              <Onboarding onComplete={(name, signature) => setState(p => ({
                ...p, userName: name, signatureImage: signature, isFirstTime: false, currentScreen: Screen.HOME
              }))} />
            </motion.div>
          )}
          
          {state.currentScreen === Screen.HOME && (
            <motion.div key="home" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="h-full w-full">
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
                onSetTimerSeconds={(s) => setState(prev => ({ ...prev, timerTotalDurationSeconds: s, timerEndTimestamp: null, timerPausedRemainingSeconds: null, activeSession: null }))}
                onSetFocusSound={(s) => setState(p => ({ ...p, focusSound: s }))}
                onEndSession={() => finalizeSessionAndReset('canceled')}
                isAppFullscreen={isAppFullscreen} setIsAppFullscreen={setIsAppFullscreen}
              />
            </motion.div>
          )}
          
          {state.currentScreen === Screen.TASKS && (
            <motion.div key="tasks" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="h-full w-full">
              <Tasks 
                tasks={state.tasks} activeTaskId={state.activeTaskId} isTimerActive={isTimerActive && !isPaused}
                onAddTask={(text) => setState(p => ({ ...p, tasks: [...p.tasks, { id: Date.now().toString(), text, completed: false, createdAt: Date.now(), completedAt: null }] }))}
                onToggleTask={(id) => setState(p => ({ ...p, tasks: p.tasks.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : null } : t) }))}
                onDeleteTask={(id) => setState(p => ({ ...p, tasks: p.tasks.filter(t => t.id !== id) }))}
                onSetActiveTask={(id) => setState(p => ({ ...p, activeTaskId: id }))}
                onUpdateTask={(id, text) => setState(p => ({ ...p, tasks: p.tasks.map(t => t.id === id ? { ...t, text } : t) }))}
              />
            </motion.div>
          )}
          
          {state.currentScreen === Screen.SETTINGS && (
            <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="h-full w-full">
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
                onNameChange={(name) => setState(p => ({ ...p, userName: name }))}
                onProfileImageChange={(img) => setState(p => ({ ...p, profileImage: img }))}
                onSignatureChange={(img) => setState(p => ({ ...p, signatureImage: img }))}
                onNavigate={navigate}
              />
            </motion.div>
          )}
          
          {state.currentScreen === Screen.MARKET && (
             <motion.div key="market" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="h-full w-full">
              <Market balance={state.balance} onPurchase={() => {}} />
             </motion.div>
          )}
          
          {state.currentScreen === Screen.SESSION_HISTORY && (
             <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="h-full w-full">
              <SessionHistory sessions={state.sessionLogs} />
             </motion.div>
          )}
        </AnimatePresence>
      </Layout>

      <AnimatePresence>
        {activeOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200]"
          >
            <BlockedOverlay appName={activeOverlay.name} onClose={() => setActiveOverlay(null)} />
          </motion.div>
        )}

        {showCompletionPrompt && (
          <PostSessionPrompt 
            userName={state.userName} 
            onTakeBreak={handleStartBreak} 
            onContinue={handleContinueFocus} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default App;