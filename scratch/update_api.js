const fs = require('fs');
const path = require('path');

// 1. Update src/js/api.js
let apiPath = path.join(__dirname, '../src/js/api.js');
let apiContent = fs.readFileSync(apiPath, 'utf8');

// 1.a Add status_karyawan to fallbackMap
if (!apiContent.includes("'status_karyawan': ['statusKaryawan'")) {
  apiContent = apiContent.replace(
    "'business area': ['kodeBA', 'kode_ba', 'ba', 'businessArea', 'business_area', 'kodeCabang', 'kode_cabang']\r\n      };",
    "'business area': ['kodeBA', 'kode_ba', 'ba', 'businessArea', 'business_area', 'kodeCabang', 'kode_cabang'],\r\n        'status_karyawan': ['statusKaryawan', 'status_karyawan', 'status', 'statusKeaktifan', 'status_keaktifan']\r\n      };"
  );
  if (!apiContent.includes("'status_karyawan': ['statusKaryawan'")) {
    apiContent = apiContent.replace(
      "'business area': ['kodeBA', 'kode_ba', 'ba', 'businessArea', 'business_area', 'kodeCabang', 'kode_cabang']\n      };",
      "'business area': ['kodeBA', 'kode_ba', 'ba', 'businessArea', 'business_area', 'kodeCabang', 'kode_cabang'],\n        'status_karyawan': ['statusKaryawan', 'status_karyawan', 'status', 'statusKeaktifan', 'status_keaktifan']\n      };"
    );
  }
}

// 1.b Add status_karyawan to getRowCellValue
if (!apiContent.includes("if (normTarget === 'status_karyawan' || normTarget === 'status karyawan')")) {
  const targetStr = "if (normTarget === 'lvl') {\r\n        return findLvl(row);\r\n      }";
  const repStr = "if (normTarget === 'lvl') {\r\n        return findLvl(row);\r\n      }\r\n      if (normTarget === 'status_karyawan' || normTarget === 'status karyawan') {\r\n        return 'Aktif';\r\n      }";
  if (apiContent.includes(targetStr)) {
    apiContent = apiContent.replace(targetStr, repStr);
  } else {
    const targetStrLF = "if (normTarget === 'lvl') {\n        return findLvl(row);\n      }";
    const repStrLF = "if (normTarget === 'lvl') {\n        return findLvl(row);\n      }\n      if (normTarget === 'status_karyawan' || normTarget === 'status karyawan') {\n        return 'Aktif';\n      }";
    apiContent = apiContent.replace(targetStrLF, repStrLF);
  }
}

// 1.c Update formatColumnCell in api.js
// Move status_karyawan check before `if (val === null...)`
const oldFormatHeader = `    function formatColumnCell(col, val) {
      if (val === null || val === undefined || val === '') return '<span class="text-slate-300">-</span>';
      const norm = normalizeHeaderName(col);`;

const newFormatHeader = `    function formatColumnCell(col, val) {
      const norm = normalizeHeaderName(col);
      
      if (norm === 'status_karyawan' || norm === 'status karyawan') {
        const isResign = val && String(val).trim().toLowerCase() === 'resign';
        return isResign
          ? \`<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><i class="fa-solid fa-user-xmark mr-1 text-[9px]"></i>Resign</span>\`
          : \`<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-user-check mr-1 text-[9px]"></i>Aktif</span>\`;
      }

      if (val === null || val === undefined || val === '') return '<span class="text-slate-300">-</span>';`;

const oldFormatHeaderCRLF = oldFormatHeader.replace(/\n/g, '\r\n');
const newFormatHeaderCRLF = newFormatHeader.replace(/\n/g, '\r\n');

if (apiContent.includes(oldFormatHeaderCRLF)) {
  apiContent = apiContent.replace(oldFormatHeaderCRLF, newFormatHeaderCRLF);
} else if (apiContent.includes(oldFormatHeader)) {
  apiContent = apiContent.replace(oldFormatHeader, newFormatHeader);
}

// Remove the old lower status_karyawan block in formatColumnCell if present
const oldLowerBlock = `      if (norm === 'status_karyawan' || norm === 'status karyawan') {
        const isResign = String(val).trim().toLowerCase() === 'resign';
        return isResign
          ? \`<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><i class="fa-solid fa-user-xmark mr-1 text-[9px]"></i>Resign</span>\`
          : \`<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-user-check mr-1 text-[9px]"></i>Aktif</span>\`;
      }`;

const oldLowerBlockCRLF = oldLowerBlock.replace(/\n/g, '\r\n');
// We replace the SECOND occurrence (which is lower down)
const firstIdx = apiContent.indexOf("norm === 'status_karyawan'");
const secondIdx = apiContent.indexOf("norm === 'status_karyawan'", firstIdx + 1);
if (secondIdx !== -1) {
  // Check if second occurrence matches oldLowerBlock
  if (apiContent.substr(secondIdx - 6, oldLowerBlockCRLF.length).includes("if (norm === 'status_karyawan'")) {
    apiContent = apiContent.slice(0, secondIdx - 6) + apiContent.slice(secondIdx - 6 + oldLowerBlockCRLF.length + 2);
  } else if (apiContent.substr(secondIdx - 6, oldLowerBlock.length).includes("if (norm === 'status_karyawan'")) {
    apiContent = apiContent.slice(0, secondIdx - 6) + apiContent.slice(secondIdx - 6 + oldLowerBlock.length + 1);
  }
}

fs.writeFileSync(apiPath, apiContent, 'utf8');
console.log('src/js/api.js updated successfully');

