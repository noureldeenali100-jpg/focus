import { AppInfo } from './types';

export const UNALLOWED_APPS: AppInfo[] = [
  { id: 'fb', name: 'Facebook', icon: 'FB', isAllowed: false, color: 'bg-blue-600', isPermanentBlock: true },
  { id: 'ig', name: 'Instagram', icon: 'IG', isAllowed: false, color: 'bg-pink-500', isPermanentBlock: true },
  { id: 'tt', name: 'TikTok', icon: 'TK', isAllowed: false, color: 'bg-black', isPermanentBlock: true },
  { id: 'tw', name: 'X', icon: 'X', isAllowed: false, color: 'bg-slate-900', isPermanentBlock: true },
  { id: 'sc', name: 'Snapchat', icon: 'SC', isAllowed: false, color: 'bg-yellow-400', isPermanentBlock: true },
  { id: 'yt', name: 'YouTube', icon: 'YT', isAllowed: false, color: 'bg-red-600' },
  { id: 'ch', name: 'Chrome', icon: 'CH', isAllowed: false, color: 'bg-blue-400' },
];

export const CYCLE_APPS_BASE: AppInfo[] = [
  { id: 'wa', name: 'WhatsApp', icon: 'WA', isAllowed: true, color: 'bg-emerald-500' },
  { id: 'tg', name: 'Telegram', icon: 'TG', isAllowed: true, color: 'bg-sky-500' },
];

export const MOTIVATIONAL_QUOTES = [
  "Focus is a matter of deciding what things you're not going to do.",
  "Deep work is the superpower of the 21st century.",
  "Your time is limited, don't waste it on others' highlight reels.",
  "Productivity is being able to do things that you were never able to do before.",
  "The secret of getting ahead is getting started.",
  "Do not let what you cannot do interfere with what you can do.",
  "Simplicity is the ultimate sophistication.",
  "Discipline is choosing between what you want now and what you want most.",
  "Concentrate all your thoughts upon the work in hand.",
  "The shorter way to do many things is to only do one thing at a time.",
  "Quality is not an act, it is a habit.",
  "It is not that I am so smart, it's just that I stay with problems longer.",
  "Energy and persistence conquer all things.",
  "Small progress is still progress.",
  "Focus on being productive instead of busy."
];

export const MARKET_UNLOCK_COST = 1000;

// Cycle Logic Constants
export const CYCLE_USAGE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
export const CYCLE_LOCK_DURATION_MS = 60 * 60 * 1000; // 1 hour

export const DEFAULT_APP_COLORS = [
  'bg-slate-800', 'bg-purple-600', 'bg-rose-500', 'bg-amber-500', 'bg-indigo-600'
];