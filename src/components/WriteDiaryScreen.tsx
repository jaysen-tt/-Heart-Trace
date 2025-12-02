import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView, LayoutAnimation, UIManager, Animated, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS, SPACING, FONTS } from '../constants/theme';
import { MusicPlayerWidget } from '../components/MusicPlayerWidget';
import { DayLog, MOOD_OPTIONS, MoodOption, ACTIVITY_TAGS } from '../types/mood';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../context/SettingsContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface WriteDiaryScreenProps {
  visible: boolean;
  onClose: () => void;
  onSave: (logData: Partial<DayLog>) => void;
  initialLog: DayLog;
}

const MoodItem = ({ mood, isSelected, onSelect, label }: { mood: MoodOption, isSelected: boolean, onSelect: (m: MoodOption) => void, label: string }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isSelected ? 1.15 : 1,
            friction: 8,
            useNativeDriver: true
        }).start();
    }, [isSelected]);

    return (
        <TouchableOpacity 
            style={styles.moodBtn}
            onPress={() => onSelect(mood)}
            activeOpacity={0.7}
        >
            <Animated.View 
                style={[
                    styles.moodDot, 
                    { backgroundColor: mood.color, transform: [{ scale: scaleAnim }] },
                    isSelected ? { opacity: 1 } : { opacity: 0.4 }
                ]} 
            />
            <Text style={[
                styles.moodLabel, 
                isSelected && { color: mood.color, fontWeight: 'bold' }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

export const WriteDiaryScreen: React.FC<WriteDiaryScreenProps> = ({ visible, onClose, onSave, initialLog }) => {
  const { colors, t } = useSettings();
  const [text, setText] = useState(initialLog.note || '');
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(
    initialLog.mood ? MOOD_OPTIONS.find(m => m.type === initialLog.mood) || null : null
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(initialLog.tags || []);
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  useEffect(() => {
    if (visible) {
      setText(initialLog.note || '');
      setSelectedMood(initialLog.mood ? MOOD_OPTIONS.find(m => m.type === initialLog.mood) || null : null);
      setSelectedTags(initialLog.tags || []);
      setShowMoodSelector(false);
    }
  }, [visible, initialLog]);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave({
      note: text,
      mood: selectedMood?.type,
      tags: selectedTags
    });
  };

  const toggleMoodSelector = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowMoodSelector(!showMoodSelector);
  };

  const handleMoodSelect = (mood: MoodOption) => {
    Haptics.selectionAsync();
    setSelectedMood(mood);
  };

  const toggleTag = (tag: string) => {
    Haptics.selectionAsync();
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Music Widget */}
        <View style={styles.widgetContainer}>
            <MusicPlayerWidget />
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.editorContainer}>
          {/* Toolbar */}
          <View style={[styles.toolbar, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.moodTrigger, { backgroundColor: colors.surfaceHighlight }]} onPress={toggleMoodSelector}>
                {selectedMood ? (
                    <View style={[styles.miniMoodDot, { backgroundColor: selectedMood.color }]} />
                ) : (
                    <Ionicons name="happy-outline" size={18} color={colors.textSecondary} />
                )}
                <Text style={[styles.dateTitle, { color: colors.text }]}>
                    {selectedMood ? t(`mood_${selectedMood.type}` as any) : t('editor_set_mood')}
                </Text>
                <Ionicons 
                    name="chevron-down" 
                    size={14} 
                    color={colors.textSecondary} 
                    style={{ transform: [{ rotate: showMoodSelector ? '180deg' : '0deg' }]}}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.text }]}>
              <Text style={[styles.saveText, { color: colors.background }]}>{t('editor_done')}</Text>
            </TouchableOpacity>
          </View>

          {/* Collapsible Mood Selector */}
          {showMoodSelector && (
              <View style={[styles.moodSelectorContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.moodScroll}
                  >
                      {MOOD_OPTIONS.map(mood => (
                          <MoodItem 
                            key={mood.type} 
                            mood={mood} 
                            label={t(`mood_${mood.type}` as any)}
                            isSelected={selectedMood?.type === mood.type} 
                            onSelect={handleMoodSelect} 
                          />
                      ))}
                  </ScrollView>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagScroll}>
                      {ACTIVITY_TAGS.map(tag => (
                          <TouchableOpacity 
                            key={tag} 
                            style={[
                                styles.tagBtn, 
                                { borderColor: colors.border },
                                selectedTags.includes(tag) && { backgroundColor: selectedMood?.color || colors.text, borderColor: selectedMood?.color || colors.text }
                            ]}
                            onPress={() => toggleTag(tag)}
                          >
                              <Text style={[styles.tagText, { color: colors.textSecondary }, selectedTags.includes(tag) && { color: colors.background }]}>{t(`tag_${tag.toLowerCase()}` as any)}</Text>
                          </TouchableOpacity>
                      ))}
                  </ScrollView>
              </View>
          )}

          {/* Text Editor */}
          <View style={{ flex: 1 }}>
            <TextInput
                style={[styles.input, { color: colors.text }]}
                multiline
                placeholder={t('editor_placeholder')}
                placeholderTextColor={colors.textTertiary}
                value={text}
                onChangeText={setText}
                textAlignVertical="top"
                autoFocus={!showMoodSelector}
            />
            <View style={styles.wordCountBadge}>
                <Text style={styles.wordCountText}>{text.trim() ? text.trim().length : 0} {t('word_count')}</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  widgetContainer: {
    zIndex: 10,
  },
  editorContainer: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    zIndex: 5,
  },
  closeBtn: {
    padding: 4,
  },
  moodTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: RADIUS.round,
  },
  miniMoodDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
  },
  dateTitle: {
    fontSize: 14,
    ...FONTS.medium,
  },
  saveBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: RADIUS.round,
  },
  saveText: {
    fontSize: 14,
    ...FONTS.bold,
  },
  moodSelectorContainer: {
      borderBottomWidth: 1,
      paddingVertical: SPACING.md,
      gap: SPACING.md,
  },
  moodScroll: {
      paddingHorizontal: SPACING.lg,
      gap: 24, 
  },
  moodBtn: {
      alignItems: 'center',
      gap: 8,
      width: 50,
  },
  moodDot: {
      width: 40, 
      height: 40,
      borderRadius: 20,
  },
  moodLabel: {
      fontSize: 10,
      color: '#8E8E93', // Keeping static for now or passing prop if needed
      ...FONTS.medium,
      textAlign: 'center',
  },
  tagScroll: {
      paddingHorizontal: SPACING.lg,
      gap: SPACING.sm,
  },
  tagBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: RADIUS.md,
      borderWidth: 1,
  },
  tagText: {
      fontSize: 12,
  },
  input: {
    flex: 1,
    padding: SPACING.lg,
    fontSize: 18,
    lineHeight: 28,
    textAlignVertical: 'top',
  },
  wordCountBadge: {
      position: 'absolute',
      bottom: SPACING.lg,
      right: SPACING.lg,
      backgroundColor: 'rgba(28, 28, 30, 0.8)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: RADIUS.round,
  },
  wordCountText: {
      color: '#8E8E93',
      fontSize: 12,
      ...FONTS.medium,
  }
});
