/**
 * ==============================================================================
 * D-PERFORM - DAIHATSU HR & PERFORMANCE HUB (BACKEND GOOGLE APPS SCRIPT)
 * PT ASTRA DAIHATSU MOTOR - DSO LAMPUNG
 * ==============================================================================
 * Versi: 2026.5.0 (Dukungan Penuh CRUD Baris & Sinkronisasi Database Realtime)
 * Tab Database:
 *   1. Username
 *   2. Master_Karyawan
 *   3. Data_Kehadiran
 *   4. Data_SS
 *   5. Data_QCC
 *   6. Data_SP
 *   7. Knowledge_management
 * ==============================================================================
 */

// 1. KONFIGURASI SPREADSHEET & KEAMANAN TOKEN
// ID Spreadsheet dari Google Drive / URL Spreadsheet
const SPREADSHEET_ID = "1DJtZ4VkcWY3ySqzloGaFBVaNsEamQaeaOezJw4lz7uw";

// Samakan persis dengan nilai SECRET_TOKEN di Environment Variables Vercel
const APP_SECRET_TOKEN = "DASHBOARDHRDSOLAMPUNG2026";

// Nama Tab Sheet Database
const SHEET_USER       = "Username";
const SHEET_KARYAWAN   = "Master_Karyawan";
const SHEET_KEHADIRAN  = "Data_Kehadiran";
const SHEET_SS         = "Data_SS";
const SHEET_QCC        = "Data_QCC";
const SHEET_SP         = "Data_SP";
const SHEET_KM         = "Knowledge_management";

// Peta Kode Cabang Wilayah Lampung
const DSO_BRANCH_MAP = {
  "D660": { name: "Lampung A Yani", alias: ["D660", "A YANI", "AHMAD YANI", "LAMPUNG A YANI"] },
  "D661": { name: "Lampung S Hatta", alias: ["D661", "S HATTA", "SOEKARNO HATTA", "LAMPUNG S HATTA"] },
  "D662": { name: "Bandarjaya", alias: ["D662", "BANDAR JAYA", "BANDARJAYA"] },
  "D663": { name: "Kotabumi", alias: ["D663", "KOTA BUMI", "KOTABUMI", "LAMPUNG UTARA"] },
  "D664": { name: "Lampung Timur", alias: ["D664", "LAMTIM", "LAMPUNG TIMUR"] }
};

const ALL_LAMPUNG_CODES = ["D660", "D661", "D662", "D663", "D664"];

/**
 * Membuka Spreadsheet secara aman (mengutamakan Container Spreadsheet aktif)
 */
function getSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }
  throw new Error("Spreadsheet tidak dapat dibuka. Pastikan ID Spreadsheet valid dan script memiliki izin akses.");
}

/**
 * Helper Format Response JSON (CORS Friendly)
 */
function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper Format Tanggal ke Standar YYYY-MM-DD atau DD.MM.YYYY
 */
function formatAppsScriptDate(val) {
  if (!val) return "";
  if (val instanceof Date && !isNaN(val.getTime())) {
    try {
      return Utilities.formatDate(val, "Asia/Jakarta", "yyyy-MM-dd");
    } catch (e) {
      const d = String(val.getDate()).padStart(2, "0");
      const m = String(val.getMonth() + 1).padStart(2, "0");
      const y = val.getFullYear();
      return `${y}-${m}-${d}`;
    }
  }
  if (typeof val === "number" && val > 30000 && val < 60000) {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      try {
        return Utilities.formatDate(date, "Asia/Jakarta", "yyyy-MM-dd");
      } catch (e) {}
    }
  }
  let s = String(val).trim();
  if (s.includes("T") && s.endsWith("Z")) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      try {
        return Utilities.formatDate(d, "Asia/Jakarta", "yyyy-MM-dd");
      } catch (e) {}
    }
  }
  return s;
}

/**
 * Helper Format Jam/Waktu ke Standar HH:mm
 */
function formatAppsScriptTime(val) {
  if (!val) return "";
  if (val instanceof Date && !isNaN(val.getTime())) {
    try {
      return Utilities.formatDate(val, "Asia/Jakarta", "HH:mm");
    } catch (e) {
      const h = String(val.getHours()).padStart(2, "0");
      const m = String(val.getMinutes()).padStart(2, "0");
      return `${h}:${m}`;
    }
  }
  if (typeof val === "number" && val >= 0 && val < 1) {
    const totalSec = Math.round(val * 86400);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
    return `${h}:${m}`;
  }
  let s = String(val).trim();
  if (s.includes("T") && s.endsWith("Z")) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      try {
        return Utilities.formatDate(d, "Asia/Jakarta", "HH:mm");
      } catch (e) {}
    }
  }
  const match = s.match(/(\d{1,2})[:\.](\d{2})/);
  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }
  return s;
}

/**
 * Melayani Web App GET Request
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    const action = e.parameter.action;
    if (action === "GET_DASHBOARD") {
      const user = { assignedBACodes: ALL_LAMPUNG_CODES, role: "Admin", isAllBranch: true };
      return responseJSON(getDashboardData(user, e.parameter.branch || "ALL", e.parameter.period || "ALL"));
    }
    return responseJSON({ success: true, message: "Koneksi Backend Apps Script D-PERFORM Aktif!" });
  }

  return HtmlService.createHtmlOutput("<h2>Backend API D-PERFORM DSO Lampung Aktif!</h2><p>Gunakan endpoint POST melalui proxy Vercel.</p>")
    .setTitle("D-PERFORM - Daihatsu HR & Performance Hub");
}

/**
 * Memproses POST Request (Login, Dashboard, Import, Sync, Update Row, Delete Row) dengan Validasi Token
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responseJSON({ success: false, message: "Payload kosong." });
    }

    const contents = JSON.parse(e.postData.contents);

    // Validasi Keamanan Token dari Proxy Vercel
    if (APP_SECRET_TOKEN && APP_SECRET_TOKEN.trim() !== "" && APP_SECRET_TOKEN !== "GANTI_DENGAN_SECRET_TOKEN_DARI_VERCEL") {
      if (!contents.token || contents.token !== APP_SECRET_TOKEN) {
        return responseJSON({ success: false, message: "Akses ditolak: Token autentikasi tidak valid atau tidak cocok." });
      }
    }

    const action = contents.action;

    if (action === "LOGIN") {
      return responseJSON(loginUser(contents.username, contents.password));
    }

    if (action === "GET_DASHBOARD") {
      return responseJSON(getDashboardData(contents.user, contents.branch, contents.period));
    }

    if (action === "UPDATE_ROW") {
      return responseJSON(updateRowInSheet(contents.targetSheet, contents.keyField, contents.keyValue, contents.rowIndex, contents.rowData));
    }

    if (action === "DELETE_ROW") {
      return responseJSON(deleteRowInSheet(contents.targetSheet, contents.keyField, contents.keyValue, contents.rowIndex, contents.secondaryField, contents.secondaryValue));
    }

    if (action === "IMPORT_EXCEL") {
      return responseJSON(importExcelToSheet(contents.targetSheet, contents.headers, contents.dataRows));
    }

    if (action === "SYNC_SHEET") {
      return responseJSON(syncSheetData(contents.targetSheet, contents.headers, contents.dataRows));
    }

    return responseJSON({ success: false, message: "Action tidak dikenali." });
  } catch (err) {
    return responseJSON({ success: false, message: "Server Error: " + err.message });
  }
}

/**
 * Membaca Sheet menjadi Array of Objects
 */
function getSheetObjects(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0].map(h => String(h).trim());
  const rows = data.slice(1);

  return rows.map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  }).filter(row => {
    // Abaikan baris kosong
    return Object.values(row).some(v => v !== undefined && v !== null && String(v).trim() !== "");
  });
}

/**
 * Helper Mengambil Nilai dari Object dengan Ragam Variasi Nama Kolom
 */
function getVal(obj, ...keys) {
  if (!obj) return "";
  for (let k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== "") {
      return obj[k];
    }
    const lowerKey = Object.keys(obj).find(x => x.toLowerCase() === k.toLowerCase());
    if (lowerKey && obj[lowerKey] !== undefined && obj[lowerKey] !== null && String(obj[lowerKey]).trim() !== "") {
      return obj[lowerKey];
    }
  }
  return "";
}

/**
 * Normalisasi Kode BA Wilayah Lampung
 */
function resolveBACode(str) {
  if (!str) return "D660";
  let clean = String(str).toUpperCase().trim();

  // Pemetaan angka murni (660 -> D660)
  if (clean === "660" || clean === "0660" || clean === "2660") return "D660";
  if (clean === "661" || clean === "0661" || clean === "2661") return "D661";
  if (clean === "662" || clean === "0662" || clean === "2662") return "D662";
  if (clean === "663" || clean === "0663" || clean === "2663") return "D663";
  if (clean === "664" || clean === "0664" || clean === "2664") return "D664";

  for (let code in DSO_BRANCH_MAP) {
    if (clean === code) return code;
    for (let alias of DSO_BRANCH_MAP[code].alias) {
      if (clean.includes(alias)) return code;
    }
  }
  return clean;
}

// ==============================================================================
// 2. AUTENTIKASI LOGIN
// ==============================================================================
function loginUser(username, password) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_USER) || ss.getSheetByName("Users") || ss.getSheetByName("User");
    if (!sheet) throw new Error(`Sheet '${SHEET_USER}' tidak ditemukan di Spreadsheet.`);

    const users = getSheetObjects(sheet);
    const cleanUname = String(username).trim();
    const cleanPass = String(password).trim();

    for (let u of users) {
      const dbUname = String(getVal(u, "Username", "User_ID", "NPK", "User")).trim();

      let dbPassRaw = getVal(u, "Password", "Pass", "PIN");
      let dbPass = "";

      if (dbPassRaw instanceof Date) {
        const d = String(dbPassRaw.getDate()).padStart(2, "0");
        const m = String(dbPassRaw.getMonth() + 1).padStart(2, "0");
        const y = String(dbPassRaw.getFullYear()).slice(-2);
        dbPass = `${d}${m}${y}`;
      } else {
        dbPass = String(dbPassRaw).replace(/[^0-9a-zA-Z]/g, "").trim();
      }

      if (dbUname.toLowerCase() === cleanUname.toLowerCase() && (dbPass === cleanPass || String(dbPassRaw).trim() === cleanPass)) {
        const userRole = String(getVal(u, "Role", "Peran", "Hak Akses")).trim() || "User";
        const businessArea = String(getVal(u, "Business area", "Business Area", "Cabang", "Kode BA")).trim();
        let assignedBACodes = [];

        if (userRole.toLowerCase() === "admin" || userRole.toLowerCase() === "hrd" || businessArea.toUpperCase() === "ALL") {
          assignedBACodes = [...ALL_LAMPUNG_CODES];
        } else {
          const resolved = resolveBACode(businessArea);
          assignedBACodes = ALL_LAMPUNG_CODES.includes(resolved) ? [resolved] : [ALL_LAMPUNG_CODES[0]];
        }

        return {
          success: true,
          user: {
            username: dbUname,
            nama: getVal(u, "Nama_Lengkap", "Name", "Nama", "Nama Lengkap"),
            role: userRole,
            jabatan: getVal(u, "Jabatan", "Job Title", "Posisi"),
            assignedBACodes: assignedBACodes,
            assignedBranches: assignedBACodes.map(c => DSO_BRANCH_MAP[c] ? DSO_BRANCH_MAP[c].name : c),
            isAllBranch: userRole.toLowerCase() === "admin" || userRole.toLowerCase() === "hrd" || businessArea.toUpperCase() === "ALL"
          }
        };
      }
    }

    return { success: false, message: "NPK (Username) atau Password / Tanggal Lahir salah!" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// ==============================================================================
// 3. PENGAMBILAN DATA DASHBOARD (100% DARI DATABASE SPREADSHEET RIIL)
// ==============================================================================
function getDashboardData(user, selectedBranch, selectedPeriod) {
  try {
    const ss = getSpreadsheet();

    const empSheet = ss.getSheetByName(SHEET_KARYAWAN) || ss.getSheetByName("Karyawan");
    const absSheet = ss.getSheetByName(SHEET_KEHADIRAN) || ss.getSheetByName("Data_Absensi") || ss.getSheetByName("Absensi");
    const ssSheet  = ss.getSheetByName(SHEET_SS)        || ss.getSheetByName("SS");
    const qccSheet = ss.getSheetByName(SHEET_QCC)       || ss.getSheetByName("QCC");
    const spSheet  = ss.getSheetByName(SHEET_SP)        || ss.getSheetByName("SP") || ss.getSheetByName("Kedisiplinan");
    const kmSheet  = ss.getSheetByName(SHEET_KM)        || ss.getSheetByName("Data_KM") || ss.getSheetByName("Knowledge_Management");

    const rawEmp = empSheet ? getSheetObjects(empSheet) : [];
    const rawAbs = absSheet ? getSheetObjects(absSheet) : [];
    const rawSS  = ssSheet  ? getSheetObjects(ssSheet)  : [];
    const rawQCC = qccSheet ? getSheetObjects(qccSheet) : [];
    const rawSP  = spSheet  ? getSheetObjects(spSheet)  : [];
    const rawKM  = kmSheet  ? getSheetObjects(kmSheet)  : [];

    let assignedCodes = (user && user.assignedBACodes && user.assignedBACodes.length > 0)
      ? user.assignedBACodes
      : [...ALL_LAMPUNG_CODES];

    // Filter Karyawan Lampung
    let validEmployees = rawEmp.map(item => {
      const baRaw = getVal(item, "Business area", "Business Area", "P.subarea", "Cabang", "Kode BA");
      const baCode = resolveBACode(baRaw) || "D660";
      const branchName = DSO_BRANCH_MAP[baCode] ? DSO_BRANCH_MAP[baCode].name : String(baRaw);

      let dobVal = getVal(item, "D.o.birth", "Date of Birth", "Tgl Lahir", "Tanggal Lahir");
      let dateVal = getVal(item, "Date", "Tgl Masuk", "Join Date", "Tanggal");

      const statusKaryawanVal = getVal(item, "Status_Karyawan", "Status Karyawan", "Status") || "Aktif";
      const tglResignVal = formatAppsScriptDate(getVal(item, "Tanggal_Resign", "Tanggal Resign", "Tgl Resign"));
      const alasanResignVal = getVal(item, "Alasan_Resign", "Alasan Resign", "Alasan PHK");

      return {
        npk: String(getVal(item, "Personnel no.", "NPK", "ID Karyawan", "NIK")).trim(),
        nama: getVal(item, "Last name", "Nama Lengkap", "Nama", "Name", "Employee Name"),
        jabatan: getVal(item, "Job Title", "Jabatan", "Posisi"),
        organisasi: getVal(item, "Name of organizational unit", "Divisi", "Departemen", "Unit"),
        kontrak: getVal(item, "Contract", "Status Kontrak", "Status Kepegawaian"),
        kodeBA: baCode,
        cabang: branchName,
        dob: formatAppsScriptDate(dobVal),
        date: formatAppsScriptDate(dateVal),
        gender: getVal(item, "Gender text", "Jenis Kelamin"),
        agama: getVal(item, "Religious denomination", "Agama"),
        psGroup: getVal(item, "PS group", "Golongan"),
        lvl: getVal(item, "Lvl", "Level"),
        stext: getVal(item, "P0001-STEXT", "Status"),
        statusKaryawan: statusKaryawanVal,
        Status_Karyawan: statusKaryawanVal,
        tanggalResign: tglResignVal,
        Tanggal_Resign: tglResignVal,
        alasanResign: alasanResignVal,
        Alasan_Resign: alasanResignVal,
        raw: item
      };
    });

    if (user && !user.isAllBranch) {
      validEmployees = validEmployees.filter(e => assignedCodes.includes(e.kodeBA));
    }

    if (selectedBranch && selectedBranch !== "ALL") {
      validEmployees = validEmployees.filter(e => e.kodeBA === selectedBranch || e.cabang === selectedBranch);
    }

    // Pemrosesan Data_Kehadiran (Riil dari Sheet)
    const validAbs = rawAbs.map(item => {
      const npk = String(getVal(item, "NPK", "Personnel no.", "ID Karyawan", "NIK")).trim();
      const emp = validEmployees.find(e => String(e.npk).trim() === npk);

      const baRaw = getVal(item, "Cabang", "Kode BA", "Business area", "Branch", "P.subarea");
      const baCode = resolveBACode(baRaw) || (emp ? emp.kodeBA : "");
      const cabangName = DSO_BRANCH_MAP[baCode] ? DSO_BRANCH_MAP[baCode].name : (baRaw || (emp ? emp.cabang : "DSO Lampung"));

      const tglRaw = getVal(item, "Date", "Tanggal", "Tgl", "Date Clock In");
      const tglClockInRaw = getVal(item, "Date Clock In", "Tanggal Clock In", "Date", "Tanggal");
      const tglClockOutRaw = getVal(item, "Date Clock Out", "Tanggal Clock Out", "Date", "Tanggal");

      const timeClockInRaw = getVal(item, "Time Clock In", "Clock In", "Time", "Jam Masuk", "Waktu Masuk", "Time In");
      const timeClockOutRaw = getVal(item, "Time Clock Out", "Clock Out", "Jam Keluar", "Jam Pulang", "Waktu Pulang", "Time Out");

      const tglFormatted = formatAppsScriptDate(tglRaw);
      const tglClockInFormatted = formatAppsScriptDate(tglClockInRaw);
      const tglClockOutFormatted = formatAppsScriptDate(tglClockOutRaw);

      const timeClockInFormatted = formatAppsScriptTime(timeClockInRaw);
      const timeClockOutFormatted = formatAppsScriptTime(timeClockOutRaw);

      // Hitung Status Kehadiran / Keterlambatan (Asumsi Masuk 08.00 WIB)
      let estimasiTelatText = getVal(item, "Status Kehadiran", "Estimasi Telat (Asumsi 08.00)", "Estimasi Telat");
      let isLate = false;

      if (!estimasiTelatText && timeClockInFormatted && timeClockInFormatted !== "-") {
        const timeParts = timeClockInFormatted.split(":");
        if (timeParts.length >= 2) {
          const h = parseInt(timeParts[0], 10);
          const m = parseInt(timeParts[1], 10);
          if (h > 8 || (h === 8 && m > 0)) {
            isLate = true;
            const diff = (h * 60 + m) - (8 * 60);
            estimasiTelatText = `Telat ${diff} Menit`;
          } else {
            estimasiTelatText = "Tepat Waktu";
          }
        }
      }

      return {
        ...item,
        "NPK": npk,
        "Employee Name": getVal(item, "Employee Name", "Nama", "Last name") || (emp ? emp.nama : "-"),
        "Wilayah": getVal(item, "Wilayah", "Area") || "DSO Lampung",
        "Cabang": cabangName,
        "Date": tglFormatted,
        "Date Clock In": tglClockInFormatted,
        "Time Clock In": timeClockInFormatted,
        "Date Clock Out": tglClockOutFormatted,
        "Time Clock Out": timeClockOutFormatted,
        "Status Kehadiran": estimasiTelatText || (isLate ? "Terlambat" : "Tepat Waktu"),
        "Durasi Kerja (Work Hours)": getVal(item, "Durasi Kerja (Work Hours)", "Durasi Kerja", "Work Hours") || "8.5",
        "Assigned Work Location": getVal(item, "Assigned Work Location", "Work Location") || cabangName,
        "Need CICO Approval": getVal(item, "Need CICO Approval", "Approval") || "NO",
        "In Radius Clock in": getVal(item, "In Radius Clock in", "In Radius In") || "YES",
        "Location Clock In": getVal(item, "Location Clock In", "Lokasi In") || "",
        "In Radius Clock Out": getVal(item, "In Radius Clock Out", "In Radius Out") || "YES",
        "Location Clock Out": getVal(item, "Location Clock Out", "Lokasi Out") || "",
        "Clock In Source": getVal(item, "Clock In Source") || "Mobile App GPS",
        "Clock Out Source": getVal(item, "Clock Out Source") || "Mobile App GPS",
        "Keterangan": getVal(item, "Keterangan", "Status", "Ket") || (isLate ? "Terlambat Masuk" : "Hadir Tepat Waktu"),
        "_kodeBA": baCode || (emp ? emp.kodeBA : "")
      };
    }).filter(item => {
      if (selectedBranch && selectedBranch !== "ALL") {
        return item._kodeBA === selectedBranch || item.Cabang === selectedBranch || (item.NPK && validEmployees.some(e => String(e.npk).trim() === String(item.NPK).trim()));
      }
      return true;
    });

    // Pemrosesan Data_SS (Riil dari Sheet)
    const validSS = rawSS.map((item, idx) => {
      const npk = String(getVal(item, "NPK", "Personnel no.", "ID Karyawan")).trim();
      const emp = validEmployees.find(e => String(e.npk).trim() === npk);
      const baCode = resolveBACode(getVal(item, "Kode BA", "Cabang")) || (emp ? emp.kodeBA : "D660");
      const cabangName = DSO_BRANCH_MAP[baCode] ? DSO_BRANCH_MAP[baCode].name : (emp ? emp.cabang : "Lampung A Yani");

      return {
        ...item,
        "No": getVal(item, "No") || String(idx + 1),
        "Registrasi": getVal(item, "Registrasi", "No.Registrasi"),
        "Nama": getVal(item, "Nama", "Employee Name", "Last name") || (emp ? emp.nama : "-"),
        "NPK": npk,
        "Wilayah": getVal(item, "Wilayah", "Area") || "DSO Lampung",
        "Cabang": cabangName,
        "Kode BA": baCode,
        "Bagian": getVal(item, "Bagian", "Divisi", "Departemen"),
        "Tema": getVal(item, "Tema", "Judul"),
        "Fasilitator": getVal(item, "Fasilitator"),
        "NPK Fasilitator": getVal(item, "NPK Fasilitator"),
        "Diterima Bulan": getVal(item, "Diterima Bulan", "Bulan"),
        "Kategori": getVal(item, "Kategori"),
        "No.Akun AstraPay": getVal(item, "No.Akun AstraPay", "AstraPay"),
        "Nama Akun": getVal(item, "Nama Akun"),
        "Status Reward": getVal(item, "Status Reward", "Status"),
        "Reward": getVal(item, "Reward"),
        "No.Berita Acara": getVal(item, "No.Berita Acara"),
        "No.BPH": getVal(item, "No.BPH"),
        "Distribusi Reward": getVal(item, "Distribusi Reward"),
        "Keterangan": getVal(item, "Keterangan")
      };
    }).filter(item => {
      if (selectedBranch && selectedBranch !== "ALL") {
        return item["Kode BA"] === selectedBranch || item.Cabang === selectedBranch || (item.NPK && validEmployees.some(e => String(e.npk).trim() === String(item.NPK).trim()));
      }
      return true;
    });

    // Pemrosesan Data_QCC (Riil dari Sheet)
    const validQCC = rawQCC.map((item, idx) => {
      const baCode = resolveBACode(getVal(item, "Kode BA", "Cabang")) || "D660";
      const cabangName = DSO_BRANCH_MAP[baCode] ? DSO_BRANCH_MAP[baCode].name : "Lampung A Yani";
      return {
        ...item,
        "No": getVal(item, "No") || String(idx + 1),
        "No.Registrasi": getVal(item, "No.Registrasi", "Registrasi"),
        "Nama Tim": getVal(item, "Nama Tim", "Nama Circle"),
        "Wilayah/Divisi": getVal(item, "Wilayah/Divisi", "Wilayah") || "DSO Lampung",
        "Cabang/Departemen": getVal(item, "Cabang/Departemen", "Cabang") || cabangName,
        "Kode BA": baCode,
        "Bagian": getVal(item, "Bagian", "Departemen"),
        "Fasilitator": getVal(item, "Fasilitator"),
        "Leader": getVal(item, "Leader"),
        "Tema": getVal(item, "Tema", "Judul"),
        "Kategori": getVal(item, "Kategori"),
        "Status": getVal(item, "Status", "PDCA") || "Action",
        "Pendaftaran diterima": formatAppsScriptDate(getVal(item, "Pendaftaran diterima")),
        "L 1-8 diterima": formatAppsScriptDate(getVal(item, "L 1-8 diterima")),
        "No.Berita Acara": getVal(item, "No.Berita Acara"),
        "Status Reward": getVal(item, "Status Reward"),
        "No.BPH": getVal(item, "No.BPH"),
        "Tahun Konvensi": getVal(item, "Tahun Konvensi") || "2025"
      };
    }).filter(item => {
      if (selectedBranch && selectedBranch !== "ALL") {
        return item["Kode BA"] === selectedBranch;
      }
      return true;
    });

    // Pemrosesan Data_SP (Riil dari Sheet)
    const validSP = rawSP.map(item => {
      const npk = String(getVal(item, "NPK", "Personnel no.")).trim();
      const emp = validEmployees.find(e => String(e.npk).trim() === npk);
      const baCode = resolveBACode(getVal(item, "Kode BA", "Business area", "Cabang")) || (emp ? emp.kodeBA : "-");
      return {
        ...item,
        "NPK": npk,
        "Nama": getVal(item, "Nama", "Last name", "Nama Lengkap") || (emp ? emp.nama : "-"),
        "Kode BA": baCode,
        "Tingkat SP": getVal(item, "Tingkat SP", "Status SP", "SP"),
        "Alasan": getVal(item, "Alasan", "Pelanggaran", "Keterangan")
      };
    }).filter(item => {
      if (selectedBranch && selectedBranch !== "ALL") {
        return item["Kode BA"] === selectedBranch || (item.NPK && validEmployees.some(e => String(e.npk).trim() === String(item.NPK).trim()));
      }
      return true;
    });

    // Pemrosesan Knowledge Management (Sesuai Kolom: NPK, NAMA, JUDUL, TANGGAL, TIME)
    const validKM = rawKM.map(item => {
      const npk = String(getVal(item, "NPK", "Personnel no.", "ID Karyawan")).trim();
      const nama = getVal(item, "NAMA", "Nama", "Name", "Last name");
      const judul = getVal(item, "JUDUL", "Judul", "Tema", "Title");
      let tglRaw = getVal(item, "TANGGAL", "Tanggal", "Date", "Tgl");
      let timeRaw = getVal(item, "TIME", "Time", "Waktu", "Jam");

      const tglFormatted = formatAppsScriptDate(tglRaw);
      const timeFormatted = formatAppsScriptTime(timeRaw);

      const emp = validEmployees.find(e => String(e.npk).trim() === npk);
      const cabang = emp ? emp.cabang : "DSO Lampung";
      const kodeBA = emp ? emp.kodeBA : "";

      return {
        ...item,
        "NPK": npk,
        "NAMA": nama || (emp ? emp.nama : "-"),
        "Nama": nama || (emp ? emp.nama : "-"),
        "JUDUL": judul,
        "Judul": judul,
        "TANGGAL": tglFormatted,
        "Tanggal": tglFormatted,
        "TIME": timeFormatted,
        "Time": timeFormatted,
        "Cabang": cabang,
        "Kode BA": kodeBA
      };
    }).filter(item => {
      if (selectedBranch && selectedBranch !== "ALL") {
        return item["Kode BA"] === selectedBranch || item.Cabang === selectedBranch || (item.NPK && validEmployees.some(e => String(e.npk).trim() === String(item.NPK).trim()));
      }
      return true;
    });

    // Rekapitulasi Summary
    const totalEmp = validEmployees.length;
    const totalSS = validSS.length;
    const totalQCC = validQCC.length;
    const totalSP = validSP.filter(s => s["Tingkat SP"] && s["Tingkat SP"] !== "-").length;
    const totalKM = validKM.length;
    const totalLate = validAbs.filter(a => a["Status Kehadiran"] && String(a["Status Kehadiran"]).toLowerCase().includes("telat")).length;
    const totalAlpha = validAbs.filter(a => String(a["Keterangan"]).toLowerCase().includes("alpha") || String(a["Keterangan"]).toLowerCase().includes("mangkir")).length;
    const avgAttendance = validAbs.length > 0 
      ? Math.round(((validAbs.length - totalLate - totalAlpha) / validAbs.length) * 1000) / 10 
      : (totalEmp > 0 ? 100 : 0);

    return {
      success: true,
      data: {
        summary: {
          totalKaryawan: totalEmp,
          avgAttendance: avgAttendance,
          totalAlpha: totalAlpha,
          totalSeringTelat: totalLate,
          totalSS: totalSS,
          ssParticipationRate: totalEmp > 0 ? Math.round((totalSS / totalEmp) * 100) : 0,
          totalQCCCircles: totalQCC,
          totalSP: totalSP,
          totalKM: totalKM,
          countTeguran: validSP.filter(s => String(s["Tingkat SP"]).toLowerCase().includes("teguran")).length,
          countSP1: validSP.filter(s => String(s["Tingkat SP"]).toLowerCase().includes("sp 1") || String(s["Tingkat SP"]).toLowerCase() === "sp1").length,
          countSP2: validSP.filter(s => String(s["Tingkat SP"]).toLowerCase().includes("sp 2") || String(s["Tingkat SP"]).toLowerCase() === "sp2").length,
          countSP3: validSP.filter(s => String(s["Tingkat SP"]).toLowerCase().includes("sp 3") || String(s["Tingkat SP"]).toLowerCase() === "sp3").length,
          countSPPT: validSP.filter(s => String(s["Tingkat SP"]).toLowerCase().includes("sppt")).length
        },
        employeeList: validEmployees,
        qccList: validQCC,
        rawTables: {
          Master_Karyawan: validEmployees.map(e => e.raw || {}),
          Data_Kehadiran: validAbs,
          Data_SS: validSS,
          Data_QCC: validQCC,
          Data_SP: validSP,
          Knowledge_management: validKM,
          Data_KM: validKM
        }
      }
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// ==============================================================================
// 4. UPDATE BARIS DATA SPESIFIK (SINGLE ROW CRUD UPDATE)
// ==============================================================================
function updateRowInSheet(targetSheetName, keyField, keyValue, rowIndex, rowData) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(targetSheetName);

    if (!sheet) {
      if (targetSheetName === "Data_KM" || targetSheetName === "Knowledge_management") {
        sheet = ss.getSheetByName(SHEET_KM) || ss.getSheetByName("Knowledge_management") || ss.getSheetByName("Data_KM");
      }
    }

    if (!sheet) {
      return { success: false, message: `Sheet '${targetSheetName}' tidak ditemukan.` };
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { success: false, message: "Sheet kosong atau belum memiliki baris data." };
    }

    const headers = data[0].map(h => String(h).trim());
    let targetRowIndex = -1; // 1-indexed

    // 1. Cari baris berdasarkan keyField & keyValue (misal NPK / Personnel no. / Registrasi)
    if (keyField && keyValue) {
      const colIdx = headers.findIndex(h => h.toLowerCase() === String(keyField).toLowerCase());
      if (colIdx !== -1) {
        // Jika ada informasi tanggal (khususnya untuk Data_Kehadiran)
        const dateColIdx = headers.findIndex(h => {
          const lh = h.toLowerCase();
          return lh === 'date clock in' || lh === 'date' || lh === 'tanggal';
        });
        const targetDateVal = (rowData && (rowData['Date Clock In'] || rowData['Date'] || rowData['Tanggal']))
          ? formatAppsScriptDate(rowData['Date Clock In'] || rowData['Date'] || rowData['Tanggal'])
          : '';

        for (let i = 1; i < data.length; i++) {
          if (String(data[i][colIdx]).trim() === String(keyValue).trim()) {
            if (dateColIdx !== -1 && targetDateVal) {
              const rowDate = formatAppsScriptDate(data[i][dateColIdx]);
              if (rowDate === targetDateVal) {
                targetRowIndex = i + 1;
                break;
              }
            } else {
              targetRowIndex = i + 1;
              break;
            }
          }
        }
      }
    }

    // 2. Jika keyField belum cocok, coba cari kolom kunci umum
    if (targetRowIndex === -1 && keyValue) {
      const fallbackKeys = ["personnel no.", "npk", "registrasi", "no.registrasi", "nama tim"];
      for (let fk of fallbackKeys) {
        const colIdx = headers.findIndex(h => h.toLowerCase() === fk);
        if (colIdx !== -1) {
          for (let i = 1; i < data.length; i++) {
            if (String(data[i][colIdx]).trim() === String(keyValue).trim()) {
              targetRowIndex = i + 1;
              break;
            }
          }
        }
        if (targetRowIndex !== -1) break;
      }
    }

    // 3. Fallback: jika tidak ketemu via key, gunakan rowIndex (+ 2 karena 0-indexed data + 1 header + 1 1-index)
    if (targetRowIndex === -1 && typeof rowIndex === "number" && rowIndex >= 0 && (rowIndex + 2) <= data.length) {
      targetRowIndex = rowIndex + 2;
    }

    if (targetRowIndex === -1) {
      return { success: false, message: "Baris data yang akan diedit tidak ditemukan di sheet." };
    }

    // Pastikan seluruh kolom dalam rowData tercakup dalam header sheet (tambahkan kolom jika belum ada)
    const rowKeys = Object.keys(rowData || {});
    for (let k of rowKeys) {
      if (!headers.some(h => h.toLowerCase() === k.toLowerCase())) {
        sheet.insertColumnAfter(sheet.getLastColumn());
        sheet.getRange(1, sheet.getLastColumn()).setValue(k);
        headers.push(k);
      }
    }

    // Tulis nilai baru pada baris target
    headers.forEach((h, colI) => {
      const foundKey = Object.keys(rowData).find(k => k.toLowerCase() === h.toLowerCase());
      if (foundKey !== undefined && rowData[foundKey] !== undefined) {
        sheet.getRange(targetRowIndex, colI + 1).setValue(rowData[foundKey]);
      }
    });

    return {
      success: true,
      message: `Berhasil memperbarui data baris ke-${targetRowIndex} di sheet '${sheet.getName()}'.`
    };
  } catch (err) {
    return { success: false, message: "Gagal update baris: " + err.message };
  }
}

// ==============================================================================
// 5. HAPUS BARIS DATA SPESIFIK (SINGLE ROW CRUD DELETE)
// ==============================================================================
function deleteRowInSheet(targetSheetName, keyField, keyValue, rowIndex, secondaryField, secondaryValue) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(targetSheetName);

    if (!sheet) {
      if (targetSheetName === "Data_KM" || targetSheetName === "Knowledge_management") {
        sheet = ss.getSheetByName(SHEET_KM) || ss.getSheetByName("Knowledge_management") || ss.getSheetByName("Data_KM");
      }
    }

    if (!sheet) return { success: false, message: `Sheet '${targetSheetName}' tidak ditemukan.` };
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: false, message: "Sheet kosong." };

    const headers = data[0].map(h => String(h).trim());
    let targetRowIndex = -1;

    if (keyField && keyValue) {
      const colIdx = headers.findIndex(h => h.toLowerCase() === String(keyField).toLowerCase());
      const secColIdx = secondaryField ? headers.findIndex(h => h.toLowerCase() === String(secondaryField).toLowerCase()) : -1;

      if (colIdx !== -1) {
        for (let i = 1; i < data.length; i++) {
          if (String(data[i][colIdx]).trim() === String(keyValue).trim()) {
            if (secColIdx !== -1 && secondaryValue) {
              if (String(data[i][secColIdx]).trim() === String(secondaryValue).trim()) {
                targetRowIndex = i + 1;
                break;
              }
            } else {
              targetRowIndex = i + 1;
              break;
            }
          }
        }
      }
    }

    if (targetRowIndex === -1 && keyValue) {
      const fallbackKeys = ["personnel no.", "npk", "registrasi", "no.registrasi", "nama tim"];
      for (let fk of fallbackKeys) {
        const colIdx = headers.findIndex(h => h.toLowerCase() === fk);
        if (colIdx !== -1) {
          for (let i = 1; i < data.length; i++) {
            if (String(data[i][colIdx]).trim() === String(keyValue).trim()) {
              targetRowIndex = i + 1;
              break;
            }
          }
        }
        if (targetRowIndex !== -1) break;
      }
    }

    if (targetRowIndex === -1 && typeof rowIndex === "number" && rowIndex >= 0 && (rowIndex + 2) <= data.length) {
      targetRowIndex = rowIndex + 2;
    }

    if (targetRowIndex !== -1) {
      sheet.deleteRow(targetRowIndex);
      return { success: true, message: `Baris ke-${targetRowIndex} berhasil dihapus dari sheet '${sheet.getName()}'.` };
    }
    return { success: false, message: "Baris yang akan dihapus tidak ditemukan." };
  } catch (err) {
    return { success: false, message: "Gagal hapus baris: " + err.message };
  }
}

// ==============================================================================
// 6. IMPORT & SINKRONISASI EXCEL KE SHEET (BULK SYNC DENGAN PERLINDUNGAN DIMENSI)
// ==============================================================================
function importExcelToSheet(targetSheetName, headers, dataRows) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(targetSheetName);

    if (!sheet) {
      if (targetSheetName === "Data_KM" || targetSheetName === "Knowledge_management") {
        sheet = ss.getSheetByName(SHEET_KM) || ss.getSheetByName("Knowledge_management") || ss.getSheetByName("Data_KM");
      }
    }

    if (!sheet) {
      sheet = ss.insertSheet(targetSheetName);
    }

    if (!headers || !headers.length) {
      return { success: false, message: "Header kolom kosong." };
    }

    // Pastikan dimensi kolom dan baris cukup agar tidak terjadi error range outside sheet
    if (sheet.getMaxColumns() < headers.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
    }
    const neededRows = Math.max(1, (dataRows ? dataRows.length : 0) + 1);
    if (sheet.getMaxRows() < neededRows) {
      sheet.insertRowsAfter(sheet.getMaxRows(), neededRows - sheet.getMaxRows());
    }

    sheet.clearContents();

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    if (dataRows && dataRows.length > 0) {
      sheet.getRange(2, 1, dataRows.length, headers.length).setValues(dataRows);
    }

    return {
      success: true,
      message: `Berhasil mengimpor ${dataRows ? dataRows.length : 0} baris ke sheet '${sheet.getName()}'.`
    };
  } catch (err) {
    return { success: false, message: "Gagal impor: " + err.message };
  }
}

function syncSheetData(targetSheetName, headers, dataRows) {
  return importExcelToSheet(targetSheetName, headers, dataRows);
}
