import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocalDateKey, useStatsStore } from "../store/statsStore";

jest.mock(
  "@react-native-async-storage/async-storage",
  () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

describe("statsStore", () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-01T10:00:00+08:00"));
    await AsyncStorage.clear();
    useStatsStore.setState({ sessions: [] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("adds focus sessions with a local date key", async () => {
    await useStatsStore.getState().addFocusSession({
      durationSeconds: 25 * 60,
      taskId: null,
    });

    expect(useStatsStore.getState().sessions).toEqual([
      expect.objectContaining({
        date: "2026-06-01",
        durationSeconds: 1500,
        taskId: null,
        createdAt: Date.now(),
      }),
    ]);
  });

  it("loads valid stored sessions and ignores invalid entries", async () => {
    await AsyncStorage.setItem(
      "focus_todo_focus_sessions",
      JSON.stringify([
        {
          id: "session-1",
          date: "2026-06-01",
          durationSeconds: 1500,
          taskId: "task-1",
          createdAt: 1,
        },
        { id: "bad-session", date: "2026-06-01" },
      ]),
    );

    await useStatsStore.getState().loadSessions();

    expect(useStatsStore.getState().sessions).toEqual([
      {
        id: "session-1",
        date: "2026-06-01",
        durationSeconds: 1500,
        taskId: "task-1",
        createdAt: 1,
      },
    ]);
  });

  it("formats local date keys", () => {
    expect(getLocalDateKey(new Date("2026-01-02T03:04:05+08:00"))).toBe(
      "2026-01-02",
    );
  });
});
