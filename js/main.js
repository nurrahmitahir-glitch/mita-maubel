/* =========================================================
   MITA MAUBEL — main.js  (logika halaman publik)
   ========================================================= */

const WA_ICON = `<svg viewBox="0 0 32 32" fill="currentColor"><path d="M16.01 3C9.38 3 4 8.38 4 15.01c0 2.39.7 4.61 1.9 6.48L4 29l7.68-1.86a11.94 11.94 0 0 0 4.33.81h.01c6.63 0 12-5.38 12-12.01C28.02 8.38 22.64 3 16.01 3zm0 21.8c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-4.56 1.1 1.12-4.45-.2-.31a9.77 9.77 0 0 1-1.51-5.19c0-5.41 4.4-9.81 9.81-9.81 5.41 0 9.81 4.4 9.81 9.81 0 5.41-4.4 9.81-9.81 9.81zm5.4-7.35c-.29-.15-1.73-.86-2-.96-.27-.1-.47-.15-.66.15-.2.29-.76.95-.93 1.15-.17.2-.34.22-.63.07-.29-.15-1.23-.45-2.33-1.43-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.2 3.03c.15.2 2.06 3.14 5 4.4.7.3 1.24.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.73-.7 1.97-1.38.24-.68.24-1.26.17-1.38-.07-.13-.27-.2-.56-.35z"/></svg>`;

function mmMobileFriendlyNumber(displayNumber){ return displayNumber; }

/* ---------- Chrome: header/topbar/footer/nav ---------- */
function mmInitChrome(activePage){
  const info = mmGetInfo();

  document.querySelectorAll('[data-mm="business-name"]').forEach(el => el.textContent = info.nama);
  document.querySelectorAll('[data-mm="tagline"]').forEach(el => el.textContent = info.tagline);
  document.querySelectorAll('[data-mm="alamat"]').forEach(el => el.textContent = info.alamat);
  document.querySelectorAll('[data-mm="jam"]').forEach(el => el.textContent = `${info.hariOperasional}, ${info.jamBuka}\u2013${info.jamTutup}`);
  document.querySelectorAll('[data-mm="wa-display"]').forEach(el => el.textContent = info.whatsappDisplay);
  document.querySelectorAll('[data-mm="deskripsi"]').forEach(el => el.textContent = info.deskripsi);
  document.querySelectorAll('[data-mm="pembayaran"]').forEach(el => el.textContent = info.pembayaran);
  document.querySelectorAll('[data-mm="pengiriman"]').forEach(el => el.textContent = info.pengiriman);

  document.querySelectorAll('[data-mm-wa]').forEach(el => {
    const pesan = el.getAttribute('data-mm-wa') || `Halo ${info.nama}, saya ingin bertanya tentang produk mebel.`;
    el.setAttribute('href', mmWaLink(pesan));
  });

  document.querySelectorAll('.wa-float').forEach(el => {
    el.setAttribute('href', mmWaLink(`Halo ${info.nama}, saya ingin bertanya tentang produk mebel.`));
  });

  const map = document.querySelector('[data-mm="map"]');
  if(map){
    map.src = `https://www.google.com/maps?q=${encodeURIComponent(info.mapsQuery)}&output=embed`;
  }

  document.querySelectorAll('.nav a[data-page]').forEach(a=>{
    a.classList.toggle('active', a.getAttribute('data-page') === activePage);
  });

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if(toggle && nav){
    toggle.addEventListener('click', ()=> nav.classList.toggle('open'));
  }

  document.querySelectorAll('.wa-float, .btn-wa').forEach(el=>{
    if(!el.querySelector('svg') && el.dataset.mmIcon !== 'off'){
      el.insertAdjacentHTML('afterbegin', WA_ICON);
    }
  });
}

/* ---------- Kartu produk ---------- */
function mmProductCardHTML(p){
  const badge = p.status === 'tersedia'
    ? `<span class="badge badge--ready">Tersedia</span>`
    : `<span class="badge badge--out">Habis</span>`;
  return `
  <article class="card-produk">
    <div class="card-produk__img">
      ${badge}
      <img src="${p.gambar}" alt="${p.nama}" loading="lazy">
    </div>
    <div class="card-produk__body">
      <span class="card-produk__kat">${p.kategori}</span>
      <h3 class="card-produk__title">${p.nama}</h3>
      <span class="card-produk__meta">${p.ukuran} &middot; ${p.bahan}</span>
      <div class="card-produk__price">${mmFormatRupiah(p.harga)}</div>
      <a class="card-produk__link" href="produk-detail.html?id=${p.id}">Lihat Detail</a>
    </div>
  </article>`;
}

/* ---------- Beranda: produk unggulan ---------- */
function mmRenderFeatured(containerId){
  const el = document.getElementById(containerId);
  if(!el) return;
  const products = mmGetProducts().filter(p => p.unggulan);
  el.innerHTML = products.map(mmProductCardHTML).join('');
}

/* ---------- Katalog: render + filter + pencarian ---------- */
function mmInitCatalog(){
  const grid = document.getElementById('catalog-grid');
  const empty = document.getElementById('catalog-empty');
  const searchInput = document.getElementById('catalog-search');
  const chipRow = document.getElementById('catalog-chips');
  if(!grid) return;

  const products = mmGetProducts();
  const categories = ['Semua', ...Array.from(new Set(products.map(p=>p.kategori)))];
  let activeCat = 'Semua';

  chipRow.innerHTML = categories.map(c =>
    `<button type="button" class="chip${c==='Semua'?' active':''}" data-cat="${c}">${c}</button>`
  ).join('');

  function draw(){
    const q = (searchInput.value || '').trim().toLowerCase();
    const filtered = products.filter(p=>{
      const matchCat = activeCat === 'Semua' || p.kategori === activeCat;
      const matchQ = !q || p.nama.toLowerCase().includes(q) || p.bahan.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
    grid.innerHTML = filtered.map(mmProductCardHTML).join('');
    empty.style.display = filtered.length ? 'none' : 'block';
  }

  chipRow.addEventListener('click', e=>{
    const btn = e.target.closest('.chip');
    if(!btn) return;
    activeCat = btn.getAttribute('data-cat');
    chipRow.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active', c===btn));
    draw();
  });
  searchInput.addEventListener('input', draw);

  // dukung ?kategori= dari link luar (mis. dari beranda)
  const preset = mmSlugParam('kategori');
  if(preset && categories.includes(preset)){
    activeCat = preset;
    chipRow.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active', c.getAttribute('data-cat')===preset));
  }

  draw();
}

/* ---------- Detail Produk ---------- */
function mmInitDetail(){
  const root = document.getElementById('detail-root');
  if(!root) return;
  const id = mmSlugParam('id');
  const products = mmGetProducts();
  const p = products.find(x => x.id === id) || products[0];
  if(!p){ root.innerHTML = '<p>Produk tidak ditemukan.</p>'; return; }

  document.title = `${p.nama} — Mita Maubel`;
  document.getElementById('detail-breadcrumb-name').textContent = p.nama;

  const statusBadge = p.status === 'tersedia'
    ? `<span class="badge badge--ready" style="position:static;display:inline-block;margin-bottom:10px;">Tersedia</span>`
    : `<span class="badge badge--out" style="position:static;display:inline-block;margin-bottom:10px;">Stok Habis</span>`;

  const pesanWa = `Halo ${mmGetInfo().nama}, saya tertarik dengan produk *${p.nama}* (${mmFormatRupiah(p.harga)}). Apakah masih tersedia?`;

  root.innerHTML = `
    <div class="detail-produk__img"><img src="${p.gambar}" alt="${p.nama}"></div>
    <div>
      <div class="detail-produk__kat">${p.kategori}</div>
      <h1>${p.nama}</h1>
      ${statusBadge}
      <div class="detail-produk__harga">${mmFormatRupiah(p.harga)}</div>
      <p>${p.deskripsi}</p>
      <table class="spec-table">
        <tr><td>Ukuran</td><td>${p.ukuran}</td></tr>
        <tr><td>Bahan</td><td>${p.bahan}</td></tr>
        <tr><td>Status</td><td>${p.status === 'tersedia' ? 'Tersedia' : 'Stok Habis'}</td></tr>
      </table>
      <div class="detail-produk__cta">
        <a class="btn-wa" href="${mmWaLink(pesanWa)}" target="_blank" rel="noopener">Tanya / Pesan via WhatsApp</a>
        <a class="btn btn--outline" href="pesanan-custom.html">Ingin Ukuran/Model Lain?</a>
      </div>
    </div>`;

  const relatedEl = document.getElementById('related-grid');
  if(relatedEl){
    const related = products.filter(x => x.kategori === p.kategori && x.id !== p.id).slice(0,4);
    relatedEl.innerHTML = related.map(mmProductCardHTML).join('') || '<p class="muted">Belum ada produk terkait.</p>';
  }
}

/* ---------- Galeri ---------- */
const MM_GALLERY = [
  { img: 'images/galeri-01-kursi-ukir.jpeg', caption: 'Kursi ukir kayu jati' },
  { img: 'images/galeri-02-bangku-panjang.jpeg', caption: 'Bangku panjang kayu jati' },
  { img: 'images/galeri-03-pintu-jati.jpeg', caption: 'Pintu kayu jati' },
  { img: 'images/galeri-04-kursi-makan.jpeg', caption: 'Kursi makan kayu jati' },
  { img: 'images/galeri-05-set-kursi-tamu.jpeg', caption: 'Set kursi tamu kayu jati' },
  { img: 'images/galeri-06-bangku-jati.jpeg', caption: 'Bangku kayu jati finishing glossy' },
  { img: 'images/galeri-07-bufet-tv.jpeg', caption: 'Bufet TV ukir kayu jati' },
  { img: 'images/galeri-08-set-tamu-bantal.jpeg', caption: 'Set kursi tamu dengan bantal' },
  { img: 'images/galeri-09-set-meja-makan.jpeg', caption: 'Set meja makan kayu jati' },
  { img: 'images/galeri-10-bufet-ukir.jpeg', caption: 'Bufet ukir kayu jati' },
  { img: 'images/galeri-11-bangku-bantal.jpeg', caption: 'Bangku kayu jati dengan bantal' },
  { img: 'images/galeri-12-set-kursi-bundar.jpeg', caption: 'Set meja kursi bundar kayu jati' },
  { img: 'images/galeri-13-bufet-ukir-emas.jpeg', caption: 'Bufet ukir emas kayu jati' },
  { img: 'images/galeri-14-set-meja-makan-2.jpeg', caption: 'Set meja makan kayu jati' },
];
function mmRenderGallery(containerId){
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = MM_GALLERY.map(g => `
    <figure>
      <a href="${g.img}" target="_blank" rel="noopener" title="${g.caption}">
        <img src="${g.img}" alt="${g.caption}" loading="lazy">
      </a>
    </figure>`).join('');
}

/* ---------- Form pesanan custom ---------- */
function mmInitCustomOrderForm(){
  const form = document.getElementById('custom-order-form');
  if(!form) return;
  const successBox = document.getElementById('custom-order-success');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const fd = new FormData(form);
    const info = mmGetInfo();

    const order = {
      id: mmUid('o'),
      tanggal: new Date().toISOString().slice(0,10),
      nama: fd.get('nama').trim(),
      kontak: fd.get('kontak').trim(),
      jenis: fd.get('jenis'),
      ukuran: fd.get('ukuran').trim(),
      bahan: fd.get('bahan'),
      warna: fd.get('warna').trim(),
      model: fd.get('model').trim(),
      catatan: fd.get('catatan').trim(),
      gambarRef: (fd.get('gambarRef') && fd.get('gambarRef').name) ? fd.get('gambarRef').name : '',
      status: 'baru',
    };

    const orders = mmGetOrders();
    orders.unshift(order);
    mmSaveOrders(orders);

    const pesan = `Halo ${info.nama}, saya ingin memesan furniture custom:\n` +
      `Jenis: ${order.jenis}\nUkuran: ${order.ukuran}\nBahan: ${order.bahan}\nWarna: ${order.warna}\nModel: ${order.model}\n` +
      (order.catatan ? `Catatan: ${order.catatan}\n` : '') +
      `Atas nama: ${order.nama} (${order.kontak})`;

    successBox.innerHTML = `Pesanan tersimpan! Klik tombol di bawah untuk melanjutkan konfirmasi lewat WhatsApp.
      <br><br><a class="btn btn--sage btn--sm" target="_blank" rel="noopener" href="${mmWaLink(pesan, info.whatsapp)}">Kirim ke WhatsApp</a>`;
    successBox.classList.add('show');
    form.reset();
    successBox.scrollIntoView({behavior:'smooth', block:'center'});
  });
}

/* ---------- Form kontak singkat ---------- */
function mmInitContactForm(){
  const form = document.getElementById('contact-form');
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const fd = new FormData(form);
    const info = mmGetInfo();
    const pesan = `Halo ${info.nama}, nama saya ${fd.get('nama')}.\n${fd.get('pesan')}`;
    window.open(mmWaLink(pesan, info.whatsapp), '_blank');
  });
}
