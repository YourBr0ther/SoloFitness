// Use relative paths for API routes since we're using Next.js API routes
export const API_ENDPOINTS = {
  // Coach endpoints
  COACHES: '/api/coaches',
  COACH: (id: string) => `/api/coaches/${id}`,
  
  // Journal endpoints
  EXERCISES: '/api/exercises',
  EXERCISE: (id: string) => `/api/exercises/${id}`,
  PENALTY_TASKS: '/api/penalty-tasks',
  BONUS_TASKS: '/api/bonus-tasks',
  
  // Profile endpoints
  PROFILE: '/api/profile',
  STREAK: '/api/streak',
  BADGES: '/api/badges',
  
  // Authentication endpoints
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH_TOKEN: '/api/auth/refresh',
} as const; 