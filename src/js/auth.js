/**
 * D-PERFORM - Authentication & Session Management
 * Login, Logout, Remember Me, and Session State
 */

    function togglePasswordVisibility() {
      const passInput = document.getElementById('login-password');
      const toggleIcon = document.getElementById('password-toggle-icon');
      
      if (passInput.type === 'password') {
        passInput.type = 'text';
        toggleIcon.classList.remove('fa-regular', 'fa-eye');
        toggleIcon.classList.add('fa-solid', 'fa-eye-slash', 'text-red-500');
      } else {
        passInput.type = 'password';
        toggleIcon.classList.remove('fa-solid', 'fa-eye-slash', 'text-red-500');
        toggleIcon.classList.add('fa-regular', 'fa-eye');
      }
    }

    const AUTH_STORAGE_KEY = 'dperform_auth_session';

    // 1. Submit Login
    async function handleLoginSubmit(e) {
      e.preventDefault();
      const u = document.getElementById('login-username').value.trim();
      const p = document.getElementById('login-password').value.trim();
      const btn = document.getElementById('btn-login');
      const errEl = document.getElementById('login-error-msg');

      if (!u || !p) return;
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin mr-1"></i> Memverifikasi...`;
      errEl.classList.add('hidden');

      const res = await callBackendAPI("LOGIN", { username: u, password: p });

      btn.disabled = false;
      btn.innerHTML = `<span>Masuk ke Dashboard</span> <i class="fa-solid fa-arrow-right"></i>`;

      if (res.success) {
        loggedInUser = res.user;

        // Fitur Ingat Saya: simpan sesi dan kredensial agar saat reload langsung masuk
        const rememberMe = document.getElementById('remember-me')?.checked;
        if (rememberMe) {
          try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
              user: res.user,
              username: u,
              password: p,
              remember: true,
              savedAt: new Date().toISOString()
            }));
          } catch (storageErr) {
            console.warn("Gagal menyimpan preferensi Ingat Saya ke localStorage:", storageErr);
          }
        } else {
          try {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          } catch (storageErr) {}
        }

        initAuthenticatedApp();
      } else {
        errEl.textContent = res.message || 'NPK atau Tanggal Lahir (DDMMYY) salah!';
        errEl.classList.remove('hidden');
      }
    }

    function openLogoutModal() {
      const modal = document.getElementById('modal-logout');
      if (modal) modal.classList.remove('hidden');
    }

    function handleLogout() {
      openLogoutModal();
    }

    function executeLogout() {
      closeModal('modal-logout');
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (e) {}
      loggedInUser = null;
      currentDashboardPayload = null;
      document.getElementById('app-screen').classList.add('hidden');
      document.getElementById('login-screen').classList.remove('hidden');
      document.getElementById('login-password').value = '';
      const rememberCheckbox = document.getElementById('remember-me');
      if (rememberCheckbox) {
        rememberCheckbox.checked = false;
      }
      if (typeof showToast === 'function') {
        showToast("Anda telah berhasil keluar dari sistem.");
      }
    }

    /**
     * Memeriksa dan memulihkan sesi login saat halaman dimuat / direload jika 'Ingat Saya' aktif
     */
    function checkAutoLogin() {
      try {
        localStorage.removeItem('dperform_km_cache');
      } catch(e) {}
      try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (saved && saved.remember) {
          if (document.getElementById('login-username') && saved.username) {
            document.getElementById('login-username').value = saved.username;
          }
          if (document.getElementById('login-password') && saved.password) {
            document.getElementById('login-password').value = saved.password;
          }
          if (document.getElementById('remember-me')) {
            document.getElementById('remember-me').checked = true;
          }
          if (saved.user) {
            loggedInUser = saved.user;
            initAuthenticatedApp();
          }
        }
      } catch (err) {
        console.warn("Gagal memulihkan sesi login otomatis:", err);
      }
    }

    // 2. Inisialisasi Tampilan Setelah Login dengan RBAC
    function initAuthenticatedApp() {
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('app-screen').classList.remove('hidden');

      const isAdmin = isUserAdmin(loggedInUser);
      const userBranchName = getUserBranchName(loggedInUser);

      document.getElementById('header-user-name').textContent = loggedInUser.nama || (isAdmin ? 'Administrator' : 'Kepala Cabang');
      document.getElementById('header-user-role').textContent = isAdmin 
        ? (loggedInUser.jabatan || 'Administrator HR & GA') 
        : (loggedInUser.jabatan || `Kepala Cabang - ${userBranchName}`);
      
      document.getElementById('welcome-greeting-title').textContent = `Selamat datang, ${loggedInUser.nama || (isAdmin ? 'Admin' : 'Kepala Cabang')}!`;
      document.getElementById('welcome-greeting-subtitle').textContent = isAdmin 
        ? 'Akses penuh seluruh cabang wilayah DSO Lampung: Monitoring performa, impor data, dan kelola master.' 
        : `Monitoring performa dan data karyawan cabang ${userBranchName}.`;

      // Kelola banner Admin
      const adminBanner = document.getElementById('admin-action-banner');
      if (adminBanner) {
        if (isAdmin) adminBanner.classList.remove('hidden');
        else adminBanner.classList.add('hidden');
      }

      // Kelola tombol upload (hanya tampil untuk Admin)
      document.querySelectorAll('.admin-only-action').forEach(el => {
        if (isAdmin) el.classList.remove('hidden');
        else el.classList.add('hidden');
      });

      if (typeof populateBranchDropdown === "function") {
        populateBranchDropdown();
      }
      if (typeof populateMonthAndYearDropdowns === "function") {
        populateMonthAndYearDropdowns();
      }
      if (typeof loadBackendDashboardData === "function") {
        loadBackendDashboardData();
      }
    }
