/**
 * ==============================================================================
 * D-PERFORM - DAIHATSU HR & PERFORMANCE HUB (BACKEND APPS SCRIPT)
 * PT ASTRA DAIHATSU MOTOR - DSO LAMPUNG
 * ==============================================================================
 * Versi: 2026.3.0
 * Fitur: Master Karyawan, Kehadiran, SS, QCC, SP, dan Knowledge_management
 * ==============================================================================
 */

// 1. KONFIGURASI SPREADSHEET & KEAMANAN TOKEN
const SPREADSHEET_ID = "1DJtZ4VkcWY3ySqzIoGaFBVaNsEaMqaeaOezJw4lz7uw";

// Samakan persis dengan nilai SECRET_TOKEN di Environment Variables Vercel
const APP_SECRET_TOKEN = "DASHBOARDHRDSOLAMPUNG2026";

// Nama Sheet Database (Sesuai Persis dengan Tab di Spreadsheet)
const SHEET_USER       = "Username";
const SHEET_KARYAWAN   = "Master_Karyawan";
const SHEET_KEHADIRAN  = "Data_Kehadiran";
const SHEET_SS         = "Data_SS";
const SHEET_QCC        = "Data_QCC";
const SHEET_SP         = "Data_SP";
const SHEET_KM         = "Knowledge_management"; // Sesuai tab foto: NPK, NAMA, JUDUL, TANGGAL, TIME

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
 * Membuka Spreadsheet
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Helper Format Response JSON (CORS Friendly)
 */
function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper Format Tanggal ke Standar DD.MM.YYYY
 */
function formatAppsScriptDate(val) {
  if (!val) return "";
  if (val instanceof Date && !isNaN(val.getTime())) {
    try {
      return Utilities.formatDate(val, "Asia/Jakarta", "dd.MM.yyyy");
    } catch (e) {
      const d = String(val.getDate()).padStart(2, "0");
      const m = String(val.getMonth() + 1).padStart(2, "0");
      const y = val.getFullYear();
      return `${d}.${m}.${y}`;
    }
  }
  if (typeof val === "number" && val > 30000 && val < 60000) {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      try {
        return Utilities.formatDate(date, "Asia/Jakarta", "dd.MM.yyyy");
      } catch (e) {
        const d = String(date.getDate()).padStart(2, "0");
        const m = String(date.getMonth() + 1).padStart(2, "0");
        return `${d}.${m}.${date.getFullYear()}`;
      }
    }
  }
  let s = String(val).trim();
  if (s.includes("T") && s.endsWith("Z")) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      try {
        return Utilities.formatDate(d, "Asia/Jakarta", "dd.MM.yyyy");
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
  if (/^\d{1,2}[:\.]\d{2}([:\.]\d{2})?$/.test(s)) {
    const parts = s.split(/[:\.]/);
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
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
      return responseJSON(getDashboardData(user, e.parameter.branch || "ALL", e.parameter.period || "Juni 2026"));
    }
    return responseJSON({ success: true, message: "Koneksi Backend Apps Script D-PERFORM Aktif!" });
  }

  return HtmlService.createHtmlOutput("<h2>Backend API D-PERFORM DSO Lampung Aktif!</h2><p>Gunakan endpoint POST melalui proxy Vercel.</p>")
    .setTitle("D-PERFORM - Daihatsu HR & Performance Hub");
}

/**
 * Memproses POST Request (Login, Dashboard, Import, Sync) dengan Validasi Token
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
 * Mengambil nilai properti dari objek secara case-insensitive
 */
function getVal(obj, ...keys) {
  if (!obj) return "";
  for (let k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== "") {
      return obj[k];
    }
    const cleanSearch = k.toLowerCase().replace(/[^a-z0-9]/g, "");
    const foundKey = Object.keys(obj).find(
      key => key.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanSearch
    );
    if (foundKey && obj[foundKey] !== undefined && obj[foundKey] !== null && String(obj[foundKey]).trim() !== "") {
      return obj[foundKey];
    }
  }
  return "";
}

/**
 * Menerjemahkan nama cabang / kode ke BA Code valid
 */
function resolveBACode(str) {
  if (!str) return "";
  const clean = String(str).toUpperCase().trim();

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
    const sheet = ss.getSheetByName(SHEET_USER);
    if (!sheet) throw new Error(`Sheet '${SHEET_USER}' tidak ditemukan di Spreadsheet.`);

    const users = getSheetObjects(sheet);
    const cleanUname = String(username).trim();
    const cleanPass = String(password).trim();

    for (let u of users) {
      const dbUname = String(getVal(u, "Username", "User_ID", "NPK")).trim();

      let dbPassRaw = getVal(u, "Password");
      let dbPass = "";

      if (dbPassRaw instanceof Date) {
        const d = String(dbPassRaw.getDate()).padStart(2, "0");
        const m = String(dbPassRaw.getMonth() + 1).padStart(2, "0");
        const y = String(dbPassRaw.getFullYear()).slice(-2);
        dbPass = `${d}${m}${y}`;
      } else {
        dbPass = String(dbPassRaw).replace(/[^0-9]/g, "").padStart(6, "0");
      }

      if (dbUname === cleanUname && dbPass === cleanPass) {
        const userRole = String(getVal(u, "Role")).trim();
        const businessArea = String(getVal(u, "Business area", "Business Area", "Cabang")).trim();
        let assignedBACodes = [];

        if (userRole.toLowerCase() === "admin" || businessArea.toUpperCase() === "ALL") {
          assignedBACodes = [...ALL_LAMPUNG_CODES];
        } else {
          const resolved = resolveBACode(businessArea);
          assignedBACodes = ALL_LAMPUNG_CODES.includes(resolved) ? [resolved] : [ALL_LAMPUNG_CODES[0]];
        }

        return {
          success: true,
          user: {
            username: dbUname,
            nama: getVal(u, "Nama_Lengkap", "Name", "Nama"),
            role: userRole,
            jabatan: getVal(u, "Jabatan", "Job Title"),
            assignedBACodes: assignedBACodes,
            assignedBranches: assignedBACodes.map(c => DSO_BRANCH_MAP[c] ? DSO_BRANCH_MAP[c].name : c),
            isAllBranch: userRole.toLowerCase() === "admin" || businessArea.toUpperCase() === "ALL"
          }
        };
      }
    }

    return { success: false, message: "NPK (Username) atau Tanggal Lahir (Password) salah!" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// ==============================================================================
// 3. PENGAMBILAN DATA DASHBOARD
// ==============================================================================
function getDashboardData(user, selectedBranch, selectedPeriod) {
  try {
    const ss = getSpreadsheet();

    const empSheet = ss.getSheetByName(SHEET_KARYAWAN);
    const absSheet = ss.getSheetByName(SHEET_KEHADIRAN) || ss.getSheetByName("Data_Absensi");
    const ssSheet  = ss.getSheetByName(SHEET_SS);
    const qccSheet = ss.getSheetByName(SHEET_QCC);
    const spSheet  = ss.getSheetByName(SHEET_SP);
    const kmSheet  = ss.getSheetByName(SHEET_KM) || ss.getSheetByName("Data_KM") || ss.getSheetByName("Knowledge_Management");

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
      const baRaw = getVal(item, "Business area", "Business Area", "P.subarea", "Cabang");
      const baCode = resolveBACode(baRaw);
      const branchName = DSO_BRANCH_MAP[baCode] ? DSO_BRANCH_MAP[baCode].name : String(baRaw);

      let dobVal = getVal(item, "D.o.birth", "Date of Birth", "Tgl Lahir");
      let dateVal = getVal(item, "Date", "Tgl Masuk", "Join Date");

      return {
        npk: String(getVal(item, "Personnel no.", "NPK", "ID Karyawan")).trim(),
        nama: getVal(item, "Last name", "Nama Lengkap", "Nama", "Name"),
        jabatan: getVal(item, "Job Title", "Jabatan"),
        organisasi: getVal(item, "Name of organizational unit", "Divisi", "Departemen"),
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
        raw: item
      };
    }).filter(e => assignedCodes.includes(e.kodeBA));

    if (selectedBranch && selectedBranch !== "ALL") {
      validEmployees = validEmployees.filter(e => e.kodeBA === selectedBranch);
    }

    // Filter SP
    const validSP = rawSP.map(item => {
      const npk = String(getVal(item, "NPK", "Personnel no.")).trim();
      const emp = validEmployees.find(e => String(e.npk).trim() === npk);
      return {
        "NPK": npk,
        "Nama": getVal(item, "Nama", "Last name") || (emp ? emp.nama : "-"),
        "Kode BA": getVal(item, "Kode BA", "Business area") || (emp ? emp.kodeBA : "-"),
        "Tingkat SP": getVal(item, "Tingkat SP", "Status SP", "SP"),
        "Alasan": getVal(item, "Alasan", "Pelanggaran", "Keterangan")
      };
    }).filter(item => {
      if (selectedBranch !== "ALL") {
        return item["Kode BA"] === selectedBranch;
      }
      return assignedCodes.includes(item["Kode BA"]);
    });

    // Tempelkan status SP ke EmployeeList
    validEmployees.forEach(emp => {
      const sp = validSP.find(s => String(s.NPK).trim() === String(emp.npk).trim());
      emp.spAktif = (sp && sp["Tingkat SP"] && sp["Tingkat SP"] !== "-") ? sp["Tingkat SP"] : "";
      emp.spAlasan = sp ? sp.Alasan : "";
    });

    // Filter Suggestion System (SS)
    const validSS = rawSS.map(item => {
      const npk = String(getVal(item, "NPK", "Personnel no.")).trim();
      const emp = validEmployees.find(e => String(e.npk).trim() === npk);
      return {
        ...item,
        NPK: npk,
        Nama: getVal(item, "Nama", "Last name") || (emp ? emp.nama : "-"),
        "Kode BA": emp ? emp.kodeBA : "D660"
      };
    }).filter(item => {
      if (selectedBranch !== "ALL") {
        return item["Kode BA"] === selectedBranch;
      }
      return assignedCodes.includes(item["Kode BA"]);
    });

    // Filter QCC Circles
    const validQCC = rawQCC.map(item => {
      const leaderNPK = String(getVal(item, "NPK Leader", "Leader NPK", "NPK")).trim();
      const emp = validEmployees.find(e => String(e.npk).trim() === leaderNPK);
      return {
        ...item,
        "Kode BA": emp ? emp.kodeBA : "D660"
      };
    }).filter(item => {
      if (selectedBranch !== "ALL") {
        return item["Kode BA"] === selectedBranch;
      }
      return assignedCodes.includes(item["Kode BA"]);
    });

    // Filter & Format Presensi / Data_Kehadiran (Asumsi Jam Masuk 08.00 WIB)
    const validAbs = rawAbs.map(item => {
      const npk = String(getVal(item, "NPK", "Personnel no.", "ID Karyawan")).trim();
      const emp = validEmployees.find(e => String(e.npk).trim() === npk);
      const rawCabang = getVal(item, "Cabang", "Business area", "P.subarea");
      const baCode = resolveBACode(rawCabang || (emp ? emp.kodeBA : ""));
      const cabangName = DSO_BRANCH_MAP[baCode] ? DSO_BRANCH_MAP[baCode].name : (rawCabang || (emp ? emp.cabang : ""));

      const tglRaw = getVal(item, "Date", "Tanggal", "Tgl");
      const tglClockInRaw = getVal(item, "Date Clock In", "Tanggal Clock In");
      const timeClockInRaw = getVal(item, "Time Clock In", "Clock In", "Time In", "Time");
      const tglClockOutRaw = getVal(item, "Date Clock Out", "Tanggal Clock Out");
      const timeClockOutRaw = getVal(item, "Time Clock Out", "Clock Out", "Time Out");

      const tglFormatted = formatAppsScriptDate(tglRaw);
      const tglClockInFormatted = formatAppsScriptDate(tglClockInRaw || tglRaw);
      const timeClockInFormatted = formatAppsScriptTime(timeClockInRaw);
      const tglClockOutFormatted = formatAppsScriptDate(tglClockOutRaw || tglRaw);
      const timeClockOutFormatted = formatAppsScriptTime(timeClockOutRaw);

      // Hitung Estimasi Keterlambatan (Asumsi jam masuk 08.00 WIB)
      let estimasiTelatText = "Tepat Waktu";
      let isLate = false;
      let lateDiffMins = 0;

      if (timeClockInFormatted && timeClockInFormatted !== "-" && timeClockInFormatted !== "") {
        const timeParts = timeClockInFormatted.split(":");
        if (timeParts.length >= 2) {
          const h = parseInt(timeParts[0], 10);
          const m = parseInt(timeParts[1], 10);
          if (!isNaN(h) && !isNaN(m)) {
            lateDiffMins = (h * 60 + m) - 480; // 08:00 = 480 menit
            if (lateDiffMins > 0) {
              isLate = true;
              const lateHours = Math.floor(lateDiffMins / 60);
              const lateMinutes = lateDiffMins % 60;
              if (lateHours > 0 && lateMinutes > 0) {
                estimasiTelatText = `Telat ${lateHours} Jam ${lateMinutes} Menit`;
              } else if (lateHours > 0) {
                estimasiTelatText = `Telat ${lateHours} Jam`;
              } else {
                estimasiTelatText = `Telat ${lateMinutes} Menit`;
              }
            }
          }
        }
      }

      const durasiRaw = getVal(item, "Durasi Kerja (Work Hours)", "Durasi Kerja", "Work Hours");
      let durasiFormatted = durasiRaw;
      if (typeof durasiRaw === "number") {
        durasiFormatted = Math.round(durasiRaw * 10) / 10;
      }

      return {
        ...item,
        "NPK": npk,
        "Employee Name": getVal(item, "Employee Name", "Nama", "Last name") || (emp ? emp.nama : "-"),
        "Wilayah": getVal(item, "Wilayah", "Area") || "DSO Lampung",
        "Cabang": cabangName || (emp ? emp.cabang : "DSO Lampung"),
        "Date": tglFormatted,
        "Date Clock In": tglClockInFormatted,
        "Time Clock In": timeClockInFormatted,
        "Estimasi Telat (Asumsi 08.00)": estimasiTelatText,
        "Date Clock Out": tglClockOutFormatted,
        "Time Clock Out": timeClockOutFormatted,
        "Durasi Kerja (Work Hours)": durasiFormatted !== "" ? durasiFormatted : 8,
        "Assigned Work Location": getVal(item, "Assigned Work Location") || "YES",
        "Need CICO Approval": getVal(item, "Need CICO Approval") || (isLate ? "YES" : "NO"),
        "In Radius Clock in": getVal(item, "In Radius Clock in") || "YES",
        "Location Clock In": getVal(item, "Location Clock In") || "",
        "In Radius Clock Out": getVal(item, "In Radius Clock Out") || "YES",
        "Location Clock Out": getVal(item, "Location Clock Out") || "",
        "Clock In Source": getVal(item, "Clock In Source") || "Mobile App GPS",
        "Clock Out Source": getVal(item, "Clock Out Source") || "Mobile App GPS",
        "Keterangan": getVal(item, "Keterangan") || (isLate ? "Terlambat Masuk" : "Hadir Tepat Waktu"),
        "_kodeBA": baCode || (emp ? emp.kodeBA : "")
      };
    }).filter(item => {
      if (selectedBranch !== "ALL") {
        return item._kodeBA === selectedBranch || (item.NPK && validEmployees.some(e => String(e.npk).trim() === String(item.NPK).trim()));
      }
      return item._kodeBA ? assignedCodes.includes(item._kodeBA) : true;
    });

    // Filter Knowledge Management (Sesuai Kolom: NPK, NAMA, JUDUL, TANGGAL, TIME)
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
      // Jika sheet masih kosong, map tidak akan menghasilkan baris
      if (selectedBranch !== "ALL") {
        return validEmployees.some(e => String(e.npk).trim() === String(item.NPK).trim());
      }
      return true;
    });

    // Rekapitulasi Summary
    const totalEmp = validEmployees.length;
    const totalSS = validSS.length;
    const totalQCC = validQCC.length;
    const totalSP = validSP.filter(s => s["Tingkat SP"] && s["Tingkat SP"] !== "-").length;
    const totalKM = validKM.length;
    const totalLate = validAbs.filter(a => a["Estimasi Telat (Asumsi 08.00)"] && a["Estimasi Telat (Asumsi 08.00)"] !== "Tepat Waktu").length;
    const totalAlpha = validAbs.filter(a => String(a["Keterangan"]).toLowerCase().includes("alpha") || String(a["Keterangan"]).toLowerCase().includes("mangkir")).length;
    const avgAttendance = validAbs.length > 0 
      ? Math.round(((validAbs.length - totalLate - totalAlpha) / validAbs.length) * 1000) / 10 
      : (totalEmp > 0 ? 98.4 : 0);

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
// 4. IMPORT & SINKRONISASI EXCEL KE SHEET
// ==============================================================================
function importExcelToSheet(targetSheetName, headers, dataRows) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(targetSheetName);

    // Dukung alias Knowledge_management / Data_KM
    if (!sheet) {
      if (targetSheetName === "Data_KM" || targetSheetName === "Knowledge_management") {
        sheet = ss.getSheetByName(SHEET_KM) || ss.getSheetByName("Knowledge_management") || ss.getSheetByName("Data_KM");
      }
    }

    if (!sheet) {
      // Buat sheet baru jika belum ada
      sheet = ss.insertSheet(targetSheetName);
    }

    // Bersihkan isi sheet sebelumnya
    sheet.clearContents();

    if (!headers || !headers.length) {
      return { success: false, message: "Header kolom kosong." };
    }

    // Tulis Header di baris 1
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Tulis Data jika ada
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

/**
 * Sinkronisasi data dari aplikasi ke Google Sheets
 */
function syncSheetData(targetSheetName, headers, dataRows) {
  return importExcelToSheet(targetSheetName, headers, dataRows);
}
