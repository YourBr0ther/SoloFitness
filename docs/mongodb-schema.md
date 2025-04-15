# MongoDB Schema Documentation

## Collections

### Users
- `_id`: ObjectId (Primary Key)
- `email`: String (Unique, Required)
- `password`: String (Required)
- `username`: String (Unique, Required)
- `avatarUrl`: String (Default: '/default-avatar.svg')
- `createdAt`: DateTime (Required)
- `updatedAt`: DateTime (Required)
- `profile`: Object
  - `level`: Integer
  - `xp`: Integer
  - `currentStreak`: Integer
  - `longestStreak`: Integer
  - `streakHistory`: Array of StreakHistory
  - `exerciseCounts`: Object
    - `pushups`: Integer
    - `situps`: Integer
    - `squats`: Integer
    - `milesRan`: Number
- `settings`: Object
  - `enableNotifications`: Boolean
  - `darkMode`: Boolean
  - `language`: String
  - `enablePenalties`: Boolean
  - `enableBonuses`: Boolean
  - `reminderTimes`: Array of String
  - `theme`: String ('light' | 'dark' | 'system')
  - `timezone`: String
  - `units`: Object
    - `weight`: String ('kg' | 'lbs')
    - `distance`: String ('km' | 'miles')
    - `height`: String ('cm' | 'feet')
  - `privacy`: Object
    - `profile`: String ('public' | 'friends' | 'private')
    - `activity`: String ('public' | 'friends' | 'private')
    - `achievements`: String ('public' | 'friends' | 'private')
  - `notifications`: Object
    - `email`: Boolean
    - `push`: Boolean
    - `inApp`: Boolean
  - `preferences`: Object
    - `showTutorial`: Boolean
    - `showTips`: Boolean
    - `showProgress`: Boolean
    - `showLeaderboard`: Boolean

### StreakHistory
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (Foreign Key to User, Required)
- `date`: String (YYYY-MM-DD format, Required)
- `completed`: Boolean (Required)
- `xpEarned`: Integer
- `exercises`: Object (Stores exercise counts for the day)
- `createdAt`: DateTime (Required)
- `updatedAt`: DateTime (Required)
- Relations:
  - `user`: Many-to-One with User

### Badges
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (Foreign Key to User, Required)
- `name`: String (Required)
- `description`: String (Required)
- `icon`: String (Required)
- `unlocked`: Boolean (Required)
- `progress`: Integer
- `total`: Integer
- `isNew`: Boolean
- `createdAt`: DateTime (Required)
- `updatedAt`: DateTime (Required)
- Relations:
  - `user`: Many-to-One with User

### Exercises
- `_id`: ObjectId (Primary Key)
- `name`: String (Required)
- `description`: String
- `muscleGroup`: String
- `equipment`: String
- `difficulty`: String
- `videoUrl`: String
- `imageUrl`: String
- `userId`: ObjectId (Foreign Key to User, Required)
- `createdAt`: DateTime (Required)
- `updatedAt`: DateTime (Required)
- Relations:
  - `user`: Many-to-One with User
  - `workouts`: Many-to-Many with Workout through WorkoutExercise

### Workouts
- `_id`: ObjectId (Primary Key)
- `name`: String (Required)
- `description`: String
- `userId`: ObjectId (Foreign Key to User, Required)
- `createdAt`: DateTime (Required)
- `updatedAt`: DateTime (Required)
- Relations:
  - `user`: Many-to-One with User
  - `exercises`: Many-to-Many with Exercise through WorkoutExercise

### WorkoutExercises
- `_id`: ObjectId (Primary Key)
- `workoutId`: ObjectId (Foreign Key to Workout, Required)
- `exerciseId`: ObjectId (Foreign Key to Exercise, Required)
- `sets`: Integer (Required)
- `reps`: Integer (Required)
- `weight`: Double
- `duration`: Integer (in seconds)
- `createdAt`: DateTime (Required)
- `updatedAt`: DateTime (Required)
- Relations:
  - `workout`: Many-to-One with Workout
  - `exercise`: Many-to-One with Exercise

## Indexes

### Users
- `email`: Unique
- `username`: Unique

### StreakHistory
- `userId + date`: Unique

### Badges
- `userId + name`: Unique

### Exercises
- `userId + name`: Unique

### Workouts
- `userId + name`: Unique

### WorkoutExercises
- `workoutId + exerciseId`: Unique 