import { Inbox } from 'lucide-react';
import type { Post, Topic, TopicConfig } from '../types';
import PostCard from './PostCard';

interface VaultProps {
  topics: Topic[];
  filter: string;
  setFilter: (value: string) => void;
  filteredDrafts: Post[];
  getTopicConfig: (categoryName: string) => TopicConfig;
  openEditModal: (post: Post) => void;
}

export default function Vault({
  topics,
  filter,
  setFilter,
  filteredDrafts,
  getTopicConfig,
  openEditModal,
}: VaultProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex gap-2 overflow-x-auto border-b border-border px-5 py-3">
        <button
          type="button"
          onClick={() => setFilter('All')}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
            filter === 'All'
              ? 'border-transparent bg-accent text-bg'
              : 'border-border bg-card-alt text-text-muted hover:border-neutral'
          }`}
        >
          All Ideas
        </button>
        {topics.map((cat) => {
          const config = getTopicConfig(cat.name);
          const Icon = config.icon;
          const isActive = filter === cat.name;
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => setFilter(cat.name)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition"
              style={
                isActive
                  ? {
                      backgroundColor: config.bg,
                      borderColor: config.border,
                      color: config.color,
                    }
                  : undefined
              }
            >
              <Icon size={14} className={isActive ? undefined : 'text-text-muted'} />
              <span className={isActive ? undefined : 'text-text-muted'}>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {filteredDrafts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
          <Inbox size={48} className="text-neutral" />
          <p className="text-lg font-extrabold text-text">No drafts found</p>
          <p className="max-w-xs text-center text-sm text-text-muted">
            Use the Craft Post button to add new content to your vault.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredDrafts.map((item) => {
              const config = getTopicConfig(item.category);
              return (
                <PostCard
                  key={item.id}
                  post={item}
                  onClick={() => openEditModal(item)}
                  config={config}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
