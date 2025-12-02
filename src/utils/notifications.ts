import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays, setHours, setMinutes, setSeconds, isBefore, startOfDay } from 'date-fns';

// Configure notification handler behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Daily Reminder',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }
  return true;
}

export async function scheduleReminders(isLoggedToday: boolean) {
  // 1. Cancel all existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 2. Schedule for the next 7 days
  const now = new Date();
  const REMINDER_HOUR = 20; // 8 PM
  const REMINDER_MINUTE = 0;

  for (let i = 0; i < 7; i++) {
    let date = addDays(now, i);
    
    // Set time to 20:00
    date = setHours(date, REMINDER_HOUR);
    date = setMinutes(date, REMINDER_MINUTE);
    date = setSeconds(date, 0);

    // If today (i=0)
    if (i === 0) {
      // If already logged today, skip today's reminder
      if (isLoggedToday) {
        continue;
      }
      // If not logged, but time has passed (e.g. it's 9 PM), 
      // we don't schedule for today
      if (isBefore(date, now)) {
        continue;
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Journal", // TODO: i18n?
        body: "How was your day? Take a moment to record your mood.",
        sound: true,
      },
      trigger: {
        date: date,
      } as any, // Cast to any to avoid type issues with different expo versions
    });
  }
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
