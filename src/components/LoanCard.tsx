
import { Globe, IdCard, ScanLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type IconType = "passport" | "world" | "orb";

export const LoanCard = ({
  title,
  amount,
  interest,
  duration,
  icon = "world",
}: {
  title: string;
  amount: string;
  interest: string;
  duration: string;
  icon?: IconType;
}) => {
  const getIcon = (): { Icon: LucideIcon; color: string } => {
    switch (icon) {
      case "passport":
        return { Icon: IdCard, color: "text-[#7E22CE]" };
      case "orb":
        return { Icon: ScanLine, color: "text-[#BE185D]" };
      default:
        return { Icon: Globe, color: "text-[#4338CA]" };
    }
  };

  const { Icon, color } = getIcon();

  return (
    <div className="glass-card w-full p-6 mb-1 flex flex-col justify-between 
                    hover:shadow-[0_0_15px_rgba(126,34,206,0.1)] 
                    transition-all duration-300 
                    border border-gray-100/20 
                    hover:border-[#7E22CE]/20">
      <div>
        <div className="flex items-center mb-4">
          <Icon className={`w-8 h-8 mr-3 ${color}`} />
          <h3 className="text-lg font-medium bg-gradient-to-r from-[#4338CA] via-[#7E22CE] to-[#BE185D] bg-clip-text text-transparent">
            {title}
          </h3>
        </div>
      </div>
      <div className="space-y-2 mt-auto">
        <p className="text-gray-600 flex items-center justify-between">
          <span>Loan Amount:</span>
          <span className="font-medium">{amount}</span>
        </p>
        <p className="text-gray-600 flex items-center justify-between">
          <span>Interest Rate:</span>
          <span className="font-medium">{interest}</span>
        </p>
        <p className="text-gray-600 flex items-center justify-between">
          <span>Duration:</span>
          <span className="font-medium">{duration}</span>
        </p>
      </div>
    </div>
  );
};
