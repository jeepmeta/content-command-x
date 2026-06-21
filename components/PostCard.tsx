import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, Image as ImageIcon, Film, GripVertical } from 'lucide-react-native';
import { Post } from '../types';
import CategoryBadge from './CategoryBadge';
import { THEME, MAX_POST_LENGTH } from '../constants';

interface PostCardProps {
  post: Post;
  isCompact?: boolean;
  onPress?: () => void;
  config?: any;
}

export default function PostCard({ post, isCompact = false, onPress, config }: PostCardProps) {
  const contentLines = isCompact ? 3 : 6;
  const hasMedia = !!post.media;

  return (
    <TouchableOpacity 
      activeOpacity={0.85}
      onPress={onPress}
      style={
        styles.card, 
        isCompact && styles.cardCompact,
        { borderColor: THEME.border }
      }
    >
      <View style={styles.header}>
        <CategoryBadge categoryName={post.category} config={config} size={isCompact ? 'sm' : 'md'} />
        <GripVertical size={isCompact ? 14 : 16} color={THEME.neutral} style={{ opacity: 0.6 }} />
      </View>

      <Text 
        style={
          styles.content, 
          isCompact ? styles.contentCompact : styles.contentFull,
          { color: THEME.text }
        } 
        numberOfLines={contentLines}
      >
        {post.content}
      </Text>

      <View style={[styles.footer, { borderTopColor: THEME.border }]}>
        {post.media === 'image' && (
          <View style={styles.mediaTag}>
            <ImageIcon size={isCompact ? 12 : 14} color="#60a5fa" />
            <Text style={styles.mediaText}>Image</Text>
          </View>
        )}
        {post.media === 'video' && (
          <View style={styles.mediaTag}>
            <Film size={isCompact ? 12 : 14} color="#34d399" />
            <Text style={styles.mediaText}>Video</Text>
          </View>
        )}
        {post.media === 'gif' && (
          <View style={[styles.mediaTag, { backgroundColor: 'rgba(192,132,252,0.15)' }]}>
            <Text style={[styles.mediaText, { color: '#c084fc', fontWeight: '800' }]}>GIF</Text>
          </View>
        )}
        {!post.media && !isCompact && (
          <Text style={styles.textOnly}>Text only</Text>
        )}

        <View style={styles.length}>
          <Clock size={isCompact ? 11 : 13} color={THEME.neutral} />
          <Text style={styles.lengthText}>
            {post.content.length}/{MAX_POST_LENGTH}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 4,
  },
  cardCompact: {
    padding: 12,
    minHeight: 118,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  content: {
    flex: 1,
    lineHeight: 20,
  },
  contentFull: {
    fontSize: 14,
    marginBottom: 12,
  },
  contentCompact: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    gap: 8,
  },
  mediaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(96,165,250,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mediaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#60a5fa',
  },
  textOnly: {
    fontSize: 11,
    fontStyle: 'italic',
    color: THEME.neutral,
  },
  length: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lengthText: {
    fontSize: 11,
    color: THEME.neutral,
    fontWeight: '500',
  },
});