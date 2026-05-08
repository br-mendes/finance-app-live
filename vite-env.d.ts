/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_PAYPAL_CLIENT_ID: string;
  readonly VITE_PAYPAL_SECRET_KEY: string;
  readonly VITE_PAYPAL_ENVIRONMENT: string;
  readonly VITE_PAYPAL_SANDBOX_URL: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_MERCADO_PAGO_ACCESS_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
