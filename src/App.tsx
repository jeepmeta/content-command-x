import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Keyboard } from 'lucide-react';
import { useContentStore } from './hooks/useContentStore';
import Planner from './components/Planner';
import Vault from './components/Vault';
import Topics from './components/Topics';
import PostModal from './components/PostModal';
import AssignModal from './components/AssignModal';
import SidebarVault from './components/SidebarVault';
import type { Post, Day } from './types';
import { DAYS } from './constants';

export default function App() {
  const store = useContentStore();

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    category: '',
    media: null as Post['media'],
  });

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: Day; slot: number } | null>(null);

  const [newWeekName, setNewWeekName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicIcon, setNewTopicIcon] = useState('Flame');
  const [newTopicColor, setNewTopicColor] = useState('Blue');
  const [toast, setToast] = useState<string | null>(null);

  const {
    weeks,
    topics,
    selectedWeekId,
    activeTab,
    filter,
    searchQuery,
    templates,
    hasSeenOnboarding,
    isLoaded,
    setActiveTab,
    setSelectedWeekId,
    setFilter,
    setSearchQuery,
    dismissOnboarding,
    addPost,
    updatePost,
    deletePost,
    deletePosts,
    duplicatePost,
    markAsPosted,
    markPostsAsPosted,
    changeCategoryBulk,
    schedulePostToSlot,
    unschedulePost,
    addWeek,
    deleteWeek,
    addTopic,
    removeTopic,
    saveAsTemplate,
    deleteTemplate,
    createFromTemplate,
    selectedWeek,
    draftPosts,
    getPostInSlot,
    weeklyTopicCounts,
    weekPlannedCounts,
    weeklyPlannedCount,
    totalRequired,
    progressPercentage,
    filteredDrafts,
    getTopicConfig,
  } = store;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const openNewPostModal = useCallback(() => {
    setEditingPost(null);
    const firstTopic = topics[0]?.name || 'Stoicism';
    setFormData({ content: '', category: firstTopic, media: null });
    setIsPostModalOpen(true);
  }, [topics]);

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setFormData({ content: post.content, category: post.category, media: post.media });
    setIsPostModalOpen(true);
  };

  const savePost = () => {
    if (!formData.content.trim()) return;
    if (editingPost) {
      updatePost(editingPost.id, {
        content: formData.content.trim(),
        category: formData.category,
        media: formData.media,
      });
    } else {
      addPost(formData.content.trim(), formData.category, formData.media);
    }
    setIsPostModalOpen(false);
    setEditingPost(null);
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm('Purge this post permanently?')) {
      deletePost(id);
      setIsPostModalOpen(false);
    }
  };

  const openAssignModalForSlot = (day: Day, slot: number) => {
    setSelectedSlot({ day, slot });
    setIsAssignModalOpen(true);
  };

  const assignPostToSlot = (postId: string) => {
    if (!selectedSlot || !selectedWeekId) return;
    schedulePostToSlot(postId, selectedWeekId, selectedSlot.day, selectedSlot.slot);
    setIsAssignModalOpen(false);
    setSelectedSlot(null);
  };

  /** Only mutates state when dropped on a valid slot — otherwise source stays put */
  const handleDropPost = (postId: string, day: Day, slot: number) => {
    if (!selectedWeekId || !postId) return;
    schedulePostToSlot(postId, selectedWeekId, day, slot);
    showToast('Scheduled');
  };

  const handleAddWeek = () => {
    if (!newWeekName.trim()) return;
    addWeek(newWeekName.trim());
    setNewWeekName('');
  };

  const handleAddTopic = () => {
    if (!newTopicName.trim()) return;
    addTopic(newTopicName.trim(), newTopicIcon, newTopicColor);
    setNewTopicName('');
  };

  const copyToClipboard = async (text: string, label = 'Copied') => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(label);
    } catch {
      showToast('Copy failed');
    }
  };

  const formatDayExport = (day: Day) => {
    const lines: string[] = [`# ${day} — ${selectedWeek?.name || ''}`, ''];
    for (let s = 1; s <= 5; s++) {
      const p = getPostInSlot(day, s);
      if (p) {
        lines.push(`## Slot ${s} [${p.category}]`);
        lines.push(p.content);
        if (p.media) lines.push(`(${p.media})`);
        lines.push('');
      }
    }
    return lines.join('\n').trim() || `(No posts for ${day})`;
  };

  const handleCopyDay = (day: Day) => {
    copyToClipboard(formatDayExport(day), `${day} copied`);
  };

  const handleCopyWeek = () => {
    const parts = DAYS.map((d) => formatDayExport(d));
    copyToClipboard(parts.join('\n\n---\n\n'), 'Week copied');
  };

  const handleSaveAsTemplate = (postId: string) => {
    const name = window.prompt('Template name?');
    if (name?.trim()) {
      saveAsTemplate(postId, name.trim());
      showToast('Template saved');
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (e.key === 'Escape') {
        setIsPostModalOpen(false);
        setIsAssignModalOpen(false);
        return;
      }

      if (typing) return;

      const key = e.key.toLowerCase();
      if (key === 'c') {
        e.preventDefault();
        openNewPostModal();
      } else if (key === 'v') {
        e.preventDefault();
        setActiveTab('vault');
      } else if (key === 'p') {
        e.preventDefault();
        setActiveTab('planner');
      } else if (key === 't') {
        e.preventDefault();
        setActiveTab('topics');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openNewPostModal, setActiveTab]);

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-bg">
        <p className="text-text-muted">Loading your command center...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-bg">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
        <div>
          <p className="text-xs font-extrabold tracking-[0.2em] text-accent">JEEPMETA</p>
          <h1 className="text-lg font-extrabold tracking-wide text-text">CONTENT COMMAND</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="mr-2 hidden items-center gap-1 text-[11px] text-text-muted sm:flex">
            <Keyboard size={12} />
            <kbd className="rounded bg-card-alt px-1 font-mono">C</kbd> craft
            <kbd className="ml-1 rounded bg-card-alt px-1 font-mono">V</kbd> vault
            <kbd className="ml-1 rounded bg-card-alt px-1 font-mono">P</kbd> planner
          </div>
          <button
            type="button"
            onClick={openNewPostModal}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-extrabold text-bg shadow-lg transition hover:bg-accent-dark"
          >
            <Plus size={18} />
            CRAFT POST
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <SidebarVault
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          draftPosts={draftPosts}
          getTopicConfig={getTopicConfig}
          onOpenPost={openEditModal}
        />

        <main className="min-w-0 flex-1">
          {activeTab === 'planner' && (
            <Planner
              weeks={weeks}
              selectedWeekId={selectedWeekId}
              selectedWeekName={selectedWeek?.name || 'Week'}
              weekPlannedCounts={weekPlannedCounts}
              totalRequired={totalRequired}
              progressPercentage={progressPercentage}
              weeklyPlannedCount={weeklyPlannedCount}
              draftCount={draftPosts.length}
              topicCounts={weeklyTopicCounts}
              getTopicConfig={getTopicConfig}
              getPostInSlot={getPostInSlot}
              openEditModal={openEditModal}
              openAssignModalForSlot={openAssignModalForSlot}
              handleUnschedule={unschedulePost}
              handleMarkPosted={markAsPosted}
              deleteWeek={deleteWeek}
              setSelectedWeekId={setSelectedWeekId}
              newWeekName={newWeekName}
              setNewWeekName={setNewWeekName}
              handleAddWeek={handleAddWeek}
              onDropPost={handleDropPost}
              onCopyDay={handleCopyDay}
              onCopyWeek={handleCopyWeek}
            />
          )}
          {activeTab === 'vault' && (
            <Vault
              topics={topics}
              filter={filter}
              setFilter={setFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredDrafts={filteredDrafts}
              templates={templates}
              getTopicConfig={getTopicConfig}
              openEditModal={openEditModal}
              onDuplicate={duplicatePost}
              onMarkPosted={markAsPosted}
              onDelete={(id) => {
                if (window.confirm('Delete this draft?')) deletePost(id);
              }}
              onDeleteBulk={deletePosts}
              onMarkPostedBulk={markPostsAsPosted}
              onChangeCategoryBulk={changeCategoryBulk}
              onCreateFromTemplate={(id) => {
                createFromTemplate(id);
                showToast('Draft created from template');
              }}
              onDeleteTemplate={deleteTemplate}
              onSaveAsTemplate={handleSaveAsTemplate}
              onCopyText={(text) => copyToClipboard(text)}
            />
          )}
          {activeTab === 'topics' && (
            <Topics
              topics={topics}
              newTopicName={newTopicName}
              setNewTopicName={setNewTopicName}
              newTopicIcon={newTopicIcon}
              setNewTopicIcon={setNewTopicIcon}
              newTopicColor={newTopicColor}
              setNewTopicColor={setNewTopicColor}
              handleAddTopic={handleAddTopic}
              removeTopic={removeTopic}
              getTopicConfig={getTopicConfig}
            />
          )}
        </main>
      </div>

      <PostModal
        open={isPostModalOpen}
        topics={topics}
        formData={formData}
        setFormData={setFormData}
        editingPost={editingPost}
        onClose={() => setIsPostModalOpen(false)}
        onSave={savePost}
        onDelete={handleDeletePost}
        getTopicConfig={getTopicConfig}
      />

      <AssignModal
        open={isAssignModalOpen}
        draftPosts={draftPosts}
        onClose={() => setIsAssignModalOpen(false)}
        assignPostToSlot={assignPostToSlot}
        getTopicConfig={getTopicConfig}
      />

      {!hasSeenOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-lg font-extrabold text-text">Welcome to Command Center</h2>
              <button type="button" onClick={dismissOnboarding} className="text-text-muted">
                <X size={20} />
              </button>
            </div>
            <ol className="mb-5 space-y-3 text-sm text-text-muted">
              <li>
                <strong className="text-text">1. Craft</strong> — Hit{' '}
                <kbd className="rounded bg-card-alt px-1 font-mono text-xs">C</kbd> or the amber
                button. Drafts show in the left sidebar.
              </li>
              <li>
                <strong className="text-text">2. Plan</strong> — Drag from the sidebar onto a slot, or
                between slots. Drop outside = stays put.
              </li>
              <li>
                <strong className="text-text">3. Ship</strong> — Mark posted when live. Export a
                day/week anytime.
              </li>
            </ol>
            <button
              type="button"
              onClick={dismissOnboarding}
              className="w-full rounded-xl bg-accent py-3 text-sm font-extrabold text-bg hover:bg-accent-dark"
            >
              Let's go
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-text shadow-card">
          {toast}
        </div>
      )}
    </div>
  );
}
