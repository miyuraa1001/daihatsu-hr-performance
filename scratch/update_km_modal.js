const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');
const oldFooter = `      <!-- Modal Footer -->
      <div class="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
        <button type="button" onclick="closeModal('modal-km-detail')" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer">
          Tutup
        </button>
      </div>`;

const newFooter = `      <!-- Modal Footer -->
      <div class="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
        <div id="km-modal-admin-actions" class="hidden items-center gap-2">
          <button type="button" onclick="openEditKMFromDetail()" class="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl text-xs border border-amber-200 transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs">
            <i class="fa-solid fa-pen-to-square"></i>
            <span>Edit Dokumen</span>
          </button>
          <button type="button" onclick="openDeleteKMFromDetail()" class="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs border border-red-200 transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs">
            <i class="fa-solid fa-trash"></i>
            <span>Hapus Dokumen</span>
          </button>
        </div>
        <div class="flex items-center justify-end gap-2 ml-auto">
          <button type="button" onclick="closeModal('modal-km-detail')" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer">
            Tutup
          </button>
        </div>
      </div>`;

const isHtmlCRLF = html.includes('\r\n');
const oldFooterNorm = isHtmlCRLF ? oldFooter.replace(/\n/g, '\r\n') : oldFooter;
const newFooterNorm = isHtmlCRLF ? newFooter.replace(/\n/g, '\r\n') : newFooter;

if (html.includes(oldFooterNorm)) {
  html = html.replace(oldFooterNorm, newFooterNorm);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Successfully updated modal-km-detail footer in index.html');
} else {
  console.error('Could not find oldFooter in index.html');
  process.exit(1);
}

// 2. Update src/js/modals.js
let modals = fs.readFileSync('src/js/modals.js', 'utf8');
const oldKMDetail = `      const attEl = document.getElementById('km-modal-attachment');
      if (attEl) {
        attEl.innerHTML = \`<i class=\"fa-solid fa-clock\"></i> \${time !== '-' ? time : 'Tercatat'}\`;
      }

      document.getElementById('modal-km-detail').classList.remove('hidden');
    }`;

const newKMDetail = `      const attEl = document.getElementById('km-modal-attachment');
      if (attEl) {
        attEl.innerHTML = \`<i class=\"fa-solid fa-clock\"></i> \${time !== '-' ? time : 'Tercatat'}\`;
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
    window.openDeleteKMFromDetail = openDeleteKMFromDetail;`;

const isModalsCRLF = modals.includes('\r\n');
const oldKMDetailNorm = isModalsCRLF ? oldKMDetail.replace(/\n/g, '\r\n') : oldKMDetail;
const newKMDetailNorm = isModalsCRLF ? newKMDetail.replace(/\n/g, '\r\n') : newKMDetail;

if (modals.includes(oldKMDetailNorm)) {
  modals = modals.replace(oldKMDetailNorm, newKMDetailNorm);
  fs.writeFileSync('src/js/modals.js', modals, 'utf8');
  console.log('Successfully updated openKMDetailModal in modals.js');
} else {
  console.error('Could not find oldKMDetail in modals.js');
  process.exit(1);
}
