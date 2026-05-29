import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useNotification } from "../../hooks/useNotification";
import { useTheme } from "../../hooks/useTheme";
import {
  loadTimerDurations,
  saveTimerDurations,
  resetTimerDurations,
} from "../../hooks/useTimerSettings";
import { TIMER_DURATIONS } from "../../constants/timer";

function getPermissionLabel(
  permissions: Notifications.NotificationPermissionsStatus | null,
) {
  if (!permissions) return "Belum dicek";
  if (permissions.granted) return "Aktif";
  if (permissions.canAskAgain) return "Belum aktif";
  return "Ditolak";
}

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useTheme();
  const { requestNotificationPermission } = useNotification();
  const [permissions, setPermissions] =
    useState<Notifications.NotificationPermissionsStatus | null>(null);

  const [minutes, setMinutes] = useState({
    focus: String(TIMER_DURATIONS.focus / 60),
    short_break: String(TIMER_DURATIONS.short_break / 60),
    long_break: String(TIMER_DURATIONS.long_break / 60),
  });

  const refreshPermissions = useCallback(async () => {
    setPermissions(await Notifications.getPermissionsAsync());
  }, []);

  const handleRequestPermission = async () => {
    await requestNotificationPermission();
    await refreshPermissions();
  };

  useEffect(() => {
    refreshPermissions();
    (async () => {
      const d = await loadTimerDurations();
      setMinutes({
        focus: String(Math.round(d.focus / 60)),
        short_break: String(Math.round(d.short_break / 60)),
        long_break: String(Math.round(d.long_break / 60)),
      });
    })();
  }, [refreshPermissions]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.text }]}>
            Pengaturan
          </Text>
          <Text style={[styles.subheading, { color: colors.textMuted }]}>
            Kontrol dasar untuk notifikasi dan informasi aplikasi.
          </Text>
        </View>

        <View style={[styles.panel, { backgroundColor: colors.surface }]}>
          <Text style={[styles.panelTitle, { color: colors.text }]}>
            Durasi Timer
          </Text>

          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>
              Fokus (menit)
            </Text>
            <TextInput
              value={minutes.focus}
              onChangeText={(v) =>
                setMinutes((s) => ({ ...s, focus: v.replace(/[^0-9]/g, "") }))
              }
              keyboardType="numeric"
              style={[styles.input, { color: colors.text }]}
              placeholder="25"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>
              Istirahat singkat (menit)
            </Text>
            <TextInput
              value={minutes.short_break}
              onChangeText={(v) =>
                setMinutes((s) => ({
                  ...s,
                  short_break: v.replace(/[^0-9]/g, ""),
                }))
              }
              keyboardType="numeric"
              style={[styles.input, { color: colors.text }]}
              placeholder="5"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>
              Istirahat panjang (menit)
            </Text>
            <TextInput
              value={minutes.long_break}
              onChangeText={(v) =>
                setMinutes((s) => ({
                  ...s,
                  long_break: v.replace(/[^0-9]/g, ""),
                }))
              }
              keyboardType="numeric"
              style={[styles.input, { color: colors.text }]}
              placeholder="15"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={async () => {
                const f = Math.max(1, Number(minutes.focus) || 25) * 60;
                const s = Math.max(1, Number(minutes.short_break) || 5) * 60;
                const l = Math.max(1, Number(minutes.long_break) || 15) * 60;
                await saveTimerDurations({
                  focus: f,
                  short_break: s,
                  long_break: l,
                });
                Alert.alert("Tersimpan", "Durasi timer berhasil disimpan.");
              }}
              style={[
                styles.primaryButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[styles.primaryButtonText, { color: colors.onPrimary }]}
              >
                Simpan
              </Text>
            </Pressable>

            <Pressable
              onPress={async () => {
                await resetTimerDurations();
                const d = await loadTimerDurations();
                setMinutes({
                  focus: String(Math.round(d.focus / 60)),
                  short_break: String(Math.round(d.short_break / 60)),
                  long_break: String(Math.round(d.long_break / 60)),
                });
                Alert.alert("Di-reset", "Durasi dikembalikan ke default.");
              }}
              style={[
                styles.secondaryButton,
                { backgroundColor: colors.backgroundSoft },
              ]}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
                Reset
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.panel, { backgroundColor: colors.surface }]}>
          <Text style={[styles.panelTitle, { color: colors.text }]}>
            Notifikasi
          </Text>
          <Text style={[styles.panelCopy, { color: colors.textSecondary }]}>
            Status: {getPermissionLabel(permissions)}
          </Text>
          <Pressable
            onPress={handleRequestPermission}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Request notification permission"
          >
            <Text
              style={[styles.primaryButtonText, { color: colors.onPrimary }]}
            >
              Aktifkan notifikasi
            </Text>
          </Pressable>
        </View>

        <View style={[styles.panel, { backgroundColor: colors.surface }]}>
          <Text style={[styles.panelTitle, { color: colors.text }]}>Tema</Text>
          <View style={styles.themeRow}>
            <Pressable
              onPress={() => setPreference?.("system")}
              style={[
                styles.themeBtn,
                preference === "system" && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  preference === "system"
                    ? { color: colors.onPrimary }
                    : { color: colors.textSecondary },
                ]}
              >
                Sistem
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPreference?.("light")}
              style={[
                styles.themeBtn,
                preference === "light" && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  preference === "light"
                    ? { color: colors.onPrimary }
                    : { color: colors.textSecondary },
                ]}
              >
                Terang
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPreference?.("dark")}
              style={[
                styles.themeBtn,
                preference === "dark" && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  preference === "dark"
                    ? { color: colors.onPrimary }
                    : { color: colors.textSecondary },
                ]}
              >
                Gelap
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          style={[styles.panel, { backgroundColor: colors.backgroundSoft }]}
        >
          <Text style={[styles.panelTitle, { color: colors.text }]}>
            Focus Todo
          </Text>
          <Text style={[styles.panelCopy, { color: colors.textSecondary }]}>
            Versi {Constants.expoConfig?.version ?? "1.0.0"} · Expo SDK 54
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
    flex: 1,
    padding: 24,
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
  panel: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  panelCopy: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  themeRow: {
    flexDirection: "row",
    gap: 8,
  },
  themeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  input: {
    minWidth: 72,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "transparent",
    textAlign: "right",
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 12,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
