
import React from "react";
import { useModalContext } from "@/contexts/ModalContext";
import { SupplyModal } from "@/components/SupplyModal";
import { WithdrawModal } from "@/components/WithdrawModal";

export const ModalManager: React.FC = () => {
  const {
    isOpen,
    modalType,
    poolContractAddress,
    lpSymbol,
    lpBalance,
    lpValue,
    closeModal,
  } = useModalContext();

  if (!isOpen || !modalType) return null;

  if (modalType === "supply") {
    return (
      <SupplyModal
        isOpen={isOpen}
        onClose={closeModal}
        poolContractAddress={poolContractAddress || undefined}
        lpSymbol={lpSymbol || undefined}
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
