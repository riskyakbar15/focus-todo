import {
  createPersistedTimerState,
  getNextMode,
  readPersistedTimer,
  restoreTimerState,
} from "../utils/timerState";
import { TIMER_DURATIONS } from "../constants/timer";

describe("timerState", () => {
  it("chooses the next mode after focus and break sessions", () => {
    expect(getNextMode("focus", 1)).toBe("short_break");
    expect(getNextMode("focus", 4)).toBe("long_break");
    expect(getNextMode("short_break", 4)).toBe("focus");
    expect(getNextMode("long_break", 4)).toBe("focus");
  });

  it("persists explicit timer session boundaries", () => {
    expect(
      createPersistedTimerState({
        mode: "focus",
        secondsLeft: 60,
        isRunning: true,
        sessionCount: 2,
        startedAt: 1_000,
        endsAt: 61_000,
        notificationId: "notif-1",
        now: 2_000,
      }),
    ).toEqual({
      version: 2,
      mode: "focus",
      secondsLeft: 60,
      isRunning: true,
      sessionCount: 2,
      startedAt: 1_000,
      endsAt: 61_000,
      notificationId: "notif-1",
      updatedAt: 2_000,
    });
  });

  it("restores remaining time from endsAt", () => {
    const stored = readPersistedTimer(
      JSON.stringify({
        version: 2,
        mode: "focus",
        secondsLeft: 60,
        isRunning: true,
        sessionCount: 0,
        startedAt: 1_000,
        endsAt: 61_000,
        notificationId: "notif-1",
        updatedAt: 1_000,
      }),
    );

    expect(stored).not.toBeNull();
    expect(restoreTimerState(stored!, TIMER_DURATIONS, 31_000)).toEqual({
      mode: "focus",
      secondsLeft: 30,
      isRunning: true,
      sessionCount: 0,
      startedAt: 1_000,
      endsAt: 61_000,
      notificationId: "notif-1",
      completedMode: null,
    });
  });

  it("moves to the next mode when a running timer completed while away", () => {
    const stored = readPersistedTimer(
      JSON.stringify({
        version: 2,
        mode: "focus",
        secondsLeft: 60,
        isRunning: true,
        sessionCount: 3,
        startedAt: 1_000,
        endsAt: 61_000,
        notificationId: "notif-1",
        updatedAt: 1_000,
      }),
    );

    expect(restoreTimerState(stored!, TIMER_DURATIONS, 62_000)).toEqual({
      mode: "long_break",
      secondsLeft: TIMER_DURATIONS.long_break,
      isRunning: false,
      sessionCount: 4,
      startedAt: null,
      endsAt: null,
      notificationId: null,
      completedMode: "focus",
    });
  });
});
