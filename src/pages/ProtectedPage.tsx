
import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useDemoData } from "@/providers/DemoDataProvider";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isConnected } = useDemoData();

  if (!isConnected) {
    return <Navigate to="/welcome" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
