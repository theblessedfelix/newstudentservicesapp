/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_TEMP_VOLUNTEER_ID?: string;
  readonly VITE_TEMP_VOLUNTEER_PASSWORD?: string;
  readonly VITE_TEMP_ADMIN_ID?: string;
  readonly VITE_TEMP_ADMIN_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}