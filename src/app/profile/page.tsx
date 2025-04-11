"use client";

import { useState } from "react";
import { Profile } from "@/types/profile";
import { MOCK_PROFILE } from "@/data/profile";
import { User, Bell, Flame, Trophy, Pencil, X, Check, Calendar, LogOut, Award } from "lucide-react";
import Image from "next/image";
import StreakCalendar from "@/components/profile/StreakCalendar";
import ProfileStats from "@/components/profile/ProfileStats";
import BadgesPopup from "@/components/profile/BadgesPopup";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(MOCK_PROFILE);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(profile.username);
  const [usernameError, setUsernameError] = useState("");
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBadges, setShowBadges] = useState(false);

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

  const handleUsernameSave = () => {
    const error = validateUsername(tempUsername);
    if (error) {
      setUsernameError(error);
      return;
    }
    setProfile({ ...profile, username: tempUsername });
    setIsEditingUsername(false);
    setUsernameError("");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleNotification = (id: string) => {
    setProfile({
      ...profile,
      notifications: profile.notifications.map(notification =>
        notification.id === id
          ? { ...notification, enabled: !notification.enabled }
          : notification
      ),
    });
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

  const saveTimeChange = () => {
    if (!editingTimeId) return;

    setProfile({
      ...profile,
      notifications: profile.notifications.map(notification =>
        notification.id === editingTimeId
          ? { ...notification, time: tempTime }
          : notification
      ),
    });
    setEditingTimeId(null);
  };

  const cancelTimeEdit = () => {
    setEditingTimeId(null);
    setTempTime("");
  };

  const togglePreference = (key: keyof Profile['preferences']) => {
    setProfile({
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: !profile.preferences[key],
      },
    });
  };

  const handleSignOut = () => {
    // TODO: Implement sign out logic
    console.log("Signing out...");
  };

  // Handle opening badges and marking them as viewed
  const handleOpenBadges = () => {
    setShowBadges(true);
    // Mark all badges as viewed
    if (hasNewBadges) {
      const updatedProfile = {
        ...profile,
        badges: profile.badges.map(badge => ({
          ...badge,
          isNew: false
        }))
      };
      setProfile(updatedProfile);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-4 text-[#00A8FF]">Profile</h1>

        {/* Profile Section */}
        <div className="bg-gray-900 rounded-lg p-6">
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
                      />
                      <button
                        onClick={handleUsernameSave}
                        className="bg-[#00A8FF] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!!usernameError}
                      >
                        Save
                      </button>
                    </div>
                    {usernameError && (
                      <p className="text-red-500 text-sm">{usernameError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-white">{profile.username}</h2>
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-2">Preferences</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Enable Penalties</span>
              <button
                onClick={() => togglePreference('enablePenalties')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  profile.preferences.enablePenalties ? 'bg-[#00A8FF]' : 'bg-gray-700'
                }`}
                aria-label={`${profile.preferences.enablePenalties ? 'Disable' : 'Enable'} penalties`}
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
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transform transition-transform ${
                    profile.preferences.enableBonuses ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <ProfileStats profile={profile} />

        {/* Notifications Section */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-[#00A8FF]" />
            Reminders
          </h3>
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
                <button
                  onClick={() => toggleNotification(notification.id)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    notification.enabled ? 'bg-[#00A8FF]' : 'bg-gray-700'
                  }`}
                  aria-label={`${notification.enabled ? 'Disable' : 'Enable'} reminder at ${formatTimeForDisplay(notification.time)}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white transform transition-transform ${
                      notification.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Streak History Section */}
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Flame className="w-5 h-5 mr-2 text-[#00A8FF]" />
              Streak History
            </h3>
            <button
              onClick={() => setShowCalendar(true)}
              className="text-gray-400 hover:text-white p-2"
              aria-label="View calendar"
            >
              <Calendar size={20} />
            </button>
          </div>
          <div className="space-y-2">
            {profile.streakHistory.map((day, index) => (
              <div
                key={day.date}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-800"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      day.completed ? 'bg-[#00A8FF]' : 'bg-gray-700'
                    }`}
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

        {/* Sign Out Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleSignOut}
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