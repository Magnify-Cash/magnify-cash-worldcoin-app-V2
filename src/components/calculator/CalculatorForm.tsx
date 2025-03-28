
import { useState } from "react";
import { Calculator } from "lucide-react";
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
    apy: 5.5,
    defaultRate: 1.5,
    loanAmount: 10000,
    loanPeriod: 6,
    interestRate: 8,
    originationFee: 1
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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Investment Parameters</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="investmentAmount">Investment Amount (USDC)</Label>
            <Input
              id="investmentAmount"
              name="investmentAmount"
              type="number"
              min="0"
              value={inputs.investmentAmount}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="apy">Target APY (%)</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="apy"
                min={0}
                max={20}
                step={0.1}
                value={[inputs.apy]}
                onValueChange={(value) => handleSliderChange("apy", value)}
                className="flex-1"
              />
              <Input
                name="apy"
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={inputs.apy}
                onChange={handleInputChange}
                className="w-20"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="defaultRate">Expected Default Rate (%)</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="defaultRate"
                min={0}
                max={10}
                step={0.1}
                value={[inputs.defaultRate]}
                onValueChange={(value) => handleSliderChange("defaultRate", value)}
                className="flex-1"
              />
              <Input
                name="defaultRate"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={inputs.defaultRate}
                onChange={handleInputChange}
                className="w-20"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-md font-medium mb-4">Loan Parameters</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="loanAmount">Total Pool Size (USDC)</Label>
              <Input
                id="loanAmount"
                name="loanAmount"
                type="number"
                min="0"
                value={inputs.loanAmount}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="loanPeriod">Loan Period (months)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="loanPeriod"
                  min={1}
                  max={24}
                  step={1}
                  value={[inputs.loanPeriod]}
                  onValueChange={(value) => handleSliderChange("loanPeriod", value)}
                  className="flex-1"
                />
                <Input
                  name="loanPeriod"
                  type="number"
                  min="1"
                  max="24"
                  value={inputs.loanPeriod}
                  onChange={handleInputChange}
                  className="w-20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="interestRate"
                  min={0}
                  max={20}
                  step={0.1}
                  value={[inputs.interestRate]}
                  onValueChange={(value) => handleSliderChange("interestRate", value)}
                  className="flex-1"
                />
                <Input
                  name="interestRate"
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={inputs.interestRate}
                  onChange={handleInputChange}
                  className="w-20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="originationFee">Origination Fee (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="originationFee"
                  min={0}
                  max={5}
                  step={0.1}
                  value={[inputs.originationFee]}
                  onValueChange={(value) => handleSliderChange("originationFee", value)}
                  className="flex-1"
                />
                <Input
                  name="originationFee"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={inputs.originationFee}
                  onChange={handleInputChange}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full">
          Calculate Returns
        </Button>
      </div>
    </form>
  );
};
