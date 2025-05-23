"use client";

import { useState, useEffect } from "react";
import { Profile, StreakDay, NotificationTime, GymBadge } from "@/types/profile";
import { MOCK_PROFILE } from "@/data/profile";
import { User, Bell, Flame, Trophy, Pencil, X, Check, Calendar, LogOut, Award, Plus, Trash2, Key } from "lucide-react";
import Image from "next/image";
import StreakCalendar from "@/components/profile/StreakCalendar";
import ProfileStats from "@/components/profile/ProfileStats";
import BadgesPopup from "@/components/profile/BadgesPopup";
import APIKeyPopup from "@/components/profile/APIKeyPopup";
import SignOutConfirmation from "@/components/profile/SignOutConfirmation";
import { useRouter } from "next/navigation";

// Default profile structure for initialization
const defaultProfile: Profile = {
  id: "",
  username: "",
  avatarUrl: "/default-avatar.svg",
  streakHistory: [],
  notifications: [],
  preferences: {
    enablePenalties: true,
    enableBonuses: true
  },
  badges: [],
  apiKey: ""
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showAPIKey, setShowAPIKey] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const router = useRouter();

  // Load profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized, redirect to login
            localStorage.removeItem('token');
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        
        // Transform API data to match our Profile type
        const transformedProfile: Profile = {
          id: data.id,
          username: data.username,
          avatarUrl: data.profile?.avatarUrl || "/default-avatar.svg",
          // Transform streak history
          streakHistory: data.profile?.streakHistory?.map((day: any) => ({
            id: day.id,
            date: day.date,
            completed: day.completed,
            xpEarned: day.xpEarned,
            exercises: day.exercises
          })) || [],
          // Create notification objects from reminderTimes array
          notifications: (data.settings?.reminderTimes || []).map((time: string, index: number) => ({
            id: `notification-${index}`,
            time,
            enabled: data.settings.enableNotifications
          })),
          // Transform preferences
          preferences: {
            enablePenalties: data.settings?.enablePenalties ?? true,
            enableBonuses: data.settings?.enableBonuses ?? true
          },
          // Transform badges
          badges: data.profile?.badges?.map((badge: any) => ({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            unlocked: badge.unlocked,
            progress: badge.progress,
            total: badge.total,
            isNew: badge.isNew
          })) || [],
          apiKey: "" // We don't store API keys on the server
        };

        setProfile(transformedProfile);
        setTempUsername(transformedProfile.username);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Save profile changes to the API
  const saveProfileChanges = async (updatedProfile: Partial<Profile>, updatedSettings?: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Transform Profile data to match API expectations
      const apiData: any = {};
      
      if (updatedProfile.username) {
        apiData.username = updatedProfile.username;
      }
      
      if (updatedProfile) {
        apiData.profile = {
          avatarUrl: updatedProfile.avatarUrl,
          // Include other profile fields if needed
        };
      }
      
      if (updatedSettings || updatedProfile.notifications || updatedProfile.preferences) {
        apiData.settings = {
          ...(updatedSettings || {}),
          enableNotifications: updatedProfile.notifications?.some(n => n.enabled) ?? true,
          reminderTimes: updatedProfile.notifications?.map(n => n.time) || [],
          enablePenalties: updatedProfile.preferences?.enablePenalties,
          enableBonuses: updatedProfile.preferences?.enableBonuses
        };
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update was successful, can process any additional logic here
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save changes. Please try again later.');
    }
  };

  // Get the last two weeks of dates
  const getLastTwoWeeks = () => {
    const dates = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Get streak history for the last two weeks
  const getTwoWeekStreakHistory = () => {
    const lastTwoWeeks = getLastTwoWeeks();
    return lastTwoWeeks.map(date => {
      const existingDay = profile.streakHistory.find(day => day.date === date);
      return existingDay || {
        date,
        completed: false,
        xpEarned: 0,
        exercises: {
          pushups: 0,
          situps: 0,
          squats: 0,
          milesRan: 0
        }
      };
    });
  };

  // Check if there are any new badges
  const hasNewBadges = profile.badges.some(badge => badge.isNew);

  const validateUsername = (username: string) => {
    if (username.length < 3) {
      return "Username must be at least 3 characters long";
    }
    if (username.includes(" ")) {
      return "Username cannot contain spaces";
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return "Username can only contain letters, numbers, underscores, and hyphens";
    }
    return "";
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setTempUsername(newUsername);
    setUsernameError(validateUsername(newUsername));
  };

  const handleUsernameSave = async () => {
    const error = validateUsername(tempUsername);
    if (error) {
      setUsernameError(error);
      return;
    }
    
    const updatedProfile = { ...profile, username: tempUsername };
    setProfile(updatedProfile);
    setIsEditingUsername(false);
    setUsernameError("");
    
    // Save to API
    await saveProfileChanges({ username: tempUsername });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const avatarUrl = reader.result as string;
        const updatedProfile = { ...profile, avatarUrl };
        setProfile(updatedProfile);
        
        // Save to API
        await saveProfileChanges({ avatarUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleNotification = async (id: string) => {
    const updatedNotifications = profile.notifications.map(notification =>
      notification.id === id
        ? { ...notification, enabled: !notification.enabled }
        : notification
    );
    
    const updatedProfile = {
      ...profile,
      notifications: updatedNotifications
    };
    
    setProfile(updatedProfile);
    
    // Save to API
    await saveProfileChanges({ notifications: updatedNotifications });
  };

  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimeForInput = (time: string) => {
    const [timePart, period] = time.split(' ');
    const [hours, minutes] = timePart.split(':');
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempTime(e.target.value);
  };

  const saveTimeChange = async () => {
    if (!editingTimeId) return;

    const updatedNotifications = profile.notifications.map(notification =>
      notification.id === editingTimeId
        ? { ...notification, time: tempTime }
        : notification
    );
    
    const updatedProfile = {
      ...profile,
      notifications: updatedNotifications
    };
    
    setProfile(updatedProfile);
    setEditingTimeId(null);
    
    // Save to API
    await saveProfileChanges({ notifications: updatedNotifications });
  };

  const cancelTimeEdit = () => {
    setEditingTimeId(null);
    setTempTime("");
  };

  const togglePreference = async (key: keyof Profile['preferences']) => {
    const updatedPreferences = {
      ...profile.preferences,
      [key]: !profile.preferences[key]
    };
    
    const updatedProfile = {
      ...profile,
      preferences: updatedPreferences
    };
    
    setProfile(updatedProfile);
    
    // Save to API
    await saveProfileChanges({ preferences: updatedPreferences });
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Add a function to handle opening the sign out confirmation dialog
  const handleOpenSignOutConfirm = () => {
    setShowSignOutConfirm(true);
  };

  // Add a function to handle canceling sign out
  const handleCancelSignOut = () => {
    setShowSignOutConfirm(false);
  };

  // Handle opening badges and marking them as viewed
  const handleOpenBadges = async () => {
    setShowBadges(true);
    
    // Mark all badges as viewed
    if (hasNewBadges) {
      const updatedBadges = profile.badges.map(badge => ({
        ...badge,
        isNew: false
      }));
      
      const updatedProfile = {
        ...profile,
        badges: updatedBadges
      };
      
      setProfile(updatedProfile);
      
      // Save badge updates to API
      for (const badge of updatedBadges.filter(b => b.isNew === false)) {
        await saveProfileChanges({}, { badge });
      }
    }
  };

  const handleSaveAPIKey = (newKey: string) => {
    setProfile({ ...profile, apiKey: newKey });
    // Don't save API key to server - it should only be stored locally
    localStorage.setItem('apiKey', newKey);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Loading profile...</p>
          <div className="w-12 h-12 rounded-full border-4 border-t-[#00A8FF] border-r-transparent border-b-transparent border-l-transparent animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-lg">
          <p className="text-xl mb-4 text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#00A8FF] text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-4 text-[#00A8FF]">Profile</h1>

        {/* Profile Section */}
        <section className="bg-gray-900 rounded-lg p-6">
          <h2 className="sr-only">User Profile</h2>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-[#00A8FF] overflow-hidden">
                  {profile.avatarUrl ? (
                    profile.avatarUrl.endsWith('.svg') ? (
                      <img
                        src={profile.avatarUrl}
                        alt="Profile"
                        className="w-full h-full"
                      />
                    ) : (
                      <Image
                        src={profile.avatarUrl}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <img
                      src="/default-avatar.svg"
                      alt="Default Profile"
                      className="w-full h-full"
                    />
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <span className="text-white text-sm">Change</span>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="flex-1">
                {isEditingUsername ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tempUsername}
                        onChange={handleUsernameChange}
                        className="bg-gray-800 text-white px-3 py-2 rounded-lg w-full"
                        placeholder="Enter username"
                        aria-label="Username input"
                      />
                      <button
                        onClick={handleUsernameSave}
                        className="bg-[#00A8FF] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!!usernameError}
                        aria-label="Save username"
                      >
                        Save
                      </button>
                    </div>
                    {usernameError && (
                      <p className="text-red-500 text-sm" role="alert">{usernameError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold text-white">{profile.username}</h3>
                    <button
                      onClick={() => setIsEditingUsername(true)}
                      className="text-gray-400 hover:text-white"
                      aria-label="Edit username"
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleOpenBadges}
              className={`relative text-gray-400 hover:text-[#00A8FF] transition-colors ${
                hasNewBadges ? 'text-yellow-400 hover:text-yellow-500' : ''
              }`}
              aria-label="View badges"
            >
              <Award className="w-6 h-6" />
              {hasNewBadges && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              )}
            </button>
          </div>

          {/* Preferences Section */}
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold text-white mb-2">Preferences</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Enable Penalties</span>
              <button
                onClick={() => togglePreference('enablePenalties')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  profile.preferences.enablePenalties ? 'bg-[#00A8FF]' : 'bg-gray-700'
                }`}
                aria-label={`${profile.preferences.enablePenalties ? 'Disable' : 'Enable'} penalties`}
                role="switch"
                aria-checked={profile.preferences.enablePenalties}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transform transition-transform ${
                    profile.preferences.enablePenalties ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Enable Bonuses</span>
              <button
                onClick={() => togglePreference('enableBonuses')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  profile.preferences.enableBonuses ? 'bg-[#00A8FF]' : 'bg-gray-700'
                }`}
                aria-label={`${profile.preferences.enableBonuses ? 'Disable' : 'Enable'} bonuses`}
                role="switch"
                aria-checked={profile.preferences.enableBonuses}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transform transition-transform ${
                    profile.preferences.enableBonuses ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gray-900 rounded-lg p-6">
          <ProfileStats profile={profile} />
        </section>

        {/* Notifications Section */}
        <section className="bg-gray-900 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Bell className="w-5 h-5 mr-2 text-[#00A8FF]" />
              Reminders
            </h2>
            <button
              onClick={() => {
                const newId = (profile.notifications.length + 1).toString();
                setProfile({
                  ...profile,
                  notifications: [
                    ...profile.notifications,
                    { id: newId, time: "09:00", enabled: true }
                  ]
                });
              }}
              className="text-[#00A8FF] hover:text-[#00A8FF]/80"
              aria-label="Add new reminder"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {profile.notifications.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between">
                {editingTimeId === notification.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={tempTime}
                      onChange={handleTimeChange}
                      className="bg-gray-800 text-white px-3 py-2 rounded-lg"
                      step="300"
                      aria-label="Time input"
                    />
                    <button
                      onClick={saveTimeChange}
                      className="text-green-500 hover:text-green-400"
                      aria-label="Save time"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={cancelTimeEdit}
                      className="text-red-500 hover:text-red-400"
                      aria-label="Cancel edit"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300">{formatTimeForDisplay(notification.time)}</span>
                    <button
                      onClick={() => {
                        setEditingTimeId(notification.id);
                        setTempTime(notification.time);
                      }}
                      className="text-gray-400 hover:text-white"
                      aria-label="Edit time"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setProfile({
                        ...profile,
                        notifications: profile.notifications.filter(n => n.id !== notification.id)
                      });
                    }}
                    className="text-red-500 hover:text-red-400"
                    aria-label="Delete reminder"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => toggleNotification(notification.id)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notification.enabled ? 'bg-[#00A8FF]' : 'bg-gray-700'
                    }`}
                    aria-label={`${notification.enabled ? 'Disable' : 'Enable'} reminder at ${formatTimeForDisplay(notification.time)}`}
                    role="switch"
                    aria-checked={notification.enabled}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-white transform transition-transform ${
                        notification.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Streak History Section */}
        <section className="bg-gray-900 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Flame className="w-5 h-5 mr-2 text-[#00A8FF]" />
                Streak History
              </h2>
              <p className="text-sm text-gray-400 mt-1">Last 14 days</p>
            </div>
            <button
              onClick={() => setShowCalendar(true)}
              className="text-gray-400 hover:text-white p-2"
              aria-label="View calendar"
            >
              <Calendar size={20} />
            </button>
          </div>
          <div className="relative">
            <div className="h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
              <div className="space-y-2">
                {getTwoWeekStreakHistory().map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-800"
                    role="listitem"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          day.completed ? 'bg-[#00A8FF]' : 'bg-gray-700'
                        }`}
                        aria-label={day.completed ? "Completed" : "Not completed"}
                      >
                        {day.completed ? (
                          <Trophy className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-gray-400">✕</span>
                        )}
                      </div>
                      <span className="text-gray-300">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <span className="text-gray-400">{day.xpEarned} XP</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
          </div>
        </section>

        {showCalendar && (
          <StreakCalendar
            streakHistory={profile.streakHistory}
            onClose={() => setShowCalendar(false)}
          />
        )}

        {showBadges && (
          <BadgesPopup
            badges={profile.badges}
            onClose={() => setShowBadges(false)}
          />
        )}

        {showAPIKey && (
          <APIKeyPopup
            apiKey={profile.apiKey}
            onSave={handleSaveAPIKey}
            onClose={() => setShowAPIKey(false)}
          />
        )}

        {showSignOutConfirm && (
          <SignOutConfirmation 
            onConfirm={handleSignOut} 
            onCancel={handleCancelSignOut} 
          />
        )}

        {/* Sign Out Button */}
        <div className="flex justify-center mt-8 space-x-4">
          <button
            onClick={() => setShowAPIKey(true)}
            className="flex items-center space-x-2 px-4 py-2 text-[#FFA500] border border-[#FFA500] rounded-lg transition-colors hover:bg-[#FFA500] hover:bg-opacity-10"
            aria-label="View API Key"
          >
            <Key className="w-5 h-5" />
            <span>API Key</span>
          </button>
          <button
            onClick={handleOpenSignOutConfirm}
            className="flex items-center space-x-2 px-4 py-2 text-red-500 border border-red-500 rounded-lg transition-colors hover:bg-red-500 hover:bg-opacity-10"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </main>
  );
} 