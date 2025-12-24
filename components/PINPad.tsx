
import React, { useState } from 'react';

interface PINPadProps {
  title: string;
  onSuccess: () => void;
  onCancel: () => void;
  correctPin: string;
}

const PINPad: React.FC<PINPadProps> = ({ title, onSuccess, onCancel, correctPin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-950 p-10">
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-8">{title}</h3>
      
      <div className={`flex space-x-4 mb-12 ${error ? 'animate-bounce text-red-500' : ''}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 ${pin.length > i ? 'bg-slate-800 dark:bg-slate-200 border-slate-800 dark:border-slate-200' : ''}`}></div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(n => (
          <button 
            key={n} 
            onClick={() => handlePress(n)}
            className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 text-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:bg-slate-200 dark:active:bg-slate-700 transition-colors"
          >
            {n}
          </button>
        ))}
        <button onClick={onCancel} className="w-16 h-16 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-600 font-bold">ESC</button>
        <button onClick={() => handlePress('0')} className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 text-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:bg-slate-200 dark:active:bg-slate-700">0</button>
        <button onClick={handleBackspace} className="w-16 h-16 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
        </button>
      </div>
    </div>
  );
};

export default PINPad;
