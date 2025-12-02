import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { differenceInDays, parseISO, isValid, format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { useSettings } from '../context/SettingsContext';
import { SPACING, RADIUS, FONTS } from '../constants/theme';

export default function CountdownCard() {
  const router = useRouter();
  const { targetDate, colors, t, language } = useSettings();

  const getDaysRemaining = () => {
    if (!targetDate) return null;
    const target = parseISO(targetDate);
    if (!isValid(target)) return null;
    
    const today = new Date();
    const days = differenceInDays(target, today);
    return days > 0 ? days : 0;
  };

  const daysLeft = getDaysRemaining();

  const handlePress = () => {
      router.push('/settings');
  };

  if (!targetDate || daysLeft === null) {
    return (
        <TouchableOpacity 
            style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={handlePress}
        >
            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceHighlight }]}>
                <Ionicons name="hourglass-outline" size={24} color={colors.textSecondary} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('pref_countdown_section')}</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>Set a target date to start counting down.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.header}>
             <Ionicons name="flag-outline" size={16} color={colors.todayIndicator} />
             <Text style={[styles.label, { color: colors.todayIndicator }]}>{t('pref_countdown_section')}</Text>
        </View>
        
        <View style={styles.countContainer}>
            <Text style={[styles.number, { color: colors.text }]}>{daysLeft.toLocaleString()}</Text>
            <Text style={[styles.unit, { color: colors.textSecondary }]}>{t('stats_days')}</Text>
        </View>

        <Text style={[styles.targetDate, { color: colors.textTertiary }]}>
            {t('pref_target_date')}: {format(parseISO(targetDate), language === 'zh' ? 'yyyy年M月d日' : 'MMMM do, yyyy', { locale: language === 'zh' ? zhCN : enUS })}
        </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    flexDirection: 'column',
  },
  // Empty State
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  content: {
      flex: 1,
  },
  emptyTitle: {
      fontSize: 16,
      ...FONTS.bold,
      marginBottom: 4,
  },
  emptySub: {
      fontSize: 14,
  },
  
  // Active State
  header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: SPACING.sm,
  },
  label: {
      fontSize: 14,
      ...FONTS.bold,
      textTransform: 'uppercase',
  },
  countContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 8,
  },
  number: {
      fontSize: 100,
      fontFamily: 'BarlowCondensed_500Medium',
      lineHeight: 100,
      includeFontPadding: false,
  },
  unit: {
      fontSize: 20,
      fontFamily: 'BarlowCondensed_500Medium',
      marginBottom: 16, // Align roughly with baseline of large text
  },
  targetDate: {
      fontSize: 14,
      marginTop: SPACING.xs,
  }
});

