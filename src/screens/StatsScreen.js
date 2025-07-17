import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function StatsScreen() {
  const [labels, setLabels] = useState([]);
  const [counts, setCounts] = useState([]);
  const [totalHabits, setTotalHabits] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      const stored = await AsyncStorage.getItem("habits");
      let habits = [];

      try {
        habits = stored ? JSON.parse(stored) : [];
        setTotalHabits(habits.length);
      } catch (e) {
        console.error("Error parsing habits:", e);
      }

      const today = new Date();
      const past7 = Array.from({ length: 7 })
        .map((_, i) => {
          const d = new Date();
          d.setDate(today.getDate() - i);
          return d.toISOString().split("T")[0];
        })
        .reverse();

      const chartData = past7.map((date) => {
        let count = 0;
        habits.forEach((habit) => {
          if (habit.history && habit.history[date]) count++;
        });
        return {
          date: new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
          }), // "Mon", "Tue", etc.
          count,
        };
      });

      setLabels(chartData.map((d) => d.date));
      setCounts(chartData.map((d) => d.count));
    };

    loadStats();
  }, []);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#f3f4f6",
        paddingTop: 40,
        paddingHorizontal: 16,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: "#4f46e5",
          marginBottom: 16,
        }}
      >
        📊 Your Weekly Stats
      </Text>

      <View
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 16,
          padding: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        {counts.length > 0 ? (
          <BarChart
            data={{
              labels,
              datasets: [{ data: counts }],
            }}
            width={screenWidth - 57}
            height={350}
            fromZero
            yAxisSuffix=""
            yAxisInterval={1}
            showBarTops
            showValuesOnTopOfBars
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
              labelColor: () => "#6b7280",
              style: {
                borderRadius: 16,
              },
              propsForLabels: {
                fontSize: 12,
              },
            }}
            style={{ borderRadius: 12 }}
          />
        ) : (
          <Text
            style={{
              marginTop: 40,
              textAlign: "center",
              color: "#9ca3af",
              fontSize: 16,
            }}
          >
            No data found yet. Start checking in your habits!
          </Text>
        )}
      </View>

      {/* Daily Summary */}
      {counts.length > 0 && (
        <View
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: "#6366f1",
            borderRadius: 16,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 4,
            }}
          >
            Weekly Summary
          </Text>
          <Text style={{ color: "#e0e7ff" }}>Total habits: {totalHabits}</Text>
          <Text style={{ color: "#e0e7ff" }}>
            Avg habits completed/day:{" "}
            {(counts.reduce((a, b) => a + b, 0) / 7).toFixed(1)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
