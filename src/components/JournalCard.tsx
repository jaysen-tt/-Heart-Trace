import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS, SPACING, FONTS } from '../constants/theme';
import { DayLog, MOOD_OPTIONS } from '../types/mood';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../context/SettingsContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface JournalCardProps {
  log: DayLog;
  onPress: () => void;
  onPin: () => void;
  onDelete: () => void;
}

export const JournalCard: React.FC<JournalCardProps> = ({ log, onPress, onPin, onDelete }) => {
  const { colors, t, language } = useSettings();
  const [expanded, setExpanded] = useState(false);
  const moodOption = MOOD_OPTIONS.find(m => m.type === log.mood);
  const date = new Date(log.date);
  const locale = language === 'zh' ? zhCN : enUS;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleLongPress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Alert.alert(
          t('journal_manage'),
          `${t('journal_action_for')} ${format(date, language === 'zh' ? 'MMMMd日' : 'MMMM d', { locale })}`,
          [
              { text: log.isPinned ? t('journal_unpin') : t('journal_pin'), onPress: onPin },
              { text: t('journal_delete'), onPress: onDelete, style: 'destructive' },
              { text: t('journal_cancel'), style: 'cancel' }
          ]
      );
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => { toggleExpand(); onPress(); }} 
      onLongPress={handleLongPress}
      style={[
          styles.card, 
          { backgroundColor: colors.surface, borderColor: colors.border },
          expanded && { backgroundColor: colors.surfaceHighlight, borderColor: colors.todayIndicator },
          log.isPinned && { borderColor: colors.todayIndicator, backgroundColor: 'rgba(255, 165, 0, 0.05)' }
        ]}
    >
      <View style={styles.header}>
        {/* Date Badge */}
        <View style={[styles.dateBadge, log.isPinned && { borderWidth: 1, borderColor: colors.todayIndicator }]}>
          {log.isPinned && (
              <View style={[styles.pinIcon, { backgroundColor: colors.surface }]}>
                  <Ionicons name="pin" size={10} color={colors.todayIndicator} />
              </View>
          )}
          <Text style={[styles.dayText, { color: colors.text }]}>{format(date, 'd')}</Text>
          <Text style={[styles.monthText, { color: colors.textSecondary }]}>{format(date, 'MMM', { locale })}</Text>
        </View>

        {/* Content Summary */}
        <View style={styles.summary}>
          <View style={styles.moodRow}>
            {moodOption && (
              <View style={[styles.moodDot, { backgroundColor: moodOption.color, shadowColor: moodOption.color }]} />
            )}
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {moodOption ? t(`mood_${moodOption.type}` as any) : t('no_mood')}
            </Text>
          </View>
          <Text style={[styles.previewText, { color: colors.textSecondary }]} numberOfLines={expanded ? 0 : 1}>
            {log.note || t('journal_no_details')}
          </Text>
        </View>

        <Ionicons 
          name={expanded ? "create-outline" : "chevron-down"} 
          size={20} 
          color={colors.textSecondary} 
        />
      </View>

      {expanded && (
        <View style={[styles.details, { borderTopColor: 'rgba(255,255,255,0.05)' }]}>
          {log.tags && log.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {log.tags.map(tag => (
                <View key={tag} style={[styles.tagChip, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                    <Text style={[styles.tagText, { color: colors.text }]}>
                        {t(`tag_${tag.toLowerCase()}` as any)}
                    </Text>
                </View>
              ))}
            </View>
          )}
          
          {log.tasks && log.tasks.length > 0 && (
            <View style={styles.statsRow}>
              <Ionicons name="checkbox-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {log.tasks.filter(t => t.completed).length}/{log.tasks.length} {t('journal_tasks')}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  dateBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md,
    width: 50,
    height: 50,
  },
  pinIcon: {
      position: 'absolute',
      top: -4,
      right: -4,
      borderRadius: 6,
      padding: 2,
  },
  dayText: {
    fontSize: 18,
    ...FONTS.bold,
  },
  monthText: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  summary: {
    flex: 1,
    gap: 4,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  title: {
    fontSize: 16,
    ...FONTS.bold,
  },
  previewText: {
    fontSize: 13,
  },
  details: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    gap: SPACING.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  tagText: {
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
  },
});
