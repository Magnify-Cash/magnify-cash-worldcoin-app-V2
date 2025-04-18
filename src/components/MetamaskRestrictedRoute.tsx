
import { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface MetamaskRestrictedRouteProps {
  children: ReactNode;
}

const MetamaskRestrictedRoute = ({ children }: MetamaskRestrictedRouteProps) => {
  const { toast } = useToast();
  const isAuthenticated = localStorage.getItem("ls_wallet_address");
  const isMetamaskUser = localStorage.getItem("ls_metamask_user") === "true";

  useEffect(() => {
    if (isMetamaskUser) {
      toast({
        title: "Access Restricted",
        description: "This feature is only available in the World App MiniApp",
        variant: "destructive",
      });
    }
  }, [isMetamaskUser, toast]);

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  if (isMetamaskUser) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
};

export default MetamaskRestrictedRoute;
