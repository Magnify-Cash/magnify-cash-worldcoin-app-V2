import { useState, useEffect } from "react";
import { Calculator, Sliders, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalculatorInputs } from "@/pages/Calculator";
import { usePoolData } from "@/contexts/PoolDataContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalculatorFormProps {
  onCalculate: (inputs: CalculatorInputs) => void;
}

export const CalculatorForm = ({ onCalculate }: CalculatorFormProps) => {
  // Get pool data for the dropdown
  const { pools, loading } = usePoolData();
  const isMobile = useIsMobile();
  
  const [inputs, setInputs] = useState<CalculatorInputs>({
    investmentAmount: 1000,
    poolSize: 10000,
    loanPeriod: 30,
    interestRate: 8.5,
    originationFee: 10,
    defaultRate: 5,
    loanAmount: 10,
    utilizationRate: 80
  });

  const [selectedPool, setSelectedPool] = useState<string>("custom");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For poolSize, ensure it's a whole number
    if (name === "poolSize") {
      const parsedValue = Math.round(parseFloat(value) || 0);
      setInputs((prev) => ({
        ...prev,
        [name]: parsedValue
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    }
  };

  const handleSliderChange = (name: keyof CalculatorInputs, value: number[]) => {
    setInputs((prev) => ({
      ...prev,
      [name]: value[0]
    }));
  };

  const handlePoolSelect = (value: string) => {
    setSelectedPool(value);
    
    if (value === "custom") {
      return; // Don't change any values if custom is selected
    }

    // Find the selected pool
    const selectedPoolData = pools.find(pool => pool.contract_address === value);
    
    if (selectedPoolData && selectedPoolData.borrower_info) {
      try {
        // Update loan terms based on the selected pool
        const poolSize = Math.round(selectedPoolData.total_value_locked || 10000);
        
        // Safely parse loan period
        let loanPeriod = 30; // Default value
        if (selectedPoolData.borrower_info.loanPeriodDays) {
          const parsedLoanPeriod = parseInt(String(selectedPoolData.borrower_info.loanPeriodDays), 10);
          if (!isNaN(parsedLoanPeriod) && parsedLoanPeriod > 0) {
            loanPeriod = Math.min(parsedLoanPeriod, 30); // Cap at 30 days to avoid extreme values
          }
        }
        
        // Safely parse interest rate (removing % symbol if present)
        let interestRate = 8.5; // Default value
        if (selectedPoolData.borrower_info.interestRate) {
          const interestRateStr = String(selectedPoolData.borrower_info.interestRate).replace('%', '');
          const parsedInterestRate = parseFloat(interestRateStr);
          if (!isNaN(parsedInterestRate)) {
            interestRate = Math.min(parsedInterestRate, 30); // Cap at 30% to avoid extreme values
          }
        }
        
        // Safely parse loan amount (removing $ symbol if present)
        let loanAmount = 10; // Default value
        if (selectedPoolData.borrower_info.loanAmount) {
          const loanAmountStr = String(selectedPoolData.borrower_info.loanAmount).replace('$', '');
          const parsedLoanAmount = parseFloat(loanAmountStr);
          if (!isNaN(parsedLoanAmount)) {
            loanAmount = Math.min(parsedLoanAmount, 50); // Cap at 50 to avoid extreme values
          }
        }
        
        // Safely parse origination fee (removing % symbol if present)
        let originationFee = 10; // Default value
        if (selectedPoolData.borrower_info.originationFee) {
          const originationFeeStr = String(selectedPoolData.borrower_info.originationFee).replace('%', '');
          const parsedOriginationFee = parseFloat(originationFeeStr);
          if (!isNaN(parsedOriginationFee)) {
            originationFee = Math.min(parsedOriginationFee, 30); // Cap at 30% to avoid extreme values
          }
        }
        
        // Update the inputs with validated values
        setInputs(prev => ({
          ...prev,
          poolSize,
          loanPeriod,
          interestRate,
          loanAmount,
          originationFee
        }));
        
        console.log("Updated inputs from pool template:", {
          poolSize,
          loanPeriod,
          interestRate,
          loanAmount,
          originationFee
        });
      } catch (error) {
        console.error("Error parsing pool data:", error);
        // Keep current values on error
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(inputs);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-[#8B5CF6]/10">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Calculator className="w-5 h-5 text-[#8B5CF6]" />
        <h2 className="text-xl font-semibold">Pool Parameters</h2>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="investmentAmount">Your Investment (USDC)</Label>
            <Input
              id="investmentAmount"
              name="investmentAmount"
              type="number"
              min="10"
              value={inputs.investmentAmount}
              onChange={handleInputChange}
              className="mt-1 focus-visible:ring-[#8B5CF6]"
            />
          </div>

          <div>
            <Label htmlFor="poolSize">Total Pool Size (USDC)</Label>
            <Input
              id="poolSize"
              name="poolSize"
              type="number"
              min="100"
              step="1"
              value={inputs.poolSize}
              onChange={handleInputChange}
              className="mt-1 focus-visible:ring-[#8B5CF6]"
            />
          </div>

          <div>
            <Label htmlFor="utilizationRate">Pool Utilization Rate (%)</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="utilizationRate"
                min={0}
                max={100}
                step={1}
                value={[inputs.utilizationRate]}
                onValueChange={(value) => handleSliderChange("utilizationRate", value)}
                className="flex-1"
              />
              <Input
                name="utilizationRate"
                type="number"
                min="0"
                max="100"
                value={inputs.utilizationRate}
                onChange={handleInputChange}
                className="w-20 focus-visible:ring-[#8B5CF6]"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Percentage of pool capital being used for loans</p>
          </div>
          
          <div>
            <Label htmlFor="defaultRate" className="flex items-center justify-between">
              <span>Default Rate (%)</span>
              <span className="text-xs text-gray-500">% of loans that default</span>
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                id="defaultRate"
                min={0}
                max={100}
                step={0.1}
                value={[inputs.defaultRate]}
                onValueChange={(value) => handleSliderChange("defaultRate", value)}
                className="flex-1"
              />
              <Input
                name="defaultRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={inputs.defaultRate}
                onChange={handleInputChange}
                className="w-20 focus-visible:ring-[#8B5CF6]"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-[#8B5CF6]" />
              <h3 className="text-md font-medium">Loan Terms</h3>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="poolSelect" className="block text-sm mb-1">Pool Template:</Label>
              <Select value={selectedPool} onValueChange={handlePoolSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a pool" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  {pools.map((pool) => (
                    <SelectItem key={pool.id} value={pool.contract_address || `pool-${pool.id}`}>
                      {pool.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="loanAmount">Loan Amount per Borrower (USDC)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="loanAmount"
                  min={10}
                  max={50}
                  step={10}
                  value={[inputs.loanAmount]}
                  onValueChange={(value) => handleSliderChange("loanAmount", value)}
                  className="flex-1"
                />
                <Input
                  name="loanAmount"
                  type="number"
                  min="10"
                  max="50"
                  step="10"
                  value={inputs.loanAmount}
                  onChange={handleInputChange}
                  className="w-20 focus-visible:ring-[#8B5CF6]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="loanPeriod">Loan Period (days)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="loanPeriod"
                  min={7}
                  max={30}
                  step={1}
                  value={[inputs.loanPeriod]}
                  onValueChange={(value) => handleSliderChange("loanPeriod", value)}
                  className="flex-1"
                />
                <Input
                  name="loanPeriod"
                  type="number"
                  min="7"
                  max="30"
                  value={inputs.loanPeriod}
                  onChange={handleInputChange}
                  className="w-20 focus-visible:ring-[#8B5CF6]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="interestRate"
                  min={1}
                  max={30}
                  step={0.1}
                  value={[inputs.interestRate]}
                  onValueChange={(value) => handleSliderChange("interestRate", value)}
                  className="flex-1"
                />
                <Input
                  name="interestRate"
                  type="number"
                  min="1"
                  max="30"
                  step="0.1"
                  value={inputs.interestRate}
                  onChange={handleInputChange}
                  className="w-20 focus-visible:ring-[#8B5CF6]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="originationFee">Origination Fee (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="originationFee"
                  min={1}
                  max={30}
                  step={0.1}
                  value={[inputs.originationFee]}
                  onValueChange={(value) => handleSliderChange("originationFee", value)}
                  className="flex-1"
                />
                <Input
                  name="originationFee"
                  type="number"
                  min="1"
                  max="30"
                  step="0.1"
                  value={inputs.originationFee}
                  onChange={handleInputChange}
                  className="w-20 focus-visible:ring-[#8B5CF6]"
                />
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full bg-[#9b87f5] hover:bg-[#8B5CF6]/90">
          Calculate Returns
        </Button>
      </div>
    </form>
  );
};
