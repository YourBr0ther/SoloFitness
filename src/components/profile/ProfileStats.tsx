import { Trophy, Flame, Dumbbell } from "lucide-react";
import { Profile } from "@/types/profile";

interface ProfileStatsProps {
  profile: Profile;
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
  // Calculate total XP
  const totalXP = profile?.streakHistory?.reduce((sum, day) => sum + day.xpEarned, 0) || 0;

  // Calculate longest streak
  const calculateLongestStreak = () => {
    let currentStreak = 0;
    let longestStreak = 0;
    
    profile?.streakHistory?.forEach(day => {
      if (day.completed) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    return longestStreak;
  };

  // Calculate total for each exercise type
  const exerciseTotals = profile?.streakHistory?.reduce((totals, day) => {
    if (day.completed) {
      totals.pushups += day.exercises?.pushups || 0;
      totals.situps += day.exercises?.situps || 0;
      totals.squats += day.exercises?.squats || 0;
      totals.milesRan += day.exercises?.milesRan || 0;
    }
    return totals;
  }, { pushups: 0, situps: 0, squats: 0, milesRan: 0 }) || { pushups: 0, situps: 0, squats: 0, milesRan: 0 };

  return (
    <>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Dumbbell className="w-5 h-5 mr-2 text-[#00A8FF]" />
        Statistics
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Total XP Card */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Total XP</span>
            <Trophy className="w-5 h-5 text-[#00A8FF]" />
          </div>
          <div className="text-2xl font-bold text-white">{totalXP}</div>
        </div>

        {/* Longest Streak Card */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Longest Streak</span>
            <Flame className="w-5 h-5 text-[#00A8FF]" />
          </div>
          <div className="text-2xl font-bold text-white">{calculateLongestStreak()} days</div>
        </div>
      </div>

      {/* Exercise Breakdown */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-400">Exercise Breakdown</span>
          <Dumbbell className="w-5 h-5 text-[#00A8FF]" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-gray-400 mb-1">Push-ups</div>
            <div className="text-xl font-bold text-white">{exerciseTotals.pushups}</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-gray-400 mb-1">Sit-ups</div>
            <div className="text-xl font-bold text-white">{exerciseTotals.situps}</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-gray-400 mb-1">Squats</div>
            <div className="text-xl font-bold text-white">{exerciseTotals.squats}</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-gray-400 mb-1">Miles Ran</div>
            <div className="text-xl font-bold text-white">{exerciseTotals.milesRan.toFixed(1)}</div>
          </div>
        </div>
      </section>
    </>
  );
} 