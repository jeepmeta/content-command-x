import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Hash } from 'lucide-react';
import type { Post, Week, Topic, Day, Template, PostStatus } from '../types';
import {
  DAYS,
  SLOTS_PER_DAY,
  DEFAULT_TOPICS,
  DEFAULT_WEEKS,
  INITIAL_POSTS,
  ICON_MAP,
  COLOR_OPTIONS,
} from '../constants';

const STORAGE_KEY = 'content_command_x_v3';

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'tpl-hot-take',
    name: 'Hot Take',
    content: 'Unpopular opinion: [your take here]. Most people get this wrong because...',
    category: 'Stoicism',
    media: null,
  },
  {
    id: 'tpl-thread',
    name: 'Thread Starter',
    content: 'A short thread on [topic]:\n\n1/ The core idea...\n2/ Why it matters...\n3/ What to do next...',
    category: 'Hard Work',
    media: null,
  },
  {
    id: 'tpl-quote',
    name: 'Quote + Take',
    content: '"[quote]"\n\nMy take: ...',
    category: 'Stoicism',
    media: 'image',
  },
];

interface ContentState {
  weeks: Week[];
  topics: Topic[];
  posts: Post[];
  templates: Template[];
  selectedWeekId: string;
  activeTab: 'planner' | 'vault' | 'topics';
  filter: 'All' | string;
  searchQuery: string;
  hasSeenOnboarding: boolean;
}

const initialState: ContentState = {
  weeks: DEFAULT_WEEKS,
  topics: DEFAULT_TOPICS,
  posts: INITIAL_POSTS,
  templates: DEFAULT_TEMPLATES,
  selectedWeekId: 'week-1',
  activeTab: 'planner',
  filter: 'All',
  searchQuery: '',
  hasSeenOnboarding: false,
};

function normalizePost(p: any): Post {
  return {
    id: p.id,
    content: p.content || '',
    category: p.category || 'Stoicism',
    media: p.media ?? null,
    status: (['draft', 'planned', 'posted'].includes(p.status) ? p.status : 'draft') as PostStatus,
    plannedWeekId: p.plannedWeekId ?? null,
    plannedDay: p.plannedDay ?? null,
    plannedSlot: p.plannedSlot ?? null,
  };
}

export function useContentStore() {
  const [state, setState] = useState<ContentState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('content_command_x_v2');
      if (stored) {
        const parsed: Partial<ContentState> = JSON.parse(stored);
        setState((prev) => ({
          ...prev,
          weeks: parsed.weeks && parsed.weeks.length > 0 ? parsed.weeks : DEFAULT_WEEKS,
          topics: parsed.topics && parsed.topics.length > 0 ? parsed.topics : DEFAULT_TOPICS,
          posts:
            parsed.posts && parsed.posts.length > 0
              ? parsed.posts.map(normalizePost)
              : INITIAL_POSTS,
          templates:
            parsed.templates && parsed.templates.length > 0
              ? parsed.templates
              : DEFAULT_TEMPLATES,
          selectedWeekId: parsed.selectedWeekId || 'week-1',
          activeTab: parsed.activeTab || 'planner',
          filter: parsed.filter || 'All',
          searchQuery: '',
          hasSeenOnboarding: parsed.hasSeenOnboarding ?? false,
        }));
      }
    } catch (e) {
      console.warn('Failed to load from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveToStorage = useCallback((newState: ContentState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.warn('Failed to save to storage', e);
    }
  }, []);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleSave = useCallback(
    (newState: ContentState) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveToStorage(newState), 250);
    },
    [saveToStorage],
  );

  useEffect(() => {
    if (isLoaded) scheduleSave(state);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, isLoaded, scheduleSave]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const setActiveTab = (tab: ContentState['activeTab']) =>
    setState((prev) => ({ ...prev, activeTab: tab }));

  const setSelectedWeekId = (weekId: string) =>
    setState((prev) => ({ ...prev, selectedWeekId: weekId, activeTab: 'planner' }));

  const setFilter = (filter: ContentState['filter']) =>
    setState((prev) => ({ ...prev, filter }));

  const setSearchQuery = (searchQuery: string) =>
    setState((prev) => ({ ...prev, searchQuery }));

  const dismissOnboarding = () =>
    setState((prev) => ({ ...prev, hasSeenOnboarding: true }));

  const addPost = (content: string, category: string, media: Post['media']) => {
    if (!content.trim()) return;
    const newPost: Post = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      content: content.trim(),
      category,
      media,
      status: 'draft',
      plannedWeekId: null,
      plannedDay: null,
      plannedSlot: null,
    };
    setState((prev) => ({ ...prev, posts: [newPost, ...prev.posts] }));
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const deletePost = (id: string) => {
    setState((prev) => ({ ...prev, posts: prev.posts.filter((p) => p.id !== id) }));
  };

  const deletePosts = (ids: string[]) => {
    const idSet = new Set(ids);
    setState((prev) => ({ ...prev, posts: prev.posts.filter((p) => !idSet.has(p.id)) }));
  };

  const duplicatePost = (id: string) => {
    setState((prev) => {
      const original = prev.posts.find((p) => p.id === id);
      if (!original) return prev;
      const copy: Post = {
        ...original,
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        status: 'draft',
        plannedWeekId: null,
        plannedDay: null,
        plannedSlot: null,
      };
      return { ...prev, posts: [copy, ...prev.posts] };
    });
  };

  const markAsPosted = (id: string) => {
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) =>
        p.id === id
          ? { ...p, status: 'posted' as const, plannedWeekId: null, plannedDay: null, plannedSlot: null }
          : p,
      ),
    }));
  };

  const markPostsAsPosted = (ids: string[]) => {
    const idSet = new Set(ids);
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) =>
        idSet.has(p.id)
          ? { ...p, status: 'posted' as const, plannedWeekId: null, plannedDay: null, plannedSlot: null }
          : p,
      ),
    }));
  };

  const changeCategoryBulk = (ids: string[], category: string) => {
    const idSet = new Set(ids);
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) => (idSet.has(p.id) ? { ...p, category } : p)),
    }));
  };

  const schedulePostToSlot = (postId: string, weekId: string, day: Day, slot: number) => {
    setState((prev) => {
      const existingInSlot = prev.posts.find(
        (p) =>
          p.status === 'planned' &&
          p.plannedWeekId === weekId &&
          p.plannedDay === day &&
          p.plannedSlot === slot,
      );

      const newPosts = prev.posts.map((post) => {
        if (existingInSlot && post.id === existingInSlot.id) {
          return {
            ...post,
            status: 'draft' as const,
            plannedWeekId: null,
            plannedDay: null,
            plannedSlot: null,
          };
        }
        if (post.id === postId) {
          return {
            ...post,
            status: 'planned' as const,
            plannedWeekId: weekId,
            plannedDay: day,
            plannedSlot: slot,
          };
        }
        return post;
      });

      return { ...prev, posts: newPosts };
    });
  };

  const unschedulePost = (postId: string) => {
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) =>
        p.id === postId
          ? { ...p, status: 'draft', plannedWeekId: null, plannedDay: null, plannedSlot: null }
          : p,
      ),
    }));
  };

  const addWeek = (name: string) => {
    if (!name.trim()) return;
    const newWeek: Week = { id: `week-${Date.now()}`, name: name.trim() };
    setState((prev) => ({
      ...prev,
      weeks: [...prev.weeks, newWeek],
      selectedWeekId: newWeek.id,
    }));
  };

  const deleteWeek = (weekId: string) => {
    setState((prev) => {
      const newPosts = prev.posts.map((p) =>
        p.plannedWeekId === weekId
          ? { ...p, status: 'draft' as const, plannedWeekId: null, plannedDay: null, plannedSlot: null }
          : p,
      );
      const newWeeks = prev.weeks.filter((w) => w.id !== weekId);
      const newSelected =
        prev.selectedWeekId === weekId ? newWeeks[0]?.id || 'week-1' : prev.selectedWeekId;
      return { ...prev, posts: newPosts, weeks: newWeeks, selectedWeekId: newSelected };
    });
  };

  const addTopic = (name: string, iconName: string, colorName: string) => {
    if (!name.trim()) return;
    const exists = state.topics.some((t) => t.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) return;
    const newTopic: Topic = { name: name.trim(), iconName, colorName };
    setState((prev) => ({ ...prev, topics: [...prev.topics, newTopic] }));
  };

  const removeTopic = (topicName: string) => {
    if (state.topics.length <= 1) return;
    const fallback = state.topics.find((t) => t.name !== topicName)?.name || state.topics[0].name;
    setState((prev) => {
      const newPosts = prev.posts.map((p) =>
        p.category === topicName ? { ...p, category: fallback } : p,
      );
      const newTopics = prev.topics.filter((t) => t.name !== topicName);
      const newFilter = prev.filter === topicName ? 'All' : prev.filter;
      return { ...prev, posts: newPosts, topics: newTopics, filter: newFilter };
    });
  };

  const saveAsTemplate = (postId: string, name: string) => {
    const post = state.posts.find((p) => p.id === postId);
    if (!post || !name.trim()) return;
    const tpl: Template = {
      id: `tpl-${Date.now()}`,
      name: name.trim(),
      content: post.content,
      category: post.category,
      media: post.media,
    };
    setState((prev) => ({ ...prev, templates: [tpl, ...prev.templates] }));
  };

  const deleteTemplate = (id: string) => {
    setState((prev) => ({ ...prev, templates: prev.templates.filter((t) => t.id !== id) }));
  };

  const createFromTemplate = (templateId: string) => {
    const tpl = state.templates.find((t) => t.id === templateId);
    if (!tpl) return;
    addPost(tpl.content, tpl.category, tpl.media);
  };

  // Computed
  const selectedWeek = useMemo(
    () => state.weeks.find((w) => w.id === state.selectedWeekId) || state.weeks[0],
    [state.weeks, state.selectedWeekId],
  );

  const draftPosts = useMemo(
    () => state.posts.filter((p) => p.status === 'draft'),
    [state.posts],
  );

  const postedPosts = useMemo(
    () => state.posts.filter((p) => p.status === 'posted'),
    [state.posts],
  );

  const plannedPostsForWeek = useMemo(
    () =>
      state.posts.filter(
        (p) => p.status === 'planned' && p.plannedWeekId === state.selectedWeekId,
      ),
    [state.posts, state.selectedWeekId],
  );

  const postsBySlot = useMemo(() => {
    const map: Record<string, Post> = {};
    plannedPostsForWeek.forEach((post) => {
      if (post.plannedDay && post.plannedSlot != null) {
        map[`${post.plannedDay}:${post.plannedSlot}`] = post;
      }
    });
    return map;
  }, [plannedPostsForWeek]);

  const getPostInSlot = useCallback(
    (day: Day, slot: number): Post | undefined => postsBySlot[`${day}:${slot}`],
    [postsBySlot],
  );

  const weeklyTopicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    state.topics.forEach((t) => {
      counts[t.name] = 0;
    });
    plannedPostsForWeek.forEach((p) => {
      if (counts[p.category] !== undefined) counts[p.category]++;
      else counts[p.category] = 1;
    });
    return counts;
  }, [plannedPostsForWeek, state.topics]);

  const weekPlannedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    state.weeks.forEach((w) => {
      counts[w.id] = 0;
    });
    state.posts.forEach((post) => {
      if (post.status === 'planned' && post.plannedWeekId) {
        counts[post.plannedWeekId] = (counts[post.plannedWeekId] ?? 0) + 1;
      }
    });
    return counts;
  }, [state.posts, state.weeks]);

  const weeklyPlannedCount = weekPlannedCounts[state.selectedWeekId] ?? 0;
  const totalRequired = DAYS.length * SLOTS_PER_DAY;
  const progressPercentage = Math.min(
    Math.round((weeklyPlannedCount / totalRequired) * 100),
    100,
  );

  const filteredDrafts = useMemo(() => {
    let list = draftPosts;
    if (state.filter !== 'All') {
      list = list.filter((p) => p.category === state.filter);
    }
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [draftPosts, state.filter, state.searchQuery]);

  const getTopicConfig = useCallback(
    (categoryName: string) => {
      const topic = state.topics.find((t) => t.name === categoryName);
      if (!topic) {
        return {
          icon: Hash,
          color: '#a1a1aa',
          bg: 'rgba(163,163,172,0.1)',
          border: 'rgba(163,163,172,0.2)',
          fill: '#71717a',
        };
      }
      const preset = COLOR_OPTIONS.find((c) => c.name === topic.colorName) || COLOR_OPTIONS[0];
      const IconComp = ICON_MAP[topic.iconName] || Hash;
      return {
        icon: IconComp,
        color: preset.text,
        bg: preset.bg,
        border: preset.border,
        fill: preset.fill,
      };
    },
    [state.topics],
  );

  return {
    ...state,
    isLoaded,
    setActiveTab,
    setSelectedWeekId,
    setFilter,
    setSearchQuery,
    dismissOnboarding,
    addPost,
    updatePost,
    deletePost,
    deletePosts,
    duplicatePost,
    markAsPosted,
    markPostsAsPosted,
    changeCategoryBulk,
    schedulePostToSlot,
    unschedulePost,
    addWeek,
    deleteWeek,
    addTopic,
    removeTopic,
    saveAsTemplate,
    deleteTemplate,
    createFromTemplate,
    selectedWeek,
    draftPosts,
    postedPosts,
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
