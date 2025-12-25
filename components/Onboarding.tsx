import React, { useState, useRef, useEffect, useCallback } from 'react';

interface OnboardingProps {
  onComplete: (name: string, signature: string) => void;
}

type OnboardingStep = 'WELCOME' | 'COMMITMENT' | 'SIGNATURE' | 'TUTORIAL_BLOCKING' | 'TUTORIAL_TIMER' | 'TUTORIAL_SUMMARY';

const GuardianLogo = () => (
  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Guardian Head Silhouette - Disciplined & Strong */}
    <path 
      d="M50 12C32 12 18 26 18 45V68C18 78 30 88 50 88C70 88 82 78 82 68V45C82 26 68 12 50 12Z" 
      fill="white" 
    />
    
    {/* Minimalist Protective Hood/Mantle framing the face */}
    <path 
      d="M50 12C32 12 18 26 18 45V52H82V45C82 26 68 12 50 12Z" 
      fill="currentColor" 
      fillOpacity="0.12" 
    />
    
    {/* Face / Inner Focus Area */}
    <path 
      d="M30 45C30 34 39 25 50 25C61 25 70 34 70 45V65C70 72 61 78 50 78C39 78 30 72 30 65V45Z" 
      fill="white"
    />

    {/* Calm, Focused Eyes - Horizontal slits conveying discipline */}
    <rect x="38" y="48" width="8" height="3" rx="1.5" fill="currentColor" fillOpacity="0.8" />
    <rect x="54" y="48" width="8" height="3" rx="1.5" fill="currentColor" fillOpacity="0.8" />

    {/* Subtle Neck/Base line for authority */}
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
  
  // Canvas refs for signature
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigning, setIsSigning] = useState(false);
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

  // Canvas Drawing Logic
  useEffect(() => {
    if (step !== 'SIGNATURE') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Lower latency context for better tracking
    const ctx = canvas.getContext('2d', { desynchronized: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Initial color based on theme
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [step]);

  const getPointerPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
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

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  const startSigning = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPointerPos(e);
    setIsSigning(true);
    lastPoint.current = pos;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      // Ensure real-time color compliance on start
      ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000';
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isSigning || !lastPoint.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    // Maintain real-time theme compliance during drawing
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000';

    const pos = getPointerPos(e);
    
    // Precise quadratic curve for smoothing
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

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    setHasSigned(false);
    setSignature(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSignature(canvas.toDataURL('image/png'));
    nextStep();
  };

  const renderWelcome = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in fade-in duration-500 bg-white dark:bg-slate-950">
      <div className="w-24 h-24 rounded-[2.2rem] flex items-center justify-center rotate-12 mb-10 shadow-2xl shadow-[var(--accent-color)]/30 dark:shadow-none transition-all duration-700 hover:rotate-0 hover:scale-105" style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}>
         <GuardianLogo />
      </div>
      <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-6 leading-tight tracking-tighter">Focus Guardian</h1>
      <p className="text-lg text-slate-500 dark:text-slate-300 leading-relaxed mb-10">
        Welcome to your new disciplined life. What shall we call you?
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
          “I commit to staying disciplined, completing my tasks, and respecting the focus limits I set.”
        </p>
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-6 h-6 rounded border-slate-300 dark:border-slate-700 focus:ring-[var(--accent-color)] bg-white dark:bg-slate-950"
            style={{ accentColor: 'var(--accent-color)' }}
          />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 text-left">I accept responsibility for my focus.</span>
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
      <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tighter">Seal the Pledge</h2>
      <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed mb-8">
        Sign below to confirm your dedication. This handwritten signature is a personal focus pledge.
      </p>
      
      <div className="w-full relative bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden mb-8 h-48">
        <canvas 
          ref={canvasRef}
          onMouseDown={startSigning}
          onMouseMove={draw}
          onMouseUp={stopSigning}
          onMouseLeave={stopSigning}
          onTouchStart={startSigning}
          onTouchMove={draw}
          onTouchEnd={stopSigning}
          className="w-full h-full cursor-crosshair touch-none"
        />
        {!hasSigned && (
          <p className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase text-slate-300 dark:text-slate-700 tracking-widest pointer-events-none">Sign Here</p>
        )}
      </div>

      <div className="flex gap-4 w-full">
        <button 
          onClick={clearSignature}
          className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95"
        >
          Clear
        </button>
        <button 
          disabled={!hasSigned}
          onClick={saveSignature}
          style={{ backgroundColor: hasSigned ? 'var(--accent-color)' : 'transparent' }}
          className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${hasSigned ? 'text-white shadow-lg active:scale-95' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
        >
          Sign Pledge
        </button>
      </div>
    </div>
  );

  const renderTutorialBlocking = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in slide-in-from-right duration-500 bg-white dark:bg-slate-950">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      </div>
      <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tighter">Hard Blocking</h2>
      <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed mb-10">
        Distracting apps are locked. To unlock them, you must request access and wait for a mandatory period. No exceptions.
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
      <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tighter">Deep Focus</h2>
      <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed mb-10">
        Set your goal, pick a task, and start the timer. The environment adapts to keep you focused until the session is complete.
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
      <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tighter">Ready to Guard</h2>
      <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed mb-10">
        Your digital sanctuary is prepared, {name}. The path to excellence starts with a single focused hour.
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
    <div className="h-full w-full bg-white dark:bg-slate-950 flex flex-col">
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