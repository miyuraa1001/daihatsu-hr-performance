export default async function handler(req, res) {
  // Hanya izinkan method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Ambil URL Apps Script dari Environment Variables Vercel
    const rawUrl = process.env.API_URL || process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
    const SECRET_TOKEN = process.env.SECRET_TOKEN || process.env.NEXT_PUBLIC_SECRET_TOKEN;

    if (!rawUrl) {
      return res.status(500).json({ 
        success: false, 
        message: 'API_URL belum diset di Vercel Environment Variables. Harap set API_URL pada Dashboard Vercel.' 
      });
    }

    const APPS_SCRIPT_URL = rawUrl.trim();

    // Gabungkan token dari server Vercel dengan payload frontend
    const payload = {
      ...(SECRET_TOKEN ? { token: SECRET_TOKEN } : {}),
      ...req.body
    };

    const MAX_RETRIES = 3;
    let lastErrorMsg = '';
    let successData = null;

    // Loop retry otomatis dengan exponential backoff untuk mengatasi kendala transient Google Drive / Apps Script
    // seperti "Page Not Found / unable to open the file at this time"
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 26000); // 26 detik timeout per attempt

        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload),
          redirect: 'follow',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const textData = await response.text();

        // Deteksi apakah response berupa HTML (indikator error Google Drive / cold-start Apps Script)
        const trimmed = (textData || '').trim();
        const isHtml = trimmed.startsWith('<') || 
                       trimmed.includes('<!DOCTYPE') || 
                       trimmed.includes('unable to open the file') ||
                       trimmed.includes('Page Not Found');

        if (!isHtml && trimmed) {
          try {
            successData = JSON.parse(trimmed);
            break; // Berhasil parse JSON, keluar dari loop retry!
          } catch (jsonErr) {
            lastErrorMsg = 'Response dari Google Apps Script bukan format JSON yang valid.';
          }
        } else {
          lastErrorMsg = 'Google Apps Script / Google Drive sedang sibuk atau mengalami kendala sementara (Unable to open file).';
        }

        // Jika attempt belum terakhir, tunggu backoff sejenak sebelum mencoba lagi
        if (attempt < MAX_RETRIES) {
          const delayMs = attempt * 900; // 900ms, 1800ms
          await new Promise(r => setTimeout(r, delayMs));
        }
      } catch (reqErr) {
        lastErrorMsg = reqErr.name === 'AbortError' 
          ? 'Koneksi ke Apps Script timeout.' 
          : `Gagal memanggil Apps Script: ${reqErr.message}`;
        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, attempt * 900));
        }
      }
    }

    if (successData) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.status(200).json(successData);
    }

    return res.status(502).json({ 
      success: false, 
      message: lastErrorMsg || 'Gagal memuat data dari Google Apps Script setelah beberapa kali percobaan.' 
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Proxy Error: ' + error.message 
    });
  }
}
