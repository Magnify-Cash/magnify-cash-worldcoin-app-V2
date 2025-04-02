
import { useState, useEffect } from "react";
import { getUserPoolPosition } from "@/lib/backendRequests";

interface UserPoolPosition {
  balance: number;
  depositedValue: number;
  currentValue: number;
  yield: number;
  yieldPercentage: number;
  loading: boolean;
  error: string | null;
}

export const useUserPoolPosition = (
  poolContractAddress: string,
  walletAddress: string
): UserPoolPosition => {
  const [position, setPosition] = useState<UserPoolPosition>({
    balance: 0,
    depositedValue: 0,
    currentValue: 0,
    yield: 0,
    yieldPercentage: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchPosition = async () => {
      if (!poolContractAddress || !walletAddress) {
        setPosition(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const data = await getUserPoolPosition(
          walletAddress,
          poolContractAddress
        );
        
        setPosition({
          balance: data.balance,
          depositedValue: data.depositedValue,
          currentValue: data.currentValue,
          yield: data.yield,
          yieldPercentage: data.yieldPercentage,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error("Error fetching user pool position:", error);
        setPosition(prev => ({
          ...prev,
          loading: false,
          error: "Failed to load position data"
        }));
      }
    };

    fetchPosition();
  }, [poolContractAddress, walletAddress]);

  return position;
};
