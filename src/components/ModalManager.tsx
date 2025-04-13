
import React from "react";
import { useModalContext } from "@/contexts/ModalContext";
import { SupplyModal } from "@/components/SupplyModal";
import { WithdrawModal } from "@/components/WithdrawModal";
import { TransactionOverlay } from "@/components/TransactionOverlay";

export const ModalManager: React.FC = () => {
  const {
    isOpen,
    modalType,
    poolContractAddress,
    lpSymbol,
    lpBalance,
    lpValue,
    walletAddress,
    closeModal,
    onSuccessfulSupply,
    onSuccessfulWithdraw,
    isTransactionPending,
    transactionMessage,
    poolStatus,
  } = useModalContext();

  if (!isOpen || !modalType) return null;

  if (modalType === "supply") {
    return (
      <>
        <TransactionOverlay isVisible={isTransactionPending} message={transactionMessage} />
        <SupplyModal
          isOpen={isOpen}
          onClose={closeModal}
          poolContractAddress={poolContractAddress || undefined}
          lpSymbol={lpSymbol || undefined}
          walletAddress={walletAddress || undefined}
          onSuccessfulSupply={onSuccessfulSupply}
        />
      </>
    );
  }

  if (modalType === "withdraw") {
    return (
      <>
        <TransactionOverlay isVisible={isTransactionPending} message={transactionMessage} />
        <WithdrawModal
          isOpen={isOpen}
          onClose={closeModal}
          lpBalance={lpBalance || 0}
          lpValue={lpValue || 0}
          poolContractAddress={poolContractAddress || undefined}
          onSuccessfulWithdraw={onSuccessfulWithdraw}
          poolStatus={poolStatus}
        />
      </>
    );
  }

  return null;
};
