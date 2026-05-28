import { useEffect } from "react";
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useStatsStore, getLocalDateKey } from "../../store/statsStore";
import { useTheme } from "../../hooks/useTheme";

const DAY_MS = 24 * 60 * 60 * 1000;

function formatMinutes(seconds: number) {
  return Math.round(seconds / 60);
}

function getLastSevenDays() {
  const today = new Date();
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today.getTime() - (6 - index) * DAY_MS);
    return {
      key: getLocalDateKey(date),
      label: new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(date),
    };
  });
}

function calculateStreak(datesWithSessions: Set<string>) {
  let streak = 0;
  const cursor = new Date();

  while (datesWithSessions.has(getLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default function StatsScreen() {
  const { colors, isDark } = useTheme();
  const { sessions, loadSessions } = useStatsStore();
  const todayKey = getLocalDateKey();
  const todaySessions = sessions.filter((session) => session.date === todayKey);
  const todayFocusSeconds = todaySessions.reduce(
    (total, session) => total + session.durationSeconds,
    0,
  );
  const lastSevenDays = getLastSevenDays();
  const sessionsByDate = new Map<string, number>();
  sessions.forEach((session) => {
    sessionsByDate.set(session.date, (sessionsByDate.get(session.date) ?? 0) + 1);
  });
  const datesWithSessions = new Set(sessions.map((session) => session.date));
  const streak = calculateStreak(datesWithSessions);
  const chartWidth = Dimensions.get("window").width - 48;

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.text }]}>
            Statistik
          </Text>
          <Text style={[styles.subheading, { color: colors.textMuted }]}>
            Ringkasan fokus dan konsistensi harian.
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {todaySessions.length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              sesi hari ini
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {formatMinutes(todayFocusSeconds)}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              menit fokus
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {streak}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              hari streak
            </Text>
          </View>
        </View>

        <View style={[styles.chartPanel, { backgroundColor: colors.backgroundSoft }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7 hari terakhir
          </Text>
          <BarChart
            data={{
              labels: lastSevenDays.map((day) => day.label),
              datasets: [
                {
                  data: lastSevenDays.map(
                    (day) => sessionsByDate.get(day.key) ?? 0,
                  ),
                },
              ],
            }}
            width={chartWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero
            showValuesOnTopOfBars
            chartConfig={{
              backgroundGradientFrom: colors.backgroundSoft,
              backgroundGradientTo: colors.backgroundSoft,
              decimalPlaces: 0,
              color: () => colors.primary,
              labelColor: () => colors.textSecondary,
              propsForBackgroundLines: {
                stroke: colors.borderSoft,
              },
              barPercentage: 0.62,
            }}
            style={styles.chart}
            withInnerLines
          />
          <Text style={[styles.chartNote, { color: colors.textMuted }]}>
            {isDark ? "Mode gelap aktif" : "Mode terang aktif"} · data tersimpan lokal
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 22,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
  },
  subheading: {
    fontSize: 13,
    marginTop: 5,
    lineHeight: 19,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 10,
    padding: 14,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
  },
  chartPanel: {
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chart: {
    borderRadius: 10,
  },
  chartNote: {
    fontSize: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
});
