import { Clock, Image as ImageIcon, Film, Sparkles, Type, GripVertical } from 'lucide-react';
import type { Post, TopicConfig } from '../types';
import CategoryBadge from './CategoryBadge';
import { MAX_POST_LENGTH } from '../constants';

interface PostCardProps {
  post: Post;
  isCompact?: boolean;
  onClick?: () => void;
  config?: TopicConfig;
}

function MediaBadge({ media, compact }: { media: Post['media']; compact?: boolean }) {
  if (media === 'image') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-sky-400">
        <ImageIcon size={compact ? 12 : 14} />
        Image
      </span>
    );
  }
  if (media === 'video') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-400">
        <Film size={compact ? 12 : 14} />
        Video
      </span>
    );
  }
  if (media === 'gif') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-fuchsia-500/15 px-1.5 py-0.5 text-[11px] font-extrabold text-fuchsia-400">
        <Sparkles size={compact ? 12 : 14} />
        GIF
      </span>
    );
  }
  if (!compact) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-neutral">
        <Type size={12} />
        Text
      </span>
    );
  }
  return null;
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
      className={`w-full text-left rounded-xl border border-border bg-card p-4 shadow-card transition hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/40 ${
        isCompact ? 'p-3 min-h-[118px]' : ''
      }`}
      style={config ? { borderColor: config.border } : undefined}
    >
      <div className="mb-2 flex items-center justify-between">
        <CategoryBadge categoryName={post.category} config={config} size={isCompact ? 'sm' : 'md'} />
        <GripVertical size={isCompact ? 14 : 16} className="text-neutral opacity-50" />
      </div>

      <p
        className={`text-text leading-relaxed ${
          isCompact ? 'line-clamp-3 text-xs' : 'line-clamp-6 text-sm mb-3'
        }`}
      >
        {post.content}
      </p>

      <div className="mt-2 flex items-center gap-2 border-t border-border/60 pt-2">
        <MediaBadge media={post.media} compact={isCompact} />

        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-neutral">
          <Clock size={isCompact ? 11 : 13} />
          {post.content.length}/{MAX_POST_LENGTH}
        </span>
      </div>
    </button>
  );
}
