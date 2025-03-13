
import { ReactNode, createContext, useState, useEffect } from 'react';

// Create context
interface WalletContextType {
  address: string | null;
  balance: number;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: 0,
  isConnected: false
});

// Check if demo mode is enabled via environment variable
const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // In demo mode, always use mock data
    if (isDemoMode) {
      const mockAddress = localStorage.getItem("ls_wallet_address") || "0xMockWalletAddress123456789";
      setAddress(mockAddress);
      setBalance(100);
      setIsConnected(true);
      return;
    }

    // If not in demo mode, check localStorage for existing wallet address
    const storedAddress = localStorage.getItem("ls_wallet_address");
    if (storedAddress) {
      setAddress(storedAddress);
      setIsConnected(true);
    }
  }, []);

  // Define actual context value
  const contextValue: WalletContextType = {
    address,
    balance,
    isConnected
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
