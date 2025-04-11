import { useState } from "react";
import { StreakDay } from "@/types/profile";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StreakCalendarProps {
  streakHistory: StreakDay[];
  onClose: () => void;
}

const StreakCalendar = ({ streakHistory, onClose }: StreakCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    return { daysInMonth, startingDay };
  };

  const getStreakForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return streakHistory.find(day => day.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Streak Calendar</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close calendar"
          >
            ✕
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={previousMonth}
            className="text-gray-400 hover:text-white p-2"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-white font-medium">{monthName}</span>
          <button
            onClick={nextMonth}
            className="text-gray-400 hover:text-white p-2"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-gray-400 text-sm py-2">
              {day}
            </div>
          ))}

          {Array.from({ length: startingDay }).map((_, index) => (
            <div key={`empty-${index}`} className="h-10" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const streak = getStreakForDate(date);
            const isToday = new Date().toDateString() === date.toDateString();

            return (
              <div
                key={day}
                className={`h-10 flex items-center justify-center rounded-full ${
                  streak?.completed
                    ? 'bg-[#00A8FF] text-white'
                    : streak
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-gray-800 text-gray-500'
                } ${isToday ? 'ring-2 ring-[#00A8FF]' : ''}`}
              >
                {day}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-[#00A8FF]" />
            <span className="text-gray-300 text-sm">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gray-700" />
            <span className="text-gray-300 text-sm">Missed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gray-800 ring-2 ring-[#00A8FF]" />
            <span className="text-gray-300 text-sm">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar; 