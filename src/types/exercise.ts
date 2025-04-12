export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroup: string;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
} 