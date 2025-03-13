
import React from "react";
import { X, ArrowUpRight } from "lucide-react";
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { formatUnits } from "viem";

interface RepayDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repayAmount: number | bigint;
  onConfirm: () => void;
}

export function RepayDrawer({ open, onOpenChange, repayAmount, onConfirm }: RepayDrawerProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false); // Close drawer immediately
  };

  // Format the repayment amount for display
  const formattedAmount = typeof repayAmount === 'bigint' 
    ? Number(formatUnits(repayAmount, 6))
    : repayAmount;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] rounded-t-[30px]">
        <div className="mx-auto w-full max-w-sm">
          {/* Header layout with Transaction Request on left and X button on right */}
          <div className="flex items-center justify-between px-4 pt-6 pb-2">
            <h2 className="text-2xl font-bold">Transaction Request</h2>
            <button 
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 bg-[#F1F1F1] transition-colors hover:bg-gray-200 focus:outline-none"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Logo and App info section */}
          <div className="px-4 py-3 flex items-center">
            <div className="w-10 h-10 rounded-md overflow-hidden mr-3">
              <img 
                src="/lovable-uploads/a58f7265-4f91-4fe4-9870-a88ac9aadba9.jpg" 
                alt="Magnify Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-black font-bold">Demo: Magnify Cash</p>
              <p className="text-xs text-muted-foreground">https://demo.magnify.cash</p>
            </div>
          </div>
          
          <div className="px-4 py-2">
            <div className="my-4 space-y-4">
              <div className="bg-[#F1F0FB] p-4 rounded-lg space-y-4">
                <h3 className="text-xs text-muted-foreground">Transaction preview</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-black text-white p-2 rounded-full mr-3">
                      <ArrowUpRight className="h-3 w-3" />
                    </div>
                    <span className="font-medium">Send</span>
                  </div>
                  <span className="font-medium">{formattedAmount} USDC.e</span>
                </div>
              </div>
            </div>
          </div>

          <DrawerFooter className="pb-6">
            <Button 
              onClick={handleConfirm}
              className="w-full h-16 bg-black hover:bg-black/90 text-white text-lg mb-2"
            >
              Confirm
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
