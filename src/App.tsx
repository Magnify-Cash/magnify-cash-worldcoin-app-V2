
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "@/pages/Welcome";
import Guide from "@/pages/Guide";
import Profile from "@/pages/Profile";
import Wallet from "@/pages/Wallet";
import Loan from "@/pages/Loan";
import RepayLoan from "@/pages/RepayLoan";
import Announcements from "@/pages/Announcements";
import LoanHistory from "@/pages/LoanHistory";
import ProtectedRoute from "@/pages/ProtectedPage";
import NotFound from "@/pages/NotFound";
import "./App.css";
import eruda from "eruda";
import { USDCBalanceProvider } from "./providers/USDCBalanceProvider";
import { DemoDataProvider } from "./providers/DemoDataProvider";
import { Toaster } from "@/components/ui/toaster";
import ScrollToTop from "@/components/ScrollToTop";

//eruda.init();

function App() {
  return (
      <USDCBalanceProvider>
      <Toaster />
      <Router>
      <ScrollToTop />
        <Routes>
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/announcements" element={<Announcements />} />
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
      </USDCBalanceProvider>
  );
}

export default App;
