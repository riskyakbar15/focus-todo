import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, TextInput } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "@expo-google-fonts/plus-jakarta-sans/useFonts";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { ThemeProvider } from "../hooks/useTheme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    const textAny = Text as any;
    const inputAny = TextInput as any;

    textAny.defaultProps = textAny.defaultProps || {};
    inputAny.defaultProps = inputAny.defaultProps || {};

    textAny.defaultProps.style = [
      { fontFamily: "PlusJakartaSans_400Regular" },
      textAny.defaultProps.style,
    ];
    inputAny.defaultProps.style = [
      { fontFamily: "PlusJakartaSans_400Regular" },
      inputAny.defaultProps.style,
    ];

    SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="timer" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
