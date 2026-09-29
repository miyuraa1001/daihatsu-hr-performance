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
          "contract": ["contract", "kontrak", "status kontrak", "tipe kontrak", "status kepegawaian", "status kepegawaian (contract)", "employment status", "status karyawan", "status"],
          "name": ["name", "nama unit organisasi", "unit"],
          "name of organizational unit": ["name of organizational unit", "organizational unit", "organisasi", "departemen", "dept"],
          "job title": ["job title", "jabatan", "posisi", "title"],
          "last name": ["last name", "nama", "nama lengkap", "nama karyawan", "employee name"],
          "d.o.birth": ["d.o.birth", "date of birth", "tgl lahir", "tanggal lahir", "dob"],
          "gender text": ["gender text", "gender", "jenis kelamin", "jk"],
          "religious denomination": ["religious denomination", "religion", "agama"],
          "ps group": ["ps group", "golongan", "pangkat", "group"],
          "lvl": ["lvl", "level"],
          "date": ["date", "tanggal masuk", "tgl masuk", "effective date", "tanggal"],
          "p0001-stext": ["p0001-stext", "stext", "deskripsi jabatan", "struktur"],
          "business area": ["business area", "kode ba", "ba", "kode cabang", "ba code"],
          "status_karyawan": ["status_karyawan", "status karyawan", "status kerja", "status aktif", "status keaktifan"],
          "tanggal_resign": ["tanggal_resign", "tgl resign", "tgl keluar", "tanggal keluar", "date of resignation", "resign date"],
          "alasan_resign": ["alasan_resign", "alasan keluar", "alasan", "keterangan resign", "reason of resignation"]
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

    // Mode Kolom (Tampilan Penuh vs Ringkas)
    const columnViewMode = {
      mk: 'FULL',
      abs: 'FULL',
      ss: 'FULL',
      qcc: 'FULL',
      sp: 'FULL',
      km: 'COMPACT'
    };

    function toggleColumnMode(moduleKey) {
      columnViewMode[moduleKey] = (columnViewMode[moduleKey] === 'FULL') ? 'COMPACT' : 'FULL';
      const isFull = columnViewMode[moduleKey] === 'FULL';
      const colCounts = { mk: 19, abs: 20, ss: 21, qcc: 29, sp: 5, km: 5 };
      const compactCounts = { mk: 6, abs: 9, ss: 8, qcc: 8, sp: 5, km: 5 };
      const btnText = document.getElementById(`btn-col-text-${moduleKey}`);
      if (btnText) {
        btnText.textContent = isFull ? `Kolom Lengkap (${colCounts[moduleKey]})` : `Kolom Ringkas (${compactCounts[moduleKey] || 4})`;
      }

      if (moduleKey === 'mk') filterMasterKaryawanTable();
      else if (moduleKey === 'abs') filterAbsensiTable();
      else if (moduleKey === 'ss') filterSSTable();
      else if (moduleKey === 'qcc') filterQCCTable();
      else if (moduleKey === 'sp') filterSPTable();
      else if (moduleKey === 'km') filterKMTable();
    }

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
      if (!val) return "";
      if (val instanceof Date) {
        return val.toISOString().slice(0, 10);
      }
      if (typeof val === 'number') {
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        return date.toISOString().slice(0, 10);
      }
      const s = String(val).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const parts = s.split(/[\/\-\.]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else if (parts[2].length === 4) {
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      return s;
    }

    // Perhitungan Dinamis Umur & Masa Kerja (Per Hari Ini)
    function calculateAgeAndService(dateVal) {
      if (!dateVal && dateVal !== 0) return "-";
      let str = String(dateVal).trim();
      if (!str || str === "-" || str === "null" || str === "undefined") return "-";

      let d = null;
      if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
        d = dateVal;
      } else if (typeof dateVal === 'number' || (/^\d{4,5}$/.test(str) && Number(str) > 20000 && Number(str) < 70000)) {
        d = new Date(Math.round((Number(str) - 25569) * 86400 * 1000));
      } else {
        const isoMatch = str.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
        if (isoMatch) {
          d = new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
        } else {
          const dmyMatch = str.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/);
          if (dmyMatch) {
            d = new Date(parseInt(dmyMatch[3], 10), parseInt(dmyMatch[2], 10) - 1, parseInt(dmyMatch[1], 10));
          } else {
            const parsed = new Date(str);
            if (!isNaN(parsed.getTime())) d = parsed;
          }
        }
      }

      if (!d || isNaN(d.getTime())) return "-";

      const today = new Date();
      let years = today.getFullYear() - d.getFullYear();
      let months = today.getMonth() - d.getMonth();
      if (today.getDate() < d.getDate()) {
        months--;
      }
      if (months < 0) {
        years--;
        months += 12;
      }
      if (years < 0) return "-";
      return `${years} Tahun ${months} Bulan`;
    }

    function parseExcelTime(val) {
      if (!val) return "";
      if (typeof val === 'number') {
        const totalMinutes = Math.round(val * 24 * 60);
        const hours = Math.floor(totalMinutes / 60) % 24;
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      }
      const s = String(val).trim();
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) {
        return s.slice(0, 5);
      }
      return s;
    }

    function safeFloat(val, fallback = 0) {
      if (val === null || val === undefined || val === '') return fallback;
      if (typeof val === 'number') return isNaN(val) ? fallback : Math.round(val * 100) / 100;
      const parsed = parseFloat(String(val).replace(',', '.'));
      return isNaN(parsed) ? fallback : Math.round(parsed * 100) / 100;
    }

    // 5 Kategori Baku Status Kepegawaian (Contract) DSO Lampung
    const STANDARD_CONTRACT_CATEGORIES = [
      'Tetap / Permanent',
      'Kontrak / PKWT',
      'Contracters',
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
      if (s.includes('contracter') || s.includes('contractor') || s.includes('outsource') || s.includes('vendor')) {
        return 'Contracters';
      }
      if (s.includes('kontrak') || s.includes('pkwt')) {
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
        'd.o.birth': ['tglLahir', 'tgl_lahir', 'dob', 'birthDate', 'dateOfBirth', 'tanggalLahir', 'tanggal_lahir'],
        'gender text': ['gender', 'jenisKelamin', 'jenis_kelamin', 'jk', 'sex'],
        'religious denomination': ['agama', 'religion', 'religiousDenomination'],
        'ps group': ['psGroup', 'ps_group', 'golongan', 'pangkat'],
        'lvl': ['lvl', 'level'],
        'date': ['date', 'joinDate', 'join_date', 'tglMasuk', 'tgl_masuk', 'effectiveDate', 'tanggal'],
        'p0001-stext': ['p0001-stext', 'stext', 'p0001Stext', 'p0001_stext', 'deskripsiJabatan', 'struktur'],
        'business area': ['kodeBA', 'kode_ba', 'ba', 'businessArea', 'business_area', 'kodeCabang', 'kode_cabang']
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
      if (normTarget === 'date') {
        const dt = findDate(row);
        if (dt) return dt;
      }
      if (normTarget === 'd.o.birth' || normTarget === 'tgl lahir' || normTarget === 'tanggal lahir' || normTarget === 'dob') {
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
      if (!val) return "";
      if (val instanceof Date && !isNaN(val)) {
        const d = String(val.getDate()).padStart(2, '0');
        const m = String(val.getMonth() + 1).padStart(2, '0');
        const y = val.getFullYear();
        return `${d}.${m}.${y}`;
      }
      const s = String(val).trim();
      if (!s) return "";
      // Format 6 digit DDMMYY (misal password login / format tglLahir sistem HR Astra)
      if (/^\d{6}$/.test(s)) {
        const d = s.slice(0, 2);
        const m = s.slice(2, 4);
        const yy = parseInt(s.slice(4, 6), 10);
        const y = yy > 50 ? (1900 + yy) : (2000 + yy);
        return `${d}.${m}.${y}`;
      }
      // Format 8 digit DDMMYYYY (misal 15051995)
      if (/^\d{8}$/.test(s)) {
        const d = s.slice(0, 2);
        const m = s.slice(2, 4);
        const y = s.slice(4, 8);
        return `${d}.${m}.${y}`;
      }
      if (/^\d{2}[\.\/\-]\d{2}[\.\/\-]\d{4}$/.test(s)) {
        return s.replace(/[\/\-]/g, '.');
      }
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        const parts = s.slice(0, 10).split('-');
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
      if (typeof val === 'number') {
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        if (!isNaN(date.getTime())) {
          const d = String(date.getDate()).padStart(2, '0');
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const y = date.getFullYear();
          return `${d}.${m}.${y}`;
        }
      }
      return s;
    }

    // Helper Perhitungan Estimasi Keterlambatan Absensi (Asumsi Jam Masuk 08.00 WIB)
    function calculateLatenessInfo(timeVal, targetHour = 8, targetMinute = 0) {
      if (timeVal === null || timeVal === undefined || timeVal === '' || timeVal === '-') {
        return {
          hasClockIn: false,
          isLate: false,
          diffMinutes: 0,
          hours: 0,
          minutes: 0,
          timeFormatted: '-',
          text: 'Tidak Clock In',
          badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200',
          badgeHtml: '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200"><i class="fa-solid fa-minus text-[10px]"></i> Tidak Clock In</span>'
        };
      }

      // Check if timeVal is already a text estimate from Code.gs (e.g. "Tepat Waktu", "Telat 15 Menit")
      if (typeof timeVal === 'string' && (timeVal.startsWith('Tepat') || timeVal.startsWith('Telat'))) {
        const isLate = timeVal.startsWith('Telat');
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
          const isSevere = timeVal.includes('Jam') || (parseInt(timeVal.replace(/[^0-9]/g, '') || '0', 10) > 30);
          const badgeClass = isSevere 
            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
            : 'bg-amber-50 text-amber-700 border border-amber-200';
          const iconClass = isSevere ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-clock';
          return {
            hasClockIn: true,
            isLate: true,
            diffMinutes: isSevere ? 35 : 15,
            timeFormatted: '> 08:00',
            text: timeVal,
            badgeClass: badgeClass,
            badgeHtml: `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeClass}"><i class="${iconClass} text-[10px]"></i> ${timeVal}</span>`
          };
        }
      }

      let h = -1;
      let m = -1;

      if (timeVal instanceof Date && !isNaN(timeVal.getTime())) {
        h = timeVal.getHours();
        m = timeVal.getMinutes();
      } else if (typeof timeVal === 'number' && timeVal >= 0 && timeVal < 1) {
        const totalSec = Math.round(timeVal * 86400);
        h = Math.floor(totalSec / 3600);
        m = Math.floor((totalSec % 3600) / 60);
      } else {
        const s = String(timeVal).trim();
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
          const match = s.match(/(\d{1,2})[:\.](\d{2})/);
          if (match) {
            h = parseInt(match[1], 10);
            m = parseInt(match[2], 10);
          }
        }
      }

      if (h === -1 || m === -1 || isNaN(h) || isNaN(m)) {
        return {
          hasClockIn: false,
          isLate: false,
          diffMinutes: 0,
          hours: 0,
          minutes: 0,
          timeFormatted: String(timeVal),
          text: 'Format Tidak Valid',
          badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200',
          badgeHtml: `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">${String(timeVal)}</span>`
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
      if (val === null || val === undefined || val === '' || val === '-') return '-';
      const info = calculateLatenessInfo(val);
      return info.hasClockIn ? info.timeFormatted : String(val);
    }

    async function callBackendAPI(actionName, payload = {}) {
      try {
        const bodyData = {
          action: actionName,
          ...payload // Kirim action dan payload saja tanpa SECRET_TOKEN
        };
    
        const response = await fetch(BACKEND_PROXY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(bodyData)
        });
    
        const result = await response.json();
        return result;
      } catch (err) {
        console.error("API Error:", err);
        return { success: false, message: "Gagal terhubung ke server backend: " + err.message };
      }
    }

    const KNOWN_BRANCHES = [
      { code: "D660", name: "Lampung A Yani", fullName: "Lampung A Yani (D660)", aliases: ["d660", "a yani", "ayani", "ahmad yani", "ahmadyani", "lampung a yani"] },
      { code: "D661", name: "Lampung S Hatta", fullName: "Lampung S Hatta (D661)", aliases: ["d661", "s hatta", "shatta", "soekarno hatta", "soekarnohatta", "lampung s hatta"] },
      { code: "D662", name: "Bandarjaya", fullName: "Bandarjaya (D662)", aliases: ["d662", "bandarjaya", "bandar jaya"] },
      { code: "D663", name: "Lampung Utara", fullName: "Lampung Utara (D663)", aliases: ["d663", "lampung utara", "lamut", "lam ut", "kotabumi", "kota bumi", "ktb"] },
      { code: "D664", name: "Lampung Timur", fullName: "Lampung Timur (D664)", aliases: ["d664", "lampung timur", "lamtim", "lam tim"] }
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
      if (user.isAllBranch === true) return true;
      const role = String(user.role || '').toLowerCase();
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

    const ALLOWED_BRANCH_CODES = ["D660", "D661", "D662", "D663", "D664"];

    /**
     * Menemukan info cabang (kode, nama, fullName) secara fleksibel & tahan spasi/tanda baca.
     * Hanya mencocokkan dengan 5 cabang resmi DSO Lampung.
     */
    function resolveBranchInfo(input) {
      if (!input) return null;
      const str = String(input).trim();
      const upper = str.toUpperCase();
      const clean = str.toLowerCase().replace(/[^a-z0-9]/g, "");

      // 1. Cek kode persis
      let found = KNOWN_BRANCHES.find(b => b.code.toUpperCase() === upper);
      if (found) return found;

      // 2. Cek alias dan nama bersih
      for (const b of KNOWN_BRANCHES) {
        const bClean = b.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (clean === bClean || (clean.length >= 4 && bClean.includes(clean)) || (bClean.length >= 4 && clean.includes(bClean))) {
          return b;
        }
        if (b.aliases) {
          for (const al of b.aliases) {
            const alClean = al.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (clean === alClean || (clean.length >= 4 && alClean.includes(clean)) || (alClean.length >= 4 && clean.includes(alClean))) {
              return b;
            }
          }
        }
      }

      return null;
    }

    /**
     * Mengambil Kode Cabang Kacab
     */
    function getUserBranchCode(user) {
      if (!user) return 'D660';
      if (Array.isArray(user.assignedBACodes) && user.assignedBACodes.length > 0) {
        const info = resolveBranchInfo(user.assignedBACodes[0]);
        return info ? info.code : user.assignedBACodes[0];
      }
      const cand = user.kodeBA || user.kode_ba || user.cabang || user.branch;
      const info = resolveBranchInfo(cand);
      return info ? info.code : (cand || 'D660');
    }

    /**
     * Mengambil Nama Cabang Kacab
     */
    function getUserBranchName(user) {
      if (!user) return 'Lampung A Yani';
      if (Array.isArray(user.assignedBACodes) && user.assignedBACodes.length > 0) {
        const info = resolveBranchInfo(user.assignedBACodes[0]);
        return info ? info.name : user.assignedBACodes[0];
      }
      const cand = user.cabang || user.kodeBA || user.kode_ba || user.branch;
      const info = resolveBranchInfo(cand);
      return info ? info.name : (cand || 'Cabang Terdaftar');
    }

    function resolveBACode(str) {
      if (!str) return '';
      const clean = String(str).toUpperCase().trim();
      const info = resolveBranchInfo(clean);
      return info ? info.code : '';
    }

    /**
     * Memeriksa apakah sebuah record / item berasal dari salah satu 5 Cabang Resmi DSO Lampung:
     * D660, D661, D662, D663, D664
     */
    function isLampungBranch(item) {
      if (!item) return false;

      // 1. Cek kode BA langsung
      const rawCode = item.kodeBA || item.kode_ba || item['Kode BA'] || item['Business area'] || item['Business Area'] || item['_kodeBA'] || getRowCellValue(item, 'Kode BA', SCHEMAS.Data_QCC) || getRowCellValue(item, 'Kode BA', SCHEMAS.Data_SS) || '';
      if (rawCode) {
        const ba = resolveBACode(rawCode);
        if (ALLOWED_BRANCH_CODES.includes(ba)) return true;
        const cleanUpper = String(rawCode).trim().toUpperCase();
        if (/^D\d{3}$/.test(cleanUpper) && !ALLOWED_BRANCH_CODES.includes(cleanUpper)) return false;
      }

      // 2. Cek teks P.subarea / Cabang
      const rawCabang = item.cabang || item.branch || item['Cabang'] || item['cabang'] || item['P.subarea'] || item['Nama Cabang'] || item['Cabang/Departemen'] || getRowCellValue(item, 'Cabang/Departemen', SCHEMAS.Data_QCC) || getRowCellValue(item, 'Cabang', SCHEMAS.Data_SS) || '';
      if (rawCabang) {
        const ba = resolveBACode(rawCabang);
        if (ALLOWED_BRANCH_CODES.includes(ba)) return true;
      }

      // 3. Cek Wilayah (jika menyebut Lampung)
      const rawWilayah = item.wilayah || item['Wilayah'] || getRowCellValue(item, 'Wilayah', SCHEMAS.Master_Karyawan) || '';
      if (rawWilayah && String(rawWilayah).toLowerCase().includes('lampung')) {
        if (!rawCode || ALLOWED_BRANCH_CODES.includes(resolveBACode(rawCode))) return true;
      }

      // 4. Relasi NPK ke Master Karyawan
      const npk = safeString(item['NPK'] || item['Personnel no.'] || item['Personnel No.'] || item.npk);
      const masterList = (window.masterFullPayload && window.masterFullPayload.employeeList) || 
                         (window.fullUnscopedPayload && window.fullUnscopedPayload.employeeList) || 
                         (window.masterFullPayload && window.masterFullPayload.rawTables && window.masterFullPayload.rawTables.Master_Karyawan) || [];
      if (npk && masterList.length > 0) {
        const emp = masterList.find(e => safeString(e.npk || e['Personnel no.'] || e['Personnel No.']) === npk);
        if (emp && emp !== item) {
          const empCode = emp.kodeBA || emp['Business area'] || emp['Business Area'] || emp['Kode BA'] || '';
          if (empCode && ALLOWED_BRANCH_CODES.includes(resolveBACode(empCode))) return true;
          const empCabang = emp.cabang || emp['P.subarea'] || emp['Cabang'] || '';
          if (empCabang && ALLOWED_BRANCH_CODES.includes(resolveBACode(empCabang))) return true;
          const empWil = emp.wilayah || emp['Wilayah'] || '';
          if (empWil && String(empWil).toLowerCase().includes('lampung')) return true;
        }
      }

      return false;
    }

    /**
     * Menyaring payload agar eksklusif hanya memuat data 5 Cabang DSO Lampung
     */
    function sanitizeLampungPayload(payload) {
      if (!payload) return payload;
      if (Array.isArray(payload.employeeList)) {
        payload.employeeList = payload.employeeList.filter(e => isLampungBranch(e));
      }
      if (Array.isArray(payload.qccList)) {
        payload.qccList = payload.qccList.filter(q => isLampungBranch(q));
      }
      if (payload.rawTables) {
        const sheets = ['Master_Karyawan', 'Data_Kehadiran', 'Data_SS', 'Data_QCC', 'Data_SP', 'Knowledge_management', 'Data_KM'];
        sheets.forEach(sh => {
          if (Array.isArray(payload.rawTables[sh])) {
            payload.rawTables[sh] = payload.rawTables[sh].filter(r => isLampungBranch(r));
          }
        });
      }
      return payload;
    }

    /**
     * Mencocokkan data karyawan / circle / presensi / modul dengan target cabang
     * Eksklusif hanya mengizinkan data dengan kode BA D660, D661, D662, D663, D664
     */
    function matchBranch(item, targetBranchCode) {
      if (!item) return false;

      // Filter Mutlak: Tolak seluruh data di luar 5 cabang Lampung (D660, D661, D662, D663, D664)
      if (!isLampungBranch(item)) return false;

      // Jika target 'ALL', loloskan seluruh data 5 cabang Lampung
      if (!targetBranchCode || targetBranchCode === 'ALL') return true;

      const targetInfo = resolveBranchInfo(targetBranchCode);
      const targetCode = (targetInfo ? targetInfo.code : String(targetBranchCode)).toUpperCase().trim();
      const targetNameClean = targetInfo ? targetInfo.name.toLowerCase().replace(/[^a-z0-9]/g, "") : targetCode.toLowerCase();

      // 1. Ekstraksi kode cabang dari objek
      const rawCode = item.kodeBA || item.kode_ba || item['Kode BA'] || item['Business area'] || item['Business Area'] || item['_kodeBA'] || getRowCellValue(item, 'Kode BA', SCHEMAS.Data_QCC) || getRowCellValue(item, 'Kode BA', SCHEMAS.Data_SS) || '';
      const itemCode = String(rawCode).toUpperCase().trim();

      if (itemCode) {
        if (itemCode === targetCode) return true;
        if (resolveBACode(itemCode) === targetCode) return true;
      }

      // 2. Ekstraksi teks cabang dari objek
      const rawCabang = item.cabang || item.branch || item['Cabang'] || item['cabang'] || item['P.subarea'] || item['Nama Cabang'] || item['Cabang/Departemen'] || getRowCellValue(item, 'Cabang/Departemen', SCHEMAS.Data_QCC) || getRowCellValue(item, 'Cabang', SCHEMAS.Data_SS) || '';
      const itemCabangClean = String(rawCabang).toLowerCase().replace(/[^a-z0-9]/g, "");

      if (itemCabangClean) {
        if (itemCabangClean.includes(targetCode.toLowerCase())) return true;
        if (itemCabangClean.includes(targetNameClean) || targetNameClean.includes(itemCabangClean)) return true;
        if (targetInfo && targetInfo.aliases) {
          for (const al of targetInfo.aliases) {
            const alClean = al.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (itemCabangClean.includes(alClean) || alClean.includes(itemCabangClean)) return true;
          }
        }
      }

      // 3. Relasi NPK ke Master Karyawan
      const npk = safeString(item['NPK'] || item['Personnel no.'] || item['Personnel No.'] || item.npk);
      const masterList = (window.masterFullPayload && window.masterFullPayload.employeeList) || 
                         (window.fullUnscopedPayload && window.fullUnscopedPayload.employeeList) || 
                         (window.masterFullPayload && window.masterFullPayload.rawTables && window.masterFullPayload.rawTables.Master_Karyawan) || [];
      if (npk && masterList.length > 0) {
        const emp = masterList.find(e => safeString(e.npk || e['Personnel no.'] || e['Personnel No.']) === npk);
        if (emp && emp !== item) {
          return matchBranch(emp, targetCode);
        }
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

    // Helper formatting cell values based on canonical column type
    function formatColumnCell(col, val) {
      if (val === null || val === undefined || val === '') return '<span class="text-slate-300">-</span>';
      const norm = normalizeHeaderName(col);
      
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
      if (norm === 'status_karyawan' || norm === 'status karyawan') {
        const isResign = String(val).trim().toLowerCase() === 'resign';
        return isResign
          ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><i class="fa-solid fa-user-xmark mr-1 text-[9px]"></i>Resign</span>`
          : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-user-check mr-1 text-[9px]"></i>Aktif</span>`;
      }
      if (norm === 'd.o.birth' || norm === 'tanggal lahir' || norm === 'tgl lahir' || norm === 'dob') {
        const dateStr = formatDatabaseDate(val);
        const ageStr = calculateAgeAndService(val);
        if (ageStr !== '-') {
          return `<div><span class="font-medium text-slate-800">${dateStr}</span><span class="text-[10px] text-slate-400 block">${ageStr}</span></div>`;
        }
        return dateStr;
      }
      if (norm === 'date' || norm === 'tanggal' || norm === 'tgl' || norm.includes('date clock')) {
        const dateStr = formatDatabaseDate(val);
        if (norm === 'date') {
          const serviceStr = calculateAgeAndService(val);
          if (serviceStr !== '-') {
            return `<div><span class="font-medium text-slate-800">${dateStr}</span><span class="text-[10px] text-slate-400 block">${serviceStr}</span></div>`;
          }
        }
        return dateStr;
      }
      if (norm.includes('time clock in') || norm.includes('time clock out') || norm === 'time' || norm === 'jam' || norm === 'time in' || norm === 'time out') {
        const timeStr = formatDatabaseTime(val);
        return `<span class="font-mono font-bold text-slate-800">${timeStr}</span>`;
      }
      if (norm.includes('estimasi telat') || norm.includes('keterlambatan')) {
        const info = calculateLatenessInfo(val);
        return info.badgeHtml;
      }
      if (norm === 'personnel no.' || norm === 'npk' || norm === 'no' || norm.includes('registrasi') || norm.includes('kode ba') || norm === 'business area') {
        return `<span class="font-mono font-semibold">${val}</span>`;
      }
      return String(val);
    }

    // ========================================================
    // SINKRONISASI DATABASE & CRUD ROW DATA (KHUSUS ADMIN)
    // ========================================================
    async function syncSheetToBackend(targetSheet) {
      const schema = SCHEMAS[targetSheet];
      if (!schema) return { success: false, message: 'Skema tabel tidak ditemukan.' };
      const rawRows = (currentDashboardPayload?.rawTables && currentDashboardPayload.rawTables[targetSheet]) || [];
      const canonicalColumns = schema.columns;
      const formattedDataRows = rawRows.map(obj => canonicalColumns.map(col => (obj[col] !== undefined && obj[col] !== null) ? obj[col] : ''));

      return await callBackendAPI("IMPORT_EXCEL", {
        targetSheet: schema.sheetName,
        headers: canonicalColumns,
        dataRows: formattedDataRows
      });
    }