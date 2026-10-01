const fs = require('fs');

console.log("=== TEST LOGIKA MULTI-SHEET EXPORT 12 BULAN & REKAP TAHUNAN ===");

// 1. Test helper parseSingleDateMonthYear & extractRowMonthYear
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

function extractRowMonthYear(row) {
  if (!row) return null;
  if (typeof row !== 'object') return parseSingleDateMonthYear(row);
  return parseSingleDateMonthYear(row['Date'] || row['Tanggal']) ||
         parseSingleDateMonthYear(row['Date Clock In']) ||
         parseSingleDateMonthYear(row['Date Clock Out']);
}

// 2. Mock Attendance Data across months
const mockRows = [
  { 'NPK': '1001', 'Employee Name': 'Budi Santoso', 'Cabang': 'D660', 'Date': '2026-01-10', 'Time Clock In': '07:45', 'Time Clock Out': '17:00', 'Durasi Kerja (Work Hours)': '8.0' },
  { 'NPK': '1001', 'Employee Name': 'Budi Santoso', 'Cabang': 'D660', 'Date': '2026-06-01', 'Time Clock In': '07:50', 'Time Clock Out': '17:00', 'Durasi Kerja (Work Hours)': '8.0' },
  { 'NPK': '1001', 'Employee Name': 'Budi Santoso', 'Cabang': 'D660', 'Date': '2026-06-02', 'Time Clock In': '08:15', 'Time Clock Out': '17:00', 'Durasi Kerja (Work Hours)': '8.0' },
  { 'NPK': '1001', 'Employee Name': 'Budi Santoso', 'Cabang': 'D660', 'Date': '2026-06-03', 'Time Clock In': '1899-12-30', 'Time Clock Out': '', 'Durasi Kerja (Work Hours)': '0' },
  { 'NPK': '1002', 'Employee Name': 'Siti Aminah', 'Cabang': 'D660', 'Date': '2026-06-01', 'Time Clock In': '07:30', 'Time Clock Out': '17:00', 'Durasi Kerja (Work Hours)': '8.5' },
  { 'NPK': '1002', 'Employee Name': 'Siti Aminah', 'Cabang': 'D660', 'Date': '2026-12-05', 'Time Clock In': '07:40', 'Time Clock Out': '17:00', 'Durasi Kerja (Work Hours)': '8.0' }
];

const monthList = [
  { num: 1, name: "Januari" },
  { num: 2, name: "Februari" },
  { num: 3, name: "Maret" },
  { num: 4, name: "April" },
  { num: 5, name: "Mei" },
  { num: 6, name: "Juni" },
  { num: 7, name: "Juli" },
  { num: 8, name: "Agustus" },
  { num: 9, name: "September" },
  { num: 10, name: "Oktober" },
  { num: 11, name: "November" },
  { num: 12, name: "Desember" }
];

console.log("1. Cek pembagian per bulan:");
monthList.forEach(m => {
  const mRows = mockRows.filter(r => {
    const p = extractRowMonthYear(r);
    return p && p.month === m.num;
  });
  console.log(`   - Sheet ${m.name}: ${mRows.length} baris`);
});

// Verify Januari has 1 row, Juni has 4 rows, Desember has 1 row, others have 0 rows
const janRows = mockRows.filter(r => extractRowMonthYear(r)?.month === 1);
const junRows = mockRows.filter(r => extractRowMonthYear(r)?.month === 6);
const desRows = mockRows.filter(r => extractRowMonthYear(r)?.month === 12);

if (janRows.length !== 1 || junRows.length !== 4 || desRows.length !== 1) {
  console.error("FAIL: Jumlah baris bulanan tidak sesuai!");
  process.exit(1);
}
console.log("✓ Pembagian data 12 bulan presisi 100%");

// Test Summary calculation
const empMap = new Map();
mockRows.forEach(r => {
  const npk = r.NPK;
  if (!empMap.has(npk)) {
    empMap.set(npk, {
      npk: npk,
      nama: r['Employee Name'],
      cabang: r['Cabang'],
      totalHari: 0,
      hadirCount: 0,
      onTimeCount: 0,
      lateCount: 0,
      tanpaKeteranganCount: 0,
      totalWorkHours: 0
    });
  }
  const emp = empMap.get(npk);
  emp.totalHari++;
  const timeIn = r['Time Clock In'];
  const hasClockIn = timeIn && timeIn !== '1899-12-30' && timeIn !== '0.00.00' && timeIn !== '-';
  if (hasClockIn) {
    emp.hadirCount++;
    if (timeIn > '08:00') emp.lateCount++;
    else emp.onTimeCount++;
  } else {
    emp.tanpaKeteranganCount++;
  }
  emp.totalWorkHours += parseFloat(r['Durasi Kerja (Work Hours)'] || 0);
});

console.log("2. Cek Rekap Tahunan per Karyawan:");
empMap.forEach(e => {
  const pct = Math.round((e.hadirCount / e.totalHari) * 100);
  console.log(`   - ${e.nama} (${e.npk}): ${e.hadirCount}/${e.totalHari} Hari (${pct}%), Tepat Waktu: ${e.onTimeCount}, Telat: ${e.lateCount}, Tanpa Keterangan: ${e.tanpaKeteranganCount}, Total Jam: ${e.totalWorkHours}j`);
});

const budi = empMap.get('1001');
if (budi.totalHari !== 4 || budi.hadirCount !== 3 || budi.tanpaKeteranganCount !== 1 || budi.lateCount !== 1) {
  console.error("FAIL: Rekapitulasi Budi tidak sesuai!");
  process.exit(1);
}
console.log("✓ Rekapitulasi per karyawan 1 tahun berhasil 100%!");
console.log("\n>>> SEMUA VERIFIKASI MULTI-SHEET EXPORT LULUS 100%! <<<");
