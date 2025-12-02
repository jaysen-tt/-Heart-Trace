import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS, SPACING, FONTS } from '../constants/theme';
import { Task } from '../types/mood';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../context/SettingsContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TasksCardProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksCard: React.FC<TasksCardProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask
}) => {
  const { colors, t } = useSettings();
  const [newTask, setNewTask] = useState('');

  const handleSubmit = () => {
    if (newTask.trim()) {
      Haptics.selectionAsync();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      onAddTask(newTask.trim());
      setNewTask('');
    }
  };

  const handleToggle = (id: string) => {
      Haptics.selectionAsync();
      onToggleTask(id);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('tasks_title')}</Text>
        <View style={[styles.badge, { backgroundColor: colors.surfaceHighlight }]}>
          <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
            {tasks.filter(t => t.completed).length}/{tasks.length}
          </Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={t('tasks_placeholder')}
          placeholderTextColor={colors.textTertiary}
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
        />
        <TouchableOpacity 
            onPress={handleSubmit} 
            disabled={!newTask.trim()}
            style={[styles.addBtn, !newTask.trim() && { opacity: 0.5 }]}
        >
            <Ionicons name="add-circle" size={24} color={colors.todayIndicator} />
        </TouchableOpacity>
      </View>

      <View style={styles.taskList}>
        {tasks.map((task) => (
            <View key={task.id} style={styles.taskRow}>
                <TouchableOpacity 
                    style={styles.checkbox} 
                    onPress={() => handleToggle(task.id)}
                >
                    <Ionicons 
                        name={task.completed ? "checkbox" : "square-outline"} 
                        size={24} 
                        color={task.completed ? colors.todayIndicator : colors.textTertiary} 
                    />
                </TouchableOpacity>
                
                <Text 
                    style={[
                        styles.taskText, 
                        { color: colors.text },
                        task.completed && { color: colors.textTertiary, textDecorationLine: 'line-through' }
                    ]}
                    numberOfLines={1}
                >
                    {task.text}
                </Text>

                <TouchableOpacity 
                    onPress={() => onDeleteTask(task.id)}
                    style={styles.deleteBtn}
                >
                    <Ionicons name="close" size={16} color={colors.textTertiary} />
                </TouchableOpacity>
            </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 18,
    ...FONTS.bold,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: 12,
    ...FONTS.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  addBtn: {
      padding: 4,
  },
  taskList: {
      gap: 12,
  },
  taskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  checkbox: {
      padding: 2,
  },
  taskText: {
      flex: 1,
      fontSize: 16,
  },
  deleteBtn: {
      padding: 4,
  }
});
