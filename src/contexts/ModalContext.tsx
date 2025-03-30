
import React, { createContext, useContext, useState, ReactNode } from "react";

type ModalType = "supply" | "withdraw" | null;

interface ModalContextState {
  isOpen: boolean;
  modalType: ModalType;
  poolId: number | null;
  poolContractAddress: string | null;
  lpSymbol: string | null;
  lpBalance: number | null;
  lpValue: number | null;
  walletAddress: string | null; // Add wallet address to context
  openModal: (type: ModalType, params: ModalParams) => void;
  closeModal: () => void;
}

interface ModalParams {
  poolId?: number;
  poolContractAddress?: string;
  lpSymbol?: string;
  lpBalance?: number;
  lpValue?: number;
  walletAddress?: string; // Add wallet address to params
}

const initialState: ModalContextState = {
  isOpen: false,
  modalType: null,
  poolId: null,
  poolContractAddress: null,
  lpSymbol: null,
  lpBalance: null,
  lpValue: null,
  walletAddress: null, // Initialize wallet address
  openModal: () => {},
  closeModal: () => {},
};

export const ModalContext = createContext<ModalContextState>(initialState);

export const useModalContext = () => useContext(ModalContext);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [poolId, setPoolId] = useState<number | null>(null);
  const [poolContractAddress, setPoolContractAddress] = useState<string | null>(null);
  const [lpSymbol, setLpSymbol] = useState<string | null>(null);
  const [lpBalance, setLpBalance] = useState<number | null>(null);
  const [lpValue, setLpValue] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null); // Add state for wallet address

  const openModal = (type: ModalType, params: ModalParams) => {
    setModalType(type);
    setPoolId(params.poolId || null);
    setPoolContractAddress(params.poolContractAddress || null);
    setLpSymbol(params.lpSymbol || null);
    setLpBalance(params.lpBalance || null);
    setLpValue(params.lpValue || null);
    setWalletAddress(params.walletAddress || null); // Set wallet address
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setModalType(null);
      setPoolId(null);
      setPoolContractAddress(null);
      setLpSymbol(null);
      setLpBalance(null);
      setLpValue(null);
      setWalletAddress(null); // Reset wallet address
    }, 200); // Small delay to allow animation to complete
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
        walletAddress, // Include wallet address in context value
        openModal,
        closeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
