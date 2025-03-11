
import { createContext, useContext } from "react";
import { useDemoUSDCBalance } from "@/hooks/useDemoMagnifyWorld";

type USDCBalanceContextType = {
  usdcBalance: number | null;
  hasMoreThanOne: boolean | null;
  loading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
};

const USDCBalanceContext = createContext<USDCBalanceContextType | undefined>(undefined);

// Provider Component that now uses the demo data
export const USDCBalanceProvider = ({ children }: { children: React.ReactNode }) => {
  // Use the demo hook implementation
  const demoBalance = useDemoUSDCBalance();
  
  // Convert the refresh function to match the original interface
  const refreshBalance = async () => {
    demoBalance.refreshBalance();
  };
  
  return (
    <USDCBalanceContext.Provider value={{ 
      usdcBalance: demoBalance.usdcBalance,
      hasMoreThanOne: demoBalance.hasMoreThanOne,
      loading: demoBalance.loading,
      error: demoBalance.error,
      refreshBalance
    }}>
      {children}
    </USDCBalanceContext.Provider>
  );
};

// Hook to use USDC balance context
export const useUSDCBalance = () => {
  const context = useContext(USDCBalanceContext);
  if (!context) {
    throw new Error("useUSDCBalance must be used within a USDCBalanceProvider");
  }
  return context;
};
