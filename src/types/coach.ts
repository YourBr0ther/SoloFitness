export interface Coach {
  id: string;
  name: string;
  description: string;
  avatar: string;
  personality: 'motivational' | 'technical' | 'tough' | 'balanced';
}

export interface CoachPreviewProps {
  coach: Coach;
  onSelect?: () => void;
  onClose?: () => void;
  isSelected?: boolean;
  showActions?: boolean;
} 