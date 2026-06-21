import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { Post, TopicConfig } from '../types';
import PostCard from './PostCard';
import { THEME } from '../constants';

interface AssignModalProps {
  visible: boolean;
  draftPosts: Post[];
  onClose: () => void;
  assignPostToSlot: (postId: string) => void;
  getTopicConfig: (categoryName: string) => TopicConfig;
}

export default function AssignModal({
  visible,
  draftPosts,
  onClose,
  assignPostToSlot,
  getTopicConfig,
}: AssignModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '70%' }]}> 
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>ASSIGN POST</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={THEME.textMuted} />
            </TouchableOpacity>
          </View>

          {draftPosts.length === 0 ? (
            <Text style={styles.emptyState}>No drafts available. Create some first.</Text>
          ) : (
            <FlatList
              data={draftPosts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const config = getTopicConfig(item.category);
                return (
                  <TouchableOpacity onPress={() => assignPostToSlot(item.id)} style={styles.draftItem}>
                    <PostCard post={item} isCompact config={config} />
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: THEME.bg,
    borderRadius: 24,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: '900',
  },
  emptyState: {
    color: THEME.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
  draftItem: {
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 16,
  },
});
