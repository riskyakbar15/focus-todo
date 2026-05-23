import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { TimerMode } from "../types";

// ─── Konfigurasi tampilan notifikasi saat app di foreground ───────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // fallback untuk versi lama
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

// ─── Hook utama ────────────────────────────────────────────────────────────
export function useNotification() {
  // Minta izin notifikasi saat pertama kali hook dipanggil
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("Izin notifikasi tidak diberikan.");
      }
    })();
  }, []);

  // Kirim notifikasi langsung (saat sesi selesai)
  const sendSessionNotification = async (completedMode: TimerMode) => {
    const content = NOTIF_CONTENT[completedMode];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        sound: true,
      },
      trigger: null, // null = langsung tampil sekarang
    });
  };

  // Jadwalkan notifikasi pengingat (opsional — misalnya reminder mulai sesi)
  const scheduleReminder = async (secondsFromNow: number, message: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Focus Todo",
        body: message,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsFromNow,
      },
    });
  };

  // Batalkan semua notifikasi terjadwal (saat timer di-reset)
  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  return {
    sendSessionNotification,
    scheduleReminder,
    cancelAllNotifications,
  };
}
