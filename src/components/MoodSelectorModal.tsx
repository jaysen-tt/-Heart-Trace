import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated
} from 'react-native';
import { PanGestureHandler, State, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { SPACING, RADIUS, FONTS } from '../constants/theme';
import { MOOD_OPTIONS, MoodOption, ACTIVITY_TAGS, DayLog } from '../types/mood';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

import * as ImagePicker from 'expo-image-picker';

interface MoodSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (log: Omit<DayLog, 'date'>) => void;
  selectedDate: Date;
  initialLog?: DayLog;
}

const { height } = Dimensions.get('window');

const MoodItem = ({ mood, isSelected, onSelect, label }: { mood: MoodOption, isSelected: boolean, onSelect: (m: MoodOption) => void, label: string }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isSelected ? 1.1 : 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true
        }).start();
    }, [isSelected]);

    return (
        <TouchableOpacity
            style={styles.moodItem}
            onPress={() => onSelect(mood)}
            activeOpacity={0.7}
        >
            <Animated.View 
                style={[
                    styles.moodCircle, 
                    { backgroundColor: mood.color, transform: [{ scale: scaleAnim }] },
                    isSelected && styles.moodCircleSelected
                ]} 
            >
                {isSelected && <Ionicons name="checkmark" size={20} color="rgba(0,0,0,0.5)" />}
            </Animated.View>
            <Text style={[
                styles.moodLabel,
                isSelected && { color: mood.color, fontWeight: 'bold' }
            ]}>{label}</Text>
        </TouchableOpacity>
    );
};

export const MoodSelectorModal: React.FC<MoodSelectorModalProps> = ({
  visible,
  onClose,
  onSave,
  selectedDate,
  initialLog
}) => {
  const { colors, t, language } = useSettings();
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [category, setCategory] = useState<'positive' | 'neutral' | 'negative'>('neutral');

  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: slideAnim } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      if (translationY > 100 || velocityY > 800) {
        handleClose();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true
        }).start();
      }
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
          Animated.spring(slideAnim, {
              toValue: 0,
              friction: 8,
              tension: 60,
              useNativeDriver: true
          }),
          Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true
          })
      ]).start();
      
      if (initialLog) {
        const foundMood = MOOD_OPTIONS.find(m => m.type === initialLog.mood);
        setSelectedMood(foundMood || null);
        if (foundMood) setCategory(foundMood.category);
        
        setSelectedTags(initialLog.tags || []);
        setNote(initialLog.note || '');
        setPhotoUri(initialLog.photoUri || null);
      } else {
        setSelectedMood(null);
        setSelectedTags([]);
        setNote('');
        setPhotoUri(null);
        setCategory('neutral'); 
      }
    }
  }, [visible, initialLog]);

  const handleClose = () => {
      Animated.parallel([
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 250,
            useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        })
      ]).start(() => onClose());
  };

  const handleMoodSelect = (mood: MoodOption) => {
    Haptics.selectionAsync();
    setSelectedMood(mood);
  };

  const handleCategorySelect = (cat: 'positive' | 'neutral' | 'negative') => {
      Haptics.selectionAsync();
      setCategory(cat);
  };

  const toggleTag = (tag: string) => {
    Haptics.selectionAsync();
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handlePickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.5,
      });

      if (!result.canceled) {
          setPhotoUri(result.assets[0].uri);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
  };

  const handleSave = () => {
    if (!selectedMood) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave({
      mood: selectedMood.type,
      tags: selectedTags,
      note: note.trim(),
      photoUri: photoUri || undefined
    });
  };

  const filteredMoods = MOOD_OPTIONS.filter(m => m.category === category);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }], backgroundColor: colors.surface, borderColor: colors.border }]}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View style={[styles.header, { borderBottomColor: colors.border, paddingTop: Platform.OS === 'android' ? SPACING.lg : SPACING.md }]}>
              <View style={[styles.handle, { backgroundColor: colors.textTertiary }]} />
              <View style={styles.headerRow}>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                    {format(selectedDate, language === 'zh' ? 'yyyy年M月d日 EEEE' : 'EEEE, MMMM do, yyyy', { locale: language === 'zh' ? zhCN : enUS })}
                </Text>
                {selectedMood && (
                  <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: colors.text }]}>
                    <Text style={[styles.saveText, { color: colors.background }]}>{t('editor_save')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </PanGestureHandler>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 1. Mood Section */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('mood_card_title')}</Text>
            
            {/* Category Tabs */}
            <View style={[styles.tabsContainer, { backgroundColor: colors.surfaceHighlight }]}>
                {(['positive', 'neutral', 'negative'] as const).map((cat) => (
                    <TouchableOpacity 
                        key={cat} 
                        style={[styles.tab, category === cat && { backgroundColor: colors.surface, borderColor: colors.border }, 
                            category === cat && cat === 'positive' && { backgroundColor: 'rgba(0, 255, 148, 0.1)', borderColor: '#00FF94' },
                            category === cat && cat === 'neutral' && { backgroundColor: 'rgba(255, 214, 0, 0.1)', borderColor: '#FFD600' },
                            category === cat && cat === 'negative' && { backgroundColor: 'rgba(255, 46, 46, 0.1)', borderColor: '#FF2E2E' },
                        ]}
                        onPress={() => handleCategorySelect(cat)}
                    >
                        <Text style={[styles.tabText, { color: colors.textSecondary }, category === cat && { color: colors.text, fontWeight: 'bold' },
                             category === cat && cat === 'positive' && { color: '#00FF94' },
                             category === cat && cat === 'neutral' && { color: '#FFD600' },
                             category === cat && cat === 'negative' && { color: '#FF2E2E' },
                        ]}>
                            {t(`cat_${cat}` as any)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ height: 100 }}> 
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.moodScrollContent}
                    decelerationRate="fast"
                >
                {filteredMoods.map((mood) => (
                    <MoodItem 
                        key={mood.type} 
                        mood={mood} 
                        label={t(`mood_${mood.type}` as any)}
                        isSelected={selectedMood?.type === mood.type} 
                        onSelect={handleMoodSelect} 
                    />
                ))}
                </ScrollView>
            </View>

            {/* 2. Activities Section */}
            {selectedMood && (
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('mood_section_activity')}</Text>
                <View style={styles.tagsContainer}>
                  {ACTIVITY_TAGS.map(tag => {
                    const isActive = selectedTags.includes(tag);
                    return (
                      <TouchableOpacity
                        key={tag}
                        style={[
                          styles.tag,
                          { borderColor: colors.surfaceHighlight },
                          isActive && { backgroundColor: selectedMood.color, borderColor: selectedMood.color }
                        ]}
                        onPress={() => toggleTag(tag)}
                      >
                        <Text style={[
                          styles.tagText,
                          { color: colors.textSecondary },
                          isActive && { color: '#000', fontWeight: '600' }
                        ]}>{t(`tag_${tag.toLowerCase()}` as any)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 3. Note Section */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('mood_section_note')}</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.surfaceHighlight }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={t('mood_input_placeholder')}
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    maxLength={500}
                    value={note}
                    onChangeText={setNote}
                  />
                </View>

                {/* 4. Photo Section */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('photo_title') || "Daily Moment"}</Text>
                <TouchableOpacity 
                    style={[
                        styles.photoUpload, 
                        { backgroundColor: colors.surfaceHighlight, borderColor: colors.border },
                        photoUri && { padding: 0, borderWidth: 0 }
                    ]}
                    onPress={handlePickImage}
                >
                    {photoUri ? (
                        <React.Fragment>
                             <Animated.Image source={{ uri: photoUri }} style={styles.uploadedPhoto} />
                             <TouchableOpacity 
                                style={styles.removePhotoBtn}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setPhotoUri(null);
                                    Haptics.selectionAsync();
                                }}
                             >
                                 <Ionicons name="close-circle" size={24} color="#fff" />
                             </TouchableOpacity>
                        </React.Fragment>
                    ) : (
                        <View style={{ alignItems: 'center', gap: 8 }}>
                            <Ionicons name="camera-outline" size={32} color={colors.textTertiary} />
                            <Text style={{ color: colors.textTertiary, fontSize: 14 }}>{t('photo_placeholder') || "Add a photo"}</Text>
                        </View>
                    )}
                </TouchableOpacity>

              </View>
            )}
            
            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: height * 0.9,
    borderTopWidth: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  date: {
    fontSize: 16,
    ...FONTS.medium,
  },
  saveButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.round,
  },
  saveText: {
    fontSize: 14,
    ...FONTS.bold,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 50,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
    ...FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  // Tabs
  tabsContainer: {
      flexDirection: 'row',
      marginBottom: SPACING.lg,
      padding: 4,
      borderRadius: RADIUS.round,
  },
  tab: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.round,
      borderWidth: 1,
      borderColor: 'transparent',
  },
  tabText: {
      fontSize: 13,
      ...FONTS.medium,
  },

  // Mood Scroll Styles
  moodScrollContent: {
      paddingHorizontal: SPACING.xs,
      paddingVertical: SPACING.md,
      gap: SPACING.xl,
  },
  moodItem: {
    alignItems: 'center',
    gap: 12,
    width: 60,
  },
  moodCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.4,
  },
  moodCircleSelected: {
    opacity: 1,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  moodLabel: {
    fontSize: 12,
    color: '#8E8E93',
    ...FONTS.medium,
    textAlign: 'center',
  },
  
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  tagText: {
    fontSize: 13,
  },
  inputContainer: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    minHeight: 120,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
  },
  photoUpload: {
      height: 200,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: SPACING.xs,
      overflow: 'hidden',
  },
  uploadedPhoto: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
  },
  removePhotoBtn: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 12,
  }
});
