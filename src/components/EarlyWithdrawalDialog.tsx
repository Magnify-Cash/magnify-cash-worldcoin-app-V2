
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EarlyWithdrawalDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  withdrawAmount: number;
  feeAmount: number;
  netAmount: number;
}

export function EarlyWithdrawalDialog({
  isOpen,
  onConfirm,
  onCancel,
  withdrawAmount,
  feeAmount,
  netAmount,
}: EarlyWithdrawalDialogProps) {
  // Calculate fee percentage for display (should be actual percentage, not decimal)
  const feePercentage = withdrawAmount > 0 ? (feeAmount / withdrawAmount * 100).toFixed(1) : '0.0';
  
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <AlertDialogTitle>Early Withdrawal Warning</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            You are withdrawing during the warm-up period. An early exit fee of ${feeAmount.toFixed(2)} USDC will be deducted from your withdrawal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="bg-amber-50 p-4 rounded-md my-3">
          <p className="text-sm text-amber-800 font-medium mb-2">Withdrawal Summary:</p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Requested Amount:</span>
              <span>${withdrawAmount.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-sm text-red-500 font-medium">
              <span>Early Exit Fee ({feePercentage}%):</span>
              <span>-${feeAmount.toFixed(2)} USDC</span>
            </div>
            <div className="border-t pt-1 mt-1"></div>
            <div className="flex justify-between text-sm font-bold">
              <span>You will receive:</span>
              <span>${netAmount.toFixed(2)} USDC</span>
            </div>
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-[#8B5CF6] hover:bg-[#7c50e6] text-white">
            Confirm Withdrawal
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
