import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput,
  KeyboardAvoidingView, Platform, FlatList, Alert, StatusBar
} from 'react-native';
import { 
  Calendar, Inbox, Settings, Plus, X, Check, Trash2, Clock, 
  GripVertical, AlertTriangle, Image as ImageIcon, Film 
} from 'lucide-react-native';
import { useContentStore } from './hooks/useContentStore';
import PostCard from './components/PostCard';
import CategoryBadge from './components/CategoryBadge';
import { 
  DAYS, SLOTS_PER_DAY, COLOR_OPTIONS, ICON_MAP, THEME, MAX_POST_LENGTH 
} from './constants';
import { Post, Day } from './types';

export default function ContentCommandX() {
  const store = useContentStore();

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({ content: '', category: '', media: null as Post['media'] });

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: Day; slot: number } | null>(null);

  const [newWeekName, setNewWeekName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicIcon, setNewTopicIcon] = useState('Flame');
  const [newTopicColor, setNewTopicColor] = useState('Blue');

  const {
    weeks, topics, posts, selectedWeekId, activeTab, filter,
    isLoaded,
    setActiveTab, setSelectedWeekId, setFilter,
    addPost, updatePost, deletePost,
    schedulePostToSlot, unschedulePost,
    addWeek, deleteWeek, addTopic, removeTopic,
    selectedWeek, draftPosts, plannedPostsForWeek,
    getPostInSlot, getWeeklyTopicCounts, weeklyPlannedCount,
    totalRequired, progressPercentage, filteredDrafts, getTopicConfig
  } = store;

  if (!isLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: THEME.textMuted }}>Loading your command center...</Text>
      </View>
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
    Alert.alert(
      'Purge Post?',
      'This will permanently delete the post from your stockpile and any scheduled weeks.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Purge', 
          style: 'destructive', 
          onPress: () => {
            deletePost(id);
            setIsPostModalOpen(false);
          } 
        }
      ]
    );
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

  const handleUnschedule = (postId: string) => {
    unschedulePost(postId);
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

  const renderTopicDistribution = () => {
    const counts = getWeeklyTopicCounts;
    return (
      <View style={styles.distributionBar}>
        <Text style={styles.sectionLabel}>BALANCED MIX — {selectedWeek?.name}</Text>
        <View style={styles.distributionRow}>
          {Object.entries(counts).map(([topicName, count]) => {
            const config = getTopicConfig(topicName);
            return (
              <View key={topicName} style={[styles.topicChip, { borderColor: config.border }]}>
                <View style={[styles.dot, { backgroundColor: config.fill }]} />
                <Text style={styles.topicChipText}>{topicName}</Text>
                <Text style={[styles.countBadge, count > 0 ? styles.countActive : styles.countZero]}>
                  {count}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderWeekSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.weekScroll}
    >
      {weeks.map(week => {
        const isSelected = selectedWeekId === week.id;
        const weekPlanned = posts.filter(p => p.status === 'planned' && p.plannedWeekId === week.id).length;
        const isComplete = weekPlanned >= totalRequired;

        return (
          <TouchableOpacity
            key={week.id}
            onPress={() => setSelectedWeekId(week.id)}
            style=[
              styles.weekPill,
              isSelected && styles.weekPillActive
            ]
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} color={isSelected ? THEME.accent : THEME.textMuted} />
              <Text style={[styles.weekPillText, isSelected && { color: THEME.accent }]}>{week.name}</Text>
            </View>
            <View style={styles.weekMeta}>
              <Text style={[styles.weekCount, isComplete && styles.weekComplete]}>
                {weekPlanned}/35
              </Text>
              {weeks.length > 1 && (
                <TouchableOpacity 
                  onPress={() => deleteWeek(week.id)} 
                  style={styles.deleteWeekBtn}
                  hitSlop={8}
                >
                  <Trash2 size={12} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
      <View style={styles.addWeekContainer}>
        <TextInput
          value={newWeekName}
          onChangeText={setNewWeekName}
          placeholder="New week name"
          placeholderTextColor={THEME.neutral}
          style={styles.addWeekInput}
        />
        <TouchableOpacity 
          onPress={handleAddWeek} 
          disabled={!newWeekName.trim()}
          style={[styles.addWeekBtn, !newWeekName.trim() && { opacity: 0.4 }]}
        >
          <Plus size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSlot = (day: Day, slotNum: number) => {
    const postInSlot = getPostInSlot(day, slotNum);

    if (postInSlot) {
      const config = getTopicConfig(postInSlot.category);
      return (
        <TouchableOpacity 
          key={`${day}-${slotNum}`} 
          style={styles.slotOccupied}
          onPress={() => openEditModal(postInSlot)}
        >
          <View style={styles.slotHeader}>
            <CategoryBadge categoryName={postInSlot.category} config={config} size="sm" />
            <TouchableOpacity onPress={() => handleUnschedule(postInSlot.id)} hitSlop={10}>
              <X size={14} color="#ef4444" />
            </TouchableOpacity>
          </View>
          <Text style={styles.slotContent} numberOfLines={2}>{postInSlot.content}</Text>
          <View style={styles.slotFooter}>
            {postInSlot.media && <Text style={styles.slotMedia}>{postInSlot.media.toUpperCase()}</Text>}
            <Text style={styles.slotMeta}>{postInSlot.content.length}/280</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        key={`${day}-${slotNum}`} 
        style={styles.slotEmpty}
        onPress={() => openAssignModalForSlot(day, slotNum)}
      >
        <Text style={styles.slotLabel}>SLOT {slotNum}</Text>
        <View style={styles.slotAdd}>
          <Plus size={18} color={THEME.accent} />
          <Text style={styles.slotAddText}>Assign</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPlanner = () => (
    <View style={{ flex: 1 }}>
      {renderTopicDistribution()}

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{selectedWeek?.name} TARGET</Text>
          <Text style={[styles.progressValue, progressPercentage === 100 && { color: THEME.success }]}>
            {weeklyPlannedCount} / {totalRequired}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View 
            style=[
              styles.progressBarFill, 
              { width: `${progressPercentage}%` },
              progressPercentage === 100 && { backgroundColor: THEME.success }
            ]} 
          />
        </View>
      </View>

      {renderWeekSelector()}

      <ScrollView style={styles.daysScroll} contentContainerStyle={{ paddingBottom: 120 }}>
        {DAYS.map(day => (
          <View key={day} style={styles.daySection}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{day.toUpperCase()}</Text>
            </View>
            <View style={styles.slotsContainer}>
              {Array.from({ length: SLOTS_PER_DAY }).map((_, i) => renderSlot(day, i + 1))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.stockpileDock}>
        <Text style={styles.dockLabel}>
          <Inbox size={14} /> {draftPosts.length} drafts ready — switch to Vault tab or tap empty slots above
        </Text>
      </View>
    </View>
  );

  const renderStockpile = () => (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity 
          onPress={() => setFilter('All')}
          style={[styles.filterPill, filter === 'All' && styles.filterPillActive]}
        >
          <Text style={[styles.filterText, filter === 'All' && { color: '#0a0a0a' }]}>All Ideas</Text>
        </TouchableOpacity>
        {topics.map(cat => {
          const config = getTopicConfig(cat.name);
          const Icon = config.icon;
          const isActive = filter === cat.name;
          return (
            <TouchableOpacity 
              key={cat.name}
              onPress={() => setFilter(cat.name)}
              style=[
                styles.filterPill, 
                isActive && { backgroundColor: config.bg, borderColor: config.border }
              ]
            >
              <Icon size={14} color={isActive ? config.color : THEME.textMuted} />
              <Text style=[
                styles.filterText, 
                isActive && { color: config.color }
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filteredDrafts.length === 0 ? (
        <View style={styles.emptyState}>
          <Inbox size={48} color={THEME.neutral} />
          <Text style={styles.emptyTitle}>No drafts found</Text>
          <Text style={styles.emptySub}>Tap the + button to craft new content.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDrafts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const config = getTopicConfig(item.category);
            return (
              <View style={{ marginBottom: 12 }}>
                <PostCard 
                  post={item} 
                  onPress={() => openEditModal(item)} 
                  config={config}
                />
              </View>
            );
          }}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        />
      )}
    </View>
  );

  const renderSettings = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>CREATE NEW TOPIC</Text>
        <Text style={styles.cardSub}>Add angles to keep your voice balanced across weeks.</Text>

        <TextInput
          value={newTopicName}
          onChangeText={setNewTopicName}
          placeholder="e.g. Personal Wins"
          placeholderTextColor={THEME.neutral}
          style={styles.input}
        />

        <Text style={styles.label}>Icon</Text>
        <View style={styles.iconGrid}>
          {Object.keys(ICON_MAP).map(iconName => {
            const IconComp = ICON_MAP[iconName];
            const active = newTopicIcon === iconName;
            return (
              <TouchableOpacity
                key={iconName}
                onPress={() => setNewTopicIcon(iconName)}
                style={[styles.iconBtn, active && styles.iconBtnActive]}
              >
                <IconComp size={18} color={active ? '#0a0a0a' : THEME.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Accent Color</Text>
        <View style={styles.colorGrid}>
          {COLOR_OPTIONS.map(opt => {
            const active = newTopicColor === opt.name;
            return (
              <TouchableOpacity
                key={opt.name}
                onPress={() => setNewTopicColor(opt.name)}
                style=[
                  styles.colorBtn,
                  active && { borderColor: opt.hex, backgroundColor: opt.bg }
                ]
              >
                <View style={[styles.colorDot, { backgroundColor: opt.hex }]} />
                <Text style={[styles.colorName, active && { color: opt.text }]}>{opt.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity 
          onPress={handleAddTopic} 
          disabled={!newTopicName.trim()}
          style={[styles.primaryBtn, !newTopicName.trim() && { opacity: 0.5 }]}
        >
          <Plus size={18} color="#0a0a0a" />
          <Text style={styles.primaryBtnText}>ADD TOPIC</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={styles.cardTitle}>ACTIVE TOPICS ({topics.length})</Text>
        <Text style={styles.cardSub}>Delete reassigns posts to first available topic.</Text>

        {topics.map(t => {
          const config = getTopicConfig(t.name);
          const IconComp = config.icon;
          return (
            <View key={t.name} style={styles.topicRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.topicIconWrap, { backgroundColor: config.bg, borderColor: config.border }]}>
                  <IconComp size={18} color={config.color} />
                </View>
                <View>
                  <Text style={styles.topicName}>{t.name}</Text>
                  <Text style={styles.topicMeta}>Preset: {t.colorName}</Text>
                </View>
              </View>
              {topics.length > 1 && (
                <TouchableOpacity onPress={() => removeTopic(t.name)} hitSlop={8}>
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      <Text style={styles.footerNote}>
        Content Command X • Made for degens who ship on X
      </Text>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>JEEPMETA</Text>
          <Text style={styles.tagline}>CONTENT COMMAND</Text>
        </View>
        <TouchableOpacity onPress={openNewPostModal} style={styles.fab}>
          <Plus size={20} color="#0a0a0a" />
          <Text style={styles.fabText}>CRAFT POST</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'planner', label: 'Planner', icon: Calendar },
          { key: 'stockpile', label: 'Vault', icon: Inbox },
          { key: 'settings', label: 'Topics', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
            >
              <Icon size={18} color={isActive ? THEME.accent : THEME.textMuted} />
              <Text style={[styles.tabLabel, isActive && { color: THEME.accent }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.main}>
        {activeTab === 'planner' && renderPlanner()}
        {activeTab === 'stockpile' && renderStockpile()}
        {activeTab === 'settings' && renderSettings()}
      </View>

      <Modal visible={isPostModalOpen} animationType="slide" transparent onRequestClose={() => setIsPostModalOpen(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingPost ? 'EDIT POST' : 'DRAFT NEW INTEL'}</Text>
              <TouchableOpacity onPress={() => setIsPostModalOpen(false)}>
                <X size={24} color={THEME.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>TOPIC</Text>
            <ScrollView horizontal style={{ marginBottom: 12 }}>
              {topics.map(cat => {
                const config = getTopicConfig(cat.name);
                const Icon = config.icon;
                const active = formData.category === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.name}
                    onPress={() => setFormData({ ...formData, category: cat.name })}
                    style=[
                      styles.topicSelectPill,
                      active && { backgroundColor: config.bg, borderColor: config.border }
                    ]
                  >
                    <Icon size={14} color={active ? config.color : THEME.textMuted} />
                    <Text style={[styles.topicSelectText, active && { color: config.color }]}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.label}>X POST CONTENT ({formData.content.length}/{MAX_POST_LENGTH})</Text>
            <TextInput
              value={formData.content}
              onChangeText={(t) => setFormData({ ...formData, content: t })}
              multiline
              numberOfLines={6}
              placeholder="Write your quote, market take, or satire..."
              placeholderTextColor={THEME.neutral}
              style={styles.textarea}
            />

            <Text style={styles.label}>ATTACHMENT</Text>
            <View style={styles.mediaRow}>
              {(['none', 'image', 'video', 'gif'] as const).map(type => {
                const active = (type === 'none' && !formData.media) || formData.media === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFormData({ ...formData, media: type === 'none' ? null : type })}
                    style={[styles.mediaBtn, active && styles.mediaBtnActive]}
                  >
                    {type === 'none' && <X size={16} color={active ? THEME.accent : THEME.textMuted} />}
                    {type === 'image' && <ImageIcon size={16} color={active ? THEME.accent : THEME.textMuted} />}
                    {type === 'video' && <Film size={16} color={active ? THEME.accent : THEME.textMuted} />}
                    {type === 'gif' && <Text style={{ color: active ? THEME.accent : THEME.textMuted, fontWeight: '800', fontSize: 10 }}>GIF</Text>}
                    <Text style={[styles.mediaBtnText, active && { color: THEME.accent }]}>{type.toUpperCase()}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              {editingPost && (
                <TouchableOpacity onPress={() => handleDeletePost(editingPost.id)} style={styles.dangerBtn}>
                  <Trash2 size={18} color="#fff" />
                  <Text style={styles.dangerBtnText}>PURGE</Text>
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => setIsPostModalOpen(false)} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={savePost} 
                disabled={!formData.content.trim()}
                style={[styles.primaryBtn, !formData.content.trim() && { opacity: 0.5 }]}
              >
                <Text style={styles.primaryBtnText}>{editingPost ? 'UPDATE' : 'STORE IN VAULT'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={isAssignModalOpen} animationType="fade" transparent onRequestClose={() => setIsAssignModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '70%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ASSIGN TO {selectedSlot?.day} SLOT {selectedSlot?.slot}</Text>
              <TouchableOpacity onPress={() => { setIsAssignModalOpen(false); setSelectedSlot(null); }}>
                <X size={24} color={THEME.textMuted} />
              </TouchableOpacity>
            </View>

            {draftPosts.length === 0 ? (
              <Text style={{ color: THEME.textMuted, textAlign: 'center', padding: 20 }}>No drafts available. Create some first.</Text>
            ) : (
              <FlatList
                data={draftPosts}
                keyExtractor={p => p.id}
                renderItem={({ item }) => {
                  const config = getTopicConfig(item.category);
                  return (
                    <TouchableOpacity onPress={() => assignPostToSlot(item.id)} style={{ marginBottom: 8 }}>
                      <PostCard post={item} isCompact config={config} />
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.bg,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.accent,
    letterSpacing: 1.5,
    marginTop: -2,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  fabText: {
    color: '#0a0a0a',
    fontWeight: '800',
    fontSize: 13,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: THEME.cardAlt,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tabItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: THEME.accent,
  },
  tabLabel: {
    color: THEME.textMuted,
    fontWeight: '700',
    fontSize: 13,
  },
  main: {
    flex: 1,
  },
  distributionBar: {
    backgroundColor: THEME.cardAlt,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  topicChipText: {
    color: THEME.text,
    fontSize: 11,
    fontWeight: '600',
  },
  countBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  countActive: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    color: THEME.accent,
  },
  countZero: {
    backgroundColor: THEME.cardAlt,
    color: THEME.neutral,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.cardAlt,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textMuted,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.accent,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: THEME.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME.accent,
    borderRadius: 3,
  },
  weekScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  weekPill: {
    backgroundColor: THEME.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: THEME.border,
    minWidth: 110,
  },
  weekPillActive: {
    borderColor: THEME.accent,
    backgroundColor: 'rgba(245,158,11,0.08)',
  },
  weekPillText: {
    color: THEME.text,
    fontWeight: '700',
    fontSize: 13,
  },
  weekMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  weekCount: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: THEME.neutral,
    backgroundColor: THEME.bg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  weekComplete: {
    color: THEME.success,
    backgroundColor: 'rgba(52,211,153,0.15)',
  },
  deleteWeekBtn: {
    padding: 2,
  },
  addWeekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  addWeekInput: {
    backgroundColor: THEME.card,
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    minWidth: 90,
  },
  addWeekBtn: {
    backgroundColor: THEME.accent,
    padding: 8,
    borderRadius: 8,
    marginLeft: 6,
  },
  daysScroll: {
    flex: 1,
    paddingHorizontal: 12,
  },
  daySection: {
    marginBottom: 16,
  },
  dayHeader: {
    backgroundColor: THEME.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  dayTitle: {
    color: THEME.text,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
  slotsContainer: {
    gap: 6,
  },
  slotEmpty: {
    backgroundColor: THEME.cardAlt,
    borderWidth: 2,
    borderColor: THEME.border,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 14,
    minHeight: 78,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotLabel: {
    position: 'absolute',
    top: 8,
    left: 10,
    fontSize: 9,
    fontWeight: '800',
    color: THEME.neutral,
    letterSpacing: 0.5,
  },
  slotAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotAddText: {
    color: THEME.accent,
    fontWeight: '700',
    fontSize: 13,
  },
  slotOccupied: {
    backgroundColor: THEME.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    minHeight: 78,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  slotContent: {
    color: THEME.text,
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  slotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    alignItems: 'center',
  },
  slotMedia: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.accent,
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  slotMeta: {
    fontSize: 10,
    color: THEME.neutral,
  },
  stockpileDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.card,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    alignItems: 'center',
  },
  dockLabel: {
    color: THEME.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  filterScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: THEME.cardAlt,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  filterPillActive: {
    backgroundColor: THEME.accent,
    borderColor: THEME.accent,
  },
  filterText: {
    color: THEME.textMuted,
    fontWeight: '700',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: THEME.textMuted,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySub: {
    color: THEME.neutral,
    textAlign: 'center',
    marginTop: 6,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardSub: {
    color: THEME.textMuted,
    fontSize: 12,
    marginBottom: 14,
  },
  input: {
    backgroundColor: THEME.bg,
    color: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 12,
  },
  label: {
    color: THEME.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  iconBtn: {
    width: 42,
    height: 42,
    backgroundColor: THEME.bg,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  iconBtnActive: {
    backgroundColor: THEME.accent,
    borderColor: THEME.accent,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  colorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.bg,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  colorName: {
    color: THEME.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.accent,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#0a0a0a',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  topicIconWrap: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  topicName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  topicMeta: {
    color: THEME.textMuted,
    fontSize: 11,
  },
  footerNote: {
    textAlign: 'center',
    color: THEME.neutral,
    fontSize: 11,
    marginTop: 30,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textarea: {
    backgroundColor: THEME.bg,
    color: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 140,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 16,
  },
  topicSelectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.bg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  topicSelectText: {
    color: THEME.textMuted,
    fontWeight: '700',
    fontSize: 12,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  mediaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: THEME.bg,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  mediaBtnActive: {
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderColor: THEME.accent,
  },
  mediaBtnText: {
    color: THEME.textMuted,
    fontWeight: '700',
    fontSize: 11,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  secondaryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  secondaryBtnText: {
    color: THEME.textMuted,
    fontWeight: '700',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
  },
  dangerBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
});