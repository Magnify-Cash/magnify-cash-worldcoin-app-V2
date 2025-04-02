
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Coins, ArrowUpRight, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { previewSupply } from "@/lib/backendRequests";
import { useWalletUSDCBalance } from "@/hooks/useWalletUSDCBalance";
import { toast } from "@/components/ui/use-toast";

interface SupplyModalProps {
  poolId: number;
  isOpen: boolean;
  onClose: () => void;
  poolContractAddress?: string;
  lpSymbol?: string;
  walletAddress?: string;
}

export function SupplyModal({ 
  poolId, 
  isOpen, 
  onClose,
  poolContractAddress = "0x1234567890123456789012345678901234567890",
  lpSymbol = "MAG-LP",
  walletAddress = "0x6835939032900e5756abFF28903d8A5E68CB39dF" 
}: SupplyModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [previewLpAmount, setPreviewLpAmount] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewRequested, setPreviewRequested] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  const { 
    balance: usdcBalance, 
    loading: balanceLoading, 
    error: balanceError,
    refreshBalance
  } = useWalletUSDCBalance(walletAddress);

  // Reset form when opening modal
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setPreviewLpAmount(null);
      setPreviewRequested(false);
      
      refreshBalance();
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, refreshBalance]);

  // Handle max button click - set amount to user's USDC balance
  const handleMaxClick = () => {
    if (!balanceLoading && !balanceError && usdcBalance > 0) {
      setAmount(usdcBalance.toString());
      handlePreview(usdcBalance.toString());
    }
  };

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numbers and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      
      // Clear preview if input is empty
      if (value === "") {
        setPreviewLpAmount(null);
        setPreviewRequested(false);
        return;
      }
      
      // Throttle preview requests as user types
      if (parseFloat(value) > 0) {
        const timeoutId = setTimeout(() => {
          handlePreview(value);
        }, 500);
        
        return () => clearTimeout(timeoutId);
      }
    }
  };

  // Get LP token preview based on USDC amount
  const handlePreview = async (value: string) => {
    try {
      setPreviewRequested(true);
      if (!poolContractAddress) {
        setPreviewLpAmount(0);
        return;
      }
      
      const preview = await previewSupply(value, poolContractAddress);
      setPreviewLpAmount(preview.lpAmountOut);
    } catch (error) {
      console.error("Error getting supply preview:", error);
      setPreviewLpAmount(null);
      toast({
        title: "Preview Error",
        description: "Could not estimate LP token amount. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Supply Successful",
        description: `You have successfully supplied USDC to the pool.`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error supplying to pool:", error);
      toast({
        title: "Supply Failed",
        description: "Failed to supply USDC to the pool. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format LP amount for display
  const formatLpAmount = () => {
    return previewLpAmount !== null 
      ? previewLpAmount.toFixed(4)
      : "0.0000";
  };

  const displayBalance = () => {
    if (balanceLoading) return "Loading...";
    if (balanceError) return "Error loading balance";
    return usdcBalance.toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`sm:max-w-[425px] ${isMobile ? 'p-4' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-purple-500" />
            Supply USDC to Pool
          </DialogTitle>
          <DialogDescription>
            Supply USDC to Pool #{poolId} to receive {lpSymbol} tokens.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="amount" className="text-sm font-medium">
                USDC Amount
              </label>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                Balance: {displayBalance()}
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  onClick={handleMaxClick}
                  disabled={balanceLoading || balanceError || usdcBalance <= 0}
                >
                  MAX
                </Button>
              </div>
            </div>
            <div className="relative">
              <Input
                id="amount"
                type="text"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                className="text-lg pr-16"
                ref={inputRef}
                disabled={isSubmitting}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 font-medium text-gray-500">
                USDC
              </div>
            </div>
          </div>
          
          {previewRequested && (
            <div className="rounded-md bg-gray-50 p-3">
              <div className="text-sm font-medium mb-1">Preview</div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">You will receive:</span>
                <span className="font-semibold">
                  {formatLpAmount()} {lpSymbol}
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                isSubmitting || 
                !amount || 
                parseFloat(amount) <= 0 || 
                parseFloat(amount) > usdcBalance
              }
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Processing
                </>
              ) : (
                <>
                  <ArrowUpRight className="mr-2 h-4 w-4" /> 
                  Supply
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
