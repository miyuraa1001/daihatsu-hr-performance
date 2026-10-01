const fs = require('fs');

// Load files
const apiCode = fs.readFileSync('src/js/api.js', 'utf8');

const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    getElementById: (id) => ({
      value: 'ALL',
      textContent: '',
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      setAttribute: () => {},
      appendChild: () => {}
    }),
    querySelectorAll: () => []
  },
  fetch: () => {},
  console: console
};

const fn = new Function('window', 'document', 'fetch', apiCode + `
return {
  KNOWN_BRANCHES,
  ALLOWED_BRANCH_CODES,
  resolveBranchInfo,
  resolveBACode,
  getUserBranchCode,
  getUserBranchName,
  isUserAdmin,
  isLampungBranch,
  matchBranch,
  sanitizeLampungPayload,
  SCHEMAS,
  getRowCellValue
};
`);

const api = fn(sandbox.window, sandbox.document, sandbox.fetch);

console.log("=== TEST USER DASHBOARD LOGIC & RESOLUTION ===");

// Sample Raw Master_Karyawan returned from Google Sheets
const rawMasterKaryawan = [
  { 'Personnel no.': '10002145', 'Last name': 'Ahmad Kurniawan', 'P.subarea': 'Lampung A Yani', 'Business area': '660', 'Job Title': 'Sales Executive', 'Contract': 'Tetap' },
  { 'Personnel no.': '10002146', 'Last name': 'Budi Santoso', 'P.subarea': 'Lampung A Yani', 'Business area': 660, 'Job Title': 'Service Advisor', 'Contract': 'Kontrak' },
  { 'Personnel no.': '10002147', 'Last name': 'Citra Dewi', 'P.subarea': 'Lampung S Hatta', 'Business area': '661', 'Job Title': 'Sales Counter', 'Contract': 'Tetap' },
  { 'Personnel no.': '10002148', 'Last name': 'Dodi Pratama', 'P.subarea': 'Bandarjaya', 'Business area': '662', 'Job Title': 'Mechanic', 'Contract': 'Tetap' }
];

// Test 1: Kacab D660 user object
const userKacabD660 = {
  username: 'kacab_ayani',
  role: 'kacab',
  nama: 'Kepala Cabang A Yani',
  assignedBACodes: ['D660'],
  isAllBranch: false
};

const userCode = api.getUserBranchCode(userKacabD660);
console.log('1. User branch code for Kacab D660:', userCode);
if (userCode !== 'D660') throw new Error('Expected D660');

// Test 2: Filtering raw Master_Karyawan for Kacab D660
const matchedD660 = rawMasterKaryawan.filter(e => api.matchBranch(e, userCode));
console.log('2. Matched employees for Kacab D660 count:', matchedD660.length);
matchedD660.forEach(e => console.log('   - ' + e['Last name'] + ' (' + e['P.subarea'] + ', BA: ' + e['Business area'] + ')'));
if (matchedD660.length !== 2) throw new Error('Expected exactly 2 employees for D660');

// Test 3: Kacab D661 user object
const userKacabD661 = {
  username: 'kacab_shatta',
  role: 'kacab',
  nama: 'Kepala Cabang S Hatta',
  assignedBACodes: ['661'],
  isAllBranch: false
};
const userCodeD661 = api.getUserBranchCode(userKacabD661);
console.log('3. User branch code for Kacab D661:', userCodeD661);
if (userCodeD661 !== 'D661') throw new Error('Expected D661');

const matchedD661 = rawMasterKaryawan.filter(e => api.matchBranch(e, userCodeD661));
console.log('4. Matched employees for Kacab D661 count:', matchedD661.length);
matchedD661.forEach(e => console.log('   - ' + e['Last name'] + ' (' + e['P.subarea'] + ', BA: ' + e['Business area'] + ')'));
if (matchedD661.length !== 1) throw new Error('Expected exactly 1 employee for D661');

// Test 4: Kacab D662 user object with string "Bandarjaya"
const userKacabD662 = {
  username: 'kacab_bdj',
  role: 'kacab',
  cabang: 'Bandarjaya'
};
const userCodeD662 = api.getUserBranchCode(userKacabD662);
console.log('5. User branch code for Kacab Bandarjaya:', userCodeD662);
if (userCodeD662 !== 'D662') throw new Error('Expected D662');

const matchedD662 = rawMasterKaryawan.filter(e => api.matchBranch(e, userCodeD662));
console.log('6. Matched employees for Kacab D662 count:', matchedD662.length);
if (matchedD662.length !== 1) throw new Error('Expected exactly 1 employee for D662');

console.log('\n>>> ALL USER DASHBOARD LOGIC TESTS PASSED! <<<');
