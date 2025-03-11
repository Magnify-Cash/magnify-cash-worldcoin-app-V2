import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { VERIFICATION_TIERS, VerificationTier, Tier } from "@/hooks/useMagnifyWorld";
import type { Transaction, WalletBalance } from "@/types/wallet";
import type { Announcement } from "@/features/announcements/utils";

// Types for our demo data
interface DemoLoan {
  amount: number;
  startTime: number;
  isActive: boolean;
  interestRate: number;
  loanPeriod: number;
}

interface DemoNFTInfo {
  tokenId: number | null;
  tier: Tier | null;
}

interface DemoContractData {
  loanToken: string;
  tierCount: number;
  nftInfo: DemoNFTInfo;
  loan: ["V2", DemoLoan | null];
  allTiers: Record<number, Tier>;
}

interface DemoData {
  walletAddress: string | null;
  walletBalances: WalletBalance[];
  transactions: Transaction[];
  contractData: DemoContractData;
  announcements: Announcement[];
  usdcBalance: number;
}

interface DemoContextType {
  demoData: DemoData;
  login: (address: string) => void;
  logout: () => void;
  refreshBalance: () => void;
  requestLoan: (tierId: number) => Promise<string>;
  repayLoan: (amount: string) => Promise<string>;
  upgradeVerification: (level: "DEVICE" | "ORB") => Promise<boolean>;
  readAnnouncement: (id: number) => void;
  updateUSDCBalance: (newBalance: number) => void;
  isLoading: boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

// Initial demo data
const initialDemoData: DemoData = {
  walletAddress: null,
  walletBalances: [
    {
      id: 1,
      currency: "Worldcoin",
      symbol: "WLD",
      balance: "3450.00",
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
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
      currency: "WLD",
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
  contractData: {
    loanToken: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
    tierCount: 3,
    nftInfo: {
      tokenId: 1234,
      tier: {
        loanAmount: BigInt(1000 * 1000000), // 1000 USDC with 6 decimals
        interestRate: BigInt(500), // 5.00%
        loanPeriod: BigInt(30 * 24 * 60 * 60), // 30 days in seconds
        tierId: BigInt(1),
        verificationStatus: VERIFICATION_TIERS.DEVICE
      }
    },
    loan: ["V2", null], // No active loan initially
    allTiers: {
      1: {
        loanAmount: BigInt(1000 * 1000000), 
        interestRate: BigInt(500),
        loanPeriod: BigInt(30 * 24 * 60 * 60),
        tierId: BigInt(1),
        verificationStatus: VERIFICATION_TIERS.DEVICE
      },
      3: {
        loanAmount: BigInt(5000 * 1000000),
        interestRate: BigInt(300),
        loanPeriod: BigInt(60 * 24 * 60 * 60),
        tierId: BigInt(3),
        verificationStatus: VERIFICATION_TIERS.ORB
      }
    }
  },
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
    },
    {
      id: 2,
      title: "New Loan Feature Available",
      content: "You can now request loans with your verification NFT. Check out the loan page for more details.",
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
      type: "new-feature",
      is_highlighted: false,
      is_new: true,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 3,
      title: "Security Update",
      content: "We've enhanced our security measures to better protect your assets.",
      date: new Date(Date.now() - 86400000).toISOString(),
      type: "security",
      is_highlighted: true,
      is_new: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    }
  ],
  usdcBalance: Math.floor(Math.random() * (100 - 15 + 1)) + 15 // Random between 15 and 100
};

export const DemoDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [demoData, setDemoData] = useState<DemoData>(() => {
    // Try to load from sessionStorage
    const savedData = sessionStorage.getItem("demoData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Convert string numbers back to BigInt for contractData
        if (parsed.contractData?.nftInfo?.tier) {
          parsed.contractData.nftInfo.tier.loanAmount = BigInt(parsed.contractData.nftInfo.tier.loanAmount);
          parsed.contractData.nftInfo.tier.interestRate = BigInt(parsed.contractData.nftInfo.tier.interestRate);
          parsed.contractData.nftInfo.tier.loanPeriod = BigInt(parsed.contractData.nftInfo.tier.loanPeriod);
          parsed.contractData.nftInfo.tier.tierId = BigInt(parsed.contractData.nftInfo.tier.tierId);
        }
        
        // Convert all tier data
        Object.keys(parsed.contractData.allTiers || {}).forEach(key => {
          const tier = parsed.contractData.allTiers[key];
          parsed.contractData.allTiers[key] = {
            ...tier,
            loanAmount: BigInt(tier.loanAmount),
            interestRate: BigInt(tier.interestRate),
            loanPeriod: BigInt(tier.loanPeriod),
            tierId: BigInt(tier.tierId)
          };
        });
        
        // Convert loan data if it exists
        if (parsed.contractData?.loan?.[1]) {
          const loan = parsed.contractData.loan[1];
          parsed.contractData.loan[1] = {
            ...loan,
            amount: loan.amount,
            startTime: loan.startTime,
            interestRate: loan.interestRate,
            loanPeriod: loan.loanPeriod
          };
        }
        
        return parsed;
      } catch (error) {
        console.error("Error parsing demo data from sessionStorage:", error);
        return initialDemoData;
      }
    }
    return initialDemoData;
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Save to sessionStorage when demoData changes
  useEffect(() => {
    try {
      // Need to handle BigInt serialization
      const dataToSave = JSON.stringify(demoData, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      );
      sessionStorage.setItem("demoData", dataToSave);
    } catch (error) {
      console.error("Error saving demo data to sessionStorage:", error);
    }
  }, [demoData]);

  // Login function
  const login = (address: string) => {
    setDemoData(prev => ({
      ...prev,
      walletAddress: address
    }));
    localStorage.setItem("ls_wallet_address", address);
  };

  // Logout function
  const logout = () => {
    setDemoData(prev => ({
      ...prev,
      walletAddress: null
    }));
    localStorage.removeItem("ls_wallet_address");
  };

  // Simulate refreshing balance
  const refreshBalance = () => {
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      setDemoData(prev => {
        const newBalances = [...prev.walletBalances].map(balance => ({
          ...balance,
          balance: (parseFloat(balance.balance) + Math.random() * 10 - 5).toFixed(2),
          updated_at: new Date().toISOString()
        }));
        
        return {
          ...prev,
          walletBalances: newBalances,
          usdcBalance: prev.usdcBalance + Math.random() * 100 - 50
        };
      });
      
      setIsLoading(false);
    }, 1000);
  };

  // Simulate requesting a loan
  const requestLoan = async (tierId: number): Promise<string> => {
    setIsLoading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const txId = "0x" + Math.random().toString(16).substring(2, 10) + "...";
        
        setDemoData(prev => {
          const tier = prev.contractData.allTiers[tierId];
          if (!tier) return prev;
          
          const loanAmount = Number(tier.loanAmount) / 1000000; // Convert from Wei
          const interestRate = Number(tier.interestRate);
          const loanPeriod = Number(tier.loanPeriod);
          
          const newLoan: DemoLoan = {
            amount: loanAmount,
            startTime: Date.now() / 1000, // current time in seconds
            isActive: true,
            interestRate: interestRate,
            loanPeriod: loanPeriod
          };
          
          // Add transaction record
          const newTransaction: Transaction = {
            id: Math.max(0, ...prev.transactions.map(t => t.id)) + 1,
            type: "deposit",
            currency: "USDC",
            amount: loanAmount,
            status: "completed",
            created_at: new Date().toISOString(),
            metadata: { txHash: txId, loan: true }
          };
          
          return {
            ...prev,
            contractData: {
              ...prev.contractData,
              loan: ["V2", newLoan]
            },
            transactions: [newTransaction, ...prev.transactions]
          };
        });
        
        setIsLoading(false);
        resolve(txId);
      }, 2000);
    });
  };

  // Simulate repaying a loan
  const repayLoan = async (amount: string): Promise<string> => {
    setIsLoading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const txId = "0x" + Math.random().toString(16).substring(2, 10) + "...";
        
        setDemoData(prev => {
          // Add transaction record
          const newTransaction: Transaction = {
            id: Math.max(0, ...prev.transactions.map(t => t.id)) + 1,
            type: "withdrawal",
            currency: "USDC",
            amount: parseFloat(amount),
            status: "completed",
            created_at: new Date().toISOString(),
            metadata: { txHash: txId, loan: true, repayment: true }
          };
          
          return {
            ...prev,
            contractData: {
              ...prev.contractData,
              loan: ["V2", null] // Clear the loan
            },
            transactions: [newTransaction, ...prev.transactions]
          };
        });
        
        setIsLoading(false);
        resolve(txId);
      }, 2000);
    });
  };

  // Simulate upgrading verification level
  const upgradeVerification = async (level: "DEVICE" | "ORB"): Promise<boolean> => {
    setIsLoading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        setDemoData(prev => {
          const newNFTInfo = {
            ...prev.contractData.nftInfo,
            tier: {
              ...prev.contractData.nftInfo.tier!,
              verificationStatus: VERIFICATION_TIERS[level],
              tierId: level === "DEVICE" ? BigInt(1) : BigInt(3)
            }
          };
          
          return {
            ...prev,
            contractData: {
              ...prev.contractData,
              nftInfo: newNFTInfo
            }
          };
        });
        
        setIsLoading(false);
        resolve(true);
      }, 2000);
    });
  };

  // Simulate reading an announcement
  const readAnnouncement = (id: number) => {
    setDemoData(prev => ({
      ...prev,
      announcements: prev.announcements.map(announcement => 
        announcement.id === id 
          ? { ...announcement, is_new: false }
          : announcement
      )
    }));
  };

  // Add updateUSDCBalance function
  const updateUSDCBalance = (newBalance: number) => {
    setDemoData(prev => ({
      ...prev,
      usdcBalance: newBalance
    }));
  };

  return (
    <DemoContext.Provider
      value={{
        demoData,
        login,
        logout,
        refreshBalance,
        requestLoan,
        repayLoan,
        upgradeVerification,
        readAnnouncement,
        updateUSDCBalance,
        isLoading
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
