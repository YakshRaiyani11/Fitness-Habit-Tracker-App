import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { getItem, setItem } from '../storage/mmkvStorage';

export default function HomeScreen() {
  const [habits, setHabits] = useState([]);

  // Load habits from MMKV
  useEffect(() => {
    const loadHabits = () => {
      const storedHabits = getItem('habits');
      if (storedHabits) {
        setHabits(storedHabits);
      } else {
        // If no habits exist, use some defaults
        const defaultHabits = [
          { id: '1', name: '💧 Drink Water', completed: false },
          { id: '2', name: '🧘 Meditate', completed: false },
          { id: '3', name: '🏋️ Workout', completed: false },
        ];
        setHabits(defaultHabits);
        setItem('habits', defaultHabits);
      }
    };

    loadHabits();
  }, []);

  const toggleHabit = (id) => {
    const updated = habits.map((habit) =>
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    );
    setHabits(updated);
    setItem('habits', updated);
  };

  return (
    <View className="flex-1 bg-white px-4 pt-10">
      <Text className="text-2xl font-bold text-blue-600 mb-4">Today's Habits</Text>

      <ScrollView>
        {habits.map((habit) => (
          <TouchableOpacity
            key={habit.id}
            onPress={() => toggleHabit(habit.id)}
            className={`p-4 mb-3 rounded-xl ${
              habit.completed ? 'bg-green-200' : 'bg-blue-100'
            }`}
          >
            <Text
              className={`text-lg font-semibold ${
                habit.completed ? 'text-green-800 line-through' : 'text-blue-800'
              }`}
            >
              {habit.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
