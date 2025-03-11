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
  contractData: {
    nftInfo: {
      tokenId: bigint | null;
      tier: {
        tierId: bigint;
        verificationStatus: {
          level: string;
          verification_level: string;
        };
      } | null;
    };
  };
}

interface DemoContextType {
  demoData: DemoData;
  login: (address: string) => void;
  logout: () => void;
  updateUSDCBalance: (newBalance: number) => void;
  updateVerificationStatus: (level: "DEVICE" | "ORB") => void;
  isLoading: boolean;
  requestLoan: (tierId: number) => Promise<string>;
  repayLoan: (amount: string) => Promise<string>;
  refreshBalance: () => void;
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
      balance: "1250.75",
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
  usdcBalance: 1250.75,
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
  contractData: {
    nftInfo: {
      tokenId: null,
      tier: null
    }
  }
};

export const DemoDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  useEffect(() => {
    try {
      localStorage.setItem("demoData", JSON.stringify(demoData));
    } catch (error) {
      console.error("Error saving demo data to localStorage:", error);
    }
  }, [demoData]);

  useEffect(() => {
    const savedWallet = localStorage.getItem("ls_wallet_address");
    if (savedWallet) {
      setDemoData(prev => ({
        ...prev,
        walletAddress: savedWallet
      }));
    }
  }, []);

  const login = (address: string) => {
    setDemoData(prev => ({
      ...prev,
      walletAddress: address
    }));
    localStorage.setItem("ls_wallet_address", address);
  };

  const logout = () => {
    setDemoData(prev => ({
      ...prev,
      walletAddress: null
    }));
    localStorage.removeItem("ls_wallet_address");
  };

  const updateUSDCBalance = (newBalance: number) => {
    setDemoData(prev => {
      const updatedData = {
        ...prev,
        usdcBalance: newBalance,
        walletBalances: prev.walletBalances.map(balance =>
          balance.symbol === "USDC" ? { ...balance, balance: newBalance.toFixed(2) } : balance
        )
      };

      localStorage.setItem("demoData", JSON.stringify(updatedData));
      return updatedData;
    });
  };

  const updateVerificationStatus = (level: "DEVICE" | "ORB") => {
    setDemoData(prev => ({
      ...prev,
      contractData: {
        nftInfo: {
          tokenId: BigInt(1),
          tier: {
            tierId: level === "DEVICE" ? BigInt(1) : BigInt(2),
            verificationStatus: {
              level: level,
              verification_level: level.toLowerCase()
            }
          }
        }
      }
    }));
  };

  const requestLoan = async (tierId: number): Promise<string> => {
    const txHash = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`;
    return txHash;
  };

  const repayLoan = async (amount: string): Promise<string> => {
    const txHash = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`;
    
    const amountNum = parseFloat(amount);
    updateUSDCBalance(demoData.usdcBalance - amountNum);
    
    return txHash;
  };

  const refreshBalance = () => {
    console.log("Refreshing balance...");
  };

  return (
    <DemoContext.Provider
      value={{
        demoData,
        login,
        logout,
        updateUSDCBalance,
        updateVerificationStatus,
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

export const useDemoData = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemoData must be used within a DemoDataProvider");
  }
  return context;
};
