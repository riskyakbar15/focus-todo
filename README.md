# Focus Todo

Focus Todo adalah aplikasi task manager sederhana berbasis teknik Pomodoro. Aplikasi ini membantu pengguna mencatat task, memilih task aktif, menjalankan sesi fokus, menghitung sesi yang selesai, dan menerima notifikasi timer di perangkat mobile.

## Fitur Utama

- Manajemen task dengan status selesai/belum selesai.
- Task aktif untuk sesi fokus.
- Timer Pomodoro dengan mode:
  - Fokus
  - Istirahat singkat
  - Istirahat panjang
- Hitungan sesi selesai per task.
- Reorder task pending ke atas atau bawah.
- Penyimpanan lokal menggunakan AsyncStorage.
- State timer persisten saat aplikasi dibuka ulang.
- Notifikasi selesai sesi dengan Expo Notifications.
- Dark mode otomatis mengikuti theme perangkat.
- Dukungan aksesibilitas untuk kontrol task dan timer.

## Tech Stack

- Expo SDK 54
- React 19
- React Native 0.81
- Expo Router
- TypeScript
- Zustand
- AsyncStorage
- Expo Notifications
- React Native SVG

## Struktur Folder

```text
focus-todo/
├── app/
│   ├── _layout.tsx       # Root layout Expo Router
│   ├── index.tsx         # Halaman daftar task
│   └── timer.tsx         # Halaman timer Pomodoro
├── assets/               # Icon, splash, favicon
├── components/           # Komponen UI reusable
├── constants/            # Konstanta timer
├── hooks/                # Hook tema, Pomodoro, dan notifikasi
├── store/                # Zustand store untuk task
├── types/                # TypeScript types
├── app.json              # Konfigurasi Expo
├── package.json          # Dependency dan script
└── tsconfig.json         # Konfigurasi TypeScript
```

## Prasyarat

Pastikan sudah terpasang:

- Node.js versi yang kompatibel dengan Expo SDK 54.
- npm.
- Expo tooling melalui `npx expo`.
- Expo Go atau development build untuk pengujian di perangkat.

## Instalasi

```bash
npm install
```

## Menjalankan Aplikasi

```bash
npm run start
```

Jalankan target tertentu:

```bash
npm run android
npm run ios
npm run web
```

## Script

```bash
npm run start
```

Menjalankan Expo development server.

```bash
npm run android
```

Menjalankan aplikasi pada Android.

```bash
npm run ios
```

Menjalankan aplikasi pada iOS.

```bash
npm run web
```

Menjalankan aplikasi pada browser.

```bash
npm run typecheck
```

Menjalankan TypeScript type checking.

```bash
npm run check
```

Menjalankan quality check utama proyek.

## Catatan Notifikasi

Notifikasi menggunakan `expo-notifications` dan channel Android `focus-todo-timer`. Untuk hasil paling akurat, uji notifikasi pada perangkat asli atau development build, terutama Android 13+ yang membutuhkan izin notifikasi runtime.

## Penyimpanan Data

Data task, task aktif, dan state timer disimpan secara lokal menggunakan AsyncStorage. Timer akan mencoba memulihkan mode, sisa waktu, status running, dan jumlah sesi saat aplikasi dibuka kembali.

## Roadmap

- Menambahkan test untuk Pomodoro hook dan task store.
- Menambahkan edit task dan konfirmasi delete.
- Menambahkan pengaturan durasi timer.
- Menambahkan statistik fokus harian/mingguan.
- Meningkatkan validasi dan recovery data lokal.

---

Made With ❤️ By [riskyakbar15](https://github.com/riskyakbar15) For Education.
