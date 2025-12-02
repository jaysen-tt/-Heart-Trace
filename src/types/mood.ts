import { COLORS } from '../constants/theme';

export type MoodType = 
  // Positive
  | 'rad' | 'excited' | 'grateful' | 'good' | 'calm'
  // Neutral
  | 'okay' | 'meh' | 'bored' | 'tired' | 'numb'
  // Negative
  | 'anxious' | 'sad' | 'angry' | 'bad' | 'awful';

export interface MoodOption {
  type: MoodType;
  label: string;
  color: string;
  category: 'positive' | 'neutral' | 'negative';
}

export const MOOD_OPTIONS: MoodOption[] = [
  // Positive
  { type: 'rad', label: 'Rad', color: '#00E0FF', category: 'positive' },        // Cyan Neon
  { type: 'excited', label: 'Excited', color: '#FF00FF', category: 'positive' }, // Magenta Neon
  { type: 'grateful', label: 'Grateful', color: '#FD79A8', category: 'positive' }, // Pink
  { type: 'good', label: 'Good', color: '#00FF94', category: 'positive' },      // Green Neon
  { type: 'calm', label: 'Calm', color: '#00B894', category: 'positive' },      // Teal

  // Neutral
  { type: 'okay', label: 'Okay', color: '#74B9FF', category: 'neutral' },       // Light Blue
  { type: 'meh', label: 'Meh', color: '#FFD600', category: 'neutral' },         // Yellow Neon
  { type: 'bored', label: 'Bored', color: '#FDCB6E', category: 'neutral' },     // Mustard
  { type: 'tired', label: 'Tired', color: '#A4B0BE', category: 'neutral' },     // Grey
  { type: 'numb', label: 'Numb', color: '#636E72', category: 'neutral' },       // Dark Grey

  // Negative
  { type: 'anxious', label: 'Anxious', color: '#A29BFE', category: 'negative' },// Lavender
  { type: 'sad', label: 'Sad', color: '#0984E3', category: 'negative' },        // Blue
  { type: 'angry', label: 'Angry', color: '#D63031', category: 'negative' },    // Dark Red
  { type: 'bad', label: 'Bad', color: '#FF7A00', category: 'negative' },        // Orange
  { type: 'awful', label: 'Awful', color: '#FF2E2E', category: 'negative' },    // Red Neon
];

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Habit {
    id: string;
    label: string;
    icon: string;
    isCustom?: boolean;
}

export const HABITS_LIST: Habit[] = [
    { id: 'hydrate', label: 'Hydrate', icon: 'water-outline' },
    { id: 'read', label: 'Read', icon: 'book-outline' },
    { id: 'mindfulness', label: 'Mindfulness', icon: 'leaf-outline' },
    { id: 'walk', label: 'Walk', icon: 'walk-outline' },
    { id: 'exercise', label: 'Exercise', icon: 'fitness-outline' },
    { id: 'sleep', label: 'Sleep Early', icon: 'moon-outline' },
    { id: 'eat_healthy', label: 'Eat Healthy', icon: 'nutrition-outline' },
    { id: 'journal', label: 'Journal', icon: 'create-outline' },
];

export const ACTIVITY_TAGS = [
    'Work', 'Study', 'Exercise', 'Social', 'Relax', 'Gaming', 'Coding', 'Family', 'Date', 'Travel', 'Shopping', 'Movie'
];

export interface DayLog {
  date: string; // ISO date string YYYY-MM-DD
  mood?: MoodType;
  tags?: string[];
  note?: string;
  tasks?: Task[];
  habits?: Record<string, boolean>;
  photoUri?: string;
  isPinned?: boolean;
}
