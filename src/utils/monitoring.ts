import * as Sentry from "@sentry/react";
import eruda from "eruda";

// Initialize Sentry
export const initializeMonitoring = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [],
      tracesSampleRate: 1.0,
      environment: import.meta.env.MODE,
    });
  }

  const allowedWallets = [
    "0x2f79325b76cd2109cd9cf5320b6d23d7f682d65c", // Kevin
    // "0x7af5e0de231d82def3bc262b1d5b3359495a4bfb", // Jay
    "0xf0c7db5acea62029058b0e4e0b79f2bac18686c4" // Daniel
  ];

  // Hard-coded to developer's wallet address
  const ls_wallet = localStorage.getItem("ls_wallet_address");
  if (allowedWallets.includes(ls_wallet)) {
    eruda.init();
  }
};

// Custom logger with different log levels
export const logger = {
  info: (message: string, data?: any) => {
    console.info(`[INFO] ${message}`, data || "");
    if (import.meta.env.PROD) {
      Sentry.addBreadcrumb({
        category: "info",
        message,
        data,
        level: "info",
      });
    }
  },
  error: (error: Error, context?: any) => {
    console.error(`[ERROR] ${error.message}`, context || "");
    if (import.meta.env.PROD) {
      Sentry.captureException(error, {
        extra: context,
      });
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || "");
    if (import.meta.env.PROD) {
      Sentry.addBreadcrumb({
        category: "warning",
        message,
        data,
        level: "warning",
      });
    }
  },
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => any) => {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  logger.info(`Performance: ${name}`, { duration: `${duration}ms` });
  return result;
};

// Error boundary component
export const ErrorBoundary = Sentry.ErrorBoundary;
