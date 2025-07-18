import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { scheduleDailyReminder } from '../utils/notifications';

export default function AddHabitScreen() {
  const [habitName, setHabitName] = useState("");
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const navigation = useNavigation();
  const handleAddHabit = async () => {
  if (!habitName.trim()) {
    Alert.alert('Please enter a habit name');
    return;
  }

  const hour = reminderTime.getHours();
  const minute = reminderTime.getMinutes();

// ✅ Subtract 1 minute to compensate for OS delay
let adjustedHour = hour;
let adjustedMinute = minute - 1;

if (adjustedMinute < 0) {
  adjustedMinute = 59;
  adjustedHour = adjustedHour === 0 ? 23 : adjustedHour - 1;
}
  // Save to AsyncStorage (optional)
  const newHabit = {
    id: Date.now().toString(),
    name: habitName,
    reminderTime: new Date(reminderTime).toISOString(),
  };
  const stored = await AsyncStorage.getItem('habits');
  const habits = stored ? JSON.parse(stored) : [];
  await AsyncStorage.setItem('habits', JSON.stringify([...habits, newHabit]));

  // Schedule Notification
  await scheduleDailyReminder(habitName, adjustedHour, adjustedMinute);

  Alert.alert('Success', 'Habit added with daily reminder!');
  navigation.navigate('Home');
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
