
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
import { LineChart } from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { format, addDays, addWeeks, startOfMonth } from "date-fns";

// Generate historical price data based on pool ID and timeframe
const generatePriceData = (poolId: number, timeframe: "days" | "weeks") => {
  // Base starting price and pattern varies by pool
  let basePrice = 1.0;
  let volatility = 0.005;
  let trend = 0.002;
  
  switch (poolId) {
    case 1: // Pool A - Steady growth
      basePrice = 1.0;
      volatility = 0.003;
      trend = 0.003;
      break;
    case 2: // Pool B - Higher growth but more volatile
      basePrice = 1.0;
      volatility = 0.006;
      trend = 0.004;
      break;
    case 3: // Pool C - Lower growth, less volatile
      basePrice = 0.7; // Start at $0.70 for the example
      volatility = 0.002;
      trend = 0.002;
      break;
    default:
      break;
  }
  
  // Generate data based on timeframe
  const dataPoints = timeframe === "days" ? 30 : 12; // 30 days or 12 weeks
  
  // Get current date to start generating proper dates
  const today = new Date();
  
  const data = [];
  for (let i = 0; i < dataPoints; i++) {
    // Calculate the date - either adding days or weeks
    const currentDate = timeframe === "days" 
      ? addDays(today, i)
      : addWeeks(today, i);
    
    // Format date as MM/DD/YY
    const formattedDate = format(currentDate, "MM/dd/yy");
    
    // Simulate price movement with trend and random noise
    const noise = (Math.random() - 0.5) * volatility;
    basePrice = basePrice + trend + noise;
    
    // Add some patterns
    if (timeframe === "days") {
      // Weekend boost
      if (i % 7 === 0 || i % 7 === 6) {
        basePrice += 0.003;
      }
      
      // Pool-specific patterns
      if (i === 15 && poolId === 1) basePrice += 0.01; // Mid-month boost for Pool A
      if (i === 10 && poolId === 2) basePrice -= 0.005; // Early dip for Pool B
      if (i === 25 && poolId === 3) basePrice += 0.008; // Late month boost for Pool C
    } else {
      // Weekly patterns
      if (i === 4 && poolId === 1) basePrice += 0.01; // Month 1 boost for Pool A
      if (i === 8 && poolId === 2) basePrice -= 0.005; // Month 2 dip for Pool B
      if (i === 10 && poolId === 3) basePrice += 0.008; // Month 3 boost for Pool C
    }
    
    data.push({
      date: formattedDate,
      price: parseFloat(basePrice.toFixed(4))
    });
  }
  
  return data;
};

interface PoolPriceGraphProps {
  poolId: number;
  color?: string;
  symbol?: string;
}

export function PoolPriceGraph({ poolId, color = "#8B5CF6", symbol = "LP" }: PoolPriceGraphProps) {
  const isMobile = useIsMobile();
  const [timeframe, setTimeframe] = useState<"days" | "weeks">("days");
  const priceData = generatePriceData(poolId, timeframe);
  
  // Calculate min and max for yAxis domain with some padding
  const prices = priceData.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.995;
  const maxPrice = Math.max(...prices) * 1.005;
  
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

  return (
    <Card className="w-full border border-[#9b87f5]/20 overflow-hidden">
      <CardHeader className="pb-2 pt-4 bg-gradient-to-r from-[#9b87f5]/10 to-[#7E69AB]/5">
        <div className="flex flex-col items-center justify-center">
          <CardTitle className="text-xl flex items-center gap-2 mb-3 text-center">
            <LineChart className="h-5 w-5 text-[#9b87f5]" />
            {symbol} Token Price
          </CardTitle>
          
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
            <ToggleGroupItem 
              value="weeks" 
              aria-label="View by weeks" 
              className="text-xs px-3 py-1 bg-white hover:bg-gray-100 data-[state=on]:bg-[#9b87f5] data-[state=on]:text-white"
            >
              Weeks
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className={`${isMobile ? "px-1 py-2" : "pt-5"} h-[260px]`}>
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
              y={poolId === 3 ? 0.7 : 1} 
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
      </CardContent>
    </Card>
  );
}
