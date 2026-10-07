import { useMemo, useState } from 'react';
import {
  Calendar,
  Inbox,
  Settings,
  Image as ImageIcon,
  Film,
  Sparkles,
  Type,
  GripVertical,
} from 'lucide-react';
import type { Post, TopicConfig } from '../types';
import CategoryBadge from './CategoryBadge';

type MediaFilter = 'all' | 'text' | 'image' | 'video' | 'gif';

interface SidebarVaultProps {
  activeTab: 'planner' | 'vault' | 'topics';
  setActiveTab: (tab: 'planner' | 'vault' | 'topics') => void;
  draftPosts: Post[];
  getTopicConfig: (categoryName: string) => TopicConfig;
  onOpenPost: (post: Post) => void;
}

const MEDIA_PILLS: { key: MediaFilter; label: string; icon: typeof Type }[] = [
  { key: 'all', label: 'All', icon: Inbox },
  { key: 'text', label: 'Text', icon: Type },
  { key: 'image', label: 'Image', icon: ImageIcon },
  { key: 'video', label: 'Video', icon: Film },
  { key: 'gif', label: 'GIF', icon: Sparkles },
];

export default function SidebarVault({
  activeTab,
  setActiveTab,
  draftPosts,
  getTopicConfig,
  onOpenPost,
}: SidebarVaultProps) {
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (mediaFilter === 'all') return draftPosts;
    if (mediaFilter === 'text') return draftPosts.filter((p) => !p.media);
    return draftPosts.filter((p) => p.media === mediaFilter);
  }, [draftPosts, mediaFilter]);

  const tabs = [
    { key: 'planner' as const, label: 'Planner', icon: Calendar, hint: 'P' },
    { key: 'vault' as const, label: 'Vault', icon: Inbox, hint: 'V' },
    { key: 'topics' as const, label: 'Topics', icon: Settings, hint: 'T' },
  ];

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-card-alt">
      {/* Nav */}
      <div className="flex flex-col gap-1 border-b border-border p-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                isActive
                  ? 'bg-bg text-accent'
                  : 'text-text-muted hover:bg-card hover:text-text'
              }`}
            >
              <Icon size={18} />
              <span className="flex-1">{tab.label}</span>
              <kbd className="rounded bg-bg/50 px-1 font-mono text-[10px] opacity-60">{tab.hint}</kbd>
            </button>
          );
        })}
      </div>

      {/* Vault mini list — always visible for drag onto planner */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border px-3 py-2">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-text-muted">
            Vault · drag onto slots
          </p>
          <div className="flex flex-wrap gap-1.5">
            {MEDIA_PILLS.map((pill) => {
              const Icon = pill.icon;
              const active = mediaFilter === pill.key;
              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setMediaFilter(pill.key)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold transition ${
                    active
                      ? 'border-accent bg-accent/15 text-accent'
                      : 'border-border bg-card text-text-muted hover:border-neutral'
                  }`}
                >
                  <Icon size={11} />
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-[11px] text-text-muted">
              No drafts{mediaFilter !== 'all' ? ` for ${mediaFilter}` : ''}. Craft some or clear the
              filter.
            </p>
          ) : (
            filtered.map((post) => {
              const config = getTopicConfig(post.category);
              const isDragging = draggingId === post.id;
              return (
                <div
                  key={post.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/post-id', post.id);
                    e.dataTransfer.effectAllowed = 'move';
                    // Required for Firefox
                    e.dataTransfer.setData('text/plain', post.id);
                    setDraggingId(post.id);
                  }}
                  onDragEnd={() => {
                    // If drop was invalid, nothing changed in state — card stays here
                    setDraggingId(null);
                  }}
                  onClick={() => onOpenPost(post)}
                  className={`cursor-grab rounded-xl border bg-card p-2.5 shadow-soft transition active:cursor-grabbing ${
                    isDragging ? 'opacity-40 scale-[0.98]' : 'hover:border-accent/40'
                  }`}
                  style={{ borderColor: config.border }}
                >
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <CategoryBadge categoryName={post.category} config={config} size="sm" />
                    <GripVertical size={12} className="shrink-0 text-neutral opacity-50" />
                  </div>
                  <p className="line-clamp-3 text-[11px] leading-snug text-text">{post.content}</p>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-text-muted">
                    {post.media === 'image' && (
                      <>
                        <ImageIcon size={10} className="text-sky-400" /> Image
                      </>
                    )}
                    {post.media === 'video' && (
                      <>
                        <Film size={10} className="text-emerald-400" /> Video
                      </>
                    )}
                    {post.media === 'gif' && (
                      <>
                        <Sparkles size={10} className="text-fuchsia-400" /> GIF
                      </>
                    )}
                    {!post.media && (
                      <>
                        <Type size={10} /> Text
                      </>
                    )}
                    <span className="ml-auto">{post.content.length}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-border px-3 py-2 text-[10px] text-text-muted">
          {filtered.length}/{draftPosts.length} drafts
        </div>
      </div>
    </aside>
  );
}
