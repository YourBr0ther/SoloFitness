# SoloFitness - Solo Leveling Inspired Fitness App

A Progressive Web App that gamifies daily fitness routines inspired by the Solo Leveling anime. Users complete daily exercise challenges to earn XP and level up, with streak tracking, penalties for missed days, and bonus challenges for consistency.

## Features

### 🎮 **Gamification System**
- **10 Levels**: Progress from Level 1 to Level 10 Hunter
- **XP System**: Earn XP based on completion percentage
- **Dynamic Requirements**: Exercise targets increase with each level
- **Level-up Animations**: Satisfying visual feedback

### 📊 **Exercise Tracking**
- **4 Exercise Types**: Push-ups, sit-ups, squats, and running miles
- **Interactive Counters**: Tap to increment or manually edit values
- **Progress Bars**: Visual representation of daily goals
- **Input Validation**: Prevents unrealistic values (max 1000 reps, 50 miles)

### 🔥 **Streak & Motivation**
- **Daily Streaks**: Track consecutive days of completed workouts
- **Best Streak Records**: Remember your longest achievement
- **Calendar Modal**: Visual representation of your streak history
- **Motivational Quotes**: Solo Leveling-inspired encouragements

### ⚠️ **Penalty System**
- **Smart Penalties**: 25% of missed exercises added to next day
- **Visual Indicators**: Red styling for penalty exercises
- **Completion Tracking**: Check off penalties as you complete them
- **Settings Toggle**: Can be disabled in user preferences

### ⭐ **Bonus Challenges**
- **15 Unique Tasks**: Wellness challenges beyond physical exercise
- **Adaptive Assignment**: More frequent for consistent users
- **Bonus XP**: Extra 10 XP for completing bonus tasks
- **Holistic Wellness**: Mental health and social connection focus

### 🏆 **Achievement System**
- **10 Achievements**: Comprehensive milestone tracking
- **Beautiful Gallery**: Locked/unlocked visual representation
- **Progress Tracking**: Smart conditions check your entire history
- **Motivational Targets**: From first day to maximum level completion

### 📱 **PWA Features**
- **Mobile Installation**: Add to home screen like a native app
- **Push Notifications**: Workout reminders, achievements, and streak milestones
- **Responsive Design**: Perfect on all device sizes
- **Touch Optimized**: Thumb-friendly button sizes and gestures
- **Offline Ready**: Service worker configuration included

### 📸 **Profile Features**
- **Profile Pictures**: Upload and manage custom avatars
- **User Profiles**: Comprehensive statistics and achievement galleries
- **Settings Management**: Customize penalties, bonuses, and notifications
- **Case-Insensitive Login**: Username or email login with smart matching

### 🔔 **Notification System**
- **Daily Reminders**: Customizable workout reminder times
- **Achievement Alerts**: Celebrate unlocked achievements instantly
- **Streak Milestones**: Get notified at important streak markers (3, 7, 14, 21, 30, 50+ days)
- **Workout Celebrations**: Level-up and XP gain notifications
- **Smart Scheduling**: Persistent reminders with weekend options
- **Permission Handling**: Smart browser notification permission requests
- **Test Notifications**: Built-in test feature to verify notifications work

### 🔐 **Authentication Features**
- **Flexible Login**: Use either username or email to log in
- **Case-Insensitive**: Username matching works regardless of case (JohnDoe = johndoe)
- **Secure Registration**: bcrypt password hashing with input validation
- **Auto-Login**: Seamless login after successful registration
- **Session Management**: JWT-based sessions with NextAuth.js

### 🎨 **Solo Leveling Aesthetic**
- **Custom Theme**: Deep navy, vibrant blue, and cyan color scheme
- **Particle Effects**: Animated background particles
- **Glow Effects**: Level-appropriate user avatars with glow
- **Typography**: Inter for UI, Bebas Neue for headings
- **Custom Icon**: Blue flame dumbbell design

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript and App Router
- **Database**: PostgreSQL (via Docker)
- **ORM**: Prisma with full type safety
- **Authentication**: NextAuth.js with JWT sessions
- **Styling**: Tailwind CSS with custom Solo Leveling theme
- **PWA**: next-pwa with complete manifest and icons
- **State Management**: React hooks with server state
- **Security**: bcryptjs password hashing, input validation
- **Container**: Docker & Docker Compose for development and production

## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SoloFitness
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example file and edit it
   cp .env.example .env
   # Edit .env with your specific values
   ```

4. **Start the database**
   ```bash
   docker compose up db -d
   ```

5. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

### Docker Development

To run the entire application with Docker:

```bash
docker compose up --build
```

### Docker Hub Deployment

For quick deployment using pre-built images:

```bash
# Copy environment variables
cp .env.example .env
# Edit .env with your settings

# Deploy with Docker Hub image
docker compose -f docker-compose.prod.yml up -d
```

**Docker Hub**: `yourbr0ther/solofitness:latest`

**Available Tags**:
- `latest` - Latest stable release
- `v1.0.x` - Specific version releases

**Environment Variables**:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - 32+ character secret key
- `NEXTAUTH_URL` - Your app's public URL
- `NEXTAUTH_URL_INTERNAL` - Internal URL (for reverse proxy setups)
- `NODE_ENV` - Set to `production`

**Quick Start**:
```bash
# Create .env file
echo "DATABASE_URL=postgresql://user:password@db:5432/solofitness" > .env
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env
echo "NEXTAUTH_URL=https://your-domain.com" >> .env
echo "NODE_ENV=production" >> .env

# Deploy
docker compose -f docker-compose.prod.yml up -d
```

## Level Progression System

| Level | Push-ups | Sit-ups | Squats | Miles | XP Required |
|-------|----------|---------|--------|-------|-------------|
| 1     | 10       | 10      | 10     | 0.5   | 0           |
| 2     | 15       | 15      | 15     | 0.75  | 100         |
| 3     | 20       | 20      | 20     | 1.0   | 300         |
| 4     | 30       | 30      | 30     | 1.5   | 600         |
| 5     | 40       | 40      | 40     | 2.0   | 1000        |
| 6     | 50       | 50      | 50     | 2.5   | 1500        |
| 7     | 65       | 65      | 65     | 3.0   | 2100        |
| 8     | 80       | 80      | 80     | 3.5   | 2800        |
| 9     | 90       | 90      | 90     | 4.0   | 3600        |
| 10    | 100      | 100     | 100    | 5.0   | 4500        |

## Key Features

### Streak System
- Track daily completion streaks
- Visual calendar showing progress
- Motivation to maintain consistency

### Penalty System
- Miss a day? Get 25% of missed exercises added to the next day
- Encourages consistency and accountability
- Can be disabled in settings

### Bonus Tasks
- **15 Different Bonus Tasks**: Randomly assigned based on streak length
- **Probability System**: Higher streak = more likely to get bonus tasks
- **Extra XP Rewards**: +10 XP for completing bonus tasks
- **Sample Tasks**: 
  - Send a family member a message saying you're thinking about them
  - Take 10 minutes to reflect on your health journey
  - Call a friend you haven't spoken to in a while
  - Write down 3 things you're grateful for
  - Meditate for 5 minutes
  - Take a 10-minute walk outside
  - And 9 more motivational challenges!

### Achievement System
- **10 Unique Achievements**: Unlock achievements for various milestones
- **Visual Achievement Gallery**: Beautiful UI showing locked and unlocked achievements
- **Achievement Categories**: 
  - **First Step**: Complete your first day of training
  - **Week Warrior**: Maintain a 7-day streak
  - **Month Master**: Achieve a 30-day streak
  - **Push-up Pro**: Complete 1,000 total push-ups
  - **Marathon Runner**: Run 100 total miles
  - **Level 5 Hero**: Reach level 5
  - **Solo Leveling Complete**: Reach the maximum level 10
  - **Consistency King**: Complete 50 total workout days
  - **Bonus Master**: Complete 20 bonus tasks
  - **Penalty Crusher**: Complete 10 penalty exercises

## API Endpoints

- `GET /api/daily-log` - Get today's workout data
- `PATCH /api/daily-log` - Update exercise progress
- `GET /api/streak` - Get streak calendar data
- `POST /api/streak` - Update streak status
- `GET /api/user` - Get user profile data
- `PATCH /api/user` - Update user settings
- `PATCH /api/penalties` - Update penalty completion status
- `PATCH /api/bonus-tasks` - Update bonus task completion status
- `POST /api/user/profile-picture` - Upload profile picture
- `DELETE /api/user/profile-picture` - Remove profile picture
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

## Project Structure

```
SoloFitness/
├── prisma/
│   └── schema.prisma          # Database schema with full relationships
├── public/
│   ├── icons/                 # PWA icons (48x48 to 512x512)
│   ├── custom-sw.js          # Custom service worker for notifications
│   ├── manifest.json          # PWA manifest
│   └── favicon.ico
├── src/
│   ├── app/                   # Next.js 14 app directory
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── bonus-tasks/   # Bonus task completion
│   │   │   ├── daily-log/     # Exercise tracking
│   │   │   ├── penalties/     # Penalty completion
│   │   │   ├── streak/        # Streak management
│   │   │   └── user/          # User profile and settings
│   │   ├── login/             # Login/register page
│   │   ├── profile/           # Profile and achievements page
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Main dashboard
│   │   └── globals.css        # Global styles and animations
│   ├── components/            # React components
│   │   ├── auth/
│   │   │   └── AuthForm.tsx   # Login/register form
│   │   ├── dashboard/         # Dashboard components (7 components)
│   │   │   ├── BonusTaskCard.tsx
│   │   │   ├── ExerciseCard.tsx
│   │   │   ├── LevelProgressBar.tsx
│   │   │   ├── PenaltyCard.tsx
│   │   │   ├── ProfileAvatar.tsx
│   │   │   ├── StreakCounter.tsx
│   │   │   └── XPDisplay.tsx
│   │   ├── providers/
│   │   │   └── SessionProvider.tsx
│   │   │   └── ServiceWorkerRegistration.tsx  # Custom service worker
│   │   └── ui/
│   │       ├── ParticleBackground.tsx
│   │       ├── ProfilePicture.tsx      # Profile picture component
│   │       └── NotificationSettings.tsx # Notification controls
│   ├── lib/                   # Business logic and utilities
│   │   ├── achievements.ts    # 10 achievements with type safety
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── bonus-tasks.ts    # 15 bonus tasks system
│   │   ├── level-system.ts   # XP and level calculations
│   │   ├── notifications.ts  # Push notification manager
│   │   └── prisma.ts         # Database client
│   └── types/                # TypeScript definitions
│       ├── index.ts          # Main app types
│       └── next-auth.d.ts    # NextAuth type extensions
├── docker-compose.yml         # Development environment
├── Dockerfile                # Production container
├── next.config.js            # Next.js + PWA configuration
├── tailwind.config.js        # Custom Solo Leveling theme
└── tsconfig.json             # TypeScript configuration
```

## Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Make sure PostgreSQL is running
docker compose up db -d

# Check if the database is accessible
docker compose exec db psql -U user -d solofitness
```

**Prisma Issues**
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
```

**PWA Not Installing**
- PWA features are disabled in development mode
- Build and serve the production version to test PWA:
```bash
npm run build
npm start
```

**TypeScript Errors**
```bash
# Check for type errors
npm run typecheck

# Clear Next.js cache
rm -rf .next
npm run dev
```

**Port Already in Use**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Development Tips

- **Hot Reload**: Changes to components auto-refresh the browser
- **Database Inspection**: Use `npx prisma studio` to view/edit data
- **API Testing**: All endpoints return JSON and support CORS
- **Mobile Testing**: Use Chrome DevTools device emulation
- **Performance**: Check Lighthouse scores for PWA compliance

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Production

```bash
# Build production image
docker build -t solofitness .

# Run with production database
docker compose -f docker-compose.prod.yml up
```

### Environment Variables for Production

```bash
NEXTAUTH_SECRET=your-super-secure-secret-key
NEXTAUTH_URL=https://your-domain.com
DATABASE_URL=your-production-database-url
```

## Security Features

### Built-in Security Headers
- `X-Frame-Options: DENY` - Prevents clickjacking attacks
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-XSS-Protection: 1; mode=block` - Enables XSS filtering
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Content-Security-Policy` - Restricts resource loading

### Authentication Security
- **Secure password hashing** with bcrypt (12 rounds)
- **JWT tokens** with secure cookie settings
- **HTTPS-only cookies** in production
- **Session management** with NextAuth.js
- **Case-insensitive usernames** to prevent conflicts

### Database Security
- **Input validation** on all API endpoints
- **Prisma ORM** with parameterized queries (SQL injection protection)
- **Rate limiting** on authentication endpoints
- **Environment variable secrets** (never hardcoded)

### Production Recommendations
```bash
# Use strong secrets (32+ characters)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Use HTTPS in production
NEXTAUTH_URL=https://your-domain.com

# Secure database connection
DATABASE_URL=postgresql://user:password@secure-host:5432/db?sslmode=require
```

### Deployment Platforms

**Vercel (Recommended)**
- Connect your GitHub repository
- Add environment variables in dashboard
- Automatic deployments on push

**Railway**
- One-click PostgreSQL provisioning
- Automatic Docker deployments
- Built-in domain and SSL

**DigitalOcean App Platform**
- Docker container support
- Managed database options
- Scalable infrastructure

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Inspiration

Inspired by the Solo Leveling manhwa/anime, this app brings the leveling system and progression mechanics to real-world fitness, encouraging users to become the strongest version of themselves.

*"The weakest hunter can become the strongest."* - Solo Leveling