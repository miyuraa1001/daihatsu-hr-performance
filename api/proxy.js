// Mengambil variabel dari Environment Variable Vercel (atau fallback)
const API_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "URL_WEB_APP_APPS_SCRIPT_KAMU";
const SECRET_TOKEN = process.env.NEXT_PUBLIC_SECRET_TOKEN || "COBA_COBA_PART01";

/**
 * Fungsi serbaguna untuk mengirim data ke Google Apps Script
 */
async function sendToAppsScript(action, payloadData = {}) {
  try {
    const bodyPayload = {
      token: SECRET_TOKEN,
      action: action,
      ...payloadData
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8" // Disarankan untuk Apps Script
      },
      body: JSON.stringify(bodyPayload)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error API Call:", error);
    return { success: false, message: "Gagal terhubung ke server backend." };
  }
}

// Contoh Pemanggilan:
// sendToAppsScript("PING").then(res => console.log(res));
