import { Flame, Trophy, User as UserIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface HeaderSectionProps {
  streakCount: number;
  dailyXP: number;
  profile: {
    username: string;
    profile?: {
      avatarUrl: string;
    };
  } | null;
}

const HeaderSection = ({ streakCount, dailyXP, profile }: HeaderSectionProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* Streak Counter */}
      <div className="flex flex-col items-center">
        <div className="bg-gray-900 rounded-lg p-3 mb-1">
          <Flame className="text-[#00A8FF] w-6 h-6" />
        </div>
        <span className="text-white font-bold">{streakCount}</span>
        <span className="text-xs text-gray-400">STREAK</span>
      </div>

      {/* Player Icon */}
      <Link href="/profile" className="relative group">
        <div className="w-20 h-20 rounded-full bg-gray-900 border-2 border-[#00A8FF] flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-hover:border-opacity-80 overflow-hidden">
          {profile?.profile?.avatarUrl ? (
            <Image
              src={profile.profile.avatarUrl}
              alt={profile.username || 'Profile'}
              width={80}
              height={80}
              className="object-cover"
            />
          ) : (
            <UserIcon className="text-[#00A8FF] w-10 h-10 transition-opacity duration-200 group-hover:opacity-80" />
          )}
        </div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
          <span className="text-xs text-gray-400 whitespace-nowrap">{profile?.username || 'SOLO WARRIOR'}</span>
        </div>
      </Link>

      {/* Daily XP */}
      <div className="flex flex-col items-center">
        <div className="bg-gray-900 rounded-lg p-3 mb-1">
          <Trophy className="text-[#00A8FF] w-6 h-6" />
        </div>
        <span className="text-white font-bold">{dailyXP}</span>
        <span className="text-xs text-gray-400">TODAY'S XP</span>
      </div>
    </div>
  );
};

export default HeaderSection; 