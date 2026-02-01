# 🛠️ Developer Notes & Guide

Dokumentasi teknis untuk pengembangan dan pemeliharaan aplikasi Linktree Clone.

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
git commit -m "Update fitur atau perbaikan bug"

# 4. Kirim ke GitHub
git push origin main
```

---
**Tips**: Selalu cek terminal saat server jalan. Jika ada error merah, baca pesan errornya, biasanya Prisma akan memberikan saran solusi yang tepat.
