
import { DollarSign, Percent, Calendar, Info } from "lucide-react";
import { CalculationResult } from "@/pages/Calculator";

interface CalculatorResultsProps {
  results: CalculationResult | null;
}

export const CalculatorResults = ({ results }: CalculatorResultsProps) => {
  if (!results) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center h-full flex flex-col justify-center">
        <h3 className="text-lg font-medium text-gray-500 mb-2">
          No Results Yet
        </h3>
        <p className="text-gray-400 text-sm">
          Fill in the parameters and calculate to see your potential returns
        </p>
      </div>
    );
  }

  const {
    totalEarnings,
    interestEarned,
    feesEarned,
    returnOnInvestment,
    estimatedAPY,
    potentialLoss,
    netReturn,
  } = results;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  // Determine color based on net return
  const getReturnColorClass = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const netReturnColorClass = getReturnColorClass(netReturn);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-primary" />
        Results
      </h3>

      <div className="space-y-5">
        <div className="border-b border-gray-100 pb-4">
          <div className="flex items-baseline justify-between mb-1">
            <h4 className="text-sm font-medium text-gray-500">Net Return:</h4>
            <span className={`text-2xl font-bold ${netReturnColorClass}`}>
              {formatCurrency(netReturn)}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h4 className="text-sm font-medium text-gray-500">ROI:</h4>
            <span className={`text-lg font-semibold ${netReturnColorClass}`}>
              {formatPercent(returnOnInvestment)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Estimated APY</span>
            </div>
            <span className="font-medium">{formatPercent(estimatedAPY)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm">Total Earnings</span>
            </div>
            <span className="font-medium">{formatCurrency(totalEarnings)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-purple-500" />
              <span className="text-sm">Interest Earned</span>
            </div>
            <span className="font-medium">{formatCurrency(interestEarned)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-500" />
              <span className="text-sm">Fees Earned</span>
            </div>
            <span className="font-medium">{formatCurrency(feesEarned)}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-red-500" />
              <span className="text-sm">Potential Loss</span>
            </div>
            <span className="font-medium text-red-500">
              {formatCurrency(potentialLoss)}
            </span>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p>
            Note: These calculations are estimates based on the provided parameters. 
            Actual returns may vary based on market conditions and other factors.
          </p>
        </div>
      </div>
    </div>
  );
};
