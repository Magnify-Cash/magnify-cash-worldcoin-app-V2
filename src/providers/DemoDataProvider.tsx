import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Transaction, WalletBalance } from "@/types/wallet";
import type { Announcement } from "@/features/announcements/utils";

// Types for our demo data
interface DemoData {
  walletAddress: string | null;
  walletBalances: WalletBalance[];
  transactions: Transaction[];
  usdcBalance: number;
  announcements: Announcement[];
  contractData: any; // Added for MagnifyWorld contract data
}

interface DemoContextType {
  demoData: DemoData;
  login: (address: string) => void;
  logout: () => void;
  updateUSDCBalance: (newBalance: number) => void;
  isLoading: boolean;
  requestLoan: (tierId: number) => Promise<string>; // Added for loan functionality
  repayLoan: (amount: string) => Promise<string>; // Added for repayment functionality
  refreshBalance: () => void; // Added for balance refresh
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

// Initial demo data
const initialDemoData: DemoData = {
  walletAddress: null,
  walletBalances: [
    {
      id: 1,
      currency: "USD Coin",
      symbol: "USDC",
      balance: "1250.75", // Default USDC balance
      updated_at: new Date().toISOString(),
    }
  ],
  transactions: [
    {
      id: 1,
      type: "deposit",
      currency: "USDC",
      amount: 500,
      status: "completed",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      metadata: { txHash: "0x1234...abcd" }
    },
    {
      id: 2,
      type: "withdrawal",
      currency: "USDC",
      amount: 100,
      status: "completed",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      metadata: { txHash: "0x5678...efgh" }
    }
  ],
  usdcBalance: 1250.75, // Default USDC balance
  announcements: [
    {
      id: 1,
      title: "Welcome to Magnify World!",
      content: "We're excited to have you join our platform. Explore our features to get the most out of your experience.",
      date: new Date(Date.now() - 86400000 * 7).toISOString(),
      type: "announcement",
      is_highlighted: true,
      is_new: true,
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    }
  ],
  contractData: {} // Empty object for contract data
};

export const DemoDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load demo data from localStorage (fallback to initialDemoData if none exists)
  const [demoData, setDemoData] = useState<DemoData>(() => {
    const savedData = localStorage.getItem("demoData");
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error("Error parsing demo data from localStorage:", error);
        return initialDemoData;
      }
    }
    return initialDemoData;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Persist demo data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("demoData", JSON.stringify(demoData));
    } catch (error) {
      console.error("Error saving demo data to localStorage:", error);
    }
  }, [demoData]);

  // Load wallet from localStorage on mount (if available)
  useEffect(() => {
    const savedWallet = localStorage.getItem("ls_wallet_address");
    if (savedWallet) {
      setDemoData(prev => ({
        ...prev,
        walletAddress: savedWallet
      }));
    }
  }, []);

  // Login function (persists wallet address)
  const login = (address: string) => {
    setDemoData(prev => ({
      ...prev,
      walletAddress: address
    }));
    localStorage.setItem("ls_wallet_address", address);
  };

  // Logout function (clears wallet address)
  const logout = () => {
    setDemoData(prev => ({
      ...prev,
      walletAddress: null
    }));
    localStorage.removeItem("ls_wallet_address");
  };

  // Update USDC balance (persists to localStorage)
  const updateUSDCBalance = (newBalance: number) => {
    setDemoData(prev => {
      const updatedData = {
        ...prev,
        usdcBalance: newBalance,
        walletBalances: prev.walletBalances.map(balance =>
          balance.symbol === "USDC" ? { ...balance, balance: newBalance.toFixed(2) } : balance
        )
      };

      localStorage.setItem("demoData", JSON.stringify(updatedData)); // Persist update
      return updatedData;
    });
  };

  // Add new methods for loan functionality
  const requestLoan = async (tierId: number): Promise<string> => {
    // Generate a random transaction hash for demo
    const txHash = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`;
    return txHash;
  };

  const repayLoan = async (amount: string): Promise<string> => {
    // Generate a random transaction hash for demo
    const txHash = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`;
    
    // Deduct the amount from the user's USDC balance (for demo purposes)
    const amountNum = parseFloat(amount);
    updateUSDCBalance(demoData.usdcBalance - amountNum);
    
    return txHash;
  };

  // Refresh balance function (no-op in demo)
  const refreshBalance = () => {
    // In a real app, this would fetch the latest balance
    console.log("Refreshing balance...");
  };

  return (
    <DemoContext.Provider
      value={{
        demoData,
        login,
        logout,
        updateUSDCBalance,
        isLoading,
        requestLoan,
        repayLoan,
        refreshBalance
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

// Hook to use demo data
export const useDemoData = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemoData must be used within a DemoDataProvider");
  }
  return context;
};
