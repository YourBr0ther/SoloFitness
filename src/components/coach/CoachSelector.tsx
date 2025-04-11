import { useState } from 'react';

interface Coach {
  id: string;
  name: string;
  description: string;
  avatar: string;
}

const COACHES: Coach[] = [
  {
    id: '1',
    name: 'Coach Alex',
    description: 'Motivational and encouraging coach',
    avatar: '/coaches/alex.png'
  },
  {
    id: '2',
    name: 'Coach Sarah',
    description: 'Technical and precise coach',
    avatar: '/coaches/sarah.png'
  },
  {
    id: '3',
    name: 'Coach Mike',
    description: 'Tough love and results-driven coach',
    avatar: '/coaches/mike.png'
  }
];

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
    <div className="space-y-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COACHES.map((coach) => (
          <button
            key={coach.id}
            onClick={() => handleSelectCoach(coach)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedCoach?.id === coach.id
                ? 'border-[#00A8FF] bg-gray-800'
                : 'border-gray-700 hover:border-[#00A8FF]'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="font-medium">{coach.name}</h3>
              <p className="text-sm text-gray-400 text-center">{coach.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 