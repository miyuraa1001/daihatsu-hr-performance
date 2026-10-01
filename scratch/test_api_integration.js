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

console.log("=== VERIFIKASI INTEGRASI LOGIKA TANGGAL, WAKTU & STATUS ALPHA ===");
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
  { fn: () => calculateLatenessInfo('1899-12-30').text, expected: 'Alpha', desc: "calculateLatenessInfo('1899-12-30').text is 'Alpha'" },
  { fn: () => calculateLatenessInfo('').text, expected: 'Alpha', desc: "calculateLatenessInfo('').text is 'Alpha'" },
  { fn: () => calculateLatenessInfo('-').text, expected: 'Alpha', desc: "calculateLatenessInfo('-').text is 'Alpha'" },
  { fn: () => calculateLatenessInfo('Tidak Clock In').text, expected: 'Alpha', desc: "calculateLatenessInfo('Tidak Clock In').text is 'Alpha'" },
  { fn: () => calculateLatenessInfo('1899-12-30').badgeHtml.includes('Alpha'), expected: true, desc: "calculateLatenessInfo('1899-12-30').badgeHtml contains 'Alpha'" },
  { fn: () => calculateLatenessInfo('1899-12-30').badgeHtml.includes('bg-rose-50 text-rose-700'), expected: true, desc: "calculateLatenessInfo('1899-12-30').badgeHtml is rose/red" },
  { fn: () => formatColumnCell('Time Clock In', '1899-12-30').includes('0.00.00'), expected: true, desc: "formatColumnCell('Time Clock In', '1899-12-30') includes 0.00.00" },
  { fn: () => formatColumnCell('Date Clock In', '1899-12-30').includes('-'), expected: true, desc: "formatColumnCell('Date Clock In', '1899-12-30') shows dash" },
  { fn: () => formatColumnCell('Date Clock In', '').includes('-'), expected: true, desc: "formatColumnCell('Date Clock In', '') shows dash" },
  { fn: () => formatColumnCell('Time Clock Out', '').includes('-'), expected: true, desc: "formatColumnCell('Time Clock Out', '') shows dash" },
  { fn: () => formatColumnCell('Status Kehadiran', '1899-12-30').includes('Alpha'), expected: true, desc: "formatColumnCell('Status Kehadiran', '1899-12-30') shows Alpha" },
  { fn: () => formatColumnCell('Status Kehadiran', '').includes('Alpha'), expected: true, desc: "formatColumnCell('Status Kehadiran', '') shows Alpha" },
  { fn: () => formatColumnCell('Status Kehadiran', 'Cuti').includes('Cuti'), expected: true, desc: "formatColumnCell('Status Kehadiran', 'Cuti') shows Cuti" },
  { fn: () => formatColumnCell('Status Kehadiran', 'Sakit').includes('Sakit'), expected: true, desc: "formatColumnCell('Status Kehadiran', 'Sakit') shows Sakit" },
  { fn: () => formatColumnCell('Status Kehadiran', 'Dinas').includes('Dinas'), expected: true, desc: "formatColumnCell('Status Kehadiran', 'Dinas') shows Dinas" },
  { fn: () => formatColumnCell('Status Kehadiran', 'Izin').includes('Izin'), expected: true, desc: "formatColumnCell('Status Kehadiran', 'Izin') shows Izin" }
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
