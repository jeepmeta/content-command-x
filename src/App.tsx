import { useState } from 'react';
import { Calendar, Inbox, Settings, Plus } from 'lucide-react';
import { useContentStore } from './hooks/useContentStore';
import Planner from './components/Planner';
import Vault from './components/Vault';
import Topics from './components/Topics';
import PostModal from './components/PostModal';
import AssignModal from './components/AssignModal';
import type { Post, Day } from './types';

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

  const {
    weeks,
    topics,
    selectedWeekId,
    activeTab,
    filter,
    isLoaded,
    setActiveTab,
    setSelectedWeekId,
    setFilter,
    addPost,
    updatePost,
    deletePost,
    schedulePostToSlot,
    unschedulePost,
    addWeek,
    deleteWeek,
    addTopic,
    removeTopic,
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

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-bg">
        <p className="text-text-muted">Loading your command center...</p>
      </div>
    );
  }

  const openNewPostModal = () => {
    setEditingPost(null);
    const firstTopic = topics[0]?.name || 'Stoicism';
    setFormData({ content: '', category: firstTopic, media: null });
    setIsPostModalOpen(true);
  };

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
    if (window.confirm('Purge this post permanently from your vault and any scheduled weeks?')) {
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

  const tabs = [
    { key: 'planner' as const, label: 'Planner', icon: Calendar },
    { key: 'vault' as const, label: 'Vault', icon: Inbox },
    { key: 'topics' as const, label: 'Topics', icon: Settings },
  ];

  return (
    <div className="flex h-full flex-col bg-bg">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
        <div>
          <p className="text-xs font-extrabold tracking-[0.2em] text-accent">JEEPMETA</p>
          <h1 className="text-lg font-extrabold tracking-wide text-text">CONTENT COMMAND</h1>
        </div>
        <button
          type="button"
          onClick={openNewPostModal}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-extrabold text-bg shadow-lg transition hover:bg-accent-dark"
        >
          <Plus size={18} />
          CRAFT POST
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <nav className="flex w-48 shrink-0 flex-col gap-1 border-r border-border bg-card-alt p-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                  isActive
                    ? 'bg-bg text-accent'
                    : 'text-text-muted hover:bg-card hover:text-text'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Main content */}
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
              deleteWeek={deleteWeek}
              setSelectedWeekId={setSelectedWeekId}
              newWeekName={newWeekName}
              setNewWeekName={setNewWeekName}
              handleAddWeek={handleAddWeek}
            />
          )}
          {activeTab === 'vault' && (
            <Vault
              topics={topics}
              filter={filter}
              setFilter={setFilter}
              filteredDrafts={filteredDrafts}
              getTopicConfig={getTopicConfig}
              openEditModal={openEditModal}
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
    </div>
  );
}
