
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "@/pages/Welcome";
import Guide from "@/pages/Guide";
import Profile from "@/pages/Profile";
import Wallet from "@/pages/Wallet";
import Loan from "@/pages/Loan";
import RepayLoan from "@/pages/RepayLoan";
import UpgradeVerification from "@/pages/UpgradeVerification";
import Announcements from "@/pages/Announcements";
import ProtectedRoute from "@/pages/ProtectedPage";
import "./App.css";
import eruda from "eruda";
import { MiniKitProvider } from "./providers/MiniKitProvider";

eruda.init();

function App() {
  return (
    <MiniKitProvider>
      <Router>
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
            path="/upgrade-verification"
            element={
              <ProtectedRoute>
                <UpgradeVerification />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </MiniKitProvider>
  );
}

export default App;
