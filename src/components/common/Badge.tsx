import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface BadgeProps {
  name: string;
  description: string;
  icon: string | LucideIcon;
  progress: number;
  total: number;
  unlocked: boolean;
  isNew?: boolean;
  onClick?: () => void;
}

export default function Badge({
  name,
  description,
  icon,
  progress,
  total,
  unlocked,
  isNew,
  onClick
}: BadgeProps) {
  // If icon is a string, try to get the corresponding Lucide icon
  const IconComponent = typeof icon === 'string' 
    ? (LucideIcons as unknown as { [key: string]: LucideIcon })[icon] 
    : icon;

  return (
    <div
      className={`
        relative cursor-pointer p-4 rounded-lg 
        ${unlocked ? 'bg-gray-800' : 'bg-gray-900'} 
        hover:bg-gray-700 transition-colors
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${unlocked ? 'bg-[#00A8FF]/20' : 'bg-gray-800'}`}>
          {IconComponent && (
            <IconComponent 
              className={`w-8 h-8 ${unlocked ? 'text-[#00A8FF]' : 'text-gray-400'}`} 
            />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">{name}</h3>
            {isNew && (
              <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                New
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-400 mt-1">{description}</p>
          
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Progress</span>
              <span className="text-gray-400">
                {progress} / {total}
              </span>
            </div>
            
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  unlocked ? 'bg-[#00A8FF]' : 'bg-gray-600'
                }`}
                style={{ width: `${(progress / total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {unlocked && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 rounded-full bg-[#00A8FF]" />
        </div>
      )}
    </div>
  );
}