import React, { useState, useEffect, useContext } from "react";
import { View, Text, Switch, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { ThemeContext } from "../context/ThemeContext";
import { scheduleDailyNotification } from "../utils/notifications";
export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { dark, toggleTheme } = useContext(ThemeContext);
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const theme = await AsyncStorage.getItem("theme");
    const notify = await AsyncStorage.getItem("notifications");
    setDarkMode(theme === "dark");
    setNotificationsEnabled(notify === "true");
  };

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    await AsyncStorage.setItem("theme", newMode ? "dark" : "light");
    Alert.alert(
      "Theme updated",
      `Switched to ${newMode ? "Dark" : "Light"} mode.`,
    );
  };

  const toggleNotifications = async () => {
    const newVal = !notificationsEnabled;
    setNotificationsEnabled(newVal);
    await AsyncStorage.setItem("notifications", newVal.toString());

    if (newVal) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Enable notification permissions to get reminders.",
        );
        return;
      }
      await scheduleDailyNotification();
      Alert.alert("✅ Reminder Set", "You’ll get a reminder daily at 9 AM");
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert("❌ Reminder Disabled");
    }
  };

  const clearAllHabits = async () => {
    Alert.alert("Clear All Habits", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("habits");
          Alert.alert("Success", "All habits have been cleared.");
        },
      },
    ]);
  };

  return (
    <View className={`flex-1 px-4 pt-10 ${dark ? "bg-black" : "bg-white"}`}>
      <Text
        className={`text-2xl font-bold mb-4 ${dark ? "text-white" : "text-blue-600"}`}
      >
        ⚙️ Settings
      </Text>

      <View className="flex-row justify-between items-center mb-4">
        <Text className={`text-lg ${dark ? "text-white" : "text-blue-600"}`}>
          🌙 Dark Mode
        </Text>
        <Switch value={dark} onValueChange={toggleTheme} />
      </View>

      <View className="flex-row justify-between items-center mb-4">
        <Text className={`text-lg ${dark ? "text-white" : "text-blue-600"}`}>
          🔔 Daily Notifications
        </Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>

      <TouchableOpacity
        onPress={clearAllHabits}
        className="bg-red-500 rounded-lg p-3 mt-6"
      >
        <Text className="text-white text-center font-semibold">
          🧹 Clear All Habits
        </Text>
      </TouchableOpacity>
    </View>
  );
}
