import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { AppText as Text } from "./AppText";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../types";
import { useTheme } from "../hooks/useTheme";
import { getCategoryLabel } from "../constants/task";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onStartTimer: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onCycleCategory?: (task: Task) => void;
  onCycleDeadline?: (task: Task) => void;
  isActive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

function formatDeadline(deadline?: number) {
  if (!deadline) return "Tanpa deadline";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(new Date(deadline));
}

export default function TaskItem({
  task,
  onToggle,
  onDelete,
  onStartTimer,
  onMoveUp,
  onMoveDown,
  onCycleCategory,
  onCycleDeadline,
  isActive = false,
  isFirst = false,
  isLast = false,
}: TaskItemProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { borderColor: colors.borderSoft },
        isActive && {
          backgroundColor: colors.surface,
          borderRadius: 10,
          borderBottomWidth: 0,
          marginBottom: 4,
        },
      ]}
    >
      {/* Tombol urutan atas/bawah */}
      {!task.completed && (
        <View style={styles.orderBtns}>
          <TouchableOpacity
            onPress={() => onMoveUp?.(task.id)}
            disabled={isFirst}
            style={[styles.orderBtn, { opacity: isFirst ? 0.2 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel={`Move ${task.title} up`}
            accessibilityState={{ disabled: isFirst }}
          >
            <Ionicons
              name="chevron-up"
              size={14}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onMoveDown?.(task.id)}
            disabled={isLast}
            style={[styles.orderBtn, { opacity: isLast ? 0.2 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel={`Move ${task.title} down`}
            accessibilityState={{ disabled: isLast }}
          >
            <Ionicons
              name="chevron-down"
              size={14}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Checkbox + judul */}
      <TouchableOpacity
        style={styles.left}
        onPress={() => onToggle(task.id)}
        activeOpacity={0.7}
        accessibilityRole="checkbox"
        accessibilityLabel={task.title}
        accessibilityHint="Marks this task as complete or incomplete."
        accessibilityState={{ checked: task.completed }}
      >
        <View
          style={[
            styles.checkbox,
            { borderColor: colors.border },
            task.completed && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
        >
          {task.completed && (
            <Ionicons name="checkmark" size={14} color="#fff" />
          )}
        </View>
        <View style={styles.textGroup}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
              task.completed && {
                color: colors.textMuted,
                textDecorationLine: "line-through",
              },
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {task.sessions > 0 && (
            <View style={styles.sessionsRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text style={[styles.sessions, { color: colors.textSecondary }]}>
                {task.sessions} sesi selesai
              </Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Text
              style={[
                styles.metaPill,
                {
                  color: colors.primary,
                  backgroundColor: colors.primarySoft,
                },
              ]}
            >
              {getCategoryLabel(task.category)}
            </Text>
            {task.deadline && (
              <Text
                style={[
                  styles.metaPill,
                  {
                    color: colors.danger,
                    backgroundColor: colors.dangerSoft,
                  },
                ]}
              >
                {formatDeadline(task.deadline)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Tombol aksi */}
      <View style={styles.actions}>
        {!task.completed && (
          <TouchableOpacity
            style={[styles.metaBtn, { backgroundColor: colors.backgroundSoft }]}
            onPress={() => onCycleCategory?.(task)}
            accessibilityRole="button"
            accessibilityLabel={`Change category for ${task.title}`}
          >
            <Ionicons
              name="pricetag-outline"
              size={13}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        {!task.completed && (
          <TouchableOpacity
            style={[styles.metaBtn, { backgroundColor: colors.backgroundSoft }]}
            onPress={() => onCycleDeadline?.(task)}
            accessibilityRole="button"
            accessibilityLabel={`Change deadline for ${task.title}`}
          >
            <Ionicons
              name={
                task.deadline ? "calendar-clear-outline" : "calendar-outline"
              }
              size={13}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        {!task.completed && (
          <TouchableOpacity
            style={[
              styles.timerBtn,
              {
                backgroundColor: isActive ? colors.primary : colors.primarySoft,
              },
            ]}
            onPress={() => onStartTimer(task.id)}
            accessibilityRole="button"
            accessibilityLabel={
              isActive
                ? `${task.title} is the active timer task`
                : `Start timer for ${task.title}`
            }
            accessibilityState={{ selected: isActive }}
          >
            <View style={styles.timerBtnContent}>
              <Ionicons
                name={isActive ? "play" : "play-outline"}
                size={13}
                color={isActive ? "#fff" : colors.primary}
              />
              <Text
                style={[
                  styles.timerBtnText,
                  { color: isActive ? "#fff" : colors.primary },
                ]}
              >
                {isActive ? "Aktif" : "Timer"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: colors.dangerSoft }]}
          onPress={() => {
            Alert.alert(
              "Hapus task",
              `Apakah Anda yakin ingin menghapus "${task.title}"?`,
              [
                { text: "Batal", style: "cancel" },
                {
                  text: "Hapus",
                  style: "destructive",
                  onPress: () => onDelete(task.id),
                },
              ],
            );
          }}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${task.title}`}
        >
          <Ionicons name="trash-outline" size={15} color={colors.danger} />
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
    gap: 8,
  },
  orderBtns: {
    gap: 2,
    alignItems: "center",
  },
  orderBtn: {
    padding: 2,
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
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
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
    lineHeight: 20,
  },
  sessions: {
    fontSize: 11,
    marginLeft: 4,
  },
  sessionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  metaPill: {
    borderRadius: 999,
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: "hidden",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  timerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  timerBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timerBtnText: {
    fontSize: 12,
    fontWeight: "500",
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
