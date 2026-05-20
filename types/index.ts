export interface Task {
  id: string;
  title: string;
  completed: boolean;
  sessions: number;
  createdAt: number;
}

export type TimerMode = "focus" | "short_break" | "long_break";

export interface TimerState {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  sessionCount: number;
}
