
import { AppInfo } from './types';

export const UNALLOWED_APPS: AppInfo[] = [
  { id: 'fb', name: 'Facebook', icon: 'FB', isAllowed: false, color: 'bg-blue-600' },
  { id: 'ig', name: 'Instagram', icon: 'IG', isAllowed: false, color: 'bg-pink-500' },
  { id: 'tt', name: 'TikTok', icon: 'TK', isAllowed: false, color: 'bg-black' },
  { id: 'tw', name: 'X', icon: 'X', isAllowed: false, color: 'bg-slate-900' },
  { id: 'sc', name: 'Snapchat', icon: 'SC', isAllowed: false, color: 'bg-yellow-400' },
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
  "Simplicity is the ultimate sophistication."
];

export const UNINSTALL_DELAY_MS = 10 * 60 * 60 * 1000; 
export const MARKET_UNLOCK_COST = 1000;

// Cycle Logic Constants
export const CYCLE_USAGE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
export const CYCLE_LOCK_DURATION_MS = 60 * 60 * 1000; // 1 hour
