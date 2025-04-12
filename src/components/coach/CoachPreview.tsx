import { X, User } from "lucide-react";
import { CoachPreviewProps } from "@/types/coach";

export default function CoachPreview({ 
  coach, 
  onSelect, 
  onClose, 
  isSelected = false,
  showActions = true 
}: CoachPreviewProps) {
  const getPersonalityColor = (personality: string) => {
    switch (personality) {
      case 'motivational':
        return 'text-green-500';
      case 'technical':
        return 'text-blue-500';
      case 'tough':
        return 'text-red-500';
      default:
        return 'text-[#00A8FF]';
    }
  };

  return (
    <div className={`bg-gray-900 rounded-lg p-3 mb-3 ${isSelected ? 'border border-[#00A8FF]' : ''}`}>
      {/* Header */}
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-[#00A8FF]">
          <User size={16} className="text-[#00A8FF]" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-medium">{coach.name}</h3>
          <p className="text-gray-400 text-sm leading-snug">{coach.description}</p>
          <div className="mt-1">
            <span className={`text-xs font-medium ${getPersonalityColor(coach.personality)}`}>
              {coach.personality.charAt(0).toUpperCase() + coach.personality.slice(1)}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close preview"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-2 mt-3">
          <button
            onClick={onSelect}
            className="flex-1 bg-[#00A8FF] text-white py-1.5 px-3 rounded hover:bg-opacity-90 transition-colors text-sm"
          >
            Select Coach
          </button>
          <button
            className="flex-1 bg-gray-950 text-white py-1.5 px-3 rounded hover:bg-gray-900 transition-colors text-sm"
            disabled
          >
            View Profile
          </button>
        </div>
      )}
    </div>
  );
} 