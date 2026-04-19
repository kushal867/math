import axios from 'axios';

// =============================================
// n8n Webhook URLs (from environment variables)
// =============================================
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
const N8N_TEST_WEBHOOK_URL = import.meta.env.VITE_N8N_TEST_WEBHOOK_URL;

// Ensure base URLs are defined
if (!N8N_WEBHOOK_URL && !N8N_TEST_WEBHOOK_URL) {
  console.warn('[API] Warning: Neither VITE_N8N_WEBHOOK_URL nor VITE_N8N_TEST_WEBHOOK_URL is defined. API calls will fail.');
}

// Custom error class to better handle and propagate errors
export class ApiError extends Error {
  constructor(message, status = null, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Handle axios errors consistently
 */
const handleApiError = (error, context) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`[API] ${context} Error - Status: ${error.response.status}`, error.response.data);
      throw new ApiError(
        `Server responded with error: ${error.response.statusText}`, 
        error.response.status, 
        error.response.data
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`[API] ${context} Error - No response received.`, error.message);
      throw new ApiError(`Network error or server is unresponsive. Details: ${error.message}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error(`[API] ${context} Error - Request setup failed.`, error.message);
      throw new ApiError(`Request setup failed: ${error.message}`);
    }
  }
  // Fallback for non-axios errors
  console.error(`[API] ${context} Unexpected Error:`, error);
  throw new ApiError(error.message || 'An unexpected error occurred during the API call.');
};

/**
 * Basic retry mechanism wrapper for reliability
 */
const withRetry = async (fn, retries = 1, delay = 2000) => {
  try {
    return await fn();
  } catch (err) {
    // Only retry for network errors or 5xx server errors, not for client errors (4xx)
    if (retries > 0 && (!err.status || err.status >= 500)) {
      console.warn(`[API] Request failed, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2); // Exponential backoff
    }
    throw err; // Out of retries or non-retriable error
  }
};

/**
 * Send a text question to the n8n math solver workflow
 * @param {string} question - The math question text
 * @param {boolean} useTest - Whether to use the test webhook URL
 * @returns {Promise<Blob>} - The generated PDF Blob
 */
export async function solveMathQuestion(question, useTest = false) {
  if (!question || typeof question !== 'string' || !question.trim()) {
    throw new ApiError('Invalid input: Question must be a non-empty string.', 400);
  }

  const url = useTest ? N8N_TEST_WEBHOOK_URL : N8N_WEBHOOK_URL;
  if (!url) {
    throw new ApiError('Webhook URL is not configured.', 500);
  }

  const performRequest = async () => {
    try {
      console.log(`[API] Calling Text Webhook (PDF Mode): ${url}`);
      const response = await axios.post(url, {
        question: question.trim(),
        lang: 'en'
      }, {
        responseType: 'blob', // IMPORTANT: We are now receiving a PDF file!
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/pdf, application/json'
        },
        timeout: 120000, // Increased to 2 mins as PDF generation takes longer
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'solveMathQuestion');
    }
  };

  return withRetry(performRequest, 1); // 1 retry for reliability
}

/**
 * Send an image (question paper) to the n8n math solver workflow
 * @param {File} imageFile - The uploaded image file
 * @param {boolean} useTest - Whether to use the test webhook URL
 * @returns {Promise<Blob>} - The generated PDF Blob
 */
export async function solveMathImage(imageFile, useTest = false) {
  if (!imageFile || !(imageFile instanceof File)) {
    throw new ApiError('Invalid input: Must provide a valid File object.', 400);
  }

  // Basic sanity check for file size (e.g. 10MB limit)
  if (imageFile.size > 10 * 1024 * 1024) {
    throw new ApiError('File is too large. Please upload an image smaller than 10MB.', 400);
  }

  const url = useTest ? N8N_TEST_WEBHOOK_URL : N8N_WEBHOOK_URL;
  if (!url) {
    throw new ApiError('Webhook URL is not configured.', 500);
  }

  const performRequest = async () => {
    try {
      console.log(`[API] Calling Image Webhook (PDF Mode): ${url}`);
      
      const formData = new FormData();
      formData.append('type', 'image');
      formData.append('image', imageFile);

      const response = await axios.post(url, formData, {
        responseType: 'blob', // IMPORTANT: We are now receiving a PDF file!
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/pdf, application/json'
        },
        timeout: 120000,
      });
      
      return response.data;
    } catch (error) {
       handleApiError(error, 'solveMathImage');
    }
  };

  return withRetry(performRequest, 1); // 1 retry for reliability
}
