/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface Channel {
  id: string;
  name: string;
  handle: string;
  avatar: string; // URL or Emoji
  banner: string; // Gradient class or URL
  subscribers: number;
  description: string;
  verified: boolean;
  isUser: boolean;
  createdAt: string;
  country?: string;
  language?: string;
  ageRating?: string;
  appearanceTags?: string[];
  activityTags?: string[];
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  channelId: string;
  views: number;
  likes: number;
  dislikes: number;
  uploadDate: string;
  duration: string;
  category: string;
  comments: Comment[];
}

export interface Short {
  id: string;
  title: string;
  videoUrl: string;
  channelId: string;
  likes: number;
  commentsCount: number;
  shares: number;
  views: number;
  comments: Comment[];
}

export interface LiveStream {
  id: string;
  title: string;
  channelId: string;
  viewerCount: number;
  category: string;
  isLive: boolean;
  videoUrl: string;
  thumbnailUrl: string;
  isUserStream?: boolean;
}

export interface ChatMessage {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  color?: string;
  isModerator?: boolean;
  isCreator?: boolean;
}
