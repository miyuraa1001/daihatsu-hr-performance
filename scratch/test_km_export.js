const fs = require('fs');

const apiCode = fs.readFileSync('src/js/api.js', 'utf8');
const authCode = fs.readFileSync('src/js/auth.js', 'utf8');
const navCode = fs.readFileSync('src/js/navigation.js', 'utf8');
const dashCode = fs.readFileSync('src/js/dashboard.js', 'utf8');
const empCode = fs.readFileSync('src/js/employee.js', 'utf8');
const modCode = fs.readFileSync('src/js/modals.js', 'utf8');

const writtenFiles = [];
const mockXLSX = {
  utils: {
    json_to_sheet: (data, opts) => ({ data, opts }),
    book_new: () => ({ SheetNames: [], Sheets: {} }),
    book_append_sheet: (wb, ws, name) => {
      wb.SheetNames.push(name);
      wb.Sheets[name] = ws;
    }
  },
  writeFile: (wb, filename) => {
    writtenFiles.push({ wb, filename });
  }
};

const elements = {
  'km-filter-cabang': { value: 'ALL' },
  'branch-select': { value: 'ALL' },
  'month-select': { value: 'ALL' },
  'year-select': { value: '2026' }
};

const docMock = {
  getElementById: (id) => elements[id] || { value: 'ALL', textContent: '', innerHTML: '', classList: { add: ()=>{}, remove: ()=>{} } },
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: () => ({ classList: { add: ()=>{}, remove: ()=>{} }, appendChild: ()=>{} }),
  addEventListener: () => {}
};

const sandbox = {
  window: {},
  document: docMock,
  fetch: () => {},
  console: console,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  XLSX: mockXLSX,
  showToast: (msg) => console.log("TOAST:", msg)
};
sandbox.window = sandbox;

const codeBundle = `
${apiCode}
${authCode}
${navCode}
${dashCode}
${empCode}
${modCode}

return {
  window,
  ensureMasterStore,
  exportModuleTableToExcel
};
`;

const fn = new Function('window', 'document', 'fetch', 'localStorage', 'console', 'XLSX', 'showToast', codeBundle);
const app = fn(sandbox, docMock, sandbox.fetch, sandbox.localStorage, console, mockXLSX, sandbox.showToast);

app.window.loggedInUser = {
  username: 'admin',
  role: 'Admin',
  nama: 'Administrator DSO',
  isAllBranch: true,
  assignedBACodes: ['D660', 'D661', 'D662', 'D663', 'D664']
};

const samplePayload = {
  employeeList: [
    { npk: '1001', nama: 'Andi Yani', cabang: 'Lampung A Yani', kodeBA: 'D660' },
    { npk: '1002', nama: 'Budi Soetta', cabang: 'Lampung S Hatta', kodeBA: 'D661' },
    { npk: '1003', nama: 'Citra BDJ', cabang: 'Bandarjaya', kodeBA: 'D662' },
    { npk: '1004', nama: 'Dedi Lamut', cabang: 'Lampung Utara', kodeBA: 'D663' },
    { npk: '1005', nama: 'Eka Lamtim', cabang: 'Lampung Timur', kodeBA: 'D664' }
  ],
  rawTables: {
    Master_Karyawan: [
      { 'Personnel no.': '1001', 'Last name': 'Andi Yani', 'P.subarea': 'Lampung A Yani', 'Business area': 'D660' },
      { 'Personnel no.': '1002', 'Last name': 'Budi Soetta', 'P.subarea': 'Lampung S Hatta', 'Business area': 'D661' },
      { 'Personnel no.': '1003', 'Last name': 'Citra BDJ', 'P.subarea': 'Bandarjaya', 'Business area': 'D662' },
      { 'Personnel no.': '1004', 'Last name': 'Dedi Lamut', 'P.subarea': 'Lampung Utara', 'Business area': 'D663' },
      { 'Personnel no.': '1005', 'Last name': 'Eka Lamtim', 'P.subarea': 'Lampung Timur', 'Business area': 'D664' }
    ],
    Knowledge_management: [
      { NPK: '1001', NAMA: 'Andi Yani', JUDUL: 'Modul Sales Jan', TANGGAL: '2026-01-15', TIME: '09:00:00' },
      { NPK: '1001', NAMA: 'Andi Yani', JUDUL: 'Modul Sales Mar', TANGGAL: '2026-03-20', TIME: '10:30:00' },
      { NPK: '1002', NAMA: 'Budi Soetta', JUDUL: 'Modul Admin Feb', TANGGAL: '2026-02-10', TIME: '14:00:00' },
      { NPK: '1003', NAMA: 'Citra BDJ', JUDUL: 'Modul Service Mei', TANGGAL: '2026-05-02', TIME: '11:15:00' },
      { NPK: '1005', NAMA: 'Eka Lamtim', JUDUL: 'Modul IT Des', TANGGAL: '2026-12-01', TIME: '08:45:00' }
    ]
  }
};

app.ensureMasterStore(samplePayload);

// Test 1: Export KM with Semua Cabang and Semua Bulan
console.log("=== TEST 1: EXPORT KM DENGAN SEMUA CABANG & SEMUA BULAN ===");
elements['km-filter-cabang'].value = 'ALL';
elements['branch-select'].value = 'ALL';
elements['month-select'].value = 'ALL';
elements['year-select'].value = '2026';

app.exportModuleTableToExcel('Knowledge_management');

if (writtenFiles.length === 0) throw new Error("No file written!");
const file1 = writtenFiles[writtenFiles.length - 1];
console.log(`Generated filename: ${file1.filename}`);
console.log(`Sheet names (${file1.wb.SheetNames.length}):`, file1.wb.SheetNames);

if (file1.wb.SheetNames[0] !== 'Rekap_KM') {
  throw new Error(`Sheet 1 must be Rekap_KM, got ${file1.wb.SheetNames[0]}`);
}
if (file1.wb.SheetNames.length !== 13) {
  throw new Error(`Expected 13 sheets (1 Rekap + 12 Bulanan), got ${file1.wb.SheetNames.length}`);
}

const rekapWs = file1.wb.Sheets['Rekap_KM'];
console.log(`Rekap_KM columns:`, rekapWs.opts.header);
console.log(`Rekap_KM row count: ${rekapWs.data.length}`);

// Print rekap sample rows
rekapWs.data.forEach((r, i) => {
  console.log(`Row ${i + 1}: [${r.Cabang}] ${r.Nama} (${r.NPK}) => Total: ${r['Jumlah KM Per Tahun']}, Jan: ${r.Januari}, Feb: ${r.Februari}, Mar: ${r.Maret}, Mei: ${r.Mei}, Des: ${r.Desember}`);
});

// Verify columns in Rekap_KM
const expectedRekapCols = ["No", "Cabang", "Nama", "NPK", "Jumlah KM Per Tahun", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
expectedRekapCols.forEach(c => {
  if (!rekapWs.opts.header.includes(c)) throw new Error(`Missing column ${c} in Rekap_KM`);
});

// Check January Sheet
const janWs = file1.wb.Sheets['Januari'];
console.log(`\nJanuari Sheet header:`, janWs.opts.header);
console.log(`Januari rows:`, janWs.data);
if (janWs.data.length !== 1) throw new Error(`Expected 1 row in Januari sheet, got ${janWs.data.length}`);
if (janWs.data[0].Nama !== 'Andi Yani') throw new Error(`Expected Andi Yani in Januari, got ${janWs.data[0].Nama}`);
if (janWs.data[0].Judul !== 'Modul Sales Jan') throw new Error(`Expected Judul 'Modul Sales Jan' in Januari`);

// Check December Sheet
const desWs = file1.wb.Sheets['Desember'];
console.log(`\nDesember Sheet rows:`, desWs.data);
if (desWs.data.length !== 1) throw new Error(`Expected 1 row in Desember sheet, got ${desWs.data.length}`);
if (desWs.data[0].Nama !== 'Eka Lamtim') throw new Error(`Expected Eka Lamtim in Desember`);

// Check April (empty month)
const aprWs = file1.wb.Sheets['April'];
console.log(`\nApril Sheet (Empty month) header:`, aprWs.opts.header);
console.log(`April rows count:`, aprWs.data.length);
// Test 2: Export KM with Bulan Tertentu (Maret)
console.log("\n=== TEST 2: EXPORT KM DENGAN BULAN MARET ===");
elements['month-select'].value = 'Maret';
app.exportModuleTableToExcel('Knowledge_management');

const file2 = writtenFiles[writtenFiles.length - 1];
console.log(`Generated filename: ${file2.filename}`);
console.log(`Sheet names (${file2.wb.SheetNames.length}):`, file2.wb.SheetNames);
if (file2.wb.SheetNames.length !== 2) {
  throw new Error(`Expected 2 sheets for single month export, got ${file2.wb.SheetNames.length}`);
}
if (file2.wb.SheetNames[0] !== 'Rekap_KM' || file2.wb.SheetNames[1] !== 'Maret') {
  throw new Error(`Expected sheets ['Rekap_KM', 'Maret'], got ${JSON.stringify(file2.wb.SheetNames)}`);
}
const maretWs = file2.wb.Sheets['Maret'];
if (maretWs.data.length !== 1) throw new Error(`Expected 1 row in Maret sheet, got ${maretWs.data.length}`);
if (maretWs.data[0].Nama !== 'Andi Yani') throw new Error(`Expected Andi Yani in Maret sheet`);

console.log("\n>>> ALL KM EXPORT TESTS PASSED 100%! <<<");
