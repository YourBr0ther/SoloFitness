const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const API_ENDPOINTS = {
  // Coach endpoints
  COACHES: `${API_BASE}/coaches`,
  COACH: (id: string) => `${API_BASE}/coaches/${id}`,
  
  // Journal endpoints
  EXERCISES: `${API_BASE}/exercises`,
  EXERCISE: (id: string) => `${API_BASE}/exercises/${id}`,
  PENALTY_TASKS: `${API_BASE}/penalty-tasks`,
  BONUS_TASKS: `${API_BASE}/bonus-tasks`,
  
  // Profile endpoints
  PROFILE: `${API_BASE}/profile`,
  STREAK: `${API_BASE}/streak`,
  BADGES: `${API_BASE}/badges`,
  
  // Authentication endpoints
  LOGIN: `${API_BASE}/auth/login`,
  REGISTER: `${API_BASE}/auth/register`,
  REFRESH_TOKEN: `${API_BASE}/auth/refresh`,
} as const; 