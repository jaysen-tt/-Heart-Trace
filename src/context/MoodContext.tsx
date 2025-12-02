import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getLogs, saveLog as saveLogToStorage } from '../utils/storage';
import { DayLog } from '../types/mood';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerForNotificationsAsync, scheduleReminders } from '../utils/notifications';
import { format } from 'date-fns';

interface MoodContextType {
  moodLogs: Record<string, DayLog>;
  refreshLogs: () => Promise<void>;
  saveLog: (log: DayLog) => Promise<void>;
  deleteLog: (date: string) => Promise<void>;
  togglePinLog: (date: string) => Promise<void>;
}

const MoodContext = createContext<MoodContextType>({
  moodLogs: {},
  refreshLogs: async () => {},
  saveLog: async () => {},
  deleteLog: async () => {},
  togglePinLog: async () => {},
});

export const useMood = () => useContext(MoodContext);

export const MoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [moodLogs, setMoodLogs] = useState<Record<string, DayLog>>({});

  const refreshLogs = useCallback(async () => {
    const logs = await getLogs();
    setMoodLogs(logs);
  }, []);

  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]);

  // Initialize notifications
  useEffect(() => {
    const initNotifications = async () => {
      const hasPermission = await registerForNotificationsAsync();
      if (hasPermission) {
        const logs = await getLogs();
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const isLoggedToday = !!logs[todayStr];
        await scheduleReminders(isLoggedToday);
      }
    };
    initNotifications();
  }, []);

  const saveLog = async (log: DayLog) => {
    const updatedLogs = await saveLogToStorage(log);
    setMoodLogs(updatedLogs);

    // Update notifications if today's log
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (log.date === todayStr) {
      await scheduleReminders(true);
    }
  };

  const deleteLog = async (date: string) => {
    const currentLogs = await getLogs();
    const { [date]: removed, ...rest } = currentLogs;
    // Save the map without the deleted key
    await AsyncStorage.setItem('@mood_logs_v1', JSON.stringify(rest));
    setMoodLogs(rest);

    // Update notifications if today's log
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (date === todayStr) {
      await scheduleReminders(false);
    }
  };

  const togglePinLog = async (date: string) => {
    const currentLogs = await getLogs();
    const log = currentLogs[date];
    if (log) {
      const updatedLog = { ...log, isPinned: !log.isPinned };
      await saveLog(updatedLog);
    }
  };

  return (
    <MoodContext.Provider value={{ moodLogs, refreshLogs, saveLog, deleteLog, togglePinLog }}>
      {children}
    </MoodContext.Provider>
  );
};
