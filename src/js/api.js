/**
 * D-PERFORM - API & Global Utilities
 * Konfigurasi API Proxy, Skema Database, Konstanta Cabang, dan Formatting
 */

    const BACKEND_PROXY_URL = "/api/proxy";

    // State Global
    let loggedInUser = null;
    let currentDashboardPayload = null;
    let currentView = 'dashboard';

    // ========================================================
    // SKEMA DATABASE BAKU & STANDARISASI EXCEL (100% IDENTIK)
    // ========================================================
    const SCHEMAS = {
      Master_Karyawan: {
        sheetName: "Master_Karyawan",
        title: "Master Karyawan",
        columns: [
          "Personnel no.",
          "P.subarea",
          "Wilayah",
          "Contract",
          "Name",
          "Name of organizational unit",
          "Job Title",
          "Last name",
          "D.o.birth",
          "Gender text",
          "Religious denomination",
          "PS group",
          "Lvl",
          "Date",
          "P0001-STEXT",
          "Business area",
          "Status_Karyawan",
          "Tanggal_Resign",
          "Alasan_Resign"
        ],
        aliases: {
          "personnel no.": ["personnel no.", "personnel no", "npk", "id karyawan", "nik", "id"],
          "p.subarea": ["p.subarea", "subarea", "cabang", "nama cabang"],
          "wilayah": ["wilayah", "region", "area"],
          "contract": ["contract", "kontrak", "status kontrak", "tipe kontrak", "status kepegawaian", "status kepegawaian (contract)", "employment status"],
          "name": ["name", "nama unit organisasi", "unit"],
          "name of organizational unit": ["name of organizational unit", "organizational unit", "organisasi", "departemen", "dept"],
          "job title": ["job title", "jabatan", "posisi", "title"],
          "last name": ["last name", "nama", "nama lengkap", "nama karyawan", "employee name"],
          "d.o.birth": [
            "d.o.birth", "date of birth", "tgl lahir", "tanggal lahir", "dob",
            "birth date", "birthdate", "tgl_lahir", "tanggal_lahir", "tgl. lahir", "birth_date"
          ],
          "gender text": ["gender text", "gender", "jenis kelamin", "jk"],
          "religious denomination": ["religious denomination", "religion", "agama"],
          "ps group": ["ps group", "golongan", "pangkat", "group"],
          "lvl": ["lvl", "level"],
          "date": [
            "date", "entry", "entry date", "tanggal masuk", "tgl masuk", "tanggal gabung",
            "tgl gabung", "join date", "joindate", "effective date", "tanggal", "tgl",
            "mulai kerja", "tgl mulai kerja", "hire date"
          ],
          "p0001-stext": ["p0001-stext", "stext", "deskripsi jabatan", "struktur"],
          "business area": ["business area", "kode ba", "ba", "kode cabang", "ba code"],
          "status_karyawan": ["status_karyawan", "status karyawan", "status kerja", "status aktif", "status keaktifan", "status_keaktifan", "status", "status pegawai", "keterangan status"],
          "tanggal_resign": ["tanggal_resign", "tgl resign", "tgl keluar", "tanggal keluar", "date of resignation", "resign date", "tgl phk", "tanggal phk", "tgl berhenti", "tanggal berhenti"],
          "alasan_resign": ["alasan_resign", "alasan keluar", "alasan", "keterangan resign", "reason of resignation", "alasan phk", "lampiran alasan phk", "alasan pphk"]
        }
      },
      Data_Kehadiran: {
        sheetName: "Data_Kehadiran",
        title: "Data Kehadiran / Absensi",
        columns: [
          "NPK",
          "Employee Name",
          "Wilayah",
          "Cabang",
          "Date",
          "Date Clock In",
          "Time Clock In",
          "Date Clock Out",
          "Time Clock Out",
          "Durasi Kerja (Work Hours)",
          "Assigned Work Location",
          "Need CICO Approval",
          "In Radius Clock in",
          "Location Clock In",
          "In Radius Clock Out",
          "Location Clock Out",
          "Clock In Source",
          "Clock Out Source",
          "Keterangan"
        ],
        aliases: {
          "npk": ["npk", "personnel no.", "id karyawan", "nik"],
          "employee name": ["employee name", "nama", "nama karyawan", "last name"],
          "wilayah": ["wilayah", "region", "area"],
          "cabang": ["cabang", "p.subarea", "subarea", "nama cabang"],
          "date": ["date", "tanggal", "tgl"],
          "date clock in": ["date clock in", "tgl clock in", "tanggal clock in", "tgl masuk"],
          "time clock in": ["time clock in", "jam clock in", "clock in", "jam masuk"],
          "date clock out": ["date clock out", "tgl clock out", "tanggal clock out", "tgl keluar"],
          "time clock out": ["time clock out", "jam clock out", "clock out", "jam pulang"],
          "durasi kerja (work hours)": ["durasi kerja (work hours)", "durasi kerja", "work hours", "jam kerja", "durasi"],
          "assigned work location": ["assigned work location", "work location", "lokasi kerja"],
          "need cico approval": ["need cico approval", "approval cico", "cico approval"],
          "in radius clock in": ["in radius clock in", "radius clock in", "in radius in"],
          "location clock in": ["location clock in", "koordinat in", "lokasi clock in"],
          "in radius clock out": ["in radius clock out", "radius clock out", "in radius out"],
          "location clock out": ["location clock out", "koordinat out", "lokasi clock out"],
          "clock in source": ["clock in source", "source in", "metode clock in"],
          "clock out source": ["clock out source", "source out", "metode clock out"],
          "keterangan": ["keterangan", "status", "notes", "catatan"]
        }
      },
      Data_SS: {
        sheetName: "Data_SS",
        title: "Suggestion System (SS)",
        columns: [
          "No",
          "Registrasi",
          "Nama",
          "NPK",
          "Wilayah",
          "Cabang",
          "Kode BA",
          "Bagian",
          "Tema",
          "Fasilitator",
          "NPK Fasilitator",
          "Diterima Bulan",
          "Kategori",
          "No.Akun AstraPay",
          "Nama Akun",
          "Status Reward",
          "Reward",
          "No.Berita Acara",
          "No.BPH",
          "Distribusi Reward",
          "Keterangan"
        ],
        aliases: {
          "no": ["no", "nomor", "#"],
          "registrasi": ["registrasi", "no.registrasi", "nomor registrasi", "no reg"],
          "nama": ["nama", "nama karyawan", "last name", "employee name"],
          "npk": ["npk", "personnel no.", "id karyawan"],
          "wilayah": ["wilayah", "region"],
          "cabang": ["cabang", "p.subarea"],
          "kode ba": ["kode ba", "business area", "ba"],
          "bagian": ["bagian", "divisi", "departemen", "unit"],
          "tema": ["tema", "judul", "tema ss", "judul ide"],
          "fasilitator": ["fasilitator", "nama fasilitator"],
          "npk fasilitator": ["npk fasilitator", "npk fsl"],
          "diterima bulan": ["diterima bulan", "bulan", "periode", "tgl diterima"],
          "kategori": ["kategori", "bidang", "kategori ss"],
          "no.akun astrapay": ["no.akun astrapay", "no akun astrapay", "astrapay", "no astrapay", "no hp"],
          "nama akun": ["nama akun", "nama akun astrapay", "nama astrapay"],
          "status reward": ["status reward", "status hadiah", "reward status"],
          "reward": ["reward", "hadiah", "nominal reward"],
          "no.berita acara": ["no.berita acara", "no ba", "berita acara"],
          "no.bph": ["no.bph", "bph", "nomor bph"],
          "distribusi reward": ["distribusi reward", "distribusi"],
          "keterangan": ["keterangan", "notes", "catatan", "status"]
        }
      },
      Data_QCC: {
        sheetName: "Data_QCC",
        title: "Quality Control Circle (QCC)",
        columns: [
          "No",
          "No.Registrasi",
          "Nama Tim",
          "Wilayah/Divisi",
          "Cabang/Departemen",
          "Kode BA",
          "Bagian",
          "Fasilitator",
          "Leader",
          "Anggota 1",
          "Anggota 2",
          "Anggota 3",
          "Anggota 4",
          "Anggota 5",
          "Anggota 6",
          "Anggota 7",
          "Tema",
          "Kategori",
          "Status",
          "No.Akun Astrapay QC Leader",
          "Pendaftaran diterima",
          "L 1-8 diterima",
          "Langkah 1-3",
          "Langkah 1-5",
          "No.Berita Acara",
          "Status Reward",
          "No.BPH",
          "Tahun Konvensi",
          "Kelengkapan Risalah Langkah 1-8"
        ],
        aliases: {
          "no": ["no", "nomor", "#"],
          "no.registrasi": ["no.registrasi", "registrasi", "no reg"],
          "nama tim": ["nama tim", "tim", "nama circle", "circle"],
          "wilayah/divisi": ["wilayah/divisi", "wilayah", "divisi", "region"],
          "cabang/departemen": ["cabang/departemen", "cabang", "departemen", "p.subarea"],
          "kode ba": ["kode ba", "business area", "ba"],
          "bagian": ["bagian", "seksi", "unit"],
          "fasilitator": ["fasilitator", "nama fasilitator"],
          "leader": ["leader", "ketua", "circle leader", "nama leader"],
          "anggota 1": ["anggota 1", "member 1"],
          "anggota 2": ["anggota 2", "member 2"],
          "anggota 3": ["anggota 3", "member 3"],
          "anggota 4": ["anggota 4", "member 4"],
          "anggota 5": ["anggota 5", "member 5"],
          "anggota 6": ["anggota 6", "member 6"],
          "anggota 7": ["anggota 7", "member 7"],
          "tema": ["tema", "judul kaizen", "judul qcc", "tema qcc"],
          "kategori": ["kategori", "kategori qcc"],
          "status": ["status", "status circle", "tahapan pdca", "pdca"],
          "no.akun astrapay qc leader": ["no.akun astrapay qc leader", "astrapay leader", "no.akun astrapay", "astrapay"],
          "pendaftaran diterima": ["pendaftaran diterima", "tgl pendaftaran"],
          "l 1-8 diterima": ["l 1-8 diterima", "langkah 1-8 diterima"],
          "langkah 1-3": ["langkah 1-3", "step 1-3"],
          "langkah 1-5": ["langkah 1-5", "step 1-5"],
          "no.berita acara": ["no.berita acara", "no ba"],
          "status reward": ["status reward", "reward status"],
          "no.bph": ["no.bph", "bph"],
          "tahun konvensi": ["tahun konvensi", "tahun", "konvensi"],
          "kelengkapan risalah langkah 1-8": ["kelengkapan risalah langkah 1-8", "risalah", "kelengkapan risalah"]
        }
      },
      Data_SP: {
        sheetName: "Data_SP",
        title: "Surat Peringatan (SP)",
        columns: [
          "NPK",
          "Nama",
          "Kode BA",
          "Tingkat SP",
          "Alasan"
        ],
        aliases: {
          "npk": ["npk", "personnel no.", "id karyawan", "nik"],
          "nama": ["nama", "nama lengkap", "last name", "employee name"],
          "kode ba": ["kode ba", "business area", "ba", "cabang"],
          "tingkat sp": ["tingkat sp", "sp", "status sp", "jenis sp", "sanksi"],
          "alasan": ["alasan", "alasan sp", "pelanggaran", "alasan pelanggaran", "keterangan"]
        }
      },
      Knowledge_management: {
        sheetName: "Knowledge_management",
        title: "Knowledge Management (KM)",
        columns: [
          "NPK",
          "NAMA",
          "JUDUL",
          "TANGGAL",
          "TIME"
        ],
        aliases: {
          "npk": ["npk", "personnel no.", "id karyawan", "nik"],
          "nama": ["nama", "nama karyawan", "nama lengkap", "last name", "employee name", "author"],
          "judul": ["judul", "judul km", "tema", "title", "judul dokumen", "topik", "materi"],
          "tanggal": ["tanggal", "date", "tgl", "tgl submit", "created_at"],
          "time": ["time", "waktu", "jam", "pukul", "timestamp"]
        }
      },
      Data_KM: {
        sheetName: "Knowledge_management",
        title: "Knowledge Management (KM)",
        columns: [
          "NPK",
          "NAMA",
          "JUDUL",
          "TANGGAL",
          "TIME"
        ],
        aliases: {
          "npk": ["npk", "personnel no.", "id karyawan", "nik"],
          "nama": ["nama", "nama karyawan", "nama lengkap", "last name", "employee name", "author"],
          "judul": ["judul", "judul km", "tema", "title", "judul dokumen", "topik", "materi"],
          "tanggal": ["tanggal", "date", "tgl", "tgl submit", "created_at"],
          "time": ["time", "waktu", "jam", "pukul", "timestamp"]
        }
      }
    };
    window.SCHEMAS = SCHEMAS;

    // Mode Kolom (Tampilan Penuh vs Ringkas - Default COMPACT untuk kenyamanan visual)
    const columnViewMode = {
      mk: 'COMPACT',
      abs: 'COMPACT',
      ss: 'COMPACT',
      qcc: 'COMPACT',
      sp: 'COMPACT',
      km: 'COMPACT'
    };
    window.columnViewMode = columnViewMode;

    // ========================================================
    // STANDAR ALASAN PHK / RESIGN & LAMPIRAN DOKUMEN (PPHK ADM)
    // Sesuai Formulir Resmi PPHK PT Astra Daihatsu Motor
    // Kolom 1 = Alasan PHK, Kolom 2 = Lampiran Alasan PHK
    // ========================================================
    const STANDARD_PPHK_REASONS = [
      {
        reason: "Gagal Masa Percobaan",
        attachment: "Form Evaluasi Karyawan"
      },
      {
        reason: "Mengundurkan Diri",
        attachment: "Surat Pengunduran Diri Karyawan"
      },
      {
        reason: "Dikualifikasikan Mengundurkan Diri",
        attachment: "Tanda Terima Surat Pemanggilan 1 & 2 + Surat Pemberitahuan PPHK Kpd Karyawan"
      },
      {
        reason: "Berakhirnya Hubungan Kerja Waktu Tertentu",
        attachment: "Form Evaluasi Karyawan"
      },
      {
        reason: "Sakit Berkepanjangan",
        attachment: "Surat Rekomendasi Dokter + Surat Pemberitahuan PPHK Kpd Karyawan"
      },
      {
        reason: "Meninggal Dunia",
        attachment: "Surat Kematian"
      },
      {
        reason: "Karyawan Di Tahan Oleh Pihak Berwajib",
        attachment: "Surat Putusan Pengadilan / Surat Penahanan + Surat Pemberitahuan PPHK Kpd Karyawan"
      },
      {
        reason: "Gagal Target Sales",
        attachment: "Form Evaluasi Karyawan"
      },
      {
        reason: "Pelanggaran Tata Tertib Kerja",
        attachment: "SP 1/SP 2/SP 3, Perjanjian Bersama & Risalah Perundingan Bipartit"
      },
      {
        reason: "Alasan Mendesak",
        attachment: "Perjanjian Bersama & Risalah Perundingan Bipartit"
      }
    ];

    function getPPHKAttachment(reason) {
      if (!reason || reason === '-') return "-";
      const norm = String(reason).trim().toLowerCase();
      const found = STANDARD_PPHK_REASONS.find(item => {
        const itemNorm = item.reason.toLowerCase();
        return norm === itemNorm || norm.includes(itemNorm) || itemNorm.includes(norm);
      });
      return found ? found.attachment : "Dokumen Pengajuan PPHK Sesuai SOP ADM";
    }
    window.STANDARD_PPHK_REASONS = STANDARD_PPHK_REASONS;
    window.getPPHKAttachment = getPPHKAttachment;

        function lookupEmployeeName(npk) {
      if (!npk) return '';
      const cleanNpk = String(npk).trim();
      if (!cleanNpk || cleanNpk === '-') return '';
      const cleanNum = parseInt(cleanNpk, 10);
      const cleanStripped = cleanNpk.replace(/^0+/, '');

      const sources = [
        window.masterFullPayload?.employeeList,
        currentDashboardPayload?.employeeList,
        window.fullUnscopedPayload?.employeeList,
        window.masterFullPayload?.rawTables?.Master_Karyawan,
        currentDashboardPayload?.rawTables?.Master_Karyawan,
        window.fullUnscopedPayload?.rawTables?.Master_Karyawan
      ];

      for (const src of sources) {
        if (!Array.isArray(src) || !src.length) continue;
        const emp = src.find(e => {
          const eNpk = safeString(e.npk || e['Personnel no.'] || e['NPK']).trim();
          if (!eNpk) return false;
          if (eNpk === cleanNpk) return true;
          if (cleanStripped && eNpk.replace(/^0+/, '') === cleanStripped) return true;
          if (!isNaN(cleanNum) && parseInt(eNpk, 10) === cleanNum) return true;
          return false;
        });
        if (emp) {
          const name = emp.nama || emp['Last name'] || emp['Nama'] || emp['Employee Name'] || '';
          if (name && name !== '-' && name.trim() !== '') return name.trim();
        }
      }
      return '';
    }
    window.lookupEmployeeName = lookupEmployeeName;

    function updateColumnToggleButton(moduleKey) {
      const isFull = columnViewMode[moduleKey] === 'FULL';
      const colCounts = { mk: 19, abs: 20, ss: 21, qcc: 29, sp: 6, km: 6 };
      const compactCounts = { mk: 8, abs: 10, ss: 8, qcc: 8, sp: 6, km: 6 };
      const btn = document.getElementById(`btn-col-toggle-${moduleKey}`);
      const btnText = document.getElementById(`btn-col-text-${moduleKey}`);
      if (btn) {
        const icon = btn.querySelector('i');
        if (isFull) {
          btn.className = "px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95";
          if (icon) icon.className = "fa-solid fa-compress text-[11px]";
          if (btnText) btnText.textContent = `Mode Ringkas (${compactCounts[moduleKey] || 8} Kolom)`;
        } else {
          btn.className = "px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95";
          if (icon) icon.className = "fa-solid fa-table-columns text-[11px]";
          if (btnText) btnText.textContent = `Semua Kolom (${colCounts[moduleKey] || 20})`;
        }
      }
    }

    function toggleColumnMode(moduleKey) {
      columnViewMode[moduleKey] = (columnViewMode[moduleKey] === 'FULL') ? 'COMPACT' : 'FULL';
      updateColumnToggleButton(moduleKey);

      if (moduleKey === 'mk') filterMasterKaryawanTable();
      else if (moduleKey === 'abs') filterAbsensiTable();
      else if (moduleKey === 'ss') filterSSTable();
      else if (moduleKey === 'qcc') filterQCCTable();
      else if (moduleKey === 'sp') filterSPTable();
      else if (moduleKey === 'km') filterKMTable();
    }

    function initAllColumnToggleButtons() {
      ['mk', 'abs', 'ss', 'qcc', 'sp', 'km'].forEach(k => {
        updateColumnToggleButton(k);
      });
    }

    window.toggleColumnMode = toggleColumnMode;
    window.updateColumnToggleButton = updateColumnToggleButton;
    window.initAllColumnToggleButtons = initAllColumnToggleButtons;

    // Filter status cepat karyawan dashboard (Admin only)
    let currentEmployeeStatusFilter = 'ALL';

    function setEmployeeStatusFilter(filter) {
      currentEmployeeStatusFilter = filter || 'ALL';
      const filters = ['all', 'aktif', 'resign'];
      filters.forEach(f => {
        const btn = document.getElementById(`emp-filter-${f}`);
        if (btn) {
          if (f === currentEmployeeStatusFilter.toLowerCase()) {
            btn.className = 'px-2.5 py-1 font-bold rounded-lg bg-white text-slate-800 shadow-xs transition';
          } else {
            btn.className = 'px-2.5 py-1 font-bold rounded-lg text-slate-600 hover:text-slate-900 transition';
          }
        }
      });
      filterEmployeeTable();
    }

    // Normalisasi Header Kolom Excel / CSV
    function normalizeHeaderName(header) {
      if (!header) return "";
      return String(header)
        .replace(/[\r\n]+/g, " ")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
    }

    // Safe Casting Tipe Data
    function safeString(val) {
      if (val === null || val === undefined) return "";
      let s = String(val).trim();
      if (/^[0-9]+(\.[0-9]+)?e\+[0-9]+$/i.test(s)) {
        try {
          s = BigInt(Math.round(Number(val))).toString();
        } catch (e) {}
      }
      return s;
    }

    function parseExcelDate(val) {
      if (!val && val !== 0) return "";
      if (val === null || val === undefined || val === '' || val === '-' || val === 'null' || val === 'undefined') return "";
      const s = String(val).trim();
      if (s === '1899-12-30' || s.startsWith('1899-12-30') || s === '30.12.1899' || s.startsWith('30.12.1899') || s === '30/12/1899' || s === '0' || s === '0.00.00' || s === '00:00:00') {
        return "";
      }
      if (val instanceof Date) {
        if (isNaN(val.getTime()) || val.getFullYear() <= 1899) return "";
        try {
          return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(val);
        } catch (e) {
          const y = val.getFullYear();
          const m = String(val.getMonth() + 1).padStart(2, '0');
          const d = String(val.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
      }
      // Numeric serial (number OR numeric string, e.g. 34567 or "34567")
      const numVal = (typeof val === 'number') ? val : (/^\d{4,5}(\.\d+)?$/.test(s) ? Number(s) : NaN);
      if (!isNaN(numVal) && numVal > 10000 && numVal < 80000) {
        const d = new Date(Math.round((numVal - 25569) * 86400 * 1000));
        if (!isNaN(d.getTime()) && d.getUTCFullYear() > 1899) {
          const y = d.getUTCFullYear();
          const m = String(d.getUTCMonth() + 1).padStart(2, '0');
          const dt = String(d.getUTCDate()).padStart(2, '0');
          return `${y}-${m}-${dt}`;
        }
      }
      // ISO date string with T or Z (e.g. 1995-05-14T17:00:00.000Z from Google Sheets/Apps Script UTC serialization)
      // Disinkronkan dengan zona waktu operasional Indonesia Barat (WIB, UTC+7)
      if (s.includes('T') || s.endsWith('Z')) {
        const d = new Date(s);
        if (!isNaN(d.getTime())) {
          try {
            return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
          } catch (e) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dt = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${dt}`;
          }
        }
      }
      // Plain ISO date string starting with YYYY-MM-DD
      const isoMatch = s.match(/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})$/);
      if (isoMatch) {
        const y = parseInt(isoMatch[1], 10);
        if (y <= 1899) return "";
        const m = String(parseInt(isoMatch[2], 10)).padStart(2, '0');
        const d = String(parseInt(isoMatch[3], 10)).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      // DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY (or with 2-digit year)
      const dmyMatch = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
      if (dmyMatch) {
        const d = String(parseInt(dmyMatch[1], 10)).padStart(2, '0');
        const m = String(parseInt(dmyMatch[2], 10)).padStart(2, '0');
        let y = parseInt(dmyMatch[3], 10);
        if (dmyMatch[3].length === 2) {
          y = y > 50 ? (1900 + y) : (2000 + y);
        }
        if (y <= 1899) return "";
        return `${y}-${m}-${d}`;
      }
      // 8-digit numeric string (DDMMYYYY or YYYYMMDD)
      if (/^\d{8}$/.test(s)) {
        if (s.startsWith('19') || s.startsWith('20')) {
          return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
        } else {
          return `${s.slice(4, 8)}-${s.slice(2, 4)}-${s.slice(0, 2)}`;
        }
      }
      // 6-digit numeric string (DDMMYY)
      if (/^\d{6}$/.test(s)) {
        const d = s.slice(0, 2);
        const m = s.slice(2, 4);
        const yy = parseInt(s.slice(4, 6), 10);
        const y = yy > 50 ? (1900 + yy) : (2000 + yy);
        return `${y}-${m}-${d}`;
      }
      // Date with text month (e.g. 15 Mei 1995, 15 May 1995, 15-Mei-1995)
      const textMonthMatch = s.match(/^(\d{1,2})[\s\-\/\.]([a-zA-Z]+)[\s\-\/\.](\d{2,4})/);
      if (textMonthMatch) {
        const d = String(parseInt(textMonthMatch[1], 10)).padStart(2, '0');
        const mName = textMonthMatch[2].toLowerCase();
        const m = {
          'januari': '01', 'jan': '01', 'january': '01',
          'februari': '02', 'feb': '02', 'february': '02',
          'maret': '03', 'mar': '03', 'march': '03',
          'april': '04', 'apr': '04',
          'mei': '05', 'may': '05',
          'juni': '06', 'jun': '06', 'june': '06',
          'juli': '07', 'jul': '07', 'july': '07',
          'agustus': '08', 'agu': '08', 'agt': '08', 'aug': '08', 'august': '08',
          'september': '09', 'sep': '09',
          'oktober': '10', 'okt': '10', 'oct': '10', 'october': '10',
          'november': '11', 'nov': '11',
          'desember': '12', 'des': '12', 'dec': '12', 'december': '12'
        }[mName];
        if (m) {
          let y = parseInt(textMonthMatch[3], 10);
          if (textMonthMatch[3].length === 2) {
            y = y > 50 ? (1900 + y) : (2000 + y);
          }
          if (y > 1899) return `${y}-${m}-${d}`;
        }
      }
      return "";
    }
    window.parseExcelDate = parseExcelDate;

    // Perhitungan Dinamis Umur Karyawan (Tahun)
    function calculateEmployeeAge(dateVal) {
      if (!dateVal && dateVal !== 0) return "-";
      const isoStr = parseExcelDate(dateVal);
      if (!isoStr || !/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) return "-";
      const parts = isoStr.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (y <= 1899) return "-";

      const today = new Date();
      let years = today.getFullYear() - y;
      let months = (today.getMonth() + 1) - m;
      if (today.getDate() < d) {
        months--;
      }
      if (months < 0) {
        years--;
        months += 12;
      }
      if (years < 0) return "-";
      if (years === 0) return `${months} Bulan`;
      return `${years} Tahun`;
    }

    // Perhitungan Dinamis Masa Kerja Karyawan (Tahun & Bulan)
    function calculateEmployeeTenure(dateVal) {
      if (!dateVal && dateVal !== 0) return "-";
      const isoStr = parseExcelDate(dateVal);
      if (!isoStr || !/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) return "-";
      const parts = isoStr.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (y <= 1899) return "-";

      const today = new Date();
      let years = today.getFullYear() - y;
      let months = (today.getMonth() + 1) - m;
      if (today.getDate() < d) {
        months--;
      }
      if (months < 0) {
        years--;
        months += 12;
      }
      if (years < 0) return "-";
      if (years === 0 && months === 0) return "Baru Bergabung";
      if (years === 0) return `${months} Bulan`;
      if (months === 0) return `${years} Tahun`;
      return `${years} Tahun ${months} Bulan`;
    }

    // Perhitungan Dinamis Umur & Masa Kerja (Backward-Compatible Wrapper)
    function calculateAgeAndService(dateVal, type = 'service') {
      if (type === 'age') return calculateEmployeeAge(dateVal);
      return calculateEmployeeTenure(dateVal);
    }
    window.calculateEmployeeAge = calculateEmployeeAge;
    window.calculateEmployeeTenure = calculateEmployeeTenure;
    window.calculateAgeAndService = calculateAgeAndService;

    function parseExcelTime(val) {
      if (val === null || val === undefined || val === '' || val === '-' || val === 'null' || val === 'undefined') return "";
      const s = String(val).trim();
      if (s === '0.00.00' || s === '00:00:00' || s === '0:00:00' || s === '0.00' || s === '0' || s === '1899-12-30' || s === '30.12.1899' || (s.startsWith('1899-12-30') && !s.includes(':'))) {
        return "0.00.00";
      }
      if (typeof val === 'number') {
        if (val === 0) return "0.00.00";
        const totalSeconds = Math.round(val * 24 * 3600);
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        if (seconds > 0) {
          return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      }
      return s;
    }

    function safeFloat(val, fallback = 0) {
      if (val === null || val === undefined || val === '') return fallback;
      if (typeof val === 'number') return isNaN(val) ? fallback : Math.round(val * 100) / 100;
      const parsed = parseFloat(String(val).replace(',', '.'));
      return isNaN(parsed) ? fallback : Math.round(parsed * 100) / 100;
    }

    // 4 Kategori Baku Status Kepegawaian (Contract) DSO Lampung (Contracters digabung ke Kontrak / PKWT)
    const STANDARD_CONTRACT_CATEGORIES = [
      'Tetap / Permanent',
      'Kontrak / PKWT',
      'On probation',
      'Magang/Intern'
    ];

    function normalizeContractCategory(val) {
      if (!val) return 'Tetap / Permanent';
      const s = String(val).trim().toLowerCase();
      
      if (s.includes('probation') || s.includes('percobaan')) {
        return 'On probation';
      }
      if (s.includes('magang') || s.includes('intern') || s.includes('trainee')) {
        return 'Magang/Intern';
      }
      if (s.includes('contracter') || s.includes('contractor') || s.includes('outsource') || s.includes('vendor') || s.includes('kontrak') || s.includes('pkwt')) {
        return 'Kontrak / PKWT';
      }
      if (s.includes('tetap') || s.includes('permanent') || s.includes('pkwtt') || s === 'p') {
        return 'Tetap / Permanent';
      }
      return String(val).trim();
    }

    // Helper klasifikasi Status Kepegawaian berbasis nilai kolom 'Contract'
    function isTetapContract(val) {
      return normalizeContractCategory(val) === 'Tetap / Permanent';
    }

    function isPKWTContract(val) {
      return normalizeContractCategory(val) === 'Kontrak / PKWT';
    }

    /**
     * Helper universal untuk membaca nilai kolom dari objek database secara presisi tanpa mutasi.
     * Mendukung alias kolom, variasi case-insensitive, camelCase/snake_case tanpa mengubah data asli.
     */
    function getRowCellValue(row, colName, schema = null) {
      if (!row || typeof row !== 'object') return "";

      // 1. Direct key match (jika bernilai valid)
      if (row[colName] !== undefined && row[colName] !== null) {
        const valStr = String(row[colName]).trim();
        if (valStr !== '') return row[colName];
      }

      const normTarget = normalizeHeaderName(colName);
      const keys = Object.keys(row);

      // 2. Case-insensitive key match pada key aktual di baris data
      for (const k of keys) {
        if (normalizeHeaderName(k) === normTarget) {
          const v = row[k];
          if (v !== undefined && v !== null && String(v).trim() !== '') {
            return v;
          }
        }
      }

      // 3. Cek skema aliases jika ada
      const activeSchema = schema || (SCHEMAS.Master_Karyawan.columns.includes(colName) ? SCHEMAS.Master_Karyawan : null);
      const aliases = activeSchema?.aliases?.[normTarget] || SCHEMAS.Master_Karyawan.aliases[normTarget] || [];
      for (const alias of aliases) {
        if (row[alias] !== undefined && row[alias] !== null && String(row[alias]).trim() !== '') {
          return row[alias];
        }
        const normAlias = normalizeHeaderName(alias);
        for (const k of keys) {
          if (normalizeHeaderName(k) === normAlias) {
            const v = row[k];
            if (v !== undefined && v !== null && String(v).trim() !== '') {
              return v;
            }
          }
        }
      }

      // 4. Fallback ke camelCase / snake_case umum database
      const fallbackMap = {
        'personnel no.': ['npk', 'nik', 'id', 'personnelNo', 'personnel_no', 'idKaryawan', 'id_karyawan'],
        'last name': ['nama', 'namaKaryawan', 'nama_karyawan', 'employeeName', 'employee_name', 'name', 'namaLengkap', 'nama_lengkap'],
        'p.subarea': ['cabang', 'pSubarea', 'p_subarea', 'namaCabang', 'nama_cabang', 'subarea'],
        'wilayah': ['wilayah', 'region', 'area'],
        'contract': ['contract', 'tipeKontrak', 'tipe_kontrak', 'statusKontrak', 'status_kontrak', 'statusKepegawaian', 'status_kepegawaian'],
        'name': ['divisi', 'name', 'unit', 'divisiName', 'namaDivisi', 'nama_divisi'],
        'name of organizational unit': ['dept', 'departemen', 'orgUnit', 'organizationalUnit', 'namaDepartemen', 'nama_departemen'],
        'job title': ['jabatan', 'jobTitle', 'job_title', 'posisi', 'role'],
        'd.o.birth': ['tglLahir', 'tgl_lahir', 'dob', 'birthDate', 'birth_date', 'dateOfBirth', 'date_of_birth', 'tanggalLahir', 'tanggal_lahir', 'tgl. lahir'],
        'gender text': ['gender', 'jenisKelamin', 'jenis_kelamin', 'jk', 'sex'],
        'religious denomination': ['agama', 'religion', 'religiousDenomination'],
        'ps group': ['psGroup', 'ps_group', 'golongan', 'pangkat'],
        'lvl': ['lvl', 'level'],
        'date': ['date', 'entry', 'entryDate', 'entry_date', 'joinDate', 'join_date', 'tglMasuk', 'tgl_masuk', 'tanggalMasuk', 'tanggal_masuk', 'tglGabung', 'tgl_gabung', 'tanggalGabung', 'tanggal_gabung', 'effectiveDate', 'tanggal', 'mulaiKerja', 'tglMulaiKerja'],
        'p0001-stext': ['p0001-stext', 'stext', 'p0001Stext', 'p0001_stext', 'deskripsiJabatan', 'struktur'],
        'business area': ['kodeBA', 'kode_ba', 'ba', 'businessArea', 'business_area', 'kodeCabang', 'kode_cabang'],
        'status_karyawan': ['statusKaryawan', 'status_karyawan', 'status', 'statusKeaktifan', 'status_keaktifan']
      };

      const fallbackKeys = fallbackMap[normTarget] || [];
      for (const fbKey of fallbackKeys) {
        if (row[fbKey] !== undefined && row[fbKey] !== null && String(row[fbKey]).trim() !== '') {
          return row[fbKey];
        }
        const normFb = normalizeHeaderName(fbKey);
        for (const k of keys) {
          if (normalizeHeaderName(k) === normFb) {
            const v = row[k];
            if (v !== undefined && v !== null && String(v).trim() !== '') {
              return v;
            }
          }
        }
      }

      // 5. Resolusi khusus kolom SAP Master Karyawan jika belum terisi
      if (normTarget === 'ps group') {
        const pg = findPSGroup(row);
        if (pg) return pg;
      }
      if (normTarget === 'date' || normTarget === 'entry' || normTarget === 'entry date' || normTarget === 'tanggal masuk' || normTarget === 'tgl masuk' || normTarget === 'tanggal gabung' || normTarget === 'tgl gabung' || normTarget === 'join date') {
        const dt = findDate(row);
        if (dt) return dt;
      }
      if (normTarget === 'd.o.birth' || normTarget === 'tgl lahir' || normTarget === 'tanggal lahir' || normTarget === 'dob' || normTarget === 'date of birth') {
        const dob = findDOBirth(row);
        if (dob) return dob;
      }
      if (normTarget === 'p0001-stext') {
        const st = findP0001STEXT(row);
        if (st) return st;
      }
      if (normTarget === 'lvl') {
        return findLvl(row);
      }
      if (normTarget === 'status_karyawan' || normTarget === 'status karyawan') {
        return 'Aktif';
      }

      // 6. Jika tidak ditemukan, kembalikan nilai direct (bisa berupa "" atau undefined/null)
      return (row[colName] !== undefined && row[colName] !== null) ? row[colName] : "";
    }

    function castSchemaValue(colName, val, fallbackIdx = 1) {
      const norm = normalizeHeaderName(colName);
      if (norm === 'npk' || norm === 'personnel no.' || norm.includes('astrapay') || 
          norm === 'no' || norm.includes('registrasi') || norm.includes('kode ba') || norm === 'business area') {
        return safeString(val);
      }
      if (norm.includes('durasi kerja') || norm.includes('work hours')) {
        return safeFloat(val, 8.5);
      }
      if (norm.includes('date') || norm === 'd.o.birth' || norm.includes('tgl') || norm.includes('tanggal')) {
        return parseExcelDate(val);
      }
      if (norm.includes('time') || norm.includes('jam')) {
        return parseExcelTime(val);
      }
      if (norm === 'status_karyawan' || norm === 'status karyawan') {
        const s = String(val || '').trim();
        return s ? s : 'Aktif';
      }
      if (val === null || val === undefined) return "";
      return String(val).trim();
    }

    function formatDatabaseDate(val) {
      if (!val && val !== 0) return "";
      if (val === null || val === undefined || val === '' || val === '-' || val === 'null' || val === 'undefined') return "";
      
      const s = String(val).trim();
      // Nilai epoch nol Excel/Google Sheets (1899-12-30 / 30.12.1899 / 0) dalam kolom tanggal adalah data kosong
      if (
        s === '1899-12-30' || s.startsWith('1899-12-30') || 
        s === '30.12.1899' || s.startsWith('30.12.1899') || 
        s === '30/12/1899' || s === '0' || s === '0.00.00' || s === '00:00:00'
      ) {
        return "";
      }

      const iso = parseExcelDate(val);
      if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        const parts = iso.split('-');
        if (parseInt(parts[0], 10) <= 1899) return "";
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
      return "";
    }
    window.formatDatabaseDate = formatDatabaseDate;

    // Helper Perhitungan Estimasi Keterlambatan Absensi (Asumsi Jam Masuk 08.00 WIB)
    function calculateLatenessInfo(timeVal, targetHour = 8, targetMinute = 0) {
      if (
        timeVal === null || timeVal === undefined || timeVal === '' || timeVal === '-' ||
        timeVal === 'null' || timeVal === 'undefined'
      ) {
        return {
          hasClockIn: false,
          isLate: false,
          diffMinutes: 0,
          hours: 0,
          minutes: 0,
          timeFormatted: '-',
          text: 'Tanpa Keterangan',
          badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
          badgeHtml: '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200"><i class="fa-solid fa-circle-question text-[10px]"></i> Tanpa Keterangan</span>'
        };
      }

      const sRaw = String(timeVal).trim();
      // Khusus 0.00.00 / 00:00:00 / 0 / 1899-12-30 (nol waktu / tidak clock in -> Tanpa Keterangan):
      if (
        timeVal === 0 || sRaw === '0' || sRaw === '0.00.00' || sRaw === '00:00:00' || 
        sRaw === '0:00:00' || sRaw === '0.00' || sRaw === '1899-12-30' || 
        sRaw === '30.12.1899' || (sRaw.startsWith('1899-12-30') && !sRaw.includes(':'))
      ) {
        return {
          hasClockIn: false,
          isLate: false,
          diffMinutes: 0,
          hours: 0,
          minutes: 0,
          timeFormatted: '0.00.00',
          text: 'Tanpa Keterangan',
          badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
          badgeHtml: '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200"><i class="fa-solid fa-circle-question text-[10px]"></i> Tanpa Keterangan</span>'
        };
      }

      // Check if timeVal is already a text estimate or standard status
      if (typeof timeVal === 'string') {
        const sTrim = sRaw;
        const sLower = sTrim.toLowerCase();

        if (
          sLower === 'tidak clock in' || sLower === 'tidak check in' || 
          sLower === 'belum clock in' || sLower === 'belum check in' ||
          sLower === 'tanpa keterangan' || sLower === 'alpa' || sLower === 'alpha'
        ) {
          return {
            hasClockIn: false,
            isLate: false,
            diffMinutes: 0,
            hours: 0,
            minutes: 0,
            timeFormatted: '-',
            text: 'Tanpa Keterangan',
            badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
            badgeHtml: '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200"><i class="fa-solid fa-circle-question text-[10px]"></i> Tanpa Keterangan</span>'
          };
        }

        const knownStatus = ['hadir', 'wfh', 'wfo'];
        if (knownStatus.includes(sLower)) {
          let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          let icon = 'fa-solid fa-check';
          return {
            hasClockIn: true,
            isLate: false,
            diffMinutes: 0,
            timeFormatted: sTrim,
            text: 'Tepat Waktu',
            badgeClass: badgeColor,
            badgeHtml: `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeColor}"><i class="${icon} text-[10px]"></i> Tepat Waktu</span>`
          };
        }

        if (sTrim.startsWith('Tepat') || sTrim.startsWith('Telat')) {
          const isLate = sTrim.startsWith('Telat');
          if (!isLate) {
            return {
              hasClockIn: true,
              isLate: false,
              diffMinutes: 0,
              timeFormatted: '≤ 08:00',
              text: 'Tepat Waktu',
              badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
              badgeHtml: '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-circle-check text-[10px]"></i> Tepat Waktu</span>'
            };
          } else {
            const isSevere = sTrim.includes('Jam') || (parseInt(sTrim.replace(/[^0-9]/g, '') || '0', 10) > 30);
            const badgeClass = isSevere 
              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
              : 'bg-amber-50 text-amber-700 border border-amber-200';
            const iconClass = isSevere ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-clock';
            return {
              hasClockIn: true,
              isLate: true,
              diffMinutes: isSevere ? 35 : 15,
              timeFormatted: '> 08:00',
              text: sTrim,
              badgeClass: badgeClass,
              badgeHtml: `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeClass}"><i class="${iconClass} text-[10px]"></i> ${sTrim}</span>`
            };
          }
        }
      }

      let h = -1;
      let m = -1;

      if (timeVal instanceof Date && !isNaN(timeVal.getTime())) {
        h = timeVal.getHours();
        m = timeVal.getMinutes();
      } else if (typeof timeVal === 'number' && !isNaN(timeVal)) {
        const timeFraction = (timeVal >= 1) ? (timeVal % 1) : timeVal;
        const totalSec = Math.round(timeFraction * 86400);
        h = Math.floor(totalSec / 3600) % 24;
        m = Math.floor((totalSec % 3600) / 60);
      } else {
        const s = sRaw;
        if (s.includes('T') && s.endsWith('Z')) {
          const d = new Date(s);
          if (!isNaN(d.getTime())) {
            // Apps Script ISO string from 1899 epoch in UTC.
            // In Asia/Jakarta (WIB = UTC+7):
            const totalUtcMinutes = d.getUTCHours() * 60 + d.getUTCMinutes() + 420;
            const wibMinutes = ((totalUtcMinutes % 1440) + 1440) % 1440;
            h = Math.floor(wibMinutes / 60);
            m = wibMinutes % 60;
          }
        } else {
          const match = s.match(/(?:^|\s|T)(\d{1,2})[:\.](\d{2})/);
          if (match) {
            const parsedH = parseInt(match[1], 10);
            const parsedM = parseInt(match[2], 10);
            if (parsedH >= 0 && parsedH < 24 && parsedM >= 0 && parsedM < 60) {
              h = parsedH;
              m = parsedM;
            }
          }
        }
      }

      // Jika h = 0 dan m = 0 dan berasal dari 1899 epoch tanpa penanda jam spesifik
      if (h === 0 && m === 0 && sRaw.startsWith('1899-12-') && !sRaw.includes(':')) {
        return {
          hasClockIn: false,
          isLate: false,
          diffMinutes: 0,
          hours: 0,
          minutes: 0,
          timeFormatted: '0.00.00',
          text: 'Tanpa Keterangan',
          badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
          badgeHtml: '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200"><i class="fa-solid fa-circle-question text-[10px]"></i> Tanpa Keterangan</span>'
        };
      }

      if (h === -1 || m === -1 || isNaN(h) || isNaN(m)) {
        return {
          hasClockIn: false,
          isLate: false,
          diffMinutes: 0,
          hours: 0,
          minutes: 0,
          timeFormatted: sRaw === '1899-12-30' ? '0.00.00' : sRaw,
          text: 'Format Tidak Valid',
          badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200',
          badgeHtml: `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">${sRaw === '1899-12-30' ? '0.00.00' : sRaw}</span>`
        };
      }

      const timeFormatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const totalClockInMinutes = h * 60 + m;
      const targetMinutes = targetHour * 60 + targetMinute;
      const diffMinutes = totalClockInMinutes - targetMinutes;

      if (diffMinutes <= 0) {
        return {
          hasClockIn: true,
          isLate: false,
          diffMinutes: diffMinutes,
          hours: h,
          minutes: m,
          timeFormatted: timeFormatted,
          text: 'Tepat Waktu',
          badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
          badgeHtml: `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-circle-check text-[10px]"></i> Tepat Waktu</span>`
        };
      }

      const lateHours = Math.floor(diffMinutes / 60);
      const lateMins = diffMinutes % 60;
      let text = '';
      if (lateHours > 0 && lateMins > 0) {
        text = `Telat ${lateHours} Jam ${lateMins} Menit`;
      } else if (lateHours > 0) {
        text = `Telat ${lateHours} Jam`;
      } else {
        text = `Telat ${lateMins} Menit`;
      }

      const isSevere = diffMinutes > 30 || lateHours > 0;
      const badgeClass = isSevere 
        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
        : 'bg-amber-50 text-amber-700 border border-amber-200';
      const iconClass = isSevere ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-clock';

      return {
        hasClockIn: true,
        isLate: true,
        diffMinutes: diffMinutes,
        lateHours: lateHours,
        lateMinutes: lateMins,
        hours: h,
        minutes: m,
        timeFormatted: timeFormatted,
        text: text,
        badgeClass: badgeClass,
        badgeHtml: `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeClass}"><i class="${iconClass} text-[10px]"></i> ${text}</span>`
      };
    }

    function formatDatabaseTime(val) {
      if (val === null || val === undefined || val === '' || val === '-' || val === 'null' || val === 'undefined') return '-';
      
      const s = String(val).trim();
      if (
        s === '0.00.00' || s === '00:00:00' || s === '0:00:00' || s === '0.00' || s === '0' ||
        s === '1899-12-30' || s === '30.12.1899' || (s.startsWith('1899-12-30') && !s.includes(':'))
      ) {
        return '0.00.00';
      }
      if (val === 0) return '0.00.00';

      const info = calculateLatenessInfo(val);
      if (info.hasClockIn && info.timeFormatted && info.timeFormatted !== '-') {
        return info.timeFormatted;
      }
      if (info.timeFormatted === '0.00.00' || s === '1899-12-30') {
        return '0.00.00';
      }
      if ((info.text === 'Tanpa Keterangan' || info.text === 'Alpha' || info.text === 'Alpa' || info.text === 'Tidak Clock In') && !info.hasClockIn) {
        return (s === '0.00.00' || s === '00:00:00' || s === '1899-12-30' || s === '0') ? '0.00.00' : '-';
      }
      return info.timeFormatted || s;
    }

    function sanitizeErrorMessage(msg) {
      if (!msg) return 'Terjadi kesalahan pada server backend.';
      const str = String(msg).trim();
      if (str.includes('<!DOCTYPE') || str.includes('<html') || str.includes('Page Not Found') || str.includes('unable to open the file')) {
        return 'Server Google Apps Script sedang sibuk atau mengalami kendala sementara (Unable to open file). Silakan coba lagi.';
      }
      return str;
    }
    if (typeof window !== 'undefined') window.sanitizeErrorMessage = sanitizeErrorMessage;

    async function callBackendAPI(actionName, payload = {}, maxAttempts = 2) {
      const bodyData = {
        action: actionName,
        ...payload // Kirim action dan payload saja tanpa SECRET_TOKEN
      };

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await fetch(BACKEND_PROXY_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              "Pragma": "no-cache"
            },
            cache: "no-store",
            body: JSON.stringify(bodyData)
          });

          if (!response.ok) {
            const errText = await response.text();
            let errJson = null;
            try { errJson = JSON.parse(errText); } catch(e) {}
            const rawMsg = errJson?.message || `HTTP ${response.status} (${response.statusText || 'Error server'})`;
            const cleanMsg = sanitizeErrorMessage(rawMsg);

            if (attempt < maxAttempts) {
              console.warn(`callBackendAPI: Percobaan ke-${attempt} gagal (${cleanMsg}), mencoba ulang dalam 1.2 detik...`);
              await new Promise(r => setTimeout(r, 1200));
              continue;
            }
            return { success: false, message: cleanMsg };
          }
      
          const result = await response.json();
          if (!result || typeof result !== 'object') {
            if (attempt < maxAttempts) {
              await new Promise(r => setTimeout(r, 1200));
              continue;
            }
            return { success: false, message: 'Format data respon dari server tidak valid.' };
          }

          return result;
        } catch (err) {
          console.warn(`API Error (attempt ${attempt}/${maxAttempts}):`, err);
          if (attempt < maxAttempts) {
            await new Promise(r => setTimeout(r, 1200));
            continue;
          }
          const cleanErr = sanitizeErrorMessage(err.message);
          return { success: false, message: "Gagal terhubung ke server backend: " + cleanErr };
        }
      }
    }

    const KNOWN_BRANCHES = [
      { 
        code: "D660", 
        numericCode: "660",
        name: "Lampung A Yani", 
        fullName: "Lampung A Yani (D660)", 
        aliases: ["d660", "660", "0660", "2660", "d-660", "d.660", "a yani", "ayani", "a. yani", "ahmad yani", "ahmadyani", "lampung a yani", "lampung ayani", "lampung a. yani", "tanjung karang", "tjk", "bandar lampung", "kedaton"] 
      },
      { 
        code: "D661", 
        numericCode: "661",
        name: "Lampung S Hatta", 
        fullName: "Lampung S Hatta (D661)", 
        aliases: ["d661", "661", "0661", "2661", "d-661", "d.661", "s hatta", "shatta", "s. hatta", "soekarno hatta", "soekarnohatta", "lampung s hatta", "lampung soekarno hatta", "by pass", "bypass"] 
      },
      { 
        code: "D662", 
        numericCode: "662",
        name: "Bandarjaya", 
        fullName: "Bandarjaya (D662)", 
        aliases: ["d662", "662", "0662", "2662", "d-662", "d.662", "bandarjaya", "bandar jaya", "bdj", "lampung tengah", "lamteng"] 
      },
      { 
        code: "D663", 
        numericCode: "663",
        name: "Lampung Utara", 
        fullName: "Lampung Utara (D663)", 
        aliases: ["d663", "663", "0663", "2663", "d-663", "d.663", "lampung utara", "lamut", "lam ut", "kotabumi", "kota bumi", "ktb"] 
      },
      { 
        code: "D664", 
        numericCode: "664",
        name: "Lampung Timur", 
        fullName: "Lampung Timur (D664)", 
        aliases: ["d664", "664", "0664", "2664", "d-664", "d.664", "lampung timur", "lamtim", "lam tim", "sukadana"] 
      }
    ];

    const INDO_MONTHS = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    /**
     * Memeriksa apakah user adalah Admin (Akses Penuh Seluruh Cabang)
     */
    function isUserAdmin(user) {
      if (!user) return false;
      const role = String(user.role || '').toLowerCase();
      // Kacab secara tegas BUKAN Admin
      if (role.includes('kacab') || role.includes('kepala cabang') || role === 'branch_manager' || role === 'bm' || role === 'user') {
        return false;
      }
      if (user.isAllBranch === true) return true;
      const username = String(user.username || user.npk || '').toLowerCase();
      const jabatan = String(user.jabatan || '').toLowerCase();
      
      if (role.includes('admin') || role.includes('hrd') || role.includes('ga') || 
          username === 'admin' || jabatan.includes('admin')) {
        return true;
      }
      if (Array.isArray(user.assignedBACodes) && user.assignedBACodes.length > 1 && user.isAllBranch !== false) {
        return true;
      }
      return false;
    }

    const ALLOWED_BRANCH_CODES = ["D660", "D661", "D662", "D663", "D664", "660", "661", "662", "663", "664"];

    /**
     * Menemukan info cabang (kode, nama, fullName) secara fleksibel & tahan spasi/tanda baca.
     * Mendukung format BA SAP: '660', '661', '662', '663', '664' maupun 'D660'-'D664'.
     */
    function resolveBranchInfo(input) {
      if (!input && input !== 0) return null;
      const str = String(input).trim();
      if (!str || str === '-' || str === 'null' || str === 'undefined') return null;

      const upper = str.toUpperCase();
      const clean = str.toLowerCase().replace(/[^a-z0-9]/g, "");

      // 1. Cek kode persis (misal 'D660' atau '660')
      let found = KNOWN_BRANCHES.find(b => b.code.toUpperCase() === upper || b.numericCode === upper);
      if (found) return found;

      // 2. Cek apakah ada nomor cabang spesifik (660, 661, 662, 663, 664) dalam string
      for (const b of KNOWN_BRANCHES) {
        if (upper.includes(b.code.toUpperCase()) || clean.includes(b.numericCode)) {
          return b;
        }
      }

      // 3. Cek cabang spesifik yang memiliki nama gabungan terlebih dahulu
      if (clean.includes('shatta') || clean.includes('soekarnohatta') || clean.includes('bypass')) {
        return KNOWN_BRANCHES.find(b => b.code === 'D661');
      }
      if (clean.includes('kotabumi') || clean.includes('lamut') || clean.includes('lampungutara')) {
        return KNOWN_BRANCHES.find(b => b.code === 'D663');
      }
      if (clean.includes('lamtim') || clean.includes('lampungtimur') || clean.includes('sukadana')) {
        return KNOWN_BRANCHES.find(b => b.code === 'D664');
      }
      if (clean.includes('bandarjaya') || clean.includes('lamteng') || clean.includes('lampungtengah')) {
        return KNOWN_BRANCHES.find(b => b.code === 'D662');
      }
      if (clean.includes('ayani') || clean.includes('ahmadyani') || clean.includes('tanjungkarang') || clean.includes('lampung')) {
        return KNOWN_BRANCHES.find(b => b.code === 'D660');
      }

      // 4. Cek seluruh daftar aliases
      for (const b of KNOWN_BRANCHES) {
        if (b.aliases) {
          for (const al of b.aliases) {
            const alClean = al.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (clean === alClean) {
              return b;
            }
          }
        }
      }

      return null;
    }

    /**
     * Mengambil Kode Cabang Kacab baku (D660, D661, D662, D663, D664)
     */
    function getUserBranchCode(user) {
      if (!user) return 'D660';
      let cand = null;
      if (Array.isArray(user.assignedBACodes) && user.assignedBACodes.length > 0) {
        const first = user.assignedBACodes[0];
        cand = (typeof first === 'object' && first !== null) ? (first.code || first.kodeBA || first.ba) : first;
      }
      if (!cand) {
        cand = user.kodeBA || user.kode_ba || user.businessArea || user.business_area || user.ba || user.cabang || user.branch;
      }
      const info = resolveBranchInfo(cand);
      return info ? info.code : (cand ? String(cand).trim().toUpperCase() : 'D660');
    }

    /**
     * Mengambil Nama Cabang Kacab
     */
    function getUserBranchName(user) {
      const code = getUserBranchCode(user);
      const info = resolveBranchInfo(code);
      return info ? info.name : (user?.cabang || 'Cabang Terdaftar');
    }

    function resolveBACode(str) {
      if (!str && str !== 0) return '';
      const clean = String(str).toUpperCase().trim();
      const info = resolveBranchInfo(clean);
      return info ? info.code : '';
    }

    /**
     * Memeriksa apakah sebuah record / item berasal dari salah satu 5 Cabang Resmi DSO Lampung:
     * D660, D661, D662, D663, D664
     */
    function isLampungBranch(item, fallbackMasterList = null, lampungNpkSet = null) {
      if (!item) return false;

      // Khusus tabel Knowledge_management (hanya ada NPK, NAMA, JUDUL, TANGGAL, TIME):
      // Merupakan dokumen repositori pengetahuan resmi DSO Lampung, selalu bernilai true
      if (item['JUDUL'] !== undefined || item['judul'] !== undefined || item['Judul'] !== undefined) {
        return true;
      }

      // 1. Cek langsung kode BA
      let rawCode = item.kodeBA || item.kode_ba || item['Kode BA'] || item['Business area'] || item['Business Area'] || item['business area'] || item['business_area'] || item['_kodeBA'] || '';
      if (!rawCode && typeof getRowCellValue === 'function') {
        rawCode = getRowCellValue(item, 'Business area') || getRowCellValue(item, 'Kode BA') || '';
      }
      if (rawCode && rawCode !== '-' && rawCode !== '0') {
        const norm = resolveBACode(rawCode);
        if (norm && ALLOWED_BRANCH_CODES.includes(norm)) return true;
      }

      // 2. Cek teks nama cabang (P.subarea / Cabang)
      let rawCabang = item.cabang || item.branch || item['Cabang'] || item['cabang'] || item['P.subarea'] || item['p.subarea'] || item['Nama Cabang'] || item['Cabang/Departemen'] || '';
      if (!rawCabang && typeof getRowCellValue === 'function') {
        rawCabang = getRowCellValue(item, 'P.subarea') || getRowCellValue(item, 'Cabang') || getRowCellValue(item, 'Cabang/Departemen') || '';
      }
      if (rawCabang && rawCabang !== '-' && rawCabang !== '0') {
        const norm = resolveBACode(rawCabang);
        if (norm && ALLOWED_BRANCH_CODES.includes(norm)) return true;
      }

      // Jika kode BA atau Cabang secara eksplisit terisi namun bukan cabang Lampung, tolak segera (jangan loloskan via wilayah/relasi)
      const hasExplicitNonLampungBranch = (rawCode && rawCode !== '-' && rawCode !== '0' && !resolveBACode(rawCode)) ||
                                          (rawCabang && rawCabang !== '-' && rawCabang !== '0' && !resolveBACode(rawCabang));
      if (hasExplicitNonLampungBranch) {
        return false;
      }

      // 3. Cek Wilayah (hanya jika eksplisit menyebut Lampung)
      const rawWilayah = item.wilayah || item['Wilayah'] || item['wilayah'] || (typeof getRowCellValue === 'function' ? getRowCellValue(item, 'Wilayah') : '') || '';
      if (rawWilayah && String(rawWilayah).toLowerCase().includes('lampung')) {
        return true;
      }

      // 4. Relasi NPK ke Master Karyawan
      const npk = safeString(item['NPK'] || item['Personnel no.'] || item['Personnel No.'] || item.npk);
      if (npk) {
        const cleanNpk = npk.replace(/^0+/, '');
        if (lampungNpkSet && (lampungNpkSet.has(npk) || lampungNpkSet.has(cleanNpk))) {
          return true;
        }

        const masterList = (fallbackMasterList && fallbackMasterList.length > 0) ? fallbackMasterList :
                           ((window.masterFullPayload && window.masterFullPayload.employeeList) || 
                            (window.fullUnscopedPayload && window.fullUnscopedPayload.employeeList) || 
                            (window.masterFullPayload && window.masterFullPayload.rawTables && window.masterFullPayload.rawTables.Master_Karyawan) || 
                            (currentDashboardPayload && currentDashboardPayload.employeeList) || []);
        if (masterList.length > 0) {
          const emp = masterList.find(e => {
            if (e === item) return false;
            const eNpk = safeString(e.npk || e['Personnel no.'] || e['Personnel No.']);
            return eNpk === npk || eNpk.replace(/^0+/, '') === cleanNpk;
          });
          if (emp) {
            const empCode = emp.kodeBA || emp['Business area'] || emp['Business Area'] || emp['Kode BA'] || '';
            if (empCode && ALLOWED_BRANCH_CODES.includes(resolveBACode(empCode))) return true;
            const empCabang = emp.cabang || emp['P.subarea'] || emp['Cabang'] || '';
            if (empCabang && ALLOWED_BRANCH_CODES.includes(resolveBACode(empCabang))) return true;
            const empWil = emp.wilayah || emp['Wilayah'] || '';
            if (empWil && String(empWil).toLowerCase().includes('lampung')) return true;
          }
        }
      }

      return false;
    }

    /**
     * Menyaring payload agar eksklusif hanya memuat data 5 Cabang DSO Lampung
     */
    function sanitizeLampungPayload(payload) {
      if (!payload) return payload;

      // 1. Dapatkan daftar master karyawan Lampung yang valid
      const rawMaster = (payload.rawTables && Array.isArray(payload.rawTables.Master_Karyawan) && payload.rawTables.Master_Karyawan.length > 0)
        ? payload.rawTables.Master_Karyawan
        : (Array.isArray(payload.employeeList) ? payload.employeeList : []);

      const validLampungEmps = rawMaster.filter(e => isLampungBranch(e, []));

      // Buat Set NPK karyawan Lampung untuk pencocokan cepat tabel transaksi
      const lampungNpkSet = new Set();
      validLampungEmps.forEach(e => {
        const npk = safeString(e['Personnel no.'] || e['NPK'] || e.npk);
        if (npk) {
          lampungNpkSet.add(npk);
          lampungNpkSet.add(npk.replace(/^0+/, ''));
        }
      });

      // 2. Filter employeeList secara ketat (hanya 5 cabang DSO Lampung)
      if (Array.isArray(payload.employeeList)) {
        payload.employeeList = payload.employeeList.filter(e => isLampungBranch(e, validLampungEmps, lampungNpkSet));
      }

      // 3. Filter qccList secara ketat
      if (Array.isArray(payload.qccList)) {
        payload.qccList = payload.qccList.filter(q => isLampungBranch(q, validLampungEmps, lampungNpkSet));
      }

      // 4. Filter rawTables secara ketat
      if (payload.rawTables) {
        if (Array.isArray(payload.rawTables.Master_Karyawan)) {
          payload.rawTables.Master_Karyawan = payload.rawTables.Master_Karyawan.filter(r => isLampungBranch(r, validLampungEmps, lampungNpkSet));
        }

        const sheets = ['Data_Kehadiran', 'Data_SS', 'Data_QCC', 'Data_SP'];
        sheets.forEach(sh => {
          if (Array.isArray(payload.rawTables[sh])) {
            payload.rawTables[sh] = payload.rawTables[sh].filter(r => isLampungBranch(r, validLampungEmps, lampungNpkSet));
          }
        });

        // Sinkronisasi data Knowledge Management (KM)
        const kmRows = payload.rawTables.Knowledge_management || payload.rawTables.Data_KM || [];
        payload.rawTables.Knowledge_management = kmRows;
        payload.rawTables.Data_KM = kmRows;
      }

      return payload;
    }

    /**
     * Mencocokkan data karyawan / circle / presensi / modul dengan target cabang
     * Eksklusif hanya mengizinkan data dengan kode BA D660, D661, D662, D663, D664
     */
    function matchBranch(item, targetBranchCode) {
      if (!item) return false;

      // Jika target 'ALL', loloskan seluruh data (asalkan milik Lampung / KM)
      if (!targetBranchCode || targetBranchCode === 'ALL') {
        return isLampungBranch(item);
      }

      // Filter Mutlak: Tolak data di luar 5 cabang Lampung
      if (!isLampungBranch(item)) return false;

      const targetInfo = resolveBranchInfo(targetBranchCode);
      const targetCode = (targetInfo ? targetInfo.code : String(targetBranchCode)).toUpperCase().trim();

      // 1. Ekstraksi kode cabang / Business Area dari objek (OTORITATIF & PALING UTAMA)
      let rawCode = item.kodeBA || item.kode_ba || item['Kode BA'] || item['Business area'] || item['Business Area'] || item['business area'] || item['business_area'] || item['_kodeBA'] || '';
      if (!rawCode && typeof getRowCellValue === 'function') {
        rawCode = getRowCellValue(item, 'Business area') || getRowCellValue(item, 'Kode BA') || '';
      }
      if (rawCode && rawCode !== '-' && rawCode !== '0') {
        const norm = resolveBACode(rawCode);
        if (norm) {
          return norm === targetCode;
        }
      }

      // 2. Ekstraksi teks cabang dari objek (P.subarea / Cabang)
      let rawCabang = item.cabang || item.branch || item['Cabang'] || item['cabang'] || item['P.subarea'] || item['p.subarea'] || item['Nama Cabang'] || item['Cabang/Departemen'] || '';
      if (!rawCabang && typeof getRowCellValue === 'function') {
        rawCabang = getRowCellValue(item, 'P.subarea') || getRowCellValue(item, 'Cabang') || getRowCellValue(item, 'Cabang/Departemen') || '';
      }
      if (rawCabang && rawCabang !== '-' && rawCabang !== '0') {
        const norm = resolveBACode(rawCabang);
        if (norm) {
          return norm === targetCode;
        }
      }

      // 3. Relasi NPK ke Master Karyawan (Penting untuk Knowledge_management dan Data_SP)
      const npk = safeString(item['NPK'] || item['Personnel no.'] || item['Personnel No.'] || item.npk);
      const masterList = (window.masterFullPayload && window.masterFullPayload.employeeList) || 
                         (window.fullUnscopedPayload && window.fullUnscopedPayload.employeeList) || 
                         (window.masterFullPayload && window.masterFullPayload.rawTables && window.masterFullPayload.rawTables.Master_Karyawan) || 
                         (currentDashboardPayload && currentDashboardPayload.employeeList) || [];
      if (npk && masterList.length > 0) {
        const cleanNpk = npk.replace(/^0+/, '');
        const emp = masterList.find(e => {
          const eNpk = safeString(e.npk || e['Personnel no.'] || e['Personnel No.']);
          return eNpk === npk || eNpk.replace(/^0+/, '') === cleanNpk;
        });
        if (emp && emp !== item) {
          return matchBranch(emp, targetCode);
        }
      }

      // Jika data adalah KM (tanpa kolom cabang), dan NPK tidak tercatat di Master Karyawan cabang terpilih:
      if (item['JUDUL'] !== undefined || item['judul'] !== undefined || item['Judul'] !== undefined) {
        return false;
      }

      return false;
    }

    // Helper untuk mencocokkan tanggal dengan Bulan dan Tahun
    function matchDateMonthYear(dateVal, targetMonth, targetYear) {
      if (!dateVal) return true;
      if ((!targetMonth || targetMonth === 'ALL') && (!targetYear || targetYear === 'ALL')) return true;

      const str = String(dateVal).trim();
      if (!str || str === '-') return true;

      const monthMap = {
        'januari': 1, 'jan': 1, '01': 1, '1': 1,
        'februari': 2, 'feb': 2, '02': 2, '2': 2,
        'maret': 3, 'mar': 3, '03': 3, '3': 3,
        'april': 4, 'apr': 4, '04': 4, '4': 4,
        'mei': 5, 'may': 5, '05': 5, '5': 5,
        'juni': 6, 'jun': 6, '06': 6, '6': 6,
        'juli': 7, 'jul': 7, '07': 7, '7': 7,
        'agustus': 8, 'agu': 8, 'agt': 8, 'aug': 8, '08': 8, '8': 8,
        'september': 9, 'sep': 9, '09': 9, '9': 9,
        'oktober': 10, 'okt': 10, 'oct': 10, '10': 10,
        'november': 11, 'nov': 11, '11': 11,
        'desember': 12, 'des': 12, 'dec': 12, '12': 12
      };

      const targetMonthNum = (targetMonth && targetMonth !== 'ALL') ? monthMap[String(targetMonth).toLowerCase()] : null;
      const targetYearNum = (targetYear && targetYear !== 'ALL') ? parseInt(targetYear, 10) : null;

      let itemYear = null;
      let itemMonth = null;

      // Cek serial number Excel (contoh: 45789)
      if (typeof dateVal === 'number' || (/^\d{5}$/.test(str) && Number(str) > 35000 && Number(str) < 65000)) {
        const d = new Date(Math.round((Number(str) - 25569) * 86400 * 1000));
        if (!isNaN(d.getTime())) {
          itemYear = d.getFullYear();
          itemMonth = d.getMonth() + 1;
        }
      } else {
        const ymdMatch = str.match(/^(\d{4})[-/. ](\d{1,2})[-/. ](\d{1,2})/);
        const dmyMatch = str.match(/^(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{4})/);

        if (ymdMatch) {
          itemYear = parseInt(ymdMatch[1], 10);
          itemMonth = parseInt(ymdMatch[2], 10);
        } else if (dmyMatch) {
          itemYear = parseInt(dmyMatch[3], 10);
          itemMonth = parseInt(dmyMatch[2], 10);
        } else {
          const lower = str.toLowerCase();
          for (const [mName, mNum] of Object.entries(monthMap)) {
            if (lower.includes(mName)) {
              itemMonth = mNum;
              break;
            }
          }
          const yrMatch = str.match(/\b(20\d{2})\b/);
          if (yrMatch) itemYear = parseInt(yrMatch[1], 10);
          else {
            const yr2Match = str.match(/-(\d{2})$/);
            if (yr2Match) itemYear = 2000 + parseInt(yr2Match[1], 10);
          }
        }
      }

      if (targetYearNum && itemYear && itemYear !== targetYearNum) return false;
      if (targetMonthNum && itemMonth && itemMonth !== targetMonthNum) return false;

      return true;
    }

    function parseSingleDateMonthYear(rawDate) {
      if (!rawDate && rawDate !== 0) return null;
      const s = String(rawDate).trim();
      if (!s || s === '-' || s === '1899-12-30' || s.startsWith('1899-12-30') || s === '30.12.1899' || s === '0' || s === '0.00.00') return null;

      if (typeof rawDate === 'number' || (/^\d{5}$/.test(s) && Number(s) > 35000 && Number(s) < 65000)) {
        const d = new Date(Math.round((Number(s) - 25569) * 86400 * 1000));
        if (!isNaN(d.getTime()) && d.getFullYear() > 1899) {
          return { year: d.getFullYear(), month: d.getMonth() + 1 };
        }
      }

      const ymd = s.match(/^(\d{4})[-/. ](\d{1,2})[-/. ](\d{1,2})/);
      if (ymd && parseInt(ymd[1], 10) > 1899) {
        return { year: parseInt(ymd[1], 10), month: parseInt(ymd[2], 10) };
      }

      const dmy = s.match(/^(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{4})/);
      if (dmy && parseInt(dmy[3], 10) > 1899) {
        return { year: parseInt(dmy[3], 10), month: parseInt(dmy[2], 10) };
      }

      const monthMap = { 'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'mei': 5, 'may': 5, 'jun': 6, 'jul': 7, 'agu': 8, 'aug': 8, 'sep': 9, 'okt': 10, 'oct': 10, 'nov': 11, 'des': 12, 'dec': 12 };
      const lower = s.toLowerCase();
      let m = null;
      for (const [k, v] of Object.entries(monthMap)) {
        if (lower.includes(k)) { m = v; break; }
      }
      const yr = s.match(/\b(20\d{2})\b/);
      if (m && yr) return { year: parseInt(yr[1], 10), month: m };

      return null;
    }
    window.parseSingleDateMonthYear = parseSingleDateMonthYear;

    function extractRowMonthYear(row) {
      if (!row) return null;
      if (typeof row !== 'object') return parseSingleDateMonthYear(row);
      const d1 = (typeof getRowCellValue === 'function' && typeof SCHEMAS !== 'undefined' && SCHEMAS.Data_Kehadiran)
        ? (getRowCellValue(row, 'Date', SCHEMAS.Data_Kehadiran) || row['Date'] || row['Tanggal'] || row['TANGGAL'] || row['tgl'] || row['Tgl'])
        : (row['Date'] || row['Tanggal'] || row['TANGGAL'] || row['tgl'] || row['Tgl']);
      const res1 = parseSingleDateMonthYear(d1);
      if (res1) return res1;

      const d2 = (typeof getRowCellValue === 'function' && typeof SCHEMAS !== 'undefined' && SCHEMAS.Data_Kehadiran)
        ? (getRowCellValue(row, 'Date Clock In', SCHEMAS.Data_Kehadiran) || row['Date Clock In'])
        : row['Date Clock In'];
      const res2 = parseSingleDateMonthYear(d2);
      if (res2) return res2;

      const d3 = (typeof getRowCellValue === 'function' && typeof SCHEMAS !== 'undefined' && SCHEMAS.Data_Kehadiran)
        ? (getRowCellValue(row, 'Date Clock Out', SCHEMAS.Data_Kehadiran) || row['Date Clock Out'])
        : row['Date Clock Out'];
      return parseSingleDateMonthYear(d3);
    }
    window.extractRowMonthYear = extractRowMonthYear;

    // Helper formatting cell values based on canonical column type
    function formatColumnCell(col, val, context = '') {
      const norm = normalizeHeaderName(col);
      
      if (norm === 'status_karyawan' || norm === 'status karyawan') {
        const isResign = val && String(val).trim().toLowerCase() === 'resign';
        return isResign
          ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><i class="fa-solid fa-user-xmark mr-1 text-[9px]"></i>Resign</span>`
          : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-user-check mr-1 text-[9px]"></i>Aktif</span>`;
      }

      if (norm === 'status kehadiran' || norm.includes('estimasi telat') || norm.includes('keterlambatan')) {
        const info = calculateLatenessInfo(val);
        return info.badgeHtml;
      }

      if (val === null || val === undefined || val === '') return '<span class="text-slate-300">-</span>';
      const sVal = String(val).trim();
      if (sVal === '' || sVal === '-' || sVal === 'null' || sVal === 'undefined') return '<span class="text-slate-300">-</span>';
      
      if (norm === 'contract' || norm === 'status kontrak' || norm === 'status kepegawaian') {
        const cat = normalizeContractCategory(val);
        const meta = getContractMeta(cat);
        return `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.badgeBg}">${val}</span>`;
      }
      if (norm === 'status reward') {
        const meta = getSSRewardStatusMeta(val);
        return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${meta.badgeBg}"><i class="${meta.icon} text-[9px]"></i> ${val}</span>`;
      }
      if (norm === 'reward') {
        let rewStr = String(val).trim();
        if (/^\d+$/.test(rewStr)) {
          rewStr = 'Rp ' + Number(rewStr).toLocaleString('id-ID');
        }
        return `<span class="font-bold text-emerald-700 bg-emerald-50/70 px-2 py-0.5 rounded-lg border border-emerald-200/60">${rewStr}</span>`;
      }
      if (norm === 'status' || norm === 'pdca' || norm === 'status circle' || norm === 'tahapan') {
        const sNorm = String(val).toLowerCase().trim();
        let cls = 'bg-slate-100 text-slate-700 border-slate-200';
        if (sNorm.includes('finish') || sNorm.includes('selesai')) {
          cls = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        } else if (sNorm.includes('progress') || sNorm.includes('proses')) {
          cls = 'bg-blue-50 text-blue-700 border-blue-200';
        } else if (sNorm.includes('plan')) {
          cls = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        } else if (sNorm.includes('do')) {
          cls = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        } else if (sNorm.includes('check')) {
          cls = 'bg-amber-50 text-amber-700 border-amber-200';
        } else if (sNorm.includes('action')) {
          cls = 'bg-purple-50 text-purple-700 border-purple-200';
        } else {
          cls = 'bg-purple-50 text-purple-700 border-purple-200';
        }
        return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black border ${cls}">${val}</span>`;
      }
      if (norm === 'tingkat sp') {
        return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">${val}</span>`;
      }
      if (norm.includes('astrapay')) {
        return `<span class="font-mono text-slate-700 bg-amber-50/70 px-1.5 py-0.5 rounded border border-amber-200/60 text-[11px] font-semibold">${val}</span>`;
      }
      if (norm.includes('durasi kerja') || norm.includes('work hours')) {
        return `<span class="font-bold text-slate-900">${val} Jam</span>`;
      }
      if (norm === 'd.o.birth' || norm === 'tanggal lahir' || norm === 'tgl lahir' || norm === 'dob' || norm === 'date of birth') {
        const dateStr = formatDatabaseDate(val);
        if (!dateStr || dateStr === '-') {
          return '<span class="text-slate-300">-</span>';
        }
        const ageStr = calculateEmployeeAge(val);
        if (ageStr !== '-') {
          return `<div><span class="font-medium text-slate-800">${dateStr}</span><span class="text-[10px] text-slate-400 block">${ageStr}</span></div>`;
        }
        return dateStr;
      }
      if (norm === 'date' || norm === 'entry' || norm === 'entry date' || norm === 'tanggal masuk' || norm === 'tgl masuk' || norm === 'tanggal gabung' || norm === 'tgl gabung' || norm === 'join date' || norm === 'tanggal' || norm === 'tgl' || norm.includes('date clock')) {
        const dateStr = formatDatabaseDate(val);
        if (!dateStr || dateStr === '-') {
          return '<span class="text-slate-300">-</span>';
        }
        // Kalkulasi masa kerja HANYA untuk tanggal masuk (join date) di Master Karyawan, TIDAK untuk data absensi/kehadiran
        const isJoinDateCol = norm === 'date' || norm === 'entry' || norm === 'entry date' || norm === 'tanggal masuk' || norm === 'tgl masuk' || norm === 'tanggal gabung' || norm === 'tgl gabung' || norm === 'join date';
        if (isJoinDateCol && context === 'Master_Karyawan') {
          const serviceStr = calculateEmployeeTenure(val);
          if (serviceStr !== '-') {
            return `<div><span class="font-medium text-slate-800">${dateStr}</span><span class="text-[10px] text-slate-400 block">${serviceStr}</span></div>`;
          }
        }
        return dateStr;
      }
      if (norm === 'time' || norm === 'jam') {
        const timeStr = formatDatabaseTime(val);
        if (!timeStr || timeStr === '-') {
          return '<span class="text-slate-300">-</span>';
        }
        return `<span class="font-mono font-bold text-slate-800">${timeStr}</span>`;
      }
      if (norm.includes('time clock in') || norm.includes('time clock out') || norm === 'time in' || norm === 'time out') {
        const timeStr = formatDatabaseTime(val);
        if (!timeStr || timeStr === '-') {
          return '<span class="text-slate-300">-</span>';
        }
        return `<span class="font-mono font-bold text-slate-800">${timeStr}</span>`;
      }
      if (norm.includes('estimasi telat') || norm.includes('keterlambatan')) {
        const info = calculateLatenessInfo(val);
        return info.badgeHtml;
      }
      if (norm === 'no' || norm === 'nomor') {
        return `<span class="font-mono font-bold text-slate-500">${val}</span>`;
      }
      if (norm === 'personnel no.' || norm === 'npk' || norm.includes('registrasi') || norm.includes('kode ba') || norm === 'business area') {
        return `<span class="font-mono font-semibold">${val}</span>`;
      }
      return String(val);
    }

    // ========================================================
    // SINKRONISASI DATABASE & CRUD ROW DATA (KHUSUS ADMIN)
    // ========================================================
    const LOCAL_EDITS_KEY = 'dperform_local_edits_v1';

    function getLocalEdits() {
      try {
        const raw = localStorage.getItem(LOCAL_EDITS_KEY);
        return raw ? JSON.parse(raw) : { updates: {}, deletes: {} };
      } catch (e) {
        console.warn('Gagal membaca local edits:', e);
        return { updates: {}, deletes: {} };
      }
    }

    function saveLocalEdit(sheetName, rowKey, rowData) {
      if (!sheetName || !rowKey || !rowData) return;
      try {
        const edits = getLocalEdits();
        if (!edits.updates) edits.updates = {};
        if (!edits.updates[sheetName]) edits.updates[sheetName] = {};
        edits.updates[sheetName][String(rowKey)] = JSON.parse(JSON.stringify(rowData));
        if (edits.deletes?.[sheetName]) {
          edits.deletes[sheetName] = edits.deletes[sheetName].filter(k => String(k) !== String(rowKey));
        }
        localStorage.setItem(LOCAL_EDITS_KEY, JSON.stringify(edits));
      } catch (e) {
        console.warn('Gagal menyimpan local edit:', e);
      }
    }

    function saveLocalDelete(sheetName, rowKey) {
      if (!sheetName || !rowKey) return;
      try {
        const edits = getLocalEdits();
        if (!edits.deletes) edits.deletes = {};
        if (!edits.deletes[sheetName]) edits.deletes[sheetName] = [];
        const sKey = String(rowKey);
        if (!edits.deletes[sheetName].includes(sKey)) {
          edits.deletes[sheetName].push(sKey);
        }
        if (edits.updates?.[sheetName]?.[sKey]) {
          delete edits.updates[sheetName][sKey];
        }
        localStorage.setItem(LOCAL_EDITS_KEY, JSON.stringify(edits));
      } catch (e) {
        console.warn('Gagal menyimpan local delete:', e);
      }
    }

    function clearLocalEdits() {
      try {
        localStorage.removeItem(LOCAL_EDITS_KEY);
      } catch (e) {}
    }

    function getRowIdentifier(sheetName, row, fallbackIndex) {
      if (!row) return String(fallbackIndex !== undefined ? fallbackIndex : '');
      const sName = sheetName || '';
      if (sName === 'Master_Karyawan') {
        const npk = String(row['Personnel no.'] || row['NPK'] || row['NIK'] || '').trim();
        return npk || String(fallbackIndex !== undefined ? fallbackIndex : '');
      }
      if (sName === 'Data_SS') {
        const reg = String(row['Registrasi'] || row['No.Registrasi'] || row['No'] || '').trim();
        return reg || String(fallbackIndex !== undefined ? fallbackIndex : '');
      }
      if (sName === 'Data_QCC') {
        const reg = String(row['No.Registrasi'] || row['Nama Tim'] || '').trim();
        return reg || String(fallbackIndex !== undefined ? fallbackIndex : '');
      }
      if (sName === 'Data_SP') {
        const npk = String(row['NPK'] || row['Personnel no.'] || '').trim();
        const sp = String(row['Tingkat SP'] || '').trim();
        return npk ? (sp ? `${npk}_${sp}` : npk) : String(fallbackIndex !== undefined ? fallbackIndex : '');
      }
      if (sName === 'Knowledge_management' || sName === 'Data_KM') {
        const npk = String(row['NPK'] || row['Personnel no.'] || '').trim();
        const judul = String(row['JUDUL'] || row['Judul'] || '').trim();
        return (npk && judul) ? `${npk}_${judul}` : (npk || String(fallbackIndex !== undefined ? fallbackIndex : ''));
      }
      if (sName === 'Data_Kehadiran') {
        const npk = String(row['Personnel no.'] || row['NPK'] || '').trim();
        const date = String(row['Date Clock In'] || row['Date'] || '').trim();
        return (npk && date) ? `${npk}_${date}` : (npk || String(fallbackIndex !== undefined ? fallbackIndex : ''));
      }
      return String(fallbackIndex !== undefined ? fallbackIndex : '');
    }

    function getKeyFieldAndValue(sheetName, row) {
      if (!row) return { keyField: '', keyValue: '' };
      const sName = sheetName || '';
      if (sName === 'Master_Karyawan') {
        const npk = String(row['Personnel no.'] || row['NPK'] || row['NIK'] || '').trim();
        return { keyField: 'Personnel no.', keyValue: npk };
      }
      if (sName === 'Data_SS') {
        const reg = String(row['Registrasi'] || row['No.Registrasi'] || row['No'] || '').trim();
        return { keyField: 'Registrasi', keyValue: reg };
      }
      if (sName === 'Data_QCC') {
        const reg = String(row['No.Registrasi'] || row['Nama Tim'] || '').trim();
        return { keyField: 'No.Registrasi', keyValue: reg };
      }
      if (sName === 'Data_SP') {
        const npk = String(row['NPK'] || row['Personnel no.'] || '').trim();
        return { keyField: 'NPK', keyValue: npk };
      }
      if (sName === 'Knowledge_management' || sName === 'Data_KM') {
        const npk = String(row['NPK'] || row['Personnel no.'] || '').trim();
        return { keyField: 'NPK', keyValue: npk };
      }
      if (sName === 'Data_Kehadiran') {
        const npk = String(row['Personnel no.'] || row['NPK'] || '').trim();
        return { keyField: 'Personnel no.', keyValue: npk };
      }
      return { keyField: '', keyValue: '' };
    }

    function applyLocalEditsToPayload(payload) {
      if (!payload || !payload.rawTables) return payload;
      const edits = getLocalEdits();
      if (!edits) return payload;

      const sheets = Object.keys(payload.rawTables);
      sheets.forEach(sheetName => {
        let rows = payload.rawTables[sheetName];
        if (!Array.isArray(rows)) return;

        // 1. Terapkan Deletions
        const deletes = edits.deletes?.[sheetName] || [];
        if (deletes.length > 0) {
          const deleteSet = new Set(deletes.map(k => String(k)));
          payload.rawTables[sheetName] = rows.filter((r, idx) => {
            const key = getRowIdentifier(sheetName, r, idx);
            return !deleteSet.has(key);
          });
          rows = payload.rawTables[sheetName];
        }

        // 2. Terapkan Updates
        const updates = edits.updates?.[sheetName] || {};
        const updateKeys = Object.keys(updates);
        if (updateKeys.length > 0) {
          rows.forEach((r, idx) => {
            const key = getRowIdentifier(sheetName, r, idx);
            if (updates[key]) {
              Object.assign(r, updates[key]);
            }
          });
        }
      });

      // 3. Khusus Master_Karyawan: Sinkronkan update ke payload.employeeList
      if (edits.updates?.Master_Karyawan && Array.isArray(payload.employeeList)) {
        const empUpdates = edits.updates.Master_Karyawan;
        payload.employeeList.forEach(emp => {
          const npk = String(emp.npk || emp['Personnel no.'] || '').trim();
          if (empUpdates[npk]) {
            const row = empUpdates[npk];
            emp.nama = row['Last name'] || emp.nama;
            emp.cabang = row['P.subarea'] || emp.cabang;
            emp.wilayah = row['Wilayah'] || emp.wilayah;
            emp.kodeBA = String(row['Business area'] || emp.kodeBA);
            emp.divisi = row['Name'] || emp.divisi;
            emp.jabatan = row['Job Title'] || emp.jabatan;
            emp.tipeKontrak = row['Contract'] || emp.tipeKontrak;
            emp['Contract'] = row['Contract'];
            emp.joinDate = row['Date'] || emp.joinDate;
            emp.tglLahir = row['D.o.birth'] || emp.tglLahir;
            emp.gender = row['Gender text'] || emp.gender;
            emp.agama = row['Religious denomination'] || emp.agama;
            emp.psGroup = row['PS group'] || emp.psGroup;
            emp.lvl = row['Lvl'] || emp.lvl;
            emp.stext = row['P0001-STEXT'] || emp.stext;
            emp.statusKaryawan = row['Status_Karyawan'] || emp.statusKaryawan || 'Aktif';
            emp['Status_Karyawan'] = emp.statusKaryawan;
            emp.tanggalResign = row['Tanggal_Resign'] || emp.tanggalResign || '';
            emp['Tanggal_Resign'] = emp.tanggalResign;
            emp.alasanResign = row['Alasan_Resign'] || emp.alasanResign || '';
            emp['Alasan_Resign'] = emp.alasanResign;
          }
        });
      }

      // Khusus Master_Karyawan: filter deleted dari employeeList
      if (edits.deletes?.Master_Karyawan && Array.isArray(payload.employeeList)) {
        const delSet = new Set(edits.deletes.Master_Karyawan.map(k => String(k)));
        payload.employeeList = payload.employeeList.filter(e => {
          const npk = String(e.npk || e['Personnel no.'] || '').trim();
          return !delSet.has(npk);
        });
      }

      return payload;
    }

    async function syncSheetToBackend(targetSheet) {
      const schema = SCHEMAS[targetSheet];
      if (!schema) return { success: false, message: 'Skema tabel tidak ditemukan.' };
      
      // Utamakan masterFullPayload agar mencakup seluruh cabang (tidak terpotong oleh filter scoped)
      const sourcePayload = window.masterFullPayload || window.fullUnscopedPayload || currentDashboardPayload;
      let rawRows = (sourcePayload?.rawTables && (sourcePayload.rawTables[targetSheet] || sourcePayload.rawTables[schema.sheetName])) || [];
      if (!Array.isArray(rawRows)) rawRows = [];
      const canonicalColumns = schema.columns;
      const formattedDataRows = rawRows.map(obj => canonicalColumns.map(col => {
        if (obj[col] !== undefined && obj[col] !== null) return obj[col];
        const lower = col.toLowerCase();
        if (obj[lower] !== undefined && obj[lower] !== null) return obj[lower];
        const upper = col.toUpperCase();
        if (obj[upper] !== undefined && obj[upper] !== null) return obj[upper];
        if (typeof capitalizeFirst === 'function' && obj[capitalizeFirst(col)] !== undefined) return obj[capitalizeFirst(col)];
        return '';
      }));

      return await callBackendAPI("IMPORT_EXCEL", {
        targetSheet: schema.sheetName,
        headers: canonicalColumns,
        dataRows: formattedDataRows
      });
    }

    async function updateRowInBackend(sheetName, rowData, rowIndex, keyField, keyValue) {
      const schema = SCHEMAS[sheetName];
      const targetSheet = schema ? schema.sheetName : sheetName;

      try {
        const res = await callBackendAPI("UPDATE_ROW", {
          targetSheet: targetSheet,
          keyField: keyField || '',
          keyValue: keyValue || '',
          rowIndex: typeof rowIndex === 'number' ? rowIndex : -1,
          rowData: rowData
        });

        if (res && res.success) {
          return { success: true, method: 'direct', message: res.message || 'Row berhasil diupdate di database.' };
        }

        // Jika endpoint UPDATE_ROW belum ada di versi script aktif pengguna, otomatis fallback ke syncSheetToBackend
        if (res && res.message && (res.message.includes('Action tidak dikenali') || res.message.includes('Action not found'))) {
          console.warn('UPDATE_ROW tidak didukung script aktif, mencoba syncSheetToBackend...');
          const fallbackRes = await syncSheetToBackend(sheetName);
          return {
            success: fallbackRes.success,
            method: 'fallback_sync',
            message: fallbackRes.success
              ? 'Tersinkron ke Google Sheets via sheet sync.'
              : (fallbackRes.message || 'Gagal sinkron via fallback.')
          };
        }

        return res || { success: false, message: 'Respon kosong dari server.' };
      } catch (err) {
        console.warn('Gagal call UPDATE_ROW, fallback ke syncSheetToBackend:', err);
        try {
          const fallbackRes = await syncSheetToBackend(sheetName);
          return {
            success: fallbackRes.success,
            method: 'fallback_sync',
            message: fallbackRes.success ? 'Tersinkron ke Google Sheets via fallback.' : fallbackRes.message
          };
        } catch (e2) {
          return { success: false, message: err.message };
        }
      }
    }

    async function deleteRowInBackend(sheetName, rowIndex, keyField, keyValue, secondaryField, secondaryValue) {
      const schema = SCHEMAS[sheetName];
      const targetSheet = schema ? schema.sheetName : sheetName;

      try {
        const res = await callBackendAPI("DELETE_ROW", {
          targetSheet: targetSheet,
          keyField: keyField || '',
          keyValue: keyValue || '',
          rowIndex: typeof rowIndex === 'number' ? rowIndex : -1,
          secondaryField: secondaryField || '',
          secondaryValue: secondaryValue || ''
        });

        if (res && res.success) {
          return { success: true, method: 'direct', message: res.message || 'Row berhasil dihapus dari database.' };
        }

        if (res && res.message && (res.message.includes('Action tidak dikenali') || res.message.includes('Action not found'))) {
          console.warn('DELETE_ROW tidak didukung script aktif, mencoba syncSheetToBackend...');
          const fallbackRes = await syncSheetToBackend(sheetName);
          return {
            success: fallbackRes.success,
            method: 'fallback_sync',
            message: fallbackRes.success ? 'Data dihapus via sheet sync.' : fallbackRes.message
          };
        }

        return res || { success: false, message: 'Respon kosong dari server.' };
      } catch (err) {
        console.warn('Gagal call DELETE_ROW, fallback ke syncSheetToBackend:', err);
        try {
          const fallbackRes = await syncSheetToBackend(sheetName);
          return {
            success: fallbackRes.success,
            method: 'fallback_sync',
            message: fallbackRes.success ? 'Data dihapus via fallback sync.' : fallbackRes.message
          };
        } catch (e2) {
          return { success: false, message: err.message };
        }
      }
    }

    // Expose Global Helper Functions
    window.getLocalEdits = getLocalEdits;
    window.saveLocalEdit = saveLocalEdit;
    window.saveLocalDelete = saveLocalDelete;
    window.clearLocalEdits = clearLocalEdits;
    window.getRowIdentifier = getRowIdentifier;
    window.getKeyFieldAndValue = getKeyFieldAndValue;
    window.applyLocalEditsToPayload = applyLocalEditsToPayload;
    window.syncSheetToBackend = syncSheetToBackend;
    window.updateRowInBackend = updateRowInBackend;
    window.deleteRowInBackend = deleteRowInBackend;

