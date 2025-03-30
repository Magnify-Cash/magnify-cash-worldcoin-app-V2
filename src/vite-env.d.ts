
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

// Add declaration for the Extended Wallet Auth Payload
declare module "@worldcoin/minikit-js" {
  interface MiniAppWalletAuthPayload {
    address?: string;
  }
  
  // Add default export for compatibility with existing code
  export default interface MiniKit {
    install(clientId: string): void;
    commandsAsync: {
      walletAuth(options: any): Promise<any>;
      sendTransaction(options: any): Promise<any>;
      requestPermission(options: any): Promise<any>;
    };
    getUserByAddress(address: string): Promise<any>;
    isInstalled(): boolean;
  }
}
