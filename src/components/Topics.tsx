import { Plus, Trash2 } from 'lucide-react';
import type { Topic, TopicConfig } from '../types';
import { ICON_MAP, COLOR_OPTIONS } from '../constants';

interface TopicsProps {
  topics: Topic[];
  newTopicName: string;
  setNewTopicName: (value: string) => void;
  newTopicIcon: string;
  setNewTopicIcon: (value: string) => void;
  newTopicColor: string;
  setNewTopicColor: (value: string) => void;
  handleAddTopic: () => void;
  removeTopic: (topicName: string) => void;
  getTopicConfig: (categoryName: string) => TopicConfig;
}

export default function Topics({
  topics,
  newTopicName,
  setNewTopicName,
  newTopicIcon,
  setNewTopicIcon,
  newTopicColor,
  setNewTopicColor,
  handleAddTopic,
  removeTopic,
  getTopicConfig,
}: TopicsProps) {
  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-1 text-base font-extrabold text-text">Create New Topic</h2>
          <p className="mb-4 text-xs text-text-muted">
            Add angles to keep your voice balanced across weeks.
          </p>

          <input
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
            placeholder="e.g. Personal Wins"
            className="mb-4 w-full rounded-xl border border-border bg-card-alt px-4 py-2.5 text-sm text-text placeholder:text-neutral focus:border-accent focus:outline-none"
          />

          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
            Icon
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.keys(ICON_MAP).map((iconName) => {
              const IconComp = ICON_MAP[iconName];
              const active = newTopicIcon === iconName;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setNewTopicIcon(iconName)}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                    active
                      ? 'border-accent bg-accent text-bg'
                      : 'border-border bg-card-alt text-text-muted hover:border-neutral'
                  }`}
                >
                  <IconComp size={18} />
                </button>
              );
            })}
          </div>

          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
            Accent Color
          </p>
          <div className="mb-5 flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((opt) => {
              const active = newTopicColor === opt.name;
              return (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setNewTopicColor(opt.name)}
                  className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition"
                  style={
                    active
                      ? {
                          borderColor: opt.hex,
                          backgroundColor: opt.bg,
                          color: opt.text,
                        }
                      : {
                          borderColor: 'var(--color-border)',
                          backgroundColor: 'var(--color-card-alt)',
                          color: 'var(--color-text)',
                        }
                  }
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: opt.hex }}
                  />
                  {opt.name}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddTopic}
            disabled={!newTopicName.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-extrabold text-bg disabled:opacity-50 hover:bg-accent-dark"
          >
            <Plus size={18} />
            ADD TOPIC
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-1 text-base font-extrabold text-text">
            Active Topics ({topics.length})
          </h2>
          <p className="mb-4 text-xs text-text-muted">
            Delete reassigns posts to the first available topic.
          </p>

          <div className="space-y-3">
            {topics.map((t) => {
              const config = getTopicConfig(t.name);
              const IconComp = config.icon;
              return (
                <div
                  key={t.name}
                  className="flex items-center justify-between rounded-xl border border-border bg-card-alt px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl border"
                      style={{
                        backgroundColor: config.bg,
                        borderColor: config.border,
                      }}
                    >
                      <IconComp size={18} style={{ color: config.color }} />
                    </div>
                    <div>
                      <p className="font-extrabold text-text">{t.name}</p>
                      <p className="text-[11px] text-text-muted">Preset: {t.colorName}</p>
                    </div>
                  </div>
                  {topics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTopic(t.name)}
                      className="rounded-lg p-2 text-danger hover:bg-danger/10"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[11px] italic text-neutral">
          Content Command X • Made for degens who ship on X
        </p>
      </div>
    </div>
  );
}
