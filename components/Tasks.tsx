
import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface TasksProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onCompleteFocus: () => void;
  onFailFocus: () => void;
}

const Tasks: React.FC<TasksProps> = ({ tasks, onAddTask, onToggleTask, onDeleteTask, onCompleteFocus, onFailFocus }) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      clearInterval(interval);
      setIsActive(false);
      onCompleteFocus();
      setTimerSeconds(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, timerSeconds]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    if (isActive) onFailFocus();
    setIsActive(false);
    setTimerSeconds(25 * 60);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Focus & Tasks</h2>
        <p className="text-slate-500 text-sm">Earn rewards for staying disciplined</p>
      </header>

      {/* Timer Section */}
      <div className="bg-slate-900 rounded-3xl p-8 text-center text-white mb-8 shadow-xl">
        <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Focus Session</p>
        <div className="text-5xl font-mono font-black mb-6">{formatTime(timerSeconds)}</div>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-2xl font-bold transition-all ${isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button 
            onClick={resetTimer}
            className="px-8 py-3 rounded-2xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Reset
          </button>
        </div>
        <p className="mt-4 text-[10px] text-slate-500 italic">Abandoning a session costs 100 money</p>
      </div>

      {/* Task List */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Your To-Do</h3>
        <div className="flex space-x-2 mb-4">
          <input 
            type="text" 
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-300"
          />
          <button 
            onClick={() => {
              if (newTaskText.trim()) {
                onAddTask(newTaskText);
                setNewTaskText('');
              }
            }}
            className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => onToggleTask(task.id)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}
                >
                  {task.completed && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>
                <span className={`font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {task.text}
                </span>
              </div>
              <button 
                onClick={() => onDeleteTask(task.id)}
                className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-center py-6 text-slate-400 text-sm italic">No tasks. Enjoy your focus.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
