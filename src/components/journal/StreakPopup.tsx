import { Flame } from "lucide-react";

interface StreakPopupProps {
  streakCount: number;
  onClose: () => void;
}

const StreakPopup = ({ streakCount, onClose }: StreakPopupProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div 
        className="bg-black/90 backdrop-blur-sm rounded-lg p-8 max-w-md w-full mx-4 text-center animate-scale-in"
        onClick={onClose}
      >
        <div className="mb-4">
          <Flame className="w-16 h-16 text-[#00A8FF] mx-auto animate-pulse-slow" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 animate-fade-in">Streak Achieved!</h2>
        <p className="text-gray-400 mb-4 animate-fade-in">
          You've maintained your streak for {streakCount} days!
        </p>
        <div className="flex justify-center space-x-2">
          {Array.from({ length: streakCount }).map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-[#00A8FF] animate-bounce"
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StreakPopup; 