import { TaskCategory } from "../types";

export const TASK_CATEGORIES: Array<{
  value: TaskCategory;
  label: string;
  shortLabel: string;
}> = [
  { value: "none", label: "Tanpa kategori", shortLabel: "Tanpa" },
  { value: "work", label: "Kerja", shortLabel: "Kerja" },
  { value: "study", label: "Belajar", shortLabel: "Belajar" },
  { value: "personal", label: "Pribadi", shortLabel: "Pribadi" },
];

export const TASK_FILTERS: Array<{
  value: TaskCategory | "all";
  label: string;
}> = [
  { value: "all", label: "Semua" },
  { value: "work", label: "Kerja" },
  { value: "study", label: "Belajar" },
  { value: "personal", label: "Pribadi" },
  { value: "none", label: "Tanpa" },
];

export function getCategoryLabel(category: TaskCategory) {
  return (
    TASK_CATEGORIES.find((item) => item.value === category)?.shortLabel ??
    "Tanpa"
  );
}

export function getNextCategory(category: TaskCategory): TaskCategory {
  const index = TASK_CATEGORIES.findIndex((item) => item.value === category);
  const nextIndex = index < 0 ? 0 : (index + 1) % TASK_CATEGORIES.length;
  return TASK_CATEGORIES[nextIndex].value;
}
