// utils/notification.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Call this in App.js once 
export const configureNotifications = async () => {
  await Notifications.requestPermissionsAsync();

  if (Platform.OS === 'android' ? 'alarm' : true) {
    await Notifications.setNotificationChannelAsync('habit-reminders', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'audio.mp3',
    });
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

// Schedule daily notification at a specific time
export const scheduleDailyReminder = async (title, hour, minute) => {
  const now = new Date();

  const trigger = new Date();
  trigger.setHours(hour);
  trigger.setMinutes(minute);
  trigger.setSeconds(0);

  // 🔁 If time already passed today, schedule for tomorrow
  if (trigger <= now) {
    trigger.setDate(trigger.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: `⏰ Time for your habit: ${title}`,
      sound: 'audio.mp3',
      channelId: 'habit-reminders',
    },
    trigger, // ← Now using full Date object
  });

  console.log('✅ Notification scheduled for:', trigger.toString());
};

// Optional: Cancel all notifications (for dev/debug)
export const cancelAllReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
