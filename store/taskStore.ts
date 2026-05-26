import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task } from "../types";

interface TaskStore {
  tasks: Task[];
  activeTaskId: string | null;
  loadTasks: () => Promise<void>;
  addTask: (title: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addSession: (id: string) => Promise<void>;
  setActiveTask: (id: string | null) => Promise<void>;
  moveUp: (id: string) => Promise<void>;
  moveDown: (id: string) => Promise<void>;
}

const STORAGE_KEY = "focus_todo_tasks";
const ACTIVE_TASK_STORAGE_KEY = "focus_todo_active_task";

const isTask = (value: unknown): value is Task => {
  if (!value || typeof value !== "object") return false;

  const task = value as Partial<Task>;
  return (
    typeof task.id === "string" &&
    task.id.length > 0 &&
    typeof task.title === "string" &&
    task.title.length > 0 &&
    typeof task.completed === "boolean" &&
    typeof task.sessions === "number" &&
    Number.isFinite(task.sessions) &&
    typeof task.createdAt === "number" &&
    Number.isFinite(task.createdAt)
  );
};

const parseTasks = (raw: string | null): Task[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTask) : [];
  } catch {
    return [];
  }
};

const createTaskId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const save = async (tasks: Task[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const useTaskStore = create<TaskStore>()((set, get) => ({
  tasks: [],
  activeTaskId: null,

  loadTasks: async () => {
    const [raw, activeTaskId] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(ACTIVE_TASK_STORAGE_KEY),
    ]);
    const tasks = parseTasks(raw);
    const hasActiveTask = tasks.some((t: Task) => t.id === activeTaskId);
    set({ tasks, activeTaskId: hasActiveTask ? activeTaskId : null });
  },

  addTask: async (title) => {
    const task: Task = {
      id: createTaskId(),
      title,
      completed: false,
      sessions: 0,
      createdAt: Date.now(),
    };
    const tasks = [...get().tasks, task];
    set({ tasks });
    await save(tasks);
  },

  toggleTask: async (id) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    set({ tasks });
    await save(tasks);
  },

  deleteTask: async (id) => {
    const tasks = get().tasks.filter((t) => t.id !== id);
    const activeTaskId = get().activeTaskId === id ? null : get().activeTaskId;
    set({ tasks, activeTaskId });
    await save(tasks);
    if (!activeTaskId) await AsyncStorage.removeItem(ACTIVE_TASK_STORAGE_KEY);
  },

  addSession: async (id) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, sessions: t.sessions + 1 } : t,
    );
    set({ tasks });
    await save(tasks);
  },

  setActiveTask: async (id) => {
    set({ activeTaskId: id });
    if (id) {
      await AsyncStorage.setItem(ACTIVE_TASK_STORAGE_KEY, id);
    } else {
      await AsyncStorage.removeItem(ACTIVE_TASK_STORAGE_KEY);
    }
  },

  // ─── Pindah task ke atas (hanya di antara task pending) ───────────────
  moveUp: async (id) => {
    const all = get().tasks;
    const pending = all.filter((t) => !t.completed);
    const done = all.filter((t) => t.completed);
    const idx = pending.findIndex((t) => t.id === id);
    if (idx <= 0) return;
    const reordered = [...pending];
    [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
    const tasks = [...reordered, ...done];
    set({ tasks });
    await save(tasks);
  },

  // ─── Pindah task ke bawah (hanya di antara task pending) ──────────────
  moveDown: async (id) => {
    const all = get().tasks;
    const pending = all.filter((t) => !t.completed);
    const done = all.filter((t) => t.completed);
    const idx = pending.findIndex((t) => t.id === id);
    if (idx < 0 || idx >= pending.length - 1) return;
    const reordered = [...pending];
    [reordered[idx], reordered[idx + 1]] = [reordered[idx + 1], reordered[idx]];
    const tasks = [...reordered, ...done];
    set({ tasks });
    await save(tasks);
  },
}));
