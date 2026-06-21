import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Calendar, Inbox, Plus, Trash2, X } from 'lucide-react-native';
import CategoryBadge from './CategoryBadge';
import { Day, Post, TopicConfig, Week } from '../types';
import { DAYS, SLOTS_PER_DAY, THEME } from '../constants';

interface PlannerScreenProps {
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

export default function PlannerScreen({
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
}: PlannerScreenProps) {
  const renderTopicDistribution = () => (
    <View style={styles.distributionBar}>
      <Text style={styles.sectionLabel}>BALANCED MIX — {selectedWeekName}</Text>
      <View style={styles.distributionRow}>
        {Object.entries(topicCounts).map(([topicName, count]) => {
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

  const renderWeekSelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.weekScroll}
    >
      {weeks.map(week => {
        const isSelected = selectedWeekId === week.id;
        const weekPlanned = weekPlannedCounts[week.id] ?? 0;
        const isComplete = weekPlanned >= totalRequired;

        return (
          <TouchableOpacity
            key={week.id}
            onPress={() => setSelectedWeekId(week.id)}
            style={[styles.weekPill, isSelected && styles.weekPillActive]}
          >
            <View style={styles.weekHeading}>
              <Calendar size={14} color={isSelected ? THEME.accent : THEME.textMuted} />
              <Text style={[styles.weekPillText, isSelected && { color: THEME.accent }]}>{week.name}</Text>
            </View>
            <View style={styles.weekMeta}>
              <Text style={[styles.weekCount, isComplete && styles.weekComplete]}>
                {weekPlanned}/{totalRequired}
              </Text>
              {weeks.length > 1 && (
                <TouchableOpacity onPress={() => deleteWeek(week.id)} style={styles.deleteWeekBtn} hitSlop={8}>
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

  return (
    <View style={styles.container}>
      {renderTopicDistribution()}

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{selectedWeekName} TARGET</Text>
          <Text style={[styles.progressValue, progressPercentage === 100 && { color: THEME.success }]}>
            {weeklyPlannedCount} / {totalRequired}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
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
          <Inbox size={14} /> {draftCount} drafts ready — switch to Vault tab or tap empty slots above
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    marginBottom: 10,
  },
  distributionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  topicChipText: {
    fontSize: 11,
    color: THEME.text,
    fontWeight: '700',
  },
  countBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: '700',
  },
  countActive: {
    color: THEME.text,
    backgroundColor: THEME.accent,
  },
  countZero: {
    color: THEME.textMuted,
    backgroundColor: THEME.card,
  },
  weekScroll: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  weekPill: {
    backgroundColor: THEME.cardAlt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 12,
    marginRight: 12,
    minWidth: 120,
  },
  weekPillActive: {
    borderColor: THEME.accent,
    backgroundColor: THEME.bg,
  },
  weekHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  weekPillText: {
    color: THEME.textMuted,
    fontWeight: '700',
  },
  weekMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekCount: {
    color: THEME.text,
    fontWeight: '800',
  },
  weekComplete: {
    color: THEME.success,
  },
  deleteWeekBtn: {
    padding: 4,
  },
  addWeekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.cardAlt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addWeekInput: {
    flex: 1,
    color: THEME.text,
    paddingVertical: 8,
    marginRight: 10,
  },
  addWeekBtn: {
    backgroundColor: THEME.accent,
    borderRadius: 10,
    padding: 10,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    color: THEME.textMuted,
    fontWeight: '700',
    fontSize: 11,
  },
  progressValue: {
    color: THEME.text,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: THEME.cardAlt,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME.accent,
  },
  daysScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  daySection: {
    marginBottom: 18,
  },
  dayHeader: {
    marginBottom: 10,
  },
  dayTitle: {
    color: THEME.textMuted,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotOccupied: {
    backgroundColor: THEME.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    minWidth: '47%',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  slotContent: {
    color: THEME.text,
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 18,
  },
  slotFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotMedia: {
    color: THEME.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  slotMeta: {
    color: THEME.textMuted,
    fontSize: 10,
  },
  slotEmpty: {
    backgroundColor: THEME.cardAlt,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    minWidth: '47%',
  },
  slotLabel: {
    color: THEME.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 10,
  },
  slotAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slotAddText: {
    color: THEME.accent,
    fontWeight: '800',
  },
  stockpileDock: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  dockLabel: {
    color: THEME.textMuted,
    fontSize: 12,
  },
});
