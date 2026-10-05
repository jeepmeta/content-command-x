import { Clock, Image as ImageIcon, Film, GripVertical } from 'lucide-react';
import type { Post, TopicConfig } from '../types';
import CategoryBadge from './CategoryBadge';
import { MAX_POST_LENGTH } from '../constants';

interface PostCardProps {
  post: Post;
  isCompact?: boolean;
  onClick?: () => void;
  config?: TopicConfig;
}

export default function PostCard({
  post,
  isCompact = false,
  onClick,
  config,
}: PostCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border border-border bg-card p-4 shadow-lg transition hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/50 ${
        isCompact ? 'p-3 min-h-[118px]' : ''
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <CategoryBadge categoryName={post.category} config={config} size={isCompact ? 'sm' : 'md'} />
        <GripVertical size={isCompact ? 14 : 16} className="text-neutral opacity-60" />
      </div>

      <p
        className={`text-text leading-relaxed ${
          isCompact ? 'line-clamp-3 text-xs' : 'line-clamp-6 text-sm mb-3'
        }`}
      >
        {post.content}
      </p>

      <div className="mt-2 flex items-center gap-2 border-t border-border pt-2">
        {post.media === 'image' && (
          <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-blue-400">
            <ImageIcon size={isCompact ? 12 : 14} />
            Image
          </span>
        )}
        {post.media === 'video' && (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-400">
            <Film size={isCompact ? 12 : 14} />
            Video
          </span>
        )}
        {post.media === 'gif' && (
          <span className="inline-flex items-center rounded bg-purple-500/15 px-1.5 py-0.5 text-[11px] font-extrabold text-purple-400">
            GIF
          </span>
        )}
        {!post.media && !isCompact && (
          <span className="text-[11px] italic text-neutral">Text only</span>
        )}

        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-neutral">
          <Clock size={isCompact ? 11 : 13} />
          {post.content.length}/{MAX_POST_LENGTH}
        </span>
      </div>
    </button>
  );
}
