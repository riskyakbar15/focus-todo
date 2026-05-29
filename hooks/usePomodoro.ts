import { useState, useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TimerMode } from "../types";
import {
  TIMER_DURATIONS,
  SESSIONS_BEFORE_LONG_BREAK,
} from "../constants/timer";
import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake";
import { useSound } from "./useSound";
import { loadTimerDurations, TimerDurations } from "./useTimerSettings";

const STORAGE_KEY = "focus_todo_timer";

interface PersistedTimerState {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  sessionCount: number;
  updatedAt: number;
}

function isTimerMode(value: unknown): value is TimerMode {
  return value === "focus" || value === "short_break" || value === "long_break";
}

function getNextMode(mode: TimerMode, nextSessionCount: number): TimerMode {
  if (mode !== "focus") return "focus";
  return nextSessionCount % SESSIONS_BEFORE_LONG_BREAK === 0
    ? "long_break"
    : "short_break";
}

function readPersistedTimer(raw: string): PersistedTimerState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedTimerState>;
    if (
      !isTimerMode(parsed.mode) ||
      typeof parsed.secondsLeft !== "number" ||
      typeof parsed.isRunning !== "boolean" ||
      typeof parsed.sessionCount !== "number" ||
      typeof parsed.updatedAt !== "number"
    ) {
      return null;
    }

    return {
      mode: parsed.mode,
      secondsLeft: Math.max(0, Math.floor(parsed.secondsLeft)),
      isRunning: parsed.isRunning,
      sessionCount: Math.max(0, Math.floor(parsed.sessionCount)),
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function usePomodoro(onSessionComplete?: (mode: TimerMode) => void) {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
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
  }, []);

  const handleComplete = useCallback(() => {
    setIsRunning(false);
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
        activateKeepAwake();
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

      const elapsedSeconds = stored.isRunning
        ? Math.max(0, Math.floor((Date.now() - stored.updatedAt) / 1000))
        : 0;
      const completedWhileAway =
        stored.isRunning && elapsedSeconds >= stored.secondsLeft;
      const nextSessionCount =
        completedWhileAway && stored.mode === "focus"
          ? stored.sessionCount + 1
          : stored.sessionCount;
      const nextMode = completedWhileAway
        ? getNextMode(stored.mode, nextSessionCount)
        : stored.mode;
      const nextSecondsLeft = completedWhileAway
        ? (durationsRef.current?.[nextMode] ?? TIMER_DURATIONS[nextMode])
        : Math.max(0, stored.secondsLeft - elapsedSeconds);

      setMode(nextMode);
      setSecondsLeft(nextSecondsLeft);
      setSessionCount(nextSessionCount);
      setIsRunning(stored.isRunning && !completedWhileAway);
      setHasLoaded(true);

      if (completedWhileAway) {
        onSessionCompleteRef.current?.(stored.mode);
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
      const state: PersistedTimerState = {
        mode,
        secondsLeft,
        isRunning,
        sessionCount,
        updatedAt: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    };

    persistTimer();
  }, [hasLoaded, isRunning, mode, secondsLeft, sessionCount]);

  useEffect(() => {
    if (!hasLoaded) return;

    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            handleComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [handleComplete, hasLoaded, isRunning]);

  const toggle = () => setIsRunning((r) => !r);
  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(TIMER_DURATIONS[mode]);
  };

  return {
    mode,
    secondsLeft,
    isRunning,
    sessionCount,
    toggle,
    reset,
    switchMode,
  };
}
