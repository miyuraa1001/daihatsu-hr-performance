/**
 * D-PERFORM - Main Application Entry Point
 * Inisialisasi awal saat DOMContentLoaded
 */

// Auto-login saat halaman dimuat / direload jika Ingat Saya aktif
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAutoLogin);
} else {
  checkAutoLogin();
}

// Window resize listener untuk merapikan sidebar mobile jika layar diperlebar
window.addEventListener('resize', () => {
  if (window.innerWidth >= 768) {
    closeSidebarMobile();
  }
});