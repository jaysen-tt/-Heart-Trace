import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, UIManager, Platform, Modal, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RADIUS, SPACING, FONTS } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import { Habit } from '../types/mood';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface HabitsCardProps {
  completedHabits: Record<string, boolean>;
  onToggleHabit: (habitId: string) => void;
}

const { height } = Dimensions.get('window');

export const HabitsCard: React.FC<HabitsCardProps> = ({
  completedHabits,
  onToggleHabit
}) => {
  const { colors, t, activeHabits, addHabit, removeHabit, reorderHabits } = useSettings();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  
  // Custom Action Sheet State
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
      if (selectedHabit) {
          // Open
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
      }
  }, [selectedHabit]);

  const closeActionSheet = () => {
      Animated.parallel([
          Animated.timing(slideAnim, {
              toValue: height,
              duration: 200,
              useNativeDriver: true
          }),
          Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true
          })
      ]).start(() => setSelectedHabit(null));
  };

  const handleToggle = (id: string) => {
    if (completedHabits[id]) {
        Haptics.selectionAsync();
    } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggleHabit(id);
  };

  const handleAddHabit = () => {
      if (newHabitName.trim()) {
          addHabit(newHabitName.trim());
          setNewHabitName('');
          setShowAddModal(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
  };

  const handlePinToTop = () => {
      if (!selectedHabit) return;
      const currentIndex = activeHabits.findIndex(h => h.id === selectedHabit.id);
      if (currentIndex > 0) {
          const newOrder = [...activeHabits];
          const [item] = newOrder.splice(currentIndex, 1);
          newOrder.unshift(item);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          reorderHabits(newOrder);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      closeActionSheet();
  };

  const handleDelete = () => {
      if (!selectedHabit) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      removeHabit(selectedHabit.id);
      closeActionSheet();
  };

  const handleLongPress = (habit: Habit) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedHabit(habit);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('habits_title')}</Text>
        <Ionicons name="infinite-outline" size={20} color={colors.textSecondary} />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {activeHabits.map((habit) => {
          const isCompleted = !!completedHabits[habit.id];
          
          return (
            <TouchableOpacity
              key={habit.id}
              style={styles.habitItem}
              onPress={() => handleToggle(habit.id)}
              onLongPress={() => handleLongPress(habit)}
              activeOpacity={0.7}
              delayLongPress={300}
            >
              <View style={[
                  styles.habitCircle, 
                  { backgroundColor: colors.surfaceHighlight, borderColor: colors.border },
                  isCompleted && { backgroundColor: colors.todayIndicator, borderColor: colors.todayIndicator }
                ]}>
                <Ionicons 
                  name={habit.icon as any} 
                  size={24} 
                  color={isCompleted ? colors.background : colors.textSecondary} 
                />
                {isCompleted && (
                  <View style={[styles.checkBadge, { backgroundColor: colors.success, borderColor: colors.surface }]}>
                    <Ionicons name="checkmark" size={10} color="#FFF" />
                  </View>
                )}
                {habit.isCustom && !isCompleted && (
                   <View style={[styles.customBadge, { backgroundColor: colors.surface }]}>
                       <Ionicons name="star" size={6} color={colors.textSecondary} />
                   </View> 
                )}
              </View>
              <Text 
                style={[
                    styles.habitLabel, 
                    { color: colors.textSecondary },
                    isCompleted && { color: colors.text, fontWeight: '600' }
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {t(`habit_${habit.id}` as any) !== `habit_${habit.id}` ? t(`habit_${habit.id}` as any) : habit.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Add Button */}
        <TouchableOpacity
            style={styles.habitItem}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.7}
        >
            <View style={[styles.habitCircle, { backgroundColor: 'transparent', borderColor: colors.border, borderStyle: 'dashed' }]}>
                <Ionicons name="add" size={24} color={colors.textSecondary} />
            </View>
            <Text style={[styles.habitLabel, { color: colors.textSecondary }]}>{t('mood_edit')}</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Add Habit Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
             <TouchableWithoutFeedback onPress={() => setShowAddModal(false)}>
                 <View style={styles.modalBackdrop}>
                     <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
                 </View>
             </TouchableWithoutFeedback>
             <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                 <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Habit</Text>
                 <TextInput 
                    style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceHighlight }]}
                    value={newHabitName}
                    onChangeText={setNewHabitName}
                    placeholder="Habit Name"
                    placeholderTextColor={colors.textTertiary}
                    autoFocus
                    onSubmitEditing={handleAddHabit}
                 />
                 <View style={styles.modalActions}>
                     <TouchableOpacity style={styles.modalBtn} onPress={() => setShowAddModal(false)}>
                         <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>{t('journal_cancel')}</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.todayIndicator }]} onPress={handleAddHabit}>
                         <Text style={[styles.modalBtnText, { color: colors.background, fontWeight: 'bold' }]}>{t('editor_save')}</Text>
                     </TouchableOpacity>
                 </View>
             </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Action Sheet Modal */}
      <Modal visible={!!selectedHabit} transparent animationType="none" onRequestClose={closeActionSheet}>
          <TouchableWithoutFeedback onPress={closeActionSheet}>
              <Animated.View style={[styles.sheetBackdrop, { opacity: fadeAnim }]} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.sheetContainer, { transform: [{ translateY: slideAnim }], backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.sheetHeader}>
                  <Text style={[styles.sheetTitle, { color: colors.text }]}>
                      {selectedHabit ? (t(`habit_${selectedHabit.id}` as any) !== `habit_${selectedHabit.id}` ? t(`habit_${selectedHabit.id}` as any) : selectedHabit.label) : ''}
                  </Text>
              </View>
              
              <TouchableOpacity style={styles.sheetOption} onPress={handlePinToTop}>
                  <View style={[styles.sheetIcon, { backgroundColor: colors.surfaceHighlight }]}>
                      <Ionicons name="arrow-up" size={20} color={colors.text} />
                  </View>
                  <Text style={[styles.sheetOptionText, { color: colors.text }]}>{t('journal_pin')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sheetOption} onPress={handleDelete}>
                  <View style={[styles.sheetIcon, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </View>
                  <Text style={[styles.sheetOptionText, { color: '#FF3B30' }]}>{t('journal_delete')}</Text>
              </TouchableOpacity>

              <View style={{ height: SPACING.xl }} />
          </Animated.View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg, 
    paddingHorizontal: 0,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  cardTitle: {
    fontSize: 18,
    ...FONTS.bold,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: 14, 
  },
  habitItem: {
    alignItems: 'center',
    gap: SPACING.sm,
    width: 56,
  },
  habitCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  customBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 12,
      height: 12,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
  },
  habitLabel: {
    fontSize: 11, 
    textAlign: 'center',
    width: 60,
  },
  
  // Modal
  modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      padding: SPACING.xl,
  },
  modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      borderWidth: 1,
      gap: SPACING.lg,
  },
  modalTitle: {
      fontSize: 18,
      ...FONTS.bold,
      textAlign: 'center',
  },
  input: {
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      fontSize: 16,
  },
  modalActions: {
      flexDirection: 'row',
      gap: SPACING.md,
  },
  modalBtn: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: RADIUS.round,
  },
  modalBtnText: {
      fontSize: 16,
  },

  // Action Sheet
  sheetBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      borderTopLeftRadius: RADIUS.xl,
      borderTopRightRadius: RADIUS.xl,
      padding: SPACING.lg,
      paddingBottom: 40,
      borderTopWidth: 1,
  },
  sheetHeader: {
      alignItems: 'center',
      marginBottom: SPACING.lg,
      paddingBottom: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  sheetTitle: {
      fontSize: 16,
      ...FONTS.bold,
  },
  sheetOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      gap: SPACING.md,
  },
  sheetIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
  },
  sheetOptionText: {
      fontSize: 16,
      ...FONTS.medium,
  }
});
