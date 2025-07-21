import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: z.string().min(1),
});

export const validateAndGetEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (result.success) {
    return result.data;
  }
  throw new Error(`Environment validation failed: ${result.error.errors.map(e => e.message).join(', ')}`);
}; 