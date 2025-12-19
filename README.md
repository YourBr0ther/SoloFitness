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

## The Program

SoloFitness follows a progressive overload approach over 365 days:

| Day | Pushups | Situps | Squats | Running |
|-----|---------|--------|--------|---------|
| 1   | 10      | 10     | 10     | 1 km    |
| 100 | 30      | 30     | 30     | 2.3 km  |
| 200 | 58      | 58     | 58     | 4.6 km  |
| 365 | 100     | 100    | 100    | 10 km   |

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
├── app/                  # Next.js App Router pages
│   ├── api/              # API routes
│   ├── achievements/     # Achievements page
│   ├── settings/         # Settings page
│   └── stats/            # Stats page
├── components/
│   ├── dashboard/        # Dashboard components
│   ├── layout/           # Navigation & layout
│   ├── providers/        # React Query provider
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── levelSystem.ts    # XP & level calculations
│   ├── penaltySystem.ts  # Penalty calculations
│   └── streakCalculator.ts
└── types/                # TypeScript types
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
| `npm run db:seed` | Seed database with achievements |
| `npm run db:studio` | Open Prisma Studio |

## Achievements

Unlock achievements as you progress:

- **First Step** - Complete your first workout
- **Week Warrior** - Maintain a 7-day streak
- **Dedicated Hunter** - Maintain a 14-day streak
- **Month Master** - Maintain a 30-day streak
- **Pushup Centurion** - Complete 100 pushups in a day
- **Marathon Runner** - Run 10km in a day
- **Shadow Monarch** - Reach Level 10 (Day 365)
- ...and more!

## License

MIT

---

<p align="center">
  <em>Arise.</em>
</p>
