import * as Notifications from 'expo-notifications';

export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] All notifications cancelled successfully.');
  } catch (error) {
    console.error('[Notifications] Error cancelling notifications:', error);
  }
}

