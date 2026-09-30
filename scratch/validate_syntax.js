const fs = require('fs');
const path = require('path');
const vm = require('vm');

const files = [
  'src/js/api.js',
  'src/js/auth.js',
  'src/js/navigation.js',
  'src/js/dashboard.js',
  'src/js/employee.js',
  'src/js/modals.js',
  'src/js/main.js'
];

let hasError = false;
files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    new vm.Script(code);
    console.log(`[PASS] ${file}`);
  } catch (err) {
    console.error(`[FAIL] ${file}: ${err.message}`);
    hasError = true;
  }
});

if (hasError) process.exit(1);
console.log('All files passed syntax validation!');
