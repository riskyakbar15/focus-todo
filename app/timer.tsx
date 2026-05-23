import { useEffect } from "react";
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
import { TIMER_LABELS } from "../constants/timer";
import TimerCircle, { SIZE } from "../components/TimerCircle";
import { useNotification } from "../hooks/useNotification";

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
  const { activeTaskId, tasks, addSession } = useTaskStore();
  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const { sendSessionNotification, cancelAllNotifications } = useNotification();

  const {
    mode,
    secondsLeft,
    isRunning,
    sessionCount,
    toggle,
    reset,
    switchMode,
  } = usePomodoro(async (completedMode) => {
    // Kirim notifikasi saat sesi selesai
    await sendSessionNotification(completedMode);
    // Tambah session count ke task aktif jika mode fokus
    if (completedMode === "focus" && activeTaskId) {
      addSession(activeTaskId);
    }
  });

  // Batalkan notifikasi terjadwal saat keluar layar
  useEffect(() => {
    return () => {
      cancelAllNotifications();
    };
  }, []);

  // Total detik sesuai mode saat ini
  const DURATIONS: Record<string, number> = {
    focus: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
  };
  const totalSeconds = DURATIONS[mode];

  // Warna tema berdasarkan mode
  const modeColor =
    mode === "focus"
      ? "#534AB7"
      : mode === "short_break"
        ? "#1D9E75"
        : "#185FA5";

  const modeBg =
    mode === "focus"
      ? "#EEEDFE"
      : mode === "short_break"
        ? "#E1F5EE"
        : "#E6F1FB";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.sessionCount}>Sesi #{sessionCount + 1}</Text>
        </View>

        {/* Task aktif */}
        {activeTask && (
          <View style={[styles.taskBadge, { backgroundColor: modeBg }]}>
            <Text
              style={[styles.taskBadgeText, { color: modeColor }]}
              numberOfLines={1}
            >
              {activeTask.title}
            </Text>
          </View>
        )}

        {/* Mode selector */}
        <View style={styles.modeRow}>
          {(["focus", "short_break", "long_break"] as const).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => switchMode(m)}
              style={[
                styles.modeBtn,
                mode === m && { backgroundColor: modeColor },
              ]}
            >
              <Text
                style={[styles.modeBtnText, mode === m && { color: "#fff" }]}
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
          />
          {/* Teks di tengah lingkaran */}
          <View style={styles.circleCenter}>
            <Text style={[styles.timeText, { color: modeColor }]}>
              {formatTime(secondsLeft)}
            </Text>
            <Text style={styles.modeLabel}>{TIMER_LABELS[mode]}</Text>
          </View>
        </View>

        {/* Tombol kontrol */}
        <View style={styles.controls}>
          {/* Reset */}
          <TouchableOpacity onPress={reset} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>↺</Text>
          </TouchableOpacity>

          {/* Start / Pause */}
          <TouchableOpacity
            onPress={toggle}
            style={[styles.primaryBtn, { backgroundColor: modeColor }]}
          >
            <Text style={styles.primaryBtnText}>
              {isRunning ? "⏸ Pause" : "▶ Mulai"}
            </Text>
          </TouchableOpacity>

          {/* Skip */}
          <TouchableOpacity
            onPress={() =>
              switchMode(
                mode === "focus"
                  ? (sessionCount + 1) % 4 === 0
                    ? "long_break"
                    : "short_break"
                  : "focus",
              )
            }
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>⏭</Text>
          </TouchableOpacity>
        </View>

        {/* Info sesi task */}
        {activeTask && (
          <Text style={styles.sessionInfo}>
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
    backgroundColor: "#fff",
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
    color: "#534AB7",
  },
  sessionCount: {
    fontSize: 13,
    color: "#888",
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
    backgroundColor: "#F5F5F5",
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
    color: "#888",
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
    color: "#aaa",
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  secondaryBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 20,
  },

  // Info sesi
  sessionInfo: {
    fontSize: 12,
    color: "#bbb",
    textAlign: "center",
  },
});
