import React from 'react';
import { MARKET_UNLOCK_COST } from '../constants';

interface MarketProps {
  balance: number;
  onPurchase: () => void;
}

const Market: React.FC<MarketProps> = ({ balance, onPurchase }) => {
  return (
    <div className="p-8 pb-32 bg-white dark:bg-slate-900 min-h-full w-full overflow-y-auto no-scrollbar">
      <div className="max-w-5xl mx-auto w-full">
        <header className="mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter mb-2">Market</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium">Spend your focus points here.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-12">
          <div 
            className="rounded-full p-10 md:p-14 text-white shadow-2xl transition-all duration-300 flex flex-col items-center md:items-start"
            style={{ 
              background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--accent-dark) 100%)',
              boxShadow: '0 25px 50px -12px var(--accent-subtle)'
            }}
          >
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] opacity-80 mb-4">Current Available Funds</p>
            <div className="flex items-center space-x-6">
              <span className="text-6xl md:text-8xl font-black tracking-tighter">£{balance}</span>
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center font-bold text-3xl md:text-4xl backdrop-blur-sm shadow-inner">£</div>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] px-8">Available Assets</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
              <div className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 p-8 rounded-full shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-5">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center shadow-inner shrink-0"
                      style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-color)' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div className="pr-4">
                      <p className="font-black text-slate-800 dark:text-white text-lg leading-tight mb-1">Unlock all apps</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">1 hour access</p>
                    </div>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-full text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest shrink-0">
                    £{MARKET_UNLOCK_COST}
                  </div>
                </div>
                
                <button 
                  disabled={true}
                  className="mt-8 w-full py-4 rounded-full font-black uppercase tracking-widest transition-all bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-600 cursor-not-allowed border border-slate-100 dark:border-slate-800"
                >
                  Sold Out
                </button>
              </div>

              <div className="p-10 bg-slate-50/50 dark:bg-slate-950/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-full flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                </div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">Restocking Soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market;