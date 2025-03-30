
import { ReactNode, useEffect } from "react";
import * as MinikitJS from "@worldcoin/minikit-js";
import { WORLDCOIN_CLIENT_ID } from "@/utils/constants";

// Create an alias to MiniKit for compatibility with existing code
const MiniKit = MinikitJS.default;

export const MiniKitProvider = ({ children }: { children: ReactNode }) => {
  const initializeMiniKit = () => {
    try {
      MiniKit.install(WORLDCOIN_CLIENT_ID);
    } catch (error) {
      console.error("Failed to initialize MiniKit:", error);
    }
  };
  useEffect(() => {
    initializeMiniKit();
  }, []);
  return <>{children}</>;
};
