import { Navigate } from "react-router-dom";

// Check if demo mode is enabled via environment variable
const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

const ProtectedRoute = ({ children }) => {
  if (isDemoMode) {
    // In demo mode, always set a mock wallet address and allow access
    if (!localStorage.getItem("ls_wallet_address")) {
      localStorage.setItem("ls_wallet_address", "0xMockWalletAddress123456789");
    }
    return children;
  } else {
    // In normal mode, check for authorization
    const isAuthorized = localStorage.getItem("ls_wallet_address");
    if (!isAuthorized) {
      return <Navigate to="/" replace />;
    }
    return children;
  }
};

export default ProtectedRoute;
