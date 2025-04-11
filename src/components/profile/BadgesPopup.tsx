"use client";

import { X } from "lucide-react";
import { GymBadge } from "@/types/profile";

interface BadgesPopupProps {
  badges: GymBadge[];
  onClose: () => void;
}

export default function BadgesPopup({ badges, onClose }: BadgesPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md animate-scale-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Gym Badges</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close badges"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border ${
                badge.unlocked
                  ? "border-[#00A8FF] bg-[#00A8FF] bg-opacity-10"
                  : "border-gray-700 bg-gray-800"
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{badge.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{badge.name}</h3>
                  <p className="text-gray-400 text-sm">{badge.description}</p>
                  {!badge.unlocked && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-[#00A8FF] h-2 rounded-full"
                          style={{
                            width: `${(badge.progress / badge.total) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-gray-400 text-xs mt-1">
                        {badge.progress} / {badge.total}
                      </p>
                    </div>
                  )}
                </div>
                {badge.unlocked && (
                  <div className="text-[#00A8FF]">Unlocked!</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 