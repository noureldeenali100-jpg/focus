import React, { useState, useRef, useEffect, useCallback } from 'react';

interface OnboardingProps {
  onComplete: (name: string, signature: string) => void;
}

type OnboardingStep = 'WELCOME' | 'COMMITMENT' | 'SIGNATURE' | 'TUTORIAL_BLOCKING' | 'TUTORIAL_TIMER' | 'TUTORIAL_SUMMARY';

const GuardianLogo = () => (
  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M50 12C32 12 18 26 18 45V68C18 78 30 88 50 88C70 88 82 78 82 68V45C82 26 68 12 50 12Z" 
      fill="white" 
    />
    <path 
      d="M50 12C32 12 18 26 18 45V52H82V45C82 26 68 12 50 12Z" 
      fill="currentColor" 
      fillOpacity="0.12" 
    />
    <path 
      d="M30 45C30 34 39 25 50 25C61 25 70 34 70 45V65C70 72 61 78 50 78C39 78 30 72 30 65V45Z" 
      fill="white"
    />
    <rect x="38" y="48" width="8" height="3" rx="1.5" fill="currentColor" fillOpacity="0.8" />
    <rect x="54" y="48" width="8" height="3" rx="1.5" fill="currentColor" fillOpacity="0.8" />
    <path 
      d="M40 82C40 82 45 85 50 85C55 85 60 82 60 82" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeOpacity="0.1"
    />
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

  const nextStep = () => {
    if (step === 'WELCOME') setStep('COMMITMENT');
    else if (step === 'COMMITMENT') setStep('SIGNATURE');
    else if (step === 'SIGNATURE') setStep('TUTORIAL_BLOCKING');
    else if (step === 'TUTORIAL_BLOCKING') setStep('TUTORIAL_TIMER');
    else if (step === 'TUTORIAL_TIMER') setStep('TUTORIAL_SUMMARY');
    else if (step === 'TUTORIAL_SUMMARY') onComplete(name, signature || '');
  };

  useEffect(() => {
    if (step !== 'SIGNATURE') return;
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
  }, [step]);

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

  const onStart = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPointerPos(e);
    isSigning.current = true;
    lastPoint.current = pos;
    
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isSigning.current || !lastPoint.current) return;
    if (e.cancelable) e.preventDefault();
    
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const pos = getPointerPos(e);
    const midX = (lastPoint.current.x + pos.x) / 2;
    const midY = (lastPoint.current.y + pos.y) / 2;

    ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midX, midY);
    ctx.stroke();

    lastPoint.current = pos;
    if (!hasSigned) setHasSigned(true);
  };

  const onEnd = () => {
    isSigning.current = false;
    lastPoint.current = null;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    setSignature(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSignature(canvas.toDataURL('image/png', 0.8));
    nextStep();
  };

  const renderWelcome = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in fade-in duration-500 bg-white dark:bg-slate-950">
      <div className="w-24 h-24 rounded-[2.2rem] flex items-center justify-center rotate-12 mb-10 shadow-2xl shadow-[var(--accent-color)]/30 dark:shadow-none transition-all duration-700 hover:rotate-0 hover:scale-105" style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}>
         <GuardianLogo />
      </div>
      <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-6 leading-tight tracking-tighter">Focus Guardian</h1>
      <p className="text-lg text-slate-500 dark:text-slate-300 leading-relaxed mb-10">
        Welcome! Let's get started. What's your name?
      </p>
      <input 
        type="text" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name..."
        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-center text-lg font-bold text-slate-800 dark:text-slate-100 outline-none transition-all mb-6 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-[var(--accent-color)]"
      />
      <button 
        disabled={!name.trim()}
        onClick={nextStep}
        style={{ backgroundColor: name.trim() ? 'var(--accent-color)' : 'transparent' }}
        className={`w-full py-5 rounded-3xl font-bold text-xl shadow-xl transition-all ${name.trim() ? 'text-white hover:opacity-90 active:scale-95' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
      >
        Continue
      </button>
    </div>
  );

  const renderCommitment = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in slide-in-from-right duration-500 bg-white dark:bg-slate-950">
      <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-6">Hello, {name} 👋</h2>
      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 mb-10 text-slate-600 dark:text-slate-300">
        <div className="w-12 h-12 mx-auto mb-4 text-[var(--accent-color)]">
           <GuardianLogo />
        </div>
        <p className="leading-relaxed italic mb-6">
          “I promise to stay focused and finish my tasks.”
        </p>
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-6 h-6 rounded border-slate-300 dark:border-slate-700 focus:ring-[var(--accent-color)] bg-white dark:bg-slate-950"
            style={{ accentColor: 'var(--accent-color)' }}
          />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 text-left">I agree to focus.</span>
        </label>
      </div>
      <button 
        disabled={!agreed}
        onClick={nextStep}
        style={{ backgroundColor: agreed ? 'var(--accent-color)' : 'transparent' }}
        className={`w-full py-5 rounded-3xl font-bold text-xl shadow-xl transition-all ${agreed ? 'text-white hover:opacity-90 active:scale-95' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
      >
        Confirm Commitment
      </button>
    </div>
  );

  const renderSignature = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in slide-in-from-right duration-500 bg-white dark:bg-slate-950">
      <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tighter">Sign the Promise</h2>
      <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed mb-8">
        Sign below to start your focus journey.
      </p>
      
      <div className="w-full relative bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden mb-8 h-48 touch-none">
        <canvas 
          ref={canvasRef}
          onMouseDown={onStart}
          onMouseMove={onMove}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
          onTouchStart={onStart}
          onTouchMove={onMove}
          onTouchEnd={onEnd}
          className="w-full h-full cursor-crosshair touch-none"
        />
        {!hasSigned && (
          <p className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase text-slate-300 dark:text-slate-700 tracking-widest pointer-events-none">Sign Here</p>
        )}
      </div>

      <div className="flex gap-4 w-full">
        <button 
          onClick={clearSignature}
          className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
        >
          Clear
        </button>
        <button 
          disabled={!hasSigned}
          onClick={saveSignature}
          style={{ backgroundColor: hasSigned ? 'var(--accent-color)' : 'transparent' }}
          className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${hasSigned ? 'text-white shadow-lg active:scale-95' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
        >
          Save Signature
        </button>
      </div>
    </div>
  );

  const renderTutorialBlocking = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in slide-in-from-right duration-500 bg-white dark:bg-slate-950">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      </div>
      <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tighter">App Blocking</h2>
      <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed mb-10">
        Distracting apps will be blocked. To open them, you'll need to wait for a short time.
      </p>
      <button 
        onClick={nextStep}
        style={{ backgroundColor: 'var(--accent-color)' }}
        className="w-full py-5 rounded-3xl font-bold text-xl text-white shadow-xl hover:opacity-90 active:scale-95 transition-all"
      >
        I Understand
      </button>
    </div>
  );

  const renderTutorialTimer = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in slide-in-from-right duration-500 bg-white dark:bg-slate-950">
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tighter">Focus Sessions</h2>
      <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed mb-10">
        Pick a task, set a timer, and stay focused until it's done.
      </p>
      <button 
        onClick={nextStep}
        style={{ backgroundColor: 'var(--accent-color)' }}
        className="w-full py-5 rounded-3xl font-bold text-xl text-white shadow-xl hover:opacity-90 active:scale-95 transition-all"
      >
        Let's Begin
      </button>
    </div>
  );

  const renderTutorialSummary = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in slide-in-from-right duration-500 bg-white dark:bg-slate-950">
      <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tighter">You're Ready!</h2>
      <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed mb-10">
        Everything is set up, {name}. Let's start focusing!
      </p>
      <button 
        onClick={nextStep}
        style={{ backgroundColor: 'var(--accent-color)' }}
        className="w-full py-5 rounded-3xl font-bold text-xl text-white shadow-xl hover:opacity-90 active:scale-95 transition-all"
      >
        Enter Dashboard
      </button>
    </div>
  );

  return (
    <div className="h-full w-full bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
      {step === 'WELCOME' && renderWelcome()}
      {step === 'COMMITMENT' && renderCommitment()}
      {step === 'SIGNATURE' && renderSignature()}
      {step === 'TUTORIAL_BLOCKING' && renderTutorialBlocking()}
      {step === 'TUTORIAL_TIMER' && renderTutorialTimer()}
      {step === 'TUTORIAL_SUMMARY' && renderTutorialSummary()}
    </div>
  );
};

export default Onboarding;