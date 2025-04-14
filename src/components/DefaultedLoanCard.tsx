
import { Button } from "@/components/ui/button";
import { DefaultedLoanData } from "@/hooks/useDefaultedLoans";
import { cn } from "@/utils/tailwind";

interface DefaultedLoanCardProps {
  loan: DefaultedLoanData;
  onRepay: () => void;
  isProcessing: boolean;
}

export const DefaultedLoanCard = ({ 
  loan, 
  onRepay, 
  isProcessing 
}: DefaultedLoanCardProps) => {
  // Convert timestamp to Date
  const loanDate = new Date(parseInt(loan.loanTimestamp) * 1000);
  
  return (
    <div className={cn(
      "rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border",
      "border-[#ea384c]/20",
      "transform hover:-translate-y-1"
    )}>
      <div className="bg-gradient-to-r from-[#ea384c]/10 via-[#f87171]/5 to-transparent px-6 py-4">
        <div className="flex items-center justify-center">
          <span className="text-[#ea384c] text-sm font-semibold">
            Defaulted
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <div className="text-gray-500 text-sm mb-1">
              <span>Loan Amount</span>
            </div>
            <p className="text-lg font-bold">${loan.loanAmount.toFixed(2)}</p>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-500 text-sm mb-1">
              <span>Interest ({loan.penaltyFee.toFixed(2)}%)</span>
            </div>
            <p className="text-lg font-bold">${loan.interestAmount.toFixed(2)}</p>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-500 text-sm mb-1">
              <span>Total Amount Due</span>
            </div>
            <p className="text-lg font-bold">${loan.totalDueAmount.toFixed(2)}</p>
          </div>
          
          <div className="space-y-1">
            <div className="text-gray-500 text-sm mb-1">
              <span>Loan Date</span>
            </div>
            <p className="text-lg font-bold">
              {loanDate.toLocaleDateString("en-US", {
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
          {isProcessing ? "Processing..." : "Repay Defaulted Loan"}
        </Button>
      </div>
    </div>
  );
};
