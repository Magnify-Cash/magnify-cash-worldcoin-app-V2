
import { formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, AlertTriangle } from "lucide-react";
import { DefaultedLoanData } from "@/hooks/useDefaultedLoans";

interface DefaultedLoanCardProps {
  loan: DefaultedLoanData;
  loanAmount: bigint;
  onRepay: () => void;
  isProcessing: boolean;
}

export const DefaultedLoanCard = ({ 
  loan, 
  loanAmount, 
  onRepay, 
  isProcessing 
}: DefaultedLoanCardProps) => {
  // Convert timestamp to Date
  const loanDate = new Date(parseInt(loan.loanTimestamp) * 1000);

  return (
    <div className="glass-card p-6 space-y-4 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 rounded-full bg-red-300 text-black text-sm flex items-center gap-1">
          <AlertTriangle className="w-4 h-4" />
          <span>Defaulted Loan</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground text-start">Amount Due</p>
            <p className="text-start font-semibold">${formatUnits(loanAmount, 6)}</p>
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
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : "Repay Defaulted Loan"}
      </Button>
    </div>
  );
};
