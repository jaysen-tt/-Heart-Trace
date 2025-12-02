import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { SPACING, RADIUS, FONTS } from '../constants/theme';
import { startOfYear, endOfYear, differenceInMilliseconds } from 'date-fns';

export default function AnnualCountdownProgressCard() {
  const { colors } = useSettings();

  const now = new Date();
  const start = startOfYear(now);
  const end = endOfYear(now);

  const totalDuration = differenceInMilliseconds(end, start);
  const elapsed = differenceInMilliseconds(now, start);
  
  const progress = Math.min(Math.max(elapsed / totalDuration, 0), 1);
  const percent = Math.round(progress * 100);
  const year = now.getFullYear();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{year} Progress</Text>
        <Text style={[styles.percent, { color: colors.text }]}>{percent}%</Text>
      </View>
      
      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceHighlight }]}>
        <View style={[styles.progressBar, { width: `${percent}%`, backgroundColor: colors.todayIndicator }]} />
      </View>
      
      <View style={styles.footer}>
         <Text style={[styles.dateLabel, { color: colors.textTertiary }]}>
             Day {getDayOfYear(now)}
         </Text>
         <Text style={[styles.dateLabel, { color: colors.textTertiary }]}>
             365 Days
         </Text>
      </View>
    </View>
  );
}

function getDayOfYear(date: Date) {
  const start = startOfYear(date);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay) + 1;
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
