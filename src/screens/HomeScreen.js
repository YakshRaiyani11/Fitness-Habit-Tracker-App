import React, { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { AnimatedCircularProgress } from "react-native-circular-progress";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getFormattedDate = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().split("T")[0];
};

export default function HomeScreen() {
  const [habits, setHabits] = useState([]);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [dailyProgress, setDailyProgress] = useState({});
  const today = getFormattedDate(0);
  const { dark } = useContext(ThemeContext);

  const loadData = async () => {
    try {
      const habitsData = await AsyncStorage.getItem("habits");
      const progressData = await AsyncStorage.getItem("dailyProgress");
      const parsedHabits = habitsData ? JSON.parse(habitsData) : [];
      const parsedProgress = progressData ? JSON.parse(progressData) : {};
      console.log(" Loaded Habits:", parsedHabits);
      console.log(" Loaded Progress:", parsedProgress);
      setHabits(parsedHabits);
      setDailyProgress(parsedProgress);
    } catch (error) {
      console.error("❌ Error loading data:", error);
    }
  };

  const saveData = async (updatedHabits, updatedProgress) => {
    try {
      setHabits(updatedHabits);
      setDailyProgress(updatedProgress);
      await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));
      await AsyncStorage.setItem(
        "dailyProgress",
        JSON.stringify(updatedProgress)
      );
    } catch (error) {
      console.error("❌ Error saving data:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const toggleCheckIn = async (id) => {
    const updatedHabits = habits.map((habit) => {
      if (habit.id === id) {
        const history = habit.history || {};
        const updatedHistory = { ...history, [today]: !history?.[today] };
        return { ...habit, history: updatedHistory };
      }
      return habit;
    });

    const checkedCount = updatedHabits.filter((h) => h.history?.[today]).length;
    const total = updatedHabits.length;

    const updatedProgress = {
      ...dailyProgress,
      [today]: { completed: checkedCount, total },
    };

    saveData(updatedHabits, updatedProgress);
  };

  const calculateStreak = (history = {}) => {
    let streak = 0;
    for (let i = 0; i < 7; i++) {
      const day = getFormattedDate(i);
      if (history?.[day] === true) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const saveEditedHabit = async () => {
    const updated = habits.map((habit) =>
      habit.id === editingHabitId ? { ...habit, name: editedName } : habit
    );
    saveData(updated, dailyProgress);
    setEditingHabitId(null);
    setEditedName("");
  };

  const handleDeleteHabit = (id) => {
    Alert.alert("Delete Habit", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedHabits = habits.filter((h) => h.id !== id);
          const checked = updatedHabits.filter(
            (h) => h.history?.[today]
          ).length;
          const updatedProgress = {
            ...dailyProgress,
            [today]: { completed: checked, total: updatedHabits.length },
          };
          saveData(updatedHabits, updatedProgress);
        },
      },
    ]);
  };
  const formatReminderTime = (isoTime) => {
    if (!isoTime) return null;
    const date = new Date(isoTime);
    return isNaN(date.getTime())
      ? null
      : date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
  };
  const getWeeklyDates = () => {
    return Array.from({ length: 7 }, (_, i) => getFormattedDate(6 - i));
  };

  const getDayName = (date) => {
    return dayNames[new Date(date).getDay()];
  };

  return (
    <View className={`flex-1 ${dark ? "bg-black" : "bg-white"}`}>
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        className="mt-10 px-4 py-6 "
      >
        <BlurView intensity={50} className="rounded-xl p-4">
          <View className="flex-row items-center">
            <Image
              source={{
                uri: "https://img.freepik.com/free-vector/fitness-banner_23-2147736128.jpg",
              }}
              className="w-14 h-14  mr-3"
            />
            <View>
              <Text className="text-white text-xl font-bold">
                Good Morning 👋
              </Text>
              <Text className="text-white text-sm">
                Crush your goals today!
              </Text>
            </View>
            <View className="ml-auto bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-white font-semibold">🔥 Streak</Text>
            </View>
          </View>
        </BlurView>
      </LinearGradient>

      <View className="px-4 mt-2">
        <LinearGradient
          colors={["#89f7fe", "#66a6ff"]}
          className="rounded-xl p-4 shadow"
        >
          <Text className="text-white font-semibold text-lg">
            Stay Consistent. You Got This! 💥
          </Text>
        </LinearGradient>
      </View>
      <View className="flex-1 bg-white">
        {/* Weekly Progress Rings */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 px-4"
        >
          {getWeeklyDates().map((date) => {
            const progress = dailyProgress?.[date];
            let completed = 0;
            let total = habits.length;

            if (progress) {
              completed =
                typeof progress.completed === "number" ? progress.completed : 0;
              total =
                typeof progress.total === "number" && progress.total > 0
                  ? progress.total
                  : habits.length;
            }

            // Prevent 0/0
            const rawPercent = total > 0 ? (completed / total) * 100 : 0;
            const safePercent = isNaN(rawPercent) ? 0 : rawPercent;

            console.log(
              ` ${date} - completed: ${completed}, total: ${total}, percent: ${safePercent}`
            );

            return (
              <View key={date} className="items-center mx-2 mb-4">
                <AnimatedCircularProgress
                  size={44} // ✅ explicitly set
                  width={5} // ✅ explicitly set (stroke width)
                  fill={Math.min(Math.max(Number(safePercent) || 0, 0), 100)} // ✅ clamp 0–100
                  tintColor="#395366"
                  backgroundColor="#e5e7eb"
                >
                  {() => (
                    <Text className="text-xs">{Math.round(safePercent)}%</Text>
                  )}
                </AnimatedCircularProgress>
                <Text className="text-xs mt-1">{getDayName(date)}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Habits List */}
        <ScrollView className="px-4 mt-4 ">
          {habits.map((habit) => {
            const checkedToday = habit.history?.[today] || false;
            const streak = calculateStreak(habit.history);

            return (
              <TouchableOpacity
                key={habit.id}
                onPress={() => toggleCheckIn(habit.id)}
                onLongPress={() => handleDeleteHabit(habit.id, habit.name)}
                className={`p-4 mb-3 rounded-2xl ${
                  checkedToday
                    ? "bg-blue-200"
                    : dark
                    ? "bg-slate-800"
                    : "bg-gray-100"
                }`}
              >
                <View className="flex-row justify-between items-center">
                  {editingHabitId === habit.id ? (
                    <TextInput
                      value={editedName}
                      onChangeText={setEditedName}
                      onSubmitEditing={saveEditedHabit}
                      className="text-base font-semibold bg-white px-2 py-1 rounded w-full"
                      autoFocus
                    />
                  ) : (
                    <>
                      <Text
                        className={` flex-row justify-between items-center text-lg font-semibold mb-1 ${
                          dark ? "text-white" : "text-blue-900"
                        }`}
                      > 
                        {habit.name}
                      </Text>
                      {habit.reminderTime && formatReminderTime(habit.reminderTime)&&(
                        <Text className="text-sm text-gray-500 mt-1">
                          ⏰ Reminder: {formatReminderTime(habit.reminderTime)}
                        </Text>
                      )}

                      <Text className="text-xs text-gray-500">{streak}🔥</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
