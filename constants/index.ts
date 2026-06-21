import { 
  Quote, Zap, BarChart2, Cpu, Globe, Shield, 
  MessageSquare, Flame, Award, Hash 
} from 'lucide-react-native';
import { ColorPreset, Day } from '../types';

export const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const SLOTS_PER_DAY = 5;
export const MAX_POST_LENGTH = 280;

export const COLOR_OPTIONS: ColorPreset[] = [
  { name: 'Stone', text: '#a1a1aa', bg: 'rgba(163,163,172,0.1)', border: 'rgba(163,163,172,0.2)', fill: '#71717a', hex: '#71717a' },
  { name: 'Amber', text: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', fill: '#f59e0b', hex: '#f59e0b' },
  { name: 'Emerald', text: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', fill: '#34d399', hex: '#34d399' },
  { name: 'Purple', text: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.2)', fill: '#c084fc', hex: '#c084fc' },
  { name: 'Pink', text: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.2)', fill: '#f472b6', hex: '#f472b6' },
  { name: 'Red', text: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', fill: '#ef4444', hex: '#ef4444' },
  { name: 'Blue', text: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)', fill: '#60a5fa', hex: '#60a5fa' },
  { name: 'Cyan', text: '#67e8f9', bg: 'rgba(103,232,249,0.1)', border: 'rgba(103,232,249,0.2)', fill: '#67e8f9', hex: '#67e8f9' }
];

export const ICON_MAP: Record<string, any> = {
  Quote,
  Zap,
  BarChart2,
  Cpu,
  Globe,
  Shield,
  MessageSquare,
  Flame,
  Award,
  Hash
};

export const DEFAULT_TOPICS = [
  { name: 'Stoicism', iconName: 'Quote', colorName: 'Stone' },
  { name: 'Hard Work', iconName: 'Zap', colorName: 'Amber' },
  { name: 'Market Moves', iconName: 'BarChart2', colorName: 'Emerald' },
  { name: 'Crypto Plays', iconName: 'Cpu', colorName: 'Purple' },
  { name: 'Political Satire', iconName: 'Globe', colorName: 'Pink' },
  { name: 'War/Macro', iconName: 'Shield', colorName: 'Red' }
];

export const DEFAULT_WEEKS = [
  { id: 'week-1', name: 'Week 1' },
  { id: 'week-2', name: 'Week 2' },
  { id: 'week-3', name: 'Week 3' }
];

export const INITIAL_POSTS = [
  { 
    id: '1', 
    content: '"You have power over your mind - not outside events." Applying this to today\'s red market. Stay rational when they panic.', 
    category: 'Stoicism', 
    media: 'image' as const, 
    status: 'draft' as const, 
    plannedWeekId: null, 
    plannedDay: null, 
    plannedSlot: null 
  },
  { 
    id: '2', 
    content: 'Volume is shifting fast on this new layer-1 launch. Watch these three wallet clusters... 🧠', 
    category: 'Crypto Plays', 
    media: 'video' as const, 
    status: 'draft' as const, 
    plannedWeekId: null, 
    plannedDay: null, 
    plannedSlot: null 
  },
  { 
    id: '3', 
    content: 'If you want to build, you have to embrace the dirt. Stop waiting for the perfect setup. Get to work.', 
    category: 'Hard Work', 
    media: null, 
    status: 'planned' as const, 
    plannedWeekId: 'week-1', 
    plannedDay: 'Monday' as Day, 
    plannedSlot: 1 
  },
  { 
    id: '4', 
    content: 'The Fed\'s latest move is essentially a band-aid on a bullet wound. Here is what happens next for risk assets.', 
    category: 'Market Moves', 
    media: 'image' as const, 
    status: 'planned' as const, 
    plannedWeekId: 'week-1', 
    plannedDay: 'Monday' as Day, 
    plannedSlot: 2 
  },
  { 
    id: '5', 
    content: 'Local politician promises to fix potholes, falls into one during press conference. You really can\'t make this stuff up.', 
    category: 'Political Satire', 
    media: 'gif' as const, 
    status: 'draft' as const, 
    plannedWeekId: null, 
    plannedDay: null, 
    plannedSlot: null 
  }
];

export const THEME = {
  bg: '#0a0a0a',
  card: '#171717',
  cardAlt: '#111111',
  border: '#262626',
  text: '#e5e5e5',
  textMuted: '#a3a3a3',
  accent: '#f59e0b',
  accentDark: '#d97706',
  success: '#34d399',
  danger: '#ef4444',
  neutral: '#525252'
};