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
import { fetchBorrowerInfo, BorrowerInfo, prefetchBorrowerInfo, hasBorrowerInfoCache } from "@/utils/borrowerInfoUtils";
import { useToast } from "@/hooks/use-toast";

interface CalculatorFormProps {
  onCalculate: (inputs: CalculatorInputs) => void;
}

export const CalculatorForm = ({ onCalculate }: CalculatorFormProps) => {
  const { pools, loading } = usePoolData();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
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
  const [isLoadingPoolData, setIsLoadingPoolData] = useState(false);
  const [isFetchingPools, setIsFetchingPools] = useState(false);

  useEffect(() => {
    if (!loading && pools.length > 0 && !isFetchingPools) {
      setIsFetchingPools(true);
      
      const contractAddresses = pools
        .filter(pool => pool.contract_address)
        .map(pool => pool.contract_address as string);
      
      console.log(`Prefetching borrower info for ${contractAddresses.length} pools`);
      prefetchBorrowerInfo(contractAddresses)
        .finally(() => setIsFetchingPools(false));
    }
  }, [pools, loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
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

  const handlePoolSelect = async (value: string) => {
    console.log(`Pool template selected: ${value}`);
    setSelectedPool(value);
    
    if (value === "custom") {
      console.log("Using custom settings, no pool data needed");
      return;
    }

    const selectedPoolData = pools.find(pool => pool.contract_address === value);
    
    if (selectedPoolData) {
      try {
        const hasCache = hasBorrowerInfoCache(value);
        if (!hasCache) {
          setIsLoadingPoolData(true);
        }
        
        const poolSize = Math.round(selectedPoolData.total_value_locked || 10000);
        console.log(`Selected pool size: ${poolSize}`);
        
        setInputs(prev => ({
          ...prev,
          poolSize
        }));
        
        if (selectedPoolData.contract_address) {
          console.log(`Fetching borrower info for contract: ${selectedPoolData.contract_address}`);
          
          const borrowerInfo = await fetchBorrowerInfo(selectedPoolData.contract_address);
          console.log("Fetched and processed borrower info:", borrowerInfo);
          
          const loanPeriod = Math.min(Math.max(7, borrowerInfo.loanPeriodDays), 30);
          const interestRate = Math.min(Math.max(1, borrowerInfo.interestRate), 30);
          const loanAmount = Math.min(Math.max(10, borrowerInfo.loanAmount), 50);
          const originationFee = Math.min(Math.max(1, borrowerInfo.originationFee), 30);
          
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
        }
      } catch (error) {
        console.error("Error processing pool data:", error);
        toast({
          title: "Error loading pool data",
          description: "Could not load borrower information for this pool. Using defaults instead.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingPoolData(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validatedInputs = {
      ...inputs,
      investmentAmount: Math.max(10, inputs.investmentAmount),
      poolSize: Math.max(100, inputs.poolSize),
      loanPeriod: Math.min(Math.max(7, inputs.loanPeriod), 30),
      interestRate: Math.min(Math.max(1, inputs.interestRate), 30),
      originationFee: Math.min(Math.max(1, inputs.originationFee), 30),
      defaultRate: Math.min(Math.max(0, inputs.defaultRate), 100),
      loanAmount: Math.min(Math.max(10, inputs.loanAmount), 50),
      utilizationRate: Math.min(Math.max(0, inputs.utilizationRate), 100)
    };
    
    console.log("Submitting validated calculator inputs:", validatedInputs);
    onCalculate(validatedInputs);
  };

  const isDropdownDisabled = loading && !pools.length;

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-[#8B5CF6]/10">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Calculator className="w-5 h-5 text-[#8B5CF6]" />
        <h2 className="text-xl font-semibold">Pool Parameters</h2>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-4">
          <div className="mb-4">
            <Label htmlFor="poolSelect" className="block text-sm mb-1">Pool Template:</Label>
            <Select value={selectedPool} onValueChange={handlePoolSelect} disabled={isDropdownDisabled}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={
                  loading && !pools.length ? "Loading pools..." : 
                  isLoadingPoolData ? "Loading pool data..." : 
                  "Select a pool"
                } />
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
            {isLoadingPoolData && (
              <p className="text-xs text-[#8B5CF6] mt-1">Loading pool data...</p>
            )}
            {isFetchingPools && (
              <p className="text-xs text-gray-500 mt-1">Pre-fetching pool templates in background...</p>
            )}
          </div>
        
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
