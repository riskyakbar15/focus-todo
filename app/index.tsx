import { useEffect } from "react";
import { View, Text, FlatList, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useTaskStore } from "../store/taskStore";
import { useTheme } from "../hooks/useTheme";
import TaskItem from "../components/TaskItem";
import TaskInput from "../components/TaskInput";

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    tasks,
    activeTaskId,
    loadTasks,
    addTask,
    toggleTask,
    deleteTask,
    setActiveTask,
    moveUp,
    moveDown,
  } = useTaskStore();

  useEffect(() => {
    loadTasks();
  }, []);

  const handleStartTimer = (id: string) => {
    setActiveTask(id);
    router.push("/timer");
  };

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);
  const allTasks = [...pending, ...completed];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Header */}
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

        {/* Input */}
        <TaskInput onAdd={addTask} />

        {/* List */}
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
          renderItem={({ item, index }) => {
            const pendingIndex = pending.findIndex((t) => t.id === item.id);
            const isPending = !item.completed;
            return (
              <TaskItem
                task={item}
                isActive={item.id === activeTaskId}
                isFirst={isPending && pendingIndex === 0}
                isLast={isPending && pendingIndex === pending.length - 1}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onStartTimer={handleStartTimer}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
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
  listContent: {
    paddingBottom: 40,
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
