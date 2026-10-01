
function formatDatabaseDate(val) {
  if (!val && val !== 0) return "";
  if (val === null || val === undefined || val === '' || val === '-' || val === 'null' || val === 'undefined') return "";
  
  const s = String(val).trim();
  // Nilai epoch nol Excel/Google Sheets (1899-12-30 / 30.12.1899 / 0) dalam kolom tanggal adalah data kosong
  if (s === '1899-12-30' || s.startsWith('1899-12-30') || s === '30.12.1899' || s.startsWith('30.12.1899') || s === '30/12/1899' || s === '0' || s === '0.00.00' || s === '00:00:00') {
    return "";
  }

  if (val instanceof Date && !isNaN(val)) {
    const y = val.getFullYear();
    if (y <= 1899 || (y === 1900 && val.getMonth() === 0 && val.getDate() === 0)) return "";
    const d = String(val.getDate()).padStart(2, '0');
    const m = String(val.getMonth() + 1).padStart(2, '0');
    return `${d}.${m}.${y}`;
  }

  if (/^\d{6}$/.test(s)) {
    const d = s.slice(0, 2);
    const m = s.slice(2, 4);
    const yy = parseInt(s.slice(4, 6), 10);
    const y = yy > 50 ? (1900 + yy) : (2000 + yy);
    return `${d}.${m}.${y}`;
  }
  if (/^\d{8}$/.test(s)) {
    const d = s.slice(0, 2);
    const m = s.slice(2, 4);
    const y = s.slice(4, 8);
    return `${d}.${m}.${y}`;
  }
  if (/^\d{2}[\.\/\-]\d{2}[\.\/\-]\d{4}$/.test(s)) {
    return s.replace(/[\/\-]/g, '.');
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const parts = s.slice(0, 10).split('-');
    if (parseInt(parts[0], 10) <= 1899) return "";
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  if (typeof val === 'number') {
    if (val === 0 || val < 1) return "";
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      if (date.getFullYear() <= 1899) return "";
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}.${m}.${y}`;
    }
  }
  return s;
}

function calculateLatenessInfo(timeVal, targetHour = 8, targetMinute = 0) {
  if (
    timeVal === null || timeVal === undefined || timeVal === '' || timeVal === '-' ||
    timeVal === 'null' || timeVal === 'undefined'
  ) {
    return {
      hasClockIn: false,
      isLate: false,
      diffMinutes: 0,
      hours: 0,
      minutes: 0,
      timeFormatted: '-',
      text: 'Tidak Clock In',
      badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200',
      badgeHtml: '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200"><i class="fa-solid fa-minus text-[10px]"></i> Tidak Clock In</span>'
    };
  }

  const sRaw = String(timeVal).trim();
  // Khusus 0.00.00 / 00:00:00 / 0 / 1899-12-30 (nol waktu / tidak clock in):
  if (
    timeVal === 0 || sRaw === '0' || sRaw === '0.00.00' || sRaw === '00:00:00' || 
    sRaw === '0:00:00' || sRaw === '0.00' || sRaw === '1899-12-30' || 
    sRaw === '30.12.1899' || (sRaw.startsWith('1899-12-30') && !sRaw.includes(':'))
  ) {
    return {
      hasClockIn: false,
      isLate: false,
      diffMinutes: 0,
      hours: 0,
      minutes: 0,
      timeFormatted: '0.00.00',
      text: 'Tidak Clock In',
      badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200',
      badgeHtml: '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200"><i class="fa-solid fa-minus text-[10px]"></i> Tidak Clock In</span>'
    };
  }

  // Check standard status
  if (typeof timeVal === 'string') {
    const sLower = sRaw.toLowerCase();
    const knownStatus = ['hadir', 'cuti', 'sakit', 'izin', 'dinas', 'alpa', 'alpha', 'wfh', 'wfo'];
    if (knownStatus.includes(sLower)) {
      return {
        hasClockIn: true,
        isLate: false,
        diffMinutes: 0,
        timeFormatted: sRaw,
        text: sRaw
      };
    }
  }

  let h = -1;
  let m = -1;

  if (timeVal instanceof Date && !isNaN(timeVal.getTime())) {
    h = timeVal.getHours();
    m = timeVal.getMinutes();
  } else if (typeof timeVal === 'number' && !isNaN(timeVal)) {
    const timeFraction = (timeVal >= 1) ? (timeVal % 1) : timeVal;
    const totalSec = Math.round(timeFraction * 86400);
    h = Math.floor(totalSec / 3600) % 24;
    m = Math.floor((totalSec % 3600) / 60);
  } else {
    const s = sRaw;
    if (s.includes('T') && s.endsWith('Z')) {
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        const totalUtcMinutes = d.getUTCHours() * 60 + d.getUTCMinutes() + 420;
        const wibMinutes = ((totalUtcMinutes % 1440) + 1440) % 1440;
        h = Math.floor(wibMinutes / 60);
        m = wibMinutes % 60;
      }
    } else {
      const match = s.match(/(?:^|\s|T)(\d{1,2})[:\.](\d{2})/);
      if (match) {
        const parsedH = parseInt(match[1], 10);
        const parsedM = parseInt(match[2], 10);
        if (parsedH >= 0 && parsedH < 24 && parsedM >= 0 && parsedM < 60) {
          h = parsedH;
          m = parsedM;
        }
      }
    }
  }

  // Jika h = 0 dan m = 0 dan berasal dari 1899 epoch
  if (h === 0 && m === 0 && sRaw.startsWith('1899-12-')) {
    return {
      hasClockIn: false,
      isLate: false,
      diffMinutes: 0,
      hours: 0,
      minutes: 0,
      timeFormatted: '0.00.00',
      text: 'Tidak Clock In'
    };
  }

  if (h === -1 || m === -1 || isNaN(h) || isNaN(m)) {
    return {
      hasClockIn: false,
      isLate: false,
      diffMinutes: 0,
      hours: 0,
      minutes: 0,
      timeFormatted: sRaw === '1899-12-30' ? '0.00.00' : sRaw,
      text: 'Tidak Clock In'
    };
  }

  const timeFormatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return {
    hasClockIn: true,
    hours: h,
    minutes: m,
    timeFormatted: timeFormatted
  };
}

function formatDatabaseTime(val) {
  if (val === null || val === undefined || val === '' || val === '-' || val === 'null' || val === 'undefined') return '-';
  
  const s = String(val).trim();
  if (
    s === '0.00.00' || s === '00:00:00' || s === '0:00:00' || s === '0.00' || s === '0' ||
    s === '1899-12-30' || s === '30.12.1899' || (s.startsWith('1899-12-30') && !s.includes(':'))
  ) {
    return '0.00.00';
  }
  if (val === 0) return '0.00.00';

  const info = calculateLatenessInfo(val);
  if (info.hasClockIn && info.timeFormatted && info.timeFormatted !== '-') {
    return info.timeFormatted;
  }
  if (info.timeFormatted === '0.00.00' || s === '1899-12-30') {
    return '0.00.00';
  }
  if (info.text === 'Tidak Clock In' && !info.hasClockIn) {
    return (s === '0.00.00' || s === '00:00:00' || s === '1899-12-30' || s === '0') ? '0.00.00' : '-';
  }
  return info.timeFormatted || s;
}

// Tests
console.log("--- TEST formatDatabaseTime ---");
console.log("'1899-12-30' ->", formatDatabaseTime('1899-12-30'));
console.log("'0.00.00' ->", formatDatabaseTime('0.00.00'));
console.log("'00:00:00' ->", formatDatabaseTime('00:00:00'));
console.log("0 ->", formatDatabaseTime(0));
console.log("'' ->", formatDatabaseTime(''));
console.log("'-' ->", formatDatabaseTime('-'));
console.log("null ->", formatDatabaseTime(null));
console.log("'07:03' ->", formatDatabaseTime('07:03'));
console.log("'07:03:00' ->", formatDatabaseTime('07:03:00'));
console.log("'1899-12-30T00:03:00.000Z' (07:03 WIB) ->", formatDatabaseTime('1899-12-30T00:03:00.000Z'));
console.log("'1899-12-29T17:00:00.000Z' (00:00 WIB) ->", formatDatabaseTime('1899-12-29T17:00:00.000Z'));

console.log("\n--- TEST formatDatabaseDate ---");
console.log("'1899-12-30' ->", JSON.stringify(formatDatabaseDate('1899-12-30')));
console.log("'30.12.1899' ->", JSON.stringify(formatDatabaseDate('30.12.1899')));
console.log("'' ->", JSON.stringify(formatDatabaseDate('')));
console.log("'-' ->", JSON.stringify(formatDatabaseDate('-')));
console.log("'03.06.2026' ->", JSON.stringify(formatDatabaseDate('03.06.2026')));
console.log("'2026-06-03' ->", JSON.stringify(formatDatabaseDate('2026-06-03')));
