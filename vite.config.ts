import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// O código do app referencia process.env.* diretamente (padrão AI Studio).
// No browser `process` não existe, então cada chave precisa ser substituída
// estaticamente no build — sem isso o app quebra com tela branca.
//
// Apenas configuração pública entra aqui (qualquer valor fica legível no JS
// entregue ao usuário). Segredos (PayPal secret, Mercado Pago, SendGrid,
// MailerLite, Gemini) vivem somente nos endpoints serverless em api/.
const PUBLIC_KEYS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_PAYPAL_CLIENT_ID',
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const define: Record<string, string> = {};

  for (const key of PUBLIC_KEYS) {
    if (!env[key]) {
      // constants.ts possui fallbacks funcionais para estas chaves, então a
      // ausência gera aviso (e não erro) para não quebrar o build.
      console.warn(`[vite.config] variável ${key} não definida — usando fallback do código.`);
    }
    define[`process.env.${key}`] = JSON.stringify(env[key] ?? '');
  }

  return {
    plugins: [react()],
    define,
    build: {
      outDir: 'dist',
    },
  };
});
