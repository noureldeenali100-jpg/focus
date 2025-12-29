/**
 * Core type definitions for the FocusGuardian application.
 * These interfaces define the shape of the application state, 
 * focus sessions, tasks, and configuration objects.
 */

/**
 * Enum representing the available application screens for navigation.
 */
export enum Screen {
  ONBOARDING = 'ONBOARDING',
  HOME = 'HOME',
  TASKS = 'TASKS',
  SETTINGS = 'SETTINGS',
  MARKET = 'MARKET',
  SESSION_HISTORY = 'SESSION_HISTORY'
}

/**
 * Information about a specific application that can be blocked or allowed.
 */
export interface AppInfo {
  id: string;
  name: string;
  icon: string;
  isAllowed: boolean;
  color: string;
  isPermanentBlock?: boolean; // If true, the app is always blocked (e.g., Social Media)
}

/**
 * Record of a blocking event triggered when a user tries to access a restricted app.
 */
export interface BlockEvent {
  appName: string;
  timestamp: number;
}

/**
 * Represents a completed or canceled focus timer session.
 */
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
  isCounted: boolean; // Sessions under 10 minutes (600s) are marked as uncounted
}

/**
 * Internal state for an ongoing, active focus session.
 */
export interface ActiveSessionState {
  startTime: number;
  breakCount: number;
  totalBreakMs: number;
  lastPauseTimestamp: number | null;
}

/**
 * Represents a user-defined task/goal.
 */
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt: number | null;
}

/**
 * Tracks usage time for a specific application.
 */
export interface AppTimer {
  usedTodayMs: number;
  lastUpdateTimestamp: number;
}

/**
 * Configuration for app-specific usage limits.
 */
export interface AppConfig {
  allowedMs: number;
  lockMs: number;
}

/**
 * Tracks a request to temporarily unlock a blocked application.
 */
export interface UnlockRequest {
  requestedAt: number;
  expiresAt: number | null;
}

// User-defined styling and preference types
export type Theme = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'slate';
export type FocusSound = 'none' | 'rain' | 'clock' | 'library';
export type AppFont = 'Inter' | 'System' | 'Serif' | 'Mono';

/**
 * The root state interface for the entire application.
 * This structure is used for both runtime state and LocalStorage persistence.
 */
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
  focusSound: FocusSound;
  timerEndTimestamp: number | null; // Null if timer is stopped/idle
  timerPausedRemainingSeconds: number | null; // Remaining seconds if paused
  timerTotalDurationSeconds: number; // The set duration for the timer
}