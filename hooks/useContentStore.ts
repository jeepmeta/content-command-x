import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hash } from 'lucide-react-native';
import { Post, Week, Topic, Day } from '../types';
import { 
  DAYS, SLOTS_PER_DAY, DEFAULT_TOPICS, DEFAULT_WEEKS, INITIAL_POSTS, ICON_MAP, COLOR_OPTIONS 
} from '../constants';

const STORAGE_KEY = '@content_command_x_v1';

interface ContentState {
  weeks: Week[];
  topics: Topic[];
  posts: Post[];
  selectedWeekId: string;
  activeTab: 'planner' | 'stockpile' | 'settings';
  filter: 'All' | string;
}

const initialState: ContentState = {
  weeks: DEFAULT_WEEKS,
  topics: DEFAULT_TOPICS,
  posts: INITIAL_POSTS,
  selectedWeekId: 'week-1',
  activeTab: 'planner',
  filter: 'All',
};

export function useContentStore() {
  const [state, setState] = useState<ContentState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFromStorage = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Partial<ContentState> = JSON.parse(stored);
        setState(prev => ({
          ...prev,
          weeks: parsed.weeks && parsed.weeks.length > 0 ? parsed.weeks : DEFAULT_WEEKS,
          topics: parsed.topics && parsed.topics.length > 0 ? parsed.topics : DEFAULT_TOPICS,
          posts: parsed.posts && parsed.posts.length > 0 ? parsed.posts : INITIAL_POSTS,
          selectedWeekId: parsed.selectedWeekId || 'week-1',
          activeTab: parsed.activeTab || 'planner',
          filter: parsed.filter || 'All',
        }));
      }
    } catch (e) {
      console.warn('Failed to load from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveToStorage = useCallback(async (newState: ContentState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.warn('Failed to save to storage', e);
    }
  }, []);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleSave = useCallback((newState: ContentState) => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = setTimeout(() => {
      saveToStorage(newState);
    }, 250);
  }, [saveToStorage]);

  useEffect(() => {
    if (isLoaded) {
      scheduleSave(state);
    }
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [state, isLoaded, scheduleSave]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const setActiveTab = (tab: ContentState['activeTab']) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  };

  const setSelectedWeekId = (weekId: string) => {
    setState(prev => ({ ...prev, selectedWeekId: weekId, activeTab: 'planner' }));
  };

  const setFilter = (filter: ContentState['filter']) => {
    setState(prev => ({ ...prev, filter }));
  };

  const addPost = (content: string, category: string, media: Post['media']) => {
    if (!content.trim()) return;
    const newPost: Post = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      content: content.trim(),
      category,
      media,
      status: 'draft',
      plannedWeekId: null,
      plannedDay: null,
      plannedSlot: null,
    };
    setState(prev => {
      const newState = { ...prev, posts: [newPost, ...prev.posts] };
      return newState;
    });
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    setState(prev => {
      const newPosts = prev.posts.map(p => p.id === id ? { ...p, ...updates } : p);
      return { ...prev, posts: newPosts };
    });
  };

  const deletePost = (id: string) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.filter(p => p.id !== id)
    }));
  };

  const schedulePostToSlot = (postId: string, weekId: string, day: Day, slot: number) => {
    setState(prev => {
      const existingInSlot = prev.posts.find(
        p => p.plannedWeekId === weekId && p.plannedDay === day && p.plannedSlot === slot
      );

      let newPosts = prev.posts.map(post => {
        if (existingInSlot && post.id === existingInSlot.id) {
          return { 
            ...post, 
            status: 'draft' as const, 
            plannedWeekId: null, 
            plannedDay: null, 
            plannedSlot: null 
          };
        }
        if (post.id === postId) {
          return { 
            ...post, 
            status: 'planned' as const, 
            plannedWeekId: weekId, 
            plannedDay: day, 
            plannedSlot: slot 
          };
        }
        return post;
      });

      return { ...prev, posts: newPosts };
    });
  };

  const unschedulePost = (postId: string) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(p => 
        p.id === postId 
          ? { ...p, status: 'draft', plannedWeekId: null, plannedDay: null, plannedSlot: null } 
          : p
      )
    }));
  };

  const addWeek = (name: string) => {
    if (!name.trim()) return;
    const newWeek: Week = {
      id: `week-${Date.now()}`,
      name: name.trim()
    };
    setState(prev => ({
      ...prev,
      weeks: [...prev.weeks, newWeek],
      selectedWeekId: newWeek.id
    }));
  };

  const deleteWeek = (weekId: string) => {
    setState(prev => {
      const newPosts = prev.posts.map(p =>
        p.plannedWeekId === weekId 
          ? { ...p, status: 'draft' as const, plannedWeekId: null, plannedDay: null, plannedSlot: null }
          : p
      );
      const newWeeks = prev.weeks.filter(w => w.id !== weekId);
      const newSelected = prev.selectedWeekId === weekId 
        ? (newWeeks[0]?.id || 'week-1') 
        : prev.selectedWeekId;

      return {
        ...prev,
        posts: newPosts,
        weeks: newWeeks,
        selectedWeekId: newSelected
      };
    });
  };

  const addTopic = (name: string, iconName: string, colorName: string) => {
    if (!name.trim()) return;
    const exists = state.topics.some(t => t.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) return;

    const newTopic: Topic = { name: name.trim(), iconName, colorName };
    setState(prev => ({ ...prev, topics: [...prev.topics, newTopic] }));
  };

  const removeTopic = (topicName: string) => {
    if (state.topics.length <= 1) return;

    const fallback = state.topics.find(t => t.name !== topicName)?.name || state.topics[0].name;

    setState(prev => {
      const newPosts = prev.posts.map(p =>
        p.category === topicName ? { ...p, category: fallback } : p
      );
      const newTopics = prev.topics.filter(t => t.name !== topicName);
      const newFilter = prev.filter === topicName ? 'All' : prev.filter;

      return { ...prev, posts: newPosts, topics: newTopics, filter: newFilter as any };
    });
  };

  const selectedWeek = useMemo(() => 
    state.weeks.find(w => w.id === state.selectedWeekId) || state.weeks[0]
  , [state.weeks, state.selectedWeekId]);

  const draftPosts = useMemo(() => 
    state.posts.filter(p => p.status === 'draft')
  , [state.posts]);

  const plannedPostsForWeek = useMemo(() => 
    state.posts.filter(p => p.status === 'planned' && p.plannedWeekId === state.selectedWeekId)
  , [state.posts, state.selectedWeekId]);

  const postsBySlot = useMemo(() => {
    const map: Record<string, Post> = {};
    plannedPostsForWeek.forEach(post => {
      if (post.plannedDay && post.plannedSlot != null) {
        map[`${post.plannedDay}:${post.plannedSlot}`] = post;
      }
    });
    return map;
  }, [plannedPostsForWeek]);

  const getPostInSlot = useCallback((day: Day, slot: number): Post | undefined => {
    return postsBySlot[`${day}:${slot}`];
  }, [postsBySlot]);

  const weeklyTopicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    state.topics.forEach(t => { counts[t.name] = 0; });
    plannedPostsForWeek.forEach(p => {
      if (counts[p.category] !== undefined) counts[p.category]++;
      else counts[p.category] = 1;
    });
    return counts;
  }, [plannedPostsForWeek, state.topics]);

  const weekPlannedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    state.weeks.forEach(w => { counts[w.id] = 0; });
    state.posts.forEach(post => {
      if (post.status === 'planned' && post.plannedWeekId) {
        counts[post.plannedWeekId] = (counts[post.plannedWeekId] ?? 0) + 1;
      }
    });
    return counts;
  }, [state.posts, state.weeks]);

  const weeklyPlannedCount = weekPlannedCounts[state.selectedWeekId] ?? 0;
  const totalRequired = DAYS.length * SLOTS_PER_DAY;
  const progressPercentage = Math.min(Math.round((weeklyPlannedCount / totalRequired) * 100), 100);

  const filteredDrafts = useMemo(() => {
    if (state.filter === 'All') return draftPosts;
    return draftPosts.filter(p => p.category === state.filter);
  }, [draftPosts, state.filter]);

  const topicMap = useMemo(() => {
    return state.topics.reduce<Record<string, Topic>>((acc, topic) => {
      acc[topic.name] = topic;
      return acc;
    }, {});
  }, [state.topics]);

  const getTopicConfig = useCallback((categoryName: string) => {
    const topic = topicMap[categoryName];
    if (!topic) {
      return {
        icon: Hash,
        color: '#a1a1aa',
        bg: 'rgba(163,163,172,0.1)',
        border: 'rgba(163,163,172,0.2)',
        fill: '#71717a'
      };
    }
    const preset = COLOR_OPTIONS.find(c => c.name === topic.colorName) || COLOR_OPTIONS[0];
    const IconComp = ICON_MAP[topic.iconName] || Hash;
    return {
      icon: IconComp,
      color: preset.text,
      bg: preset.bg,
      border: preset.border,
      fill: preset.fill
    };
  }, [topicMap]);

  const getTopicConfig = useCallback((categoryName: string) => {
    const topic = state.topics.find(t => t.name === categoryName);
    if (!topic) {
      return {
        icon: Hash,
        color: '#a1a1aa',
        bg: 'rgba(163,163,172,0.1)',
        border: 'rgba(163,163,172,0.2)',
        fill: '#71717a'
      };
    }
    const preset = COLOR_OPTIONS.find(c => c.name === topic.colorName) || COLOR_OPTIONS[0];
    const IconComp = ICON_MAP[topic.iconName] || Hash;
    return {
      icon: IconComp,
      color: preset.text,
      bg: preset.bg,
      border: preset.border,
      fill: preset.fill
    };
  }, [state.topics]);

  return {
    ...state,
    isLoaded,
    setActiveTab,
    setSelectedWeekId,
    setFilter,
    addPost,
    updatePost,
    deletePost,
    schedulePostToSlot,
    unschedulePost,
    addWeek,
    deleteWeek,
    addTopic,
    removeTopic,
    selectedWeek,
    draftPosts,
    plannedPostsForWeek,
    getPostInSlot,
    weeklyTopicCounts,
    weekPlannedCounts,
    weeklyPlannedCount,
    totalRequired,
    progressPercentage,
    filteredDrafts,
    getTopicConfig,
  };
}
