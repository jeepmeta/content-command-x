import { Calendar, Inbox, Plus, Trash2, X } from 'lucide-react';
import type { Day, Post, TopicConfig, Week } from '../types';
import { DAYS, SLOTS_PER_DAY } from '../constants';
import CategoryBadge from './CategoryBadge';

interface PlannerProps {
  weeks: Week[];
  selectedWeekId: string;
  selectedWeekName: string;
  weekPlannedCounts: Record<string, number>;
  totalRequired: number;
  progressPercentage: number;
  weeklyPlannedCount: number;
  draftCount: number;
  topicCounts: Record<string, number>;
  getTopicConfig: (categoryName: string) => TopicConfig;
  getPostInSlot: (day: Day, slot: number) => Post | undefined;
  openEditModal: (post: Post) => void;
  openAssignModalForSlot: (day: Day, slot: number) => void;
  handleUnschedule: (postId: string) => void;
  deleteWeek: (weekId: string) => void;
  setSelectedWeekId: (weekId: string) => void;
  newWeekName: string;
  setNewWeekName: (value: string) => void;
  handleAddWeek: () => void;
}

export default function Planner({
  weeks,
  selectedWeekId,
  selectedWeekName,
  weekPlannedCounts,
  totalRequired,
  progressPercentage,
  weeklyPlannedCount,
  draftCount,
  topicCounts,
  getTopicConfig,
  getPostInSlot,
  openEditModal,
  openAssignModalForSlot,
  handleUnschedule,
  deleteWeek,
  setSelectedWeekId,
  newWeekName,
  setNewWeekName,
  handleAddWeek,
}: PlannerProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Topic balance */}
      <div className="border-b border-border bg-card-alt px-5 py-3">
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-text-muted">
          Balanced Mix — {selectedWeekName}
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(topicCounts).map(([topicName, count]) => {
            const config = getTopicConfig(topicName);
            return (
              <div
                key={topicName}
                className="inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5"
                style={{ borderColor: config.border }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: config.fill }}
                />
                <span className="text-[11px] font-bold text-text">{topicName}</span>
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    count > 0
                      ? 'bg-accent text-bg'
                      : 'bg-card text-text-muted'
                  }`}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress */}
      <div className="border-b border-border px-5 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            {selectedWeekName} Target
          </span>
          <span
            className={`text-sm font-extrabold ${
              progressPercentage === 100 ? 'text-success' : 'text-text'
            }`}
          >
            {weeklyPlannedCount} / {totalRequired}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-card-alt">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: progressPercentage === 100 ? 'var(--color-success)' : 'var(--color-accent)',
            }}
          />
        </div>
      </div>

      {/* Week selector */}
      <div className="flex items-center gap-3 overflow-x-auto border-b border-border px-5 py-3">
        {weeks.map((week) => {
          const isSelected = selectedWeekId === week.id;
          const weekPlanned = weekPlannedCounts[week.id] ?? 0;
          const isComplete = weekPlanned >= totalRequired;

          return (
            <button
              key={week.id}
              type="button"
              onClick={() => setSelectedWeekId(week.id)}
              className={`flex min-w-[130px] shrink-0 flex-col rounded-xl border p-3 text-left transition ${
                isSelected
                  ? 'border-accent bg-bg'
                  : 'border-border bg-card-alt hover:border-neutral'
              }`}
            >
              <div className="mb-1.5 flex items-center gap-1.5">
                <Calendar
                  size={14}
                  className={isSelected ? 'text-accent' : 'text-text-muted'}
                />
                <span
                  className={`text-sm font-bold ${
                    isSelected ? 'text-accent' : 'text-text-muted'
                  }`}
                >
                  {week.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-extrabold ${
                    isComplete ? 'text-success' : 'text-text'
                  }`}
                >
                  {weekPlanned}/{totalRequired}
                </span>
                {weeks.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWeek(week.id);
                    }}
                    className="rounded p-0.5 text-danger hover:bg-danger/10"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </button>
          );
        })}

        <div className="flex min-w-[180px] shrink-0 items-center gap-2 rounded-xl border border-border bg-card-alt px-3 py-2">
          <input
            value={newWeekName}
            onChange={(e) => setNewWeekName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddWeek()}
            placeholder="New week name"
            className="min-w-0 flex-1 bg-transparent text-sm text-text placeholder:text-neutral focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddWeek}
            disabled={!newWeekName.trim()}
            className="rounded-lg bg-accent p-2 text-bg disabled:opacity-40 hover:bg-accent-dark"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Days grid */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid gap-4 lg:grid-cols-7">
          {DAYS.map((day) => (
            <div key={day} className="flex flex-col gap-2">
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-text-muted">
                {day}
              </h3>
              <div className="flex flex-col gap-2">
                {Array.from({ length: SLOTS_PER_DAY }).map((_, i) => {
                  const slotNum = i + 1;
                  const postInSlot = getPostInSlot(day, slotNum);

                  if (postInSlot) {
                    const config = getTopicConfig(postInSlot.category);
                    return (
                      <button
                        key={`${day}-${slotNum}`}
                        type="button"
                        onClick={() => openEditModal(postInSlot)}
                        className="rounded-xl border border-border bg-card p-3 text-left transition hover:border-accent/40"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <CategoryBadge
                            categoryName={postInSlot.category}
                            config={config}
                            size="sm"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnschedule(postInSlot.id);
                            }}
                            className="rounded p-0.5 text-danger hover:bg-danger/10"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-text">
                          {postInSlot.content}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-text-muted">
                          {postInSlot.media && (
                            <span className="font-bold uppercase">{postInSlot.media}</span>
                          )}
                          <span className="ml-auto">{postInSlot.content.length}/280</span>
                        </div>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={`${day}-${slotNum}`}
                      type="button"
                      onClick={() => openAssignModalForSlot(day, slotNum)}
                      className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-border bg-card-alt p-3 text-left transition hover:border-accent/50 hover:bg-card"
                    >
                      <span className="text-[10px] font-bold uppercase text-text-muted">
                        Slot {slotNum}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-accent">
                        <Plus size={14} />
                        Assign
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dock */}
      <div className="border-t border-border px-5 py-3">
        <p className="flex items-center gap-2 text-xs text-text-muted">
          <Inbox size={14} />
          {draftCount} drafts ready — switch to Vault or click empty slots above
        </p>
      </div>
    </div>
  );
}
