
import React from "react";
import { useModalContext } from "@/contexts/ModalContext";
import { SupplyModal } from "@/components/SupplyModal";
import { WithdrawModal } from "@/components/WithdrawModal";

export const ModalManager: React.FC = () => {
  const {
    isOpen,
    modalType,
    poolId,
    poolContractAddress,
    lpSymbol,
    lpBalance,
    lpValue,
    walletAddress,
    closeModal,
  } = useModalContext();

  if (!isOpen || !modalType) return null;

  if (modalType === "supply") {
    return (
      <SupplyModal
        isOpen={isOpen}
        onClose={closeModal}
        poolId={poolId || 1}
        poolContractAddress={poolContractAddress || undefined}
        lpSymbol={lpSymbol || undefined}
        walletAddress={walletAddress || undefined}
      />
    );
  }

  if (modalType === "withdraw") {
    return (
      <WithdrawModal
        isOpen={isOpen}
        onClose={closeModal}
        lpBalance={lpBalance || 0}
        lpValue={lpValue || 0}
      />
    );
  }

  return null;
};
