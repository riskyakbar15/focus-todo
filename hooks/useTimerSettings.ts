import AsyncStorage from "@react-native-async-storage/async-storage";
import { TIMER_DURATIONS } from "../constants/timer";

export type TimerDurations = {
  focus: number;
  short_break: number;
  long_break: number;
};

const STORAGE_KEY = "focus_todo_timer_settings";

function defaultDurations(): TimerDurations {
  return {
    focus: TIMER_DURATIONS.focus,
    short_break: TIMER_DURATIONS.short_break,
    long_break: TIMER_DURATIONS.long_break,
  };
}

export async function loadTimerDurations(): Promise<TimerDurations> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDurations();
    const parsed = JSON.parse(raw);
    return {
      focus: Number(parsed.focus) || TIMER_DURATIONS.focus,
      short_break: Number(parsed.short_break) || TIMER_DURATIONS.short_break,
      long_break: Number(parsed.long_break) || TIMER_DURATIONS.long_break,
    };
  } catch {
    return defaultDurations();
  }
}

export async function saveTimerDurations(d: Partial<TimerDurations>) {
  try {
    const current = await loadTimerDurations();
    const next = { ...current, ...d };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore write errors
  }
}

export async function resetTimerDurations() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
