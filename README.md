<p align="center">
  <img src="SoloFitness.png" alt="SoloFitness Logo" width="120" />
</p>

<h1 align="center">SoloFitness</h1>

<p align="center">
  <strong>A 365-day progressive fitness program inspired by Solo Leveling</strong>
</p>

<p align="center">
  Level up your body. Become the strongest version of yourself.
</p>

---

## Features

- **365-Day Progressive Training** - Daily requirements that scale from beginner to advanced over a full year
- **10-Level System** - Track your progress through 10 levels, each spanning ~36 days
- **XP & Achievements** - Earn up to 90 XP per day and unlock 14 achievements
- **Streak Tracking** - Maintain your training streak with visual feedback
- **Penalty System** - Miss a day? Penalties carry over to keep you accountable
- **Distance Units** - Choose between kilometers or miles for running

## Screenshots

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="Dashboard" width="200" />
  <img src="docs/screenshots/achievements.png" alt="Achievements" width="200" />
  <img src="docs/screenshots/stats.png" alt="Stats" width="200" />
  <img src="docs/screenshots/settings.png" alt="Settings" width="200" />
</p>

## The Program

SoloFitness follows a progressive overload approach over 365 days:

| Day | Pushups | Situps | Squats | Running |
|-----|---------|--------|--------|---------|
| 1   | 10      | 10     | 10     | 1 km    |
| 100 | 30      | 30     | 30     | 2.3 km  |
| 200 | 58      | 58     | 58     | 4.6 km  |
| 365 | 100     | 100    | 100    | 10 km   |

## How It Works

### XP System

Earn experience points daily to level up:

| Action | XP |
|--------|-----|
| Base (showing up) | 25 |
| Per exercise completed | +10 (x4 max) |
| 100% completion bonus | +25 |
| **Maximum per day** | **90** |

### Level Progression

- **10 levels** spanning 365 days (~36 days per level)
- Exercise requirements scale using a polynomial curve for smooth progression
- Running uses a slightly steeper curve than reps

### Penalty System

Miss your daily targets? Penalties keep you accountable:

- **25%** of any shortfall carries over to the next day
- Minimum penalty: 1 rep or 100m running
- Penalties must be completed alongside your regular workout

### Streak Tracking

- Your streak breaks if more than 1 day passes without completion
- Streak milestones: 3, 7, 14, 21, 30, 50, 100, 365 days
- Visual feedback and achievements reward consistency

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **State Management**: TanStack Query + Zustand
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YourBr0ther/SoloFitness.git
   cd SoloFitness
   git checkout v3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Supabase credentials:
   ```env
   DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
   DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
   NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (user, daily-log, achievements, penalties)
│   ├── achievements/       # Awards page
│   ├── settings/           # Settings page
│   └── stats/              # Stats page
├── components/
│   ├── dashboard/          # Dashboard components (ExerciseCard, StreakCounter, etc.)
│   ├── effects/            # Visual effects (particles, animations)
│   ├── layout/             # Navigation & layout
│   ├── providers/          # QueryProvider, ToastProvider
│   └── ui/                 # Reusable UI (Card, Button, ProgressBar, Toast)
├── hooks/                  # Custom hooks (useUser, useDailyLog, useAchievements)
├── lib/                    # Utility functions
│   ├── levelSystem.ts      # XP & level calculations
│   ├── penaltySystem.ts    # Penalty calculations
│   ├── streakCalculator.ts # Streak logic
│   └── dateUtils.ts        # Date helpers
└── types/                  # TypeScript type definitions
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with achievements |
| `npm run db:studio` | Open Prisma Studio |

## Achievements

Unlock all 14 achievements as you progress:

| | Achievement | Condition | XP |
|--|-------------|-----------|-----|
| 🎯 | **First Step** | Complete your first workout | 50 |
| 🔥 | **Week Warrior** | Maintain a 7-day streak | 100 |
| ⚔️ | **Dedicated Hunter** | Maintain a 14-day streak | 150 |
| 👑 | **Month Master** | Maintain a 30-day streak | 300 |
| 💪 | **Pushup Centurion** | Complete 100 pushups in a single day | 200 |
| 🔄 | **Situp Centurion** | Complete 100 situps in a single day | 200 |
| 🦵 | **Squat Centurion** | Complete 100 squats in a single day | 200 |
| 🏃 | **Marathon Runner** | Run 10km in a single day | 250 |
| 🏆 | **Thousand Pushups** | Complete 1,000 lifetime pushups | 300 |
| 🌟 | **Pushup Legend** | Complete 5,000 lifetime pushups | 500 |
| 🗺️ | **Distance Runner** | Run 100km lifetime | 400 |
| ✨ | **Perfect Day** | Complete 100% of all exercises in one day | 75 |
| 👤 | **Shadow Monarch** | Reach Level 10 (Day 365) | 1000 |
| ⬆️ | **Arise** | Complete your first penalty workout | 50 |

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/user` | GET | Fetch user data with computed fields |
| `/api/user` | PATCH | Update user settings (distance unit) |
| `/api/user/reset` | DELETE | Reset all user data and start fresh |
| `/api/user/export` | GET | Export all data as JSON |
| `/api/daily-log` | GET | Fetch daily workout log (today or specific date) |
| `/api/daily-log` | POST | Update daily log with exercise amounts |
| `/api/achievements` | GET | List all achievements with unlock status |
| `/api/achievements` | POST | Check and unlock new achievements |
| `/api/penalties` | PATCH | Update penalty completion status |

## Architecture

- **Single-user design** - Personal fitness app, no authentication required
- **State management** - React Query for server state with optimistic updates
- **Mobile-first** - Designed for phone use with bottom navigation
- **Theme** - Dark mode inspired by Solo Leveling anime

## License

MIT

---

<p align="center">
  <em>Arise.</em>
</p>
