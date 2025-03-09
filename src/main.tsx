import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";
import * as Sentry from "@sentry/react";
import { ENVIRONMENT } from "@/utils/constants"

Sentry.init({
  dsn: "https://9a7429f41e52235e6710247e408767a1@o4508925291069440.ingest.us.sentry.io/4508925295788032",
  integrations: [],
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
  const formattedMessage = formatError(error || message as string);
  Sentry.captureException(new Error(formattedMessage));
};

interface OnUnhandledRejectionEvent extends PromiseRejectionEvent {
  reason: any;
}

window.onunhandledrejection = (event: OnUnhandledRejectionEvent) => {
  const formattedMessage = formatError(event.reason);
  Sentry.captureException(new Error(formattedMessage));
};

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Wrap App in Sentry.ErrorBoundary
createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={<h2>Something went wrong</h2>}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </Sentry.ErrorBoundary>
);
