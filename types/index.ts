export type TaskCategory = "work" | "study" | "personal" | "none";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  sessions: number;
  createdAt: number;
  category: TaskCategory;
  deadline?: number;
  deadlineReminderId?: string;
}

export type TimerMode = "focus" | "short_break" | "long_break";

export interface TimerState {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  sessionCount: number;
}

export interface FocusSession {
  id: string;
  date: string;
  durationSeconds: number;
  taskId: string | null;
  createdAt: number;
}
