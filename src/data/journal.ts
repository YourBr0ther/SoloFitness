import { Exercise, PenaltyTask, BonusTask } from "@/types/journal";

export const EXERCISES: Exercise[] = [
  { id: "pushups", name: "Push-ups", count: 3, dailyGoal: 20, increment: 1, unit: "reps" },
  { id: "situps", name: "Sit-ups", count: 3, dailyGoal: 25, increment: 1, unit: "reps" },
  { id: "squats", name: "Squats", count: 3, dailyGoal: 30, increment: 1, unit: "reps" },
  { id: "running", name: "Running", count: 0, dailyGoal: 2, increment: 0.1, unit: "miles" },
];

export const MOCK_PENALTY: PenaltyTask = {
  exercise: "Push-ups",
  count: 5,
  unit: "reps"
};

export const MOCK_BONUS: BonusTask = {
  description: "Give someone a genuine compliment today",
  completed: false
}; 