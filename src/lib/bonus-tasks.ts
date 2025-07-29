export const BONUS_TASKS = [
  "Send a family member a message saying you're thinking about them",
  "Take 10 minutes to reflect on your health journey",
  "Schedule a doctor's appointment",
  "Call a friend you haven't spoken to in a while",
  "Write down 3 things you're grateful for",
  "Meditate for 5 minutes",
  "Drink an extra glass of water",
  "Take a 10-minute walk outside",
  "Read a chapter of a book",
  "Listen to a motivational podcast",
  "Stretch for 10 minutes",
  "Plan tomorrow's healthy meals",
  "Take a photo of something beautiful",
  "Compliment someone genuinely",
  "Practice deep breathing for 5 minutes"
];

export const getRandomBonusTask = (): string => {
  return BONUS_TASKS[Math.floor(Math.random() * BONUS_TASKS.length)];
};

export const shouldAssignBonusTask = (streak: number): boolean => {
  // Assign bonus tasks more frequently for longer streaks
  if (streak >= 7) return Math.random() < 0.7; // 70% chance
  if (streak >= 3) return Math.random() < 0.5; // 50% chance
  return Math.random() < 0.3; // 30% chance for new users
};