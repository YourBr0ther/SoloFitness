import { X, User, Coffee, Music, Book, Gamepad, Pizza } from "lucide-react";
import { Coach } from "@/types/coach";

interface CoachProfileProps {
  coach: Coach;
  onClose: () => void;
}

export default function CoachProfile({ coach, onClose }: CoachProfileProps) {
  // Random fun facts about the coach
  const funFacts = [
    { icon: Coffee, label: "Favorite drink", value: "Triple shot espresso" },
    { icon: Music, label: "Favorite song", value: "Eye of the Tiger" },
    { icon: Book, label: "Currently reading", value: "The Art of Doing Nothing" },
    { icon: Gamepad, label: "Favorite game", value: "Just Dance 2024" },
    { icon: Pizza, label: "Comfort food", value: "Pineapple Pizza" }
  ];

  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border border-[#00A8FF]">
              <User size={24} className="text-[#00A8FF]" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white">{coach.name}</h2>
              <p className="text-gray-400 text-sm">{coach.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-4 space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-[#00A8FF] font-medium mb-3">Random Facts</h3>
            <div className="space-y-3">
              {funFacts.map((fact, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <fact.icon size={16} className="text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-sm">{fact.label}</p>
                    <p className="text-white text-sm">{fact.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full bg-gray-800 text-white py-2 rounded text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 