import type { ComponentType } from 'react';

export type MediaType = 'image' | 'video' | 'gif' | null;
export type PostStatus = 'draft' | 'planned' | 'posted';
export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface Post {
  id: string;
  content: string;
  category: string;
  media: MediaType;
  status: PostStatus;
  plannedWeekId: string | null;
  plannedDay: Day | null;
  plannedSlot: number | null;
}

export interface Week {
  id: string;
  name: string;
}

export interface Topic {
  name: string;
  iconName: string;
  colorName: string;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  media: MediaType;
}

export interface ColorPreset {
  name: string;
  text: string;
  bg: string;
  border: string;
  fill: string;
  hex: string;
}

export interface TopicConfig {
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  border: string;
  fill: string;
}
