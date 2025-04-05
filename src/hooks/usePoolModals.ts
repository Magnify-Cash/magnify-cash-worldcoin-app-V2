
import { useModalContext } from "@/contexts/ModalContext";

export const usePoolModals = () => {
  const { openModal, closeModal } = useModalContext();

  const openSupplyModal = (params: {
    poolId?: number;
    poolContractAddress?: string;
    lpSymbol?: string;
    onSuccessfulSupply?: (amount: number) => void;
  }) => {
    openModal("supply", params);
  };

  const openWithdrawModal = (params: {
    poolId?: number;
    lpBalance?: number;
    lpValue?: number;
    poolContractAddress?: string;
  }) => {
    openModal("withdraw", params);
  };

  return {
    openSupplyModal,
    openWithdrawModal,
    closeModal,
  };
};
