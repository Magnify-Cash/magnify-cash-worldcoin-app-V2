
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";
import { ENVIRONMENT } from "@/utils/constants";

// Configure Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: ENVIRONMENT || "development",
  integrations: [ 
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0, // Capture 100% of transactions
  replaysSessionSampleRate: 0.1, // Record 10% of sessions
  replaysOnErrorSampleRate: 1.0, // Always record a replay on error
  
  // Enhanced debug capabilities
  debug: ENVIRONMENT === "development",
  
  // More detailed breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    return breadcrumb;
  },
  
  beforeSend(event) {
    // Filter out expected errors to reduce noise
    if (
      event.exception?.values?.some((e) => e.value?.includes("MiniKit is not installed")) 
      || event.exception?.values?.some((e) => e.value?.includes("MiniKit.install"))
      || event.exception?.values?.some((e) => e.value?.includes("This could be due to syntax errors or importing non-existent modules"))) {
      return null; // Prevent this error from being sent to Sentry
    }
    
    // Log event for debugging
    if (ENVIRONMENT === "development") {
      console.log("[Sentry] Sending event:", event);
    }
    
    return event;
  }
});

// Enhanced error formatting with more context
const formatError = (message: string | Error) => {
  const env = ENVIRONMENT || "unknown";
  const path = window.location.pathname;
  const timestamp = new Date().toISOString();
  const walletAddress = localStorage.getItem("ls_wallet_address") || "unknown_wallet";
  
  return `[${timestamp}][${env}:${path}][wallet:${walletAddress}] ${message instanceof Error ? message.stack || message.message : message}`;
};

// Enhanced console error capture
const originalConsoleError = console.error;
console.error = (...args: unknown[]): void => {
  const formattedMessage = formatError(args.join(" "));
  Sentry.captureException(new Error(formattedMessage));
  originalConsoleError(...args);
};

// Enhanced global error handlers
window.onerror = (message, source, lineno, colno, error) => {
  const formattedMessage = formatError(error || (message as string));
  console.log("[Global Error]", formattedMessage, { source, lineno, colno });
  Sentry.captureException(new Error(formattedMessage));
};

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
  const formattedMessage = formatError(event.reason);
  console.log("[Unhandled Rejection]", formattedMessage);
  Sentry.captureException(new Error(formattedMessage));
};

// Configure Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Cache API responses for 5 minutes
      retry: 1, // Retry failed queries once
      onError: (error) => {
        console.error("[Query Error]", error);
        Sentry.captureException(error, {
          tags: {
            source: "react-query"
          }
        });
      }
    },
  },
});

// Setup user identification for Sentry
const walletAddress = localStorage.getItem("ls_wallet_address") || "unknown_wallet";
const userName = localStorage.getItem("ls_username") || "anonymous";

Sentry.setUser({
  id: walletAddress,
  username: userName,
  wallet: walletAddress,
});

// App component with Sentry error boundary
const AppWithSentry = () => (
  <Sentry.ErrorBoundary 
    fallback={<h2>Something went wrong</h2>}
    onError={(error) => {
      console.error("[ErrorBoundary]", error);
    }}
  >
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </Sentry.ErrorBoundary>
);

createRoot(document.getElementById("root")!).render(<AppWithSentry />);
