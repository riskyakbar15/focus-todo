import { useState, useEffect, useRef } from "react";
import { TimerMode } from "../types";
import {
  TIMER_DURATIONS,
  SESSIONS_BEFORE_LONG_BREAK,
} from "../constants/timer";

export function usePomodoro(onSessionComplete?: (mode: TimerMode) => void) {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
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
  }, [isRunning]);

  const handleComplete = () => {
    setIsRunning(false);
    if (mode === "focus") {
      const next = sessionCount + 1;
      setSessionCount(next);
      onSessionComplete?.("focus");
      const nextMode =
        next % SESSIONS_BEFORE_LONG_BREAK === 0 ? "long_break" : "short_break";
      switchMode(nextMode);
    } else {
      switchMode("focus");
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setSecondsLeft(TIMER_DURATIONS[newMode]);
    setIsRunning(false);
  };

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
