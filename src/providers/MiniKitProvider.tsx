import { ReactNode, useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { WORLDCOIN_CLIENT_ID } from "@/utils/constants";

export const MiniKitProvider = ({ children }: { children: ReactNode }) => {
  const initializeMiniKit = () => {
    try {
      console.log("Initializing MiniKit...");
      MiniKit.install(WORLDCOIN_CLIENT_ID);
      console.log("MiniKit initialized successfully");
    } catch (error) {
      console.error("Failed to initialize MiniKit:", error);
    }
  };
  useEffect(() => {
    initializeMiniKit();
  }, []);
  return <>{children}</>;
};
