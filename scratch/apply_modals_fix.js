const fs = require('fs');
const path = require('path');

const modalsPath = path.join(__dirname, '../src/js/modals.js');
let modalsJs = fs.readFileSync(modalsPath, 'utf8');

// 1. Add NAMA lookup in prosesUploadExcelFrontend
const namaLookup = `
              // Khusus KM: auto-lookup NAMA dari Master Karyawan jika di berkas kosong
              if ((targetSheet === 'Knowledge_management' || targetSheet === 'Data_KM') && (col === 'NAMA' || col === 'Nama')) {
                if (!cellVal || String(cellVal).trim() === '') {
                  const npkIdx = colIndexMapping['NPK'];
                  const rowNpk = safeString((npkIdx !== -1 && npkIdx !== undefined) ? rowData[npkIdx] : '');
                  if (rowNpk) {
                    const empList = (window.masterFullPayload?.employeeList || currentDashboardPayload?.employeeList || []);
                    const emp = empList.find(e => safeString(e.npk || e['Personnel no.']) === rowNpk);
                    if (emp) {
                      cellVal = emp.nama || emp['Last name'] || '';
                    }
                  }
                }
              }
`;

if (!modalsJs.includes('// Khusus KM: auto-lookup NAMA')) {
  modalsJs = modalsJs.replace(
    "if ((targetSheet === 'Knowledge_management' || targetSheet === 'Data_KM') && col === 'TIME') {",
    () => namaLookup + "              if ((targetSheet === 'Knowledge_management' || targetSheet === 'Data_KM') && col === 'TIME') {"
  );
  console.log('Added NAMA lookup to modals.js');
}

// 2. Upgrade downloadKMScript with Deep Scan
const deepScanBatScript = `@echo off
echo ========================================================
echo  D-PERFORM - GENERATOR REKAP KNOWLEDGE MANAGEMENT DSO
echo ========================================================
echo Sedang memindai file PDF dan PPT di folder ini...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; \\$files = Get-ChildItem -File | Where-Object { \\$_.Extension -match '\\.(pdf|ppt|pptx)$' }; \\$res = @(); foreach (\\$f in \\$files) { \\$npk = ''; if (\\$f.BaseName -match '(\\d{4,6})') { \\$npk = \\$matches[1]; } if (-not \\$npk -and \\$f.Extension -eq '.pptx') { try { \\$zip = [System.IO.Compression.ZipFile]::OpenRead(\\$f.FullName); \\$entry = \\$zip.GetEntry('ppt/slides/slide1.xml'); if (\\$entry) { \\$sr = New-Object System.IO.StreamReader(\\$entry.Open()); \\$xml = \\$sr.ReadToEnd(); \\$sr.Close(); if (\\$xml -match '(?i)npk[\\s.:-]*(\\d{4,6})') { \\$npk = \\$matches[1]; } elseif (\\$xml -match '(?i)(?:nik|pegawai|karyawan)[\\s.:-]*(\\d{4,6})') { \\$npk = \\$matches[1]; } } \\$zip.Dispose(); } catch {} } if (-not \\$npk -and \\$f.Extension -eq '.pdf') { try { \\$raw = [System.IO.File]::ReadAllText(\\$f.FullName); if (\\$raw -match '(?i)npk[\\s.:-]*(\\d{4,6})') { \\$npk = \\$matches[1]; } } catch {} } \\$judul = \\$f.BaseName; if (\\$npk) { \\$judul = (\\$judul -replace \\$npk, '').Replace('_', ' ').Trim(); \\$judul = (\\$judul -replace '^[\\s-_:]+', '').Trim(); } if (-not \\$judul) { \\$judul = 'Materi Sharing KM' }; \\$res += [PSCustomObject]@{ NPK = \\$npk; NAMA = ''; JUDUL = \\$judul; TANGGAL = \\$f.LastWriteTime.ToString('yyyy-MM-dd'); TIME = \\$f.LastWriteTime.ToString('HH:mm:ss') } }; if (\\$res.Count -gt 0) { \\$res | Export-Csv -Path 'Rekap_KM_Siap_Upload.csv' -NoTypeInformation -Encoding UTF8; Write-Host ('BERHASIL! Rekap ' + \\$res.Count + ' file tersimpan di Rekap_KM_Siap_Upload.csv') -ForegroundColor Green; } else { Write-Host 'Tidak ditemukan file PDF/PPT di folder ini.' -ForegroundColor Red; }"
echo ========================================================
echo Selesai. Silakan upload Rekap_KM_Siap_Upload.csv ke D-PERFORM.
pause
`;

const newDownloadFn = `function downloadKMScript() {
      const batContent = \`${deepScanBatScript}\`;

      const blob = new Blob([batContent], { type: 'application/x-bat;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Rekap_KM_Otomatis.bat';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Skrip Rekap_KM_Otomatis.bat (Deep Scan) berhasil diunduh!');
    }`;

modalsJs = modalsJs.replace(
  /function downloadKMScript\(\) \{[\s\S]*?showToast\('Skrip Rekap_KM_Otomatis\.bat berhasil diunduh!'\);\s*\}/,
  () => newDownloadFn
);

fs.writeFileSync(modalsPath, modalsJs, 'utf8');
console.log('Updated downloadKMScript safely in modals.js');
