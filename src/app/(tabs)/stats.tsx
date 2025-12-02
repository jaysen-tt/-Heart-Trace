import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPACING, RADIUS, FONTS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useMood } from '../../context/MoodContext';
import { useSettings } from '../../context/SettingsContext';
import { MOOD_OPTIONS } from '../../types/mood';
import { format, eachDayOfInterval, startOfYear, endOfYear, isAfter, startOfToday } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CONTAINER_PADDING = SPACING.lg;
const GAP = 4;
// Calculate dot size to fit roughly 20-25 columns depending on width
const AVAILABLE_WIDTH = width - (CONTAINER_PADDING * 2);
const COLS = Math.floor(AVAILABLE_WIDTH / (10 + GAP)); 
const DOT_SIZE = (AVAILABLE_WIDTH - (COLS - 1) * GAP) / COLS;

export default function PaletteScreen() {
  const { moodLogs } = useMood();
  const { colors, t, theme } = useSettings();

  const today = startOfToday();
  const start = startOfYear(today);
  const end = endOfYear(today);
  const daysOfYear = eachDayOfInterval({ start, end });

  const stats = useMemo(() => {
    const logs = Object.values(moodLogs);
    const total = logs.length;
    
    // Distribution
    const counts: Record<string, number> = {};
    logs.forEach(l => { if (l.mood) counts[l.mood] = (counts[l.mood] || 0) + 1; });

    return { counts, total };
  }, [moodLogs]);

  return (
    <View style={styles.container}>
      {theme === 'light' ? (
        <LinearGradient
          colors={['#d8dcdb', '#eceeeb', '#d9e2d9']}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
      )}
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('stats_title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Yearly Palette Grid */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
             <View style={styles.gridContainer}>
                 {daysOfYear.map((day, index) => {
                     const dateKey = format(day, 'yyyy-MM-dd');
                     const log = moodLogs[dateKey];
                     const moodOption = log?.mood ? MOOD_OPTIONS.find(m => m.type === log.mood) : null;
                     const isFuture = isAfter(day, today);
                     
                     return (
                         <View 
                            key={dateKey}
                            style={[
                                styles.dot,
                                { 
                                    width: DOT_SIZE, 
                                    height: DOT_SIZE, 
                                    backgroundColor: moodOption ? moodOption.color : (theme === 'dark' ? '#1A1A1A' : '#F0F0F0'), // Default dark/light grey
                                    opacity: isFuture ? 0.3 : 1
                                }
                            ]}
                         />
                     );
                 })}
             </View>
             <View style={styles.legend}>
                 <Text style={[styles.legendText, { color: colors.textTertiary }]}>
                     {daysOfYear.length} Days • {format(today, 'yyyy')}
                 </Text>
             </View>
        </View>

        {/* Simple Stats: Mood Spectrum */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <Ionicons name="pie-chart" size={20} color={colors.textSecondary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t('stats_spectrum')}</Text>
            </View>
            <View style={styles.distributionContainer}>
            {MOOD_OPTIONS.map(mood => {
                const count = stats.counts[mood.type] || 0;
                const percentage = stats.total ? (count / stats.total) * 100 : 0;
                if (percentage === 0) return null;
                return (
                <View key={mood.type} style={styles.distRow}>
                    <View style={styles.distLabelContainer}>
                        <View style={[styles.distDot, { backgroundColor: mood.color }]} />
                        <Text style={[styles.distLabel, { color: colors.text }]}>{t(`mood_${mood.type}` as any)}</Text>
                    </View>
                    <View style={[styles.distBarTrack, { backgroundColor: colors.surfaceHighlight }]}>
                        <View style={[styles.distBarFill, { width: `${percentage}%`, backgroundColor: mood.color }]} />
                    </View>
                    <Text style={[styles.distValue, { color: colors.textSecondary }]}>{count}</Text>
                </View>
                );
            })}
            {stats.total === 0 && (
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t('stats_empty')}</Text>
            )}
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, marginBottom: SPACING.md },
  title: { fontSize: 32, ...FONTS.heavy },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: 100, gap: SPACING.lg },
  
  card: {
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      borderWidth: 1,
  },
  cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
  },
  cardTitle: {
      fontSize: 16,
      ...FONTS.bold,
  },
  
  // Grid
  gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: GAP,
      justifyContent: 'flex-start',
  },
  dot: {
      borderRadius: 2, // Slightly rounded square
  },
  legend: {
      marginTop: SPACING.md,
      alignItems: 'flex-end',
  },
  legendText: {
      fontSize: 12,
      ...FONTS.medium,
  },

  // Distribution
  distributionContainer: { gap: SPACING.md },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  distLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 60 },
  distDot: { width: 8, height: 8, borderRadius: 4 },
  distLabel: { fontSize: 12, ...FONTS.medium },
  distBarTrack: { flex: 1, height: 8, borderRadius: RADIUS.round, overflow: 'hidden' },
  distBarFill: { height: '100%', borderRadius: RADIUS.round },
  distValue: { width: 30, textAlign: 'right', fontSize: 12, ...FONTS.medium },
  
  emptyText: {
      textAlign: 'center',
      padding: SPACING.lg,
      fontStyle: 'italic',
  }
});
