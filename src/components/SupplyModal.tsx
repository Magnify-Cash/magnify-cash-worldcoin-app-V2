
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
import { previewDeposit } from "@/lib/backendRequests";

interface SupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  poolContractAddress?: string;
  lpSymbol?: string;
}

export function SupplyModal({ isOpen, onClose, poolContractAddress, lpSymbol = "LP" }: SupplyModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewLpAmount, setPreviewLpAmount] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewRequested, setPreviewRequested] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const walletBalance = 1000;
  
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setIsLoading(false);
      setPreviewLpAmount(null);
      setPreviewRequested(false);
      
      // Focus the input when the modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchPreviewAmount = async () => {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount) && numAmount >= 10 && poolContractAddress) {
        setIsPreviewLoading(true);
        setPreviewRequested(true);
        try {
          const preview = await previewDeposit(numAmount, poolContractAddress);
          setPreviewLpAmount(preview.lpAmount);
        } catch (error) {
          console.error("Error fetching preview deposit:", error);
          setPreviewLpAmount(null);
        } finally {
          setIsPreviewLoading(false);
        }
      } else {
        setPreviewRequested(numAmount >= 10);
        setPreviewLpAmount(null);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchPreviewAmount();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [amount, poolContractAddress]);

  const isAmountValid = () => {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0 && numAmount <= walletBalance;
  };

  const handleSupply = () => {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "Supply initiated",
        description: `You have successfully supplied ${amount} USDC`,
      });
      setIsLoading(false);
      onClose();
      setAmount("");
    }, 1500);
  };

  const calculateLPTokens = () => {
    const numAmount = parseFloat(amount);
    
    if (isPreviewLoading || (previewRequested && !previewLpAmount)) {
      return "...";
    }
    
    if (previewLpAmount) {
      return previewLpAmount;
    }
    
    // Only use the fallback calculation for amounts less than 10
    return !isNaN(numAmount) && numAmount > 0 && numAmount < 10
      ? (numAmount * 0.95).toFixed(4)
      : "0.0000";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-[425px] mx-auto ${isMobile ? "p-3 px-4 max-w-[95%]" : ""}`}
        style={{
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxHeight: isMobile ? "90vh" : "auto",
          overflowY: "auto",
          width: isMobile ? "95%" : "auto",
          margin: isMobile ? "0 2.5%" : "auto",
        }}
      >
        <DialogHeader className={isMobile ? "pb-2" : ""}>
          <DialogTitle className="text-xl text-center">Supply Assets</DialogTitle>
          <DialogDescription className="text-center">
            Provide liquidity to earn yield.
          </DialogDescription>
        </DialogHeader>

        <div className={`grid gap-3 py-2 ${isMobile ? "py-2" : "py-4"}`}>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount (USDC)
              </label>
              <span className="text-xs text-gray-500">
                Balance: {walletBalance.toFixed(2)} USDC
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
                onClick={() => setAmount(walletBalance.toString())}
              >
                MAX
              </Button>
            </div>

            {amount && (
              <div className="text-xs text-gray-500 mt-1">
                You will receive {calculateLPTokens()} {lpSymbol} tokens
                {parseFloat(amount) < 10 && parseFloat(amount) > 0 && (
                  <div className="text-amber-500 mt-1">
                    Enter 10 or more USDC to see accurate LP token estimate
                  </div>
                )}
              </div>
            )}

            {amount && !isAmountValid() && (
              <p className="text-xs text-red-500">
                {parseFloat(amount) > walletBalance
                  ? "Insufficient balance in wallet"
                  : "Please enter a valid amount"}
              </p>
            )}
          </div>

          <div className={`rounded-md bg-amber-50 p-3 ${isMobile ? "p-2 my-1" : "mt-2"}`}>
            <div className="flex items-start">
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-600 flex-shrink-0 mt-0" />
              <div className="text-xs text-amber-800">
                <p className="font-medium mb-1">Risk Warning:</p>
                <p>
                  Providing liquidity involves financial risk. Your supplied funds may be subject to market fluctuations, 
                  smart contract vulnerabilities, and changes in liquidity demand. While you may earn yield, returns are 
                  not guaranteed, and withdrawal availability depends on pool liquidity. Only contribute what you can 
                  afford to lose and conduct your own research before participating.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col space-y-3 sm:flex-col">
          <Button
            onClick={handleSupply}
            disabled={!amount || !isAmountValid() || isLoading}
            className="bg-[#8B5CF6] hover:bg-[#7c50e6] text-white w-full py-6"
          >
            {isLoading ? "Processing..." : "Supply"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full py-6">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
