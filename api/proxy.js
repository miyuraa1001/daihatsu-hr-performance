export default async function handler(req, res) {
  // Hanya izinkan method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Ambil URL Apps Script dari Environment Variables Vercel
    const APPS_SCRIPT_URL = process.env.API_URL || process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
    const SECRET_TOKEN = process.env.SECRET_TOKEN || process.env.NEXT_PUBLIC_SECRET_TOKEN;

    if (!APPS_SCRIPT_URL) {
      return res.status(500).json({ 
        success: false, 
        message: 'API_URL belum diset di Vercel Environment Variables. Harap set API_URL pada Dashboard Vercel.' 
      });
    }

    // Gabungkan token dari server Vercel dengan payload frontend
    const payload = {
      ...(SECRET_TOKEN ? { token: SECRET_TOKEN } : {}),
      ...req.body
    };

    // Teruskan request ke Google Apps Script dengan penanganan Redirect otomatis
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      redirect: 'follow' // Wajib ada agar proxy mau mengikuti redirect 302 dari Google
    });

    const textData = await response.text();
    
    // Parse JSON secara aman untuk mencegah error syntax jika response berbentuk teks
    let data;
    try {
      data = JSON.parse(textData);
    } catch (e) {
      return res.status(500).json({ 
        success: false, 
        message: 'Gagal parse JSON dari Apps Script. Response mentah: ' + textData 
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Proxy Error: ' + error.message 
    });
  }
}
