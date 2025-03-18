
import { useState, useEffect } from "react";
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

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  lpBalance: number;
  lpValue: number;
}

export function WithdrawModal({ isOpen, onClose, lpBalance, lpValue }: WithdrawModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  
  // Exchange rate - in a real app, this would come from a contract or API
  const exchangeRate = lpValue / lpBalance; // Value per LP token in USDC
  
  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setIsLoading(false);
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
    return "0.00";
  };
  
  const handleWithdraw = () => {
    setIsLoading(true);
    
    // Here you would integrate with the world app transaction modal
    // For now, we'll simply mock this with a timeout
    setTimeout(() => {
      toast({
        title: "Withdrawal initiated",
        description: `You have successfully withdrawn ${amount} USDC (${calculateLpTokenAmount()} LP tokens)`,
      });
      setIsLoading(false);
      onClose();
      setAmount("");
    }, 1500);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`sm:max-w-[425px] mx-auto ${isMobile ? 'p-3 px-4' : ''}`}
        style={{ 
          left: "50%", 
          transform: "translate(-50%, -50%)",
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
            
            {amount && (
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
              <AlertTriangle className={`mr-2 h-4 w-4 text-amber-600 ${isMobile ? 'mt-0' : 'mt-0.5'}`} />
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
        
        <DialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between">
          <Button 
            onClick={handleWithdraw} 
            disabled={!amount || !isAmountValid() || isLoading}
            className="bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] hover:opacity-90 border-0 text-white w-full sm:w-auto"
          >
            {isLoading ? "Processing..." : "Withdraw"}
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading} 
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
