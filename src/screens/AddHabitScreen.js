import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";

export default function AddHabitScreen() {
  const [habitName, setHabitName] = useState("");
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    Notifications.requestPermissionsAsync();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  const scheduleNotification = async (habitId, name, time) => {
    const trigger = new Date(time);
    if (trigger < new Date()) {
      trigger.setDate(trigger.getDate() + 1); // shift to next day if past
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${name}`,
        body: `⏰ It's time for your habit: ${name}`,
        sound: Platform.OS === "android" ? "alarm" : undefined,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        hour: trigger.getHours(),
        minute: trigger.getMinutes(),
        repeats: true,
      },
    });
  };

  const handleAddHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert("Please enter a habit name");
      return;
    }

    try {
      const storedHabits = await AsyncStorage.getItem("habits");
      const habits = storedHabits ? JSON.parse(storedHabits) : [];

      const newHabit = {
        id: Date.now().toString(),
        name: habitName,
        completed: false,
        reminder: reminderTime.toISOString(),
        history: [],
      };

      const updatedHabits = [...habits, newHabit];
      await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));

      // ✅ 📢 Schedule notification at the selected time
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${habitName}`,
          body: `⏰ It's time for your habit: ${habitName}`,
          sound: Platform.OS === "android" ? "alarm" : undefined,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: reminderTime.getHours(),
          minute: reminderTime.getMinutes(),
          repeats: true, // Repeat daily
        },
      });

      setHabitName("");
      Alert.alert("Success", "Habit and reminder added!");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Failed to add habit", error);
      Alert.alert("Error adding habit");
    }
  };

  return (
    <View className="flex-1 bg-white px-6 pt-10">
      <Text className="text-3xl font-extrabold text-indigo-600 mb-4">
        Add New Habit
      </Text>

      <View className="mb-4">
        <Text className="text-lg font-medium text-gray-700 mb-1">
          Habit Name
        </Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
          placeholder="e.g. Drink Water"
          value={habitName}
          onChangeText={setHabitName}
        />
      </View>

      <View className="mb-4">
        <Text className="text-lg font-medium text-gray-700 mb-1">
          Reminder Time
        </Text>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          className="bg-indigo-100 py-3 px-4 rounded-xl"
        >
          <Text className="text-indigo-800 font-semibold">
            {reminderTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setReminderTime(selectedDate);
            }}
          />
        )}
      </View>

      <TouchableOpacity
        className="bg-indigo-600 py-4 rounded-xl items-center mt-4"
        onPress={handleAddHabit}
      >
        <Text className="text-white text-base font-semibold">
          ➕ Add Habit with Reminder
        </Text>
      </TouchableOpacity>
    </View>
  );
}
