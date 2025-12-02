import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayLog } from '../types/mood';

const STORAGE_KEY = '@mood_logs_v1';

export const saveLog = async (log: DayLog) => {
  try {
    const existing = await getLogs();
    const updated = { ...existing, [log.date]: log };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving log', e);
    return {};
  }
};

export const getLogs = async (): Promise<Record<string, DayLog>> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : {};
  } catch (e) {
    console.error('Error getting logs', e);
    return {};
  }
};

