const fs = require('fs');
const path = require('path');

// 1. Update src/js/api.js
let apiPath = path.join(__dirname, '../src/js/api.js');
let apiContent = fs.readFileSync(apiPath, 'utf8');

// Update parseExcelTime so it doesn't truncate string times
apiContent = apiContent.replace(
  /function parseExcelTime\(val\) \{[\s\S]*?return s;\r?\n    \}/,
  `function parseExcelTime(val) {
      if (!val) return "";
      if (typeof val === 'number') {
        const totalSeconds = Math.round(val * 24 * 3600);
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        if (seconds > 0) {
          return \`\${String(hours).padStart(2, '0')}:\${String(minutes).padStart(2, '0')}:\${String(seconds).padStart(2, '0')}\`;
        }
        return \`\${String(hours).padStart(2, '0')}:\${String(minutes).padStart(2, '0')}\`;
      }
      return String(val).trim();
    }`
);

// Update formatColumnCell so norm === 'time' || norm === 'jam' displays full time/timestamp
apiContent = apiContent.replace(
  /if \(norm\.includes\('time clock in'\) \|\| norm\.includes\('time clock out'\) \|\| norm === 'time' \|\| norm === 'jam' \|\| norm === 'time in' \|\| norm === 'time out'\) \{[\s\S]*?return `<span class="font-mono font-bold text-slate-800">\$\{timeStr\}<\/span>`;\r?\n      \}/,
  `if (norm === 'time' || norm === 'jam') {
        return \`<span class="font-mono font-bold text-slate-800">\${val}</span>\`;
      }
      if (norm.includes('time clock in') || norm.includes('time clock out') || norm === 'time in' || norm === 'time out') {
        const timeStr = formatDatabaseTime(val);
        return \`<span class="font-mono font-bold text-slate-800">\${timeStr}</span>\`;
      }`
);

fs.writeFileSync(apiPath, apiContent, 'utf8');
console.log('src/js/api.js updated successfully.');

// 2. Update src/js/modals.js
let modalsPath = path.join(__dirname, '../src/js/modals.js');
let modalsContent = fs.readFileSync(modalsPath, 'utf8');

// A. Update getSampleValueForColumn to provide sample values for judul & tanggal
if (!modalsContent.includes("norm === 'judul'")) {
  modalsContent = modalsContent.replace(
    /if \(norm === 'tema'\) return 'Digitalisasi Form Checklist Inspeksi Harian';/,
    `if (norm === 'tema' || norm === 'judul') return 'Standar Operasional Prosedur Service Kendaraan';
      if (norm === 'tanggal') return '30/09/2026';`
  );
}

// B. Update renderUploadSchemaGuide for KM (4 required columns)
modalsContent = modalsContent.replace(
  /function renderUploadSchemaGuide\(\) \{[\s\S]*?if \(colsEl\) \{[\s\S]*?colsEl\.textContent = `\$\{schema\.columns\.length\} Kolom Baku \(Sesuai Urutan\): \$\{schema\.columns\.join\(', '\)\}`;[\s\S]*?\}[\s\S]*?\}/,
  `function renderUploadSchemaGuide() {
      const targetSheet = document.getElementById('upload-target-sheet')?.value || 'Master_Karyawan';
      const schema = SCHEMAS[targetSheet];
      if (!schema) return;

      const titleEl = document.getElementById('upload-guide-title');
      const colsEl = document.getElementById('upload-guide-cols');
      if (titleEl) titleEl.textContent = \`Skema Wajib: \${schema.sheetName}\`;
      if (colsEl) {
        if (targetSheet === 'Knowledge_management' || targetSheet === 'Data_KM') {
          colsEl.innerHTML = \`4 Kolom Wajib Berkas: <b class="text-slate-800">NPK, NAMA, JUDUL, TANGGAL</b><span class="text-emerald-600 block text-[11px] font-semibold mt-1"><i class="fa-solid fa-clock mr-1"></i>Kolom <b>TIME</b> otomatis diisi waktu saat berkas diunggah.</span>\`;
        } else {
          colsEl.textContent = \`\${schema.columns.length} Kolom Baku (Sesuai Urutan): \${schema.columns.join(', ')}\`;
        }
      }
    }`
);

// C. Update downloadExcelTemplate for KM (4 columns in template: NPK, NAMA, JUDUL, TANGGAL)
modalsContent = modalsContent.replace(
  /function downloadExcelTemplate\(targetSheet\) \{[\s\S]*?const schema = SCHEMAS\[targetSheet\];[\s\S]*?if \(!schema\) return;[\s\S]*?const sampleRow = \{\};[\s\S]*?schema\.columns\.forEach\(col => \{[\s\S]*?sampleRow\[col\] = getSampleValueForColumn\(targetSheet, col\);[\s\S]*?\}\);[\s\S]*?const ws = XLSX\.utils\.json_to_sheet\(\[sampleRow\], \{ header: schema\.columns \}\);/,
  `function downloadExcelTemplate(targetSheet) {
      const schema = SCHEMAS[targetSheet];
      if (!schema) return;

      let cols = schema.columns;
      if (targetSheet === 'Knowledge_management' || targetSheet === 'Data_KM') {
        // Kolom template KM hanya 4 kolom: NPK, NAMA, JUDUL, TANGGAL (TIME otomatis diisi saat upload)
        cols = ["NPK", "NAMA", "JUDUL", "TANGGAL"];
      }

      const sampleRow = {};
      cols.forEach(col => {
        sampleRow[col] = getSampleValueForColumn(targetSheet, col);
      });

      const ws = XLSX.utils.json_to_sheet([sampleRow], { header: cols });`
);

// D. Update prosesUploadExcelFrontend parsing to auto-fill TIME and TANGGAL for KM
modalsContent = modalsContent.replace(
  /\/\/ 2\. Parsing baris data dengan Safe Typecasting[\s\S]*?const parsedObjects = \[\];[\s\S]*?for \(let i = 1; i < rawRows\.length; i\+\+\) \{[\s\S]*?const rowData = rawRows\[i\];[\s\S]*?if \(!rowData \|\| rowData\.every\(cell => cell === "" \|\| cell === null \|\| cell === undefined\)\) continue;[\s\S]*?const rowObj = \{\};[\s\S]*?canonicalColumns\.forEach\(col => \{[\s\S]*?const colIdx = colIndexMapping\[col\];[\s\S]*?const cellVal = \(colIdx !== -1 && colIdx !== undefined\) \? rowData\[colIdx\] : "";[\s\S]*?rowObj\[col\] = castSchemaValue\(col, cellVal, i\);[\s\S]*?\}\);[\s\S]*?parsedObjects\.push\(rowObj\);[\s\S]*?\}/,
  `// 2. Parsing baris data dengan Safe Typecasting
          const now = new Date();
          const dStr = String(now.getDate()).padStart(2, '0');
          const mStr = String(now.getMonth() + 1).padStart(2, '0');
          const yStr = now.getFullYear();
          const hourStr = String(now.getHours()).padStart(2, '0');
          const minStr = String(now.getMinutes()).padStart(2, '0');
          const secStr = String(now.getSeconds()).padStart(2, '0');
          
          const defaultUploadTime = \`\${hourStr}:\${minStr}:\${secStr}\`;
          const defaultUploadDate = \`\${dStr}/\${mStr}/\${yStr}\`;

          const parsedObjects = [];
          for (let i = 1; i < rawRows.length; i++) {
            const rowData = rawRows[i];
            if (!rowData || rowData.every(cell => cell === "" || cell === null || cell === undefined)) continue;

            const rowObj = {};
            canonicalColumns.forEach(col => {
              const colIdx = colIndexMapping[col];
              let cellVal = (colIdx !== -1 && colIdx !== undefined) ? rowData[colIdx] : "";

              // Khusus Knowledge Management: jika kolom TIME tidak ada di file Excel atau kosong, otomatis isi dengan waktu saat berkas diunggah
              if ((targetSheet === 'Knowledge_management' || targetSheet === 'Data_KM') && col === 'TIME') {
                if (!cellVal || String(cellVal).trim() === '') {
                  cellVal = defaultUploadTime;
                }
              }
              // Khusus KM: jika kolom TANGGAL kosong, default ke tanggal hari upload
              if ((targetSheet === 'Knowledge_management' || targetSheet === 'Data_KM') && col === 'TANGGAL') {
                if (!cellVal || String(cellVal).trim() === '') {
                  cellVal = defaultUploadDate;
                }
              }

              rowObj[col] = castSchemaValue(col, cellVal, i);
            });
            parsedObjects.push(rowObj);
          }`
);

fs.writeFileSync(modalsPath, modalsContent, 'utf8');
console.log('src/js/modals.js updated successfully.');

// 3. Update src/js/employee.js
let empPath = path.join(__dirname, '../src/js/employee.js');
let empContent = fs.readFileSync(empPath, 'utf8');

// Ensure KM table always shows all 5 columns: NPK, NAMA, JUDUL, TANGGAL, TIME
empContent = empContent.replace(
  /const isFull = columnViewMode\.km === 'FULL';\r?\n      \/\/ Sesuai spreadsheet: NPK, NAMA, JUDUL, TANGGAL, TIME\r?\n      const cols = isFull \r?\n        \? \["NPK", "NAMA", "JUDUL", "TANGGAL", "TIME"\] \r?\n        : \["NPK", "NAMA", "JUDUL", "TANGGAL"\];/,
  `// Sesuai spreadsheet: NPK, NAMA, JUDUL, TANGGAL, TIME
      const cols = ["NPK", "NAMA", "JUDUL", "TANGGAL", "TIME"];`
);

fs.writeFileSync(empPath, empContent, 'utf8');
console.log('src/js/employee.js updated successfully.');
