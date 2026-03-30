import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import { useColorScheme as useDeviceColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const deviceColorScheme = useDeviceColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>("system");

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("app_theme");
        if (savedTheme) {
          setThemeState(savedTheme as ThemeMode);
          applyTheme(savedTheme as ThemeMode);
        }
      } catch (e) {
        console.error("Failed to load theme", e);
      }
    };
    loadTheme();
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    if (mode === "system") {
      setColorScheme(deviceColorScheme || "light");
    } else {
      setColorScheme(mode);
    }
  };

  const setTheme = async (mode: ThemeMode) => {
    setThemeState(mode);
    applyTheme(mode);
    try {
      await AsyncStorage.setItem("app_theme", mode);
    } catch (e) {
      console.error("Failed to save theme", e);
    }
  };

  // Sync with system theme if mode is 'system'
  useEffect(() => {
    if (theme === "system") {
      setColorScheme(deviceColorScheme || "light");
    }
  }, [deviceColorScheme, theme]);

  const isDark = colorScheme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
