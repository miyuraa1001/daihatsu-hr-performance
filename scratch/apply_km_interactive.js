const fs = require('fs');
const path = require('path');

// 1. Update index.html
const indexPath = path.join(__dirname, '../index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// A. Insert Guide Banner KM above <!-- Table Container KM -->
const bannerHtml = `          <!-- Guide Banner KM (Panduan Rekapitulasi Berkas) -->
          <div id="km-guide-banner" class="bg-gradient-to-br from-white via-cyan-50/30 to-sky-50/40 rounded-2xl p-4 sm:p-5 border border-cyan-200/80 shadow-card relative overflow-hidden">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div class="flex items-start gap-3.5">
                <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center text-lg sm:text-xl border border-cyan-200 flex-shrink-0 shadow-2xs">
                  <i class="fa-solid fa-lightbulb"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-cyan-100 text-cyan-800 uppercase tracking-wider">Panduan Rekap</span>
                    <h4 class="text-sm font-extrabold text-slate-900 leading-snug">Panduan Rekapitulasi Berkas Knowledge Management (PDF/PPT)</h4>
                  </div>
                  <ol class="text-xs text-slate-600 space-y-1 mt-1.5 list-decimal list-inside font-medium leading-relaxed">
                    <li>Simpan seluruh file presentasi (PDF/PPT) sharing session karyawan dalam 1 folder bulanan.</li>
                    <li>Cukup sertakan NPK pada nama file (Contoh: <code class="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-mono font-bold text-[11px]">1800 Rulia - Servis Berkala.pdf</code> atau <code class="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-mono font-bold text-[11px]">2023 Kamil Hasan.pptx</code>).</li>
                    <li>Nama karyawan otomatis dicocokkan ke database Master Karyawan, dan tanggal sesi diambil otomatis dari tanggal pembuatan berkas.</li>
                  </ol>
                </div>
              </div>
              <div class="flex flex-wrap sm:flex-nowrap items-center gap-2 lg:flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-cyan-100">
                <button type="button" onclick="downloadKMScript()" class="flex-1 sm:flex-initial px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-200/90 shadow-2xs cursor-pointer">
                  <i class="fa-solid fa-download text-slate-500"></i>
                  <span>Unduh Skrip Rekap Otomatis (.bat)</span>
                </button>
                <button type="button" onclick="openAddKMModal()" class="admin-only-action flex-1 sm:flex-initial px-3.5 py-2.5 bg-[#E60012] hover:bg-[#c5000f] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer">
                  <i class="fa-solid fa-plus"></i>
                  <span>+ Input Manual KM</span>
                </button>
                <button type="button" onclick="openUploadModal('Knowledge_management')" class="admin-only-action flex-1 sm:flex-initial px-3.5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer">
                  <i class="fa-solid fa-cloud-arrow-up"></i>
                  <span>Upload Hasil Rekap (.xlsx / .csv)</span>
                </button>
              </div>
            </div>
          </div>\n\n`;

if (!indexHtml.includes('id="km-guide-banner"')) {
  indexHtml = indexHtml.replace('          <!-- Table Container KM -->', bannerHtml + '          <!-- Table Container KM -->');
  console.log('Inserted km-guide-banner into index.html');
}

// B. Insert Modal Add KM after modal-km-detail
const modalAddKMHtml = `
  <!-- MODAL: TAMBAH DATA KNOWLEDGE MANAGEMENT (KM) MANUAL -->
  <div id="modal-add-km" class="fixed inset-0 z-50 modal-backdrop hidden flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onclick="if(event.target === this) closeModal('modal-add-km')">
    <div class="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
      <!-- Modal Header -->
      <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 p-4 sm:p-5 text-white flex items-center justify-between relative">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center text-lg">
            <i class="fa-solid fa-book-bookmark"></i>
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-extrabold text-white">Input Manual Knowledge Management</h3>
            <p class="text-[11px] text-slate-300">Tambahkan catatan sharing session atau panduan baru ke database</p>
          </div>
        </div>
        <button type="button" onclick="closeModal('modal-add-km')" class="text-slate-400 hover:text-white transition w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center cursor-pointer">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <!-- Form Content -->
      <form id="form-add-km" onsubmit="submitAddKMForm(event)" class="p-5 space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">NPK Karyawan <span class="text-red-500">*</span></label>
          <div class="relative">
            <input type="text" id="add-km-npk" required list="km-employee-datalist" oninput="handleKMNPKLookup(this.value)" placeholder="Ketik atau pilih NPK (Contoh: 10123)" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition">
            <datalist id="km-employee-datalist"></datalist>
          </div>
          <span id="add-km-npk-hint" class="text-[10px] text-slate-400 mt-1 block">Pilih dari Master Karyawan atau ketik NPK secara langsung.</span>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Nama Karyawan / Pemateri</label>
          <input type="text" id="add-km-nama" placeholder="Nama otomatis terisi jika NPK terdaftar di Master" class="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none transition">
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Judul Materi Sharing / Panduan KM <span class="text-red-500">*</span></label>
          <textarea id="add-km-judul" required rows="3" placeholder="Tuliskan judul materi, topik sharing session, atau nama SOP/Panduan..." class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition resize-none"></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Tanggal Sesi / Submit <span class="text-red-500">*</span></label>
            <input type="date" id="add-km-tanggal" required class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Waktu / Jam (TIME) <span class="text-red-500">*</span></label>
            <input type="time" id="add-km-time" required value="09:00" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition">
          </div>
        </div>

        <div id="add-km-status-box" class="hidden text-xs p-3 rounded-xl"></div>

        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button type="button" onclick="closeModal('modal-add-km')" class="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
            Batal
          </button>
          <button type="submit" id="btn-submit-add-km" class="px-5 py-2.5 rounded-xl bg-[#E60012] hover:bg-[#c5000f] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer">
            <i class="fa-solid fa-floppy-disk"></i>
            <span>Simpan Data KM</span>
          </button>
        </div>
      </form>
    </div>
  </div>\n`;

if (!indexHtml.includes('id="modal-add-km"')) {
  indexHtml = indexHtml.replace('  <!-- MODAL: EDIT ROW DATA (KHUSUS ADMIN) -->', modalAddKMHtml + '  <!-- MODAL: EDIT ROW DATA (KHUSUS ADMIN) -->');
  console.log('Inserted modal-add-km into index.html');
}

fs.writeFileSync(indexPath, indexHtml, 'utf8');

// 2. Update src/js/employee.js - Empty state
const empPath = path.join(__dirname, '../src/js/employee.js');
let empHtml = fs.readFileSync(empPath, 'utf8');

const oldEmptyState = `      if (!list.length) {
        tbody.innerHTML = \`<tr><td colspan="\${cols.length + 1}" class="text-center py-8 text-slate-400">Belum ada data Knowledge Management di database Google Sheets.</td></tr>\`;
        return;
      }`;

const newEmptyState = `      if (!list.length) {
        const isAdmin = isUserAdmin(loggedInUser);
        tbody.innerHTML = \`
          <tr>
            <td colspan="\${cols.length + 1}" class="py-12 px-4 text-center">
              <div class="max-w-md mx-auto flex flex-col items-center">
                <div class="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center text-xl mb-3 shadow-2xs">
                  <i class="fa-solid fa-folder-open"></i>
                </div>
                <h4 class="text-sm font-extrabold text-slate-800 mb-1">Belum Ada Data Knowledge Management</h4>
                <p class="text-xs text-slate-500 mb-4 leading-relaxed">
                  Belum ada dokumen materi sharing session atau panduan KM yang terdata untuk cabang / filter ini.
                </p>
                <div class="flex flex-wrap items-center justify-center gap-2">
                  <button type="button" onclick="document.getElementById('km-guide-banner')?.scrollIntoView({ behavior: 'smooth' })" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 shadow-2xs cursor-pointer">
                    <i class="fa-solid fa-circle-info text-cyan-600"></i>
                    <span>Pelajari Cara Upload</span>
                  </button>
                  \${isAdmin ? \`
                    <button type="button" onclick="openAddKMModal()" class="px-3.5 py-1.5 bg-[#E60012] hover:bg-[#c5000f] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer">
                      <i class="fa-solid fa-plus"></i>
                      <span>Tambah Data Pertama</span>
                    </button>
                    <button type="button" onclick="openUploadModal('Knowledge_management')" class="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer">
                      <i class="fa-solid fa-cloud-arrow-up"></i>
                      <span>Upload Berkas Rekap</span>
                    </button>
                  \` : ''}
                </div>
              </div>
            </td>
          </tr>
        \`;
        return;
      }`;

if (empHtml.includes('Belum ada data Knowledge Management di database Google Sheets.')) {
  empHtml = empHtml.replace(oldEmptyState, newEmptyState);
  fs.writeFileSync(empPath, empHtml, 'utf8');
  console.log('Updated filterKMTable empty state in src/js/employee.js');
}

// 3. Update src/js/modals.js - Add downloadKMScript, openAddKMModal, handleKMNPKLookup, submitAddKMForm
const modalsPath = path.join(__dirname, '../src/js/modals.js');
let modalsHtml = fs.readFileSync(modalsPath, 'utf8');

const kmFunctions = `
    // ========================================================
    // KNOWLEDGE MANAGEMENT (KM) AUTOMATION & MANUAL INPUT
    // ========================================================
    function downloadKMScript() {
      const batContent = \`@echo off
echo ========================================================
echo  D-PERFORM - GENERATOR REKAP KNOWLEDGE MANAGEMENT DSO
echo ========================================================
echo Sedang memindai file PDF dan PPT di folder ini...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$files = Get-ChildItem -File | Where-Object { $_.Extension -match '\\\\.(pdf|ppt|pptx)$' }; $res = @(); foreach ($f in $files) { if ($f.BaseName -match '(\\\\d{4,6})') { $npk = $matches[1]; $judul = ($f.BaseName -replace $npk, '').Replace('_', ' ').Trim(); if (-not $judul) { $judul = 'Materi Sharing KM' }; $res += [PSCustomObject]@{ NPK = $npk; NAMA = ''; JUDUL = $judul; TANGGAL = $f.LastWriteTime.ToString('yyyy-MM-dd'); TIME = $f.LastWriteTime.ToString('HH:mm') } } }; if ($res.Count -gt 0) { $res | Export-Csv -Path 'Rekap_KM_Siap_Upload.csv' -NoTypeInformation -Encoding UTF8; Write-Host 'BERHASIL! Rekap ' $res.Count ' file tersimpan di Rekap_KM_Siap_Upload.csv' -ForegroundColor Green } else { Write-Host 'Tidak ditemukan file PDF/PPT dengan NPK pada nama file.' -ForegroundColor Red }"
echo ========================================================
echo Selesai. Silakan upload Rekap_KM_Siap_Upload.csv ke D-PERFORM.
pause
\`;

      const blob = new Blob([batContent], { type: 'application/x-bat;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Rekap_KM_Otomatis.bat';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Skrip Rekap_KM_Otomatis.bat berhasil diunduh!');
    }

    function openAddKMModal() {
      if (!isUserAdmin(loggedInUser)) {
        showToast("Akses ditolak: Hanya Administrator HR yang dapat menambahkan data KM.");
        return;
      }
      const form = document.getElementById('form-add-km');
      if (form) form.reset();

      const npkInput = document.getElementById('add-km-npk');
      const namaInput = document.getElementById('add-km-nama');
      const dateInput = document.getElementById('add-km-tanggal');
      const timeInput = document.getElementById('add-km-time');
      const statusBox = document.getElementById('add-km-status-box');

      if (statusBox) statusBox.className = 'hidden';
      if (namaInput) namaInput.value = '';

      const now = new Date();
      if (dateInput) {
        dateInput.value = now.toISOString().slice(0, 10);
      }
      if (timeInput) {
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = \`\${hh}:\${mm}\`;
      }

      // Isi datalist karyawan dari Master Karyawan
      const dl = document.getElementById('km-employee-datalist');
      if (dl) {
        const empList = (window.masterFullPayload?.employeeList || currentDashboardPayload?.employeeList || []);
        dl.innerHTML = empList
          .filter(e => String(e.statusKaryawan || e.Status_Karyawan || 'Aktif').toLowerCase() === 'aktif')
          .map(e => \`<option value="\${safeString(e.npk || e['Personnel no.'])}">\${e.nama || e['Last name']} (\${e.cabang || e['P.subarea'] || 'DSO'})\</option>\`)
          .join('');
      }

      const modal = document.getElementById('modal-add-km');
      if (modal) modal.classList.remove('hidden');
      if (npkInput) npkInput.focus();
    }

    function handleKMNPKLookup(npkVal) {
      const cleanVal = safeString(npkVal).trim();
      const namaInput = document.getElementById('add-km-nama');
      if (!namaInput) return;
      if (!cleanVal) {
        namaInput.value = '';
        return;
      }
      const empList = (window.masterFullPayload?.employeeList || currentDashboardPayload?.employeeList || []);
      const emp = empList.find(e => safeString(e.npk || e['Personnel no.']) === cleanVal);
      if (emp) {
        namaInput.value = emp.nama || emp['Last name'] || '';
      }
    }

    async function submitAddKMForm(e) {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      if (!isUserAdmin(loggedInUser)) {
        showToast("Akses ditolak: Hanya Administrator HR yang dapat menyimpan data KM.");
        return;
      }

      const npkVal = safeString(document.getElementById('add-km-npk')?.value).trim();
      let namaVal = document.getElementById('add-km-nama')?.value.trim();
      const judulVal = document.getElementById('add-km-judul')?.value.trim();
      const tglVal = document.getElementById('add-km-tanggal')?.value;
      const timeVal = document.getElementById('add-km-time')?.value;
      const statusBox = document.getElementById('add-km-status-box');
      const btn = document.getElementById('btn-submit-add-km');

      if (!npkVal || !judulVal || !tglVal) {
        alert("Harap lengkapi NPK, Judul Materi, dan Tanggal Sesi.");
        return;
      }

      // Lookup nama jika kosong
      if (!namaVal) {
        const empList = (window.masterFullPayload?.employeeList || currentDashboardPayload?.employeeList || []);
        const emp = empList.find(em => safeString(em.npk || em['Personnel no.']) === npkVal);
        if (emp) namaVal = emp.nama || emp['Last name'] || '';
      }

      // Format tanggal DD/MM/YYYY
      let formattedDate = tglVal;
      if (/^\\d{4}-\\d{2}-\\d{2}$/.test(tglVal)) {
        const [y, m, d] = tglVal.split('-');
        formattedDate = \`\${d}/\${m}/\${y}\`;
      }

      let formattedTime = timeVal || '09:00';
      if (/^\\d{1,2}:\\d{2}$/.test(formattedTime)) {
        formattedTime = \`\${formattedTime}:00\`;
      }

      const newRow = {
        "NPK": npkVal,
        "NAMA": namaVal,
        "JUDUL": judulVal,
        "TANGGAL": formattedDate,
        "TIME": formattedTime
      };

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
      }
      if (statusBox) {
        statusBox.className = 'text-xs p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 block';
        statusBox.textContent = 'Menyinkronkan data KM ke Google Sheets...';
      }

      try {
        if (!currentDashboardPayload.rawTables) currentDashboardPayload.rawTables = {};
        if (!currentDashboardPayload.rawTables.Knowledge_management) currentDashboardPayload.rawTables.Knowledge_management = [];
        if (!currentDashboardPayload.rawTables.Data_KM) currentDashboardPayload.rawTables.Data_KM = [];

        // Tambah ke array lokal
        currentDashboardPayload.rawTables.Knowledge_management.push(newRow);
        currentDashboardPayload.rawTables.Data_KM = currentDashboardPayload.rawTables.Knowledge_management;

        if (window.masterFullPayload && window.masterFullPayload.rawTables) {
          if (!window.masterFullPayload.rawTables.Knowledge_management) window.masterFullPayload.rawTables.Knowledge_management = [];
          window.masterFullPayload.rawTables.Knowledge_management.push(newRow);
          window.masterFullPayload.rawTables.Data_KM = window.masterFullPayload.rawTables.Knowledge_management;
        }

        // Sinkronkan ke Google Sheets via syncSheetToBackend
        const res = await syncSheetToBackend('Knowledge_management');
        
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Data KM';
        }

        if (res && res.success === false) {
          alert("Peringatan: Data KM tersimpan di memori aplikasi tetapi gagal disinkronkan ke backend: " + (res.message || ""));
        } else {
          showToast("Data Knowledge Management berhasil ditambahkan dan disinkronkan!");
        }

        closeModal('modal-add-km');
        if (typeof renderKMView === 'function') renderKMView(currentDashboardPayload);
        if (typeof filterKMTable === 'function') filterKMTable();
      } catch (err) {
        console.error("Gagal menambah data KM:", err);
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Data KM';
        }
        if (statusBox) {
          statusBox.className = 'text-xs p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 block';
          statusBox.textContent = 'Terjadi kesalahan: ' + err.message;
        }
      }
    }

    // Expose KM functions to window for template/onclick calls
    window.downloadKMScript = downloadKMScript;
    window.openAddKMModal = openAddKMModal;
    window.handleKMNPKLookup = handleKMNPKLookup;
    window.submitAddKMForm = submitAddKMForm;
`;

if (!modalsHtml.includes('function downloadKMScript()')) {
  modalsHtml += kmFunctions;
  fs.writeFileSync(modalsPath, modalsHtml, 'utf8');
  console.log('Appended KM functions to src/js/modals.js');
}

console.log('All updates completed successfully.');
