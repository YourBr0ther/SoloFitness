# SoloFitness API Documentation

## Overview
The SoloFitness API provides a comprehensive set of endpoints for managing user fitness data, workouts, exercises, and social features. The API supports offline functionality, caching, and data synchronization.

## Base URL
```
/api
```

## Authentication
All authenticated endpoints require a valid JWT token in the Authorization header.

### Endpoints

#### Auth
- **POST** `/auth/login`
  - Login with email and password
  - Returns: `{ user: User, token: string }`

- **POST** `/auth/register`
  - Register new user
  - Returns: `{ user: User, token: string }`

- **POST** `/auth/logout`
  - Logout current user
  - Returns: `void`

- **POST** `/auth/refresh`
  - Refresh authentication token
  - Returns: `{ token: string }`

#### User
- **GET** `/users/me`
  - Get current user profile
  - Cached for 5 minutes
  - Returns: `User`

- **PUT** `/users/me`
  - Update current user
  - Supports offline mode
  - Returns: `User`

#### Exercises
- **GET** `/exercises`
  - List all exercises
  - Cached for 5 minutes
  - Returns: `Exercise[]`

- **GET** `/exercises/:id`
  - Get specific exercise
  - Cached for 5 minutes
  - Returns: `Exercise`

- **POST** `/exercises`
  - Create new exercise
  - Supports offline mode
  - Returns: `Exercise`

- **PUT** `/exercises/:id`
  - Update exercise
  - Supports offline mode
  - Returns: `Exercise`

- **DELETE** `/exercises/:id`
  - Delete exercise
  - Supports offline mode
  - Returns: `void`

#### Workouts
- **GET** `/workouts`
  - List all workouts
  - Supports filters: `WorkoutFilters`
  - Returns: `Workout[]`

- **GET** `/workouts/:id`
  - Get specific workout
  - Returns: `Workout`

- **GET** `/workouts/today`
  - Get today's workout
  - Returns: `Workout`

- **POST** `/workouts`
  - Create new workout
  - Returns: `Workout`

- **PUT** `/workouts/:id`
  - Update workout
  - Returns: `Workout`

- **DELETE** `/workouts/:id`
  - Delete workout
  - Returns: `void`

- **POST** `/workouts/progress`
  - Update workout progress
  - Body: `{ exercises: WorkoutProgress, completeBonusTask: boolean }`
  - Returns: `WorkoutResult`

#### Profile
- **GET** `/profile`
  - Get user profile with stats
  - Cached for 5 minutes
  - Returns: `Profile`

- **PUT** `/profile`
  - Update user profile
  - Supports offline mode
  - Returns: `Profile`

#### Settings
- **GET** `/settings`
  - Get user settings
  - Returns: `UserSettings`

- **PUT** `/settings`
  - Update user settings
  - Returns: `UserSettings`

#### Achievements
- **GET** `/achievements`
  - List all achievements
  - Cached for 5 minutes
  - Returns: `Achievement[]`

- **GET** `/achievements/:id/progress`
  - Get achievement progress
  - Cached for 5 minutes
  - Returns: `AchievementProgress`

- **GET** `/badges`
  - Get user badges
  - Cached for 5 minutes
  - Returns: `GymBadge[]`

#### Notifications
- **GET** `/notifications`
  - List notifications
  - Supports filters: `NotificationFilters`
  - Returns: `Notification[]`

- **GET** `/notifications/preferences`
  - Get notification preferences
  - Returns: `NotificationPreferences`

- **PUT** `/notifications/:id`
  - Update notification
  - Returns: `Notification`

#### Leaderboard
- **GET** `/leaderboard`
  - Get leaderboard entries
  - Supports filters: `LeaderboardFilters`
  - Returns: `LeaderboardEntry[]`

- **GET** `/leaderboard/stats`
  - Get leaderboard statistics
  - Returns: `LeaderboardStats`

#### Analytics
- **GET** `/analytics`
  - Get analytics data
  - Supports filters: `AnalyticsFilters`
  - Returns: `AnalyticsDataPoint[]`

- **GET** `/analytics/summary`
  - Get analytics summary
  - Returns: `AnalyticsSummary`

#### Social
- **GET** `/social/profile/:userId`
  - Get user's social profile
  - Returns: `SocialProfile`

- **PUT** `/social/profile`
  - Update social profile
  - Returns: `SocialProfile`

- **GET** `/social/posts`
  - List social posts
  - Supports filters: `SocialFilters`
  - Returns: `SocialPost[]`

- **POST** `/social/posts`
  - Create social post
  - Supports offline mode
  - Returns: `SocialPost`

- **GET** `/social/posts/:postId/comments`
  - Get post comments
  - Returns: `SocialComment[]`

- **POST** `/social/posts/:postId/comments`
  - Create post comment
  - Returns: `SocialComment`

- **POST** `/social/interactions`
  - Create social interaction
  - Returns: `SocialInteraction`

- **GET** `/social/stats`
  - Get social statistics
  - Returns: `SocialStats`

#### Feedback
- **GET** `/feedback`
  - List feedback
  - Supports filters: `FeedbackFilters`
  - Returns: `Feedback[]`

- **POST** `/feedback`
  - Create feedback
  - Returns: `Feedback`

- **GET** `/feedback/:id/comments`
  - Get feedback comments
  - Returns: `FeedbackComment[]`

- **POST** `/feedback/:id/comments`
  - Create feedback comment
  - Returns: `FeedbackComment`

- **PUT** `/feedback/:id`
  - Update feedback
  - Returns: `Feedback`

- **GET** `/feedback/stats`
  - Get feedback statistics
  - Returns: `FeedbackStats`

#### Reminders
- **GET** `/reminders`
  - List reminders
  - Supports filters: `ReminderFilters`
  - Returns: `Reminder[]`

- **POST** `/reminders`
  - Create reminder
  - Returns: `Reminder`

- **PUT** `/reminders/:id`
  - Update reminder
  - Returns: `Reminder`

- **DELETE** `/reminders/:id`
  - Delete reminder
  - Returns: `void`

- **GET** `/reminders/stats`
  - Get reminder statistics
  - Returns: `ReminderStats`

## Data Types

### User
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}
```

### Profile
```typescript
interface Profile {
  id: string;
  username: string;
  avatarUrl: string;
  level: number;
  xp: number;
  currentStreak: number;
  streakHistory: StreakDay[];
  badges: GymBadge[];
  preferences: {
    enablePenalties: boolean;
    enableBonuses: boolean;
  };
}
```

### Exercise
```typescript
interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroup?: string;
  equipment?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string[];
  videoUrl?: string;
  imageUrl?: string;
}
```

### Workout
```typescript
interface Workout {
  id: string;
  date: string;
  completed: boolean;
  level: number;
  requirements: {
    pushups: number;
    situps: number;
    squats: number;
    milesRan: number;
  };
  currentProgress: {
    pushups: number;
    situps: number;
    squats: number;
    milesRan: number;
  };
}
```

### Achievement
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  criteria: string;
  icon: string;
  requiredValue: number;
}
```

### SocialPost
```typescript
interface SocialPost {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
}
```

## Features

### Offline Support
- Automatic queueing of operations when offline
- Conflict resolution strategies
- Data synchronization when back online

### Caching
- Intelligent caching of frequently accessed data
- Configurable TTL (Time To Live)
- Cache invalidation on updates

### Error Handling
- Consistent error format
- Automatic token refresh
- Offline error queueing

### Data Sync
- Background synchronization
- Conflict resolution
- Queue management

### Analytics & Insights
- Workout progress tracking
- Achievement tracking
- Social engagement metrics
- User behavior analytics

### Social Features
- User profiles
- Posts and comments
- Likes and interactions
- Activity feed

## Usage Example

```typescript
import { useApi } from '@/contexts/ApiContext';

function MyComponent() {
  const { api } = useApi();
  
  async function handleWorkout() {
    try {
      const workout = await api.getWorkout(id);
      // Handle workout data
    } catch (err) {
      // Handle error
    }
  }
}
``` 