import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useTaskStore } from "../store/taskStore";

export default function HomeScreen() {
  const router = useRouter();
  const { tasks, loadTasks, addTask, toggleTask, deleteTask, setActiveTask } =
    useTaskStore();
  const [input, setInput] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAdd = () => {
    if (input.trim()) {
      addTask(input.trim());
      setInput("");
    }
  };

  const handleStartTimer = (id: string) => {
    setActiveTask(id);
    router.push("/timer");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Focus Todo</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Tambah task baru..."
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <TouchableOpacity onPress={() => toggleTask(item.id)}>
              <Text style={item.completed ? styles.done : styles.taskTitle}>
                {item.title}
              </Text>
              <Text style={styles.sessions}>{item.sessions} sesi</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleStartTimer(item.id)}>
              <Text style={styles.timerBtn}>▶ Fokus</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: "#fff" },
  heading: { fontSize: 26, fontWeight: "500", marginBottom: 20 },
  inputRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#534AB7",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: "#fff", fontSize: 22 },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  taskTitle: { fontSize: 15, color: "#1a1a1a" },
  done: { fontSize: 15, color: "#aaa", textDecorationLine: "line-through" },
  sessions: { fontSize: 11, color: "#888", marginTop: 2 },
  timerBtn: { fontSize: 13, color: "#534AB7", fontWeight: "500" },
});
