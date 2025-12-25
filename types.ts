export enum Screen {
  ONBOARDING = 'ONBOARDING',
  HOME = 'HOME',
  TASKS = 'TASKS',
  ALLOWED_APPS = 'ALLOWED_APPS',
  SETTINGS = 'SETTINGS',
  PHONE_SIMULATOR = 'PHONE_SIMULATOR',
  MARKET = 'MARKET',
  SESSION_HISTORY = 'SESSION_HISTORY'
}

export interface AppInfo {
  id: string;
  name: string;
  icon: string;
  isAllowed: boolean;
  color: string;
  isPermanentBlock?: boolean;
}

export interface AppConfig {
  allowedMs: number;
  lockMs: number;
}

export interface PendingConfig {
  config: AppConfig;
  requestedAt: number;
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

export interface UnlockRequest {
  appId: string;
  requestedAt: number;
  expiresAt: number | null; // Null until the wait period is over
}

export interface FocusSession {
  id: string;
  startTime: number;
  endTime: number;
  targetDurationSeconds: number;
  actualFocusSeconds: number;
  totalBreakSeconds: number;
  breakCount: number;
  status: 'completed' | 'canceled';
  timestamp: number;
  isCounted: boolean; // Added to handle short session exclusion
}

export interface ActiveSessionState {
  startTime: number;
  breakCount: number;
  totalBreakMs: number;
  lastPauseTimestamp: number | null;
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
export type FocusSound = 'none' | 'rain' | 'clock' | 'library';
export type AppFont = 'Inter' | 'System' | 'Serif' | 'Mono';

export interface State {
  currentScreen: Screen;
  isFirstTime: boolean;
  isActivated: boolean; 
  userName: string;
  profileImage: string | null;
  signatureImage: string | null; 
  blockLogs: BlockEvent[];
  sessionLogs: FocusSession[]; // Migrated from simple segments to structured sessions
  activeSession: ActiveSessionState | null; // Persistence for active session tracking
  unlockRequests: Record<string, UnlockRequest>;
  customApps: AppInfo[];
  minWaitMs: number;
  usageMs: number;
  lastSessionEventTimestamp: number;
  balance: number;
  tasks: Task[];
  activeTaskId: null | string;
  theme: Theme;
  accentColor: AccentColor;
  font: AppFont;
  language: 'en' | 'ar';
  appTimers: Record<string, AppTimer>;
  globalAppConfig: AppConfig; 
  pendingGlobalConfig: PendingConfig | null; 
  cycleAppIds: string[]; 
  isSoundEnabled: boolean;
  focusSound: FocusSound;
  timerEndTimestamp: number | null;
  timerPausedRemainingSeconds: number | null;
  timerTotalDurationSeconds: number;
}