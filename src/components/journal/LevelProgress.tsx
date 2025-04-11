interface LevelProgressProps {
  currentLevel: number;
  currentXP: number;
  maxXP: number;
}

const LevelProgress = ({ currentLevel, currentXP, maxXP }: LevelProgressProps) => {
  const progressPercentage = (currentXP / maxXP) * 100;

  return (
    <div className="bg-gray-900 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-[#00A8FF]">Level {currentLevel}</h2>
        <span className="text-gray-400">{currentXP}/{maxXP} XP</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-4">
        <div
          className="bg-[#00A8FF] h-4 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default LevelProgress; 