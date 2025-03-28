
import { useState } from "react";
import { Header } from "@/components/Header";
import { Container } from "@/components/ui/container";
import { CalculatorForm } from "@/components/calculator/CalculatorForm";
import { CalculatorResults } from "@/components/calculator/CalculatorResults";

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

  // LP token specific
  lpTokenEntryPrice: number;
  lpTokenCurrentPrice: number;
  priceBasedReturn: number;
  timeAdjustedApy: number;
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
  lpTokenEntryPrice: number;
  lpTokenCurrentPrice: number;
  timeElapsed: number;
}

const Calculator = () => {
  const [results, setResults] = useState<CalculationResult | null>(null);

  const calculateReturns = (inputs: CalculatorInputs) => {
    const {
      investmentAmount,
      poolSize,
      loanPeriod,
      interestRate,
      originationFee,
      defaultRate,
      loanAmount,
      utilizationRate,
      lpTokenEntryPrice,
      lpTokenCurrentPrice,
      timeElapsed
    } = inputs;

    // Step 1: Calculate actual capital utilized based on utilization rate
    const utilizedCapital = poolSize * (utilizationRate / 100);
    
    // Step 2: Calculate total number of loans issued by the pool
    const totalLoans = utilizedCapital / loanAmount;
    
    // Step 3: Break into successful and defaulted loans
    const successfulLoans = totalLoans * (1 - defaultRate / 100);
    const defaultedLoans = totalLoans * (defaultRate / 100);
    
    // Step 4: Calculate earnings and losses at the pool level
    const effectiveLoan = loanAmount - (originationFee / 100 * loanAmount);
    const interestPerLoan = loanAmount * (interestRate / 100);
    
    const totalInterestEarned = successfulLoans * interestPerLoan;
    const totalLossesFromDefaults = defaultedLoans * effectiveLoan;
    
    const finalPoolValue = poolSize + totalInterestEarned - totalLossesFromDefaults;
    
    // Step 5: Calculate the user's share and results
    const userShare = investmentAmount / poolSize;
    const userFinalValue = finalPoolValue * userShare;
    const userNetGain = userFinalValue - investmentAmount;
    
    // Step 6: Calculate annualized return (APY)
    const netGainPerCycle = userNetGain / investmentAmount;
    // Convert days to years for APY calculation
    const apy = Math.pow(1 + netGainPerCycle, 365 / loanPeriod) - 1;
    
    // Step 7: Calculate LP token price-based return
    // This represents gain/loss from buying LP tokens at a different price than "par" value (1.0)
    const priceBasedReturn = (lpTokenCurrentPrice / lpTokenEntryPrice - 1) * investmentAmount;
    
    // Step 8: Calculate time-adjusted APY based on partial completion of loan term
    // If user bought LP tokens during the loan period, adjust APY accordingly
    const remainingPeriod = Math.max(0, loanPeriod - timeElapsed);
    const timeAdjustedApy = timeElapsed > 0 ? 
      Math.pow(1 + (userNetGain + priceBasedReturn) / investmentAmount, 365 / remainingPeriod) - 1 :
      apy;
    
    setResults({
      userFinalValue: userFinalValue + priceBasedReturn,
      userNetGain: userNetGain + priceBasedReturn,
      apy,
      totalLoans,
      successfulLoans,
      defaultedLoans,
      totalInterestEarned,
      totalLossesFromDefaults,
      finalPoolValue,
      effectiveLoan,
      interestPerLoan,
      userShare,
      lpTokenEntryPrice,
      lpTokenCurrentPrice,
      priceBasedReturn,
      timeAdjustedApy
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Yield Calculator" />
      
      <Container className="max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Yield Calculator
          </h1>
          <p className="text-gray-600">
            Estimate your potential earnings as a lender in World Chain liquidity pools.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CalculatorForm onCalculate={calculateReturns} />
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
