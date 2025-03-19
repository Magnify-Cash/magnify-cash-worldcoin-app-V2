import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";
import { ENVIRONMENT } from "@/utils/constants";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: ENVIRONMENT || "development",
  integrations: [ Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0, // Capture 100% of transactions (adjust as needed)
  replaysSessionSampleRate: 0.1, // Record 10% of sessions
  replaysOnErrorSampleRate: 1.0, // Always record a replay on error
  beforeSend(event) {
    if (event.exception?.values?.some((e) => e.value?.includes("MiniKit is not installed")) || event.exception?.values?.some((e) => e.value?.includes("MiniKit.install"))) {
      return null; // Prevent this error from being sent to Sentry
    }
    return event;
  }
});

const formatError = (message: string | Error) => {
  const env = ENVIRONMENT || "unknown";
  const path = window.location.pathname;
  return `[${env}${path}] ${message instanceof Error ? message.stack || message.message : message}`;
};

const originalConsoleError = console.error;
console.error = (...args: unknown[]): void => {
  const formattedMessage = formatError(args.join(" "));
  Sentry.captureException(new Error(formattedMessage));
  originalConsoleError(...args);
};

window.onerror = (message, source, lineno, colno, error) => {
  const formattedMessage = formatError(error || (message as string));
  Sentry.captureException(new Error(formattedMessage));
};

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
  const formattedMessage = formatError(event.reason);
  Sentry.captureException(new Error(formattedMessage));
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Cache API responses for 5 minutes
      retry: 1, // Retry failed queries once
    },
  },
});

const walletAddress = localStorage.getItem("ls_wallet_address") || "unknown_wallet";
const userName = localStorage.getItem("ls_username") || "anonymous";

Sentry.setUser({
  id: walletAddress,
  username: userName,
  wallet: walletAddress,
});

Sentry.replayIntegration({
  maskAllText: false,
  blockAllMedia: false,
});


const AppWithSentry = () => (
  <Sentry.ErrorBoundary fallback={<h2>Something went wrong</h2>}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </Sentry.ErrorBoundary>
);

createRoot(document.getElementById("root")!).render(<AppWithSentry />);