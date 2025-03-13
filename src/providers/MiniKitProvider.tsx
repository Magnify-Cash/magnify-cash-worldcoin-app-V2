
import { ReactNode, useEffect } from "react";
// Comment out actual MiniKit import
// import { MiniKit } from "@worldcoin/minikit-js";
import { WORLDCOIN_CLIENT_ID } from "@/utils/constants";

// Type definitions for global MiniKit object
declare global {
  interface Window {
    miniKit?: {
      isAuthenticated: () => boolean;
      authenticate: (callback?: (result: { success: boolean }) => void) => Promise<{ success: boolean }>;
      getWalletAddress: () => string;
      commandsAsync: {
        verify: (payload: any) => Promise<{ 
          finalPayload: { 
            status: string; 
            message: string;
            error_code?: string;
          } 
        }>;
        walletAuth: (payload: any) => Promise<{
          finalPayload: {
            address: string;
            signature: string;
          }
        }>;
      };
      isInstalled: () => boolean;
      getUserByAddress: (address: string) => Promise<{
        walletAddress: string;
        username: string;
      }>;
    };
  }
}

// Check if demo mode is enabled via environment variable
const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

// Only import MiniKit if not in demo mode
let MiniKit: any;
if (!isDemoMode) {
  try {
    // Dynamic import to avoid errors in demo mode
    MiniKit = require("@worldcoin/minikit-js").MiniKit;
  } catch (error) {
    console.error("Failed to import MiniKit:", error);
  }
}

export const MiniKitProvider = ({ children }: { children: ReactNode }) => {
  const initializeMiniKit = () => {
    try {
      if (isDemoMode) {
        console.log("Mock MiniKit initialized successfully");
        // Create a mock global object if needed by other components
        window.miniKit = {
          // Add mock methods that might be called elsewhere in the code
          isAuthenticated: () => true,
          authenticate: (callback) => {
            if (callback && typeof callback === 'function') {
              callback({ success: true });
            }
            return Promise.resolve({ success: true });
          },
          getWalletAddress: () => "0xMockWalletAddress123456789",
          commandsAsync: {
            verify: (payload) => Promise.resolve({ 
              finalPayload: { 
                status: "success", 
                message: "Demo verification successful" 
              } 
            }),
            walletAuth: (payload) => Promise.resolve({
              finalPayload: {
                address: "0xMockWalletAddress123456789",
                signature: "0xMockSignature123456789"
              }
            }),
          },
          isInstalled: () => true,
          getUserByAddress: (address) => Promise.resolve({
            walletAddress: address,
            username: "DemoUser"
          }),
        };
      } else {
        // Initialize real MiniKit in non-demo mode
        console.log("Initializing real MiniKit...");
        if (MiniKit) {
          MiniKit.install(WORLDCOIN_CLIENT_ID);
          console.log("MiniKit initialized successfully");
        } else {
          console.error("MiniKit not available");
        }
      }
    } catch (error) {
      console.error("Failed to initialize MiniKit:", error);
    }
  };
  
  useEffect(() => {
    initializeMiniKit();
  }, []);
  
  return <>{children}</>;
};
