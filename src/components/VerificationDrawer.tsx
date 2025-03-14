
import React, { useState, useEffect } from "react";
import { X, Loader, Check } from "lucide-react";
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

type VerificationState = 'initial' | 'verifying' | 'verified';

interface VerificationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  tier: string;
}

export function VerificationDrawer({ open, onOpenChange, onVerified, tier }: VerificationDrawerProps) {
  const [verificationState, setVerificationState] = useState<VerificationState>('initial');
  
  // Reset state when drawer opens
  useEffect(() => {
    if (open) {
      setVerificationState('initial');
    }
  }, [open]);

  const handleVerify = () => {
    setVerificationState('verifying');
    
    // Simulate verification process with a 1 second delay
    setTimeout(() => {
      setVerificationState('verified');
      
      // Close the drawer after 500ms when verified
      setTimeout(() => {
        onVerified();
        onOpenChange(false);
      }, 500);
    }, 1000);
  };

  // Create a wrapper function for close button to ensure state gets reset
  const handleClose = () => {
    setVerificationState('initial');
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] rounded-t-[30px]">
        <div className="mx-auto w-full max-w-sm">
          {/* Header layout with Transaction Request on left and X button on right */}
          <div className="flex items-center justify-between px-4 pt-6 pb-2">
            <h2 className="text-2xl font-bold">Verification Request</h2>
            <button 
              onClick={handleClose}
              className="rounded-full p-2 bg-[#F1F1F1] transition-colors hover:bg-gray-200 focus:outline-none"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* World ID logo and verification details */}
          <div className="flex flex-col items-center justify-center px-4 py-6">
            <div className="w-24 h-24 rounded-full bg-[#EEEEEE] flex items-center justify-center mb-6">
              <img 
                src="/lovable-uploads/f590c0ed-415e-4ed0-8f6b-631288f14028.png" 
                alt="World ID Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
            <h3 className="text-xl font-bold text-black text-center mb-2">
              Verify with World ID
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              World is requesting access to your World ID.
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Verification Level: <span className="font-medium">{tier}</span>
            </p>
          </div>

          <DrawerFooter className="pb-6">
            <Button 
              onClick={handleVerify}
              disabled={verificationState !== 'initial'}
              className={`w-full h-16 text-lg mb-2 ${
                verificationState === 'initial' 
                  ? 'bg-black hover:bg-black/90 text-white' 
                  : 'bg-transparent hover:bg-transparent text-black'
              }`}
            >
              {verificationState === 'initial' && 'Verify'}
              {verificationState === 'verifying' && (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Verifying
                </>
              )}
              {verificationState === 'verified' && (
                <>
                  <Check className="h-5 w-5 mr-2 text-green-500" />
                  Verified
                </>
              )}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
