import { X, User, Coffee, Music, Book, Gamepad, Pizza, Target, Trophy, Clock, Flame, Award, Star, Heart } from "lucide-react";
import { Coach } from "@/types/coach";

interface CoachProfileProps {
  coach: Coach;
  onClose: () => void;
}

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

const getPersonalityDescription = (personality: string) => {
  switch (personality) {
    case 'motivational':
      return 'Focuses on encouragement and positive reinforcement';
    case 'technical':
      return 'Emphasizes proper form and scientific approaches';
    case 'tough':
      return 'Pushes you to your limits with challenging workouts';
    default:
      return 'Balances motivation with technical guidance';
  }
};

const getSpecialties = (personality: string) => {
  switch (personality) {
    case 'motivational':
      return ['Mindset Training', 'Goal Setting', 'Positive Psychology'];
    case 'technical':
      return ['Form Correction', 'Injury Prevention', 'Biomechanics'];
    case 'tough':
      return ['High-Intensity Training', 'Endurance Building', 'Strength Focus'];
    default:
      return ['Balanced Training', 'Progressive Overload', 'Recovery Management'];
  }
};

const getSuccessStories = (personality: string) => {
  switch (personality) {
    case 'motivational':
      return [
        'Helped 50+ clients overcome mental barriers',
        'Achieved 95% client retention rate',
        'Created 100+ personalized workout plans'
      ];
    case 'technical':
      return [
        'Reduced client injuries by 80%',
        'Improved form accuracy by 90%',
        'Developed 200+ technique guides'
      ];
    case 'tough':
      return [
        'Trained 30+ athletes to competition level',
        'Achieved 100% client strength gains',
        'Set 50+ personal records'
      ];
    default:
      return [
        'Maintained 85% client satisfaction rate',
        'Balanced 100+ training programs',
        'Achieved consistent client progress'
      ];
  }
};

export default function CoachProfile({ coach, onClose }: CoachProfileProps) {
  const specialties = getSpecialties(coach.personality);
  const successStories = getSuccessStories(coach.personality);
  const personalityColor = getPersonalityColor(coach.personality);
  const personalityDescription = getPersonalityDescription(coach.personality);

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
      <div className="bg-gray-900 rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-start sticky top-0 bg-gray-900 z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border border-[#00A8FF]">
              <User size={24} className="text-[#00A8FF]" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white">{coach.name}</h2>
              <p className="text-gray-400 text-sm">{coach.description}</p>
              <div className="mt-1">
                <span className={`text-xs font-medium ${personalityColor}`}>
                  {coach.personality.charAt(0).toUpperCase() + coach.personality.slice(1)}
                </span>
                <span className="text-xs text-gray-400 ml-2">{personalityDescription}</span>
              </div>
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
        <div className="p-4 space-y-6">
          {/* Specialties */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-[#00A8FF] font-medium mb-3 flex items-center">
              <Target size={16} className="mr-2" />
              Training Specialties
            </h3>
            <div className="space-y-2">
              {specialties.map((specialty, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Star size={16} className="text-gray-400" />
                  <span className="text-white text-sm">{specialty}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Success Stories */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-[#00A8FF] font-medium mb-3 flex items-center">
              <Trophy size={16} className="mr-2" />
              Success Stories
            </h3>
            <div className="space-y-2">
              {successStories.map((story, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Award size={16} className="text-gray-400" />
                  <span className="text-white text-sm">{story}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Training Style */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-[#00A8FF] font-medium mb-3 flex items-center">
              <Flame size={16} className="mr-2" />
              Training Style
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-gray-400" />
                <span className="text-white text-sm">
                  {coach.personality === 'tough' ? 'Intense, high-volume workouts' :
                   coach.personality === 'technical' ? 'Detailed, form-focused sessions' :
                   coach.personality === 'motivational' ? 'Encouraging, progressive training' :
                   'Balanced, adaptable approach'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart size={16} className="text-gray-400" />
                <span className="text-white text-sm">
                  {coach.personality === 'tough' ? 'Focus on pushing limits' :
                   coach.personality === 'technical' ? 'Emphasis on proper technique' :
                   coach.personality === 'motivational' ? 'Building confidence and consistency' :
                   'Maintaining balance and progress'}
                </span>
              </div>
            </div>
          </div>

          {/* Fun Facts */}
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
        <div className="p-4 border-t border-gray-800 sticky bottom-0 bg-gray-900">
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