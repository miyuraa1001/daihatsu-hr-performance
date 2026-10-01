const fs = require('fs');

const code = fs.readFileSync('src/js/api.js', 'utf8');

// We simulate window and extract functions
const sandbox = {
  window: {},
  document: { addEventListener: () => {} },
  fetch: () => {},
  console: console
};

const fn = new Function('window', 'document', 'fetch', code + '\nreturn { formatDatabaseDate, formatDatabaseTime, calculateLatenessInfo, formatColumnCell };');
const { formatDatabaseDate, formatDatabaseTime, calculateLatenessInfo, formatColumnCell } = fn(sandbox.window, sandbox.document, sandbox.fetch);

console.log("=== VERIFIKASI INTEGRASI LOGIKA TANGGAL, WAKTU & STATUS TANPA KETERANGAN ===");
const cases = [
  { fn: () => formatDatabaseTime('1899-12-30'), expected: '0.00.00', desc: "formatDatabaseTime('1899-12-30')" },
  { fn: () => formatDatabaseTime('0.00.00'), expected: '0.00.00', desc: "formatDatabaseTime('0.00.00')" },
  { fn: () => formatDatabaseTime('00:00:00'), expected: '0.00.00', desc: "formatDatabaseTime('00:00:00')" },
  { fn: () => formatDatabaseTime(0), expected: '0.00.00', desc: "formatDatabaseTime(0)" },
  { fn: () => formatDatabaseTime(''), expected: '-', desc: "formatDatabaseTime('')" },
  { fn: () => formatDatabaseTime('-'), expected: '-', desc: "formatDatabaseTime('-')" },
  { fn: () => formatDatabaseTime(null), expected: '-', desc: "formatDatabaseTime(null)" },
  { fn: () => formatDatabaseTime('07:03'), expected: '07:03', desc: "formatDatabaseTime('07:03')" },
  { fn: () => formatDatabaseDate('1899-12-30'), expected: '', desc: "formatDatabaseDate('1899-12-30')" },
  { fn: () => formatDatabaseDate('30.12.1899'), expected: '', desc: "formatDatabaseDate('30.12.1899')" },
  { fn: () => formatDatabaseDate('03.06.2026'), expected: '03.06.2026', desc: "formatDatabaseDate('03.06.2026')" },
  { fn: () => formatDatabaseDate(''), expected: '', desc: "formatDatabaseDate('')" },
  { fn: () => calculateLatenessInfo('1899-12-30').hasClockIn, expected: false, desc: "calculateLatenessInfo('1899-12-30').hasClockIn is false" },
  { fn: () => calculateLatenessInfo('1899-12-30').text, expected: 'Tanpa Keterangan', desc: "calculateLatenessInfo('1899-12-30').text is 'Tanpa Keterangan'" },
  { fn: () => calculateLatenessInfo('').text, expected: 'Tanpa Keterangan', desc: "calculateLatenessInfo('').text is 'Tanpa Keterangan'" },
  { fn: () => calculateLatenessInfo('-').text, expected: 'Tanpa Keterangan', desc: "calculateLatenessInfo('-').text is 'Tanpa Keterangan'" },
  { fn: () => calculateLatenessInfo('Tidak Clock In').text, expected: 'Tanpa Keterangan', desc: "calculateLatenessInfo('Tidak Clock In').text is 'Tanpa Keterangan'" },
  { fn: () => calculateLatenessInfo('1899-12-30').badgeHtml.includes('Tanpa Keterangan'), expected: true, desc: "calculateLatenessInfo('1899-12-30').badgeHtml contains 'Tanpa Keterangan'" },
  { fn: () => calculateLatenessInfo('1899-12-30').badgeHtml.includes('bg-amber-50 text-amber-700'), expected: true, desc: "calculateLatenessInfo('1899-12-30').badgeHtml is amber soft" },
  { fn: () => formatColumnCell('Time Clock In', '1899-12-30').includes('0.00.00'), expected: true, desc: "formatColumnCell('Time Clock In', '1899-12-30') includes 0.00.00" },
  { fn: () => formatColumnCell('Date Clock In', '1899-12-30').includes('-'), expected: true, desc: "formatColumnCell('Date Clock In', '1899-12-30') shows dash" },
  { fn: () => formatColumnCell('Date Clock In', '').includes('-'), expected: true, desc: "formatColumnCell('Date Clock In', '') shows dash" },
  { fn: () => formatColumnCell('Time Clock Out', '').includes('-'), expected: true, desc: "formatColumnCell('Time Clock Out', '') shows dash" },
  { fn: () => formatColumnCell('Status Kehadiran', '1899-12-30').includes('Tanpa Keterangan'), expected: true, desc: "formatColumnCell('Status Kehadiran', '1899-12-30') shows Tanpa Keterangan" },
  { fn: () => formatColumnCell('Status Kehadiran', '').includes('Tanpa Keterangan'), expected: true, desc: "formatColumnCell('Status Kehadiran', '') shows Tanpa Keterangan" },
  { fn: () => formatColumnCell('Status Kehadiran', '07:55').includes('Tepat Waktu'), expected: true, desc: "formatColumnCell('Status Kehadiran', '07:55') shows Tepat Waktu" },
  { fn: () => formatColumnCell('Status Kehadiran', '08:15').includes('Telat 15 Menit'), expected: true, desc: "formatColumnCell('Status Kehadiran', '08:15') shows Telat 15 Menit" }
];

let allPassed = true;
cases.forEach(c => {
  const result = c.fn();
  const passed = result === c.expected;
  if (!passed) allPassed = false;
  console.log(`${passed ? '✓' : '✗'} ${c.desc} -> ${JSON.stringify(result)} (expected: ${JSON.stringify(c.expected)})`);
});

if (allPassed) {
  console.log("\n>>> SEMUA TEST ALPHA & SINKRONISASI FILTER BERHASIL 100%! <<<");
} else {
  console.error("\n>>> ADA TEST YANG GAGAL! <<<");
  process.exit(1);
}
