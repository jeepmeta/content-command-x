import { useState } from 'react';
import {
  Inbox,
  Search,
  CheckSquare,
  Square,
  Trash2,
  CheckCircle2,
  Copy,
  FileText,
  Sparkles,
} from 'lucide-react';
import type { Post, Topic, TopicConfig, Template } from '../types';
import PostCard from './PostCard';

interface VaultProps {
  topics: Topic[];
  filter: string;
  setFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filteredDrafts: Post[];
  templates: Template[];
  getTopicConfig: (categoryName: string) => TopicConfig;
  openEditModal: (post: Post) => void;
  onDuplicate: (id: string) => void;
  onMarkPosted: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteBulk: (ids: string[]) => void;
  onMarkPostedBulk: (ids: string[]) => void;
  onChangeCategoryBulk: (ids: string[], category: string) => void;
  onCreateFromTemplate: (templateId: string) => void;
  onDeleteTemplate: (id: string) => void;
  onSaveAsTemplate: (postId: string) => void;
  onCopyText: (text: string) => void;
}

export default function Vault({
  topics,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  filteredDrafts,
  templates,
  getTopicConfig,
  openEditModal,
  onDuplicate,
  onMarkPosted,
  onDelete,
  onDeleteBulk,
  onMarkPostedBulk,
  onChangeCategoryBulk,
  onCreateFromTemplate,
  onDeleteTemplate,
  onSaveAsTemplate,
  onCopyText,
}: VaultProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showTemplates, setShowTemplates] = useState(false);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filteredDrafts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredDrafts.map((p) => p.id)));
    }
  };

  const clearSelection = () => setSelected(new Set());

  const selectedIds = Array.from(selected);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Search + filters */}
      <div className="space-y-3 border-b border-border px-5 py-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drafts..."
            className="w-full rounded-xl border border-border bg-card-alt py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-neutral focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
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

          <button
            type="button"
            onClick={() => setShowTemplates((v) => !v)}
            className={`ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
              showTemplates
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-card-alt text-text-muted hover:border-neutral'
            }`}
          >
            <Sparkles size={14} />
            Templates
          </button>
        </div>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2">
            <button type="button" onClick={selectAll} className="text-xs font-bold text-accent">
              {selected.size === filteredDrafts.length ? 'Deselect all' : 'Select all'}
            </button>
            <span className="text-xs text-text-muted">{selected.size} selected</span>
            <div className="flex-1" />
            <select
              className="rounded-lg border border-border bg-card px-2 py-1 text-xs text-text"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  onChangeCategoryBulk(selectedIds, e.target.value);
                  clearSelection();
                  e.target.value = '';
                }
              }}
            >
              <option value="" disabled>
                Move to topic...
              </option>
              {topics.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                onMarkPostedBulk(selectedIds);
                clearSelection();
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-success/15 px-2.5 py-1 text-xs font-bold text-success"
            >
              <CheckCircle2 size={14} /> Mark posted
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete ${selected.size} posts?`)) {
                  onDeleteBulk(selectedIds);
                  clearSelection();
                }
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-danger/15 px-2.5 py-1 text-xs font-bold text-danger"
            >
              <Trash2 size={14} /> Delete
            </button>
            <button type="button" onClick={clearSelection} className="text-xs text-text-muted">
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Templates panel */}
      {showTemplates && (
        <div className="border-b border-border bg-card-alt px-5 py-3">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-text-muted">
            Idea starters & templates
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="min-w-[200px] shrink-0 rounded-xl border border-border bg-card p-3 shadow-soft"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-text">{tpl.name}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteTemplate(tpl.id)}
                    className="text-text-muted hover:text-danger"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <p className="mb-2 line-clamp-2 text-[11px] text-text-muted">{tpl.content}</p>
                <button
                  type="button"
                  onClick={() => onCreateFromTemplate(tpl.id)}
                  className="rounded-lg bg-accent/15 px-2 py-1 text-[11px] font-bold text-accent hover:bg-accent/25"
                >
                  Use template
                </button>
              </div>
            ))}
            {templates.length === 0 && (
              <p className="text-xs text-text-muted">No templates yet. Save a post as a template from the ⋯ menu.</p>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {filteredDrafts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
          <Inbox size={48} className="text-neutral" />
          <p className="text-lg font-extrabold text-text">
            {searchQuery ? 'No matches' : 'Vault is empty'}
          </p>
          <p className="max-w-sm text-center text-sm text-text-muted">
            {searchQuery
              ? 'Try a different search or clear the filter.'
              : 'Hit CRAFT POST (or press C) to drop your first idea in here. Or grab a template above.'}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text"
            >
              {selected.size === filteredDrafts.length ? (
                <CheckSquare size={14} />
              ) : (
                <Square size={14} />
              )}
              {selected.size === filteredDrafts.length ? 'Deselect all' : 'Select all'}
            </button>
            <span className="text-xs text-text-muted">{filteredDrafts.length} drafts</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredDrafts.map((item) => {
              const config = getTopicConfig(item.category);
              const isSelected = selected.has(item.id);
              return (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(item.id);
                    }}
                    className="absolute left-3 top-3 z-10 rounded bg-card/80 p-0.5"
                  >
                    {isSelected ? (
                      <CheckSquare size={16} className="text-accent" />
                    ) : (
                      <Square size={16} className="text-text-muted" />
                    )}
                  </button>
                  <PostCard
                    post={item}
                    onClick={() => openEditModal(item)}
                    config={config}
                    selected={isSelected}
                    onDuplicate={() => onDuplicate(item.id)}
                    onMarkPosted={() => onMarkPosted(item.id)}
                    onDelete={() => onDelete(item.id)}
                    onCopy={() => onCopyText(item.content)}
                    onSaveTemplate={() => onSaveAsTemplate(item.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
