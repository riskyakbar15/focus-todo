import { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from "react-native";
import { AppText as Text } from "../../components/AppText";
import { useRouter } from "expo-router";
import { useTaskStore } from "../../store/taskStore";
import { useTheme } from "../../hooks/useTheme";
import { useNotification } from "../../hooks/useNotification";
import { TASK_FILTERS, getNextCategory } from "../../constants/task";
import { Task, TaskCategory } from "../../types";
import TaskItem from "../../components/TaskItem";
import TaskInput from "../../components/TaskInput";

type CategoryFilter = TaskCategory | "all";

function getNextDeadline(deadline?: number) {
  if (!deadline) {
    return Date.now() + 7 * 24 * 60 * 60 * 1000;
  }

  return undefined;
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { scheduleDeadlineReminder, cancelNotification } = useNotification();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const {
    tasks,
    activeTaskId,
    loadTasks,
    addTask,
    toggleTask,
    deleteTask,
    setActiveTask,
    updateCategory,
    setDeadline,
    moveUp,
    moveDown,
  } = useTaskStore();

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleStartTimer = (id: string) => {
    setActiveTask(id);
    router.push("/timer");
  };

  const handleCycleCategory = (task: Task) => {
    updateCategory(task.id, getNextCategory(task.category));
  };

  const handleCycleDeadline = async (task: Task) => {
    if (task.deadlineReminderId) {
      await cancelNotification(task.deadlineReminderId);
    }

    const nextDeadline = getNextDeadline(task.deadline);
    const reminderId = nextDeadline
      ? await scheduleDeadlineReminder(task.title, nextDeadline)
      : undefined;

    await setDeadline(task.id, nextDeadline, reminderId ?? undefined);
  };

  const handleDeleteTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task?.deadlineReminderId) {
      await cancelNotification(task.deadlineReminderId);
    }
    await deleteTask(id);
  };

  const visibleTasks =
    categoryFilter === "all"
      ? tasks
      : tasks.filter((task) => task.category === categoryFilter);
  const pending = visibleTasks.filter((t) => !t.completed);
  const completed = visibleTasks.filter((t) => t.completed);
  const allTasks = [...pending, ...completed];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.text }]}>
            Focus Todo
          </Text>
          <Text style={[styles.subheading, { color: colors.textMuted }]}>
            {pending.length > 0
              ? `${pending.length} task tersisa`
              : completed.length > 0
                ? "Semua task selesai! 🎉"
                : "Belum ada task"}
          </Text>
        </View>

        <TaskInput onAdd={addTask} />

        <View style={styles.filterRow}>
          {TASK_FILTERS.map((filter) => {
            const isSelected = categoryFilter === filter.value;
            return (
              <Pressable
                key={filter.value}
                onPress={() => setCategoryFilter(filter.value)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.backgroundSoft,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Filter ${filter.label}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isSelected
                        ? colors.onPrimary
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={allTasks}
          keyExtractor={(t) => t.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🍅</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Belum ada task.
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                Tambah task di atas untuk mulai fokus!
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const pendingIndex = pending.findIndex((t) => t.id === item.id);
            const isPending = !item.completed;
            return (
              <TaskItem
                task={item}
                isActive={item.id === activeTaskId}
                isFirst={isPending && pendingIndex === 0}
                isLast={isPending && pendingIndex === pending.length - 1}
                onToggle={toggleTask}
                onDelete={handleDeleteTask}
                onStartTimer={handleStartTimer}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                onCycleCategory={handleCycleCategory}
                onCycleDeadline={handleCycleDeadline}
              />
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 13,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 96,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 80,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: "center",
  },
});
