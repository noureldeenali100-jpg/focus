import React from 'react';
import { MARKET_UNLOCK_COST } from '../constants';

interface MarketProps {
  balance: number;
  onPurchase: () => void;
}

const Market: React.FC<MarketProps> = ({ balance, onPurchase }) => {
  return (
    <div className="p-8 pb-32 bg-white dark:bg-slate-900 min-h-full">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">Market</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Exchange your hard-earned focus</p>
      </header>

      <div 
        className="rounded-[32px] p-8 text-white mb-8 shadow-xl dark:shadow-none transition-all duration-300"
        style={{ 
          background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--accent-dark) 100%)',
          boxShadow: '0 20px 40px -10px var(--accent-subtle)'
        }}
      >
        <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Your Balance</p>
        <div className="flex items-center space-x-2">
          <span className="text-5xl font-black">£{balance}</span>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl">£</div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Available Items</h3>
        
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-[32px] shadow-sm flex flex-col space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex space-x-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-color)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight">Digital Holiday</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Unblock all apps for 1 Hour</p>
              </div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300">
              £{MARKET_UNLOCK_COST}
            </div>
          </div>
          
          <button 
            disabled={true}
            className="w-full py-5 rounded-2xl font-black uppercase tracking-wider transition-all bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
          >
            Item Unavailable
          </button>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] text-center">
          <p className="text-sm text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">More coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default Market;