const fs = require('fs');

let content = fs.readFileSync('src/js/api.js', 'utf8');

const target = `    async function syncSheetToBackend(targetSheet) {
      const schema = SCHEMAS[targetSheet];
      if (!schema) return { success: false, message: 'Skema tabel tidak ditemukan.' };
      const rawRows = (currentDashboardPayload?.rawTables && currentDashboardPayload.rawTables[targetSheet]) || [];
      const canonicalColumns = schema.columns;
      const formattedDataRows = rawRows.map(obj => canonicalColumns.map(col => (obj[col] !== undefined && obj[col] !== null) ? obj[col] : ''));

      return await callBackendAPI("IMPORT_EXCEL", {
        targetSheet: schema.sheetName,
        headers: canonicalColumns,
        dataRows: formattedDataRows
      });
    }`;

const replacement = `    async function syncSheetToBackend(targetSheet) {
      const schema = SCHEMAS[targetSheet];
      if (!schema) return { success: false, message: 'Skema tabel tidak ditemukan.' };
      let rawRows = (currentDashboardPayload?.rawTables && (currentDashboardPayload.rawTables[targetSheet] || currentDashboardPayload.rawTables[schema.sheetName])) || [];
      if (!rawRows.length && (targetSheet === 'Knowledge_management' || targetSheet === 'Data_KM')) {
        const altKey = targetSheet === 'Knowledge_management' ? 'Data_KM' : 'Knowledge_management';
        rawRows = currentDashboardPayload?.rawTables?.[altKey] || window.masterFullPayload?.rawTables?.[altKey] || window.masterFullPayload?.rawTables?.[targetSheet] || [];
      }
      const canonicalColumns = schema.columns;
      const formattedDataRows = rawRows.map(obj => canonicalColumns.map(col => {
        if (obj[col] !== undefined && obj[col] !== null) return obj[col];
        const lower = col.toLowerCase();
        if (obj[lower] !== undefined && obj[lower] !== null) return obj[lower];
        const upper = col.toUpperCase();
        if (obj[upper] !== undefined && obj[upper] !== null) return obj[upper];
        if (typeof capitalizeFirst === 'function' && obj[capitalizeFirst(col)] !== undefined) return obj[capitalizeFirst(col)];
        return '';
      }));

      return await callBackendAPI("IMPORT_EXCEL", {
        targetSheet: schema.sheetName,
        headers: canonicalColumns,
        dataRows: formattedDataRows
      });
    }`;

const isCRLF = content.includes('\r\n');
const targetNorm = isCRLF ? target.replace(/\n/g, '\r\n') : target;
const replNorm = isCRLF ? replacement.replace(/\n/g, '\r\n') : replacement;

if (content.includes(targetNorm)) {
  content = content.replace(targetNorm, replNorm);
  fs.writeFileSync('src/js/api.js', content, 'utf8');
  console.log('Successfully updated syncSheetToBackend in api.js');
} else {
  console.error('Target not found in api.js');
  process.exit(1);
}
