
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "@/pages/Welcome";
import Guide from "@/pages/Guide";
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

const allowedWallets = [
  "0x2f79325b76cd2109cd9cf5320b6d23d7f682d65c",
  "0x7af5e0de231d82def3bc262b1d5b3359495a4bfb",
  "0xf0c7db5acea62029058b0e4e0b79f2bac18686c4",
  "0x6a7ec268afb31dab2b0ad39511af9db7c11944a1"
];

// Hard-coded to developer's wallet address
const ls_wallet = localStorage.getItem("ls_wallet_address");
if (allowedWallets.includes(ls_wallet)) {
  eruda.init();
}

eruda.init();

function App() {
  return (
    <MiniKitProvider>
      <USDCBalanceProvider>
        <ModalProvider>
          <PoolDataProvider>
            <Toaster />
            <Router>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Navigate to="/welcome" replace />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/lending" element={<Lending />} />
                <Route path="/pool/:id" element={<PoolDetails />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/lending-history" element={<LendingHistory />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route
                  path="/guide"
                  element={
                    <ProtectedRoute>
                      <Guide />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wallet"
                  element={
                    <ProtectedRoute>
                      <Wallet />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/loan"
                  element={
                    <ProtectedRoute>
                      <Loan />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/repay-loan"
                  element={
                    <ProtectedRoute>
                      <RepayLoan />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/loan-history"
                  element={
                    <ProtectedRoute>
                      <LoanHistory />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <ModalManager />
          </PoolDataProvider>
        </ModalProvider>
      </USDCBalanceProvider>
    </MiniKitProvider>
  );
}

export default App;
