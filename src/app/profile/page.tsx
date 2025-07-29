'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { calculateUserAchievements } from '@/lib/achievements';
import ProfilePicture from '@/components/ui/ProfilePicture';
import NotificationSettings from '@/components/ui/NotificationSettings';

interface ProfileData {
  user: any;
  logs: any[];
  settings: any;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  unlocked: boolean;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfileData();
    }
  }, [status]);

  const fetchProfileData = async () => {
    try {
      const [userResponse, logsResponse] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/streak')
      ]);

      if (userResponse.ok && logsResponse.ok) {
        const userData = await userResponse.json();
        const logsData = await logsResponse.json();
        
        const profileData = {
          user: userData.user,
          settings: userData.settings,
          logs: logsData.logs,
        };

        setData(profileData);
        
        const userAchievements = calculateUserAchievements(userData.user, logsData.logs);
        setAchievements(userAchievements);
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (setting: string, value: boolean | string) => {
    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [setting]: value }),
      });

      if (response.ok) {
        fetchProfileData();
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const uploadProfilePicture = async (base64: string) => {
    try {
      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profilePicture: base64 }),
      });

      if (response.ok) {
        fetchProfileData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      throw error;
    }
  };

  const removeProfilePicture = async () => {
    try {
      const response = await fetch('/api/user/profile-picture', {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProfileData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove profile picture');
      }
    } catch (error) {
      console.error('Failed to remove profile picture:', error);
      throw error;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-primary-400 text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!data || !session) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-red-400 text-xl">Failed to load profile</div>
      </div>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  const totalWorkouts = data.logs.filter(log => log.completed).length;
  const totalXP = data.user.totalXP;
  const totalPushups = data.logs.reduce((sum, log) => sum + log.pushups, 0);
  const totalSitups = data.logs.reduce((sum, log) => sum + log.situps, 0);
  const totalSquats = data.logs.reduce((sum, log) => sum + log.squats, 0);
  const totalMiles = data.logs.reduce((sum, log) => sum + log.milesRan, 0);

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <header className="bg-primary-900/50 border-b border-primary-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-primary-400 hover:text-primary-300 transition-colors"
          >
            ← Back to Dashboard
          </Link>
          
          <h1 className="text-xl font-semibold text-white">Profile</h1>
          
          <button
            onClick={() => signOut()}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-primary-900/50 border border-primary-700 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <ProfilePicture
              src={data.user.profilePicture}
              alt={session.user.username}
              size="xl"
              editable={true}
              onUpload={uploadProfilePicture}
              onRemove={data.user.profilePicture ? removeProfilePicture : undefined}
            />
            <div>
              <h2 className="text-2xl font-bold text-white">{session.user.username}</h2>
              <p className="text-primary-400">Level {data.user.level} Hunter</p>
              <p className="text-gray-400 text-sm">{totalXP.toLocaleString()} Total XP</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-400">{totalWorkouts}</div>
            <div className="text-sm text-gray-300">Workouts</div>
          </div>
          <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-accent-cyan">{data.user.longestStreak}</div>
            <div className="text-sm text-gray-300">Best Streak</div>
          </div>
          <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{unlockedAchievements.length}</div>
            <div className="text-sm text-gray-300">Achievements</div>
          </div>
          <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{totalMiles.toFixed(1)}</div>
            <div className="text-sm text-gray-300">Miles Run</div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-primary-900/50 border border-primary-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Training Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{totalPushups.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Push-ups</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{totalSitups.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Sit-ups</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{totalSquats.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Squats</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{totalMiles.toFixed(1)}</div>
              <div className="text-sm text-gray-400">Miles</div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-primary-900/50 border border-primary-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
          <div className="space-y-6">
            {/* Game Settings */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-primary-400">Game Features</h4>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Penalty System</div>
                  <div className="text-sm text-gray-400">Add penalty exercises for missed days</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.settings?.penaltiesEnabled ?? true}
                    onChange={(e) => updateSettings('penaltiesEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-primary-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Bonus Tasks</div>
                  <div className="text-sm text-gray-400">Receive daily bonus challenges</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.settings?.bonusEnabled ?? true}
                    onChange={(e) => updateSettings('bonusEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-primary-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="border-t border-primary-700 pt-6">
              <h4 className="text-md font-medium text-primary-400 mb-4">Notifications</h4>
              <NotificationSettings 
                settings={data.settings || {}}
                onSettingsChange={updateSettings}
              />
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-primary-900/50 border border-primary-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Achievement Gallery ({unlockedAchievements.length}/{achievements.length})
          </h3>
          
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-green-400 mb-3">Unlocked</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-center"
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <div className="font-semibold text-green-400 text-sm mb-1">
                      {achievement.name}
                    </div>
                    <div className="text-xs text-gray-300 mb-2">
                      {achievement.description}
                    </div>
                    <div className="text-xs text-green-500">
                      ✓ {achievement.requirement}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-400 mb-3">Locked</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {lockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-primary-800/30 border border-primary-700 rounded-lg p-4 text-center opacity-60"
                  >
                    <div className="text-3xl mb-2 grayscale">{achievement.icon}</div>
                    <div className="font-semibold text-gray-400 text-sm mb-1">
                      {achievement.name}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {achievement.description}
                    </div>
                    <div className="text-xs text-gray-600">
                      {achievement.requirement}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}