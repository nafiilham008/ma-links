# Infinite Zoom Wedding Template (Section Mapped)

Template undangan dengan konsep "Deep Dive" di mana setiap level zoom mewakili satu bagian konten undangan.

## Alur Zoom (Storyline)
1.  **Level 1: The Opening (Pemandangan Alam)**
    - Tampilan awal dengan Judul Undangan.
    - Fokus objek: **Sebuah Rumah/Cabin** di kejauhan.
2.  **Level 2: The Couple (Bagian Mempelai)**
    - Zoom masuk ke Rumah. Muncul profil Mempelai (Putra/Putri).
    - Fokus objek: **Jendela** rumah.
3.  **Level 3: The Prayer (Doa/Ayat)**
    - Zoom masuk ke Jendela (Ruangan dalam). Muncul ayat suci/doa.
    - Fokus objek: **Buku** di atas meja.
4.  **Level 4: The Events (Detail Acara)**
    - Zoom masuk ke Buku. Muncul detail waktu & lokasi (Akad/Resepsi).
    - Fokus objek: **Kartu/Stamp** di halaman buku.
5.  **Level 5: RSVP**
    - Zoom terakhir ke Kartu. Muncul Form RSVP.

## Cara Menggunakan
1. Buka file `index.html`.
2. Ikuti instruksi "Tap/Click" yang muncul di setiap level.
3. Teks konten akan muncul otomatis (*fade in*) setelah zoom selesai.

## Cara Kustomisasi
- **Gambar:** Ganti url di CSS `#layer-1` sampai `#layer-4` untuk mengubah suasana (misal ganti gunung jadi pantai, rumah jadi istana pasir, dst).
- **Teks:** Edit langsung di bagian HTML `<div class="text-overlay">`.
- **Durasi Zoom:** Ubah `transition: transform 2.5s` di CSS `#camera` jika ingin lebih cepat/lambat.
