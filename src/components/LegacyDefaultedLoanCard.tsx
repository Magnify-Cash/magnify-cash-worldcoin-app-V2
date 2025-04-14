
import { Button } from "@/components/ui/button";
import { LegacyDefaultedLoanResponse } from "@/utils/types";
import { cn } from "@/utils/tailwind";

interface LegacyDefaultedLoanCardProps {
  loan: LegacyDefaultedLoanResponse;
  onRepay: () => void;
  isProcessing: boolean;
}

export const LegacyDefaultedLoanCard = ({ 
  loan, 
  onRepay, 
  isProcessing 
}: LegacyDefaultedLoanCardProps) => {
  // Calculate due date from startTime + loanPeriod
  const dueDate = new Date((loan.loan.startTime + loan.loan.loanPeriod) * 1000);
  
  return (
    <div className={cn(
      "rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border",
      "border-[#ea384c]/20",
      "transform hover:-translate-y-1"
    )}>
      <div className="bg-gradient-to-r from-[#ea384c]/10 via-[#f87171]/5 to-transparent px-6 py-4">
        <div className="flex items-center justify-center">
          <span className="text-lg font-semibold text-center">
            Defaulted Loan
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <div className="text-gray-500 text-sm mb-1">
              <span>Loan Amount</span>
            </div>
            <p className="text-lg font-bold">${loan.loan.amount.toFixed(2)}</p>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-500 text-sm mb-1">
              <span>Interest ({loan.loan.interestRate}%)</span>
            </div>
            <p className="text-lg font-bold">
              ${(loan.loan.amount * (loan.loan.interestRate / 100)).toFixed(2)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-gray-500 text-sm mb-1">
              <span>Total Amount Due</span>
            </div>
            <p className="text-lg font-bold">
              ${(loan.loan.amount * (1 + loan.loan.interestRate / 100)).toFixed(2)}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-500 text-sm mb-1">
              <span>Due Date</span>
            </div>
            <p className="text-lg font-bold">
              {dueDate.toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              })}
            </p>
          </div>
        </div>

        <Button
          onClick={onRepay}
          className={cn(
            "w-full bg-[#ea384c] hover:bg-[#d92d3f] text-white",
            "size-lg rounded-xl transition-all duration-300"
          )}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Repay Legacy Defaulted Loan"}
        </Button>
      </div>
    </div>
  );
};
