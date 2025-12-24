
export enum Screen {
  ONBOARDING = 'ONBOARDING',
  HOME = 'HOME',
  TASKS = 'TASKS',
  ALLOWED_APPS = 'ALLOWED_APPS',
  SETTINGS = 'SETTINGS',
  REPORT = 'REPORT',
  PHONE_SIMULATOR = 'PHONE_SIMULATOR',
  MARKET = 'MARKET'
}

export interface AppInfo {
  id: string;
  name: string;
  icon: string;
  isAllowed: boolean;
  color: string;
}

export interface AppConfig {
  allowedMs: number;
  lockMs: number;
}

export interface AppTimer {
  appId: string;
  usedMs: number; 
  lockedUntil: number | null; 
  lastOpenedAt: number | null; 
}

export interface BlockEvent {
  appName: string;
  timestamp: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt: number | null;
}

export type Theme = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'slate';

export interface State {
  currentScreen: Screen;
  isFirstTime: boolean;
  isActivated: boolean; 
  userName: string;
  blockLogs: BlockEvent[];
  balance: number;
  tasks: Task[];
  activeTaskId: string | null;
  theme: Theme;
  accentColor: AccentColor;
  language: string;
  uninstallRequestedAt: number | null;
  appTimers: Record<string, AppTimer>;
  appConfigs: Record<string, AppConfig>; 
  cycleAppIds: string[]; 
  isSoundEnabled: boolean;
  // Timer persistence
  timerEndTimestamp: number | null;
  timerPausedRemainingSeconds: number | null;
  timerTotalDurationSeconds: number;
}
