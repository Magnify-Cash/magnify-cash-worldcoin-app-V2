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

const generatePriceData = (poolId: number, timeframe: "days" | "weeks") => {
  let basePrice = 1.0;
  let volatility = 0.005;
  let trend = 0.002;
  
  switch (poolId) {
    case 1: 
      basePrice = 1.0;
      volatility = 0.003;
      trend = 0.003;
      break;
    case 2: 
      basePrice = 1.0;
      volatility = 0.006;
      trend = 0.004;
      break;
    case 3: 
      basePrice = 0.7;
      volatility = 0.002;
      trend = 0.002;
      break;
    default:
      break;
  }
  
  const dataPoints = timeframe === "days" ? 30 : 12;
  const today = new Date();
  
  const data = [];
  for (let i = 0; i < dataPoints; i++) {
    const currentDate = timeframe === "days" 
      ? addDays(today, i)
      : addWeeks(today, i);
    
    const formattedDate = format(currentDate, "MM/dd/yy");
    
    const noise = (Math.random() - 0.5) * volatility;
    basePrice = basePrice + trend + noise;
    
    if (timeframe === "days") {
      if (i % 7 === 0 || i % 7 === 6) {
        basePrice += 0.003;
      }
      
      if (i === 15 && poolId === 1) basePrice += 0.01;
      if (i === 10 && poolId === 2) basePrice -= 0.005;
      if (i === 25 && poolId === 3) basePrice += 0.008;
    } else {
      if (i === 4 && poolId === 1) basePrice += 0.01;
      if (i === 8 && poolId === 2) basePrice -= 0.005;
      if (i === 10 && poolId === 3) basePrice += 0.008;
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

export function PoolPriceGraph({ poolId, color = "#4f46e5", symbol = "LP" }: PoolPriceGraphProps) {
  const isMobile = useIsMobile();
  const [timeframe, setTimeframe] = useState<"days" | "weeks">("days");
  const priceData = generatePriceData(poolId, timeframe);
  
  const prices = priceData.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.995;
  const maxPrice = Math.max(...prices) * 1.005;
  
  const getPoolColor = () => {
    if (color) return color;
    
    switch (poolId) {
      case 1: return "#9b87f5";
      case 2: return "#10B981";
      case 3: return "#F59E0B";
      default: return "#9b87f5";
    }
  };
  
  const poolColor = getPoolColor();
  
  const getTickInterval = () => {
    if (timeframe === "days") {
      return isMobile ? 6 : 3;
    } else {
      return isMobile ? 2 : 1;
    }
  };

  return (
    <Card className="w-full border border-gray-200 overflow-hidden">
      <CardHeader className="pb-2 pt-4 bg-gray-50">
        <div className="flex flex-col items-center justify-center">
          <CardTitle className="text-xl flex items-center gap-2 mb-3 text-center">
            <LineChart className="h-5 w-5 text-gray-700" />
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
              className="text-xs px-3 py-1 bg-white hover:bg-gray-100 data-[state=on]:bg-indigo-600 data-[state=on]:text-white"
            >
              Days
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="weeks" 
              aria-label="View by weeks" 
              className="text-xs px-3 py-1 bg-white hover:bg-gray-100 data-[state=on]:bg-indigo-600 data-[state=on]:text-white"
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
              bottom: isMobile ? 15 : 10,
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
              tick={{ fontSize: isMobile ? 10 : 12, fill: "#333" }}
              tickMargin={isMobile ? 10 : 10}
              interval={getTickInterval()}
              padding={{ left: 10, right: 10 }}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 50 : 30}
            />
            
            <YAxis 
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: isMobile ? 11 : 12, fill: "#333" }}
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
                          ${payload[0].value} {symbol}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            
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
