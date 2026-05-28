import { useCallback, useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useNotification } from "../../hooks/useNotification";
import { useTheme } from "../../hooks/useTheme";

function getPermissionLabel(
  permissions: Notifications.NotificationPermissionsStatus | null,
) {
  if (!permissions) return "Belum dicek";
  if (permissions.granted) return "Aktif";
  if (permissions.canAskAgain) return "Belum aktif";
  return "Ditolak";
}

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { requestNotificationPermission } = useNotification();
  const [permissions, setPermissions] =
    useState<Notifications.NotificationPermissionsStatus | null>(null);

  const refreshPermissions = useCallback(async () => {
    setPermissions(await Notifications.getPermissionsAsync());
  }, []);

  const handleRequestPermission = async () => {
    await requestNotificationPermission();
    await refreshPermissions();
  };

  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
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
            <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
              Aktifkan notifikasi
            </Text>
          </Pressable>
        </View>

        <View style={[styles.panel, { backgroundColor: colors.backgroundSoft }]}>
          <Text style={[styles.panelTitle, { color: colors.text }]}>
            Focus Todo
          </Text>
          <Text style={[styles.panelCopy, { color: colors.textSecondary }]}>
            Versi {Constants.expoConfig?.version ?? "1.0.0"} · Expo SDK 54
          </Text>
        </View>
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
