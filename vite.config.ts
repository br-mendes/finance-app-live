import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // O código do app referencia process.env.* diretamente (padrão AI Studio).
  // No browser `process` não existe, então cada chave precisa ser substituída
  // estaticamente no build — sem isso o app quebra com tela branca.
  const define = Object.fromEntries(
    [
      'API_KEY',
      'GEMINI_API_KEY',
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_PAYPAL_CLIENT_ID',
      'VITE_PAYPAL_SECRET_KEY',
      'VITE_PAYPAL_ENVIRONMENT',
      'VITE_PAYPAL_SANDBOX_URL',
      'VITE_MERCADO_PAGO_ACCESS_TOKEN',
      'VITE_SENDGRID_API_KEY',
      'VITE_MAILERLITE_API_KEY',
    ].map((key) => [`process.env.${key}`, JSON.stringify(env[key] ?? '')])
  );

  // API_KEY herda de GEMINI_API_KEY quando só esta estiver configurada
  if (!env.API_KEY && env.GEMINI_API_KEY) {
    define['process.env.API_KEY'] = JSON.stringify(env.GEMINI_API_KEY);
  }

  return {
    plugins: [react()],
    define,
    build: {
      outDir: 'dist',
    },
  };
});
