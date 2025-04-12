export type FriendStatus = 
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'blocked';

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: FriendStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendActivity {
  id: string;
  userId: string;
  type: 'exercise' | 'achievement' | 'level_up' | 'streak';
  data: Record<string, any>;
  createdAt: Date;
}

export interface SocialStats {
  totalFriends: number;
  pendingRequests: number;
  recentActivity: FriendActivity[];
  mutualFriends?: number;
}

export interface SocialFilters {
  status?: FriendStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export type SocialInteractionType = 
  | 'follow'
  | 'unfollow'
  | 'like'
  | 'comment'
  | 'share'
  | 'mention';

export type PrivacyLevel = 
  | 'public'
  | 'friends'
  | 'private';

export interface SocialProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  followers: number;
  following: number;
  posts: number;
  privacyLevel: PrivacyLevel;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialPost {
  id: string;
  userId: string;
  content: string;
  mediaUrls?: string[];
  likes: number;
  comments: number;
  shares: number;
  privacyLevel: PrivacyLevel;
  tags?: string[];
  location?: {
    name: string;
    coordinates?: [number, number];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likes: number;
  replies: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialInteraction {
  id: string;
  type: SocialInteractionType;
  userId: string;
  targetId: string;
  targetType: 'user' | 'post' | 'comment';
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface SocialUpdate {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  privacyLevel?: PrivacyLevel;
}

export interface SocialFilters {
  privacyLevel?: PrivacyLevel;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
  location?: string;
}

export interface SocialStats {
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  engagementRate: number;
  averageLikes: number;
  averageComments: number;
} 