/**
 * API Client for Veil Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PredictionRequest {
  email_text: string;
}

export interface PredictionResponse {
  prediction: 'Safe' | 'Spam' | 'Phishing';
  confidence: number;
  message: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  message: string;
}

/**
 * Predict if an email is spam or safe
 */
export async function predictEmail(emailText: string): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email_text: emailText }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to get prediction');
  }

  return response.json();
}

/**
 * Check backend health status
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  
  if (!response.ok) {
    throw new Error('Backend is not responding');
  }

  return response.json();
}
