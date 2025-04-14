export const AUTH_CONFIG = {
  TOKEN_EXPIRY: '7d',
  REFRESH_TOKEN_EXPIRY: '30d',
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 5 * 60 * 1000, // 5 minutes
  TOKEN_STORAGE_KEY: 'token',
  REFRESH_TOKEN_STORAGE_KEY: 'refreshToken',
  USER_STORAGE_KEY: 'user',
  LOCKOUT_TIME_KEY: 'lockoutTime',
  FAILED_ATTEMPTS_KEY: 'failedAttempts',
} as const;

export const PLATFORMS = {
  WEB: 'web',
  MOBILE: 'mobile',
  DESKTOP: 'desktop',
} as const;

export type Platform = typeof PLATFORMS[keyof typeof PLATFORMS]; 