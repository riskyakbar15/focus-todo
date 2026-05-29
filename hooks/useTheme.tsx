import { useColorScheme } from "react-native";
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Warna tema ────────────────────────────────────────────────────────────
const COLORS = {
  light: {
    background: "#ffffff",
    backgroundSoft: "#FAFAFE",
    surface: "#F5F3FF",
    border: "#E0DEF8",
    borderSoft: "#eee",
    text: "#1a1a1a",
    textSecondary: "#888",
    textMuted: "#bbb",
    primary: "#534AB7",
    primarySoft: "#EEEDFE",
    primaryMuted: "#C5C2E8",
    danger: "#EF4444",
    dangerSoft: "#FEF2F2",
    checkTrack: "#F0EEF8",
    onPrimary: "#ffffff",
    timerTrack: "#F0EEF8",
    timerModes: {
      focus: {
        foreground: "#534AB7",
        background: "#EEEDFE",
      },
      short_break: {
        foreground: "#1D9E75",
        background: "#E1F5EE",
      },
      long_break: {
        foreground: "#185FA5",
        background: "#E6F1FB",
      },
    },
  },
  dark: {
    background: "#0F0E17",
    backgroundSoft: "#1A1925",
    surface: "#231F35",
    border: "#3A3560",
    borderSoft: "#2A2640",
    text: "#F0EEF8",
    textSecondary: "#9B97BB",
    textMuted: "#5C5880",
    primary: "#7B72D4",
    primarySoft: "#2D2850",
    primaryMuted: "#3D3870",
    danger: "#F87171",
    dangerSoft: "#3B1A1A",
    checkTrack: "#2A2640",
    onPrimary: "#ffffff",
    timerTrack: "#28243B",
    timerModes: {
      focus: {
        foreground: "#9D94F2",
        background: "#28244A",
      },
      short_break: {
        foreground: "#62D6A5",
        background: "#15382F",
      },
      long_break: {
        foreground: "#76B7F3",
        background: "#17314D",
      },
    },
  },
};

export type Theme = typeof COLORS.light;
export type ThemePreference = "system" | "light" | "dark";

const THEME_KEY = "focus_todo_theme";

type ThemeContextValue = {
  colors: Theme;
  isDark: boolean;
  preference: ThemePreference;
  loaded: boolean;
  setPreference: (p: ThemePreference) => Promise<void>;
};

const defaultValue: ThemeContextValue = {
  colors: COLORS.light,
  isDark: false,
  preference: "system",
  loaded: false,
  setPreference: async () => {},
};

const ThemeContext = createContext<ThemeContextValue>(defaultValue);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(THEME_KEY);
        if (!mounted) return;
        if (raw === "light" || raw === "dark" || raw === "system") {
          setPreferenceState(raw as ThemePreference);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const isDark =
    preference === "system" ? systemScheme === "dark" : preference === "dark";
  const colors = isDark ? COLORS.dark : COLORS.light;

  const setPreference = async (p: ThemePreference) => {
    try {
      setPreferenceState(p);
      await AsyncStorage.setItem(THEME_KEY, p);
    } catch {
      // ignore
    }
  };

  return (
    <ThemeContext.Provider
      value={{ colors, isDark, preference, loaded, setPreference }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
