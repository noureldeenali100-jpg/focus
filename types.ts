
/**
 * Core type definitions for the FocusGuardian application.
 */

export enum Screen {
  ONBOARDING = 'ONBOARDING',
  HOME = 'HOME',
  TASKS = 'TASKS',
  SETTINGS = 'SETTINGS',
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

export interface BlockEvent {
  appName: string;
  timestamp: number;
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
  isCounted: boolean;
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
  description?: string; // Enhanced: added description field
  completed: boolean;
  createdAt: number;
  completedAt: number | null;
}

export type Theme = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'slate';
export type FocusSound = 'none' | 'rain' | 'clock' | 'library';
export type AppFont = 'Inter' | 'System' | 'Serif' | 'Mono';

// Added missing interfaces for application management
export interface AppTimer {
  usageMs: number;
  lastUsedTimestamp: number;
}

export interface AppConfig {
  allowedMs: number;
  lockMs: number;
}

export interface UnlockRequest {
  appId: string;
  requestedAt: number;
  expiresAt?: number;
}

export interface State {
  currentScreen: Screen;
  isFirstTime: boolean;
  isActivated: boolean; 
  userName: string;
  profileImage: string | null;
  signatureImage: string | null; 
  blockLogs: BlockEvent[];
  sessionLogs: FocusSession[]; 
  activeSession: ActiveSessionState | null; 
  lastSessionEventTimestamp: number;
  balance: number;
  tasks: Task[];
  activeTaskId: null | string;
  theme: Theme;
  accentColor: AccentColor;
  font: AppFont;
  isSoundEnabled: boolean;
  isAnimationsEnabled: boolean;
  isTimerGlowEnabled: boolean;
  focusSound: FocusSound;
  timerEndTimestamp: number | null;
  timerPausedRemainingSeconds: number | null;
  timerTotalDurationSeconds: number;
}