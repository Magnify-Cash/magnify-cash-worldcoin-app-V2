import { ReactNode, useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { WORLDCOIN_CLIENT_ID } from "@/utils/constants";

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
