import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { Post, Topic, TopicConfig } from '../types';
import PostCard from './PostCard';
import { THEME } from '../constants';

interface StockpileScreenProps {
  topics: Topic[];
  filter: string;
  setFilter: (value: string) => void;
  filteredDrafts: Post[];
  getTopicConfig: (categoryName: string) => TopicConfig;
  openEditModal: (post: Post) => void;
}

export default function StockpileScreen({
  topics,
  filter,
  setFilter,
  filteredDrafts,
  getTopicConfig,
  openEditModal,
}: StockpileScreenProps) {
  return (
    <View style={styles.container}>
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
              style={[styles.filterPill, isActive && { backgroundColor: config.bg, borderColor: config.border }]}
            >
              <Icon size={14} color={isActive ? config.color : THEME.textMuted} />
              <Text style={[styles.filterText, isActive && { color: config.color }]}>{cat.name}</Text>
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
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const config = getTopicConfig(item.category);
            return (
              <View style={styles.cardWrapper}>
                <PostCard post={item} onPress={() => openEditModal(item)} config={config} />
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.cardAlt,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: THEME.accent,
    borderColor: 'transparent',
  },
  filterText: {
    color: THEME.textMuted,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: THEME.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 14,
  },
  emptySub: {
    color: THEME.textMuted,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 260,
  },
  cardWrapper: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
});
