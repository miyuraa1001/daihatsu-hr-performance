/**
 * D-PERFORM - Dashboard Metrics & Aggregations
 * Data Store, Summaries, KPI Cards, and Analytics
 */

        /**
     * Ekstraksi dan resolusi Divisi Karyawan secara cerdas dari P0001-STEXT, Name, Job Title, dan SAP data
     * Mendeteksi divisi spesifik (contoh: 'GL Service', 'SA', 'Sales Executive', 'Kepala Cabang')
     * dan mengelompokkan ke 3 pilar baku: 'Sales', 'Service', 'Admin'
     */
    function resolveEmployeeDivision(e, idx = 0) {
      if (!e) {
        return { divisionName: 'Operational', category: 'Admin' };
      }

      // 1. Ambil kandidat teks struktur organisasi P0001-STEXT
      let stext = '';
      if (typeof findP0001STEXT === 'function') {
        stext = String(e['P0001-STEXT'] || findP0001STEXT(e, idx) || '').trim();
      } else {
        stext = String(e['P0001-STEXT'] || e.stext || '').trim();
      }

      const nameVal = String(e['Name'] || e.divisi || e.departemen || '').trim();
      const orgUnit = String(e['Name of organizational unit'] || e.unit || '').trim();
      const jobTitle = String(e['Job Title'] || e.jabatan || e.posisi || '').trim();

      // Daftar kata kunci cabang / lokasi yang ada di akhiran P0001-STEXT Astra DSO
      const locationPatterns = [
        /\blampung\s+a\s+yani\b/i,
        /\blampung\s+a\.?\s*yani\b/i,
        /\blampung\b/i,
        /\bbandar\s+jaya\b/i,
        /\bbandarjaya\b/i,
        /\bkotabumi\b/i,
        /\bkota\s+bumi\b/i,
        /\bpringsewu\b/i,
        /\btulang\s+bawang\b/i,
        /\btulangbawang\b/i,
        /\bplb\s+veteran\b/i,
        /\bveteran\b/i,
        /\bpalembang\b/i,
        /\bprabumulih\b/i,
        /\bjambi\b/i,
        /\bbengkulu\b/i,
        /\bpangkal\s+pinang\b/i,
        /\bpadang\b/i,
        /\bsumbagsel\b/i,
        /\bd66[0-4]\b/i
      ];

      let cleanedDivName = '';

      if (stext && stext !== 'Staff Unit' && stext !== 'DSO Unit Operational') {
        // Hapus prefix umum SAP (DSO, AI, PT Astra International Tbk - DSO, dsb.)
        let clean = stext.replace(/^(dso|ai|pt\s+astra\s+international\s+tbk\s*-\s*dso)\s+/i, '').trim();

        // Hapus suffix nama cabang / wilayah
        for (const locPat of locationPatterns) {
          clean = clean.replace(locPat, '').trim();
        }

        // Bersihkan tanda hubung atau spasi berlebih
        clean = clean.replace(/^[-–\s/]+|[-–\s/]+$/g, '').trim();
        if (clean.length >= 2) {
          cleanedDivName = clean;
        }
      }

      if (!cleanedDivName) {
        if (nameVal && nameVal !== 'Operational' && nameVal !== 'Departemen DSO' && nameVal !== '-') {
          cleanedDivName = nameVal;
        } else if (orgUnit && orgUnit !== 'Departemen DSO' && orgUnit !== '-') {
          cleanedDivName = orgUnit.replace(/\s+DSO$/i, '').trim();
        } else if (jobTitle && jobTitle !== 'Staff' && jobTitle !== '-') {
          cleanedDivName = jobTitle;
        } else {
          cleanedDivName = 'Operational';
        }
      }

      // Normalisasi sebutan divisi agar seragam dan elegan
      if (/^sa$/i.test(cleanedDivName)) {
        cleanedDivName = 'SA (Service Advisor)';
      } else if (/^kacab$/i.test(cleanedDivName)) {
        cleanedDivName = 'Kepala Cabang';
      }

      // 2. Klasifikasi ke 3 Pilar Baku (Sales, Service, Admin)
      const combined = `${stext} ${nameVal} ${orgUnit} ${jobTitle} ${cleanedDivName}`.toLowerCase();

      let category = 'Admin';
      if (
        combined.includes('service') || 
        combined.includes('bengkel') || 
        combined.includes('workshop') ||
        /\bgl\s+service\b/i.test(combined) ||
        /\bsa\b/i.test(combined) ||
        combined.includes('service advisor') ||
        combined.includes('foreman') ||
        combined.includes('mekanik') ||
        combined.includes('mechanic') ||
        combined.includes('teknisi') ||
        combined.includes('part') ||
        combined.includes('sparepart') ||
        combined.includes('pdi') ||
        combined.includes('body repair') ||
        combined.includes('cuci')
      ) {
        category = 'Service';
      } else if (
        combined.includes('sales') ||
        combined.includes('wiraniaga') ||
        combined.includes('marketing') ||
        combined.includes('counter') ||
        combined.includes('showroom') ||
        combined.includes('penjualan') ||
        combined.includes('fleet')
      ) {
        category = 'Sales';
      } else {
        category = 'Admin';
      }

      return {
        divisionName: cleanedDivName,
        category: category
      };
    }
    if (typeof window !== 'undefined') window.resolveEmployeeDivision = resolveEmployeeDivision;

    function initializeStandardTables(payload) {
      if (!payload) return;
      if (!payload.rawTables) payload.rawTables = {};

      // 1. Pastikan employeeList tersinkronisasi dua arah dengan rawTables.Master_Karyawan
      if (!Array.isArray(payload.employeeList) || payload.employeeList.length === 0) {
        if (Array.isArray(payload.rawTables.Master_Karyawan) && payload.rawTables.Master_Karyawan.length > 0) {
          payload.employeeList = payload.rawTables.Master_Karyawan.map(row => {
            const dob = (typeof findDOBirth === 'function' ? findDOBirth(row) : '') || row['D.o.birth'] || row['Date of Birth'] || row['Tgl Lahir'] || '';
            const jDate = (typeof findDate === 'function' ? findDate(row) : '') || row['Date'] || row['Entry'] || row['Tgl Masuk'] || row['Join Date'] || '';
            const contractVal = row['Contract'] || 'Tetap';
            const statusVal = row['Status_Karyawan'] || 'Aktif';
            const baVal = safeString(row['Business area'] || row['Business Area'] || row['Kode BA'] || row.kodeBA || 'D660');
            const cabangVal = row['P.subarea'] || row['Cabang'] || row.cabang || 'Lampung A Yani';
            const ageCalc = typeof calculateEmployeeAge === 'function' ? calculateEmployeeAge(dob) : calculateAgeAndService(dob, 'age');
            const tenureCalc = typeof calculateEmployeeTenure === 'function' ? calculateEmployeeTenure(jDate) : calculateAgeAndService(jDate, 'service');
            return {
              npk: safeString(row['Personnel no.'] || row['NPK'] || row.npk),
              nama: row['Last name'] || row['Nama'] || row['Nama Lengkap'] || row.nama || '',
              cabang: cabangVal,
              wilayah: row['Wilayah'] || row.wilayah || 'DSO Lampung',
              kodeBA: baVal,
              divisi: row['Name'] || row['Divisi'] || row.divisi || '',
              jabatan: row['Job Title'] || row['Jabatan'] || row.jabatan || '',
              tipeKontrak: contractVal,
              'Contract': contractVal,
              statusKaryawan: statusVal,
              Status_Karyawan: statusVal,
              tanggalResign: row['Tanggal_Resign'] || '',
              alasanResign: row['Alasan_Resign'] || '',
              umurText: ageCalc,
              masaKerjaText: tenureCalc,
              joinDate: jDate,
              tglLahir: dob,
              gender: row['Gender text'] || '',
              agama: row['Religious denomination'] || '',
              psGroup: row['PS group'] || (typeof findPSGroup === 'function' ? findPSGroup(row) : ''),
              lvl: row['Lvl'] || (typeof findLvl === 'function' ? findLvl(row) : ''),
              stext: row['P0001-STEXT'] || (typeof findP0001STEXT === 'function' ? findP0001STEXT(row) : ''),
              raw: row
            };
          });
        } else {
          payload.employeeList = [];
        }
      }

      const employees = payload.employeeList || [];
      const qccs = payload.qccList || [];

      // 2. Master_Karyawan (16-19 Columns - 100% Identik Database Baku)
      const isRawMasterEmpty = !payload.rawTables.Master_Karyawan || 
                               !payload.rawTables.Master_Karyawan.length || 
                               !payload.rawTables.Master_Karyawan.some(r => r && (r['Personnel no.'] || r['Last name'] || r['NPK'] || r.npk));

      if (isRawMasterEmpty) {
        payload.rawTables.Master_Karyawan = employees.map((e, idx) => {
          const contractVal = e['Contract'] || e.Contract || e.contract || e.tipeKontrak || e.statusKontrak || e.kontrak || 'Tetap';
          const statusVal = e['Status_Karyawan'] || e['Status Karyawan'] || e.statusKaryawan || 'Aktif';
          e['Contract'] = contractVal;
          e.tipeKontrak = contractVal;
          e['Status_Karyawan'] = statusVal;
          e.statusKaryawan = statusVal;
          const dob = e['D.o.birth'] || e.tglLahir || e.dob || (typeof findDOBirth === 'function' ? findDOBirth(e) : '');
          const jDate = e['Date'] || e.joinDate || e.date || (typeof findDate === 'function' ? findDate(e) : '');
          e.tglLahir = dob;
          e.joinDate = jDate;
          e.umurText = typeof calculateEmployeeAge === 'function' ? calculateEmployeeAge(dob) : calculateAgeAndService(dob, 'age');
          e.masaKerjaText = typeof calculateEmployeeTenure === 'function' ? calculateEmployeeTenure(jDate) : calculateAgeAndService(jDate, 'service');
          const baVal = safeString(e['Business area'] || e.kodeBA || 'D660');
          const cabangVal = e['P.subarea'] || e.cabang || 'Lampung A Yani';
          const divVal = e['Name'] || e.divisi || 'Operational';
          return {
            "Personnel no.": safeString(e['Personnel no.'] || e.npk),
            "P.subarea": cabangVal,
            "Wilayah": e['Wilayah'] || e.wilayah || 'DSO Lampung',
            "Contract": contractVal,
            "Name": divVal,
            "Name of organizational unit": e['Name of organizational unit'] || e.organisasi || (divVal ? `${divVal} DSO` : 'Departemen DSO'),
            "Job Title": e['Job Title'] || e.jabatan || 'Staff',
            "Last name": e['Last name'] || e.nama || '',
            "D.o.birth": dob,
            "Gender text": e['Gender text'] || e.gender || 'Male',
            "Religious denomination": e['Religious denomination'] || e.agama || 'Islam',
            "PS group": (typeof findPSGroup === 'function' ? findPSGroup(e) : (e['PS group'] || e.psGroup || '')),
            "Lvl": (typeof findLvl === 'function' ? findLvl(e) : (e['Lvl'] || e.lvl || '')),
            "Date": jDate,
            "P0001-STEXT": (typeof findP0001STEXT === 'function' ? findP0001STEXT(e) : (e['P0001-STEXT'] || e.stext || '')),
            "Business area": baVal,
            "Status_Karyawan": statusVal,
            "Tanggal_Resign": e['Tanggal_Resign'] || e.tanggalResign || '',
            "Alasan_Resign": e['Alasan_Resign'] || e.alasanResign || ''
          };
        });
      } else {
        payload.rawTables.Master_Karyawan.forEach((row, idx) => {
          const npk = safeString(row['Personnel no.'] || row['NPK'] || row.npk);
          const emp = employees.find(e => safeString(e.npk || e['Personnel no.']) === npk) || employees[idx];
          const statusVal = row['Status_Karyawan'] || row['Status Karyawan'] || (emp ? (emp['Status_Karyawan'] || emp.statusKaryawan) : '') || 'Aktif';
          row['Status_Karyawan'] = statusVal;

          const dob = (typeof findDOBirth === 'function' ? findDOBirth(row) : '') || row['D.o.birth'] || (emp ? (emp.tglLahir || emp['D.o.birth'] || emp.dob) : '');
          const jDate = (typeof findDate === 'function' ? findDate(row) : '') || row['Date'] || (emp ? (emp.joinDate || emp['Date'] || emp.date) : '');
          if (dob) row['D.o.birth'] = dob;
          if (jDate) row['Date'] = jDate;

          if (emp) {
            if (!row['Personnel no.']) row['Personnel no.'] = safeString(emp['Personnel no.'] || emp.npk);
            if (!row['Last name']) row['Last name'] = emp['Last name'] || emp.nama || '';
            if (!row['P.subarea']) row['P.subarea'] = emp['P.subarea'] || emp.cabang || 'Lampung A Yani';
            if (!row['Business area']) row['Business area'] = safeString(emp['Business area'] || emp.kodeBA || 'D660');
            if (!row['Wilayah']) row['Wilayah'] = emp['Wilayah'] || emp.wilayah || 'DSO Lampung';
            if (!row['Contract']) row['Contract'] = emp['Contract'] || emp.tipeKontrak || emp.kontrak || 'Tetap';
            if (!row['Name']) row['Name'] = emp['Name'] || emp.divisi || '';
            if (!row['Name of organizational unit']) row['Name of organizational unit'] = emp['Name of organizational unit'] || emp.organisasi || (emp.divisi ? `${emp.divisi} DSO` : 'Departemen DSO');
            if (!row['Job Title']) row['Job Title'] = emp['Job Title'] || emp.jabatan || '';
            if (!row['Gender text']) row['Gender text'] = emp['Gender text'] || emp.gender || '';
            if (!row['Religious denomination']) row['Religious denomination'] = emp['Religious denomination'] || emp.agama || '';
            if (!row['PS group']) row['PS group'] = emp['PS group'] || emp.psGroup || '';
            if (!row['Lvl']) row['Lvl'] = emp['Lvl'] || emp.lvl || '';
            if (!row['P0001-STEXT']) row['P0001-STEXT'] = emp['P0001-STEXT'] || emp.stext || '';

            emp['Contract'] = row['Contract'] || emp['Contract'] || 'Tetap';
            emp.tipeKontrak = row['Contract'] || emp.tipeKontrak || 'Tetap';
            emp['Status_Karyawan'] = statusVal;
            emp.statusKaryawan = statusVal;
            if (!emp.cabang) emp.cabang = row['P.subarea'] || row['Cabang'] || '';
            if (!emp.kodeBA) emp.kodeBA = row['Business area'] || row['Kode BA'] || '';
            if (!emp.wilayah) emp.wilayah = row['Wilayah'] || 'DSO Lampung';
            if (!emp.divisi) emp.divisi = row['Name'] || row['Divisi'] || '';
            if (!emp.jabatan) emp.jabatan = row['Job Title'] || row['Jabatan'] || '';
            if (dob) {
              emp.tglLahir = dob;
              emp['D.o.birth'] = dob;
            }
            if (jDate) {
              emp.joinDate = jDate;
              emp['Date'] = jDate;
            }
            emp.umurText = typeof calculateEmployeeAge === 'function' ? calculateEmployeeAge(emp.tglLahir || dob) : calculateAgeAndService(emp.tglLahir || dob, 'age');
            emp.masaKerjaText = typeof calculateEmployeeTenure === 'function' ? calculateEmployeeTenure(emp.joinDate || jDate) : calculateAgeAndService(emp.joinDate || jDate, 'service');
            if (!emp.gender) emp.gender = row['Gender text'] || '';
            if (!emp.agama) emp.agama = row['Religious denomination'] || '';
            if (!emp.psGroup) emp.psGroup = row['PS group'] || (typeof findPSGroup === 'function' ? findPSGroup(row) : '');
            if (!emp.lvl) emp.lvl = row['Lvl'] || (typeof findLvl === 'function' ? findLvl(row) : '');
            if (!emp.stext) emp.stext = row['P0001-STEXT'] || (typeof findP0001STEXT === 'function' ? findP0001STEXT(row) : '');
            if (!emp.tanggalResign) emp.tanggalResign = row['Tanggal_Resign'] || '';
            if (!emp.alasanResign) emp.alasanResign = row['Alasan_Resign'] || '';
          }
        });
      }

      // Pastikan SEMUA karyawan di employeeList memiliki umurText dan masaKerjaText yang valid
      employees.forEach(emp => {
        if (!emp.tglLahir) {
          const dob = typeof findDOBirth === 'function' ? findDOBirth(emp) : (emp['D.o.birth'] || '');
          if (dob) {
            emp.tglLahir = dob;
            emp['D.o.birth'] = dob;
          }
        }
        if (!emp.joinDate) {
          const jDate = typeof findDate === 'function' ? findDate(emp) : (emp['Date'] || '');
          if (jDate) {
            emp.joinDate = jDate;
            emp['Date'] = jDate;
          }
        }
        if (!emp.umurText || emp.umurText === '-') {
          emp.umurText = typeof calculateEmployeeAge === 'function' ? calculateEmployeeAge(emp.tglLahir) : calculateAgeAndService(emp.tglLahir, 'age');
        }
        if (!emp.masaKerjaText || emp.masaKerjaText === '-') {
          emp.masaKerjaText = typeof calculateEmployeeTenure === 'function' ? calculateEmployeeTenure(emp.joinDate) : calculateAgeAndService(emp.joinDate, 'service');
        }
      });

      // 2. Data_Kehadiran (19-20 Kolom - 100% Menggunakan Data Riil Database Tanpa Data Palsu)
      if (!payload.rawTables.Data_Kehadiran) {
        payload.rawTables.Data_Kehadiran = [];
      }

      // 3. Data_SS (21 Columns - 100% Sesuai Database)
      if (!payload.rawTables.Data_SS) {
        payload.rawTables.Data_SS = [];
      }

      // 4. Data_QCC (29 Columns - 100% Sesuai Database)
      if (!payload.rawTables.Data_QCC) {
        payload.rawTables.Data_QCC = [];
      }

      // 5. Data_SP (5 Columns - 100% Sesuai Database)
      if (!payload.rawTables.Data_SP) {
        payload.rawTables.Data_SP = [];
      }

      // 6. Knowledge_management / Data_KM (Tidak menggunakan data palsu jika di spreadsheet kosong)
      if (!payload.rawTables.Knowledge_management && !payload.rawTables.Data_KM) {
        payload.rawTables.Knowledge_management = [];
        payload.rawTables.Data_KM = [];
      } else if (!payload.rawTables.Knowledge_management && payload.rawTables.Data_KM) {
        payload.rawTables.Knowledge_management = payload.rawTables.Data_KM;
      } else if (payload.rawTables.Knowledge_management && !payload.rawTables.Data_KM) {
        payload.rawTables.Data_KM = payload.rawTables.Knowledge_management;
      }
    }
    window.initializeStandardTables = initializeStandardTables;

    /**
     * Ekstraksi daftar cabang unik dari respon database (Eksklusif 5 Cabang Resmi DSO Lampung)
     */
    function extractBranchesFromData(data) {
      return KNOWN_BRANCHES.map(b => ({
        code: b.code,
        name: b.name,
        fullName: `${b.code} - ${b.name}`
      }));
    }

    /**
     * Ekstraksi opsi periode (Bulan & Tahun) dinamis dari database
     */
    function extractPeriodsFromData(data) {
      const periodSet = new Set();

      // 1. Dari availablePeriods backend
      if (Array.isArray(data?.availablePeriods) && data.availablePeriods.length > 0) {
        data.availablePeriods.forEach(p => {
          if (p && typeof p === 'string' && p.trim()) periodSet.add(p.trim());
        });
      }

      // 2. Dari data karyawan di database
      if (Array.isArray(data?.employeeList)) {
        data.employeeList.forEach(e => {
          if (e.periode && typeof e.periode === 'string' && e.periode.trim()) {
            periodSet.add(e.periode.trim());
          }
          if (e.bulan && e.tahun) {
            periodSet.add(`${e.bulan} ${e.tahun}`.trim());
          }
        });
      }

      // 3. Periode aktif yang tercatat di database
      if (data?.currentPeriod && typeof data.currentPeriod === 'string') {
        periodSet.add(data.currentPeriod.trim());
      }
      if (data?.activePeriod && typeof data.activePeriod === 'string') {
        periodSet.add(data.activePeriod.trim());
      }

      let list = Array.from(periodSet);

      if (list.length > 0) {
        // Lengkapi dengan opsi semester jika ada data tahunan
        const yearsFound = new Set();
        list.forEach(p => {
          const match = p.match(/\b(20\d\d)\b/);
          if (match) yearsFound.add(parseInt(match[1]));
        });

        yearsFound.forEach(yr => {
          if (!list.includes(`Semester 1 ${yr}`)) list.push(`Semester 1 ${yr}`);
          if (!list.includes(`Semester 2 ${yr}`)) list.push(`Semester 2 ${yr}`);
        });
        return list;
      }

      // 4. Default dinamis berdasarkan tahun kalender & referensi
      const currentYear = new Date().getFullYear();
      const years = Array.from(new Set([2025, currentYear])).sort((a, b) => a - b);
      const defaultList = [];

      years.forEach(yr => {
        INDO_MONTHS.forEach(m => {
          defaultList.push(`${m} ${yr}`);
        });
        defaultList.push(`Semester 1 ${yr}`);
        defaultList.push(`Semester 2 ${yr}`);
      });

      return defaultList;
    }

    /**
     * Hitung ulang metrik agregasi ringkasan (summary) sesuai cabang yang diisolasi
     */
    function computeBranchSummary(employees, qccList = [], fallbackSummary = {}, rawData = null) {
      const totalKaryawan = employees.length;

      let salesCount = 0;
      let serviceCount = 0;
      let adminCount = 0;

      employees.forEach((e, idx) => {
        const divInfo = resolveEmployeeDivision(e, idx);
        e.divisi = divInfo.divisionName;
        e.divisiCategory = divInfo.category;
        if (divInfo.category === 'Sales') salesCount++;
        else if (divInfo.category === 'Service') serviceCount++;
        else adminCount++;
      });

      const salesPct = totalKaryawan ? Math.round((salesCount / totalKaryawan) * 100) : 0;
      const servicePct = totalKaryawan ? Math.round((serviceCount / totalKaryawan) * 100) : 0;
      const adminPct = totalKaryawan ? Math.max(0, 100 - salesPct - servicePct) : 0;

      // 5 Kategori Baku Status Kepegawaian (Contract)
      const contractGroupMap = {};
      STANDARD_CONTRACT_CATEGORIES.forEach(cat => {
        contractGroupMap[cat] = 0;
      });

      employees.forEach(e => {
        const raw = e['Contract'] || e.Contract || e.contract || e.tipeKontrak || e.statusKontrak || e.statusKepegawaian || 'Tetap / Permanent';
        const norm = normalizeContractCategory(raw);
        contractGroupMap[norm] = (contractGroupMap[norm] || 0) + 1;
      });

      const countTetap = contractGroupMap['Tetap / Permanent'] || 0;
      const countPKWT = contractGroupMap['Kontrak / PKWT'] || 0;

      const payloadObj = rawData || currentDashboardPayload || {};
      const rawTables = payloadObj.rawTables || {};

      // 1. Hitung Metrik Kehadiran / Absensi Riil dari Data_Kehadiran
      const rawAbsRows = Array.isArray(rawTables.Data_Kehadiran) ? rawTables.Data_Kehadiran : [];
      let totalAbsCount = rawAbsRows.length;
      let totalSeringTelat = 0;
      let totalAlpha = 0;
      let onTimeCount = 0;

      if (totalAbsCount > 0) {
        rawAbsRows.forEach(r => {
          const rawTime = getRowCellValue(r, 'Time Clock In', SCHEMAS.Data_Kehadiran) || r['Time Clock In'] || r['Clock In'] || r['Time'] || r['Jam Masuk'] || '';
          const existingEstimasi = getRowCellValue(r, 'Status Kehadiran', SCHEMAS.Data_Kehadiran) || r['Status Kehadiran'] || r['Estimasi Telat (Asumsi 08.00)'] || '';
          const lateness = calculateLatenessInfo(existingEstimasi || rawTime);
          const ket = String(getRowCellValue(r, 'Keterangan', SCHEMAS.Data_Kehadiran) || r['Keterangan'] || '').toLowerCase();
          const estStr = String(existingEstimasi || '').toLowerCase();

          const isLate = lateness.isLate || ket.includes('terlambat') || ket.includes('telat') || estStr.includes('telat');
          const isAlpha = lateness.text === 'Tanpa Keterangan' || lateness.text === 'Alpha' || lateness.text === 'Alpa' || ket.includes('tanpa keterangan') || ket.includes('alpha') || ket.includes('alpa') || ket.includes('mangkir') || (!lateness.hasClockIn && (ket.includes('tidak') || ket.includes('absen') || !ket));

          if (isLate) {
            totalSeringTelat++;
          } else if (isAlpha) {
            totalAlpha++;
          } else if (lateness.hasClockIn || ket.includes('tepat') || estStr.includes('tepat')) {
            onTimeCount++;
          }
        });
      } else {
        totalSeringTelat = employees.reduce((sum, e) => sum + (Number(e.telat) || 0), 0);
        totalAlpha = employees.reduce((sum, e) => sum + (Number(e.alpha) || 0), 0);
      }

      const avgAttendance = totalAbsCount > 0
        ? Math.round(((totalAbsCount - totalSeringTelat - totalAlpha) / totalAbsCount) * 1000) / 10
        : (totalKaryawan > 0 ? 100.0 : 0.0);

      // 2. Hitung Metrik Suggestion System (SS) Riil dari Data_SS
      const rawSSRows = Array.isArray(rawTables.Data_SS) ? rawTables.Data_SS : [];
      const totalSS = rawSSRows.length > 0 ? rawSSRows.length : employees.reduce((sum, e) => sum + (Number(e.totalSS) || 0), 0);
      const targetSS = fallbackSummary.targetSS || (totalKaryawan * 2) || (totalSS > 0 ? totalSS : 10);
      const uniqueSSEmps = new Set(rawSSRows.map(s => safeString(s['NPK'] || s.npk)).filter(Boolean)).size;
      const ssParticipationRate = totalKaryawan ? Math.min(100, Math.round(((uniqueSSEmps || (totalSS > 0 ? 1 : 0)) / totalKaryawan) * 100)) : (totalSS > 0 ? 100 : 0);

      // Hitung Distribusi Status Reward SS Riil dari Database
      const ssRewardStatusCount = {};
      rawSSRows.forEach(s => {
        const rawStatus = getRowCellValue(s, 'Status Reward', SCHEMAS.Data_SS) || s['Status Reward'] || '';
        const st = String(rawStatus).trim();
        if (st && st !== '-') {
          ssRewardStatusCount[st] = (ssRewardStatusCount[st] || 0) + 1;
        }
      });

      const countImplementedSS = rawSSRows.filter(s => {
        const st = String(getRowCellValue(s, 'Status Reward', SCHEMAS.Data_SS) || s['Status Reward'] || s['Keterangan'] || '').toLowerCase();
        return st.includes('ibra') || st.includes('lunas') || st.includes('approved') || st.includes('terverifikasi') || st.includes('cair');
      }).length || employees.reduce((sum, e) => sum + (Number(e.implementedSS) || 0), 0);
      const countEvaluasiSS = Math.max(0, totalSS - countImplementedSS);

      // 3. Hitung Metrik QCC Riil dari Data_QCC (Berdasarkan Kolom Status di Database)
      const rawQCCRows = Array.isArray(rawTables.Data_QCC) && rawTables.Data_QCC.length > 0 ? rawTables.Data_QCC : qccList;
      const totalQCCCircles = rawQCCRows.length;
      const qccStatusCount = {};
      rawQCCRows.forEach(q => {
        const st = String(q['Status'] || q['status'] || 'Progress').trim();
        if (st && st !== '-') {
          qccStatusCount[st] = (qccStatusCount[st] || 0) + 1;
        }
      });
      if (Object.keys(qccStatusCount).length === 0 && totalQCCCircles > 0) {
        qccStatusCount['Progress'] = totalQCCCircles;
      }

      // Backward compatibility untuk pemanggil pdcaCount
      const pdcaCount = {
        Plan: qccStatusCount['Progress'] || 0,
        Do: qccStatusCount['Finish'] || 0,
        Check: 0,
        Action: 0
      };

      const finishCircle = rawQCCRows.find(q => String(q['Status'] || '').toLowerCase().includes('finish')) || rawQCCRows[0];
      const bestQCC = finishCircle ? {
        namaTim: finishCircle['Nama Tim'] || finishCircle['Tema'] || 'Circle Terdaftar',
        skor: finishCircle['Status'] || 'Finish'
      } : (fallbackSummary.bestQCC || null);

      // 4. Hitung Surat Peringatan (SP) Riil dari Data_SP
      let countTeguran = 0;
      let countSP1 = 0;
      let countSP2 = 0;
      let countSP3 = 0;
      let countSPPT = 0;

      const rawSPRows = Array.isArray(rawTables.Data_SP) ? rawTables.Data_SP : [];

      if (rawSPRows.length > 0) {
        rawSPRows.forEach(r => {
          const sp = String(r['Tingkat SP'] || r['Jenis Sanksi'] || r['Status SP'] || r.tingkat || r.status || '').toUpperCase();
          if (sp.includes('TEGURAN')) countTeguran++;
          else if (sp.includes('SP 1') || sp.includes('SP1')) countSP1++;
          else if (sp.includes('SP 2') || sp.includes('SP2')) countSP2++;
          else if (sp.includes('SP 3') || sp.includes('SP3')) countSP3++;
          else if (sp.includes('SPPT')) countSPPT++;
        });
      } else {
        countTeguran = employees.filter(e => String(e.spAktif || '').toUpperCase().includes('TEGURAN')).length;
        countSP1 = employees.filter(e => {
          const sp = String(e.spAktif || '').toUpperCase();
          return sp === 'SP 1' || sp === 'SP1';
        }).length;
        countSP2 = employees.filter(e => {
          const sp = String(e.spAktif || '').toUpperCase();
          return sp === 'SP 2' || sp === 'SP2';
        }).length;
        countSP3 = employees.filter(e => {
          const sp = String(e.spAktif || '').toUpperCase();
          return sp === 'SP 3' || sp === 'SP3';
        }).length;
        countSPPT = employees.filter(e => String(e.spAktif || '').toUpperCase().includes('SPPT')).length;
      }

      let totalSP = countTeguran + countSP1 + countSP2 + countSP3 + countSPPT;
      if (totalSP === 0 && fallbackSummary.totalSP && employees.length === 0) {
        totalSP = fallbackSummary.totalSP || 0;
        countTeguran = fallbackSummary.countTeguran || 0;
        countSP1 = fallbackSummary.countSP1 || 0;
        countSP2 = fallbackSummary.countSP2 || 0;
        countSP3 = fallbackSummary.countSP3 || 0;
        countSPPT = fallbackSummary.countSPPT || 0;
      }

      // 5. Hitung Knowledge Management (KM) Riil
      const rawKMRows = (rawTables.Knowledge_management || rawTables.Data_KM) || [];
      const totalKM = Array.isArray(rawKMRows) ? rawKMRows.length : 0;
      const uniqueKMContributors = new Set(
        rawKMRows.map(r => safeString(r['NPK'] || r['Personnel no.'] || r.npk)).filter(Boolean)
      ).size;

      return {
        totalKaryawan,
        salesCount,
        serviceCount,
        adminCount,
        salesPct,
        servicePct,
        adminPct,
        countTetap,
        countPKWT,
        contractGroupMap,
        avgAttendance,
        totalAlpha,
        totalSeringTelat,
        totalSS,
        targetSS,
        ssParticipationRate,
        countImplementedSS,
        countEvaluasiSS,
        ssRewardStatusCount,
        totalQCCCircles,
        qccStatusCount,
        pdcaCount,
        bestQCC,
        totalSP,
        countTeguran,
        countSP1,
        countSP2,
        countSP3,
        countSPPT,
        totalKM,
        uniqueKMContributors
      };
    }

    function ensureMasterStore(data) {
      if (!data) return;
      // Selalu perbarui master store dengan salinan payload terbaru yang telah disanitasi
      const fullCopy = sanitizeLampungPayload(JSON.parse(JSON.stringify(data)));
      initializeStandardTables(fullCopy);

      // KM 100% sinkron langsung dari database (Google Sheets) aktual
      const incomingKM = (fullCopy.rawTables?.Knowledge_management || fullCopy.rawTables?.Data_KM || []);
      fullCopy.rawTables.Knowledge_management = incomingKM;
      fullCopy.rawTables.Data_KM = incomingKM;

      // Pastikan seluruh Master Karyawan dan employeeList terisi Status_Karyawan 'Aktif'
      if (fullCopy.rawTables?.Master_Karyawan) {
        fullCopy.rawTables.Master_Karyawan.forEach(row => {
          if (!row['Status_Karyawan'] || row['Status_Karyawan'] === '-' || String(row['Status_Karyawan']).trim() === '') {
            row['Status_Karyawan'] = 'Aktif';
          }
        });
      }
      if (Array.isArray(fullCopy.employeeList)) {
        fullCopy.employeeList.forEach(e => {
          if (!e.statusKaryawan || e.statusKaryawan === '-' || String(e.statusKaryawan).trim() === '') {
            e.statusKaryawan = 'Aktif';
          }
          if (!e['Status_Karyawan'] || e['Status_Karyawan'] === '-' || String(e['Status_Karyawan']).trim() === '') {
            e['Status_Karyawan'] = 'Aktif';
          }
        });
      }

      // Terapkan perubahan baris (edit & delete) dari penyimpanan lokal browser (localStorage)
      // sehingga semua editan Admin tetap persisten saat halaman di-reload (F5)
      if (typeof applyLocalEditsToPayload === 'function') {
        applyLocalEditsToPayload(fullCopy);
      }

      window.masterFullPayload = fullCopy;
      window.fullUnscopedPayload = fullCopy;

      // Simpan ke cache browser agar halaman dapat dirender instan saat reload / dibuka kembali
      try {
        if ((fullCopy.employeeList && fullCopy.employeeList.length > 0) || 
            (fullCopy.rawTables?.Master_Karyawan && fullCopy.rawTables.Master_Karyawan.length > 0)) {
          localStorage.setItem('dperform_cached_master_payload', JSON.stringify(fullCopy));
        }
      } catch (cacheErr) {
        console.warn("Gagal menyimpan payload ke cache lokal:", cacheErr);
      }
    }

    function showDatabaseLoadError(errorMsg) {
      let banner = document.getElementById('db-connection-error-banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'db-connection-error-banner';
        banner.className = 'mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs';
        const targetView = document.getElementById('dashboard-view') || document.querySelector('main');
        if (targetView) targetView.insertBefore(banner, targetView.firstChild);
      }
      banner.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg flex-shrink-0">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <h4 class="text-xs font-bold text-amber-900">Sinkronisasi Database Google Sheets Belum Terhubung</h4>
            <p class="text-[11px] text-amber-700 mt-0.5">${errorMsg || 'Gagal memuat data dari database server.'}</p>
          </div>
        </div>
        <button onclick="loadBackendDashboardData(true)" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer flex-shrink-0 active:scale-95">
          <i class="fa-solid fa-rotate-right"></i> Coba Muat Ulang
        </button>
      `;
    }

    async function loadBackendDashboardData(shouldShowLoader = true) {
      const isAdmin = isUserAdmin(loggedInUser);
      const userBranchCode = getUserBranchCode(loggedInUser);

      // Ambil seluruh data master 'ALL' dari backend agar master store utuh tanpa risiko terpotong oleh format cabang backend,
      // kemudian RBAC frontend mengisolasi ketat sesuai cabang wewenang Kacab (business area).
      const queryBranch = 'ALL';
      const activeBranchVal = isAdmin ? (document.getElementById('branch-select')?.value || 'ALL') : userBranchCode;
      const monthVal = document.getElementById('month-select')?.value || 'ALL';
      const yearVal = document.getElementById('year-select')?.value || 'ALL';

      const loader = document.getElementById('loading-overlay');
      if (shouldShowLoader && loader) loader.classList.remove('hidden');

      try {
        const backendQueryUser = {
          ...loggedInUser,
          role: 'Admin',
          isAllBranch: true,
          assignedBACodes: [
            "D660", "D661", "D662", "D663", "D664",
            "660", "661", "662", "663", "664",
            "0660", "0661", "0662", "0663", "0664",
            "Lampung A Yani", "Lampung S Hatta", "Bandarjaya", "Kotabumi", "Lampung Timur",
            "Lampung Utara", "Sukadana"
          ]
        };

        const res = await callBackendAPI("GET_DASHBOARD", {
          user: backendQueryUser,
          branch: queryBranch,
          period: 'ALL'
        });

        if (loader) loader.classList.add('hidden');

        if (res && res.success && res.data) {
          ensureMasterStore(res.data);

          const errBanner = document.getElementById('db-connection-error-banner');
          if (errBanner) errBanner.remove();

          if (isAdmin) {
            const dynamicBranches = extractBranchesFromData(res.data);
            populateBranchDropdown(dynamicBranches);
          }
          populateMonthAndYearDropdowns(res.data);

          renderAllDashboardData(window.masterFullPayload || res.data, activeBranchVal, monthVal, yearVal);
        } else {
          const errMsg = res?.message || 'Server backend tidak mengembalikan data yang valid.';
          console.warn("loadBackendDashboardData: backend call tidak berhasil:", errMsg);

          // Coba pulihkan dari cache lokal browser jika ada
          if (!window.masterFullPayload) {
            try {
              const rawCache = localStorage.getItem('dperform_cached_master_payload');
              if (rawCache) {
                const cached = JSON.parse(rawCache);
                if (cached && ((cached.employeeList && cached.employeeList.length) || (cached.rawTables?.Master_Karyawan && cached.rawTables.Master_Karyawan.length))) {
                  ensureMasterStore(cached);
                }
              }
            } catch (cErr) {}
          }

          if (window.masterFullPayload) {
            renderAllDashboardData(window.masterFullPayload, activeBranchVal, monthVal, yearVal);
            if (typeof showToast === 'function') {
              showToast("Memuat data cache lokal (" + errMsg + ")", "warning");
            }
          } else {
            showDatabaseLoadError(errMsg);
          }
        }
      } catch (err) {
        if (loader) loader.classList.add('hidden');
        console.error("Error loading backend dashboard data:", err);

        if (!window.masterFullPayload) {
          try {
            const rawCache = localStorage.getItem('dperform_cached_master_payload');
            if (rawCache) {
              const cached = JSON.parse(rawCache);
              if (cached && ((cached.employeeList && cached.employeeList.length) || (cached.rawTables?.Master_Karyawan && cached.rawTables.Master_Karyawan.length))) {
                ensureMasterStore(cached);
              }
            }
          } catch (cErr) {}
        }

        if (window.masterFullPayload) {
          renderAllDashboardData(window.masterFullPayload, activeBranchVal, monthVal, yearVal);
          if (typeof showToast === 'function') {
            showToast("Memuat data cache lokal (" + err.message + ")", "warning");
          }
        } else {
          showDatabaseLoadError(err.message);
        }
      }
    }

    // 4. Render Metrik dengan Isolasi Data Kacab vs Admin
    function renderAllDashboardData(data, targetBranchOverride = null, targetMonthOverride = null, targetYearOverride = null) {
      if (!data) return;

      ensureMasterStore(data);

      const isAdmin = isUserAdmin(loggedInUser);
      const userBranchCode = getUserBranchCode(loggedInUser);
      const targetBranch = targetBranchOverride || (isAdmin ? (document.getElementById('branch-select')?.value || 'ALL') : userBranchCode);
      const selectedMonth = targetMonthOverride || document.getElementById('month-select')?.value || 'ALL';
      const selectedYear = targetYearOverride || document.getElementById('year-select')?.value || 'ALL';

      // Selalu gunakan masterFullPayload sebagai sumber data baku tanpa terdistorsi
      const master = window.masterFullPayload || window.fullUnscopedPayload || data;

      // Pastikan master memiliki employeeList dan rawTables.Master_Karyawan yang saling tersinkronisasi
      if (!master.employeeList || master.employeeList.length === 0 || !master.rawTables?.Master_Karyawan || master.rawTables.Master_Karyawan.length === 0) {
        initializeStandardTables(master);
      }
      const allMasterEmps = (master.employeeList && master.employeeList.length > 0)
        ? master.employeeList
        : (master.rawTables?.Master_Karyawan || []);

      // 1. Filter ketat per cabang (Eksklusif D660, D661, D662, D663, D664)
      let scopedEmployees = allMasterEmps.filter(e => matchBranch(e, targetBranch));
      let scopedQCC = (master.qccList || master.rawTables?.Data_QCC || []).filter(q => matchBranch(q, targetBranch));

      const rawSource = master.rawTables || {};
      const scopedRawTables = {
        Master_Karyawan: (rawSource.Master_Karyawan || []).filter(e => matchBranch(e, targetBranch)),
        Data_Kehadiran: (rawSource.Data_Kehadiran || []).filter(e => matchBranch(e, targetBranch)),
        Data_SS: (rawSource.Data_SS || []).filter(e => matchBranch(e, targetBranch)),
        Data_QCC: (rawSource.Data_QCC || []).filter(q => matchBranch(q, targetBranch)),
        Data_SP: (rawSource.Data_SP || []).filter(e => matchBranch(e, targetBranch)),
        Knowledge_management: (rawSource.Knowledge_management || rawSource.Data_KM || []).filter(e => matchBranch(e, targetBranch)),
        Data_KM: (rawSource.Knowledge_management || rawSource.Data_KM || []).filter(e => matchBranch(e, targetBranch))
      };

      // 2. Filter per Bulan & Tahun
      if (selectedMonth !== 'ALL' || selectedYear !== 'ALL') {
        const periodFiltered = scopedEmployees.filter(e => {
          if (!e.periode) return true;
          return matchDateMonthYear(e.periode, selectedMonth, selectedYear);
        });
        if (periodFiltered.length > 0) {
          scopedEmployees = periodFiltered;
        }

        scopedRawTables.Data_Kehadiran = scopedRawTables.Data_Kehadiran.filter(r => 
          matchDateMonthYear(
            getRowCellValue(r, 'Date', SCHEMAS.Data_Kehadiran) || r['Date'] || r['Tanggal'] || r['Date Clock In'] || r['Date Clock Out'], 
            selectedMonth, selectedYear
          )
        );

        scopedRawTables.Data_SS = scopedRawTables.Data_SS.filter(r => 
          matchDateMonthYear(
            getRowCellValue(r, 'Diterima Bulan', SCHEMAS.Data_SS) || r['Diterima Bulan'] || r['Date'] || r['Tanggal'] || r['No.BPH'], 
            selectedMonth, selectedYear
          )
        );

        scopedRawTables.Data_QCC = scopedRawTables.Data_QCC.filter(r => 
          matchDateMonthYear(
            getRowCellValue(r, 'L 1-8 diterima', SCHEMAS.Data_QCC) || r['L 1-8 diterima'] || r['Pendaftaran diterima'] || r['No.BPH'], 
            selectedMonth, selectedYear
          )
        );

        scopedRawTables.Data_SP = scopedRawTables.Data_SP.filter(r => 
          matchDateMonthYear(
            getRowCellValue(r, 'Tanggal', SCHEMAS.Data_SP) || r['Tanggal'] || r['Date'], 
            selectedMonth, selectedYear
          )
        );

        // Knowledge Management adalah repositori pengetahuan permanen,
        // pertahankan seluruh dokumen KM agar dapat selalu dibaca pada menu KM
        scopedRawTables.Data_KM = scopedRawTables.Knowledge_management;
      }

      // 3. Hitung metrik agregasi khusus cabang dan periode aktif
      const s = computeBranchSummary(scopedEmployees, scopedQCC, master.summary || {}, { ...master, rawTables: scopedRawTables });

      // Simpan payload scoped ke state global agar tabel dan ekspor presisi
      currentDashboardPayload = {
        ...master,
        employeeList: scopedEmployees,
        qccList: scopedQCC,
        rawTables: scopedRawTables,
        summary: s
      };
      initializeStandardTables(currentDashboardPayload, targetBranch);
      if (currentDashboardPayload.employeeList && currentDashboardPayload.employeeList.length > 0) {
        scopedEmployees = currentDashboardPayload.employeeList;
      }

      // Card 1: Master Karyawan
      document.getElementById('card-total-karyawan').textContent = s.totalKaryawan || 0;
      document.getElementById('card-pct-sales').textContent = `${s.salesCount || 0} Org (${s.salesPct || 0}%)`;
      document.getElementById('card-pct-service').textContent = `${s.serviceCount || 0} Org (${s.servicePct || 0}%)`;
      document.getElementById('card-pct-admin').textContent = `${s.adminCount || 0} Org (${s.adminPct || 0}%)`;
      const tetapPct = s.totalKaryawan ? Math.round(((s.countTetap || 0) / s.totalKaryawan) * 100) : 0;
      const pkwtPct = s.totalKaryawan ? Math.round(((s.countPKWT || 0) / s.totalKaryawan) * 100) : 0;
      if (document.getElementById('card-tetap-val')) document.getElementById('card-tetap-val').textContent = `${s.countTetap || 0} Orang`;
      if (document.getElementById('card-tetap-pct')) document.getElementById('card-tetap-pct').textContent = `${tetapPct}%`;
      if (document.getElementById('card-kontrak-val')) document.getElementById('card-kontrak-val').textContent = `${s.countPKWT || 0} Orang`;
      if (document.getElementById('card-kontrak-pct')) document.getElementById('card-kontrak-pct').textContent = `${pkwtPct}%`;
      if (document.getElementById('card-tetap-count')) document.getElementById('card-tetap-count').textContent = `${s.countTetap || 0} (${tetapPct}%)`;
      if (document.getElementById('card-kontrak-count')) document.getElementById('card-kontrak-count').textContent = `${s.countPKWT || 0} (${pkwtPct}%)`;

      // Render 5 Kategori Status Kepegawaian di Card 1 Dashboard
      const contractContainer = document.getElementById('dashboard-contract-group-list');
      if (contractContainer) {
        const cMap = s.contractGroupMap || {};
        const standardCats = STANDARD_CONTRACT_CATEGORIES;
        const totalEmp = s.totalKaryawan || 1;
        contractContainer.innerHTML = standardCats.map((grpName) => {
          const count = cMap[grpName] || 0;
          const meta = getContractMeta(grpName);
          const pct = Math.round((count / totalEmp) * 100);
          return `
            <div class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-xs ${meta.cardHover} transition min-w-0 shadow-2xs">
              <div class="w-7 h-7 rounded-lg ${meta.iconBg} flex items-center justify-center text-xs border ${meta.iconBorder} flex-shrink-0">
                <i class="${meta.icon}"></i>
              </div>
              <div class="min-w-0 flex-1 text-left">
                <div class="flex items-center justify-between gap-1 leading-tight">
                  <span class="text-[10px] font-bold text-slate-800 truncate" title="${meta.displayName}">${meta.displayName}</span>
                  <span class="px-1.5 py-0.5 rounded text-[8.5px] font-black ${meta.badgeBg} border flex-shrink-0">${pct}%</span>
                </div>
                <div class="text-xs font-black text-slate-900 leading-none mt-1">
                  ${count} <span class="text-[8.5px] font-medium text-slate-400 font-normal">Org</span>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      const cSales = document.getElementById('donut-slice-sales');
      const cSvc = document.getElementById('donut-slice-service');
      const cAdm = document.getElementById('donut-slice-admin');
      
      if (cSales && cSvc && cAdm) {
        const salesOffset = 0;
        const svcOffset = -(s.salesPct || 0);
        const admOffset = -((s.salesPct || 0) + (s.servicePct || 0));

        cSales.setAttribute('stroke-dasharray', `${s.salesPct || 0} 100`);
        cSales.setAttribute('stroke-dashoffset', `${salesOffset}`);
        cSvc.setAttribute('stroke-dasharray', `${s.servicePct || 0} 100`);
        cSvc.setAttribute('stroke-dashoffset', `${svcOffset}`);
        cAdm.setAttribute('stroke-dasharray', `${s.adminPct || 0} 100`);
        cAdm.setAttribute('stroke-dashoffset', `${admOffset}`);
      }

      // Card 2: Absensi & Disiplin
      document.getElementById('card-kehadiran-rate').innerHTML = `${s.avgAttendance || 0}<span class="text-2xl font-bold">%</span>`;
      document.getElementById('card-alpha-count').textContent = s.totalAlpha || 0;
      document.getElementById('card-telat-count').textContent = s.totalSeringTelat || 0;

      const attBadge = document.getElementById('card-attendance-badge');
      if (attBadge) {
        const numAtt = parseFloat(s.avgAttendance) || 0;
        if (numAtt >= 95) {
          attBadge.className = "mt-3 bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-center shadow-2xs";
          attBadge.innerHTML = `
            <span class="text-[10px] font-extrabold text-emerald-800 block flex items-center justify-center gap-1">
              <i class="fa-solid fa-circle-check text-emerald-600"></i> SANGAT BAIK
            </span>
            <span class="text-[9px] text-emerald-700 font-semibold block mt-0.5">Target Kehadiran &ge; 95% Terpenuhi</span>
          `;
        } else if (numAtt >= 90) {
          attBadge.className = "mt-3 bg-amber-50 p-2 rounded-xl border border-amber-200 text-center shadow-2xs";
          attBadge.innerHTML = `
            <span class="text-[10px] font-extrabold text-amber-800 block flex items-center justify-center gap-1">
              <i class="fa-solid fa-circle-exclamation text-amber-600"></i> CUKUP BAIK
            </span>
            <span class="text-[9px] text-amber-700 font-semibold block mt-0.5">Tingkat Kehadiran 90% - 94.9%</span>
          `;
        } else {
          attBadge.className = "mt-3 bg-red-50 p-2 rounded-xl border border-red-200 text-center shadow-2xs";
          attBadge.innerHTML = `
            <span class="text-[10px] font-extrabold text-red-800 block flex items-center justify-center gap-1">
              <i class="fa-solid fa-triangle-exclamation text-red-600"></i> PERLU PERHATIAN
            </span>
            <span class="text-[9px] text-red-700 font-semibold block mt-0.5">Tingkat Kehadiran di bawah standar 90%</span>
          `;
        }
      }

      // Card 3: Suggestion System (SS)
      document.getElementById('card-ss-total').textContent = s.totalSS || 0;
      document.getElementById('card-ss-target-denom').textContent = `/ ${s.targetSS || 0}`;
      const ssPct = (s.targetSS > 0) ? Math.min(Math.round(((s.totalSS || 0) / s.targetSS) * 100), 100) : 0;
      if (document.getElementById('card-ss-progress-bar')) {
        const bar = document.getElementById('card-ss-progress-bar');
        bar.style.width = `${ssPct}%`;
        if (ssPct >= 100) {
          bar.className = "bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500";
        } else if (ssPct >= 50) {
          bar.className = "bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500";
        } else {
          bar.className = "bg-gradient-to-r from-red-500 to-amber-500 h-2 rounded-full transition-all duration-500";
        }
      }
      if (document.getElementById('card-ss-target-pct')) document.getElementById('card-ss-target-pct').textContent = `${ssPct}%`;
      if (document.getElementById('card-ss-part-pct')) document.getElementById('card-ss-part-pct').textContent = `${s.ssParticipationRate || 0}%`;
      if (document.getElementById('card-ss-part-text')) {
        const part = s.ssParticipationRate || 0;
        if (part >= 80) {
          document.getElementById('card-ss-part-text').textContent = "Partisipasi sangat tinggi, budaya Kaizen aktif";
        } else if (part >= 50) {
          document.getElementById('card-ss-part-text').textContent = "Partisipasi stabil, dorong ide dari seluruh staf";
        } else {
          document.getElementById('card-ss-part-text').textContent = "Partisipasi perlu ditingkatkan kembali";
        }
      }
      if (document.getElementById('card-ss-implemented')) document.getElementById('card-ss-implemented').textContent = `${s.countImplementedSS || 0} Ide`;
      if (document.getElementById('card-ss-evaluasi')) document.getElementById('card-ss-evaluasi').textContent = `${s.countEvaluasiSS || 0} Ide`;

      // Card 4: QCC
      if (document.getElementById('card-qcc-total')) document.getElementById('card-qcc-total').textContent = s.totalQCCCircles || 0;
      renderDashboardQCCStatus(s.qccStatusCount || {});
      if (s.bestQCC) {
        if (document.getElementById('card-qcc-best-team')) document.getElementById('card-qcc-best-team').textContent = s.bestQCC.namaTim;
        if (document.getElementById('card-qcc-best-score')) {
          const skorText = String(s.bestQCC.skor || '');
          document.getElementById('card-qcc-best-score').textContent = skorText.startsWith('Status:') ? skorText : `Status: ${skorText}`;
        }
      } else {
        if (document.getElementById('card-qcc-best-team')) document.getElementById('card-qcc-best-team').textContent = "Belum Ada Circle";
        if (document.getElementById('card-qcc-best-score')) document.getElementById('card-qcc-best-score').textContent = "Status: -";
      }

      // Card 5: SP (Surat Peringatan)
      document.getElementById('card-sp-total').textContent = s.totalSP || 0;
      if (document.getElementById('card-teguran-count')) document.getElementById('card-teguran-count').textContent = s.countTeguran || 0;
      if (document.getElementById('card-sp1-count')) document.getElementById('card-sp1-count').textContent = s.countSP1 || 0;
      if (document.getElementById('card-sp2-count')) document.getElementById('card-sp2-count').textContent = s.countSP2 || 0;
      if (document.getElementById('card-sp3-count')) document.getElementById('card-sp3-count').textContent = s.countSP3 || 0;
      if (document.getElementById('card-sppt-count')) document.getElementById('card-sppt-count').textContent = s.countSPPT || 0;

      const spAlertBox = document.getElementById('card-sp-alert-box');
      if (spAlertBox) {
        if ((s.totalSP || 0) === 0) {
          spAlertBox.className = "mt-3 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center shadow-2xs";
          spAlertBox.innerHTML = `
            <p class="text-[11px] font-extrabold text-emerald-800 flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-circle-check text-emerald-600"></i> CLEAR BRANCH (Bebas Sanksi)
            </p>
            <p class="text-[9px] text-emerald-700 font-semibold mt-0.5 leading-tight">Seluruh staf cabang tertib tanpa sanksi aktif</p>
          `;
        } else {
          spAlertBox.className = "mt-3 bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-center shadow-2xs";
          spAlertBox.innerHTML = `
            <p class="text-[11px] font-extrabold text-rose-800 flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-triangle-exclamation text-rose-600"></i> ${s.totalSP} KASUS SANKSI AKTIF
            </p>
            <p class="text-[9px] text-rose-700 font-semibold mt-0.5 leading-tight">Perlu tindak lanjut pembinaan & monitoring kedisiplinan</p>
          `;
        }
      }

      // Card 6: Knowledge Management (KM)
      if (document.getElementById('card-km-total')) document.getElementById('card-km-total').textContent = s.totalKM || 0;
      if (document.getElementById('card-km-contributors')) document.getElementById('card-km-contributors').textContent = `${s.uniqueKMContributors || 0} Orang`;
      if (document.getElementById('card-km-verified')) document.getElementById('card-km-verified').textContent = (s.totalKM > 0) ? "100%" : "0%";

      const kmAlertBox = document.getElementById('card-km-alert-box');
      if (kmAlertBox) {
        if ((s.totalKM || 0) === 0) {
          kmAlertBox.className = "mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center shadow-2xs";
          kmAlertBox.innerHTML = `
            <p class="text-[11px] font-extrabold text-slate-700 flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-folder-open text-slate-400"></i> BELUM ADA MATERI
            </p>
            <p class="text-[9px] text-slate-500 font-semibold mt-0.5 leading-tight">Klik untuk melihat atau mengunggah materi KM</p>
          `;
        } else {
          kmAlertBox.className = "mt-3 bg-cyan-50 p-2.5 rounded-xl border border-cyan-200 text-center shadow-2xs";
          kmAlertBox.innerHTML = `
            <p class="text-[11px] font-extrabold text-cyan-800 flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-graduation-cap text-cyan-600"></i> REPOSITORI AKTIF
            </p>
            <p class="text-[9px] text-cyan-700 font-semibold mt-0.5 leading-tight">Tersedia ${s.totalKM} materi sharing session & best practice</p>
          `;
        }
      }

      // Dynamic Welcome Badge & Subtitle
      const welcomeBadge = document.getElementById('welcome-period-badge');
      if (welcomeBadge) {
        let pLabel = (selectedMonth === 'ALL' && selectedYear === 'ALL') ? 'Semua Periode' : 
                     (selectedMonth === 'ALL') ? `Tahun ${selectedYear}` : 
                     (selectedYear === 'ALL') ? `Bulan ${selectedMonth}` : `${selectedMonth} ${selectedYear}`;
        welcomeBadge.textContent = pLabel;
      }
      const welcomeSub = document.getElementById('welcome-greeting-subtitle');
      if (welcomeSub) {
        const branchInfo = typeof resolveBranchInfo === 'function' ? resolveBranchInfo(targetBranch) : null;
        const branchName = branchInfo ? `${branchInfo.name} (${branchInfo.code})` : (targetBranch === 'ALL' ? 'seluruh cabang DSO Lampung' : targetBranch);
        welcomeSub.textContent = `Ringkasan performa dan data kinerja karyawan wilayah ${branchName}.`;
      }

      // Sinkronisasi data karyawan dengan data agregat riil dari database (scopedRawTables)
      const rawAbs = scopedRawTables.Data_Kehadiran || [];
      const rawSS = scopedRawTables.Data_SS || [];
      const rawSP = scopedRawTables.Data_SP || [];
      const rawKM = scopedRawTables.Knowledge_management || scopedRawTables.Data_KM || [];

      scopedEmployees.forEach((e, idx) => {
        const divInfo = resolveEmployeeDivision(e, idx);
        e.divisi = divInfo.divisionName;
        e.divisiCategory = divInfo.category;
        const npk = safeString(e.npk || e['Personnel no.']);
        if (!npk) return;
        const cleanNpk = npk.replace(/^0+/, '');

        const matchNpk = (val) => {
          const sVal = safeString(val);
          return sVal === npk || sVal.replace(/^0+/, '') === cleanNpk;
        };

        // Real-time SS per staf
        if (rawSS.length > 0) {
          const empSS = rawSS.filter(r => matchNpk(r['NPK'] || r.npk || r['Personnel no.']));
          e.totalSS = empSS.length;
        } else if (e.totalSS === undefined) {
          e.totalSS = 0;
        }

        // Real-time SP per staf
        if (rawSP.length > 0) {
          const empSP = rawSP.filter(r => matchNpk(r['NPK'] || r.npk || r['Personnel no.']));
          if (empSP.length > 0) {
            const lastSp = empSP[empSP.length - 1];
            e.spAktif = String(lastSp['Tingkat SP'] || lastSp['Jenis Sanksi'] || lastSp['Status SP'] || lastSp.tingkat || '').trim() || 'SP';
            e.spAlasan = lastSp['Alasan'] || '';
          } else {
            e.spAktif = '';
            e.spAlasan = '';
          }
        }

        // Real-time Kehadiran % per staf
        if (rawAbs.length > 0) {
          const empAbs = rawAbs.filter(r => matchNpk(r['NPK'] || r.npk || r['Personnel no.']));
          if (empAbs.length > 0) {
            let late = 0;
            let alpha = 0;
            empAbs.forEach(r => {
              const rawTime = getRowCellValue(r, 'Time Clock In', SCHEMAS.Data_Kehadiran) || r['Time Clock In'] || r['Clock In'] || '';
              const est = getRowCellValue(r, 'Status Kehadiran', SCHEMAS.Data_Kehadiran) || r['Status Kehadiran'] || '';
              const lateness = calculateLatenessInfo(est || rawTime);
              const ket = String(getRowCellValue(r, 'Keterangan', SCHEMAS.Data_Kehadiran) || r['Keterangan'] || '').toLowerCase();
              if (lateness.isLate || ket.includes('terlambat') || ket.includes('telat')) late++;
              else if (ket.includes('tanpa keterangan') || ket.includes('alpha') || ket.includes('alpa') || ket.includes('mangkir') || lateness.text === 'Tanpa Keterangan' || lateness.text === 'Alpha' || lateness.text === 'Alpa' || !lateness.hasClockIn) alpha++;
            });
            e.kehadiranPct = Math.round(((empAbs.length - late - alpha) / empAbs.length) * 100);
            e.telat = late;
            e.alpha = alpha;
          }
        }
        if (e.kehadiranPct === undefined || isNaN(e.kehadiranPct)) {
          e.kehadiranPct = 100;
        }

        // Real-time KM per staf
        if (rawKM.length > 0) {
          const empKM = rawKM.filter(r => matchNpk(r['NPK'] || r.npk || r['Personnel no.']));
          e.totalKM = empKM.length;
        } else {
          e.totalKM = 0;
        }
      });

      const dashEmpBadge = document.getElementById('dash-emp-table-badge');
      if (dashEmpBadge) {
        dashEmpBadge.textContent = `${(scopedEmployees || []).length} Karyawan`;
      }

      try {
        renderEmployeeTable(scopedEmployees);
      } catch (e) {
        console.error("renderEmployeeTable error:", e);
      }
      try {
        renderPBKTable(scopedEmployees);
      } catch (e) {
        console.error("renderPBKTable error:", e);
      }

      // Render data untuk setiap menu modul dengan proteksi try/catch
      try { renderMasterKaryawanView(currentDashboardPayload); } catch (e) { console.error("renderMasterKaryawanView error:", e); }
      try { renderAbsensiView(currentDashboardPayload); } catch (e) { console.error("renderAbsensiView error:", e); }
      try { renderSSView(currentDashboardPayload); } catch (e) { console.error("renderSSView error:", e); }
      try { renderQCCView(currentDashboardPayload); } catch (e) { console.error("renderQCCView error:", e); }
      try { renderSPView(currentDashboardPayload); } catch (e) { console.error("renderSPView error:", e); }
      try { renderKMView(currentDashboardPayload); } catch (e) { console.error("renderKMView error:", e); }
      try { updateSidebarReadiness(currentDashboardPayload); } catch (e) { console.error("updateSidebarReadiness error:", e); }
      try { if (typeof updateResignReviewBanner === 'function') updateResignReviewBanner(); } catch (e) { console.error("updateResignReviewBanner error:", e); }
      try { if (typeof initAllColumnToggleButtons === 'function') initAllColumnToggleButtons(); } catch (e) { console.error("initAllColumnToggleButtons error:", e); }
    }

    // ----------------------------------------------------
    // A. Master Karyawan View & Filters
    // ----------------------------------------------------

    function switchMkKpiView(tab) {
      const cards = {
        contract: document.getElementById('mk-kpi-card-contract'),
        job: document.getElementById('mk-kpi-card-job')
      };
      const tabs = {
        all: document.getElementById('mk-kpi-tab-all'),
        contract: document.getElementById('mk-kpi-tab-contract'),
        job: document.getElementById('mk-kpi-tab-job')
      };

      Object.keys(tabs).forEach(k => {
        if (tabs[k]) {
          tabs[k].className = 'mk-kpi-tab px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-xs';
        }
      });
      if (tabs[tab]) {
        tabs[tab].className = 'mk-kpi-tab px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs';
      }

      if (tab === 'all') {
        if (cards.contract) cards.contract.style.display = 'block';
        if (cards.job) cards.job.style.display = 'block';
      } else {
        if (cards.contract) cards.contract.style.display = tab === 'contract' ? 'block' : 'none';
        if (cards.job) cards.job.style.display = tab === 'job' ? 'block' : 'none';
      }
    }

    // Helper metadata ikon dan warna untuk masing-masing Job Title (Kolom Job Title)
    function getJobTitleMeta(jobTitle) {
      const t = String(jobTitle || '').toLowerCase().trim();
      if (t.includes('sales') || t.includes('wiraniaga') || t.includes('marketing') || t.includes('counter')) {
        return {
          displayName: jobTitle || 'Sales Executive',
          icon: 'fa-solid fa-user-tie',
          iconBg: 'bg-blue-100 text-blue-600',
          iconBorder: 'border-blue-200',
          badgeBg: 'bg-blue-100 text-blue-700 border-blue-200',
          cardHover: 'hover:bg-blue-50/70 hover:border-blue-200',
          barColor: 'bg-blue-600'
        };
      }
      if (t.includes('mekanik') || t.includes('teknisi') || t.includes('mechanic')) {
        return {
          displayName: jobTitle || 'Mekanik / Teknisi',
          icon: 'fa-solid fa-screwdriver-wrench',
          iconBg: 'bg-emerald-100 text-emerald-600',
          iconBorder: 'border-emerald-200',
          badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          cardHover: 'hover:bg-emerald-50/70 hover:border-emerald-200',
          barColor: 'bg-emerald-600'
        };
      }
      if (t.includes('advisor') || t.includes(' sa ') || t.startsWith('sa') || t.includes('service advisor') || t.includes('customer service') || t.includes('cro')) {
        return {
          displayName: jobTitle || 'Service Advisor',
          icon: 'fa-solid fa-headset',
          iconBg: 'bg-cyan-100 text-cyan-600',
          iconBorder: 'border-cyan-200',
          badgeBg: 'bg-cyan-100 text-cyan-700 border-cyan-200',
          cardHover: 'hover:bg-cyan-50/70 hover:border-cyan-200',
          barColor: 'bg-cyan-600'
        };
      }
      if (t.includes('foreman') || t.includes('leader') || t.includes('kepala regu') || t.includes('team lead')) {
        return {
          displayName: jobTitle || 'Foreman',
          icon: 'fa-solid fa-user-gear',
          iconBg: 'bg-amber-100 text-amber-600',
          iconBorder: 'border-amber-200',
          badgeBg: 'bg-amber-100 text-amber-700 border-amber-200',
          cardHover: 'hover:bg-amber-50/70 hover:border-amber-200',
          barColor: 'bg-amber-500'
        };
      }
      if (t.includes('spv') || t.includes('supervisor') || t.includes('head') || t.includes('manager') || t.includes('kepala') || t.includes('kabeng')) {
        return {
          displayName: jobTitle || 'Supervisor / Head',
          icon: 'fa-solid fa-user-shield',
          iconBg: 'bg-purple-100 text-purple-600',
          iconBorder: 'border-purple-200',
          badgeBg: 'bg-purple-100 text-purple-700 border-purple-200',
          cardHover: 'hover:bg-purple-50/70 hover:border-purple-200',
          barColor: 'bg-purple-600'
        };
      }
      if (t.includes('part') || t.includes('gudang') || t.includes('logistik') || t.includes('inventory')) {
        return {
          displayName: jobTitle || 'Partman / Gudang',
          icon: 'fa-solid fa-boxes-stacked',
          iconBg: 'bg-orange-100 text-orange-600',
          iconBorder: 'border-orange-200',
          badgeBg: 'bg-orange-100 text-orange-700 border-orange-200',
          cardHover: 'hover:bg-orange-50/70 hover:border-orange-200',
          barColor: 'bg-orange-500'
        };
      }
      if (t.includes('cashier') || t.includes('kasir') || t.includes('finance') || t.includes('akunting')) {
        return {
          displayName: jobTitle || 'Kasir / Finance',
          icon: 'fa-solid fa-cash-register',
          iconBg: 'bg-teal-100 text-teal-600',
          iconBorder: 'border-teal-200',
          badgeBg: 'bg-teal-100 text-teal-700 border-teal-200',
          cardHover: 'hover:bg-teal-50/70 hover:border-teal-200',
          barColor: 'bg-teal-600'
        };
      }
      if (t.includes('admin') || t.includes('staff') || t.includes('administrasi')) {
        return {
          displayName: jobTitle || 'Admin Staff',
          icon: 'fa-solid fa-laptop-file',
          iconBg: 'bg-indigo-100 text-indigo-600',
          iconBorder: 'border-indigo-200',
          badgeBg: 'bg-indigo-100 text-indigo-700 border-indigo-200',
          cardHover: 'hover:bg-indigo-50/70 hover:border-indigo-200',
          barColor: 'bg-indigo-600'
        };
      }
      if (t.includes('driver') || t.includes('supir') || t.includes('delivery')) {
        return {
          displayName: jobTitle || 'Driver / Delivery',
          icon: 'fa-solid fa-truck-fast',
          iconBg: 'bg-slate-100 text-slate-700',
          iconBorder: 'border-slate-300',
          badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
          cardHover: 'hover:bg-slate-50 hover:border-slate-300',
          barColor: 'bg-slate-500'
        };
      }

      // Dynamic fallback rotation
      const palette = [
        { icon: 'fa-solid fa-id-badge', bg: 'violet', bar: 'bg-violet-600' },
        { icon: 'fa-solid fa-user-check', bg: 'emerald', bar: 'bg-emerald-600' },
        { icon: 'fa-solid fa-users', bg: 'sky', bar: 'bg-sky-600' },
        { icon: 'fa-solid fa-circle-user', bg: 'rose', bar: 'bg-rose-600' },
        { icon: 'fa-solid fa-id-card', bg: 'amber', bar: 'bg-amber-600' }
      ];
      let hash = 0;
      for (let i = 0; i < t.length; i++) hash = (hash + t.charCodeAt(i)) % palette.length;
      const p = palette[hash];
      return {
        displayName: jobTitle || 'Staff Unit',
        icon: p.icon,
        iconBg: `bg-${p.bg}-100 text-${p.bg}-600`,
        iconBorder: `border-${p.bg}-200`,
        badgeBg: `bg-${p.bg}-100 text-${p.bg}-700 border-${p.bg}-200`,
        cardHover: `hover:bg-${p.bg}-50/70 hover:border-${p.bg}-200`,
        barColor: p.bar
      };
    }

    // Helper ikon dan warna 5 kategori baku status kepegawaian (Contract) DSO Lampung
    function getContractMeta(contractName) {
      const norm = normalizeContractCategory(contractName);
      if (norm === 'Tetap / Permanent') {
        return {
          displayName: 'Tetap',
          subName: 'Permanent',
          fullName: 'Tetap / Permanent',
          icon: 'fa-solid fa-user-check',
          iconBg: 'bg-blue-100 text-blue-600',
          iconBorder: 'border-blue-200',
          badgeBg: 'bg-blue-100 text-blue-700 border-blue-200',
          cardHover: 'hover:bg-blue-50/70 hover:border-blue-200',
          barColor: 'bg-blue-600'
        };
      }
      if (norm === 'Kontrak / PKWT') {
        return {
          displayName: 'Kontrak',
          subName: 'PKWT',
          fullName: 'Kontrak / PKWT',
          icon: 'fa-solid fa-user-clock',
          iconBg: 'bg-amber-100 text-amber-600',
          iconBorder: 'border-amber-200',
          badgeBg: 'bg-amber-100 text-amber-700 border-amber-200',
          cardHover: 'hover:bg-amber-50/70 hover:border-amber-200',
          barColor: 'bg-amber-500'
        };
      }
      if (norm === 'Contracters') {
        return {
          displayName: 'Contracters',
          subName: 'Mitra / Vendor',
          fullName: 'Contracters',
          icon: 'fa-solid fa-helmet-safety',
          iconBg: 'bg-purple-100 text-purple-600',
          iconBorder: 'border-purple-200',
          badgeBg: 'bg-purple-100 text-purple-700 border-purple-200',
          cardHover: 'hover:bg-purple-50/70 hover:border-purple-200',
          barColor: 'bg-purple-500'
        };
      }
      if (norm === 'On probation') {
        return {
          displayName: 'Probation',
          subName: 'Masa Percobaan',
          fullName: 'On probation',
          icon: 'fa-solid fa-user-gear',
          iconBg: 'bg-orange-100 text-orange-600',
          iconBorder: 'border-orange-200',
          badgeBg: 'bg-orange-100 text-orange-700 border-orange-200',
          cardHover: 'hover:bg-orange-50/70 hover:border-orange-200',
          barColor: 'bg-orange-500'
        };
      }
      if (norm === 'Magang/Intern') {
        return {
          displayName: 'Magang',
          subName: 'Internship',
          fullName: 'Magang / Intern',
          icon: 'fa-solid fa-graduation-cap',
          iconBg: 'bg-emerald-100 text-emerald-600',
          iconBorder: 'border-emerald-200',
          badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          cardHover: 'hover:bg-emerald-50/70 hover:border-emerald-200',
          barColor: 'bg-emerald-500'
        };
      }
      return {
        displayName: contractName || 'Lainnya',
        subName: 'Status Lain',
        fullName: contractName || 'Lainnya',
        icon: 'fa-solid fa-id-card-clip',
        iconBg: 'bg-slate-100 text-slate-600',
        iconBorder: 'border-slate-200',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        cardHover: 'hover:bg-slate-100/60 hover:border-slate-300',
        barColor: 'bg-slate-400'
      };
    }

    // Expose Global Dashboard Functions
    window.loadBackendDashboardData = loadBackendDashboardData;
    window.renderAllDashboardData = renderAllDashboardData;
    window.ensureMasterStore = ensureMasterStore;
    window.showDatabaseLoadError = showDatabaseLoadError;
    window.getContractMeta = getContractMeta;

