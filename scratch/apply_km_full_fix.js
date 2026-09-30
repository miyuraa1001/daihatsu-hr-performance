const fs = require('fs');
const path = require('path');

// 1. Update src/js/modals.js
const modalsPath = path.join(__dirname, '../src/js/modals.js');
let modalsJs = fs.readFileSync(modalsPath, 'utf8');

// Upgrade downloadKMScript with -Recurse, full scan, progress logging, and 100% file retention
const upgradedBat = `@echo off
chcp 65001 >nul
echo ========================================================
echo  D-PERFORM - GENERATOR REKAP KNOWLEDGE MANAGEMENT DSO
echo ========================================================
echo Sedang memindai seluruh file presentasi (termasuk subfolder)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; \\$files = Get-ChildItem -Path . -Recurse -File | Where-Object { \\$_.Extension -match '(?i)\\\\.(pdf|ppt|pptx|pps|ppsx)$' -and \\$_.Name -notmatch '^~\\\\$' -and \\$_.Name -ne 'Rekap_KM_Siap_Upload.csv' }; Write-Host ('Ditemukan total ' + \\$files.Count + ' file presentasi. Memulai ekstraksi...') -ForegroundColor Cyan; \\$res = @(); \\$i = 0; foreach (\\$f in \\$files) { \\$i++; if (\\$i % 25 -eq 0 -or \\$i -eq \\$files.Count) { Write-Host ('Memproses file [' + \\$i + '/' + \\$files.Count + ']...') -ForegroundColor Yellow; } \\$npk = ''; if (\\$f.BaseName -match '(\\\\d{4,6})') { \\$npk = \\$matches[1]; } if (-not \\$npk -and (\\$f.Extension -match '(?i)^\\\\.(pptx|ppsx)$')) { try { \\$zip = [System.IO.Compression.ZipFile]::OpenRead(\\$f.FullName); \\$entry = \\$zip.GetEntry('ppt/slides/slide1.xml'); if (\\$entry) { \\$sr = New-Object System.IO.StreamReader(\\$entry.Open()); \\$xml = \\$sr.ReadToEnd(); \\$sr.Close(); if (\\$xml -match '(?i)npk[\\\\s.:-]*(\\\\d{4,6})') { \\$npk = \\$matches[1]; } elseif (\\$xml -match '(?i)(?:nik|pegawai|karyawan)[\\\\s.:-]*(\\\\d{4,6})') { \\$npk = \\$matches[1]; } } \\$zip.Dispose(); } catch {} } if (-not \\$npk -and \\$f.Extension -match '(?i)^\\\\.pdf$') { try { \\$raw = [System.IO.File]::ReadAllText(\\$f.FullName); if (\\$raw -match '(?i)npk[\\\\s.:-]*(\\\\d{4,6})') { \\$npk = \\$matches[1]; } elseif (\\$raw -match '(?i)(?:nik|pegawai|karyawan)[\\\\s.:-]*(\\\\d{4,6})') { \\$npk = \\$matches[1]; } } catch {} } \\$judul = \\$f.BaseName; if (\\$npk) { \\$judul = (\\$judul -replace \\$npk, '').Replace('_', ' ').Trim(); \\$judul = (\\$judul -replace '^[\\\\s-_:]+', '').Trim(); } if (-not \\$judul) { \\$judul = \\$f.BaseName; } \\$res += [PSCustomObject]@{ NPK = \\$npk; NAMA = ''; JUDUL = \\$judul; TANGGAL = \\$f.LastWriteTime.ToString('yyyy-MM-dd'); TIME = \\$f.LastWriteTime.ToString('HH:mm:ss') }; }; if (\\$res.Count -gt 0) { \\$res | Export-Csv -Path 'Rekap_KM_Siap_Upload.csv' -NoTypeInformation -Encoding UTF8; Write-Host ('========================================================') -ForegroundColor Green; Write-Host ('BERHASIL! Sebanyak ' + \\$res.Count + ' file tersimpan di Rekap_KM_Siap_Upload.csv') -ForegroundColor Green; Write-Host ('========================================================') -ForegroundColor Green; } else { Write-Host 'Tidak ditemukan file PDF/PPT di folder ini maupun subfoldernya.' -ForegroundColor Red; }"
echo Selesai. Silakan upload Rekap_KM_Siap_Upload.csv ke D-PERFORM.
pause
`;

const upgradedDownloadFn = `function downloadKMScript() {
      const batContent = \`${upgradedBat}\`;

      const blob = new Blob([batContent], { type: 'application/x-bat;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Rekap_KM_Otomatis.bat';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Skrip Rekap_KM_Otomatis.bat (Deep Scan + Subfolder) berhasil diunduh!');
    }`;

modalsJs = modalsJs.replace(
  /function downloadKMScript\(\) \{[\s\S]*?showToast\('Skrip Rekap_KM_Otomatis\.bat.*? berhasil diunduh!'\);\s*\}/,
  () => upgradedDownloadFn
);

// Cache KM upon upload in prosesUploadExcelFrontend
if (!modalsJs.includes("localStorage.setItem('dperform_km_cache'")) {
  modalsJs = modalsJs.replace(
    "currentDashboardPayload.rawTables.Knowledge_management = parsedObjects;",
    `currentDashboardPayload.rawTables.Knowledge_management = parsedObjects;
            try { localStorage.setItem('dperform_km_cache', JSON.stringify(parsedObjects)); } catch(e) {}`
  );
}

fs.writeFileSync(modalsPath, modalsJs, 'utf8');
console.log('Updated src/js/modals.js with recursive Deep Scan script and KM caching.');

// 2. Update src/js/dashboard.js
const dashPath = path.join(__dirname, '../src/js/dashboard.js');
let dashJs = fs.readFileSync(dashPath, 'utf8');

// Update ensureMasterStore to prevent overwriting KM with empty array
const oldEnsureStore = `    function ensureMasterStore(data) {
      if (!data) return;
      // Selalu perbarui master store dengan salinan payload terbaru yang telah disanitasi
      const fullCopy = sanitizeLampungPayload(JSON.parse(JSON.stringify(data)));
      initializeStandardTables(fullCopy);
      window.masterFullPayload = fullCopy;
      window.fullUnscopedPayload = fullCopy;
    }`;

const newEnsureStore = `    function ensureMasterStore(data) {
      if (!data) return;
      // Selalu perbarui master store dengan salinan payload terbaru yang telah disanitasi
      const fullCopy = sanitizeLampungPayload(JSON.parse(JSON.stringify(data)));
      initializeStandardTables(fullCopy);

      // Proteksi KM: jangan biarkan KM ditimpa kosong jika memori lokal / cache memiliki data
      const existingKM = (window.masterFullPayload?.rawTables?.Knowledge_management || window.masterFullPayload?.rawTables?.Data_KM || currentDashboardPayload?.rawTables?.Knowledge_management || []);
      let cachedKM = [];
      try {
        const c = localStorage.getItem('dperform_km_cache');
        if (c) cachedKM = JSON.parse(c);
      } catch(e) {}

      const incomingKM = (fullCopy.rawTables?.Knowledge_management || fullCopy.rawTables?.Data_KM || []);
      if (incomingKM.length === 0) {
        const fallbackKM = existingKM.length > 0 ? existingKM : cachedKM;
        if (fallbackKM.length > 0) {
          fullCopy.rawTables.Knowledge_management = fallbackKM;
          fullCopy.rawTables.Data_KM = fallbackKM;
        }
      } else {
        try { localStorage.setItem('dperform_km_cache', JSON.stringify(incomingKM)); } catch(e) {}
      }

      window.masterFullPayload = fullCopy;
      window.fullUnscopedPayload = fullCopy;
    }`;

dashJs = dashJs.replace(oldEnsureStore, () => newEnsureStore);
fs.writeFileSync(dashPath, dashJs, 'utf8');
console.log('Updated src/js/dashboard.js ensureMasterStore.');

// 3. Update src/js/employee.js
const empPath = path.join(__dirname, '../src/js/employee.js');
let empJs = fs.readFileSync(empPath, 'utf8');

// In renderKMView
empJs = empJs.replace(
  /function renderKMView\(data\) \{[\s\S]*?const source = window\.masterFullPayload\?\.rawTables \|\| data\.rawTables \|\| \{\};[\s\S]*?const rawRows = \(source\.Knowledge_management \|\| source\.Data_KM\) \|\| \[\];/,
  () => `function renderKMView(data) {
      if (!data) return;
      let cachedKM = [];
      try {
        const c = localStorage.getItem('dperform_km_cache');
        if (c) cachedKM = JSON.parse(c);
      } catch(e) {}

      const source = window.masterFullPayload?.rawTables || data.rawTables || {};
      let rawRows = (source.Knowledge_management || source.Data_KM) || [];
      if (!rawRows.length && cachedKM.length > 0) {
        rawRows = cachedKM;
        if (source) {
          source.Knowledge_management = cachedKM;
          source.Data_KM = cachedKM;
        }
      }`
);

// In filterKMTable
empJs = empJs.replace(
  /function filterKMTable\(\) \{[\s\S]*?const source = window\.masterFullPayload\?\.rawTables \|\| currentDashboardPayload\?\.rawTables;[\s\S]*?if \(!source\) return;[\s\S]*?const rawRows = \(source\.Knowledge_management \|\| source\.Data_KM\) \|\| \[\];/,
  () => `function filterKMTable() {
      let cachedKM = [];
      try {
        const c = localStorage.getItem('dperform_km_cache');
        if (c) cachedKM = JSON.parse(c);
      } catch(e) {}

      const source = window.masterFullPayload?.rawTables || currentDashboardPayload?.rawTables || {};
      let rawRows = (source.Knowledge_management || source.Data_KM) || [];
      if (!rawRows.length && cachedKM.length > 0) {
        rawRows = cachedKM;
      }`
);

fs.writeFileSync(empPath, empJs, 'utf8');
console.log('Updated src/js/employee.js renderKMView and filterKMTable.');
