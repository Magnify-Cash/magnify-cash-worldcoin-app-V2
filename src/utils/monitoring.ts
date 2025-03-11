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

    eruda.init();

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
