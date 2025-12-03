import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { format, parseISO } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS, SPACING, FONTS } from '../constants/theme';
import { DayLog } from '../types/mood';
import { useSettings } from '../context/SettingsContext';
import { JournalCard } from './JournalCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MonthArchiveItemProps {
  month: string; // "YYYY-MM"
  logs: DayLog[];
  onLogPress: (log: DayLog) => void;
  onLogPin: (date: string) => void;
  onLogDelete: (date: string) => void;
}

export const MonthArchiveItem: React.FC<MonthArchiveItemProps> = ({ month, logs, onLogPress, onLogPin, onLogDelete }) => {
  const { colors, t, language } = useSettings();
  const [expanded, setExpanded] = useState(false);
  const locale = language === 'zh' ? zhCN : enUS;

  const dateObj = parseISO(`${month}-01`); // Create a date object for formatting
  
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity 
        style={[styles.header, expanded && { borderBottomWidth: 1, borderBottomColor: colors.border }]} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceHighlight }]}>
                <Ionicons name={expanded ? "folder-open-outline" : "folder-outline"} size={20} color={colors.text} />
            </View>
            <Text style={[styles.monthTitle, { color: colors.text }]}>
                {format(dateObj, language === 'zh' ? 'yyyy年 M月' : 'MMMM yyyy', { locale })}
            </Text>
            <View style={[styles.badge, { backgroundColor: colors.surfaceHighlight }]}>
                <Text style={[styles.badgeText, { color: colors.textSecondary }]}>{logs.length}</Text>
            </View>
        </View>
        <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={colors.textSecondary} 
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.list}>
            {logs.map(log => (
                <JournalCard 
                    key={log.date}
                    log={log}
                    onPress={() => onLogPress(log)}
                    onPin={() => onLogPin(log.date)}
                    onDelete={() => onLogDelete(log.date)}
                />
            ))}
            
            {/* Footer Collapse Button */}
            <TouchableOpacity 
                style={[styles.footer, { borderTopColor: colors.border }]} 
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <Ionicons name="chevron-up" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
  },
  monthTitle: {
      fontSize: 16,
      ...FONTS.bold,
  },
  badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
  },
  badgeText: {
      fontSize: 12,
      ...FONTS.medium,
  },
  list: {
      padding: SPACING.sm,
      gap: SPACING.sm,
  },
  footer: {
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      marginTop: SPACING.xs,
      borderTopWidth: 1,
      opacity: 0.5,
  }
});
