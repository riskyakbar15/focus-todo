import { View, StyleSheet } from "react-native";
import { AppText as Text } from "./AppText";

interface SessionBadgeProps {
  count: number; // total sesi selesai hari ini
  currentSession: number; // sesi ke berapa sekarang (1-based)
}

// Maksimal 4 dot ditampilkan (1 siklus pomodoro)
const MAX_DOTS = 4;

export default function SessionBadge({
  count,
  currentSession,
}: SessionBadgeProps) {
  // Posisi dalam siklus saat ini (0-3)
  const posInCycle = count % MAX_DOTS;

  return (
    <View style={styles.container}>
      {/* Dot indikator siklus */}
      <View style={styles.dots}>
        {Array.from({ length: MAX_DOTS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < posInCycle && styles.dotFilled,
              i === posInCycle && styles.dotCurrent,
            ]}
          />
        ))}
      </View>

      {/* Label teks */}
      <Text style={styles.label}>
        Sesi ke-<Text style={styles.bold}>{currentSession}</Text>
        {count > 0 && (
          <Text style={styles.total}> · {count} selesai hari ini</Text>
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0DEF8",
    borderWidth: 1.5,
    borderColor: "#C5C2E8",
  },
  dotFilled: {
    backgroundColor: "#534AB7",
    borderColor: "#534AB7",
  },
  dotCurrent: {
    backgroundColor: "#fff",
    borderColor: "#534AB7",
    borderWidth: 2,
  },
  label: {
    fontSize: 12,
    color: "#aaa",
  },
  bold: {
    color: "#534AB7",
    fontWeight: "600",
  },
  total: {
    color: "#bbb",
  },
});
