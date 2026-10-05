import { X } from 'lucide-react';
import type { Post, TopicConfig } from '../types';
import PostCard from './PostCard';

interface AssignModalProps {
  open: boolean;
  draftPosts: Post[];
  onClose: () => void;
  assignPostToSlot: (postId: string) => void;
  getTopicConfig: (categoryName: string) => TopicConfig;
}

export default function AssignModal({
  open,
  draftPosts,
  onClose,
  assignPostToSlot,
  getTopicConfig,
}: AssignModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="flex max-h-[75vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-extrabold tracking-wide text-text">ASSIGN POST</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-card-alt hover:text-text"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {draftPosts.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              No drafts available. Create some first.
            </p>
          ) : (
            <div className="space-y-3">
              {draftPosts.map((item) => {
                const config = getTopicConfig(item.category);
                return (
                  <div key={item.id} onClick={() => assignPostToSlot(item.id)}>
                    <PostCard post={item} isCompact config={config} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
