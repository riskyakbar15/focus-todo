import { useState, useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TimerMode } from "../types";
import { TIMER_DURATIONS } from "../constants/timer";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useSound } from "./useSound";
import { loadTimerDurations, TimerDurations } from "./useTimerSettings";
import {
  createPersistedTimerState,
  getNextMode,
  readPersistedTimer,
  restoreTimerState,
} from "../utils/timerState";

const STORAGE_KEY = "focus_todo_timer";

export function usePomodoro(onSessionComplete?: (mode: TimerMode) => void) {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationsRef = useRef<TimerDurations | null>(null);
  const onSessionCompleteRef = useRef(onSessionComplete);
  const { playEndSound } = useSound();

  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setSecondsLeft(durationsRef.current?.[newMode] ?? TIMER_DURATIONS[newMode]);
    setIsRunning(false);
    setStartedAt(null);
    setEndsAt(null);
    setNotificationId(null);
  }, []);

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    setStartedAt(null);
    setEndsAt(null);
    setNotificationId(null);
    onSessionCompleteRef.current?.(mode);
    // play end sound (best-effort)
    try {
      void playEndSound();
    } catch {
      // ignore
    }

    if (mode === "focus") {
      const next = sessionCount + 1;
      setSessionCount(next);
      const nextMode = getNextMode(mode, next);
      switchMode(nextMode);
    } else {
      switchMode("focus");
    }
  }, [mode, sessionCount, switchMode]);

  // Keep screen awake when timer is running
  useEffect(() => {
    if (isRunning) {
      try {
        void activateKeepAwakeAsync();
      } catch {
        // ignore if module not available
      }
    } else {
      try {
        deactivateKeepAwake();
      } catch {
        // ignore
      }
    }
    return () => {
      try {
        deactivateKeepAwake();
      } catch {
        // ignore
      }
    };
  }, [isRunning]);

  useEffect(() => {
    let isMounted = true;

    const loadTimer = async () => {
      // load configured durations
      try {
        durationsRef.current = await loadTimerDurations();
      } catch {
        durationsRef.current = null;
      }
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!isMounted) return;

      const stored = raw ? readPersistedTimer(raw) : null;
      if (!stored) {
        setHasLoaded(true);
        return;
      }

      const restored = restoreTimerState(stored, durationsRef.current);
      setMode(restored.mode);
      setSecondsLeft(restored.secondsLeft);
      setSessionCount(restored.sessionCount);
      setStartedAt(restored.startedAt);
      setEndsAt(restored.endsAt);
      setNotificationId(restored.notificationId);
      setIsRunning(restored.isRunning);
      setHasLoaded(true);

      if (restored.completedMode) {
        onSessionCompleteRef.current?.(restored.completedMode);
      }
    };

    loadTimer();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;

    const persistTimer = async () => {
      const state = createPersistedTimerState({
        mode,
        secondsLeft,
        isRunning,
        sessionCount,
        startedAt,
        endsAt,
        notificationId,
      });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    };

    persistTimer();
  }, [
    endsAt,
    hasLoaded,
    isRunning,
    mode,
    notificationId,
    secondsLeft,
    sessionCount,
    startedAt,
  ]);

  useEffect(() => {
    if (!hasLoaded) return;

    if (!isRunning || endsAt === null) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Derive remaining time from the wall-clock deadline so the countdown
    // stays accurate even if setInterval ticks late or is throttled.
    let completed = false;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0 && !completed) {
        completed = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        handleComplete();
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 250);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [endsAt, handleComplete, hasLoaded, isRunning]);

  const toggle = () => {
    if (isRunning) {
      setIsRunning(false);
      setStartedAt(null);
      setEndsAt(null);
      return;
    }

    const now = Date.now();
    setStartedAt(now);
    setEndsAt(now + secondsLeft * 1000);
    setIsRunning(true);
  };
  const reset = () => {
    setIsRunning(false);
    setStartedAt(null);
    setEndsAt(null);
    setNotificationId(null);
    setSecondsLeft(durationsRef.current?.[mode] ?? TIMER_DURATIONS[mode]);
  };

  return {
    mode,
    secondsLeft,
    isRunning,
    sessionCount,
    toggle,
    reset,
    switchMode,
    notificationId,
    setNotificationId,
  };
}
