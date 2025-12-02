import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONTS } from '../../constants/theme';
import { useMood } from '../../context/MoodContext';
import { useSettings } from '../../context/SettingsContext';
import { JournalCard } from '../../components/JournalCard';
import { WriteDiaryScreen } from '../../components/WriteDiaryScreen';
import { PinInputModal } from '../../components/PinInputModal';
import { DayLog } from '../../types/mood';

const { height } = Dimensions.get('window');

export default function JournalScreen() {
  const { moodLogs, saveLog, deleteLog, togglePinLog } = useMood();
  const { colors, t, isJournalLocked, journalPin } = useSettings();
  const [writeVisible, setWriteVisible] = useState(false);
  const [editingLog, setEditingLog] = useState<DayLog | null>(null);
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
      if (!isJournalLocked) {
          setIsUnlocked(true);
      } else {
          // If lock is enabled (e.g. returning from settings), default to locked state
          setIsUnlocked(false);
      }
  }, [isJournalLocked]);

  useFocusEffect(
      useCallback(() => {
          return () => {
              // Lock when leaving the screen
              setIsUnlocked(false);
              setShowUnlockModal(false);
          };
      }, [])
  );

  const handleUnlockSuccess = () => {
      setIsUnlocked(true);
      setShowUnlockModal(false);
  };

  const journalEntries = Object.values(moodLogs)
    .filter(log => log.note || log.mood) // Only show actual entries
    .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const handleOpenEditor = (log?: DayLog) => {
      if (log) {
          setEditingLog(log);
      } else {
          const todayKey = new Date().toISOString().split('T')[0];
          const todayLog = moodLogs[todayKey] || { date: todayKey };
          setEditingLog(todayLog);
      }
      setWriteVisible(true);
  };

  const handleSaveDiary = async (logData: Partial<DayLog>) => {
    if (!editingLog) return;
    const updatedLog: DayLog = { ...editingLog, ...logData };
    await saveLog(updatedLog);
    setWriteVisible(false);
    setEditingLog(null);
  };

  const handleDelete = async (date: string) => {
      await deleteLog(date);
  };

  const handlePin = async (date: string) => {
      await togglePinLog(date);
  };

  if (isJournalLocked && !isUnlocked) {
      return (
          <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
              <TouchableOpacity onPress={() => setShowUnlockModal(true)} style={{ alignItems: 'center' }}>
                  <Ionicons name="lock-closed-outline" size={64} color={colors.text} />
                  <Text style={{ marginTop: 16, fontSize: 18, color: colors.text, ...FONTS.bold }}>{t('journal_lock')}</Text>
                  <Text style={{ marginTop: 8, fontSize: 14, color: colors.textSecondary }}>{t('tap_to_unlock')}</Text>
              </TouchableOpacity>

              <PinInputModal 
                  visible={showUnlockModal}
                  onClose={() => setShowUnlockModal(false)}
                  onSuccess={handleUnlockSuccess}
                  currentPin={journalPin}
              />
          </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('journal_title')}</Text>
        <TouchableOpacity 
          style={[styles.writeButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
          onPress={() => handleOpenEditor()}
        >
          <Ionicons name="create-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={journalEntries}
        keyExtractor={item => item.date}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
            <JournalCard 
                log={item} 
                onPress={() => handleOpenEditor(item)}
                onDelete={() => handleDelete(item.date)}
                onPin={() => handlePin(item.date)}
            />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('journal_empty_title')}</Text>
            <TouchableOpacity style={[styles.ctaButton, { backgroundColor: colors.text }]} onPress={() => handleOpenEditor()}>
                <Text style={[styles.ctaText, { color: colors.background }]}>{t('journal_empty_cta')}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {editingLog && (
        <WriteDiaryScreen 
            visible={writeVisible} 
            onClose={() => setWriteVisible(false)}
            onSave={handleSaveDiary}
            initialLog={editingLog}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 32,
    ...FONTS.heavy,
  },
  writeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  emptyContainer: {
    height: height * 0.6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: 16,
  },
  ctaButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: RADIUS.round,
  },
  ctaText: {
      ...FONTS.bold
  }
});
