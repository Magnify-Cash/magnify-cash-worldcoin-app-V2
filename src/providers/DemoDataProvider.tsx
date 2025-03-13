
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { WalletBalance } from "@/types/wallet";
import type { Announcement } from "@/features/announcements/utils";

// Ensure the Transaction type supports "loan" and "repayment"
export type Transaction = {
  id: number;
  type: "deposit" | "withdrawal" | "transfer" | "loan" | "repayment";
  currency: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  created_at: string;
  metadata: { txHash: string };
};

interface DemoData {
  walletAddress: string | null;
  walletBalances: WalletBalance[];
  transactions: Transaction[];
  usdcBalance: number;
  announcements: Announcement[];
  contractData: {
    nftInfo: {
      tokenId: string | null;
      tier: {
        tierId: string;
        verificationStatus: {
          level: string;
          verification_level: string;
        };
      } | null;
    };
  };
  isDeviceVerified: boolean;
  isOrbVerified: boolean;
  hasLoan: boolean;
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
  resetSession: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const generateRandomBalance = (): number => Math.floor(Math.random() * 70) + 30;

const getInitialDemoData = (): DemoData => ({
  walletAddress: null,
  walletBalances: [
    {
      id: 1,
      currency: "USD Coin",
      symbol: "USDC",
      balance: generateRandomBalance().toFixed(2),
      updated_at: new Date().toISOString(),
    }
  ],
  transactions: [],
  usdcBalance: generateRandomBalance(),
  announcements: [],
  contractData: {
    nftInfo: {
      tokenId: null,
      tier: null
    }
  },
  isDeviceVerified: false,
  isOrbVerified: false,
  hasLoan: false
});

export const DemoDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [demoData, setDemoData] = useState<DemoData>(() => {
    const savedData = localStorage.getItem("demoData");
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error("Error parsing demo data from localStorage:", error);
        return getInitialDemoData();
      }
    }
    return getInitialDemoData();
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
    setDemoData(prev => ({
      ...prev,
      usdcBalance: newBalance,
      walletBalances: prev.walletBalances.map(balance =>
        balance.symbol === "USDC" ? { ...balance, balance: newBalance.toFixed(2) } : balance
      )
    }));
  };

  const updateVerificationStatus = (level: "DEVICE" | "ORB") => {
    setDemoData(prev => ({
      ...prev,
      isDeviceVerified: level === "DEVICE" || level === "ORB",
      isOrbVerified: level === "ORB",
      contractData: {
        nftInfo: {
          tokenId: "1",
          tier: {
            tierId: level === "DEVICE" ? "1" : "2",
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
    const loanAmount = tierId === 2 ? 10 : 1;

    setDemoData(prev => ({
      ...prev,
      hasLoan: true,
      usdcBalance: prev.usdcBalance + loanAmount,
      walletBalances: prev.walletBalances.map(balance =>
        balance.symbol === "USDC" ? { ...balance, balance: (parseFloat(balance.balance) + loanAmount).toFixed(2) } : balance
      ),
      transactions: [
        {
          id: Date.now(),
          type: "loan",
          currency: "USDC",
          amount: loanAmount,
          status: "completed",
          created_at: new Date().toISOString(),
          metadata: { txHash }
        },
        ...prev.transactions
      ]
    }));

    return txHash;
  };

  const repayLoan = async (amount: string): Promise<string> => {
    const txHash = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`;
    const amountNum = parseFloat(amount);


    console.log(amount)
    console.log("---")
    console.log(amountNum)

    // Update user's USDC balance by deducting the repayment amount
    updateUSDCBalance(demoData.usdcBalance - amountNum);
    console.log("---")
    console.log(demoData.usdcBalance)

    // Mark the loan as repaid and add a repayment transaction
    setDemoData(prev => ({
      ...prev,
      hasLoan: false, // Mark loan as repaid
      transactions: [
        {
          id: Date.now(),
          type: "repayment",
          currency: "USDC",
          amount: amountNum,
          status: "completed",
          created_at: new Date().toISOString(),
          metadata: { txHash }
        },
        ...prev.transactions
      ]
    }));

    return txHash;
  };

  const refreshBalance = useCallback(() => {
    console.log("Refreshing balance...");
  }, []);

  const resetSession = useCallback(() => {
    const newData = getInitialDemoData();
    if (demoData.walletAddress) {
      newData.walletAddress = demoData.walletAddress;
    }
    setDemoData(newData);
    console.log("Session data reset with random balance:", newData.usdcBalance);
  }, [demoData.walletAddress]);

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
        refreshBalance,
        resetSession
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
