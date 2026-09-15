export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const APPS_SCRIPT_URL = process.env.API_URL || process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
    const SECRET_TOKEN = process.env.SECRET_TOKEN || process.env.NEXT_PUBLIC_SECRET_TOKEN;

    if (!APPS_SCRIPT_URL) {
      return res.status(500).json({ success: false, message: 'API_URL belum diset di Vercel Environment Variables.' });
    }

    // Gabungkan token rahasia Vercel dengan payload dari frontend HTML
    const payload = {
      token: SECRET_TOKEN,
      ...req.body
    };

    // Meneruskan request ke Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Proxy Error: ' + error.message });
  }
}
