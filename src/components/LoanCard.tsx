
import { Globe, IdCard, ScanLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type IconType = "passport" | "world" | "orb";

// Define interfaces for the loan and borrower info
export interface ActiveLoan {
  loanAmount: number;
  startTimestamp: number;
  isActive: boolean;
  interestRate: number;
  loanPeriod: number;
}

export interface BorrowerInfo {
  contractAddress?: string;
  loanAmount?: number;
  interestRate?: number;
  loanPeriod?: number;
}

export interface LoanCardProps {
  title?: string;
  amount?: string;
  interest?: string;
  duration?: string;
  icon?: IconType;
  // Add new props for compatibility with RepayLoan.tsx
  loan?: ActiveLoan;
  borrowerInfo?: BorrowerInfo;
  showPayButton?: boolean;
  showStatus?: boolean;
}

export const LoanCard = ({
  title,
  amount,
  interest,
  duration,
  icon = "world",
  loan,
  borrowerInfo,
  showPayButton = false,
  showStatus = false,
}: LoanCardProps) => {
  // Calculate derived props from loan object if provided
  const displayTitle = title || (loan && borrowerInfo ? "Active Loan" : "Loan");
  const displayAmount = amount || (loan ? `$${loan.loanAmount}` : "$0");
  const displayInterest = interest || (loan ? `${loan.interestRate / 100}%` : "0%");
  const displayDuration = duration || (loan ? `${loan.loanPeriod / (24 * 60 * 60)} days` : "0 days");

  const getIcon = (): { Icon: LucideIcon; color: string } => {
    switch (icon) {
      case "passport":
        return { Icon: IdCard, color: "text-[#5A1A8F]" };
      case "orb":
        return { Icon: ScanLine, color: "text-[#A11F75]" };
      default:
        return { Icon: Globe, color: "text-[#1A1E8F]" };
    }
  };

  const { Icon, color } = getIcon();

  return (
    <div className="glass-card w-full p-6 mb-1 flex flex-col justify-between 
                    hover:shadow-[0_0_15px_rgba(90,26,143,0.1)] 
                    transition-all duration-300 
                    border border-gray-100/20 
                    hover:border-[#5A1A8F]/20">
      <div>
        <div className="flex items-center mb-4">
          <Icon className={`w-8 h-8 mr-3 ${color}`} />
          <h3 className="text-lg font-medium bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] bg-clip-text text-transparent">
            {displayTitle}
          </h3>
        </div>
      </div>
      <div className="space-y-2 mt-auto">
        <p className="text-gray-600 flex items-center justify-between">
          <span>Loan Amount:</span>
          <span className="font-medium">{displayAmount}</span>
        </p>
        <p className="text-gray-600 flex items-center justify-between">
          <span>Interest Rate:</span>
          <span className="font-medium">{displayInterest}</span>
        </p>
        <p className="text-gray-600 flex items-center justify-between">
          <span>Duration:</span>
          <span className="font-medium">{displayDuration}</span>
        </p>
        {showStatus && loan && (
          <p className="text-gray-600 flex items-center justify-between">
            <span>Status:</span>
            <span className={`font-medium ${loan.isActive ? "text-green-600" : "text-red-600"}`}>
              {loan.isActive ? "Active" : "Inactive"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
