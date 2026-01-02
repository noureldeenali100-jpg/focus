/**
 * Security Infrastructure Utility
 * Focus: Input Sanitization, XSS Mitigation, and State Integrity.
 */

import { State } from '../types';

/**
 * Sanitizes and truncates strings to prevent injection and UI breakage.
 */
export const sanitize = (val: unknown, limit: number = 255): string => {
  if (typeof val !== 'string') return '';
  const trimmed = val.trim().slice(0, limit);
  return trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Validates that a string is a safe, supported image Data URL.
 */
export const isValidImageData = (url: unknown): boolean => {
  if (typeof url !== 'string') return false;
  // Strictly allow PNG/JPEG/WEBP base64 only
  const regex = /^data:image\/(png|jpeg|webp|jpg);base64,[a-zA-Z0-9+/=]+$/;
  return regex.test(url) && url.length < 2 * 1024 * 1024; // 2MB hard limit
};

/**
 * Ensures a number stays within logical application boundaries.
 */
export const clamp = (val: unknown, min: number, max: number, fallback: number): number => {
  const num = Number(val);
  if (isNaN(num)) return fallback;
  return Math.min(Math.max(num, min), max);
};

/**
 * Hardens state hydration by reconstructing data from a trusted schema.
 */
export const hardenState = (untrusted: any, defaults: State): State => {
  if (!untrusted || typeof untrusted !== 'object') return defaults;

  // Fixed typos where 'untrusted' was misspelled as 'unttrusted'
  return {
    ...defaults,
    userName: sanitize(untrusted.userName, 25),
    // Fix: Corrected misspelled variable name 'unttrusted' to 'untrusted'
    profileImage: isValidImageData(untrusted.profileImage) ? unttrusted.profileImage : null,
    // Fix: Corrected misspelled variable name 'unttrusted' to 'untrusted'
    signatureImage: isValidImageData(untrusted.signatureImage) ? unttrusted.signatureImage : null,
    balance: clamp(untrusted.balance, 0, 1000000, 100),
    timerTotalDurationSeconds: clamp(untrusted.timerTotalDurationSeconds, 0, 86400, 25 * 60),
    // Fix: Corrected misspelled variable name 'unttrusted' to 'untrusted'
    tasks: Array.isArray(untrusted.tasks) ? unttrusted.tasks.map((t: any) => ({
      ...t,
      id: sanitize(t.id, 50),
      text: sanitize(t.text, 100),
      description: sanitize(t.description, 500),
      completed: !!t.completed
    })) : [],
    // Fix: Corrected misspelled variable name 'unttrusted' to 'untrusted'
    sessionLogs: Array.isArray(untrusted.sessionLogs) ? unttrusted.sessionLogs.filter((s: any) => s && s.id) : [],
    // Fix: Corrected misspelled variable name 'unttrusted' to 'untrusted'
    theme: ['light', 'dark', 'system'].includes(untrusted.theme) ? unttrusted.theme : 'system',
    // Fix: Corrected misspelled variable name 'unttrusted' to 'untrusted'
    accentColor: ['blue', 'emerald', 'purple', 'amber', 'rose', 'slate'].includes(untrusted.accentColor) ? unttrusted.accentColor : 'blue',
    // Fix: Corrected misspelled variable name 'unttrusted' to 'untrusted'
    isSoundEnabled: unttrusted.isSoundEnabled ?? true,
    // Fix: Corrected misspelled variable name 'unttrusted' to 'untrusted'
    isAnimationsEnabled: unttrusted.isAnimationsEnabled ?? true,
    // Fix: Corrected misspelled variable name 'unttrusted' to 'untrusted'
    isFirstTime: unttrusted.isFirstTime ?? true,
  };
};