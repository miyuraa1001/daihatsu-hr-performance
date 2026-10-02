/**
 * D-PERFORM - Navigation & Layout Controls
 * Sidebar, View Switcher, Filter Dropdowns, and Toast Notifications
 */

    function syncAbsFilterCabang(val) {
      const desktop = document.getElementById('branch-select');
      const mobile = document.getElementById('branch-select-mobile');
      const km = document.getElementById('km-filter-cabang');
      if (desktop) desktop.value = val;
      if (mobile) mobile.value = val;
      if (km) km.value = val;
      handleFilterChange();
    }

    function syncKMFilterCabang(val) {
      const desktop = document.getElementById('branch-select');
      const mobile = document.getElementById('branch-select-mobile');
      const abs = document.getElementById('abs-filter-cabang');
      if (desktop) desktop.value = val;
      if (mobile) mobile.value = val;
      if (abs) abs.value = val;
      handleFilterChange();
    }

    function syncBranchChangeMobile(val) {
      const desktop = document.getElementById('branch-select');
      const abs = document.getElementById('abs-filter-cabang');
      const km = document.getElementById('km-filter-cabang');
      if (desktop) desktop.value = val;
      if (abs) abs.value = val;
      if (km) km.value = val;
      handleFilterChange();
    }

    function syncMonthChangeMobile(val) {
      const desktop = document.getElementById('month-select');
      if (desktop) desktop.value = val;
      handleFilterChange();
    }

    function syncYearChangeMobile(val) {
      const desktop = document.getElementById('year-select');
      if (desktop) desktop.value = val;
      handleFilterChange();
    }

    function handleBranchOrPeriodChange() {
      handleFilterChange();
    }

    function handleFilterChange() {
      const isAdmin = isUserAdmin(loggedInUser);
      const userBranchCode = getUserBranchCode(loggedInUser);

      let branch = 'ALL';
      if (!isAdmin) {
        branch = userBranchCode;
      } else {
        branch = document.getElementById('branch-select')?.value || 'ALL';
      }

      const month = document.getElementById('month-select')?.value || 'ALL';
      const year = document.getElementById('year-select')?.value || 'ALL';

      // Sinkronisasi mobile select
      const mBranch = document.getElementById('branch-select-mobile');
      if (mBranch && mBranch !== document.activeElement) mBranch.value = branch;

      const mMonth = document.getElementById('month-select-mobile');
      if (mMonth && mMonth !== document.activeElement) mMonth.value = month;

      const mYear = document.getElementById('year-select-mobile');
      if (mYear && mYear !== document.activeElement) mYear.value = year;

      // Sinkronisasi table branch dropdowns
      const absBranch = document.getElementById('abs-filter-cabang');
      if (absBranch && absBranch !== document.activeElement) absBranch.value = branch;

      const kmBranch = document.getElementById('km-filter-cabang');
      if (kmBranch && kmBranch !== document.activeElement) kmBranch.value = branch;

      // Sinkronisasi hidden legacy period select
      const legacyPeriod = document.getElementById('period-select');
      let pLabel = (month === 'ALL' && year === 'ALL') ? 'Semua Periode' : 
                   (month === 'ALL') ? `Tahun ${year}` : 
                   (year === 'ALL') ? `Bulan ${month}` : `${month} ${year}`;
      if (legacyPeriod) legacyPeriod.value = pLabel;

      const badge = document.getElementById('welcome-period-badge');
      if (badge) badge.textContent = pLabel;

      // Filter seketika secara responsif dari dataset master
      const source = window.masterFullPayload || window.fullUnscopedPayload || currentDashboardPayload;
      if (source) {
        renderAllDashboardData(source, branch, month, year);
      }
    }

    /**
     * Mengisi dropdown Cabang secara dinamis
     */
    function populateBranchDropdown(availableBranchList = null) {
      const selectDesktop = document.getElementById('branch-select');
      const selectMobile = document.getElementById('branch-select-mobile');
      const selectAbs = document.getElementById('abs-filter-cabang');
      const selectKM = document.getElementById('km-filter-cabang');
      const selects = [selectDesktop, selectMobile, selectAbs, selectKM].filter(Boolean);
      if (!selects.length) return;

      const isAdmin = isUserAdmin(loggedInUser);
      const userBranchCode = getUserBranchCode(loggedInUser);

      // DSO LAMPUNG 5 Cabang Resmi (Bebas Duplikasi & Rapi)
      const branchList = KNOWN_BRANCHES.map(b => ({
        code: b.code,
        name: b.name,
        fullName: `${b.code} - ${b.name}`
      }));

      selects.forEach(select => {
        const prevVal = select.value;
        select.innerHTML = '';

        if (isAdmin) {
          select.disabled = false;
          select.classList.remove('cursor-not-allowed', 'opacity-80', 'bg-slate-100');

          const optAll = document.createElement('option');
          optAll.value = 'ALL';
          optAll.textContent = 'Semua Cabang Wewenang';
          select.appendChild(optAll);

          branchList.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.code;
            opt.textContent = `${b.code} - ${b.name}`;
            select.appendChild(opt);
          });

          if (prevVal && (prevVal === 'ALL' || branchList.some(b => b.code === prevVal))) {
            select.value = prevVal;
          } else {
            select.value = 'ALL';
          }
        } else {
          select.disabled = true;
          select.classList.add('cursor-not-allowed', 'opacity-80');

          const userBranchObj = branchList.find(b => b.code === userBranchCode) || 
                                KNOWN_BRANCHES.find(b => b.code === userBranchCode);
          const branchName = userBranchObj ? userBranchObj.name : `Cabang ${userBranchCode}`;

          const opt = document.createElement('option');
          opt.value = userBranchCode;
          opt.textContent = `${userBranchCode} - ${branchName}`;
          select.appendChild(opt);
          select.value = userBranchCode;
        }
      });
    }

    /**
     * Mengisi dropdown Bulan dan Tahun secara terpisah dan dinamis
     */
    function populateMonthAndYearDropdowns(data = null) {
      const mSelects = [document.getElementById('month-select'), document.getElementById('month-select-mobile')].filter(Boolean);
      const ySelects = [document.getElementById('year-select'), document.getElementById('year-select-mobile')].filter(Boolean);

      // 1. Ekstraksi Tahun Dinamis dari Database Aktual (Tanpa Hardcode & Selalu Ter-update)
      const detectedYears = new Set();
      const currentYear = new Date().getFullYear();

      const helperCheckYear = (val) => {
        if (!val && val !== 0) return;
        const str = String(val).trim();
        if (!str || str === '-') return;

        // Serial number Excel (contoh: 45789 -> 2025)
        if (typeof val === 'number' || (/^\d{5}$/.test(str) && Number(str) > 35000 && Number(str) < 65000)) {
          const d = new Date(Math.round((Number(str) - 25569) * 86400 * 1000));
          if (!isNaN(d.getTime())) {
            const yr = d.getFullYear();
            if (yr >= 2020 && yr <= (currentYear + 2)) detectedYears.add(String(yr));
            return;
          }
        }

        // Cocokkan tahun 4 digit (2020 s/d currentYear + 2)
        const match4 = str.match(/\b(20\d{2})\b/);
        if (match4) {
          const yNum = parseInt(match4[1], 10);
          if (yNum >= 2020 && yNum <= (currentYear + 2)) {
            detectedYears.add(String(yNum));
            return;
          }
        }

        // Format short year: misal "Mei-25" -> 2025
        const matchShort = str.match(/^[a-zA-Z]+-(\d{2})$/);
        if (matchShort) {
          const yNum = 2000 + parseInt(matchShort[1], 10);
          if (yNum >= 2020 && yNum <= (currentYear + 2)) {
            detectedYears.add(String(yNum));
          }
        }
      };

      // A. Sumber: availablePeriods backend
      const periods = data?.availablePeriods || window.masterFullPayload?.availablePeriods || [];
      if (Array.isArray(periods)) {
        periods.forEach(p => helperCheckYear(p));
      }

      // B. Sumber: employeeList (periode, tahun, Date, joinDate)
      const empList = data?.employeeList || window.masterFullPayload?.employeeList || [];
      if (Array.isArray(empList)) {
        empList.forEach(e => {
          helperCheckYear(e.periode);
          helperCheckYear(e.tahun);
          helperCheckYear(e['Date']);
          helperCheckYear(e.joinDate);
        });
      }

      // C. Sumber: seluruh tabel database (Data_Kehadiran, Data_SS, Data_QCC, Data_SP, Knowledge_management)
      const rawTables = data?.rawTables || window.masterFullPayload?.rawTables || {};
      const targetDateFields = [
        'Date', 'Tanggal', 'Date Clock In', 'Date Clock Out', 
        'Diterima Bulan', 'Pendaftaran diterima', 'L 1-8 diterima', 
        'Tahun Konvensi', 'TANGGAL', 'periode', 'tahun'
      ];

      ['Data_Kehadiran', 'Data_SS', 'Data_QCC', 'Data_SP', 'Knowledge_management', 'Data_KM'].forEach(tbl => {
        const rows = rawTables[tbl] || [];
        rows.forEach(r => {
          targetDateFields.forEach(field => {
            if (r[field] !== undefined) helperCheckYear(r[field]);
          });
          if (r['No.Berita Acara']) helperCheckYear(r['No.Berita Acara']);
          if (r['No.BPH']) helperCheckYear(r['No.BPH']);
        });
      });

      // D. Fallback jika database belum dimuat / baru inisialisasi awal
      if (detectedYears.size === 0) {
        detectedYears.add(String(currentYear));
        detectedYears.add(String(currentYear - 1));
      }

      // Urutkan tahun terbaru di posisi atas (descending) agar elegan dan mudah disajikan
      const yearList = Array.from(detectedYears).sort((a, b) => b.localeCompare(a));

      ySelects.forEach(sel => {
        const curVal = sel.value || 'ALL';
        let opts = '<option value="ALL">Semua</option>';
        yearList.forEach(yr => {
          opts += `<option value="${yr}">${yr}</option>`;
        });
        sel.innerHTML = opts;
        sel.value = (curVal && (curVal === 'ALL' || yearList.includes(curVal))) ? curVal : 'ALL';
      });

      // 2. Daftar 12 Bulan Baku Bahasa Indonesia
      const months = [
        { val: 'ALL', label: 'Semua Bulan' },
        { val: 'Januari', label: 'Januari' },
        { val: 'Februari', label: 'Februari' },
        { val: 'Maret', label: 'Maret' },
        { val: 'April', label: 'April' },
        { val: 'Mei', label: 'Mei' },
        { val: 'Juni', label: 'Juni' },
        { val: 'Juli', label: 'Juli' },
        { val: 'Agustus', label: 'Agustus' },
        { val: 'September', label: 'September' },
        { val: 'Oktober', label: 'Oktober' },
        { val: 'November', label: 'November' },
        { val: 'Desember', label: 'Desember' }
      ];

      mSelects.forEach(sel => {
        const curVal = sel.value || 'ALL';
        const isMobile = sel.id.includes('mobile');
        let opts = '';
        months.forEach(m => {
          const lbl = isMobile && m.val !== 'ALL' ? m.label.substring(0, 3) : m.label;
          opts += `<option value="${m.val}">${lbl}</option>`;
        });
        sel.innerHTML = opts;
        sel.value = months.some(m => m.val === curVal) ? curVal : 'ALL';
      });
    }

    // Fungsi kompatibilitas untuk pemanggil lama
    function populatePeriodDropdown(data = null) {
      populateMonthAndYearDropdowns(data);
    }

    function renderTableHeader(headerRowId, columns, stickyFirst = true, actionLabel = 'Aksi') {
      const tr = document.getElementById(headerRowId);
      if (!tr) return;
      tr.innerHTML = columns.map((col, idx) => {
        const isFirst = stickyFirst && idx === 0;
        const isNo = col === 'No' || col === 'no' || (typeof normalizeHeaderName === 'function' && normalizeHeaderName(col) === 'no');
        const stickyClass = isFirst ? 'sticky left-0 bg-slate-100 z-20 border-r border-slate-200 shadow-sm' : '';
        const normCol = typeof normalizeHeaderName === 'function' ? normalizeHeaderName(col) : String(col).toLowerCase().trim();
        const isCentered = isNo || normCol.includes('total') || normCol.includes('masuk') || 
                           normCol.includes('tepat') || normCol.includes('telat') || 
                           normCol.includes('tanpa keterangan') || normCol.includes('%') || 
                           normCol.includes('durasi') || normCol.includes('work hours') || 
                           normCol.includes('jam kerja') || normCol === 'status_karyawan' ||
                           normCol === 'status kehadiran';
        const alignClass = isNo ? 'text-center w-12 min-w-[48px] px-2 sm:px-3' : (isCentered ? 'text-center px-3 sm:px-4' : 'text-left px-3 sm:px-4');
        return `<th class="py-2.5 whitespace-nowrap ${stickyClass} ${alignClass}">${col}</th>`;
      }).join('') + `<th class="py-2.5 px-4 text-center whitespace-nowrap">${actionLabel}</th>`;
    }


    /**
     * Memperbarui Widget Kesiapan Data Cabang pada Sidebar secara Real-Time Kumulatif 12 Bulan Menuju PBK Akhir Tahun.
     * Evaluasi berbasis data tahun berjalan (atau tahun terpilih) untuk cabang wewenang aktif.
     */
    function updateSidebarReadiness(data = null) {
      try {
        // 1. Dapatkan dataset master lengkap (tanpa terpotong oleh filter bulan yang sedang aktif di view tabel)
        const master = window.masterFullPayload || window.fullUnscopedPayload || (typeof currentDashboardPayload !== 'undefined' ? currentDashboardPayload : null) || data;
        if (!master) return;
        const rawTables = master.rawTables || {};

        // 2. Tentukan Cabang Sasaran (Isolasi Hak Akses Kacab vs Admin)
        const isAdmin = typeof isUserAdmin === 'function' && isUserAdmin(typeof loggedInUser !== 'undefined' ? loggedInUser : null);
        const userBranchCode = (typeof getUserBranchCode === 'function' && typeof loggedInUser !== 'undefined') ? getUserBranchCode(loggedInUser) : null;
        const selectedBranch = document.getElementById('branch-select')?.value || 'ALL';
        const targetBranch = (!isAdmin && userBranchCode) ? userBranchCode : selectedBranch;

        // 3. Tentukan Tahun Sasaran PBK (Tahun berjalan atau tahun terpilih pada filter)
        const selectedYear = document.getElementById('year-select')?.value || 'ALL';
        const currentYear = new Date().getFullYear();
        let targetYear = (selectedYear !== 'ALL') ? parseInt(selectedYear, 10) : currentYear;

        // Helper peta nama bulan baku Bahasa Indonesia
        const NAMED_MONTHS_MAP = {
          'januari': 1, 'jan': 1,
          'februari': 2, 'feb': 2,
          'maret': 3, 'mar': 3,
          'april': 4, 'apr': 4,
          'mei': 5, 'may': 5,
          'juni': 6, 'jun': 6,
          'juli': 7, 'jul': 7,
          'agustus': 8, 'agu': 8, 'agt': 8, 'aug': 8,
          'september': 9, 'sep': 9,
          'oktober': 10, 'okt': 10, 'oct': 10,
          'november': 11, 'nov': 11,
          'desember': 12, 'des': 12, 'dec': 12
        };

        const parseRowDateInfo = (row, defaultYear) => {
          if (!row) return null;
          const candidateFields = [
            'Date', 'Tanggal', 'Date Clock In', 'Date Clock Out',
            'Diterima Bulan', 'L 1-8 diterima', 'Pendaftaran diterima',
            'Tgl Masuk', 'Tgl', 'periode', 'tahun'
          ];

          for (const f of candidateFields) {
            const val = (typeof getRowCellValue === 'function') ? getRowCellValue(row, f) : row[f];
            const checkVal = (val !== undefined && val !== null && val !== '') ? val : row[f];
            if (checkVal === undefined || checkVal === null || checkVal === '') continue;

            const str = String(checkVal).trim();
            if (!str || str === '-' || str.startsWith('1899')) continue;

            // Excel serial number (misal: 46190 -> 2026-06)
            if (typeof checkVal === 'number' || (/^\d{5}$/.test(str) && Number(str) > 35000 && Number(str) < 65000)) {
              const d = new Date(Math.round((Number(str) - 25569) * 86400 * 1000));
              if (!isNaN(d.getTime()) && d.getFullYear() > 1899) {
                return { year: d.getFullYear(), month: d.getMonth() + 1 };
              }
            }

            // YMD (YYYY-MM-DD atau YYYY/MM/DD)
            const ymd = str.match(/^(\d{4})[-/. ](\d{1,2})[-/. ](\d{1,2})/);
            if (ymd && parseInt(ymd[1], 10) > 1899) {
              return { year: parseInt(ymd[1], 10), month: parseInt(ymd[2], 10) };
            }

            // DMY (DD-MM-YYYY atau DD/MM/YYYY)
            const dmy = str.match(/^(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{4})/);
            if (dmy && parseInt(dmy[3], 10) > 1899) {
              return { year: parseInt(dmy[3], 10), month: parseInt(dmy[2], 10) };
            }

            // Nama bulan tekstual (misal: "Juni", "Juni 2026")
            const lower = str.toLowerCase();
            let mFound = null;
            for (const [mName, mNum] of Object.entries(NAMED_MONTHS_MAP)) {
              const regex = new RegExp(`\\b${mName}\\b|\\b${mName}`, 'i');
              if (regex.test(lower)) {
                mFound = mNum;
                break;
              }
            }

            if (!mFound) {
              const myMatch = str.match(/^(\d{1,2})[-/](\d{4})$/);
              if (myMatch) {
                const m = parseInt(myMatch[1], 10);
                if (m >= 1 && m <= 12) return { year: parseInt(myMatch[2], 10), month: m };
              }
              const ymMatch = str.match(/^(\d{4})[-/](\d{1,2})$/);
              if (ymMatch) {
                const m = parseInt(ymMatch[2], 10);
                if (m >= 1 && m <= 12) return { year: parseInt(ymMatch[1], 10), month: m };
              }
            }

            if (mFound) {
              const yrMatch = str.match(/\b(20\d{2})\b/);
              if (yrMatch) return { year: parseInt(yrMatch[1], 10), month: mFound };

              const otherStr = `${row['No.BPH'] || ''} ${row['No.Berita Acara'] || ''} ${row['Tahun'] || ''} ${row['Year'] || ''}`;
              const yrMatch2 = otherStr.match(/\b(20\d{2})\b/);
              if (yrMatch2) return { year: parseInt(yrMatch2[1], 10), month: mFound };

              return { year: defaultYear, month: mFound };
            }
          }
          return null;
        };

        // 4. Analisis Master Karyawan
        const allEmps = (rawTables.Master_Karyawan && rawTables.Master_Karyawan.length > 0)
          ? rawTables.Master_Karyawan
          : (master.employeeList || []);
        const branchEmps = (typeof matchBranch === 'function')
          ? allEmps.filter(e => matchBranch(e, targetBranch))
          : allEmps;
        const hasMaster = branchEmps.length > 0;

        // Jika selectedYear === 'ALL', cari tahun paling relevan yang memiliki data kehadiran / master
        if (selectedYear === 'ALL') {
          const detectedYears = new Set();
          const allAttRows = rawTables.Data_Kehadiran || [];
          for (let i = 0; i < Math.min(allAttRows.length, 500); i++) {
            const info = parseRowDateInfo(allAttRows[i], currentYear);
            if (info && info.year >= 2020) detectedYears.add(info.year);
          }
          if (detectedYears.has(currentYear)) {
            targetYear = currentYear;
          } else if (detectedYears.size > 0) {
            const sorted = Array.from(detectedYears).sort((a, b) => b - a);
            targetYear = sorted[0];
          } else {
            targetYear = currentYear;
          }
        }

        // 5. Analisis Data Absensi (Bulan 1 s/d 12)
        const absensiMonths = new Set();
        const rawAttendance = rawTables.Data_Kehadiran || [];
        rawAttendance.forEach(row => {
          if (typeof matchBranch === 'function' && !matchBranch(row, targetBranch)) return;
          const info = parseRowDateInfo(row, targetYear);
          if (info && info.year === targetYear && info.month >= 1 && info.month <= 12) {
            absensiMonths.add(info.month);
          }
        });

        // 6. Analisis Data SS & QCC (Kaizen) (Bulan 1 s/d 12)
        const kaizenMonths = new Set();
        let kaizenCount = 0;
        const rawSS = rawTables.Data_SS || [];
        const rawQCC = rawTables.Data_QCC || [];

        rawSS.forEach(row => {
          if (typeof matchBranch === 'function' && !matchBranch(row, targetBranch)) return;
          const info = parseRowDateInfo(row, targetYear);
          if (info && info.year === targetYear && info.month >= 1 && info.month <= 12) {
            kaizenMonths.add(info.month);
            kaizenCount++;
          }
        });

        rawQCC.forEach(row => {
          if (typeof matchBranch === 'function' && !matchBranch(row, targetBranch)) return;
          const info = parseRowDateInfo(row, targetYear);
          if (info && info.year === targetYear && info.month >= 1 && info.month <= 12) {
            kaizenMonths.add(info.month);
            kaizenCount++;
          }
        });

        // 7. Hitung Progres Kumulatif Menuju 100% Akhir Tahun (12 Bulan PBK)
        // PBK dievaluasi penuh di akhir tahun berdasarkan kelengkapan 12 bulan data presensi/kinerja cabang.
        const monthsCollected = hasMaster ? absensiMonths.size : 0;
        const score = Math.min(100, Math.round((monthsCollected / 12) * 100));

        // 8. Perbarui Elemen UI Kesiapan Data Cabang
        const pctEl = document.getElementById('sidebar-readiness-pct');
        const circleEl = document.getElementById('sidebar-readiness-circle');
        if (pctEl) pctEl.textContent = `${score}%`;
        if (circleEl) circleEl.setAttribute('stroke-dasharray', `${score}, 100`);

        const statusTitleEl = document.getElementById('sidebar-readiness-title');
        const statusSubEl = document.getElementById('sidebar-readiness-status');
        const cardEl = document.getElementById('sidebar-readiness-card');
        const dotEl = document.getElementById('sidebar-readiness-dot');

        if (score >= 100) {
          if (statusTitleEl) statusTitleEl.textContent = 'Data Siap Diambil';
          if (statusSubEl) statusSubEl.textContent = `Siap Acuan PBK ${targetYear}`;
          if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
        } else if (score > 0) {
          if (statusTitleEl) statusTitleEl.textContent = `Progres PBK: ${monthsCollected}/12 Bln`;
          if (statusSubEl) statusSubEl.textContent = `Tahun ${targetYear} (${score}% Terkumpul)`;
          if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse';
        } else {
          if (statusTitleEl) statusTitleEl.textContent = 'Data Belum Terkumpul';
          if (statusSubEl) statusSubEl.textContent = `Tahun ${targetYear} (0/12 Bulan)`;
          if (dotEl) dotEl.className = 'w-2 h-2 rounded-full bg-rose-400 animate-pulse';
        }

        if (cardEl) {
          cardEl.title = `Kesiapan Data PBK Tahun ${targetYear}: ${monthsCollected} dari 12 Bulan Terdata (${score}%)`;
        }

        // Checklists
        const readyKaryawanEl = document.getElementById('ready-karyawan');
        const readyKaryawanIcon = document.getElementById('ready-karyawan-icon');
        if (readyKaryawanEl) readyKaryawanEl.textContent = hasMaster ? 'OK' : 'KOSONG';
        if (readyKaryawanIcon) {
          readyKaryawanIcon.className = hasMaster
            ? 'fa-solid fa-circle-check text-emerald-300 w-3 text-center'
            : 'fa-solid fa-circle-xmark text-rose-300 w-3 text-center';
        }

        const readyAbsensiEl = document.getElementById('ready-absensi');
        const readyAbsensiIcon = document.getElementById('ready-absensi-icon');
        if (readyAbsensiEl) {
          readyAbsensiEl.textContent = `${absensiMonths.size}/12 Bln`;
        }
        if (readyAbsensiIcon) {
          if (absensiMonths.size >= 12) {
            readyAbsensiIcon.className = 'fa-solid fa-circle-check text-emerald-300 w-3 text-center';
          } else if (absensiMonths.size > 0) {
            readyAbsensiIcon.className = 'fa-solid fa-clock text-amber-300 w-3 text-center';
          } else {
            readyAbsensiIcon.className = 'fa-solid fa-circle-xmark text-rose-300 w-3 text-center';
          }
        }

        const readyKaizenEl = document.getElementById('ready-kaizen');
        const readyKaizenIcon = document.getElementById('ready-kaizen-icon');
        if (readyKaizenEl) {
          readyKaizenEl.textContent = (kaizenMonths.size > 0) ? `${kaizenMonths.size}/12 Bln` : '0/12 Bln';
        }
        if (readyKaizenIcon) {
          if (kaizenMonths.size >= 12) {
            readyKaizenIcon.className = 'fa-solid fa-circle-check text-emerald-300 w-3 text-center';
          } else if (kaizenMonths.size > 0) {
            readyKaizenIcon.className = 'fa-solid fa-circle-check text-emerald-300 w-3 text-center';
          } else {
            readyKaizenIcon.className = 'fa-solid fa-circle-xmark text-rose-300 w-3 text-center';
          }
        }
      } catch (err) {
        console.error("Error in updateSidebarReadiness:", err);
      }
    }
    window.updateSidebarReadiness = updateSidebarReadiness;


    function switchView(viewId) {
      currentView = viewId;
      const views = ['dashboard', 'master-karyawan', 'absensi', 'ss', 'qcc', 'sp', 'km', 'pbk', 'laporan'];
      views.forEach(v => {
        const el = document.getElementById(`view-${v}`);
        const nav = document.getElementById(`nav-${v}`);
        if (el) el.classList.add('hidden');
        if (nav) nav.className = 'nav-item-inactive flex items-center gap-3 px-5 py-2.5 text-xs transition-colors';
      });

      const activeEl = document.getElementById(`view-${viewId}`);
      const activeNav = document.getElementById(`nav-${viewId}`);
      if (activeEl) activeEl.classList.remove('hidden');
      if (activeNav) activeNav.className = 'nav-item-active flex items-center gap-3 px-5 py-2.5 text-xs transition-colors';

      // Update Header Title & Subtitle sesuai modul yang aktif
      const viewMeta = {
        'dashboard': { title: 'Dashboard D-PERFORM', subtitle: 'Monitoring & Rekapitulasi Data Kinerja Karyawan' },
        'master-karyawan': { title: 'Master Karyawan DSO Lampung', subtitle: 'Basis Data Profil Kepegawaian & Penempatan Cabang' },
        'absensi': { title: 'Rekapitulasi Absensi & Kehadiran', subtitle: 'Monitoring Presensi Harian & Disiplin Jam Kerja' },
        'ss': { title: 'Suggestion System (SS)', subtitle: 'Inovasi Perbaikan Berkelanjutan & Partisipasi Karyawan' },
        'qcc': { title: 'Quality Control Circle (QCC)', subtitle: 'Gugus Kendali Mutu & Problem Solving (PDCA)' },
        'sp': { title: 'Kedisiplinan & Surat Peringatan (SP)', subtitle: 'Pencatatan Sanksi & Kepatuhan Tata Tertib Kerja' },
        'km': { title: 'Knowledge Management (KM)', subtitle: 'Bank Pengetahuan, Repositori Berbagi Praktik Terbaik & Inovasi Kerja' },
        'pbk': { title: 'Rekapitulasi Data Pendukung PBK', subtitle: 'Basis Data Terpadu Acuan Penilaian Kepala Cabang' },
        'laporan': { title: 'Pusat Laporan & Ekspor Data Kinerja', subtitle: 'Unduh Rekapitulasi Data Kinerja Cabang' }
      };

      if (viewMeta[viewId]) {
        if (document.getElementById('page-title')) document.getElementById('page-title').textContent = viewMeta[viewId].title;
        if (document.getElementById('page-subtitle')) document.getElementById('page-subtitle').textContent = viewMeta[viewId].subtitle;
      }

      // Sinkronkan data tabel saat modul dibuka
      if (currentDashboardPayload) {
        if (viewId === 'master-karyawan') filterMasterKaryawanTable();
        else if (viewId === 'absensi') filterAbsensiTable();
        else if (viewId === 'ss') filterSSTable();
        else if (viewId === 'qcc') filterQCCTable();
        else if (viewId === 'sp') filterSPTable();
        else if (viewId === 'km') filterKMTable();
      }
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      document.getElementById('toast-message').textContent = msg;
      toast.classList.remove('translate-y-20', 'opacity-0');
      setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
    }

    function openSidebarMobile() {
      document.getElementById('sidebar').classList.remove('-translate-x-full');
      document.getElementById('mobile-sidebar-overlay').classList.remove('hidden');
    }

    function closeSidebarMobile() {
      if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.add('-translate-x-full');
        document.getElementById('mobile-sidebar-overlay').classList.add('hidden');
      }
    }
