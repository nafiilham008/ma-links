# 🛠️ ma-links Developer Notes & Guide

Dokumentasi teknis lengkap untuk pengembangan, pemeliharaan, dan deployment aplikasi **ma-links**.

---

## 🚀 1. Alur Pengembangan (Workflow)
Jika kamu baru saja meng-clone project ini atau ingin memulai coding:

### A. Setup Awal (Local)
1.  **Install Library**:
    ```bash
    npm install
    ```
2.  **Setup Database (SQLite)**:
    ```bash
    npx prisma db push
    npx prisma generate
    ```
3.  **Jalankan Server Development**:
    ```bash
    npm run dev
    ```

### B. Konfigurasi Environment (`.env`)
File `.env` wajib ada. Jangan commit file ini ke repo publik.
```env
# Local Development (SQLite)
DATABASE_URL="file:./dev.db"
JWT_SECRET="rahasia-banget-bro-ganti-ya"

# Google Auth (Opsional di Local)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="..."
```

---

## 📦 2. Cara Update & Push ke GitHub
Setiap kali selesai mengedit kode atau menambah fitur:

1.  **Cek Status & Add File**:
    ```bash
    git status
    git add .
    ```
2.  **Commit Perubahan**:
    ```bash
    git commit -m "feat: deskripsi singkat perubahanmu"
    ```
3.  **Push ke Repository**:
    ```bash
    git push origin master
    # Catatan: Branch utama kita adalah 'master'
    ```

---

## 🌐 3. Tutorial Deploy ke Production (VPS)
Panduan langkah demi langkah untuk mengupdate aplikasi di server production.

### A. Persiapan SSH Key
Pastikan kamu memiliki file kunci SSH (`id_ed25519`) yang sesuai.
*   **Lokasi Key**: `../warung-ibu-pintar/deploy-keys/id_ed25519` (relatif dari folder project ini).
*   **IP Server**: `202.155.95.238`
*   **User**: `root`

### B. Perintah Deploy (Satu Baris)
Jalankan perintah ini dari terminal lokal kamu (Git Bash / Terminal) untuk mengupdate server secara otomatis:

```bash
ssh -i ../warung-ibu-pintar/deploy-keys/id_ed25519 -o StrictHostKeyChecking=no root@202.155.95.238 "cd /var/www/ma-links && git fetch --all && git reset --hard origin/master && npm install && npx prisma generate && npx prisma db push && npm run build && pm2 restart ma-links"
```

**Penjelasan Perintah:**
1.  `ssh ...`: Masuk ke server dengan kunci khusus.
2.  `cd /var/www/ma-links`: Masuk ke folder aplikasi.
3.  `git fetch --all && git reset --hard ...`: **PENTING!** Memaksa kode di server sama persis dengan GitHub (menimpa perubahan manual di server).
4.  `npm install`: Update library baru jika ada.
5.  `npx prisma ...`: Update struktur database production.
6.  `npm run build`: Build ulang aplikasi Next.js.
7.  `pm2 restart ma-links`: Restart proses aplikasi agar perubahan aktif.

### C. Cek Status Aplikasi di Server
Jika ingin masuk ke server untuk mengecek log atau status:
```bash
# Login ke Server
ssh -i ../warung-ibu-pintar/deploy-keys/id_ed25519 root@202.155.95.238

# Cek Status PM2
pm2 status

# Cek Log Error
pm2 logs ma-links
```

---

## 🎨 4. Panduan Kustomisasi Tema
Lokasi file penting untuk mengubah tampilan:

*   **Data Tema**: `src/lib/themes.js` (Warna, Icon, Preset).
*   **Animasi Background**: `src/components/AmbientBackground.js` (Emoji melayang).
*   **Tampilan Profil**: `src/components/ProfileClient.js`.
*   **Global CSS**: `src/app/globals.css` (Animasi shimmer, glow, dll).

---

## 🔧 5. Troubleshooting
*   **Error "Remote Host Identification Changed"**:
    Jalankan command ini di terminal lokal untuk reset fingerprint:
    ```bash
    ssh-keygen -R 202.155.95.238
    ```
*   **Database Error setelah Deploy**:
    Pastikan `npx prisma db push` sukses. Cek log dengan `pm2 logs`.
*   **Gambar Tidak Muncul**:
    Pastikan folder `public/uploads` di server memiliki permission yang benar (`chmod 755`).

---
*Updated: Feb 8, 2026*
