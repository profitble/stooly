import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: z.string().min(1),
});

export const validateAndGetEnv = () => {
  const env = {
    EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
  };

  if (__DEV__) {
    const result = envSchema.safeParse(env);
    if (!result.success) {
      const errorMessage = `Environment validation failed: ${result.error.errors.map(e => e.message).join(', ')}`;
      throw new Error(errorMessage);
    }
  }
  
  return env;
}; 