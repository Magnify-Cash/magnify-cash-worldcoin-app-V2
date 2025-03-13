import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Always set a mock wallet address in localStorage to ensure any dependent code works
  if (!localStorage.getItem("ls_wallet_address")) {
    localStorage.setItem("ls_wallet_address", "0xMockWalletAddress123456789");
  }
  
  // Always return children instead of checking for authorization
  return children;
};

export default ProtectedRoute;
