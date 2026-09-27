/* =========================================================
   MITA MAUBEL — data.js
   "Database" sisi-klien memakai localStorage.
   Dipakai bersama oleh halaman publik & admin supaya perubahan
   yang dilakukan admin (tambah/edit/hapus produk, status pesanan,
   info usaha) langsung terlihat di halaman publik.

   CATATAN PRODUKSI:
   Ini adalah simulasi database untuk prototipe/demo. Untuk
   penggunaan nyata (multi-perangkat, aman, dan permanen),
   ganti layer ini dengan backend sungguhan (mis. PHP + MySQL,
   atau Node.js + database) yang diakses lewat fetch()/API.
   Struktur data & nama field sudah dirancang agar mudah
   dipetakan ke tabel database relasional.
   ========================================================= */

const MM_KEYS = {
  PRODUCTS: 'mm_products',
  ORDERS:   'mm_orders',
  INFO:     'mm_info',
  ADMIN:    'mm_admin_session',
  VERSION:  'mm_seed_version',
};

/* Naikkan angka ini setiap kali MM_SEED_PRODUCTS / MM_SEED_INFO diubah
   di kode, supaya data lama yang tersimpan di localStorage browser
   pengunjung otomatis diganti dengan data terbaru (tidak perlu clear
   cache manual). */
const MM_SEED_VERSION = 2;

/* ---------- Data awal (seed) ---------- */

const MM_SEED_INFO = {
  nama: 'Mita Maubel',
  tagline: 'Mebel Kayu Jati Berkualitas, Dibuat dengan Tangan',
  alamat: 'Jl. H. Hamka, Coppo, Kec. Barru, Kabupaten Barru, Sulawesi Selatan',
  whatsapp: '6285398830913',
  whatsappDisplay: '0853-9883-0913',
  jamBuka: '08.00',
  jamTutup: '22.00',
  hariOperasional: 'Setiap hari',
  pembayaran: 'Transfer Bank atau Tunai (Cash)',
  pengiriman: 'Melayani pengiriman dalam kota & luar daerah (ongkir menyesuaikan jarak)',
  customOrder: true,
  instagram: '',
  facebook: '',
  mapsQuery: 'Coppo, Kecamatan Barru, Kabupaten Barru, Sulawesi Selatan',
  deskripsi: 'Mita Maubel adalah usaha mebel rumahan yang mengerjakan setiap produk dengan tangan menggunakan kayu jati pilihan. Melayani pembelian produk siap pakai maupun pesanan custom sesuai kebutuhan ruang Anda.',
};

const MM_SEED_PRODUCTS = [
  {
    id: 'p1',
    nama: 'Kursi Tamu Kayu Jati',
    kategori: 'Kursi',
    harga: 4500000,
    ukuran: 'Set (1 sofa + 4 kursi + meja)',
    bahan: 'Kayu Jati Solid',
    deskripsi: 'Set kursi tamu kayu jati dengan ukiran khas Jepara, terdiri dari sofa, 4 kursi, dan meja tamu. Finishing melamin glossy tahan lama.',
    status: 'tersedia',
    unggulan: true,
    gambar: 'images/produk-kursi-tamu-jati.webp',
  },
  {
    id: 'p2',
    nama: 'Lemari Kayu Jati',
    kategori: 'Lemari',
    harga: 5500000,
    ukuran: '3 Pintu',
    bahan: 'Kayu Jati Solid',
    deskripsi: 'Lemari pakaian 3 pintu dengan motif ukiran belah ketupat pada setiap panel, finishing natural glossy, kokoh dan tahan lama.',
    status: 'tersedia',
    unggulan: true,
    gambar: 'images/produk-lemari-jati.jpg',
  },
  {
    id: 'p3',
    nama: 'Set Meja Makan',
    kategori: 'Meja',
    harga: 6500000,
    ukuran: '6 Kursi (meja oval)',
    bahan: 'Kayu Jati Tua',
    deskripsi: 'Set meja makan mewah untuk 6 orang dengan kursi berukir detail dan dilapisi kulit, cocok untuk ruang makan bergaya klasik.',
    status: 'tersedia',
    unggulan: true,
    gambar: 'images/produk-set-meja-makan.webp',
  },
  {
    id: 'p4',
    nama: 'Bufet Kayu Jati',
    kategori: 'Lemari',
    harga: 4800000,
    ukuran: 'Ukuran standar bufet',
    bahan: 'Kayu Jati Solid',
    deskripsi: 'Bufet kayu jati dengan ukiran bunga dan pita khas, cocok sebagai penyimpanan sekaligus elemen dekoratif ruang tamu.',
    status: 'tersedia',
    unggulan: false,
    gambar: 'images/produk-bufet-jati.jpg',
  },
  {
    id: 'p5',
    nama: 'Meja Rias',
    kategori: 'Meja',
    harga: 2500000,
    ukuran: 'Meja + cermin tiga + kursi kecil',
    bahan: 'Kayu Jati Solid',
    deskripsi: 'Meja rias lengkap dengan cermin tiga sisi, laci penyimpanan di kedua sisi, dan bangku duduk berbantal.',
    status: 'tersedia',
    unggulan: false,
    gambar: 'images/produk-meja-rias.jpg',
  },
  {
    id: 'p6',
    nama: 'Kusen Kayu',
    kategori: 'Kusen',
    harga: 1500000,
    ukuran: 'Per set pintu',
    bahan: 'Kayu Jati',
    deskripsi: 'Kusen dan daun pintu kayu jati polos, finishing natural, siap dipasang untuk pintu rumah maupun kamar.',
    status: 'tersedia',
    unggulan: false,
    gambar: 'images/produk-kusen-kayu.png',
  },
];

const MM_SEED_ORDERS = [
  {
    id: 'o1',
    tanggal: '2026-09-05',
    nama: 'Ibu Sari',
    kontak: '6281234567890',
    jenis: 'Lemari',
    ukuran: '120 × 55 × 200 cm',
    bahan: 'Kayu Jati',
    warna: 'Coklat Tua',
    model: 'Minimalis, 3 pintu tanpa ukiran',
    catatan: 'Mohon ada cermin di salah satu pintu.',
    gambarRef: '',
    status: 'baru',
  },
];

/* ---------- Util penyimpanan (localStorage) ---------- */

function mmCheckSeedVersion(){
  try{
    const stored = localStorage.getItem(MM_KEYS.VERSION);
    if(stored !== String(MM_SEED_VERSION)){
      // Versi seed di kode sudah berubah (mis. admin mengganti produk
      // lewat data.js) -> timpa produk & info tersimpan dengan yang baru,
      // tapi pesanan (orders) yang sudah masuk tetap dibiarkan.
      localStorage.setItem(MM_KEYS.PRODUCTS, JSON.stringify(MM_SEED_PRODUCTS));
      localStorage.setItem(MM_KEYS.INFO, JSON.stringify(MM_SEED_INFO));
      localStorage.setItem(MM_KEYS.VERSION, String(MM_SEED_VERSION));
    }
  }catch(e){
    console.error('Gagal memeriksa versi data', e);
  }
}
mmCheckSeedVersion();

function mmLoad(key, seed){
  try{
    const raw = localStorage.getItem(key);
    if(raw) return JSON.parse(raw);
    localStorage.setItem(key, JSON.stringify(seed));
    return JSON.parse(JSON.stringify(seed));
  }catch(e){
    console.error('Gagal memuat data', key, e);
    return seed;
  }
}

function mmSave(key, data){
  localStorage.setItem(key, JSON.stringify(data));
}

function mmGetProducts(){ return mmLoad(MM_KEYS.PRODUCTS, MM_SEED_PRODUCTS); }
function mmSaveProducts(list){ mmSave(MM_KEYS.PRODUCTS, list); }

function mmGetOrders(){ return mmLoad(MM_KEYS.ORDERS, MM_SEED_ORDERS); }
function mmSaveOrders(list){ mmSave(MM_KEYS.ORDERS, list); }

function mmGetInfo(){ return mmLoad(MM_KEYS.INFO, MM_SEED_INFO); }
function mmSaveInfo(info){ mmSave(MM_KEYS.INFO, info); }

function mmFormatRupiah(angka){
  return 'Rp' + Number(angka).toLocaleString('id-ID');
}

function mmSlugParam(name){
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function mmWaLink(pesan, nomor){
  const info = mmGetInfo();
  const no = nomor || info.whatsapp;
  return `https://wa.me/${no}?text=${encodeURIComponent(pesan)}`;
}

function mmUid(prefix){
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}
