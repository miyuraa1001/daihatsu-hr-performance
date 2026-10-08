const fs = require('fs');

const apiCode = fs.readFileSync('src/js/api.js', 'utf8');
const authCode = fs.readFileSync('src/js/auth.js', 'utf8');
const navCode = fs.readFileSync('src/js/navigation.js', 'utf8');
const dashCode = fs.readFileSync('src/js/dashboard.js', 'utf8');
const empCode = fs.readFileSync('src/js/employee.js', 'utf8');
const modCode = fs.readFileSync('src/js/modals.js', 'utf8');

const elements = {
  'km-search-input': { value: '' },
  'km-filter-kategori': { value: 'ALL', innerHTML: '' },
  'km-filter-cabang': { value: 'ALL', innerHTML: '' },
  'km-table-header': { innerHTML: '' },
  'km-table-body': { innerHTML: '<tr><td>Memuat...</td></tr>' },
  'km-row-count': { textContent: '' },
  'km-kpi-total': { textContent: '' },
  'km-kpi-contributors': { textContent: '' },
  'km-kpi-top-category': { textContent: '' },
  'km-kpi-verified': { textContent: '' },
  'branch-select': { value: 'ALL' },
  'branch-select-mobile': { value: 'ALL' },
  'month-select': { value: 'ALL' },
  'year-select': { value: '2026' }
};

const makeElem = () => ({
  value: '', textContent: '', innerHTML: '',
  classList: { add: ()=>{}, remove: ()=>{} },
  disabled: false, appendChild: ()=>{}, setAttribute: ()=>{}, style: {},
  querySelector: () => ({ classList: { add: ()=>{}, remove: ()=>{} } })
});

const docMock = {
  getElementById: (id) => elements[id] || makeElem(),
  querySelectorAll: () => [],
  querySelector: () => makeElem(),
  createElement: () => makeElem(),
  addEventListener: () => {}
};

const sandbox = {
  window: {},
  document: docMock,
  fetch: () => {},
  console: console,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
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
  renderAllDashboardData,
  renderKMView,
  filterKMTable,
  switchView
};
`;

const fn = new Function('window', 'document', 'fetch', 'localStorage', 'console', 'showToast', codeBundle);
const app = fn(sandbox, docMock, sandbox.fetch, sandbox.localStorage, console, sandbox.showToast);

app.window.loggedInUser = {
  username: 'admin',
  role: 'Admin',
  nama: 'Administrator DSO',
  isAllBranch: true,
  assignedBACodes: ['D660', 'D661', 'D662', 'D663', 'D664']
};

const samplePayload = {
  employeeList: [
    { npk: '1001', nama: 'Andi Yani', cabang: 'Lampung A Yani', kodeBA: 'D660', 'Status_Karyawan': 'Aktif' },
    { npk: '1002', nama: 'Budi Soetta', cabang: 'Lampung S Hatta', kodeBA: 'D661', 'Status_Karyawan': 'Aktif' }
  ],
  rawTables: {
    Master_Karyawan: [
      { 'Personnel no.': '1001', 'Last name': 'Andi Yani', 'P.subarea': 'Lampung A Yani', 'Business area': 'D660', 'Status_Karyawan': 'Aktif' },
      { 'Personnel no.': '1002', 'Last name': 'Budi Soetta', 'P.subarea': 'Lampung S Hatta', 'Business area': 'D661', 'Status_Karyawan': 'Aktif' }
    ],
    Knowledge_management: [
      { NPK: '1001', NAMA: 'Andi Yani', JUDUL: 'Modul Sales Jan', TANGGAL: '2026-01-15', TIME: '09:00:00' },
      { NPK: '1002', NAMA: 'Budi Soetta', JUDUL: 'Modul Service Feb', TANGGAL: '2026-02-10', TIME: '14:00:00' }
    ]
  }
};

console.log("--- SCENARIO 1: Admin ALL Branches ---");
app.renderAllDashboardData(samplePayload, 'ALL');
app.switchView('km');
console.log("km-row-count:", elements['km-row-count'].textContent);
console.log("km-table-body length:", elements['km-table-body'].innerHTML.length);
console.log("km-table-body snippet:", elements['km-table-body'].innerHTML.slice(0, 200));

console.log("\n--- SCENARIO 2: Admin D660 Branch ---");
elements['branch-select'].value = 'D660';
elements['km-filter-cabang'].value = 'D660';
app.renderAllDashboardData(samplePayload, 'D660');
app.switchView('km');
console.log("km-row-count:", elements['km-row-count'].textContent);
console.log("km-table-body length:", elements['km-table-body'].innerHTML.length);
console.log("km-table-body snippet:", elements['km-table-body'].innerHTML.slice(0, 200));

console.log("\n--- SCENARIO 3: Backend payload has key 'Knowledge Management' or 'Data_KM' ---");
const samplePayload2 = {
  employeeList: samplePayload.employeeList,
  rawTables: {
    Master_Karyawan: samplePayload.rawTables.Master_Karyawan,
    'Knowledge Management': [
      { NPK: '1001', NAMA: 'Andi Yani', JUDUL: 'Modul Sales Jan', TANGGAL: '2026-01-15', TIME: '09:00:00' }
    ]
  }
};
app.renderAllDashboardData(samplePayload2, 'ALL');
app.switchView('km');
console.log("km-row-count with 'Knowledge Management':", elements['km-row-count'].textContent);
console.log("km-table-body snippet:", elements['km-table-body'].innerHTML.slice(0, 200));

console.log("\n--- SCENARIO 4: Kacab D660 logs in (Matching Branch) ---");
app.window.loggedInUser = {
  username: 'kacab_ayani',
  role: 'kacab',
  nama: 'Kacab Lampung A Yani',
  kodeBA: 'D660',
  isAllBranch: false,
  assignedBACodes: ['D660']
};
elements['km-filter-cabang'].value = 'D660';
elements['branch-select'].value = 'D660';
app.renderAllDashboardData(samplePayload, 'D660');
app.switchView('km');
console.log("km-row-count for Kacab D660:", elements['km-row-count'].textContent);
console.log("km-table-body length:", elements['km-table-body'].innerHTML.length);
console.log("km-table-body snippet:", elements['km-table-body'].innerHTML.slice(0, 200));

