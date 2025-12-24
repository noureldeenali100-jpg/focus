import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: (name: string) => void;
}

type OnboardingStep = 'WELCOME' | 'COMMITMENT' | 'TUTORIAL_BLOCKING' | 'TUTORIAL_TIMER' | 'TUTORIAL_SUMMARY';

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>('WELCOME');
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(false);

  const nextStep = () => {
    if (step === 'WELCOME') setStep('COMMITMENT');
    else if (step === 'COMMITMENT') setStep('TUTORIAL_BLOCKING');
    else if (step === 'TUTORIAL_BLOCKING') setStep('TUTORIAL_TIMER');
    else if (step === 'TUTORIAL_TIMER') setStep('TUTORIAL_SUMMARY');
    else if (step === 'TUTORIAL_SUMMARY') onComplete(name);
  };

  const renderWelcome = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in fade-in duration-500 bg-white dark:bg-slate-950">
      <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center rotate-12 mb-10 shadow-xl shadow-blue-100 dark:shadow-none">
         <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-6 leading-tight">Focus Guardian</h1>
      <p className="text-lg text-slate-500 dark:text-slate-300 leading-relaxed mb-10">
        Welcome to your new disciplined life. What shall we call you?
      </p>
      <input 
        type="text" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name..."
        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-center text-lg font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-300 dark:focus:border-blue-500 transition-all mb-6 placeholder:text-slate-400 dark:placeholder:text-slate-600"
      />
      <button 
        disabled={!name.trim()}
        onClick={nextStep}
        className={`w-full py-5 rounded-3xl font-bold text-xl shadow-xl transition-all ${name.trim() ? 'bg-blue-600 text-white shadow-blue-200 dark:shadow-none hover:bg-blue-700 active:scale-95' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
      >
        Continue
      </button>
    </div>
  );

  const renderCommitment = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in slide-in-from-right duration-500 bg-white dark:bg-slate-950">
      <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-6">Hello, {name} 👋</h2>
      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 mb-10">
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic mb-6">
          “I commit to staying disciplined, completing my tasks, and respecting the focus limits I set.”
        </p>
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-6 h-6 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-950"
          />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 text-left">I accept responsibility for my focus.</span>
        </label>
      </div>
      <button 
        disabled={!agreed}
        onClick={nextStep}
        className={`w-full py-5 rounded-3xl font-bold text-xl shadow-xl transition-all ${agreed ? 'bg-blue-600 text-white shadow-blue-200 dark:shadow-none hover:bg-blue-700 active:scale-95' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
      >
        I am Ready
      </button>
    </div>
  );

  const renderTutorialBlocking = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in slide-in-from-right duration-500 bg-white dark:bg-slate-950">
      <div className="w-20 h-20 bg-red-50 dark:bg-red-900/40 text-red-500 rounded-3xl flex items-center justify-center mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Smart App Blocking</h2>
      <p className="text-slate-500 dark:text-slate-300 leading-relaxed mb-8">
        We block all social media permanently. For apps like <b>WhatsApp</b>, you get a usage window (e.g., 30m) followed by a mandatory lock cycle (e.g., 1h).
      </p>
      <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 text-left space-y-3 mb-10">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">WhatsApp: 30m Usage / 1h Lock</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Social Apps: Always Blocked</span>
        </div>
      </div>
      <button onClick={nextStep} className="w-full py-5 bg-blue-600 text-white rounded-3xl font-bold text-xl shadow-xl shadow-blue-200 dark:shadow-none">
        Next
      </button>
    </div>
  );

  const renderTutorialTimer = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in slide-in-from-right duration-500 bg-white dark:bg-slate-950">
      <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/40 text-blue-500 rounded-3xl flex items-center justify-center mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Focus Timer & Tasks</h2>
      <p className="text-slate-500 dark:text-slate-300 leading-relaxed mb-10">
        The home screen is your cockpit. Choose a task, start the timer, and earn digital balance for every completed focus session.
      </p>
      <div className="flex space-x-2 mb-12">
        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
        <div className="w-3 h-3 rounded-full bg-blue-200 dark:bg-slate-700"></div>
        <div className="w-3 h-3 rounded-full bg-blue-200 dark:bg-slate-700"></div>
      </div>
      <button onClick={nextStep} className="w-full py-5 bg-blue-600 text-white rounded-3xl font-bold text-xl shadow-xl shadow-blue-200 dark:shadow-none">
        Understand
      </button>
    </div>
  );

  const renderTutorialSummary = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-10 text-center animate-in zoom-in duration-500 bg-white dark:bg-slate-950">
      <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-500 rounded-full flex items-center justify-center mb-10 shadow-lg shadow-emerald-50 dark:shadow-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4">Ready to Focus?</h2>
      <p className="text-slate-500 dark:text-slate-300 leading-relaxed mb-12">
        The journey to a distraction-free mind starts now. Remember {name}, discipline is the bridge between goals and accomplishment.
      </p>
      <button 
        onClick={nextStep}
        className="w-full py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-3xl font-bold text-xl shadow-2xl shadow-slate-200 dark:shadow-none active:scale-95 transition-all"
      >
        Start My Focus Journey
      </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950">
      {step === 'WELCOME' && renderWelcome()}
      {step === 'COMMITMENT' && renderCommitment()}
      {step === 'TUTORIAL_BLOCKING' && renderTutorialBlocking()}
      {step === 'TUTORIAL_TIMER' && renderTutorialTimer()}
      {step === 'TUTORIAL_SUMMARY' && renderTutorialSummary()}
    </div>
  );
};

export default Onboarding;