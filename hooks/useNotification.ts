import { useCallback, useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { TimerMode } from "../types";

const TIMER_CHANNEL_ID = "focus-todo-timer";

// ─── Konfigurasi tampilan notifikasi saat app di foreground ───────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // banner di atas layar (versi baru)
    shouldShowList: true, // tampil di notification center (versi baru)
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Pesan notifikasi per mode ─────────────────────────────────────────────
const NOTIF_CONTENT: Record<TimerMode, { title: string; body: string }> = {
  focus: {
    title: "🍅 Sesi Fokus Selesai!",
    body: "Kerja bagus! Saatnya istirahat sebentar.",
  },
  short_break: {
    title: "☕ Istirahat Selesai!",
    body: "Yuk, fokus lagi untuk sesi berikutnya!",
  },
  long_break: {
    title: "🎉 Istirahat Panjang Selesai!",
    body: "Kamu sudah istirahat cukup. Siap fokus lagi?",
  },
};

async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(TIMER_CHANNEL_ID, {
    name: "Focus timer",
    description: "Notifikasi untuk sesi fokus dan istirahat.",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#534AB7",
    sound: "default",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

function hasNotificationPermission(
  permissions: Notifications.NotificationPermissionsStatus,
) {
  return (
    permissions.granted ||
    permissions.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
    permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL ||
    permissions.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL
  );
}

// ─── Hook utama ────────────────────────────────────────────────────────────
export function useNotification() {
  // Android 13 baru menampilkan prompt izin setelah channel dibuat.
  useEffect(() => {
    ensureAndroidNotificationChannel();
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    await ensureAndroidNotificationChannel();

    const currentPermissions = await Notifications.getPermissionsAsync();
    if (hasNotificationPermission(currentPermissions)) return true;

    const requestedPermissions = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });

    return hasNotificationPermission(requestedPermissions);
  }, []);

  // Kirim notifikasi langsung (saat sesi selesai)
  const sendSessionNotification = useCallback(async (completedMode: TimerMode) => {
    const canNotify = await requestNotificationPermission();
    if (!canNotify) return false;

    const content = NOTIF_CONTENT[completedMode];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        sound: true,
        data: { screen: "timer", mode: completedMode },
      },
      trigger:
        Platform.OS === "android" ? { channelId: TIMER_CHANNEL_ID } : null,
    });
    return true;
  }, [requestNotificationPermission]);

  // Jadwalkan notifikasi pengingat (opsional — misalnya reminder mulai sesi)
  const scheduleReminder = useCallback(
    async (secondsFromNow: number, message: string) => {
      const canNotify = await requestNotificationPermission();
      if (!canNotify) return null;

      return Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Focus Todo",
          body: message,
          sound: true,
          data: { screen: "timer", reminder: true },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsFromNow,
          channelId: TIMER_CHANNEL_ID,
        },
      });
    },
    [requestNotificationPermission],
  );

  const scheduleSessionEndNotification = useCallback(
    async (secondsFromNow: number, mode: TimerMode) => {
      const canNotify = await requestNotificationPermission();
      if (!canNotify) return null;

      const content = NOTIF_CONTENT[mode];
      return Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          sound: true,
          data: { screen: "timer", mode },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsFromNow,
          channelId: TIMER_CHANNEL_ID,
        },
      });
    },
    [requestNotificationPermission],
  );

  const scheduleDeadlineReminder = useCallback(
    async (taskTitle: string, deadline: number) => {
      const remindAt = deadline - 24 * 60 * 60 * 1000;
      if (remindAt <= Date.now()) return null;

      const canNotify = await requestNotificationPermission();
      if (!canNotify) return null;

      return Notifications.scheduleNotificationAsync({
        content: {
          title: "⏳ Deadline besok",
          body: `${taskTitle} jatuh tempo besok.`,
          sound: true,
          data: { screen: "tasks", deadline },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(remindAt),
          channelId: TIMER_CHANNEL_ID,
        },
      });
    },
    [requestNotificationPermission],
  );

  // Batalkan satu notifikasi terjadwal berdasarkan identifier.
  const cancelNotification = useCallback(async (identifier: string | null) => {
    if (!identifier) return;
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }, []);

  // Batalkan semua notifikasi terjadwal (saat timer di-reset)
  const cancelAllNotifications = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  return {
    requestNotificationPermission,
    sendSessionNotification,
    scheduleReminder,
    scheduleSessionEndNotification,
    scheduleDeadlineReminder,
    cancelNotification,
    cancelAllNotifications,
  };
}
