const fs = require('fs');
const path = require('path');

// 1. Update src/js/modals.js
const modalsPath = path.join(__dirname, '../src/js/modals.js');
let modalsJs = fs.readFileSync(modalsPath, 'utf8');

// Replace handleConfirmDeleteRow with realtime multi-tier sync
const newHandleConfirmDeleteRow = `    async function handleConfirmDeleteRow() {
      if (!isUserAdmin(loggedInUser)) {
        showToast("Akses ditolak: Hanya Admin yang dapat menghapus data.");
        return;
      }

      const sheetName = document.getElementById('delete-row-sheet').value;
      const rowIndex = parseInt(document.getElementById('delete-row-index').value, 10);
      const schema = SCHEMAS[sheetName];
      if (!schema || !currentDashboardPayload?.rawTables?.[sheetName]) return;
      const targetRow = currentDashboardPayload.rawTables[sheetName][rowIndex];
      if (!targetRow) return;

      const btnDelete = document.getElementById('btn-confirm-delete-row');
      const originalBtnHtml = btnDelete ? btnDelete.innerHTML : '';
      if (btnDelete) {
        btnDelete.disabled = true;
        btnDelete.innerHTML = \`<i class="fa-solid fa-circle-notch animate-spin"></i><span>Menghapus...</span>\`;
      }

      const npk = safeString(targetRow['Personnel no.'] || targetRow['NPK']);

      // 1. Hapus dari currentDashboardPayload.rawTables
      currentDashboardPayload.rawTables[sheetName].splice(rowIndex, 1);

      // 2. Hapus juga dari window.masterFullPayload dan window.fullUnscopedPayload
      [window.masterFullPayload, window.fullUnscopedPayload].forEach(payload => {
        if (payload?.rawTables?.[sheetName]) {
          const idx = payload.rawTables[sheetName].indexOf(targetRow);
          if (idx !== -1) {
            payload.rawTables[sheetName].splice(idx, 1);
          } else if (payload.rawTables[sheetName][rowIndex]) {
            payload.rawTables[sheetName].splice(rowIndex, 1);
          }
        }
      });

      // 3. Sinkronkan ke modul spesifik & update tampilan secara realtime
      if (sheetName === 'Master_Karyawan') {
        if (npk) {
          if (currentDashboardPayload.employeeList) {
            currentDashboardPayload.employeeList = currentDashboardPayload.employeeList.filter(e => safeString(e.npk || e['Personnel no.']) !== npk);
          }
          if (window.masterFullPayload?.employeeList) {
            window.masterFullPayload.employeeList = window.masterFullPayload.employeeList.filter(e => safeString(e.npk || e['Personnel no.']) !== npk);
          }
        }
        currentDashboardPayload.summary = computeBranchSummary(
          currentDashboardPayload.employeeList,
          currentDashboardPayload.qccList,
          currentDashboardPayload.summary
        );
        renderMasterKaryawanView(currentDashboardPayload);
        if (typeof filterEmployeeTable === 'function') filterEmployeeTable();
      } else if (sheetName === 'Data_Kehadiran') {
        renderAbsensiView(currentDashboardPayload);
        if (typeof filterAttendanceTable === 'function') filterAttendanceTable();
      } else if (sheetName === 'Data_SS') {
        renderSSView(currentDashboardPayload);
        if (typeof filterSSTable === 'function') filterSSTable();
      } else if (sheetName === 'Data_QCC') {
        renderQCCView(currentDashboardPayload);
        if (typeof filterQCCTable === 'function') filterQCCTable();
      } else if (sheetName === 'Data_SP') {
        if (npk) {
          const emp = (currentDashboardPayload.employeeList || []).find(e => safeString(e.npk || e['Personnel no.']) === npk);
          if (emp) {
            emp.spAktif = '';
            emp.spAlasan = '';
          }
        }
        currentDashboardPayload.summary = computeBranchSummary(
          currentDashboardPayload.employeeList,
          currentDashboardPayload.qccList,
          currentDashboardPayload.summary
        );
        renderSPView(currentDashboardPayload);
        if (typeof filterSPTable === 'function') filterSPTable();
      } else if (sheetName === 'Data_KM' || sheetName === 'Knowledge_management') {
        const remainingKM = currentDashboardPayload.rawTables[sheetName];
        currentDashboardPayload.rawTables.Knowledge_management = remainingKM;
        currentDashboardPayload.rawTables.Data_KM = remainingKM;
        if (window.masterFullPayload?.rawTables) {
          window.masterFullPayload.rawTables.Knowledge_management = remainingKM;
          window.masterFullPayload.rawTables.Data_KM = remainingKM;
        }
        try {
          localStorage.setItem('dperform_km_cache', JSON.stringify(remainingKM));
        } catch(e) {}
        renderKMView(currentDashboardPayload);
        if (typeof filterKMTable === 'function') filterKMTable();
      }

      closeModal('modal-delete-row');
      showToast("✅ Baris data berhasil dihapus seketika!");

      try {
        const res = await syncSheetToBackend(sheetName);
        if (res.success) {
          showToast(\`✅ Data \${schema.title} berhasil disinkronkan ke Google Sheets!\`);
        } else {
          showToast(\`⚠️ Data terhapus di aplikasi, status sync: \${res.message || 'Offline'}\`);
        }
      } catch (err) {
        showToast(\`⚠️ Data terhapus di aplikasi, gagal sinkron: \${err.message}\`);
      } finally {
        if (btnDelete) {
          btnDelete.disabled = false;
          btnDelete.innerHTML = originalBtnHtml;
        }
      }
    }`;

modalsJs = modalsJs.replace(
  /async function handleConfirmDeleteRow\(\) \{[\s\S]*?finally \{[\s\S]*?\}\s*\}/,
  () => newHandleConfirmDeleteRow
);

// Replace handleSaveRowEdit with realtime multi-tier sync
const newHandleSaveRowEdit = `    async function handleSaveRowEdit(event) {
      if (event) event.preventDefault();
      if (!isUserAdmin(loggedInUser)) {
        showToast("Akses ditolak: Hanya Admin yang dapat menyimpan perubahan.");
        return;
      }

      const sheetName = document.getElementById('edit-row-sheet').value;
      const rowIndex = parseInt(document.getElementById('edit-row-index').value, 10);
      const schema = SCHEMAS[sheetName];
      if (!schema || !currentDashboardPayload?.rawTables?.[sheetName]) return;
      const targetRow = currentDashboardPayload.rawTables[sheetName][rowIndex];
      if (!targetRow) return;

      const btnSave = document.getElementById('btn-save-edit-row');
      const originalBtnHtml = btnSave ? btnSave.innerHTML : '';
      if (btnSave) {
        btnSave.disabled = true;
        btnSave.innerHTML = \`<i class="fa-solid fa-circle-notch animate-spin"></i><span>Menyimpan...</span>\`;
      }

      const form = document.getElementById('form-edit-row');
      const formData = new FormData(form);

      schema.columns.forEach(col => {
        const val = formData.get(col);
        if (val !== null && val !== undefined) {
          targetRow[col] = castSchemaValue(col, val, rowIndex + 1);
        }
      });

      // Update di masterFullPayload jika ada baris yang sama
      [window.masterFullPayload, window.fullUnscopedPayload].forEach(payload => {
        if (payload?.rawTables?.[sheetName]) {
          const idx = payload.rawTables[sheetName].indexOf(targetRow);
          if (idx !== -1) {
            payload.rawTables[sheetName][idx] = targetRow;
          } else if (payload.rawTables[sheetName][rowIndex]) {
            payload.rawTables[sheetName][rowIndex] = targetRow;
          }
        }
      });

      // Sinkronkan ke modul terkait secara realtime
      if (sheetName === 'Master_Karyawan') {
        const npk = safeString(targetRow['Personnel no.']);
        const emp = (currentDashboardPayload.employeeList || []).find(e => safeString(e.npk || e['Personnel no.']) === npk);
        if (emp) {
          emp.nama = targetRow['Last name'] || emp.nama;
          emp.cabang = targetRow['P.subarea'] || emp.cabang;
          emp.wilayah = targetRow['Wilayah'] || emp.wilayah;
          emp.kodeBA = safeString(targetRow['Business area'] || emp.kodeBA);
          emp.divisi = targetRow['Name'] || emp.divisi;
          emp.jabatan = targetRow['Job Title'] || emp.jabatan;
          emp.tipeKontrak = targetRow['Contract'] || emp.tipeKontrak;
          emp['Contract'] = targetRow['Contract'];
          emp.joinDate = targetRow['Date'] || emp.joinDate;
          emp.tglLahir = targetRow['D.o.birth'] || emp.tglLahir;
          emp.gender = targetRow['Gender text'] || emp.gender;
          emp.agama = targetRow['Religious denomination'] || emp.agama;
          emp.psGroup = targetRow['PS group'] || emp.psGroup;
          emp.lvl = targetRow['Lvl'] || emp.lvl;
          emp.stext = targetRow['P0001-STEXT'] || emp.stext;
        }
        currentDashboardPayload.summary = computeBranchSummary(
          currentDashboardPayload.employeeList,
          currentDashboardPayload.qccList,
          currentDashboardPayload.summary
        );
        renderMasterKaryawanView(currentDashboardPayload);
        if (typeof filterEmployeeTable === 'function') filterEmployeeTable();
      } else if (sheetName === 'Data_Kehadiran') {
        renderAbsensiView(currentDashboardPayload);
        if (typeof filterAttendanceTable === 'function') filterAttendanceTable();
      } else if (sheetName === 'Data_SS') {
        renderSSView(currentDashboardPayload);
        if (typeof filterSSTable === 'function') filterSSTable();
      } else if (sheetName === 'Data_QCC') {
        renderQCCView(currentDashboardPayload);
        if (typeof filterQCCTable === 'function') filterQCCTable();
      } else if (sheetName === 'Data_SP') {
        const npk = safeString(targetRow['NPK']);
        const emp = (currentDashboardPayload.employeeList || []).find(e => safeString(e.npk || e['Personnel no.']) === npk);
        if (emp) {
          emp.spAktif = (targetRow['Tingkat SP'] && targetRow['Tingkat SP'] !== '-') ? targetRow['Tingkat SP'] : '';
          emp.spAlasan = targetRow['Alasan'] || '';
        }
        currentDashboardPayload.summary = computeBranchSummary(
          currentDashboardPayload.employeeList,
          currentDashboardPayload.qccList,
          currentDashboardPayload.summary
        );
        renderSPView(currentDashboardPayload);
        if (typeof filterSPTable === 'function') filterSPTable();
      } else if (sheetName === 'Data_KM' || sheetName === 'Knowledge_management') {
        const updatedKM = currentDashboardPayload.rawTables[sheetName];
        currentDashboardPayload.rawTables.Knowledge_management = updatedKM;
        currentDashboardPayload.rawTables.Data_KM = updatedKM;
        if (window.masterFullPayload?.rawTables) {
          window.masterFullPayload.rawTables.Knowledge_management = updatedKM;
          window.masterFullPayload.rawTables.Data_KM = updatedKM;
        }
        try {
          localStorage.setItem('dperform_km_cache', JSON.stringify(updatedKM));
        } catch(e) {}
        renderKMView(currentDashboardPayload);
        if (typeof filterKMTable === 'function') filterKMTable();
      }

      closeModal('modal-edit-row');
      showToast("✅ Perubahan berhasil disimpan seketika!");

      try {
        const res = await syncSheetToBackend(sheetName);
        if (res.success) {
          showToast(\`✅ Data \${schema.title} berhasil disinkronkan ke Google Sheets!\`);
        } else {
          showToast(\`⚠️ Data tersimpan di aplikasi, status sync: \${res.message || 'Offline'}\`);
        }
      } catch (err) {
        showToast(\`⚠️ Data tersimpan di aplikasi, gagal sinkron: \${err.message}\`);
      } finally {
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.innerHTML = originalBtnHtml;
        }
      }
    }`;

modalsJs = modalsJs.replace(
  /async function handleSaveRowEdit\(event\) \{[\s\S]*?finally \{[\s\S]*?\}\s*\}/,
  () => newHandleSaveRowEdit
);

// Update openKMDetailModal to record currentActiveKMRowIndex
const oldOpenKMDetailModal = `    function openKMDetailModal(rowIndex, fallbackKey) {
      if (!currentDashboardPayload || !currentDashboardPayload.rawTables) return;
      const rawRows = (currentDashboardPayload.rawTables.Knowledge_management || currentDashboardPayload.rawTables.Data_KM) || [];
      let row = rawRows[rowIndex];`;

const newOpenKMDetailModal = `    let currentActiveKMRowIndex = -1;

    function openEditKMFromDetail() {
      if (currentActiveKMRowIndex !== -1) {
        closeModal('modal-km-detail');
        openEditRowModal('Knowledge_management', currentActiveKMRowIndex);
      }
    }

    function openDeleteKMFromDetail() {
      if (currentActiveKMRowIndex !== -1) {
        closeModal('modal-km-detail');
        openDeleteRowModal('Knowledge_management', currentActiveKMRowIndex);
      }
    }

    window.openEditKMFromDetail = openEditKMFromDetail;
    window.openDeleteKMFromDetail = openDeleteKMFromDetail;

    function openKMDetailModal(rowIndex, fallbackKey) {
      if (!currentDashboardPayload || !currentDashboardPayload.rawTables) return;
      const rawRows = (currentDashboardPayload.rawTables.Knowledge_management || currentDashboardPayload.rawTables.Data_KM) || [];
      let row = rawRows[rowIndex];
      currentActiveKMRowIndex = rowIndex;`;

modalsJs = modalsJs.replace(oldOpenKMDetailModal, () => newOpenKMDetailModal);

fs.writeFileSync(modalsPath, modalsJs, 'utf8');
console.log('Updated handleConfirmDeleteRow and handleSaveRowEdit in modals.js');

// 2. Update index.html - Add Edit & Hapus button in modal-km-detail footer
const indexPath = path.join(__dirname, '../index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

const oldKMFooter = `      <!-- Modal Footer -->
      <div class="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
        <button type="button" onclick="closeModal('modal-km-detail')" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer">
          Tutup
        </button>
      </div>`;

const newKMFooter = `      <!-- Modal Footer -->
      <div class="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
        <div class="admin-only-action flex items-center gap-2">
          <button type="button" onclick="openEditKMFromDetail()" class="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl text-xs border border-amber-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer">
            <i class="fa-solid fa-pen-to-square"></i>
            <span>Edit Dokumen</span>
          </button>
          <button type="button" onclick="openDeleteKMFromDetail()" class="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs border border-red-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer">
            <i class="fa-solid fa-trash"></i>
            <span>Hapus Dokumen</span>
          </button>
        </div>
        <button type="button" onclick="closeModal('modal-km-detail')" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer">
          Tutup
        </button>
      </div>`;

if (indexHtml.includes(oldKMFooter)) {
  indexHtml = indexHtml.replace(oldKMFooter, () => newKMFooter);
  fs.writeFileSync(indexPath, indexHtml, 'utf8');
  console.log('Updated modal-km-detail footer in index.html with Edit & Hapus buttons');
}

console.log('Realtime sync and SaaS polish completed.');
