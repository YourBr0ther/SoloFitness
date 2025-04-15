import { MongoClient } from 'mongodb';

async function updateUserStructure() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/solofitness';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();

    // Move username and avatarUrl from profile to root level
    const result = await db.collection('users').updateMany(
      { profile: { $exists: true } },
      [
        {
          $set: {
            username: { $ifNull: ['$profile.username', 'SOLO WARRIOR'] },
            avatarUrl: { $ifNull: ['$profile.avatarUrl', '/default-avatar.svg'] }
          }
        },
        {
          $unset: ['profile.username', 'profile.avatarUrl']
        }
      ]
    );

    console.log(`Updated ${result.modifiedCount} documents`);
  } catch (error) {
    console.error('Error updating user structure:', error);
  } finally {
    await client.close();
  }
}

updateUserStructure().catch(console.error); 