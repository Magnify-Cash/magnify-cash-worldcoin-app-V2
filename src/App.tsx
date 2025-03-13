
import { useEffect } from "react";
import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "./App.css";
import { ThemeProvider } from "./providers/ThemeProvider";
import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerToaster } from "./components/ui/sonner";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Wallet from "./pages/Wallet";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./pages/ProtectedPage";
import { MiniKitProvider } from "./providers/MiniKitProvider";
import { DemoDataProvider } from "./providers/DemoDataProvider";
import Loan from "./pages/Loan";
import LoanHistory from "./pages/LoanHistory";
import RepayLoan from "./pages/RepayLoan";
import UpgradeVerification from "./pages/UpgradeVerification";
import Guide from "./pages/Guide";
import WalletProvider from "./providers/WalletProvider";
import Announcements from "./pages/Announcements";
import Profile from "./pages/Profile";
import DemoBanner from "./components/DemoBanner";
import { initializeMockUserData } from "./utils/mockUserData";

// Create a query client for react-query
const queryClient = new QueryClient();

// Check if demo mode is enabled via environment variable
const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

const routes = [
  {
    path: "/",
    element: <Navigate to="/welcome" replace />,
  },
  {
    path: "/welcome",
    element: <Welcome />,
  },
  {
    path: "/wallet",
    element: (
      <ProtectedRoute>
        <Wallet />
      </ProtectedRoute>
    ),
  },
  {
    path: "/loan",
    element: (
      <ProtectedRoute>
        <Loan />
      </ProtectedRoute>
    ),
  },
  {
    path: "/loan-history",
    element: (
      <ProtectedRoute>
        <LoanHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/repay",
    element: (
      <ProtectedRoute>
        <RepayLoan />
      </ProtectedRoute>
    ),
  },
  {
    path: "/upgrade-verification",
    element: (
      <ProtectedRoute>
        <UpgradeVerification />
      </ProtectedRoute>
    ),
  },
  {
    path: "/guide",
    element: (
      <ProtectedRoute>
        <Guide />
      </ProtectedRoute>
    ),
  },
  {
    path: "/announcements",
    element: (
      <ProtectedRoute>
        <Announcements />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

const router = createBrowserRouter(routes);

function App() {
  useEffect(() => {
    // Initialize mock user data when in demo mode
    if (isDemoMode) {
      initializeMockUserData();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <DemoDataProvider>
        <MiniKitProvider>
          <ThemeProvider>
            <WalletProvider>
              <RouterProvider router={router} />
              <Toaster />
              <SonnerToaster position="bottom-right" />
              {isDemoMode && <DemoBanner />}
            </WalletProvider>
          </ThemeProvider>
        </MiniKitProvider>
      </DemoDataProvider>
    </QueryClientProvider>
  );
}

export default App;
