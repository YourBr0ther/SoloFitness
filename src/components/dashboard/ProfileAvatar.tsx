import ProfilePicture from '@/components/ui/ProfilePicture';
import { User } from 'lucide-react';

interface ProfileAvatarProps {
  username: string;
  level: number;
  profilePicture?: string | null;
}

export default function ProfileAvatar({ username, level, profilePicture }: ProfileAvatarProps) {
  const getAvatarColor = (level: number) => {
    if (level >= 8) return 'from-purple-500 to-pink-500';
    if (level >= 6) return 'from-yellow-500 to-orange-500';
    if (level >= 4) return 'from-green-500 to-blue-500';
    return 'from-blue-500 to-cyan-500';
  };

  const initials = username.substring(0, 2).toUpperCase();

  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        {profilePicture ? (
          <div className="relative">
            <ProfilePicture
              src={profilePicture}
              alt={username}
              size="md"
              className="shadow-lg animate-glow-pulse"
            />
            <div className="absolute -bottom-1 -right-1 bg-primary-600 text-white text-xs px-2 py-1 rounded-full border-2 border-background-dark">
              {level}
            </div>
          </div>
        ) : (
          <>
            <div 
              className={`
                w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(level)} 
                flex items-center justify-center text-white font-semibold text-lg
                shadow-lg animate-glow-pulse
              `}
            >
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary-600 text-white text-xs px-2 py-1 rounded-full border-2 border-background-dark">
              {level}
            </div>
          </>
        )}
      </div>
      <div>
        <div className="font-semibold text-white">{username}</div>
        <div className="text-sm text-gray-400">Level {level} Hunter</div>
      </div>
    </div>
  );
}