import { env } from '@/utils/env';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = env.EXPO_PUBLIC_API_BASE_URL;
const supabaseAnonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AnalysisResult {
  appearance: string;
  color: string;
  health_score: number;
  analysis: string;
  recommendations: string[];
}

// --- Test Data Generation ---
const appearances = ["solid", "soft", "loose", "mushy", "pebbly", "squishy", "hard"];
const colors = ["brown", "green", "yellow"];

function getRandomAnalysis(): AnalysisResult {
  return {
    appearance: appearances[Math.floor(Math.random() * appearances.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    health_score: Math.floor(Math.random() * 60) + 40, // Score between 40 and 100
    analysis: "This is a simulated analysis for testing purposes.",
    recommendations: ["This is a test recommendation.", "Drink more water (always good advice)."],
  };
}
// --------------------------

export interface AnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

// Function to call the Supabase Edge Function
export async function analyzeImage(base64Data: string): Promise<{ success: boolean, data?: AnalysisResult, error?: string }> {
  // --- Return random data instead of calling Supabase ---
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true, data: getRandomAnalysis() });
    }, 1500); // Simulate network delay
  });
  // ----------------------------------------------------

  /* Original implementation:
  try {
    const { data, error } = await supabase.functions.invoke('analysis', {
      body: { image: base64Data },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.error) {
      return { success: false, error: data.error };
    }
    
    return { success: true, data: data as AnalysisResult };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
  */
} 