import React, { useState, useCallback, useContext, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getFormattedDate = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().split('T')[0];
};

export default function HomeScreen() {
  const [habits, setHabits] = useState([]);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [dailyProgress, setDailyProgress] = useState({});
  const today = getFormattedDate(0);
  const { dark } = useContext(ThemeContext);

  // 🧠 Load habits + dailyProgress from AsyncStorage
  const loadData = async () => {
    const habitsData = await AsyncStorage.getItem('habits');
    const progressData = await AsyncStorage.getItem('dailyProgress');
    setHabits(habitsData ? JSON.parse(habitsData) : []);
    setDailyProgress(progressData ? JSON.parse(progressData) : {});
  };

  const saveData = async (updatedHabits, updatedProgress) => {
    setHabits(updatedHabits);
    setDailyProgress(updatedProgress);
    await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
    await AsyncStorage.setItem('dailyProgress', JSON.stringify(updatedProgress));
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  // ✅ Toggle check-in for a habit today
  const toggleCheckIn = async (id) => {
    const updatedHabits = habits.map((habit) => {
      if (habit.id === id) {
        const history = habit.history || {};
        const updatedHistory = { ...history, [today]: !history?.[today] };
        return { ...habit, history: updatedHistory };
      }
      return habit;
    });

    // 👇 Update dailyProgress
    const checkedCount = updatedHabits.filter(h => h.history?.[today]).length;
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
      if (history[day]) streak++;
      else break;
    }
    return streak;
  };

  const handleEditHabit = (id, name) => {
    setEditingHabitId(id);
    setEditedName(name);
  };

  const saveEditedHabit = async () => {
    const updated = habits.map((habit) =>
      habit.id === editingHabitId ? { ...habit, name: editedName } : habit
    );
    saveData(updated, dailyProgress);
    setEditingHabitId(null);
    setEditedName('');
  };

  const handleDeleteHabit = (id) => {
    Alert.alert('Delete Habit', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedHabits = habits.filter(h => h.id !== id);
          const checked = updatedHabits.filter(h => h.history?.[today]).length;
          const updatedProgress = {
            ...dailyProgress,
            [today]: { completed: checked, total: updatedHabits.length }
          };
          saveData(updatedHabits, updatedProgress);
        },
      },
    ]);
  };

  const getWeeklyDates = () => {
    return Array.from({ length: 7 }, (_, i) => getFormattedDate(6 - i));
  };

  const getDayName = (date) => {
    return dayNames[new Date(date).getDay()];
  };

  return (
    <View className={`flex-1 ${dark ? 'bg-black' : 'bg-white'}`}>
      {/* Header Banner */}
      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} className="mt-10 px-4 py-6 rounded-b-3xl">
        <BlurView intensity={50} className="rounded-xl p-4">
          <View className="flex-row items-center">
            <Image
              source={{ uri: 'https://img.freepik.com/free-vector/fitness-banner_23-2147736128.jpg' }}
              className="w-14 h-14 rounded-full mr-3"
            />
            <View>
              <Text className="text-white text-xl font-bold">Good Morning 👋</Text>
              <Text className="text-white text-sm">Crush your goals today!</Text>
            </View>
            <View className="ml-auto bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-white font-semibold">🔥 Streak</Text>
            </View>
          </View>
        </BlurView>
      </LinearGradient>

      {/* Motivation */}
      <View className="px-4 mt-4">
        <LinearGradient colors={['#89f7fe', '#66a6ff']} className="rounded-xl p-4 shadow">
          <Text className="text-white font-semibold text-lg">Stay Consistent. You Got This! 💥</Text>
        </LinearGradient>
      </View>

      {/* Weekly Progress Rings */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 px-4">
        {getWeeklyDates().map((date) => {
          const data = dailyProgress[date] || { completed: 0, total: habits.length || 1 };
          const percent = (data.completed / data.total) * 100;

          return (
            <View key={date} className="items-center mx-2">
              <AnimatedCircularProgress
                size={44}
                width={5}
                fill={percent}
                tintColor="#395366"
                backgroundColor="#e5e7eb"
              >
                {() => <Text className="text-xs">{Math.round(percent)}%</Text>}
              </AnimatedCircularProgress>
              <Text className="text-xs mt-1">{getDayName(date)}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Habits List */}
      <ScrollView className="px-4 mt-5 ">
        {habits.map((habit) => {
          const checkedToday = habit.history?.[today] || false;
          const streak = calculateStreak(habit.history);

          return (
            <TouchableOpacity
              key={habit.id}
              onPress={() => toggleCheckIn(habit.id)}
              // onLongPress={() => handleEditHabit(habit.id, habit.name)}
              onLongPress={() => handleDeleteHabit(habit.id, habit.name)}
              className={`p-4 mb-3 rounded-2xl ${checkedToday ? 'bg-blue-200' : dark ? 'bg-slate-800' : 'bg-gray-100'}`}
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
                    <Text className={`text-lg font-semibold ${dark ? 'text-white' : 'text-blue-900'}`}>
                      {habit.name}
                    </Text>
                    <Text className="text-xs text-gray-500">{streak}🔥</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}



