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
}

const STORAGE_KEY = "focus_todo_tasks";

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
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  toggleTask: async (id) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    set({ tasks });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  deleteTask: async (id) => {
    const tasks = get().tasks.filter((t) => t.id !== id);
    set({ tasks });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  addSession: async (id) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, sessions: t.sessions + 1 } : t,
    );
    set({ tasks });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  setActiveTask: (id) => set({ activeTaskId: id }),
}));
