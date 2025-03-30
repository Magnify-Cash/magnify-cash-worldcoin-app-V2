
import { useState } from "react";
import { Calculator, Sliders, Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CalculatorInputs } from "@/pages/Calculator";

interface CalculatorFormProps {
  onCalculate: (inputs: CalculatorInputs) => void;
}

export const CalculatorForm = ({ onCalculate }: CalculatorFormProps) => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSliderChange = (name: keyof CalculatorInputs, value: number[]) => {
    setInputs((prev) => ({
      ...prev,
      [name]: value[0]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(inputs);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-[#8B5CF6]/10">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-[#8B5CF6]" />
        <h2 className="text-xl font-semibold">Pool Parameters</h2>
      </div>

      <div className="space-y-6">
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
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-md font-medium mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#8B5CF6]" />
            Loan Terms
          </h3>
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
        </div>

        <Button type="submit" className="w-full bg-[#9b87f5] hover:bg-[#8B5CF6]/90">
          Calculate Returns
        </Button>
      </div>
    </form>
  );
};
