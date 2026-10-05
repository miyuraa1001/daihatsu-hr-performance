# PRD: D-PERFORM — Daihatsu HR Performance Dashboard

> **Document Status:** Draft v1.0  
> **Last Updated:** Oktober 2026  
> **Product Owner:** HR DSO Lampung  
> **Platform:** Web Application

---

## 1. Executive Summary

D-PERFORM adalah platform monitoring kinerja SDM berbasis web yang dirancang khusus untuk operasional **Astra Daihatsu Sales Operation (DSO) Lampung**. Platform ini memungkinkan Kepala Cabang (Kacab) dan Administrator HR untuk memantau, menganalisis, dan mengevaluasi data karyawan secara real-time dalam satu dasbor terintegrasi, sebagai acuan objektif dalam proses **Penilaian Berbasis Kinerja (PBK)**.

---

## 2. Problem Statement

### 2.1 Tantangan yang Dihadapi

- Data karyawan, absensi, SS, QCC, SP, dan KM tersebar di file Excel terpisah yang sulit dikonsolidasi.
- Kepala Cabang tidak memiliki visibilitas real-time terhadap performa tim.
- Proses PBK (Penilaian Berbasis Kinerja) membutuhkan data dari banyak sumber yang memakan waktu.
- Tidak ada sistem terpusat untuk memantau karyawan potensi resign.
- Administrator HR kesulitan mengelola data multi-cabang secara efisien.

### 2.2 Solusi

Platform D-PERFORM mengkonsolidasikan semua data dari file Excel SAP dan operasional ke dalam satu dasbor yang dapat diakses secara web, dengan kontrol akses berbasis peran.

---

## 3. Target Users

### 3.1 Administrator HR (Admin)

- **Akses:** Semua cabang, semua data (termasuk karyawan resign)
- **Tugas Utama:** Upload data Excel, manajemen karyawan, monitoring multi-cabang, review karyawan resign
- **Kebutuhan:** CRUD operations, export data, notifikasi resign review

### 3.2 Kepala Cabang (User)

- **Akses:** Cabang sendiri saja, hanya karyawan aktif
- **Tugas Utama:** Monitoring performa tim, persiapan PBK, evaluasi absensi dan disiplin
- **Kebutuhan:** Dashboard ringkasan, filter berdasarkan periode, export data untuk laporan

---

## 4. Feature Requirements

### 4.1 Dashboard Utama
**Prioritas:** P0 — Must Have

| ID | Fitur | Deskripsi |
|---|---|---|
| D-01 | KPI Summary Cards | 6 kartu KPI: Master Karyawan, Absensi, SS, QCC, SP, KM |
| D-02 | Daftar Karyawan Cabang | Tabel ringkasan dengan sticky columns No/NPK/Nama |
| D-03 | Tabel Rekap Kinerja (PBK) | Rekapitulasi data objektif untuk acuan PBK |
| D-04 | Filter Cabang | Dropdown filter cabang (Admin only) |
| D-05 | Filter Periode | Filter bulan dan tahun data |
| D-06 | Greeting Kontekstual | Sapaan dinamis berdasarkan user dan periode aktif |
| D-07 | Sidebar Kesiapan Data | Widget readiness score 12 bulan menuju PBK akhir tahun |

### 4.2 Master Karyawan
**Prioritas:** P0 — Must Have

| ID | Fitur | Deskripsi |
|---|---|---|
| MK-01 | Struktur Hirarki 3 Pilar DSO | Visualisasi komposisi Sales, Service, Admin dengan donut chart |
| MK-02 | Kartu Statistik Per Pilar | Count, persentase, jabatan kunci per pilar |
| MK-03 | Analitik Rasio | Rasio tenaga penjual vs support, top 4 jabatan terbanyak |
| MK-04 | Status Kepegawaian | Donut chart multi-segmen (Tetap, PKWT, Probation, Magang, dst.) |
| MK-05 | Tabel View + Card View | Toggle antara tampilan tabel data dan tampilan kartu estetik |
| MK-06 | Freeze Column | Kolom No, Nama Karyawan terkunci saat scroll horizontal |
| MK-07 | Filter Pilar | Klik kartu pilar untuk filter tabel/card per divisi |
| MK-08 | Filter Kontrak | Dropdown filter status kepegawaian |
| MK-09 | Mode Kolom Lengkap | Toggle 8 kolom ringkas vs 20 kolom SAP penuh |
| MK-10 | Resign Review | Notifikasi dan modal review karyawan potensi resign (Admin) |
| MK-11 | Upload Data | Upload file Excel (.xlsx) Master Karyawan (Admin) |
| MK-12 | Export Excel | Export tabel ke file .xlsx |

### 4.3 Absensi & Kehadiran
**Prioritas:** P0 — Must Have

| ID | Fitur | Deskripsi |
|---|---|---|
| A-01 | Rekap Per Karyawan | Rekap total hadir, tepat waktu, telat, alpha, % kehadiran, rata-rata jam kerja per karyawan per periode |
| A-02 | Log Harian Mentah | Tampilan baris per hari (raw data dari SAP) dengan 19 kolom |
| A-03 | Freeze Column | No/NPK/Nama terkunci saat scroll horizontal |
| A-04 | Analisis Keterlambatan | Badge status kehadiran: Tepat Waktu / Terlambat X menit / Tanpa Keterangan |
| A-05 | Filter Kepatuhan | Filter: Semua, Tepat Waktu, Terlambat, Alpha, Terlambat >30/60 menit, Jam Kerja <8 jam, Perlu Approval |
| A-06 | Modal Detail Per Karyawan | Tampilan log harian individual per NPK dalam modal popup |
| A-07 | Toggle Mode Rekap/Log | Switch antara rekap agregat per karyawan dan log mentah |

### 4.4 Sumbang Saran (SS)
**Prioritas:** P1 — Should Have

| ID | Fitur | Deskripsi |
|---|---|---|
| SS-01 | KPI Summary | Total usulan, rata-rata per karyawan, kategori terpopuler, status reward |
| SS-02 | Tabel SS | Daftar usulan dengan freeze columns No/NPK/Nama |
| SS-03 | Modal Detail SS | Detail lengkap usulan: tema, fasilitator, reward, AstraPay, administrasi |
| SS-04 | Filter Status Reward | Filter berdasarkan status reward |

### 4.5 Quality Control Circle (QCC)
**Prioritas:** P1 — Should Have

| ID | Fitur | Deskripsi |
|---|---|---|
| QCC-01 | KPI Status Circle | Cards dinamis per status (Finish, Progress, Plan, dll.) |
| QCC-02 | Tabel QCC | Daftar circle dengan freeze columns |
| QCC-03 | Modal Risalah | Detail circle: nama tim, leader, anggota, tema, status PDCA |

### 4.6 Surat Peringatan / SP (Disiplin)
**Prioritas:** P1 — Should Have

| ID | Fitur | Deskripsi |
|---|---|---|
| SP-01 | KPI Summary | Total SP, breakdown per tingkat (Teguran, SP1, SP2, SP3, SPPT) |
| SP-02 | Tabel SP | Daftar catatan sanksi dengan freeze No/NPK/Nama |
| SP-03 | Filter Status | Filter aktif / bersih / per tingkat SP |

### 4.7 Knowledge Management (KM)
**Prioritas:** P2 — Nice to Have

| ID | Fitur | Deskripsi |
|---|---|---|
| KM-01 | KPI Summary | Total dokumen, kontributor aktif, topik terpopuler, % terverifikasi |
| KM-02 | Tabel KM | Daftar dokumen dengan freeze No/NPK/Nama |
| KM-03 | Filter Cabang/Kategori | Multi-filter cabang dan kategori dokumen |
| KM-04 | Upload Rekap Berkas | Import file .xlsx/.csv dengan validasi skema |

### 4.8 Profil Karyawan & PBK Modal
**Prioritas:** P0 — Must Have

| ID | Fitur | Deskripsi |
|---|---|---|
| PBK-01 | Modal Profil Karyawan | Detail lengkap karyawan: foto inisial, jabatan, kontrak, umur, masa kerja |
| PBK-02 | Rekap Data Kinerja | Tab absensi, SS, QCC, SP dalam satu modal |
| PBK-03 | Skor Kesiapan PBK | Indikator kesiapan data untuk penilaian |

### 4.9 Administrasi (Admin Only)
**Prioritas:** P0 — Must Have

| ID | Fitur | Deskripsi |
|---|---|---|
| ADM-01 | Upload Multi-Modul | Upload Excel per modul (Master Karyawan, Absensi, SS, QCC, SP, KM) |
| ADM-02 | Edit Row | Edit baris data langsung dari tabel |
| ADM-03 | Hapus Row | Hapus baris data dengan konfirmasi |
| ADM-04 | Resign Review Workflow | Deteksi & konfirmasi karyawan tidak muncul di upload baru |
| ADM-05 | Export Global | Export semua data per modul ke Excel |

---

## 5. Data Model

### 5.1 Skema Master Karyawan
```
Personnel no. | P.subarea (Cabang) | Wilayah | Contract | Name (Unit Organisasi) |
Name of organizational unit | Job Title | Last name | D.o.birth | Gender text |
Religious denomination | PS group | Lvl | Date (Tgl Bergabung) | P0001-STEXT |
Business area (Kode BA) | Status_Karyawan | Tanggal_Resign | Alasan_Resign
```

### 5.2 Skema Data Kehadiran
```
NPK | Employee Name | Wilayah | Cabang | Date | Date Clock In | Time Clock In |
Date Clock Out | Time Clock Out | Durasi Kerja (Work Hours) | Assigned Work Location |
Need CICO Approval | In Radius Clock In | Location Clock In | In Radius Clock Out |
Location Clock Out | Clock In Source | Clock Out Source | Keterangan
```

### 5.3 Skema Data SS
```
Registrasi | NPK | Nama | Cabang | Kode BA | Bagian | Kategori | Diterima Bulan |
Tema | Keterangan | Fasilitator | NPK Fasilitator | Status Reward | Reward |
No.Akun AstraPay | Nama Akun | Distribusi Reward | No.Berita Acara | No.BPH
```

### 5.4 Skema Data QCC
```
No | No.Registrasi | Nama Tim | Cabang/Departemen | Kode BA | Bagian |
Leader | No.Akun Astrapay QC Leader | Anggota 1-7 | Tema | Status | Fasilitator
```

### 5.5 Skema Data SP
```
NPK | Nama | Kode BA | Cabang | Tingkat SP | Alasan | Tanggal SP
```

### 5.6 Skema Knowledge Management
```
NPK | NAMA | JUDUL | TANGGAL | TIME
```

---

## 6. Non-Functional Requirements

| ID | Kategori | Requirement |
|---|---|---|
| NFR-01 | Performance | Halaman load < 3 detik pada koneksi 4G |
| NFR-02 | Responsiveness | Optimal pada layar laptop (1280px+) dan tablet (768px+) |
| NFR-03 | Accessibility | Tabel mendukung scroll horizontal dengan frozen columns |
| NFR-04 | Data Integrity | Upload Excel divalidasi sesuai skema SAP yang telah ditentukan |
| NFR-05 | Role-Based Access | Kepala Cabang tidak dapat melihat karyawan resign atau cabang lain |
| NFR-06 | Export | Semua tabel dapat diekspor ke format .xlsx |
| NFR-07 | Offline Resilience | UI tetap render meski data kosong (graceful empty states) |

---

## 7. Role-Based Access Control

| Fitur | Admin | Kepala Cabang |
|---|---|---|
| Lihat semua cabang | ✅ | ❌ (cabang sendiri) |
| Lihat karyawan resign | ✅ | ❌ |
| Upload data Excel | ✅ | ❌ |
| Edit / Hapus data | ✅ | ❌ |
| Resign Review workflow | ✅ | ❌ |
| Export data | ✅ | ✅ |
| Akses semua modul | ✅ | ✅ |
| Filter multi-cabang | ✅ | ❌ |

---

## 8. Arsitektur Teknis

### 8.1 Stack Teknologi

| Layer | Teknologi |
|---|---|
| Frontend | HTML5 + Tailwind CSS (CDN) + Vanilla JavaScript (ES6+) |
| Backend | Google Apps Script (proxy endpoint `/api/proxy`) |
| Data Source | Google Sheets (via Apps Script) |
| Export | SheetJS (`xlsx` library) — generate file Excel di sisi klien |
| Icons | Font Awesome 6 (CDN) |
| Hosting | Static hosting (Vercel / GitHub Pages / Firebase Hosting) |

### 8.2 Struktur File

```
daihatsu-hr-performance/
├── index.html                  # Entri utama, semua view HTML (~3300 baris)
├── src/
│   └── js/
│       ├── api.js              # SCHEMAS, global state, formatters, utils
│       ├── dashboard.js        # KPI rendering, dashboard view logic
│       ├── employee.js         # Table/card rendering semua modul (~3100 baris)
│       ├── modals.js           # Modal handlers, renderRowActionCell (~3800 baris)
│       └── navigation.js       # switchView, renderTableHeader, sidebar (~650 baris)
└── PRD.md                      # Dokumen ini
```

### 8.3 State Management

| Variable | Deskripsi |
|---|---|
| `currentDashboardPayload` | Global object, menyimpan semua data dari API |
| `currentDashboardPayload.rawTables.{SheetName}[]` | Raw rows per modul |
| `currentDashboardPayload.employeeList[]` | Processed employee list untuk dashboard |
| `loggedInUser` | Object user yang login, berisi role dan kode cabang |
| `activePilarFilter` | Filter aktif 3 pilar DSO (`'Sales'` / `'Service'` / `'Admin'` / `null`) |
| `currentMKViewMode` | Mode tampilan Master Karyawan: `'table'` atau `'card'` |

### 8.4 Pola Rendering Tabel

Semua tabel modul menggunakan pola yang konsisten:

1. `renderTableHeader(headerId, columns, stickyFirst, actionLabel)` — render `<th>` dengan sticky logic otomatis
2. `tbody.innerHTML = list.map(row => ...)` — render baris data
3. `renderRowActionCell(sheetName, rowIndex, row)` — render sel aksi (Detail / Edit / Hapus)

**Sticky Column Pattern:**

```css
/* <table> wajib pakai ini (bukan border-collapse) */
border-separate border-spacing-0

/* Kolom No */
sticky left-0 bg-white z-10 w-12

/* Kolom NPK */
sticky left-12 bg-white z-10 w-20

/* Kolom Nama (dengan drop shadow kanan) */
sticky left-[128px] bg-white z-10 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.06)]
```

---

## 9. Klasifikasi 3-Pilar DSO

Klasifikasi karyawan menggunakan fungsi `classifyEmployeePilar()` berdasarkan keyword Job Title:

| Pilar | Warna | Jabatan Kunci |
|---|---|---|
| **Sales** | Rose / Merah | Wiraniaga, Sales, VSO, Marketing, Counter, Showroom, Branch Manager |
| **Service** | Biru | Mechanic, Mekanik, Service Advisor, Workshop, Foreman, Teknisi, PDI |
| **Admin** | Amber / Gold | Admin, GA, Finance, Kasir, HR, Logistik, Driver, Security, IT |

> **Priority check:** Admin → Service → Sales (Admin dicek pertama untuk menghindari false positive)

---

## 10. Success Metrics

| Metrik | Target | Cara Ukur |
|---|---|---|
| Waktu persiapan data PBK | Berkurang 70% dibanding manual | Survey Kacab |
| Akurasi data | 100% konsisten dengan data SAP | Audit periodik |
| Adopsi platform | >90% Kacab mengakses rutin setiap bulan | Log akses |
| Waktu respon halaman | < 3 detik | Lighthouse score |
| Kelengkapan data | Semua 6 modul terisi sebelum PBK | Dashboard readiness score |

---

## 11. Roadmap

### Phase 1 — MVP ✅ Selesai

- [x] Dashboard utama dengan 6 KPI cards
- [x] Master Karyawan dengan 3-Pilar DSO (tabel + card view)
- [x] Absensi & Kehadiran (rekap + log mentah)
- [x] Sumbang Saran (SS)
- [x] Quality Control Circle (QCC)
- [x] Surat Peringatan (SP)
- [x] Knowledge Management (KM)
- [x] Role-based access control (Admin vs Kepala Cabang)
- [x] Upload Excel multi-modul
- [x] Export ke Excel (.xlsx)
- [x] Modal Profil Karyawan + rekap PBK
- [x] Sticky freeze columns semua tabel
- [x] Card view interaktif dengan tema 3 pilar DSO

### Phase 2 — Enhancement 🔄 Planned

- [ ] Notifikasi push browser (karyawan belum clock-in)
- [ ] Grafik tren kehadiran per bulan (line chart)
- [ ] Perbandingan performa antar cabang (Admin view)
- [ ] Import template Excel otomatis dari SAP
- [ ] Digital signature untuk pengesahan dokumen PBK

### Phase 3 — Integration 🔮 Future

- [ ] Integrasi langsung dengan SAP HR module (real-time sync)
- [ ] Mobile-responsive PWA dengan offline mode
- [ ] API publik untuk integrasi sistem HR DSO pusat
- [ ] Notifikasi email otomatis untuk deadline PBK

---

## 12. Constraints & Assumptions

- Data bersumber dari **export manual** sistem SAP HR — tidak ada integrasi real-time dengan SAP.
- Backend menggunakan Google Apps Script dengan batas kuota API Google (6 juta request/hari).
- Semua kode berjalan di sisi klien (browser) — tidak ada server-side processing selain Google Apps Script.
- File Excel yang diupload **harus sesuai** dengan skema kolom yang ditentukan dalam `SCHEMAS` di `api.js`.
- Sistem dioptimalkan untuk penggunaan di **browser desktop/laptop** (Chrome, Edge) dengan resolusi minimum 1280px.
- Tidak ada penyimpanan data permanen di sisi klien — semua data di-fetch ulang saat reload.

---

*Dokumen ini dibuat berdasarkan analisis kode sumber D-PERFORM versi Oktober 2026.*  
*Repository: [github.com/miyuraa1001/daihatsu-hr-performance](https://github.com/miyuraa1001/daihatsu-hr-performance)*
