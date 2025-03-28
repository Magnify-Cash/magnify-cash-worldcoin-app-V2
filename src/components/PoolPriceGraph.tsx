
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
import { BarChart, Info } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Generate historical price data based on pool ID
const generatePriceData = (poolId: number) => {
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
      basePrice = 1.0;
      volatility = 0.002;
      trend = 0.002;
      break;
    default:
      break;
  }
  
  // Generate 12 months of data
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  return months.map((month, index) => {
    // Simulate price movement with trend and random noise
    const noise = (Math.random() - 0.5) * volatility;
    basePrice = basePrice + trend + noise;
    
    // Add some seasonal patterns
    if (index === 6 && poolId === 1) basePrice += 0.01; // Summer boost for Pool A
    if (index === 3 && poolId === 2) basePrice -= 0.005; // Spring dip for Pool B
    if (index === 9 && poolId === 3) basePrice += 0.008; // Fall boost for Pool C
    
    return {
      date: month,
      price: parseFloat(basePrice.toFixed(4))
    };
  });
};

interface PoolPriceGraphProps {
  poolId: number;
  color?: string;
}

export function PoolPriceGraph({ poolId, color = "#8B5CF6" }: PoolPriceGraphProps) {
  const isMobile = useIsMobile();
  const priceData = generatePriceData(poolId);
  
  // Calculate min and max for yAxis domain with some padding
  const prices = priceData.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.995;
  const maxPrice = Math.max(...prices) * 1.005;
  
  // Get color based on poolId if not provided
  const getPoolColor = () => {
    if (color) return color;
    
    switch (poolId) {
      case 1: return "#8B5CF6"; // Purple
      case 2: return "#10B981"; // Green
      case 3: return "#F59E0B"; // Amber
      default: return "#8B5CF6"; // Default purple
    }
  };
  
  const poolColor = getPoolColor();
  
  // Get tick interval based on device
  const getTickInterval = () => {
    return isMobile ? 2 : 1; // Show every other month on mobile
  };

  return (
    <Card className="w-full border border-[#8B5CF6]/20 overflow-hidden">
      <CardHeader className="pb-2 pt-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#6E59A5]/5">
        <CardTitle className="text-xl flex items-center gap-2 justify-center">
          <BarChart className="h-5 w-5 text-[#8B5CF6]" />
          LP Token Price
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex">
                <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[250px] text-xs p-3">
              <p>Historical LP token price showing the growth of value over time.</p>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? "px-2 py-2" : "pt-5"} h-[260px]`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={priceData}
            margin={{
              top: 10,
              right: isMobile ? 5 : 20,
              left: isMobile ? 0 : 0,
              bottom: isMobile ? 5 : 0,
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
              tick={{ fontSize: isMobile ? 11 : 12 }}
              tickMargin={isMobile ? 5 : 10}
              interval={getTickInterval()}
              padding={{ left: 10, right: 10 }}
            />
            
            <YAxis 
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: isMobile ? 11 : 12 }}
              tickFormatter={(value) => {
                if (typeof value !== 'number') return value;
                return "$" + value.toFixed(3);
              }}
              width={isMobile ? 45 : 50}
              tickCount={isMobile ? 5 : 6}
              padding={{ top: 10, bottom: 10 }}
            />
            
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md rounded-md p-2 text-xs">
                      <p className="font-medium">{label} 2024</p>
                      <div className="pt-1">
                        <p style={{ color: poolColor }} className="font-semibold">
                          Price: ${payload[0].value}
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
              y={1} 
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
