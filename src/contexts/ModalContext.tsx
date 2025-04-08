
import React, { createContext, useState, useContext } from "react";

interface ModalContextType {
  isOpen: boolean;
  modalType: string | null;
  poolId?: number;
  poolContractAddress?: string;
  lpSymbol?: string;
  lpBalance?: number;
  lpValue?: number;
  walletAddress?: string;
  poolStatus?: 'warm-up' | 'active' | 'cooldown' | 'withdrawal';
  openModal: (type: string, options: any) => void;
  closeModal: () => void;
  onSuccessfulSupply?: (amount: number, lpAmount: number, transactionId?: string) => void;
  onSuccessfulWithdraw?: (amount: number, lpAmount: number, transactionId?: string) => void;
  // Transaction tracking
  isTransactionPending: boolean;
  setTransactionPending: (isPending: boolean) => void;
  transactionMessage?: string;
  setTransactionMessage: (message?: string) => void;
}

const defaultValue: ModalContextType = {
  isOpen: false,
  modalType: null,
  openModal: () => {},
  closeModal: () => {},
  isTransactionPending: false,
  setTransactionPending: () => {},
  setTransactionMessage: () => {},
};

const ModalContext = createContext<ModalContextType>(defaultValue);

export const useModalContext = () => {
  return useContext(ModalContext);
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalOptions, setModalOptions] = useState({});
  const [isTransactionPending, setTransactionPending] = useState(false);
  const [transactionMessage, setTransactionMessage] = useState<string | undefined>(undefined);

  const openModal = (type: string, options: any = {}) => {
    setModalType(type);
    setModalOptions(options);
    setIsOpen(true);
  };

  const closeModal = () => {
    // Only allow closing if there's no pending transaction
    if (!isTransactionPending) {
      setIsOpen(false);
      setModalType(null);
      setModalOptions({});
      setTransactionPending(false);
      setTransactionMessage(undefined);
    }
  };

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        modalType,
        ...modalOptions,
        openModal,
        closeModal,
        isTransactionPending,
        setTransactionPending,
        transactionMessage,
        setTransactionMessage,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
