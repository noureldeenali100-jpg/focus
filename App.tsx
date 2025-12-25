import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Screen, State, FocusSession, Screen as ScreenType } from './types';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import Focus from './components/Focus';
import Tasks from './components/Tasks';
import Settings from './components/Settings';
import BlockedOverlay from './components/BlockedOverlay';
import Market from './components/Market';
import SessionHistory from './components/SessionHistory';

const App: React.FC = () => {
  const [state, setState] = useState<State>(() => {
    const saved = localStorage.getItem('focus_guardian_v14_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        isActivated: true,
        theme: parsed.theme || 'system',
        accentColor: parsed.accentColor || 'blue',
        font: parsed.font || 'Inter',
        profileImage: parsed.profileImage || null,
        signatureImage: parsed.signatureImage || null,
        sessionLogs: parsed.sessionLogs || [],
        activeSession: parsed.activeSession || null,
        lastSessionEventTimestamp: parsed.lastSessionEventTimestamp || Date.now(),
        isSoundEnabled: parsed.isSoundEnabled ?? true,
        isAnimationsEnabled: parsed.isAnimationsEnabled ?? true,
        focusSound: parsed.focusSound || 'none',
        timerEndTimestamp: parsed.timerEndTimestamp || null,
        timerPausedRemainingSeconds: parsed.timerPausedRemainingSeconds || null,
        timerTotalDurationSeconds: parsed.timerTotalDurationSeconds ?? 25 * 60,
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
      lastSessionEventTimestamp: Date.now(),
      balance: 100,
      tasks: [],
      activeTaskId: null,
      theme: 'system',
      accentColor: 'blue',
      font: 'Inter',
      isSoundEnabled: true,
      isAnimationsEnabled: true,
      focusSound: 'none',
      timerEndTimestamp: null,
      timerPausedRemainingSeconds: null,
      timerTotalDurationSeconds: 25 * 60,
    };
  });

  const [timerDisplaySeconds, setTimerDisplaySeconds] = useState(0);
  const [activeOverlay, setActiveOverlay] = useState<{ name: string; waitRemainingMs: number | null } | null>(null);
  const [isAppFullscreen, setIsAppFullscreen] = useState(false);

  const isTimerActive = useMemo(() => {
    return state.timerEndTimestamp !== null && state.timerPausedRemainingSeconds === null;
  }, [state.timerEndTimestamp, state.timerPausedRemainingSeconds]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<any[]>([]);
  const clockIntervalRef = useRef<number | null>(null);
  const rainIntervalRef = useRef<number | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

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
        osc.type = 'sine'; osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
        g.gain.setValueAtTime(0.1, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(g); osc.start(now); osc.stop(now + 0.3);
      } else if (type === 'complete') {
        const osc1 = ctx.createOscillator(); const osc2 = ctx.createOscillator();
        osc1.frequency.setValueAtTime(523.25, now); osc2.frequency.setValueAtTime(659.25, now + 0.1);
        g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        osc1.connect(g); osc2.connect(g); osc1.start(now); osc2.start(now + 0.1); osc1.stop(now + 1.0); osc2.stop(now + 1.0);
      } else if (type === 'cancel') {
        const osc = ctx.createOscillator(); osc.frequency.setValueAtTime(329.63, now);
        osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.2);
        g.gain.setValueAtTime(0.1, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(g); osc.start(now); osc.stop(now + 0.3);
      } else if (type === 'break') {
        const osc = ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.setValueAtTime(440, now);
        g.gain.setValueAtTime(0.05, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(g); osc.start(now); osc.stop(now + 0.5);
      }
    } catch (e) { console.warn('Feedback sound error', e); }
  }, [state.isSoundEnabled]);

  useEffect(() => {
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      localStorage.setItem('focus_guardian_v14_state', JSON.stringify(state));
    }, 1000);
    return () => { if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current); };
  }, [state]);

  const navigate = useCallback((screen: ScreenType) => {
    setState(prev => (prev.currentScreen === screen ? prev : { ...prev, currentScreen: screen }));
  }, []);

  const finalizeSessionAndReset = useCallback((status: 'completed' | 'canceled') => {
    if (status === 'completed') playFeedbackSound('complete');
    else playFeedbackSound('cancel');

    setState(prev => {
      if (!prev.activeSession) return prev;
      const now = Date.now();
      let totalBreakMs = prev.activeSession.totalBreakMs;
      if (prev.activeSession.lastPauseTimestamp) { totalBreakMs += (now - prev.activeSession.lastPauseTimestamp); }
      
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
        lastSessionEventTimestamp: now,
        timerEndTimestamp: null,
        timerPausedRemainingSeconds: null,
        balance: status === 'completed' ? prev.balance + 100 : prev.balance
      };
    });
  }, [playFeedbackSound]);

  const toggleTimerAction = useCallback(() => {
    const now = Date.now();
    setState(prev => {
      const isCurrentlyStarting = prev.timerPausedRemainingSeconds !== null || (!prev.timerEndTimestamp && prev.timerPausedRemainingSeconds === null);
      playFeedbackSound('break');
      if (isCurrentlyStarting) {
        let activeSession = prev.activeSession || { startTime: now, breakCount: 0, totalBreakMs: 0, lastPauseTimestamp: null };
        if (activeSession.lastPauseTimestamp) { activeSession = { ...activeSession, totalBreakMs: activeSession.totalBreakMs + (now - activeSession.lastPauseTimestamp), lastPauseTimestamp: null }; }
        const remaining = prev.timerPausedRemainingSeconds !== null ? prev.timerPausedRemainingSeconds : prev.timerTotalDurationSeconds;
        return { ...prev, activeSession, timerEndTimestamp: prev.timerTotalDurationSeconds === 0 ? now - (prev.timerPausedRemainingSeconds || 0) * 1000 : now + remaining * 1000, timerPausedRemainingSeconds: null };
      } else {
        const remaining = prev.timerTotalDurationSeconds === 0 ? Math.floor((now - (prev.timerEndTimestamp || now)) / 1000) : Math.max(0, Math.ceil((prev.timerEndTimestamp - now) / 1000));
        return { ...prev, timerPausedRemainingSeconds: remaining, activeSession: prev.activeSession ? { ...prev.activeSession, breakCount: prev.activeSession.breakCount + 1, lastPauseTimestamp: now } : null };
      }
    });
  }, [playFeedbackSound]);

  useEffect(() => {
    const stopAudio = () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
      if (rainIntervalRef.current) clearInterval(rainIntervalRef.current);
      clockIntervalRef.current = null; rainIntervalRef.current = null;
      
      const now = audioCtxRef.current?.currentTime || 0;
      audioNodesRef.current.forEach(node => {
        try {
          if (node.gain) {
            node.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
            setTimeout(() => { node.stop(); node.disconnect(); }, 600);
          } else {
            node.stop(); node.disconnect();
          }
        } catch (e) {}
      });
      audioNodesRef.current = [];
    };
    
    if (!isTimerActive || state.focusSound === 'none') { stopAudio(); return; }
    
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    stopAudio();

    const createNoiseBuffer = (noiseType: 'white' | 'brown' | 'pink') => {
      const bufferSize = 4 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let lastOut = 0;
      if (noiseType === 'pink') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          let white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179; b1 = 0.99332 * b1 + white * 0.0750312; b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856; b4 = 0.55000 * b4 + white * 0.5329522; b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362; output[i] *= 0.11; b6 = white * 0.115926;
        }
        return buffer;
      }
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (noiseType === 'white') { output[i] = white; } 
        else { lastOut = (lastOut + (0.02 * white)) / 1.02; output[i] = lastOut * 3.5; }
      }
      return buffer;
    };

    const now = ctx.currentTime;
    const masterFade = ctx.createGain();
    masterFade.gain.setValueAtTime(0, now);
    masterFade.gain.linearRampToValueAtTime(1, now + 1.5);
    masterFade.connect(ctx.destination);

    if (state.focusSound === 'rain') {
      const rumble = ctx.createBufferSource(); rumble.buffer = createNoiseBuffer('brown'); rumble.loop = true;
      const rumbleFilter = ctx.createBiquadFilter(); rumbleFilter.type = 'lowpass'; rumbleFilter.frequency.value = 80;
      const rumbleGain = ctx.createGain(); rumbleGain.gain.value = 0.06;
      rumble.connect(rumbleFilter).connect(rumbleGain).connect(masterFade); 
      rumble.start(); audioNodesRef.current.push(rumble);
      const body = ctx.createBufferSource(); body.buffer = createNoiseBuffer('pink'); body.loop = true;
      const bodyFilter = ctx.createBiquadFilter(); bodyFilter.type = 'lowpass'; bodyFilter.frequency.value = 2500;
      const bodyGain = ctx.createGain(); bodyGain.gain.value = 0.12;
      const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.15;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain).connect(bodyGain.gain); lfo.start();
      body.connect(bodyFilter).connect(bodyGain).connect(masterFade);
      body.start(); audioNodesRef.current.push(body);
      const shimmer = ctx.createBufferSource(); shimmer.buffer = createNoiseBuffer('pink'); shimmer.loop = true;
      const shimmerFilter = ctx.createBiquadFilter(); shimmerFilter.type = 'highpass'; shimmerFilter.frequency.value = 6000;
      const shimmerGain = ctx.createGain(); shimmerGain.gain.value = 0.02;
      shimmer.connect(shimmerFilter).connect(shimmerGain).connect(masterFade);
      shimmer.start(); audioNodesRef.current.push(shimmer);
      rainIntervalRef.current = window.setInterval(() => {
        const drop = ctx.createBufferSource(); drop.buffer = createNoiseBuffer('white');
        const dropFilter = ctx.createBiquadFilter(); dropFilter.type = 'lowpass'; 
        dropFilter.frequency.value = 2000 + Math.random() * 2000;
        const dropGain = ctx.createGain(); dropGain.gain.setValueAtTime(0, ctx.currentTime);
        dropGain.gain.linearRampToValueAtTime(Math.random() * 0.04, ctx.currentTime + 0.002);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05 + Math.random() * 0.1);
        drop.connect(dropFilter).connect(dropGain).connect(masterFade); drop.start();
      }, 45);
    } else if (state.focusSound === 'library') {
      const air = ctx.createBufferSource(); air.buffer = createNoiseBuffer('brown'); air.loop = true;
      const airFilter = ctx.createBiquadFilter(); airFilter.type = 'lowpass'; airFilter.frequency.value = 1500;
      const airGain = ctx.createGain(); airGain.gain.value = 0.05;
      air.connect(airFilter).connect(airGain).connect(masterFade); air.start(); audioNodesRef.current.push(air);
      const resonance = ctx.createBufferSource(); resonance.buffer = createNoiseBuffer('brown'); resonance.loop = true;
      const resonanceFilter = ctx.createBiquadFilter(); resonanceFilter.type = 'bandpass'; resonanceFilter.frequency.value = 60; resonanceFilter.Q.value = 1;
      const resGain = ctx.createGain(); resGain.gain.value = 0.03;
      resonance.connect(resonanceFilter).connect(resGain).connect(masterFade); resonance.start(); audioNodesRef.current.push(resonance);
      rainIntervalRef.current = window.setInterval(() => {
        if (Math.random() > 0.85) {
          const move = ctx.createBufferSource(); move.buffer = createNoiseBuffer('brown');
          const moveFilter = ctx.createBiquadFilter(); moveFilter.type = 'lowpass'; moveFilter.frequency.value = 200 + Math.random() * 300;
          const moveGain = ctx.createGain(); moveGain.gain.setValueAtTime(0, ctx.currentTime);
          moveGain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.1);
          moveGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8 + Math.random() * 1);
          move.connect(moveFilter).connect(moveGain).connect(masterFade); move.start();
        }
      }, 2000);
    } else if (state.focusSound === 'clock') {
      clockIntervalRef.current = window.setInterval(() => {
        const osc = ctx.createOscillator(); const g = ctx.createGain(); 
        osc.type = 'sine'; osc.frequency.setValueAtTime(1000 + (Math.random() * 100), ctx.currentTime);
        g.gain.setValueAtTime(0.012, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        osc.connect(g).connect(masterFade); osc.start(); osc.stop(ctx.currentTime + 0.04);
      }, 1000);
    }
    return stopAudio;
  }, [isTimerActive, state.focusSound]);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = state.theme === 'dark' || (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) root.classList.add('dark'); else root.classList.remove('dark');
    root.setAttribute('lang', 'en');
    root.setAttribute('dir', 'ltr');
  }, [state.theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (!state.isAnimationsEnabled) root.classList.add('no-animations');
    else root.classList.remove('no-animations');
  }, [state.isAnimationsEnabled]);

  useEffect(() => {
    const root = window.document.documentElement;
    let fontFamily = "'Plus Jakarta Sans', sans-serif";
    switch (state.font) {
      case 'System': fontFamily = "system-ui, sans-serif"; break;
      case 'Serif': fontFamily = "'Lora', serif"; break;
      case 'Mono': fontFamily = "'JetBrains Mono', monospace"; break;
      default: fontFamily = "'Plus Jakarta Sans', sans-serif"; break;
    }
    root.style.setProperty('--font-main', fontFamily);
    root.style.setProperty('--font-display', "'Outfit', sans-serif");
  }, [state.font]);

  useEffect(() => {
    let animationFrame: number;
    const updateTimer = () => {
      const now = Date.now();
      if (state.timerEndTimestamp && state.timerPausedRemainingSeconds === null) {
        if (state.timerTotalDurationSeconds === 0) { 
          setTimerDisplaySeconds(Math.floor((now - state.timerEndTimestamp) / 1000)); 
        } else {
          const diff = Math.ceil((state.timerEndTimestamp - now) / 1000);
          if (diff <= 0) { 
            finalizeSessionAndReset('completed'); 
          } else { 
            setTimerDisplaySeconds(diff); 
          }
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
  }, [state.timerEndTimestamp, state.timerPausedRemainingSeconds, state.timerTotalDurationSeconds, finalizeSessionAndReset]);

  const currentTheme = useMemo(() => ({
    blue: { main: '#2563eb', light: '#eff6ff', dark: '#1e40af', subtle: 'rgba(37, 99, 235, 0.1)' },
    emerald: { main: '#10b981', light: '#ecfdf5', dark: '#065f46', subtle: 'rgba(16, 185, 129, 0.1)' },
    purple: { main: '#9333ea', light: '#f5f3ff', dark: '#6b21a8', subtle: 'rgba(147, 51, 234, 0.1)' },
    amber: { main: '#d97706', light: '#fffbeb', dark: '#92400e', subtle: 'rgba(217, 119, 6, 0.1)' },
    rose: { main: '#e11d48', light: '#fff1f2', dark: '#9f1239', subtle: 'rgba(225, 29, 72, 0.1)' },
    slate: { main: '#475569', light: '#f8fafc', dark: '#1e293b', subtle: 'rgba(71, 85, 105, 0.1)' }
  }[state.accentColor]), [state.accentColor]);

  const showNav = !state.isFirstTime && state.currentScreen !== Screen.ONBOARDING;

  return (
    <div 
      style={{ 
        '--accent-color': currentTheme.main, 
        '--accent-light': currentTheme.light, 
        '--accent-dark': currentTheme.dark, 
        '--accent-subtle': currentTheme.subtle 
      } as any} 
      className="flex items-center justify-center min-h-screen w-full font-sans dark:bg-slate-950 bg-slate-100"
    >
      <div className="w-full h-full md:max-w-md lg:max-w-lg md:max-h-[850px] md:my-8 md:rounded-[48px] md:shadow-2xl overflow-hidden bg-white dark:bg-slate-900 relative flex flex-col transition-all duration-300">
        <Layout currentScreen={state.currentScreen} onNavigate={navigate} showNav={showNav && !isAppFullscreen}>
          {state.currentScreen === Screen.ONBOARDING && (
            <Onboarding onComplete={(name, signature) => setState(p => ({
              ...p, userName: name, signatureImage: signature, isFirstTime: false, currentScreen: Screen.HOME
            }))} />
          )}
          
          {state.currentScreen === Screen.HOME && (
            <Focus 
              userName={state.userName} 
              profileImage={state.profileImage} 
              tasks={state.tasks} 
              activeTaskId={state.activeTaskId} 
              timerSeconds={timerDisplaySeconds} 
              totalSeconds={state.timerTotalDurationSeconds} 
              isTimerActive={isTimerActive} 
              isAnimationsEnabled={state.isAnimationsEnabled}
              focusSound={state.focusSound} 
              onToggleTimer={toggleTimerAction} 
              onToggleMode={() => { 
                if (isTimerActive || state.timerPausedRemainingSeconds !== null) finalizeSessionAndReset('canceled'); 
                setState(prev => ({ 
                  ...prev, 
                  timerTotalDurationSeconds: prev.timerTotalDurationSeconds === 0 ? 25 * 60 : 0, 
                  timerEndTimestamp: null, 
                  timerPausedRemainingSeconds: null, 
                  activeSession: null 
                })); 
              }} 
              onSetTimerSeconds={(s) => setState(prev => ({ 
                ...prev, timerTotalDurationSeconds: s, timerEndTimestamp: null, timerPausedRemainingSeconds: null, activeSession: null 
              }))} 
              onSetFocusSound={(s) => setState(p => ({ ...p, focusSound: s }))} 
              isAppFullscreen={isAppFullscreen}
              setIsAppFullscreen={setIsAppFullscreen}
            />
          )}
          
          {state.currentScreen === Screen.TASKS && (
            <Tasks 
              tasks={state.tasks} 
              activeTaskId={state.activeTaskId} 
              isTimerActive={isTimerActive} 
              onAddTask={(text) => setState(p => ({
                ...p, 
                tasks: [...p.tasks, {
                  id: Date.now().toString(), text, completed: false, createdAt: Date.now(), completedAt: null
                }]
              }))} 
              onToggleTask={(id) => { 
                setState(p => { 
                  const task = p.tasks.find(t => t.id === id); 
                  if (!task) return p; 
                  if (!task.completed) playFeedbackSound('task'); 
                  return { 
                    ...p, 
                    activeTaskId: (p.activeTaskId === id && !task.completed) ? null : p.activeTaskId, 
                    balance: task.completed ? p.balance : p.balance + 50, 
                    tasks: p.tasks.map(t => t.id === id ? {
                      ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : null
                    } : t) 
                  }; 
                }); 
              }} 
              onDeleteTask={(id) => setState(p => ({
                ...p, tasks: p.tasks.filter(t => t.id !== id), activeTaskId: p.activeTaskId === id ? null : p.activeTaskId
              }))} 
              onSetActiveTask={(id) => setState(p => ({ ...p, activeTaskId: id }))} 
            />
          )}
          
          {state.currentScreen === Screen.SETTINGS && (
            <Settings 
              theme={state.theme} 
              accentColor={state.accentColor} 
              font={state.font} 
              isSoundEnabled={state.isSoundEnabled} 
              isAnimationsEnabled={state.isAnimationsEnabled}
              focusSound={state.focusSound} 
              userName={state.userName} 
              profileImage={state.profileImage} 
              signatureImage={state.signatureImage} 
              sessionLogs={state.sessionLogs} 
              onThemeChange={(t) => setState(p => ({ ...p, theme: t }))} 
              onAccentChange={(c) => setState(p => ({ ...p, accentColor: c }))} 
              onFontChange={(f) => setState(p => ({ ...p, font: f }))} 
              onToggleSound={() => setState(p => ({ ...p, isSoundEnabled: !p.isSoundEnabled }))} 
              onToggleAnimations={() => setState(p => ({ ...p, isAnimationsEnabled: !p.isAnimationsEnabled }))}
              onSetFocusSound={(s) => setState(p => ({ ...p, focusSound: s }))} 
              onNameChange={(name) => setState(p => ({ ...p, userName: name }))} 
              onProfileImageChange={(img) => setState(p => img.startsWith('data:image/png') ? { ...p, signatureImage: img } : { ...p, profileImage: img })} 
              onNavigate={navigate} 
            />
          )}
          
          {state.currentScreen === Screen.MARKET && <Market balance={state.balance} onPurchase={() => {}} />}
          
          {state.currentScreen === Screen.SESSION_HISTORY && (
            <SessionHistory sessions={state.sessionLogs} />
          )}
        </Layout>
      </div>
      {activeOverlay && (
        <BlockedOverlay 
          appName={activeOverlay.name} 
          onClose={() => setActiveOverlay(null)} 
        />
      )}
    </div>
  );
};

export default App;