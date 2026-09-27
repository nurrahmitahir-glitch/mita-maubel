/* =========================================================
   MITA MAUBEL — admin.js
   Logika panel admin (login demo, CRUD produk, kelola pesanan,
   pengaturan info usaha). Berjalan di atas layer data.js yang
   sama dengan situs publik sehingga perubahan admin langsung
   tercermin di halaman publik (karena satu localStorage/browser).

   CATATAN KEAMANAN (PENTING):
   Login di bawah ini HANYA simulasi untuk kebutuhan prototipe/
   demo di sisi klien (tanpa server). Kredensial tersimpan polos
   di kode & session ditandai lewat localStorage, sehingga TIDAK
   aman untuk produksi. Untuk penggunaan nyata, ganti dengan
   autentikasi berbasis server (hash password, session/token,
   HTTPS, dsb).
   ========================================================= */

const MM_ADMIN_USER = 'admin';
const MM_ADMIN_PASS = 'mitamaubel123';

/* ---------- Auth ---------- */
function mmIsLoggedIn(){
  return localStorage.getItem(MM_KEYS.ADMIN) === '1';
}
function mmLogin(user, pass){
  if(user === MM_ADMIN_USER && pass === MM_ADMIN_PASS){
    localStorage.setItem(MM_KEYS.ADMIN, '1');
    return true;
  }
  return false;
}
function mmLogout(){
  localStorage.removeItem(MM_KEYS.ADMIN);
  window.location.href = 'index.html';
}
function mmGuard(){
  if(!mmIsLoggedIn()){
    window.location.href = 'index.html';
  }
}

/* ---------- Shell: sidebar + topbar ---------- */
const MM_ADMIN_NAV = [
  { href:'dashboard.html', label:'Dashboard', icon:'&#9635;', key:'dashboard' },
  { href:'produk.html', label:'Produk', icon:'&#128736;', key:'produk' },
  { href:'pesanan.html', label:'Pesanan Custom', icon:'&#128172;', key:'pesanan' },
  { href:'pengaturan.html', label:'Info Usaha', icon:'&#9881;', key:'pengaturan' },
];

function mmRenderAdminShell(activeKey, pageTitle, pageSub){
  const sidebarNav = document.getElementById('admin-sidebar-nav');
  if(sidebarNav){
    sidebarNav.innerHTML = MM_ADMIN_NAV.map(item => `
      <a href="${item.href}" class="${item.key===activeKey?'active':''}">
        <span class="ic">${item.icon}</span> ${item.label}
      </a>`).join('');
  }
  const titleEl = document.getElementById('admin-page-title');
  const subEl = document.getElementById('admin-page-sub');
  if(titleEl) titleEl.textContent = pageTitle || '';
  if(subEl) subEl.textContent = pageSub || '';

  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('admin-sidebar');
  if(toggle && sidebar){
    toggle.addEventListener('click', ()=> sidebar.classList.toggle('open'));
  }
  const logoutBtn = document.getElementById('admin-logout');
  if(logoutBtn) logoutBtn.addEventListener('click', (e)=>{ e.preventDefault(); mmLogout(); });
}

function mmToast(msg){
  let el = document.getElementById('mm-toast');
  if(!el){
    el = document.createElement('div');
    el.id = 'mm-toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(()=> el.classList.remove('show'), 2600);
}

/* ---------- Dashboard ---------- */
function mmInitDashboard(){
  const products = mmGetProducts();
  const orders = mmGetOrders();

  document.getElementById('stat-total-produk').textContent = products.length;
  document.getElementById('stat-tersedia').textContent = products.filter(p=>p.status==='tersedia').length;
  document.getElementById('stat-habis').textContent = products.filter(p=>p.status==='habis').length;
  document.getElementById('stat-pesanan-baru').textContent = orders.filter(o=>o.status==='baru').length;

  const recentBody = document.getElementById('dashboard-recent-orders');
  const recent = orders.slice(0,5);
  recentBody.innerHTML = recent.length ? recent.map(o => `
    <tr>
      <td>${o.tanggal}</td>
      <td>${o.nama}</td>
      <td>${o.jenis}</td>
      <td>${mmOrderStatusPill(o.status)}</td>
    </tr>`).join('') : `<tr class="empty-row"><td colspan="4">Belum ada pesanan custom.</td></tr>`;

  const bestBody = document.getElementById('dashboard-produk-list');
  bestBody.innerHTML = products.filter(p=>p.unggulan).map(p => `
    <tr>
      <td><img class="thumb" src="../${p.gambar}" alt="${p.nama}"></td>
      <td>${p.nama}</td>
      <td>${mmFormatRupiah(p.harga)}</td>
      <td>${mmStatusPill(p.status)}</td>
    </tr>`).join('');
}

function mmStatusPill(status){
  return status === 'tersedia'
    ? `<span class="pill pill--sage">Tersedia</span>`
    : `<span class="pill pill--brick">Habis</span>`;
}
function mmOrderStatusPill(status){
  const map = {
    baru: `<span class="pill pill--amber">Baru</span>`,
    diproses: `<span class="pill pill--oak">Diproses</span>`,
    selesai: `<span class="pill pill--sage">Selesai</span>`,
  };
  return map[status] || map.baru;
}

/* ---------- Produk: list + CRUD ---------- */
let MM_EDIT_ID = null;

function mmInitProdukPage(){
  const tbody = document.getElementById('produk-tbody');
  const search = document.getElementById('produk-search');
  const filterKat = document.getElementById('produk-filter-kategori');
  const filterStatus = document.getElementById('produk-filter-status');
  const addBtn = document.getElementById('produk-add-btn');
  const modal = document.getElementById('produk-modal');
  const form = document.getElementById('produk-form');
  const modalTitle = document.getElementById('produk-modal-title');
  const imgInput = document.getElementById('f-gambar-file');
  const imgPreview = document.getElementById('f-gambar-preview');
  let currentImageData = '';

  function categories(){
    return Array.from(new Set(mmGetProducts().map(p=>p.kategori)));
  }
  function fillCategoryFilter(){
    filterKat.innerHTML = `<option value="">Semua Kategori</option>` +
      categories().map(c=>`<option value="${c}">${c}</option>`).join('');
  }

  function draw(){
    const products = mmGetProducts();
    const q = (search.value||'').toLowerCase().trim();
    const kat = filterKat.value;
    const status = filterStatus.value;
    const filtered = products.filter(p=>{
      const mq = !q || p.nama.toLowerCase().includes(q);
      const mk = !kat || p.kategori === kat;
      const ms = !status || p.status === status;
      return mq && mk && ms;
    });
    tbody.innerHTML = filtered.length ? filtered.map(p => `
      <tr>
        <td><img class="thumb" src="../${p.gambar}" alt="${p.nama}"></td>
        <td>
          <strong>${p.nama}</strong><br>
          <span style="color:#8a7a68;font-size:.8rem;">${p.ukuran}</span>
        </td>
        <td>${p.kategori}</td>
        <td>${mmFormatRupiah(p.harga)}</td>
        <td>${p.unggulan ? '<span class="pill pill--amber">Unggulan</span>' : '—'}</td>
        <td>${mmStatusPill(p.status)}</td>
        <td>
          <div class="actions">
            <button class="btn btn--outline btn--sm" data-act="edit" data-id="${p.id}">Edit</button>
            <button class="btn btn--danger btn--sm" data-act="del" data-id="${p.id}">Hapus</button>
          </div>
        </td>
      </tr>`).join('') : `<tr class="empty-row"><td colspan="7">Tidak ada produk yang cocok.</td></tr>`;
  }

  fillCategoryFilter();
  draw();
  [search, filterKat, filterStatus].forEach(el => el.addEventListener('input', draw));

  tbody.addEventListener('click', e=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const id = btn.getAttribute('data-id');
    if(btn.dataset.act === 'edit') openModal(id);
    if(btn.dataset.act === 'del') deleteProduct(id);
  });

  function openModal(id){
    const products = mmGetProducts();
    MM_EDIT_ID = id || null;
    form.reset();
    currentImageData = '';
    imgPreview.innerHTML = 'Belum ada gambar';

    if(id){
      const p = products.find(x=>x.id===id);
      modalTitle.textContent = 'Edit Produk';
      form.nama.value = p.nama;
      form.kategori.value = p.kategori;
      form.harga.value = p.harga;
      form.ukuran.value = p.ukuran;
      form.bahan.value = p.bahan;
      form.deskripsi.value = p.deskripsi;
      form.status.value = p.status;
      form.unggulan.checked = !!p.unggulan;
      currentImageData = p.gambar;
      imgPreview.innerHTML = `<img src="../${p.gambar}" alt="">`;
    } else {
      modalTitle.textContent = 'Tambah Produk';
      form.status.value = 'tersedia';
    }
    modal.classList.add('open');
  }
  function closeModal(){ modal.classList.remove('open'); MM_EDIT_ID = null; }

  addBtn.addEventListener('click', ()=> openModal(null));
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));

  imgInput.addEventListener('change', ()=>{
    const file = imgInput.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      currentImageData = reader.result; // base64 data URL, disimpan di localStorage
      imgPreview.innerHTML = `<img src="${reader.result}" alt="">`;
    };
    reader.readAsDataURL(file);
  });

  function deleteProduct(id){
    const products = mmGetProducts();
    const p = products.find(x=>x.id===id);
    if(!p) return;
    if(!confirm(`Hapus produk "${p.nama}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    mmSaveProducts(products.filter(x=>x.id!==id));
    draw();
    fillCategoryFilter();
    mmToast('Produk berhasil dihapus.');
  }

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const products = mmGetProducts();
    const data = {
      nama: form.nama.value.trim(),
      kategori: form.kategori.value.trim(),
      harga: Number(form.harga.value),
      ukuran: form.ukuran.value.trim(),
      bahan: form.bahan.value.trim(),
      deskripsi: form.deskripsi.value.trim(),
      status: form.status.value,
      unggulan: form.unggulan.checked,
      gambar: currentImageData || 'images/produk-lemari-jati.jpg',
    };
    if(MM_EDIT_ID){
      const idx = products.findIndex(x=>x.id===MM_EDIT_ID);
      products[idx] = { ...products[idx], ...data };
      mmToast('Produk berhasil diperbarui.');
    } else {
      data.id = mmUid('p');
      products.unshift(data);
      mmToast('Produk baru berhasil ditambahkan.');
    }
    mmSaveProducts(products);
    closeModal();
    draw();
    fillCategoryFilter();
  });
}

/* ---------- Pesanan Custom ---------- */
function mmInitPesananPage(){
  const tbody = document.getElementById('pesanan-tbody');
  const filterStatus = document.getElementById('pesanan-filter-status');
  const detailModal = document.getElementById('pesanan-modal');
  const detailBody = document.getElementById('pesanan-modal-body');

  function draw(){
    const orders = mmGetOrders();
    const status = filterStatus.value;
    const filtered = orders.filter(o => !status || o.status === status);
    tbody.innerHTML = filtered.length ? filtered.map(o => `
      <tr>
        <td>${o.tanggal}</td>
        <td><strong>${o.nama}</strong><br><span style="color:#8a7a68;font-size:.8rem;">${o.kontak}</span></td>
        <td>${o.jenis}</td>
        <td>${o.ukuran || '—'}</td>
        <td>
          <select class="status-select" data-id="${o.id}" style="padding:6px 10px;border:1px solid var(--line);border-radius:4px;">
            <option value="baru" ${o.status==='baru'?'selected':''}>Baru</option>
            <option value="diproses" ${o.status==='diproses'?'selected':''}>Diproses</option>
            <option value="selesai" ${o.status==='selesai'?'selected':''}>Selesai</option>
          </select>
        </td>
        <td>
          <div class="actions">
            <button class="btn btn--outline btn--sm" data-act="detail" data-id="${o.id}">Detail</button>
            <button class="btn btn--danger btn--sm" data-act="del" data-id="${o.id}">Hapus</button>
          </div>
        </td>
      </tr>`).join('') : `<tr class="empty-row"><td colspan="6">Belum ada pesanan custom.</td></tr>`;
  }

  draw();
  filterStatus.addEventListener('input', draw);

  tbody.addEventListener('change', e=>{
    if(!e.target.classList.contains('status-select')) return;
    const orders = mmGetOrders();
    const idx = orders.findIndex(o=>o.id===e.target.dataset.id);
    if(idx>-1){
      orders[idx].status = e.target.value;
      mmSaveOrders(orders);
      mmToast('Status pesanan diperbarui.');
      draw();
    }
  });

  tbody.addEventListener('click', e=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const orders = mmGetOrders();
    const o = orders.find(x=>x.id===btn.dataset.id);
    if(btn.dataset.act === 'detail' && o){
      detailBody.innerHTML = `
        <table class="data-table">
          <tr><td style="width:35%;color:#8a7a68;">Tanggal</td><td>${o.tanggal}</td></tr>
          <tr><td style="color:#8a7a68;">Nama</td><td>${o.nama}</td></tr>
          <tr><td style="color:#8a7a68;">Kontak</td><td>${o.kontak}</td></tr>
          <tr><td style="color:#8a7a68;">Jenis</td><td>${o.jenis}</td></tr>
          <tr><td style="color:#8a7a68;">Ukuran</td><td>${o.ukuran||'—'}</td></tr>
          <tr><td style="color:#8a7a68;">Bahan</td><td>${o.bahan||'—'}</td></tr>
          <tr><td style="color:#8a7a68;">Warna</td><td>${o.warna||'—'}</td></tr>
          <tr><td style="color:#8a7a68;">Model</td><td>${o.model||'—'}</td></tr>
          <tr><td style="color:#8a7a68;">Catatan</td><td>${o.catatan||'—'}</td></tr>
          <tr><td style="color:#8a7a68;">File Referensi</td><td>${o.gambarRef||'Tidak ada'}</td></tr>
        </table>`;
      detailModal.classList.add('open');
    }
    if(btn.dataset.act === 'del' && o){
      if(!confirm(`Hapus pesanan dari "${o.nama}"?`)) return;
      mmSaveOrders(orders.filter(x=>x.id!==o.id));
      draw();
      mmToast('Pesanan dihapus.');
    }
  });

  detailModal.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click', ()=>detailModal.classList.remove('open')));
}

/* ---------- Pengaturan Info Usaha ---------- */
function mmInitPengaturanPage(){
  const form = document.getElementById('pengaturan-form');
  const info = mmGetInfo();
  Object.keys(info).forEach(key=>{
    const el = form.elements[key];
    if(!el) return;
    if(el.type === 'checkbox') el.checked = !!info[key];
    else el.value = info[key];
  });

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const fd = new FormData(form);
    const updated = { ...info };
    for(const key of Object.keys(info)){
      const el = form.elements[key];
      if(!el) continue;
      updated[key] = el.type === 'checkbox' ? el.checked : fd.get(key);
    }
    mmSaveInfo(updated);
    mmToast('Info usaha berhasil disimpan.');
  });
}
