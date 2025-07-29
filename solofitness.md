# SoloFitness - Solo Leveling Inspired Fitness App

## Overview
A Progressive Web App (PWA) that gamifies daily fitness routines inspired by the Solo Leveling anime. Users complete daily exercise challenges to earn XP and level up, with streak tracking, penalties for missed days, and bonus challenges for consistency.

## Design System
- **Primary Colors**: #0A1929 (Deep Navy), #1976D2 (Vibrant Blue), #42A5F5 (Light Blue)
- **Background**: #0A0E1A (Near Black)
- **Accent**: #00E5FF (Cyan for highlights)
- **Typography**: Inter for UI, Bebas Neue for headings
- **Animations**: Subtle particle effects using CSS/Framer Motion

## Tech Stack
- **Frontend**: Next.js 14 with TypeScript
- **Database**: PostgreSQL (via Docker)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **PWA**: next-pwa
- **Container**: Docker & Docker Compose
- **State Management**: Zustand
- **Animations**: Framer Motion

## Database Schema

```prisma
model User {
  id            String   @id @default(cuid())
  username      String   @unique
  email         String   @unique
  password      String
  level         Int      @default(1)
  currentXP     Int      @default(0)
  totalXP       Int      @default(0)
  currentStreak Int      @default(0)
  longestStreak Int      @default(0)
  createdAt     DateTime @default(now())
  
  dailyLogs     DailyLog[]
  achievements  UserAchievement[]
  settings      UserSettings?
}

model UserSettings {
  id              String  @id @default(cuid())
  userId          String  @unique
  penaltiesEnabled Boolean @default(true)
  bonusEnabled    Boolean @default(true)
  
  user User @relation(fields: [userId], references: [id])
}

model DailyLog {
  id          String   @id @default(cuid())
  userId      String
  date        DateTime @db.Date
  pushups     Int      @default(0)
  situps      Int      @default(0)
  squats      Int      @default(0)
  milesRan    Float    @default(0)
  xpEarned    Int      @default(0)
  completed   Boolean  @default(false)
  
  penalties   Penalty[]
  bonusTasks  BonusTask[]
  
  user User @relation(fields: [userId], references: [id])
  
  @@unique([userId, date])
}

model Penalty {
  id         String   @id @default(cuid())
  dailyLogId String
  exercise   String
  amount     Int
  completed  Boolean  @default(false)
  
  dailyLog DailyLog @relation(fields: [dailyLogId], references: [id])
}

model BonusTask {
  id         String   @id @default(cuid())
  dailyLogId String
  task       String
  completed  Boolean  @default(false)
  
  dailyLog DailyLog @relation(fields: [dailyLogId], references: [id])
}

model Achievement {
  id          String @id @default(cuid())
  name        String
  description String
  icon        String
  requirement String
  
  users UserAchievement[]
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())
  
  user        User        @relation(fields: [userId], references: [id])
  achievement Achievement @relation(fields: [achievementId], references: [id])
  
  @@unique([userId, achievementId])
}
```

## Level Progression System

```typescript
const LEVEL_REQUIREMENTS = {
  1: { pushups: 10, situps: 10, squats: 10, miles: 0.5, xpRequired: 0 },
  2: { pushups: 15, situps: 15, squats: 15, miles: 0.75, xpRequired: 100 },
  3: { pushups: 20, situps: 20, squats: 20, miles: 1, xpRequired: 300 },
  4: { pushups: 30, situps: 30, squats: 30, miles: 1.5, xpRequired: 600 },
  5: { pushups: 40, situps: 40, squats: 40, miles: 2, xpRequired: 1000 },
  6: { pushups: 50, situps: 50, squats: 50, miles: 2.5, xpRequired: 1500 },
  7: { pushups: 65, situps: 65, squats: 65, miles: 3, xpRequired: 2100 },
  8: { pushups: 80, situps: 80, squats: 80, miles: 3.5, xpRequired: 2800 },
  9: { pushups: 90, situps: 90, squats: 90, miles: 4, xpRequired: 3600 },
  10: { pushups: 100, situps: 100, squats: 100, miles: 5, xpRequired: 4500 }
};

// Daily XP calculation
const calculateDailyXP = (level: number, completionPercentage: number) => {
  const baseXP = 20 + (level * 5);
  return Math.floor(baseXP * completionPercentage);
};
```

## Pages & Components

### 1. Login Page (`/login`)
- Centered "SoloFitness" logo with glowing effect
- Animated blue particles in background using CSS animations
- "Click here to change your life" tagline with typewriter effect
- Login/Register toggle button

### 2. Register/Login Component
```typescript
interface AuthForm {
  username: string;
  email: string;
  password: string;
}
```

### 3. Journal Page (`/` - Main Dashboard)
```typescript
interface JournalPageProps {
  streak: number;
  todayXP: number;
  currentLevel: number;
  levelProgress: { current: number; required: number };
  exercises: {
    pushups: { current: number; target: number };
    situps: { current: number; target: number };
    squats: { current: number; target: number };
    milesRan: { current: number; target: number };
  };
  penalties?: Penalty[];
  bonusTask?: BonusTask;
}
```

**Components:**
- StreakCounter with calendar modal
- ProfileAvatar
- XPDisplay
- LevelProgressBar
- ExerciseCard (reusable for each exercise)
- PenaltyCard
- BonusTaskCard

### 4. Profile Page (`/profile`)
- Profile settings
- Achievement gallery
- Statistics dashboard
- Toggle switches for penalties/bonuses
- Sign out button

## Key Features Implementation

### Streak System
```typescript
const updateStreak = async (userId: string) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const yesterdayLog = await db.dailyLog.findUnique({
    where: { userId_date: { userId, date: yesterday } }
  });
  
  if (yesterdayLog?.completed) {
    // Continue streak
    await db.user.update({
      where: { id: userId },
      data: { 
        currentStreak: { increment: 1 },
        longestStreak: { 
          set: Math.max(user.currentStreak + 1, user.longestStreak) 
        }
      }
    });
  } else {
    // Reset streak
    await db.user.update({
      where: { id: userId },
      data: { currentStreak: 1 }
    });
  }
};
```

### Penalty System
- Calculate 25% of missed exercises from previous day
- Add to today's requirements with red outline
- Store in Penalty table

### Bonus Tasks Pool
```typescript
const BONUS_TASKS = [
  "Send a family member a message saying you're thinking about them",
  "Take 10 minutes to reflect on your health journey",
  "Schedule a doctor's appointment",
  "Call a friend you haven't spoken to in a while",
  "Write down 3 things you're grateful for",
  "Meditate for 5 minutes",
  "Drink an extra glass of water",
  "Take a 10-minute walk outside"
];
```

## PWA Configuration
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

module.exports = withPWA({
  // Next.js config
});
```

## Docker Setup
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/solofitness
    depends_on:
      - db
      
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=solofitness
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
volumes:
  postgres_data:
```

## Achievement System Examples
- "First Step" - Complete first day
- "Week Warrior" - 7-day streak
- "Month Master" - 30-day streak
- "Push-up Pro" - 1000 total push-ups
- "Marathon Runner" - 100 total miles
- "Level 5 Hero" - Reach level 5
- "Solo Leveling Complete" - Reach level 10

## Mobile Optimization
- Touch-friendly buttons (min 44x44px)
- Swipe gestures for exercise counters
- Bottom navigation for thumb reach
- Responsive grid layouts
- Offline capability with service workers

## Animation Details
- Particle system using CSS keyframes for performance
- Level-up animation with confetti effect
- Smooth progress bar transitions
- Exercise counter animations on increment/decrement
- Subtle glow effects on completion

This specification provides a complete blueprint for building SoloFitness with all requested features, following modern web development practices and ensuring a smooth, game-like experience that captures the essence of Solo Leveling while promoting daily fitness habits.