"use client";

import { X } from "lucide-react";
import { GymBadge } from "@/types/profile";
import Badge from "@/components/common/Badge";

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
            <Badge
              key={badge.id}
              name={badge.name}
              description={badge.description}
              icon={badge.icon}
              progress={badge.progress}
              total={badge.total}
              unlocked={badge.unlocked}
              isNew={badge.isNew}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 