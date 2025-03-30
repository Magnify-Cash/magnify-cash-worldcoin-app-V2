
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORLDCOIN_CLIENT_ID: string;
  readonly VITE_BACKEND_URL: string;
  readonly VITE_ENVIRONMENT: string;
  readonly VITE_MAGNIFY_WORLD_ADDRESS: string;
  readonly VITE_SENTRY_DSN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
