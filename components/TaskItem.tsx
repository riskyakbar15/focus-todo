import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Task } from "../types";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onStartTimer: (id: string) => void;
  isActive?: boolean;
}

export default function TaskItem({
  task,
  onToggle,
  onDelete,
  onStartTimer,
  isActive = false,
}: TaskItemProps) {
  return (
    <View style={[styles.container, isActive && styles.activeContainer]}>
      {/* Checkbox + judul */}
      <TouchableOpacity
        style={styles.left}
        onPress={() => onToggle(task.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, task.completed && styles.checkboxDone]}>
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.textGroup}>
          <Text
            style={[styles.title, task.completed && styles.titleDone]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {task.sessions > 0 && (
            <Text style={styles.sessions}>🍅 {task.sessions} sesi selesai</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Tombol aksi */}
      <View style={styles.actions}>
        {!task.completed && (
          <TouchableOpacity
            style={[styles.timerBtn, isActive && styles.timerBtnActive]}
            onPress={() => onStartTimer(task.id)}
          >
            <Text
              style={[
                styles.timerBtnText,
                isActive && styles.timerBtnTextActive,
              ]}
            >
              {isActive ? "▶ Aktif" : "▶"}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(task.id)}
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
    gap: 8,
  },
  activeContainer: {
    backgroundColor: "#F5F3FF",
    borderRadius: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkboxDone: {
    backgroundColor: "#534AB7",
    borderColor: "#534AB7",
  },
  checkmark: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    color: "#1a1a1a",
    lineHeight: 20,
  },
  titleDone: {
    color: "#bbb",
    textDecorationLine: "line-through",
  },
  sessions: {
    fontSize: 11,
    color: "#888",
    marginTop: 3,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#EEEDFE",
  },
  timerBtnActive: {
    backgroundColor: "#534AB7",
  },
  timerBtnText: {
    fontSize: 12,
    color: "#534AB7",
    fontWeight: "500",
  },
  timerBtnTextActive: {
    color: "#fff",
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    fontSize: 11,
    color: "#EF4444",
  },
});
