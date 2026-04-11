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
 * @returns {Promise<object>} - The AI parsed JSON response
 */
export async function solveMathQuestion(question, useTest = false) {
  const url = useTest ? N8N_TEST_WEBHOOK_URL : N8N_WEBHOOK_URL;
  console.log(`[API] Calling Text Webhook: ${url}`);
  
  const response = await axios.post(url, {
    question,
    lang: 'en'
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 90000,
  });
  return response.data;
}


/**
 * Send an image (question paper) to the n8n math solver workflow
 * @param {File} imageFile - The uploaded image file
 * @param {boolean} useTest - Whether to use the test webhook URL
 * @returns {Promise<object>}
 */
export async function solveMathImage(imageFile, useTest = false) {
  const url = useTest ? N8N_TEST_WEBHOOK_URL : N8N_WEBHOOK_URL;
  console.log(`[API] Calling Image Webhook: ${url}`);

  const formData = new FormData();
  formData.append('type', 'image');
  formData.append('image', imageFile);

  const response = await axios.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000,
  });
  return response.data;
}


