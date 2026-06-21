import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { X, Image as ImageIcon, Film } from 'lucide-react-native';
import { Post, Topic, TopicConfig } from '../types';
import { MAX_POST_LENGTH, THEME } from '../constants';

interface PostModalProps {
  visible: boolean;
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
  visible,
  topics,
  formData,
  setFormData,
  editingPost,
  onClose,
  onSave,
  onDelete,
  getTopicConfig,
}: PostModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingPost ? 'EDIT POST' : 'DRAFT NEW INTEL'}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={THEME.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>TOPIC</Text>
          <ScrollView horizontal style={styles.topicScroll} showsHorizontalScrollIndicator={false}>
            {topics.map(cat => {
              const config = getTopicConfig(cat.name);
              const Icon = config.icon;
              const active = formData.category === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => setFormData({ ...formData, category: cat.name })}
                  style={[styles.topicSelectPill, active && { backgroundColor: config.bg, borderColor: config.border }]}
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
            onChangeText={(content) => setFormData({ ...formData, content })}
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
                  {type === 'gif' && (
                    <Text style={{ color: active ? THEME.accent : THEME.textMuted, fontWeight: '800', fontSize: 10 }}>GIF</Text>
                  )}
                  <Text style={[styles.mediaBtnText, active && { color: THEME.accent }]}>{type.toUpperCase()}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.modalActions}>
            {editingPost && (
              <TouchableOpacity onPress={() => onDelete(editingPost.id)} style={styles.dangerBtn}>
                <Text style={styles.dangerBtnText}>PURGE</Text>
              </TouchableOpacity>
            )}
            <View style={styles.actionSpacer} />
            <TouchableOpacity onPress={onClose} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSave} disabled={!formData.content.trim()} style={[styles.primaryBtn, !formData.content.trim() && { opacity: 0.5 }]}>
              <Text style={styles.primaryBtnText}>{editingPost ? 'UPDATE' : 'STORE IN VAULT'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: '900',
  },
  label: {
    color: THEME.textMuted,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 12,
  },
  topicScroll: {
    marginBottom: 12,
  },
  topicSelectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.cardAlt,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    gap: 6,
  },
  topicSelectText: {
    color: THEME.text,
    fontWeight: '700',
    fontSize: 12,
  },
  textarea: {
    backgroundColor: THEME.cardAlt,
    color: THEME.text,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 14,
    minHeight: 140,
    textAlignVertical: 'top',
  },
  mediaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.cardAlt,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  mediaBtnActive: {
    borderColor: THEME.accent,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  mediaBtnText: {
    color: THEME.text,
    fontWeight: '700',
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  actionSpacer: {
    flex: 1,
  },
  dangerBtn: {
    backgroundColor: THEME.danger,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
  },
  dangerBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: THEME.cardAlt,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
  },
  secondaryBtnText: {
    color: THEME.textMuted,
    fontWeight: '800',
  },
  primaryBtn: {
    backgroundColor: THEME.accent,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryBtnText: {
    color: '#0a0a0a',
    fontWeight: '800',
  },
});
