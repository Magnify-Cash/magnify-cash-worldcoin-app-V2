
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

interface SupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupplyModal({ isOpen, onClose }: SupplyModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  
  // Mock wallet balance - in a real app, this would come from a wallet hook
  const walletBalance = 1000; // Example balance in USDC
  
  // Mock exchange rate - in a real app, this would come from a contract or API
  const exchangeRate = 0.95; // 1 USDC = 0.95 LP tokens
  
  const isAmountValid = () => {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0 && numAmount <= walletBalance;
  };
  
  const handleSupply = () => {
    setIsLoading(true);
    
    // Here you would integrate with the world app transaction modal
    // For now, we'll simply mock this with a timeout
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
  
  // Calculate LP tokens based on input amount
  const calculateLPTokens = () => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      return (numAmount * exchangeRate).toFixed(4);
    }
    return "0.0000";
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[425px] ${isMobile ? 'p-4 mx-4' : ''}`}>
        <DialogHeader>
          <DialogTitle className="text-xl">Supply Assets</DialogTitle>
          <DialogDescription>
            Provide liquidity to earn yield and $MAG rewards
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
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
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="amount"
                placeholder="0.00"
                className="pl-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                step="0.01"
                min="0"
              />
              <Button
                type="button"
                variant="ghost"
                className="absolute right-1 top-1 h-6 px-2 text-xs"
                onClick={() => setAmount(walletBalance.toString())}
              >
                MAX
              </Button>
            </div>
            
            {amount && (
              <div className="text-xs text-gray-500 mt-1">
                You will receive approximately {calculateLPTokens()} LP tokens
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
          
          <div className="rounded-md bg-amber-50 p-3 mt-2">
            <div className="flex items-start">
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-600 mt-0.5" />
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
        
        <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button 
            onClick={handleSupply} 
            disabled={!amount || !isAmountValid() || isLoading}
            className="bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] hover:opacity-90 border-0 text-white w-full sm:w-auto"
          >
            {isLoading ? "Processing..." : "Supply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
