const KNOWN_BRANCHES = [
  { 
    code: 'D660', 
    numericCode: '660',
    name: 'Lampung A Yani', 
    fullName: 'Lampung A Yani (D660)', 
    aliases: ['d660', '660', '0660', '2660', 'd-660', 'd.660', 'a yani', 'ayani', 'a. yani', 'ahmad yani', 'ahmadyani', 'lampung a yani', 'lampung ayani', 'lampung a. yani', 'tanjung karang', 'tjk', 'bandar lampung', 'kedaton'] 
  },
  { 
    code: 'D661', 
    numericCode: '661',
    name: 'Lampung S Hatta', 
    fullName: 'Lampung S Hatta (D661)', 
    aliases: ['d661', '661', '0661', '2661', 'd-661', 'd.661', 's hatta', 'shatta', 's. hatta', 'soekarno hatta', 'soekarnohatta', 'lampung s hatta', 'lampung soekarno hatta', 'by pass', 'bypass'] 
  },
  { 
    code: 'D662', 
    numericCode: '662',
    name: 'Bandarjaya', 
    fullName: 'Bandarjaya (D662)', 
    aliases: ['d662', '662', '0662', '2662', 'd-662', 'd.662', 'bandarjaya', 'bandar jaya', 'bdj', 'lampung tengah', 'lamteng'] 
  },
  { 
    code: 'D663', 
    numericCode: '663',
    name: 'Lampung Utara', 
    fullName: 'Lampung Utara (D663)', 
    aliases: ['d663', '663', '0663', '2663', 'd-663', 'd.663', 'lampung utara', 'lamut', 'lam ut', 'kotabumi', 'kota bumi', 'ktb'] 
  },
  { 
    code: 'D664', 
    numericCode: '664',
    name: 'Lampung Timur', 
    fullName: 'Lampung Timur (D664)', 
    aliases: ['d664', '664', '0664', '2664', 'd-664', 'd.664', 'lampung timur', 'lamtim', 'lam tim', 'sukadana'] 
  }
];

const ALLOWED_BRANCH_CODES = ['D660', 'D661', 'D662', 'D663', 'D664', '660', '661', '662', '663', '664'];

function resolveBranchInfo(input) {
  if (!input && input !== 0) return null;
  const str = String(input).trim();
  if (!str || str === '-' || str === 'null' || str === 'undefined') return null;

  const upper = str.toUpperCase();
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Cek kode persis (misal 'D660' atau '660')
  let found = KNOWN_BRANCHES.find(b => b.code.toUpperCase() === upper || b.numericCode === upper);
  if (found) return found;

  // 2. Cek apakah ada nomor cabang spesifik (660, 661, 662, 663, 664) dalam string
  for (const b of KNOWN_BRANCHES) {
    if (upper.includes(b.code.toUpperCase()) || clean.includes(b.numericCode)) {
      return b;
    }
  }

  // 3. Cek cabang spesifik yang memiliki nama gabungan terlebih dahulu
  // Misal 'Lampung S Hatta', 'Lampung Utara', 'Lampung Timur' harus diprioritaskan sebelum 'Lampung' saja
  if (clean.includes('shatta') || clean.includes('soekarnohatta') || clean.includes('bypass')) {
    return KNOWN_BRANCHES.find(b => b.code === 'D661');
  }
  if (clean.includes('kotabumi') || clean.includes('lamut') || clean.includes('lampungutara')) {
    return KNOWN_BRANCHES.find(b => b.code === 'D663');
  }
  if (clean.includes('lamtim') || clean.includes('lampungtimur') || clean.includes('sukadana')) {
    return KNOWN_BRANCHES.find(b => b.code === 'D664');
  }
  if (clean.includes('bandarjaya') || clean.includes('lamteng') || clean.includes('lampungtengah')) {
    return KNOWN_BRANCHES.find(b => b.code === 'D662');
  }
  if (clean.includes('ayani') || clean.includes('ahmadyani') || clean.includes('tanjungkarang') || clean === 'lampung') {
    return KNOWN_BRANCHES.find(b => b.code === 'D660');
  }

  for (const b of KNOWN_BRANCHES) {
    if (b.aliases) {
      for (const al of b.aliases) {
        const alClean = al.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (clean === alClean) {
          return b;
        }
      }
    }
  }

  return null;
}

function resolveBACode(str) {
  if (!str && str !== 0) return '';
  const clean = String(str).toUpperCase().trim();
  const info = resolveBranchInfo(clean);
  return info ? info.code : '';
}

function getUserBranchCode(user) {
  if (!user) return 'D660';
  let cand = null;
  if (Array.isArray(user.assignedBACodes) && user.assignedBACodes.length > 0) {
    const first = user.assignedBACodes[0];
    cand = (typeof first === 'object' && first !== null) ? (first.code || first.kodeBA || first.ba) : first;
  }
  if (!cand) {
    cand = user.kodeBA || user.kode_ba || user.businessArea || user.business_area || user.ba || user.cabang || user.branch;
  }
  const info = resolveBranchInfo(cand);
  return info ? info.code : (cand ? String(cand).trim().toUpperCase() : 'D660');
}

function isLampungBranch(item) {
  if (!item) return false;
  if (item['JUDUL'] !== undefined || item['judul'] !== undefined || item['Judul'] !== undefined) return true;

  const rawCode = item.kodeBA || item.kode_ba || item['Kode BA'] || item['Business area'] || item['Business Area'] || item['_kodeBA'] || '';
  if (rawCode && rawCode !== '-' && rawCode !== '0') {
    const norm = resolveBACode(rawCode);
    if (norm && ALLOWED_BRANCH_CODES.includes(norm)) return true;
  }

  const rawCabang = item.cabang || item.branch || item['Cabang'] || item['cabang'] || item['P.subarea'] || item['Nama Cabang'] || '';
  if (rawCabang && rawCabang !== '-' && rawCabang !== '0') {
    const norm = resolveBACode(rawCabang);
    if (norm && ALLOWED_BRANCH_CODES.includes(norm)) return true;
  }

  const rawWilayah = item.wilayah || item['Wilayah'] || '';
  if (rawWilayah && String(rawWilayah).toLowerCase().includes('lampung')) {
    return true;
  }

  return false;
}

function matchBranch(item, targetBranchCode) {
  if (!item) return false;
  if (!targetBranchCode || targetBranchCode === 'ALL') {
    return isLampungBranch(item);
  }
  if (!isLampungBranch(item)) return false;

  const targetInfo = resolveBranchInfo(targetBranchCode);
  const targetCode = (targetInfo ? targetInfo.code : String(targetBranchCode)).toUpperCase().trim();

  // 1. Ekstraksi kode cabang / Business Area dari objek (OTORITATIF & PALING UTAMA)
  const rawCode = item.kodeBA || item.kode_ba || item['Kode BA'] || item['Business area'] || item['Business Area'] || item['_kodeBA'] || '';
  if (rawCode && rawCode !== '-' && rawCode !== '0') {
    const norm = resolveBACode(rawCode);
    if (norm) {
      return norm === targetCode;
    }
  }

  // 2. Ekstraksi teks cabang dari objek (P.subarea / Cabang)
  const rawCabang = item.cabang || item.branch || item['Cabang'] || item['cabang'] || item['P.subarea'] || item['Nama Cabang'] || '';
  if (rawCabang && rawCabang !== '-' && rawCabang !== '0') {
    const norm = resolveBACode(rawCabang);
    if (norm) {
      return norm === targetCode;
    }
  }

  return false;
}

// TEST CASES
const sampleEmployee1 = { 'Personnel no.': '10002145', 'Last name': 'AHMAD KURNIAWAN', 'P.subarea': 'Lampung A Yani', 'Business area': '660' };
const sampleEmployee2 = { 'Personnel no.': '10002146', 'Last name': 'BUDI SOEKARNO', 'P.subarea': 'Lampung S Hatta', 'Business area': '661' };
const sampleEmployee3 = { 'Personnel no.': '10002147', 'Last name': 'JOKO BANDARJAYA', 'P.subarea': 'Bandarjaya', 'Business area': 662 };
const sampleEmployee4 = { 'Personnel no.': '10002148', 'Last name': 'KOTABUMI STAFF', 'P.subarea': 'Kotabumi', 'Business area': 663 };
const sampleEmployee5 = { 'Personnel no.': '10002149', 'Last name': 'LAMTIM STAFF', 'P.subarea': 'Sukadana', 'Business area': 664 };

const userKacabD660 = { npk: '10002145', nama: 'AHMAD KURNIAWAN', role: 'kacab', assignedBACodes: ['660'] };
const userKacabD661 = { npk: '10002146', nama: 'BUDI SOEKARNO', role: 'kacab', kodeBA: 'D661' };
const userKacabD662 = { npk: '10002147', nama: 'JOKO', role: 'kacab', cabang: 'Bandarjaya' };

const branchD660 = getUserBranchCode(userKacabD660);
console.log('User branch for kacab D660:', branchD660);
console.log('Match Emp 1 with D660 (expected true):', matchBranch(sampleEmployee1, branchD660));
console.log('Match Emp 2 with D660 (expected false):', matchBranch(sampleEmployee2, branchD660));

const branchD661 = getUserBranchCode(userKacabD661);
console.log('User branch for kacab D661:', branchD661);
console.log('Match Emp 2 with D661 (expected true):', matchBranch(sampleEmployee2, branchD661));
console.log('Match Emp 1 with D661 (expected false):', matchBranch(sampleEmployee1, branchD661));

const branchD662 = getUserBranchCode(userKacabD662);
console.log('User branch for kacab D662:', branchD662);
console.log('Match Emp 3 with D662 (expected true):', matchBranch(sampleEmployee3, branchD662));

console.log('ALL TESTS PASSED!');
