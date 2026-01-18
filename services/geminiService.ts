import { AnalysisResult } from "../types";

export const analyzePage = async (imageUri: string): Promise<AnalysisResult> => {
  // Check if API key is available and not disabled
  if (!import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY === 'disabled') {
    throw new Error("AI features are not available in this version. Please visit https://pdfslicendice.sjdev.pl for the full app.");
  }
  
  // Get backend URL from environment variable or use default
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  
  try {
    const response = await fetch(`${backendUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: imageUri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to analyze image: Server error ${response.status}`
      );
    }

    const result = await response.json();
    return result as AnalysisResult;
  } catch (error) {
    console.error('Failed to analyze page:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to analyze page. Please ensure the backend service is running.'
    );
  }
};
