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

console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY 100%! <<<");
