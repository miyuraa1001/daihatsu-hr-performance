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
      const kmBox = document.getElementById('km-modal-automation-box');
      const fileLabel = document.getElementById('upload-file-label');
      const fileHint = document.getElementById('upload-file-hint');
      const modalTitle = document.getElementById('upload-modal-title');
      const modalSubtitle = document.getElementById('upload-modal-subtitle');
      const modalIconWrapper = document.getElementById('upload-modal-icon-wrapper');
      const modalIcon = document.getElementById('upload-modal-icon');
      const dropzoneIcon = document.getElementById('upload-dropzone-icon');

      const isKM = (targetSheet === 'Knowledge_management' || targetSheet === 'Data_KM');

      if (kmBox) {
        if (isKM) {
          kmBox.classList.remove('hidden');
        } else {
          kmBox.classList.add('hidden');
        }
      }

      const schemaPreview = document.getElementById('upload-schema-preview');
      if (schemaPreview) {
        if (isKM) {
          schemaPreview.classList.add('hidden');
        } else {
          schemaPreview.classList.remove('hidden');
        }
      }

      if (modalIconWrapper && modalIcon) {
        if (isKM) {
          modalIconWrapper.className = "w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold flex-shrink-0 border border-cyan-200 shadow-2xs";
          modalIcon.className = "fa-solid fa-book-bookmark text-lg";
        } else {
          modalIconWrapper.className = "w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold flex-shrink-0 border border-red-100 shadow-2xs";
          modalIcon.className = "fa-solid fa-cloud-arrow-up text-lg";
        }
      }

      if (dropzoneIcon) {
        const fileInput = document.getElementById('excel-file-input');
        if (!fileInput || !fileInput.files || !fileInput.files.length) {
          dropzoneIcon.className = `w-10 h-10 rounded-2xl ${isKM ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-red-50 border-red-200 text-red-600'} border flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform`;
        }
      }

      if (modalTitle) {
        modalTitle.textContent = isKM 
          ? "Import & Rekap Berkas KM (.xlsx / .csv)" 
          : "Upload & Impor Data HR (.xlsx / .csv)";
      }
      if (modalSubtitle) {
        modalSubtitle.textContent = isKM
          ? "Gunakan file CSV hasil skrip rekap otomatis atau file Excel KM"
          : "Normalisasi otomatis header & validasi tipe data presisi";
      }
      if (fileLabel) {
        fileLabel.innerHTML = isKM
          ? `Pilih Berkas Rekap KM <span class="text-slate-400 font-normal font-mono text-[11px]">(Rekap_KM_Siap_Upload.csv / .xlsx)</span>:`
          : "Pilih Berkas Excel atau CSV:";
      }
      if (fileHint) {
        const fileInput = document.getElementById('excel-file-input');
        if (!fileInput || !fileInput.files || !fileInput.files.length) {
          fileHint.textContent = isKM
            ? "Mendukung Rekap_KM_Siap_Upload.csv, .xlsx, atau .csv (Maks. 25MB)"
            : "Mendukung format .xlsx, .xls, dan .csv dengan header di baris pertama.";
        }
      }

      if (titleEl) titleEl.textContent = `Skema Wajib: ${schema.sheetName}`;
      if (colsEl) {
        if (isKM) {
          colsEl.innerHTML = `4 Kolom Wajib Berkas: <b class="text-slate-800 font-mono">NPK, NAMA, JUDUL, TANGGAL</b><span class="text-emerald-600 block text-[11px] font-semibold mt-1"><i class="fa-solid fa-clock mr-1"></i>Kolom <b>TIME</b> otomatis diisi waktu saat berkas diunggah, NAMA otomatis sinkron dari Master Karyawan.</span>`;
        } else {
          colsEl.textContent = `${schema.columns.length} Kolom Baku (Sesuai Urutan): ${schema.columns.join(', ')}`;
        }
      }
    }

    function handleUploadFileInputChange(input) {
      const displayBox = document.getElementById('upload-file-display-name');
      const dropzoneIcon = document.getElementById('upload-dropzone-icon');
      const fileHint = document.getElementById('upload-file-hint');
      const targetSheet = document.getElementById('upload-target-sheet')?.value || '';
      const isKM = (targetSheet === 'Knowledge_management' || targetSheet === 'Data_KM');

      if (!input || !input.files || !input.files.length) {
        if (displayBox) {
          displayBox.textContent = "Klik untuk memilih berkas atau seret berkas ke sini";
        }
        if (fileHint) {
          fileHint.textContent = isKM
            ? "Mendukung Rekap_KM_Siap_Upload.csv, .xlsx, atau .csv (Maks. 25MB)"
            : "Mendukung format .xlsx, .xls, dan .csv dengan header di baris pertama.";
        }
        if (dropzoneIcon) {
          dropzoneIcon.className = `w-10 h-10 rounded-2xl ${isKM ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-red-50 border-red-200 text-red-600'} border flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform`;
          dropzoneIcon.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i>`;
        }
        return;
      }

      const file = input.files[0];
      const sizeKb = (file.size / 1024).toFixed(1);
      const sizeStr = file.size > 1048576 ? `${(file.size / 1048576).toFixed(2)} MB` : `${sizeKb} KB`;

      if (displayBox) {
        displayBox.innerHTML = `<span class="text-emerald-700 font-extrabold flex items-center justify-center gap-1.5"><i class="fa-solid fa-circle-check text-emerald-600"></i> ${file.name}</span>`;
      }
      if (fileHint) {
        fileHint.innerHTML = `<span class="text-slate-600 font-medium">Ukuran berkas: <b>${sizeStr}</b> • Berkas siap diproses</span>`;
      }
      if (dropzoneIcon) {
        dropzoneIcon.className = "w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform";
        dropzoneIcon.innerHTML = `<i class="fa-solid fa-file-excel"></i>`;
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
        return `<td class="py-2.5 px-4 text-center whitespace-nowrap border-b border-slate-100">${detailBtn}</td>`;
      }

      return `
        <td class="py-2.5 px-4 text-center whitespace-nowrap border-b border-slate-100">
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

    const EDIT_FORM_SECTIONS = {
      Master_Karyawan: [
        {
          id: 'sec_mk_identitas',
          title: 'Identitas & Profil Karyawan',
          desc: 'Nomor induk kepegawaian (NPK), nama lengkap, dan data biodata',
          icon: 'fa-id-card',
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          iconBorder: 'border-blue-200',
          columns: ['No', 'Personnel no.', 'Last name', 'Gender text', 'Religious denomination', 'D.o.birth']
        },
        {
          id: 'sec_mk_organisasi',
          title: 'Organisasi & Penempatan Kerja',
          desc: 'Informasi cabang, divisi kerja, job title, level, dan grade organisasi',
          icon: 'fa-building',
          iconBg: 'bg-indigo-50',
          iconColor: 'text-indigo-600',
          iconBorder: 'border-indigo-200',
          columns: ['Business area', 'P.subarea', 'Wilayah', 'Name of organizational unit', 'Name', 'Job Title', 'Lvl', 'PS group', 'P0001-STEXT']
        },
        {
          id: 'sec_mk_status',
          title: 'Status Kepegawaian & Disiplin',
          desc: 'Tipe kontrak kerja, tanggal masuk, serta riwayat kelulusan/pengunduran diri',
          icon: 'fa-file-signature',
          iconBg: 'bg-emerald-50',
          iconColor: 'text-emerald-600',
          iconBorder: 'border-emerald-200',
          columns: ['Date', 'Contract', 'Status_Karyawan', 'Tanggal_Resign', 'Alasan_Resign']
        }
      ],
      Data_Kehadiran: [
        {
          id: 'sec_abs_identitas',
          title: 'Identitas Karyawan & Cabang',
          desc: 'NPK, nama pegawai, serta area cabang operasional',
          icon: 'fa-user-clock',
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          iconBorder: 'border-blue-200',
          columns: ['No', 'Personnel no.', 'NPK', 'Employee Name', 'Business area', 'Cabang', 'Wilayah']
        },
        {
          id: 'sec_abs_waktu',
          title: 'Presensi & Durasi Jam Kerja',
          desc: 'Catatan tanggal, jam clock in/out, estimasi status keterlambatan & jam kerja',
          icon: 'fa-clock',
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-600',
          iconBorder: 'border-amber-200',
          columns: ['Date', 'Time Clock In', 'Time Clock Out', 'Durasi Kerja (Work Hours)', 'Status Kehadiran', 'Estimasi Telat (Asumsi 08.00)']
        },
        {
          id: 'sec_abs_lokasi',
          title: 'Verifikasi Lokasi & Keterangan',
          desc: 'Pengecekan geofencing koordinat presensi dan perizinan CICO',
          icon: 'fa-map-pin',
          iconBg: 'bg-purple-50',
          iconColor: 'text-purple-600',
          iconBorder: 'border-purple-200',
          columns: ['In Radius Clock in', 'In Radius Clock Out', 'Need CICO Approval', 'Latitude Clock In', 'Longitude Clock In', 'Latitude Clock Out', 'Longitude Clock Out', 'Keterangan']
        }
      ],
      Data_SS: [
        {
          id: 'sec_ss_usulan',
          title: 'Informasi Usulan Kaizen (Suggestion System)',
          desc: 'Nomor registrasi inovasi, inisiator, unit cabang, dan tema usulan perbaikan',
          icon: 'fa-lightbulb',
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-600',
          iconBorder: 'border-amber-200',
          columns: ['No', 'Registrasi', 'Nama', 'NPK', 'Cabang', 'Cabang/Departemen', 'Kode BA', 'Bagian', 'Tema', 'Kategori', 'Diterima Bulan']
        },
        {
          id: 'sec_ss_fasilitator',
          title: 'Fasilitator & Pendampingan',
          desc: 'Data pembimbing usulan dan pendamping ide inovasi',
          icon: 'fa-user-group',
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          iconBorder: 'border-blue-200',
          columns: ['Fasilitator', 'NPK Fasilitator']
        },
        {
          id: 'sec_ss_reward',
          title: 'Evaluasi SOP ADM & Reward',
          desc: 'Verifikasi status pencairan reward, nomor berita acara, akun AstraPay, & BPH',
          icon: 'fa-award',
          iconBg: 'bg-emerald-50',
          iconColor: 'text-emerald-600',
          iconBorder: 'border-emerald-200',
          columns: ['Status Reward', 'Reward', 'No.Akun AstraPay', 'Nama Akun', 'No.Berita Acara', 'No.BPH', 'Distribusi Reward', 'Keterangan']
        }
      ],
      Data_QCC: [
        {
          id: 'sec_qcc_tim',
          title: 'Profil Circle & Struktur Gugus Kendali Mutu',
          desc: 'Data kelompok perbaikan mutu, penempatan cabang, circle leader, fasilitator & anggota',
          icon: 'fa-users-gear',
          iconBg: 'bg-indigo-50',
          iconColor: 'text-indigo-600',
          iconBorder: 'border-indigo-200',
          columns: ['No', 'No.Registrasi', 'Nama Tim', 'Cabang/Departemen', 'Kode BA', 'Bagian', 'Leader', 'Fasilitator', 'Anggota 1', 'Anggota 2', 'Anggota 3', 'Anggota 4', 'Anggota 5', 'Anggota 6']
        },
        {
          id: 'sec_qcc_proyek',
          title: 'Tema Perbaikan & Siklus PDCA',
          desc: 'Tema proyek mutu, kategori kaizen, tahapan PDCA, jadwal pelaksanaan, & administrasi reward',
          icon: 'fa-chart-pie',
          iconBg: 'bg-emerald-50',
          iconColor: 'text-emerald-600',
          iconBorder: 'border-emerald-200',
          columns: ['Tema', 'Kategori', 'Status', 'Bulan Registrasi', 'Start', 'Target Selesai', 'No. Berita Acara', 'No. BPH', 'Distribusi Reward Circle', 'Distribusi Reward Fasilitator', 'Keterangan']
        }
      ],
      Data_SP: [
        {
          id: 'sec_sp_data',
          title: 'Catatan Kedisiplinan & Sanksi Karyawan',
          desc: 'Pencatatan pelanggaran peraturan kerja, tingkat surat peringatan, dan kronologi alasan sanksi',
          icon: 'fa-gavel',
          iconBg: 'bg-rose-50',
          iconColor: 'text-rose-600',
          iconBorder: 'border-rose-200',
          columns: ['No', 'NPK', 'Nama', 'Kode BA', 'Tingkat SP', 'Alasan']
        }
      ],
      Knowledge_management: [
        {
          id: 'sec_km_data',
          title: 'Dokumen Repositori Berbagi Pengetahuan (Knowledge Management)',
          desc: 'Pencatatan materi sharing session, penyaji, tanggal, dan waktu submit',
          icon: 'fa-book-open',
          iconBg: 'bg-cyan-50',
          iconColor: 'text-cyan-600',
          iconBorder: 'border-cyan-200',
          columns: ['No', 'NPK', 'NAMA', 'JUDUL', 'TANGGAL', 'TIME']
        }
      ],
      Data_KM: [
        {
          id: 'sec_km_data',
          title: 'Dokumen Repositori Berbagi Pengetahuan (Knowledge Management)',
          desc: 'Pencatatan materi sharing session, penyaji, tanggal, dan waktu submit',
          icon: 'fa-book-open',
          iconBg: 'bg-cyan-50',
          iconColor: 'text-cyan-600',
          iconBorder: 'border-cyan-200',
          columns: ['No', 'NPK', 'NAMA', 'JUDUL', 'TANGGAL', 'TIME']
        }
      ]
    };
    window.EDIT_FORM_SECTIONS = EDIT_FORM_SECTIONS;

    const COLUMN_DISPLAY_LABELS = {
      'Personnel no.': 'NPK Pegawai',
      'First name': 'Nama Depan',
      'Last name': 'Nama Lengkap',
      'Name of organizational unit': 'Unit Organisasi',
      'Organizational Unit': 'Kode Unit Organisasi',
      'Organizational unit text': 'Nama Unit Organisasi',
      'Job': 'Kode Jabatan',
      'Job Title': 'Jabatan / Posisi',
      'Job text': 'Jabatan / Posisi',
      'Contract': 'Status Kontrak',
      'D.o.birth': 'Tanggal Lahir',
      'Place of birth': 'Tempat Lahir',
      'Entry': 'Tanggal Masuk',
      'Gender Text': 'Jenis Kelamin',
      'Gender text': 'Jenis Kelamin',
      'Religious denomination': 'Agama',
      'Business Area': 'Kode Business Area (BA)',
      'Business area': 'Kode Business Area (BA)',
      'BA Description': 'Nama Cabang / Business Area',
      'P.subarea': 'Subarea Cabang',
      'PS group': 'Golongan (PS Group)',
      'Lvl': 'Level Jabatan',
      'Time Clock In': 'Jam Masuk (Clock-In)',
      'Time Clock Out': 'Jam Pulang (Clock-Out)',
      'Clock In': 'Jam Masuk',
      'Clock Out': 'Jam Pulang',
      'Time': 'Jam Masuk',
      'Date': 'Tanggal',
      'Tanggal': 'Tanggal',
      'TANGGAL': 'Tanggal',
      'Estimasi Telat (Asumsi 08.00)': 'Estimasi Telat',
      'Status Kehadiran': 'Status Kehadiran',
      'Durasi Kerja (Work Hours)': 'Durasi Kerja (Jam)',
      'Durasi Kerja (Jam)': 'Durasi Kerja (Jam)',
      'Durasi Kerja': 'Durasi Kerja',
      'Work Hours': 'Jam Kerja',
      'Location': 'Lokasi Presensi',
      'Assigned Work Location': 'Lokasi Penugasan',
      'Keterangan': 'Keterangan Presensi',
      'Status Reward': 'Status Reward',
      'Status_Reward': 'Status Reward',
      'Reward': 'Besaran Reward (Rp)',
      'Distribusi Reward': 'Distribusi Reward',
      'Distribusi Reward Fasilitator': 'Reward Fasilitator',
      'No. BA': 'No. Berita Acara (BA)',
      'No. BPH': 'No. Dokumen BPH',
      'No. Reg': 'No. Registrasi',
      'No.Registrasi': 'No. Registrasi',
      'No Registrasi': 'No. Registrasi',
      'Nama Tim': 'Nama Circle / Tim',
      'Tema': 'Tema Perbaikan',
      'Tema Ide': 'Tema Usulan Kaizen',
      'Judul': 'Judul Inovasi / Riset',
      'JUDUL': 'Judul Materi / SOP',
      'TIME': 'Waktu Sesi',
      'NPK Leader': 'NPK Leader',
      'Leader NPK': 'NPK Leader',
      'Leader': 'Nama Leader',
      'Fasilitator': 'Nama Fasilitator',
      'Tingkat SP': 'Tingkat Sanksi Disiplin (SP)',
      'Tanggal Pelanggaran': 'Tanggal Surat SP',
      'Alasan SP': 'Alasan Pelanggaran / SP',
      'Alasan': 'Alasan Sanksi / PHK',
      'Masa Berlaku': 'Masa Berlaku SP',
      'Status_Karyawan': 'Status Karyawan',
      'Status Karyawan': 'Status Karyawan',
      'Tanggal_Resign': 'Tanggal Efektif Resign',
      'Alasan_Resign': 'Alasan Resign / PHK (PPHK)',
      'Lampiran_PPHK': 'Lampiran Dokumen PPHK',
      'AstraPay': 'No. AstraPay',
      'Nama AstraPay': 'Nama Akun AstraPay',
      'No. AstraPay': 'No. AstraPay'
    };

    function renderFieldInput(col, row, schema, sheetName, rowIndex) {
      const val = String(getRowCellValue(row, col, schema) || '');
      const norm = normalizeHeaderName(col);
      const displayLabel = COLUMN_DISPLAY_LABELS[col] || col;
      
      let inputHtml = '';
      if (norm === 'no' || norm === 'nomor') {
        inputHtml = `
          <input type="text" name="${col}" value="${rowIndex + 1}" readonly class="w-full px-3 py-2 bg-slate-100/90 text-slate-500 border border-slate-200 rounded-xl text-xs font-bold cursor-not-allowed">
        `;
      } else if (norm === 'contract') {
        const normVal = normalizeContractCategory(val);
        inputHtml = `
          <select name="${col}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer">
            <option value="Tetap / Permanent" ${normVal === 'Tetap / Permanent' ? 'selected' : ''}>Tetap / Permanent</option>
            <option value="Kontrak / PKWT" ${normVal === 'Kontrak / PKWT' ? 'selected' : ''}>Kontrak / PKWT</option>
            <option value="On probation" ${normVal === 'On probation' ? 'selected' : ''}>On probation</option>
            <option value="Magang/Intern" ${normVal === 'Magang/Intern' ? 'selected' : ''}>Magang/Intern</option>
          </select>
        `;
      } else if (norm === 'gender text') {
        const isMale = val.toLowerCase().includes('male') || val.toLowerCase().includes('laki');
        inputHtml = `
          <select name="${col}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer">
            <option value="Male" ${isMale ? 'selected' : ''}>Male</option>
            <option value="Female" ${!isMale ? 'selected' : ''}>Female</option>
          </select>
        `;
      } else if (norm === 'tingkat sp') {
        inputHtml = `
          <select name="${col}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer">
            <option value="-" ${(!val || val === '-') ? 'selected' : ''}>- (Tidak Ada SP)</option>
            <option value="Teguran Lisan" ${val === 'Teguran Lisan' ? 'selected' : ''}>Teguran Lisan</option>
            <option value="SP 1" ${val === 'SP 1' ? 'selected' : ''}>SP 1</option>
            <option value="SP 2" ${val === 'SP 2' ? 'selected' : ''}>SP 2</option>
            <option value="SP 3" ${val === 'SP 3' ? 'selected' : ''}>SP 3</option>
            <option value="SPPT" ${val === 'SPPT' ? 'selected' : ''}>SPPT</option>
          </select>
        `;
      } else if (norm === 'status_karyawan' || norm === 'status karyawan') {
        const isResign = val.toLowerCase().trim() === 'resign';
        inputHtml = `
          <select name="${col}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer">
            <option value="Aktif" ${!isResign ? 'selected' : ''}>Aktif</option>
            <option value="Resign" ${isResign ? 'selected' : ''}>Resign</option>
          </select>
        `;
      } else if (norm === 'status reward' || norm === 'status_reward') {
        const stdStatuses = ['Proses Penilaian', 'Berita Acara', 'BPH', 'IBRA / Lunas', 'Revisi', 'Dikembalikan'];
        const isCustom = val && !stdStatuses.some(s => s.toLowerCase() === val.toLowerCase());
        inputHtml = `
          <select name="${col}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer">
            ${stdStatuses.map(s => `<option value="${s}" ${val.toLowerCase() === s.toLowerCase() ? 'selected' : ''}>${s}</option>`).join('')}
            ${isCustom ? `<option value="${val}" selected>${val}</option>` : ''}
          </select>
        `;
      } else if (norm === 'alasan_resign' || norm === 'alasan phk' || norm === 'keterangan resign' || norm === 'alasan keluar') {
        const pphkList = window.STANDARD_PPHK_REASONS || [];
        const optHtml = pphkList.map(item => {
          const isSel = (val && (val.toLowerCase() === item.reason.toLowerCase() || val.toLowerCase().includes(item.reason.toLowerCase())));
          return `<option value="${item.reason}" ${isSel ? 'selected' : ''}>${item.reason}</option>`;
        }).join('');
        const initialAttachment = typeof getPPHKAttachment === 'function' ? getPPHKAttachment(val) : '-';
        inputHtml = `
          <div>
            <select name="${col}" id="edit-alasan-resign-select" onchange="updateEditResignAttachmentHint(this.value)" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer">
              <option value="">-- Pilih Alasan PHK / Resign (PPHK ADM) --</option>
              ${optHtml}
            </select>
            <div id="edit-resign-attachment-box" class="mt-2 p-2.5 bg-amber-50/95 rounded-xl border border-amber-200 text-[11px] text-amber-900 shadow-2xs ${val ? '' : 'hidden'}">
              <div class="font-bold flex items-center gap-1.5 text-amber-800">
                <i class="fa-solid fa-file-circle-check text-amber-600"></i>
                <span>Lampiran Dokumen Wajib (Kolom 2 PPHK):</span>
              </div>
              <div id="edit-resign-attachment-text" class="mt-1 text-slate-800 font-semibold leading-relaxed">${initialAttachment}</div>
            </div>
          </div>
        `;
      } else if (norm === 'status' && sheetName === 'Data_QCC') {
        inputHtml = `
          <select name="${col}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer">
            <option value="Plan" ${val.toLowerCase() === 'plan' ? 'selected' : ''}>Plan</option>
            <option value="Do" ${val.toLowerCase() === 'do' ? 'selected' : ''}>Do</option>
            <option value="Check" ${val.toLowerCase() === 'check' ? 'selected' : ''}>Check</option>
            <option value="Action" ${val.toLowerCase() === 'action' ? 'selected' : ''}>Action</option>
          </select>
        `;
      } else if (norm === 'p.subarea' || norm === 'subarea' || (sheetName === 'Master_Karyawan' && norm === 'cabang')) {
        const knownBranches = (typeof KNOWN_BRANCHES !== 'undefined' && Array.isArray(KNOWN_BRANCHES)) ? KNOWN_BRANCHES : [
          { code: 'D660', name: 'Lampung A Yani' },
          { code: 'D661', name: 'Lampung S Hatta' },
          { code: 'D662', name: 'Bandarjaya' },
          { code: 'D663', name: 'Lampung Utara' },
          { code: 'D664', name: 'Lampung Timur' }
        ];
        const currentNorm = typeof resolveBranchInfo === 'function' ? resolveBranchInfo(val) : null;
        const currentBranchName = currentNorm ? currentNorm.name : val;
        const isCustom = val && !knownBranches.some(b => b.name.toLowerCase() === val.toLowerCase() || b.code.toLowerCase() === val.toLowerCase());
        inputHtml = `
          <select name="${col}" id="edit-subarea-select" onchange="syncEditBranchSubarea(this.value)" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer">
            <option value="">-- Pilih Cabang DSO --</option>
            ${knownBranches.map(b => `<option value="${b.name}" data-ba="${b.code}" ${currentBranchName && (currentBranchName.toLowerCase() === b.name.toLowerCase() || currentBranchName.toUpperCase() === b.code) ? 'selected' : ''}>${b.name} (${b.code})</option>`).join('')}
            ${isCustom ? `<option value="${val}" selected>${val}</option>` : ''}
          </select>
        `;
      } else if (norm === 'business area' || norm === 'kode ba') {
        const knownBranches = (typeof KNOWN_BRANCHES !== 'undefined' && Array.isArray(KNOWN_BRANCHES)) ? KNOWN_BRANCHES : [
          { code: 'D660', name: 'Lampung A Yani' },
          { code: 'D661', name: 'Lampung S Hatta' },
          { code: 'D662', name: 'Bandarjaya' },
          { code: 'D663', name: 'Lampung Utara' },
          { code: 'D664', name: 'Lampung Timur' }
        ];
        const currentNormCode = typeof resolveBACode === 'function' ? resolveBACode(val) : val;
        const isCustom = val && !knownBranches.some(b => b.code.toUpperCase() === String(val).toUpperCase());
        inputHtml = `
          <select name="${col}" id="edit-business-area-select" onchange="syncEditBranchBACode(this.value)" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer">
            <option value="">-- Pilih Kode BA --</option>
            ${knownBranches.map(b => `<option value="${b.code}" data-subarea="${b.name}" ${currentNormCode && currentNormCode.toUpperCase() === b.code ? 'selected' : ''}>${b.code} - ${b.name}</option>`).join('')}
            ${isCustom ? `<option value="${val}" selected>${val}</option>` : ''}
          </select>
        `;
      } else if (norm.includes('date') || norm === 'd.o.birth' || norm.includes('tgl') || norm.includes('tanggal') || norm === 'entry' || norm === 'entry date' || norm.includes('gabung') || norm.includes('masuk') || norm.includes('join') || norm.includes('lahir')) {
        let dateVal = typeof parseExcelDate === 'function' ? parseExcelDate(val) : val;
        // Jika belum valid YYYY-MM-DD, lakukan fallback cerdas melalui findDOBirth / findDate
        if (!dateVal || !/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
          if (norm === 'd.o.birth' || norm.includes('lahir') || norm === 'dob' || norm === 'date of birth') {
            const fbDob = typeof findDOBirth === 'function' ? findDOBirth(row) : '';
            if (fbDob) dateVal = typeof parseExcelDate === 'function' ? parseExcelDate(fbDob) : fbDob;
          } else if (norm === 'date' || norm === 'entry' || norm === 'entry date' || norm.includes('gabung') || norm.includes('masuk') || norm.includes('join')) {
            const fbDate = typeof findDate === 'function' ? findDate(row) : '';
            if (fbDate) dateVal = typeof parseExcelDate === 'function' ? parseExcelDate(fbDate) : fbDate;
          }
        }
        inputHtml = `<input type="date" name="${col}" value="${dateVal || ''}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-white cursor-pointer">`;
      } else if (norm.includes('time') || norm.includes('jam')) {
        inputHtml = `<input type="time" name="${col}" value="${val}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">`;
      } else if (norm.includes('durasi kerja') || norm.includes('work hours')) {
        inputHtml = `<input type="number" step="0.1" name="${col}" value="${val}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">`;
      } else {
        const escapedVal = val.replace(/"/g, '&quot;');
        inputHtml = `<input type="text" name="${col}" value="${escapedVal}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">`;
      }

      const isWideField = norm === 'alasan_resign' || norm === 'alasan phk' || norm === 'keterangan' || norm === 'tema' || norm === 'judul' || norm === 'alasan';
      const colSpanClass = isWideField ? 'sm:col-span-2 lg:col-span-3' : '';

      return `
        <div class="${colSpanClass} min-w-0">
          <label class="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between min-w-0" title="${col}">
            <span class="truncate">${displayLabel}</span>
            ${norm === 'no' || norm === 'nomor' ? '<span class="text-[9px] text-slate-400 font-normal flex-shrink-0 ml-1">Auto</span>' : ''}
          </label>
          ${inputHtml}
        </div>
      `;
    }

    // Helper sinkronisasi dua arah Cabang & Kode BA pada form edit
    function syncEditBranchSubarea(branchName) {
      if (!branchName) return;
      const baSelect = document.getElementById('edit-business-area-select');
      if (baSelect) {
        const info = typeof resolveBranchInfo === 'function' ? resolveBranchInfo(branchName) : null;
        if (info && info.code) {
          baSelect.value = info.code;
        }
      }
    }
    window.syncEditBranchSubarea = syncEditBranchSubarea;

    function syncEditBranchBACode(baCode) {
      if (!baCode) return;
      const subareaSelect = document.getElementById('edit-subarea-select');
      if (subareaSelect) {
        const info = typeof resolveBranchInfo === 'function' ? resolveBranchInfo(baCode) : null;
        if (info && info.name) {
          subareaSelect.value = info.name;
        }
      }
    }
    window.syncEditBranchBACode = syncEditBranchBACode;

    function openEditRowModal(sheetName, rowIndex) {
      if (!isUserAdmin(loggedInUser)) {
        showToast("Akses ditolak: Hanya Admin yang memiliki wewenang mengedit data.");
        return;
      }
      const schema = SCHEMAS[sheetName];
      if (!schema || !currentDashboardPayload?.rawTables?.[sheetName]) return;
      const row = currentDashboardPayload.rawTables[sheetName][rowIndex];
      if (!row) return;

      if (sheetName === 'Master_Karyawan') {
        // Sinkronkan atribut tanggal dan penempatan kerja agar tidak kosong saat form dibuka
        if (!row['D.o.birth'] || row['D.o.birth'] === '-' || row['D.o.birth'] === '0' || row['D.o.birth'] === '1899-12-30') {
          const dob = (typeof findDOBirth === 'function' ? findDOBirth(row) : '') || (typeof getRowCellValue === 'function' ? getRowCellValue(row, 'D.o.birth', SCHEMAS.Master_Karyawan) : '');
          if (dob) row['D.o.birth'] = dob;
        }
        if (!row['Date'] || row['Date'] === '-' || row['Date'] === '0' || row['Date'] === '1899-12-30') {
          const jDate = (typeof findDate === 'function' ? findDate(row) : '') || (typeof getRowCellValue === 'function' ? getRowCellValue(row, 'Date', SCHEMAS.Master_Karyawan) : '');
          if (jDate) row['Date'] = jDate;
        }
        if (!row['P.subarea'] || row['P.subarea'] === '-' || row['P.subarea'] === '0') {
          const br = row.cabang || row['Cabang'] || (typeof resolveBranchInfo === 'function' ? resolveBranchInfo(row['Business area'] || row.kodeBA)?.name : '');
          if (br) row['P.subarea'] = br;
        }
        if (!row['Business area'] || row['Business area'] === '-' || row['Business area'] === '0') {
          const ba = row.kodeBA || row['Kode BA'] || (typeof resolveBACode === 'function' ? resolveBACode(row['P.subarea'] || row.cabang) : '');
          if (ba) row['Business area'] = ba;
        }
      }

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
      const sections = EDIT_FORM_SECTIONS[sheetName] || [
        {
          id: 'sec_default',
          title: `Data Baris ${schema.title}`,
          desc: 'Daftar kolom atribut data',
          icon: 'fa-table-list',
          iconBg: 'bg-slate-100',
          iconColor: 'text-slate-600',
          iconBorder: 'border-slate-200',
          columns: schema.columns
        }
      ];

      const assignedCols = new Set();
      let sectionsHtml = '';

      sections.forEach(sec => {
        const secCols = schema.columns.filter(col => {
          const norm = normalizeHeaderName(col);
          const inSec = sec.columns.some(sc => normalizeHeaderName(sc) === norm);
          if (inSec) assignedCols.add(col);
          return inSec;
        });

        if (secCols.length === 0) return;

        const inputsHtml = secCols.map(col => renderFieldInput(col, row, schema, sheetName, rowIndex)).join('');

        sectionsHtml += `
          <div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition hover:border-slate-300">
            <div class="px-4 py-3 bg-gradient-to-r from-slate-50 via-slate-50/80 to-white border-b border-slate-100 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg ${sec.iconBg} ${sec.iconColor} flex items-center justify-center text-xs border ${sec.iconBorder} flex-shrink-0 shadow-2xs">
                  <i class="fa-solid ${sec.icon}"></i>
                </div>
                <div>
                  <h4 class="text-xs font-extrabold text-slate-800 leading-tight">${sec.title}</h4>
                  <p class="text-[10px] text-slate-500 font-medium">${sec.desc}</p>
                </div>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70 flex-shrink-0">
                ${secCols.length} Kolom
              </span>
            </div>
            <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              ${inputsHtml}
            </div>
          </div>
        `;
      });

      // Kolom sisa / kolom tambahan jika ada
      const unassigned = schema.columns.filter(col => !assignedCols.has(col));
      if (unassigned.length > 0) {
        const extraInputs = unassigned.map(col => renderFieldInput(col, row, schema, sheetName, rowIndex)).join('');
        sectionsHtml += `
          <div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition hover:border-slate-300">
            <div class="px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs border border-slate-200 flex-shrink-0 shadow-2xs">
                  <i class="fa-solid fa-folder-open"></i>
                </div>
                <div>
                  <h4 class="text-xs font-extrabold text-slate-800 leading-tight">Informasi Tambahan</h4>
                  <p class="text-[10px] text-slate-500 font-medium">Atribut dan metadata tambahan</p>
                </div>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70 flex-shrink-0">
                ${unassigned.length} Kolom
              </span>
            </div>
            <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              ${extraInputs}
            </div>
          </div>
        `;
      }

      container.innerHTML = sectionsHtml;

      // Update lampiran hint PPHK jika ada nilai awal
      const resignCol = schema.columns.find(c => {
        const n = normalizeHeaderName(c);
        return n === 'alasan_resign' || n === 'alasan phk' || n === 'keterangan resign';
      });
      if (resignCol) {
        const initialResignReason = String(getRowCellValue(row, resignCol, schema) || '');
        updateEditResignAttachmentHint(initialResignReason);
      }

      document.getElementById('modal-edit-row').classList.remove('hidden');
    }

    function updateEditResignAttachmentHint(val) {
      const box = document.getElementById('edit-resign-attachment-box');
      const text = document.getElementById('edit-resign-attachment-text');
      if (!box || !text) return;
      if (!val || val === '-') {
        box.classList.add('hidden');
        text.textContent = '';
      } else {
        box.classList.remove('hidden');
        text.textContent = typeof getPPHKAttachment === 'function' ? getPPHKAttachment(val) : 'Dokumen Pengajuan PPHK Sesuai SOP ADM';
      }
    }
    window.updateEditResignAttachmentHint = updateEditResignAttachmentHint;

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
        const norm = normalizeHeaderName(col);
        if (val !== null && val !== undefined) {
          // Jangan timpa tanggal valid yang sudah ada jika input form kosong
          if ((norm.includes('date') || norm === 'd.o.birth' || norm.includes('tgl') || norm.includes('tanggal')) && String(val).trim() === '') {
            const existingVal = targetRow[col];
            if (existingVal && existingVal !== '-' && existingVal !== '0' && existingVal !== '1899-12-30') {
              return;
            }
          }
          targetRow[col] = castSchemaValue(col, val, rowIndex + 1);
        }
      });

      // Dapatkan identitas unik baris untuk persistensi lokal dan update remote
      const rowKey = typeof getRowIdentifier === 'function' 
        ? getRowIdentifier(sheetName, targetRow, rowIndex)
        : String(targetRow['Personnel no.'] || targetRow['NPK'] || targetRow['Registrasi'] || rowIndex);
      const keyInfo = typeof getKeyFieldAndValue === 'function'
        ? getKeyFieldAndValue(sheetName, targetRow)
        : { keyField: '', keyValue: '' };

      // 1. Simpan ke Local Persistence (localStorage) seketika agar tahan reload (F5)
      if (typeof saveLocalEdit === 'function') {
        saveLocalEdit(sheetName, rowKey, targetRow);
        if (sheetName === 'Master_Karyawan' && targetRow['Personnel no.']) {
          saveLocalEdit(sheetName, String(targetRow['Personnel no.']).trim(), targetRow);
        }
      }

      // 2. Update di masterFullPayload dan fullUnscopedPayload
      [window.masterFullPayload, window.fullUnscopedPayload].forEach(payload => {
        if (payload?.rawTables?.[sheetName]) {
          const idx = payload.rawTables[sheetName].indexOf(targetRow);
          if (idx !== -1) {
            payload.rawTables[sheetName][idx] = targetRow;
          } else {
            const foundIdx = payload.rawTables[sheetName].findIndex((r, i) => {
              const k = typeof getRowIdentifier === 'function' ? getRowIdentifier(sheetName, r, i) : '';
              return k && k === rowKey;
            });
            if (foundIdx !== -1) {
              payload.rawTables[sheetName][foundIdx] = targetRow;
            } else if (payload.rawTables[sheetName][rowIndex]) {
              payload.rawTables[sheetName][rowIndex] = targetRow;
            }
          }
        }
      });

      // 3. Sinkronkan ke modul terkait secara realtime (termasuk employeeList di semua payload)
      if (sheetName === 'Master_Karyawan') {
        const npk = safeString(targetRow['Personnel no.']);
        [currentDashboardPayload, window.masterFullPayload, window.fullUnscopedPayload].forEach(payload => {
          if (Array.isArray(payload?.employeeList)) {
            const emp = payload.employeeList.find(e => safeString(e.npk || e['Personnel no.']) === npk);
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
              emp.umurText = typeof calculateEmployeeAge === 'function' ? calculateEmployeeAge(emp.tglLahir) : calculateAgeAndService(emp.tglLahir, 'age');
              emp.masaKerjaText = typeof calculateEmployeeTenure === 'function' ? calculateEmployeeTenure(emp.joinDate) : calculateAgeAndService(emp.joinDate, 'service');
              emp.gender = targetRow['Gender text'] || emp.gender;
              emp.agama = targetRow['Religious denomination'] || emp.agama;
              emp.psGroup = targetRow['PS group'] || emp.psGroup;
              emp.lvl = targetRow['Lvl'] || emp.lvl;
              emp.stext = targetRow['P0001-STEXT'] || emp.stext;
              emp.statusKaryawan = targetRow['Status_Karyawan'] || 'Aktif';
              emp['Status_Karyawan'] = targetRow['Status_Karyawan'] || 'Aktif';
              emp.tanggalResign = targetRow['Tanggal_Resign'] || emp.tanggalResign || '';
              emp['Tanggal_Resign'] = emp.tanggalResign;
              emp.alasanResign = targetRow['Alasan_Resign'] || emp.alasanResign || '';
              emp['Alasan_Resign'] = emp.alasanResign;
            }
          }
        });
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
        [currentDashboardPayload, window.masterFullPayload, window.fullUnscopedPayload].forEach(payload => {
          if (Array.isArray(payload?.employeeList)) {
            const emp = payload.employeeList.find(e => safeString(e.npk || e['Personnel no.']) === npk);
            if (emp) {
              emp.spAktif = (targetRow['Tingkat SP'] && targetRow['Tingkat SP'] !== '-') ? targetRow['Tingkat SP'] : '';
              emp.spAlasan = targetRow['Alasan'] || '';
            }
          }
        });
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
          localStorage.removeItem('dperform_km_cache');
        } catch(e) {}
        renderKMView(currentDashboardPayload);
        if (typeof filterKMTable === 'function') filterKMTable();
      }

      // Selalu perbarui metrik dashboard utama secara instan agar realtime
      if (typeof computeBranchSummary === 'function' && currentDashboardPayload) {
        currentDashboardPayload.summary = computeBranchSummary(
          currentDashboardPayload.employeeList,
          currentDashboardPayload.qccList,
          currentDashboardPayload.summary,
          currentDashboardPayload
        );
      }
      if (typeof renderAllDashboardData === 'function' && (window.masterFullPayload || currentDashboardPayload)) {
        renderAllDashboardData(window.masterFullPayload || currentDashboardPayload);
      }

      closeModal('modal-edit-row');
      showToast("💾 Perubahan berhasil disimpan! Menyinkronkan ke Google Sheets...", 3000);

      try {
        const res = await updateRowInBackend(sheetName, targetRow, rowIndex, keyInfo.keyField, keyInfo.keyValue);
        if (res && res.success) {
          showToast(`✅ Data ${schema.title} berhasil disinkronkan ke Google Sheets!`);
        } else {
          showToast(`⚠️ Data tersimpan di aplikasi (Status sync database: ${res?.message || 'Offline'})`);
        }
      } catch (err) {
        showToast(`⚠️ Data tersimpan di aplikasi (Gagal sync Google Sheets: ${err.message})`);
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
      const rowKey = typeof getRowIdentifier === 'function'
        ? getRowIdentifier(sheetName, targetRow, rowIndex)
        : String(npk || targetRow['Registrasi'] || rowIndex);
      const keyInfo = typeof getKeyFieldAndValue === 'function'
        ? getKeyFieldAndValue(sheetName, targetRow)
        : { keyField: '', keyValue: '' };

      // 1. Catat penghapusan ke Local Persistence (localStorage) seketika
      if (typeof saveLocalDelete === 'function') {
        saveLocalDelete(sheetName, rowKey);
        if (sheetName === 'Master_Karyawan' && npk) {
          saveLocalDelete(sheetName, npk);
        }
      }

      // 2. Hapus dari currentDashboardPayload.rawTables
      currentDashboardPayload.rawTables[sheetName].splice(rowIndex, 1);

      // 3. Hapus juga dari window.masterFullPayload dan window.fullUnscopedPayload
      [window.masterFullPayload, window.fullUnscopedPayload].forEach(payload => {
        if (payload?.rawTables?.[sheetName]) {
          const idx = payload.rawTables[sheetName].indexOf(targetRow);
          if (idx !== -1) {
            payload.rawTables[sheetName].splice(idx, 1);
          } else {
            const foundIdx = payload.rawTables[sheetName].findIndex((r, i) => {
              const k = typeof getRowIdentifier === 'function' ? getRowIdentifier(sheetName, r, i) : '';
              return k && k === rowKey;
            });
            if (foundIdx !== -1) {
              payload.rawTables[sheetName].splice(foundIdx, 1);
            } else if (payload.rawTables[sheetName][rowIndex]) {
              payload.rawTables[sheetName].splice(rowIndex, 1);
            }
          }
        }
      });

      // 4. Sinkronkan ke modul spesifik & update tampilan secara realtime
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
          [currentDashboardPayload, window.masterFullPayload, window.fullUnscopedPayload].forEach(payload => {
            if (Array.isArray(payload?.employeeList)) {
              const emp = payload.employeeList.find(e => safeString(e.npk || e['Personnel no.']) === npk);
              if (emp) {
                emp.spAktif = '';
                emp.spAlasan = '';
              }
            }
          });
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
          localStorage.removeItem('dperform_km_cache');
        } catch(e) {}
        renderKMView(currentDashboardPayload);
        if (typeof filterKMTable === 'function') filterKMTable();
      }

      // Selalu perbarui metrik dashboard utama secara instan agar realtime
      if (typeof computeBranchSummary === 'function' && currentDashboardPayload) {
        currentDashboardPayload.summary = computeBranchSummary(
          currentDashboardPayload.employeeList,
          currentDashboardPayload.qccList,
          currentDashboardPayload.summary,
          currentDashboardPayload
        );
      }
      if (typeof renderAllDashboardData === 'function' && (window.masterFullPayload || currentDashboardPayload)) {
        renderAllDashboardData(window.masterFullPayload || currentDashboardPayload);
      }

      closeModal('modal-delete-row');
      showToast("🗑️ Baris data dihapus! Menyinkronkan ke Google Sheets...", 3000);

      try {
        const res = await deleteRowInBackend(sheetName, rowIndex, keyInfo.keyField, keyInfo.keyValue);
        if (res && res.success) {
          showToast(`✅ Data ${schema.title} berhasil dihapus dari Google Sheets!`);
        } else {
          showToast(`⚠️ Data terhapus di aplikasi (Status sync database: ${res?.message || 'Offline'})`);
        }
      } catch (err) {
        showToast(`⚠️ Data terhapus di aplikasi (Gagal sync Google Sheets: ${err.message})`);
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
      const npkRaw = safeString(row['NPK'] || '-');
      let nama = row['NAMA'] || row['Nama'] || '';
      if (!nama || nama === '-' || nama === 'Karyawan DSO') {
        const found = typeof lookupEmployeeName === 'function' ? lookupEmployeeName(npkRaw) : '';
        nama = found || 'Karyawan DSO';
      }
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

    function buildEmployeeAttendanceSummaryRows(attendanceRecords, fullPayload) {
      const masterList = (fullPayload && fullPayload.employeeList) || 
                         (window.masterFullPayload && window.masterFullPayload.employeeList) || 
                         (currentDashboardPayload && currentDashboardPayload.employeeList) || [];
      const masterRaw = (fullPayload && fullPayload.rawTables?.Master_Karyawan) || 
                        (window.masterFullPayload && window.masterFullPayload.rawTables?.Master_Karyawan) || 
                        (currentDashboardPayload && currentDashboardPayload.rawTables?.Master_Karyawan) || [];

      const empMap = new Map();

      attendanceRecords.forEach(r => {
        const rawNpk = (typeof getRowCellValue === 'function' && typeof SCHEMAS !== 'undefined' && SCHEMAS.Data_Kehadiran)
          ? (getRowCellValue(r, 'NPK', SCHEMAS.Data_Kehadiran) || r['NPK'] || '')
          : (r['NPK'] || '');
        const cleanNpk = safeString(rawNpk).trim();
        if (!cleanNpk || cleanNpk === '-' || cleanNpk === '0') return;

        if (!empMap.has(cleanNpk)) {
          let empName = (typeof getRowCellValue === 'function' && typeof SCHEMAS !== 'undefined' && SCHEMAS.Data_Kehadiran)
            ? (getRowCellValue(r, 'Employee Name', SCHEMAS.Data_Kehadiran) || r['Employee Name'] || r['Nama'] || '')
            : (r['Employee Name'] || r['Nama'] || '');
          let empBranch = (typeof getRowCellValue === 'function' && typeof SCHEMAS !== 'undefined' && SCHEMAS.Data_Kehadiran)
            ? (getRowCellValue(r, 'Cabang', SCHEMAS.Data_Kehadiran) || r['Cabang'] || '-')
            : (r['Cabang'] || '-');

          const masterEmp = masterList.find(e => safeString(e.npk || e['Personnel no.']).trim() === cleanNpk) ||
                            masterRaw.find(e => safeString(e['Personnel no.'] || e.npk).trim() === cleanNpk);
          if (masterEmp) {
            if (!empName || empName.startsWith('Karyawan ')) {
              empName = (typeof getRowCellValue === 'function' && typeof SCHEMAS !== 'undefined' && SCHEMAS.Master_Karyawan)
                ? (getRowCellValue(masterEmp, 'Last name', SCHEMAS.Master_Karyawan) || masterEmp.nama || empName)
                : (masterEmp.nama || masterEmp['Last name'] || empName);
            }
            if (!empBranch || empBranch === '-') {
              empBranch = (typeof getRowCellValue === 'function' && typeof SCHEMAS !== 'undefined' && SCHEMAS.Master_Karyawan)
                ? (getRowCellValue(masterEmp, 'P.subarea', SCHEMAS.Master_Karyawan) || masterEmp.cabang || empBranch)
                : (masterEmp.cabang || masterEmp['P.subarea'] || empBranch);
            }
          }

          empMap.set(cleanNpk, {
            npk: cleanNpk,
            nama: empName || `Karyawan ${cleanNpk}`,
            cabang: empBranch,
            totalHari: 0,
            hadirCount: 0,
            onTimeCount: 0,
            lateCount: 0,
            tanpaKeteranganCount: 0,
            totalWorkHours: 0,
            validWorkHoursCount: 0
          });
        }

        const emp = empMap.get(cleanNpk);
        emp.totalHari++;

        const rawTime = (typeof getRowCellValue === 'function' && typeof SCHEMAS !== 'undefined' && SCHEMAS.Data_Kehadiran)
          ? (getRowCellValue(r, 'Time Clock In', SCHEMAS.Data_Kehadiran) || r['Time Clock In'] || r['Clock In'] || r['Time'] || r['Jam Masuk'] || '')
          : (r['Time Clock In'] || r['Clock In'] || r['Time'] || r['Jam Masuk'] || '');
        const existingEstimasi = (typeof getRowCellValue === 'function' && typeof SCHEMAS !== 'undefined' && SCHEMAS.Data_Kehadiran)
          ? (getRowCellValue(r, 'Status Kehadiran', SCHEMAS.Data_Kehadiran) || r['Status Kehadiran'] || r['Estimasi Telat (Asumsi 08.00)'] || '')
          : (r['Status Kehadiran'] || '');
        const lateness = calculateLatenessInfo(existingEstimasi || rawTime);
        const ket = String((typeof getRowCellValue === 'function' && typeof SCHEMAS !== 'undefined' && SCHEMAS.Data_Kehadiran)
          ? (getRowCellValue(r, 'Keterangan', SCHEMAS.Data_Kehadiran) || r['Keterangan'] || '')
          : (r['Keterangan'] || '')).toLowerCase();
        const telatStr = String(existingEstimasi || '').toLowerCase();

        const isLate = lateness.isLate || ket.includes('terlambat') || ket.includes('telat') || telatStr.includes('telat');

        if (lateness.hasClockIn) {
          emp.hadirCount++;
          if (isLate) {
            emp.lateCount++;
          } else {
            emp.onTimeCount++;
          }
        } else {
          emp.tanpaKeteranganCount++;
        }

        const whRaw = (typeof getRowCellValue === 'function' && typeof SCHEMAS !== 'undefined' && SCHEMAS.Data_Kehadiran)
          ? (getRowCellValue(r, 'Durasi Kerja (Work Hours)', SCHEMAS.Data_Kehadiran) || r['Durasi Kerja (Work Hours)'] || r['Work Hours'] || r['Durasi Kerja'])
          : (r['Durasi Kerja (Work Hours)'] || r['Work Hours'] || r['Durasi Kerja']);
        const wh = safeFloat(whRaw, 0);
        if (wh > 0) {
          emp.totalWorkHours += wh;
          emp.validWorkHoursCount++;
        }
      });

      const empList = Array.from(empMap.values());
      empList.sort((a, b) => a.nama.localeCompare(b.nama));

      return empList.map((emp, idx) => {
        const pct = emp.totalHari > 0 ? Math.round((emp.hadirCount / emp.totalHari) * 100) : 0;
        const avgWh = emp.validWorkHoursCount > 0 ? (emp.totalWorkHours / emp.validWorkHoursCount).toFixed(1) : (emp.hadirCount > 0 ? '8.0' : '0.0');

        return {
          "No": idx + 1,
          "NPK": emp.npk,
          "Nama Karyawan": emp.nama,
          "Cabang": emp.cabang,
          "Total Hari Kerja": emp.totalHari,
          "Masuk (Hadir)": emp.hadirCount,
          "Tepat Waktu": emp.onTimeCount,
          "Terlambat": emp.lateCount,
          "Tanpa Keterangan": emp.tanpaKeteranganCount,
          "Persentase Kehadiran (%)": `${pct}%`,
          "Total Jam Kerja (Jam)": parseFloat(emp.totalWorkHours.toFixed(1)),
          "Rata-rata Jam Kerja (Jam/Hari)": parseFloat(avgWh)
        };
      });
    }
    window.buildEmployeeAttendanceSummaryRows = buildEmployeeAttendanceSummaryRows;

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

        // Terapkan filter pencarian tabel jika user sedang mencari di input
        const q = (document.getElementById('mk-search-input')?.value || '').toLowerCase().trim();
        if (q) {
          list = list.filter((e, rowIdx) => {
            return String(e['Personnel no.'] || e.npk || '').toLowerCase().includes(q) || 
              String(e['Last name'] || e.nama || '').toLowerCase().includes(q) ||
              String(e['Job Title'] || e.jabatan || '').toLowerCase().includes(q) ||
              String(e['P.subarea'] || e.cabang || '').toLowerCase().includes(q) ||
              String(e['Business area'] || e.kodeBA || '').toLowerCase().includes(q) ||
              String(e['Status_Karyawan'] || e.statusKaryawan || '').toLowerCase().includes(q);
          });
        }

        // Terapkan filter kontrak jika ada
        const contractFilter = document.getElementById('mk-filter-kontrak')?.value || 'ALL';
        if (contractFilter !== 'ALL') {
          const targetNorm = normalizeContractCategory(contractFilter).toLowerCase();
          list = list.filter(e => {
            const raw = String(e['Contract'] || e.tipeKontrak || 'Tetap / Permanent').trim();
            const rawNorm = normalizeContractCategory(raw).toLowerCase();
            return rawNorm === targetNorm || raw.toLowerCase() === contractFilter.toLowerCase();
          });
        }

        // Definisi urutan kolom ekspor baku dengan kolom Umur & Masa Kerja terpisah
        exportColumns = [
          "No",
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
          exportColumns.push("Tanggal_Resign", "Alasan_Resign", "Lampiran_Alasan_PHK");
        }

        exportRows = list.map((row, idx) => {
          const dob = (row['D.o.birth'] !== undefined && row['D.o.birth'] !== null && String(row['D.o.birth']).trim() !== '')
            ? row['D.o.birth']
            : (row.tglLahir || row.dob || (typeof findDOBirth === 'function' ? findDOBirth(row) : ''));
          const joinDate = (row['Date'] !== undefined && row['Date'] !== null && String(row['Date']).trim() !== '')
            ? row['Date']
            : (row.joinDate || (typeof findDate === 'function' ? findDate(row) : ''));

          const umurVal = (row.umurText && row.umurText !== '-') ? row.umurText : (typeof calculateEmployeeAge === 'function' ? calculateEmployeeAge(dob) : calculateAgeAndService(dob, 'age'));
          const masaKerjaVal = (row.masaKerjaText && row.masaKerjaText !== '-') ? row.masaKerjaText : (typeof calculateEmployeeTenure === 'function' ? calculateEmployeeTenure(joinDate) : calculateAgeAndService(joinDate, 'service'));
          const alasanResignVal = row['Alasan_Resign'] || row.alasanResign || '';

          const obj = {};
          exportColumns.forEach(col => {
            if (col === 'No') {
              obj['No'] = idx + 1;
            } else if (col === 'Personnel no.') {
              obj['Personnel no.'] = safeString(row['Personnel no.'] || row.npk);
            } else if (col === 'P.subarea') {
              obj['P.subarea'] = row['P.subarea'] || row.cabang || '';
            } else if (col === 'Wilayah') {
              obj['Wilayah'] = row['Wilayah'] || row.wilayah || '';
            } else if (col === 'Contract') {
              obj['Contract'] = row['Contract'] || row.tipeKontrak || 'Tetap / Permanent';
            } else if (col === 'Name') {
              obj['Name'] = row['Name'] || row.divisi || '';
            } else if (col === 'Name of organizational unit') {
              obj['Name of organizational unit'] = row['Name of organizational unit'] || row.divisi || '';
            } else if (col === 'Job Title') {
              obj['Job Title'] = row['Job Title'] || row.jabatan || '';
            } else if (col === 'Last name') {
              obj['Last name'] = row['Last name'] || row.nama || '';
            } else if (col === 'Umur') {
              obj['Umur'] = (umurVal && umurVal !== '-') ? umurVal : "";
            } else if (col === 'Masa Kerja') {
              obj['Masa Kerja'] = (masaKerjaVal && masaKerjaVal !== '-') ? masaKerjaVal : "";
            } else if (col === 'D.o.birth') {
              obj['D.o.birth'] = formatDatabaseDate(dob);
            } else if (col === 'Date') {
              obj['Date'] = formatDatabaseDate(joinDate);
            } else if (col === 'Gender text') {
              obj['Gender text'] = row['Gender text'] || row.gender || '';
            } else if (col === 'Religious denomination') {
              obj['Religious denomination'] = row['Religious denomination'] || row.agama || '';
            } else if (col === 'PS group') {
              obj['PS group'] = (row[col] !== undefined && row[col] !== null && String(row[col]).trim() !== '') ? row[col] : (row.psGroup || (typeof findPSGroup === 'function' ? findPSGroup(row) : ''));
            } else if (col === 'Lvl') {
              obj['Lvl'] = (row[col] !== undefined && row[col] !== null && String(row[col]).trim() !== '') ? row[col] : (row.lvl || (typeof findLvl === 'function' ? findLvl(row) : ''));
            } else if (col === 'P0001-STEXT') {
              obj['P0001-STEXT'] = (row[col] !== undefined && row[col] !== null && String(row[col]).trim() !== '') ? row[col] : (row.stext || (typeof findP0001STEXT === 'function' ? findP0001STEXT(row) : ''));
            } else if (col === 'Business area') {
              obj['Business area'] = safeString(row['Business area'] || row.kodeBA);
            } else if (col === 'Status_Karyawan') {
              obj['Status_Karyawan'] = row['Status_Karyawan'] || row['Status Karyawan'] || row.statusKaryawan || 'Aktif';
            } else if (col === 'Tanggal_Resign') {
              obj['Tanggal_Resign'] = formatDatabaseDate(row['Tanggal_Resign'] || row.tanggalResign) || '';
            } else if (col === 'Alasan_Resign') {
              obj['Alasan_Resign'] = alasanResignVal;
            } else if (col === 'Lampiran_Alasan_PHK') {
              obj['Lampiran_Alasan_PHK'] = (alasanResignVal && typeof getPPHKAttachment === 'function') ? getPPHKAttachment(alasanResignVal) : '';
            } else {
              obj[col] = (row[col] !== undefined && row[col] !== null) ? row[col] : "";
            }
          });
          return obj;
        });

        const ws = XLSX.utils.json_to_sheet(exportRows, { header: exportColumns });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Master_Karyawan");
        const fileName = `Master_Karyawan_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);
        showToast(`Berkas ${fileName} berhasil diunduh (${exportRows.length} baris, ${exportColumns.length} kolom)!`);
        return;
      } else if (targetSheet === 'Data_Kehadiran') {
        const fullMaster = window.masterFullPayload || window.fullUnscopedPayload || currentDashboardPayload;
        let attendanceRows = fullMaster.rawTables?.Data_Kehadiran || currentDashboardPayload.rawTables?.Data_Kehadiran || rawRows || [];

        // Role-based branch filter
        if (!isAdmin) {
          attendanceRows = attendanceRows.filter(e => matchBranch(e, userBranchCode));
        } else {
          const selectedBranch = document.getElementById('branch-select')?.value || 'ALL';
          if (selectedBranch !== 'ALL') {
            attendanceRows = attendanceRows.filter(e => matchBranch(e, selectedBranch));
          }
        }

        const selectedMonth = document.getElementById('month-select')?.value || 'ALL';
        const selectedYear = document.getElementById('year-select')?.value || 'ALL';

        // Detect target year
        let targetYear = null;
        if (selectedYear !== 'ALL') {
          targetYear = parseInt(selectedYear, 10);
        } else {
          const yearCounts = {};
          attendanceRows.forEach(r => {
            const parsed = extractRowMonthYear(r);
            if (parsed && parsed.year) {
              yearCounts[parsed.year] = (yearCounts[parsed.year] || 0) + 1;
            }
          });
          const years = Object.keys(yearCounts).map(Number).sort((a, b) => b - a);
          targetYear = years.length > 0 ? years[0] : new Date().getFullYear();
        }

        // Filter rows by targetYear
        let yearRows = attendanceRows;
        if (targetYear) {
          yearRows = attendanceRows.filter(r => {
            const parsed = extractRowMonthYear(r);
            return !parsed || parsed.year === targetYear;
          });
        }

        const wb = XLSX.utils.book_new();

        const monthList = [
          { num: 1, name: "Januari" },
          { num: 2, name: "Februari" },
          { num: 3, name: "Maret" },
          { num: 4, name: "April" },
          { num: 5, name: "Mei" },
          { num: 6, name: "Juni" },
          { num: 7, name: "Juli" },
          { num: 8, name: "Agustus" },
          { num: 9, name: "September" },
          { num: 10, name: "Oktober" },
          { num: 11, name: "November" },
          { num: 12, name: "Desember" }
        ];

        const rawCols = schema.columns.slice();
        if (!rawCols.includes('No') && !rawCols.includes('no')) {
          rawCols.unshift('No');
        }

        function formatRawAttendanceRow(row, idx) {
          const obj = {};
          rawCols.forEach(col => {
            if (col === 'No' || col === 'no' || (typeof normalizeHeaderName === 'function' && normalizeHeaderName(col) === 'no')) {
              obj[col] = idx + 1;
            } else if (col === 'Time Clock In' || col === 'Time Clock Out') {
              const val = getRowCellValue(row, col, SCHEMAS.Data_Kehadiran) || row[col] || '';
              obj[col] = formatDatabaseTime(val);
            } else if (col === 'Date Clock In' || col === 'Date Clock Out') {
              const val = getRowCellValue(row, col, SCHEMAS.Data_Kehadiran) || row[col] || '';
              obj[col] = (String(val).includes('1899-12-30') || String(val).includes('30.12.1899')) ? '' : formatDatabaseDate(val);
            } else if (col === 'Date') {
              const val = getRowCellValue(row, col, SCHEMAS.Data_Kehadiran) || row[col] || '';
              obj[col] = formatDatabaseDate(val);
            } else if (col === 'Status Kehadiran') {
              const val = getRowCellValue(row, col, SCHEMAS.Data_Kehadiran) || row[col] || '';
              const timeIn = getRowCellValue(row, 'Time Clock In', SCHEMAS.Data_Kehadiran) || row['Time Clock In'] || '';
              const lateness = calculateLatenessInfo(val || timeIn);
              obj[col] = lateness.text;
            } else {
              const val = getRowCellValue(row, col, SCHEMAS.Data_Kehadiran) || row[col];
              obj[col] = (val !== undefined && val !== null) ? val : "";
            }
          });
          return obj;
        }

        const summaryCols = [
          "No",
          "NPK",
          "Nama Karyawan",
          "Cabang",
          "Total Hari Kerja",
          "Masuk (Hadir)",
          "Tepat Waktu",
          "Terlambat",
          "Tanpa Keterangan",
          "Persentase Kehadiran (%)",
          "Total Jam Kerja (Jam)",
          "Rata-rata Jam Kerja (Jam/Hari)"
        ];

        if (selectedMonth === 'ALL') {
          // 1. Sheet 1: Rekap Tahunan per Karyawan (1 Tahun Penuh)
          const summaryRows = buildEmployeeAttendanceSummaryRows(yearRows, fullMaster);
          const wsSummary = XLSX.utils.json_to_sheet(summaryRows.length ? summaryRows : [{}], { header: summaryCols });
          XLSX.utils.book_append_sheet(wb, wsSummary, "Rekap_Tahunan");

          // 2. Sheet 2 s/d 13: 12 Sheet Bulanan (Januari s/d Desember)
          monthList.forEach(m => {
            const mRows = yearRows.filter(r => {
              const p = extractRowMonthYear(r);
              return p && p.month === m.num;
            });
            const exportData = mRows.map((r, i) => formatRawAttendanceRow(r, i));
            const wsMonth = exportData.length 
              ? XLSX.utils.json_to_sheet(exportData, { header: rawCols })
              : XLSX.utils.json_to_sheet([], { header: rawCols });
            XLSX.utils.book_append_sheet(wb, wsMonth, m.name);
          });

          const fileName = `Data_Kehadiran_Tahunan_${targetYear || '2026'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
          XLSX.writeFile(wb, fileName);
          showToast(`Berkas ${fileName} berhasil diunduh: 1 Sheet Rekap Karyawan (1 Tahun) + 12 Sheet Bulanan (Januari - Desember)!`);
          return;
        } else {
          // Single month export (e.g. Month = "Juni")
          const monthMap = { 'januari': 1, 'februari': 2, 'maret': 3, 'april': 4, 'mei': 5, 'juni': 6, 'juli': 7, 'agustus': 8, 'september': 9, 'oktober': 10, 'november': 11, 'desember': 12 };
          const targetMonthNum = monthMap[selectedMonth.toLowerCase()] || 6;
          const monthRows = yearRows.filter(r => {
            const p = extractRowMonthYear(r);
            return p && p.month === targetMonthNum;
          });

          // Sheet 1: Rekap Karyawan Bulan Terpilih
          const summaryRows = buildEmployeeAttendanceSummaryRows(monthRows.length ? monthRows : yearRows, fullMaster);
          const wsSummary = XLSX.utils.json_to_sheet(summaryRows.length ? summaryRows : [{}], { header: summaryCols });
          XLSX.utils.book_append_sheet(wb, wsSummary, `Rekap_${selectedMonth}`);

          // Sheet 2: Log Mentah Bulan Terpilih
          const exportData = monthRows.map((r, i) => formatRawAttendanceRow(r, i));
          const wsMonth = exportData.length 
            ? XLSX.utils.json_to_sheet(exportData, { header: rawCols })
            : XLSX.utils.json_to_sheet([], { header: rawCols });
          XLSX.utils.book_append_sheet(wb, wsMonth, selectedMonth);

          const fileName = `Data_Kehadiran_${selectedMonth}_${targetYear || '2026'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
          XLSX.writeFile(wb, fileName);
          showToast(`Berkas ${fileName} berhasil diunduh (Sheet Rekap Karyawan & Sheet Log Harian ${selectedMonth})!`);
          return;
        }
      } else {
        exportColumns = schema.columns.slice();
        if (!isAdmin && (targetSheet === 'Data_SS' || targetSheet === 'Data_QCC' || targetSheet === 'Data_SP')) {
          rawRows = rawRows.filter(e => matchBranch(e, userBranchCode));
        }

        exportRows = rawRows.map((row, idx) => {
          const obj = {};
          exportColumns.forEach(col => {
            if (col === 'No' || col === 'no' || (typeof normalizeHeaderName === 'function' && normalizeHeaderName(col) === 'no')) {
              obj[col] = idx + 1;
            } else {
              obj[col] = (row[col] !== undefined && row[col] !== null) ? row[col] : "";
            }
          });
          return obj;
        });

        const ws = XLSX.utils.json_to_sheet(exportRows, { header: exportColumns });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, schema.sheetName);
        XLSX.writeFile(wb, `${schema.sheetName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
        showToast(`Berkas ${schema.sheetName}.xlsx berhasil diunduh (${exportRows.length} baris, ${exportColumns.length} kolom)!`);
      }
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
            const dob = (row['D.o.birth'] !== undefined && row['D.o.birth'] !== null && String(row['D.o.birth']).trim() !== '')
              ? row['D.o.birth']
              : findDOBirth(row);
            const joinDate = (row['Date'] !== undefined && row['Date'] !== null && String(row['Date']).trim() !== '')
              ? row['Date']
              : findDate(row);

            const umurVal = typeof calculateEmployeeAge === 'function' ? calculateEmployeeAge(dob) : calculateAgeAndService(dob, 'age');
            const masaKerjaVal = typeof calculateEmployeeTenure === 'function' ? calculateEmployeeTenure(joinDate) : calculateAgeAndService(joinDate, 'service');

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
              } else if (col === 'PS group') {
                obj['PS group'] = (row[col] !== undefined && row[col] !== null && String(row[col]).trim() !== '') ? row[col] : findPSGroup(row);
              } else if (col === 'Lvl') {
                obj['Lvl'] = (row[col] !== undefined && row[col] !== null && String(row[col]).trim() !== '') ? row[col] : findLvl(row);
              } else if (col === 'P0001-STEXT') {
                obj['P0001-STEXT'] = (row[col] !== undefined && row[col] !== null && String(row[col]).trim() !== '') ? row[col] : findP0001STEXT(row);
              } else if (col === 'Status_Karyawan') {
                obj['Status_Karyawan'] = row['Status_Karyawan'] || row['Status Karyawan'] || row.statusKaryawan || 'Aktif';
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
                if (!cellVal || String(cellVal).trim() === '' || cellVal === '-') {
                  const npkIdx = colIndexMapping['NPK'];
                  const rowNpk = safeString((npkIdx !== -1 && npkIdx !== undefined) ? rowData[npkIdx] : '');
                  if (rowNpk) {
                    const foundName = typeof lookupEmployeeName === 'function' ? lookupEmployeeName(rowNpk) : '';
                    if (foundName) cellVal = foundName;
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

            // Deteksi Keterangan Resign otomatis pada baris yang diunggah
            if (targetSheet === 'Master_Karyawan') {
              const rawStatus = String(rowObj['Status_Karyawan'] || '').trim().toLowerCase();
              let inferredResign = false;
              let inferredReason = '';
              for (let c = 0; c < rowData.length; c++) {
                const cellStr = String(rowData[c] || '').trim();
                const cellLower = cellStr.toLowerCase();
                if (cellLower.includes('resign') || cellLower.includes('phk') || cellLower.includes('mengundurkan diri') || cellLower.includes('keluar') || cellLower.includes('berhenti')) {
                  inferredResign = true;
                  if (!inferredReason && window.STANDARD_PPHK_REASONS) {
                    const found = window.STANDARD_PPHK_REASONS.find(p => cellLower.includes(p.reason.toLowerCase()) || p.reason.toLowerCase().includes(cellLower));
                    if (found) inferredReason = found.reason;
                  }
                  if (!inferredReason && cellStr.length > 3 && cellStr.length < 100) {
                    inferredReason = cellStr;
                  }
                }
              }
              if (rawStatus === 'resign' || inferredResign) {
                rowObj['Status_Karyawan'] = 'Resign';
                if (!rowObj['Alasan_Resign'] && inferredReason) {
                  rowObj['Alasan_Resign'] = inferredReason;
                }
              }
            }

            parsedObjects.push(rowObj);
          }

          if (!parsedObjects.length) {
            alert("Tidak ada baris data valid yang berhasil diekstraksi dari file.");
            btn.disabled = false;
            btn.textContent = "Proses & Simpan";
            return;
          }

          // 3. Sinkronisasi data ke state tabel frontend seketika
          // 3. Khusus Master_Karyawan: Deteksi Omitted/Missing Employees (Contoh: 149 vs 145 = 4 hilang)
          if (targetSheet === 'Master_Karyawan') {
            const prevMasterRows = (currentDashboardPayload?.rawTables?.Master_Karyawan || window.masterFullPayload?.rawTables?.Master_Karyawan || []);
            const prevEmployeeList = (currentDashboardPayload?.employeeList || window.masterFullPayload?.employeeList || []);

            const prevActiveMap = new Map();
            prevMasterRows.forEach(row => {
              const npk = safeString(row['Personnel no.'] || row['NPK']);
              const st = String(row['Status_Karyawan'] || 'Aktif').trim().toLowerCase();
              if (npk && st !== 'resign') {
                prevActiveMap.set(npk, row);
              }
            });
            prevEmployeeList.forEach(emp => {
              const npk = safeString(emp.npk || emp['Personnel no.']);
              const st = String(emp.statusKaryawan || emp.Status_Karyawan || 'Aktif').trim().toLowerCase();
              if (npk && st !== 'resign' && !prevActiveMap.has(npk)) {
                prevActiveMap.set(npk, emp);
              }
            });

            const newNpkSet = new Set(
              parsedObjects.map(obj => safeString(obj['Personnel no.'] || obj['NPK'])).filter(Boolean)
            );

            const newlyMissing = [];
            prevActiveMap.forEach((prevItem, npk) => {
              if (!newNpkSet.has(npk)) {
                const preservedRow = {};
                canonicalColumns.forEach(col => {
                  preservedRow[col] = prevItem[col] !== undefined ? prevItem[col] : (prevItem[normalizeHeaderName(col)] || '');
                });
                preservedRow['Personnel no.'] = npk;
                preservedRow['Status_Karyawan'] = 'Aktif';
                preservedRow._isPendingResignReview = true;
                parsedObjects.push(preservedRow);

                newlyMissing.push({
                  npk: npk,
                  nama: prevItem['Last name'] || prevItem.nama || 'Karyawan',
                  cabang: prevItem['P.subarea'] || prevItem.cabang || '-',
                  kodeBA: safeString(prevItem['Business area'] || prevItem.kodeBA || ''),
                  divisi: prevItem['Name'] || prevItem.divisi || '-',
                  jabatan: prevItem['Job Title'] || prevItem.jabatan || '-',
                  tipeKontrak: prevItem['Contract'] || prevItem.tipeKontrak || 'Tetap',
                  missedAt: new Date().toISOString()
                });
              }
            });

            let currentPending = typeof getPendingResignReviews === 'function' ? getPendingResignReviews() : [];
            currentPending = currentPending.filter(p => !newNpkSet.has(safeString(p.npk || p['Personnel no.'])));
            newlyMissing.forEach(item => {
              if (!currentPending.some(p => safeString(p.npk || p['Personnel no.']) === item.npk)) {
                currentPending.push(item);
              }
            });
            if (typeof savePendingResignReviews === 'function') {
              savePendingResignReviews(currentPending);
            }

            if (newlyMissing.length > 0) {
              setTimeout(() => {
                showToast(`⚠️ Ditemukan ${newlyMissing.length} karyawan aktif sebelumnya yang tidak ada di berkas baru. Disimpan ke Pengingat Tinjauan Status Admin.`, 7000);
                if (typeof openResignReviewModal === 'function') openResignReviewModal();
              }, 1200);
            }
          }

          // 4. Sinkronisasi data ke state tabel frontend seketika
          if (!currentDashboardPayload.rawTables) currentDashboardPayload.rawTables = {};
          currentDashboardPayload.rawTables[targetSheet] = parsedObjects;

          if (targetSheet === 'Knowledge_management' || targetSheet === 'Data_KM') {
            currentDashboardPayload.rawTables.Knowledge_management = parsedObjects;
            try { localStorage.removeItem('dperform_km_cache'); } catch(e) {}
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
              const isPending = !!obj._isPendingResignReview || !!existing.isPendingResignReview;

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
                isPendingResignReview: isPending,
                tanggalResign: obj['Tanggal_Resign'] || existing.tanggalResign || '',
                alasanResign: obj['Alasan_Resign'] || existing.alasanResign || '',
                umurText: typeof calculateEmployeeAge === 'function' ? calculateEmployeeAge(dob) : calculateAgeAndService(dob, 'age'),
                masaKerjaText: typeof calculateEmployeeTenure === 'function' ? calculateEmployeeTenure(jDate) : calculateAgeAndService(jDate, 'service'),
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
            if (typeof updateResignReviewBanner === 'function') updateResignReviewBanner();
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
        const umur = (e.umurText && e.umurText !== '-') ? e.umurText : (typeof calculateEmployeeAge === 'function' ? calculateEmployeeAge(dob) : calculateAgeAndService(dob, 'age'));
        const masaKerja = (e.masaKerjaText && e.masaKerjaText !== '-') ? e.masaKerjaText : (typeof calculateEmployeeTenure === 'function' ? calculateEmployeeTenure(joinDate) : calculateAgeAndService(joinDate, 'service'));
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

      // Jika filter Semua Bulan dipilih dan ada data kehadiran, sertakan juga 12 sheet bulanan dari Data_Kehadiran
      const selectedMonth = document.getElementById('month-select')?.value || 'ALL';
      const selectedYear = document.getElementById('year-select')?.value || 'ALL';
      const fullMaster = window.masterFullPayload || window.fullUnscopedPayload || currentDashboardPayload;
      let attendanceRows = fullMaster?.rawTables?.Data_Kehadiran || currentDashboardPayload?.rawTables?.Data_Kehadiran || [];

      if (selectedMonth === 'ALL' && attendanceRows.length > 0) {
        if (!isAdmin) {
          attendanceRows = attendanceRows.filter(e => matchBranch(e, getUserBranchCode(loggedInUser)));
        } else {
          const selectedBranch = document.getElementById('branch-select')?.value || 'ALL';
          if (selectedBranch !== 'ALL') {
            attendanceRows = attendanceRows.filter(e => matchBranch(e, selectedBranch));
          }
        }

        let targetYear = (selectedYear !== 'ALL') ? parseInt(selectedYear, 10) : null;
        if (!targetYear) {
          const yearCounts = {};
          attendanceRows.forEach(r => {
            const parsed = extractRowMonthYear(r);
            if (parsed && parsed.year) yearCounts[parsed.year] = (yearCounts[parsed.year] || 0) + 1;
          });
          const years = Object.keys(yearCounts).map(Number).sort((a, b) => b - a);
          targetYear = years.length > 0 ? years[0] : new Date().getFullYear();
        }

        const yearRows = attendanceRows.filter(r => {
          const parsed = extractRowMonthYear(r);
          return !parsed || parsed.year === targetYear;
        });

        const monthList = [
          { num: 1, name: "Januari" },
          { num: 2, name: "Februari" },
          { num: 3, name: "Maret" },
          { num: 4, name: "April" },
          { num: 5, name: "Mei" },
          { num: 6, name: "Juni" },
          { num: 7, name: "Juli" },
          { num: 8, name: "Agustus" },
          { num: 9, name: "September" },
          { num: 10, name: "Oktober" },
          { num: 11, name: "November" },
          { num: 12, name: "Desember" }
        ];

        const rawCols = (SCHEMAS.Data_Kehadiran?.columns || []).slice();
        if (!rawCols.includes('No') && !rawCols.includes('no')) rawCols.unshift('No');

        monthList.forEach(m => {
          const mRows = yearRows.filter(r => {
            const p = extractRowMonthYear(r);
            return p && p.month === m.num;
          });
          const exportData = mRows.map((row, idx) => {
            const obj = {};
            rawCols.forEach(col => {
              if (col === 'No' || col === 'no' || (typeof normalizeHeaderName === 'function' && normalizeHeaderName(col) === 'no')) {
                obj[col] = idx + 1;
              } else if (col === 'Time Clock In' || col === 'Time Clock Out') {
                const val = getRowCellValue(row, col, SCHEMAS.Data_Kehadiran) || row[col] || '';
                obj[col] = formatDatabaseTime(val);
              } else if (col === 'Date Clock In' || col === 'Date Clock Out') {
                const val = getRowCellValue(row, col, SCHEMAS.Data_Kehadiran) || row[col] || '';
                obj[col] = (String(val).includes('1899-12-30') || String(val).includes('30.12.1899')) ? '' : formatDatabaseDate(val);
              } else if (col === 'Date') {
                const val = getRowCellValue(row, col, SCHEMAS.Data_Kehadiran) || row[col] || '';
                obj[col] = formatDatabaseDate(val);
              } else if (col === 'Status Kehadiran') {
                const val = getRowCellValue(row, col, SCHEMAS.Data_Kehadiran) || row[col] || '';
                const timeIn = getRowCellValue(row, 'Time Clock In', SCHEMAS.Data_Kehadiran) || row['Time Clock In'] || '';
                const lateness = calculateLatenessInfo(val || timeIn);
                obj[col] = lateness.text;
              } else {
                const val = getRowCellValue(row, col, SCHEMAS.Data_Kehadiran) || row[col];
                obj[col] = (val !== undefined && val !== null) ? val : "";
              }
            });
            return obj;
          });

          const wsMonth = exportData.length
            ? XLSX.utils.json_to_sheet(exportData, { header: rawCols })
            : XLSX.utils.json_to_sheet([], { header: rawCols });
          XLSX.utils.book_append_sheet(wb, wsMonth, m.name);
        });

        XLSX.writeFile(wb, `${fileNamePrefix}_${targetYear}_${new Date().toISOString().slice(0,10)}.xlsx`);
        showToast(`Berkas ${fileNamePrefix} berhasil diunduh: 1 Sheet Rekap Karyawan + 12 Sheet Bulanan (Januari - Desember)!`);
        return;
      }

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
      const statusKaryawan = getRowCellValue(emp, 'Status_Karyawan', SCHEMAS.Master_Karyawan) || emp.statusKaryawan || emp.Status_Karyawan || 'Aktif';
      const isResign = String(statusKaryawan).trim().toLowerCase() === 'resign';
      const tglResign = formatDatabaseDate(getRowCellValue(emp, 'Tanggal_Resign', SCHEMAS.Master_Karyawan)) || emp.tanggalResign || emp.Tanggal_Resign || '-';
      const alasanResign = getRowCellValue(emp, 'Alasan_Resign', SCHEMAS.Master_Karyawan) || emp.alasanResign || emp.Alasan_Resign || '-';
      const lampiranPPHK = (typeof getPPHKAttachment === 'function') ? getPPHKAttachment(alasanResign) : '-';

      const avatarEl = document.getElementById('modal-emp-avatar');
      if (avatarEl) {
        avatarEl.textContent = empNama.slice(0, 2).toUpperCase();
        if (isResign) {
          avatarEl.className = "w-11 h-11 rounded-2xl bg-rose-700 text-white flex items-center justify-center font-black text-base shadow-sm ring-2 ring-rose-300";
        } else {
          avatarEl.className = "w-11 h-11 rounded-2xl bg-[#E60012] text-white flex items-center justify-center font-black text-base shadow-sm";
        }
      }

      document.getElementById('modal-emp-name').textContent = empNama;
      const empDivisi = emp.divisi || (typeof resolveEmployeeDivision === 'function' ? resolveEmployeeDivision(emp).divisionName : '-');
      const roleEl = document.getElementById('modal-emp-role');
      if (roleEl) {
        const fullRoleStr = isResign
          ? `NPK: ${empNpk} • ${empDivisi} • ${empJabatan} • Cabang ${empCabang} • [Non-Aktif / Resign]`
          : `NPK: ${empNpk} • ${empDivisi} • ${empJabatan} • Cabang ${empCabang}`;
        roleEl.textContent = fullRoleStr;
        roleEl.title = fullRoleStr;
      }

      // Status Badge di Modal Header
      const statusBadgeEl = document.getElementById('modal-emp-status-badge');
      if (statusBadgeEl) {
        if (isResign) {
          statusBadgeEl.className = "px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-[10px] font-black flex items-center gap-1 shadow-2xs";
          statusBadgeEl.innerHTML = '<i class="fa-solid fa-user-xmark"></i> Status: Resign / PPHK';
        } else {
          statusBadgeEl.className = "px-2.5 py-1 bg-red-50 text-[#E60012] border border-red-100 rounded-full text-[10px] font-bold";
          statusBadgeEl.textContent = "Data Acuan PBK";
        }
      }

      // Resign Information Banner
      const resignBannerEl = document.getElementById('modal-emp-resign-banner');
      if (resignBannerEl) {
        if (isResign) {
          resignBannerEl.classList.remove('hidden');
          const dateDisp = document.getElementById('modal-resign-date-display');
          if (dateDisp) dateDisp.textContent = `Tanggal Efektif: ${tglResign}`;
          const reasonDisp = document.getElementById('modal-resign-reason-display');
          if (reasonDisp) reasonDisp.textContent = alasanResign || 'Pengunduran Diri / Pemutusan Hubungan Kerja';
          const attachDisp = document.getElementById('modal-resign-attachment-display');
          if (attachDisp) attachDisp.textContent = lampiranPPHK || '-';
        } else {
          resignBannerEl.classList.add('hidden');
        }
      }

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
      const kontrakEl = document.getElementById('modal-emp-kontrak');
      if (kontrakEl) {
        const displayKontrak = isResign ? `${empContract} (Resign)` : empContract;
        kontrakEl.textContent = displayKontrak;
        kontrakEl.title = displayKontrak;
      }
      const contractSubEl = document.getElementById('modal-emp-contract-sub');
      if (contractSubEl) {
        if (isResign) {
          contractSubEl.textContent = "Status: Resign";
          contractSubEl.title = `Tanggal Efektif Resign: ${tglResign}`;
          contractSubEl.className = "px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-200/90 text-rose-900 border border-rose-300 truncate max-w-full inline-block";
        } else {
          contractSubEl.textContent = "Profil Master";
          contractSubEl.title = "Profil Master Karyawan";
          contractSubEl.className = "px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-200/70 text-blue-900 border border-blue-300/80 truncate max-w-full inline-block";
        }
      }

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
        if (isResign) {
          notesEl.innerHTML = `<span class="text-rose-700 font-bold">Karyawan Non-Aktif (Resign / PPHK).</span> Alasan pengakhiran kerja: <strong>${alasanResign || '-'}</strong> per tanggal <strong>${tglResign || '-'}</strong>. Rekam jejak penilaian PBK diarsipkan untuk audit dan evaluasi historis cabang DSO.`;
        } else if (spStatus !== 'Bersih') {
          notesEl.textContent = `Tercatat sanksi aktif ${spStatus}: ${emp.spAlasan || spRows[0]?.Alasan || 'Perlu pembinaan disiplin kerja berkala.'}`;
        } else if (telatCount > 0) {
          notesEl.textContent = `Disiplin kerja cukup baik. Terdapat ${telatCount}x catatan terlambat jam masuk kerja yang perlu diperbaiki.`;
        } else {
          notesEl.textContent = `Disiplin kerja sangat baik. Selalu tepat waktu tanpa pelanggaran atau catatan sanksi.`;
        }
      }

      // Validasi Footer
      const valStatusEl = document.getElementById('modal-emp-validation-status');
      const valDescEl = document.getElementById('modal-emp-validation-desc');
      if (valStatusEl) {
        if (isResign) {
          valStatusEl.className = "text-xs font-extrabold text-amber-700 flex items-center gap-1.5 mt-0.5";
          valStatusEl.innerHTML = '<i class="fa-solid fa-clock-rotate-left text-amber-600"></i> Rekam Jejak Diarsipkan (Status Resign / Non-Aktif)';
        } else {
          valStatusEl.className = "text-xs font-extrabold text-emerald-600 flex items-center gap-1.5 mt-0.5";
          valStatusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Terverifikasi Database HRD DSO Lampung';
        }
      }
      if (valDescEl) {
        if (isResign) {
          valDescEl.textContent = "*Data historis dibekukan sesuai tanggal pengajuan PPHK PT Astra Daihatsu Motor";
        } else {
          valDescEl.textContent = "*Penilaian akhir PBK dinilai langsung oleh Kepala Cabang pada lembar resmi";
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
      const statusKaryawan = getRowCellValue(emp, 'Status_Karyawan', SCHEMAS.Master_Karyawan) || emp.statusKaryawan || emp.Status_Karyawan || 'Aktif';
      const isResign = String(statusKaryawan).trim().toLowerCase() === 'resign';
      const tglResign = formatDatabaseDate(getRowCellValue(emp, 'Tanggal_Resign', SCHEMAS.Master_Karyawan)) || emp.tanggalResign || emp.Tanggal_Resign || '-';

      const summaryView = document.getElementById('pbk-view-summary');
      const drilldownView = document.getElementById('pbk-view-drilldown');
      if (summaryView) summaryView.classList.add('hidden');
      if (drilldownView) drilldownView.classList.remove('hidden');

      const resignDrillBadge = document.getElementById('pbk-drilldown-resign-badge');
      if (resignDrillBadge) {
        if (isResign) {
          resignDrillBadge.classList.remove('hidden');
          resignDrillBadge.innerHTML = `<i class="fa-solid fa-user-xmark mr-1"></i>Status: Resign (Efektif: ${tglResign})`;
        } else {
          resignDrillBadge.classList.add('hidden');
        }
      }

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
          <div class="grid grid-cols-3 gap-2 mb-3">
            <div class="bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-center min-w-0 overflow-hidden">
              <span class="text-[9px] font-bold text-emerald-700 block uppercase truncate" title="Total Hari Presensi">Total Hari</span>
              <span class="text-base font-extrabold text-emerald-900 truncate block">${absRows.length} Hari</span>
            </div>
            <div class="bg-teal-50 p-2 rounded-xl border border-teal-200 text-center min-w-0 overflow-hidden">
              <span class="text-[9px] font-bold text-teal-700 block uppercase truncate" title="Tepat Waktu">Tepat Waktu</span>
              <span class="text-base font-extrabold text-teal-900 truncate block">${onTimeCount} Hari</span>
            </div>
            <div class="bg-amber-50 p-2 rounded-xl border border-amber-200 text-center min-w-0 overflow-hidden">
              <span class="text-[9px] font-bold text-amber-700 block uppercase truncate" title="Terlambat Masuk">Terlambat</span>
              <span class="text-base font-extrabold text-amber-900 truncate block">${telatCount} Kali</span>
            </div>
          </div>
        `;

        if (!absRows.length) {
          contentEl.innerHTML = `${statBanner}<div class="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">Belum ada catatan presensi harian di sheet Data_Kehadiran untuk karyawan ini.</div>`;
          return;
        }

        const tableRows = absRows.map((r, i) => {
          const tgl = formatDatabaseDate(r['Date'] || r['Tanggal']) || '-';
          const clockInRaw = r['Time Clock In'] || r['Clock In'] || '-';
          const clockOutRaw = r['Time Clock Out'] || r['Clock Out'] || '-';
          const lateness = calculateLatenessInfo(clockInRaw);
          const clockIn = formatDatabaseTime(clockInRaw);
          const clockOut = formatDatabaseTime(clockOutRaw);
          const durasi = r['Durasi Kerja (Work Hours)'] || r['Durasi Kerja'] || '-';
          const lokasi = r['Assigned Work Location'] || r['Cabang'] || '-';
          const statusBadge = lateness.badgeHtml;

          return `
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 font-semibold text-slate-800 whitespace-nowrap">${tgl}</td>
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 font-mono font-bold text-slate-700 whitespace-nowrap">${clockIn}</td>
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 font-mono text-slate-600 whitespace-nowrap">${clockOut}</td>
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 text-slate-600 whitespace-nowrap">${durasi}</td>
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 whitespace-nowrap">${statusBadge}</td>
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 text-slate-500 whitespace-nowrap">${lokasi}</td>
            </tr>
          `;
        }).join('');

        contentEl.innerHTML = `
          ${statBanner}
          <div class="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 font-medium shadow-2xs mb-2 sm:hidden">
            <span class="flex items-center gap-1.5"><i class="fa-solid fa-arrows-left-right text-emerald-600 text-xs"></i> Geser tabel ke samping</span>
            <span class="text-[10px] text-slate-400 font-semibold">${absRows.length} Hari</span>
          </div>
          <div class="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs bg-white scrollbar-thin">
            <table class="w-full text-left border-collapse text-xs min-w-[520px]">
              <thead class="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Tanggal</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Clock In</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Clock Out</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Durasi</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Status Hadir</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Lokasi Penugasan</th>
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
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 font-mono font-bold text-slate-700 whitespace-nowrap">${noReg}</td>
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 font-semibold text-slate-900">${tema}</td>
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 text-slate-600 whitespace-nowrap">${fasilitator}</td>
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 text-slate-600 whitespace-nowrap">${bulan}</td>
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">${reward}</span>
              </td>
            </tr>
          `;
        }).join('');

        contentEl.innerHTML = `
          <div class="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 font-medium shadow-2xs mb-2 sm:hidden">
            <span class="flex items-center gap-1.5"><i class="fa-solid fa-arrows-left-right text-amber-600 text-xs"></i> Geser tabel ke samping</span>
            <span class="text-[10px] text-slate-400 font-semibold">${ssRows.length} Usulan</span>
          </div>
          <div class="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs bg-white scrollbar-thin">
            <table class="w-full text-left border-collapse text-xs min-w-[540px]">
              <thead class="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">No. Registrasi</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Tema Ide Kaizen</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Fasilitator</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Bulan</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Reward / Status</th>
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
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 font-mono font-bold text-slate-700 whitespace-nowrap">${noReg}</td>
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 font-bold text-slate-900 whitespace-nowrap">${namaTim}</td>
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 text-slate-700">${tema}</td>
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 whitespace-nowrap">${peran}</td>
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">${status}</span>
              </td>
            </tr>
          `;
        }).join('');

        contentEl.innerHTML = `
          <div class="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 font-medium shadow-2xs mb-2 sm:hidden">
            <span class="flex items-center gap-1.5"><i class="fa-solid fa-arrows-left-right text-purple-600 text-xs"></i> Geser tabel ke samping</span>
            <span class="text-[10px] text-slate-400 font-semibold">${qccRows.length} Tim</span>
          </div>
          <div class="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs bg-white scrollbar-thin">
            <table class="w-full text-left border-collapse text-xs min-w-[540px]">
              <thead class="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">No. Reg</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Nama Tim</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Tema Perbaikan</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Peran</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Status PDCA</th>
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
        const joinDate = formatDatabaseDate(getRowCellValue(emp, 'Date', SCHEMAS.Master_Karyawan)) || (emp.joinDate ? formatDatabaseDate(emp.joinDate) : '') || (typeof findDate === 'function' ? formatDatabaseDate(findDate(emp)) : '') || '-';
        const dob = formatDatabaseDate(getRowCellValue(emp, 'D.o.birth', SCHEMAS.Master_Karyawan)) || (emp.tglLahir ? formatDatabaseDate(emp.tglLahir) : '') || (typeof findDOBirth === 'function' ? formatDatabaseDate(findDOBirth(emp)) : '') || '-';
        const empAge = (emp.umurText && emp.umurText !== '-') ? emp.umurText : (typeof calculateEmployeeAge === 'function' ? calculateEmployeeAge(dob !== '-' ? dob : (emp.tglLahir || emp['D.o.birth'])) : calculateAgeAndService(dob, 'age'));
        const empTenure = (emp.masaKerjaText && emp.masaKerjaText !== '-') ? emp.masaKerjaText : (typeof calculateEmployeeTenure === 'function' ? calculateEmployeeTenure(joinDate !== '-' ? joinDate : (emp.joinDate || emp['Date'])) : calculateAgeAndService(joinDate, 'service'));
        const gender = getRowCellValue(emp, 'Gender text', SCHEMAS.Master_Karyawan) || emp.gender || '-';
        const agama = getRowCellValue(emp, 'Religious denomination', SCHEMAS.Master_Karyawan) || emp.agama || '-';
        const psGroup = getRowCellValue(emp, 'PS group', SCHEMAS.Master_Karyawan) || emp.psGroup || '-';
        const lvl = getRowCellValue(emp, 'Lvl', SCHEMAS.Master_Karyawan) || emp.lvl || '-';

        const statusKaryawan = getRowCellValue(emp, 'Status_Karyawan', SCHEMAS.Master_Karyawan) || emp.statusKaryawan || emp.Status_Karyawan || 'Aktif';
        const isResign = String(statusKaryawan).trim().toLowerCase() === 'resign';
        const tglResign = formatDatabaseDate(getRowCellValue(emp, 'Tanggal_Resign', SCHEMAS.Master_Karyawan)) || emp.tanggalResign || '-';
        const alasanResign = getRowCellValue(emp, 'Alasan_Resign', SCHEMAS.Master_Karyawan) || emp.alasanResign || '-';
        const lampiranPPHK = (typeof getPPHKAttachment === 'function') ? getPPHKAttachment(alasanResign) : '-';

        contentEl.innerHTML = `
          <div class="bg-slate-50/80 p-3 sm:p-4 rounded-2xl border border-slate-200 text-xs space-y-2.5 sm:space-y-3">
            <!-- Status Kepegawaian & Resign Insight -->
            ${isResign ? `
              <div class="bg-rose-50 border border-rose-200 rounded-2xl p-3 sm:p-3.5 shadow-2xs">
                <div class="flex items-center justify-between mb-2 pb-2 border-b border-rose-200/80 flex-wrap gap-2">
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-200 text-rose-900 border border-rose-300 uppercase flex items-center gap-1.5">
                      <i class="fa-solid fa-user-xmark"></i>
                      Status: Resign / PPHK
                    </span>
                    <span class="text-xs font-bold text-rose-800">Tanggal Efektif: ${tglResign}</span>
                  </div>
                  <span class="text-[10px] font-bold text-rose-700 bg-white px-2.5 py-0.5 rounded-lg border border-rose-200 shadow-2xs">
                    <i class="fa-solid fa-shield-halved mr-1"></i>SOP PPHK PT Astra Daihatsu Motor
                  </span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-1.5">
                  <div class="bg-white p-2.5 sm:p-3 rounded-xl border border-rose-200 min-w-0 overflow-hidden">
                    <span class="text-[10px] font-bold text-rose-600 block uppercase flex items-center gap-1 truncate">
                      <i class="fa-solid fa-tag"></i> Alasan PHK / Resign (Kolom 1 PPHK)
                    </span>
                    <span class="text-xs font-black text-slate-900 mt-1 block truncate" title="${alasanResign}">${alasanResign}</span>
                  </div>
                  <div class="bg-white p-2.5 sm:p-3 rounded-xl border border-rose-200 min-w-0 overflow-hidden">
                    <span class="text-[10px] font-bold text-amber-700 block uppercase flex items-center gap-1 truncate">
                      <i class="fa-solid fa-file-circle-check text-amber-600"></i> Lampiran Dokumen Wajib (Kolom 2 PPHK)
                    </span>
                    <span class="text-xs font-bold text-slate-800 mt-1 block leading-relaxed line-clamp-2" title="${lampiranPPHK}">${lampiranPPHK}</span>
                  </div>
                </div>
              </div>
            ` : `
              <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between shadow-2xs">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                  <span class="text-xs font-extrabold text-emerald-950">Status Kepegawaian: Aktif</span>
                  <span class="text-[11px] text-emerald-700 font-medium hidden sm:inline">• Karyawan aktif bertugas di unit kerja terkait</span>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex-shrink-0">
                  <i class="fa-solid fa-user-check mr-1"></i>Aktif Bekerja
                </span>
              </div>
            `}

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div class="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
                <span class="text-[10px] font-bold text-slate-400 block uppercase truncate">NPK / Personnel No.</span>
                <span class="text-sm font-black text-slate-900 font-mono mt-0.5 block truncate" title="${empNpk}">${empNpk}</span>
              </div>
              <div class="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
                <span class="text-[10px] font-bold text-slate-400 block uppercase truncate">Nama Lengkap</span>
                <span class="text-sm font-black text-slate-900 mt-0.5 block truncate" title="${empNama}">${empNama}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div class="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
                <span class="text-[10px] font-bold text-slate-400 block uppercase truncate">Status Kontrak & Kepegawaian</span>
                <span class="text-xs font-black ${isResign ? 'text-rose-700' : 'text-blue-700'} mt-0.5 block truncate" title="${contract} ${isResign ? '(Resign)' : ''}">${contract} ${isResign ? '(Resign)' : ''}</span>
              </div>
              <div class="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
                <span class="text-[10px] font-bold text-slate-400 block uppercase truncate">Jabatan / Job Title</span>
                <span class="text-xs font-extrabold text-slate-800 mt-0.5 block truncate" title="${jabatan}">${jabatan}</span>
              </div>
              <div class="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
                <span class="text-[10px] font-bold text-slate-400 block uppercase truncate">Unit Organisasi</span>
                <span class="text-xs font-extrabold text-slate-800 mt-0.5 block truncate" title="${unitOrg}">${unitOrg}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div class="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
                <span class="text-[10px] font-bold text-slate-400 block uppercase truncate">Cabang / Subarea</span>
                <span class="text-xs font-bold text-slate-800 mt-0.5 block truncate" title="${cabang}">${cabang}</span>
              </div>
              <div class="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
                <span class="text-[10px] font-bold text-slate-400 block uppercase truncate">Kode Business Area</span>
                <span class="text-xs font-bold text-slate-800 font-mono mt-0.5 block truncate" title="${baCode}">${baCode}</span>
              </div>
              <div class="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
                <span class="text-[10px] font-bold text-slate-400 block uppercase truncate">Tanggal Masuk (Join)</span>
                <span class="text-xs font-bold text-slate-800 mt-0.5 block truncate" title="${joinDate}">${joinDate}</span>
                ${empTenure && empTenure !== '-' ? `<span class="text-[10px] font-bold text-blue-600 block mt-0.5 truncate"><i class="fa-solid fa-briefcase text-[9px] mr-1"></i>${empTenure}</span>` : ''}
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div class="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
                <span class="text-[10px] font-bold text-slate-400 block uppercase truncate">Tgl Lahir (D.o.b)</span>
                <span class="text-xs font-semibold text-slate-800 mt-0.5 block truncate" title="${dob}">${dob}</span>
                ${empAge && empAge !== '-' ? `<span class="text-[10px] font-bold text-slate-500 block mt-0.5 truncate"><i class="fa-solid fa-cake-candles text-[9px] mr-1"></i>${empAge}</span>` : ''}
              </div>
              <div class="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
                <span class="text-[10px] font-bold text-slate-400 block uppercase truncate">Gender</span>
                <span class="text-xs font-semibold text-slate-800 mt-0.5 block truncate" title="${gender}">${gender}</span>
              </div>
              <div class="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
                <span class="text-[10px] font-bold text-slate-400 block uppercase truncate">Agama</span>
                <span class="text-xs font-semibold text-slate-800 mt-0.5 block truncate" title="${agama}">${agama}</span>
              </div>
              <div class="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 min-w-0 overflow-hidden">
                <span class="text-[10px] font-bold text-slate-400 block uppercase truncate">Gol / Level</span>
                <span class="text-xs font-semibold text-slate-800 mt-0.5 block truncate" title="${psGroup} / ${lvl}">${psGroup} / ${lvl}</span>
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
            <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 sm:p-6 text-center">
              <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg sm:text-xl mx-auto mb-3">
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
            <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 font-bold text-red-600 whitespace-nowrap">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200">${r['Tingkat SP']}</span>
            </td>
            <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 text-slate-800">${r['Alasan'] || 'Pelanggaran tata tertib kerja'}</td>
            <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 text-slate-600 whitespace-nowrap">${r['Kode BA'] || '-'}</td>
            <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 whitespace-nowrap">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Sedang Berjalan</span>
            </td>
          </tr>
        `).join('');

        contentEl.innerHTML = `
          <div class="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 font-medium shadow-2xs mb-2 sm:hidden">
            <span class="flex items-center gap-1.5"><i class="fa-solid fa-arrows-left-right text-rose-600 text-xs"></i> Geser tabel ke samping</span>
            <span class="text-[10px] text-slate-400 font-semibold">${spRows.length} Sanksi</span>
          </div>
          <div class="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs bg-white scrollbar-thin">
            <table class="w-full text-left border-collapse text-xs min-w-[500px]">
              <thead class="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Tingkat Sanksi</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Alasan / Pelanggaran</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Cabang</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Status</th>
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
          contentEl.innerHTML = `<div class="p-6 sm:p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200 text-xs">Karyawan ini belum menerbitkan artikel atau panduan di sheet Knowledge_management.</div>`;
          return;
        }

        const tableRows = kmRows.map((r, i) => {
          const judul = r['JUDUL'] || r['Judul'] || 'Panduan Knowledge Management';
          const tgl = formatDatabaseDate(r['TANGGAL'] || r['Tanggal']) || r['TANGGAL'] || r['Tanggal'] || '-';
          const time = r['TIME'] || r['Time'] || '-';

          return `
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 font-semibold text-slate-900">${judul}</td>
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 font-mono text-slate-700 whitespace-nowrap">${tgl}</td>
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 font-mono text-slate-600 whitespace-nowrap">${time}</td>
              <td class="py-2 sm:py-2.5 px-2.5 sm:px-3 whitespace-nowrap">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 inline-flex items-center gap-1">
                  <i class="fa-solid fa-circle-check text-[9px]"></i> Terverifikasi
                </span>
              </td>
            </tr>
          `;
        }).join('');

        contentEl.innerHTML = `
          <div class="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 font-medium shadow-2xs mb-2 sm:hidden">
            <span class="flex items-center gap-1.5"><i class="fa-solid fa-arrows-left-right text-cyan-600 text-xs"></i> Geser tabel ke samping</span>
            <span class="text-[10px] text-slate-400 font-semibold">${kmRows.length} Materi</span>
          </div>
          <div class="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs bg-white scrollbar-thin">
            <table class="w-full text-left border-collapse text-xs min-w-[500px]">
              <thead class="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Judul Pengetahuan / Materi</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Tanggal Terbit</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Waktu (Time)</th>
                  <th class="py-2 sm:py-2.5 px-2.5 sm:px-3">Status</th>
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
      if (typeof handleUploadFileInputChange === 'function') handleUploadFileInputChange(null);
      
      const statusBox = document.getElementById('upload-status-box');
      if (statusBox) {
        statusBox.className = "hidden text-xs p-3 rounded-xl";
        statusBox.textContent = '';
      }

      const btn = document.getElementById('btn-submit-upload');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up text-xs"></i> <span>Proses & Simpan Data</span>';
      }

      renderUploadSchemaGuide();

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
    const KM_REKAP_PS_BASE64 = "WwBDAG8AbgBzAG8AbABlAF0AOgA6AE8AdQB0AHAAdQB0AEUAbgBjAG8AZABpAG4AZwAgAD0AIABbAFMAeQBzAHQAZQBtAC4AVABlAHgAdAAuAEUAbgBjAG8AZABpAG4AZwBdADoAOgBVAFQARgA4AAoAQQBkAGQALQBUAHkAcABlACAALQBBAHMAcwBlAG0AYgBsAHkATgBhAG0AZQAgAFMAeQBzAHQAZQBtAC4ASQBPAC4AQwBvAG0AcAByAGUAcwBzAGkAbwBuAC4ARgBpAGwAZQBTAHkAcwB0AGUAbQAKAAoAJABmAGkAbABlAHMAIAA9ACAARwBlAHQALQBDAGgAaQBsAGQASQB0AGUAbQAgAC0AUABhAHQAaAAgAC4AIAAtAFIAZQBjAHUAcgBzAGUAIAAtAEYAaQBsAGUAIAB8ACAAVwBoAGUAcgBlAC0ATwBiAGoAZQBjAHQAIAB7ACAACgAgACAAIAAgACQAXwAuAEUAeAB0AGUAbgBzAGkAbwBuACAALQBtAGEAdABjAGgAIAAnACgAPwBpACkAXAAuACgAcABkAGYAfABwAHAAdAB8AHAAcAB0AHgAfABwAHAAcwB8AHAAcABzAHgAKQAkACcAIAAtAGEAbgBkACAACgAgACAAIAAgACQAXwAuAE4AYQBtAGUAIAAtAG4AbwB0AG0AYQB0AGMAaAAgACcAXgB+AFwAJAAnACAALQBhAG4AZAAgAAoAIAAgACAAIAAkAF8ALgBOAGEAbQBlACAALQBuAGUAIAAnAFIAZQBrAGEAcABfAEsATQBfAFMAaQBhAHAAXwBVAHAAbABvAGEAZAAuAGMAcwB2ACcAIAAKAH0ACgAKAFcAcgBpAHQAZQAtAEgAbwBzAHQAIAAoACcARABpAHQAZQBtAHUAawBhAG4AIAB0AG8AdABhAGwAIAAnACAAKwAgACQAZgBpAGwAZQBzAC4AQwBvAHUAbgB0ACAAKwAgACcAIABiAGUAcgBrAGEAcwAgAHAAcgBlAHMAZQBuAHQAYQBzAGkALgAnACkAIAAtAEYAbwByAGUAZwByAG8AdQBuAGQAQwBvAGwAbwByACAAQwB5AGEAbgAKAFcAcgBpAHQAZQAtAEgAbwBzAHQAIAAnAE0AZQBtAHUAbABhAGkAIABlAGsAcwB0AHIAYQBrAHMAaQAgAGQAYQB0AGEAIABOAFAASwAsACAASgB1AGQAdQBsACwAIABUAGEAbgBnAGcAYQBsACwAIABkAGEAbgAgAFcAYQBrAHQAdQAuAC4ALgAnACAALQBGAG8AcgBlAGcAcgBvAHUAbgBkAEMAbwBsAG8AcgAgAEMAeQBhAG4ACgAKAGYAdQBuAGMAdABpAG8AbgAgAEMAbABlAGEAbgAtAFgAbQBsAFQAZQB4AHQAKAAkAHIAYQB3ACkAIAB7AAoAIAAgACAAIABpAGYAIAAoAC0AbgBvAHQAIAAkAHIAYQB3ACkAIAB7ACAAcgBlAHQAdQByAG4AIAAnACcAIAB9AAoAIAAgACAAIAAkAG4AbwBUAGEAZwBzACAAPQAgAFsAUwB5AHMAdABlAG0ALgBUAGUAeAB0AC4AUgBlAGcAdQBsAGEAcgBFAHgAcAByAGUAcwBzAGkAbwBuAHMALgBSAGUAZwBlAHgAXQA6ADoAUgBlAHAAbABhAGMAZQAoACQAcgBhAHcALAAgACcAPABbAF4APgBdACsAPgAnACwAIAAnACAAJwApAAoAIAAgACAAIAByAGUAdAB1AHIAbgAgAFsAUwB5AHMAdABlAG0ALgBUAGUAeAB0AC4AUgBlAGcAdQBsAGEAcgBFAHgAcAByAGUAcwBzAGkAbwBuAHMALgBSAGUAZwBlAHgAXQA6ADoAUgBlAHAAbABhAGMAZQAoACQAbgBvAFQAYQBnAHMALAAgACcAXABzACsAJwAsACAAJwAgACcAKQAuAFQAcgBpAG0AKAApAAoAfQAKAAoAZgB1AG4AYwB0AGkAbwBuACAARQB4AHQAcgBhAGMAdAAtAE4AcABrAEYAcgBvAG0AVABlAHgAdAAoACQAdABlAHgAdAApACAAewAKACAAIAAgACAAaQBmACAAKAAtAG4AbwB0ACAAJAB0AGUAeAB0ACkAIAB7ACAAcgBlAHQAdQByAG4AIAAnACcAIAB9AAoACgAgACAAIAAgACMAIAAxAC4AIABMAGEAYgBlAGwAIABlAGsAcwBwAGwAaQBzAGkAdAA6ACAATgBQAEsAIAAvACAATgBJAEsAIAAvACAASQBEACAAKABDAG8AbgB0AG8AaAA6ACAATgBQAEsAOgAgADEAOAAwADAALAAgAE4AUABLACAAMgAwADIAMwAsACAATgBQAEsALgAxADAAMQAyADMAKQAKACAAIAAgACAAaQBmACAAKAAkAHQAZQB4AHQAIAAtAG0AYQB0AGMAaAAgACcAKAA/AGkAKQBcAGIAbgBwAGsAWwBcAHMALgA6ACMALwAtAF0AKgAoAFwAZAB7ADQALAA2AH0AKQBcAGIAJwApACAAewAKACAAIAAgACAAIAAgACAAIAByAGUAdAB1AHIAbgAgACQAbQBhAHQAYwBoAGUAcwBbADEAXQAKACAAIAAgACAAfQAKACAAIAAgACAAaQBmACAAKAAkAHQAZQB4AHQAIAAtAG0AYQB0AGMAaAAgACcAKAA/AGkAKQBcAGIAKAA/ADoAbgBpAGsAfABiAGEAZABnAGUAfABpAGQAWwBcAHMALgBdACoAawBhAHIAeQBhAHcAYQBuAHwAbgBvAFsALgBcAHMAXQAqAHIAZQBnACkAWwBcAHMALgA6ACMALwAtAF0AKgAoAFwAZAB7ADQALAA2AH0AKQBcAGIAJwApACAAewAKACAAIAAgACAAIAAgACAAIAByAGUAdAB1AHIAbgAgACQAbQBhAHQAYwBoAGUAcwBbADEAXQAKACAAIAAgACAAfQAKAAoAIAAgACAAIAAjACAAMgAuACAAUABlAG4AdQBsAGkAcwAgAC8AIABQAGUAbQBhAHQAZQByAGkAIABkAGkAaQBrAHUAdABpACAAYQBuAGcAawBhACAATgBQAEsAIAAoAEMAbwBuAHQAbwBoADoAIABEAGkAcwB1AHMAdQBuACAAbwBsAGUAaAAgADoAIABCAHUAZABpACAAUwBhAG4AdABvAHMAbwAgAC0AIAAxADgAMAAwACkACgAgACAAIAAgAGkAZgAgACgAJAB0AGUAeAB0ACAALQBtAGEAdABjAGgAIAAnACgAPwBpACkAKAA/ADoAZABpAHMAdQBzAHUAbgBcAHMAKgBvAGwAZQBoAHwAbwBsAGUAaAB8AHAAcgBlAHMAZQBuAHQAZQByAHwAZgBhAHMAaQBsAGkAdABhAHQAbwByAHwAcABlAG0AYQB0AGUAcgBpAHwAcwBwAGUAYQBrAGUAcgB8AHQAcgBhAGkAbgBlAHIAfABzAGgAYQByAGkAbgBnAFwAcwAqAGIAeQB8AGEAdQB0AGgAbwByACkAWwBcAHMAXABTAF0AewAwACwANgAwAH0APwBcAGIAKABcAGQAewA0ACwANgB9ACkAXABiACcAKQAgAHsACgAgACAAIAAgACAAIAAgACAAcgBlAHQAdQByAG4AIAAkAG0AYQB0AGMAaABlAHMAWwAxAF0ACgAgACAAIAAgAH0ACgAKACAAIAAgACAAIwAgADMALgAgAEEAbgBnAGsAYQAgAE4AUABLACAAZABpAGkAawB1AHQAaQAgAGwAYQBiAGUAbAAgAHAAZQBtAGEAdABlAHIAaQAgACgAQwBvAG4AdABvAGgAOgAgADEAOAAwADAAIAAtACAAUgB1AGwAaQBhACAAKABQAHIAZQBzAGUAbgB0AGUAcgApACkACgAgACAAIAAgAGkAZgAgACgAJAB0AGUAeAB0ACAALQBtAGEAdABjAGgAIAAnACgAPwBpACkAXABiACgAXABkAHsANAAsADYAfQApAFwAYgBbAFwAcwBcAFMAXQB7ADAALAA0ADAAfQA/ACgAPwA6AGQAaQBzAHUAcwB1AG4AfABwAHIAZQBzAGUAbgB0AGUAcgB8AHAAZQBtAGEAdABlAHIAaQB8AHMAcABlAGEAawBlAHIAfABmAGEAcwBpAGwAaQB0AGEAdABvAHIAKQAnACkAIAB7AAoAIAAgACAAIAAgACAAIAAgAHIAZQB0AHUAcgBuACAAJABtAGEAdABjAGgAZQBzAFsAMQBdAAoAIAAgACAAIAB9AAoACgAgACAAIAAgAHIAZQB0AHUAcgBuACAAJwAnAAoAfQAKAAoAZgB1AG4AYwB0AGkAbwBuACAARQB4AHQAcgBhAGMAdAAtAE4AcABrAEYAcgBvAG0AUABwAHQAeAAoACQAZgBpAGwAZQBQAGEAdABoACkAIAB7AAoAIAAgACAAIAB0AHIAeQAgAHsACgAgACAAIAAgACAAIAAgACAAJAB6AGkAcAAgAD0AIABbAFMAeQBzAHQAZQBtAC4ASQBPAC4AQwBvAG0AcAByAGUAcwBzAGkAbwBuAC4AWgBpAHAARgBpAGwAZQBdADoAOgBPAHAAZQBuAFIAZQBhAGQAKAAkAGYAaQBsAGUAUABhAHQAaAApAAoAIAAgACAAIAAgACAAIAAgAGYAbwByAGUAYQBjAGgAIAAoACQAZQBuAHQAcgB5ACAAaQBuACAAJAB6AGkAcAAuAEUAbgB0AHIAaQBlAHMAKQAgAHsACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAkAG4AbwByAG0AIAA9ACAAJABlAG4AdAByAHkALgBGAHUAbABsAE4AYQBtAGUALgBSAGUAcABsAGEAYwBlACgAJwBcACcALAAgACcALwAnACkACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAjACAAUABlAHIAaQBrAHMAYQAgAHMAbABpAGQAZQAgADEALAAgAHMAbABpAGQAZQAgADIALAAgAHMAbABpAGQAZQAgADMALAAgAHMAcABlAGEAawBlAHIAIABuAG8AdABlAHMALAAgAGQAYQBuACAAbQBlAHQAYQBkAGEAdABhACAAZABvAGsAdQBtAGUAbgAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgAGkAZgAgACgAJABuAG8AcgBtACAALQBtAGEAdABjAGgAIAAnACgAPwBpACkAXgBwAHAAdAAvACgAcwBsAGkAZABlAHMALwBzAGwAaQBkAGUAWwAxAC0AMwBdAHwAbgBvAHQAZQBzAFMAbABpAGQAZQBzAC8AbgBvAHQAZQBzAFMAbABpAGQAZQBbADEALQAyAF0AKQBcAC4AeABtAGwAJAAnACAALQBvAHIAIAAkAG4AbwByAG0AIAAtAG0AYQB0AGMAaAAgACcAKAA/AGkAKQBeAGQAbwBjAFAAcgBvAHAAcwAvAGMAbwByAGUAXAAuAHgAbQBsACQAJwApACAAewAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJABzAHIAIAA9ACAAWwBTAHkAcwB0AGUAbQAuAEkATwAuAFMAdAByAGUAYQBtAFIAZQBhAGQAZQByAF0AOgA6AG4AZQB3ACgAJABlAG4AdAByAHkALgBPAHAAZQBuACgAKQAsACAAWwBTAHkAcwB0AGUAbQAuAFQAZQB4AHQALgBFAG4AYwBvAGQAaQBuAGcAXQA6ADoAVQBUAEYAOAApAAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAkAHgAbQBsACAAPQAgACQAcwByAC4AUgBlAGEAZABUAG8ARQBuAGQAKAApAAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAkAHMAcgAuAEMAbABvAHMAZQAoACkACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAkAGMAbABlAGEAbgAgAD0AIABDAGwAZQBhAG4ALQBYAG0AbABUAGUAeAB0ACAAJAB4AG0AbAAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJABuAHAAawAgAD0AIABFAHgAdAByAGEAYwB0AC0ATgBwAGsARgByAG8AbQBUAGUAeAB0ACAAJABjAGwAZQBhAG4ACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAGkAZgAgACgAJABuAHAAawApACAAewAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAkAHoAaQBwAC4ARABpAHMAcABvAHMAZQAoACkACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAcgBlAHQAdQByAG4AIAAkAG4AcABrAAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAB9AAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAfQAKACAAIAAgACAAIAAgACAAIAB9AAoAIAAgACAAIAAgACAAIAAgACQAegBpAHAALgBEAGkAcwBwAG8AcwBlACgAKQAKACAAIAAgACAAfQAgAGMAYQB0AGMAaAAgAHsAfQAKACAAIAAgACAAcgBlAHQAdQByAG4AIAAnACcACgB9AAoACgBmAHUAbgBjAHQAaQBvAG4AIABFAHgAdAByAGEAYwB0AC0ATgBwAGsARgByAG8AbQBQAGQAZgAoACQAZgBpAGwAZQBQAGEAdABoACkAIAB7AAoAIAAgACAAIAB0AHIAeQAgAHsACgAgACAAIAAgACAAIAAgACAAJABiAHkAdABlAHMAIAA9ACAAWwBTAHkAcwB0AGUAbQAuAEkATwAuAEYAaQBsAGUAXQA6ADoAUgBlAGEAZABBAGwAbABCAHkAdABlAHMAKAAkAGYAaQBsAGUAUABhAHQAaAApAAoAIAAgACAAIAAgACAAIAAgACQAcgBhAHcAQQBzAGMAaQBpACAAPQAgAFsAUwB5AHMAdABlAG0ALgBUAGUAeAB0AC4ARQBuAGMAbwBkAGkAbgBnAF0AOgA6AEEAUwBDAEkASQAuAEcAZQB0AFMAdAByAGkAbgBnACgAJABiAHkAdABlAHMAKQAKACAAIAAgACAAIAAgACAAIAAKACAAIAAgACAAIAAgACAAIAAjACAAMQAuACAAQwBlAGsAIAB0AGUAawBzACAAdQBuAGMAbwBtAHAAcgBlAHMAcwBlAGQAIAAvACAAbQBlAHQAYQBkAGEAdABhAAoAIAAgACAAIAAgACAAIAAgACQAbgBwAGsAIAA9ACAARQB4AHQAcgBhAGMAdAAtAE4AcABrAEYAcgBvAG0AVABlAHgAdAAgACQAcgBhAHcAQQBzAGMAaQBpAAoAIAAgACAAIAAgACAAIAAgAGkAZgAgACgAJABuAHAAawApACAAewAgAHIAZQB0AHUAcgBuACAAJABuAHAAawAgAH0ACgAKACAAIAAgACAAIAAgACAAIAAjACAAMgAuACAARABlAGMAbwBtAHAAcgBlAHMAcwAgAHMAdAByAGUAYQBtACAAUABEAEYAIAAoAEYAbABhAHQAZQBEAGUAYwBvAGQAZQApAAoAIAAgACAAIAAgACAAIAAgACQAcwB0AHIAZQBhAG0AQwBvAHUAbgB0ACAAPQAgADAACgAgACAAIAAgACAAIAAgACAAZgBvAHIAIAAoACQAaQAgAD0AIAAwADsAIAAkAGkAIAAtAGwAdAAgACQAYgB5AHQAZQBzAC4ATABlAG4AZwB0AGgAIAAtACAAMQAwADsAIAAkAGkAIAArAD0AIAAxACkAIAB7AAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAaQBmACAAKAAkAGIAeQB0AGUAcwBbACQAaQBdACAALQBlAHEAIAAxADEANQAgAC0AYQBuAGQAIAAkAGIAeQB0AGUAcwBbACQAaQArADEAXQAgAC0AZQBxACAAMQAxADYAIAAtAGEAbgBkACAAJABiAHkAdABlAHMAWwAkAGkAKwAyAF0AIAAtAGUAcQAgADEAMQA0ACAALQBhAG4AZAAgACQAYgB5AHQAZQBzAFsAJABpACsAMwBdACAALQBlAHEAIAAxADAAMQAgAC0AYQBuAGQAIAAkAGIAeQB0AGUAcwBbACQAaQArADQAXQAgAC0AZQBxACAAOQA3ACAALQBhAG4AZAAgACQAYgB5AHQAZQBzAFsAJABpACsANQBdACAALQBlAHEAIAAxADAAOQApACAAewAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJABzAHQAYQByAHQAIAA9ACAAJABpACAAKwAgADYACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAHcAaABpAGwAZQAgACgAJABzAHQAYQByAHQAIAAtAGwAdAAgACQAYgB5AHQAZQBzAC4ATABlAG4AZwB0AGgAIAAtAGEAbgBkACAAKAAkAGIAeQB0AGUAcwBbACQAcwB0AGEAcgB0AF0AIAAtAGUAcQAgADEAMwAgAC0AbwByACAAJABiAHkAdABlAHMAWwAkAHMAdABhAHIAdABdACAALQBlAHEAIAAxADAAKQApACAAewAgACQAcwB0AGEAcgB0ACAAKwA9ACAAMQAgAH0ACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAkAGUAbgBkACAAPQAgAC0AMQAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAZgBvAHIAIAAoACQAagAgAD0AIAAkAHMAdABhAHIAdAA7ACAAJABqACAALQBsAHQAIABbAFMAeQBzAHQAZQBtAC4ATQBhAHQAaABdADoAOgBNAGkAbgAoACQAcwB0AGEAcgB0ACAAKwAgADIANQAwADAAMAAwACwAIAAkAGIAeQB0AGUAcwAuAEwAZQBuAGcAdABoACAALQAgADgAKQA7ACAAJABqACAAKwA9ACAAMQApACAAewAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIABpAGYAIAAoACQAYgB5AHQAZQBzAFsAJABqAF0AIAAtAGUAcQAgADEAMAAxACAALQBhAG4AZAAgACQAYgB5AHQAZQBzAFsAJABqACsAMQBdACAALQBlAHEAIAAxADEAMAAgAC0AYQBuAGQAIAAkAGIAeQB0AGUAcwBbACQAagArADIAXQAgAC0AZQBxACAAMQAwADAAIAAtAGEAbgBkACAAJABiAHkAdABlAHMAWwAkAGoAKwAzAF0AIAAtAGUAcQAgADEAMQA1ACAALQBhAG4AZAAgACQAYgB5AHQAZQBzAFsAJABqACsANABdACAALQBlAHEAIAAxADEANgAgAC0AYQBuAGQAIAAkAGIAeQB0AGUAcwBbACQAagArADUAXQAgAC0AZQBxACAAMQAxADQAIAAtAGEAbgBkACAAJABiAHkAdABlAHMAWwAkAGoAKwA2AF0AIAAtAGUAcQAgADEAMAAxACAALQBhAG4AZAAgACQAYgB5AHQAZQBzAFsAJABqACsANwBdACAALQBlAHEAIAA5ADcAIAAtAGEAbgBkACAAJABiAHkAdABlAHMAWwAkAGoAKwA4AF0AIAAtAGUAcQAgADEAMAA5ACkAIAB7AAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJABlAG4AZAAgAD0AIAAkAGoACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIABiAHIAZQBhAGsACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAfQAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAfQAKAAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIABpAGYAIAAoACQAZQBuAGQAIAAtAGcAdAAgACQAcwB0AGEAcgB0ACAAKwAgADQAKQAgAHsACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJABsAGUAbgAgAD0AIAAkAGUAbgBkACAALQAgACQAcwB0AGEAcgB0AAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAHQAcgB5ACAAewAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACQAbQBzACAAPQAgAFsAUwB5AHMAdABlAG0ALgBJAE8ALgBNAGUAbQBvAHIAeQBTAHQAcgBlAGEAbQBdADoAOgBuAGUAdwAoACQAYgB5AHQAZQBzACwAIAAkAHMAdABhAHIAdAAgACsAIAAyACwAIAAkAGwAZQBuACAALQAgADIAKQAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACQAZABzACAAPQAgAFsAUwB5AHMAdABlAG0ALgBJAE8ALgBDAG8AbQBwAHIAZQBzAHMAaQBvAG4ALgBEAGUAZgBsAGEAdABlAFMAdAByAGUAYQBtAF0AOgA6AG4AZQB3ACgAJABtAHMALAAgAFsAUwB5AHMAdABlAG0ALgBJAE8ALgBDAG8AbQBwAHIAZQBzAHMAaQBvAG4ALgBDAG8AbQBwAHIAZQBzAHMAaQBvAG4ATQBvAGQAZQBdADoAOgBEAGUAYwBvAG0AcAByAGUAcwBzACkACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAkAHMAcgAgAD0AIABbAFMAeQBzAHQAZQBtAC4ASQBPAC4AUwB0AHIAZQBhAG0AUgBlAGEAZABlAHIAXQA6ADoAbgBlAHcAKAAkAGQAcwAsACAAWwBTAHkAcwB0AGUAbQAuAFQAZQB4AHQALgBFAG4AYwBvAGQAaQBuAGcAXQA6ADoAVQBUAEYAOAApAAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJABkAGUAYwBvAG0AcAAgAD0AIAAkAHMAcgAuAFIAZQBhAGQAVABvAEUAbgBkACgAKQAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACQAcwByAC4AQwBsAG8AcwBlACgAKQAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACQAZABzAC4AQwBsAG8AcwBlACgAKQAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACQAbQBzAC4AQwBsAG8AcwBlACgAKQAKAAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJABuAHAAawBTAHQAcgBlAGEAbQAgAD0AIABFAHgAdAByAGEAYwB0AC0ATgBwAGsARgByAG8AbQBUAGUAeAB0ACAAJABkAGUAYwBvAG0AcAAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAGkAZgAgACgAJABuAHAAawBTAHQAcgBlAGEAbQApACAAewAgAHIAZQB0AHUAcgBuACAAJABuAHAAawBTAHQAcgBlAGEAbQAgAH0ACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAfQAgAGMAYQB0AGMAaAAgAHsAfQAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAkAHMAdAByAGUAYQBtAEMAbwB1AG4AdAAgACsAPQAgADEACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAaQBmACAAKAAkAHMAdAByAGUAYQBtAEMAbwB1AG4AdAAgAC0AZwBlACAAMQAyACkAIAB7ACAAYgByAGUAYQBrACAAfQAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAfQAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJABpACAAPQAgACQAcwB0AGEAcgB0AAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAfQAKACAAIAAgACAAIAAgACAAIAB9AAoAIAAgACAAIAB9ACAAYwBhAHQAYwBoACAAewB9AAoAIAAgACAAIAByAGUAdAB1AHIAbgAgACcAJwAKAH0ACgAKAGYAdQBuAGMAdABpAG8AbgAgAEUAeAB0AHIAYQBjAHQALQBOAHAAawBGAHIAbwBtAFAAcAB0AEIAaQBuAGEAcgB5ACgAJABmAGkAbABlAFAAYQB0AGgAKQAgAHsACgAgACAAIAAgAHQAcgB5ACAAewAKACAAIAAgACAAIAAgACAAIAAkAHIAYQB3AEEAcwBjAGkAaQAgAD0AIABbAFMAeQBzAHQAZQBtAC4ASQBPAC4ARgBpAGwAZQBdADoAOgBSAGUAYQBkAEEAbABsAFQAZQB4AHQAKAAkAGYAaQBsAGUAUABhAHQAaAAsACAAWwBTAHkAcwB0AGUAbQAuAFQAZQB4AHQALgBFAG4AYwBvAGQAaQBuAGcAXQA6ADoAQQBTAEMASQBJACkACgAgACAAIAAgACAAIAAgACAAJABuAHAAawAgAD0AIABFAHgAdAByAGEAYwB0AC0ATgBwAGsARgByAG8AbQBUAGUAeAB0ACAAJAByAGEAdwBBAHMAYwBpAGkACgAgACAAIAAgACAAIAAgACAAaQBmACAAKAAkAG4AcABrACkAIAB7ACAAcgBlAHQAdQByAG4AIAAkAG4AcABrACAAfQAKAAoAIAAgACAAIAAgACAAIAAgACQAcgBhAHcAVQBuAGkAIAA9ACAAWwBTAHkAcwB0AGUAbQAuAEkATwAuAEYAaQBsAGUAXQA6ADoAUgBlAGEAZABBAGwAbABUAGUAeAB0ACgAJABmAGkAbABlAFAAYQB0AGgALAAgAFsAUwB5AHMAdABlAG0ALgBUAGUAeAB0AC4ARQBuAGMAbwBkAGkAbgBnAF0AOgA6AFUAbgBpAGMAbwBkAGUAKQAKACAAIAAgACAAIAAgACAAIAAkAG4AcABrAFUAbgBpACAAPQAgAEUAeAB0AHIAYQBjAHQALQBOAHAAawBGAHIAbwBtAFQAZQB4AHQAIAAkAHIAYQB3AFUAbgBpAAoAIAAgACAAIAAgACAAIAAgAGkAZgAgACgAJABuAHAAawBVAG4AaQApACAAewAgAHIAZQB0AHUAcgBuACAAJABuAHAAawBVAG4AaQAgAH0ACgAgACAAIAAgAH0AIABjAGEAdABjAGgAIAB7AH0ACgAgACAAIAAgAHIAZQB0AHUAcgBuACAAJwAnAAoAfQAKAAoAJAByAGUAcwAgAD0AIABAACgAKQAKACQAaQAgAD0AIAAwAAoACgBmAG8AcgBlAGEAYwBoACAAKAAkAGYAIABpAG4AIAAkAGYAaQBsAGUAcwApACAAewAKACAAIAAgACAAJABpACsAKwAKACAAIAAgACAAaQBmACAAKAAkAGkAIAAlACAAMgA1ACAALQBlAHEAIAAwACAALQBvAHIAIAAkAGkAIAAtAGUAcQAgACQAZgBpAGwAZQBzAC4AQwBvAHUAbgB0ACkAIAB7AAoAIAAgACAAIAAgACAAIAAgAFcAcgBpAHQAZQAtAEgAbwBzAHQAIAAoACcATQBlAG0AcAByAG8AcwBlAHMAIABiAGUAcgBrAGEAcwAgAFsAJwAgACsAIAAkAGkAIAArACAAJwAvACcAIAArACAAJABmAGkAbABlAHMALgBDAG8AdQBuAHQAIAArACAAJwBdAC4ALgAuACcAKQAgAC0ARgBvAHIAZQBnAHIAbwB1AG4AZABDAG8AbABvAHIAIABZAGUAbABsAG8AdwAKACAAIAAgACAAfQAKAAoAIAAgACAAIAAkAG4AcABrACAAPQAgACcAJwAKACAAIAAgACAAJABuAHAAawBGAGEAbABsAGIAYQBjAGsAIAA9ACAAJwAnAAoACgAgACAAIAAgACMAIAAxAC4AIABDAG8AYgBhACAAZABhAHIAaQAgAG4AYQBtAGEAIABmAGkAbABlACAAZABhAGgAdQBsAHUACgAgACAAIAAgAGkAZgAgACgAJABmAC4AQgBhAHMAZQBOAGEAbQBlACAALQBtAGEAdABjAGgAIAAnACgAPwBpACkAKAA/ADoAXgB8AFsAXgBcAGQAXQApACgAXABkAHsANAAsADYAfQApACgAPwA6AFsAXgBcAGQAXQB8ACQAKQAnACkAIAB7AAoAIAAgACAAIAAgACAAIAAgACQAYwBhAG4AZABpAGQAYQB0AGUAIAA9ACAAJABtAGEAdABjAGgAZQBzAFsAMQBdAAoAIAAgACAAIAAgACAAIAAgACMAIABIAGkAbgBkAGEAcgBpACAAdABhAGgAdQBuACAAKAAyADAAMQA4AC4ALgAyADAAMgA2ACkAIABqAGkAawBhACAAZABpACAAbgBhAG0AYQAgAGYAaQBsAGUAIAB0AGkAZABhAGsAIABhAGQAYQAgAGwAYQBiAGUAbAAgAE4AUABLAAoAIAAgACAAIAAgACAAIAAgAGkAZgAgACgAJABjAGEAbgBkAGkAZABhAHQAZQAgAC0AbQBhAHQAYwBoACAAJwBeACgAMgAwADEAWwA4AC0AOQBdAHwAMgAwADIAWwAwAC0ANgBdACkAJAAnACAALQBhAG4AZAAgACQAZgAuAEIAYQBzAGUATgBhAG0AZQAgAC0AbgBvAHQAbQBhAHQAYwBoACAAJwAoAD8AaQApAG4AcABrACcAKQAgAHsACgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAkAG4AcABrAEYAYQBsAGwAYgBhAGMAawAgAD0AIAAkAGMAYQBuAGQAaQBkAGEAdABlAAoAIAAgACAAIAAgACAAIAAgAH0AIABlAGwAcwBlACAAewAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACQAbgBwAGsAIAA9ACAAJABjAGEAbgBkAGkAZABhAHQAZQAKACAAIAAgACAAIAAgACAAIAB9AAoAIAAgACAAIAB9AAoACgAgACAAIAAgACMAIAAyAC4AIABKAGkAawBhACAAYgBlAGwAdQBtACAAYQBkAGEAIABOAFAASwAgAGQAaQAgAG4AYQBtAGEAIABmAGkAbABlACwAIABEAGUAZQBwACAAUwBjAGEAbgAgAGkAcwBpACAAYgBlAHIAawBhAHMAIQAKACAAIAAgACAAaQBmACAAKAAtAG4AbwB0ACAAJABuAHAAawApACAAewAKACAAIAAgACAAIAAgACAAIABpAGYAIAAoACQAZgAuAEUAeAB0AGUAbgBzAGkAbwBuACAALQBtAGEAdABjAGgAIAAnACgAPwBpACkAXgBcAC4AKABwAHAAdAB4AHwAcABwAHMAeAApACQAJwApACAAewAKACAAIAAgACAAIAAgACAAIAAgACAAIAAgACQAbgBwAGsAIAA9ACAARQB4AHQAcgBhAGMAdAAtAE4AcABrAEYAcgBvAG0AUABwAHQAeAAgACQAZgAuAEYAdQBsAGwATgBhAG0AZQAKACAAIAAgACAAIAAgACAAIAB9ACAAZQBsAHMAZQBpAGYAIAAoACQAZgAuAEUAeAB0AGUAbgBzAGkAbwBuACAALQBtAGEAdABjAGgAIAAnACgAPwBpACkAXgBcAC4AcABkAGYAJAAnACkAIAB7AAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJABuAHAAawAgAD0AIABFAHgAdAByAGEAYwB0AC0ATgBwAGsARgByAG8AbQBQAGQAZgAgACQAZgAuAEYAdQBsAGwATgBhAG0AZQAKACAAIAAgACAAIAAgACAAIAB9ACAAZQBsAHMAZQBpAGYAIAAoACQAZgAuAEUAeAB0AGUAbgBzAGkAbwBuACAALQBtAGEAdABjAGgAIAAnACgAPwBpACkAXgBcAC4AKABwAHAAdAB8AHAAcABzACkAJAAnACkAIAB7AAoAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJABuAHAAawAgAD0AIABFAHgAdAByAGEAYwB0AC0ATgBwAGsARgByAG8AbQBQAHAAdABCAGkAbgBhAHIAeQAgACQAZgAuAEYAdQBsAGwATgBhAG0AZQAKACAAIAAgACAAIAAgACAAIAB9AAoAIAAgACAAIAB9AAoACgAgACAAIAAgAGkAZgAgACgALQBuAG8AdAAgACQAbgBwAGsAIAAtAGEAbgBkACAAJABuAHAAawBGAGEAbABsAGIAYQBjAGsAKQAgAHsACgAgACAAIAAgACAAIAAgACAAJABuAHAAawAgAD0AIAAkAG4AcABrAEYAYQBsAGwAYgBhAGMAawAKACAAIAAgACAAfQAKAAoAIAAgACAAIAAkAGoAdQBkAHUAbAAgAD0AIAAkAGYALgBCAGEAcwBlAE4AYQBtAGUACgAgACAAIAAgAGkAZgAgACgAJABuAHAAawApACAAewAKACAAIAAgACAAIAAgACAAIAAkAGoAdQBkAHUAbAAgAD0AIAAoACQAagB1AGQAdQBsACAALQByAGUAcABsAGEAYwBlACAAJABuAHAAawAsACAAJwAnACkALgBSAGUAcABsAGEAYwBlACgAJwBfACcALAAgACcAIAAnACkALgBUAHIAaQBtACgAKQAKACAAIAAgACAAIAAgACAAIAAkAGoAdQBkAHUAbAAgAD0AIAAoACQAagB1AGQAdQBsACAALQByAGUAcABsAGEAYwBlACAAJwBeAFsAXABzAC0AXwA6AF0AKwAnACwAIAAnACcAKQAuAFQAcgBpAG0AKAApAAoAIAAgACAAIAB9AAoAIAAgACAAIABpAGYAIAAoAC0AbgBvAHQAIAAkAGoAdQBkAHUAbAApACAAewAKACAAIAAgACAAIAAgACAAIAAkAGoAdQBkAHUAbAAgAD0AIAAkAGYALgBCAGEAcwBlAE4AYQBtAGUACgAgACAAIAAgAH0ACgAKACAAIAAgACAAJAByAGUAcwAgACsAPQAgAFsAUABTAEMAdQBzAHQAbwBtAE8AYgBqAGUAYwB0AF0AQAB7AAoAIAAgACAAIAAgACAAIAAgAE4AUABLACAAPQAgACQAbgBwAGsACgAgACAAIAAgACAAIAAgACAATgBBAE0AQQAgAD0AIAAnACcACgAgACAAIAAgACAAIAAgACAASgBVAEQAVQBMACAAPQAgACQAagB1AGQAdQBsAAoAIAAgACAAIAAgACAAIAAgAFQAQQBOAEcARwBBAEwAIAA9ACAAJABmAC4ATABhAHMAdABXAHIAaQB0AGUAVABpAG0AZQAuAFQAbwBTAHQAcgBpAG4AZwAoACcAeQB5AHkAeQAtAE0ATQAtAGQAZAAnACkACgAgACAAIAAgACAAIAAgACAAVABJAE0ARQAgAD0AIAAkAGYALgBMAGEAcwB0AFcAcgBpAHQAZQBUAGkAbQBlAC4AVABvAFMAdAByAGkAbgBnACgAJwBIAEgAOgBtAG0AOgBzAHMAJwApAAoAIAAgACAAIAB9AAoAfQAKAAoAaQBmACAAKAAkAHIAZQBzAC4AQwBvAHUAbgB0ACAALQBnAHQAIAAwACkAIAB7AAoAIAAgACAAIAAkAHIAZQBzACAAfAAgAEUAeABwAG8AcgB0AC0AQwBzAHYAIAAtAFAAYQB0AGgAIAAnAFIAZQBrAGEAcABfAEsATQBfAFMAaQBhAHAAXwBVAHAAbABvAGEAZAAuAGMAcwB2ACcAIAAtAE4AbwBUAHkAcABlAEkAbgBmAG8AcgBtAGEAdABpAG8AbgAgAC0ARQBuAGMAbwBkAGkAbgBnACAAVQBUAEYAOAAKACAAIAAgACAAVwByAGkAdABlAC0ASABvAHMAdAAgACcAPQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9ACcAIAAtAEYAbwByAGUAZwByAG8AdQBuAGQAQwBvAGwAbwByACAARwByAGUAZQBuAAoAIAAgACAAIABXAHIAaQB0AGUALQBIAG8AcwB0ACAAKAAnAEIARQBSAEgAQQBTAEkATAAhACAAUgBlAGsAYQBwACAAJwAgACsAIAAkAHIAZQBzAC4AQwBvAHUAbgB0ACAAKwAgACcAIABiAGUAcgBrAGEAcwAgAHQAZQByAHMAaQBtAHAAYQBuACAAZABpADoAIABSAGUAawBhAHAAXwBLAE0AXwBTAGkAYQBwAF8AVQBwAGwAbwBhAGQALgBjAHMAdgAnACkAIAAtAEYAbwByAGUAZwByAG8AdQBuAGQAQwBvAGwAbwByACAARwByAGUAZQBuAAoAIAAgACAAIABXAHIAaQB0AGUALQBIAG8AcwB0ACAAJwBTAGkAbABhAGsAYQBuACAAdQBwAGwAbwBhAGQAIABmAGkAbABlACAAQwBTAFYAIABpAG4AaQAgAGsAZQAgAEQALQBQAEUAUgBGAE8AUgBNAC4AJwAgAC0ARgBvAHIAZQBnAHIAbwB1AG4AZABDAG8AbABvAHIAIABHAHIAZQBlAG4ACgAgACAAIAAgAFcAcgBpAHQAZQAtAEgAbwBzAHQAIAAnAD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQAnACAALQBGAG8AcgBlAGcAcgBvAHUAbgBkAEMAbwBsAG8AcgAgAEcAcgBlAGUAbgAKAH0AIABlAGwAcwBlACAAewAKACAAIAAgACAAVwByAGkAdABlAC0ASABvAHMAdAAgACcAVABpAGQAYQBrACAAZABpAHQAZQBtAHUAawBhAG4AIABiAGUAcgBrAGEAcwAgAFAARABGACAAYQB0AGEAdQAgAFAAUABUACAAZABpACAAZgBvAGwAZABlAHIAIABpAG4AaQAuACcAIAAtAEYAbwByAGUAZwByAG8AdQBuAGQAQwBvAGwAbwByACAAUgBlAGQACgB9AAoA";

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
    window.handleUploadFileInputChange = handleUploadFileInputChange;

    // ========================================================
    // MODUL TINJAUAN & PENGINGAT STATUS RESIGN KARYAWAN (ADMIN)
    // ========================================================
    const PENDING_RESIGN_STORAGE_KEY = 'dperform_pending_resign_review';

    function getPendingResignReviews() {
      try {
        const raw = localStorage.getItem(PENDING_RESIGN_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    function savePendingResignReviews(list) {
      try {
        localStorage.setItem(PENDING_RESIGN_STORAGE_KEY, JSON.stringify(list || []));
      } catch (e) {}
      updateResignReviewBanner();
    }

    function updateResignReviewBanner() {
      const isAdmin = typeof isUserAdmin === 'function' && isUserAdmin(loggedInUser);
      const banner = document.getElementById('admin-resign-review-banner');
      const dashBtn = document.getElementById('btn-dash-resign-review');
      const badgeCount = document.getElementById('resign-review-count-badge');
      const btnText = document.getElementById('btn-resign-review-text');
      const dashBadge = document.getElementById('badge-dash-resign-review');
      const modalBadge = document.getElementById('resign-review-modal-badge');

      const pendingList = getPendingResignReviews();
      const count = pendingList.length;

      if (!isAdmin || count === 0) {
        if (banner) banner.classList.add('hidden');
        if (dashBtn) dashBtn.classList.add('hidden');
        return;
      }

      if (banner) banner.classList.remove('hidden');
      if (dashBtn) dashBtn.classList.remove('hidden');

      const countText = `${count} Karyawan`;
      if (badgeCount) badgeCount.textContent = countText;
      if (btnText) btnText.textContent = `Tinjau Karyawan (${count})`;
      if (dashBadge) dashBadge.textContent = `${count} Tinjau Resign`;
      if (modalBadge) modalBadge.textContent = countText;
    }

    function openResignReviewModal() {
      if (typeof isUserAdmin === 'function' && !isUserAdmin(loggedInUser)) {
        showToast("Akses ditolak: Hanya Admin yang dapat meninjau data resign.");
        return;
      }
      renderResignReviewModalItems();
      const modal = document.getElementById('modal-resign-review');
      if (modal) modal.classList.remove('hidden');
    }

    function renderResignReviewModalItems() {
      const container = document.getElementById('resign-review-items-container');
      const modalBadge = document.getElementById('resign-review-modal-badge');
      if (!container) return;

      const pendingList = getPendingResignReviews();
      if (modalBadge) modalBadge.textContent = `${pendingList.length} Karyawan`;

      if (!pendingList.length) {
        container.innerHTML = `
          <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mx-auto mb-2.5">
              <i class="fa-solid fa-clipboard-check"></i>
            </div>
            <h4 class="text-sm font-bold text-slate-800">Semua Data Telah Ditinjau</h4>
            <p class="text-xs text-slate-500 mt-1">Tidak ada karyawan yang menunggu konfirmasi status resign saat ini.</p>
          </div>
        `;
        return;
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const pphkList = window.STANDARD_PPHK_REASONS || [];

      container.innerHTML = pendingList.map(emp => {
        const npk = safeString(emp.npk || emp['Personnel no.']);
        const nama = emp.nama || emp['Last name'] || 'Karyawan';
        const cabang = emp.cabang || emp['P.subarea'] || '-';
        const kodeBA = emp.kodeBA || emp['Business area'] || '';
        const jabatan = emp.jabatan || emp['Job Title'] || '-';
        const divisi = emp.divisi || emp['Name'] || '-';
        const missedDate = emp.missedAt ? new Date(emp.missedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Bulan Berjalan';

        const pphkOptions = pphkList.map(item => `<option value="${item.reason}">${item.reason}</option>`).join('');

        return `
          <div class="p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl transition space-y-3" id="resign-card-${npk}">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div class="flex items-start gap-3 min-w-0 flex-1">
                <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 font-black flex items-center justify-center text-xs flex-shrink-0 border border-amber-300">
                  ${nama.slice(0, 2).toUpperCase()}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap min-w-0">
                    <span class="font-extrabold text-slate-900 text-sm truncate max-w-full">${nama}</span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-200 text-slate-700 flex-shrink-0">${npk}</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex-shrink-0">
                      <i class="fa-solid fa-clock mr-1"></i>Omit / Tidak di Berkas Baru (${missedDate})
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-2 flex-wrap min-w-0">
                    <span class="truncate"><i class="fa-solid fa-building mr-1"></i>Cabang: <b>${cabang}</b> ${kodeBA ? '(' + kodeBA + ')' : ''}</span>
                    <span>•</span>
                    <span class="truncate"><i class="fa-solid fa-briefcase mr-1"></i>${divisi} / ${jabatan}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                <button type="button" onclick="confirmEmployeeKeepActive('${npk}')" class="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer">
                  <i class="fa-solid fa-check text-[10px]"></i>
                  <span>Tetap Aktif</span>
                </button>
                <button type="button" onclick="toggleResignInlineForm('${npk}')" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer">
                  <i class="fa-solid fa-user-xmark text-[10px]"></i>
                  <span>Tandai Resign</span>
                </button>
              </div>
            </div>

            <!-- Inline Resign Form -->
            <div id="inline-resign-form-${npk}" class="hidden p-3 bg-white border border-rose-200 rounded-xl space-y-2.5 animate-in fade-in duration-150">
              <div class="text-[11px] font-black text-rose-900 flex items-center gap-1.5 border-b border-rose-100 pb-1.5">
                <i class="fa-solid fa-file-pen text-rose-600"></i>
                <span>Formulir Penetapan PPHK Resmi (SOP ADM) untuk ${nama}</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-[10px] font-bold text-slate-700 mb-1">Tanggal Efektif Resign / PHK:</label>
                  <input type="date" id="inline-date-${npk}" value="${todayStr}" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-700 mb-1">Alasan PHK (Kolom 1 Formulir PPHK):</label>
                  <select id="inline-reason-${npk}" onchange="updateInlineAttachmentHint('${npk}', this.value)" class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white">
                    <option value="">-- Pilih Alasan PHK Resmi --</option>
                    ${pphkOptions}
                  </select>
                </div>
              </div>

              <!-- Dynamic Attachment Preview -->
              <div id="inline-attachment-box-${npk}" class="hidden p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-950">
                <div class="font-bold flex items-center gap-1 text-amber-900">
                  <i class="fa-solid fa-paperclip text-amber-600"></i>
                  <span>Lampiran Dokumen Wajib (Kolom 2 PPHK):</span>
                </div>
                <div id="inline-attachment-text-${npk}" class="mt-0.5 text-slate-800 font-semibold leading-relaxed"></div>
              </div>

              <div class="flex items-center justify-end gap-2 pt-1">
                <button type="button" onclick="toggleResignInlineForm('${npk}')" class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-[11px] transition cursor-pointer">
                  Batal
                </button>
                <button type="button" onclick="submitEmployeeResignAction('${npk}')" class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer">
                  <i class="fa-solid fa-floppy-disk text-[10px]"></i>
                  <span>Simpan Status Resign</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function toggleResignInlineForm(npk) {
      const formEl = document.getElementById(`inline-resign-form-${npk}`);
      if (!formEl) return;
      if (formEl.classList.contains('hidden')) {
        formEl.classList.remove('hidden');
      } else {
        formEl.classList.add('hidden');
      }
    }

    function updateInlineAttachmentHint(npk, reason) {
      const box = document.getElementById(`inline-attachment-box-${npk}`);
      const text = document.getElementById(`inline-attachment-text-${npk}`);
      if (!box || !text) return;
      if (!reason || reason === '-') {
        box.classList.add('hidden');
        text.textContent = '';
      } else {
        box.classList.remove('hidden');
        text.textContent = typeof getPPHKAttachment === 'function' ? getPPHKAttachment(reason) : reason;
      }
    }

    async function submitEmployeeResignAction(npk) {
      const cleanNpk = safeString(npk);
      const dateInput = document.getElementById(`inline-date-${cleanNpk}`);
      const reasonSelect = document.getElementById(`inline-reason-${cleanNpk}`);

      const tanggalResign = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
      const alasanResign = reasonSelect ? reasonSelect.value : '';

      if (!alasanResign) {
        alert("Harap pilih Alasan PHK / Resign sesuai formulir PPHK standar.");
        return;
      }

      // Update in rawTables.Master_Karyawan
      const masterRows = currentDashboardPayload?.rawTables?.Master_Karyawan || [];
      let foundRow = masterRows.find(r => safeString(r['Personnel no.'] || r['NPK']) === cleanNpk);

      if (!foundRow && window.masterFullPayload?.rawTables?.Master_Karyawan) {
        foundRow = window.masterFullPayload.rawTables.Master_Karyawan.find(r => safeString(r['Personnel no.'] || r['NPK']) === cleanNpk);
        if (foundRow) masterRows.push(foundRow);
      }

      if (foundRow) {
        foundRow['Status_Karyawan'] = 'Resign';
        foundRow['Tanggal_Resign'] = tanggalResign;
        foundRow['Alasan_Resign'] = alasanResign;
        if (typeof saveLocalEdit === 'function') {
          saveLocalEdit('Master_Karyawan', cleanNpk, foundRow);
        }
      }

      // Update in employeeList across all payloads
      [currentDashboardPayload, window.masterFullPayload, window.fullUnscopedPayload].forEach(payload => {
        if (Array.isArray(payload?.employeeList)) {
          const emp = payload.employeeList.find(e => safeString(e.npk || e['Personnel no.']) === cleanNpk);
          if (emp) {
            emp.statusKaryawan = 'Resign';
            emp.Status_Karyawan = 'Resign';
            emp.tanggalResign = tanggalResign;
            emp.alasanResign = alasanResign;
            emp.isPendingResignReview = false;
          }
        }
      });

      // Remove from pending reviews
      let pendingList = getPendingResignReviews();
      pendingList = pendingList.filter(p => safeString(p.npk || p['Personnel no.']) !== cleanNpk);
      savePendingResignReviews(pendingList);

      // Re-compute and refresh
      if (typeof computeBranchSummary === 'function' && currentDashboardPayload) {
        currentDashboardPayload.summary = computeBranchSummary(
          currentDashboardPayload.employeeList,
          currentDashboardPayload.qccList,
          currentDashboardPayload.summary
        );
      }
      if (typeof renderMasterKaryawanView === 'function') renderMasterKaryawanView(currentDashboardPayload);
      if (typeof renderAllDashboardData === 'function') renderAllDashboardData(window.masterFullPayload || currentDashboardPayload);
      if (typeof filterEmployeeTable === 'function') filterEmployeeTable();

      renderResignReviewModalItems();
      if (pendingList.length === 0) {
        closeModal('modal-resign-review');
      }

      const lampiran = typeof getPPHKAttachment === 'function' ? getPPHKAttachment(alasanResign) : '';
      showToast(`✅ Status ${cleanNpk} berhasil diubah ke Resign (${alasanResign}). Lampiran: ${lampiran}`, 5000);

      try {
        if (typeof updateRowInBackend === 'function' && foundRow) {
          await updateRowInBackend('Master_Karyawan', foundRow, -1, 'Personnel no.', cleanNpk);
        } else {
          await syncSheetToBackend('Master_Karyawan');
        }
      } catch(e) {}
    }

    function confirmEmployeeKeepActive(npk) {
      const cleanNpk = safeString(npk);

      const masterRows = currentDashboardPayload?.rawTables?.Master_Karyawan || [];
      const foundRow = masterRows.find(r => safeString(r['Personnel no.'] || r['NPK']) === cleanNpk);
      if (foundRow) {
        foundRow['Status_Karyawan'] = 'Aktif';
      }

      const empList = currentDashboardPayload?.employeeList || [];
      const emp = empList.find(e => safeString(e.npk || e['Personnel no.']) === cleanNpk);
      if (emp) {
        emp.statusKaryawan = 'Aktif';
        emp.Status_Karyawan = 'Aktif';
        emp.isPendingResignReview = false;
      }

      let pendingList = getPendingResignReviews();
      pendingList = pendingList.filter(p => safeString(p.npk || p['Personnel no.']) !== cleanNpk);
      savePendingResignReviews(pendingList);

      if (typeof renderMasterKaryawanView === 'function') renderMasterKaryawanView(currentDashboardPayload);
      if (typeof filterEmployeeTable === 'function') filterEmployeeTable();

      renderResignReviewModalItems();
      if (pendingList.length === 0) {
        closeModal('modal-resign-review');
      }

      showToast(`✅ Karyawan ${emp?.nama || cleanNpk} dikonfirmasi tetap Aktif.`);
    }

    function bulkConfirmKeepAllActive() {
      const pendingList = getPendingResignReviews();
      if (!pendingList.length) {
        closeModal('modal-resign-review');
        return;
      }

      const masterRows = currentDashboardPayload?.rawTables?.Master_Karyawan || [];
      const empList = currentDashboardPayload?.employeeList || [];

      pendingList.forEach(p => {
        const cleanNpk = safeString(p.npk || p['Personnel no.']);
        const row = masterRows.find(r => safeString(r['Personnel no.'] || r['NPK']) === cleanNpk);
        if (row) row['Status_Karyawan'] = 'Aktif';
        const emp = empList.find(e => safeString(e.npk || e['Personnel no.']) === cleanNpk);
        if (emp) {
          emp.statusKaryawan = 'Aktif';
          emp.Status_Karyawan = 'Aktif';
          emp.isPendingResignReview = false;
        }
      });

      savePendingResignReviews([]);
      if (typeof renderMasterKaryawanView === 'function') renderMasterKaryawanView(currentDashboardPayload);
      if (typeof filterEmployeeTable === 'function') filterEmployeeTable();

      closeModal('modal-resign-review');
      showToast(`✅ Seluruh ${pendingList.length} karyawan dikonfirmasi tetap Aktif.`);
    }

    // Expose resign review functions
    window.openResignReviewModal = openResignReviewModal;
    window.renderResignReviewModalItems = renderResignReviewModalItems;
    window.toggleResignInlineForm = toggleResignInlineForm;
    window.updateInlineAttachmentHint = updateInlineAttachmentHint;
    window.submitEmployeeResignAction = submitEmployeeResignAction;
    window.confirmEmployeeKeepActive = confirmEmployeeKeepActive;
    window.bulkConfirmKeepAllActive = bulkConfirmKeepAllActive;
    window.getPendingResignReviews = getPendingResignReviews;
    window.savePendingResignReviews = savePendingResignReviews;
    window.updateResignReviewBanner = updateResignReviewBanner;
