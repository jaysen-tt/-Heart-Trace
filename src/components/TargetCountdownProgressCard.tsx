import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { SPACING, RADIUS, FONTS } from '../constants/theme';
import { parseISO, isValid, differenceInMilliseconds } from 'date-fns';

export default function TargetCountdownProgressCard() {
  const { targetDate, targetStartDate, colors, t } = useSettings();

  if (!targetDate) {
    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('pref_target_date')} Progress</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Set a target date in settings to see progress.</Text>
        </View>
    );
  }

  const target = parseISO(targetDate);
  const start = targetStartDate ? parseISO(targetStartDate) : new Date(); // Default to now if missing
  const now = new Date();

  if (!isValid(target)) return null;

  const totalDuration = differenceInMilliseconds(target, start);
  const elapsed = differenceInMilliseconds(now, start);
  
  // Calculate percentage
  let progress = 0;
  if (totalDuration > 0) {
      progress = Math.min(Math.max(elapsed / totalDuration, 0), 1);
  } else if (totalDuration < 0) {
      // Target is before start? specific edge case
      progress = 1;
  }

  // If start date is missing (legacy), progress is 0. 
  // Maybe better to hide the bar or show 0? 0 is fine.

  const percent = Math.round(progress * 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('pref_target_date')} Progress</Text>
        <Text style={[styles.percent, { color: colors.text }]}>{percent}%</Text>
      </View>
      
      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceHighlight }]}>
        <View style={[styles.progressBar, { width: `${percent}%`, backgroundColor: colors.todayIndicator }]} />
      </View>
      
      <View style={styles.footer}>
         <Text style={[styles.dateLabel, { color: colors.textTertiary }]}>
             {targetStartDate ? formatShortDate(start) : 'Start'}
         </Text>
         <Text style={[styles.dateLabel, { color: colors.textTertiary }]}>
             {formatShortDate(target)}
         </Text>
      </View>
    </View>
  );
}

function formatShortDate(date: Date) {
    return date.toISOString().split('T')[0];
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 14,
    ...FONTS.medium,
  },
  percent: {
    fontSize: 18,
    ...FONTS.bold,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  dateLabel: {
      fontSize: 12,
  }
});
