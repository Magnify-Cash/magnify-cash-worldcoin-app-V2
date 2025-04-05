
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
}

const ModalContext = createContext<ModalContextState>({
  isOpen: false,
  modalType: null,
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
  };

  const closeModal = () => {
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
    }, 300);
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
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
