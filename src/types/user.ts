export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  avatarUrl?: string;
} 