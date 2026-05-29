import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { usePomodoro } from "../hooks/usePomodoro";
import { useTaskStore } from "../store/taskStore";
import { useStatsStore } from "../store/statsStore";
import { TIMER_DURATIONS, TIMER_LABELS } from "../constants/timer";
import { loadTimerDurations, TimerDurations } from "../hooks/useTimerSettings";
import TimerCircle, { SIZE } from "../components/TimerCircle";
import { useNotification } from "../hooks/useNotification";
import { useTheme } from "../hooks/useTheme";

// ─── Format detik → MM:SS ──────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Layar utama Timer ─────────────────────────────────────────────────────
export default function TimerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { activeTaskId, tasks, addSession } = useTaskStore();
  const { addFocusSession } = useStatsStore();
  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const scheduledNotificationRef = useRef<string | null>(null);
  const isRunningRef = useRef(false);
  const {
    scheduleSessionEndNotification,
    cancelNotification,
    cancelAllNotifications,
  } = useNotification();

  const {
    mode,
    secondsLeft,
    isRunning,
    sessionCount,
    toggle,
    reset,
    switchMode,
  } = usePomodoro(async (completedMode) => {
    scheduledNotificationRef.current = null;
    // Tambah session count ke task aktif jika mode fokus
    if (completedMode === "focus" && activeTaskId) {
      addSession(activeTaskId);
      addFocusSession({
        durationSeconds: configuredDurations?.focus ?? TIMER_DURATIONS.focus,
        taskId: activeTaskId,
      });
    }
  });

  const [configuredDurations, setConfiguredDurations] =
    useState<TimerDurations | null>(null);

  useEffect(() => {
    (async () => {
      setConfiguredDurations(await loadTimerDurations());
    })();
  }, []);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  // Batalkan notifikasi terjadwal saat keluar layar
  useEffect(() => {
    return () => {
      if (!isRunningRef.current) {
        cancelAllNotifications();
      }
    };
  }, [cancelAllNotifications]);

  const cancelCurrentScheduledNotification = async () => {
    if (scheduledNotificationRef.current) {
      await cancelNotification(scheduledNotificationRef.current);
    } else {
      await cancelAllNotifications();
    }
    scheduledNotificationRef.current = null;
  };

  const handleToggle = async () => {
    if (isRunning) {
      await cancelCurrentScheduledNotification();
      toggle();
      return;
    }

    scheduledNotificationRef.current = await scheduleSessionEndNotification(
      secondsLeft,
      mode,
    );
    toggle();
  };

  const handleReset = async () => {
    await cancelCurrentScheduledNotification();
    reset();
  };

  const handleSwitchMode = async (newMode: typeof mode) => {
    await cancelCurrentScheduledNotification();
    switchMode(newMode);
  };

  // Total detik sesuai mode saat ini
  const totalSeconds = configuredDurations
    ? configuredDurations[mode]
    : TIMER_DURATIONS[mode];

  const modeTheme = colors.timerModes[mode];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back to tasks"
          >
            <Text style={[styles.backText, { color: colors.primary }]}>
              ← Kembali
            </Text>
          </TouchableOpacity>
          <Text style={[styles.sessionCount, { color: colors.textSecondary }]}>
            Sesi #{sessionCount + 1}
          </Text>
        </View>

        {/* Task aktif */}
        {activeTask && (
          <View
            style={[
              styles.taskBadge,
              { backgroundColor: modeTheme.background },
            ]}
          >
            <Text
              style={[styles.taskBadgeText, { color: modeTheme.foreground }]}
              numberOfLines={1}
            >
              {activeTask.title}
            </Text>
          </View>
        )}

        {/* Mode selector */}
        <View
          style={[styles.modeRow, { backgroundColor: colors.backgroundSoft }]}
        >
          {(["focus", "short_break", "long_break"] as const).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => handleSwitchMode(m)}
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${
                m === "focus"
                  ? "focus"
                  : m === "short_break"
                    ? "short break"
                    : "long break"
              } mode`}
              accessibilityState={{ selected: mode === m }}
              style={[
                styles.modeBtn,
                mode === m && {
                  backgroundColor: colors.timerModes[m].foreground,
                },
              ]}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  { color: colors.textSecondary },
                  mode === m && { color: colors.onPrimary },
                ]}
              >
                {m === "focus"
                  ? "Fokus"
                  : m === "short_break"
                    ? "Istirahat"
                    : "Istirahat Panjang"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lingkaran timer */}
        <View style={styles.circleWrapper}>
          <TimerCircle
            secondsLeft={secondsLeft}
            totalSeconds={totalSeconds}
            mode={mode}
            colors={colors}
          />
          {/* Teks di tengah lingkaran */}
          <View style={styles.circleCenter}>
            <Text style={[styles.timeText, { color: modeTheme.foreground }]}>
              {formatTime(secondsLeft)}
            </Text>
            <Text style={[styles.modeLabel, { color: colors.textSecondary }]}>
              {TIMER_LABELS[mode]}
            </Text>
          </View>
        </View>

        {/* Tombol kontrol */}
        <View style={styles.controls}>
          {/* Reset */}
          <TouchableOpacity
            onPress={handleReset}
            style={[
              styles.secondaryBtn,
              { backgroundColor: colors.backgroundSoft },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Reset timer"
          >
            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
              ↺
            </Text>
          </TouchableOpacity>

          {/* Start / Pause */}
          <TouchableOpacity
            onPress={handleToggle}
            style={[
              styles.primaryBtn,
              { backgroundColor: modeTheme.foreground },
            ]}
            accessibilityRole="button"
            accessibilityLabel={isRunning ? "Pause timer" : "Start timer"}
            accessibilityState={{ selected: isRunning }}
          >
            <Text style={[styles.primaryBtnText, { color: colors.onPrimary }]}>
              {isRunning ? "⏸ Pause" : "▶ Mulai"}
            </Text>
          </TouchableOpacity>

          {/* Skip */}
          <TouchableOpacity
            onPress={() =>
              handleSwitchMode(
                mode === "focus"
                  ? (sessionCount + 1) % 4 === 0
                    ? "long_break"
                    : "short_break"
                  : "focus",
              )
            }
            style={[
              styles.secondaryBtn,
              { backgroundColor: colors.backgroundSoft },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Skip to next timer mode"
          >
            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
              ⏭
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info sesi task */}
        {activeTask && (
          <Text style={[styles.sessionInfo, { color: colors.textMuted }]}>
            {activeTask.title} · {activeTask.sessions} sesi selesai
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  backBtn: {
    padding: 8,
  },
  backText: {
    fontSize: 14,
  },
  sessionCount: {
    fontSize: 13,
  },

  // Task badge
  taskBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
    maxWidth: "90%",
  },
  taskBadgeText: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Mode selector
  modeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
    borderRadius: 12,
    padding: 4,
  },
  modeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Lingkaran
  circleWrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  circleCenter: {
    position: "absolute",
    alignItems: "center",
  },
  timeText: {
    fontSize: 52,
    fontWeight: "300",
    letterSpacing: 2,
  },
  modeLabel: {
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 1,
  },

  // Kontrol
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
  },
  primaryBtn: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 50,
    minWidth: 140,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "500",
  },
  secondaryBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 20,
  },

  // Info sesi
  sessionInfo: {
    fontSize: 12,
    textAlign: "center",
  },
});
