const fs = require('fs');
const cp = require('child_process');

const testDir = 'scratch/test_km_800';
if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
for (let i = 1; i <= 5; i++) {
  const sub = `${testDir}/Bulan_${i}`;
  if (!fs.existsSync(sub)) fs.mkdirSync(sub, { recursive: true });
  fs.writeFileSync(`${sub}/180${i} Materi_${i}.pdf`, 'dummy content');
  fs.writeFileSync(`${sub}/Presentasi Tanpa NPK ${i}.pptx`, 'dummy content');
}

const psScript = `
Add-Type -AssemblyName System.IO.Compression.FileSystem;
$files = Get-ChildItem -Path '${testDir}' -Recurse -File | Where-Object { $_.Extension -match '(?i)\\.(pdf|ppt|pptx|pps|ppsx)$' -and $_.Name -notmatch '^~\\$' };
Write-Host ("Total files found: " + $files.Count);
$res = @();
foreach ($f in $files) {
    $npk = '';
    if ($f.BaseName -match '(\\d{4,6})') {
        $npk = $matches[1];
    }
    $judul = $f.BaseName;
    if ($npk) {
        $judul = ($judul -replace $npk, '').Replace('_', ' ').Trim();
    }
    $res += [PSCustomObject]@{
        NPK = $npk;
        NAMA = '';
        JUDUL = $judul;
        TANGGAL = $f.LastWriteTime.ToString('yyyy-MM-dd');
        TIME = $f.LastWriteTime.ToString('HH:mm:ss')
    };
}
Write-Host ("Total records exported: " + $res.Count);
`;

const res = cp.spawnSync('powershell', ['-NoProfile', '-Command', psScript], { encoding: 'utf8' });
console.log(res.stdout);
console.log(res.stderr);
