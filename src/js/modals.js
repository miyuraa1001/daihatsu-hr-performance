/**
 * D-PERFORM - Modals, Upload & Export
 * Excel Importer, Exporter, CRUD Modals, and Detail Dialogs
 */

    function renderUploadSchemaGuide() {
      const targetSheet = document.getElementById('upload-target-sheet')?.value || 'Master_Karyawan';
      const schema = SCHEMAS[targetSheet];
      if (!schema) return;

      const titleEl = document.getElementById('upload-guide-title');
      const colsEl = document.getElementById('upload-guide-cols');
      if (titleEl) titleEl.textContent = `Skema Wajib: ${schema.sheetName}`;
      if (colsEl) {
        if (targetSheet === 'Knowledge_management' || targetSheet === 'Data_KM') {
          colsEl.innerHTML = `4 Kolom Wajib Berkas: <b class="text-slate-800">NPK, NAMA, JUDUL, TANGGAL</b><span class="text-emerald-600 block text-[11px] font-semibold mt-1"><i class="fa-solid fa-clock mr-1"></i>Kolom <b>TIME</b> otomatis diisi waktu saat berkas diunggah.</span>`;
        } else {
          colsEl.textContent = `${schema.columns.length} Kolom Baku (Sesuai Urutan): ${schema.columns.join(', ')}`;
        }
      }
    }

    function downloadSelectedTemplate() {
      const targetSheet = document.getElementById('upload-target-sheet')?.value || 'Master_Karyawan';
      downloadExcelTemplate(targetSheet);
    }

    function getSampleValueForColumn(targetSheet, col) {
      const norm = normalizeHeaderName(col);
      if (norm === 'personnel no.' || norm === 'npk') return '10123';
      if (norm === 'p.subarea' || norm === 'cabang') return 'Lampung A Yani';
      if (norm === 'wilayah' || norm === 'wilayah/divisi') return 'DSO Lampung';
      if (norm === 'contract') return 'Tetap';
      if (norm === 'name') return 'Sales Unit';
      if (norm === 'name of organizational unit') return 'Sales DSO Lampung';
      if (norm === 'job title') return 'Sales Executive';
      if (norm === 'last name' || norm === 'nama' || norm === 'employee name') return 'Budi Santoso';
      if (norm === 'd.o.birth') return '1995-08-17';
      if (norm === 'gender text') return 'Male';
      if (norm === 'religious denomination') return 'Islam';
      if (norm === 'ps group') return 'III/A';
      if (norm === 'lvl') return 'Staff';
      if (norm === 'date' || norm === 'date clock in' || norm === 'date clock out') return '2025-05-30';
      if (norm === 'p0001-stext') return 'Sales Staff';
      if (norm === 'business area' || norm === 'kode ba') return 'D660';
      if (norm === 'time clock in') return '07:55';
      if (norm === 'time clock out') return '17:05';
      if (norm.includes('durasi kerja')) return 8.5;
      if (norm.includes('assigned work') || norm.includes('in radius')) return 'YES';
      if (norm.includes('need cico')) return 'NO';
      if (norm.includes('location clock')) return '-5.4297,105.2625';
      if (norm.includes('clock in source') || norm.includes('clock out source')) return 'Mobile App GPS';
      if (norm === 'keterangan') return 'Hadir Tepat Waktu';
      if (norm === 'no') return '1';
      if (norm === 'registrasi' || norm === 'no.registrasi') return 'SS-D660-001';
      if (norm === 'nama tim') return 'Circle Kaizen DSO';
      if (norm === 'cabang/departemen') return 'Lampung A Yani / Service';
      if (norm === 'bagian') return 'Workshop';
      if (norm === 'tema' || norm === 'judul') return 'Standar Operasional Prosedur Service Kendaraan';
      if (norm === 'tanggal') return '30/09/2026';
      if (norm === 'fasilitator') return 'Kepala Cabang';
      if (norm === 'npk fasilitator') return '10001';
      if (norm === 'diterima bulan') return 'Mei-25';
      if (norm === 'kategori') return 'Quality & Productivity';
      if (norm.includes('astrapay')) return '081234567890';
      if (norm === 'nama akun') return 'Budi Santoso';
      if (norm === 'status reward') return 'Approved';
      if (norm === 'reward') return 'Rp 50.000';
      if (norm === 'no.berita acara') return 'BA/D660/2025';
      if (norm === 'no.bph') return 'BPH-2025-01';
      if (norm === 'distribusi reward') return 'Transfer AstraPay';
      if (norm === 'leader') return 'Ahmad Fauzi';
      if (norm.startsWith('anggota')) return 'Member ' + col.slice(-1);
      if (norm === 'status') return 'Action';
      if (norm === 'pendaftaran diterima' || norm === 'l 1-8 diterima') return '2025-01-15';
      if (norm.startsWith('langkah')) return 'Selesai';
      if (norm === 'tahun konvensi') return '2025';
      if (norm.includes('risalah')) return 'Lengkap (Format Baku ADM)';
      if (norm === 'tingkat sp') return 'SP 1';
      if (norm === 'alasan') return 'Indisipliner kehadiran';
      return '-';
    }

    function downloadExcelTemplate(targetSheet) {
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

      const ws = XLSX.utils.json_to_sheet([sampleRow], { header: cols });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, schema.sheetName);
      XLSX.writeFile(wb, `Template_${schema.sheetName}.xlsx`);
      showToast(`Template ${schema.sheetName}.xlsx berhasil diunduh!`);
    }

    function renderRowActionCell(sheetName, rowIndex, row) {
      const isAdmin = isUserAdmin(loggedInUser);

      let detailBtn = '';
      if (sheetName === 'Data_QCC') {
        const rawTeam = String(row['Nama Tim'] || 'Tim QCC');
        const regNo = String(row['No.Registrasi'] || '');
        const safeTeam = rawTeam.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const safeReg = regNo.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        detailBtn = `
          <button type="button" onclick="openQCCRisalahModal(${rowIndex}, '${safeReg || safeTeam}')" class="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-[11px] border border-purple-200 transition inline-flex items-center gap-1 shadow-2xs">
            <i class="fa-solid fa-file-lines text-[10px]"></i> Risalah
          </button>
        `;
      } else if (sheetName === 'Data_SS') {
        const regNo = String(row['Registrasi'] || row['No.Registrasi'] || '');
        const npkVal = String(row['NPK'] || row['Personnel no.'] || '').replace(/'/g, "\\'");
        const safeReg = regNo.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        detailBtn = `
          <button type="button" onclick="openSSDetailModal(${rowIndex}, '${safeReg || npkVal}')" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg text-[11px] border border-amber-200 transition inline-flex items-center gap-1 shadow-2xs">
            <i class="fa-solid fa-lightbulb text-[10px]"></i> Detail SS
          </button>
        `;
      } else if (sheetName === 'Data_KM' || sheetName === 'Knowledge_management') {
        const judulVal = String(row['JUDUL'] || row['Judul'] || row['Judul KM'] || '').replace(/'/g, "\\'");
        const npkVal = String(row['NPK'] || row['Personnel no.'] || '').replace(/'/g, "\\'");
        detailBtn = `
          <button type="button" onclick="openKMDetailModal(${rowIndex}, '${npkVal || judulVal}')" class="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold rounded-lg text-[11px] border border-cyan-200 transition inline-flex items-center gap-1 shadow-2xs">
            <i class="fa-solid fa-book-open text-[10px]"></i> Detail
          </button>
        `;
      } else {
        const npkVal = String(getRowCellValue(row, 'Personnel no.', SCHEMAS.Master_Karyawan) || row['Personnel no.'] || row['NPK'] || '').replace(/'/g, "\\'");
        detailBtn = `
          <button type="button" onclick="openPBKModal('${npkVal}')" class="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold rounded-lg text-[11px] transition">
            Detail
          </button>
        `;
      }

      if (!isAdmin) {
        return `<td class="py-2.5 px-4 text-center whitespace-nowrap">${detailBtn}</td>`;
      }

      return `
        <td class="py-2.5 px-4 text-center whitespace-nowrap">
          <div class="inline-flex items-center gap-1.5 justify-center">
            ${detailBtn}
            <button type="button" onclick="openEditRowModal('${sheetName}', ${rowIndex})" title="Edit Baris (Admin)" class="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg text-[11px] border border-amber-200 transition inline-flex items-center gap-1 shadow-xs">
              <i class="fa-solid fa-pen-to-square text-[10px]"></i>
              <span>Edit</span>
            </button>
            <button type="button" onclick="openDeleteRowModal('${sheetName}', ${rowIndex})" title="Hapus Baris (Admin)" class="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-[11px] border border-red-200 transition inline-flex items-center gap-1 shadow-xs">
              <i class="fa-solid fa-trash text-[10px]"></i>
              <span>Hapus</span>
            </button>
          </div>
        </td>
      `;
    }

    function openEditRowModal(sheetName, rowIndex) {
      if (!isUserAdmin(loggedInUser)) {
        showToast("Akses ditolak: Hanya Admin yang memiliki wewenang mengedit data.");
        return;
      }
      const schema = SCHEMAS[sheetName];
      if (!schema || !currentDashboardPayload?.rawTables?.[sheetName]) return;
      const row = currentDashboardPayload.rawTables[sheetName][rowIndex];
      if (!row) return;

      document.getElementById('edit-row-sheet').value = sheetName;
      document.getElementById('edit-row-index').value = rowIndex;

      const titleEl = document.getElementById('modal-edit-title');
      const subtitleEl = document.getElementById('modal-edit-subtitle');
      if (titleEl) titleEl.textContent = `Edit Baris: ${schema.title}`;
      if (subtitleEl) {
        const ident = getRowCellValue(row, 'Personnel no.', schema) || getRowCellValue(row, 'NPK', schema) || row['No'] || `Baris ke-${rowIndex + 1}`;
        const name = getRowCellValue(row, 'Last name', schema) || getRowCellValue(row, 'Nama', schema) || row['Nama Tim'] || row['Employee Name'] || '';
        subtitleEl.textContent = `${ident}${name ? ' • ' + name : ''} (Perubahan akan langsung disinkronkan ke basis data)`;
      }

      const container = document.getElementById('edit-row-fields-grid');
      container.innerHTML = schema.columns.map(col => {
        const val = String(getRowCellValue(row, col, schema) || '');
        const norm = normalizeHeaderName(col);
        
        let inputHtml = '';
        if (norm === 'contract') {
          const normVal = normalizeContractCategory(val);
          inputHtml = `
            <select name="${col}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
              <option value="Tetap / Permanent" ${normVal === 'Tetap / Permanent' ? 'selected' : ''}>Tetap / Permanent</option>
              <option value="Kontrak / PKWT" ${normVal === 'Kontrak / PKWT' ? 'selected' : ''}>Kontrak / PKWT</option>
              <option value="On probation" ${normVal === 'On probation' ? 'selected' : ''}>On probation</option>
              <option value="Magang/Intern" ${normVal === 'Magang/Intern' ? 'selected' : ''}>Magang/Intern</option>
            </select>
          `;
        } else if (norm === 'gender text') {
          const isMale = val.toLowerCase().includes('male') || val.toLowerCase().includes('laki');
          inputHtml = `
            <select name="${col}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
              <option value="Male" ${isMale ? 'selected' : ''}>Male</option>
              <option value="Female" ${!isMale ? 'selected' : ''}>Female</option>
            </select>
          `;
        } else if (norm === 'tingkat sp') {
          inputHtml = `
            <select name="${col}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
              <option value="-" ${(!val || val === '-') ? 'selected' : ''}>- (Tidak Ada SP)</option>
              <option value="Teguran Lisan" ${val === 'Teguran Lisan' ? 'selected' : ''}>Teguran Lisan</option>
              <option value="SP 1" ${val === 'SP 1' ? 'selected' : ''}>SP 1</option>
              <option value="SP 2" ${val === 'SP 2' ? 'selected' : ''}>SP 2</option>
              <option value="SP 3" ${val === 'SP 3' ? 'selected' : ''}>SP 3</option>
              <option value="SPPT" ${val === 'SPPT' ? 'selected' : ''}>SPPT</option>
            </select>
          `;
        } else if (norm === 'status' && sheetName === 'Data_QCC') {
          inputHtml = `
            <select name="${col}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
              <option value="Plan" ${val.toLowerCase() === 'plan' ? 'selected' : ''}>Plan</option>
              <option value="Do" ${val.toLowerCase() === 'do' ? 'selected' : ''}>Do</option>
              <option value="Check" ${val.toLowerCase() === 'check' ? 'selected' : ''}>Check</option>
              <option value="Action" ${val.toLowerCase() === 'action' ? 'selected' : ''}>Action</option>
            </select>
          `;
        } else if (norm.includes('date') || norm === 'd.o.birth' || norm.includes('tgl') || norm.includes('tanggal')) {
          inputHtml = `<input type="date" name="${col}" value="${val}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">`;
        } else if (norm.includes('time') || norm.includes('jam')) {
          inputHtml = `<input type="time" name="${col}" value="${val}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">`;
        } else if (norm.includes('durasi kerja') || norm.includes('work hours')) {
          inputHtml = `<input type="number" step="0.1" name="${col}" value="${val}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">`;
        } else {
          const escapedVal = val.replace(/"/g, '&quot;');
          inputHtml = `<input type="text" name="${col}" value="${escapedVal}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">`;
        }

        return `
          <div>
            <label class="block text-[11px] font-bold text-slate-700 mb-1">${col}</label>
            ${inputHtml}
          </div>
        `;
      }).join('');

      document.getElementById('modal-edit-row').classList.remove('hidden');
    }

    function submitEditRowForm() {
      const form = document.getElementById('form-edit-row');
      if (form) {
        if (typeof form.requestSubmit === 'function') {
          form.requestSubmit();
        } else {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    }

        async function handleSaveRowEdit(event) {
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
        btnSave.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i><span>Menyimpan...</span>`;
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
          showToast(`✅ Data ${schema.title} berhasil disinkronkan ke Google Sheets!`);
        } else {
          showToast(`⚠️ Data tersimpan di aplikasi, status sync: ${res.message || 'Offline'}`);
        }
      } catch (err) {
        showToast(`⚠️ Data tersimpan di aplikasi, gagal sinkron: ${err.message}`);
      } finally {
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.innerHTML = originalBtnHtml;
        }
      }
    }

    function openDeleteRowModal(sheetName, rowIndex) {
      if (!isUserAdmin(loggedInUser)) {
        showToast("Akses ditolak: Hanya Admin yang dapat menghapus data.");
        return;
      }
      const schema = SCHEMAS[sheetName];
      if (!schema || !currentDashboardPayload?.rawTables?.[sheetName]) return;
      const row = currentDashboardPayload.rawTables[sheetName][rowIndex];
      if (!row) return;

      document.getElementById('delete-row-sheet').value = sheetName;
      document.getElementById('delete-row-index').value = rowIndex;

      const descEl = document.getElementById('modal-delete-desc');
      const ident = getRowCellValue(row, 'Personnel no.', schema) || getRowCellValue(row, 'NPK', schema) || row['No'] || `Baris ke-${rowIndex + 1}`;
      const name = getRowCellValue(row, 'Last name', schema) || getRowCellValue(row, 'Nama', schema) || row['Nama Tim'] || row['Employee Name'] || '';
      if (descEl) {
        descEl.textContent = `Apakah Anda yakin ingin menghapus data "${ident}${name ? ' - ' + name : ''}" dari ${schema.title}? Tindakan ini akan menghapus data dari aplikasi dan disinkronkan ke Google Sheets secara permanen.`;
      }

      document.getElementById('modal-delete-row').classList.remove('hidden');
    }

        async function handleConfirmDeleteRow() {
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
        btnDelete.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i><span>Menghapus...</span>`;
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
          showToast(`✅ Data ${schema.title} berhasil disinkronkan ke Google Sheets!`);
        } else {
          showToast(`⚠️ Data terhapus di aplikasi, status sync: ${res.message || 'Offline'}`);
        }
      } catch (err) {
        showToast(`⚠️ Data terhapus di aplikasi, gagal sinkron: ${err.message}`);
      } finally {
        if (btnDelete) {
          btnDelete.disabled = false;
          btnDelete.innerHTML = originalBtnHtml;
        }
      }
    }

    function openKMDetailModal(rowIndex, fallbackKey) {
      if (!currentDashboardPayload || !currentDashboardPayload.rawTables) return;
      const rawRows = (currentDashboardPayload.rawTables.Knowledge_management || currentDashboardPayload.rawTables.Data_KM) || [];
      let row = rawRows[rowIndex];

      if (!row && fallbackKey) {
        row = rawRows.find(r => 
          safeString(r['NPK']) === safeString(fallbackKey) || 
          String(r['JUDUL'] || r['Judul']).toLowerCase() === String(fallbackKey).toLowerCase()
        );
      }

      if (!row) {
        showToast("Data Knowledge Management tidak ditemukan.");
        return;
      }

      const npk = safeString(row['NPK'] || '-');
      const nama = row['NAMA'] || row['Nama'] || 'Karyawan DSO';
      const judul = row['JUDUL'] || row['Judul'] || 'Panduan Knowledge Management';
      const tanggal = formatDatabaseDate(row['TANGGAL'] || row['Tanggal']) || row['TANGGAL'] || row['Tanggal'] || '-';
      const time = row['TIME'] || row['Time'] || '-';
      const cabang = row['Cabang'] || row['P.subarea'] || '-';
      const kodeBA = row['Kode BA'] || row['Business area'] || '-';

      if (document.getElementById('km-modal-category')) document.getElementById('km-modal-category').textContent = time !== '-' ? `Waktu: ${time}` : 'Knowledge Management';
      if (document.getElementById('km-modal-date')) document.getElementById('km-modal-date').textContent = tanggal;
      if (document.getElementById('km-modal-title')) document.getElementById('km-modal-title').textContent = judul;
      if (document.getElementById('km-modal-author-name')) document.getElementById('km-modal-author-name').textContent = nama;
      if (document.getElementById('km-modal-author-meta')) document.getElementById('km-modal-author-meta').textContent = `NPK: ${npk}${cabang !== '-' ? ' • Cabang: ' + cabang : ''}`;
      if (document.getElementById('km-modal-desc')) document.getElementById('km-modal-desc').textContent = judul;
      if (document.getElementById('km-modal-branch')) document.getElementById('km-modal-branch').textContent = cabang;
      if (document.getElementById('km-modal-ba')) document.getElementById('km-modal-ba').textContent = kodeBA !== '-' ? kodeBA : '-';
      
      const attEl = document.getElementById('km-modal-attachment');
      if (attEl) {
        attEl.innerHTML = `<i class="fa-solid fa-clock"></i> ${time !== '-' ? time : 'Tercatat'}`;
      }

      const actualIndex = rawRows.indexOf(row);
      window.currentKMDetailIndex = actualIndex !== -1 ? actualIndex : rowIndex;

      const adminBtns = document.getElementById('km-modal-admin-actions');
      if (adminBtns) {
        if (isUserAdmin(loggedInUser)) {
          adminBtns.classList.remove('hidden');
          adminBtns.classList.add('flex');
        } else {
          adminBtns.classList.add('hidden');
          adminBtns.classList.remove('flex');
        }
      }

      document.getElementById('modal-km-detail').classList.remove('hidden');
    }
    window.openKMDetailModal = openKMDetailModal;

    function openEditKMFromDetail() {
      const idx = window.currentKMDetailIndex;
      closeModal('modal-km-detail');
      const targetSheet = (currentDashboardPayload?.rawTables?.Knowledge_management) ? 'Knowledge_management' : 'Data_KM';
      if (typeof idx === 'number' && idx >= 0) {
        openEditRowModal(targetSheet, idx);
      }
    }
    window.openEditKMFromDetail = openEditKMFromDetail;

    function openDeleteKMFromDetail() {
      const idx = window.currentKMDetailIndex;
      closeModal('modal-km-detail');
      const targetSheet = (currentDashboardPayload?.rawTables?.Knowledge_management) ? 'Knowledge_management' : 'Data_KM';
      if (typeof idx === 'number' && idx >= 0) {
        openDeleteRowModal(targetSheet, idx);
      }
    }
    window.openDeleteKMFromDetail = openDeleteKMFromDetail;

    function exportModuleTableToExcel(targetSheet) {
      if (targetSheet === 'Data_Absensi') targetSheet = 'Data_Kehadiran';
      const schema = SCHEMAS[targetSheet];
      if (!schema) {
        showToast(`Skema untuk '${targetSheet}' tidak ditemukan!`);
        return;
      }
      if (!currentDashboardPayload || !currentDashboardPayload.rawTables) {
        showToast("Data tabel belum siap diekspor.");
        return;
      }

      const isAdmin = isUserAdmin(loggedInUser);
      const userBranchCode = getUserBranchCode(loggedInUser);

      let rawRows = currentDashboardPayload.rawTables[targetSheet] || [];
      if (!rawRows.length && targetSheet === 'Master_Karyawan' && currentDashboardPayload.employeeList) {
        rawRows = currentDashboardPayload.employeeList;
      }

      if (!rawRows.length) {
        showToast(`Tidak ada data ${schema.title} untuk diekspor.`);
        return;
      }

      let exportRows = [];
      let exportColumns = [];

      if (targetSheet === 'Master_Karyawan') {
        let list = rawRows;
        // Role-based filter: Kepala Cabang HANYA mengekspor karyawan Aktif pada cabangnya
        if (!isAdmin) {
          list = list.filter(e => {
            const st = String(e['Status_Karyawan'] || e.statusKaryawan || 'Aktif').trim().toLowerCase();
            const branchOk = matchBranch(e, userBranchCode);
            return st !== 'resign' && branchOk;
          });
        } else {
          // Jika Admin sedang memilih cabang tertentu di filter atas
          const selectedBranch = document.getElementById('branch-select')?.value || 'ALL';
          if (selectedBranch !== 'ALL') {
            list = list.filter(e => matchBranch(e, selectedBranch));
          }
        }

        // Definisi urutan kolom ekspor baku dengan kolom Umur & Masa Kerja terpisah
        exportColumns = [
          "Personnel no.",
          "P.subarea",
          "Wilayah",
          "Contract",
          "Name",
          "Name of organizational unit",
          "Job Title",
          "Last name",
          "D.o.birth",
          "Umur",
          "Gender text",
          "Religious denomination",
          "PS group",
          "Lvl",
          "Date",
          "Masa Kerja",
          "P0001-STEXT",
          "Business area",
          "Status_Karyawan"
        ];
        if (isAdmin) {
          exportColumns.push("Tanggal_Resign", "Alasan_Resign");
        }

        exportRows = list.map((row, idx) => {
          const dob = (row['D.o.birth'] !== undefined && row['D.o.birth'] !== null && String(row['D.o.birth']).trim() !== '' && row['D.o.birth'] !== '1995-05-15')
            ? row['D.o.birth']
            : findDOBirth(row, idx);
          const joinDate = (row['Date'] !== undefined && row['Date'] !== null && String(row['Date']).trim() !== '')
            ? row['Date']
            : findDate(row, idx);

          const umurVal = calculateAgeAndService(dob);
          const masaKerjaVal = calculateAgeAndService(joinDate);

          const obj = {};
          exportColumns.forEach(col => {
            if (col === 'Umur') {
              obj['Umur'] = (umurVal && umurVal !== '-') ? umurVal : "";
            } else if (col === 'Masa Kerja') {
              obj['Masa Kerja'] = (masaKerjaVal && masaKerjaVal !== '-') ? masaKerjaVal : "";
            } else if (col === 'D.o.birth') {
              obj['D.o.birth'] = formatDatabaseDate(dob);
            } else if (col === 'Date') {
              obj['Date'] = formatDatabaseDate(joinDate);
            } else if (col === 'PS group' && (!row[col] || row[col] === 'III/A')) {
              obj['PS group'] = findPSGroup(row, idx);
            } else if (col === 'Lvl' && (!row[col] || row[col] === 'Staff')) {
              obj['Lvl'] = findLvl(row, idx);
            } else if (col === 'P0001-STEXT' && (!row[col] || row[col] === 'Staff Unit')) {
              obj['P0001-STEXT'] = findP0001STEXT(row, idx);
            } else {
              obj[col] = (row[col] !== undefined && row[col] !== null) ? row[col] : "";
            }
          });
          return obj;
        });
      } else {
        exportColumns = schema.columns.slice();
        if (!isAdmin && (targetSheet === 'Data_Kehadiran' || targetSheet === 'Data_SS' || targetSheet === 'Data_QCC' || targetSheet === 'Data_SP')) {
          rawRows = rawRows.filter(e => matchBranch(e, userBranchCode));
        }

        exportRows = rawRows.map(row => {
          const obj = {};
          exportColumns.forEach(col => {
            obj[col] = (row[col] !== undefined && row[col] !== null) ? row[col] : "";
          });
          return obj;
        });
      }

      const ws = XLSX.utils.json_to_sheet(exportRows, { header: exportColumns });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, schema.sheetName);
      XLSX.writeFile(wb, `${schema.sheetName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showToast(`Berkas ${schema.sheetName}.xlsx berhasil diunduh (${exportRows.length} baris, ${exportColumns.length} kolom)! Kolom Umur & Masa Kerja terpisah.`);
    }

    // Ekspor Seluruh Modul ke dalam Satu Workbook Terpadu (6-in-1 Sheet)
    function exportAllSheetsToSingleWorkbook() {
      if (!currentDashboardPayload || !currentDashboardPayload.rawTables) {
        showToast("Data database belum siap diekspor.");
        return;
      }

      const isAdmin = isUserAdmin(loggedInUser);
      const userBranchCode = getUserBranchCode(loggedInUser);
      const wb = XLSX.utils.book_new();
      const sheetKeys = ["Master_Karyawan", "Data_Kehadiran", "Data_SS", "Data_QCC", "Data_SP", "Knowledge_management"];
      let totalRows = 0;

      sheetKeys.forEach(sheetKey => {
        const schema = SCHEMAS[sheetKey];
        if (!schema) return;
        let rawRows = currentDashboardPayload.rawTables[sheetKey] || (sheetKey === 'Knowledge_management' ? currentDashboardPayload.rawTables.Data_KM : []) || [];
        
        let exportRows = [];
        let exportColumns = [];

        if (sheetKey === 'Master_Karyawan') {
          if (!isAdmin) {
            rawRows = rawRows.filter(e => {
              const st = String(e['Status_Karyawan'] || e.statusKaryawan || 'Aktif').trim().toLowerCase();
              return st !== 'resign' && matchBranch(e, userBranchCode);
            });
          }

          exportColumns = [
            "Personnel no.",
            "P.subarea",
            "Wilayah",
            "Contract",
            "Name",
            "Name of organizational unit",
            "Job Title",
            "Last name",
            "D.o.birth",
            "Umur",
            "Gender text",
            "Religious denomination",
            "PS group",
            "Lvl",
            "Date",
            "Masa Kerja",
            "P0001-STEXT",
            "Business area",
            "Status_Karyawan"
          ];
          if (isAdmin) {
            exportColumns.push("Tanggal_Resign", "Alasan_Resign");
          }

          exportRows = rawRows.map((row, idx) => {
            const dob = (row['D.o.birth'] !== undefined && row['D.o.birth'] !== null && String(row['D.o.birth']).trim() !== '' && row['D.o.birth'] !== '1995-05-15')
              ? row['D.o.birth']
              : findDOBirth(row, idx);
            const joinDate = (row['Date'] !== undefined && row['Date'] !== null && String(row['Date']).trim() !== '')
              ? row['Date']
              : findDate(row, idx);

            const umurVal = calculateAgeAndService(dob);
            const masaKerjaVal = calculateAgeAndService(joinDate);

            const obj = {};
            exportColumns.forEach(col => {
              if (col === 'Umur') {
                obj['Umur'] = (umurVal && umurVal !== '-') ? umurVal : "";
              } else if (col === 'Masa Kerja') {
                obj['Masa Kerja'] = (masaKerjaVal && masaKerjaVal !== '-') ? masaKerjaVal : "";
              } else if (col === 'D.o.birth') {
                obj['D.o.birth'] = formatDatabaseDate(dob);
              } else if (col === 'Date') {
                obj['Date'] = formatDatabaseDate(joinDate);
              } else if (col === 'PS group' && (!row[col] || row[col] === 'III/A')) {
                obj['PS group'] = findPSGroup(row, idx);
              } else if (col === 'Lvl' && (!row[col] || row[col] === 'Staff')) {
                obj['Lvl'] = findLvl(row, idx);
              } else if (col === 'P0001-STEXT' && (!row[col] || row[col] === 'Staff Unit')) {
                obj['P0001-STEXT'] = findP0001STEXT(row, idx);
              } else {
                obj[col] = (row[col] !== undefined && row[col] !== null) ? row[col] : "";
              }
            });
            return obj;
          });
        } else {
          exportColumns = schema.columns.slice();
          if (!isAdmin) {
            rawRows = rawRows.filter(e => matchBranch(e, userBranchCode));
          }

          exportRows = rawRows.map(row => {
            const obj = {};
            exportColumns.forEach(col => {
              obj[col] = (row[col] !== undefined && row[col] !== null) ? row[col] : "";
            });
            return obj;
          });
        }

        totalRows += exportRows.length;
        const ws = XLSX.utils.json_to_sheet(exportRows.length ? exportRows : [{}], { header: exportColumns });
        XLSX.utils.book_append_sheet(wb, ws, schema.sheetName);
      });

      XLSX.writeFile(wb, `D-PERFORM_Master_Database_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showToast(`Master Workbook 6-in-1 berhasil diunduh (${totalRows} total baris di 6 sheet)! Kolom Umur & Masa Kerja terpisah.`);
    }

    function prosesUploadExcelFrontend() {
      if (!isUserAdmin(loggedInUser)) {
        alert("Akses ditolak: Hanya Administrator HR yang memiliki izin mengunggah data Excel.");
        return;
      }
      const fileInput = document.getElementById('excel-file-input');
      const targetSheet = document.getElementById('upload-target-sheet').value;
      const statusBox = document.getElementById('upload-status-box');
      const btn = document.getElementById('btn-submit-upload');

      if (!fileInput.files.length) {
        alert("Silakan pilih berkas Excel (.xlsx / .xls / .csv) terlebih dahulu!");
        return;
      }

      const file = fileInput.files[0];
      const reader = new FileReader();

      btn.disabled = true;
      btn.textContent = "Membaca berkas...";
      statusBox.className = "text-[11px] p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 block";
      statusBox.textContent = "Mengekstrak baris dan mencocokkan skema kolom...";

      reader.onload = async function(e) {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Cari worksheet yang namanya sesuai atau gunakan worksheet pertama
          let targetWorksheet = workbook.Sheets[targetSheet];
          if (!targetWorksheet) {
            const firstSheetName = workbook.SheetNames[0];
            targetWorksheet = workbook.Sheets[firstSheetName];
          }

          const rawRows = XLSX.utils.sheet_to_json(targetWorksheet, { header: 1, defval: "" });
          if (rawRows.length <= 1) {
            alert("Berkas Excel kosong atau hanya berisi baris header.");
            btn.disabled = false;
            btn.textContent = "Proses & Simpan";
            return;
          }

          const schema = SCHEMAS[targetSheet];
          if (!schema) {
            throw new Error(`Skema konfigurasi untuk target '${targetSheet}' tidak ditemukan.`);
          }

          // 1. Normalisasi nama header dari berkas yang diunggah (bersihkan newline \n dan whitespace)
          const uploadedHeaders = rawRows[0].map(h => normalizeHeaderName(h));
          const canonicalColumns = schema.columns;
          const colIndexMapping = {};

          canonicalColumns.forEach(canonicalCol => {
            const normCanonical = normalizeHeaderName(canonicalCol);
            let matchIdx = uploadedHeaders.findIndex(uh => uh === normCanonical);
            if (matchIdx === -1 && schema.aliases && schema.aliases[normCanonical]) {
              const aliases = schema.aliases[normCanonical];
              matchIdx = uploadedHeaders.findIndex(uh => aliases.includes(uh));
            }
            if (matchIdx === -1) {
              matchIdx = uploadedHeaders.findIndex(uh => uh.includes(normCanonical) || normCanonical.includes(uh));
            }
            colIndexMapping[canonicalCol] = matchIdx;
          });

          // 2. Parsing baris data dengan Safe Typecasting
          const now = new Date();
          const dStr = String(now.getDate()).padStart(2, '0');
          const mStr = String(now.getMonth() + 1).padStart(2, '0');
          const yStr = now.getFullYear();
          const hourStr = String(now.getHours()).padStart(2, '0');
          const minStr = String(now.getMinutes()).padStart(2, '0');
          const secStr = String(now.getSeconds()).padStart(2, '0');
          
          const defaultUploadTime = `${hourStr}:${minStr}:${secStr}`;
          const defaultUploadDate = `${dStr}/${mStr}/${yStr}`;

          const parsedObjects = [];
          for (let i = 1; i < rawRows.length; i++) {
            const rowData = rawRows[i];
            if (!rowData || rowData.every(cell => cell === "" || cell === null || cell === undefined)) continue;

            const rowObj = {};
            canonicalColumns.forEach(col => {
              const colIdx = colIndexMapping[col];
              let cellVal = (colIdx !== -1 && colIdx !== undefined) ? rowData[colIdx] : "";

              // Khusus Knowledge Management: jika kolom TIME tidak ada di file Excel atau kosong, otomatis isi dengan waktu saat berkas diunggah
              
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
          }

          if (!parsedObjects.length) {
            alert("Tidak ada baris data valid yang berhasil diekstraksi dari file.");
            btn.disabled = false;
            btn.textContent = "Proses & Simpan";
            return;
          }

          // 3. Sinkronisasi data ke state tabel frontend seketika
          if (!currentDashboardPayload.rawTables) currentDashboardPayload.rawTables = {};
          currentDashboardPayload.rawTables[targetSheet] = parsedObjects;

          if (targetSheet === 'Knowledge_management' || targetSheet === 'Data_KM') {
            currentDashboardPayload.rawTables.Knowledge_management = parsedObjects;
            try { localStorage.setItem('dperform_km_cache', JSON.stringify(parsedObjects)); } catch(e) {}
            currentDashboardPayload.rawTables.Data_KM = parsedObjects;
            if (window.masterFullPayload && window.masterFullPayload.rawTables) {
              window.masterFullPayload.rawTables.Knowledge_management = parsedObjects;
              window.masterFullPayload.rawTables.Data_KM = parsedObjects;
            }
          }

          // Perbarui tabel tampilan modul yang relevan seketika
          if (targetSheet === 'Master_Karyawan') {
            // Sinkronkan employeeList dengan data Master_Karyawan yang baru diunggah
            currentDashboardPayload.employeeList = parsedObjects.map(obj => {
              const contractVal = obj['Contract'] || 'Tetap';
              const existing = (currentDashboardPayload.employeeList || []).find(e => String(e.npk) === String(obj['Personnel no.'])) || {};
              const stKaryawan = obj['Status_Karyawan'] || existing.statusKaryawan || 'Aktif';
              const dob = obj['D.o.birth'] || existing.tglLahir || '';
              const jDate = obj['Date'] || existing.joinDate || '';
              return {
                ...existing,
                npk: safeString(obj['Personnel no.']),
                nama: obj['Last name'] || existing.nama || '',
                cabang: obj['P.subarea'] || existing.cabang || '',
                wilayah: obj['Wilayah'] || existing.wilayah || '',
                kodeBA: safeString(obj['Business area'] || existing.kodeBA),
                divisi: obj['Name'] || existing.divisi || '',
                jabatan: obj['Job Title'] || existing.jabatan || '',
                tipeKontrak: contractVal,
                'Contract': contractVal,
                statusKaryawan: stKaryawan,
                Status_Karyawan: stKaryawan,
                tanggalResign: obj['Tanggal_Resign'] || existing.tanggalResign || '',
                alasanResign: obj['Alasan_Resign'] || existing.alasanResign || '',
                umurText: calculateAgeAndService(dob),
                masaKerjaText: calculateAgeAndService(jDate),
                joinDate: jDate,
                tglLahir: dob,
                gender: obj['Gender text'] || existing.gender || '',
                agama: obj['Religious denomination'] || existing.agama || '',
                psGroup: obj['PS group'] || existing.psGroup || '',
                lvl: obj['Lvl'] || existing.lvl || '',
                stext: obj['P0001-STEXT'] || existing.stext || ''
              };
            });

            // Hitung ulang summary dengan data Master Karyawan terupdate
            currentDashboardPayload.summary = computeBranchSummary(
              currentDashboardPayload.employeeList,
              currentDashboardPayload.qccList,
              currentDashboardPayload.summary
            );

            renderMasterKaryawanView(currentDashboardPayload);
          }
          else if (targetSheet === 'Data_Kehadiran') filterAbsensiTable();
          else if (targetSheet === 'Data_SS') filterSSTable();
          else if (targetSheet === 'Data_QCC') filterQCCTable();
          else if (targetSheet === 'Data_SP') filterSPTable();
          else if (targetSheet === 'Knowledge_management' || targetSheet === 'Data_KM') {
            if (typeof renderKMView === 'function') renderKMView(currentDashboardPayload);
            if (typeof filterKMTable === 'function') filterKMTable();
          }
          else if (targetSheet === 'Knowledge_management' || targetSheet === 'Data_KM') {
            if (typeof renderKMView === 'function') renderKMView(currentDashboardPayload);
            if (typeof filterKMTable === 'function') filterKMTable();
          }

          statusBox.textContent = `Menyimpan ${parsedObjects.length} baris terstandarisasi ke Google Sheets...`;

          // Format array 2D terstandarisasi (Row 1 = exact canonical headers)
          const formattedDataRows = parsedObjects.map(obj => canonicalColumns.map(col => obj[col]));

          const res = await callBackendAPI("IMPORT_EXCEL", {
            targetSheet: schema.sheetName,
            headers: canonicalColumns,
            dataRows: formattedDataRows
          });

          btn.disabled = false;
          btn.textContent = "Proses & Simpan";

          if (res.success) {
            statusBox.className = "text-[11px] p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 block";
            statusBox.textContent = `✅ Berhasil mengimpor ${parsedObjects.length} baris data ke ${schema.sheetName}!`;
            fileInput.value = "";
            setTimeout(() => {
              closeModal('modal-upload');
              loadBackendDashboardData();
            }, 1200);
          } else {
            // Jika backend offline/mock, beri tahu user bahwa sesi lokal tetap sukses diperbarui
            statusBox.className = "text-[11px] p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 block";
            statusBox.textContent = `⚠️ Tersimpan di tabel lokal (${parsedObjects.length} baris). Status backend: ${res.message}`;
            setTimeout(() => {
              closeModal('modal-upload');
            }, 2500);
          }

        } catch (err) {
          alert("Gagal memproses file Excel: " + err.message);
          btn.disabled = false;
          btn.textContent = "Proses & Simpan";
        }
      };

      reader.readAsArrayBuffer(file);
    }

    // 6. Ekspor Data (Rekapitulasi Kinerja Cabang / Acuan PBK dengan Kolom Umur & Masa Kerja Terpisah)
    function exportCurrentTableToExcel(fileNamePrefix) {
      if (!currentDashboardPayload || !currentDashboardPayload.employeeList) {
        showToast("Tidak ada data untuk diekspor!");
        return;
      }
      
      const isAdmin = isUserAdmin(loggedInUser);
      let list = currentDashboardPayload.employeeList || [];
      if (!isAdmin) {
        list = list.filter(e => {
          const st = String(e.statusKaryawan || e.Status_Karyawan || 'Aktif').trim().toLowerCase();
          return st !== 'resign';
        });
      }

      const exportRows = list.map((e, idx) => {
        const dob = e.tglLahir || e['D.o.birth'] || findDOBirth(e, idx);
        const joinDate = e.joinDate || e['Date'] || findDate(e, idx);
        const umur = e.umurText || calculateAgeAndService(dob);
        const masaKerja = e.masaKerjaText || calculateAgeAndService(joinDate);
        const status = (e.statusKaryawan || e.Status_Karyawan || 'Aktif').trim();

        const row = {
          "NPK": safeString(e.npk || e['Personnel no.']),
          "Nama Karyawan": e.nama || e['Last name'] || '',
          "Cabang": e.cabang || e['P.subarea'] || '',
          "Kode BA": safeString(e.kodeBA || e['Business area'] || ''),
          "Divisi": e.divisi || e['Name'] || '',
          "Jabatan": e.jabatan || e['Job Title'] || '',
          "Tipe Kontrak": e.tipeKontrak || e['Contract'] || 'Tetap',
          "Tanggal Lahir": formatDatabaseDate(dob),
          "Umur": (umur && umur !== '-') ? umur : '',
          "Tanggal Masuk": formatDatabaseDate(joinDate),
          "Masa Kerja": (masaKerja && masaKerja !== '-') ? masaKerja : '',
          "Status Karyawan": status
        };

        if (isAdmin) {
          row["Tanggal Resign"] = e.tanggalResign || e['Tanggal_Resign'] || '';
          row["Alasan Resign"] = e.alasanResign || e['Alasan_Resign'] || '';
        }

        row["Kehadiran (%)"] = e.kehadiranPct !== undefined ? `${e.kehadiranPct}%` : '100%';
        row["Total Ide SS"] = e.totalSS !== undefined ? Number(e.totalSS) : 0;
        row["Catatan SP"] = e.spAktif || '-';

        return row;
      });

      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Rekap_Data_Kinerja");
      XLSX.writeFile(wb, `${fileNamePrefix}_${new Date().toISOString().slice(0,10)}.xlsx`);
      showToast("Berkas Excel berhasil diunduh! Kolom Umur & Masa Kerja dipisahkan secara rapi.");
    }

    // 7. Modal & UI Helpers
    let currentActivePBKNpk = null;

    function showPBKSummaryView() {
      const summaryView = document.getElementById('pbk-view-summary');
      const drilldownView = document.getElementById('pbk-view-drilldown');
      if (summaryView) summaryView.classList.remove('hidden');
      if (drilldownView) drilldownView.classList.add('hidden');
    }

    function openPBKModal(npk) {
      if (!currentDashboardPayload) return;
      currentActivePBKNpk = String(npk).trim();

      const emp = (currentDashboardPayload.employeeList || []).find(e => 
        String(getRowCellValue(e, 'Personnel no.', SCHEMAS.Master_Karyawan) || e.npk || '').trim() === currentActivePBKNpk
      ) || (currentDashboardPayload.rawTables?.Master_Karyawan || []).find(e =>
        String(getRowCellValue(e, 'Personnel no.', SCHEMAS.Master_Karyawan) || e.npk || '').trim() === currentActivePBKNpk
      );
      if (!emp) return;

      const empNama = getRowCellValue(emp, 'Last name', SCHEMAS.Master_Karyawan) || emp.nama || 'Karyawan';
      const empNpk = getRowCellValue(emp, 'Personnel no.', SCHEMAS.Master_Karyawan) || emp.npk || npk;
      const empCabang = getRowCellValue(emp, 'P.subarea', SCHEMAS.Master_Karyawan) || emp.cabang || '-';
      const empJabatan = getRowCellValue(emp, 'Job Title', SCHEMAS.Master_Karyawan) || emp.jabatan || emp.divisi || '-';
      const empContract = getRowCellValue(emp, 'Contract', SCHEMAS.Master_Karyawan) || emp.tipeKontrak || 'Tetap';

      document.getElementById('modal-emp-avatar').textContent = empNama.slice(0, 2).toUpperCase();
      document.getElementById('modal-emp-name').textContent = empNama;
      document.getElementById('modal-emp-role').textContent = `NPK: ${empNpk} • ${empJabatan} • Cabang ${empCabang}`;

      // 1. Hitung Kehadiran & Telat
      const absRows = (currentDashboardPayload.rawTables?.Data_Kehadiran || []).filter(r => 
        safeString(r['NPK'] || r['Personnel no.']) === safeString(empNpk)
      );
      let telatCount = 0;
      absRows.forEach(r => {
        const ket = String(r['Keterangan'] || '').toLowerCase();
        const clockIn = r['Time Clock In'] || r['Clock In'] || r['Time'] || '';
        const lateness = calculateLatenessInfo(clockIn);
        if (lateness.isLate || ket.includes('terlambat') || ket.includes('telat')) {
          telatCount++;
        }
      });
      if (emp.telat !== undefined && emp.telat !== null && telatCount === 0) {
        telatCount = Number(emp.telat) || 0;
      }

      const hadirPct = emp.kehadiranPct || (absRows.length > 0 ? Math.round(((absRows.length - telatCount) / absRows.length) * 100) : 98);
      document.getElementById('modal-emp-hadir').textContent = `${hadirPct}%`;
      const telatEl = document.getElementById('modal-emp-telat');
      if (telatEl) {
        telatEl.textContent = `${telatCount}x Telat`;
        if (telatCount > 0) {
          telatEl.className = "px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-200/90 text-amber-900 border border-amber-300";
        } else {
          telatEl.className = "px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-200/80 text-emerald-900 border border-emerald-300";
        }
      }

      // 2. Hitung Suggestion System (SS)
      const ssRows = (currentDashboardPayload.rawTables?.Data_SS || []).filter(r => 
        safeString(r['NPK'] || r['Personnel no.']) === safeString(empNpk)
      );
      const ssCount = ssRows.length > 0 ? ssRows.length : (emp.totalSS || 0);
      document.getElementById('modal-emp-ss').textContent = `${ssCount} Ide`;
      if (document.getElementById('modal-emp-ss-status')) {
        document.getElementById('modal-emp-ss-status').textContent = ssCount > 0 ? 'Aktif Kaizen' : 'Belum Submit';
      }

      // 3. Hitung QCC Circles
      const qccRows = (currentDashboardPayload.rawTables?.Data_QCC || []).filter(r => {
        const leaderNPK = safeString(r['NPK Leader'] || r['Leader NPK'] || r['Leader']);
        const leaderName = String(r['Leader'] || '').toLowerCase();
        const cleanName = empNama.toLowerCase();
        if (leaderNPK === safeString(empNpk) || (cleanName && leaderName.includes(cleanName))) return true;
        for (let i = 1; i <= 7; i++) {
          const memberVal = String(r[`Anggota ${i}`] || '').toLowerCase();
          if (memberVal && (memberVal.includes(safeString(empNpk)) || (cleanName && memberVal.includes(cleanName)))) {
            return true;
          }
        }
        return false;
      });
      document.getElementById('modal-emp-qcc').textContent = `${qccRows.length} Circle`;
      if (document.getElementById('modal-emp-qcc-role')) {
        document.getElementById('modal-emp-qcc-role').textContent = qccRows.length > 0 ? 'Terdaftar Tim' : 'Belum Ada';
      }

      // 4. Contract
      document.getElementById('modal-emp-kontrak').textContent = empContract;

      // 5. Kedisiplinan / SP
      const spRows = (currentDashboardPayload.rawTables?.Data_SP || []).filter(r => 
        safeString(r['NPK'] || r['Personnel no.']) === safeString(empNpk)
      );
      const spStatus = (spRows.length > 0 && spRows[0]['Tingkat SP'] && spRows[0]['Tingkat SP'] !== '-') 
        ? spRows[0]['Tingkat SP'] 
        : (emp.spAktif || 'Bersih');
      document.getElementById('modal-emp-sp').textContent = spStatus;
      if (document.getElementById('modal-emp-sp-status')) {
        document.getElementById('modal-emp-sp-status').textContent = spStatus === 'Bersih' ? 'Nihil Sanksi' : 'Sanksi Aktif';
      }

      // 6. Knowledge Management (KM)
      const kmRows = ((currentDashboardPayload.rawTables?.Knowledge_management || currentDashboardPayload.rawTables?.Data_KM) || []).filter(r => 
        safeString(r['NPK'] || r['Personnel no.']) === safeString(empNpk)
      );
      document.getElementById('modal-emp-km').textContent = `${kmRows.length} Dok`;
      if (document.getElementById('modal-emp-km-status')) {
        document.getElementById('modal-emp-km-status').textContent = kmRows.length > 0 ? 'Kontributor KM' : 'Belum Terbit';
      }

      // Catatan
      const notesEl = document.getElementById('modal-emp-notes');
      if (notesEl) {
        if (spStatus !== 'Bersih') {
          notesEl.textContent = `Tercatat sanksi aktif ${spStatus}: ${emp.spAlasan || spRows[0]?.Alasan || 'Perlu pembinaan disiplin kerja berkala.'}`;
        } else if (telatCount > 0) {
          notesEl.textContent = `Disiplin kerja cukup baik. Terdapat ${telatCount}x catatan terlambat jam masuk kerja yang perlu diperbaiki.`;
        } else {
          notesEl.textContent = `Disiplin kerja sangat baik. Selalu tepat waktu tanpa pelanggaran atau catatan sanksi.`;
        }
      }

      // Reset ke tampilan summary
      showPBKSummaryView();
      document.getElementById('modal-pbk-detail').classList.remove('hidden');
    }

    function openPBKDrilldown(type) {
      if (!currentDashboardPayload || !currentActivePBKNpk) return;
      const emp = (currentDashboardPayload.employeeList || []).find(e => 
        String(getRowCellValue(e, 'Personnel no.', SCHEMAS.Master_Karyawan) || e.npk || '').trim() === currentActivePBKNpk
      ) || (currentDashboardPayload.rawTables?.Master_Karyawan || []).find(e =>
        String(getRowCellValue(e, 'Personnel no.', SCHEMAS.Master_Karyawan) || e.npk || '').trim() === currentActivePBKNpk
      );
      if (!emp) return;

      const empNama = getRowCellValue(emp, 'Last name', SCHEMAS.Master_Karyawan) || emp.nama || 'Karyawan';
      const empNpk = getRowCellValue(emp, 'Personnel no.', SCHEMAS.Master_Karyawan) || emp.npk || currentActivePBKNpk;

      const summaryView = document.getElementById('pbk-view-summary');
      const drilldownView = document.getElementById('pbk-view-drilldown');
      if (summaryView) summaryView.classList.add('hidden');
      if (drilldownView) drilldownView.classList.remove('hidden');

      const badgeEl = document.getElementById('pbk-drilldown-badge');
      const titleEl = document.getElementById('pbk-drilldown-title');
      const subEl = document.getElementById('pbk-drilldown-subtitle');
      const contentEl = document.getElementById('pbk-drilldown-content');

      if (type === 'kehadiran') {
        badgeEl.className = "px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300";
        badgeEl.textContent = "Data_Kehadiran";
        titleEl.textContent = `Riwayat Presensi & Keterlambatan: ${empNama}`;
        subEl.textContent = `Monitoring catatan clock in/out, waktu kerja, dan ketepatan waktu hadir (NPK: ${empNpk})`;

        const absRows = (currentDashboardPayload.rawTables?.Data_Kehadiran || []).filter(r => 
          safeString(r['NPK'] || r['Personnel no.']) === safeString(empNpk)
        );

        let telatCount = 0;
        let onTimeCount = 0;
        absRows.forEach(r => {
          const ket = String(r['Keterangan'] || '').toLowerCase();
          const clockIn = r['Time Clock In'] || r['Clock In'] || r['Time'] || '';
          const lateness = calculateLatenessInfo(clockIn);
          if (lateness.isLate || ket.includes('terlambat') || ket.includes('telat')) {
            telatCount++;
          } else if (lateness.hasClockIn) {
            onTimeCount++;
          }
        });

        const statBanner = `
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <div class="bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-center">
              <span class="text-[9px] font-bold text-emerald-700 block uppercase">Total Hari Presensi</span>
              <span class="text-base font-extrabold text-emerald-900">${absRows.length} Hari</span>
            </div>
            <div class="bg-teal-50 p-2 rounded-xl border border-teal-200 text-center">
              <span class="text-[9px] font-bold text-teal-700 block uppercase">Tepat Waktu</span>
              <span class="text-base font-extrabold text-teal-900">${onTimeCount} Hari</span>
            </div>
            <div class="bg-amber-50 p-2 rounded-xl border border-amber-200 text-center">
              <span class="text-[9px] font-bold text-amber-700 block uppercase">Terlambat Masuk</span>
              <span class="text-base font-extrabold text-amber-900">${telatCount} Kali</span>
            </div>
            <div class="bg-blue-50 p-2 rounded-xl border border-blue-200 text-center">
              <span class="text-[9px] font-bold text-blue-700 block uppercase">Target Jam Masuk</span>
              <span class="text-base font-extrabold text-blue-900">08:00 WIB</span>
            </div>
          </div>
        `;

        if (!absRows.length) {
          contentEl.innerHTML = `${statBanner}<div class="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">Belum ada catatan presensi harian di sheet Data_Kehadiran untuk karyawan ini.</div>`;
          return;
        }

        const tableRows = absRows.map((r, i) => {
          const tgl = formatDatabaseDate(r['Date'] || r['Tanggal']) || r['Date'] || '-';
          const clockInRaw = r['Time Clock In'] || r['Clock In'] || '-';
          const clockOutRaw = r['Time Clock Out'] || r['Clock Out'] || '-';
          const lateness = calculateLatenessInfo(clockInRaw);
          const clockIn = lateness.hasClockIn ? lateness.timeFormatted : clockInRaw;
          const clockOut = formatDatabaseTime(clockOutRaw);
          const durasi = r['Durasi Kerja (Work Hours)'] || r['Durasi Kerja'] || '-';
          const lokasi = r['Assigned Work Location'] || r['Cabang'] || '-';
          const statusBadge = lateness.badgeHtml;

          return `
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">${tgl}</td>
              <td class="py-2.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">${clockIn}</td>
              <td class="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">${clockOut}</td>
              <td class="py-2.5 px-3 text-slate-600 whitespace-nowrap">${durasi}</td>
              <td class="py-2.5 px-3 whitespace-nowrap">${statusBadge}</td>
              <td class="py-2.5 px-3 text-slate-500 whitespace-nowrap">${lokasi}</td>
            </tr>
          `;
        }).join('');

        contentEl.innerHTML = `
          ${statBanner}
          <div class="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs bg-white">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">Tanggal</th>
                  <th class="py-2.5 px-3">Clock In</th>
                  <th class="py-2.5 px-3">Clock Out</th>
                  <th class="py-2.5 px-3">Durasi</th>
                  <th class="py-2.5 px-3">Status Hadir</th>
                  <th class="py-2.5 px-3">Lokasi Penugasan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${tableRows}
              </tbody>
            </table>
          </div>
        `;
      } else if (type === 'ss') {
        badgeEl.className = "px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300";
        badgeEl.textContent = "Data_SS (Kaizen)";
        titleEl.textContent = `Daftar Usulan Suggestion System: ${empNama}`;
        subEl.textContent = `Partisipasi ide inovasi kerja dan perbaikan berkelanjutan (NPK: ${empNpk})`;

        const ssRows = (currentDashboardPayload.rawTables?.Data_SS || []).filter(r => 
          safeString(r['NPK'] || r['Personnel no.']) === safeString(empNpk)
        );

        if (!ssRows.length) {
          contentEl.innerHTML = `<div class="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">Belum ada ide Suggestion System yang diajukan oleh karyawan ini di sheet Data_SS.</div>`;
          return;
        }

        const tableRows = ssRows.map((r, i) => {
          const noReg = r['No.Registrasi'] || r['No Registrasi'] || `#${i+1}`;
          const tema = r['Tema Ide'] || r['Tema'] || r['Judul'] || '-';
          const fasilitator = r['Fasilitator'] || '-';
          const bulan = r['Diterima Bulan'] || r['Bulan'] || '-';
          const reward = r['Reward'] || r['Status Reward'] || 'Terdaftar';

          return `
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="py-2.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">${noReg}</td>
              <td class="py-2.5 px-3 font-semibold text-slate-900">${tema}</td>
              <td class="py-2.5 px-3 text-slate-600 whitespace-nowrap">${fasilitator}</td>
              <td class="py-2.5 px-3 text-slate-600 whitespace-nowrap">${bulan}</td>
              <td class="py-2.5 px-3 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">${reward}</span>
              </td>
            </tr>
          `;
        }).join('');

        contentEl.innerHTML = `
          <div class="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs bg-white">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">No. Registrasi</th>
                  <th class="py-2.5 px-3">Tema Ide Kaizen</th>
                  <th class="py-2.5 px-3">Fasilitator</th>
                  <th class="py-2.5 px-3">Bulan</th>
                  <th class="py-2.5 px-3">Reward / Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${tableRows}
              </tbody>
            </table>
          </div>
        `;
      } else if (type === 'qcc') {
        badgeEl.className = "px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300";
        badgeEl.textContent = "Data_QCC (PDCA)";
        titleEl.textContent = `Keanggotaan Circle QCC: ${empNama}`;
        subEl.textContent = `Keterlibatan dalam gugus kendali mutu dan risalah 8 langkah PDCA (NPK: ${empNpk})`;

        const qccRows = (currentDashboardPayload.rawTables?.Data_QCC || []).filter(r => {
          const leaderNPK = safeString(r['NPK Leader'] || r['Leader NPK'] || r['Leader']);
          const leaderName = String(r['Leader'] || '').toLowerCase();
          const cleanName = empNama.toLowerCase();
          if (leaderNPK === safeString(empNpk) || (cleanName && leaderName.includes(cleanName))) return true;
          for (let i = 1; i <= 7; i++) {
            const memberVal = String(r[`Anggota ${i}`] || '').toLowerCase();
            if (memberVal && (memberVal.includes(safeString(empNpk)) || (cleanName && memberVal.includes(cleanName)))) {
              return true;
            }
          }
          return false;
        });

        if (!qccRows.length) {
          contentEl.innerHTML = `<div class="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">Karyawan ini belum terdaftar sebagai Leader atau Anggota pada tim Quality Control Circle (QCC).</div>`;
          return;
        }

        const tableRows = qccRows.map((r, i) => {
          const noReg = r['No.Registrasi'] || r['No Registrasi'] || `#${i+1}`;
          const namaTim = r['Nama Tim'] || 'Tim QCC';
          const tema = r['Tema'] || '-';
          const isLeader = safeString(r['NPK Leader'] || r['Leader NPK']) === safeString(empNpk) || String(r['Leader'] || '').toLowerCase().includes(empNama.toLowerCase());
          const peran = isLeader 
            ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">Circle Leader</span>`
            : `<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">Anggota</span>`;
          const status = r['Status'] || r['Tahapan PDCA'] || 'Langkah 1-8 Selesai';

          return `
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="py-2.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">${noReg}</td>
              <td class="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">${namaTim}</td>
              <td class="py-2.5 px-3 text-slate-700">${tema}</td>
              <td class="py-2.5 px-3 whitespace-nowrap">${peran}</td>
              <td class="py-2.5 px-3 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">${status}</span>
              </td>
            </tr>
          `;
        }).join('');

        contentEl.innerHTML = `
          <div class="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs bg-white">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">No. Reg</th>
                  <th class="py-2.5 px-3">Nama Tim</th>
                  <th class="py-2.5 px-3">Tema Perbaikan</th>
                  <th class="py-2.5 px-3">Peran</th>
                  <th class="py-2.5 px-3">Status PDCA</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${tableRows}
              </tbody>
            </table>
          </div>
        `;
      } else if (type === 'contract') {
        badgeEl.className = "px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300";
        badgeEl.textContent = "Master_Karyawan";
        titleEl.textContent = `Form Profil Lengkap Kepegawaian: ${empNama}`;
        subEl.textContent = `Basis data resmi karyawan terdaftar di sistem PT Astra Daihatsu Motor (NPK: ${empNpk})`;

        const unitOrg = getRowCellValue(emp, 'Name of organizational unit', SCHEMAS.Master_Karyawan) || emp.unit || emp.divisi || '-';
        const jabatan = getRowCellValue(emp, 'Job Title', SCHEMAS.Master_Karyawan) || emp.jabatan || '-';
        const cabang = getRowCellValue(emp, 'P.subarea', SCHEMAS.Master_Karyawan) || emp.cabang || '-';
        const baCode = getRowCellValue(emp, 'Business area', SCHEMAS.Master_Karyawan) || emp.kodeBA || '-';
        const contract = getRowCellValue(emp, 'Contract', SCHEMAS.Master_Karyawan) || emp.tipeKontrak || 'Tetap';
        const joinDate = formatDatabaseDate(getRowCellValue(emp, 'Date', SCHEMAS.Master_Karyawan)) || emp.joinDate || '-';
        const dob = formatDatabaseDate(getRowCellValue(emp, 'D.o.birth', SCHEMAS.Master_Karyawan)) || emp.dob || '-';
        const gender = getRowCellValue(emp, 'Gender text', SCHEMAS.Master_Karyawan) || emp.gender || '-';
        const agama = getRowCellValue(emp, 'Religious denomination', SCHEMAS.Master_Karyawan) || emp.agama || '-';
        const psGroup = getRowCellValue(emp, 'PS group', SCHEMAS.Master_Karyawan) || emp.psGroup || '-';
        const lvl = getRowCellValue(emp, 'Lvl', SCHEMAS.Master_Karyawan) || emp.lvl || '-';

        contentEl.innerHTML = `
          <div class="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="bg-white p-3 rounded-xl border border-slate-200">
                <span class="text-[10px] font-bold text-slate-400 block uppercase">NPK / Personnel No.</span>
                <span class="text-sm font-black text-slate-900 font-mono mt-0.5 block">${empNpk}</span>
              </div>
              <div class="bg-white p-3 rounded-xl border border-slate-200">
                <span class="text-[10px] font-bold text-slate-400 block uppercase">Nama Lengkap</span>
                <span class="text-sm font-black text-slate-900 mt-0.5 block">${empNama}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="bg-white p-3 rounded-xl border border-slate-200">
                <span class="text-[10px] font-bold text-slate-400 block uppercase">Status Kepegawaian</span>
                <span class="text-xs font-black text-blue-700 mt-0.5 block">${contract}</span>
              </div>
              <div class="bg-white p-3 rounded-xl border border-slate-200">
                <span class="text-[10px] font-bold text-slate-400 block uppercase">Jabatan / Job Title</span>
                <span class="text-xs font-extrabold text-slate-800 mt-0.5 block">${jabatan}</span>
              </div>
              <div class="bg-white p-3 rounded-xl border border-slate-200">
                <span class="text-[10px] font-bold text-slate-400 block uppercase">Unit Organisasi</span>
                <span class="text-xs font-extrabold text-slate-800 mt-0.5 block">${unitOrg}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="bg-white p-3 rounded-xl border border-slate-200">
                <span class="text-[10px] font-bold text-slate-400 block uppercase">Cabang / Subarea</span>
                <span class="text-xs font-bold text-slate-800 mt-0.5 block">${cabang}</span>
              </div>
              <div class="bg-white p-3 rounded-xl border border-slate-200">
                <span class="text-[10px] font-bold text-slate-400 block uppercase">Kode Business Area</span>
                <span class="text-xs font-bold text-slate-800 font-mono mt-0.5 block">${baCode}</span>
              </div>
              <div class="bg-white p-3 rounded-xl border border-slate-200">
                <span class="text-[10px] font-bold text-slate-400 block uppercase">Tanggal Masuk (Join)</span>
                <span class="text-xs font-bold text-slate-800 mt-0.5 block">${joinDate}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="bg-white p-3 rounded-xl border border-slate-200">
                <span class="text-[10px] font-bold text-slate-400 block uppercase">Tgl Lahir (D.o.b)</span>
                <span class="text-xs font-semibold text-slate-800 mt-0.5 block">${dob}</span>
              </div>
              <div class="bg-white p-3 rounded-xl border border-slate-200">
                <span class="text-[10px] font-bold text-slate-400 block uppercase">Gender</span>
                <span class="text-xs font-semibold text-slate-800 mt-0.5 block">${gender}</span>
              </div>
              <div class="bg-white p-3 rounded-xl border border-slate-200">
                <span class="text-[10px] font-bold text-slate-400 block uppercase">Agama</span>
                <span class="text-xs font-semibold text-slate-800 mt-0.5 block">${agama}</span>
              </div>
              <div class="bg-white p-3 rounded-xl border border-slate-200">
                <span class="text-[10px] font-bold text-slate-400 block uppercase">Gol / Level</span>
                <span class="text-xs font-semibold text-slate-800 mt-0.5 block">${psGroup} / ${lvl}</span>
              </div>
            </div>
          </div>
        `;
      } else if (type === 'sp') {
        badgeEl.className = "px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300";
        badgeEl.textContent = "Data_SP (Disiplin)";
        titleEl.textContent = `Riwayat Kedisiplinan Kerja: ${empNama}`;
        subEl.textContent = `Status surat peringatan dan kepatuhan tata tertib kerja (NPK: ${empNpk})`;

        const spRows = (currentDashboardPayload.rawTables?.Data_SP || []).filter(r => 
          safeString(r['NPK'] || r['Personnel no.']) === safeString(empNpk)
        );

        const hasActiveSP = spRows.some(r => r['Tingkat SP'] && r['Tingkat SP'] !== '-');

        if (!hasActiveSP) {
          contentEl.innerHTML = `
            <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
              <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl mx-auto mb-3">
                <i class="fa-solid fa-circle-check"></i>
              </div>
              <h5 class="text-sm font-extrabold text-emerald-900">CLEAR - Bebas Sanksi Disiplin</h5>
              <p class="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
                Karyawan memiliki reputasi disiplin yang sangat baik tanpa catatan sanksi (SP 1, SP 2, SP 3, atau Surat Teguran).
              </p>
            </div>
          `;
          return;
        }

        const tableRows = spRows.map((r, i) => `
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="py-2.5 px-3 font-bold text-red-600 whitespace-nowrap">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200">${r['Tingkat SP']}</span>
            </td>
            <td class="py-2.5 px-3 text-slate-800">${r['Alasan'] || 'Pelanggaran tata tertib kerja'}</td>
            <td class="py-2.5 px-3 text-slate-600 whitespace-nowrap">${r['Kode BA'] || '-'}</td>
            <td class="py-2.5 px-3 whitespace-nowrap">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Sedang Berjalan</span>
            </td>
          </tr>
        `).join('');

        contentEl.innerHTML = `
          <div class="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs bg-white">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">Tingkat Sanksi</th>
                  <th class="py-2.5 px-3">Alasan / Pelanggaran</th>
                  <th class="py-2.5 px-3">Cabang</th>
                  <th class="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${tableRows}
              </tbody>
            </table>
          </div>
        `;
      } else if (type === 'km') {
        badgeEl.className = "px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300";
        badgeEl.textContent = "Knowledge_management";
        titleEl.textContent = `Dokumen Knowledge Management: ${empNama}`;
        subEl.textContent = `Kontribusi bank pengetahuan, panduan teknis, dan inovasi kerja (NPK: ${empNpk})`;

        const kmRows = ((currentDashboardPayload.rawTables?.Knowledge_management || currentDashboardPayload.rawTables?.Data_KM) || []).filter(r => 
          safeString(r['NPK'] || r['Personnel no.']) === safeString(empNpk)
        );

        if (!kmRows.length) {
          contentEl.innerHTML = `<div class="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">Karyawan ini belum menerbitkan artikel atau panduan di sheet Knowledge_management.</div>`;
          return;
        }

        const tableRows = kmRows.map((r, i) => {
          const judul = r['JUDUL'] || r['Judul'] || 'Panduan Knowledge Management';
          const tgl = formatDatabaseDate(r['TANGGAL'] || r['Tanggal']) || r['TANGGAL'] || r['Tanggal'] || '-';
          const time = r['TIME'] || r['Time'] || '-';

          return `
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="py-2.5 px-3 font-semibold text-slate-900">${judul}</td>
              <td class="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">${tgl}</td>
              <td class="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">${time}</td>
              <td class="py-2.5 px-3 whitespace-nowrap">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 inline-flex items-center gap-1">
                  <i class="fa-solid fa-circle-check text-[9px]"></i> Terverifikasi
                </span>
              </td>
            </tr>
          `;
        }).join('');

        contentEl.innerHTML = `
          <div class="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs bg-white">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">Judul Pengetahuan / Materi</th>
                  <th class="py-2.5 px-3">Tanggal Terbit</th>
                  <th class="py-2.5 px-3">Waktu (Time)</th>
                  <th class="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${tableRows}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    function openQCCRisalahModal(rowIndex, fallbackKey = '') {
      if (!currentDashboardPayload || !currentDashboardPayload.rawTables) return;
      const rawRows = currentDashboardPayload.rawTables.Data_QCC || [];
      let row = rawRows[rowIndex];
      if (!row && fallbackKey) {
        row = rawRows.find(r => 
          String(r['No.Registrasi'] || '').trim().toLowerCase() === String(fallbackKey).trim().toLowerCase() ||
          String(r['Nama Tim'] || '').trim().toLowerCase() === String(fallbackKey).trim().toLowerCase()
        );
      }
      if (!row) {
        showToast("Data risalah QCC tidak ditemukan.");
        return;
      }

      // 1. Identitas Circle
      const teamName = getRowCellValue(row, 'Nama Tim', SCHEMAS.Data_QCC) || row['Nama Tim'] || 'Tim Circle QCC';
      document.getElementById('qcc-modal-team-name').textContent = teamName;
      document.getElementById('qcc-modal-category').textContent = getRowCellValue(row, 'Kategori', SCHEMAS.Data_QCC) || row['Kategori'] || 'QCC';
      const thnKonvensi = getRowCellValue(row, 'Tahun Konvensi', SCHEMAS.Data_QCC) || row['Tahun Konvensi'] || '';
      document.getElementById('qcc-modal-year').textContent = thnKonvensi ? `Tahun Konvensi: ${thnKonvensi}` : 'Tahun Konvensi: -';
      
      const cab = getRowCellValue(row, 'Cabang/Departemen', SCHEMAS.Data_QCC) || row['Cabang/Departemen'] || row['Cabang'] || '-';
      const ba = getRowCellValue(row, 'Kode BA', SCHEMAS.Data_QCC) || row['Kode BA'] || '-';
      const sec = getRowCellValue(row, 'Bagian', SCHEMAS.Data_QCC) || row['Bagian'] || '-';
      const reg = getRowCellValue(row, 'No.Registrasi', SCHEMAS.Data_QCC) || row['No.Registrasi'] || '-';
      document.getElementById('qcc-modal-meta').textContent = `No. Reg: ${reg} • Cabang: ${cab} • Kode BA: ${ba} • Seksi/Bagian: ${sec}`;
      document.getElementById('qcc-modal-reg-no').textContent = `Reg: ${reg}`;

      // Status Badge
      const statusVal = getRowCellValue(row, 'Status', SCHEMAS.Data_QCC) || row['Status'] || 'Progress';
      const statusBadge = document.getElementById('qcc-modal-status-badge');
      if (statusBadge) {
        statusBadge.textContent = `Status: ${statusVal}`;
        const sNorm = String(statusVal).toLowerCase();
        if (sNorm.includes('finish') || sNorm.includes('selesai')) {
          statusBadge.className = 'px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold';
        } else if (sNorm.includes('progress') || sNorm.includes('proses')) {
          statusBadge.className = 'px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-[10px] font-bold';
        } else {
          statusBadge.className = 'px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-full text-[10px] font-bold';
        }
      }
      if (document.getElementById('qcc-modal-pdca-status-pill')) {
        document.getElementById('qcc-modal-pdca-status-pill').textContent = `Status: ${statusVal}`;
      }

      // 2. Tema Kaizen
      document.getElementById('qcc-modal-theme').textContent = getRowCellValue(row, 'Tema', SCHEMAS.Data_QCC) || row['Tema'] || 'Belum ada deskripsi tema perbaikan.';

      // 3. Personalia Circle
      document.getElementById('qcc-modal-facilitator').textContent = getRowCellValue(row, 'Fasilitator', SCHEMAS.Data_QCC) || row['Fasilitator'] || '-';
      document.getElementById('qcc-modal-leader').textContent = getRowCellValue(row, 'Leader', SCHEMAS.Data_QCC) || row['Leader'] || '-';
      document.getElementById('qcc-modal-astrapay').textContent = `AstraPay: ${getRowCellValue(row, 'No.Akun Astrapay QC Leader', SCHEMAS.Data_QCC) || row['No.Akun Astrapay QC Leader'] || '-'}`;

      // Anggota 1 s/d 7
      const membersContainer = document.getElementById('qcc-modal-members-list');
      if (membersContainer) {
        const members = [];
        for (let i = 1; i <= 7; i++) {
          const m = getRowCellValue(row, `Anggota ${i}`, SCHEMAS.Data_QCC) || row[`Anggota ${i}`];
          if (m && String(m).trim() && String(m).trim() !== '-') {
            members.push({ num: i, name: String(m).trim() });
          }
        }
        if (members.length > 0) {
          membersContainer.innerHTML = members.map(m => `
            <div class="bg-white px-2 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 truncate shadow-2xs">
              <span class="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                ${m.num}
              </span>
              <span class="text-[10px] font-bold text-slate-700 truncate" title="${m.name}">${m.name}</span>
            </div>
          `).join('');
        } else {
          membersContainer.innerHTML = `<span class="text-[10px] text-slate-400 italic col-span-full">Tidak ada daftar anggota tambahan.</span>`;
        }
      }

      // 4. Rekap 8 Langkah PDCA Status
      const l13Val = row['Langkah 1-3'] || 'Selesai';
      const l15Val = row['Langkah 1-5'] || 'Sedang Berjalan';
      const l18Val = row['Kelengkapan Risalah Langkah 1-8'] || 'Format Baku ADM';
      if (document.getElementById('qcc-modal-l13-status')) document.getElementById('qcc-modal-l13-status').textContent = l13Val;
      if (document.getElementById('qcc-modal-do-status')) document.getElementById('qcc-modal-do-status').textContent = String(statusPDCA).toLowerCase() === 'plan' ? 'Antrean' : 'Dilaksanakan';
      if (document.getElementById('qcc-modal-l15-status')) document.getElementById('qcc-modal-l15-status').textContent = l15Val;
      if (document.getElementById('qcc-modal-l18-status')) document.getElementById('qcc-modal-l18-status').textContent = l18Val;

      // 5. Administrasi Berkas Risalah
      document.getElementById('qcc-modal-doc-status').textContent = row['Kelengkapan Risalah Langkah 1-8'] || 'Lengkap';
      document.getElementById('qcc-modal-date-reg').textContent = row['Pendaftaran diterima'] || '-';
      document.getElementById('qcc-modal-date-risalah').textContent = row['L 1-8 diterima'] || '-';
      document.getElementById('qcc-modal-reward-status').textContent = row['Status Reward'] || '-';
      document.getElementById('qcc-modal-no-ba').textContent = row['No.Berita Acara'] || '-';
      document.getElementById('qcc-modal-no-bph').textContent = row['No.BPH'] || '-';

      // Tampilkan modal
      const modal = document.getElementById('modal-qcc-risalah');
      if (modal) modal.classList.remove('hidden');
    }

    function openSSDetailModal(rowIndex, fallbackKey = '') {
      if (!currentDashboardPayload || !currentDashboardPayload.rawTables) return;
      const rawRows = currentDashboardPayload.rawTables.Data_SS || [];
      let row = rawRows[rowIndex];
      if (!row && fallbackKey) {
        row = rawRows.find(r => 
          String(getRowCellValue(r, 'Registrasi', SCHEMAS.Data_SS) || r['Registrasi'] || '').trim().toLowerCase() === String(fallbackKey).trim().toLowerCase() ||
          String(getRowCellValue(r, 'NPK', SCHEMAS.Data_SS) || r['NPK'] || '').trim().toLowerCase() === String(fallbackKey).trim().toLowerCase() ||
          String(getRowCellValue(r, 'Nama', SCHEMAS.Data_SS) || r['Nama'] || '').trim().toLowerCase() === String(fallbackKey).trim().toLowerCase()
        );
      }
      if (!row) {
        showToast("Data usulan SS tidak ditemukan.");
        return;
      }

      // 1. Identitas Inovator
      const empName = getRowCellValue(row, 'Nama', SCHEMAS.Data_SS) || row['Nama'] || 'Karyawan Inovator';
      const npkVal = getRowCellValue(row, 'NPK', SCHEMAS.Data_SS) || row['NPK'] || '-';
      document.getElementById('ss-modal-emp-name').textContent = empName;
      document.getElementById('ss-modal-emp-fullname').textContent = empName;
      document.getElementById('ss-modal-emp-npk').textContent = `NPK: ${npkVal}`;
      document.getElementById('ss-modal-category').textContent = getRowCellValue(row, 'Kategori', SCHEMAS.Data_SS) || row['Kategori'] || 'Suggestion System';
      document.getElementById('ss-modal-period').textContent = `Bulan: ${getRowCellValue(row, 'Diterima Bulan', SCHEMAS.Data_SS) || row['Diterima Bulan'] || '-'}`;

      const cab = getRowCellValue(row, 'Cabang', SCHEMAS.Data_SS) || row['Cabang'] || '-';
      const ba = getRowCellValue(row, 'Kode BA', SCHEMAS.Data_SS) || row['Kode BA'] || '-';
      const sec = getRowCellValue(row, 'Bagian', SCHEMAS.Data_SS) || row['Bagian'] || '-';
      const reg = getRowCellValue(row, 'Registrasi', SCHEMAS.Data_SS) || row['Registrasi'] || '-';
      document.getElementById('ss-modal-meta').textContent = `NPK: ${npkVal} • Cabang: ${cab} • Kode BA: ${ba} • Bagian: ${sec}`;
      document.getElementById('ss-modal-reg-no').textContent = `Reg: ${reg}`;

      // Status Badge
      const statusReward = getRowCellValue(row, 'Status Reward', SCHEMAS.Data_SS) || row['Status Reward'] || 'Proses Penilaian';
      const meta = getSSRewardStatusMeta(statusReward);
      const statusBadge = document.getElementById('ss-modal-status-badge');
      if (statusBadge) {
        statusBadge.textContent = `Status: ${statusReward}`;
        statusBadge.className = `px-2.5 py-1 ${meta.badgeBg} rounded-full text-[10px] font-bold inline-flex items-center gap-1`;
      }

      // 2. Tema & Keterangan
      document.getElementById('ss-modal-theme').textContent = getRowCellValue(row, 'Tema', SCHEMAS.Data_SS) || row['Tema'] || 'Belum ada deskripsi tema inovasi.';
      const descVal = getRowCellValue(row, 'Keterangan', SCHEMAS.Data_SS) || row['Keterangan'] || '-';
      document.getElementById('ss-modal-desc').textContent = descVal;

      // 3. Fasilitator
      document.getElementById('ss-modal-facilitator').textContent = getRowCellValue(row, 'Fasilitator', SCHEMAS.Data_SS) || row['Fasilitator'] || '-';
      document.getElementById('ss-modal-facilitator-npk').textContent = `NPK: ${getRowCellValue(row, 'NPK Fasilitator', SCHEMAS.Data_SS) || row['NPK Fasilitator'] || '-'}`;

      // 4. Reward & AstraPay
      let rew = getRowCellValue(row, 'Reward', SCHEMAS.Data_SS) || row['Reward'] || '-';
      if (/^\d+$/.test(String(rew).trim())) {
        rew = 'Rp ' + Number(rew).toLocaleString('id-ID');
      }
      document.getElementById('ss-modal-reward-val').textContent = rew;
      document.getElementById('ss-modal-reward-status').textContent = statusReward;
      document.getElementById('ss-modal-astrapay-no').textContent = getRowCellValue(row, 'No.Akun AstraPay', SCHEMAS.Data_SS) || row['No.Akun AstraPay'] || '-';
      document.getElementById('ss-modal-astrapay-name').textContent = getRowCellValue(row, 'Nama Akun', SCHEMAS.Data_SS) || row['Nama Akun'] || '-';
      document.getElementById('ss-modal-distribusi').textContent = getRowCellValue(row, 'Distribusi Reward', SCHEMAS.Data_SS) || row['Distribusi Reward'] || 'Penyaluran via Akun AstraPay Pengusul';

      // 5. Administrasi
      document.getElementById('ss-modal-no-ba').textContent = getRowCellValue(row, 'No.Berita Acara', SCHEMAS.Data_SS) || row['No.Berita Acara'] || '-';
      document.getElementById('ss-modal-no-bph').textContent = getRowCellValue(row, 'No.BPH', SCHEMAS.Data_SS) || row['No.BPH'] || '-';

      // Buka modal
      const modal = document.getElementById('modal-ss-detail');
      if (modal) modal.classList.remove('hidden');
    }

    function openUploadModal(sheetName) {
      if (!isUserAdmin(loggedInUser)) {
        showToast("Akses ditolak: Hanya Administrator HR yang dapat mengunggah berkas.");
        return;
      }
      let target = sheetName;
      if (target === 'Data_KM') target = 'Knowledge_management';
      if (target) {
        const sel = document.getElementById('upload-target-sheet');
        if (sel) sel.value = target;
      }
      
      const fileInput = document.getElementById('excel-file-input');
      if (fileInput) fileInput.value = '';
      
      const statusBox = document.getElementById('upload-status-box');
      if (statusBox) {
        statusBox.className = "hidden text-[11px] p-2.5 rounded-xl";
        statusBox.textContent = '';
      }

      const btn = document.getElementById('btn-submit-upload');
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Proses & Simpan";
      }

      document.getElementById('modal-upload').classList.remove('hidden');
    }

    function closeModal(id) {
      document.getElementById(id).classList.add('hidden');
    }
    // ========================================================
    // KNOWLEDGE MANAGEMENT (KM) AUTOMATION & MANUAL INPUT
    // ========================================================
    function toggleKMGuide(forceState) {
      const banner = document.getElementById('km-guide-banner');
      const btnText = document.getElementById('btn-text-km-guide');
      if (!banner) return;

      const shouldShow = typeof forceState === 'boolean' 
        ? forceState 
        : banner.classList.contains('hidden');

      if (shouldShow) {
        banner.classList.remove('hidden');
        if (btnText) btnText.textContent = 'Tutup Panduan';
        banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        banner.classList.add('hidden');
        if (btnText) btnText.textContent = 'Panduan & Skrip';
      }
    }
    window.toggleKMGuide = toggleKMGuide;

    // Skrip PowerShell Rekap KM yang telah di-encode Base64 (UTF-16LE) bebas dari konflik parser CMD
    const KM_REKAP_PS_BASE64 = "WwBDAG8AbgBzAG8AbABlAF0AOgA6AE8AdQB0AHAAdQB0AEUAbgBjAG8AZABpAG4AZwAgAD0AIABbAFMAeQBzAHQAZQBtAC4AVABlAHgAdAAuAEUAbgBjAG8AZABpAG4AZwBdADoAOgBVAFQARgA4AAoAQQBkAGQALQBUAHkAcABlACAALQBBAHMAcwBlAG0AYgBsAHkATgBhAG0AZQAgAFMAeQBzAHQAZQBtAC4ASQBPAC4AQwBvAG0AcAByAGUAcwBzAGkAbwBuAC4ARgBpAGwAZQBTAHkAcwB0AGUAbQAKAAoAJABmAGkAbABlAHMAIAA9ACAARwBlAHQALQBDAGgAaQBsAGQASQB0AGUAbQAgAC0AUABhAHQAaAAgAC4AIAAtAFIAZQBjAHUAcgBzAGUAIAAtAEYAaQBsAGUAIAB8ACAAVwBoAGUAcgBlAC0ATwBiAGoAZQBjAHQAIAB7ACAACgAgACAAIAAgACQAXwAuAEUAeAB0AGUAbgBzAGkAbwBuACAALQBtAGEAdABjAGgAIAAnACgAPwBpACkAXAAuACgAcABkAGYAfABwAHAAdAB8AHAAcAB0AHgAfABwAHAAcwB8AHAAcABzAHgAKQAkACcAIAAtAGEAbgBkACAACgAgACAAIAAgACQAXwAuAE4AYQBtAGUAIAAtAG4AbwB0AG0AYQB0AGMAaAAgACcAXgB+AFwAJAAnACAALQBhAG4AZAAgAAoAIAAgACAAIAAkAF8ALgBOAGEAbQBlACAALQBuAGUAIAAnAFIAZQBrAGEAcABfAEsATQBfAFMAaQBhAHAAXwBVAHAAbABvAGEAZAAuAGMAcwB2ACcAIAAKAH0ACgAKAFcAcgBpAHQAZQAtAEgAbwBzAHQAIAAoACcARABpAHQAZQBtAHUAawBhAG4AIAB0AG8AdABhAGwAIAAnACAAKwAgACQAZgBpAGwAZQBzAC4AQwBvAHUAbgB0ACAAKwAgACcAIABiAGUAcgBrAGEAcwAgAHAAcgBlAHMAZQBuAHQAYQBzAGkALgAnACkAIAAtAEYAbwByAGUAZwByAG8AdQBuAGQAQwBvAGwAbwByACAAQwB5AGEAbgAKAFcAcgBpAHQAZQAtAEgAbwBzAHQAIAAnAE0AZQBtAHUAbABhAGkAIABlAGsAcwB0AHIAYQBrAHMAaQAgAGQAYQB0AGEAIABOAFAASwAsACAASgB1AGQAdQBsACwAIABUAGEAbgBnAGcAYQBsACwAIABkAGEAbgAgAFcAYQBrAHQAdQAuAC4ALgAnACAALQBGAG8AcgBlAGcAcgBvAHUAbgBkAEMAbwBsAG8AcgAgAEMAeQBhAG4ACgAKACQAcgBlAHMAIAA9ACAAQAAoACkACgAkAGkAIAA9ACAAMAAKAAoAZgBvAHIAZQBhAGMAaAAgACgAJABmACAAaQBuACAAJABmAGkAbABlAHMAKQAgAHsACgAgACAAIAAgACQAaQArACsACgAgACAAIAAgAGkAZgAgACgAJABpACAAJQAgADIANQAgAC0AZQBxACAAMAAgAC0AbwByACAAJABpACAALQBlAHEAIAAkAGYAaQBsAGUAcwAuAEMAbwB1AG4AdAApACAAewAKACAAIAAgACAAIAAgACAAIABXAHIAaQB0AGUALQBIAG8AcwB0ACAAKAAnAE0AZQBtAHAAcgBvAHMAZQBzACAAYgBlAHIAawBhAHMAIABbACcAIAArACAAJABpACAAKwAgACcALwAnACAAKwAgACQAZgBpAGwAZQBzAC4AQwBvAHUAbgB0ACAAKwAgACcAXQAuAC4ALgAnACkAIAAtAEYAbwByAGUAZwByAG8AdQBuAGQAQwBvAGwAbwByACAAWQBlAGwAbABvAHcACgAgACAAIAAgAH0ACgAKACAAIAAgACAAJABuAHAAawAgAD0AIAAnACcACgAgACAAIAAgAGkAZgAgACgAJABmAC4AQgBhAHMAZQBOAGEAbQBlACAALQBtAGEAdABjAGgAIAAnACgAXABkAHsANAAsADYAfQApACcAKQAgAHsACgAgACAAIAAgACAAIAAgACAAJABuAHAAawAgAD0AIAAkAG0AYQB0AGMAaABlAHMAWwAxAF0ACgAgACAAIAAgAH0ACgAKACAAIAAgACAAaQBmACAAKAAtAG4AbwB0ACAAJABuAHAAawAgAC0AYQBuAGQAIAAoACQAZgAuAEUAeAB0AGUAbgBzAGkAbwBuACAALQBtAGEAdABjAGgAIAAnACgAPwBpACkAXgBcAC4AKABwAHAAdAB4AHwAcABwAHMAeAApACQAJwApACkAIAB7AAoAIAAgACAAIAAgACAAIAAgAHQAcgB5ACAAewAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACQAegBpAHAAIAA9ACAAWwBTAHkAcwB0AGUAbQAuAEkATwAuAEMAbwBtAHAAcgBlAHMAcwBpAG8AbgAuAFoAaQBwAEYAaQBsAGUAXQA6ADoATwBwAGUAbgBSAGUAYQBkACgAJABmAC4ARgB1AGwAbABOAGEAbQBlACkACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAkAGUAbgB0AHIAeQAgAD0AIAAkAHoAaQBwAC4ARwBlAHQARQBuAHQAcgB5ACgAJwBwAHAAdAAvAHMAbABpAGQAZQBzAC8AcwBsAGkAZABlADEALgB4AG0AbAAnACkACgAgACAAIAAgACAAIAAgACAAIAAgACAAIABpAGYAIAAoACQAZQBuAHQAcgB5ACkAIAB7AAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAkAHMAcgAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBJAE8ALgBTAHQAcgBlAGEAbQBSAGUAYQBkAGUAcgAoACQAZQBuAHQAcgB5AC4ATwBwAGUAbgAoACkAKQAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJAB4AG0AbAAgAD0AIAAkAHMAcgAuAFIAZQBhAGQAVABvAEUAbgBkACgAKQAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJABzAHIALgBDAGwAbwBzAGUAKAApAAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIABpAGYAIAAoACQAeABtAGwAIAAtAG0AYQB0AGMAaAAgACcAKAA/AGkAKQBuAHAAawBbAFwAcwAuADoALQBdACoAKABcAGQAewA0ACwANgB9ACkAJwApACAAewAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAkAG4AcABrACAAPQAgACQAbQBhAHQAYwBoAGUAcwBbADEAXQAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAfQAgAGUAbABzAGUAaQBmACAAKAAkAHgAbQBsACAALQBtAGEAdABjAGgAIAAnACgAPwBpACkAKAA/ADoAbgBpAGsAfABwAGUAZwBhAHcAYQBpAHwAawBhAHIAeQBhAHcAYQBuACkAWwBcAHMALgA6AC0AXQAqACgAXABkAHsANAAsADYAfQApACcAKQAgAHsACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJABuAHAAawAgAD0AIAAkAG0AYQB0AGMAaABlAHMAWwAxAF0ACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAH0ACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAB9AAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJAB6AGkAcAAuAEQAaQBzAHAAbwBzAGUAKAApAAoAIAAgACAAIAAgACAAIAAgAH0AIABjAGEAdABjAGgAIAB7AH0ACgAgACAAIAAgAH0ACgAKACAAIAAgACAAaQBmACAAKAAtAG4AbwB0ACAAJABuAHAAawAgAC0AYQBuAGQAIAAoACQAZgAuAEUAeAB0AGUAbgBzAGkAbwBuACAALQBtAGEAdABjAGgAIAAnACgAPwBpACkAXgBcAC4AcABkAGYAJAAnACkAKQAgAHsACgAgACAAIAAgACAAIAAgACAAdAByAHkAIAB7AAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJAByAGEAdwAgAD0AIABbAFMAeQBzAHQAZQBtAC4ASQBPAC4ARgBpAGwAZQBdADoAOgBSAGUAYQBkAEEAbABsAFQAZQB4AHQAKAAkAGYALgBGAHUAbABsAE4AYQBtAGUAKQAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgAGkAZgAgACgAJAByAGEAdwAgAC0AbQBhAHQAYwBoACAAJwAoAD8AaQApAG4AcABrAFsAXABzAC4AOgAtAF0AKgAoAFwAZAB7ADQALAA2AH0AKQAnACkAIAB7AAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAkAG4AcABrACAAPQAgACQAbQBhAHQAYwBoAGUAcwBbADEAXQAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgAH0AIABlAGwAcwBlAGkAZgAgACgAJAByAGEAdwAgAC0AbQBhAHQAYwBoACAAJwAoAD8AaQApACgAPwA6AG4AaQBrAHwAcABlAGcAYQB3AGEAaQB8AGsAYQByAHkAYQB3AGEAbgApAFsAXABzAC4AOgAtAF0AKgAoAFwAZAB7ADQALAA2AH0AKQAnACkAIAB7AAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAkAG4AcABrACAAPQAgACQAbQBhAHQAYwBoAGUAcwBbADEAXQAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgAH0ACgAgACAAIAAgACAAIAAgACAAfQAgAGMAYQB0AGMAaAAgAHsAfQAKACAAIAAgACAAfQAKAAoAIAAgACAAIAAkAGoAdQBkAHUAbAAgAD0AIAAkAGYALgBCAGEAcwBlAE4AYQBtAGUACgAgACAAIAAgAGkAZgAgACgAJABuAHAAawApACAAewAKACAAIAAgACAAIAAgACAAIAAkAGoAdQBkAHUAbAAgAD0AIAAoACQAagB1AGQAdQBsACAALQByAGUAcABsAGEAYwBlACAAJABuAHAAawAsACAAJwAnACkALgBSAGUAcABsAGEAYwBlACgAJwBfACcALAAgACcAIAAnACkALgBUAHIAaQBtACgAKQAKACAAIAAgACAAIAAgACAAIAAkAGoAdQBkAHUAbAAgAD0AIAAoACQAagB1AGQAdQBsACAALQByAGUAcABsAGEAYwBlACAAJwBeAFsAXABzAC0AXwA6AF0AKwAnACwAIAAnACcAKQAuAFQAcgBpAG0AKAApAAoAIAAgACAAIAB9AAoAIAAgACAAIABpAGYAIAAoAC0AbgBvAHQAIAAkAGoAdQBkAHUAbAApACAAewAKACAAIAAgACAAIAAgACAAIAAkAGoAdQBkAHUAbAAgAD0AIAAkAGYALgBCAGEAcwBlAE4AYQBtAGUACgAgACAAIAAgAH0ACgAKACAAIAAgACAAJAByAGUAcwAgACsAPQAgAFsAUABTAEMAdQBzAHQAbwBtAE8AYgBqAGUAYwB0AF0AQAB7AAoAIAAgACAAIAAgACAAIAAgAE4AUABLACAAPQAgACQAbgBwAGsACgAgACAAIAAgACAAIAAgACAATgBBAE0AQQAgAD0AIAAnACcACgAgACAAIAAgACAAIAAgACAASgBVAEQAVQBMACAAPQAgACQAagB1AGQAdQBsAAoAIAAgACAAIAAgACAAIAAgAFQAQQBOAEcARwBBAEwAIAA9ACAAJABmAC4ATABhAHMAdABXAHIAaQB0AGUAVABpAG0AZQAuAFQAbwBTAHQAcgBpAG4AZwAoACcAeQB5AHkAeQAtAE0ATQAtAGQAZAAnACkACgAgACAAIAAgACAAIAAgACAAVABJAE0ARQAgAD0AIAAkAGYALgBMAGEAcwB0AFcAcgBpAHQAZQBUAGkAbQBlAC4AVABvAFMAdAByAGkAbgBnACgAJwBIAEgAOgBtAG0AOgBzAHMAJwApAAoAIAAgACAAIAB9AAoAfQAKAAoAaQBmACAAKAAkAHIAZQBzAC4AQwBvAHUAbgB0ACAALQBnAHQAIAAwACkAIAB7AAoAIAAgACAAIAAkAHIAZQBzACAAfAAgAEUAeABwAG8AcgB0AC0AQwBzAHYAIAAtAFAAYQB0AGgAIAAnAFIAZQBrAGEAcABfAEsATQBfAFMAaQBhAHAAXwBVAHAAbABvAGEAZAAuAGMAcwB2ACcAIAAtAE4AbwBUAHkAcABlAEkAbgBmAG8AcgBtAGEAdABpAG8AbgAgAC0ARQBuAGMAbwBkAGkAbgBnACAAVQBUAEYAOAAKACAAIAAgACAAVwByAGkAdABlAC0ASABvAHMAdAAgACcAPQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9ACcAIAAtAEYAbwByAGUAZwByAG8AdQBuAGQAQwBvAGwAbwByACAARwByAGUAZQBuAAoAIAAgACAAIABXAHIAaQB0AGUALQBIAG8AcwB0ACAAKAAnAEIARQBSAEgAQQBTAEkATAAhACAAUgBlAGsAYQBwACAAJwAgACsAIAAkAHIAZQBzAC4AQwBvAHUAbgB0ACAAKwAgACcAIABiAGUAcgBrAGEAcwAgAHQAZQByAHMAaQBtAHAAYQBuACAAZABpADoAIABSAGUAawBhAHAAXwBLAE0AXwBTAGkAYQBwAF8AVQBwAGwAbwBhAGQALgBjAHMAdgAnACkAIAAtAEYAbwByAGUAZwByAG8AdQBuAGQAQwBvAGwAbwByACAARwByAGUAZQBuAAoAIAAgACAAIABXAHIAaQB0AGUALQBIAG8AcwB0ACAAJwBTAGkAbABhAGsAYQBuACAAdQBwAGwAbwBhAGQAIABmAGkAbABlACAAQwBTAFYAIABpAG4AaQAgAGsAZQAgAEQALQBQAEUAUgBGAE8AUgBNAC4AJwAgAC0ARgBvAHIAZQBnAHIAbwB1AG4AZABDAG8AbABvAHIAIABHAHIAZQBlAG4ACgAgACAAIAAgAFcAcgBpAHQAZQAtAEgAbwBzAHQAIAAnAD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQAnACAALQBGAG8AcgBlAGcAcgBvAHUAbgBkAEMAbwBsAG8AcgAgAEcAcgBlAGUAbgAKAH0AIABlAGwAcwBlACAAewAKACAAIAAgACAAVwByAGkAdABlAC0ASABvAHMAdAAgACcAVABpAGQAYQBrACAAZABpAHQAZQBtAHUAawBhAG4AIABiAGUAcgBrAGEAcwAgAFAARABGACAAYQB0AGEAdQAgAFAAUABUACAAZABpACAAZgBvAGwAZABlAHIAIABpAG4AaQAuACcAIAAtAEYAbwByAGUAZwByAG8AdQBuAGQAQwBvAGwAbwByACAAUgBlAGQACgB9AAoA";

    function downloadKMScript() {
      const batContent = `@echo off
chcp 65001 >nul
title D-PERFORM - Rekap Knowledge Management Otomatis
echo ========================================================
echo  D-PERFORM - GENERATOR REKAP KNOWLEDGE MANAGEMENT DSO
echo ========================================================
echo Sedang memindai seluruh berkas presentasi (termasuk subfolder)...
powershell.exe -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${KM_REKAP_PS_BASE64}
echo ========================================================
echo Selesai. Silakan upload Rekap_KM_Siap_Upload.csv ke D-PERFORM.
pause
`;

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
        timeInput.value = `${hh}:${mm}`;
      }

      // Isi datalist karyawan dari Master Karyawan
      const dl = document.getElementById('km-employee-datalist');
      if (dl) {
        const empList = (window.masterFullPayload?.employeeList || currentDashboardPayload?.employeeList || []);
        dl.innerHTML = empList
          .filter(e => String(e.statusKaryawan || e.Status_Karyawan || 'Aktif').toLowerCase() === 'aktif')
          .map(e => `<option value="${safeString(e.npk || e['Personnel no.'])}">${e.nama || e['Last name']} (${e.cabang || e['P.subarea'] || 'DSO'})</option>`)
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
      if (/^\d{4}-\d{2}-\d{2}$/.test(tglVal)) {
        const [y, m, d] = tglVal.split('-');
        formattedDate = `${d}/${m}/${y}`;
      }

      let formattedTime = timeVal || '09:00';
      if (/^\d{1,2}:\d{2}$/.test(formattedTime)) {
        formattedTime = `${formattedTime}:00`;
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
