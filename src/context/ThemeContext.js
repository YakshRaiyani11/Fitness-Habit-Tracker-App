import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext();

// eslint-disable-next-line react/prop-types
export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("theme");
      setDark(stored === "dark");
    })();
  }, []);

  const toggleTheme = async () => {
    const newValue = !dark;
    setDark(newValue);
    await AsyncStorage.setItem("theme", newValue ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
