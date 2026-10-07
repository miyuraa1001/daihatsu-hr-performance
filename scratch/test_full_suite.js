const fs = require('fs');

const apiCode = fs.readFileSync('src/js/api.js', 'utf8');
const authCode = fs.readFileSync('src/js/auth.js', 'utf8');
const navCode = fs.readFileSync('src/js/navigation.js', 'utf8');
const dashCode = fs.readFileSync('src/js/dashboard.js', 'utf8');
const empCode = fs.readFileSync('src/js/employee.js', 'utf8');
const modCode = fs.readFileSync('src/js/modals.js', 'utf8');

const localStorageStore = {};
const mockLocalStorage = {
  getItem: (k) => localStorageStore[k] || null,
  setItem: (k, v) => { localStorageStore[k] = String(v); },
  removeItem: (k) => { delete localStorageStore[k]; }
};

const elements = {};
const getMockEl = (id) => {
  if (!elements[id]) {
    elements[id] = {
      id,
      value: id.includes('branch') ? 'ALL' : 'ALL',
      textContent: '',
      innerHTML: '',
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      querySelectorAll: () => [],
      querySelector: () => null,
      appendChild: () => {},
      addEventListener: () => {},
      setAttribute: () => {},
      getAttribute: () => null,
      style: {}
    };
  }
  return elements[id];
};

const docMock = {
  getElementById: (id) => getMockEl(id),
  querySelectorAll: () => [],
  querySelector: (sel) => getMockEl(sel),
  createElement: (tag) => ({
    tagName: tag,
    className: '',
    innerHTML: '',
    style: {},
    appendChild: () => {},
    setAttribute: () => {},
    classList: { add: () => {}, remove: () => {}, contains: () => false }
  }),
  addEventListener: () => {}
};

const sandbox = {
  window: {},
  document: docMock,
  fetch: () => {},
  console: console,
  localStorage: mockLocalStorage
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
  renderAllDashboardData,
  loadBackendDashboardData,
  initializeStandardTables,
  matchBranch,
  isLampungBranch,
  resolveBranchInfo,
  resolveBACode
};
`;

const fn = new Function('window', 'document', 'fetch', 'localStorage', 'console', codeBundle);
const app = fn(sandbox, docMock, sandbox.fetch, sandbox.localStorage, console);

console.log("=== 1. TEST SYNTAX & SCRIPT PARSING ===");
console.log("All scripts evaluated with 0 syntax errors!");

console.log("\n=== 2. TEST BRANCH RESOLUTION & LAMPUNG PRESERVATION ===");
const branchTests = [
  { in: '660', exp: 'D660' },
  { in: 'D660', exp: 'D660' },
  { in: 'Lampung A Yani', exp: 'D660' },
  { in: 'DSO Lampung', exp: 'D660' },
  { in: 'Cabang Lampung', exp: 'D660' },
  { in: 'Bandarjaya', exp: 'D662' },
  { in: 'Lampung S Hatta', exp: 'D661' },
  { in: 'Kotabumi', exp: 'D663' },
  { in: 'Lampung Timur', exp: 'D664' }
];

branchTests.forEach(bt => {
  const code = app.resolveBACode(bt.in);
  if (code !== bt.exp) throw new Error(`Expected ${bt.exp} for ${bt.in}, got ${code}`);
  console.log(`✓ resolveBACode('${bt.in}') => ${code}`);
});

console.log("\n=== 3. TEST RESILIENT HYDRATION FROM BACKEND DATA ===");
// Realistic scenario: Apps Script returns employeeList and an empty/unmapped rawTables.Master_Karyawan
const backendData = {
  summary: { totalKaryawan: 2 },
  employeeList: [
    {
      npk: '10002145',
      nama: 'Ahmad Kurniawan',
      cabang: 'Lampung A Yani',
      kodeBA: 'D660',
      jabatan: 'Sales Executive',
      kontrak: 'Tetap',
      dob: '1990-05-15',
      date: '2015-08-01'
    },
    {
      npk: '10002146',
      nama: 'Budi Santoso',
      cabang: 'Bandarjaya',
      kodeBA: 'D662',
      jabatan: 'Mechanic',
      kontrak: 'Kontrak',
      dob: '1995-10-20',
      date: '2020-03-01'
    }
  ],
  qccList: [],
  rawTables: {
    Master_Karyawan: [{}], // Empty row from unmapped e.raw
    Data_Kehadiran: [
      { NPK: '10002145', 'Employee Name': 'Ahmad Kurniawan', Cabang: 'Lampung A Yani', Date: '2026-06-01', 'Time Clock In': '07:55' }
    ],
    Data_SS: [],
    Data_QCC: [],
    Data_SP: [],
    Knowledge_management: []
  }
};

app.window.loggedInUser = {
  username: 'admin',
  role: 'Admin',
  nama: 'Administrator',
  isAllBranch: true,
  assignedBACodes: ['D660', 'D661', 'D662', 'D663', 'D664']
};

app.ensureMasterStore(backendData);

const masterEmps = app.window.masterFullPayload?.employeeList;
const rawMaster = app.window.masterFullPayload?.rawTables?.Master_Karyawan;

console.log(`Master store employeeList count: ${masterEmps?.length}`);
console.log(`Master store rawTables.Master_Karyawan count: ${rawMaster?.length}`);

if (!masterEmps || masterEmps.length !== 2) throw new Error("Expected 2 employees in employeeList");
if (!rawMaster || rawMaster.length !== 2) throw new Error("Expected 2 employees in rawTables.Master_Karyawan");

const emp1 = masterEmps[0];
const raw1 = rawMaster[0];

console.log('Employee 1 NPK:', emp1.npk, 'Nama:', emp1.nama, 'Cabang:', emp1.cabang, 'Umur:', emp1.umurText, 'Masa Kerja:', emp1.masaKerjaText);
console.log('Raw Master 1 Personnel no.:', raw1['Personnel no.'], 'Last name:', raw1['Last name'], 'P.subarea:', raw1['P.subarea']);

if (raw1['Personnel no.'] !== '10002145') throw new Error("Expected Personnel no. 10002145");
if (raw1['Last name'] !== 'Ahmad Kurniawan') throw new Error("Expected Last name Ahmad Kurniawan");
if (raw1['P.subarea'] !== 'Lampung A Yani') throw new Error("Expected P.subarea Lampung A Yani");

console.log("\n=== 4. TEST RENDERING DASHBOARD DATA ===");
app.renderAllDashboardData(app.window.masterFullPayload, 'ALL', 'ALL', 'ALL');
console.log("✓ renderAllDashboardData executed without errors!");

console.log("\n=== 5. TEST LOCAL STORAGE CACHE RECOVERY ===");
const cached = mockLocalStorage.getItem('dperform_cached_master_payload');
if (!cached) throw new Error("Expected dperform_cached_master_payload in localStorage");
const parsedCache = JSON.parse(cached);
console.log(`✓ Cached payload has ${parsedCache.employeeList.length} employees`);

console.log("\n=== 6. TEST STRICT 5 DSO LAMPUNG BRANCH ISOLATION WITH MIXED DATASET ===");
const mixedBackendData = {
  summary: { totalKaryawan: 7 },
  employeeList: [
    // 5 Official Lampung branches
    { npk: '1001', nama: 'Andi Yani', cabang: 'Lampung A Yani', kodeBA: 'D660', 'Job Title': 'Sales', tglLahir: '1990-01-01', joinDate: '2015-01-01' },
    { npk: '1002', nama: 'Budi Soetta', cabang: 'Lampung S Hatta', kodeBA: '661', 'Job Title': 'Admin', tglLahir: '1992-02-02', joinDate: '2016-02-02' },
    { npk: '1003', nama: 'Citra BDJ', cabang: 'Bandarjaya', kodeBA: '662', 'Job Title': 'Service', tglLahir: '1993-03-03', joinDate: '2017-03-03' },
    { npk: '1004', nama: 'Dedi Lamut', cabang: 'Kotabumi', kodeBA: '663', 'Job Title': 'Mechanic', tglLahir: '1994-04-04', joinDate: '2018-04-04' },
    { npk: '1005', nama: 'Eka Lamtim', cabang: 'Sukadana', kodeBA: '664', 'Job Title': 'Staff', tglLahir: '1995-05-05', joinDate: '2019-05-05' },
    
    // Outside non-Lampung branches
    { npk: '2001', nama: 'Farhan Sunter', cabang: 'Jakarta Sunter', kodeBA: 'D101', 'Job Title': 'Sales', tglLahir: '1990-01-01', joinDate: '2015-01-01' },
    { npk: '2002', nama: 'Gita Palembang', cabang: 'Palembang', kodeBA: 'D650', 'Job Title': 'Admin', tglLahir: '1991-01-01', joinDate: '2016-01-01', wilayah: 'DSO Sumbagsel' },
    { npk: '2003', nama: 'Hadi Medan', cabang: 'Medan', kodeBA: 'D610', 'Job Title': 'Service', tglLahir: '1992-01-01', joinDate: '2017-01-01', wilayah: 'DSO' }
  ],
  qccList: [
    { circle: 'Circle Lampung A', cabang: 'Lampung A Yani', kodeBA: 'D660', tema: 'Quality' },
    { circle: 'Circle Sunter', cabang: 'Jakarta Sunter', kodeBA: 'D101', tema: 'Logistics' }
  ],
  rawTables: {
    Master_Karyawan: [
      { 'Personnel no.': '1001', 'Last name': 'Andi Yani', 'P.subarea': 'Lampung A Yani', 'Business area': '660' },
      { 'Personnel no.': '1002', 'Last name': 'Budi Soetta', 'P.subarea': 'Lampung S Hatta', 'Business area': '661' },
      { 'Personnel no.': '1003', 'Last name': 'Citra BDJ', 'P.subarea': 'Bandarjaya', 'Business area': '662' },
      { 'Personnel no.': '1004', 'Last name': 'Dedi Lamut', 'P.subarea': 'Kotabumi', 'Business area': '663' },
      { 'Personnel no.': '1005', 'Last name': 'Eka Lamtim', 'P.subarea': 'Sukadana', 'Business area': '664' },
      { 'Personnel no.': '2001', 'Last name': 'Farhan Sunter', 'P.subarea': 'Jakarta Sunter', 'Business area': 'D101' },
      { 'Personnel no.': '2002', 'Last name': 'Gita Palembang', 'P.subarea': 'Palembang', 'Business area': 'D650', Wilayah: 'DSO Sumbagsel' },
      { 'Personnel no.': '2003', 'Last name': 'Hadi Medan', 'P.subarea': 'Medan', 'Business area': 'D610', Wilayah: 'DSO' }
    ],
    Data_Kehadiran: [
      { NPK: '1001', 'Employee Name': 'Andi Yani', Cabang: 'Lampung A Yani', 'Time Clock In': '07:55' },
      { NPK: '2001', 'Employee Name': 'Farhan Sunter', Cabang: 'Jakarta Sunter', 'Time Clock In': '08:05' }
    ],
    Data_SS: [
      { NPK: '1002', Nama: 'Budi Soetta', Cabang: 'Lampung S Hatta', 'Judul SS': 'Kaizen Lampu' },
      { NPK: '2002', Nama: 'Gita Palembang', Cabang: 'Palembang', 'Judul SS': 'Kaizen Palembang' }
    ],
    Data_QCC: [
      { circle: 'Circle Lampung A', cabang: 'Lampung A Yani', kodeBA: 'D660' },
      { circle: 'Circle Sunter', cabang: 'Jakarta Sunter', kodeBA: 'D101' }
    ],
    Data_SP: [
      { NPK: '1003', Nama: 'Citra BDJ', 'Kode BA': 'D662', 'Tingkat SP': 'SP 1' },
      { NPK: '2003', Nama: 'Hadi Medan', 'Kode BA': 'D610', 'Tingkat SP': 'SP 1' }
    ],
    Knowledge_management: [
      { NPK: '1001', NAMA: 'Andi Yani', JUDUL: 'Modul Sales Lampung' }
    ]
  }
};

app.ensureMasterStore(mixedBackendData);

const filteredEmps = app.window.masterFullPayload.employeeList;
const filteredRawMaster = app.window.masterFullPayload.rawTables.Master_Karyawan;
const filteredKehadiran = app.window.masterFullPayload.rawTables.Data_Kehadiran;
const filteredSS = app.window.masterFullPayload.rawTables.Data_SS;
const filteredQCC = app.window.masterFullPayload.rawTables.Data_QCC;
const filteredSP = app.window.masterFullPayload.rawTables.Data_SP;

console.log(`Filtered employeeList count: ${filteredEmps.length} (Expected: 5)`);
console.log(`Filtered raw Master_Karyawan count: ${filteredRawMaster.length} (Expected: 5)`);
console.log(`Filtered Data_Kehadiran count: ${filteredKehadiran.length} (Expected: 1)`);
console.log(`Filtered Data_SS count: ${filteredSS.length} (Expected: 1)`);
console.log(`Filtered Data_QCC count: ${filteredQCC.length} (Expected: 1)`);
console.log(`Filtered Data_SP count: ${filteredSP.length} (Expected: 1)`);

if (filteredEmps.length !== 5) throw new Error(`Expected strictly 5 employees in employeeList, got ${filteredEmps.length}`);
if (filteredRawMaster.length !== 5) throw new Error(`Expected strictly 5 employees in Master_Karyawan, got ${filteredRawMaster.length}`);
if (filteredKehadiran.length !== 1) throw new Error(`Expected strictly 1 row in Data_Kehadiran, got ${filteredKehadiran.length}`);
if (filteredSS.length !== 1) throw new Error(`Expected strictly 1 row in Data_SS, got ${filteredSS.length}`);
if (filteredQCC.length !== 1) throw new Error(`Expected strictly 1 row in Data_QCC, got ${filteredQCC.length}`);
if (filteredSP.length !== 1) throw new Error(`Expected strictly 1 row in Data_SP, got ${filteredSP.length}`);

// Verify every remaining employee belongs to D660..D664
filteredEmps.forEach(emp => {
  const code = app.resolveBACode(emp.kodeBA || emp.cabang);
  console.log(`✓ Retained employee: ${emp.nama} (${emp.cabang}) => ${code}`);
  if (!['D660', 'D661', 'D662', 'D663', 'D664'].includes(code)) {
    throw new Error(`Unauthorized branch leaked: ${code} for employee ${emp.nama}`);
  }
});

// Test renderAllDashboardData with target 'ALL'
app.renderAllDashboardData(app.window.masterFullPayload, 'ALL', 'ALL', 'ALL');
console.log("✓ renderAllDashboardData (ALL) successfully executed with strictly 5 branches!");

// Test renderAllDashboardData with target 'D660'
app.renderAllDashboardData(app.window.masterFullPayload, 'D660', 'ALL', 'ALL');
console.log("✓ renderAllDashboardData (D660) successfully filtered single branch!");

console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY 100%! <<<");

