
import { useState, useEffect } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, AlertTriangle } from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { useLPTokenHistory } from "@/hooks/useLPTokenHistory";

interface PoolPriceGraphProps {
  poolId: number;
  color?: string;
  symbol?: string;
  contractAddress?: string;
}

export function PoolPriceGraph({ 
  poolId, 
  color = "#8B5CF6", 
  symbol = "LP", 
  contractAddress 
}: PoolPriceGraphProps) {
  const isMobile = useIsMobile();
  const [timeframe, setTimeframe] = useState<"days" | "weeks">("days");
  
  // Fallback contract address for development if not provided
  const poolContract = contractAddress || `0x${poolId}abc123def456`;
  
  // Use our new hook to fetch price data
  const { priceData, isLoading, error } = useLPTokenHistory(poolContract, timeframe);
  
  // Check if we have enough data to show weekly view
  const hasEnoughDataForWeeklyView = priceData.length >= 14;
  
  // Force back to days view if we don't have enough data for weekly view
  useEffect(() => {
    if (timeframe === "weeks" && !hasEnoughDataForWeeklyView) {
      setTimeframe("days");
    }
  }, [timeframe, hasEnoughDataForWeeklyView]);
  
  // Calculate min and max for yAxis domain with some padding
  const prices = priceData.map(d => d.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) * 0.995 : 0.9;
  const maxPrice = prices.length > 0 ? Math.max(...prices) * 1.005 : 1.1;
  
  // Get color based on poolId if not provided
  const getPoolColor = () => {
    if (color) return color;
    
    switch (poolId) {
      case 1: return "#9b87f5"; // Lighter purple
      case 2: return "#10B981"; // Green
      case 3: return "#F59E0B"; // Amber
      default: return "#9b87f5"; // Default purple
    }
  };
  
  const poolColor = getPoolColor();
  
  // Get tick interval based on device and timeframe
  const getTickInterval = () => {
    if (timeframe === "days") {
      return isMobile ? 6 : 3; // Show every 3rd or 6th day
    } else {
      return isMobile ? 2 : 1; // Show every 1st or 2nd week
    }
  };

  // Calculate initial reference line value (starting price)
  const referencePrice = priceData.length > 0 ? priceData[0].price : 1.0;
  
  // Check if we have any data at all
  const hasData = priceData.length > 0;

  return (
    <Card className="w-full border border-[#9b87f5]/20 overflow-hidden">
      <CardHeader className="pb-2 pt-4 bg-gradient-to-r from-[#9b87f5]/10 to-[#7E69AB]/5">
        <div className="flex flex-col items-center justify-center">
          <CardTitle className="text-xl flex items-center gap-2 mb-3 text-center">
            <LineChart className="h-5 w-5 text-[#9b87f5]" />
            {symbol} Token Price
          </CardTitle>
          
          {/* Only show toggle if we have data */}
          {hasData && (
            <ToggleGroup 
              type="single" 
              value={timeframe} 
              onValueChange={(value) => value && setTimeframe(value as "days" | "weeks")}
              className="mx-auto"
            >
              <ToggleGroupItem 
                value="days" 
                aria-label="View by days" 
                className="text-xs px-3 py-1 bg-white hover:bg-gray-100 data-[state=on]:bg-[#9b87f5] data-[state=on]:text-white"
              >
                Days
              </ToggleGroupItem>
              
              {/* Only show weeks toggle if we have enough data */}
              {hasEnoughDataForWeeklyView && (
                <ToggleGroupItem 
                  value="weeks" 
                  aria-label="View by weeks" 
                  className="text-xs px-3 py-1 bg-white hover:bg-gray-100 data-[state=on]:bg-[#9b87f5] data-[state=on]:text-white"
                >
                  Weeks
                </ToggleGroupItem>
              )}
            </ToggleGroup>
          )}
        </div>
      </CardHeader>
      <CardContent className={`${isMobile ? "px-1 py-2" : "pt-5"} h-[260px]`}>
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="animate-pulse text-gray-400">
              Loading price data...
            </div>
          </div>
        ) : error ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-500">
            <AlertTriangle className="h-8 w-8 mb-2 text-amber-500" />
            <p className="text-sm">Error loading price data</p>
            <p className="text-xs mt-1 text-gray-400">Using fallback data</p>
          </div>
        ) : !hasData ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-500">
            <LineChart className="h-8 w-8 mb-2 text-gray-300" />
            <p className="text-sm">No price history available yet</p>
            <p className="text-xs mt-1 text-gray-400">Check back soon</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={priceData}
              margin={{
                top: 10,
                right: isMobile ? 5 : 20,
                left: isMobile ? 0 : 0,
                bottom: isMobile ? 15 : 10, // Increased bottom margin for mobile to fit dates
              }}
            >
              <defs>
                <linearGradient id={`priceGradient_${poolId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={poolColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={poolColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={!isMobile} />
              
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: isMobile ? 10 : 12, fill: "#333" }} // Darker text for better readability
                tickMargin={isMobile ? 10 : 10} // Increased space for date labels
                interval={getTickInterval()}
                padding={{ left: 10, right: 10 }}
                angle={isMobile ? -45 : 0} // Angle the dates on mobile for better fit
                textAnchor={isMobile ? "end" : "middle"} // Align text based on angle
                height={isMobile ? 50 : 30} // Increased height for angled text on mobile
              />
              
              <YAxis 
                domain={[minPrice, maxPrice]}
                tick={{ fontSize: isMobile ? 11 : 12, fill: "#333" }} // Darker text
                tickFormatter={(value) => {
                  if (typeof value !== 'number') return value;
                  return "$" + value.toFixed(3);
                }}
                width={isMobile ? 45 : 50}
                tickCount={isMobile ? 5 : 6}
                padding={{ top: 10, bottom: 10 }}
              />
              
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md rounded-md p-2 text-xs">
                        <p className="font-medium">{payload[0].payload.date}</p>
                        <div className="pt-1">
                          <p style={{ color: poolColor }} className="font-semibold">
                            ${payload[0].value}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              {/* Reference line at initial value */}
              <ReferenceLine 
                y={referencePrice} 
                stroke="#666" 
                strokeDasharray="3 3" 
              />
              
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={poolColor} 
                strokeWidth={2}
                fill={`url(#priceGradient_${poolId})`} 
                activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
