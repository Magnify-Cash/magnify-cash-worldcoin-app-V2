
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, DollarSign } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { MiniKit } from "@worldcoin/minikit-js";
import { useModalContext } from "@/contexts/ModalContext";
import { previewRedeem } from "@/lib/backendRequests";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  lpBalance: number;
  lpValue: number;
  poolContractAddress?: string;
  onSuccessfulWithdraw?: (amount: number, lpAmount: number, transactionId: string) => void;
}

export function WithdrawModal({ 
  isOpen, 
  onClose, 
  lpBalance = 0,
  lpValue = 0,
  poolContractAddress,
  onSuccessfulWithdraw,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [rateError, setRateError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const walletAddress = localStorage.getItem("ls_wallet_address") || null;
  const { setTransactionPending, setTransactionMessage } = useModalContext();

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const res = await previewRedeem(1, poolContractAddress);
        setExchangeRate(res.usdcAmount);
        setRateError(null);
      } catch (err) {
        console.error("Error fetching exchange rate", err);
        setExchangeRate(0);
        setRateError("Unable to load exchange rate.");
      }
    };

    if (isOpen && poolContractAddress) {
      fetchExchangeRate();
    }
  }, [isOpen, poolContractAddress]);

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const isAmountValid = () => {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0 && numAmount <= lpValue;
  };

  const calculateRemainingUsdcBalance = () => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      return Math.max(0, lpValue - numAmount).toFixed(2);
    }
    return lpValue.toFixed(2);
  };

  const calculateLpTokenAmount = () => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0 && exchangeRate > 0) {
      return (numAmount / exchangeRate).toFixed(4);
    }
    return "0.0000";
  };

  const handleWithdraw = async () => {
    try {
      if (!amount || !walletAddress || !poolContractAddress) return;
  
      setIsLoading(true);
      setTransactionPending(true);
      setTransactionMessage("Processing your withdrawal...");
  
      const estimatedLpAmount = parseFloat(calculateLpTokenAmount());
      const lpTokenAmountWithDecimals = BigInt(Math.floor(estimatedLpAmount * 1_000_000));
  
      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: poolContractAddress,
            abi: [
              {
                name: "redeem",
                type: "function",
                stateMutability: "nonpayable",
                inputs: [
                  { name: "shares", type: "uint256" },
                  { name: "receiver", type: "address" },
                  { name: "owner", type: "address" },
                ],
                outputs: [{ type: "uint256" }],
              },
            ],
            functionName: "redeem",
            args: [
              lpTokenAmountWithDecimals.toString(),
              walletAddress,
              walletAddress,
            ],
          },
        ],
      });
  
      if (finalPayload.status === "success") {
        const transactionId = finalPayload.transaction_id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Skip the waiting for transaction confirmation - remove the loading state immediately
        toast({
          title: "Withdrawal successful",
          description: "Your assets have been successfully withdrawn from the pool.",
        });
        
        if (onSuccessfulWithdraw && typeof onSuccessfulWithdraw === 'function') {
          const withdrawAmount = parseFloat(amount);
          onSuccessfulWithdraw(withdrawAmount, estimatedLpAmount, transactionId);
        }
        
        onClose();
        setAmount("");
        setTransactionPending(false);
      } else {
        toast({
          title: "Withdrawal failed",
          description: finalPayload.status === "error" && finalPayload.error_code
            ? finalPayload.error_code
            : "Something went wrong",
        });
        setTransactionPending(false);
      }
    } catch (err: any) {
      console.error("Withdraw error:", err);
      toast({
        title: "Transaction error",
        description: err.message ?? "Something went wrong",
      });
      setTransactionPending(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-[425px] ${isMobile ? 'max-w-[90%] p-4' : ''} rounded-lg`}
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: isMobile ? "90vh" : "auto",
          overflowY: "auto"
        }}
      >
        <DialogHeader className={isMobile ? "pb-2" : ""}>
          <DialogTitle className="text-xl text-center">Withdraw Assets</DialogTitle>
          <DialogDescription className="text-center">
            Withdraw USDC from your LP position
          </DialogDescription>
        </DialogHeader>

        <div className={`grid gap-3 py-2 ${isMobile ? 'py-2' : 'py-4'}`}>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount (USDC)
              </label>
              <span className="text-xs text-gray-500">
                Available: ${lpValue.toFixed(2)}
              </span>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <DollarSign className="h-4 w-4" />
              </div>
              <Input
                id="amount"
                placeholder="0.00"
                className="pl-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                step="0.01"
                min="0"
                autoComplete="off"
                inputMode="decimal"
                ref={inputRef}
                tabIndex={-1}
              />
              <Button
                type="button"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs"
                onClick={() => setAmount(lpValue.toString())}
              >
                MAX
              </Button>
            </div>

            {amount && exchangeRate > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                You will withdraw approximately {calculateLpTokenAmount()} LP tokens
              </div>
            )}

            {amount && !isAmountValid() && (
              <p className="text-xs text-red-500">
                {parseFloat(amount) > lpValue
                  ? "Insufficient USDC balance"
                  : "Please enter a valid amount"}
              </p>
            )}

            {rateError && (
              <p className="text-xs text-red-500 mt-1">{rateError}</p>
            )}
          </div>

          <div className="border rounded-md p-3 mt-1">
            <h4 className="text-sm font-medium mb-2">Withdrawal Summary</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Current USDC Value:</span>
                <span className="font-medium">${lpValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount to Withdraw:</span>
                <span className="font-medium">${amount ? parseFloat(amount).toFixed(2) : "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Remaining USDC Value:</span>
                <span className="font-medium">${calculateRemainingUsdcBalance()}</span>
              </div>
              <div className="border-t my-1.5 pt-1.5"></div>
              <div className="flex justify-between">
                <span className="text-gray-500">LP Tokens to be Burned:</span>
                <span className="font-medium text-amber-600">{calculateLpTokenAmount()} LP</span>
              </div>
            </div>
          </div>

          <div className={`rounded-md bg-amber-50 p-3 ${isMobile ? 'p-2 my-1' : 'mt-2'}`}>
            <div className="flex items-start">
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-600 flex-shrink-0 mt-0" />
              <div className="text-xs text-amber-800">
                <p className="font-medium mb-1">Important:</p>
                <p>
                  Withdrawals may be subject to pool liquidity. Large withdrawals might experience slippage.
                  The final USDC amount may vary slightly from the estimate shown above.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col space-y-3 sm:flex-col">
          <Button
            onClick={handleWithdraw}
            disabled={!amount || !isAmountValid() || isLoading || exchangeRate <= 0}
            className="bg-[#8B5CF6] hover:bg-[#7c50e6] text-white w-full py-6"
          >
            {isLoading ? "Processing..." : "Withdraw"}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-6"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
