import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BlockEvent } from '../types';
import { UNALLOWED_APPS } from '../constants';

interface ReportProps {
  logs: BlockEvent[];
}

const Report: React.FC<ReportProps> = ({ logs }) => {
  const chartData = useMemo(() => {
    const counts = UNALLOWED_APPS.reduce((acc, app) => {
      acc[app.name] = 0;
      return acc;
    }, {} as Record<string, number>);

    logs.forEach(log => {
      if (counts[log.appName] !== undefined) {
        counts[log.appName]++;
      }
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count: count as number,
      color: UNALLOWED_APPS.find(a => a.name === name)?.color.replace('bg-', '') || 'blue-500'
    }));
  }, [logs]);

  const totalBlocks = logs.length;

  return (
    <div className="p-8 pb-32 bg-white dark:bg-slate-900 min-h-full">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">Reports</h2>
        <p className="text-slate-500 dark:text-slate-300 text-sm font-medium">Your discipline tracked</p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div 
          className="p-6 rounded-[32px] border transition-all duration-300"
          style={{ 
            backgroundColor: 'var(--accent-subtle)', 
            borderColor: 'var(--accent-subtle)' 
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--accent-color)' }}>Total Blocks</p>
          <p className="text-4xl font-black" style={{ color: 'var(--accent-color)' }}>{totalBlocks}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-6 rounded-[32px] border border-emerald-100 dark:border-emerald-800">
          <p className="text-[10px] font-black text-emerald-400 dark:text-emerald-300 uppercase tracking-widest mb-1">Status</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-2">Guarding</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[32px] p-6 shadow-sm mb-10">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-6 px-2">Attempts per Platform</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cbd5e1" opacity={0.1} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={70} 
                fontSize={10} 
                fontWeight={700}
                axisLine={false} 
                tickLine={false}
                stroke="#64748b"
                tick={{fill: '#94a3b8'}}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  color: '#f8fafc',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.count > 0 ? 'var(--accent-color)' : '#94a3b8'} 
                    opacity={entry.count > 0 ? 1 : 0.2} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest px-2">Recent Activity</h3>
        {logs.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-sm italic text-slate-400 dark:text-slate-500 font-medium">No distractions detected.</p>
          </div>
        ) : (
          logs.slice(-5).reverse().map((log, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-50 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Attempted {log.appName}</p>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 font-black uppercase tracking-tighter">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Report;