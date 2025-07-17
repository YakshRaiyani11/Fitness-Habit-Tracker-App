import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("reminder-alarm", {
    name: "Reminder Alarm",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default", // Use custom sound if you want
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });
}

export default function App() {
  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppNavigator />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
