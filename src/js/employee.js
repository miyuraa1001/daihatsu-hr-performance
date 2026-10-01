
    function capitalizeFirst(str) {
      if (!str) return '';
      return String(str).charAt(0).toUpperCase() + String(str).slice(1).toLowerCase();
    }
/**
 * D-PERFORM - Employee & Module Views
 * Master Karyawan, Presensi, SS, QCC, SP, dan KM Tables
 */

    function findDOBirth(e) {
      if (e) {
        const candidates = [
          'D.o.birth', 'd.o.birth', 'DOB', 'dob', 'D.O.Birth',
          'tglLahir', 'tgl_lahir', 'tanggalLahir', 'tanggal_lahir',
          'birthDate', 'birth_date', 'dateOfBirth', 'date_of_birth'
        ];
        for (const k of candidates) {
          if (e[k] !== undefined && e[k] !== null) {
            const val = String(e[k]).trim();
            if (val !== '') {
              return formatDatabaseDate(e[k]);
            }
          }
        }
        for (const k of Object.keys(e)) {
          const norm = k.toLowerCase().replace(/[\s\-_]+/g, '');
          if (norm === 'dobirth' || norm === 'dob' || norm === 'tgllahir' || norm === 'tanggallahir' || norm === 'birthdate' || norm === 'dateofbirth') {
            const val = String(e[k] || '').trim();
            if (val !== '') {
              return formatDatabaseDate(e[k]);
            }
          }
        }
      }
      return "";
    }

    function findPSGroup(e) {
      if (e) {
        const candidates = ['PS group', 'ps group', 'PS Group', 'psGroup', 'ps_group', 'PS_group', 'PSGROUP', 'golongan', 'pangkat', 'group'];
        for (const k of candidates) {
          if (e[k] !== undefined && e[k] !== null) {
            const val = String(e[k]).trim();
            if (val !== '') return val;
          }
        }
        for (const k of Object.keys(e)) {
          const norm = k.toLowerCase().replace(/[\s\-_]+/g, '');
          if (norm === 'psgroup' || norm === 'golongan' || norm === 'ps' || norm === 'pangkat') {
            const val = String(e[k] || '').trim();
            if (val !== '') return val;
          }
        }
      }
      return "";
    }

    function findLvl(e) {
      if (e) {
        const candidates = ['Lvl', 'lvl', 'Level', 'level'];
        for (const k of candidates) {
          if (e[k] !== undefined && e[k] !== null) {
            const val = String(e[k]).trim();
            if (val !== '') return val;
          }
        }
        for (const k of Object.keys(e)) {
          const norm = k.toLowerCase().replace(/[\s\-_]+/g, '');
          if (norm === 'lvl' || norm === 'level') {
            const val = String(e[k] || '').trim();
            if (val !== '') return val;
          }
        }
      }
      return "";
    }

    function findDate(e) {
      if (e) {
        const candidates = ['Date', 'date', 'Tanggal', 'tanggal', 'joinDate', 'join_date', 'tglMasuk', 'tgl_masuk', 'effectiveDate', 'effective_date', 'tgl'];
        for (const k of candidates) {
          if (e[k] !== undefined && e[k] !== null) {
            const val = String(e[k]).trim();
            if (val !== '') return formatDatabaseDate(e[k]);
          }
        }
        for (const k of Object.keys(e)) {
          const norm = k.toLowerCase().replace(/[\s\-_]+/g, '');
          if (norm === 'date' || norm === 'joindate' || norm === 'tglmasuk' || norm === 'tanggal') {
            const val = String(e[k] || '').trim();
            if (val !== '') return formatDatabaseDate(e[k]);
          }
        }
      }
      return "";
    }

    function findP0001STEXT(e) {
      if (e) {
        const candidates = [
          'P0001-STEXT', 'p0001-stext', 'P0001 - STEXT', 'P0001_STEXT', 'p0001_stext',
          'P0001 STEXT', 'stext', 'STEXT', 'P0001Stext', 'p0001Stext',
          'deskripsi jabatan', 'deskripsi_jabatan', 'struktur'
        ];
        for (const k of candidates) {
          if (e[k] !== undefined && e[k] !== null) {
            const val = String(e[k]).trim();
            if (val !== '') return val;
          }
        }
        for (const k of Object.keys(e)) {
          const norm = k.toLowerCase().replace(/[\s\-_]+/g, '');
          if (norm === 'p0001stext' || norm === 'stext' || (norm.includes('p0001') && !norm.includes('jabatan'))) {
            const val = String(e[k] || '').trim();
            if (val !== '') return val;
          }
        }
      }
      return String(e?.['Job Title'] || e?.jabatan || '').trim();
    }

    function renderMasterKaryawanView(data) {
      if (!data) return;
      const s = data.summary || {};
      const list = data.employeeList || [];
      const rawRows = currentDashboardPayload?.rawTables?.Master_Karyawan || [];

      const isAdmin = isUserAdmin(loggedInUser);
      const activeBranchVal = document.getElementById('branch-select')?.value || 'ALL';
      const targetBranch = isAdmin ? activeBranchVal : getUserBranchCode(loggedInUser);

      let sourceList = rawRows.length > 0 ? rawRows : list;
      if (targetBranch !== 'ALL') {
        sourceList = sourceList.filter(r => matchBranch(r, targetBranch));
      }

      const totalEmployees = sourceList.length || s.totalKaryawan || 0;

      // 1. Total Karyawan Card
      if (document.getElementById('mk-card-total')) {
        document.getElementById('mk-card-total').textContent = totalEmployees;
      }
      
      let branchDesc = '';
      if (isAdmin && activeBranchVal === 'ALL') {
        branchDesc = 'Wilayah DSO Lampung (Semua Cabang)';
      } else {
        const info = resolveBranchInfo(activeBranchVal !== 'ALL' ? activeBranchVal : getUserBranchCode(loggedInUser));
        branchDesc = `Cabang ${info ? info.name : (sourceList[0]?.cabang || sourceList[0]?.['P.subarea'] || 'Aktif')}`;
      }
      if (document.getElementById('mk-card-branch-desc')) {
        document.getElementById('mk-card-branch-desc').textContent = branchDesc;
      }

      // 2. Status Kepegawaian (Contract Insight) - Berdasarkan Kolom Contract
      const contractGroupMap = {};
      STANDARD_CONTRACT_CATEGORIES.forEach(cat => {
        contractGroupMap[cat] = 0;
      });

      sourceList.forEach(r => {
        let rawVal = String(getRowCellValue(r, 'Contract', SCHEMAS.Master_Karyawan) || 'Tetap / Permanent').trim();
        let groupKey = normalizeContractCategory(rawVal);
        contractGroupMap[groupKey] = (contractGroupMap[groupKey] || 0) + 1;
      });

      const totalContract = Object.values(contractGroupMap).reduce((a, b) => a + b, 0) || totalEmployees || 1;
      const contractListEl = document.getElementById('mk-contract-group-list');

      if (contractListEl) {
        const standardCats = STANDARD_CONTRACT_CATEGORIES;
        const extraCats = Object.keys(contractGroupMap).filter(k => !standardCats.includes(k) && contractGroupMap[k] > 0);
        const allCatsToRender = [...standardCats, ...extraCats];

        contractListEl.innerHTML = allCatsToRender.map(grpName => {
          const count = contractGroupMap[grpName] || 0;
          const meta = getContractMeta(grpName);
          const pct = totalContract ? Math.round((count / totalContract) * 100) : 0;

          return `
            <div class="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-xs ${meta.cardHover} transition min-w-0 shadow-2xs">
              <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg ${meta.iconBg} flex items-center justify-center text-[10px] sm:text-xs border ${meta.iconBorder} shadow-2xs flex-shrink-0">
                <i class="${meta.icon}"></i>
              </div>
              <div class="min-w-0 flex-1 text-left">
                <div class="flex items-center justify-between gap-1 leading-tight">
                  <span class="text-[10px] sm:text-xs font-bold text-slate-800 truncate" title="${meta.displayName}">${meta.displayName}</span>
                  <span class="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black ${meta.badgeBg} border flex-shrink-0">${pct}%</span>
                </div>
                <div class="flex items-baseline gap-1 mt-0.5">
                  <span class="text-xs sm:text-sm font-black text-slate-900 leading-none">${count}</span>
                  <span class="text-[8px] sm:text-[10px] font-medium text-slate-400">Org</span>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      // 3. Distribusi Jabatan (Job Title) - Berdasarkan Kolom Job Title (Semua masuk kelompok)
      const jobMap = {};
      sourceList.forEach(r => {
        let jt = (getRowCellValue(r, 'Job Title', SCHEMAS.Master_Karyawan) || r.jabatan || '').trim();
        if (!jt || jt === '-' || jt === 'undefined') jt = 'Staff Unit';
        jobMap[jt] = (jobMap[jt] || 0) + 1;
      });

      const sortedJobs = Object.entries(jobMap).sort((a, b) => b[1] - a[1]);
      const totalJobs = Object.values(jobMap).reduce((a, b) => a + b, 0) || totalEmployees || 1;
      const jobListEl = document.getElementById('mk-jobtitle-group-list');
      const jobBadgeEl = document.getElementById('mk-jobtitle-badge-count');
      if (jobBadgeEl) {
        jobBadgeEl.innerHTML = `<i class="fa-solid fa-id-card text-[8px]"></i> ${sortedJobs.length} Kelompok Jabatan`;
      }

      if (jobListEl) {
        if (sortedJobs.length === 0) {
          jobListEl.innerHTML = `<div class="col-span-full text-center py-3 text-slate-400 text-xs">Belum ada data jabatan</div>`;
        } else {
          jobListEl.innerHTML = sortedJobs.map(([jobName, count]) => {
            const meta = getJobTitleMeta(jobName);
            const pct = totalJobs ? Math.round((count / totalJobs) * 100) : 0;
            return `
              <div class="flex flex-col justify-between p-1.5 sm:p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-xs ${meta.cardHover} transition min-w-0 shadow-2xs">
                <!-- Top row: Icon (kiri) + Persen (kanan) -->
                <div class="flex items-center justify-between w-full mb-1 sm:mb-1.5">
                  <div class="w-5 h-5 sm:w-6.5 sm:h-6.5 rounded-md ${meta.iconBg} flex items-center justify-center text-[9px] sm:text-xs border ${meta.iconBorder} shadow-2xs flex-shrink-0">
                    <i class="${meta.icon}"></i>
                  </div>
                  <span class="px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded text-[8px] sm:text-[10px] font-black ${meta.badgeBg} border flex-shrink-0">
                    ${pct}%
                  </span>
                </div>

                <!-- Middle: Nama (Title & Subtitle rapi) -->
                <div class="w-full mb-0.5 sm:mb-1 min-w-0 text-left">
                  <div class="text-[10px] sm:text-xs font-bold text-slate-800 leading-tight truncate" title="${meta.displayName}">
                    ${meta.displayName}
                  </div>
                  <div class="text-[8px] sm:text-[9px] font-medium text-slate-400 leading-tight truncate mt-0.5" title="${jobName}">
                    ${jobName}
                  </div>
                </div>

                <!-- Bottom: Angka & Satuan -->
                <div class="flex items-baseline gap-0.5 sm:gap-1 text-left">
                  <span class="text-xs sm:text-sm lg:text-base font-black text-slate-900 leading-none">${count}</span>
                  <span class="text-[8px] sm:text-[10px] font-medium text-slate-400">Org</span>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      // Backwards compatibility for old element IDs
      const countTetap = contractGroupMap['Tetap / Permanent'] || 0;
      const countPKWT = contractGroupMap['Kontrak / PKWT'] || 0;
      const pctTetap = Math.round((countTetap / totalContract) * 100);
      const pctPKWT = Math.round((countPKWT / totalContract) * 100);
      if (document.getElementById('mk-card-tetap')) document.getElementById('mk-card-tetap').textContent = countTetap;
      if (document.getElementById('mk-card-pkwt')) document.getElementById('mk-card-pkwt').textContent = countPKWT;
      if (document.getElementById('mk-card-tetap-pct')) document.getElementById('mk-card-tetap-pct').textContent = `${pctTetap}%`;
      if (document.getElementById('mk-card-pkwt-pct')) document.getElementById('mk-card-pkwt-pct').textContent = `${pctPKWT}%`;

      populateContractDropdown();
      filterMasterKaryawanTable();
    }

    // Ekstraksi opsi filter Kontrak / Status Kepegawaian dinamis dari data tabel (bersih tanpa duplikasi)
    function populateContractDropdown() {
      const select = document.getElementById('mk-filter-kontrak');
      if (!select) return;
      const rawRows = currentDashboardPayload?.rawTables?.Master_Karyawan || [];
      const currentVal = select.value || 'ALL';

      let options = `<option value="ALL">Semua Kontrak</option>`;
      STANDARD_CONTRACT_CATEGORIES.forEach(cat => {
        options += `<option value="${cat}">${cat}</option>`;
      });

      const standardNormalized = new Set(STANDARD_CONTRACT_CATEGORIES.map(c => normalizeContractCategory(c).toLowerCase()));
      const extraSet = new Set();
      rawRows.forEach(r => {
        const v = String(getRowCellValue(r, 'Contract', SCHEMAS.Master_Karyawan) || '').trim();
        if (v) {
          const norm = normalizeContractCategory(v).toLowerCase();
          if (!standardNormalized.has(norm)) {
            extraSet.add(v);
          }
        }
      });
      extraSet.forEach(v => {
        options += `<option value="${v}">${v}</option>`;
      });

      select.innerHTML = options;
      const optionsArray = Array.from(select.options).map(o => o.value);
      if (optionsArray.includes(currentVal)) {
        select.value = currentVal;
      } else {
        select.value = 'ALL';
      }
    }


    function filterMasterKaryawanTable() {
      if (!currentDashboardPayload) return;
      if (!currentDashboardPayload.rawTables) currentDashboardPayload.rawTables = {};

      const isAdmin = isUserAdmin(loggedInUser);
      const userBranchCode = getUserBranchCode(loggedInUser);
      const targetBranch = isAdmin ? (document.getElementById('branch-select')?.value || 'ALL') : userBranchCode;

      let rawRows = currentDashboardPayload.rawTables.Master_Karyawan || [];
      if (!rawRows.length && currentDashboardPayload.employeeList) {
        rawRows = currentDashboardPayload.employeeList;
      }

      const q = (document.getElementById('mk-search-input')?.value || '').toLowerCase().trim();
      const contractFilter = document.getElementById('mk-filter-kontrak')?.value || 'ALL';

      let list = rawRows;

      // 1. Role-based: Kepala Cabang (User) HANYA melihat karyawan Aktif
      if (!isAdmin) {
        list = list.filter(e => {
          const st = String(e['Status_Karyawan'] || e.statusKaryawan || 'Aktif').trim().toLowerCase();
          return st !== 'resign';
        });
      }

      // 2. Filter cabang sesuai hak akses user atau pilihan dropdown cabang admin
      if (targetBranch !== 'ALL') {
        list = list.filter(e => matchBranch(e, targetBranch));
      }

      // 3. Filter pencarian teks bebas (mencakup semua nilai kolom database)
      if (q) {
        list = list.filter((e, rowIdx) => {
          const targetIdx = rawRows.indexOf(e) !== -1 ? rawRows.indexOf(e) : rowIdx;
          return String(e['Personnel no.'] || e.npk || '').toLowerCase().includes(q) || 
            String(e['Last name'] || e.nama || '').toLowerCase().includes(q) ||
            String(e['Job Title'] || e.jabatan || '').toLowerCase().includes(q) ||
            String(e['P.subarea'] || e.cabang || '').toLowerCase().includes(q) ||
            String(e['Business area'] || e.kodeBA || '').toLowerCase().includes(q) ||
            String(e['Status_Karyawan'] || e.statusKaryawan || '').toLowerCase().includes(q) ||
            String(e['P0001-STEXT'] || findP0001STEXT(e, targetIdx) || '').toLowerCase().includes(q) ||
            String(e['PS group'] || findPSGroup(e, targetIdx) || '').toLowerCase().includes(q) ||
            String(e['Date'] || findDate(e, targetIdx) || '').toLowerCase().includes(q) ||
            String(e['D.o.birth'] || findDOBirth(e, targetIdx) || '').toLowerCase().includes(q);
        });
      }

      // 4. Filter status kepegawaian / kontrak
      if (contractFilter !== 'ALL') {
        const targetNorm = normalizeContractCategory(contractFilter).toLowerCase();
        list = list.filter(e => {
          const raw = String(e['Contract'] || 'Tetap / Permanent').trim();
          const rawNorm = normalizeContractCategory(raw).toLowerCase();
          return rawNorm === targetNorm || raw.toLowerCase() === contractFilter.toLowerCase();
        });
      }

      const isFull = columnViewMode.mk === 'FULL';
      let rawCols = isFull 
        ? SCHEMAS.Master_Karyawan.columns.slice() 
        : ["Personnel no.", "Last name", "P.subarea", "Wilayah", "Contract", "Job Title", "Name of organizational unit", "Business area", "Status_Karyawan"];

      // Jika role User (Kacab), sembunyikan kolom Tanggal_Resign & Alasan_Resign
      if (!isAdmin) {
        rawCols = rawCols.filter(c => c !== 'Tanggal_Resign' && c !== 'Alasan_Resign');
      }

      // Kolom 'No' selalu urut di paling depan antarmuka
      let cols = ["No", ...rawCols.filter(c => c !== 'No')];

      // Render Header
      renderTableHeader('mk-table-header', cols, true);

      const tbody = document.getElementById('mk-table-body');
      if (document.getElementById('mk-row-count')) {
        document.getElementById('mk-row-count').textContent = `Menampilkan ${list.length} dari ${rawRows.length} karyawan (${cols.length} kolom)`;
      }

      if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="${cols.length + 1}" class="text-center py-8 text-slate-400">Tidak ada data master karyawan yang sesuai filter.</td></tr>`;
        return;
      }

      tbody.innerHTML = list.map((row, rowIdx) => {
        const realIdx = rawRows.indexOf(row);
        const targetIdx = realIdx !== -1 ? realIdx : rowIdx;

        const cells = cols.map((col, idx) => {
          const isFirst = idx === 0;
          const stickyClass = isFirst 
            ? 'sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 font-mono font-bold text-slate-700 shadow-sm text-center w-12 min-w-[48px]' 
            : 'text-slate-600';

          if (col === 'No' || normalizeHeaderName(col) === 'no') {
            return `<td class="py-2.5 px-3 whitespace-nowrap ${stickyClass} text-slate-500 font-bold">${rowIdx + 1}</td>`;
          }

          let cellRaw = (row[col] !== undefined && row[col] !== null && String(row[col]).trim() !== '') 
            ? row[col] 
            : getRowCellValue(row, col, SCHEMAS.Master_Karyawan);

          if ((cellRaw === undefined || cellRaw === null || cellRaw === '' || cellRaw === '-') && (col === 'Status_Karyawan' || col === 'Status Karyawan' || normalizeHeaderName(col) === 'status_karyawan' || normalizeHeaderName(col) === 'status karyawan')) {
            cellRaw = row['Status_Karyawan'] || row['Status Karyawan'] || row.statusKaryawan || 'Aktif';
            row['Status_Karyawan'] = cellRaw;
          }

          const val = formatColumnCell(col, cellRaw, 'Master_Karyawan');
          return `<td class="py-2.5 px-4 whitespace-nowrap ${stickyClass}">${val}</td>`;
        }).join('');

        const actionCell = renderRowActionCell('Master_Karyawan', realIdx !== -1 ? realIdx : 0, row);
        return `<tr class="hover:bg-slate-50 transition-colors group">${cells}${actionCell}</tr>`;
      }).join('');
    }

    // ----------------------------------------------------
    // B. Data Kehadiran / Absensi (20 Kolom Presisi Termasuk Status Kehadiran)
    // ----------------------------------------------------
    function renderAbsensiView(data) {
      if (!data) return;
      filterAbsensiTable();
    }

    /**
     * Memperbarui 5 Kategori KPI Absensi Monitoring HO & HRD secara 100% sinkron dengan data presensi aktif
     */
    function updateAbsensiKPICards(rows, activeFilter = 'ALL') {
      const totalRows = rows.length;
      const uniqueEmployees = new Set(
        rows.map(r => safeString(getRowCellValue(r, 'NPK', SCHEMAS.Data_Kehadiran) || r['NPK'] || r['Personnel no.'])).filter(Boolean)
      ).size;

      let onTimeCount = 0;
      let lateCount = 0;
      let totalLateMinutes = 0;
      let lateOver30 = 0;
      let lateOver60 = 0;

      let totalWorkHours = 0;
      let validWorkHoursCount = 0;
      let under8Count = 0;

      let totalAnomali = 0;
      let needApprovalCount = 0;
      let outRadiusCount = 0;
      let noClockOutCount = 0;

      rows.forEach(r => {
        const rawTime = getRowCellValue(r, 'Time Clock In', SCHEMAS.Data_Kehadiran) || r['Time Clock In'] || r['Clock In'] || r['Time'] || r['Jam Masuk'] || '';
        const existingEstimasi = getRowCellValue(r, 'Status Kehadiran', SCHEMAS.Data_Kehadiran) || r['Status Kehadiran'] || r['Estimasi Telat (Asumsi 08.00)'] || '';
        const lateness = calculateLatenessInfo(existingEstimasi || rawTime);
        const ket = String(getRowCellValue(r, 'Keterangan', SCHEMAS.Data_Kehadiran) || r['Keterangan'] || '').toLowerCase();
        const estStr = String(existingEstimasi || '').toLowerCase();

        const isLate = lateness.isLate || ket.includes('terlambat') || ket.includes('telat') || estStr.includes('telat');
        const isOnTime = (!isLate && lateness.hasClockIn) || ket.includes('tepat') || estStr.includes('tepat');

        if (isLate) {
          lateCount++;
          const mins = lateness.diffMinutes > 0 ? lateness.diffMinutes : 15;
          totalLateMinutes += mins;
          if (mins > 60 || (lateness.lateHours && lateness.lateHours >= 1)) {
            lateOver60++;
          } else if (mins > 30) {
            lateOver30++;
          }
        } else if (isOnTime) {
          onTimeCount++;
        }

        const whRaw = getRowCellValue(r, 'Durasi Kerja (Work Hours)', SCHEMAS.Data_Kehadiran) || r['Durasi Kerja (Work Hours)'] || r['Work Hours'] || r['Durasi Kerja'];
        const wh = safeFloat(whRaw, 0);
        if (wh > 0) {
          totalWorkHours += wh;
          validWorkHoursCount++;
          if (wh < 8.0) under8Count++;
        }

        const needApp = String(getRowCellValue(r, 'Need CICO Approval', SCHEMAS.Data_Kehadiran) || r['Need CICO Approval'] || '').toUpperCase().trim() === 'YES';
        const radIn = String(getRowCellValue(r, 'In Radius Clock in', SCHEMAS.Data_Kehadiran) || r['In Radius Clock in'] || '').toUpperCase().trim() === 'NO';
        const radOut = String(getRowCellValue(r, 'In Radius Clock Out', SCHEMAS.Data_Kehadiran) || r['In Radius Clock Out'] || '').toUpperCase().trim() === 'NO';
        const clockOut = getRowCellValue(r, 'Time Clock Out', SCHEMAS.Data_Kehadiran) || r['Time Clock Out'];
        const noClockOut = lateness.hasClockIn && (!clockOut || clockOut === '-' || String(clockOut).trim() === '');

        if (needApp || radIn || radOut || noClockOut) {
          totalAnomali++;
          if (needApp) needApprovalCount++;
          if (radIn || radOut) outRadiusCount++;
          if (noClockOut) noClockOutCount++;
        }
      });

      const onTimeRate = (onTimeCount + lateCount) > 0 
        ? Math.round((onTimeCount / (onTimeCount + lateCount)) * 1000) / 10 
        : (totalRows > 0 ? 100 : 0);
      const avgLate = lateCount > 0 ? Math.round(totalLateMinutes / lateCount) : 0;
      const avgHours = validWorkHoursCount > 0 ? (totalWorkHours / validWorkHoursCount).toFixed(1) : (totalRows > 0 ? '8.0' : '0.0');

      if (document.getElementById('abs-kpi-total')) document.getElementById('abs-kpi-total').textContent = totalRows.toLocaleString('id-ID');
      if (document.getElementById('abs-kpi-unique-emp')) document.getElementById('abs-kpi-unique-emp').textContent = `${uniqueEmployees} Karyawan Hadir`;
      if (document.getElementById('abs-kpi-ontime-rate')) document.getElementById('abs-kpi-ontime-rate').textContent = `${onTimeRate}%`;
      if (document.getElementById('abs-kpi-ontime-count')) document.getElementById('abs-kpi-ontime-count').textContent = `${onTimeCount} Check-in Tepat Waktu`;
      
      const ontimeBadge = document.getElementById('abs-kpi-ontime-badge');
      if (ontimeBadge) {
        if (totalRows === 0) {
          ontimeBadge.className = "text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200";
          ontimeBadge.textContent = "Belum Ada Data";
        } else if (onTimeRate >= 95) {
          ontimeBadge.className = "text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200";
          ontimeBadge.textContent = "Disiplin Sangat Baik (≥95%)";
        } else if (onTimeRate >= 90) {
          ontimeBadge.className = "text-[9px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200";
          ontimeBadge.textContent = "Disiplin Cukup (≥90%)";
        } else {
          ontimeBadge.className = "text-[9px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200";
          ontimeBadge.textContent = "Perlu Evaluasi (<90%)";
        }
      }

      if (document.getElementById('abs-kpi-late-count')) document.getElementById('abs-kpi-late-count').textContent = lateCount.toLocaleString('id-ID');
      if (document.getElementById('abs-kpi-late-avg')) document.getElementById('abs-kpi-late-avg').textContent = lateCount > 0 ? `Rata-rata: ${avgLate} mnt` : "Nihil Keterlambatan";
      if (document.getElementById('abs-kpi-late-severe')) document.getElementById('abs-kpi-late-severe').textContent = `>30m: ${lateOver30} | >1j: ${lateOver60}`;
      if (document.getElementById('abs-kpi-avg-hours')) document.getElementById('abs-kpi-avg-hours').textContent = avgHours;
      if (document.getElementById('abs-kpi-under-hours')) document.getElementById('abs-kpi-under-hours').textContent = `${under8Count} Karyawan < 8.0 Jam`;

      const hoursBadge = document.getElementById('abs-kpi-hours-badge');
      if (hoursBadge) {
        if (validWorkHoursCount === 0) {
          hoursBadge.className = "text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200";
          hoursBadge.textContent = "Target ≥ 8.0 Jam";
        } else if (parseFloat(avgHours) >= 8.0) {
          hoursBadge.className = "text-[9px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-200";
          hoursBadge.textContent = "Target HO Terpenuhi (≥8.0j)";
        } else {
          hoursBadge.className = "text-[9px] font-extrabold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200";
          hoursBadge.textContent = "Di Bawah Standar 8.0 Jam";
        }
      }

      if (document.getElementById('abs-kpi-anomali-count')) document.getElementById('abs-kpi-anomali-count').textContent = totalAnomali.toLocaleString('id-ID');
      if (document.getElementById('abs-kpi-anomali-desc')) {
        if (totalAnomali === 0) document.getElementById('abs-kpi-anomali-desc').textContent = "Semua Presensi Normal";
        else if (needApprovalCount > 0 && outRadiusCount > 0) document.getElementById('abs-kpi-anomali-desc').textContent = `${needApprovalCount} Butuh Approval, ${outRadiusCount} Luar Radius`;
        else if (needApprovalCount > 0) document.getElementById('abs-kpi-anomali-desc').textContent = `${needApprovalCount} Butuh Approval CICO`;
        else if (outRadiusCount > 0) document.getElementById('abs-kpi-anomali-desc').textContent = `${outRadiusCount} Check-in Luar Radius`;
        else if (noClockOutCount > 0) document.getElementById('abs-kpi-anomali-desc').textContent = `${noClockOutCount} Belum Clock Out`;
        else document.getElementById('abs-kpi-anomali-desc').textContent = `${totalAnomali} Memerlukan Verifikasi`;
      }

      const anomaliBadge = document.getElementById('abs-kpi-anomali-status');
      if (anomaliBadge) {
        if (totalAnomali === 0) {
          anomaliBadge.className = "text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200";
          anomaliBadge.textContent = "Semua Verified";
        } else {
          anomaliBadge.className = "text-[9px] font-extrabold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200";
          anomaliBadge.textContent = `${totalAnomali} Menunggu`;
        }
      }

      if (typeof highlightActiveAbsensiKpi === 'function') {
        highlightActiveAbsensiKpi(activeFilter);
      }

      // Legacy fallback
      if (document.getElementById('abs-card-rate')) document.getElementById('abs-card-rate').textContent = `${onTimeRate}%`;
      if (document.getElementById('abs-card-alpha')) document.getElementById('abs-card-alpha').textContent = under8Count;
      if (document.getElementById('abs-card-telat')) document.getElementById('abs-card-telat').textContent = lateCount;
      const legacyBadge = document.getElementById('abs-card-status-badge');
      if (legacyBadge) {
        if (onTimeRate >= 95) {
          legacyBadge.innerHTML = `<span class="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black border border-emerald-200"><i class="fa-solid fa-circle-check"></i> DISIPLIN BAIK (≥95%)</span>`;
        } else {
          legacyBadge.innerHTML = `<span class="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-black border border-amber-200"><i class="fa-solid fa-triangle-exclamation"></i> PERLU EVALUASI (<95%)</span>`;
        }
      }
    }

    /**
     * Mengatur sorotan visual pada kartu KPI Absensi yang aktif difilter
     */
    function highlightActiveAbsensiKpi(activeFilter) {
      const cards = {
        'ALL': document.getElementById('abs-kpi-card-all'),
        'ON_TIME': document.getElementById('abs-kpi-card-ontime'),
        'LATE': document.getElementById('abs-kpi-card-late'),
        'UNDER_HOURS': document.getElementById('abs-kpi-card-hours'),
        'NEED_APPROVAL': document.getElementById('abs-kpi-card-anomali')
      };

      const activeBorderMap = {
        'ALL': ['border-blue-500', 'ring-2', 'ring-blue-400/40', 'bg-blue-50/20'],
        'ON_TIME': ['border-emerald-500', 'ring-2', 'ring-emerald-400/40', 'bg-emerald-50/20'],
        'LATE': ['border-amber-500', 'ring-2', 'ring-amber-400/40', 'bg-amber-50/20'],
        'LATE_30': ['border-amber-500', 'ring-2', 'ring-amber-400/40', 'bg-amber-50/20'],
        'LATE_60': ['border-amber-500', 'ring-2', 'ring-amber-400/40', 'bg-amber-50/20'],
        'UNDER_HOURS': ['border-indigo-500', 'ring-2', 'ring-indigo-400/40', 'bg-indigo-50/20'],
        'NEED_APPROVAL': ['border-rose-500', 'ring-2', 'ring-rose-400/40', 'bg-rose-50/20']
      };

      const allClassesToRemove = [
        'border-blue-500', 'ring-blue-400/40', 'bg-blue-50/20',
        'border-emerald-500', 'ring-emerald-400/40', 'bg-emerald-50/20',
        'border-amber-500', 'ring-amber-400/40', 'bg-amber-50/20',
        'border-indigo-500', 'ring-indigo-400/40', 'bg-indigo-50/20',
        'border-rose-500', 'ring-rose-400/40', 'bg-rose-50/20',
        'ring-2'
      ];

      Object.values(cards).forEach(c => {
        if (c) {
          c.classList.remove(...allClassesToRemove);
          c.classList.add('border-slate-200/80');
        }
      });

      let targetCardKey = activeFilter;
      if (activeFilter === 'LATE_30' || activeFilter === 'LATE_60') targetCardKey = 'LATE';

      const targetCard = cards[targetCardKey];
      const classesToAdd = activeBorderMap[activeFilter] || activeBorderMap[targetCardKey];
      if (targetCard && classesToAdd) {
        targetCard.classList.remove('border-slate-200/80');
        targetCard.classList.add(...classesToAdd);
      }
    }

    /**
     * 1-Click Quick Filter dari Card KPI Absensi ke Tabel Presensi
     */
    function quickFilterAbsensi(filterVal) {
      const select = document.getElementById('abs-filter-compliance');
      if (select) {
        if (select.value === filterVal && filterVal !== 'ALL') {
          select.value = 'ALL';
        } else {
          select.value = filterVal;
        }
      }
      filterAbsensiTable();
    }

    function filterAbsensiTable() {
      if (!currentDashboardPayload || !currentDashboardPayload.rawTables) return;
      const rawRows = currentDashboardPayload.rawTables.Data_Kehadiran || [];
      const q = (document.getElementById('abs-search-input')?.value || '').toLowerCase().trim();
      const compFilter = document.getElementById('abs-filter-compliance')?.value || 'ALL';
      const toolbarBranch = document.getElementById('abs-filter-cabang')?.value || 'ALL';

      const isAdmin = isUserAdmin(loggedInUser);
      const userBranchCode = getUserBranchCode(loggedInUser);
      const targetBranch = (toolbarBranch !== 'ALL') ? toolbarBranch : (isAdmin ? (document.getElementById('branch-select')?.value || 'ALL') : userBranchCode);

      let branchRows = rawRows;

      // 0. Filter cabang aktif
      if (targetBranch !== 'ALL') {
        branchRows = branchRows.filter(e => matchBranch(e, targetBranch));
      }

      // Update 5 KPI Cards secara sinkron dengan cabang & periode aktif
      if (typeof updateAbsensiKPICards === 'function') {
        updateAbsensiKPICards(branchRows, compFilter);
      }

      let list = branchRows;

      // 1. Filter pencarian teks
      if (q) {
        list = list.filter(e => {
          const npk = safeString(getRowCellValue(e, 'NPK', SCHEMAS.Data_Kehadiran) || e['NPK'] || e['Personnel no.']);
          const nama = String(getRowCellValue(e, 'Employee Name', SCHEMAS.Data_Kehadiran) || e['Employee Name'] || e['Nama'] || '').toLowerCase();
          const cabang = String(getRowCellValue(e, 'Cabang', SCHEMAS.Data_Kehadiran) || e['Cabang'] || '').toLowerCase();
          const ket = String(getRowCellValue(e, 'Keterangan', SCHEMAS.Data_Kehadiran) || e['Keterangan'] || '').toLowerCase();
          const status = String(getRowCellValue(e, 'Status Kehadiran', SCHEMAS.Data_Kehadiran) || e['Status Kehadiran'] || e['Estimasi Telat (Asumsi 08.00)'] || '').toLowerCase();
          return npk.includes(q) || nama.includes(q) || cabang.includes(q) || ket.includes(q) || status.includes(q);
        });
      }

      // 2. Filter Kepatuhan Jam Masuk & Jam Kerja
      if (compFilter !== 'ALL') {
        list = list.filter(e => {
          const rawTime = getRowCellValue(e, 'Time Clock In', SCHEMAS.Data_Kehadiran) || e['Time Clock In'] || e['Clock In'] || e['Time'] || e['Jam Masuk'] || '';
          const existingEstimasi = getRowCellValue(e, 'Status Kehadiran', SCHEMAS.Data_Kehadiran) || e['Status Kehadiran'] || e['Estimasi Telat (Asumsi 08.00)'] || '';
          const lateness = calculateLatenessInfo(existingEstimasi || rawTime);
          const ket = String(getRowCellValue(e, 'Keterangan', SCHEMAS.Data_Kehadiran) || e['Keterangan'] || '').toLowerCase();
          const telatStr = String(existingEstimasi || '').toLowerCase();

          const isLate = lateness.isLate || ket.includes('terlambat') || ket.includes('telat') || telatStr.includes('telat');
          const isOnTime = (!isLate && lateness.hasClockIn) || ket.includes('tepat') || telatStr.includes('tepat');

          if (compFilter === 'ON_TIME' || compFilter === 'Hadir Tepat Waktu') {
            return isOnTime;
          }
          if (compFilter === 'LATE' || compFilter === 'Terlambat') {
            return isLate;
          }
          if (compFilter === 'ALPHA' || compFilter === 'Alpha' || compFilter === 'ALPA' || compFilter === 'Alpa') {
            return !lateness.hasClockIn || lateness.text === 'Alpha' || lateness.text === 'Alpa' || ket.includes('alpa') || ket.includes('alpha');
          }
          if (compFilter === 'CUTI' || compFilter === 'Cuti') {
            return ket.includes('cuti') || telatStr.includes('cuti');
          }
          if (compFilter === 'IZIN' || compFilter === 'Izin') {
            return ket.includes('izin') || telatStr.includes('izin');
          }
          if (compFilter === 'SAKIT' || compFilter === 'Sakit') {
            return ket.includes('sakit') || telatStr.includes('sakit');
          }
          if (compFilter === 'DINAS' || compFilter === 'Dinas') {
            return ket.includes('dinas') || telatStr.includes('dinas');
          }
          if (compFilter === 'LATE_30') {
            return isLate && (lateness.diffMinutes > 30 || (lateness.lateHours && lateness.lateHours > 0));
          }
          if (compFilter === 'LATE_60') {
            return isLate && (lateness.diffMinutes > 60 || (lateness.lateHours && lateness.lateHours >= 1));
          }
          if (compFilter === 'UNDER_HOURS') {
            const whRaw = getRowCellValue(e, 'Durasi Kerja (Work Hours)', SCHEMAS.Data_Kehadiran) || e['Durasi Kerja (Work Hours)'] || e['Work Hours'] || e['Durasi Kerja'];
            const wh = safeFloat(whRaw, 0);
            return wh > 0 && wh < 8.0;
          }
          if (compFilter === 'NEED_APPROVAL') {
            const needApp = String(getRowCellValue(e, 'Need CICO Approval', SCHEMAS.Data_Kehadiran) || e['Need CICO Approval'] || '').toUpperCase().trim() === 'YES';
            const radIn = String(getRowCellValue(e, 'In Radius Clock in', SCHEMAS.Data_Kehadiran) || e['In Radius Clock in'] || '').toUpperCase().trim() === 'NO';
            const radOut = String(getRowCellValue(e, 'In Radius Clock Out', SCHEMAS.Data_Kehadiran) || e['In Radius Clock Out'] || '').toUpperCase().trim() === 'NO';
            const clockOut = getRowCellValue(e, 'Time Clock Out', SCHEMAS.Data_Kehadiran) || e['Time Clock Out'];
            const noClockOut = lateness.hasClockIn && (!clockOut || clockOut === '-' || String(clockOut).trim() === '');
            return needApp || radIn || radOut || noClockOut;
          }
          return true;
        });
      }

      const isFull = columnViewMode.abs === 'FULL';
      const rawCols = isFull 
        ? [...SCHEMAS.Data_Kehadiran.columns.slice(0, 7), "Status Kehadiran", ...SCHEMAS.Data_Kehadiran.columns.slice(7)]
        : ["NPK", "Employee Name", "Cabang", "Date", "Time Clock In", "Status Kehadiran", "Time Clock Out", "Durasi Kerja (Work Hours)", "Keterangan"];
      const cols = ["No", ...rawCols.filter(c => c !== 'No')];

      // Render Header
      renderTableHeader('abs-table-header', cols, true);

      const tbody = document.getElementById('abs-table-body');
      if (document.getElementById('abs-row-count')) {
        document.getElementById('abs-row-count').textContent = `Menampilkan ${list.length} dari ${branchRows.length} data absensi (${cols.length} kolom)`;
      }

      if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="${cols.length + 1}" class="text-center py-8 text-slate-400">Tidak ada data absensi yang sesuai filter.</td></tr>`;
        return;
      }

      tbody.innerHTML = list.map((row, rowIdx) => {
        const cells = cols.map((col, idx) => {
          const isFirst = idx === 0;
          const stickyClass = isFirst 
            ? 'sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 font-mono font-bold text-slate-700 shadow-sm text-center w-12 min-w-[48px]' 
            : 'text-slate-600';

          if (col === 'No' || normalizeHeaderName(col) === 'no') {
            return `<td class="py-2.5 px-3 whitespace-nowrap ${stickyClass} text-slate-500 font-bold">${rowIdx + 1}</td>`;
          }
          
          let val;
          if (col === 'Status Kehadiran' || col === 'Estimasi Telat (Asumsi 08.00)') {
            const rawTime = getRowCellValue(row, 'Time Clock In', SCHEMAS.Data_Kehadiran) || row['Time Clock In'] || row['Clock In'] || row['Time'] || row['Jam Masuk'] || '';
            const existingEstimasi = getRowCellValue(row, 'Status Kehadiran', SCHEMAS.Data_Kehadiran) || row['Status Kehadiran'] || row['Estimasi Telat (Asumsi 08.00)'] || '';
            const lateness = calculateLatenessInfo(existingEstimasi || rawTime);
            val = lateness.badgeHtml;
          } else {
            let cellRaw = (row[col] !== undefined && row[col] !== null && String(row[col]).trim() !== '') 
              ? row[col] 
              : getRowCellValue(row, col, SCHEMAS.Data_Kehadiran);
            val = formatColumnCell(col, cellRaw, 'Data_Kehadiran');
          }
          return `<td class="py-2.5 px-4 whitespace-nowrap ${stickyClass}">${val}</td>`;
        }).join('');

        const realIdx = rawRows.indexOf(row);
        const actionCell = renderRowActionCell('Data_Kehadiran', realIdx, row);
        return `<tr class="hover:bg-slate-50 transition-colors group">${cells}${actionCell}</tr>`;
      }).join('');
    }

    // ----------------------------------------------------
    // C. Suggestion System / SS (Status Reward Dinamis dari Database)
    // ----------------------------------------------------
    function getSSRewardStatusMeta(statusName) {
      const s = String(statusName || '').toLowerCase().trim();
      
      if (s.includes('ibra') || s.includes('lunas') || s.includes('cair')) {
        return {
          key: 'IBRA/Lunas',
          displayName: 'IBRA / Lunas',
          icon: 'fa-solid fa-circle-check',
          textColor: 'text-emerald-700',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          cardBg: 'bg-emerald-50/70 border-emerald-200/80 hover:bg-emerald-50',
          countColor: 'text-emerald-800',
          desc: 'Reward sudah di-IBRA / dicairkan ke cabang'
        };
      }
      if (s === 'bph' || s.includes('bph')) {
        return {
          key: 'BPH',
          displayName: 'BPH',
          icon: 'fa-solid fa-file-signature',
          textColor: 'text-indigo-700',
          badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          cardBg: 'bg-indigo-50/70 border-indigo-200/80 hover:bg-indigo-50',
          countColor: 'text-indigo-800',
          desc: 'Reward sudah diproses BPH'
        };
      }
      if (s.includes('berita acara') || s === 'ba' || s.includes('acara')) {
        return {
          key: 'Berita Acara',
          displayName: 'Berita Acara',
          icon: 'fa-solid fa-file-invoice',
          textColor: 'text-blue-700',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          cardBg: 'bg-blue-50/70 border-blue-200/80 hover:bg-blue-50',
          countColor: 'text-blue-800',
          desc: 'Sudah dinilai, reward belum diproses BPH'
        };
      }
      if (s.includes('proses') || s.includes('penilaian') || s.includes('evaluasi') || s.includes('review') || s.includes('pending')) {
        return {
          key: 'Proses Penilaian',
          displayName: 'Proses Penilaian',
          icon: 'fa-solid fa-clock-rotate-left',
          textColor: 'text-amber-700',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          cardBg: 'bg-amber-50/70 border-amber-200/80 hover:bg-amber-50',
          countColor: 'text-amber-800',
          desc: 'Proses penilaian Corp Planning & Dev'
        };
      }
      if (s.includes('revisi')) {
        return {
          key: 'Revisi',
          displayName: 'Revisi',
          icon: 'fa-solid fa-pen-to-square',
          textColor: 'text-purple-700',
          badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
          cardBg: 'bg-purple-50/70 border-purple-200/80 hover:bg-purple-50',
          countColor: 'text-purple-800',
          desc: 'Diminta revisi & submit ulang via aplikasi'
        };
      }
      if (s.includes('kembali') || s.includes('tolak') || s.includes('reject')) {
        return {
          key: 'Dikembalikan',
          displayName: 'Dikembalikan',
          icon: 'fa-solid fa-arrow-rotate-left',
          textColor: 'text-rose-700',
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          cardBg: 'bg-rose-50/70 border-rose-200/80 hover:bg-rose-50',
          countColor: 'text-rose-800',
          desc: 'Improvement tidak sesuai kriteria penilaian'
        };
      }

      return {
        key: statusName || 'Lainnya',
        displayName: statusName || 'Lainnya',
        icon: 'fa-solid fa-tag',
        textColor: 'text-slate-700',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        cardBg: 'bg-slate-50 border-slate-200 hover:bg-slate-100',
        countColor: 'text-slate-800',
        desc: 'Status reward terdaftar di database'
      };
    }

    function populateSSRewardFilter(rawRows = []) {
      const select = document.getElementById('ss-filter-part');
      if (!select) return;

      const currentVal = select.value || 'ALL';
      const standardStatuses = [
        'Proses Penilaian',
        'Berita Acara',
        'Dikembalikan',
        'Revisi',
        'BPH',
        'IBRA/Lunas'
      ];
      const foundStatuses = new Set(standardStatuses);

      rawRows.forEach(r => {
        const rawSt = getRowCellValue(r, 'Status Reward', SCHEMAS.Data_SS) || r['Status Reward'];
        if (rawSt && String(rawSt).trim() && String(rawSt).trim() !== '-') {
          foundStatuses.add(String(rawSt).trim());
        }
      });

      let html = `<option value="ALL">Semua Status Reward</option>`;
      foundStatuses.forEach(st => {
        const selected = (currentVal.toLowerCase() === st.toLowerCase()) ? 'selected' : '';
        html += `<option value="${st}" ${selected}>${st}</option>`;
      });

      select.innerHTML = html;
    }

    function selectSSRewardFilter(statusKey) {
      const select = document.getElementById('ss-filter-part');
      if (!select) return;

      if (select.value.toLowerCase() === statusKey.toLowerCase()) {
        select.value = 'ALL';
      } else {
        let matched = false;
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].value.toLowerCase() === statusKey.toLowerCase()) {
            select.selectedIndex = i;
            matched = true;
            break;
          }
        }
        if (!matched) {
          const opt = document.createElement('option');
          opt.value = statusKey;
          opt.textContent = statusKey;
          select.appendChild(opt);
          select.value = statusKey;
        }
      }

      filterSSTable();
    }

    function renderModuleSSRewardKPI(statusCount = {}) {
      const container = document.getElementById('ss-reward-kpi-container');
      if (!container) return;

      const standardStatuses = [
        'Proses Penilaian',
        'Berita Acara',
        'Dikembalikan',
        'Revisi',
        'BPH',
        'IBRA/Lunas'
      ];

      const allStatuses = [...standardStatuses];
      Object.keys(statusCount).forEach(k => {
        const exists = allStatuses.some(s => s.toLowerCase() === k.toLowerCase());
        if (!exists && k && k !== '-') allStatuses.push(k);
      });

      const activeFilter = (document.getElementById('ss-filter-part')?.value || 'ALL').toLowerCase();

      container.innerHTML = allStatuses.map(st => {
        const meta = getSSRewardStatusMeta(st);
        let count = 0;
        Object.keys(statusCount).forEach(k => {
          const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          const metaKeyNorm = meta.key.toLowerCase().replace(/[^a-z0-9]/g, '');
          const stNorm = st.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (kNorm === metaKeyNorm || kNorm === stNorm) {
            count += Number(statusCount[k]) || 0;
          }
        });

        const isActive = activeFilter !== 'all' && (activeFilter === meta.key.toLowerCase() || activeFilter === st.toLowerCase());
        const ringClass = isActive ? 'ring-2 ring-offset-1 ring-slate-800 font-black shadow-md' : 'shadow-2xs';

        return `
          <div onclick="selectSSRewardFilter('${meta.key}')" 
               title="${meta.desc} (Klik untuk menyaring tabel)"
               class="p-2 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${meta.cardBg} ${ringClass}">
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="text-[10px] font-bold ${meta.textColor} truncate" title="${meta.displayName}">${meta.displayName}</span>
              <i class="${meta.icon} text-xs ${meta.textColor} opacity-85 flex-shrink-0"></i>
            </div>
            <div class="flex items-baseline justify-between mt-auto">
              <span class="text-base sm:text-lg font-black ${meta.countColor}">${count}</span>
              <span class="text-[9px] font-semibold text-slate-400">Ide</span>
            </div>
          </div>
        `;
      }).join('');
    }

    function renderSSView(data) {
      if (!data) return;
      const s = data.summary || {};
      const rawRows = data.rawTables?.Data_SS || [];

      if (document.getElementById('ss-card-total')) document.getElementById('ss-card-total').textContent = s.totalSS || 0;
      if (document.getElementById('ss-card-target-denom')) document.getElementById('ss-card-target-denom').textContent = `/ ${s.targetSS || 0} Target`;
      
      const ssPct = (s.targetSS > 0) ? Math.min(Math.round(((s.totalSS || 0) / s.targetSS) * 100), 100) : 0;
      if (document.getElementById('ss-card-prog-bar')) document.getElementById('ss-card-prog-bar').style.width = `${ssPct}%`;
      
      if (document.getElementById('ss-card-part-rate')) document.getElementById('ss-card-part-rate').textContent = `${s.ssParticipationRate || 0}%`;

      // Populate filter dropdown status reward dinamis
      populateSSRewardFilter(rawRows);

      // Render KPI Status Reward Cards
      renderModuleSSRewardKPI(s.ssRewardStatusCount || {});

      filterSSTable();
    }

    function filterSSTable() {
      if (!currentDashboardPayload || !currentDashboardPayload.rawTables) return;
      const rawRows = currentDashboardPayload.rawTables.Data_SS || [];
      const q = (document.getElementById('ss-search-input')?.value || '').toLowerCase().trim();
      const partFilter = document.getElementById('ss-filter-part')?.value || 'ALL';

      const isAdmin = isUserAdmin(loggedInUser);
      const userBranchCode = getUserBranchCode(loggedInUser);
      const targetBranch = isAdmin ? (document.getElementById('branch-select')?.value || 'ALL') : userBranchCode;

      let list = rawRows;

      // Filter per cabang aktif
      if (targetBranch !== 'ALL') {
        list = list.filter(e => matchBranch(e, targetBranch));
      }

      // Hitung dan update status KPI sesuai cabang yang sedang disaring
      const currentBranchStatusCount = {};
      list.forEach(r => {
        const rawSt = getRowCellValue(r, 'Status Reward', SCHEMAS.Data_SS) || r['Status Reward'] || '';
        const st = String(rawSt).trim();
        if (st && st !== '-') {
          currentBranchStatusCount[st] = (currentBranchStatusCount[st] || 0) + 1;
        }
      });
      renderModuleSSRewardKPI(currentBranchStatusCount);

      if (q) {
        list = list.filter(e => {
          const checkMatch = (colName) => {
            const v = getRowCellValue(e, colName, SCHEMAS.Data_SS) || e[colName] || '';
            return String(v).toLowerCase().includes(q);
          };
          return (
            checkMatch('No') ||
            checkMatch('Registrasi') ||
            checkMatch('Nama') ||
            checkMatch('NPK') ||
            checkMatch('Cabang') ||
            checkMatch('Kode BA') ||
            checkMatch('Bagian') ||
            checkMatch('Tema') ||
            checkMatch('Fasilitator') ||
            checkMatch('NPK Fasilitator') ||
            checkMatch('Diterima Bulan') ||
            checkMatch('Kategori') ||
            checkMatch('No.Akun AstraPay') ||
            checkMatch('Nama Akun') ||
            checkMatch('Status Reward') ||
            checkMatch('Reward') ||
            checkMatch('No.Berita Acara') ||
            checkMatch('No.BPH') ||
            checkMatch('Distribusi Reward') ||
            checkMatch('Keterangan')
          );
        });
      }

      if (partFilter !== 'ALL') {
        const pNorm = partFilter.toLowerCase().replace(/[^a-z0-9]/g, '');
        list = list.filter(e => {
          const rawSt = String(getRowCellValue(e, 'Status Reward', SCHEMAS.Data_SS) || e['Status Reward'] || '').trim();
          const stNorm = rawSt.toLowerCase().replace(/[^a-z0-9]/g, '');
          const meta = getSSRewardStatusMeta(rawSt);
          const metaNorm = meta.key.toLowerCase().replace(/[^a-z0-9]/g, '');
          return stNorm === pNorm || metaNorm === pNorm || rawSt.toLowerCase() === partFilter.toLowerCase();
        });
      }

      const isFull = columnViewMode.ss === 'FULL';
      const cols = isFull 
        ? SCHEMAS.Data_SS.columns 
        : ["No", "Registrasi", "Nama", "NPK", "Cabang", "Tema", "Status Reward", "Reward"];

      // Render Header
      renderTableHeader('ss-table-header', cols, true);

      const tbody = document.getElementById('ss-table-body');
      if (document.getElementById('ss-row-count')) {
        document.getElementById('ss-row-count').textContent = `Menampilkan ${list.length} dari ${rawRows.length} usulan SS (${cols.length} kolom)`;
      }

      if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="${cols.length + 1}" class="text-center py-8 text-slate-400">Tidak ada data partisipasi SS yang sesuai filter.</td></tr>`;
        return;
      }

      tbody.innerHTML = list.map((row, rowIdx) => {
        const cells = cols.map((col, idx) => {
          const isFirst = idx === 0;
          const stickyClass = isFirst 
            ? 'sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 font-mono font-bold text-slate-700 shadow-sm text-center w-12 min-w-[48px]' 
            : 'text-slate-600';
          if (col === 'No' || normalizeHeaderName(col) === 'no') {
            return `<td class="py-2.5 px-3 whitespace-nowrap ${stickyClass} text-slate-500 font-bold">${rowIdx + 1}</td>`;
          }
          const rawVal = getRowCellValue(row, col, SCHEMAS.Data_SS);
          const val = formatColumnCell(col, rawVal, 'Data_SS');
          return `<td class="py-2.5 px-4 whitespace-nowrap ${stickyClass}">${val}</td>`;
        }).join('');

        const realIdx = rawRows.indexOf(row);
        const actionCell = renderRowActionCell('Data_SS', realIdx, row);
        return `<tr class="hover:bg-slate-50 transition-colors group">${cells}${actionCell}</tr>`;
      }).join('');
    }

    // ----------------------------------------------------
    // D. Quality Control Circle / QCC (Status Dinamis dari Database)
    // ----------------------------------------------------
    function getQCCStatusMeta(statusName) {
      const s = String(statusName || '').toLowerCase().trim();
      if (s.includes('finish') || s.includes('selesai')) {
        return {
          displayName: statusName || 'Finish',
          bg: 'bg-emerald-50/90',
          border: 'border-emerald-200',
          textTitle: 'text-emerald-700',
          textCount: 'text-emerald-900',
          icon: 'fa-solid fa-circle-check text-emerald-500'
        };
      }
      if (s.includes('progress') || s.includes('proses')) {
        return {
          displayName: statusName || 'Progress',
          bg: 'bg-blue-50/90',
          border: 'border-blue-200',
          textTitle: 'text-blue-700',
          textCount: 'text-blue-900',
          icon: 'fa-solid fa-spinner fa-spin-pulse text-blue-500'
        };
      }
      if (s.includes('plan')) {
        return {
          displayName: statusName || 'Plan',
          bg: 'bg-indigo-50/90',
          border: 'border-indigo-200',
          textTitle: 'text-indigo-700',
          textCount: 'text-indigo-900',
          icon: 'fa-solid fa-clipboard-list text-indigo-500'
        };
      }
      if (s.includes('pending') || s.includes('draft') || s.includes('review') || s.includes('evaluasi')) {
        return {
          displayName: statusName,
          bg: 'bg-amber-50/90',
          border: 'border-amber-200',
          textTitle: 'text-amber-700',
          textCount: 'text-amber-900',
          icon: 'fa-solid fa-clock text-amber-500'
        };
      }
      return {
        displayName: statusName,
        bg: 'bg-purple-50/90',
        border: 'border-purple-200',
        textTitle: 'text-purple-700',
        textCount: 'text-purple-900',
        icon: 'fa-solid fa-tag text-purple-500'
      };
    }

    function renderDashboardQCCStatus(statusCount = {}) {
      const container = document.getElementById('dashboard-qcc-status-container');
      if (!container) return;

      const keys = Object.keys(statusCount);
      const displayKeys = keys.length > 0 ? keys : ['Finish', 'Progress'];

      const orderedKeys = [];
      const finishKey = displayKeys.find(k => k.toLowerCase().includes('finish'));
      if (finishKey) orderedKeys.push(finishKey);
      else if (!keys.length) orderedKeys.push('Finish');

      const progressKey = displayKeys.find(k => k.toLowerCase().includes('progress'));
      if (progressKey) orderedKeys.push(progressKey);
      else if (!keys.length) orderedKeys.push('Progress');

      displayKeys.forEach(k => {
        if (!orderedKeys.includes(k)) orderedKeys.push(k);
      });

      const colClass = orderedKeys.length <= 2 ? 'grid-cols-2' : (orderedKeys.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4');
      container.className = `grid ${colClass} gap-1.5 text-center`;

      container.innerHTML = orderedKeys.map(st => {
        const meta = getQCCStatusMeta(st);
        const count = statusCount[st] || 0;
        return `
          <div class="${meta.bg} rounded-xl p-1.5 border ${meta.border} shadow-2xs">
            <span class="text-[9px] font-extrabold ${meta.textTitle} block truncate" title="${meta.displayName}">${meta.displayName}</span>
            <span class="text-sm font-black ${meta.textCount}">${count}</span>
          </div>
        `;
      }).join('');
    }

    function renderModuleQCCStatusKPI(statusCount = {}) {
      const container = document.getElementById('qcc-status-kpi-container');
      if (!container) return;

      const keys = Object.keys(statusCount);
      const displayKeys = keys.length > 0 ? keys : ['Finish', 'Progress'];

      const orderedKeys = [];
      const finishKey = displayKeys.find(k => k.toLowerCase().includes('finish'));
      if (finishKey) orderedKeys.push(finishKey);
      else if (!keys.length) orderedKeys.push('Finish');

      const progressKey = displayKeys.find(k => k.toLowerCase().includes('progress'));
      if (progressKey) orderedKeys.push(progressKey);
      else if (!keys.length) orderedKeys.push('Progress');

      displayKeys.forEach(k => {
        if (!orderedKeys.includes(k)) orderedKeys.push(k);
      });

      const colClass = orderedKeys.length <= 2 ? 'grid-cols-2' : (orderedKeys.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4');
      container.className = `grid ${colClass} gap-2 text-center text-xs`;

      container.innerHTML = orderedKeys.map(st => {
        const meta = getQCCStatusMeta(st);
        const count = statusCount[st] || 0;
        return `
          <div class="${meta.bg} p-2 rounded-xl border ${meta.border} shadow-2xs text-left">
            <div class="flex items-center justify-between mb-0.5">
              <span class="text-[10px] font-extrabold ${meta.textTitle} truncate" title="${meta.displayName}">${meta.displayName}</span>
              <i class="${meta.icon} text-xs flex-shrink-0 ml-1"></i>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-xl font-black ${meta.textCount}">${count}</span>
              <span class="text-[9px] font-bold ${meta.textTitle}">Circle</span>
            </div>
          </div>
        `;
      }).join('');
    }

    function populateQCCStatusFilter(rows = []) {
      const sel = document.getElementById('qcc-filter-status') || document.getElementById('qcc-filter-pdca');
      if (!sel) return;

      const currentVal = sel.value || 'ALL';
      const statusSet = new Set();

      rows.forEach(r => {
        const st = String(r['Status'] || r['status'] || '').trim();
        if (st && st !== '-') statusSet.add(st);
      });

      if (statusSet.size === 0) {
        statusSet.add('Finish');
        statusSet.add('Progress');
      }

      const sortedStatuses = Array.from(statusSet).sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        if (aLower === 'finish' && bLower !== 'finish') return -1;
        if (bLower === 'finish' && aLower !== 'finish') return 1;
        if (aLower === 'progress' && bLower !== 'progress') return -1;
        if (bLower === 'progress' && aLower !== 'progress') return 1;
        return a.localeCompare(b);
      });

      let html = '<option value="ALL">Semua Status</option>';
      sortedStatuses.forEach(st => {
        html += `<option value="${st}">${st}</option>`;
      });

      sel.innerHTML = html;
      if (sortedStatuses.includes(currentVal) || currentVal === 'ALL') {
        sel.value = currentVal;
      } else {
        sel.value = 'ALL';
      }
    }

    function renderQCCView(data) {
      if (!data) return;
      const s = data.summary || {};
      const rawRows = data.rawTables?.Data_QCC || [];

      if (document.getElementById('qcc-card-total')) document.getElementById('qcc-card-total').textContent = s.totalQCCCircles || 0;

      // Populate opsi filter status dinamis dari database
      populateQCCStatusFilter(rawRows);

      // Render KPI Status Cards
      renderModuleQCCStatusKPI(s.qccStatusCount || {});

      if (document.getElementById('qcc-card-best-team')) {
        document.getElementById('qcc-card-best-team').textContent = s.bestQCC?.namaTim || "Belum Ada Circle";
      }
      if (document.getElementById('qcc-card-best-score')) {
        const skorText = String(s.bestQCC?.skor || '');
        document.getElementById('qcc-card-best-score').textContent = skorText.startsWith('Status:') ? skorText : `Status: ${skorText}`;
      }

      filterQCCTable();
    }

    function filterQCCTable() {
      if (!currentDashboardPayload || !currentDashboardPayload.rawTables) return;
      const rawRows = currentDashboardPayload.rawTables.Data_QCC || [];
      const q = (document.getElementById('qcc-search-input')?.value || '').toLowerCase().trim();
      const statusFilter = document.getElementById('qcc-filter-status')?.value || 
                           document.getElementById('qcc-filter-pdca')?.value || 'ALL';

      const isAdmin = isUserAdmin(loggedInUser);
      const userBranchCode = getUserBranchCode(loggedInUser);
      const targetBranch = isAdmin ? (document.getElementById('branch-select')?.value || 'ALL') : userBranchCode;

      let list = rawRows;

      // Filter per cabang aktif
      if (targetBranch !== 'ALL') {
        list = list.filter(e => matchBranch(e, targetBranch));
      }

      // Hitung dan update status KPI sesuai cabang yang sedang disaring
      const currentBranchStatusCount = {};
      list.forEach(q => {
        const st = String(q['Status'] || q['status'] || 'Progress').trim();
        if (st && st !== '-') {
          currentBranchStatusCount[st] = (currentBranchStatusCount[st] || 0) + 1;
        }
      });
      renderModuleQCCStatusKPI(currentBranchStatusCount);

      if (q) {
        list = list.filter(e => {
          const checkMatch = (colName) => {
            const v = getRowCellValue(e, colName, SCHEMAS.Data_QCC) || e[colName] || '';
            return String(v).toLowerCase().includes(q);
          };
          return (
            checkMatch('No') ||
            checkMatch('No.Registrasi') ||
            checkMatch('Nama Tim') || 
            checkMatch('Leader') ||
            checkMatch('Fasilitator') ||
            checkMatch('Tema') ||
            checkMatch('Cabang/Departemen') ||
            checkMatch('Kode BA') ||
            checkMatch('Bagian') ||
            checkMatch('Status')
          );
        });
      }

      if (statusFilter !== 'ALL') {
        list = list.filter(e => {
          const st = String(getRowCellValue(e, 'Status', SCHEMAS.Data_QCC) || e['Status'] || e['status'] || '').trim();
          return st.toLowerCase() === statusFilter.toLowerCase();
        });
      }

      const isFull = columnViewMode.qcc === 'FULL';
      const cols = isFull 
        ? SCHEMAS.Data_QCC.columns 
        : ["No", "No.Registrasi", "Nama Tim", "Cabang/Departemen", "Kode BA", "Leader", "Tema", "Status"];

      // Render Header
      renderTableHeader('qcc-table-header', cols, true);

      const tbody = document.getElementById('qcc-table-body');
      if (document.getElementById('qcc-row-count')) {
        document.getElementById('qcc-row-count').textContent = `Menampilkan ${list.length} dari ${rawRows.length} circle QCC (${cols.length} kolom)`;
      }

      if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="${cols.length + 1}" class="text-center py-8 text-slate-400">Tidak ada circle QCC yang sesuai filter.</td></tr>`;
        return;
      }

      tbody.innerHTML = list.map((row, rowIdx) => {
        const cells = cols.map((col, idx) => {
          const isFirst = idx === 0;
          const stickyClass = isFirst 
            ? 'sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 font-mono font-bold text-slate-700 shadow-sm text-center w-12 min-w-[48px]' 
            : 'text-slate-600';
          if (col === 'No' || normalizeHeaderName(col) === 'no') {
            return `<td class="py-2.5 px-3 whitespace-nowrap ${stickyClass} text-slate-500 font-bold">${rowIdx + 1}</td>`;
          }
          const rawVal = getRowCellValue(row, col, SCHEMAS.Data_QCC);
          const val = formatColumnCell(col, rawVal, 'Data_QCC');
          return `<td class="py-2.5 px-4 whitespace-nowrap ${stickyClass}">${val}</td>`;
        }).join('');

        const realIdx = rawRows.indexOf(row);
        const actionCell = renderRowActionCell('Data_QCC', realIdx, row);
        return `<tr class="hover:bg-slate-50 transition-colors group">${cells}${actionCell}</tr>`;
      }).join('');
    }

    // ----------------------------------------------------
    // E. Disiplin & SP (5 Kolom Presisi)
    // ----------------------------------------------------
    function renderSPView(data) {
      if (!data) return;
      const s = data.summary || {};

      if (document.getElementById('sp-view-total-count')) document.getElementById('sp-view-total-count').textContent = s.totalSP || 0;
      if (document.getElementById('sp-view-teguran')) document.getElementById('sp-view-teguran').textContent = s.countTeguran || 0;
      if (document.getElementById('sp-view-sp1')) document.getElementById('sp-view-sp1').textContent = s.countSP1 || 0;
      if (document.getElementById('sp-view-sp2')) document.getElementById('sp-view-sp2').textContent = s.countSP2 || 0;
      if (document.getElementById('sp-view-sp3')) document.getElementById('sp-view-sp3').textContent = s.countSP3 || 0;
      if (document.getElementById('sp-view-sppt')) document.getElementById('sp-view-sppt').textContent = s.countSPPT || 0;

      const titleEl = document.getElementById('sp-view-status-title');
      const subEl = document.getElementById('sp-view-status-sub');
      const iconEl = document.getElementById('sp-view-status-icon');

      if ((s.totalSP || 0) === 0) {
        if (titleEl) titleEl.textContent = "CLEAR BRANCH (Bebas Sanksi)";
        if (subEl) subEl.textContent = "Seluruh staf tertib tanpa pelanggaran aktif";
        if (iconEl) {
          iconEl.className = "w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg border border-emerald-200";
          iconEl.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
        }
      } else {
        if (titleEl) titleEl.textContent = `${s.totalSP} Sanksi Sedang Berjalan`;
        if (subEl) subEl.textContent = "Diperlukan pembinaan dan pendampingan kerja";
        if (iconEl) {
          iconEl.className = "w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-lg border border-red-200";
          iconEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i>`;
        }
      }

      filterSPTable();
    }

    function filterSPTable() {
      if (!currentDashboardPayload || !currentDashboardPayload.rawTables) return;
      const rawRows = currentDashboardPayload.rawTables.Data_SP || [];
      const q = (document.getElementById('sp-search-input')?.value || '').toLowerCase().trim();
      const statusFilter = document.getElementById('sp-filter-status')?.value || 'ALL';
      const isAdmin = isUserAdmin(loggedInUser);
      const userBranchCode = getUserBranchCode(loggedInUser);
      const targetBranch = isAdmin ? (document.getElementById('branch-select')?.value || 'ALL') : userBranchCode;

      let list = rawRows;

      if (targetBranch !== 'ALL') {
        list = list.filter(e => matchBranch(e, targetBranch));
      }

      if (q) {
        list = list.filter(e => 
          String(e['NPK'] || '').toLowerCase().includes(q) || 
          String(e['Nama'] || '').toLowerCase().includes(q) ||
          String(e['Kode BA'] || '').toLowerCase().includes(q) ||
          String(e['Tingkat SP'] || '').toLowerCase().includes(q) ||
          String(e['Alasan'] || '').toLowerCase().includes(q)
        );
      }

      if (statusFilter === 'ACTIVE_ONLY') {
        list = list.filter(e => !!e['Tingkat SP'] && e['Tingkat SP'] !== '-');
      } else if (statusFilter === 'CLEAN_ONLY') {
        list = list.filter(e => !e['Tingkat SP'] || e['Tingkat SP'] === '-');
      } else if (statusFilter !== 'ALL') {
        list = list.filter(e => String(e['Tingkat SP'] || '').toLowerCase() === statusFilter.toLowerCase());
      }

      const isFull = columnViewMode.sp === 'FULL';
      const rawCols = isFull ? SCHEMAS.Data_SP.columns : ["NPK", "Nama", "Tingkat SP", "Alasan"];
      const cols = ["No", ...rawCols.filter(c => c !== 'No')];

      // Render Header
      renderTableHeader('sp-table-header', cols, true);

      const tbody = document.getElementById('sp-table-body');
      if (document.getElementById('sp-row-count')) {
        document.getElementById('sp-row-count').textContent = `Menampilkan ${list.length} dari ${rawRows.length} catatan kedisiplinan (${cols.length} kolom)`;
      }

      if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="${cols.length + 1}" class="text-center py-8 text-slate-400">Tidak ada catatan sanksi yang sesuai filter.</td></tr>`;
        return;
      }

      tbody.innerHTML = list.map((row, rowIdx) => {
        const cells = cols.map((col, idx) => {
          const isFirst = idx === 0;
          const stickyClass = isFirst 
            ? 'sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 font-mono font-bold text-slate-700 shadow-sm text-center w-12 min-w-[48px]' 
            : 'text-slate-600';
          if (col === 'No' || normalizeHeaderName(col) === 'no') {
            return `<td class="py-2.5 px-3 whitespace-nowrap ${stickyClass} text-slate-500 font-bold">${rowIdx + 1}</td>`;
          }
          const val = formatColumnCell(col, row[col], 'Data_SP');
          return `<td class="py-2.5 px-4 whitespace-nowrap ${stickyClass}">${val}</td>`;
        }).join('');

        const realIdx = rawRows.indexOf(row);
        const actionCell = renderRowActionCell('Data_SP', realIdx, row);
        return `<tr class="hover:bg-slate-50 transition-colors group">${cells}${actionCell}</tr>`;
      }).join('');
    }

    // ----------------------------------------------------
    // E.2 Knowledge Management (KM) Presisi (Sesuai Spreadsheet)
    // ----------------------------------------------------
    function renderKMView(data) {
      if (!data) return;
      const source = window.masterFullPayload?.rawTables || data.rawTables || currentDashboardPayload?.rawTables || {};
      let rawRows = (source.Knowledge_management || source.Data_KM) || [];
      if (!Array.isArray(rawRows)) rawRows = [];

      const totalKM = rawRows.length;
      const uniqueContributors = new Set(rawRows.map(r => safeString(r['NPK'] || r['Personnel no.'])).filter(Boolean)).size;

      let topCategory = "-";
      if (totalKM > 0) {
        topCategory = "Dokumen KM";
      }

      if (document.getElementById('km-kpi-total')) document.getElementById('km-kpi-total').textContent = totalKM;
      if (document.getElementById('km-kpi-contributors')) document.getElementById('km-kpi-contributors').textContent = uniqueContributors;
      if (document.getElementById('km-kpi-top-category')) document.getElementById('km-kpi-top-category').textContent = topCategory;
      if (document.getElementById('km-kpi-verified')) document.getElementById('km-kpi-verified').textContent = totalKM > 0 ? "100%" : "0%";

      populateKMFilters();
      filterKMTable();
    }

    function populateKMFilters() {
      const source = window.masterFullPayload?.rawTables || currentDashboardPayload?.rawTables || {};
      const rawRows = (source.Knowledge_management || source.Data_KM) || [];

      // Ekstraksi topik / kategori dinamis jika tersedia
      const catSelect = document.getElementById('km-filter-kategori');
      if (catSelect) {
        catSelect.innerHTML = '<option value="ALL">Semua Dokumen</option>';
      }
    }

    function filterKMTable() {
      const source = window.masterFullPayload?.rawTables || currentDashboardPayload?.rawTables || {};
      let rawRows = (source.Knowledge_management || source.Data_KM) || [];
      if (!Array.isArray(rawRows)) rawRows = [];
      const q = (document.getElementById('km-search-input')?.value || '').toLowerCase().trim();
      const branchFilter = document.getElementById('km-filter-cabang')?.value || 'ALL';

      let list = rawRows;

      if (branchFilter !== 'ALL') {
        list = list.filter(e => matchBranch(e, branchFilter));
      }

      if (q) {
        list = list.filter(e => 
          String(e['NPK'] || '').toLowerCase().includes(q) || 
          String(e['NAMA'] || e['Nama'] || '').toLowerCase().includes(q) ||
          String(e['JUDUL'] || e['Judul'] || '').toLowerCase().includes(q) ||
          String(e['TANGGAL'] || e['Tanggal'] || '').toLowerCase().includes(q) ||
          String(e['TIME'] || e['Time'] || '').toLowerCase().includes(q)
        );
      }

      // Sesuai spreadsheet: No, NPK, NAMA, JUDUL, TANGGAL, TIME
      const cols = ["No", "NPK", "NAMA", "JUDUL", "TANGGAL", "TIME"];

      // Render Header dengan label kolom aksi 'Detail'
      renderTableHeader('km-table-header', cols, true, 'Detail');

      const tbody = document.getElementById('km-table-body');
      if (document.getElementById('km-row-count')) {
        document.getElementById('km-row-count').textContent = `Menampilkan ${list.length} dari ${rawRows.length} dokumen KM (${cols.length} kolom)`;
      }

      if (!list.length) {
        const isAdmin = isUserAdmin(loggedInUser);
        tbody.innerHTML = `
          <tr>
            <td colspan="${cols.length + 1}" class="py-12 px-4 text-center">
              <div class="max-w-md mx-auto flex flex-col items-center">
                <div class="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center text-xl mb-3 shadow-2xs">
                  <i class="fa-solid fa-folder-open"></i>
                </div>
                <h4 class="text-sm font-extrabold text-slate-800 mb-1">Belum Ada Data Knowledge Management</h4>
                <p class="text-xs text-slate-500 mb-4 leading-relaxed">
                  Belum ada dokumen materi sharing session atau panduan KM yang terdata untuk cabang / filter ini.
                </p>
                ${isAdmin ? `
                  <div class="flex flex-wrap items-center justify-center gap-2.5">
                    <button type="button" onclick="openUploadModal('Knowledge_management')" class="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer">
                      <i class="fa-solid fa-cloud-arrow-up"></i>
                      <span>Import KM (.xlsx / .csv) & Tambah Data</span>
                    </button>
                  </div>
                ` : `
                  <span class="text-xs text-slate-400">Hubungi Administrator HR untuk menambahkan data sharing session.</span>
                `}
              </div>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = list.map((row, rowIdx) => {
        const rowNpk = safeString(row['NPK'] || row['Personnel no.'] || row['npk']);
        // Pastikan nama otomatis terisi jika NPK tersedia
        if ((!row['NAMA'] || row['NAMA'] === '-' || String(row['NAMA']).trim() === '') && rowNpk) {
          const autoName = typeof lookupEmployeeName === 'function' ? lookupEmployeeName(rowNpk) : '';
          if (autoName) row['NAMA'] = autoName;
        }

        const cells = cols.map((col, idx) => {
          const isFirst = idx === 0;
          const stickyClass = isFirst 
            ? 'sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 font-mono font-bold text-slate-700 shadow-sm text-center w-12 min-w-[48px]' 
            : 'text-slate-600';

          if (col === 'No' || normalizeHeaderName(col) === 'no') {
            return `<td class="py-2.5 px-3 whitespace-nowrap ${stickyClass} text-slate-500 font-bold">${rowIdx + 1}</td>`;
          }
          let rawCell = row[col] !== undefined ? row[col] : (row[col.toLowerCase()] !== undefined ? row[col.toLowerCase()] : (row[col.toUpperCase()] !== undefined ? row[col.toUpperCase()] : (typeof capitalizeFirst === 'function' ? row[capitalizeFirst(col)] : '')));
          if ((col === 'NAMA' || col === 'Nama') && (!rawCell || rawCell === '-' || String(rawCell).trim() === '') && rowNpk) {
            rawCell = (typeof lookupEmployeeName === 'function' ? lookupEmployeeName(rowNpk) : '') || rawCell;
          }
          const val = formatColumnCell(col, rawCell, 'Knowledge_management');
          return `<td class="py-2.5 px-4 whitespace-nowrap ${stickyClass}">${val}</td>`;
        }).join('');

        const realIdx = rawRows.indexOf(row);
        const actionCell = renderRowActionCell('Knowledge_management', realIdx, row);
        return `<tr class="hover:bg-slate-50 transition-colors group">${cells}${actionCell}</tr>`;
      }).join('');
    }

    function renderEmployeeTable(list) {
      const tbody = document.getElementById('employee-table-body');
      if (!tbody) return;
      const isAdmin = isUserAdmin(loggedInUser);

      // Sinkronkan visibilitas kolom Info Resign & filter status toggle khusus Admin
      const thResign = document.getElementById('th-admin-resign');
      if (thResign) {
        if (isAdmin) thResign.classList.remove('hidden');
        else thResign.classList.add('hidden');
      }
      const filterContainer = document.getElementById('emp-status-filter-container');
      if (filterContainer) {
        if (isAdmin) filterContainer.classList.remove('hidden');
        else filterContainer.classList.add('hidden');
      }

      // Proteksi Kacab: HANYA tampilkan karyawan aktif murni
      let displayList = list || [];
      if (!isAdmin) {
        displayList = displayList.filter(e => {
          const st = String(e.statusKaryawan || e.Status_Karyawan || 'Aktif').trim().toLowerCase();
          return st !== 'resign';
        });
      }

      const totalCols = isAdmin ? 13 : 12;
      if (!displayList || displayList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${totalCols}" class="text-center py-6 text-slate-400">Tidak ada karyawan yang sesuai kriteria di cabang ini.</td></tr>`;
        return;
      }

      tbody.innerHTML = displayList.map((e, rowIdx) => {
        const umur = e.umurText || calculateAgeAndService(e.tglLahir || e['D.o.birth']);
        const masaKerja = e.masaKerjaText || calculateAgeAndService(e.joinDate || e['Date']);
        const status = (e.statusKaryawan || e.Status_Karyawan || 'Aktif').trim();
        const isResign = status.toLowerCase() === 'resign';
        const statusBadge = isResign
          ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><i class="fa-solid fa-user-xmark mr-1 text-[9px]"></i>Resign</span>`
          : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-user-check mr-1 text-[9px]"></i>Aktif</span>`;

        const resignInfo = (isAdmin && isResign)
          ? `<div class="text-[10px] leading-tight"><span class="font-bold text-rose-600 block">${e.tanggalResign || '-'}</span><span class="text-slate-400 truncate max-w-[140px] block" title="${e.alasanResign || '-'}">${e.alasanResign || '-'}</span></div>`
          : (isAdmin ? `<span class="text-slate-300 text-xs">-</span>` : '');

        return `
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="py-3 px-3 text-center font-mono font-bold text-slate-400">${rowIdx + 1}</td>
            <td class="py-3 px-4 font-mono font-bold text-slate-600">${e.npk}</td>
            <td class="py-3 px-4 font-semibold text-slate-900">${e.nama}</td>
            <td class="py-3 px-4 text-slate-500">${e.cabang} (${e.kodeBA || '-'})</td>
            <td class="py-3 px-4">
              <span class="font-medium text-slate-800">${e.divisi || (typeof resolveEmployeeDivision === 'function' ? resolveEmployeeDivision(e).divisionName : '-')}</span>
              <span class="text-[10px] text-slate-400 block">${e.jabatan || '-'}</span>
            </td>
            <td class="py-3 px-4 text-center font-medium text-slate-600 whitespace-nowrap">${umur}</td>
            <td class="py-3 px-4 text-center font-medium text-slate-600 whitespace-nowrap">${masaKerja}</td>
            <td class="py-3 px-4 text-center">${statusBadge}</td>
            ${isAdmin ? `<td class="py-3 px-4 text-left">${resignInfo}</td>` : ''}
            <td class="py-3 px-4 text-center font-bold ${(e.kehadiranPct !== undefined ? e.kehadiranPct : 100) < 95 ? 'text-amber-600' : 'text-emerald-600'}">${e.kehadiranPct !== undefined ? e.kehadiranPct : 100}%</td>
            <td class="py-3 px-4 text-center font-bold text-amber-500">${e.totalSS || 0} Ide</td>
            <td class="py-3 px-4 text-center font-bold">
              ${e.spAktif ? `<span class="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px]">${e.spAktif}</span>` : `<span class="text-emerald-600 text-xs font-bold">-</span>`}
            </td>
            <td class="py-3 px-4 text-center">
              <button onclick="openPBKModal('${e.npk}')" class="px-2.5 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-bold rounded-lg text-[11px] transition">
                Detail Kinerja
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    function renderPBKTable(list) {
      const tbody = document.getElementById('pbk-table-tbody');
      if (!tbody) return;
      const isAdmin = isUserAdmin(loggedInUser);

      const thPbkResign = document.getElementById('th-pbk-resign');
      if (thPbkResign) {
        if (isAdmin) thPbkResign.classList.remove('hidden');
        else thPbkResign.classList.add('hidden');
      }

      let displayList = list || [];
      if (!isAdmin) {
        displayList = displayList.filter(e => {
          const st = String(e.statusKaryawan || e.Status_Karyawan || 'Aktif').trim().toLowerCase();
          return st !== 'resign';
        });
      }

      const totalCols = isAdmin ? 12 : 11;
      if (!displayList || displayList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${totalCols}" class="text-center py-6 text-slate-400">Data kinerja staf belum tersedia.</td></tr>`;
        return;
      }

      tbody.innerHTML = displayList.map((emp, rowIdx) => {
        const umur = emp.umurText || calculateAgeAndService(emp.tglLahir || emp['D.o.birth']);
        const masaKerja = emp.masaKerjaText || calculateAgeAndService(emp.joinDate || emp['Date']);
        const status = (emp.statusKaryawan || emp.Status_Karyawan || 'Aktif').trim();
        const isResign = status.toLowerCase() === 'resign';
        const statusBadge = isResign
          ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><i class="fa-solid fa-user-xmark mr-1 text-[9px]"></i>Resign</span>`
          : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-user-check mr-1 text-[9px]"></i>Aktif</span>`;

        const resignInfo = (isAdmin && isResign)
          ? `<div class="text-[10px] leading-tight"><span class="font-bold text-rose-600 block">${emp.tanggalResign || '-'}</span><span class="text-slate-400 truncate max-w-[140px] block" title="${emp.alasanResign || '-'}">${emp.alasanResign || '-'}</span></div>`
          : (isAdmin ? `<span class="text-slate-300 text-xs">-</span>` : '');

        return `
          <tr class="hover:bg-slate-50">
            <td class="py-3.5 px-3 text-center font-mono font-bold text-slate-400">${rowIdx + 1}</td>
            <td class="py-3.5 px-4 font-semibold text-slate-900">${emp.nama} <span class="font-mono text-slate-400 text-[10px] block">${emp.npk}</span></td>
            <td class="py-3.5 px-4 text-slate-600">${emp.cabang}</td>
            <td class="py-3.5 px-4 text-center font-medium text-slate-600 whitespace-nowrap">${umur}</td>
            <td class="py-3.5 px-4 text-center font-medium text-slate-600 whitespace-nowrap">${masaKerja}</td>
            <td class="py-3.5 px-4 text-center">${statusBadge}</td>
            ${isAdmin ? `<td class="py-3.5 px-4 text-left">${resignInfo}</td>` : ''}
            <td class="py-3.5 px-4 text-center font-bold ${(emp.kehadiranPct !== undefined ? emp.kehadiranPct : 100) < 95 ? 'text-amber-600' : 'text-emerald-600'}">${emp.kehadiranPct !== undefined ? emp.kehadiranPct : 100}%</td>
            <td class="py-3.5 px-4 text-center font-bold text-amber-500">${emp.totalSS || 0} Ide</td>
            <td class="py-3.5 px-4 text-center font-bold ${emp.spAktif ? 'text-red-600' : 'text-slate-400'}">${emp.spAktif || '-'}</td>
            <td class="py-3.5 px-4 text-center"><span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full"><i class="fa-solid fa-circle-check mr-1"></i>Siap Acuan</span></td>
            <td class="py-3.5 px-4 text-center">
              <button onclick="openPBKModal('${emp.npk}')" class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] transition">Detail</button>
            </td>
          </tr>
        `;
      }).join('');
    }


    function filterEmployeeTable() {
      const q = (document.getElementById('employee-search-input')?.value || '').toLowerCase().trim();
      if (!currentDashboardPayload) return;
      const isAdmin = isUserAdmin(loggedInUser);
      let list = currentDashboardPayload.employeeList || [];

      // 1. Role-based & Quick Status Filter (Semua, Aktif, Resign)
      if (!isAdmin) {
        list = list.filter(e => {
          const st = String(e.statusKaryawan || e.Status_Karyawan || 'Aktif').trim().toLowerCase();
          return st !== 'resign';
        });
      } else if (currentEmployeeStatusFilter !== 'ALL') {
        list = list.filter(e => {
          const st = String(e.statusKaryawan || e.Status_Karyawan || 'Aktif').trim().toLowerCase();
          return st === currentEmployeeStatusFilter.toLowerCase();
        });
      }

      // 2. Filter teks pencarian (nama, NPK, jabatan, divisi, cabang)
      if (q) {
        list = list.filter(e => 
          String(e.nama || '').toLowerCase().includes(q) || 
          String(e.npk || '').toLowerCase().includes(q) ||
          String(e.jabatan || '').toLowerCase().includes(q) ||
          String(e.divisi || '').toLowerCase().includes(q) ||
          String(e.cabang || '').toLowerCase().includes(q)
        );
      }

      renderEmployeeTable(list);
    }
