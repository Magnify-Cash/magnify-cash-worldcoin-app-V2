
import { useModalContext } from "@/contexts/ModalContext";

export const usePoolModals = () => {
  const { openModal, closeModal } = useModalContext();

  const openSupplyModal = (params: {
    poolId?: number;
    poolContractAddress?: string;
    lpSymbol?: string;
  }) => {
    openModal("supply", params);
  };

  const openWithdrawModal = (params: {
    poolId?: number;
    lpBalance?: number;
    lpValue?: number;
    poolContractAddress?: string; // Added poolContractAddress param
  }) => {
    openModal("withdraw", params);
  };

  return {
    openSupplyModal,
    openWithdrawModal,
    closeModal,
  };
};
