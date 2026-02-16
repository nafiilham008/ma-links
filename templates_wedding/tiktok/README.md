# TikTok Wedding Template

Template undangan pernikahan viral dengan tampilan seperti aplikasi TikTok.

## Fitur Unik
- **Format Mobile:** Didesain khusus untuk tampilan layar HP (rasio 9:16).
- **Scroll FYP:** Ganti halaman (Home -> Event -> Maps) dengan scroll ke atas/bawah.
- **Stories Bar:** Ikon lingkaran di atas untuk highlight foto mempelai.
- **Interaktif:** Tombol "Love" bisa diklik dan ada animasi hati terbang.
- **Komentar/RSVP:** Menu RSVP muncul dari bawah (drawer) mirip kolom komentar TikTok.
- **Music Disc:** Ikon piringan hitam berputar di pojok kanan bawah.

## Cara Menggunakan
1. Buka file `index.html` di browser (Disarankan mode mobile view / buka di HP).
2. Klik tombol "Love" untuk melihat efek animasi.
3. Klik tombol "Comment" / Icon RSVP di kanan untuk mengisi ucapan.

## Cara Kustomisasi
Untuk mengubah konten:

- **Foto/Video Background:** Cari URL gambar di dalam `style="background-image: url(...)"`. Ganti dengan foto prewedding portrait (tegak).
- **Nama & Caption:** Edit teks di bagian `<div class="relative z-10 w-full...">`.
- **Music:** Ganti file audio di tag `<audio id="bg-audio">`.
- **Stories:** Ganti foto di bagian `.story-ring img`.

**Tips:** Gunakan foto dengan rasio 9:16 (Portrait) agar pas di layar penuh.
