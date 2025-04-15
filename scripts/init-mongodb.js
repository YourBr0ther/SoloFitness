const { MongoClient } = require('mongodb');

async function initMongoDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/solofitness';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('solofitness');

    // Drop existing collections
    console.log('Dropping existing collections...');
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`Dropped collection: ${collection.name}`);
    }

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
          avatarUrl: { bsonType: 'string' },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' },
          profile: {
            bsonType: 'object',
            properties: {
              level: { bsonType: 'int' },
              xp: { bsonType: 'int' },
              currentStreak: { bsonType: 'int' },
              longestStreak: { bsonType: 'int' },
              streakHistory: { bsonType: 'array' },
              exerciseCounts: { bsonType: 'object' }
            }
          },
          settings: {
            bsonType: 'object',
            properties: {
              enableNotifications: { bsonType: 'bool' },
              darkMode: { bsonType: 'bool' },
              language: { bsonType: 'string' },
              enablePenalties: { bsonType: 'bool' },
              enableBonuses: { bsonType: 'bool' },
              reminderTimes: { bsonType: 'array' },
              theme: { bsonType: 'string' },
              timezone: { bsonType: 'string' },
              units: {
                bsonType: 'object',
                properties: {
                  weight: { bsonType: 'string' },
                  distance: { bsonType: 'string' },
                  height: { bsonType: 'string' }
                }
              },
              privacy: {
                bsonType: 'object',
                properties: {
                  profile: { bsonType: 'string' },
                  activity: { bsonType: 'string' },
                  achievements: { bsonType: 'string' }
                }
              },
              notifications: {
                bsonType: 'object',
                properties: {
                  email: { bsonType: 'bool' },
                  push: { bsonType: 'bool' },
                  inApp: { bsonType: 'bool' }
                }
              },
              preferences: {
                bsonType: 'object',
                properties: {
                  showTutorial: { bsonType: 'bool' },
                  showTips: { bsonType: 'bool' },
                  showProgress: { bsonType: 'bool' },
                  showLeaderboard: { bsonType: 'bool' }
                }
              }
            }
          }
        }
      }
    }
  });

  // StreakHistory collection
  await db.createCollection('streakHistory', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'date', 'completed', 'createdAt', 'updatedAt'],
        properties: {
          userId: { bsonType: 'objectId' },
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
        required: ['userId', 'name', 'description', 'icon', 'unlocked', 'createdAt', 'updatedAt'],
        properties: {
          userId: { bsonType: 'objectId' },
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
}

async function createIndexes(db) {
  // Users indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ username: 1 }, { unique: true });

  // StreakHistory indexes
  await db.collection('streakHistory').createIndex({ userId: 1, date: 1 }, { unique: true });

  // Badges indexes
  await db.collection('badges').createIndex({ userId: 1, name: 1 }, { unique: true });

  // Exercises indexes
  await db.collection('exercises').createIndex({ userId: 1, name: 1 }, { unique: true });

  // Workouts indexes
  await db.collection('workouts').createIndex({ userId: 1, name: 1 }, { unique: true });

  // WorkoutExercises indexes
  await db.collection('workoutExercises').createIndex({ workoutId: 1, exerciseId: 1 }, { unique: true });
}

// Run the initialization
initMongoDB().catch(console.error); 