
import { ReactNode, useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { WORLDCOIN_CLIENT_ID } from "@/utils/constants";
import * as Sentry from "@sentry/react";

export const MiniKitProvider = ({ children }: { children: ReactNode }) => {
  const initializeMiniKit = () => {
    try {
      console.log("[MiniKit] Initializing with client ID:", WORLDCOIN_CLIENT_ID || "undefined");
      Sentry.addBreadcrumb({
        category: 'minikit',
        message: `Initializing MiniKit with client ID: ${WORLDCOIN_CLIENT_ID || "undefined"}`,
        level: 'info'
      });
      
      MiniKit.install(WORLDCOIN_CLIENT_ID);
      
      console.log("[MiniKit] Initialization successful:", MiniKit.isInstalled());
      Sentry.addBreadcrumb({
        category: 'minikit',
        message: `MiniKit initialized successfully: ${MiniKit.isInstalled()}`,
        level: 'info'
      });
    } catch (error) {
      console.error("[MiniKit] Failed to initialize:", error);
      Sentry.captureException(error, {
        tags: {
          component: "MiniKitProvider",
          function: "initializeMiniKit"
        },
        extra: {
          clientId: WORLDCOIN_CLIENT_ID || "undefined"
        }
      });
    }
  };
  
  useEffect(() => {
    initializeMiniKit();
  }, []);
  
  return <>{children}</>;
};
