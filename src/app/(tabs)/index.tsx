import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPACING, RADIUS, FONTS } from '../../constants/theme';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { useMood } from '../../context/MoodContext';
import { useSettings } from '../../context/SettingsContext';
import { DayLog, MOOD_OPTIONS, Task } from '../../types/mood';
import { MoodSelectorModal } from '../../components/MoodSelectorModal';
import { AnimatedSparkle } from '../../components/AnimatedSparkle';
import { TasksCard } from '../../components/TasksCard';
import { HabitsCard } from '../../components/HabitsCard';
import { PhotoCard } from '../../components/PhotoCard';
import CountdownCard from '../../components/CountdownCard';
import ProgressSection from '../../components/ProgressSection';
import { MoodLiveBackground } from '../../components/MoodLiveBackground';
import { useRouter } from 'expo-router';

import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TodayScreen() {
  const { moodLogs, saveLog } = useMood();
  const { colors, t, language, name, avatarUri, theme } = useSettings();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [sparkle, setSparkle] = useState<{ color: string; key: number } | null>(null);
  
  const today = new Date();
  const dateKey = format(today, 'yyyy-MM-dd');
  const todayLog = moodLogs[dateKey] || { date: dateKey };
  
  const selectedMood = todayLog.mood ? MOOD_OPTIONS.find(m => m.type === todayLog.mood) : null;

  const handleSaveLog = async (logData: Omit<DayLog, 'date'>) => {
    setModalVisible(false);
    const moodOption = MOOD_OPTIONS.find(m => m.type === logData.mood);
    if (moodOption) setSparkle({ color: moodOption.color, key: Date.now() });

    const newLog: DayLog = { 
      ...todayLog,
      ...logData 
    };
    await saveLog(newLog);
  };

  // Tasks
  const handleAddTask = async (text: string) => {
    const newTask: Task = { id: Date.now().toString(), text, completed: false };
    const updatedTasks = [...(todayLog.tasks || []), newTask];
    await saveLog({ ...todayLog, tasks: updatedTasks });
  };

  const handleToggleTask = async (taskId: string) => {
    const updatedTasks = (todayLog.tasks || []).map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    await saveLog({ ...todayLog, tasks: updatedTasks });
  };

  const handleDeleteTask = async (taskId: string) => {
    const updatedTasks = (todayLog.tasks || []).filter(t => t.id !== taskId);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await saveLog({ ...todayLog, tasks: updatedTasks });
  };

  // Habits
  const handleToggleHabit = async (habitId: string) => {
    const currentHabits = todayLog.habits || {};
    const newHabits = { ...currentHabits, [habitId]: !currentHabits[habitId] };
    await saveLog({ ...todayLog, habits: newHabits });
  };

  // Photo
  const handlePhotoSelect = async (uri: string | undefined) => {
    await saveLog({ ...todayLog, photoUri: uri });
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
             {avatarUri && <Image source={{ uri: avatarUri }} style={styles.avatar} />}
             <View>
                <Text style={[styles.greeting, { color: colors.text }]}>
                    {t('greeting')} {name && name.trim().length > 0 ? name : ''}
                </Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                    {format(today, language === 'zh' ? 'M月d日 EEEE' : 'EEEE, MMMM do', { locale: language === 'zh' ? zhCN : enUS })}
                </Text>
             </View>
          </View>
          <TouchableOpacity 
            style={[styles.settingsBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]} 
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Countdown & Progress Block */}
        <View style={{ gap: SPACING.xs }}>
            <CountdownCard />
            <ProgressSection />
        </View>

        {/* 1. Mood Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, styles.moodCardOverflow]}>
          
          {/* Live Background */}
          {selectedMood && (
              <View style={StyleSheet.absoluteFill}>
                  <MoodLiveBackground color={selectedMood.color} intensity={0.8} theme={theme} />
              </View>
          )}

          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('mood_card_title')}</Text>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.text }]} onPress={() => setModalVisible(true)}>
              <Ionicons name={todayLog.mood ? "pencil" : "add"} size={16} color={colors.background} />
              <Text style={[styles.editButtonText, { color: colors.background }]}>{todayLog.mood ? t('mood_edit') : t('mood_log')}</Text>
            </TouchableOpacity>
          </View>

          {todayLog.mood ? (
            <View style={styles.logContent}>
              <View style={styles.moodRow}>
                <View style={[styles.largeMoodDot, { backgroundColor: selectedMood?.color, shadowColor: selectedMood?.color }]} />
                <View>
                  <Text style={[styles.moodLabelLarge, { color: colors.text }]}>
                      {selectedMood ? t(`mood_${selectedMood.type}` as any) : ''}
                  </Text>
                  <Text style={[styles.moodSubLabel, { color: colors.textSecondary }]}>{t('mood_label_sub')}</Text>
                </View>
              </View>
              {todayLog.tags && todayLog.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {todayLog.tags.map(tag => (
                    <View key={tag} style={[styles.tagChip, { backgroundColor: colors.surfaceHighlight }]}>
                        <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                            {t(`tag_${tag.toLowerCase()}` as any)}
                        </Text>
                    </View>
                  ))}
                </View>
              )}
              {todayLog.note ? (
                <View style={[styles.noteBox, { backgroundColor: 'rgba(0,0,0,0.05)' }]}><Text style={[styles.noteText, { color: colors.text }]}>{todayLog.note}</Text></View>
              ) : null}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="moon-outline" size={32} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t('no_mood')}</Text>
            </View>
          )}
        </View>

        {/* 2. Habits */}
        <HabitsCard 
          completedHabits={todayLog.habits || {}}
          onToggleHabit={handleToggleHabit}
        />

        {/* 3. Tasks */}
        <TasksCard 
          tasks={todayLog.tasks || []}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
        />

        {/* 4. Photo */}
        <PhotoCard 
          photoUri={todayLog.photoUri}
          onPhotoSelect={handlePhotoSelect}
        />

        <View style={{ height: 100 }} /> 
      </ScrollView>

      {sparkle && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <AnimatedSparkle key={sparkle.key} color={sparkle.color} onComplete={() => setSparkle(null)} />
          </View>
        </View>
      )}

      <MoodSelectorModal
        visible={modalVisible}
        selectedDate={today}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveLog}
        initialLog={todayLog}
      />
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { 
    paddingHorizontal: SPACING.lg, 
    paddingBottom: 100,
    gap: SPACING.lg 
  },
  header: { 
    marginTop: SPACING.lg, 
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  greeting: { fontSize: 32, ...FONTS.heavy },
  date: { fontSize: 16, ...FONTS.medium, textTransform: 'uppercase', marginTop: 4 },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
  },
  moodCardOverflow: {
      overflow: 'hidden', // Crucial for MoodLiveBackground clipping
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: { fontSize: 18, ...FONTS.bold },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.round,
    gap: 4,
  },
  editButtonText: { fontSize: 12, ...FONTS.bold },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.md, gap: SPACING.sm },
  emptyText: { fontSize: 14 },
  
  logContent: { gap: SPACING.md },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  largeMoodDot: {
    width: 48, height: 48, borderRadius: 24,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 8,
  },
  moodLabelLarge: { fontSize: 20, ...FONTS.bold },
  moodSubLabel: { fontSize: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  tagChip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: RADIUS.sm },
  tagText: { fontSize: 12 },
  noteBox: { padding: SPACING.md, borderRadius: RADIUS.md },
  noteText: { fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
});
