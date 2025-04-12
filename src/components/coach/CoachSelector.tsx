import { useState } from 'react';
import { Coach } from "@/types/coach";
import { COACHES } from "@/data/coaches";
import CoachPreview from './CoachPreview';

interface CoachSelectorProps {
  onSelectCoach: (coach: Coach) => void;
  isChangingCoach?: boolean;
  onClose?: () => void;
}

export default function CoachSelector({ onSelectCoach, isChangingCoach, onClose }: CoachSelectorProps) {
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(COACHES[0]);

  const handleSelectCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    onSelectCoach(coach);
    if (onClose) onClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#00A8FF]">Select Your Coach</h2>
        {isChangingCoach && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Selected Coach Preview */}
      {selectedCoach && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Selected Coach</h3>
          <CoachPreview 
            coach={selectedCoach} 
            isSelected={true}
            showActions={false}
          />
        </div>
      )}

      {/* Available Coaches */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-400">Available Coaches</h3>
        <div className="grid grid-cols-1 gap-4">
          {COACHES.map((coach) => (
            <CoachPreview
              key={coach.id}
              coach={coach}
              onSelect={() => handleSelectCoach(coach)}
              isSelected={selectedCoach?.id === coach.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 