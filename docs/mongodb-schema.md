# MongoDB Schema Documentation

## Collections

### Users
- `_id`: ObjectId (Primary Key)
- `email`: String (Unique, Required)
- `password`: String (Required)
- `username`: String (Unique, Required)
- `createdAt`: DateTime (Required)
- `updatedAt`: DateTime (Required)
- Relations:
  - `profile`: One-to-One with Profile
  - `exercises`: One-to-Many with Exercise
  - `workouts`: One-to-Many with Workout
  - `settings`: One-to-One with UserSettings

### Profiles
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (Foreign Key to User, Unique, Required)
- `avatarUrl`: String
- `level`: Integer (Required)
- `xp`: Integer (Required)
- `currentStreak`: Integer (Required)
- `longestStreak`: Integer
- `exerciseCounts`: Object (Stores counts for different exercise types)
- `createdAt`: DateTime (Required)
- `updatedAt`: DateTime (Required)
- Relations:
  - `user`: One-to-One with User
  - `streakHistory`: One-to-Many with StreakHistory
  - `badges`: One-to-Many with Badge

### StreakHistory
- `_id`: ObjectId (Primary Key)
- `profileId`: ObjectId (Foreign Key to Profile, Required)
- `date`: String (YYYY-MM-DD format, Required)
- `completed`: Boolean (Required)
- `xpEarned`: Integer
- `exercises`: Object (Stores exercise counts for the day)
- `createdAt`: DateTime (Required)
- `updatedAt`: DateTime (Required)
- Relations:
  - `profile`: Many-to-One with Profile

### Badges
- `_id`: ObjectId (Primary Key)
- `profileId`: ObjectId (Foreign Key to Profile, Required)
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
  - `profile`: Many-to-One with Profile

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

### UserSettings
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (Foreign Key to User, Unique, Required)
- `enableNotifications`: Boolean
- `darkMode`: Boolean
- `language`: String
- `enablePenalties`: Boolean
- `enableBonuses`: Boolean
- `reminderTimes`: Array of Strings
- `createdAt`: DateTime (Required)
- `updatedAt`: DateTime (Required)
- Relations:
  - `user`: One-to-One with User

## Indexes

### Users
- `email`: Unique
- `username`: Unique

### Profiles
- `userId`: Unique

### StreakHistory
- `profileId + date`: Unique

### Badges
- `profileId + name`: Unique

### Exercises
- `userId + name`: Unique

### Workouts
- `userId + name`: Unique

### WorkoutExercises
- `workoutId + exerciseId`: Unique

### UserSettings
- `userId`: Unique 