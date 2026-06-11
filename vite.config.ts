import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// O código do app referencia process.env.* diretamente (padrão AI Studio).
// No browser `process` não existe, então cada chave precisa ser substituída
// estaticamente no build — sem isso o app quebra com tela branca.

// Apenas configuração pública pode ser injetada no bundle (qualquer valor
// aqui fica legível no JS entregue ao usuário).
const PUBLIC_KEYS = [
  'GEMINI_API_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_PAYPAL_CLIENT_ID',
  'VITE_PAYPAL_ENVIRONMENT',
  'VITE_PAYPAL_SANDBOX_URL',
];

// Segredos de servidor referenciados por código legado do client. São sempre
// substituídos por '' para o bundle nunca conter credenciais — os serviços
// que os usam degradam graciosamente (no-op/fallback). Chamadas que precisam
// dessas chaves devem migrar para endpoints server-side (ex.: api/ na Vercel).
const SERVER_ONLY_KEYS = [
  'VITE_PAYPAL_SECRET_KEY',
  'VITE_MERCADO_PAGO_ACCESS_TOKEN',
  'VITE_SENDGRID_API_KEY',
  'VITE_MAILERLITE_API_KEY',
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const define: Record<string, string> = {};

  for (const key of PUBLIC_KEYS) {
    if (!env[key]) {
      // constants.ts possui fallbacks funcionais para as chaves críticas,
      // então a ausência gera aviso (e não erro) para não quebrar o build.
      console.warn(`[vite.config] variável ${key} não definida — usando fallback do código.`);
    }
    define[`process.env.${key}`] = JSON.stringify(env[key] ?? '');
  }

  // API_KEY (Gemini) herda de GEMINI_API_KEY, convenção do AI Studio
  define['process.env.API_KEY'] = JSON.stringify(env.API_KEY || env.GEMINI_API_KEY || '');

  for (const key of SERVER_ONLY_KEYS) {
    define[`process.env.${key}`] = JSON.stringify('');
  }

  return {
    plugins: [react()],
    define,
    build: {
      outDir: 'dist',
    },
  };
});
