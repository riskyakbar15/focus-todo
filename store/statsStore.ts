import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FocusSession } from "../types";

const STORAGE_KEY = "focus_todo_focus_sessions";

// Keep a bounded history so stored data cannot grow without limit. The window
// is large enough to preserve year-long streaks and the 7-day chart.
const RETENTION_DAYS = 400;

const pruneOldSessions = (
  sessions: FocusSession[],
  now = new Date(),
): FocusSession[] => {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - (RETENTION_DAYS - 1));
  const cutoffKey = getLocalDateKey(cutoff);
  return sessions.filter((session) => session.date >= cutoffKey);
};

const createSessionId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isFocusSession = (value: unknown): value is FocusSession => {
  if (!value || typeof value !== "object") return false;

  const session = value as Partial<FocusSession>;
  return (
    typeof session.id === "string" &&
    typeof session.date === "string" &&
    typeof session.durationSeconds === "number" &&
    Number.isFinite(session.durationSeconds) &&
    (typeof session.taskId === "string" || session.taskId === null) &&
    typeof session.createdAt === "number" &&
    Number.isFinite(session.createdAt)
  );
};

const parseSessions = (raw: string | null): FocusSession[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isFocusSession) : [];
  } catch {
    return [];
  }
};

const save = async (sessions: FocusSession[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

interface StatsStore {
  sessions: FocusSession[];
  loadSessions: () => Promise<void>;
  addFocusSession: (input: {
    durationSeconds: number;
    taskId: string | null;
  }) => Promise<void>;
}

export const useStatsStore = create<StatsStore>()((set, get) => ({
  sessions: [],

  loadSessions: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = parseSessions(raw);
    const sessions = pruneOldSessions(parsed);
    set({ sessions });
    if (sessions.length !== parsed.length) {
      await save(sessions);
    }
  },

  addFocusSession: async ({ durationSeconds, taskId }) => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const currentSessions = parseSessions(raw);
    const session: FocusSession = {
      id: createSessionId(),
      date: getLocalDateKey(),
      durationSeconds,
      taskId,
      createdAt: Date.now(),
    };
    const sessions = pruneOldSessions([...currentSessions, session]);
    set({ sessions });
    await save(sessions);
  },
}));
