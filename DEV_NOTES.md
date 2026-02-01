# 🛠️ ma-links Developer Notes & Guide

Dokumentasi teknis untuk pengembangan dan pemeliharaan aplikasi **ma-links**.

## 1. Cara Menjalankan Aplikasi (Dari Awal)
Jika kamu baru saja meng-clone project ini, ikuti langkah berikut:

```bash
# 1. Install semua Library yang dibutuhkan
npm install

# 2. Sinkronisasi Database (SQLite)
npx prisma db push

# 3. Generate Database Client (Wajib setiap ada perubahan skema)
npx prisma generate

# 4. Jalankan Server Development
npm run dev
```

## 2. Persyaratan Sistem (Requirements)
- **Node.js**: Versi 18 ke atas (Direkomendasikan v20+).
- **Editor**: VS Code dengan ekstensi Tailwind CSS & Prisma (opsional tapi disarankan).
- **Database**: SQLite (Sudah include, tidak perlu install server DB terpisah).

## 3. Konfigurasi Environment (.env)
File `.env` sangat penting dan **TIDAK** boleh hilang. 
> **Catatan**: Salinan cadangan file ini sudah saya simpan di: `backups/config/.env.example`

**Isi file .env:**
```env
DATABASE_URL="file:./dev.db" # Lokasi penyimpanan database
JWT_SECRET="isi-dengan-kunci-rahasia-bebas" # Untuk keamanan login
```

## 4. Cara Update Fungsi / Aplikasi
Jika kamu ingin menambah fitur atau mengubah kode:
1. **Frontend**: Ubah file di `src/app/` atau `src/components/`.
2. **API**: Ubah file di `src/app/api/`.
3. **Database**: Jika menambah kolom baru di database, ubah file `prisma/schema.prisma`, lalu jalankan:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
   *(Pastikan server `npm run dev` dimatikan dulu saat menjalankan perintah di atas untuk menghindari file locking)*.

## 5. Cara Push ke GitHub
Untuk memperbarui repository di GitHub:

```bash
# 1. Cek file apa saja yang berubah
git status

# 2. Tambahkan semua perubahan
git add .

# 3. Beri catatan perubahan (Commit)
git commit -m "feat: premium landing page overhaul and theme polishing"

# 4. Kirim ke GitHub
# Gunakan branch 'master' atau 'main' sesuai yang tertera di repository
git push origin master
# Jika error branch mismatch, coba: git push origin main
```

## 6. Pandora Box: Panduan Kustomisasi Tema 🎨
Sistem tema di ma-links dirancang secara modular. Berikut adalah file-file yang saling berkaitan jika kamu ingin mengubah atau menambah tema baru:

### 📂 File 1: `src/lib/themes.js` (Pusat Data Tema)
Ini adalah "otak" dari semua pilihan tema.
- **Apa yang disetting?**: Warna background (`bg`), warna kartu (`cardBg`), warna border (`cardBorder`), warna teks (`text`), dan ikon tema (`icon`).
- **Cara Tambah**: Tambahkan objek baru ke dalam variable `themePresets`. Pastikan class CSS-nya tersedia di Tailwind.

### 📂 File 2: `src/components/AmbientBackground.js` (Efek Animasi)
Ini mengatur "benda melayang" (emoji/partikel) sesuai tema.
- **Apa yang disetting?**: List emoji yang muncul untuk setiap tema (`themeEmojis`).
- **Cara Tambah**: Tambahkan key tema baru ke dalam `themeEmojis` dan masukkan array emoji yang sesuai (misal: Lemon untuk tema Lemon Sorbet).

### 📂 File 3: `src/components/ProfileClient.js` (Rendering Frontend)
Halaman profil yang dilihat oleh pengunjung/user.
- **Relasi**: File ini mengambil data dari `themes.js` dan mengirimkan `themeName` ke `AmbientBackground.js`.
- **Kustomisasi**: Jika ingin mengubah layout profil secara keseluruhan.

### 📂 File 4: `src/app/globals.css` (Animasi & Glow)
Tempat semua animasi "berat" berada.
- **Isi Penting**: Keyframes untuk `.animate-orb` (glow orbs di landing page), `.animate-shimmer` (tombol berkilau), dan `.reveal-up` (efek scroll).

## 7. Troubleshooting Umum
- **Error: Unknown field**: Jalankan `npx prisma generate` lalu restart server.
- **Database Locked**: Matikan terminal yang menjalankan `npm run dev`, jalankan command prisma, lalu nyalakan lagi.
- **UI Gak Berubah**: Pastikan Tailwind JIT sedang jalan (server dev aktif) dan cek apakah class yang kamu pakai sudah benar penulisan/tipenya di `globals.css` atau `themes.js`.

---
**ma-links** | Developed with Love by Nafi Ilham
