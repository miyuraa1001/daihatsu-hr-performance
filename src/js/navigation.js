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
     * Memastikan Master Store selalu menyimpan salinan lengkap seluruh tabel untuk semua cabang

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
        const stickyClass = isFirst ? 'sticky left-0 bg-slate-100 z-20 border-r border-slate-200 shadow-sm' : '';
        return `<th class="py-2.5 px-4 whitespace-nowrap ${stickyClass}">${col}</th>`;
      }).join('') + `<th class="py-2.5 px-4 text-center whitespace-nowrap">${actionLabel}</th>`;
    }


    function updateSidebarReadiness(data) {
      if (!data) return;
      const s = data.summary || {};
      const hasKaryawan = (s.totalKaryawan || 0) > 0;
      const hasAbsensi = (s.avgAttendance || 0) > 0;
      const hasKaizen = (s.totalSS || 0) > 0 || (s.totalQCCCircles || 0) > 0;

      let score = 0;
      if (hasKaryawan) score += 35;
      if (hasAbsensi) score += 35;
      if (hasKaizen) score += 30;

      const pctEl = document.getElementById('sidebar-readiness-pct');
      const circleEl = document.getElementById('sidebar-readiness-circle');
      if (pctEl) pctEl.textContent = `${score}%`;
      if (circleEl) circleEl.setAttribute('stroke-dasharray', `${score}, 100`);

      const statusTitleEl = document.getElementById('sidebar-readiness-title');
      const statusSubEl = document.getElementById('sidebar-readiness-status');
      if (score >= 100) {
        if (statusTitleEl) statusTitleEl.textContent = 'Data Siap Diambil';
        if (statusSubEl) statusSubEl.textContent = 'Siap Acuan PBK';
      } else {
        if (statusTitleEl) statusTitleEl.textContent = 'Data Sebagian';
        if (statusSubEl) statusSubEl.textContent = 'Sinkronisasi Spreadsheet...';
      }

      if (document.getElementById('ready-karyawan')) document.getElementById('ready-karyawan').textContent = hasKaryawan ? 'OK' : 'KOSONG';
      if (document.getElementById('ready-absensi')) document.getElementById('ready-absensi').textContent = hasAbsensi ? 'OK' : 'KOSONG';
      if (document.getElementById('ready-kaizen')) document.getElementById('ready-kaizen').textContent = hasKaizen ? 'OK' : 'KOSONG';
    }


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