console.log('[FILE LOADED: env.ts]');
import { z } from 'zod';
console.log('[ENV_IMPORT] zod imported');

console.log('[ENV_SCHEMA] Creating environment schema');
const envSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: z.string().min(1),
});
console.log('[ENV_SCHEMA] Environment schema created');

export const validateAndGetEnv = () => {
  console.log('[ENV_VALIDATE] validateAndGetEnv called');
  console.log('[ENV_VALIDATE] process.env type:', typeof process.env);
  console.log('[ENV_VALIDATE] Available env keys:', Object.keys(process.env).filter(key => key.startsWith('EXPO_PUBLIC')));
  
  const result = envSchema.safeParse(process.env);
  console.log('[ENV_VALIDATE] Schema validation success:', result.success);
  
  if (result.success) {
    console.log('[ENV_VALIDATE] Validation successful, returning parsed data');
    return result.data;
  }
  
  console.error('[ENV_VALIDATE] Validation failed:', result.error.errors);
  const errorMessage = `Environment validation failed: ${result.error.errors.map(e => e.message).join(', ')}`;
  console.error('[ENV_VALIDATE] Throwing error:', errorMessage);
  throw new Error(errorMessage);
}; 