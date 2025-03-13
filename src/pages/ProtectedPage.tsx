
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { initializeMockUserData } from "@/utils/mockUserData";

// Check if demo mode is enabled via environment variable
const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, ensure mock data is initialized
      initializeMockUserData();
    }
  }, []);

  // Check for authorization
  const isAuthorized = localStorage.getItem("ls_wallet_address");
  
  if (!isAuthorized) {
    return <Navigate to="/welcome" replace />;
  }
  
  // User is authorized, return children
  return <>{children}</>;
};

export default ProtectedRoute;
