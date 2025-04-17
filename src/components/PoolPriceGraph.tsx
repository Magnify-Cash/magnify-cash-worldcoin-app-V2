
import { useState } from "react";
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
  const [timeframe, setTimeframe] = useState<"hours" | "days">("hours");
  
  // Fallback contract address for development if not provided
  const poolContract = contractAddress || `0x${poolId}abc123def456`;
  
  // Use our hook to fetch price data
  const { priceData, isLoading, error } = useLPTokenHistory(poolContract);
  
  // Process the data based on selected timeframe
  const processedData = (() => {
    if (!priceData.length) return [];
    
    if (timeframe === "hours") {
      // For hourly view, take the last 24 hours of data
      const hourlyData = priceData
        .map(item => ({
          date: new Date(parseInt(item.timestamp) * 1000),
          price: parseFloat(item.token_price)
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      
      return hourlyData.slice(-24).map(item => ({
        date: item.date.getHours() + ':00',
        price: item.price
      }));
    } else {
      // For daily view, group by day
      const dailyMap = new Map();
      
      priceData.forEach(item => {
        const date = new Date(parseInt(item.timestamp) * 1000);
        const dayKey = `${date.getMonth() + 1}/${date.getDate()}`;
        
        if (!dailyMap.has(dayKey)) {
          dailyMap.set(dayKey, []);
        }
        
        dailyMap.get(dayKey).push(parseFloat(item.token_price));
      });
      
      // Calculate daily averages
      const dailyData = Array.from(dailyMap.entries()).map(([date, prices]) => {
        const avgPrice = prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length;
        return {
          date,
          price: parseFloat(avgPrice.toFixed(4))
        };
      });
      
      // Sort by date and limit to 30 days
      return dailyData
        .sort((a, b) => {
          const [aMonth, aDay] = a.date.split('/').map(Number);
          const [bMonth, bDay] = b.date.split('/').map(Number);
          return (aMonth * 100 + aDay) - (bMonth * 100 + bDay);
        })
        .slice(-30);
    }
  })();
  
  // Check if we have enough data to show the different views
  const hasEnoughDataForDailyView = priceData.length >= 3;
  
  // Check if we have enough data to show the graph (at least 2 points)
  const hasEnoughDataForGraph = processedData.length >= 2;
  
  // Calculate min and max for yAxis domain with some padding
  const prices = processedData.map(d => d.price);
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
    if (timeframe === "hours") {
      return isMobile ? 3 : 2; // Show every 2nd or 3rd hour
    } else {
      return isMobile ? 6 : 3; // Show every 3rd or 6th day
    }
  };

  // Calculate initial reference line value (starting price)
  const referencePrice = processedData.length > 0 ? processedData[0].price : 1.0;

  return (
    <Card className="w-full border border-[#9b87f5]/20 overflow-hidden">
      <CardHeader className="pb-2 pt-4 bg-gradient-to-r from-[#9b87f5]/10 to-[#7E69AB]/5">
        <div className="flex flex-col items-center justify-center">
          <CardTitle className="text-xl flex items-center gap-2 mb-3 text-center">
            <LineChart className="h-5 w-5 text-[#9b87f5]" />
            {symbol} Token Price
          </CardTitle>
          
          {/* Only show toggle if we have enough data */}
          {hasEnoughDataForGraph && (
            <ToggleGroup 
              type="single" 
              value={timeframe} 
              onValueChange={(value) => value && setTimeframe(value as "hours" | "days")}
              className="mx-auto"
            >
              <ToggleGroupItem 
                value="hours" 
                aria-label="View by hours" 
                className="text-xs px-3 py-1 bg-white hover:bg-gray-100 data-[state=on]:bg-[#9b87f5] data-[state=on]:text-white"
              >
                Hours
              </ToggleGroupItem>
              
              {/* Only show days toggle if we have enough data */}
              {hasEnoughDataForDailyView && (
                <ToggleGroupItem 
                  value="days" 
                  aria-label="View by days" 
                  className="text-xs px-3 py-1 bg-white hover:bg-gray-100 data-[state=on]:bg-[#9b87f5] data-[state=on]:text-white"
                >
                  Days
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
          </div>
        ) : !hasEnoughDataForGraph ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-500">
            <LineChart className="h-8 w-8 mb-2 text-gray-300" />
            <p className="text-sm">Insufficient price history</p>
            <p className="text-xs mt-1 text-gray-400">At least 2 data points required</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={processedData}
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
                  return "$" + value.toFixed(4);
                }}
                width={isMobile ? 45 : 50}
                tickCount={isMobile ? 5 : 6}
                padding={{ top: 10, bottom: 10 }}
              />
              
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const formattedDate = timeframe === 'hours' 
                      ? `Today at ${payload[0].payload.date}`
                      : payload[0].payload.date;
                    
                    // Fixed: Ensure the value is a number before calling toFixed
                    const price = payload[0].value;
                    const formattedPrice = typeof price === 'number' 
                      ? price.toFixed(4) 
                      : typeof price === 'string' 
                        ? parseFloat(price).toFixed(4)
                        : '0.0000';
                    
                    return (
                      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md rounded-md p-2 text-xs">
                        <p className="font-medium">{formattedDate}</p>
                        <div className="pt-1">
                          <p style={{ color: poolColor }} className="font-semibold">
                            ${formattedPrice}
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
