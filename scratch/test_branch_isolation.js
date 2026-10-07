const fs = require('fs');
const path = require('path');

// Simulate the logic in api.js and dashboard.js
const KNOWN_BRANCHES = [
  { 
    code: "D660", 
    numericCode: "660",
    name: "Lampung A Yani", 
    fullName: "Lampung A Yani (D660)", 
    aliases: ["d660", "660", "0660", "2660", "d-660", "d.660", "a yani", "ayani", "a. yani", "ahmad yani", "ahmadyani", "lampung a yani", "lampung ayani", "lampung a. yani", "tanjung karang", "tjk", "bandar lampung", "kedaton"] 
  },
  { 
    code: "D661", 
    numericCode: "661",
    name: "Lampung S Hatta", 
    fullName: "Lampung S Hatta (D661)", 
    aliases: ["d661", "661", "0661", "2661", "d-661", "d.661", "s hatta", "shatta", "s. hatta", "soekarno hatta", "soekarnohatta", "lampung s hatta", "lampung soekarno hatta", "by pass", "bypass"] 
  },
  { 
    code: "D662", 
    numericCode: "662",
    name: "Bandarjaya", 
    fullName: "Bandarjaya (D662)", 
    aliases: ["d662", "662", "0662", "2662", "d-662", "d.662", "bandarjaya", "bandar jaya", "bdj", "lampung tengah", "lamteng"] 
  },
  { 
    code: "D663", 
    numericCode: "663",
    name: "Lampung Utara", 
    fullName: "Lampung Utara (D663)", 
    aliases: ["d663", "663", "0663", "2663", "d-663", "d.663", "lampung utara", "lamut", "lam ut", "kotabumi", "kota bumi", "ktb"] 
  },
  { 
    code: "D664", 
    numericCode: "664",
    name: "Lampung Timur", 
    fullName: "Lampung Timur (D664)", 
    aliases: ["d664", "664", "0664", "2664", "d-664", "d.664", "lampung timur", "lamtim", "lam tim", "sukadana"] 
  }
];

const ALLOWED_BRANCH_CODES = ["D660", "D661", "D662", "D663", "D664", "660", "661", "662", "663", "664"];

function resolveBranchInfo(input) {
  if (!input && input !== 0) return null;
  const str = String(input).trim();
  if (!str || str === '-' || str === 'null' || str === 'undefined') return null;

  const upper = str.toUpperCase();
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, "");

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
  if (clean.includes('ayani') || clean.includes('ahmadyani') || clean.includes('tanjungkarang') || clean.includes('lampung')) {
    return KNOWN_BRANCHES.find(b => b.code === 'D660');
  }

  // 4. Cek seluruh daftar aliases
  for (const b of KNOWN_BRANCHES) {
    if (b.aliases) {
      for (const al of b.aliases) {
        const alClean = al.toLowerCase().replace(/[^a-z0-9]/g, "");
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

function safeString(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function isLampungBranch(item, fallbackMasterList = null, lampungNpkSet = null) {
  if (!item) return false;

  // Khusus Knowledge Management
  if (item['JUDUL'] !== undefined || item['judul'] !== undefined || item['Judul'] !== undefined) {
    return true;
  }

  // 1. Cek langsung kode BA
  let rawCode = item.kodeBA || item.kode_ba || item['Kode BA'] || item['Business area'] || item['Business Area'] || item['business area'] || item['business_area'] || item['_kodeBA'] || '';
  if (rawCode && rawCode !== '-' && rawCode !== '0') {
    const norm = resolveBACode(rawCode);
    if (norm && ALLOWED_BRANCH_CODES.includes(norm)) return true;
  }

  // 2. Cek teks nama cabang (P.subarea / Cabang)
  let rawCabang = item.cabang || item.branch || item['Cabang'] || item['cabang'] || item['P.subarea'] || item['p.subarea'] || item['Nama Cabang'] || item['Cabang/Departemen'] || '';
  if (rawCabang && rawCabang !== '-' && rawCabang !== '0') {
    const norm = resolveBACode(rawCabang);
    if (norm && ALLOWED_BRANCH_CODES.includes(norm)) return true;
  }

  // Jika kode BA atau Cabang secara eksplisit terisi namun bukan cabang Lampung, tolak segera
  const hasExplicitNonLampungBranch = (rawCode && rawCode !== '-' && rawCode !== '0' && !resolveBACode(rawCode)) ||
                                      (rawCabang && rawCabang !== '-' && rawCabang !== '0' && !resolveBACode(rawCabang));
  if (hasExplicitNonLampungBranch) {
    return false;
  }

  // 3. Cek Wilayah (hanya jika menyebut Lampung secara spesifik)
  const rawWilayah = item.wilayah || item['Wilayah'] || item['wilayah'] || '';
  if (rawWilayah && String(rawWilayah).toLowerCase().includes('lampung')) {
    return true;
  }

  // 4. Relasi NPK ke Master Karyawan
  const npk = safeString(item['NPK'] || item['Personnel no.'] || item['Personnel No.'] || item.npk);
  if (npk) {
    const cleanNpk = npk.replace(/^0+/, '');
    if (lampungNpkSet && (lampungNpkSet.has(npk) || lampungNpkSet.has(cleanNpk))) {
      return true;
    }

    const masterList = (fallbackMasterList && fallbackMasterList.length > 0) ? fallbackMasterList : [];
    if (masterList.length > 0) {
      const emp = masterList.find(e => {
        if (e === item) return false;
        const eNpk = safeString(e.npk || e['Personnel no.'] || e['Personnel No.']);
        return eNpk === npk || eNpk.replace(/^0+/, '') === cleanNpk;
      });
      if (emp) {
        const empCode = emp.kodeBA || emp['Business area'] || emp['Business Area'] || emp['Kode BA'] || '';
        if (empCode && ALLOWED_BRANCH_CODES.includes(resolveBACode(empCode))) return true;
        const empCabang = emp.cabang || emp['P.subarea'] || emp['Cabang'] || '';
        if (empCabang && ALLOWED_BRANCH_CODES.includes(resolveBACode(empCabang))) return true;
        const empWil = emp.wilayah || emp['Wilayah'] || '';
        if (empWil && String(empWil).toLowerCase().includes('lampung')) return true;
      }
    }
  }

  return false;
}

// Test cases
const testEmployees = [
  // Official DSO Lampung branches
  { npk: '1001', nama: 'Andi Yani', 'Business area': '660', 'P.subarea': 'Lampung A Yani', expected: true },
  { npk: '1002', nama: 'Budi Soetta', 'Business area': 'D661', 'P.subarea': 'Lampung S Hatta', expected: true },
  { npk: '1003', nama: 'Citra BDJ', 'Business area': '662', 'P.subarea': 'Bandarjaya', expected: true },
  { npk: '1004', nama: 'Dedi Lamut', 'Business area': '663', 'P.subarea': 'Kotabumi', expected: true },
  { npk: '1005', nama: 'Eka Lamtim', 'Business area': '664', 'P.subarea': 'Sukadana', expected: true },
  
  // Non-Lampung branches (outside)
  { npk: '2001', nama: 'Farhan Jakarta', 'Business area': 'D101', 'P.subarea': 'Jakarta Sunter', expected: false },
  { npk: '2002', nama: 'Gita Palembang', 'Business area': '650', 'P.subarea': 'Palembang', Wilayah: 'DSO Sumbagsel', expected: false },
  { npk: '2003', nama: 'Hadi Medan', 'Business area': 'D610', 'P.subarea': 'Medan Krakatau', Wilayah: 'DSO', expected: false },
  { npk: '2004', nama: 'Indra Bandung', 'Business area': '201', 'P.subarea': 'Bandung Asia Afrika', expected: false },
  { npk: '2005', nama: 'Joko Surabaya', 'Business area': '301', 'P.subarea': 'Surabaya Panglima Sudirman', Wilayah: 'DSO Jawa Timur', expected: false },
  { npk: '2006', nama: 'Kiki Tanpa BA', 'Business area': '', 'P.subarea': 'Semarang', Wilayah: 'DSO', expected: false }
];

let allPassed = true;
testEmployees.forEach(e => {
  const result = isLampungBranch(e, testEmployees);
  const pass = result === e.expected;
  if (!pass) allPassed = false;
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${e.nama} (BA: ${e['Business area']}, Cabang: ${e['P.subarea']}) => ${result} (Expected: ${e.expected})`);
});

if (allPassed) {
  console.log('\nAll branch isolation tests PASSED successfully!');
} else {
  console.log('\nSome tests FAILED!');
  process.exit(1);
}

