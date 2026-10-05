# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# D-PERFORM — DAIHATSU HR PERFORMANCE DASHBOARD

| Metadata | Spesifikasi |
|---|---|
| **Nama Produk** | D-PERFORM (Daihatsu HR Performance Monitoring & PBK Analytics) |
| **Versi Dokumen** | 2.0 (Spesifikasi Teknis & Fungsional Detail) |
| **Status Dokumen** | **Disetujui / Baseline Produksi** |
| **Tanggal Pembaruan** | Oktober 2026 |
| **Entitas Bisnis** | PT Astra International Tbk – Astra Daihatsu Sales Operation (DSO) Wilayah Lampung |
| **Target Pengguna** | HR Administrator (Wilayah Lampung) & Kepala Cabang (Kacab / Branch Manager) |
| **Platform / Lingkungan** | Web Application (Desktop First, Tablet & Mobile Responsive) |
| **Repositori Kode** | `https://github.com/miyuraa1001/daihatsu-hr-performance` |

---

## 1. LATAR BELAKANG & TUJUAN BISNIS

### 1.1 Konteks Organisasi
Operasional Astra Daihatsu Sales Operation (DSO) Wilayah Lampung mengelola 5 cabang resmi yang tersebar di Provinsi Lampung. Setiap akhir semester dan akhir tahun kalender, manajemen melakukan **Penilaian Berbasis Kinerja (PBK)** untuk menentukan evaluasi performa, jenjang karir, penyesuaian kompensasi, dan pembinaan kedisiplinan karyawan.

### 1.2 Masalah Operasional Eksisting
1. **Fragmentasi Data Excel:** Data karyawan berasal dari SAP HR, presensi dari mesin biometric/CICO online, inovasi dari rekap Google Form Sumbang Saran (SS) & Quality Control Circle (QCC), serta sanksi dari berkas Surat Peringatan (SP) yang tersimpan dalam lembar kerja Excel terpisah.
2. **Keterlambatan Konsolidasi PBK:** Proses pengumpulan data membutuhkan waktu hingga 2–3 minggu kerja manual setiap siklus evaluasi.
3. **Ketidaksesuaian Hak Akses (Data Leakage):** Kepala Cabang berisiko melihat data cabang lain atau data sensitif karyawan yang telah mengundurkan diri (resign/PHK).
4. **Kurangnya Visibilitas Harian:** Tidak adanya dasbor terpadu untuk memantau absensi keterlambatan (>08:00 WIB), ketidakhadiran (alpha/mangkir), dan partisipasi kaizen.

### 1.3 Solusi: Platform D-PERFORM
D-PERFORM menyediakan single-source-of-truth terpadu yang memadukan automasi impor berkas SAP/Excel, filtering multi-cabang berbasis RBAC ketat, visualisasi 3-Pilar DSO (Sales, Service, Admin), kalkulasi kesiapan data PBK kumulatif 12 bulan, dan mekanisme pembekuan kolom tabel (sticky freeze column).

---

## 2. RUANG LINGKUP & CAKUPAN CABANG RESMI

Sistem secara ketat mengunci pemrosesan data hanya untuk **5 Cabang Resmi DSO Lampung**:

| Kode BA (SAP) | Kode Numerik | Nama Cabang | Alias / Identifikasi String |
|---|---|---|---|
| **D660** | `660` | Lampung A Yani | `ayani`, `a. yani`, `ahmad yani`, `tanjung karang`, `tjk`, `bandar lampung`, `kedaton` |
| **D661** | `661` | Lampung S Hatta | `shatta`, `s. hatta`, `soekarno hatta`, `by pass`, `bypass` |
| **D662** | `662` | Bandarjaya | `bandarjaya`, `bandar jaya`, `bdj`, `lampung tengah`, `lamteng` |
| **D663** | `663` | Lampung Utara | `lampung utara`, `lamut`, `kotabumi`, `kota bumi`, `ktb` |
| **D664** | `664` | Lampung Timur | `lampung timur`, `lamtim`, `sukadana` |

> **Aturan Bisnis Cabang:**
> - Seluruh modul (Master Karyawan, Presensi, SS, QCC, SP) memvalidasi kolom `Business area` / `Kode BA` / `P.subarea` terhadap daftar di atas.
> - Data Knowledge Management (KM) adalah repositori pengetahuan terbuka lintas cabang wilayah Lampung.

---

## 3. USER PERSONA & ROLE-BASED ACCESS CONTROL (RBAC)

### 3.1 Matriks Peran Pengguna

| Dimensi | Administrator HR (`role: 'admin'`) | Kepala Cabang (`role: 'user'` / `'kacab'`) |
|---|---|---|
| **Cakupan Cabang** | Seluruh cabang (`D660` s/d `D664` dan opsi `'ALL'`) | Terkunci khusus pada 1 kode cabang yang ditugaskan |
| **Status Karyawan** | Dapat melihat Karyawan Aktif dan Karyawan Resign/PHK | **Hanya Karyawan Aktif** (karyawan resign disaring otomatis) |
| **Aksi Tulis (Write/Mutate)** | Upload Excel, Tambah Data, Edit Nilai, Hapus Baris | Read-only (hanya melihat dan menganalisis) |
| **Resign Review Workflow** | Berhak menerima alert, memvalidasi & menetapkan status resign | Tidak memiliki akses ke modal atau banner resign review |
| **Filter Dropdown Cabang** | Aktif & dapat dipilih (`enabled`) | Terkunci pada cabang bersangkutan (`disabled / read-only`) |
| **Ekspor Data** | Dapat mengekspor data seluruh cabang atau per cabang | Dapat mengekspor data cabangnya sendiri ke format `.xlsx` |

---

## 4. SPESIFIKASI SKEMA DATA DATABASE (100% IDENTIK SAP & EXCEL)

Sistem menggunakan skema kolom baku yang dinormalisasi dengan toleransi alias header (case-insensitive, spasi/karakter khusus diabaikan).

### 4.1 Master Karyawan (`Master_Karyawan`) — 19 Kolom Baku
```
1. Personnel no.           (NPK / NIK SAP, format string numerik)
2. P.subarea               (Nama Cabang Operasional)
3. Wilayah                 (Wilayah Operasional, e.g. DSO Lampung)
4. Contract                (Status Hubungan Kerja: Tetap / Kontrak / Probation / Magang)
5. Name                    (Unit Organisasi / Divisi Induk)
6. Name of organizational unit (Departemen Spesifik SAP)
7. Job Title               (Jabatan Fungsional)
8. Last name               (Nama Lengkap Karyawan)
9. D.o.birth               (Tanggal Lahir, format YYYY-MM-DD / DD.MM.YYYY)
10. Gender text            (Jenis Kelamin: Male / Female / Pria / Wanita)
11. Religious denomination (Agama: Islam / Kristen / Katholik / Hindu / Buddha)
12. PS group               (Golongan / Pangkat SAP, e.g. I, II, III, IV)
13. Lvl                    (Level Hierarki Organisasi)
14. Date                   (Tanggal Efektif Bergabung / TMT)
15. P0001-STEXT            (Deskripsi Struktur Posisi SAP)
16. Business area          (Kode Business Area, e.g. D660)
17. Status_Karyawan        (Status: 'Aktif' atau 'Resign')
18. Tanggal_Resign         (Tanggal Efektif Berhenti Kerja)
19. Alasan_Resign          (Alasan PHK / Pengunduran Diri Resmi PPHK)
```

### 4.2 Data Kehadiran / Presensi (`Data_Kehadiran`) — 19 Kolom Baku
```
1. NPK                     (Nomor Pokok Karyawan)
2. Employee Name           (Nama Karyawan)
3. Wilayah                 (Wilayah Penugasan)
4. Cabang                  (Nama Cabang)
5. Date                    (Tanggal Absensi, YYYY-MM-DD)
6. Date Clock In           (Tanggal Presensi Masuk)
7. Time Clock In           (Jam Presensi Masuk, format HH:MM:SS)
8. Date Clock Out          (Tanggal Presensi Keluar)
9. Time Clock Out          (Jam Presensi Keluar, format HH:MM:SS)
10. Durasi Kerja (Work Hours) (Total Jam Kerja Efektif, default normal: 8.5 jam)
11. Assigned Work Location (Lokasi Kerja Resmi Terdaftar)
12. Need CICO Approval     (Status Approval Presensi Khusus)
13. In Radius Clock in     (Validasi Geofencing Presensi Masuk: TRUE/FALSE)
14. Location Clock In      (Koordinat Lat/Long Presensi Masuk)
15. In Radius Clock Out    (Validasi Geofencing Presensi Keluar: TRUE/FALSE)
16. Location Clock Out     (Koordinat Lat/Long Presensi Keluar)
17. Clock In Source        (Perangkat Presensi Masuk: Mobile CICO / Biometric)
18. Clock Out Source       (Perangkat Presensi Keluar: Mobile CICO / Biometric)
19. Keterangan             (Catatan Presensi / Status Izin / Cuti)
```

### 4.3 Sumbang Saran (`Data_SS`) — 21 Kolom Baku
```
1. No                      (Nomor Urut)
2. Registrasi              (Nomor Registrasi SS)
3. Nama                    (Inovator / Pengusul)
4. NPK                     (NPK Pengusul)
5. Wilayah                 (Wilayah)
6. Cabang                  (Cabang)
7. Kode BA                 (Business Area)
8. Bagian                  (Seksi / Departemen Pengusul)
9. Tema                    (Judul Ide Perbaikan / Kaizen)
10. Fasilitator            (Nama Fasilitator Pembimbing)
11. NPK Fasilitator        (NPK Fasilitator)
12. Diterima Bulan         (Periode Bulan Pengajuan)
13. Kategori               (Kategori SS: Q / C / D / S / M / E)
14. No.Akun AstraPay       (Nomor Akun Dompet Digital AstraPay)
15. Nama Akun              (Nama Terdaftar di AstraPay)
16. Status Reward          (Status Pencairan: IBRA / Lunas / Menunggu / Evaluasi)
17. Reward                 (Nominal Hadiah Penghargaan Rupiah)
18. No.Berita Acara        (Nomor BA Verifikasi)
19. No.BPH                 (Nomor Berkas Pembayaran Hadiah)
20. Distribusi Reward      (Status Distribusi Reward)
21. Keterangan             (Catatan Evaluasi Ide)
```

### 4.4 Quality Control Circle (`Data_QCC`) — 29 Kolom Baku
```
1. No                      (Nomor Urut)
2. No.Registrasi           (Nomor Registrasi Circle)
3. Nama Tim                (Nama Circle Kaizen)
4. Wilayah/Divisi          (Divisi Operasional)
5. Cabang/Departemen       (Cabang Lokasi Circle)
6. Kode BA                 (Business Area)
7. Bagian                  (Departemen)
8. Fasilitator             (Nama Fasilitator)
9. Leader                  (Ketua Circle)
10 s/d 16. Anggota 1 s/d Anggota 7 (Daftar 7 Anggota Tim)
17. Tema                   (Tema Kaizen PDCA)
18. Kategori               (Kategori Inovasi Circle)
19. Status                 (Tahapan PDCA: Plan / Do / Check / Action / Finish)
20. No.Akun Astrapay QC Leader (Nomor AstraPay Ketua Circle)
21. Pendaftaran diterima   (Tanggal Registrasi Diterima)
22. L 1-8 diterima         (Status Penerimaan Risalah Lengkap Langkah 1-8)
23. Langkah 1-3            (Status Validasi Analisis Masalah)
24. Langkah 1-5            (Status Validasi Perbaikan Masalah)
25. No.Berita Acara        (Nomor Berita Acara Konvensi)
26. Status Reward          (Status Realisasi Hadiah)
27. No.BPH                 (Nomor BPH)
28. Tahun Konvensi         (Tahun Konvensi Mutu)
29. Kelengkapan Risalah Langkah 1-8 (Indikator Dokumen Risalah Lengkap)
```

### 4.5 Surat Peringatan (`Data_SP`) — 5 Kolom Baku
```
1. NPK                     (NPK Karyawan yang Dikenakan Sanksi)
2. Nama                    (Nama Lengkap Karyawan)
3. Kode BA                 (Business Area Lokasi Kejadian)
4. Tingkat SP              (Teguran / SP 1 / SP 2 / SP 3 / SPPT)
5. Alasan                  (Pelanggaran SOP / Disiplin Kerja)
```

### 4.6 Knowledge Management (`Knowledge_management`) — 5 Kolom Baku
```
1. NPK                     (NPK Kontributor)
2. NAMA                    (Nama Kontributor Pengetahuan)
3. JUDUL                   (Judul Modul / Materi Sharing / Best Practice)
4. TANGGAL                 (Tanggal Unggah / Presentasi)
5. TIME                    (Waktu Sesi Sharing)
```

---

## 5. FORMULA & LOGIKA BISNIS SPESIFIK

### 5.1 Klasifikasi 3-Pilar DSO (`classifyEmployeePilar()`)
Karyawan dikelompokkan ke dalam 3 pilar operasional melalui evaluasi berurutan (*priority checking*):

```
Tingkat Prioritas 1: ADMIN & SUPPORT
Jika teks (Job Title + P0001-STEXT + Unit Organisasi) memuat:
['admin', 'general affair', ' ga', 'ga ', 'finance', 'keuangan', 'accounting',
 'akuntansi', 'cashier', 'kasir', 'hr', 'personalia', 'it ', 'information tech',
 'logistik', 'driver', 'office boy', 'security']
→ Hasil: 'Admin' (Palette: Amber/Gold, CSS: amber-500)

Tingkat Prioritas 2: SERVICE & WORKSHOP
Jika teks memuat:
['mechanic', 'mekanik', 'service advisor', 'sa', 'workshop head', 'workshop',
 'foreman', 'teknisi', 'technician', 'toolman', 'partman', 'bengkel', 'pdi', 'body repair']
dan tidak memuat kata kunci 'sales'
→ Hasil: 'Service' (Palette: Blue, CSS: blue-500)

Tingkat Prioritas 3: SALES & MARKETING
Jika teks memuat:
['sales', 'wiraniaga', 'counter', 'marketing', 'vso', 'showroom', 'supervisor',
 'spv', 'branch manager', 'kepala cabang']
→ Hasil: 'Sales' (Palette: Rose/Red, CSS: rose-500)

Fallback: 'Admin'
```

### 5.2 Formula Keterlambatan Presensi (`calculateLatenessInfo()`)
- **Ambang Batas Masuk Normal:** Pukul `08:00:00 WIB` (Jam 8, Menit 0).
- **Penanganan Epoch Excel / Timezone:** Nilai serial float Excel atau string ISO UTC dari Google Apps Script dikonversi ke Waktu Indonesia Barat (WIB = UTC+7 dengan penambahan offset +420 menit).
- **Aturan Evaluasi:**
  1. **Tepat Waktu:** Jam Clock In $\le 08:00:00$. (Badge: Hijau `bg-emerald-50 text-emerald-700`).
  2. **Terlambat $\le 30$ Menit:** $08:00 < \text{Clock In} \le 08:30$. (Badge: Kuning `bg-amber-50 text-amber-700`).
  3. **Terlambat Berat ($> 30$ Menit):** $\text{Clock In} > 08:30$. (Badge: Merah `bg-rose-50 text-rose-700`).
  4. **Tanpa Keterangan / Alpha:** Nilai waktu kosong, `0.00.00`, string `1899-12-30`, atau memuat kata `'alpa'`, `'alpha'`, `'mangkir'`, `'belum clock in'`.
- **Tingkat Kehadiran Karyawan:**
$$\text{Kehadiran (\%)} = \frac{\text{Total Hari Hadir} - \text{Total Telat} - \text{Total Alpha}}{\text{Total Hari Hadir}} \times 100\%$$

### 5.3 Formula Skor Kesiapan PBK Kumulatif 12 Bulan (`updateSidebarReadiness()`)
Penilaian Berbasis Kinerja (PBK) membutuhkan data 12 bulan penuh (Januari s/d Desember):
1. **Analisis Bulan Presensi:** Sistem memindai `Data_Kehadiran` pada tahun evaluasi dan menghitung jumlah bulan unik yang memiliki rekaman presensi ($M_{\text{absensi}} \in [0, 12]$).
2. **Kalkulasi Skor:**
$$\text{Skor Kesiapan (\%)} = \min\left(100, \text{round}\left(\frac{M_{\text{absensi}}}{12} \times 100\right)\right)$$
3. **Status Indikator UI:**
   - **Skor = 100%:** *"Data Siap Diambil"* (Titik hijau berkedip, status siap generate PBK).
   - **0% < Skor < 100%:** *"Progres PBK: $M_{\text{absensi}}$/12 Bln"* (Titik kuning berkedip).
   - **Skor = 0%:** *"Data Belum Terkumpul"* (Titik merah berkedip).

### 5.4 Standar Alasan PHK/Resign & Dokumen Lampiran PPHK (SOP ADM)
Ketika Admin menetapkan seorang karyawan menjadi 'Resign', sistem mewajibkan pemilihan alasan baku beserta lampiran dokumen pembuktian:

| No | Alasan Resmi PHK / Resign | Dokumen Lampiran Wajib (PPHK ADM) |
|---|---|---|
| 1 | Gagal Masa Percobaan | Form Evaluasi Karyawan |
| 2 | Mengundurkan Diri | Surat Pengunduran Diri Karyawan |
| 3 | Dikualifikasikan Mengundurkan Diri | Tanda Terima Surat Pemanggilan 1 & 2 + Surat Pemberitahuan PPHK |
| 4 | Berakhirnya Hubungan Kerja Waktu Tertentu | Form Evaluasi Karyawan |
| 5 | Sakit Berkepanjangan | Surat Rekomendasi Dokter + Surat Pemberitahuan PPHK |
| 6 | Meninggal Dunia | Surat Kematian |
| 7 | Karyawan Ditahan Pihak Berwajib | Surat Putusan Pengadilan / Penahanan + Surat Pemberitahuan PPHK |
| 8 | Gagal Target Sales | Form Evaluasi Karyawan |
| 9 | Pelanggaran Tata Tertib Kerja | Berkas SP 1/2/3, Perjanjian Bersama & Risalah Perundingan Bipartit |
| 10 | Alasan Mendesak | Perjanjian Bersama & Risalah Perundingan Bipartit |

### 5.5 Workflow Deteksi Resign Review Otomatis
1. Saat Admin mengunggah berkas Excel Master Karyawan baru, sistem membandingkan NPK di berkas baru dengan NPK aktif di database saat ini.
2. Jika ada NPK yang sebelumnya berstatus `Aktif` namun tidak ditemukan pada berkas unggahan baru, sistem **tidak menghapusnya secara otomatis**.
3. Sistem memunculkan **Banner Notifikasi Resign Review** di bagian atas halaman dengan tombol interaktif:
   - *Konfirmasi Resign:* Membuka modal input tanggal efektif keluar, alasan PPHK resmi, dan verifikasi dokumen pendukung.
   - *Tetap Pertahankan:* Menandai karyawan tetap aktif (mengabaikan selisih file).

---

## 6. SPESIFIKASI ANTARMUKA & DESAIN SISTEM TABEL

### 6.1 Arsitektur Pembekuan Kolom (Sticky Freeze Columns)
Untuk memastikan pengguna dapat mengenali identitas karyawan saat melakukan *horizontal scrolling* pada layar beresolusi laptop (1366px/1440px), seluruh tabel menerapkan standar koordinat sticky:

| Posisi Kolom | Elemen | Kelas Tailwind / Gaya CSS Wajib | Offset Koordinat |
|---|---|---|---|
| **Kolom 1** | Nomor Urut (`No`) | `sticky left-0 bg-white z-10 w-12 text-center` | $0\text{px}$ |
| **Kolom 2** | Nomor Identitas (`NPK`) | `sticky left-12 bg-white z-10 w-20 font-mono font-bold` | $48\text{px}$ |
| **Kolom 3** | Nama Karyawan (`Nama`) | `sticky left-[128px] bg-white z-10 min-w-[170px] shadow-[4px_0_10px_-2px_rgba(0,0,0,0.06)]` | $128\text{px}$ |
| **Header Thead** | Seluruh Header Sticky | `sticky bg-slate-100 z-30 font-bold border-b border-slate-200` | Sesuai offset di atas |

> **Ketentuan Kritis Rendering Sticky:**
> Tag `<table>` **wajib** menggunakan kelas `border-separate border-spacing-0` (bukan `border-collapse`). Mode `border-collapse` menonaktifkan rendering `position: sticky` pada browser engine modern (Chromium/WebKit). Setiap sel `<td>` harus menyertakan `border-b border-slate-100`.

### 6.2 Mode Tampilan Ganda Master Karyawan
Pengguna dapat memilih dua mode tampilan:
1. **Mode Tabel (Data Grid):**
   - Mendukung toggle **Mode Ringkas (8 Kolom)** vs **Mode SAP Penuh (19 Kolom)**.
   - Dilengkapi filter chip cepat: Filter Pilar (Sales / Service / Admin), Filter Jabatan Populer, dan Filter Status Kepegawaian (Tetap / PKWT / Probation / Magang).
2. **Mode Kartu (Interactive Card View):**
   - Kartu 3D responsif beraksen warna dinamis sesuai pilar (Rose untuk Sales, Blue untuk Service, Amber untuk Admin).
   - Efek interaksi: *Hover lift transition* (`hover:-translate-y-1 hover:shadow-md`).
   - Informasi terpadu: Avatar inisial nama, badge jabatan, NPK, masa kerja & umur dinamis, status kontrak, dan tombol aksi detail.

---

## 7. ARSITEKTUR TEKNIS & INTEGRASI DATA

### 7.1 Tech Stack
- **Antarmuka Pengguna (Frontend):** Pure Vanilla JavaScript (ES6+), HTML5 Semantik, Tailwind CSS (CDN), Font Awesome 6 Pro icons.
- **Komponen Grafis:** Donut Chart SVG native (ringan, tanpa dependensi library eksternal berat).
- **Mesin Ekspor/Impor Spreadsheet:** SheetJS (`xlsx.full.min.js`) yang memproses file Excel secara penuh di sisi peramban klien.
- **Backend / API Gateway:** Node.js Express Reverse Proxy (`/api/proxy`) yang meneruskan request ke Google Apps Script Web App.
- **Penyimpanan Primer:** Google Sheets Database (Worksheet terpisah untuk tiap tabel skema).
- **Penyimpanan Lokal Sementara:** `localStorage` browser untuk menyimpan mutasi baris lokal (*optimistic UI updates*) agar tidak hilang saat refresh halaman (F5).

### 7.2 Struktur Berkas Proyek
```
daihatsu-hr-performance/
├── api/
│   └── proxy.js                # Serverless API proxy ke Apps Script
├── src/
│   └── js/
│       ├── api.js              # SCHEMAS, alias mapping, konstanta cabang, date/time formatters
│       ├── dashboard.js        # Kalkulasi metrik agregat, KPI cards, SVG charts, data store
│       ├── employee.js         # Rendering tabel & kartu modul (MK, Absensi, SS, QCC, SP, KM, PBK)
│       ├── modals.js           # Kontrol modal (detail, edit, tambah, konfirmasi resign, import)
│       └── navigation.js       # Pengendali view switcher, filter cabang/periode, sidebar readiness
├── index.html                  # Single-Page Application (SPA) container
└── PRD.md                      # Dokumen Kebutuhan Produk (Dokumen ini)
```

---

## 8. PERSYARATAN NON-FUNGSIONAL (NFR)

1. **Kecepatan & Kinerja (Performance):**
   - Waktu initial rendering dashboard $< 2.5$ detik pada koneksi internet standar (10 Mbps).
   - Filtering data berbasis klien (client-side search/filter) merespons seketika dalam tempo $< 150\text{ ms}$ untuk dataset hingga 1.000 baris.
2. **Integritas & Toleransi Format Data (Data Resilience):**
   - Parser tanggal mampu mendeteksi format ISO (`YYYY-MM-DD`), format lokal (`DD.MM.YYYY`, `DD/MM/YYYY`), serial numerik Excel, maupun string 6/8 digit (`15051995`).
   - Tanggal kosong sistem SAP (`1899-12-30`, `0.00.00`, atau `0`) wajib ditampilkan sebagai tanda hubung (`-`) atau string kosong, bukan tanggal error.
3. **Keamanan & Isolasi Data:**
   - Sesi pengguna Kepala Cabang dilarang menerima mutasi payload cabang lain.
   - Sanitasi data wajib mengeliminasi data non-Lampung saat payload dimuat di browser.
4. **Kompatibilitas Tampilan:**
   - Kompatibel penuh pada peramban Google Chrome (v100+), Microsoft Edge (v100+), Mozilla Firefox, dan Safari desktop.

---

## 9. RENCANA PENGEMBANGAN (ROADMAP)

### Tahap 1: Produksi Aktif (Selesai — v1.0 & v2.0)
- [x] Dasbor KPI 6 Modul Utama.
- [x] Master Karyawan dengan visualisasi 3-Pilar DSO & Card View Interaktif.
- [x] Rekap & Log Harian Presensi dengan deteksi keterlambatan >08:00 WIB.
- [x] Modul Inovasi Kaizen (SS & QCC) dan Disiplin (SP).
- [x] Repositori Knowledge Management (KM).
- [x] Sticky Freeze Columns seragam (No, NPK, Nama) pada seluruh tabel.
- [x] RBAC ketat (Admin HR vs Kepala Cabang) dan Proteksi Karyawan Resign.
- [x] Workflow Resign Review berbasis SOP PPHK Astra Daihatsu Motor.
- [x] Ekspor Spreadsheet (.xlsx) berbasis SheetJS.

### Tahap 2: Peningkatan Analitik (Q1 2027)
- [ ] Export Laporan Rekap PBK otomatis ke template resmi format PDF / Print-Ready.
- [ ] Grafik tren keterlambatan presensi bulanan (Multi-Line Chart).
- [ ] Integrasi webhook notifikasi harian WhatsApp / Email untuk presensi staf yang mangkir.

### Tahap 3: Automasi Tingkat Lanjut (Q3 2027)
- [ ] Konektor API langsung ke SAP HR SuccessFactors (mengurangi unggah Excel manual).
- [ ] Modul tanda tangan digital (e-Sign) Berita Acara penilaian PBK oleh Kepala Cabang.

---

*Dokumen ini merupakan acuan tunggal arsitektur dan spesifikasi operasional platform D-PERFORM Astra Daihatsu Sales Operation (DSO) Lampung.*
