
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Clock, Percent } from "lucide-react";
import { DefaultedLoanData } from "@/hooks/useDefaultedLoans";

interface DefaultedLoanCardProps {
  loan: DefaultedLoanData;
  onRepay: () => void;
  isProcessing: boolean;
  isConfirming?: boolean; // Added the missing prop
}

export const DefaultedLoanCard = ({ 
  loan, 
  onRepay, 
  isProcessing,
  isConfirming = false // Default to false if not provided
}: DefaultedLoanCardProps) => {
  // Convert timestamp to Date
  const loanDate = new Date(parseInt(loan.loanTimestamp) * 1000);
  
  // Use either isProcessing or isConfirming to disable the button
  const isDisabled = isProcessing || isConfirming;
  
  return (
    <div className="glass-card p-6 space-y-4 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 rounded-full bg-red-300 text-black text-sm">
          <span>Defaulted Loan</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground text-start">Loan Amount</p>
            <p className="text-start font-semibold">${loan.loanAmount.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Percent className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground text-start">Interest ({loan.interestRate}%)</p>
            <p className="text-start font-semibold">${loan.interestAmount.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Percent className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground text-start">Default Penalty ({loan.penaltyFee}%)</p>
            <p className="text-start font-semibold">${loan.penaltyAmount.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground text-start">Total Amount Due</p>
            <p className="text-start font-semibold">${loan.totalDueAmount.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground text-start">Loan Date</p>
            <p className="text-start font-semibold">
              {loanDate.toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              })}
            </p>
          </div>
        </div>
      </div>

      <Button
        onClick={onRepay}
        className="w-full primary-button"
        disabled={isDisabled}
      >
        {isDisabled ? "Processing..." : "Repay Defaulted Loan"}
      </Button>
    </div>
  );
};
