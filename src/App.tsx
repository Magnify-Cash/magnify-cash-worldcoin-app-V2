
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { NavigationProvider } from "./contexts/NavigationContext";
import Welcome from "@/pages/Welcome";
import Guide from "@/pages/Guide";
import LenderGuide from "@/pages/LenderGuide";
import Profile from "@/pages/Profile";
import Wallet from "@/pages/Wallet";
import Loan from "@/pages/Loan";
import RepayLoan from "@/pages/RepayLoan";
import Announcements from "@/pages/Announcements";
import LoanHistory from "@/pages/LoanHistory";
import Lending from "@/pages/Lending";
import PoolDetails from "@/pages/PoolDetails";
import Portfolio from "@/pages/Portfolio";
import LendingHistory from "@/pages/LendingHistory";
import Calculator from "@/pages/Calculator";
import ProtectedRoute from "@/pages/ProtectedPage";
import MetamaskRestrictedRoute from "@/components/MetamaskRestrictedRoute";
import NotFound from "@/pages/NotFound";
import "./App.css";
import eruda from "eruda";
import { MiniKitProvider } from "./providers/MiniKitProvider";
import { USDCBalanceProvider } from "./providers/USDCBalanceProvider";
import { Toaster } from "@/components/ui/toaster";
import ScrollToTop from "@/components/ScrollToTop";
import { ModalManager } from "./components/ModalManager";
import { ModalProvider } from "./contexts/ModalContext";
import { PoolDataProvider } from "./contexts/PoolDataContext";
import { BACKEND_URL } from "./utils/constants";
import { toast } from "./components/ui/use-toast";

const allowedWallets = [
  "0x2f79325b76cd2109cd9cf5320b6d23d7f682d65c",
  "0x7af5e0de231d82def3bc262b1d5b3359495a4bfb",
  "0xf0c7db5acea62029058b0e4e0b79f2bac18686c4",
  "0x6a7ec268afb31dab2b0ad39511af9db7c11944a1",
  "0x002b4cf93cd314dfaf115c3e4b6b9e514be6ad9b",
];

// Hard-coded to developer's wallet address
const ls_wallet = localStorage.getItem("ls_wallet_address");
if (allowedWallets.includes(ls_wallet)) {
  eruda.init();
}

// Check if backend URL is properly configured
if (!BACKEND_URL) {
  console.error("BACKEND_URL is not defined. Check your environment variables.");
  // We'll show a toast when the app loads to alert about this
}

function App() {
  // Show a toast if backend URL is missing
  useEffect(() => {
    if (!BACKEND_URL) {
      toast({
        title: "Backend configuration error",
        description: "Backend URL is not properly configured. Some features may not work correctly.",
        variant: "destructive",
        duration: 10000,
      });
    }
  }, []);

  return (
    <MiniKitProvider>
      <USDCBalanceProvider>
        <ModalProvider>
          <PoolDataProvider>
            <NavigationProvider>
              <Toaster />
              <Router>
                <ScrollToTop />
                <Routes>
                  <Route
                    path="/"
                    element={<Navigate to="/welcome" replace />}
                  />
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/lending" element={<Lending />} />
                  <Route path="/pool/:contract" element={<PoolDetails />} />
                  {/* Legacy route support */}
                  <Route path="/pool/id/:id" element={<PoolDetails />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/lending-history" element={<LendingHistory />} />
                  <Route path="/calculator" element={<Calculator />} />
                  <Route path="/lender-guide" element={<LenderGuide />} />

                  {/* MiniApp-only routes */}
                  <Route
                    path="/announcements"
                    element={
                      <MetamaskRestrictedRoute>
                        <Announcements />
                      </MetamaskRestrictedRoute>
                    }
                  />
                  <Route
                    path="/guide"
                    element={
                      <MetamaskRestrictedRoute>
                        <Guide />
                      </MetamaskRestrictedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <MetamaskRestrictedRoute>
                        <Profile />
                      </MetamaskRestrictedRoute>
                    }
                  />
                  <Route
                    path="/wallet"
                    element={
                      <MetamaskRestrictedRoute>
                        <Wallet />
                      </MetamaskRestrictedRoute>
                    }
                  />
                  <Route
                    path="/loan"
                    element={
                      <MetamaskRestrictedRoute>
                        <Loan />
                      </MetamaskRestrictedRoute>
                    }
                  />
                  <Route
                    path="/repay-loan"
                    element={
                      <MetamaskRestrictedRoute>
                        <RepayLoan />
                      </MetamaskRestrictedRoute>
                    }
                  />
                  <Route
                    path="/loan-history"
                    element={
                      <MetamaskRestrictedRoute>
                        <LoanHistory />
                      </MetamaskRestrictedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
              <ModalManager />
            </NavigationProvider>
          </PoolDataProvider>
        </ModalProvider>
      </USDCBalanceProvider>
    </MiniKitProvider>
  );
}

export default App;
