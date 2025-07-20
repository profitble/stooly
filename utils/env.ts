import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: z.string().min(1),
});

const parseEnvironment = () => {
  // For Expo SDK 52+, use process.env directly for EXPO_PUBLIC_ variables
  const envVars = process.env;
  
  try {
    return envSchema.parse(envVars);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Environment validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};

export const env = parseEnvironment();

// Export individual variables for convenience
export const API_BASE_URL = env.EXPO_PUBLIC_API_BASE_URL;
export const SUPABASE_ANON_KEY = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const REVENUECAT_API_KEY_IOS = env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS; 