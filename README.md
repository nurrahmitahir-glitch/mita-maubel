# Mita Maubel — Website Katalog & Admin Mebel

Website statis (HTML/CSS/JS murni, tanpa perlu install apa pun) untuk usaha
mebel **Mita Maubel** di Barru, Sulawesi Selatan. Dibuat berdasarkan konsep
di dokumen `konsep_usaha_mebel.docx`.

## Cara menjalankan

Karena hanya HTML/CSS/JS statis, cukup buka `index.html` langsung di
browser, atau lebih baik jalankan local server supaya semua fitur
(localStorage, fetch gambar) berjalan mulus:

```bash
# dari dalam folder mita-maubel/
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

## Struktur folder

```
mita-maubel/
├── index.html              Beranda
├── katalog.html             Katalog produk + pencarian & filter kategori
├── produk-detail.html       Detail 1 produk (?id=xxx)
├── pesanan-custom.html      Form pesanan custom (furniture sesuai request)
├── galeri.html               Galeri hasil pekerjaan
├── kontak.html                Hubungi kami + peta + form pesan cepat
├── css/style.css             Semua styling situs publik
├── js/data.js                 Data produk/pesanan/info usaha (localStorage)
├── js/main.js                  Logika render & interaksi situs publik
├── images/                     Semua gambar (logo, produk, galeri, hero)
└── admin/                      Panel admin
    ├── index.html               Login admin
    ├── dashboard.html            Ringkasan (jumlah produk, pesanan baru, dll)
    ├── produk.html                 CRUD produk (tambah/edit/hapus, upload foto)
    ├── pesanan.html                 Kelola pesanan custom & ubah status
    ├── pengaturan.html              Ubah info usaha (alamat, WA, jam, dll)
    ├── css/admin.css                Styling khusus panel admin
    └── js/admin.js                   Logika login & CRUD admin
```

## Login admin (demo)

```
URL       : admin/index.html
Username  : admin
Password  : mitamaubel123
```

## Bagaimana data disimpan

Proyek ini adalah **prototipe sisi-klien**: semua data (produk, pesanan
custom, info usaha) disimpan di `localStorage` browser lewat `js/data.js`.
Artinya:

- Perubahan yang dilakukan admin (tambah produk, ubah harga, dsb) langsung
  terlihat di halaman publik **selama dibuka di browser & perangkat yang
  sama**.
- Data **tidak** otomatis tersinkron antar perangkat/pengguna berbeda,
  karena tidak ada server/database sungguhan.
- Login admin juga hanya simulasi di sisi klien — cocok untuk demo/prototipe,
  **belum aman untuk dipakai produksi**.

## Untuk pindah ke produksi (disarankan)

Ganti isi fungsi-fungsi di `js/data.js` dan `admin/js/admin.js`
(`mmGetProducts`, `mmSaveProducts`, `mmLogin`, dst.) agar memanggil API
backend sungguhan, misalnya:

- **Backend**: PHP + MySQL, atau Node.js (Express) + MongoDB/PostgreSQL
- **Auth**: hash password (bcrypt), session/JWT, HTTPS
- **Upload gambar**: disimpan di server/cloud storage, bukan base64 di
  localStorage

Struktur field data (nama produk, kategori, harga, ukuran, bahan, status,
dst.) sudah dirancang agar mudah dipetakan langsung ke kolom tabel database
relasional.

## Kredit gambar

Semua gambar (logo, foto produk, galeri, hero) dibuat secara prosedural
(bukan foto asli) sebagai placeholder bertema kayu jati. Ganti dengan foto
produk asli Mita Maubel di folder `images/` sebelum website dipakai
sungguhan — nama file yang sudah dirujuk di `js/data.js` bisa langsung
ditimpa dengan foto asli berformat sama.
