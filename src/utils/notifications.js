import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Set default notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 📌 One-time notification (e.g., 5 minutes from now)
export const scheduleOneTimeNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Habit Reminder",
      body: "Time to check in your habit!",
      sound: true,
    },
    trigger: {
      seconds: 300, // 5 minutes
      channelId: "reminder-alarm", // (Android only)
    },
  });
};

// 📌 Daily repeating notification at specific time
export const scheduleDailyReminder = async (habitName, time) => {
  const triggerTime = new Date(time);
  if (triggerTime < new Date()) {
    triggerTime.setDate(triggerTime.getDate() + 1); // Shift to next day if past
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${habitName}`,
      body: `⏰ It's time for your habit: ${habitName}`,
      sound: Platform.OS === "android" ? "alarm" : true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      hour: triggerTime.getHours(),
      minute: triggerTime.getMinutes(),
      repeats: true,
    },
  });
};

// 📌 Optional: cancel all scheduled notifications
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
