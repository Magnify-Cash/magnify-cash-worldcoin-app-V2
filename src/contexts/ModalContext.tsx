
import { createContext, useContext, useState, ReactNode } from "react";

interface ModalContextState {
  isOpen: boolean;
  modalType: "supply" | "withdraw" | null;
  poolId?: number;
  poolContractAddress?: string;
  lpSymbol?: string;
  lpBalance?: number;
  lpValue?: number;
  walletAddress?: string;
  onSuccessfulSupply?: (amount: number) => void;
  openModal: (type: "supply" | "withdraw", params: any) => void;
  closeModal: () => void;
  
  // Transaction state tracking
  isTransactionPending: boolean;
  setTransactionPending: (isPending: boolean) => void;
  transactionHash: string | null;
  setTransactionHash: (hash: string | null) => void;
}

const ModalContext = createContext<ModalContextState>({
  isOpen: false,
  modalType: null,
  isTransactionPending: false,
  setTransactionPending: () => {},
  transactionHash: null,
  setTransactionHash: () => {},
  openModal: () => {},
  closeModal: () => {},
});

export const useModalContext = () => useContext(ModalContext);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<"supply" | "withdraw" | null>(null);
  const [poolId, setPoolId] = useState<number | undefined>(undefined);
  const [poolContractAddress, setPoolContractAddress] = useState<string | undefined>(undefined);
  const [lpSymbol, setLpSymbol] = useState<string | undefined>(undefined);
  const [lpBalance, setLpBalance] = useState<number | undefined>(undefined);
  const [lpValue, setLpValue] = useState<number | undefined>(undefined);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(
    localStorage.getItem("ls_wallet_address") || undefined
  );
  const [onSuccessfulSupply, setOnSuccessfulSupply] = useState<((amount: number) => void) | undefined>(undefined);
  
  // Transaction state
  const [isTransactionPending, setTransactionPending] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const openModal = (
    type: "supply" | "withdraw",
    params: {
      poolId?: number;
      poolContractAddress?: string;
      lpSymbol?: string;
      lpBalance?: number;
      lpValue?: number;
      onSuccessfulSupply?: (amount: number) => void;
    }
  ) => {
    setModalType(type);
    setPoolId(params.poolId);
    setPoolContractAddress(params.poolContractAddress);
    setLpSymbol(params.lpSymbol);
    setLpBalance(params.lpBalance);
    setLpValue(params.lpValue);
    setOnSuccessfulSupply(params.onSuccessfulSupply);
    setIsOpen(true);
    
    // Reset transaction state
    setTransactionPending(false);
    setTransactionHash(null);
  };

  const closeModal = () => {
    // Only close if there's no pending transaction
    if (!isTransactionPending) {
      setIsOpen(false);
      
      // Reset the context's state after a slight delay to allow animation to complete
      setTimeout(() => {
        setModalType(null);
        setPoolId(undefined);
        setPoolContractAddress(undefined);
        setLpSymbol(undefined);
        setLpBalance(undefined);
        setLpValue(undefined);
        setOnSuccessfulSupply(undefined);
        setTransactionHash(null);
      }, 300);
    }
  };

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        modalType,
        poolId,
        poolContractAddress,
        lpSymbol,
        lpBalance,
        lpValue,
        walletAddress,
        onSuccessfulSupply,
        openModal,
        closeModal,
        isTransactionPending,
        setTransactionPending,
        transactionHash,
        setTransactionHash,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
