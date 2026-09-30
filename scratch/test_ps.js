const fs = require('fs');
const cp = require('child_process');

const testDir = 'scratch/test_km_files';
if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
if (!fs.existsSync(testDir + '/Sub1')) fs.mkdirSync(testDir + '/Sub1', { recursive: true });
if (!fs.existsSync(testDir + '/Sub2/Deep')) fs.mkdirSync(testDir + '/Sub2/Deep', { recursive: true });

fs.writeFileSync(testDir + '/1800 Rulia Service.pdf', 'dummy');
fs.writeFileSync(testDir + '/Sub1/Tips Handling Komplain.pptx', 'dummy');
fs.writeFileSync(testDir + '/Sub2/Deep/2023 Kamil Hasan Kaizen.pdf', 'dummy');

const psScript = `
$files = Get-ChildItem -Path '${testDir}' -Recurse -File | Where-Object { $_.Extension -match '(?i)\\.(pdf|ppt|pptx)$' }
Write-Host ("Files found: " + $files.Count)
foreach ($f in $files) { Write-Host ("- " + $f.FullName) }
`;

const res = cp.spawnSync('powershell', ['-NoProfile', '-Command', psScript], { encoding: 'utf8' });
console.log(res.stdout);
console.log(res.stderr);
