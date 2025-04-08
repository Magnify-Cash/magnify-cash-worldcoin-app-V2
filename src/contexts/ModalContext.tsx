
import React, { createContext, useContext, useState, ReactNode } from "react";

interface ModalContextType {
  isOpen: boolean;
  modalType: "supply" | "withdraw" | null;
  poolContractAddress?: string;
  lpSymbol?: string;
  lpBalance?: number;
  lpValue?: number;
  walletAddress?: string;
  poolStatus?: 'warm-up' | 'active' | 'cooldown' | 'withdrawal';
  transactionId?: string;
  onSuccessfulSupply: (amount: number, lpAmount: number) => void;
  onSuccessfulWithdraw: (amount: number, lpAmount: number) => void;
  isTransactionPending: boolean;
  transactionMessage?: string;
  openModal: (type: "supply" | "withdraw", options: any) => void;
  closeModal: () => void;
  setTransactionPending: (pending: boolean) => void;
  setTransactionMessage: (message?: string) => void;
}

const defaultValues: ModalContextType = {
  isOpen: false,
  modalType: null,
  onSuccessfulSupply: () => {},
  onSuccessfulWithdraw: () => {},
  isTransactionPending: false,
  openModal: () => {},
  closeModal: () => {},
  setTransactionPending: () => {},
  setTransactionMessage: () => {},
};

const ModalContext = createContext<ModalContextType>(defaultValues);

export const useModalContext = () => useContext(ModalContext);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<"supply" | "withdraw" | null>(null);
  const [poolContractAddress, setPoolContractAddress] = useState<string>();
  const [lpSymbol, setLpSymbol] = useState<string>();
  const [lpBalance, setLpBalance] = useState<number>();
  const [lpValue, setLpValue] = useState<number>();
  const [walletAddress, setWalletAddress] = useState<string>();
  const [poolStatus, setPoolStatus] = useState<'warm-up' | 'active' | 'cooldown' | 'withdrawal'>();
  const [transactionId, setTransactionId] = useState<string>();
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [transactionMessage, setTransactionMessage] = useState<string>();
  
  const [onSuccessfulSupply, setOnSuccessfulSupply] = useState<(amount: number, lpAmount: number) => void>(
    () => () => {}
  );
  
  const [onSuccessfulWithdraw, setOnSuccessfulWithdraw] = useState<(amount: number, lpAmount: number) => void>(
    () => () => {}
  );

  const openModal = (type: "supply" | "withdraw", options: any = {}) => {
    setModalType(type);
    setPoolContractAddress(options.poolContractAddress);
    setLpSymbol(options.lpSymbol);
    setLpBalance(options.lpBalance);
    setLpValue(options.lpValue);
    setWalletAddress(options.walletAddress);
    setPoolStatus(options.poolStatus);
    setTransactionId(options.transactionId);
    
    console.log("[ModalContext] Setting poolStatus:", options.poolStatus);
    
    if (options.onSuccessfulSupply) {
      setOnSuccessfulSupply(() => options.onSuccessfulSupply);
    }
    
    if (options.onSuccessfulWithdraw) {
      setOnSuccessfulWithdraw(() => options.onSuccessfulWithdraw);
    }
    
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalType(null);
    setTransactionId(undefined);
  };

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        modalType,
        poolContractAddress,
        lpSymbol,
        lpBalance,
        lpValue,
        walletAddress,
        poolStatus,
        transactionId,
        onSuccessfulSupply,
        onSuccessfulWithdraw,
        isTransactionPending,
        transactionMessage,
        openModal,
        closeModal,
        setTransactionPending: setIsTransactionPending,
        setTransactionMessage,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
