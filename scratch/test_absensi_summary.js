const fs = require('fs');

const apiCode = fs.readFileSync('src/js/api.js', 'utf8');
const navCode = fs.readFileSync('src/js/navigation.js', 'utf8');
const modalCode = fs.readFileSync('src/js/modals.js', 'utf8');
const empCode = fs.readFileSync('src/js/employee.js', 'utf8');

// Mock DOM & environment
const elements = {};
function mockElement(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      value: '',
      textContent: '',
      innerHTML: '',
      className: '',
      classList: {
        add: function(cls) { if (!this.classes.includes(cls)) this.classes.push(cls); },
        remove: function(...clsList) { this.classes = this.classes.filter(c => !clsList.includes(c)); },
        contains: function(cls) { return this.classes.includes(cls); },
        classes: []
      },
      setAttribute: () => {},
      style: {}
    };
  }
  return elements[id];
}

const sandbox = {
  window: {},
  document: {
    getElementById: (id) => mockElement(id),
    querySelectorAll: () => [],
    addEventListener: () => {}
  },
  console: console,
  fetch: () => {},
  XLSX: {
    utils: {
      json_to_sheet: (data, opts) => ({ data, opts }),
      book_new: () => ({ Sheets: {}, SheetNames: [] }),
      book_append_sheet: () => {}
    },
    writeFile: () => {}
  }
};

const fullCode = `
${apiCode}
${navCode}
${modalCode}
${empCode}
return {
  SCHEMAS,
  calculateLatenessInfo,
  formatDatabaseDate,
  formatDatabaseTime,
  filterAbsensiTable,
  toggleAbsViewMode,
  openEmployeeAttendanceDetailModal,
  showEmployeeInRawAbsensi,
  get currentAbsViewMode() { return currentAbsViewMode; },
  set currentAbsViewMode(v) { currentAbsViewMode = v; },
  setCurrentDashboardPayload: (p) => { currentDashboardPayload = p; },
  setLoggedInUser: (u) => { loggedInUser = u; }
};
`;

const fn = new Function('window', 'document', 'console', 'fetch', 'XLSX', fullCode);
const ctx = fn(sandbox.window, sandbox.document, sandbox.console, sandbox.fetch, sandbox.XLSX);

console.log("=== TEST REKAPITULASI ABSENSI PER KARYAWAN & LOG HARIAN ===");

// 1. Initial view mode check
console.log("1. Cek default absViewMode:", ctx.currentAbsViewMode);
if (ctx.currentAbsViewMode !== 'SUMMARY') {
  console.error("FAIL: currentAbsViewMode should default to 'SUMMARY'");
  process.exit(1);
}
console.log("✓ Default mode is SUMMARY (Rekap Per Karyawan)");

// 2. Setup mock payload with real June attendance data
const sampleAbsData = [
  // Emp 1: 5 hari (4 masuk, 1 tanpa keterangan)
  { NPK: '1001', 'Employee Name': 'Budi Santoso', Cabang: 'Lampung A Yani', Date: '2026-06-01', 'Time Clock In': '07:45:00', 'Time Clock Out': '17:00:00', 'Durasi Kerja (Work Hours)': 8.5, Keterangan: '' },
  { NPK: '1001', 'Employee Name': 'Budi Santoso', Cabang: 'Lampung A Yani', Date: '2026-06-02', 'Time Clock In': '07:50:00', 'Time Clock Out': '17:00:00', 'Durasi Kerja (Work Hours)': 8.5, Keterangan: '' },
  { NPK: '1001', 'Employee Name': 'Budi Santoso', Cabang: 'Lampung A Yani', Date: '2026-06-03', 'Time Clock In': '08:15:00', 'Time Clock Out': '17:00:00', 'Durasi Kerja (Work Hours)': 8.5, Keterangan: 'Terlambat 15 Menit' },
  { NPK: '1001', 'Employee Name': 'Budi Santoso', Cabang: 'Lampung A Yani', Date: '2026-06-04', 'Time Clock In': '07:55:00', 'Time Clock Out': '17:00:00', 'Durasi Kerja (Work Hours)': 8.5, Keterangan: '' },
  { NPK: '1001', 'Employee Name': 'Budi Santoso', Cabang: 'Lampung A Yani', Date: '2026-06-05', 'Time Clock In': '0.00.00', 'Time Clock Out': '0.00.00', 'Durasi Kerja (Work Hours)': 0, Keterangan: '' },

  // Emp 2: 5 hari (2 tepat waktu, 3 tanpa keterangan)
  { NPK: '1002', 'Employee Name': 'Siti Aminah', Cabang: 'Bandarjaya', Date: '2026-06-01', 'Time Clock In': '07:40:00', 'Time Clock Out': '17:00:00', 'Durasi Kerja (Work Hours)': 8.5, Keterangan: '' },
  { NPK: '1002', 'Employee Name': 'Siti Aminah', Cabang: 'Bandarjaya', Date: '2026-06-02', 'Time Clock In': '07:45:00', 'Time Clock Out': '17:00:00', 'Durasi Kerja (Work Hours)': 8.5, Keterangan: '' },
  { NPK: '1002', 'Employee Name': 'Siti Aminah', Cabang: 'Bandarjaya', Date: '2026-06-03', 'Time Clock In': '-', 'Time Clock Out': '-', 'Durasi Kerja (Work Hours)': 0, Keterangan: '' },
  { NPK: '1002', 'Employee Name': 'Siti Aminah', Cabang: 'Bandarjaya', Date: '2026-06-04', 'Time Clock In': '1899-12-30', 'Time Clock Out': '1899-12-30', 'Durasi Kerja (Work Hours)': 0, Keterangan: '' },
  { NPK: '1002', 'Employee Name': 'Siti Aminah', Cabang: 'Bandarjaya', Date: '2026-06-05', 'Time Clock In': '', 'Time Clock Out': '', 'Durasi Kerja (Work Hours)': 0, Keterangan: '' },
];

ctx.setCurrentDashboardPayload({
  rawTables: {
    Data_Kehadiran: sampleAbsData,
    Master_Karyawan: [
      { 'Personnel no.': '1001', 'Last name': 'Budi Santoso', 'P.subarea': 'Lampung A Yani', 'Job Title': 'Sales Executive' },
      { 'Personnel no.': '1002', 'Last name': 'Siti Aminah', 'P.subarea': 'Bandarjaya', 'Job Title': 'Service Advisor' }
    ]
  },
  employeeList: [
    { npk: '1001', nama: 'Budi Santoso', cabang: 'Lampung A Yani', jabatan: 'Sales Executive' },
    { npk: '1002', nama: 'Siti Aminah', cabang: 'Bandarjaya', jabatan: 'Service Advisor' }
  ]
});
ctx.setLoggedInUser({ username: 'admin', role: 'admin', isAllBranch: true });

// 3. Render table in SUMMARY mode
ctx.filterAbsensiTable();

const tbodyContent = mockElement('abs-table-body').innerHTML;
const headerContent = mockElement('abs-table-header').innerHTML;
const rowCountText = mockElement('abs-row-count').textContent;

console.log("3. Teks row count:", rowCountText);
if (!rowCountText.includes("Menampilkan 2 dari 2 Karyawan (Rekap Kehadiran Juni 2026)")) {
  console.error("FAIL: Row count text is incorrect:", rowCountText);
  process.exit(1);
}
console.log("✓ Row count text correctly reports Rekap Karyawan Juni 2026");

// Verify Table Body Contains Budi Santoso and Siti Aminah summary
if (!tbodyContent.includes("Budi Santoso") || !tbodyContent.includes("Siti Aminah")) {
  console.error("FAIL: Table body does not contain employees!");
  process.exit(1);
}
console.log("✓ Table body renders both employees in summary");

// Verify Budi's counts: 4 Hari masuk, 1x tepat waktu, 1x telat, 1 Hari tanpa keterangan
if (!tbodyContent.includes("4 Hari") || !tbodyContent.includes("1 Hari") || !tbodyContent.includes("80%")) {
  console.error("FAIL: Budi Santoso summary numbers incorrect in html:", tbodyContent);
  process.exit(1);
}
console.log("✓ Budi Santoso: 4 Hari Masuk, 1 Hari Tanpa Keterangan, 80% Kehadiran verified");

// Verify Siti's counts: 2 Hari masuk, 3 Hari tanpa keterangan, 40% Kehadiran
if (!tbodyContent.includes("2 Hari") || !tbodyContent.includes("3 Hari") || !tbodyContent.includes("40%")) {
  console.error("FAIL: Siti Aminah summary numbers incorrect in html:", tbodyContent);
  process.exit(1);
}
console.log("✓ Siti Aminah: 2 Hari Masuk, 3 Hari Tanpa Keterangan, 40% Kehadiran verified");

// 4. Test Filter "NO_INFO" (Tanpa Keterangan)
mockElement('abs-filter-compliance').value = 'NO_INFO';
ctx.filterAbsensiTable();
const filterNoInfoCount = mockElement('abs-row-count').textContent;
console.log("4. Filter NO_INFO count:", filterNoInfoCount);
if (!filterNoInfoCount.includes("Menampilkan 2 dari 2 Karyawan")) {
  console.error("FAIL: Both employees have Tanpa Keterangan days!");
  process.exit(1);
}
console.log("✓ Filter NO_INFO correctly matches employees with Tanpa Keterangan");

// 5. Test Filter "LATE" (Terlambat)
mockElement('abs-filter-compliance').value = 'LATE';
ctx.filterAbsensiTable();
const filterLateCount = mockElement('abs-row-count').textContent;
console.log("5. Filter LATE count:", filterLateCount);
if (!filterLateCount.includes("Menampilkan 1 dari 2 Karyawan")) {
  console.error("FAIL: Only Budi has late records!");
  process.exit(1);
}
console.log("✓ Filter LATE correctly matches only Budi Santoso");

// 6. Test Toggle to RAW mode
mockElement('abs-filter-compliance').value = 'ALL';
ctx.toggleAbsViewMode();
console.log("6. Cek absViewMode setelah toggle:", ctx.currentAbsViewMode);
if (ctx.currentAbsViewMode !== 'RAW') {
  console.error("FAIL: currentAbsViewMode should be 'RAW'");
  process.exit(1);
}
const rawRowCount = mockElement('abs-row-count').textContent;
console.log("   Raw row count:", rawRowCount);
if (!rawRowCount.includes("Menampilkan 10 dari 10 data absensi (Log Harian Mentah")) {
  console.error("FAIL: Raw row count should be 10 log rows:", rawRowCount);
  process.exit(1);
}
console.log("✓ Toggle to RAW mode successfully displays 10 individual daily records");

// 7. Test Toggle back to SUMMARY mode
ctx.toggleAbsViewMode();
console.log("7. Cek absViewMode setelah toggle balik:", ctx.currentAbsViewMode);
if (ctx.currentAbsViewMode !== 'SUMMARY') {
  console.error("FAIL: currentAbsViewMode should be 'SUMMARY'");
  process.exit(1);
}
console.log("✓ Toggle back to SUMMARY mode successfully returns to Rekap Per Karyawan");

// 8. Test Employee Detail Modal
ctx.openEmployeeAttendanceDetailModal('1001');
const modalName = mockElement('abs-modal-name').textContent;
const modalDays = mockElement('abs-modal-total-days').textContent;
const modalHadir = mockElement('abs-modal-hadir').textContent;
const modalTbody = mockElement('abs-modal-tbody').innerHTML;

console.log("8. Detail Modal - Nama:", modalName, "| Total Hari:", modalDays, "| Hadir:", modalHadir);
if (modalName !== 'Budi Santoso' || modalDays !== '5 Hari' || modalHadir !== '4 Hari') {
  console.error("FAIL: Detail modal stats mismatch!");
  process.exit(1);
}
if (!modalTbody.includes("01.06.2026") || !modalTbody.includes("Tanpa Keterangan")) {
  console.error("FAIL: Modal tbody missing expected rows/badges!");
  process.exit(1);
}
console.log("✓ Employee Attendance Detail Modal opens and populates 5 daily logs with exact dates & status");

console.log("\n>>> SEMUA TEST VERIFIKASI REKAPITULASI & LOG ABSENSI LULUS 100%! <<<");
