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
  setActiveTask: (id: string | null) => void;
  moveUp: (id: string) => Promise<void>;
  moveDown: (id: string) => Promise<void>;
}

const STORAGE_KEY = "focus_todo_tasks";

const save = async (tasks: Task[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const useTaskStore = create<TaskStore>()((set, get) => ({
  tasks: [],
  activeTaskId: null,

  loadTasks: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) set({ tasks: JSON.parse(raw) });
  },

  addTask: async (title) => {
    const task: Task = {
      id: Date.now().toString(),
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
    set({ tasks });
    await save(tasks);
  },

  addSession: async (id) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, sessions: t.sessions + 1 } : t,
    );
    set({ tasks });
    await save(tasks);
  },

  setActiveTask: (id) => set({ activeTaskId: id }),

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
