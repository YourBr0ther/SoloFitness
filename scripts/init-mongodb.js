const { MongoClient } = require('mongodb');

async function initMongoDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/solofitness';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('solofitness');

    // Create collections and indexes
    await createCollections(db);
    await createIndexes(db);

    console.log('MongoDB schema initialized successfully');
  } catch (error) {
    console.error('Error initializing MongoDB schema:', error);
  } finally {
    await client.close();
  }
}

async function createCollections(db) {
  // User collection
  await db.createCollection('users', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['email', 'password', 'username', 'createdAt', 'updatedAt'],
        properties: {
          email: { bsonType: 'string' },
          password: { bsonType: 'string' },
          username: { bsonType: 'string' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // Profile collection
  await db.createCollection('profiles', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'level', 'xp', 'currentStreak', 'createdAt', 'updatedAt'],
        properties: {
          userId: { bsonType: 'objectId' },
          avatarUrl: { bsonType: 'string' },
          level: { bsonType: 'int' },
          xp: { bsonType: 'int' },
          currentStreak: { bsonType: 'int' },
          longestStreak: { bsonType: 'int' },
          exerciseCounts: { bsonType: 'object' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // StreakHistory collection
  await db.createCollection('streakHistory', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['profileId', 'date', 'completed', 'createdAt', 'updatedAt'],
        properties: {
          profileId: { bsonType: 'objectId' },
          date: { bsonType: 'string' },
          completed: { bsonType: 'bool' },
          xpEarned: { bsonType: 'int' },
          exercises: { bsonType: 'object' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // Badge collection
  await db.createCollection('badges', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['profileId', 'name', 'description', 'icon', 'unlocked', 'createdAt', 'updatedAt'],
        properties: {
          profileId: { bsonType: 'objectId' },
          name: { bsonType: 'string' },
          description: { bsonType: 'string' },
          icon: { bsonType: 'string' },
          unlocked: { bsonType: 'bool' },
          progress: { bsonType: 'int' },
          total: { bsonType: 'int' },
          isNew: { bsonType: 'bool' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // Exercise collection
  await db.createCollection('exercises', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'userId', 'createdAt', 'updatedAt'],
        properties: {
          name: { bsonType: 'string' },
          description: { bsonType: 'string' },
          muscleGroup: { bsonType: 'string' },
          equipment: { bsonType: 'string' },
          difficulty: { bsonType: 'string' },
          videoUrl: { bsonType: 'string' },
          imageUrl: { bsonType: 'string' },
          userId: { bsonType: 'objectId' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // Workout collection
  await db.createCollection('workouts', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'userId', 'createdAt', 'updatedAt'],
        properties: {
          name: { bsonType: 'string' },
          description: { bsonType: 'string' },
          userId: { bsonType: 'objectId' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // WorkoutExercise collection
  await db.createCollection('workoutExercises', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['workoutId', 'exerciseId', 'sets', 'reps', 'createdAt', 'updatedAt'],
        properties: {
          workoutId: { bsonType: 'objectId' },
          exerciseId: { bsonType: 'objectId' },
          sets: { bsonType: 'int' },
          reps: { bsonType: 'int' },
          weight: { bsonType: 'double' },
          duration: { bsonType: 'int' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });

  // UserSettings collection
  await db.createCollection('userSettings', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'createdAt', 'updatedAt'],
        properties: {
          userId: { bsonType: 'objectId' },
          enableNotifications: { bsonType: 'bool' },
          darkMode: { bsonType: 'bool' },
          language: { bsonType: 'string' },
          enablePenalties: { bsonType: 'bool' },
          enableBonuses: { bsonType: 'bool' },
          reminderTimes: { bsonType: 'array' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' }
        }
      }
    }
  });
}

async function createIndexes(db) {
  // Users indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ username: 1 }, { unique: true });

  // Profiles indexes
  await db.collection('profiles').createIndex({ userId: 1 }, { unique: true });

  // StreakHistory indexes
  await db.collection('streakHistory').createIndex({ profileId: 1, date: 1 }, { unique: true });

  // Badges indexes
  await db.collection('badges').createIndex({ profileId: 1, name: 1 }, { unique: true });

  // Exercises indexes
  await db.collection('exercises').createIndex({ userId: 1, name: 1 }, { unique: true });

  // Workouts indexes
  await db.collection('workouts').createIndex({ userId: 1, name: 1 }, { unique: true });

  // WorkoutExercises indexes
  await db.collection('workoutExercises').createIndex({ workoutId: 1, exerciseId: 1 }, { unique: true });

  // UserSettings indexes
  await db.collection('userSettings').createIndex({ userId: 1 }, { unique: true });
}

// Run the initialization
initMongoDB().catch(console.error); 