import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import { useEffect } from 'react';
import { configureNotifications } from './src/utils/notifications';
export default function App() {
  useEffect(() => {
    configureNotifications(); // 🔔 Setup channels + permissions
  }, []);

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppNavigator />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
