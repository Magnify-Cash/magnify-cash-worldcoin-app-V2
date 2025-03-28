
import { useState } from "react";
import { Header } from "@/components/Header";
import { Container } from "@/components/ui/container";
import { CalculatorForm } from "@/components/calculator/CalculatorForm";
import { CalculatorResults } from "@/components/calculator/CalculatorResults";

export interface CalculationResult {
  totalEarnings: number;
  interestEarned: number;
  feesEarned: number;
  returnOnInvestment: number;
  estimatedAPY: number;
  potentialLoss: number;
  netReturn: number;
}

export interface CalculatorInputs {
  investmentAmount: number;
  apy: number;
  defaultRate: number;
  loanAmount: number;
  loanPeriod: number;
  interestRate: number;
  originationFee: number;
}

const Calculator = () => {
  const [results, setResults] = useState<CalculationResult | null>(null);

  const calculateReturns = (inputs: CalculatorInputs) => {
    const {
      investmentAmount,
      apy,
      defaultRate,
      loanAmount,
      loanPeriod,
      interestRate,
      originationFee
    } = inputs;

    // Calculate interest earned
    const annualInterestRate = interestRate / 100;
    const loanPeriodYears = loanPeriod / 12;
    const interestEarned = loanAmount * annualInterestRate * loanPeriodYears * (investmentAmount / loanAmount);
    
    // Calculate fees earned
    const feesEarned = loanAmount * (originationFee / 100) * (investmentAmount / loanAmount);
    
    // Calculate potential loss due to defaults
    const potentialLoss = investmentAmount * (defaultRate / 100);
    
    // Calculate net return
    const totalEarnings = interestEarned + feesEarned;
    const netReturn = totalEarnings - potentialLoss;
    
    // Calculate ROI
    const returnOnInvestment = (netReturn / investmentAmount) * 100;
    
    // Annualized APY
    const estimatedAPY = (returnOnInvestment / loanPeriodYears);
    
    setResults({
      totalEarnings,
      interestEarned,
      feesEarned,
      returnOnInvestment,
      estimatedAPY,
      potentialLoss,
      netReturn
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Lender's Calculator" />
      
      <Container className="max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Lending Returns Calculator
          </h1>
          <p className="text-gray-600">
            Estimate your potential earnings and returns from participating in Magnify Cash lending pools.
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
