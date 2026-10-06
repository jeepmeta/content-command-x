import { useState, useRef, useEffect } from 'react';
import {
  Clock,
  Image as ImageIcon,
  Film,
  Sparkles,
  Type,
  GripVertical,
  MoreHorizontal,
  Copy,
  CheckCircle2,
  Trash2,
  FileText,
  CopyPlus,
} from 'lucide-react';
import type { Post, TopicConfig } from '../types';
import CategoryBadge from './CategoryBadge';
import { MAX_POST_LENGTH } from '../constants';

interface PostCardProps {
  post: Post;
  isCompact?: boolean;
  onClick?: () => void;
  config?: TopicConfig;
  selected?: boolean;
  onDuplicate?: () => void;
  onMarkPosted?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onSaveTemplate?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
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
  selected,
  onDuplicate,
  onMarkPosted,
  onDelete,
  onCopy,
  onSaveTemplate,
  draggable,
  onDragStart,
}: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasActions = onDuplicate || onMarkPosted || onDelete || onCopy || onSaveTemplate;

  return (
    <div
      className={`relative w-full rounded-xl border bg-card p-4 text-left shadow-card transition hover:brightness-105 ${
        isCompact ? 'p-3 min-h-[118px]' : ''
      } ${selected ? 'ring-2 ring-accent/60' : ''}`}
      style={{
        borderColor: config?.fill || 'var(--color-border)',
      }}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <button type="button" onClick={onClick} className="w-full text-left focus:outline-none">
        <div className="mb-2 flex items-center justify-between gap-2">
          <CategoryBadge categoryName={post.category} config={config} size={isCompact ? 'sm' : 'md'} />
          <div className="flex items-center gap-1">
            {draggable && (
              <GripVertical size={isCompact ? 14 : 16} className="cursor-grab text-neutral opacity-50" />
            )}
          </div>
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

      {hasActions && (
        <div className="absolute right-2 top-2" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="rounded-lg p-1 text-text-muted hover:bg-card-alt hover:text-text"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 min-w-[160px] rounded-xl border border-border bg-card py-1 shadow-card">
              {onCopy && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-text hover:bg-card-alt"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy();
                    setMenuOpen(false);
                  }}
                >
                  <Copy size={14} /> Copy text
                </button>
              )}
              {onDuplicate && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-text hover:bg-card-alt"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                    setMenuOpen(false);
                  }}
                >
                  <CopyPlus size={14} /> Duplicate
                </button>
              )}
              {onSaveTemplate && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-text hover:bg-card-alt"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveTemplate();
                    setMenuOpen(false);
                  }}
                >
                  <FileText size={14} /> Save as template
                </button>
              )}
              {onMarkPosted && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-success hover:bg-card-alt"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkPosted();
                    setMenuOpen(false);
                  }}
                >
                  <CheckCircle2 size={14} /> Mark posted
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-danger hover:bg-card-alt"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setMenuOpen(false);
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
