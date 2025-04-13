
import { useState } from "react";
import { Header } from "@/components/Header";
import { Container } from "@/components/ui/container";
import { CalculatorForm } from "@/components/calculator/CalculatorForm";
import { CalculatorResults } from "@/components/calculator/CalculatorResults";
import { PoolDataProvider } from "@/contexts/PoolDataContext";

export interface CalculationResult {
  // Portfolio values
  userFinalValue: number;
  userNetGain: number;
  apy: number;
  
  // Pool statistics
  totalLoans: number;
  successfulLoans: number;
  defaultedLoans: number;
  totalInterestEarned: number;
  totalLossesFromDefaults: number;
  finalPoolValue: number;
  
  // Loan details
  effectiveLoan: number;
  interestPerLoan: number;
  userShare: number;
}

export interface CalculatorInputs {
  investmentAmount: number;
  poolSize: number;
  loanPeriod: number;
  interestRate: number;
  originationFee: number;
  defaultRate: number;
  loanAmount: number;
  utilizationRate: number;
}

// Constants for calculation boundaries
const MAX_POOL_SIZE = 1_000_000;
const MAX_INTEREST_RATE = 100;
const MAX_LOAN_AMOUNT = 1000;
const MAX_ORIGINATION_FEE = 100;
const MAX_DEFAULT_RATE = 100;

const Calculator = () => {
  const [results, setResults] = useState<CalculationResult | null>(null);

  const calculateReturns = (inputs: CalculatorInputs) => {
    try {
      console.log("Raw calculator inputs:", inputs);
      
      // Ensure all inputs are valid numbers and within reasonable ranges
      const safeInputs = {
        ...inputs,
        investmentAmount: Math.max(0, inputs.investmentAmount),
        poolSize: Math.max(100, Math.min(MAX_POOL_SIZE, Math.round(inputs.poolSize))), // Ensure whole number with reasonable max
        loanPeriod: Math.max(1, Math.min(365, inputs.loanPeriod)),
        interestRate: Math.max(0, Math.min(MAX_INTEREST_RATE, inputs.interestRate)),
        originationFee: Math.max(0, Math.min(MAX_ORIGINATION_FEE, inputs.originationFee)),
        defaultRate: Math.max(0, Math.min(MAX_DEFAULT_RATE, inputs.defaultRate)),
        loanAmount: Math.max(1, Math.min(MAX_LOAN_AMOUNT, inputs.loanAmount)),
        utilizationRate: Math.max(0, Math.min(100, inputs.utilizationRate))
      };
      
      console.log("Sanitized calculator inputs:", safeInputs);

      // Step 1: Calculate actual capital utilized based on utilization rate
      const utilizedCapital = safeInputs.poolSize * (safeInputs.utilizationRate / 100);
      console.log("Utilized capital:", utilizedCapital);
      
      // Step 2: Calculate total number of loans issued by the pool
      const totalLoans = safeInputs.loanAmount > 0 ? Math.floor(utilizedCapital / safeInputs.loanAmount) : 0;
      console.log("Total loans:", totalLoans);
      
      // Step 3: Break into successful and defaulted loans
      const successfulLoans = Math.floor(totalLoans * (1 - safeInputs.defaultRate / 100));
      const defaultedLoans = Math.floor(totalLoans * (safeInputs.defaultRate / 100));
      console.log("Successful loans:", successfulLoans, "Defaulted loans:", defaultedLoans);
      
      // Step 4: Calculate earnings and losses at the pool level
      const effectiveLoan = safeInputs.loanAmount - (safeInputs.originationFee / 100 * safeInputs.loanAmount);
      const interestPerLoan = safeInputs.loanAmount * (safeInputs.interestRate / 100);
      
      const totalInterestEarned = successfulLoans * interestPerLoan;
      const totalLossesFromDefaults = defaultedLoans * effectiveLoan;
      
      const finalPoolValue = safeInputs.poolSize + totalInterestEarned - totalLossesFromDefaults;
      console.log("Final pool value components:", {
        initialPoolSize: safeInputs.poolSize,
        totalInterestEarned,
        totalLossesFromDefaults,
        finalPoolValue
      });
      
      // Step 5: Calculate the user's share and results
      const userShare = safeInputs.poolSize > 0 ? safeInputs.investmentAmount / safeInputs.poolSize : 0;
      const userFinalValue = finalPoolValue * userShare;
      const userNetGain = userFinalValue - safeInputs.investmentAmount;
      console.log("User results:", {
        userShare,
        userFinalValue,
        userNetGain
      });
      
      // Step 6: Calculate annualized return (APY)
      // Ensure we don't divide by zero
      let apy = 0;
      if (safeInputs.investmentAmount > 0 && safeInputs.loanPeriod > 0) {
        const netGainPerCycle = userNetGain / safeInputs.investmentAmount;
        // Convert days to years for APY calculation (prevent negative or infinite values)
        apy = Math.max(0, Math.pow(1 + netGainPerCycle, 365 / safeInputs.loanPeriod) - 1);
      }
      
      console.log("Calculation results:", {
        userFinalValue,
        userNetGain,
        apy,
        totalLoans,
        successfulLoans,
        defaultedLoans,
        totalInterestEarned,
        totalLossesFromDefaults,
        finalPoolValue
      });
      
      setResults({
        userFinalValue,
        userNetGain,
        apy,
        totalLoans,
        successfulLoans,
        defaultedLoans,
        totalInterestEarned,
        totalLossesFromDefaults,
        finalPoolValue,
        effectiveLoan,
        interestPerLoan,
        userShare
      });
    } catch (error) {
      console.error("Error in calculation:", error);
      // Provide fallback results or show error to user
      setResults(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Yield Calculator" />
      
      <Container className="max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-[#1A1E8F] via-[#5A1A8F] to-[#A11F75] text-transparent bg-clip-text">
            Yield Calculator
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Estimate your potential earnings as a lender in World Chain liquidity pools.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <PoolDataProvider>
              <CalculatorForm onCalculate={calculateReturns} />
            </PoolDataProvider>
          </div>
          <div>
            <CalculatorResults results={results} />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Calculator;
