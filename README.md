# 🔗 ma-links - Media Link & Category Management

Sebuah aplikasi manajemen link (Linktree clone) modern yang dibangun dengan **Next.js 15**, **Tailwind CSS**, dan **Prisma**. Aplikasi ini dirancang untuk kemudahan manajemen link dengan estetika premium dan fitur kategori yang cerdas.

---
**Developed by: [Nafi Ilham](https://github.com/nafiilham0)** 🦾🚀
---

## ✨ Fitur Utama
- **Typewriter Hero Title**: Judul dinamis yang berganti secara otomatis (Link, Catalogue, Website, etc).
- **Premium Aesthetics**: Efek aurora background, glassmorphism, dan animasi "alive" tingkat SaaS dunia.
- **Scroll Reveal**: Elemen muncul secara halus (slide-up) saat di-scroll, memberikan kesan premium.
- **Brand Slogan Badge**: Highlight "Free Forever" dengan gaya modern yang eye-catching.
- **Dynamic Phone Mockup**: Simulasi tampilan profil di HP secara real-time di halaman utama.
- **Dashboard Admin**: Kelola semua link kamu (Shopee, TikTok, dll) dalam satu tempat.
- **Smart Category Management**: Pengelompokan link otomatis dengan pencarian/filtering super cepat.
- **Security First**: Proteksi SQL Injection (via Prisma) dan limitasi input (Bio 80 char).
- **Auto-Standardization**: Otomatis merapikan format URL dan penulisan kategori.

## 📱 Best Practice for Customization
Untuk menjaga estetika premium aplikasi ini:
1. **Bio**: Tetaplah singkat (max 80 karakter) agar desain tidak berantakan.
2. **Hero Preview**: Masukkan screenshot profil kamu ke `public/hero-preview.png` untuk hasil yang paling realistis di landing page.
3. **Themes**: Gunakan warna-warna harmoni yang sudah tersedia di `themes.js` untuk konsistensi visual.

## 🚀 Persiapan Cepat
1. Clone repository ini.
2. Jalankan `npm install` untuk menginstall dependencies.
3. Setup file `.env` (lihat di folder `backups/config`).
4. Jalankan `npx prisma db push` dan `npx prisma generate`.
5. Mulai server dengan `npm run dev`.

---
*ma-links: Solusi cerdas untuk personal branding dan manajemen link produk.*
