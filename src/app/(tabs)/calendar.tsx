import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPACING, RADIUS, FONTS } from '../../constants/theme';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isAfter, startOfToday } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PanGestureHandler, State, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { useMood } from '../../context/MoodContext';
import { useSettings } from '../../context/SettingsContext';
import { MOOD_OPTIONS, DayLog } from '../../types/mood';
import ProgressSection from '../../components/ProgressSection';
import { LinearGradient } from 'expo-linear-gradient';
import { MoodSelectorModal } from '../../components/MoodSelectorModal';
import { AnimatedSparkle } from '../../components/AnimatedSparkle';
import { PhotoPreviewModal } from '../../components/PhotoPreviewModal';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - SPACING.md * 2) / 7;

type ViewMode = 'mood' | 'photos';

export default function CalendarScreen() {
  const { moodLogs, saveLog } = useMood();
  const { colors, t, theme, language } = useSettings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('mood');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDateForLog, setSelectedDateForLog] = useState<Date>(new Date());
  const [sparkle, setSparkle] = useState<{ color: string; key: number } | null>(null);
  
  // Photo Preview State
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDate, setPreviewDate] = useState<string | null>(null);

  const nextMonth = () => { setCurrentDate(addMonths(currentDate, 1)); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };
  const prevMonth = () => { setCurrentDate(subMonths(currentDate, 1)); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const toggleViewMode = (mode: ViewMode) => {
      if (viewMode !== mode) {
          Haptics.selectionAsync();
          setViewMode(mode);
      }
  };

  const handleDayPress = (day: Date) => {
      const isFuture = isAfter(day, startOfToday());
      if (isFuture) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
      }
      
      const dateKey = format(day, 'yyyy-MM-dd');
      const log = moodLogs[dateKey];

      if (viewMode === 'photos' && log?.photoUri) {
          Haptics.selectionAsync();
          setPreviewDate(dateKey);
          setPreviewVisible(true);
          return;
      }
      
      Haptics.selectionAsync();
      setSelectedDateForLog(day);
      setModalVisible(true);
  };

  const handleSaveLog = async (logData: Omit<DayLog, 'date'>) => {
    setModalVisible(false);
    const moodOption = MOOD_OPTIONS.find(m => m.type === logData.mood);
    if (moodOption) setSparkle({ color: moodOption.color, key: Date.now() });

    const dateKey = format(selectedDateForLog, 'yyyy-MM-dd');
    const existingLog = moodLogs[dateKey] || { date: dateKey };

    const newLog: DayLog = { 
      ...existingLog,
      ...logData 
    };
    await saveLog(newLog);
  };

  const onGestureEvent = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
        const { translationX } = event.nativeEvent;
        if (translationX > 50) {
            prevMonth();
        } else if (translationX < -50) {
            nextMonth();
        }
    }
  };

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
        <Text style={[styles.title, { color: colors.text }]}>{t('calendar_title')}</Text>
        
        <View style={[styles.toggleContainer, { backgroundColor: colors.surfaceHighlight }]}>
            <TouchableOpacity 
                style={[styles.toggleBtn, viewMode === 'mood' && { backgroundColor: colors.text }]}
                onPress={() => toggleViewMode('mood')}
            >
                <Ionicons name="happy" size={16} color={viewMode === 'mood' ? colors.background : colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.toggleBtn, viewMode === 'photos' && { backgroundColor: colors.text }]}
                onPress={() => toggleViewMode('photos')}
            >
                <Ionicons name="image" size={16} color={viewMode === 'photos' ? colors.background : colors.textSecondary} />
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
            <ProgressSection />
        </View>

        <View style={styles.calendarWrapper}>
          {/* Month Nav */}
          <View style={styles.monthHeader}>
            <Text style={[styles.monthTitle, { color: colors.text }]}>
                {format(currentDate, language === 'zh' ? 'yyyy年 MMMM' : 'MMMM yyyy', { locale: language === 'zh' ? zhCN : enUS })}
            </Text>
            <View style={styles.navButtons}>
                <TouchableOpacity onPress={prevMonth} hitSlop={10}><Ionicons name="chevron-back" size={20} color={colors.textSecondary} /></TouchableOpacity>
                <TouchableOpacity onPress={nextMonth} hitSlop={10}><Ionicons name="chevron-forward" size={20} color={colors.textSecondary} /></TouchableOpacity>
            </View>
          </View>

          <PanGestureHandler
            onHandlerStateChange={onGestureEvent}
            activeOffsetX={[-30, 30]}
            failOffsetY={[-30, 30]}
          >
            <View style={styles.calendarContainer}>
              <View style={styles.weekDaysRow}>
                {weekDays.map((day, i) => <Text key={i} style={[styles.weekDayText, { color: colors.textTertiary }]}>{day}</Text>)}
              </View>
              <View style={styles.daysGrid}>
                {calendarDays.map((day) => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const log = moodLogs[dateKey];
                  const moodOption = log?.mood ? MOOD_OPTIONS.find(m => m.type === log.mood) : null;
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isToday = isSameDay(day, new Date());
                  const isFuture = isAfter(day, startOfToday());

                  return (
                    <TouchableOpacity 
                      key={day.toString()} 
                      style={[
                        styles.dayCell, 
                        !isCurrentMonth && styles.opacityLow,
                        isFuture && styles.opacityVeryLow
                      ]}
                      onPress={() => handleDayPress(day)}
                      activeOpacity={isFuture ? 1 : 0.7}
                    >
                      {viewMode === 'photos' && log?.photoUri ? (
                           <View style={[
                               styles.photoContainer, 
                               { 
                                   backgroundColor: colors.surfaceHighlight, 
                                   borderColor: colors.border,
                                   justifyContent: 'center',
                                   alignItems: 'center'
                               }
                           ]}>
                               <Text style={[styles.dayText, { position: 'absolute', color: colors.textTertiary }]}>
                                   {format(day, 'd')}
                               </Text>
                               <Image source={{ uri: log.photoUri }} style={styles.dayPhoto} />
                           </View>
                      ) : (
                          moodOption && viewMode === 'mood' ? (
                              <View style={[styles.moodDot, { backgroundColor: moodOption.color, shadowColor: moodOption.color }]} />
                          ) : (
                              <View style={[styles.emptyDot, { backgroundColor: colors.surface }, isToday && { borderWidth: 1, borderColor: colors.textSecondary }]}>
                                  <Text style={[styles.dayText, { color: colors.textSecondary }, isToday && { color: colors.text }]}>{format(day, 'd')}</Text>
                              </View>
                          )
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </PanGestureHandler>
        </View>

        <View style={styles.summaryBox}>
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                {viewMode === 'mood' 
                    ? `${t('calendar_mood_tracked')} ${Object.keys(moodLogs).length} ${t('calendar_days')}`
                    : `${t('calendar_mood_tracked')} ${Object.values(moodLogs).filter(l => l.photoUri).length} ${t('calendar_moments')}`
                }
            </Text>
        </View>

      </ScrollView>

      <MoodSelectorModal
        visible={modalVisible}
        selectedDate={selectedDateForLog}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveLog}
        initialLog={moodLogs[format(selectedDateForLog, 'yyyy-MM-dd')] || { date: format(selectedDateForLog, 'yyyy-MM-dd') }}
      />

      <PhotoPreviewModal 
        visible={previewVisible}
        initialDate={previewDate || ''}
        logs={Object.values(moodLogs)}
        onClose={() => setPreviewVisible(false)}
      />
      
      {sparkle && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <AnimatedSparkle key={sparkle.key} color={sparkle.color} onComplete={() => setSparkle(null)} />
          </View>
        </View>
      )}
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
      paddingHorizontal: SPACING.lg, 
      paddingTop: SPACING.lg, 
      marginBottom: SPACING.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
  },
  title: { fontSize: 32, ...FONTS.heavy },
  
  toggleContainer: {
      flexDirection: 'row',
      borderRadius: RADIUS.round,
      padding: 4,
      gap: 4,
  },
  toggleBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
  },

  calendarWrapper: { paddingHorizontal: SPACING.md },
  calendarContainer: {},
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg, paddingHorizontal: SPACING.sm },
  monthTitle: { fontSize: 18, ...FONTS.bold },
  navButtons: { flexDirection: 'row', gap: SPACING.lg },
  
  weekDaysRow: { flexDirection: 'row', marginBottom: SPACING.md },
  weekDayText: { width: CELL_SIZE, textAlign: 'center', fontSize: 12, ...FONTS.bold },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: CELL_SIZE, height: CELL_SIZE, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xs },
  
  emptyDot: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  moodDot: { width: 36, height: 36, borderRadius: 18, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 5 },
  
  photoContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
  },
  dayPhoto: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
  },

  dayText: { fontSize: 14, ...FONTS.medium },
  
  opacityLow: { opacity: 0.7 },
  opacityVeryLow: { opacity: 0.5 },
  
  summaryBox: { marginTop: SPACING.xl, alignItems: 'center' },
  summaryText: { fontSize: 14, ...FONTS.medium },
});
