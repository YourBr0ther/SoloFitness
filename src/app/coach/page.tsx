"use client";

import { useState } from 'react';
import CoachSelector from '@/components/coach/CoachSelector';
import ChatInterface from '@/components/coach/ChatInterface';

export default function CoachPage() {
  const [selectedCoach, setSelectedCoach] = useState<{
    id: string;
    name: string;
    description: string;
    avatar: string;
  }>({
    id: '1',
    name: 'Coach Alex',
    description: 'Motivational and encouraging coach',
    avatar: '/coaches/alex.png'
  });
  const [isChangingCoach, setIsChangingCoach] = useState(false);

  return (
    <main className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-[#00A8FF]">Coach</h1>
        <button
          onClick={() => setIsChangingCoach(true)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Coaches
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {isChangingCoach ? (
          <div className="p-4">
            <CoachSelector 
              onSelectCoach={setSelectedCoach} 
              isChangingCoach={true}
              onClose={() => setIsChangingCoach(false)}
            />
          </div>
        ) : (
          <ChatInterface 
            selectedCoach={selectedCoach} 
            onRequestChangeCoach={() => setIsChangingCoach(true)}
          />
        )}
      </div>
    </main>
  );
} 