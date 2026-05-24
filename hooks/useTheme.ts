import { useColorScheme } from "react-native";

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
  },
};

export type Theme = typeof COLORS.light;

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = isDark ? COLORS.dark : COLORS.light;
  return { colors, isDark };
}
