import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
  onComplete: (name: string, signature: string) => void;
}

type OnboardingStep = 'WELCOME' | 'COMMITMENT' | 'SIGNATURE' | 'TUTORIAL_BLOCKING' | 'TUTORIAL_TIMER' | 'TUTORIAL_SUMMARY';

/**
 * Professional Guardian Shield Logo.
 * Designed with 25 years of design principles: optical balance, 
 * geometric precision, and material depth through layered lighting.
 */
const GuardianLogo = () => (
  <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="premium-shield-grad" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="var(--accent-color)" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </linearGradient>
      <filter id="core-glow-fx" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Geometrically Perfect Shield Shell */}
    <path 
      d="M60 10L105 28V60C105 85 86 108 60 115C34 108 15 85 15 60V28L60 10Z" 
      fill="url(#premium-shield-grad)" 
    />
    {/* Internal Bevel for Material Depth */}
    <path 
      d="M60 18L97 33V60C97 80 82 99 60 106C38 99 23 80 23 60V33L60 18Z" 
      fill="white" 
      fillOpacity="0.15"
    />
    {/* Focus Core Element */}
    <circle cx="60" cy="55" r="15" stroke="white" strokeWidth="2.5" strokeOpacity="0.25" />
    <circle cx="60" cy="55" r="8" fill="white" filter="url(#core-glow-fx)" />
    {/* Precision Crosshair Markers */}
    <path d="M60 32V40M60 70V78M37 55H45M75 55H83" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>('WELCOME');
  const [name, setName] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isSigning = useRef(false);
  const [hasSigned, setHasSigned] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const steps: OnboardingStep[] = ['WELCOME', 'COMMITMENT', 'SIGNATURE', 'TUTORIAL_BLOCKING', 'TUTORIAL_TIMER', 'TUTORIAL_SUMMARY'];
  const currentStepIndex = steps.indexOf(step);

  const nextStep = () => {
    const next = steps[currentStepIndex + 1];
    if (next) setStep(next);
    else onComplete(name, signature || '');
  };

  useEffect(() => {
    if (step !== 'SIGNATURE') return;
    
    const initCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Use offset dimensions to get the stable layout size, independent of visual CSS transforms
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.scale(dpr, dpr);
      // Always draw in black ink for high-quality data export. 
      // Visibility in dark mode is handled by CSS filters on the canvas element.
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    const timer = setTimeout(initCanvas, 150); // Buffer for Framer Motion animation settling
    window.addEventListener('resize', initCanvas);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', initCanvas);
    };
  }, [step]);

  /**
   * High-precision coordinate mapping.
   * Normalizes viewport coordinates to the canvas's local CSS pixel space.
   * Accounts for sub-pixel rendering and active CSS scaling (e.g. during animations).
   */
  const getPointerPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    return {
      x: (e.clientX - rect.left) * (canvas.offsetWidth / rect.width),
      y: (e.clientY - rect.top) * (canvas.offsetHeight / rect.height)
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const pos = getPointerPos(e);
    isSigning.current = true;
    lastPoint.current = pos;
    // Capture pointer to ensure smooth tracking even if user drags beyond canvas bounds
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isSigning.current || !lastPoint.current || !canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const pos = getPointerPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPoint.current = pos;
    if (!hasSigned) setHasSigned(true);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    isSigning.current = false;
    lastPoint.current = null;
    if (canvasRef.current) {
      canvasRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.99 },
    animate: { opacity: 1, scale: 1, transition: { staggerChildren: 0.1, duration: 0.5 } },
    exit: { opacity: 0, scale: 1.01, transition: { duration: 0.3 } }
  };

  return (
    <div className="h-full w-full bg-white dark:bg-slate-950 flex flex-col overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          variants={containerVariants}
          initial="initial" animate="animate" exit="exit"
          className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 relative z-10 max-w-lg mx-auto w-full h-full"
        >
          {step === 'WELCOME' && (
            <div className="w-full text-center">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-10 flex justify-center">
                <GuardianLogo />
              </motion.div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Focus Guardian</h1>
              <p className="text-slate-500 mb-8">Establish your deep work sanctuary.</p>
              <input 
                type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="What is your name?"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-8 py-5 text-center text-xl font-bold text-slate-900 dark:text-white outline-none focus:border-[var(--accent-color)] mb-10"
              />
              <button 
                disabled={!name.trim()}
                onClick={nextStep}
                className="w-full py-5 rounded-full font-black text-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-20 active:scale-95 transition-all"
              >
                Initialize
              </button>
            </div>
          )}

          {step === 'COMMITMENT' && (
            <div className="w-full text-center">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-8">The Pledge</h2>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[40px] p-10 mb-10 border border-slate-100 dark:border-slate-800">
                <p className="italic text-xl font-bold text-slate-700 dark:text-slate-300 leading-snug">
                  "I hereby commit to reclaiming my focus and dedicating this space to meaningful work."
                </p>
              </div>
              <button 
                onClick={() => setAgreed(!agreed)}
                className={`w-full flex items-center justify-between p-5 rounded-full border mb-8 transition-all ${agreed ? 'bg-[var(--accent-color)] border-transparent text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'}`}
              >
                <span className="font-black uppercase text-xs tracking-widest pl-4">{agreed ? 'Agreed' : 'Accept Protocol'}</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  {agreed && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              </button>
              <button 
                disabled={!agreed}
                onClick={nextStep}
                className="w-full py-5 rounded-full font-black text-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-20 active:scale-95 transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'SIGNATURE' && (
            <div className="w-full text-center">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">Sign Verification</h2>
              <p className="text-slate-500 mb-8">Sign below to finalize your oath.</p>
              <div className="w-full h-64 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden mb-8 relative touch-none shadow-inner">
                <canvas 
                  ref={canvasRef}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerLeave={onPointerUp}
                  className="w-full h-full cursor-crosshair touch-none dark:invert"
                />
                {!hasSigned && <p className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase text-slate-300 dark:text-slate-700 tracking-[0.5em] pointer-events-none">Sign Here</p>}
              </div>
              <div className="flex gap-4">
                <button onClick={clearSignature} className="flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-200 dark:border-slate-800">Clear</button>
                <button 
                  disabled={!hasSigned}
                  onClick={() => { setSignature(canvasRef.current?.toDataURL()); nextStep(); }}
                  className="flex-[2] py-4 rounded-full text-[10px] font-black uppercase tracking-widest bg-[var(--accent-color)] text-white shadow-xl shadow-[var(--accent-color)]/20 disabled:opacity-20 transition-all active:scale-95"
                >
                  Verify Seal
                </button>
              </div>
            </div>
          )}

          {step.startsWith('TUTORIAL') && (
            <div className="w-full text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10 ${step === 'TUTORIAL_BLOCKING' ? 'bg-red-500/10 text-red-500' : step === 'TUTORIAL_TIMER' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                {step === 'TUTORIAL_BLOCKING' && <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
                {step === 'TUTORIAL_TIMER' && <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                {step === 'TUTORIAL_SUMMARY' && <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
                {step === 'TUTORIAL_BLOCKING' ? 'Focus Shield' : step === 'TUTORIAL_TIMER' ? 'Peak Flow' : 'Ready'}
              </h2>
              <p className="text-slate-500 text-lg mb-12">
                {step === 'TUTORIAL_BLOCKING' ? 'Social media is blocked. Deep work is your default.' : 
                 step === 'TUTORIAL_TIMER' ? 'Define a goal, set a timer, and commit to the session.' : 
                 `Initialization complete, ${name}. Your sanctuary awaits.`}
              </p>
              <button 
                onClick={nextStep}
                className="w-full py-5 rounded-full font-black text-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 active:scale-95 transition-all"
              >
                {step === 'TUTORIAL_SUMMARY' ? 'Enter Sanctuary' : 'Next'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;