import axios from 'axios';

// =============================================
// n8n Webhook URL (from environment variables)
// =============================================
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

/**
 * Send a text question to the n8n math solver workflow
 * @param {string} question - The math question text
 * @returns {Promise<object>} - The AI parsed JSON response
 */
export async function solveMathQuestion(question) {
  const response = await axios.post(N8N_WEBHOOK_URL, {
    question, // Just sending 'question' as your n8n workflow expects
    lang: 'en'
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 90000, // 90 second timeout because Qwen3 can take a bit to process!
  });
  return response.data;
}

/**
 * Send an image (question paper) to the n8n math solver workflow
 * @param {File} imageFile - The uploaded image file
 * @returns {Promise<object>}
 */
export async function solveMathImage(imageFile) {
  const formData = new FormData();
  formData.append('type', 'image');
  formData.append('image', imageFile);

  const response = await axios.post(N8N_WEBHOOK_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000,
  });
  return response.data;
}
