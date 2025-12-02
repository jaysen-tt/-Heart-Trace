import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTE } from '../constants/theme';
import { TRANSLATIONS, Language } from '../constants/i18n';
import { Habit, HABITS_LIST } from '../types/mood';
import { addYears, parseISO, isValid } from 'date-fns';
import { syncWidgetData } from '../utils/WidgetSync';

type ThemeMode = 'light' | 'dark';

interface SettingsContextType {
  theme: ThemeMode;
  language: Language;
  name: string;
  avatarUri: string | null;
  birthDate: string | null;
  targetDate: string | null;
  targetStartDate: string | null;
  lifeExpectancy: string | null;
  colors: typeof PALETTE.dark;
  activeHabits: Habit[];
  isJournalLocked: boolean;
  journalPin: string | null;
  isLoaded: boolean;
  t: (key: keyof typeof TRANSLATIONS.en) => string;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
  setName: (name: string) => void;
  setAvatarUri: (uri: string | null) => void;
  setBirthDate: (date: string | null) => void;
  setTargetDate: (date: string | null) => void;
  setLifeExpectancy: (age: string | null) => void;
  setJournalLock: (pin: string | null) => Promise<void>;
  addHabit: (label: string) => void;
  removeHabit: (id: string) => void;
  reorderHabits: (newOrder: any[]) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  theme: 'dark',
  language: 'zh',
  name: '',
  avatarUri: null,
  birthDate: null,
  targetDate: null,
  targetStartDate: null,
  lifeExpectancy: null,
  colors: PALETTE.dark,
  activeHabits: [],
  isJournalLocked: false,
  journalPin: null,
  isLoaded: false,
  t: (key) => key,
  setTheme: () => {},
  setLanguage: () => {},
  setName: () => {},
  setAvatarUri: () => {},
  setBirthDate: () => {},
  setTargetDate: () => {},
  setLifeExpectancy: () => {},
  setJournalLock: async () => {},
  addHabit: () => {},
  removeHabit: () => {},
  reorderHabits: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [language, setLanguageState] = useState<Language>('zh');
  const [name, setNameState] = useState<string>('');
  const [avatarUri, setAvatarUriState] = useState<string | null>(null);
  const [birthDate, setBirthDateState] = useState<string | null>(null);
  const [targetDate, setTargetDateState] = useState<string | null>(null);
  const [targetStartDate, setTargetStartDateState] = useState<string | null>(null);
  const [lifeExpectancy, setLifeExpectancyState] = useState<string | null>(null);
  const [activeHabits, setActiveHabits] = useState<Habit[]>([]);
  const [isJournalLocked, setIsJournalLocked] = useState(false);
  const [journalPin, setJournalPin] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@settings_theme');
      const savedLang = await AsyncStorage.getItem('@settings_lang');
      const savedName = await AsyncStorage.getItem('@settings_name');
      const savedAvatar = await AsyncStorage.getItem('@settings_avatar');
      const savedBirthDate = await AsyncStorage.getItem('@settings_birth_date');
      const savedTargetDate = await AsyncStorage.getItem('@settings_target_date');
      const savedTargetStartDate = await AsyncStorage.getItem('@settings_target_start_date');
      const savedLifeExpectancy = await AsyncStorage.getItem('@settings_life_expectancy');
      const savedHabits = await AsyncStorage.getItem('@settings_habits');
      const savedJournalPin = await AsyncStorage.getItem('@settings_journal_pin');
      
      // Force light mode for UI review as requested
      setThemeState('light'); 
      // if (savedTheme) setThemeState(savedTheme as ThemeMode);
      
      if (savedLang) setLanguageState(savedLang as Language);
      if (savedName) setNameState(savedName);
      if (savedAvatar) setAvatarUriState(savedAvatar);
      if (savedBirthDate) setBirthDateState(savedBirthDate);
      if (savedTargetDate) setTargetDateState(savedTargetDate);
      if (savedTargetStartDate) setTargetStartDateState(savedTargetStartDate);
      if (savedLifeExpectancy) setLifeExpectancyState(savedLifeExpectancy);
      
      if (savedJournalPin) {
          setJournalPin(savedJournalPin);
          setIsJournalLocked(true);
      }

      // Sync to widget
      if (savedBirthDate && savedTargetDate) {
        const currentLang = (savedLang as Language) || 'zh';
        syncWidgetData(savedTargetDate, savedBirthDate, {
          lifeProgress: TRANSLATIONS[currentLang].widget_life_progress,
          daysLeft: TRANSLATIONS[currentLang].widget_days_left
        });
      }
      
      if (savedHabits) {
          setActiveHabits(JSON.parse(savedHabits));
      } else {
          // Default to initial 4 habits for new users, but allow expansion
          setActiveHabits(HABITS_LIST.slice(0, 4)); 
      }

    } catch (e) {
      console.error('Failed to load settings');
    } finally {
      setIsLoaded(true);
    }
  };

  const calculateTargetDate = async (start: string | null, age: string | null) => {
    if (start && age && !isNaN(Number(age))) {
      const startDate = parseISO(start);
      if (isValid(startDate)) {
        const target = addYears(startDate, Number(age));
        const targetString = target.toISOString();
        setTargetDateState(targetString);
        await AsyncStorage.setItem('@settings_target_date', targetString);
        
        // Also set targetStartDate to the birthDate (start)
        setTargetStartDateState(start);
        await AsyncStorage.setItem('@settings_target_start_date', start);
        
        syncWidgetData(target.toISOString(), start, {
          lifeProgress: TRANSLATIONS[language].widget_life_progress,
          daysLeft: TRANSLATIONS[language].widget_days_left
        });
      }
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem('@settings_theme', newTheme);
  };

  const setLanguage = async (newLang: Language) => {
    setLanguageState(newLang);
    await AsyncStorage.setItem('@settings_lang', newLang);
    
    if (birthDate && targetDate) {
      syncWidgetData(targetDate, birthDate, {
        lifeProgress: TRANSLATIONS[newLang].widget_life_progress,
        daysLeft: TRANSLATIONS[newLang].widget_days_left
      });
    }
  };

  const setName = async (newName: string) => {
    setNameState(newName);
    await AsyncStorage.setItem('@settings_name', newName);
  };

  const setAvatarUri = async (newUri: string | null) => {
    setAvatarUriState(newUri);
    if (newUri) {
      await AsyncStorage.setItem('@settings_avatar', newUri);
    } else {
      await AsyncStorage.removeItem('@settings_avatar');
    }
  };

  const setBirthDate = async (date: string | null) => {
    setBirthDateState(date);
    if (date) {
      await AsyncStorage.setItem('@settings_birth_date', date);
      calculateTargetDate(date, lifeExpectancy);
    } else {
      await AsyncStorage.removeItem('@settings_birth_date');
    }
  };

  const setLifeExpectancy = async (age: string | null) => {
    setLifeExpectancyState(age);
    if (age) {
      await AsyncStorage.setItem('@settings_life_expectancy', age);
      calculateTargetDate(birthDate, age);
    } else {
      await AsyncStorage.removeItem('@settings_life_expectancy');
    }
  };

  const setTargetDate = async (date: string | null) => {
    setTargetDateState(date);
    if (date) {
      await AsyncStorage.setItem('@settings_target_date', date);
      // When manually setting target date (if we still support it), we might want to default start date to today
      // BUT, in the new "Life Countdown" mode, we primarily use calculateTargetDate via birthDate + Age
      // We can keep this for backward compatibility or direct setting
      const today = new Date().toISOString();
      if (!targetStartDate) {
         setTargetStartDateState(today);
         await AsyncStorage.setItem('@settings_target_start_date', today);
      }
      
      if (birthDate) {
        syncWidgetData(date, birthDate, {
          lifeProgress: TRANSLATIONS[language].widget_life_progress,
          daysLeft: TRANSLATIONS[language].widget_days_left
        });
      }
    } else {
      await AsyncStorage.removeItem('@settings_target_date');
      // Don't necessarily remove start date?
    }
  };

  const addHabit = async (label: string) => {
      const newHabit: Habit = {
          id: `custom_${Date.now()}`,
          label,
          icon: 'star-outline', // Unified icon for custom habits
          isCustom: true
      };
      const updated = [...activeHabits, newHabit];
      setActiveHabits(updated);
      await AsyncStorage.setItem('@settings_habits', JSON.stringify(updated));
  };

  const removeHabit = async (id: string) => {
      const updated = activeHabits.filter(h => h.id !== id);
      setActiveHabits(updated);
      await AsyncStorage.setItem('@settings_habits', JSON.stringify(updated));
  };

  const reorderHabits = async (newOrder: any[]) => {
      setActiveHabits(newOrder);
      await AsyncStorage.setItem('@settings_habits', JSON.stringify(newOrder));
  };

  const t = (key: keyof typeof TRANSLATIONS.en) => {
    return TRANSLATIONS[language][key] || key;
  };

  const colors = PALETTE[theme];

  const setJournalLock = async (pin: string | null) => {
      if (pin) {
          await AsyncStorage.setItem('@settings_journal_pin', pin);
          setJournalPin(pin);
          setIsJournalLocked(true);
      } else {
          await AsyncStorage.removeItem('@settings_journal_pin');
          setJournalPin(null);
          setIsJournalLocked(false);
      }
  };

  return (
    <SettingsContext.Provider value={{ 
        theme, 
        language, 
        name, 
        avatarUri, 
        birthDate, 
        targetDate, 
        targetStartDate, 
        lifeExpectancy, 
        colors, 
        activeHabits, 
        isJournalLocked,
        journalPin,
        isLoaded,
        t, 
        setTheme, 
        setLanguage, 
        setName, 
        setAvatarUri, 
        setBirthDate, 
        setTargetDate, 
        setLifeExpectancy, 
        setJournalLock,
        addHabit, 
        removeHabit, 
        reorderHabits 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
