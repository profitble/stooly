console.log('[BOOT] FILE LOADED: utils/env.ts');
import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: z.string().min(1),
});

export const validateAndGetEnv = () => {
  console.log('[ENV] Validating environment variables...');
  
  // Log each environment variable (with redaction)
  console.log('[ENV] EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL ? `${process.env.EXPO_PUBLIC_API_BASE_URL.substring(0, 20)}...` : 'undefined');
  console.log('[ENV] EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? `${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'undefined');
  console.log('[ENV] EXPO_PUBLIC_REVENUECAT_API_KEY_IOS:', process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ? `${process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS.substring(0, 20)}...` : 'undefined');
  
  const result = envSchema.safeParse(process.env);
  if (result.success) {
    console.log('[ENV] Environment validation passed');
    return result.data;
  }
  
  console.log('[ENV] [ERROR] Environment validation failed:', result.error.errors.map(e => e.message).join(', '));
  throw new Error(`Environment validation failed: ${result.error.errors.map(e => e.message).join(', ')}`);
}; 