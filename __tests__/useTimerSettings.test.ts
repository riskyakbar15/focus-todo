import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loadTimerDurations,
  resetTimerDurations,
  saveTimerDurations,
} from "../hooks/useTimerSettings";
import { TIMER_DURATIONS } from "../constants/timer";

jest.mock(
  "@react-native-async-storage/async-storage",
  () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

describe("useTimerSettings storage helpers", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("loads defaults when settings are missing or invalid", async () => {
    await expect(loadTimerDurations()).resolves.toEqual(TIMER_DURATIONS);

    await AsyncStorage.setItem("focus_todo_timer_settings", "{not-json");

    await expect(loadTimerDurations()).resolves.toEqual(TIMER_DURATIONS);
  });

  it("saves partial duration updates and can reset them", async () => {
    await saveTimerDurations({ focus: 10 * 60 });

    await expect(loadTimerDurations()).resolves.toEqual({
      ...TIMER_DURATIONS,
      focus: 600,
    });

    await resetTimerDurations();

    await expect(loadTimerDurations()).resolves.toEqual(TIMER_DURATIONS);
  });
});
