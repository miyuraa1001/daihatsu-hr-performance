
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
          'Tanggal Lahir', 'tanggal lahir', 'Tanggal lahir', 'Tgl Lahir', 'tgl lahir', 'Tgl lahir',
          'tglLahir', 'tgl_lahir', 'tanggalLahir', 'tanggal_lahir',
          'birthDate', 'birth_date', 'dateOfBirth', 'date_of_birth',
          'Date of Birth', 'Date of birth', 'Birth Date', 'Birth date', 'Tgl. Lahir', 'tgl. lahir'
        ];
        for (const k of candidates) {
          if (e[k] !== undefined && e[k] !== null) {
            const val = String(e[k]).trim();
            if (val !== '' && val !== '-' && val !== '0' && val !== '1899-12-30' && val !== 'null' && val !== 'undefined') {
              return formatDatabaseDate(e[k]);
            }
          }
        }
        for (const k of Object.keys(e)) {
          const norm = k.toLowerCase().replace(/[\s\-_.]+/g, '');
          if (norm === 'dobirth' || norm === 'dob' || norm === 'tgllahir' || norm === 'tanggallahir' || norm === 'birthdate' || norm === 'dateofbirth') {
            const val = String(e[k] || '').trim();
            if (val !== '' && val !== '-' && val !== '0' && val !== '1899-12-30' && val !== 'null' && val !== 'undefined') {
              return formatDatabaseDate(e[k]);
            }
          }
        }
        if (e.raw && typeof e.raw === 'object') {
          for (const k of candidates) {
            if (e.raw[k] !== undefined && e.raw[k] !== null) {
              const val = String(e.raw[k]).trim();
              if (val !== '' && val !== '-' && val !== '0' && val !== '1899-12-30' && val !== 'null' && val !== 'undefined') {
                return formatDatabaseDate(e.raw[k]);
              }
            }
          }
          for (const k of Object.keys(e.raw)) {
            const norm = k.toLowerCase().replace(/[\s\-_.]+/g, '');
            if (norm === 'dobirth' || norm === 'dob' || norm === 'tgllahir' || norm === 'tanggallahir' || norm === 'birthdate' || norm === 'dateofbirth') {
              const val = String(e.raw[k] || '').trim();
              if (val !== '' && val !== '-' && val !== '0' && val !== '1899-12-30' && val !== 'null' && val !== 'undefined') {
                return formatDatabaseDate(e.raw[k]);
              }
            }
          }
        }
        // Cross-reference by NPK across employeeList and master stores
        const npk = safeString(e['Personnel no.'] || e.npk || e['NPK']).trim();
        if (npk) {
          const cleanNpk = npk.replace(/^0+/, '');
          const sources = [
            window.masterFullPayload?.employeeList,
            currentDashboardPayload?.employeeList,
            window.fullUnscopedPayload?.employeeList,
            window.masterFullPayload?.rawTables?.Master_Karyawan,
            currentDashboardPayload?.rawTables?.Master_Karyawan
          ];
          for (const src of sources) {
            if (!Array.isArray(src)) continue;
            const match = src.find(item => {
              if (!item || item === e) return false;
              const itemNpk = safeString(item['Personnel no.'] || item.npk || item['NPK']).trim();
              return itemNpk === npk || (cleanNpk && itemNpk.replace(/^0+/, '') === cleanNpk);
            });
            if (match) {
              for (const k of candidates) {
                if (match[k] !== undefined && match[k] !== null) {
                  const val = String(match[k]).trim();
                  if (val !== '' && val !== '-' && val !== '0' && val !== '1899-12-30' && val !== 'null' && val !== 'undefined') {
                    return formatDatabaseDate(match[k]);
                  }
                }
              }
              if (match.raw && typeof match.raw === 'object') {
                for (const k of candidates) {
                  if (match.raw[k] !== undefined && match.raw[k] !== null) {
                    const val = String(match.raw[k]).trim();
                    if (val !== '' && val !== '-' && val !== '0' && val !== '1899-12-30' && val !== 'null' && val !== 'undefined') {
                      return formatDatabaseDate(match.raw[k]);
                    }
                  }
                }
              }
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
        const candidates = [
          'Date', 'date', 'Tanggal', 'tanggal',
          'Entry', 'entry', 'Entry Date', 'entry date', 'Entry date', 'entry_date', 'entryDate',
          'Tanggal Masuk', 'tanggal masuk', 'Tanggal masuk', 'Tgl Masuk', 'tgl masuk', 'Tgl masuk', 'tglMasuk', 'tgl_masuk',
          'Tanggal Gabung', 'tanggal gabung', 'Tanggal gabung', 'Tgl Gabung', 'tgl gabung', 'Tgl gabung', 'tglGabung', 'tgl_gabung',
          'Join Date', 'join date', 'Join date', 'joinDate', 'join_date',
          'Mulai Kerja', 'mulai kerja', 'Tgl Mulai Kerja', 'tgl mulai kerja', 'tglMulaiKerja', 'mulaiKerja',
          'effectiveDate', 'effective_date', 'Effective Date', 'tgl'
        ];
        for (const k of candidates) {
          if (e[k] !== undefined && e[k] !== null) {
            const val = String(e[k]).trim();
            if (val !== '' && val !== '-' && val !== '0' && val !== '1899-12-30' && val !== 'null' && val !== 'undefined') return formatDatabaseDate(e[k]);
          }
        }
        for (const k of Object.keys(e)) {
          const norm = k.toLowerCase().replace(/[\s\-_.]+/g, '');
          if (norm === 'date' || norm === 'joindate' || norm === 'tglmasuk' || norm === 'tanggal' || norm === 'entry' || norm === 'entrydate' || norm === 'tglgabung' || norm === 'tanggalgabung' || norm === 'mulaikerja' || norm === 'tglmulaikerja') {
            const val = String(e[k] || '').trim();
            if (val !== '' && val !== '-' && val !== '0' && val !== '1899-12-30' && val !== 'null' && val !== 'undefined') return formatDatabaseDate(e[k]);
          }
        }
        if (e.raw && typeof e.raw === 'object') {
          for (const k of candidates) {
            if (e.raw[k] !== undefined && e.raw[k] !== null) {
              const val = String(e.raw[k]).trim();
              if (val !== '' && val !== '-' && val !== '0' && val !== '1899-12-30' && val !== 'null' && val !== 'undefined') {
                return formatDatabaseDate(e.raw[k]);
              }
            }
          }
          for (const k of Object.keys(e.raw)) {
            const norm = k.toLowerCase().replace(/[\s\-_.]+/g, '');
            if (norm === 'date' || norm === 'joindate' || norm === 'tglmasuk' || norm === 'tanggal' || norm === 'entry' || norm === 'entrydate' || norm === 'tglgabung' || norm === 'tanggalgabung' || norm === 'mulaikerja' || norm === 'tglmulaikerja') {
              const val = String(e.raw[k] || '').trim();
              if (val !== '' && val !== '-' && val !== '0' && val !== '1899-12-30' && val !== 'null' && val !== 'undefined') return formatDatabaseDate(e.raw[k]);
            }
          }
        }
        // Cross-reference by NPK across employeeList and master stores
        const npk = safeString(e['Personnel no.'] || e.npk || e['NPK']).trim();
        if (npk) {
          const cleanNpk = npk.replace(/^0+/, '');
          const sources = [
            window.masterFullPayload?.employeeList,
            currentDashboardPayload?.employeeList,
            window.fullUnscopedPayload?.employeeList,
            window.masterFullPayload?.rawTables?.Master_Karyawan,
            currentDashboardPayload?.rawTables?.Master_Karyawan
          ];
          for (const src of sources) {
            if (!Array.isArray(src)) continue;
            const match = src.find(item => {
              if (!item || item === e) return false;
              const itemNpk = safeString(item['Personnel no.'] || item.npk || item['NPK']).trim();
              return itemNpk === npk || (cleanNpk && itemNpk.replace(/^0+/, '') === cleanNpk);
            });
            if (match) {
              for (const k of candidates) {
                if (match[k] !== undefined && match[k] !== null) {
                  const val = String(match[k]).trim();
                  if (val !== '' && val !== '-' && val !== '0' && val !== '1899-12-30' && val !== 'null' && val !== 'undefined') {
                    return formatDatabaseDate(match[k]);
                  }
                }
              }
              if (match.raw && typeof match.raw === 'object') {
                for (const k of candidates) {
                  if (match.raw[k] !== undefined && match.raw[k] !== null) {
                    const val = String(match.raw[k]).trim();
                    if (val !== '' && val !== '-' && val !== '0' && val !== '1899-12-30' && val !== 'null' && val !== 'undefined') {
                      return formatDatabaseDate(match.raw[k]);
                    }
                  }
                }
              }
            }
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

    /**
     * Klasifikasi Karyawan ke dalam 3 Pilar Utama DSO:
     * - Sales: Sales Team (VSO, Wiraniaga, Counter, Marketing, dsb.)
     * - Service: Service & Bengkel (Mechanic, Service Advisor, Workshop, Foreman, dsb.)
     * - Admin: Admin & Support (Administrator, GA, Part Admin, Finance, dsb.)
     */
    function classifyEmployeePilar(e, idx = 0) {
      if (!e) return 'Admin';

      let jobTitle = String(e['Job Title'] || e.jabatan || e.posisi || '').trim();
      let stext = '';
      if (typeof findP0001STEXT === 'function') {
        stext = String(e['P0001-STEXT'] || findP0001STEXT(e, idx) || '').trim();
      } else {
        stext = String(e['P0001-STEXT'] || e.stext || '').trim();
      }
      const orgUnit = String(e['Name of organizational unit'] || e.unit || '').trim();
      const nameVal = String(e['Name'] || e.divisi || e.departemen || '').trim();

      const jtLower = jobTitle.toLowerCase();
      const combined = `${jobTitle} ${stext} ${orgUnit} ${nameVal}`.toLowerCase();

      // 1. Prioritas Admin & Support: Pastikan title seperti "Part Admin", "Service Admin", dsb. masuk ke Admin
      if (
        jtLower.includes('admin') || 
        jtLower.includes('general affair') || 
        jtLower.includes(' ga') || 
        jtLower.startsWith('ga ') ||
        jtLower.includes('finance') || 
        jtLower.includes('keuangan') || 
        jtLower.includes('accounting') || 
        jtLower.includes('akuntansi') || 
        jtLower.includes('cashier') || 
        jtLower.includes('kasir') || 
        jtLower.includes('hr') || 
        jtLower.includes('personalia') || 
        jtLower.includes('it ') || 
        jtLower.includes('information tech') || 
        jtLower.includes('logistik') || 
        jtLower.includes('driver') || 
        jtLower.includes('office boy') || 
        jtLower.includes('security')
      ) {
        return 'Admin';
      }

      // 2. Service & Bengkel
      if (
        jtLower.includes('mechanic') || 
        jtLower.includes('mekanik') || 
        jtLower.includes('service advisor') || 
        /\bsa\b/i.test(jtLower) || 
        jtLower.includes('workshop head') || 
        jtLower.includes('workshop') || 
        jtLower.includes('foreman') || 
        jtLower.includes('teknisi') || 
        jtLower.includes('technician') || 
        jtLower.includes('toolman') || 
        jtLower.includes('partman') || 
        jtLower.includes('bengkel') || 
        jtLower.includes('pdi') ||
        (jtLower.includes('service') && !jtLower.includes('sales'))
      ) {
        return 'Service';
      }

      // 3. Sales Team
      if (
        jtLower.includes('sales') || 
        jtLower.includes('wiraniaga') || 
        jtLower.includes('counter') || 
        jtLower.includes('marketing') || 
        jtLower.includes('vso') || 
        jtLower.includes('showroom') ||
        jtLower.includes('supervisor') ||
        jtLower.includes('spv') ||
        jtLower.includes('branch manager') ||
        jtLower.includes('kepala cabang')
      ) {
        return 'Sales';
      }

      // Fallback berdasarkan gabungan teks
      if (combined.includes('service') || combined.includes('bengkel') || combined.includes('workshop')) {
        return 'Service';
      }
      if (combined.includes('sales') || combined.includes('vso') || combined.includes('penjualan')) {
        return 'Sales';
      }

      return 'Admin';
    }
    if (typeof window !== 'undefined') window.classifyEmployeePilar = classifyEmployeePilar;

    // Filter & View State Master Karyawan
    let activePilarFilter = null; // 'Sales', 'Service', 'Admin', or null
    let quickJobSearchQuery = '';
    let currentMKViewMode = 'table'; // 'table' or 'card'

    function filterByPilar(pilar) {
      if (activePilarFilter === pilar) {
        activePilarFilter = null;
      } else {
        activePilarFilter = pilar;
      }
      updatePilarCardStyles();
      filterMasterKaryawanTable();
    }
    if (typeof window !== 'undefined') window.filterByPilar = filterByPilar;

    function updatePilarCardStyles() {
      const cards = {
        Sales: document.getElementById('mk-pilar-card-sales'),
        Service: document.getElementById('mk-pilar-card-service'),
        Admin: document.getElementById('mk-pilar-card-admin')
      };

      Object.keys(cards).forEach(k => {
        const el = cards[k];
        if (!el) return;
        el.classList.remove('ring-2', 'ring-rose-500', 'ring-blue-500', 'ring-amber-500', 'bg-rose-50/40', 'bg-blue-50/40', 'bg-amber-50/40');
        if (activePilarFilter === k) {
          if (k === 'Sales') el.classList.add('ring-2', 'ring-rose-500', 'bg-rose-50/40');
          if (k === 'Service') el.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50/40');
          if (k === 'Admin') el.classList.add('ring-2', 'ring-amber-500', 'bg-amber-50/40');
        }
      });
    }
    if (typeof window !== 'undefined') window.updatePilarCardStyles = updatePilarCardStyles;

    function resetMasterKaryawanFilters() {
      activePilarFilter = null;
      quickJobSearchQuery = '';
      const searchInput = document.getElementById('mk-search-input');
      if (searchInput) searchInput.value = '';
      const contractSelect = document.getElementById('mk-filter-kontrak');
      if (contractSelect) contractSelect.value = 'ALL';
      updatePilarCardStyles();
      filterMasterKaryawanTable();
    }
    if (typeof window !== 'undefined') window.resetMasterKaryawanFilters = resetMasterKaryawanFilters;

    function onQuickJobSearchInput(val) {
      quickJobSearchQuery = String(val || '').trim();
      const searchInput = document.getElementById('mk-search-input');
      if (searchInput && searchInput.value !== quickJobSearchQuery) searchInput.value = quickJobSearchQuery;
      filterMasterKaryawanTable();
    }
    if (typeof window !== 'undefined') window.onQuickJobSearchInput = onQuickJobSearchInput;

    function filterBySpecificJob(jobTitle) {
      const searchInput = document.getElementById('mk-search-input');
      if (searchInput) searchInput.value = jobTitle;
      quickJobSearchQuery = jobTitle;
      filterMasterKaryawanTable();
    }
    if (typeof window !== 'undefined') window.filterBySpecificJob = filterBySpecificJob;

    function toggleOtherJobsList() {
      const container = document.getElementById('mk-other-jobs-container');
      const icon = document.getElementById('mk-icon-other-jobs');
      if (!container) return;
      const isHidden = container.classList.contains('hidden');
      if (isHidden) {
        container.classList.remove('hidden');
        if (icon) icon.className = 'fa-solid fa-chevron-up text-[10px]';
      } else {
        container.classList.add('hidden');
        if (icon) icon.className = 'fa-solid fa-chevron-down text-[10px]';
      }
    }
    if (typeof window !== 'undefined') window.toggleOtherJobsList = toggleOtherJobsList;

    function syncSearchInputs(val) {
      const mainSearch = document.getElementById('mk-search-input');
      if (mainSearch) mainSearch.value = val;
      filterMasterKaryawanTable();
    }
    if (typeof window !== 'undefined') window.syncSearchInputs = syncSearchInputs;

    function syncContractFilters(val) {
      const mainContract = document.getElementById('mk-filter-kontrak');
      if (mainContract) mainContract.value = val;
      filterMasterKaryawanTable();
    }
    if (typeof window !== 'undefined') window.syncContractFilters = syncContractFilters;

    function filterBySpecificContract(contractName) {
      const select = document.getElementById('mk-filter-kontrak');
      if (!select) return;
      if (select.value === contractName) {
        select.value = 'ALL';
      } else {
        const hasOption = Array.from(select.options || []).some(o => o.value === contractName);
        if (!hasOption) {
          const opt = document.createElement('option');
          opt.value = contractName;
          opt.textContent = contractName;
          select.appendChild(opt);
        }
        select.value = contractName;
      }
      filterMasterKaryawanTable();
    }
    if (typeof window !== 'undefined') window.filterBySpecificContract = filterBySpecificContract;

    // Safety stubs
    function openMasterKaryawanFilterModal() {}
    function setColumnViewModeChoice() {}
    function updateFilterTambahanBadge() {}
    function applyMasterKaryawanModalFilters() {}
    function resetMasterKaryawanModalFilters() {}
    function toggleExtraFilters() {}
    if (typeof window !== 'undefined') {
      window.openMasterKaryawanFilterModal = openMasterKaryawanFilterModal;
      window.setColumnViewModeChoice = setColumnViewModeChoice;
      window.updateFilterTambahanBadge = updateFilterTambahanBadge;
      window.applyMasterKaryawanModalFilters = applyMasterKaryawanModalFilters;
      window.resetMasterKaryawanModalFilters = resetMasterKaryawanModalFilters;
      window.toggleExtraFilters = toggleExtraFilters;
    }

    function setMKViewMode(mode) {
      currentMKViewMode = mode;
      const btnTable = document.getElementById('mk-view-btn-table');
      const btnCard = document.getElementById('mk-view-btn-card');
      const tableWrap = document.getElementById('mk-table-wrapper');
      const cardWrap = document.getElementById('mk-card-view-wrapper');

      if (mode === 'table') {
        if (btnTable) btnTable.className = 'px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-[#7f1d1d] text-white shadow-2xs cursor-pointer';
        if (btnCard) btnCard.className = 'px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer';
        if (tableWrap) tableWrap.classList.remove('hidden');
        if (cardWrap) cardWrap.classList.add('hidden');
      } else {
        if (btnTable) btnTable.className = 'px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer';
        if (btnCard) btnCard.className = 'px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-[#7f1d1d] text-white shadow-2xs cursor-pointer';
        if (tableWrap) tableWrap.classList.add('hidden');
        if (cardWrap) cardWrap.classList.remove('hidden');
      }
      filterMasterKaryawanTable();
    }
    if (typeof window !== 'undefined') window.setMKViewMode = setMKViewMode;

    function toggleSelectAllMK(masterCheck) {
      const isChecked = masterCheck.checked;
      const rowChecks = document.querySelectorAll('.mk-row-checkbox');
      rowChecks.forEach(cb => {
        cb.checked = isChecked;
      });
    }
    if (typeof window !== 'undefined') window.toggleSelectAllMK = toggleSelectAllMK;

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
      } else {
        sourceList = sourceList.filter(r => isLampungBranch(r));
      }

      // Role Kacab hanya melihat karyawan aktif
      if (!isAdmin) {
        sourceList = sourceList.filter(e => {
          const st = String(e['Status_Karyawan'] || e.statusKaryawan || 'Aktif').trim().toLowerCase();
          return st !== 'resign';
        });
      }

      const totalEmployees = sourceList.length || s.totalKaryawan || 0;

      // 1. Total Karyawan Badges
      if (document.getElementById('mk-badge-total-karyawan')) {
        document.getElementById('mk-badge-total-karyawan').textContent = `Total: ${totalEmployees} Karyawan`;
      }
      if (document.getElementById('mk-card-total')) {
        document.getElementById('mk-card-total').textContent = totalEmployees;
      }

      // 2. Klasifikasi ke 3 Pilar DSO
      const salesList = [];
      const serviceList = [];
      const adminList = [];

      sourceList.forEach((e, idx) => {
        const pilar = classifyEmployeePilar(e, idx);
        if (pilar === 'Sales') salesList.push(e);
        else if (pilar === 'Service') serviceList.push(e);
        else adminList.push(e);
      });

      const salesCount = salesList.length;
      const serviceCount = serviceList.length;
      const adminCount = adminList.length;

      const salesPct = totalEmployees ? Math.round((salesCount / totalEmployees) * 100) : 0;
      const servicePct = totalEmployees ? Math.round((serviceCount / totalEmployees) * 100) : 0;
      const adminPct = totalEmployees ? Math.round((adminCount / totalEmployees) * 100) : 0;

      // Badges pada 3 Pilar Card
      if (document.getElementById('mk-sales-badge')) {
        document.getElementById('mk-sales-badge').textContent = `${salesCount} Org (${salesPct}%)`;
      }
      if (document.getElementById('mk-service-badge')) {
        document.getElementById('mk-service-badge').textContent = `${serviceCount} Org (${servicePct}%)`;
      }
      if (document.getElementById('mk-admin-badge')) {
        document.getElementById('mk-admin-badge').textContent = `${adminCount} Org (${adminPct}%)`;
      }

      // Helper Jabatan Kunci per Pilar (Top 3)
      function renderKeyJobsList(empList, totalPilar) {
        const map = {};
        empList.forEach(e => {
          let jt = (getRowCellValue(e, 'Job Title', SCHEMAS.Master_Karyawan) || e.jabatan || 'Staff').trim();
          if (!jt || jt === '-' || jt === 'undefined') jt = 'Staff';
          map[jt] = (map[jt] || 0) + 1;
        });
        const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3);
        if (!sorted.length) {
          return `<div class="text-slate-400 text-xs py-1 text-center italic">Belum ada jabatan</div>`;
        }
        return sorted.map(([jt, count]) => {
          const pct = totalPilar ? Math.round((count / totalPilar) * 100) : 0;
          return `
            <div class="flex items-center justify-between text-xs py-0.5 text-slate-600">
              <span class="truncate pr-2 font-medium" title="${jt}">${jt}</span>
              <div class="flex items-baseline flex-shrink-0">
                <span class="font-bold text-slate-800">${count}</span>
                <span class="text-slate-400 text-[11px] ml-1">(${pct}%)</span>
              </div>
            </div>
          `;
        }).join('');
      }

      if (document.getElementById('mk-sales-key-jobs')) {
        document.getElementById('mk-sales-key-jobs').innerHTML = renderKeyJobsList(salesList, salesCount);
      }
      if (document.getElementById('mk-service-key-jobs')) {
        document.getElementById('mk-service-key-jobs').innerHTML = renderKeyJobsList(serviceList, serviceCount);
      }
      if (document.getElementById('mk-admin-key-jobs')) {
        document.getElementById('mk-admin-key-jobs').innerHTML = renderKeyJobsList(adminList, adminCount);
      }

      // 3. Continuous Multi-Segment Pill Bar (Komposisi Fungsi Kerja)
      const barSales = document.getElementById('mk-bar-sales');
      const barService = document.getElementById('mk-bar-service');
      const barAdmin = document.getElementById('mk-bar-admin');

      if (barSales) {
        barSales.style.width = `${Math.max(12, salesPct)}%`;
        const text = document.getElementById('mk-bar-sales-text');
        if (text) text.textContent = `${salesPct}% (${salesCount} Org)`;
      }
      if (barService) {
        barService.style.width = `${Math.max(12, servicePct)}%`;
        const text = document.getElementById('mk-bar-service-text');
        if (text) text.textContent = `${servicePct}% (${serviceCount} Org)`;
      }
      if (barAdmin) {
        barAdmin.style.width = `${Math.max(12, adminPct)}%`;
        const text = document.getElementById('mk-bar-admin-text');
        if (text) text.textContent = `${adminPct}% (${adminCount} Org)`;
      }

      // 4. Semua Jabatan & Collapsible List
      const allJobsMap = {};
      sourceList.forEach(e => {
        let jt = (getRowCellValue(e, 'Job Title', SCHEMAS.Master_Karyawan) || e.jabatan || 'Staff').trim();
        if (!jt || jt === '-' || jt === 'undefined') jt = 'Staff';
        allJobsMap[jt] = (allJobsMap[jt] || 0) + 1;
      });

      const sortedAllJobs = Object.entries(allJobsMap).sort((a, b) => b[1] - a[1]);
      const otherJobs = sortedAllJobs.slice(3); // Di luar 3 jabatan teratas
      const otherJobsCount = otherJobs.length;

      if (document.getElementById('mk-text-other-jobs')) {
        document.getElementById('mk-text-other-jobs').textContent = `Tampilkan ${otherJobsCount} Jabatan Lainnya`;
      }

      const otherJobsGrid = document.getElementById('mk-other-jobs-grid');
      if (otherJobsGrid) {
        if (!otherJobs.length) {
          otherJobsGrid.innerHTML = `<div class="col-span-full text-slate-400 text-xs text-center py-2">Semua jabatan telah tertera di atas.</div>`;
        } else {
          otherJobsGrid.innerHTML = otherJobs.map(([jt, count]) => {
            const pct = totalEmployees ? Math.round((count / totalEmployees) * 100) : 0;
            const pilar = classifyEmployeePilar({ 'Job Title': jt });
            const badgeColor = pilar === 'Sales' ? 'bg-rose-50 text-rose-600 border-rose-200' : (pilar === 'Service' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200');
            return `
              <div onclick="filterBySpecificJob('${jt.replace(/'/g, "\\'")}')" class="p-2 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 hover:shadow-2xs transition cursor-pointer flex flex-col justify-between">
                <div class="flex items-center justify-between gap-1 mb-1">
                  <span class="px-1.5 py-0.2 rounded text-[9px] font-bold ${badgeColor} border">${pilar}</span>
                  <span class="text-[10px] font-black text-slate-700">${pct}%</span>
                </div>
                <div class="font-bold text-xs text-slate-800 truncate" title="${jt}">${jt}</div>
                <div class="text-[10px] text-slate-400 font-medium mt-0.5">${count} Orang</div>
              </div>
            `;
          }).join('');
        }
      }

      // 5. Rasio Tenaga Penjual vs Support
      const supportCount = serviceCount + adminCount;
      const salesRatio = totalEmployees ? Math.round((salesCount / totalEmployees) * 100) : 0;
      const supportRatio = totalEmployees ? (100 - salesRatio) : 0;

      if (document.getElementById('mk-sales-ratio-text')) {
        document.getElementById('mk-sales-ratio-text').textContent = `${salesRatio}% : ${supportRatio}%`;
      }
      if (document.getElementById('mk-sales-ratio-detail')) {
        document.getElementById('mk-sales-ratio-detail').textContent = `(${salesCount} Sales : ${supportCount} Support)`;
      }

      // 6. Status Kepegawaian & Multi-segment Donut Chart SVG (Mencakup Semua Kategori Kontrak)
      const contractGroupMap = {};
      STANDARD_CONTRACT_CATEGORIES.forEach(cat => {
        contractGroupMap[cat] = 0;
      });

      sourceList.forEach(e => {
        const raw = String(getRowCellValue(e, 'Contract', SCHEMAS.Master_Karyawan) || e.Contract || e.tipeKontrak || 'Tetap / Permanent').trim();
        const norm = normalizeContractCategory(raw);
        contractGroupMap[norm] = (contractGroupMap[norm] || 0) + 1;
      });

      const contractMetaConfig = {
        'Tetap / Permanent': { name: 'Tetap', fullName: 'Tetap / Permanent', color: '#2563eb' },
        'Kontrak / PKWT': { name: 'PKWT', fullName: 'Kontrak / PKWT', color: '#f59e0b' },
        'On probation': { name: 'Probation', fullName: 'On probation', color: '#f97316' },
        'Magang/Intern': { name: 'Magang', fullName: 'Magang/Intern', color: '#10b981' },
        'Contracters': { name: 'Mitra', fullName: 'Contracters', color: '#8b5cf6' }
      };

      const fallbackColors = ['#06b6d4', '#ec4899', '#84cc16', '#64748b'];
      let fallbackColorIdx = 0;

      const activeContractList = [];
      Object.keys(contractGroupMap).forEach(catKey => {
        const count = contractGroupMap[catKey] || 0;
        // Selalu tampilkan Tetap & PKWT, serta kategori lain yang jumlahnya > 0
        if (count > 0 || catKey === 'Tetap / Permanent' || catKey === 'Kontrak / PKWT') {
          let meta = contractMetaConfig[catKey];
          if (!meta) {
            meta = {
              name: catKey.length > 12 ? catKey.slice(0, 11) + '..' : catKey,
              fullName: catKey,
              color: fallbackColors[fallbackColorIdx++ % fallbackColors.length]
            };
          }
          const pct = totalEmployees ? Math.round((count / totalEmployees) * 100) : 0;
          activeContractList.push({
            key: catKey,
            name: meta.name,
            fullName: meta.fullName,
            color: meta.color,
            count: count,
            pct: pct
          });
        }
      });

      // Urutkan: Tetap pertama, PKWT kedua, lalu kategori lain berdasarkan jumlah terbanyak
      activeContractList.sort((a, b) => {
        if (a.key === 'Tetap / Permanent') return -1;
        if (b.key === 'Tetap / Permanent') return 1;
        if (a.key === 'Kontrak / PKWT') return -1;
        if (b.key === 'Kontrak / PKWT') return 1;
        return b.count - a.count;
      });

      // Render daftar status kontrak ke DOM
      const contractListContainer = document.getElementById('mk-contract-status-list');
      if (contractListContainer) {
        contractListContainer.innerHTML = activeContractList.map(item => {
          let pctIdAttr = '';
          let cntIdAttr = '';
          if (item.key === 'Tetap / Permanent') {
            pctIdAttr = 'id="mk-stat-tetap-pct"';
            cntIdAttr = 'id="mk-stat-tetap-cnt"';
          } else if (item.key === 'Kontrak / PKWT') {
            pctIdAttr = 'id="mk-stat-pkwt-pct"';
            cntIdAttr = 'id="mk-stat-pkwt-cnt"';
          }
          return `
            <div class="flex items-center justify-between gap-1.5 text-[11px] leading-tight py-0.5 px-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer group" onclick="filterBySpecificContract('${item.fullName}')" title="Klik untuk memfilter: ${item.fullName}">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="w-2 h-2 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform" style="background-color: ${item.color}"></span>
                <span class="text-slate-600 font-semibold truncate text-[11px]">${item.name}</span>
              </div>
              <div class="flex items-center gap-1 text-right flex-shrink-0">
                <span ${pctIdAttr} class="font-extrabold text-slate-800 text-[11px]">${item.pct}%</span>
                <span ${cntIdAttr} class="text-[10px] text-slate-400 font-medium">(${item.count} Org)</span>
              </div>
            </div>
          `;
        }).join('');
      }

      // Backwards compatibility for old element IDs if referenced elsewhere
      const countTetap = contractGroupMap['Tetap / Permanent'] || 0;
      const countPKWT = contractGroupMap['Kontrak / PKWT'] || 0;
      const pctTetap = totalEmployees ? Math.round((countTetap / totalEmployees) * 100) : 0;
      const pctPKWT = totalEmployees ? Math.round((countPKWT / totalEmployees) * 100) : 0;
      if (document.getElementById('mk-card-tetap')) document.getElementById('mk-card-tetap').textContent = countTetap;
      if (document.getElementById('mk-card-pkwt')) document.getElementById('mk-card-pkwt').textContent = countPKWT;
      if (document.getElementById('mk-card-tetap-pct')) document.getElementById('mk-card-tetap-pct').textContent = `${pctTetap}%`;
      if (document.getElementById('mk-card-pkwt-pct')) document.getElementById('mk-card-pkwt-pct').textContent = `${pctPKWT}%`;

      // Render Multi-segment Donut Chart SVG
      const donutContainer = document.getElementById('mk-donut-chart-container');
      if (donutContainer) {
        if (!totalEmployees) {
          donutContainer.innerHTML = `
            <svg class="w-14 h-14" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="15.9155" stroke="#f1f5f9" stroke-width="4.5" fill="none" />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span class="text-[10px] font-bold text-slate-300">0</span>
            </div>
          `;
        } else {
          let accumulatedPct = 0;
          const slices = activeContractList.filter(item => item.count > 0).map(item => {
            const exactPct = (item.count / totalEmployees) * 100;
            const dashArray = `${exactPct.toFixed(2)} ${(100 - exactPct).toFixed(2)}`;
            const dashOffset = (-accumulatedPct).toFixed(2);
            accumulatedPct += exactPct;
            return `<circle cx="21" cy="21" r="15.9155" stroke="${item.color}" stroke-width="4.5" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}" fill="none" class="transition-all duration-500"></circle>`;
          }).join('');

          donutContainer.innerHTML = `
            <svg class="w-14 h-14 transform -rotate-90" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="15.9155" stroke="#f1f5f9" stroke-width="4.5" fill="none" />
              ${slices}
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span class="text-[10px] font-black text-slate-800 leading-none">${totalEmployees}</span>
              <span class="text-[7.5px] font-bold text-slate-400 leading-none mt-0.5">Pegawai</span>
            </div>
          `;
        }
      }

      // 7. Jabatan Terbanyak (Top 4)
      const top4Jobs = sortedAllJobs.slice(0, 4);
      const top1Count = top4Jobs[0] ? top4Jobs[0][1] : 1;
      const rankColors = [
        { badge: 'bg-rose-500', bar: 'bg-rose-500' },
        { badge: 'bg-blue-500', bar: 'bg-blue-500' },
        { badge: 'bg-amber-500', bar: 'bg-amber-400' },
        { badge: 'bg-indigo-500', bar: 'bg-indigo-500' }
      ];

      const top4Container = document.getElementById('mk-top4-jobs-container');
      if (top4Container) {
        if (!top4Jobs.length) {
          top4Container.innerHTML = `<div class="text-slate-400 text-xs text-center py-4">Belum ada data jabatan</div>`;
        } else {
          top4Container.innerHTML = top4Jobs.map(([jt, count], idx) => {
            const color = rankColors[idx] || rankColors[0];
            const pct = totalEmployees ? Math.round((count / totalEmployees) * 100) : 0;
            const barWidth = Math.min(100, Math.round((count / top1Count) * 100));
            return `
              <div onclick="filterBySpecificJob('${jt.replace(/'/g, "\\'")}')" class="flex items-center justify-between gap-3 text-xs p-1 rounded-xl hover:bg-slate-50 transition cursor-pointer">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <span class="w-5 h-5 rounded-full ${color.badge} text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">${idx + 1}</span>
                  <span class="font-semibold text-slate-700 truncate" title="${jt}">${jt}</span>
                </div>
                <div class="flex items-center gap-2.5 flex-shrink-0">
                  <div class="text-right">
                    <span class="font-bold text-slate-800 text-xs">${count} Org</span>
                    <span class="text-slate-400 text-[11px]">(${pct}%)</span>
                  </div>
                  <div class="w-20 sm:w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                    <div class="${color.bar} h-full rounded-full transition-all duration-300" style="width: ${barWidth}%;"></div>
                  </div>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      // 8. Datalist Opsi Pencarian Cepat Jabatan
      const datalistEl = document.getElementById('mk-job-suggestions');
      if (datalistEl) {
        datalistEl.innerHTML = sortedAllJobs.map(([jt]) => `<option value="${jt}"></option>`).join('');
      }

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
      const optionsArray = Array.from(select.options || []).map(o => o.value);
      select.value = optionsArray.includes(currentVal) ? currentVal : 'ALL';
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
      } else {
        list = list.filter(e => isLampungBranch(e));
      }

      // 3. Filter Pilar Utama (Sales / Service / Admin) jika aktif
      if (activePilarFilter) {
        list = list.filter(e => classifyEmployeePilar(e) === activePilarFilter);
      }

      // 4. Pencarian Cepat Jabatan jika diisi
      if (quickJobSearchQuery) {
        const qj = quickJobSearchQuery.toLowerCase();
        list = list.filter(e => {
          const jt = String(getRowCellValue(e, 'Job Title', SCHEMAS.Master_Karyawan) || e.jabatan || '').toLowerCase();
          return jt.includes(qj);
        });
      }

      // 5. Filter pencarian teks bebas (NPK, nama, cabang, dsb.)
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

      // 6. Filter status kepegawaian / kontrak
      if (contractFilter !== 'ALL') {
        const targetNorm = normalizeContractCategory(contractFilter).toLowerCase();
        list = list.filter(e => {
          const raw = String((typeof getRowCellValue === 'function' ? getRowCellValue(e, 'Contract', SCHEMAS.Master_Karyawan) : '') || e['Contract'] || e.Contract || e.tipeKontrak || 'Tetap / Permanent').trim();
          const rawNorm = normalizeContractCategory(raw).toLowerCase();
          return rawNorm === targetNorm || raw.toLowerCase() === contractFilter.toLowerCase() || targetNorm.includes(raw.toLowerCase()) || rawNorm.includes(contractFilter.toLowerCase());
        });
      }

      // Update counters
      if (document.getElementById('mk-badge-total-karyawan')) {
        document.getElementById('mk-badge-total-karyawan').textContent = `Total: ${list.length} Karyawan`;
      }
      if (document.getElementById('mk-row-count')) {
        document.getElementById('mk-row-count').textContent = `Menampilkan ${list.length} dari ${rawRows.length} karyawan`;
      }

      // Handle Card View Mode
      if (currentMKViewMode === 'card') {
        renderMasterKaryawanCards(list, rawRows);
        return;
      }

      // TABLE VIEW MODE:
      const isFull = columnViewMode.mk === 'FULL';
      if (isFull) {
        // Mode Kolom Penuh SAP (20 Kolom)
        let rawCols = SCHEMAS.Master_Karyawan.columns.slice();
        if (!isAdmin) {
          rawCols = rawCols.filter(c => c !== 'Tanggal_Resign' && c !== 'Alasan_Resign');
        }
        let cols = ["No", ...rawCols.filter(c => c !== 'No')];
        renderTableHeader('mk-table-header', cols, true);

        const tbody = document.getElementById('mk-table-body');
        if (!list.length) {
          tbody.innerHTML = `<tr><td colspan="${cols.length + 1}" class="text-center py-8 text-slate-400">Tidak ada data master karyawan yang sesuai filter.</td></tr>`;
          return;
        }

        tbody.innerHTML = list.map((row, rowIdx) => {
          const realIdx = rawRows.indexOf(row);
          const targetIdx = realIdx !== -1 ? realIdx : rowIdx;

          const cells = cols.map((col, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            let stickyClass = 'text-slate-600 border-b border-slate-100';
            if (isFirst) {
              stickyClass = 'sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-b border-r border-slate-200/80 font-mono font-bold text-slate-700 text-center w-12 min-w-[48px] max-w-[48px] transition-colors';
            } else if (isSecond) {
              stickyClass = 'sticky left-12 bg-white group-hover:bg-slate-50 z-10 border-b border-r border-slate-200/80 font-mono font-bold text-slate-800 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.06)] min-w-[120px] whitespace-nowrap transition-colors';
            }

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
          return `<tr class="hover:bg-slate-50/80 transition-colors group">${cells}${actionCell}</tr>`;
        }).join('');
      } else {
        // Mode Bersih Modern (100% Identik Screenshot)
        // Kolom: No., Nama Karyawan, Jabatan, Fungsi, Status, Cabang, Tanggal Bergabung, Aksi
        const thead = document.getElementById('mk-table-header');
        if (thead) {
          thead.innerHTML = `
            <th class="py-3 px-3 text-center w-12 min-w-[48px] max-w-[48px] sticky left-0 bg-slate-100 z-30 border-b border-r border-slate-200/80">No.</th>
            <th class="py-3 px-3 sm:px-4 text-left sticky left-12 bg-slate-100 z-30 min-w-[190px] sm:min-w-[220px] max-w-[260px] border-b border-r border-slate-200/80 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.06)]">Nama Karyawan</th>
            <th class="py-3 px-4 min-w-[140px] border-b border-slate-200">Jabatan</th>
            <th class="py-3 px-3 text-center min-w-[90px] border-b border-slate-200">Fungsi</th>
            <th class="py-3 px-3 text-center min-w-[90px] border-b border-slate-200">Status</th>
            <th class="py-3 px-4 min-w-[130px] border-b border-slate-200">Cabang</th>
            <th class="py-3 px-4 min-w-[130px] border-b border-slate-200">Tanggal Bergabung</th>
            <th class="py-3 px-4 text-center min-w-[90px] border-b border-slate-200">Aksi</th>
          `;
        }

        const tbody = document.getElementById('mk-table-body');
        if (!list.length) {
          tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-400">Tidak ada data master karyawan yang sesuai filter.</td></tr>`;
          return;
        }

        tbody.innerHTML = list.map((row, rowIdx) => {
          const realIdx = rawRows.indexOf(row);
          const npk = safeString(row['Personnel no.'] || row['NPK'] || row.npk || '-');
          const nama = row['Last name'] || row['Nama'] || row['Nama Lengkap'] || row.nama || '-';
          const initials = nama.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'K';
          const jabatan = (getRowCellValue(row, 'Job Title', SCHEMAS.Master_Karyawan) || row.jabatan || '-').trim();
          const pilar = classifyEmployeePilar(row);
          const cabang = row['P.subarea'] || row['Cabang'] || row.cabang || '-';
          
          const rawContract = String(getRowCellValue(row, 'Contract', SCHEMAS.Master_Karyawan) || row['Contract'] || 'Tetap').trim();
          const rawStatusKaryawan = String(row['Status_Karyawan'] || row['Status Karyawan'] || row.statusKaryawan || 'Aktif').trim();
          
          const dateVal = (typeof getRowCellValue === 'function' ? getRowCellValue(row, 'Date', SCHEMAS.Master_Karyawan) : '') || row['Date'] || row['Tanggal'] || row.joinDate || (typeof findDate === 'function' ? findDate(row) : '');
          const formattedDate = dateVal ? formatDatabaseDate(dateVal) : '-';

          // Badge Pilar Fungsi
          let pilarBadge = '';
          if (pilar === 'Sales') {
            pilarBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">Sales</span>`;
          } else if (pilar === 'Service') {
            pilarBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">Service</span>`;
          } else {
            pilarBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Admin</span>`;
          }

          // Badge Status Kepegawaian
          let statusBadge = '';
          if (rawStatusKaryawan.toLowerCase() === 'resign') {
            statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">Resign</span>`;
          } else if (rawContract.toLowerCase().includes('tetap') || rawContract.toLowerCase().includes('permanent')) {
            statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Tetap</span>`;
          } else if (rawContract.toLowerCase().includes('pkwt') || rawContract.toLowerCase().includes('kontrak')) {
            statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">PKWT</span>`;
          } else {
            statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">${rawContract}</span>`;
          }

          const actionCell = renderRowActionCell('Master_Karyawan', realIdx !== -1 ? realIdx : 0, row);

          return `
            <tr class="hover:bg-slate-50/80 transition-colors group">
              <td class="py-2.5 px-3 text-center font-bold text-slate-500 sticky left-0 bg-white group-hover:bg-slate-50 z-10 w-12 min-w-[48px] max-w-[48px] border-b border-r border-slate-200/80 transition-colors">${rowIdx + 1}</td>
              <td class="py-2.5 px-3 sm:px-4 whitespace-nowrap sticky left-12 bg-white group-hover:bg-slate-50 z-10 min-w-[190px] sm:min-w-[220px] max-w-[260px] border-b border-r border-slate-200/80 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.06)] transition-colors">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 flex-shrink-0">
                    ${initials}
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-slate-800 text-xs truncate max-w-[130px] sm:max-w-[170px]" title="${nama}">${nama}</div>
                    <div class="text-[10px] text-slate-400 font-mono">NPK: ${npk}</div>
                  </div>
                </div>
              </td>
              <td class="py-2.5 px-4 whitespace-nowrap font-medium text-slate-700 border-b border-slate-100">${jabatan}</td>
              <td class="py-2.5 px-3 text-center whitespace-nowrap border-b border-slate-100">${pilarBadge}</td>
              <td class="py-2.5 px-3 text-center whitespace-nowrap border-b border-slate-100">${statusBadge}</td>
              <td class="py-2.5 px-4 whitespace-nowrap text-slate-600 border-b border-slate-100">${cabang}</td>
              <td class="py-2.5 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px] border-b border-slate-100">${formattedDate}</td>
              ${actionCell}
            </tr>
          `;
        }).join('');
      }
    }

    function renderMasterKaryawanCards(list, rawRows) {
      const container = document.getElementById('mk-card-view-wrapper');
      if (!container) return;
      if (!list.length) {
        container.innerHTML = `
          <div class="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-card">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-xl mb-3">
              <i class="fa-solid fa-users-slash"></i>
            </div>
            <h5 class="text-sm font-bold text-slate-700">Tidak ada data karyawan</h5>
            <p class="text-xs text-slate-400 mt-1">Data tidak ditemukan sesuai kata kunci atau filter yang dipilih.</p>
          </div>
        `;
        return;
      }

      const isAdmin = isUserAdmin(loggedInUser);

      container.innerHTML = list.map((row) => {
        const realIdx = rawRows.indexOf(row);
        const npk = safeString(row['Personnel no.'] || row['NPK'] || row.npk || '-');
        const nama = row['Last name'] || row['Nama'] || row['Nama Lengkap'] || row.nama || '-';
        const initials = nama.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'K';
        const jabatan = (getRowCellValue(row, 'Job Title', SCHEMAS.Master_Karyawan) || row.jabatan || '-').trim();
        const pilar = classifyEmployeePilar(row);
        const cabang = row['P.subarea'] || row['Cabang'] || row.cabang || '-';
        const rawContract = String(getRowCellValue(row, 'Contract', SCHEMAS.Master_Karyawan) || row['Contract'] || 'Tetap').trim();
        const rawStatus = String(row['Status_Karyawan'] || row['Status Karyawan'] || row.statusKaryawan || 'Aktif').trim();
        const isResign = rawStatus.toLowerCase() === 'resign';
        
        const dateVal = (typeof getRowCellValue === 'function' ? getRowCellValue(row, 'Date', SCHEMAS.Master_Karyawan) : '') || row['Date'] || row['Tanggal'] || row.joinDate || (typeof findDate === 'function' ? findDate(row) : '');
        const formattedDate = dateVal ? formatDatabaseDate(dateVal) : '-';

        // Styling visual warna sesuai 3 Pilar DSO
        let pilarStyle = {
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          avatarBg: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-200',
          borderHover: 'hover:border-rose-300 hover:shadow-rose-100/60',
          bgTop: 'from-rose-50/50 via-white to-white',
          icon: 'fa-solid fa-bullhorn text-rose-500',
          iconBg: 'bg-rose-50 border-rose-100/60'
        };

        if (pilar === 'Service') {
          pilarStyle = {
            badge: 'bg-blue-50 text-blue-700 border-blue-200',
            avatarBg: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200',
            borderHover: 'hover:border-blue-300 hover:shadow-blue-100/60',
            bgTop: 'from-blue-50/50 via-white to-white',
            icon: 'fa-solid fa-wrench text-blue-500',
            iconBg: 'bg-blue-50 border-blue-100/60'
          };
        } else if (pilar === 'Admin') {
          pilarStyle = {
            badge: 'bg-amber-50 text-amber-800 border-amber-200',
            avatarBg: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-200',
            borderHover: 'hover:border-amber-300 hover:shadow-amber-100/60',
            bgTop: 'from-amber-50/50 via-white to-white',
            icon: 'fa-solid fa-briefcase text-amber-600',
            iconBg: 'bg-amber-50 border-amber-100/60'
          };
        }

        // Status badge styling
        let contractBadge = 'bg-slate-100 text-slate-700 border-slate-200';
        const normC = normalizeContractCategory(rawContract).toLowerCase();
        if (isResign) {
          contractBadge = 'bg-rose-100 text-rose-800 border-rose-200';
        } else if (normC.includes('tetap') || normC.includes('permanent')) {
          contractBadge = 'bg-blue-50 text-blue-700 border-blue-200';
        } else if (normC.includes('pkwt') || normC.includes('kontrak')) {
          contractBadge = 'bg-amber-50 text-amber-700 border-amber-200';
        } else if (normC.includes('probation')) {
          contractBadge = 'bg-orange-50 text-orange-700 border-orange-200';
        } else if (normC.includes('magang') || normC.includes('intern')) {
          contractBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        }

        return `
          <div class="bg-gradient-to-b ${pilarStyle.bgTop} rounded-2xl p-4 sm:p-4.5 border border-slate-200/90 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden cursor-pointer" onclick="openPBKModal('${npk}')">
            <!-- Decorative corner accent -->
            <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-200/20 to-transparent rounded-bl-3xl pointer-events-none"></div>

            <div>
              <!-- Top Row: Avatar + Name + Badges -->
              <div class="flex items-start justify-between gap-2.5 mb-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-11 h-11 rounded-2xl ${pilarStyle.avatarBg} font-black text-sm flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                    ${initials}
                  </div>
                  <div class="min-w-0">
                    <h5 class="text-xs sm:text-sm font-extrabold text-slate-800 truncate leading-snug group-hover:text-blue-600 transition-colors" title="${nama}">
                      ${nama}
                    </h5>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="text-[10px] font-mono text-slate-400 font-bold">NPK ${npk}</span>
                      ${isResign ? '<span class="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-100 text-rose-700">Resign</span>' : ''}
                    </div>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1 flex-shrink-0">
                  <span class="px-2 py-0.5 rounded-full text-[9.5px] font-bold ${pilarStyle.badge} border shadow-2xs">
                    ${pilar}
                  </span>
                </div>
              </div>

              <!-- Job Title Banner Card -->
              <div class="p-2.5 rounded-xl bg-white/90 border border-slate-200/70 shadow-2xs mb-3 flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg ${pilarStyle.iconBg} border flex items-center justify-center text-xs flex-shrink-0">
                  <i class="${pilarStyle.icon}"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block leading-none">Jabatan</span>
                  <span class="text-xs font-bold text-slate-800 truncate block mt-0.5" title="${jabatan}">${jabatan}</span>
                </div>
              </div>

              <!-- Meta Data Grid -->
              <div class="space-y-1.5 text-xs">
                <div class="flex items-center justify-between text-[11px] py-0.5 border-b border-slate-100/80">
                  <span class="text-slate-400 font-medium flex items-center gap-1.5">
                    <i class="fa-solid fa-location-dot text-slate-400 text-[10px] w-3"></i>
                    <span>Cabang</span>
                  </span>
                  <span class="font-bold text-slate-700 truncate max-w-[130px]">${cabang}</span>
                </div>

                <div class="flex items-center justify-between text-[11px] py-0.5 border-b border-slate-100/80">
                  <span class="text-slate-400 font-medium flex items-center gap-1.5">
                    <i class="fa-solid fa-file-contract text-slate-400 text-[10px] w-3"></i>
                    <span>Kontrak</span>
                  </span>
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${contractBadge} border">
                    ${isResign ? 'Resign' : rawContract}
                  </span>
                </div>

                <div class="flex items-center justify-between text-[11px] py-0.5">
                  <span class="text-slate-400 font-medium flex items-center gap-1.5">
                    <i class="fa-solid fa-calendar-day text-slate-400 text-[10px] w-3"></i>
                    <span>Bergabung</span>
                  </span>
                  <span class="font-mono font-semibold text-slate-600 text-[11px]">${formattedDate}</span>
                </div>
              </div>
            </div>

            <!-- Card Bottom Action Bar -->
            <div class="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-1.5" onclick="event.stopPropagation()">
              <button type="button" onclick="openPBKModal('${npk}')" class="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer">
                <i class="fa-solid fa-address-card text-[11px]"></i>
                <span>Profil Karyawan</span>
              </button>
              ${isAdmin ? `
                <button type="button" onclick="openEditRowModal('Master_Karyawan', ${realIdx !== -1 ? realIdx : 0})" class="w-8 h-8 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center transition active:scale-95 cursor-pointer flex-shrink-0" title="Edit Data Karyawan">
                  <i class="fa-solid fa-pen-to-square text-xs"></i>
                </button>
                <button type="button" onclick="openDeleteRowModal('Master_Karyawan', ${realIdx !== -1 ? realIdx : 0})" class="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center justify-center transition active:scale-95 cursor-pointer flex-shrink-0" title="Hapus Data Karyawan">
                  <i class="fa-solid fa-trash text-xs"></i>
                </button>
              ` : ''}
            </div>
          </div>
        `;
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

      // Anomali KPI removed — elements kept hidden, no update needed

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
    // Mode Tampilan Absensi: 'SUMMARY' (Rekap Per Karyawan - Default) atau 'RAW' (Log Harian Mentah)
    let currentAbsViewMode = 'SUMMARY';

    function toggleAbsViewMode() {
      currentAbsViewMode = (currentAbsViewMode === 'SUMMARY') ? 'RAW' : 'SUMMARY';
      const btn = document.getElementById('btn-abs-view-mode');
      const btnText = document.getElementById('btn-abs-view-text');
      const colToggleBtn = document.getElementById('btn-col-toggle-abs');

      if (currentAbsViewMode === 'SUMMARY') {
        if (btn) {
          btn.className = "px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200 shadow-2xs";
        }
        if (btnText) btnText.textContent = "Rekap Per Karyawan";
        if (colToggleBtn) colToggleBtn.classList.add('hidden');
      } else {
        if (btn) {
          btn.className = "px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 shadow-2xs";
        }
        if (btnText) btnText.textContent = "Log Harian Mentah";
        if (colToggleBtn) colToggleBtn.classList.remove('hidden');
      }
      filterAbsensiTable();
    }
    window.toggleAbsViewMode = toggleAbsViewMode;

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
    window.quickFilterAbsensi = quickFilterAbsensi;

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
      } else {
        branchRows = branchRows.filter(e => isLampungBranch(e));
      }

      // Update 5 KPI Cards secara sinkron dengan cabang & periode aktif
      if (typeof updateAbsensiKPICards === 'function') {
        updateAbsensiKPICards(branchRows, compFilter);
      }

      const colToggleBtn = document.getElementById('btn-col-toggle-abs');
      if (colToggleBtn) {
        if (currentAbsViewMode === 'SUMMARY') colToggleBtn.classList.add('hidden');
        else colToggleBtn.classList.remove('hidden');
      }

      // =====================================================================
      // MODE 1: REKAPITULASI PRESENSI PER KARYAWAN (DEFAULT HO & HRD)
      // =====================================================================
      if (currentAbsViewMode === 'SUMMARY') {
        const empMap = new Map();

        branchRows.forEach(r => {
          const npk = safeString(getRowCellValue(r, 'NPK', SCHEMAS.Data_Kehadiran) || r['NPK'] || r['Personnel no.']).trim();
          if (!npk) return;

          if (!empMap.has(npk)) {
            let empName = getRowCellValue(r, 'Employee Name', SCHEMAS.Data_Kehadiran) || r['Employee Name'] || r['Nama'] || '';
            if (!empName || empName === '-' || empName.trim() === '') {
              empName = lookupEmployeeName(npk) || `Karyawan ${npk}`;
            }
            const cabang = getRowCellValue(r, 'Cabang', SCHEMAS.Data_Kehadiran) || r['Cabang'] || r['P.subarea'] || '-';
            const wilayah = getRowCellValue(r, 'Wilayah', SCHEMAS.Data_Kehadiran) || r['Wilayah'] || '-';

            empMap.set(npk, {
              npk,
              nama: empName,
              cabang,
              wilayah,
              totalHari: 0,
              hadirCount: 0,
              onTimeCount: 0,
              lateCount: 0,
              lateMinsTotal: 0,
              lateOver30Count: 0,
              lateOver60Count: 0,
              tanpaKeteranganCount: 0,
              totalWorkHours: 0,
              validWorkHoursCount: 0,
              anomaliCount: 0,
              records: []
            });
          }

          const emp = empMap.get(npk);
          emp.totalHari++;
          emp.records.push(r);

          const rawTime = getRowCellValue(r, 'Time Clock In', SCHEMAS.Data_Kehadiran) || r['Time Clock In'] || r['Clock In'] || r['Time'] || r['Jam Masuk'] || '';
          const existingEstimasi = getRowCellValue(r, 'Status Kehadiran', SCHEMAS.Data_Kehadiran) || r['Status Kehadiran'] || r['Estimasi Telat (Asumsi 08.00)'] || '';
          const lateness = calculateLatenessInfo(existingEstimasi || rawTime);
          const ket = String(getRowCellValue(r, 'Keterangan', SCHEMAS.Data_Kehadiran) || r['Keterangan'] || '').toLowerCase();
          const telatStr = String(existingEstimasi || '').toLowerCase();

          const isLate = lateness.isLate || ket.includes('terlambat') || ket.includes('telat') || telatStr.includes('telat');
          const isOnTime = (!isLate && lateness.hasClockIn) || ket.includes('tepat') || telatStr.includes('tepat');

          if (lateness.hasClockIn) {
            emp.hadirCount++;
            if (isLate) {
              emp.lateCount++;
              const mins = lateness.diffMinutes > 0 ? lateness.diffMinutes : 15;
              emp.lateMinsTotal += mins;
              if (mins > 60 || (lateness.lateHours && lateness.lateHours >= 1)) {
                emp.lateOver60Count++;
              } else if (mins > 30) {
                emp.lateOver30Count++;
              }
            } else {
              emp.onTimeCount++;
            }
          } else {
            emp.tanpaKeteranganCount++;
          }

          const whRaw = getRowCellValue(r, 'Durasi Kerja (Work Hours)', SCHEMAS.Data_Kehadiran) || r['Durasi Kerja (Work Hours)'] || r['Work Hours'] || r['Durasi Kerja'];
          const wh = safeFloat(whRaw, 0);
          if (wh > 0) {
            emp.totalWorkHours += wh;
            emp.validWorkHoursCount++;
          }

          const needApp = String(getRowCellValue(r, 'Need CICO Approval', SCHEMAS.Data_Kehadiran) || r['Need CICO Approval'] || '').toUpperCase().trim() === 'YES';
          const radIn = String(getRowCellValue(r, 'In Radius Clock in', SCHEMAS.Data_Kehadiran) || r['In Radius Clock in'] || '').toUpperCase().trim() === 'NO';
          const radOut = String(getRowCellValue(r, 'In Radius Clock Out', SCHEMAS.Data_Kehadiran) || r['In Radius Clock Out'] || '').toUpperCase().trim() === 'NO';
          const clockOut = getRowCellValue(r, 'Time Clock Out', SCHEMAS.Data_Kehadiran) || r['Time Clock Out'];
          const noClockOut = lateness.hasClockIn && (!clockOut || clockOut === '-' || String(clockOut).trim() === '');
          if (needApp || radIn || radOut || noClockOut) {
            emp.anomaliCount++;
          }
        });

        let empList = Array.from(empMap.values());
        empList.forEach(emp => {
          emp.kehadiranPct = emp.totalHari > 0 ? Math.round((emp.hadirCount / emp.totalHari) * 100) : 0;
          emp.avgHours = emp.validWorkHoursCount > 0 ? (emp.totalWorkHours / emp.validWorkHoursCount).toFixed(1) : (emp.hadirCount > 0 ? '8.0' : '0.0');
        });

        // Filter pencarian teks
        if (q) {
          empList = empList.filter(emp =>
            emp.npk.toLowerCase().includes(q) ||
            emp.nama.toLowerCase().includes(q) ||
            emp.cabang.toLowerCase().includes(q)
          );
        }

        // Filter status kepatuhan & jam kerja
        if (compFilter !== 'ALL') {
          empList = empList.filter(emp => {
            if (compFilter === 'ON_TIME' || compFilter === 'Hadir Tepat Waktu') return emp.onTimeCount > 0 && emp.lateCount === 0;
            if (compFilter === 'LATE' || compFilter === 'Terlambat') return emp.lateCount > 0;
            if (compFilter === 'NO_INFO' || compFilter === 'Tanpa Keterangan' || compFilter === 'ALPHA' || compFilter === 'Alpha') return emp.tanpaKeteranganCount > 0;
            if (compFilter === 'LATE_30') return emp.lateOver30Count > 0 || emp.lateOver60Count > 0;
            if (compFilter === 'LATE_60') return emp.lateOver60Count > 0;
            if (compFilter === 'UNDER_HOURS') return parseFloat(emp.avgHours) < 8.0 && emp.hadirCount > 0;
            if (compFilter === 'NEED_APPROVAL') return emp.anomaliCount > 0;
            return true;
          });
        }

        empList.sort((a, b) => a.nama.localeCompare(b.nama));

        const summaryCols = [
          "No",
          "NPK",
          "Nama Karyawan",
          "Cabang",
          "Total Hari",
          "Masuk (Hadir)",
          "Tepat Waktu",
          "Terlambat",
          "Tanpa Keterangan",
          "% Kehadiran",
          "Rata-rata Jam Kerja"
        ];

        renderTableHeader('abs-table-header', summaryCols, true, 'Detail Log');

        const tbody = document.getElementById('abs-table-body');
        if (document.getElementById('abs-row-count')) {
          document.getElementById('abs-row-count').textContent = `Menampilkan ${empList.length} dari ${empMap.size} Karyawan (Rekap Kehadiran Juni 2026)`;
        }

        if (!empList.length) {
          tbody.innerHTML = `<tr><td colspan="${summaryCols.length + 1}" class="text-center py-8 text-slate-400">Tidak ada rekap karyawan yang sesuai filter.</td></tr>`;
          return;
        }

        tbody.innerHTML = empList.map((emp, rowIdx) => {
          const pctClass = emp.kehadiranPct >= 95 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : (emp.kehadiranPct >= 85 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200');

          const lateBadge = emp.lateCount > 0 
            ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200"><i class="fa-solid fa-clock text-[10px]"></i> ${emp.lateCount}x</span>`
            : `<span class="text-slate-400 font-semibold text-xs">0x</span>`;

          const noInfoBadge = emp.tanpaKeteranganCount > 0
            ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200"><i class="fa-solid fa-circle-question text-[10px]"></i> ${emp.tanpaKeteranganCount} Hari</span>`
            : `<span class="text-slate-400 font-semibold text-xs">0 Hari</span>`;

          const avatarInitials = (emp.nama || 'KA').replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'KA';

          return `
            <tr class="hover:bg-slate-50/80 transition-colors group">
              <td class="py-2.5 px-3 whitespace-nowrap sticky left-0 bg-white group-hover:bg-slate-50 z-20 border-b border-r border-slate-200/80 font-mono font-bold text-slate-500 text-center w-12 min-w-[48px] max-w-[48px] transition-colors">${rowIdx + 1}</td>
              <td class="py-2.5 px-3 whitespace-nowrap border-b border-slate-100 font-mono font-bold text-slate-700 w-20 min-w-[80px] max-w-[80px] transition-colors">${emp.npk}</td>
              <td class="py-2.5 px-3 sm:px-4 whitespace-nowrap sticky left-12 bg-white group-hover:bg-slate-50 z-10 border-b border-r border-slate-200/80 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.06)] min-w-[150px] sm:min-w-[180px] transition-colors">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-red-50 text-red-600 font-black text-[10px] flex items-center justify-center border border-red-100 flex-shrink-0 shadow-2xs">
                    ${avatarInitials}
                  </div>
                  <div class="min-w-0">
                    <span class="font-bold text-slate-900 block truncate leading-tight text-xs sm:text-sm max-w-[130px] sm:max-w-[160px]" title="${emp.nama}">${emp.nama}</span>
                    <span class="text-[10px] text-slate-400 font-medium block truncate mt-0.5">NPK: ${emp.npk}</span>
                  </div>
                </div>
              </td>
              <td class="py-2.5 px-3 sm:px-4 whitespace-nowrap border-b border-slate-100">
                <span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 whitespace-nowrap">${emp.cabang}</span>
              </td>
              <td class="py-2.5 px-3 sm:px-4 whitespace-nowrap font-bold text-slate-800 text-center border-b border-slate-100">${emp.totalHari} Hari</td>
              <td class="py-2.5 px-3 sm:px-4 whitespace-nowrap text-center border-b border-slate-100">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <i class="fa-solid fa-circle-check text-[10px]"></i> ${emp.hadirCount} Hari
                </span>
              </td>
              <td class="py-2.5 px-3 sm:px-4 whitespace-nowrap font-bold text-emerald-700 text-center border-b border-slate-100">${emp.onTimeCount}x</td>
              <td class="py-2.5 px-3 sm:px-4 whitespace-nowrap text-center border-b border-slate-100">${lateBadge}</td>
              <td class="py-2.5 px-3 sm:px-4 whitespace-nowrap text-center border-b border-slate-100">${noInfoBadge}</td>
              <td class="py-2.5 px-3 sm:px-4 whitespace-nowrap text-center border-b border-slate-100">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-extrabold border ${pctClass}">
                  ${emp.kehadiranPct}%
                </span>
              </td>
              <td class="py-2.5 px-3 sm:px-4 whitespace-nowrap font-bold text-slate-800 text-center border-b border-slate-100">${emp.avgHours} Jam</td>
              <td class="py-2.5 px-3 sm:px-4 whitespace-nowrap text-center border-b border-slate-100">
                <button type="button" onclick="openEmployeeAttendanceDetailModal('${emp.npk}')" class="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition shadow-2xs inline-flex items-center gap-1.5 cursor-pointer hover:shadow-xs active:scale-95">
                  <i class="fa-solid fa-calendar-days text-[11px]"></i>
                  <span>Detail Log</span>
                </button>
              </td>
            </tr>
          `;
        }).join('');
        return;
      }

      // =====================================================================
      // MODE 2: LOG HARIAN MENTAH / ROW-LEVEL (ORIGINAL DATABASE ROWS)
      // =====================================================================
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
          if (compFilter === 'NO_INFO' || compFilter === 'Tanpa Keterangan' || compFilter === 'ALPHA' || compFilter === 'Alpha') {
            return !lateness.hasClockIn || lateness.text === 'Tanpa Keterangan' || ket.includes('tanpa keterangan') || ket.includes('tidak clock in');
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
        document.getElementById('abs-row-count').textContent = `Menampilkan ${list.length} dari ${branchRows.length} data absensi (Log Harian Mentah • ${cols.length} kolom)`;
      }

      if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="${cols.length + 1}" class="text-center py-8 text-slate-400">Tidak ada data absensi yang sesuai filter.</td></tr>`;
        return;
      }

      tbody.innerHTML = list.map((row, rowIdx) => {
        const cells = cols.map((col, idx) => {
          const isFirst = idx === 0;
          const isSecond = idx === 1;
          const isThird = idx === 2;

          let stickyClass = 'text-slate-600 border-b border-slate-100';
          if (isFirst) {
            stickyClass = 'sticky left-0 bg-white group-hover:bg-slate-50 z-20 border-b border-r border-slate-200/80 font-mono font-bold text-slate-700 text-center w-12 min-w-[48px] max-w-[48px] transition-colors';
          } else if (isSecond) {
            stickyClass = 'border-b border-slate-100 font-mono font-bold text-slate-700 w-20 min-w-[80px] max-w-[80px] whitespace-nowrap transition-colors';
          } else if (isThird) {
            stickyClass = 'sticky left-12 bg-white group-hover:bg-slate-50 z-10 border-b border-r border-slate-200/80 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.06)] min-w-[150px] sm:min-w-[180px] whitespace-nowrap font-semibold text-slate-900 transition-colors';
          }

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
          if (isThird) {
            const pNo = getRowCellValue(row, 'Personnel no.', SCHEMAS.Data_Kehadiran) || row['Personnel no.'] || row['Personnel No.'] || row['NPK'] || '';
            if (pNo) {
              val = `<div><span class="block truncate max-w-[130px] sm:max-w-[160px]" title="${val}">${val}</span><span class="text-[10px] text-slate-400 font-mono block">NPK: ${pNo}</span></div>`;
            }
          }
          return `<td class="py-2.5 px-4 whitespace-nowrap ${stickyClass}">${val}</td>`;
        }).join('');

        const realIdx = rawRows.indexOf(row);
        const actionCell = renderRowActionCell('Data_Kehadiran', realIdx, row);
        return `<tr class="hover:bg-slate-50/80 transition-colors group">${cells}${actionCell}</tr>`;
      }).join('');
    }

    /**
     * Modal Dialog Detail Presensi Harian Per Karyawan
     */
    function openEmployeeAttendanceDetailModal(targetNpk) {
      if (!currentDashboardPayload || !currentDashboardPayload.rawTables) return;
      const cleanNpk = safeString(targetNpk).trim();
      const rawAbsRows = currentDashboardPayload.rawTables.Data_Kehadiran || [];
      
      const empRecords = rawAbsRows.filter(r => {
        const rNpk = safeString(getRowCellValue(r, 'NPK', SCHEMAS.Data_Kehadiran) || r['NPK'] || r['Personnel no.']).trim();
        return rNpk === cleanNpk;
      });

      // Lookup data identitas karyawan
      let empName = lookupEmployeeName(cleanNpk);
      let empBranch = '-';
      let empRole = '-';

      if (empRecords.length > 0) {
        const firstRow = empRecords[0];
        if (!empName) {
          empName = getRowCellValue(firstRow, 'Employee Name', SCHEMAS.Data_Kehadiran) || firstRow['Employee Name'] || firstRow['Nama'] || `Karyawan ${cleanNpk}`;
        }
        empBranch = getRowCellValue(firstRow, 'Cabang', SCHEMAS.Data_Kehadiran) || firstRow['Cabang'] || '-';
      }

      // Check Master_Karyawan untuk Jabatan/Divisi
      const masterEmp = (currentDashboardPayload.employeeList || []).find(e => safeString(e.npk || e['Personnel no.']).trim() === cleanNpk) ||
                        (currentDashboardPayload.rawTables?.Master_Karyawan || []).find(e => safeString(e['Personnel no.'] || e.npk).trim() === cleanNpk);
      if (masterEmp) {
        if (!empName || empName.startsWith('Karyawan ')) {
          empName = getRowCellValue(masterEmp, 'Last name', SCHEMAS.Master_Karyawan) || masterEmp.nama || empName;
        }
        empBranch = getRowCellValue(masterEmp, 'P.subarea', SCHEMAS.Master_Karyawan) || masterEmp.cabang || empBranch;
        empRole = getRowCellValue(masterEmp, 'Job Title', SCHEMAS.Master_Karyawan) || masterEmp.jabatan || masterEmp.divisi || '-';
      }

      const isResign = masterEmp ? (String(getRowCellValue(masterEmp, 'Status_Karyawan', SCHEMAS.Master_Karyawan) || masterEmp.statusKaryawan || masterEmp.Status_Karyawan || '').trim().toLowerCase() === 'resign') : false;

      // Populate elemen header modal
      const avatarEl = document.getElementById('abs-modal-avatar');
      if (avatarEl) {
        avatarEl.textContent = (empName || 'DA').slice(0, 2).toUpperCase();
        if (isResign) {
          avatarEl.className = "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-700 text-white flex items-center justify-center font-black text-base sm:text-xl shadow-sm ring-2 ring-rose-200 flex-shrink-0";
        } else {
          avatarEl.className = "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base sm:text-xl shadow-sm flex-shrink-0";
        }
      }
      const nameEl = document.getElementById('abs-modal-name');
      if (nameEl) nameEl.textContent = empName;
      const branchEl = document.getElementById('abs-modal-branch');
      if (branchEl) {
        if (isResign) {
          branchEl.className = "px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200";
          branchEl.textContent = `Cabang ${empBranch} • Resign`;
        } else {
          branchEl.className = "px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200";
          branchEl.textContent = `Cabang ${empBranch}`;
        }
      }
      const metaEl = document.getElementById('abs-modal-meta');
      if (metaEl) {
        metaEl.textContent = isResign
          ? `NPK: ${cleanNpk} • Jabatan/Divisi: ${empRole} • [Status: Resign / PPHK]`
          : `NPK: ${cleanNpk} • Jabatan/Divisi: ${empRole}`;
      }

      // Hitung statistik
      let hadirCount = 0;
      let onTimeCount = 0;
      let lateCount = 0;
      let tanpaKeteranganCount = 0;

      // Urutkan rekaman berdasarkan tanggal
      empRecords.sort((a, b) => {
        const dateA = getRowCellValue(a, 'Date', SCHEMAS.Data_Kehadiran) || a['Date'] || '';
        const dateB = getRowCellValue(b, 'Date', SCHEMAS.Data_Kehadiran) || b['Date'] || '';
        return String(dateA).localeCompare(String(dateB));
      });

      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

      const rowsHtml = empRecords.map((r, idx) => {
        const rawDate = getRowCellValue(r, 'Date', SCHEMAS.Data_Kehadiran) || r['Date'] || r['Tanggal'] || '';
        const dateFormatted = formatDatabaseDate(rawDate) || '-';

        let dayName = '-';
        if (rawDate) {
          const parsedDate = parseExcelDate(rawDate);
          if (parsedDate) {
            const dObj = new Date(parsedDate);
            if (!isNaN(dObj.getTime())) {
              dayName = dayNames[dObj.getDay()] || '-';
            }
          }
        }

        const rawTimeIn = getRowCellValue(r, 'Time Clock In', SCHEMAS.Data_Kehadiran) || r['Time Clock In'] || r['Clock In'] || r['Time'] || r['Jam Masuk'] || '';
        const rawStatus = getRowCellValue(r, 'Status Kehadiran', SCHEMAS.Data_Kehadiran) || r['Status Kehadiran'] || '';
        const lateness = calculateLatenessInfo(rawStatus || rawTimeIn);

        const rawTimeOut = getRowCellValue(r, 'Time Clock Out', SCHEMAS.Data_Kehadiran) || r['Time Clock Out'] || r['Jam Pulang'] || '';
        const timeOutFormatted = formatDatabaseTime(rawTimeOut);
        const timeInFormatted = formatDatabaseTime(rawTimeIn);

        const ket = String(getRowCellValue(r, 'Keterangan', SCHEMAS.Data_Kehadiran) || r['Keterangan'] || '').toLowerCase();
        const telatStr = String(rawStatus || '').toLowerCase();
        const isLate = lateness.isLate || ket.includes('terlambat') || ket.includes('telat') || telatStr.includes('telat');

        if (lateness.hasClockIn) {
          hadirCount++;
          if (isLate) lateCount++;
          else onTimeCount++;
        } else {
          tanpaKeteranganCount++;
        }

        const whRaw = getRowCellValue(r, 'Durasi Kerja (Work Hours)', SCHEMAS.Data_Kehadiran) || r['Durasi Kerja (Work Hours)'] || r['Work Hours'] || '';
        const wh = safeFloat(whRaw, 0);
        const durasiText = wh > 0 ? `${wh} Jam` : '-';

        const needApp = String(getRowCellValue(r, 'Need CICO Approval', SCHEMAS.Data_Kehadiran) || r['Need CICO Approval'] || '').toUpperCase().trim() === 'YES';
        const radIn = String(getRowCellValue(r, 'In Radius Clock in', SCHEMAS.Data_Kehadiran) || r['In Radius Clock in'] || '').toUpperCase().trim() === 'NO';
        let radBadge = '<span class="text-slate-400 text-[10px]">Normal</span>';
        if (needApp) {
          radBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Need Approval</span>';
        } else if (radIn) {
          radBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Luar Radius</span>';
        }

        const remarksText = getRowCellValue(r, 'Keterangan', SCHEMAS.Data_Kehadiran) || r['Keterangan'] || '-';

        return `
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="py-2.5 px-3 text-center text-slate-500 font-bold">${idx + 1}</td>
            <td class="py-2.5 px-3 whitespace-nowrap font-medium text-slate-900">${dateFormatted} <span class="text-[10px] text-slate-400 font-normal">(${dayName})</span></td>
            <td class="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-slate-800 text-center">${timeInFormatted}</td>
            <td class="py-2.5 px-3 whitespace-nowrap text-center">${lateness.badgeHtml}</td>
            <td class="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-slate-800 text-center">${timeOutFormatted}</td>
            <td class="py-2.5 px-3 whitespace-nowrap font-bold text-slate-700 text-center">${durasiText}</td>
            <td class="py-2.5 px-3 whitespace-nowrap text-center">${radBadge}</td>
            <td class="py-2.5 px-3 text-slate-600 truncate max-w-[150px]">${remarksText}</td>
          </tr>
        `;
      }).join('');

      const totalDays = empRecords.length;
      const ratePct = totalDays > 0 ? Math.round((hadirCount / totalDays) * 100) : 0;

      if (document.getElementById('abs-modal-rate')) {
        document.getElementById('abs-modal-rate').textContent = `Kehadiran: ${ratePct}%`;
      }
      if (document.getElementById('abs-modal-total-days')) {
        document.getElementById('abs-modal-total-days').textContent = `${totalDays} Hari`;
      }
      if (document.getElementById('abs-modal-hadir')) {
        document.getElementById('abs-modal-hadir').textContent = `${hadirCount} Hari`;
      }
      if (document.getElementById('abs-modal-ontime')) {
        document.getElementById('abs-modal-ontime').textContent = `${onTimeCount}x`;
      }
      if (document.getElementById('abs-modal-late')) {
        document.getElementById('abs-modal-late').textContent = `${lateCount}x`;
      }
      if (document.getElementById('abs-modal-noinfo')) {
        document.getElementById('abs-modal-noinfo').textContent = `${tanpaKeteranganCount} Hari`;
      }

      const tbody = document.getElementById('abs-modal-tbody');
      if (tbody) {
        if (empRecords.length === 0) {
          tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-400">Tidak ada log presensi untuk karyawan ini.</td></tr>`;
        } else {
          tbody.innerHTML = rowsHtml;
        }
      }

      const btnViewRaw = document.getElementById('abs-modal-btn-view-raw');
      if (btnViewRaw) {
        btnViewRaw.onclick = () => showEmployeeInRawAbsensi(cleanNpk);
      }

      const modalEl = document.getElementById('modal-abs-emp-detail');
      if (modalEl) {
        modalEl.classList.remove('hidden');
        if (typeof modalEl.querySelector === 'function') {
          const scrollContainer = modalEl.querySelector('.overflow-y-auto');
          if (scrollContainer) scrollContainer.scrollTop = 0;
        }
      }
    }
    window.openEmployeeAttendanceDetailModal = openEmployeeAttendanceDetailModal;

    function showEmployeeInRawAbsensi(npk) {
      closeModal('modal-abs-emp-detail');
      if (currentAbsViewMode !== 'RAW') {
        toggleAbsViewMode();
      }
      const searchInput = document.getElementById('abs-search-input');
      if (searchInput) {
        searchInput.value = npk;
      }
      filterAbsensiTable();
      if (typeof showToast === 'function') {
        showToast(`Menampilkan log presensi mentah untuk NPK ${npk}`);
      }
    }
    window.showEmployeeInRawAbsensi = showEmployeeInRawAbsensi;

    // ----------------------------------------------------
    // C. Suggestion System / SS (Status Reward Dinamis dari Database)
    // ----------------------------------------------------
    function getSSRewardStatusMeta(statusName) {
      const s = String(statusName || '').toLowerCase().trim();
      
      if (s.includes('ibra') || s.includes('lunas') || s.includes('cair')) {
        return {
          key: 'IBRA / Lunas',
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
      const currentValNorm = currentVal.toLowerCase().replace(/[^a-z0-9]/g, '');

      const standardStatuses = [
        'Proses Penilaian',
        'Berita Acara',
        'BPH',
        'IBRA / Lunas',
        'Revisi',
        'Dikembalikan'
      ];
      
      const filterMap = new Map();
      standardStatuses.forEach(st => {
        const meta = getSSRewardStatusMeta(st);
        filterMap.set(meta.key, meta.displayName);
      });

      rawRows.forEach(r => {
        const rawSt = getRowCellValue(r, 'Status Reward', SCHEMAS.Data_SS) || r['Status Reward'];
        if (rawSt && String(rawSt).trim() && String(rawSt).trim() !== '-') {
          const meta = getSSRewardStatusMeta(rawSt);
          const metaNorm = meta.key.toLowerCase().replace(/[^a-z0-9]/g, '');
          let exists = false;
          filterMap.forEach((_, key) => {
            if (key.toLowerCase().replace(/[^a-z0-9]/g, '') === metaNorm) {
              exists = true;
            }
          });
          if (!exists) {
            filterMap.set(meta.key, meta.displayName);
          }
        }
      });

      let html = `<option value="ALL">Semua Status Reward</option>`;
      filterMap.forEach((displayName, key) => {
        const keyNorm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isSel = (currentValNorm === keyNorm);
        html += `<option value="${key}" ${isSel ? 'selected' : ''}>${displayName}</option>`;
      });

      select.innerHTML = html;
    }

    function selectSSRewardFilter(statusKey) {
      const select = document.getElementById('ss-filter-part');
      if (!select) return;

      const targetNorm = String(statusKey || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const currentNorm = String(select.value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      if (targetNorm === 'all' || targetNorm === currentNorm) {
        select.value = 'ALL';
      } else {
        let matched = false;
        for (let i = 0; i < select.options.length; i++) {
          const optNorm = String(select.options[i].value).toLowerCase().replace(/[^a-z0-9]/g, '');
          if (optNorm === targetNorm) {
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
        'BPH',
        'IBRA / Lunas',
        'Revisi',
        'Dikembalikan'
      ];

      // Gunakan Map kanonikal agar tidak pernah ada duplikasi status
      const canonicalMap = new Map();
      standardStatuses.forEach(st => {
        const meta = getSSRewardStatusMeta(st);
        canonicalMap.set(meta.key, meta);
      });

      // Tambahkan status baru hanya bila tidak cocok dengan status standar mana pun
      Object.keys(statusCount).forEach(k => {
        if (!k || k === '-') return;
        const meta = getSSRewardStatusMeta(k);
        const metaNorm = meta.key.toLowerCase().replace(/[^a-z0-9]/g, '');
        let alreadyExists = false;
        canonicalMap.forEach((_, existingKey) => {
          if (existingKey.toLowerCase().replace(/[^a-z0-9]/g, '') === metaNorm) {
            alreadyExists = true;
          }
        });
        if (!alreadyExists) {
          canonicalMap.set(meta.key, meta);
        }
      });

      const activeFilter = (document.getElementById('ss-filter-part')?.value || 'ALL').toLowerCase().replace(/[^a-z0-9]/g, '');

      const resetBtn = document.getElementById('ss-btn-reset-filter');
      if (resetBtn) {
        if (activeFilter && activeFilter !== 'all') {
          resetBtn.classList.remove('hidden');
        } else {
          resetBtn.classList.add('hidden');
        }
      }

      container.className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5';

      container.innerHTML = Array.from(canonicalMap.values()).map(meta => {
        let count = 0;
        const metaNorm = meta.key.toLowerCase().replace(/[^a-z0-9]/g, '');

        Object.keys(statusCount).forEach(k => {
          const kMeta = getSSRewardStatusMeta(k);
          const kNorm = kMeta.key.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (kNorm === metaNorm) {
            count += Number(statusCount[k]) || 0;
          }
        });

        const isActive = activeFilter !== 'all' && (activeFilter === metaNorm);
        const ringClass = isActive 
          ? 'ring-2 ring-offset-2 ring-slate-800 font-black shadow-md scale-[1.02] border-slate-400' 
          : 'shadow-2xs hover:shadow-xs hover:border-slate-300';

        return `
          <div onclick="selectSSRewardFilter('${meta.key}')" 
               title="${meta.desc} (Klik untuk menyaring tabel)"
               class="p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${meta.cardBg} ${ringClass} group min-w-0 overflow-hidden">
            <div class="flex items-center justify-between gap-1 mb-1.5 min-w-0">
              <span class="text-[11px] font-bold ${meta.textColor} leading-tight truncate block" title="${meta.displayName}">${meta.displayName}</span>
              <i class="${meta.icon} text-xs ${meta.textColor} opacity-80 group-hover:scale-110 transition-transform flex-shrink-0"></i>
            </div>
            <div class="flex items-baseline justify-between mt-auto pt-1">
              <span class="text-lg sm:text-xl font-black ${meta.countColor}">${count}</span>
              <span class="text-[10px] font-bold text-slate-400">Ide</span>
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
      if (document.getElementById('ss-card-target-pct')) document.getElementById('ss-card-target-pct').textContent = `${ssPct}%`;
      
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
      } else {
        list = list.filter(e => isLampungBranch(e));
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

      // Update Realisasi Target Cabang
      const s = currentDashboardPayload?.summary || {};
      const targetSS = s.targetSS || (list.length > 0 ? list.length : 10);
      const ssPct = (targetSS > 0) ? Math.min(Math.round((list.length / targetSS) * 100), 100) : 0;
      
      if (document.getElementById('ss-card-total')) {
        document.getElementById('ss-card-total').textContent = list.length;
      }
      if (document.getElementById('ss-card-target-denom')) {
        document.getElementById('ss-card-target-denom').textContent = `/ ${targetSS} Target`;
      }
      if (document.getElementById('ss-card-prog-bar')) {
        document.getElementById('ss-card-prog-bar').style.width = `${ssPct}%`;
      }
      if (document.getElementById('ss-card-target-pct')) {
        document.getElementById('ss-card-target-pct').textContent = `${ssPct}%`;
      }

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
      } else {
        list = list.filter(e => isLampungBranch(e));
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
      } else {
        list = list.filter(e => isLampungBranch(e));
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
          const isSecond = idx === 1;
          const isThird = idx === 2;

          let stickyClass = 'text-slate-600 border-b border-slate-100';
          if (isFirst) {
            stickyClass = 'sticky left-0 bg-white group-hover:bg-slate-50 z-20 border-b border-r border-slate-200/80 font-mono font-bold text-slate-700 text-center w-12 min-w-[48px] max-w-[48px] transition-colors';
          } else if (isSecond) {
            stickyClass = 'border-b border-slate-100 font-mono font-bold text-slate-700 w-20 min-w-[80px] max-w-[80px] whitespace-nowrap transition-colors';
          } else if (isThird) {
            stickyClass = 'sticky left-12 bg-white group-hover:bg-slate-50 z-10 border-b border-r border-slate-200/80 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.06)] min-w-[150px] sm:min-w-[180px] whitespace-nowrap font-bold text-slate-800 transition-colors';
          }

          if (col === 'No' || normalizeHeaderName(col) === 'no') {
            return `<td class="py-2.5 px-3 whitespace-nowrap ${stickyClass} text-slate-500 font-bold">${rowIdx + 1}</td>`;
          }
          let val = formatColumnCell(col, row[col], 'Data_SP');
          if (isThird && row['NPK']) {
            val = `<div><span class="block truncate max-w-[130px] sm:max-w-[160px]" title="${val}">${val}</span><span class="text-[10px] text-slate-400 font-mono block">NPK: ${row['NPK']}</span></div>`;
          }
          return `<td class="py-2.5 px-4 whitespace-nowrap ${stickyClass}">${val}</td>`;
        }).join('');

        const realIdx = rawRows.indexOf(row);
        const actionCell = renderRowActionCell('Data_SP', realIdx, row);
        return `<tr class="hover:bg-slate-50/80 transition-colors group">${cells}${actionCell}</tr>`;
      }).join('');
    }

    // ----------------------------------------------------
    // E.2 Knowledge Management (KM) Presisi (Sesuai Spreadsheet)
    // ----------------------------------------------------
    function renderKMView(data) {
      if (!data && !window.masterFullPayload && !currentDashboardPayload) return;
      const source = window.masterFullPayload?.rawTables || currentDashboardPayload?.rawTables || (data && data.rawTables) || {};
      let rawRows = (typeof findKMRawRows === 'function' ? findKMRawRows(source) : (source.Knowledge_management || source.Data_KM)) || [];
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
      const rawRows = (typeof findKMRawRows === 'function' ? findKMRawRows(source) : (source.Knowledge_management || source.Data_KM)) || [];

      // Ekstraksi topik / kategori dinamis jika tersedia
      const catSelect = document.getElementById('km-filter-kategori');
      if (catSelect) {
        catSelect.innerHTML = '<option value="ALL">Semua Dokumen</option>';
      }
    }

    function filterKMTable() {
      const source = window.masterFullPayload?.rawTables || currentDashboardPayload?.rawTables || {};
      let rawRows = (typeof findKMRawRows === 'function' ? findKMRawRows(source) : (source.Knowledge_management || source.Data_KM)) || [];
      if (!Array.isArray(rawRows)) rawRows = [];
      const q = (document.getElementById('km-search-input')?.value || '').toLowerCase().trim();
      const branchFilter = document.getElementById('km-filter-cabang')?.value || 'ALL';

      let list = rawRows;

      if (branchFilter !== 'ALL') {
        list = list.filter(e => matchBranch(e, branchFilter));
      }

      if (q) {
        list = list.filter(e => 
          String(e['NPK'] || e['npk'] || '').toLowerCase().includes(q) || 
          String(e['NAMA'] || e['Nama'] || e['nama'] || '').toLowerCase().includes(q) ||
          String(e['JUDUL'] || e['Judul'] || e['judul'] || '').toLowerCase().includes(q) ||
          String(e['TANGGAL'] || e['Tanggal'] || e['tanggal'] || '').toLowerCase().includes(q) ||
          String(e['TIME'] || e['Time'] || e['time'] || '').toLowerCase().includes(q)
        );
      }

      const isFull = columnViewMode.km === 'FULL';
      const rawCols = isFull 
        ? (SCHEMAS.Knowledge_management?.columns || ["NPK", "NAMA", "JUDUL", "TANGGAL", "TIME"])
        : ["NPK", "NAMA", "JUDUL", "TANGGAL", "TIME"];
      const cols = ["No", ...rawCols.filter(c => c !== 'No')];

      // Render Header dengan label kolom aksi 'Detail'
      renderTableHeader('km-table-header', cols, true, 'Detail');

      const tbody = document.getElementById('km-table-body');
      if (document.getElementById('km-row-count')) {
        document.getElementById('km-row-count').textContent = `Menampilkan ${list.length} dari ${rawRows.length} dokumen KM (${cols.length} kolom)`;
      }

      if (!list.length) {
        const currentUser = (typeof loggedInUser !== 'undefined' && loggedInUser) ? loggedInUser : (typeof window !== 'undefined' ? window.loggedInUser : null);
        const isAdmin = isUserAdmin(currentUser);
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
          const isSecond = idx === 1;
          const isThird = idx === 2;

          let stickyClass = 'text-slate-600 border-b border-slate-100';
          if (isFirst) {
            stickyClass = 'sticky left-0 bg-white group-hover:bg-slate-50 z-20 border-b border-r border-slate-200/80 font-mono font-bold text-slate-700 text-center w-12 min-w-[48px] max-w-[48px] transition-colors';
          } else if (isSecond) {
            stickyClass = 'border-b border-slate-100 font-mono font-bold text-slate-700 w-20 min-w-[80px] max-w-[80px] whitespace-nowrap transition-colors';
          } else if (isThird) {
            stickyClass = 'sticky left-12 bg-white group-hover:bg-slate-50 z-10 border-b border-r border-slate-200/80 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.06)] min-w-[150px] sm:min-w-[180px] whitespace-nowrap font-bold text-slate-800 transition-colors';
          }

          if (col === 'No' || normalizeHeaderName(col) === 'no') {
            return `<td class="py-2.5 px-3 whitespace-nowrap ${stickyClass} text-slate-500 font-bold">${rowIdx + 1}</td>`;
          }
          let rawCell = typeof getRowCellValue === 'function' 
            ? getRowCellValue(row, col, SCHEMAS.Knowledge_management) 
            : (row[col] !== undefined ? row[col] : (row[col.toLowerCase()] !== undefined ? row[col.toLowerCase()] : (row[col.toUpperCase()] !== undefined ? row[col.toUpperCase()] : (typeof capitalizeFirst === 'function' ? row[capitalizeFirst(col)] : ''))));
          if ((col === 'NAMA' || col === 'Nama') && (!rawCell || rawCell === '-' || String(rawCell).trim() === '') && rowNpk) {
            rawCell = (typeof lookupEmployeeName === 'function' ? lookupEmployeeName(rowNpk) : '') || rawCell;
          }
          let val = formatColumnCell(col, rawCell, 'Knowledge_management');
          if (isThird && rowNpk) {
            val = `<div><span class="block truncate max-w-[130px] sm:max-w-[160px]" title="${val}">${val}</span><span class="text-[10px] text-slate-400 font-mono block">NPK: ${rowNpk}</span></div>`;
          }
          return `<td class="py-2.5 px-4 whitespace-nowrap ${stickyClass}">${val}</td>`;
        }).join('');

        const realIdx = rawRows.indexOf(row);
        const actionCell = renderRowActionCell('Knowledge_management', realIdx, row);
        return `<tr class="hover:bg-slate-50/80 transition-colors group">${cells}${actionCell}</tr>`;
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
      let displayList = (list && list.length > 0) ? list : (currentDashboardPayload?.employeeList || []);
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
        const npk = e.npk || e['Personnel no.'] || e['NPK'] || '-';
        const nama = e.nama || e['Last name'] || e['Nama'] || e['Nama Lengkap'] || '-';
        const cabang = e.cabang || e['P.subarea'] || e['Cabang'] || '-';
        const kodeBA = e.kodeBA || e['Business area'] || e['Kode BA'] || '-';
        const divisi = e.divisi || e['Name'] || (typeof resolveEmployeeDivision === 'function' ? resolveEmployeeDivision(e).divisionName : '-');
        const jabatan = e.jabatan || e['Job Title'] || e['Jabatan'] || '-';
        const umur = (e.umurText && e.umurText !== '-') ? e.umurText : (typeof calculateEmployeeAge === 'function' ? calculateEmployeeAge(e.tglLahir || e['D.o.birth'] || (typeof findDOBirth === 'function' ? findDOBirth(e) : '')) : (typeof calculateAgeAndService === 'function' ? calculateAgeAndService(e.tglLahir || e['D.o.birth'], 'age') : '-'));
        const masaKerja = (e.masaKerjaText && e.masaKerjaText !== '-') ? e.masaKerjaText : (typeof calculateEmployeeTenure === 'function' ? calculateEmployeeTenure(e.joinDate || e['Date'] || (typeof findDate === 'function' ? findDate(e) : '')) : (typeof calculateAgeAndService === 'function' ? calculateAgeAndService(e.joinDate || e['Date'], 'service') : '-'));
        const status = String(e.statusKaryawan || e.Status_Karyawan || e['Status_Karyawan'] || 'Aktif').trim();
        const isResign = status.toLowerCase() === 'resign';
        const statusBadge = isResign
          ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><i class="fa-solid fa-user-xmark mr-1 text-[9px]"></i>Resign</span>`
          : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-user-check mr-1 text-[9px]"></i>Aktif</span>`;

        const resignInfo = (isAdmin && isResign)
          ? `<div class="text-[10px] leading-tight"><span class="font-bold text-rose-600 block">${e.tanggalResign || e['Tanggal_Resign'] || '-'}</span><span class="text-slate-400 truncate max-w-[140px] block" title="${e.alasanResign || e['Alasan_Resign'] || '-'}">${e.alasanResign || e['Alasan_Resign'] || '-'}</span></div>`
          : (isAdmin ? `<span class="text-slate-300 text-xs">-</span>` : '');

        return `
          <tr class="hover:bg-slate-50/80 transition-colors group">
            <td class="py-3 px-3 text-center font-mono font-bold text-slate-400 sticky left-0 bg-white group-hover:bg-slate-50 z-20 w-12 min-w-[48px] max-w-[48px] border-b border-r border-slate-200/80 transition-colors">${rowIdx + 1}</td>
            <td class="py-3 px-3 font-mono font-bold text-slate-600 w-20 min-w-[80px] max-w-[80px] border-b border-slate-100 whitespace-nowrap transition-colors">${npk}</td>
            <td class="py-3 px-4 font-semibold text-slate-900 sticky left-12 bg-white group-hover:bg-slate-50 z-10 min-w-[150px] sm:min-w-[180px] border-b border-r border-slate-200/80 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.06)] transition-colors whitespace-nowrap">
              <span class="block truncate max-w-[140px] sm:max-w-[180px]" title="${nama}">${nama}</span>
              <span class="text-[10px] text-slate-400 font-mono block">NPK: ${npk}</span>
            </td>
            <td class="py-3 px-4 text-slate-500 border-b border-slate-100 whitespace-nowrap">${cabang} (${kodeBA})</td>
            <td class="py-3 px-4 border-b border-slate-100 whitespace-nowrap">
              <span class="font-medium text-slate-800">${divisi}</span>
              <span class="text-[10px] text-slate-400 block">${jabatan}</span>
            </td>
            <td class="py-3 px-4 text-center font-medium text-slate-600 whitespace-nowrap border-b border-slate-100">${umur}</td>
            <td class="py-3 px-4 text-center font-medium text-slate-600 whitespace-nowrap border-b border-slate-100">${masaKerja}</td>
            <td class="py-3 px-4 text-center border-b border-slate-100 whitespace-nowrap">${statusBadge}</td>
            ${isAdmin ? `<td class="py-3 px-4 text-left border-b border-slate-100 whitespace-nowrap">${resignInfo}</td>` : ''}
            <td class="py-3 px-4 text-center font-bold ${(e.kehadiranPct !== undefined ? e.kehadiranPct : 100) < 95 ? 'text-amber-600' : 'text-emerald-600'} border-b border-slate-100 whitespace-nowrap">${e.kehadiranPct !== undefined ? e.kehadiranPct : 100}%</td>
            <td class="py-3 px-4 text-center font-bold text-amber-500 border-b border-slate-100 whitespace-nowrap">${e.totalSS || 0} Ide</td>
            <td class="py-3 px-4 text-center font-bold border-b border-slate-100 whitespace-nowrap">
              ${(e.spAktif && e.spAktif !== '-') 
                ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><i class="fa-solid fa-triangle-exclamation mr-1 text-[9px]"></i>${e.spAktif}</span>` 
                : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-shield-halved mr-1 text-[9px]"></i>Disiplin</span>`}
            </td>
            <td class="py-3 px-4 text-center border-b border-slate-100 whitespace-nowrap">
              <button onclick="openPBKModal('${npk}')" class="px-2.5 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-bold rounded-lg text-[11px] transition">
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

      let displayList = (list && list.length > 0) ? list : (currentDashboardPayload?.employeeList || []);
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
        const umur = (emp.umurText && emp.umurText !== '-') ? emp.umurText : (typeof calculateEmployeeAge === 'function' ? calculateEmployeeAge(emp.tglLahir || emp['D.o.birth'] || (typeof findDOBirth === 'function' ? findDOBirth(emp) : '')) : (typeof calculateAgeAndService === 'function' ? calculateAgeAndService(emp.tglLahir || emp['D.o.birth'], 'age') : '-'));
        const masaKerja = (emp.masaKerjaText && emp.masaKerjaText !== '-') ? emp.masaKerjaText : (typeof calculateEmployeeTenure === 'function' ? calculateEmployeeTenure(emp.joinDate || emp['Date'] || (typeof findDate === 'function' ? findDate(emp) : '')) : (typeof calculateAgeAndService === 'function' ? calculateAgeAndService(emp.joinDate || emp['Date'], 'service') : '-'));
        const status = (emp.statusKaryawan || emp.Status_Karyawan || 'Aktif').trim();
        const isResign = status.toLowerCase() === 'resign';
        const statusBadge = isResign
          ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><i class="fa-solid fa-user-xmark mr-1 text-[9px]"></i>Resign</span>`
          : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-user-check mr-1 text-[9px]"></i>Aktif</span>`;

        const resignInfo = (isAdmin && isResign)
          ? `<div class="text-[10px] leading-tight"><span class="font-bold text-rose-600 block">${emp.tanggalResign || '-'}</span><span class="text-slate-400 truncate max-w-[140px] block" title="${emp.alasanResign || '-'}">${emp.alasanResign || '-'}</span></div>`
          : (isAdmin ? `<span class="text-slate-300 text-xs">-</span>` : '');

        return `
          <tr class="hover:bg-slate-50/80 transition-colors group">
            <td class="py-3.5 px-3 text-center font-mono font-bold text-slate-400 sticky left-0 bg-white group-hover:bg-slate-50 z-10 w-12 min-w-[48px] max-w-[48px] border-b border-r border-slate-200/80 transition-colors">${rowIdx + 1}</td>
            <td class="py-3.5 px-4 font-semibold text-slate-900 sticky left-12 bg-white group-hover:bg-slate-50 z-10 min-w-[190px] sm:min-w-[220px] border-b border-r border-slate-200/80 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.06)] transition-colors whitespace-nowrap">
              ${emp.nama} <span class="font-mono text-slate-400 text-[10px] block">NPK: ${emp.npk}</span>
            </td>
            <td class="py-3.5 px-4 text-slate-600 border-b border-slate-100 whitespace-nowrap">${emp.cabang}</td>
            <td class="py-3.5 px-4 text-center font-medium text-slate-600 whitespace-nowrap border-b border-slate-100">${umur}</td>
            <td class="py-3.5 px-4 text-center font-medium text-slate-600 whitespace-nowrap border-b border-slate-100">${masaKerja}</td>
            <td class="py-3.5 px-4 text-center border-b border-slate-100 whitespace-nowrap">${statusBadge}</td>
            ${isAdmin ? `<td class="py-3.5 px-4 text-left border-b border-slate-100 whitespace-nowrap">${resignInfo}</td>` : ''}
            <td class="py-3.5 px-4 text-center font-bold ${(emp.kehadiranPct !== undefined ? emp.kehadiranPct : 100) < 95 ? 'text-amber-600' : 'text-emerald-600'} border-b border-slate-100 whitespace-nowrap">${emp.kehadiranPct !== undefined ? emp.kehadiranPct : 100}%</td>
            <td class="py-3.5 px-4 text-center font-bold text-amber-500 border-b border-slate-100 whitespace-nowrap">${emp.totalSS || 0} Ide</td>
            <td class="py-3.5 px-4 text-center border-b border-slate-100 whitespace-nowrap">
              ${(emp.spAktif && emp.spAktif !== '-') 
                ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><i class="fa-solid fa-triangle-exclamation mr-1 text-[9px]"></i>${emp.spAktif}</span>` 
                : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><i class="fa-solid fa-shield-halved mr-1 text-[9px]"></i>Disiplin</span>`}
            </td>
            <td class="py-3.5 px-4 text-center border-b border-slate-100 whitespace-nowrap"><span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full"><i class="fa-solid fa-circle-check mr-1"></i>Siap Acuan</span></td>
            <td class="py-3.5 px-4 text-center border-b border-slate-100 whitespace-nowrap">
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
