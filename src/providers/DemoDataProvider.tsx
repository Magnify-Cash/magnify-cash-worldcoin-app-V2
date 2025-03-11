
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for our demo data
export interface UserNFT {
  tokenId: number;
  tier: number;
  mintedAt: string;
}

export interface LoanData {
  tokenId: number;
  amount: number;
  startTime: string;
  isActive: boolean;
  interestRate: number;
  loanPeriod: number;
  dueDate: string;
}

export interface TierData {
  id: number;
  loanAmount: number;
  interestRate: number;
  loanPeriod: number;
  name: string;
  description: string;
}

interface DemoDataContextType {
  userNFT: UserNFT | null;
  activeLoans: LoanData[];
  loanHistory: LoanData[];
  tiers: TierData[];
  walletBalance: number;
  isConnected: boolean;
  walletAddress: string | null;
  // Methods
  connectWallet: () => void;
  disconnectWallet: () => void;
  mintNFT: (tierId: number) => void;
  upgradeNFT: (newTierId: number) => void;
  requestLoan: () => Promise<boolean>;
  repayLoan: () => Promise<boolean>;
  resetDemoData: () => void;
}

// Default tiers
const defaultTiers: TierData[] = [
  {
    id: 1,
    loanAmount: 1 * 1e6, // 1 USDC
    interestRate: 250, // 2.5%
    loanPeriod: 30 * 24 * 60 * 60, // 30 days in seconds
    name: "Device",
    description: "Basic verification with your device"
  },
  {
    id: 2,
    loanAmount: 5 * 1e6, // 5 USDC
    interestRate: 200, // 2%
    loanPeriod: 60 * 24 * 60 * 60, // 60 days
    name: "Passport",
    description: "Enhanced verification with your passport"
  },
  {
    id: 3,
    loanAmount: 10 * 1e6, // 10 USDC
    interestRate: 150, // 1.5%
    loanPeriod: 90 * 24 * 60 * 60, // 90 days
    name: "ORB",
    description: "Premium verification with World ID ORB"
  }
];

// Create context with default values
const DemoDataContext = createContext<DemoDataContextType>({
  userNFT: null,
  activeLoans: [],
  loanHistory: [],
  tiers: defaultTiers,
  walletBalance: 0,
  isConnected: false,
  walletAddress: null,
  connectWallet: () => {},
  disconnectWallet: () => {},
  mintNFT: () => {},
  upgradeNFT: () => {},
  requestLoan: async () => false,
  repayLoan: async () => false,
  resetDemoData: () => {}
});

// Sample wallet addresses to randomly assign
const sampleWallets = [
  "0x7af5e0de231d82def3bc262b1d5b3359495a4bfb",
  "0xf0c7db5acea62029058b0e4e0b79f2bac18686c4",
  "0x6a7ec268afb31dab2b0ad39511af9db7c11944a1"
];

export const DemoDataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Initialize state from session storage or defaults
  const [userNFT, setUserNFT] = useState<UserNFT | null>(null);
  const [activeLoans, setActiveLoans] = useState<LoanData[]>([]);
  const [loanHistory, setLoanHistory] = useState<LoanData[]>([]);
  const [tiers] = useState<TierData[]>(defaultTiers);
  const [walletBalance, setWalletBalance] = useState<number>(15 * 1e6); // 15 USDC
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Load data from session storage on mount
  useEffect(() => {
    const storedNFT = sessionStorage.getItem('demo_user_nft');
    const storedActiveLoans = sessionStorage.getItem('demo_active_loans');
    const storedLoanHistory = sessionStorage.getItem('demo_loan_history');
    const storedWalletBalance = sessionStorage.getItem('demo_wallet_balance');
    const storedWalletAddress = sessionStorage.getItem('demo_wallet_address');
    const storedIsConnected = sessionStorage.getItem('demo_is_connected');

    if (storedNFT) setUserNFT(JSON.parse(storedNFT));
    if (storedActiveLoans) setActiveLoans(JSON.parse(storedActiveLoans));
    if (storedLoanHistory) setLoanHistory(JSON.parse(storedLoanHistory));
    if (storedWalletBalance) setWalletBalance(JSON.parse(storedWalletBalance));
    if (storedWalletAddress) setWalletAddress(storedWalletAddress);
    if (storedIsConnected) setIsConnected(storedIsConnected === 'true');
  }, []);

  // Save data to session storage whenever it changes
  useEffect(() => {
    if (userNFT) sessionStorage.setItem('demo_user_nft', JSON.stringify(userNFT));
    else sessionStorage.removeItem('demo_user_nft');
    
    sessionStorage.setItem('demo_active_loans', JSON.stringify(activeLoans));
    sessionStorage.setItem('demo_loan_history', JSON.stringify(loanHistory));
    sessionStorage.setItem('demo_wallet_balance', JSON.stringify(walletBalance));
    
    if (walletAddress) sessionStorage.setItem('demo_wallet_address', walletAddress);
    else sessionStorage.removeItem('demo_wallet_address');
    
    sessionStorage.setItem('demo_is_connected', String(isConnected));
  }, [userNFT, activeLoans, loanHistory, walletBalance, walletAddress, isConnected]);

  // Connect wallet - assigns a random address and sets connected state
  const connectWallet = () => {
    const randomWallet = sampleWallets[Math.floor(Math.random() * sampleWallets.length)];
    setWalletAddress(randomWallet);
    setIsConnected(true);
    localStorage.setItem('ls_wallet_address', randomWallet.toLowerCase());
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    localStorage.removeItem('ls_wallet_address');
  };

  // Mint NFT - creates a new NFT for the user with the specified tier
  const mintNFT = (tierId: number) => {
    if (!isConnected) return;
    
    const newNFT: UserNFT = {
      tokenId: Math.floor(Math.random() * 10000) + 1,
      tier: tierId,
      mintedAt: new Date().toISOString()
    };
    
    setUserNFT(newNFT);
  };

  // Upgrade NFT - updates the tier of the user's NFT
  const upgradeNFT = (newTierId: number) => {
    if (!userNFT || !isConnected) return;
    
    setUserNFT({
      ...userNFT,
      tier: newTierId
    });
  };

  // Request loan - creates a new active loan based on the user's NFT tier
  const requestLoan = async (): Promise<boolean> => {
    if (!userNFT || !isConnected) return false;
    
    // Check if there's already an active loan
    if (activeLoans.some(loan => loan.isActive)) {
      return false;
    }
    
    const tierData = tiers.find(t => t.id === userNFT.tier);
    if (!tierData) return false;
    
    const startTime = new Date().toISOString();
    const dueDate = new Date(Date.now() + tierData.loanPeriod * 1000).toISOString();
    
    const newLoan: LoanData = {
      tokenId: userNFT.tokenId,
      amount: tierData.loanAmount,
      startTime,
      isActive: true,
      interestRate: tierData.interestRate,
      loanPeriod: tierData.loanPeriod,
      dueDate
    };
    
    setActiveLoans([...activeLoans, newLoan]);
    setWalletBalance(prevBalance => prevBalance + tierData.loanAmount);
    
    return true;
  };

  // Repay loan - marks the active loan as inactive and moves it to history
  const repayLoan = async (): Promise<boolean> => {
    if (!userNFT || !isConnected) return false;
    
    const activeLoan = activeLoans.find(loan => loan.isActive);
    if (!activeLoan) return false;
    
    // Calculate interest
    const interest = (activeLoan.amount * activeLoan.interestRate) / 10000;
    const totalRepayment = activeLoan.amount + interest;
    
    // Check if user has enough balance
    if (walletBalance < totalRepayment) return false;
    
    // Update loan status
    const updatedLoan = { ...activeLoan, isActive: false };
    
    // Update states
    setActiveLoans(activeLoans.filter(loan => loan.tokenId !== activeLoan.tokenId));
    setLoanHistory([...loanHistory, updatedLoan]);
    setWalletBalance(prevBalance => prevBalance - totalRepayment);
    
    return true;
  };

  // Reset all demo data
  const resetDemoData = () => {
    setUserNFT(null);
    setActiveLoans([]);
    setLoanHistory([]);
    setWalletBalance(15 * 1e6);
    setIsConnected(false);
    setWalletAddress(null);
    localStorage.removeItem('ls_wallet_address');
    
    // Clear session storage
    sessionStorage.removeItem('demo_user_nft');
    sessionStorage.removeItem('demo_active_loans');
    sessionStorage.removeItem('demo_loan_history');
    sessionStorage.removeItem('demo_wallet_balance');
    sessionStorage.removeItem('demo_wallet_address');
    sessionStorage.removeItem('demo_is_connected');
  };

  return (
    <DemoDataContext.Provider
      value={{
        userNFT,
        activeLoans,
        loanHistory,
        tiers,
        walletBalance,
        isConnected,
        walletAddress,
        connectWallet,
        disconnectWallet,
        mintNFT,
        upgradeNFT,
        requestLoan,
        repayLoan,
        resetDemoData
      }}
    >
      {children}
    </DemoDataContext.Provider>
  );
};

// Custom hook to use the demo data context
export const useDemoData = () => useContext(DemoDataContext);
