export interface UserSettings {
  enableNotifications: boolean;
  darkMode: boolean;
  language: string;
  enablePenalties: boolean;
  enableBonuses: boolean;
  reminderTimes: string[];
  theme?: 'light' | 'dark' | 'system';
  timezone?: string;
  units?: {
    weight: 'kg' | 'lbs';
    distance: 'km' | 'miles';
    height: 'cm' | 'feet';
  };
  privacy?: {
    profile: 'public' | 'friends' | 'private';
    activity: 'public' | 'friends' | 'private';
    achievements: 'public' | 'friends' | 'private';
  };
  notifications?: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  preferences?: {
    showTutorial: boolean;
    showTips: boolean;
    showProgress: boolean;
    showLeaderboard: boolean;
  };
}

export interface AppSettings {
  id: string;
  key: string;
  value: any;
  description: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingsUpdate extends Partial<UserSettings> {} 