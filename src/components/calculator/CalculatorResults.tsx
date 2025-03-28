
import { DollarSign, Percent, TrendingUp, Info, Users, Ban, ArrowRight } from "lucide-react";
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
    userFinalValue,
    userNetGain,
    apy,
    totalLoans,
    successfulLoans,
    defaultedLoans,
    totalInterestEarned,
    totalLossesFromDefaults,
    finalPoolValue,
    userShare
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
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Determine color based on net return
  const getReturnColorClass = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const netReturnColorClass = getReturnColorClass(userNetGain);
  const apyColorClass = getReturnColorClass(apy);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-primary" />
        Your Returns
      </h3>

      <div className="space-y-5">
        <div className="border-b border-gray-100 pb-4">
          <div className="flex items-baseline justify-between mb-1">
            <h4 className="text-sm font-medium text-gray-500">Final Value:</h4>
            <span className={`text-2xl font-bold ${netReturnColorClass}`}>
              {formatCurrency(userFinalValue)}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h4 className="text-sm font-medium text-gray-500">Net Gain/Loss:</h4>
            <span className={`text-lg font-semibold ${netReturnColorClass}`}>
              {formatCurrency(userNetGain)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <TrendingUp className={`w-4 h-4 ${apyColorClass}`} />
            <span className="text-sm">Estimated APY</span>
          </div>
          <span className={`font-medium ${apyColorClass}`}>{formatPercent(apy)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm">Pool Share</span>
          </div>
          <span className="font-medium">{formatPercent(userShare)}</span>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-4">
          <h4 className="text-sm font-medium mb-3">Pool Statistics</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Total Loans:</span>
              <span className="font-medium">{formatNumber(totalLoans)}</span>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Successful Loans:</span>
              <span className="font-medium text-green-600">{formatNumber(successfulLoans)}</span>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Defaulted Loans:</span>
              <span className="font-medium text-red-600">{formatNumber(defaultedLoans)}</span>
            </div>
            
            <div className="flex justify-between text-xs mt-2">
              <span className="text-gray-500">Total Interest Earned:</span>
              <span className="font-medium text-green-600">{formatCurrency(totalInterestEarned)}</span>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Losses from Defaults:</span>
              <span className="font-medium text-red-600">{formatCurrency(totalLossesFromDefaults)}</span>
            </div>
            
            <div className="flex justify-between text-xs pt-1 border-t border-gray-100 mt-2">
              <span className="text-gray-500">Final Pool Value:</span>
              <span className="font-medium">{formatCurrency(finalPoolValue)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p>
              These calculations are based on the current pool parameters. 
              Actual returns may vary based on repayment behavior and market conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
