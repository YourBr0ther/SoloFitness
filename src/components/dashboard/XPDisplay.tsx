interface XPDisplayProps {
  todayXP: number;
  totalXP: number;
}

export default function XPDisplay({ todayXP, totalXP }: XPDisplayProps) {
  return (
    <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-accent-cyan mb-1">
          +{todayXP} XP
        </div>
        <div className="text-sm text-gray-300">Today's Progress</div>
        <div className="text-xs text-gray-400 mt-1">
          Total: {totalXP.toLocaleString()} XP
        </div>
      </div>
    </div>
  );
}