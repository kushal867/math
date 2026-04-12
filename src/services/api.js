import axios from 'axios';

// =============================================
// n8n Webhook URLs (from environment variables)
// =============================================
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
const N8N_TEST_WEBHOOK_URL = import.meta.env.VITE_N8N_TEST_WEBHOOK_URL;

/**
 * Send a text question to the n8n math solver workflow
 * @param {string} question - The math question text
 * @param {boolean} useTest - Whether to use the test webhook URL
 * @returns {Promise<Blob>} - The generated PDF Blob
 */
export async function solveMathQuestion(question, useTest = false) {
  const url = useTest ? N8N_TEST_WEBHOOK_URL : N8N_WEBHOOK_URL;
  console.log(`[API] Calling Text Webhook (PDF Mode): ${url}`);
  
  const response = await axios.post(url, {
    question,
    lang: 'en'
  }, {
    responseType: 'blob', // IMPORTANT: We are now receiving a PDF file!
    headers: { 'Content-Type': 'application/json' },
    timeout: 120000, // Increased to 2 mins as PDF generation takes longer
  });
  
  return response.data;
}

/**
 * Send an image (question paper) to the n8n math solver workflow
 * @param {File} imageFile - The uploaded image file
 * @param {boolean} useTest - Whether to use the test webhook URL
 * @returns {Promise<Blob>} - The generated PDF Blob
 */
export async function solveMathImage(imageFile, useTest = false) {
  const url = useTest ? N8N_TEST_WEBHOOK_URL : N8N_WEBHOOK_URL;
  console.log(`[API] Calling Image Webhook (PDF Mode): ${url}`);

  const formData = new FormData();
  formData.append('type', 'image');
  formData.append('image', imageFile);

  const response = await axios.post(url, formData, {
    responseType: 'blob', // IMPORTANT: We are now receiving a PDF file!
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
  
  return response.data;
}



