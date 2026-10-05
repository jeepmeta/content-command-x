import { X, Image as ImageIcon, Film } from 'lucide-react';
import type { Post, Topic, TopicConfig } from '../types';
import { MAX_POST_LENGTH } from '../constants';

interface PostModalProps {
  open: boolean;
  topics: Topic[];
  formData: { content: string; category: string; media: Post['media'] };
  setFormData: (next: { content: string; category: string; media: Post['media'] }) => void;
  editingPost: Post | null;
  onClose: () => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  getTopicConfig: (categoryName: string) => TopicConfig;
}

export default function PostModal({
  open,
  topics,
  formData,
  setFormData,
  editingPost,
  onClose,
  onSave,
  onDelete,
  getTopicConfig,
}: PostModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h2 className="text-base font-extrabold tracking-wide text-text">
            {editingPost ? 'EDIT POST' : 'DRAFT NEW INTEL'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-card-alt hover:text-text"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
              Topic
            </label>
            <div className="flex flex-wrap gap-2">
              {topics.map((cat) => {
                const config = getTopicConfig(cat.name);
                const Icon = config.icon;
                const active = formData.category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.name })}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                      active
                        ? 'border-current'
                        : 'border-border bg-card-alt text-text-muted hover:border-neutral'
                    }`}
                    style={
                      active
                        ? {
                            backgroundColor: config.bg,
                            borderColor: config.border,
                            color: config.color,
                          }
                        : undefined
                    }
                  >
                    <Icon size={14} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
              X Post Content ({formData.content.length}/{MAX_POST_LENGTH})
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              maxLength={MAX_POST_LENGTH + 50}
              placeholder="Write your quote, market take, or satire..."
              className="w-full resize-none rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text placeholder:text-neutral focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
              Attachment
            </label>
            <div className="flex flex-wrap gap-2">
              {(['none', 'image', 'video', 'gif'] as const).map((type) => {
                const active =
                  (type === 'none' && !formData.media) || formData.media === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        media: type === 'none' ? null : type,
                      })
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      active
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-card-alt text-text-muted hover:border-neutral'
                    }`}
                  >
                    {type === 'none' && <X size={14} />}
                    {type === 'image' && <ImageIcon size={14} />}
                    {type === 'video' && <Film size={14} />}
                    {type === 'gif' && <span className="text-[10px] font-extrabold">GIF</span>}
                    {type.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            {editingPost && (
              <button
                type="button"
                onClick={() => onDelete(editingPost.id)}
                className="rounded-xl bg-danger px-4 py-2.5 text-xs font-extrabold text-white hover:bg-danger/90"
              >
                PURGE
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-card-alt px-4 py-2.5 text-xs font-extrabold text-text-muted hover:text-text"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!formData.content.trim()}
              className="rounded-xl bg-accent px-5 py-2.5 text-xs font-extrabold text-bg disabled:opacity-50 hover:bg-accent-dark"
            >
              {editingPost ? 'UPDATE' : 'STORE IN VAULT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
