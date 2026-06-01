import { TIMER_DURATIONS, SESSIONS_BEFORE_LONG_BREAK } from "../constants/timer";
import { TimerMode } from "../types";
import { TimerDurations } from "../hooks/useTimerSettings";

export interface PersistedTimerState {
  version: 2;
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  sessionCount: number;
  startedAt: number | null;
  endsAt: number | null;
  notificationId: string | null;
  updatedAt: number;
}

export interface RestoredTimerState {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  sessionCount: number;
  startedAt: number | null;
  endsAt: number | null;
  notificationId: string | null;
  completedMode: TimerMode | null;
}

type LegacyPersistedTimerState = {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  sessionCount: number;
  updatedAt: number;
};

export function isTimerMode(value: unknown): value is TimerMode {
  return value === "focus" || value === "short_break" || value === "long_break";
}

export function getNextMode(
  mode: TimerMode,
  nextSessionCount: number,
): TimerMode {
  if (mode !== "focus") return "focus";
  return nextSessionCount % SESSIONS_BEFORE_LONG_BREAK === 0
    ? "long_break"
    : "short_break";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeSeconds(value: number) {
  return Math.max(0, Math.floor(value));
}

function normalizeNullableTime(value: unknown) {
  return isFiniteNumber(value) ? value : null;
}

function readLegacyTimer(value: Partial<LegacyPersistedTimerState>) {
  if (
    !isTimerMode(value.mode) ||
    !isFiniteNumber(value.secondsLeft) ||
    typeof value.isRunning !== "boolean" ||
    !isFiniteNumber(value.sessionCount) ||
    !isFiniteNumber(value.updatedAt)
  ) {
    return null;
  }

  return {
    version: 2,
    mode: value.mode,
    secondsLeft: normalizeSeconds(value.secondsLeft),
    isRunning: value.isRunning,
    sessionCount: normalizeSeconds(value.sessionCount),
    startedAt: value.isRunning ? value.updatedAt : null,
    endsAt: value.isRunning
      ? value.updatedAt + normalizeSeconds(value.secondsLeft) * 1000
      : null,
    notificationId: null,
    updatedAt: value.updatedAt,
  } satisfies PersistedTimerState;
}

export function readPersistedTimer(raw: string): PersistedTimerState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedTimerState>;
    if (parsed.version !== 2) {
      return readLegacyTimer(parsed as Partial<LegacyPersistedTimerState>);
    }

    if (
      !isTimerMode(parsed.mode) ||
      !isFiniteNumber(parsed.secondsLeft) ||
      typeof parsed.isRunning !== "boolean" ||
      !isFiniteNumber(parsed.sessionCount) ||
      !isFiniteNumber(parsed.updatedAt) ||
      (parsed.notificationId !== null &&
        typeof parsed.notificationId !== "string" &&
        parsed.notificationId !== undefined)
    ) {
      return null;
    }

    return {
      version: 2,
      mode: parsed.mode,
      secondsLeft: normalizeSeconds(parsed.secondsLeft),
      isRunning: parsed.isRunning,
      sessionCount: normalizeSeconds(parsed.sessionCount),
      startedAt: normalizeNullableTime(parsed.startedAt),
      endsAt: normalizeNullableTime(parsed.endsAt),
      notificationId: parsed.notificationId ?? null,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function createPersistedTimerState(input: {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  sessionCount: number;
  startedAt: number | null;
  endsAt: number | null;
  notificationId: string | null;
  now?: number;
}): PersistedTimerState {
  return {
    version: 2,
    mode: input.mode,
    secondsLeft: normalizeSeconds(input.secondsLeft),
    isRunning: input.isRunning,
    sessionCount: normalizeSeconds(input.sessionCount),
    startedAt: input.isRunning ? input.startedAt : null,
    endsAt: input.isRunning ? input.endsAt : null,
    notificationId: input.notificationId,
    updatedAt: input.now ?? Date.now(),
  };
}

export function restoreTimerState(
  stored: PersistedTimerState,
  durations: TimerDurations | null,
  now = Date.now(),
): RestoredTimerState {
  const runningEndsAt =
    stored.endsAt !== null && Number.isFinite(stored.endsAt)
      ? stored.endsAt
      : null;
  const canResumeRunning = stored.isRunning && runningEndsAt !== null;
  const completedWhileAway = canResumeRunning && now >= runningEndsAt;
  const nextSessionCount =
    completedWhileAway && stored.mode === "focus"
      ? stored.sessionCount + 1
      : stored.sessionCount;
  const nextMode = completedWhileAway
    ? getNextMode(stored.mode, nextSessionCount)
    : stored.mode;
  const nextSecondsLeft = completedWhileAway
    ? (durations?.[nextMode] ?? TIMER_DURATIONS[nextMode])
    : canResumeRunning
      ? Math.max(0, Math.ceil((runningEndsAt - now) / 1000))
      : stored.secondsLeft;

  return {
    mode: nextMode,
    secondsLeft: nextSecondsLeft,
    isRunning: canResumeRunning && !completedWhileAway,
    sessionCount: nextSessionCount,
    startedAt: canResumeRunning && !completedWhileAway ? stored.startedAt : null,
    endsAt: canResumeRunning && !completedWhileAway ? runningEndsAt : null,
    notificationId: canResumeRunning && !completedWhileAway
      ? stored.notificationId
      : null,
    completedMode: completedWhileAway ? stored.mode : null,
  };
}
