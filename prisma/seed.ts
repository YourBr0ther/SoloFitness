import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Achievement definitions
const achievements = [
  {
    key: 'first_workout',
    name: 'First Step',
    description: 'Complete your first workout',
    icon: '🎯',
    xpReward: 50,
  },
  {
    key: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    xpReward: 100,
  },
  {
    key: 'two_week_streak',
    name: 'Dedicated Hunter',
    description: 'Maintain a 14-day streak',
    icon: '⚔️',
    xpReward: 150,
  },
  {
    key: 'month_master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    xpReward: 300,
  },
  {
    key: 'pushup_centurion',
    name: 'Pushup Centurion',
    description: 'Complete 100 pushups in a single day',
    icon: '💪',
    xpReward: 200,
  },
  {
    key: 'situp_centurion',
    name: 'Situp Centurion',
    description: 'Complete 100 situps in a single day',
    icon: '🔄',
    xpReward: 200,
  },
  {
    key: 'squat_centurion',
    name: 'Squat Centurion',
    description: 'Complete 100 squats in a single day',
    icon: '🦵',
    xpReward: 200,
  },
  {
    key: 'marathon_runner',
    name: 'Marathon Runner',
    description: 'Run 10km in a single day',
    icon: '🏃',
    xpReward: 250,
  },
  {
    key: 'thousand_pushups',
    name: 'Thousand Pushups',
    description: 'Complete 1,000 lifetime pushups',
    icon: '🏆',
    xpReward: 300,
  },
  {
    key: 'five_thousand_pushups',
    name: 'Pushup Legend',
    description: 'Complete 5,000 lifetime pushups',
    icon: '🌟',
    xpReward: 500,
  },
  {
    key: 'hundred_km',
    name: 'Distance Runner',
    description: 'Run 100km lifetime',
    icon: '🗺️',
    xpReward: 400,
  },
  {
    key: 'perfect_day',
    name: 'Perfect Day',
    description: 'Complete 100% of all exercises in one day',
    icon: '✨',
    xpReward: 75,
  },
  {
    key: 'shadow_monarch',
    name: 'Shadow Monarch',
    description: 'Reach Level 10 (Day 365)',
    icon: '👤',
    xpReward: 1000,
  },
  {
    key: 'arise',
    name: 'Arise',
    description: 'Complete your first penalty workout',
    icon: '⬆️',
    xpReward: 50,
  },
];

async function main() {
  console.log('Starting seed...');

  // Seed achievements
  console.log('Seeding achievements...');
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }
  console.log(`Seeded ${achievements.length} achievements`);

  // Create default user if none exists
  const existingUser = await prisma.user.findFirst();
  if (!existingUser) {
    console.log('Creating default user...');
    const user = await prisma.user.create({
      data: {
        distanceUnit: 'km',
        startDate: new Date(),
        currentXP: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPushups: 0,
        totalSitups: 0,
        totalSquats: 0,
        totalRunningKm: 0,
        totalWorkouts: 0,
      },
    });
    console.log(`Created user with ID: ${user.id}`);
  } else {
    console.log('User already exists, skipping user creation');
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
