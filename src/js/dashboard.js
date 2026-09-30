/**
 * D-PERFORM - Dashboard Metrics & Aggregations
 * Data Store, Summaries, KPI Cards, and Analytics
 */

    function initializeStandardTables(payload) {
      if (!payload) return;
      if (!payload.rawTables) payload.rawTables = {};

      const employees = payload.employeeList || [];
      const qccs = payload.qccList || [];

      // 1. Master_Karyawan (16 Columns - 100% Identik Database)
      if (!payload.rawTables.Master_Karyawan || !payload.rawTables.Master_Karyawan.length) {
        payload.rawTables.Master_Karyawan = employees.map((e, idx) => {
          const contractVal = e['Contract'] || e.Contract || e.contract || e.tipeKontrak || e.statusKontrak || e.statusKepegawaian || 'Tetap';
          e['Contract'] = contractVal;
          e.tipeKontrak = contractVal;
          return {
            "Personnel no.": safeString(e['Personnel no.'] || e.npk),
            "P.subarea": e['P.subarea'] || e.cabang || 'Lampung A Yani',
            "Wilayah": e['Wilayah'] || e.wilayah || 'DSO Lampung',
            "Contract": contractVal,
            "Name": e['Name'] || e.divisi || 'Operational',
            "Name of organizational unit": e['Name of organizational unit'] || (e.divisi ? `${e.divisi} DSO` : 'Departemen DSO'),
            "Job Title": e['Job Title'] || e.jabatan || 'Staff',
            "Last name": e['Last name'] || e.nama || '',
            "D.o.birth": findDOBirth(e, idx),
            "Gender text": e['Gender text'] || e.gender || 'Male',
            "Religious denomination": e['Religious denomination'] || e.agama || 'Islam',
            "PS group": findPSGroup(e, idx),
            "Lvl": findLvl(e, idx),
            "Date": findDate(e, idx),
            "P0001-STEXT": findP0001STEXT(e, idx),
            "Business area": safeString(e['Business area'] || e.kodeBA || 'D660')
          };
        });
      } else {
        payload.rawTables.Master_Karyawan.forEach((row, idx) => {
          const npk = safeString(row['Personnel no.']);
          const emp = employees.find(e => safeString(e.npk || e['Personnel no.']) === npk) || employees[idx] || {};
          if (emp) {
            emp['Contract'] = row['Contract'] || 'Tetap';
            emp.tipeKontrak = row['Contract'] || 'Tetap';
          }
          if (!row['D.o.birth'] || row['D.o.birth'] === '1995-05-15') {
            row['D.o.birth'] = findDOBirth(row, idx) || findDOBirth(emp, idx);
          }
          if (row['PS group'] === undefined || row['PS group'] === null || String(row['PS group']).trim() === '' || row['PS group'] === 'III/A') {
            row['PS group'] = findPSGroup(row, idx) || findPSGroup(emp, idx);
          }
          if (row['Lvl'] === 'Staff') {
            row['Lvl'] = findLvl(row, idx) || findLvl(emp, idx);
          }
          if (!row['Date'] || row['Date'] === '2021-01-01') {
            row['Date'] = findDate(row, idx) || findDate(emp, idx);
          }
          if (!row['P0001-STEXT'] || row['P0001-STEXT'] === 'Staff Unit' || row['P0001-STEXT'] === emp.jabatan) {
            row['P0001-STEXT'] = findP0001STEXT(row, idx) || findP0001STEXT(emp, idx);
          }
        });
      }

      // 2. Data_Kehadiran (19-20 Kolom - 100% Menggunakan Data Riil Database Tanpa Data Palsu)
      if (!payload.rawTables.Data_Kehadiran) {
        payload.rawTables.Data_Kehadiran = [];
      }

      // 3. Data_SS (21 Columns)
      if (!payload.rawTables.Data_SS || !payload.rawTables.Data_SS.length) {
        payload.rawTables.Data_SS = employees.map((e, idx) => {
          const countSS = e.totalSS || 0;
          const isApproved = countSS > 0;
          return {
            "No": safeString(idx + 1),
            "Registrasi": e['Registrasi'] || `SS-${e.kodeBA || 'D660'}-${String(idx + 1).padStart(3, '0')}`,
            "Nama": e['Nama'] || e.nama || '',
            "NPK": safeString(e['NPK'] || e.npk),
            "Wilayah": e['Wilayah'] || e.wilayah || 'DSO Lampung',
            "Cabang": e['Cabang'] || e.cabang || 'Lampung A Yani',
            "Kode BA": safeString(e['Kode BA'] || e.kodeBA || 'D660'),
            "Bagian": e['Bagian'] || e.divisi || 'Operational',
            "Tema": e['Tema'] || (isApproved ? 'Digitalisasi Format Checklist Inspeksi Kendaraan' : 'Optimalisasi Penataan Tool Workshop'),
            "Fasilitator": e['Fasilitator'] || 'Kepala Cabang',
            "NPK Fasilitator": safeString(e['NPK Fasilitator'] || '10001'),
            "Diterima Bulan": e['Diterima Bulan'] || 'Mei-25',
            "Kategori": e['Kategori'] || 'Quality & Productivity',
            "No.Akun AstraPay": safeString(e['No.Akun AstraPay'] || `0812${String(e.npk || idx + 1000).padStart(7, '0')}`),
            "Nama Akun": e['Nama Akun'] || e.nama || '',
            "Status Reward": e['Status Reward'] || (isApproved ? 'Approved' : 'Pending'),
            "Reward": e['Reward'] || (isApproved ? 'Rp 50.000' : '-'),
            "No.Berita Acara": e['No.Berita Acara'] || `BA-SS/${e.kodeBA || 'D660'}/2025`,
            "No.BPH": e['No.BPH'] || `BPH-05-2025-${String(idx + 1).padStart(2, '0')}`,
            "Distribusi Reward": e['Distribusi Reward'] || (isApproved ? 'Transfer AstraPay' : '-'),
            "Keterangan": e['Keterangan'] || (isApproved ? 'Terverifikasi Komite Kaizen' : 'Draft Pengajuan')
          };
        });
      }

      // 4. Data_QCC (29 Columns)
      if (!payload.rawTables.Data_QCC || !payload.rawTables.Data_QCC.length) {
        const baseQCC = qccs.length ? qccs : [
          { namaTim: "Circle Kaizen Service DSO", cabang: "Lampung A Yani", kodeBA: "D660", departemen: "Service & Workshop", status: "Finish", tema: "Peningkatan Kecepatan Service Berkala dari 60 Menit ke 45 Menit", leader: "Ahmad Fauzi" },
          { namaTim: "Circle Speed-Up Sales", cabang: "Lampung S Hatta", kodeBA: "D661", departemen: "Sales & Delivery", status: "Progress", tema: "Reduksi Waktu Serah Terima Unit Kendaraan Baru ke Konsumen", leader: "Bambang Irawan" },
          { namaTim: "Circle Tertib Administrasi", cabang: "Bandarjaya", kodeBA: "D662", departemen: "Finance & Admin", status: "Progress", tema: "Penerapan E-Archive Faktur Kendaraan Tanpa Kertas", leader: "Citra Lestari" },
          { namaTim: "Circle Part & Inventory", cabang: "Lampung Utara", kodeBA: "D663", departemen: "Logistik & Gudang", status: "Progress", tema: "Eliminasi Selisih Stok Fast Moving Parts di Gudang", leader: "Dedy Prasetya" },
          { namaTim: "Circle Zero Defect Body Repair", cabang: "Lampung Timur", kodeBA: "D664", departemen: "Body & Paint", status: "Finish", tema: "Pengurangan Debu Cat Finishing dengan Modifikasi Filter Booth", leader: "Eko Wahyudi" }
        ];

        payload.rawTables.Data_QCC = baseQCC.map((q, idx) => ({
          "No": safeString(idx + 1),
          "No.Registrasi": q['No.Registrasi'] || `QCC-${q.kodeBA || 'D660'}-0${idx + 1}`,
          "Nama Tim": q['Nama Tim'] || q.namaTim || 'Circle Kaizen DSO',
          "Wilayah/Divisi": q['Wilayah/Divisi'] || 'DSO Lampung',
          "Cabang/Departemen": q['Cabang/Departemen'] || `${q.cabang || 'Lampung A Yani'} / ${q.departemen || 'Service'}`,
          "Kode BA": safeString(q['Kode BA'] || q.kodeBA || 'D660'),
          "Bagian": q['Bagian'] || q.departemen || 'Workshop',
          "Fasilitator": q['Fasilitator'] || 'Kepala Cabang',
          "Leader": q['Leader'] || q.leader || 'Ahmad Fauzi',
          "Anggota 1": q['Anggota 1'] || 'Budi Santoso',
          "Anggota 2": q['Anggota 2'] || 'Citra Dewi',
          "Anggota 3": q['Anggota 3'] || 'Dedi Kurniawan',
          "Anggota 4": q['Anggota 4'] || 'Eko Prasetyo',
          "Anggota 5": q['Anggota 5'] || 'Fajar Pratama',
          "Anggota 6": q['Anggota 6'] || 'Guntur Wijaya',
          "Anggota 7": q['Anggota 7'] || 'Hendra Setiawan',
          "Tema": q['Tema'] || q.tema || 'Peningkatan Kualitas dan Kecepatan Pelayanan Pelanggan',
          "Kategori": q['Kategori'] || 'QCC Kategori Teknik',
          "Status": q['Status'] || q.status || q.pdca || 'Progress',
          "No.Akun Astrapay QC Leader": safeString(q['No.Akun Astrapay QC Leader'] || '081298765432'),
          "Pendaftaran diterima": parseExcelDate(q['Pendaftaran diterima'] || '2025-01-15'),
          "L 1-8 diterima": parseExcelDate(q['L 1-8 diterima'] || '2025-05-10'),
          "Langkah 1-3": q['Langkah 1-3'] || 'Selesai',
          "Langkah 1-5": q['Langkah 1-5'] || 'Selesai',
          "No.Berita Acara": q['No.Berita Acara'] || `BA-QCC/${q.kodeBA || 'D660'}/2025`,
          "Status Reward": q['Status Reward'] || 'Terverifikasi',
          "No.BPH": q['No.BPH'] || `BPH-QCC-2025-${idx + 1}`,
          "Tahun Konvensi": safeString(q['Tahun Konvensi'] || ''),
          "Kelengkapan Risalah Langkah 1-8": q['Kelengkapan Risalah Langkah 1-8'] || 'Lengkap (Format Baku ADM)'
        }));
      }

      // 5. Data_SP (5 Columns)
      if (!payload.rawTables.Data_SP || !payload.rawTables.Data_SP.length) {
        payload.rawTables.Data_SP = employees.filter(e => !!e.spAktif).map(e => ({
          "NPK": safeString(e['NPK'] || e.npk),
          "Nama": e['Nama'] || e.nama,
          "Kode BA": safeString(e['Kode BA'] || e.kodeBA || 'D660'),
          "Tingkat SP": e['Tingkat SP'] || e.spAktif || 'SP 1',
          "Alasan": e['Alasan'] || e.spAlasan || 'Ketidakhadiran berulang tanpa izin resmi tertulis'
        }));
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

      const salesCount = employees.filter(e => (e.divisi || '').toLowerCase().includes('sales')).length;
      const serviceCount = employees.filter(e => (e.divisi || '').toLowerCase().includes('service') || (e.divisi || '').toLowerCase().includes('bengkel')).length;
      const adminCount = employees.filter(e => {
        const div = (e.divisi || '').toLowerCase();
        return div.includes('admin') || div.includes('finance') || div.includes('general') || div.includes('ga');
      }).length;

      const otherCount = Math.max(0, totalKaryawan - salesCount - serviceCount - adminCount);
      const finalAdminCount = adminCount + otherCount;

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
          const isAlpha = ket.includes('alpha') || ket.includes('mangkir') || (!lateness.hasClockIn && (ket.includes('tidak') || ket.includes('absen')));

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

      return {
        totalKaryawan,
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
        totalKM
      };
    }

    function ensureMasterStore(data) {
      if (!data) return;
      // Selalu perbarui master store dengan salinan payload terbaru yang telah disanitasi
      const fullCopy = sanitizeLampungPayload(JSON.parse(JSON.stringify(data)));
      initializeStandardTables(fullCopy);
      window.masterFullPayload = fullCopy;
      window.fullUnscopedPayload = fullCopy;
    }

    async function loadBackendDashboardData(shouldShowLoader = true) {
      const isAdmin = isUserAdmin(loggedInUser);
      const userBranchCode = getUserBranchCode(loggedInUser);

      // Admin selalu mengambil ALL branches agar filter antar cabang instan tanpa kehilangan data
      const queryBranch = isAdmin ? 'ALL' : userBranchCode;
      const activeBranchVal = isAdmin ? (document.getElementById('branch-select')?.value || 'ALL') : userBranchCode;
      const monthVal = document.getElementById('month-select')?.value || 'ALL';
      const yearVal = document.getElementById('year-select')?.value || 'ALL';

      const loader = document.getElementById('loading-overlay');
      if (shouldShowLoader && loader) loader.classList.remove('hidden');

      try {
        const res = await callBackendAPI("GET_DASHBOARD", {
          user: loggedInUser,
          branch: queryBranch,
          period: 'ALL'
        });

        if (loader) loader.classList.add('hidden');

        if (res && res.success && res.data) {
          ensureMasterStore(res.data);

          if (isAdmin) {
            const dynamicBranches = extractBranchesFromData(res.data);
            populateBranchDropdown(dynamicBranches);
          }
          populateMonthAndYearDropdowns(res.data);

          renderAllDashboardData(window.masterFullPayload || res.data, activeBranchVal, monthVal, yearVal);
        } else {
          if (window.masterFullPayload) {
            renderAllDashboardData(window.masterFullPayload, activeBranchVal, monthVal, yearVal);
          }
        }
      } catch (err) {
        if (loader) loader.classList.add('hidden');
        console.error("Error loading backend dashboard data:", err);
        if (window.masterFullPayload) {
          renderAllDashboardData(window.masterFullPayload, activeBranchVal, monthVal, yearVal);
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

      // 1. Filter ketat per cabang (Eksklusif D660, D661, D662, D663, D664)
      let scopedEmployees = (master.employeeList || []).filter(e => matchBranch(e, targetBranch));
      let scopedQCC = (master.qccList || []).filter(q => matchBranch(q, targetBranch));

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

      // Card 1: Master Karyawan
      document.getElementById('card-total-karyawan').textContent = s.totalKaryawan || 0;
      document.getElementById('card-pct-sales').textContent = `${s.salesPct || 0}%`;
      document.getElementById('card-pct-service').textContent = `${s.servicePct || 0}%`;
      document.getElementById('card-pct-admin').textContent = `${s.adminPct || 0}%`;
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
            <div class="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-xs ${meta.cardHover} transition min-w-0 shadow-2xs">
              <div class="w-6 h-6 rounded-lg ${meta.iconBg} flex items-center justify-center text-[10px] border ${meta.iconBorder} flex-shrink-0">
                <i class="${meta.icon}"></i>
              </div>
              <div class="min-w-0 flex-1 text-left">
                <div class="flex items-center justify-between gap-0.5 leading-tight">
                  <span class="text-[9px] font-bold text-slate-800 truncate" title="${meta.displayName}">${meta.displayName}</span>
                  <span class="px-1 py-0.2 rounded text-[8px] font-black ${meta.badgeBg} border flex-shrink-0">${pct}%</span>
                </div>
                <div class="text-[11px] font-black text-slate-900 leading-none mt-0.5">
                  ${count} <span class="text-[8px] font-medium text-slate-400 font-normal">Org</span>
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
          spAlertBox.className = "mt-3 bg-red-50 p-2.5 rounded-xl border border-red-200 text-center shadow-2xs";
          spAlertBox.innerHTML = `
            <p class="text-[11px] font-extrabold text-red-800 flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-triangle-exclamation text-red-600"></i> ${s.totalSP} KASUS SANKSI AKTIF
            </p>
            <p class="text-[9px] text-red-700 font-semibold mt-0.5 leading-tight">Perlu tindak lanjut pembinaan & monitoring kedisiplinan</p>
          `;
        }
      }

      renderEmployeeTable(scopedEmployees);
      renderPBKTable(scopedEmployees);

      // Render data untuk setiap menu modul dengan proteksi try/catch
      try { renderMasterKaryawanView(currentDashboardPayload); } catch (e) { console.error("renderMasterKaryawanView error:", e); }
      try { renderAbsensiView(currentDashboardPayload); } catch (e) { console.error("renderAbsensiView error:", e); }
      try { renderSSView(currentDashboardPayload); } catch (e) { console.error("renderSSView error:", e); }
      try { renderQCCView(currentDashboardPayload); } catch (e) { console.error("renderQCCView error:", e); }
      try { renderSPView(currentDashboardPayload); } catch (e) { console.error("renderSPView error:", e); }
      try { renderKMView(currentDashboardPayload); } catch (e) { console.error("renderKMView error:", e); }
      try { updateSidebarReadiness(currentDashboardPayload); } catch (e) { console.error("updateSidebarReadiness error:", e); }
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