import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { Topic, TopicConfig } from '../types';
import { ICON_MAP, COLOR_OPTIONS, THEME } from '../constants';

interface SettingsScreenProps {
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

export default function SettingsScreen({
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
}: SettingsScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.containerPadding}>
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
                style={[styles.colorBtn, active && { borderColor: opt.hex, backgroundColor: opt.bg }]}
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
          <Text style={styles.primaryBtnText}>ADD TOPIC</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, styles.topicsCard]}> 
        <Text style={styles.cardTitle}>ACTIVE TOPICS ({topics.length})</Text>
        <Text style={styles.cardSub}>Delete reassigns posts to first available topic.</Text>

        {topics.map(t => {
          const config = getTopicConfig(t.name);
          const IconComp = config.icon;
          return (
            <View key={t.name} style={styles.topicRow}>
              <View style={styles.topicInfo}>
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

      <Text style={styles.footerNote}>Content Command X • Made for degens who ship on X</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerPadding: {
    padding: 16,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  topicsCard: {
    marginTop: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.text,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: THEME.textMuted,
    marginBottom: 16,
  },
  input: {
    backgroundColor: THEME.cardAlt,
    color: THEME.text,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  label: {
    color: THEME.textMuted,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: THEME.cardAlt,
    borderWidth: 1,
    borderColor: THEME.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnActive: {
    backgroundColor: THEME.accent,
    borderColor: THEME.accent,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  colorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.cardAlt,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 8,
  },
  colorName: {
    color: THEME.text,
    fontWeight: '700',
    fontSize: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: THEME.accent,
    borderRadius: 14,
    paddingVertical: 14,
  },
  primaryBtnText: {
    color: '#0a0a0a',
    fontWeight: '800',
    fontSize: 13,
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  topicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topicIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  topicName: {
    color: THEME.text,
    fontWeight: '800',
  },
  topicMeta: {
    color: THEME.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  footerNote: {
    color: THEME.textMuted,
    textAlign: 'center',
    marginTop: 24,
    fontSize: 11,
  },
});
