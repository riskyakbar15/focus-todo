export const TIMER_DURATIONS = {
  focus: 25 * 60, // 25 menit
  short_break: 5 * 60, //  5 menit
  long_break: 15 * 60, // 15 menit
} as const;

// Setiap 4 sesi fokus → long break
export const SESSIONS_BEFORE_LONG_BREAK = 4;

export const TIMER_LABELS = {
  focus: "Fokus",
  short_break: "Istirahat Singkat",
  long_break: "Istirahat Panjang",
};
