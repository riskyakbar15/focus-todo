import { useEffect } from "react";
import { View, Text, FlatList, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useTaskStore } from "../store/taskStore";
import TaskItem from "../components/TaskItem";
import TaskInput from "../components/TaskInput";

export default function HomeScreen() {
  const router = useRouter();
  const {
    tasks,
    activeTaskId,
    loadTasks,
    addTask,
    toggleTask,
    deleteTask,
    setActiveTask,
  } = useTaskStore();

  // Load tasks dari AsyncStorage saat pertama buka
  useEffect(() => {
    loadTasks();
  }, []);

  const handleStartTimer = (id: string) => {
    setActiveTask(id);
    router.push("/timer");
  };

  // Pisah task aktif/belum selesai dan yang sudah selesai
  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Focus Todo</Text>
          <Text style={styles.subheading}>{pending.length} task tersisa</Text>
        </View>

        {/* Input tambah task */}
        <TaskInput onAdd={addTask} />

        {/* Daftar task */}
        <FlatList
          data={[...pending, ...completed]}
          keyExtractor={(t) => t.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🍅</Text>
              <Text style={styles.emptyText}>Belum ada task.</Text>
              <Text style={styles.emptySubtext}>
                Tambah task di atas untuk mulai fokus!
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              isActive={item.id === activeTaskId}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onStartTimer={handleStartTimer}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  // Header
  header: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 4,
  },

  // List
  listContent: {
    paddingBottom: 40,
  },

  // Empty state
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
    color: "#888",
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#bbb",
    textAlign: "center",
  },
});
